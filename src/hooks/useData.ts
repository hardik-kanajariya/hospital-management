// Custom hook for database operations with offline support
import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/database';
import { apiService } from '@/lib/api';

interface UseDataOptions {
  autoSync?: boolean;
  cacheFirst?: boolean;
  syncInterval?: number;
}

interface DataState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  syncing: boolean;
  isOnline: boolean;
  lastSyncTime: Date | null;
}

interface DataOperations<T> {
  create: (item: Omit<T, 'id' | 'created_at' | 'updated_at'>) => Promise<T>;
  update: (id: string, updates: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  sync: () => Promise<void>;
  getById: (id: string) => Promise<T | undefined>;
  search: (query: string, fields: (keyof T)[]) => T[];
}

export function useData<T extends { id: string; synced?: boolean; local_changes?: boolean }>(
  storeName: string,
  endpoint: string,
  options: UseDataOptions = {}
): [DataState<T>, DataOperations<T>] {
  const {
    autoSync = true,
    cacheFirst = true,
    syncInterval = 60000 // 1 minute
  } = options;

  const [state, setState] = useState<DataState<T>>({
    data: [],
    loading: true,
    error: null,
    syncing: false,
    isOnline: navigator.onLine,
    lastSyncTime: null
  });

  // Initialize database and load data
  useEffect(() => {
    const initialize = async () => {
      try {
        await db.initialize();
        await loadData();
        
        if (autoSync && navigator.onLine) {
          await syncData();
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to initialize',
          loading: false
        }));
      }
    };

    initialize();
  }, [storeName, autoSync]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      if (autoSync) {
        syncData();
      }
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [autoSync]);

  // Auto-sync interval
  useEffect(() => {
    if (!autoSync || !navigator.onLine) return;

    const interval = setInterval(() => {
      syncData();
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, syncInterval]);

  // Load data from IndexedDB
  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const localData = await db.getAll(storeName);
      
      setState(prev => ({
        ...prev,
        data: localData as T[],
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load data',
        loading: false
      }));
    }
  }, [storeName]);

  // Sync data with server
  const syncData = useCallback(async () => {
    if (!navigator.onLine) return;

    try {
      setState(prev => ({ ...prev, syncing: true, error: null }));

      // First, sync local changes to server
      if (db.forceSyncAll) {
        await db.forceSyncAll();
      }

      // Then fetch latest data from server if not cache-first or data is empty
      if (!cacheFirst || state.data.length === 0) {
        try {
          const serverResponse = await apiService.getAll(endpoint);
          
          if (serverResponse.data) {
            // Update local database with server data
            for (const item of serverResponse.data) {
              const existingItem = await db.get(storeName, item.id);
              
              if (!existingItem) {
                // New item from server
                await db.create(storeName, {
                  ...item,
                  synced: true,
                  local_changes: false
                });
              } else if (!existingItem.local_changes) {
                // Update if no local changes
                await db.update(storeName, item.id, {
                  ...item,
                  synced: true,
                  local_changes: false
                });
              }
            }
            
            // Reload data from IndexedDB
            await loadData();
          }
        } catch (apiError) {
          console.warn('API sync failed, using local data:', apiError);
        }
      }

      setState(prev => ({
        ...prev,
        syncing: false,
        lastSyncTime: new Date()
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        syncing: false,
        error: error instanceof Error ? error.message : 'Sync failed'
      }));
    }
  }, [storeName, endpoint, cacheFirst, state.data.length, loadData]);

  // Create new item
  const create = useCallback(async (itemData: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> => {
    try {
      const newItem = await db.create(storeName, itemData);
      
      // Update local state
      setState(prev => ({
        ...prev,
        data: [...prev.data, newItem as T]
      }));

      // Try to sync immediately if online
      if (navigator.onLine) {
        try {
          const serverItem = await apiService.create(endpoint, newItem);
          // Update with server response
          await db.update(storeName, newItem.id, {
            ...serverItem,
            synced: true,
            local_changes: false
          });
          
          // Update local state with server data
          setState(prev => ({
            ...prev,
            data: prev.data.map(item => 
              item.id === newItem.id ? { ...serverItem, synced: true, local_changes: false } as T : item
            )
          }));
        } catch (apiError) {
          console.warn('Failed to sync new item to server:', apiError);
        }
      }

      return newItem as T;
    } catch (error) {
      throw new Error(`Failed to create item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [storeName, endpoint]);

  // Update existing item
  const update = useCallback(async (id: string, updates: Partial<T>): Promise<T> => {
    try {
      const updatedItem = await db.update(storeName, id, updates);
      
      // Update local state
      setState(prev => ({
        ...prev,
        data: prev.data.map(item => 
          item.id === id ? updatedItem as T : item
        )
      }));

      // Try to sync immediately if online
      if (navigator.onLine) {
        try {
          const serverItem = await apiService.update(endpoint, id, updatedItem);
          // Update with server response
          await db.update(storeName, id, {
            ...serverItem,
            synced: true,
            local_changes: false
          });
          
          // Update local state with server data
          setState(prev => ({
            ...prev,
            data: prev.data.map(item => 
              item.id === id ? { ...serverItem, synced: true, local_changes: false } as T : item
            )
          }));
        } catch (apiError) {
          console.warn('Failed to sync updated item to server:', apiError);
        }
      }

      return updatedItem as T;
    } catch (error) {
      throw new Error(`Failed to update item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [storeName, endpoint]);

  // Delete item
  const remove = useCallback(async (id: string): Promise<void> => {
    try {
      await db.delete(storeName, id);
      
      // Update local state
      setState(prev => ({
        ...prev,
        data: prev.data.filter(item => item.id !== id)
      }));

      // Try to sync immediately if online
      if (navigator.onLine) {
        try {
          await apiService.delete(endpoint, id);
        } catch (apiError) {
          console.warn('Failed to sync deletion to server:', apiError);
        }
      }
    } catch (error) {
      throw new Error(`Failed to delete item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [storeName, endpoint]);

  // Get item by ID
  const getById = useCallback(async (id: string): Promise<T | undefined> => {
    try {
      const item = await db.get(storeName, id);
      return item as T | undefined;
    } catch (error) {
      console.error('Failed to get item by ID:', error);
      return undefined;
    }
  }, [storeName]);

  // Search items
  const search = useCallback((query: string, fields: (keyof T)[]): T[] => {
    if (!query.trim()) return state.data;

    const searchTerm = query.toLowerCase();
    return state.data.filter(item =>
      fields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm);
        }
        if (typeof value === 'number') {
          return value.toString().includes(searchTerm);
        }
        return false;
      })
    );
  }, [state.data]);

  // Refresh data
  const refresh = useCallback(async () => {
    await loadData();
    if (navigator.onLine && autoSync) {
      await syncData();
    }
  }, [loadData, syncData, autoSync]);

  const operations: DataOperations<T> = {
    create,
    update,
    remove,
    refresh,
    sync: syncData,
    getById,
    search
  };

  return [state, operations];
}

// Specialized hooks for different data types
export function usePatients(options?: UseDataOptions) {
  return useData('patients', '/patients', options);
}

export function useAppointments(options?: UseDataOptions) {
  return useData('appointments', '/appointments', options);
}

export function useMedicalRecords(options?: UseDataOptions) {
  return useData('medical_records', '/medical-records', options);
}

export function useBilling(options?: UseDataOptions) {
  return useData('billing', '/billing', options);
}

export function useInventory(options?: UseDataOptions) {
  return useData('inventory', '/inventory', options);
}

export function useLabTests(options?: UseDataOptions) {
  return useData('lab_tests', '/lab-tests', options);
}

export function useBeds(options?: UseDataOptions) {
  return useData('beds', '/beds', options);
}

export function useDoctors(options?: UseDataOptions) {
  return useData('doctors', '/doctors', options);
}

// Sync status hook
export function useSyncStatus() {
  const [status, setStatus] = useState({
    isOnline: navigator.onLine,
    pendingSync: 0,
    lastSync: null as Date | null,
    syncInProgress: false
  });

  useEffect(() => {
    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkPendingSync = useCallback(async () => {
    try {
      const pendingOperations = await db.query('sync_queue', 'status', 'pending');
      const pending = pendingOperations.length;
      
      setStatus(prev => ({ ...prev, pendingSync: pending }));
    } catch (error) {
      console.error('Failed to check pending sync:', error);
    }
  }, []);

  useEffect(() => {
    checkPendingSync();
    const interval = setInterval(checkPendingSync, 5000);
    return () => clearInterval(interval);
  }, [checkPendingSync]);

  return status;
}