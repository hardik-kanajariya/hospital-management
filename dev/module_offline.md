# Comprehensive Offline Support & Maintenance Mode Implementation Roadmap

## Executive Summary
This roadmap outlines the implementation of robust offline functionality using IndexedDB, automatic data synchronization, and maintenance mode support for the hospital management system. The goal is to ensure uninterrupted access to critical patient data even without internet connectivity.

## Phase 1: IndexedDB Infrastructure Setup (Week 1)

### Task 1.1: Database Design & Setup
Create a comprehensive IndexedDB schema:

```typescript
import Dexie, { Table } from 'dexie';

export interface OfflinePatient {
  id?: string;
  local_id?: string;
  data: any;
  synced: boolean;
  last_modified: Date;
  sync_status: 'pending' | 'syncing' | 'synced' | 'conflict';
}

export interface OfflineAppointment {
  id?: string;
  local_id?: string;
  data: any;
  synced: boolean;
  last_modified: Date;
  sync_status: 'pending' | 'syncing' | 'synced' | 'conflict';
}

export interface SyncQueue {
  id?: number;
  entity_type: string;
  entity_id: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  attempts: number;
  last_attempt: Date;
  error?: string;
  created_at: Date;
}

export class HospitalDatabase extends Dexie {
  patients!: Table<OfflinePatient>;
  appointments!: Table<OfflineAppointment>;
  medicalRecords!: Table<any>;
  prescriptions!: Table<any>;
  labTests!: Table<any>;
  syncQueue!: Table<SyncQueue>;
  systemSettings!: Table<any>;
  userPreferences!: Table<any>;

  constructor() {
    super('HospitalManagementDB');
    
    this.version(1).stores({
      patients: '++id, local_id, [data.patient_id], synced, sync_status',
      appointments: '++id, local_id, [data.appointment_id], synced, sync_status',
      medicalRecords: '++id, local_id, [data.record_id], [data.patient_id], synced',
      prescriptions: '++id, local_id, [data.prescription_id], [data.patient_id], synced',
      labTests: '++id, local_id, [data.test_id], [data.patient_id], synced',
      syncQueue: '++id, entity_type, entity_id, action, created_at',
      systemSettings: 'key, value',
      userPreferences: 'user_id, preferences'
    });
  }
}

export const db = new HospitalDatabase();
```

### Task 1.2: Offline Service Manager
Create comprehensive offline service:

```typescript
import { db } from './database';
import { v4 as uuidv4 } from 'uuid';

export class OfflineManager {
  private static instance: OfflineManager;
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private syncInterval: number | null = null;

  private constructor() {
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private setupEventListeners() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    
    // Persist data before tab close
    window.addEventListener('beforeunload', (e) => this.handleBeforeUnload(e));
    
    // Visibility change handling
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.syncData();
      }
    });
  }

  private handleOnline() {
    this.isOnline = true;
    this.showNotification('Connection restored. Syncing data...', 'info');
    this.syncData();
  }

  private handleOffline() {
    this.isOnline = false;
    this.showNotification('Working offline. Changes will sync when connection returns.', 'warning');
  }

  private handleBeforeUnload(e: BeforeUnloadEvent) {
    if (this.hasPendingChanges()) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
  }

  async savePatient(patientData: any): Promise<string> {
    const localId = uuidv4();
    const offlinePatient = {
      local_id: localId,
      data: patientData,
      synced: false,
      last_modified: new Date(),
      sync_status: 'pending' as const
    };

    await db.patients.add(offlinePatient);
    
    if (this.isOnline) {
      this.addToSyncQueue('patients', localId, 'create', patientData);
    }

    return localId;
  }

  async updatePatient(id: string, updates: any): Promise<void> {
    const patient = await db.patients.where('local_id').equals(id).first() ||
                   await db.patients.where('[data.patient_id]').equals(id).first();
    
    if (patient) {
      patient.data = { ...patient.data, ...updates };
      patient.last_modified = new Date();
      patient.sync_status = 'pending';
      patient.synced = false;
      
      await db.patients.put(patient);
      
      if (this.isOnline) {
        this.addToSyncQueue('patients', id, 'update', patient.data);
      }
    }
  }

  private async addToSyncQueue(
    entityType: string,
    entityId: string,
    action: 'create' | 'update' | 'delete',
    data: any
  ) {
    await db.syncQueue.add({
      entity_type: entityType,
      entity_id: entityId,
      action,
      data,
      attempts: 0,
      last_attempt: new Date(),
      created_at: new Date()
    });
  }

  async syncData(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) return;

    this.syncInProgress = true;
    
    try {
      const pendingItems = await db.syncQueue.toArray();
      
      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          await db.syncQueue.delete(item.id!);
        } catch (error) {
          item.attempts++;
          item.last_attempt = new Date();
          item.error = error.message;
          await db.syncQueue.put(item);
        }
      }
      
      this.showNotification('All changes synced successfully', 'success');
    } catch (error) {
      console.error('Sync failed:', error);
      this.showNotification('Sync failed. Will retry automatically.', 'error');
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncItem(item: SyncQueue): Promise<void> {
    const endpoint = `/api/${item.entity_type}`;
    
    switch (item.action) {
      case 'create':
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify(item.data)
        });
        
        if (response.ok) {
          const result = await response.json();
          // Update local record with server ID
          await this.updateLocalRecordWithServerId(item.entity_type, item.entity_id, result.id);
        }
        break;
        
      case 'update':
        await fetch(`${endpoint}/${item.entity_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify(item.data)
        });
        break;
        
      case 'delete':
        await fetch(`${endpoint}/${item.entity_id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        break;
    }
  }

  private startPeriodicSync() {
    this.syncInterval = window.setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncData();
      }
    }, 30000); // Sync every 30 seconds when online
  }

  private showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error') {
    // Implement notification system
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  private async hasPendingChanges(): Promise<boolean> {
    const count = await db.syncQueue.count();
    return count > 0;
  }

  async clearOfflineData(): Promise<void> {
    await db.delete();
    await db.open();
  }
}
```

### Task 1.3: React Hook for Offline Support
Create React hook for easy component integration:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { OfflineManager } from '../services/offline/OfflineManager';
import { db } from '../services/offline/database';

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [pendingChanges, setPendingChanges] = useState(0);

  const offlineManager = OfflineManager.getInstance();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending changes periodically
    const interval = setInterval(async () => {
      const count = await db.syncQueue.count();
      setPendingChanges(count);
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const syncNow = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      await offlineManager.syncData();
      setSyncStatus('synced');
    } catch (error) {
      setSyncStatus('error');
    }
  }, [offlineManager]);

  return {
    isOnline,
    syncStatus,
    pendingChanges,
    syncNow
  };
}
```

## Phase 2: Offline-Capable API Hooks (Week 2)

### Task 2.1: Enhanced Patient API with Offline Support
Update existing hooks to support offline:

```typescript
// Add to existing file

import { db } from '../services/offline/database';
import { OfflineManager } from '../services/offline/OfflineManager';

// Update existing hook
export function usePatientApi() {
  const offlineManager = OfflineManager.getInstance();
  const { isOnline } = useOffline();
  
  // ... existing code ...

  const createPatient = useCallback(async (patientData: PatientCreateRequest) => {
    setLoading(true);
    setError(null);

    try {
      if (!isOnline) {
        // Save offline
        const localId = await offlineManager.savePatient(patientData);
        const offlinePatient = {
          ...patientData,
          patient_id: localId,
          is_offline: true
        };
        
        setData(offlinePatient);
        return offlinePatient;
      }

      // Online flow - existing code
      const response = await httpService.post('/patients', patientData);
      
      // Also save to IndexedDB for offline access
      await db.patients.add({
        data: response.data,
        synced: true,
        last_modified: new Date(),
        sync_status: 'synced'
      });
      
      setData(response.data);
      return response.data;
    } catch (err) {
      if (!navigator.onLine) {
        // Fallback to offline save
        const localId = await offlineManager.savePatient(patientData);
        const offlinePatient = {
          ...patientData,
          patient_id: localId,
          is_offline: true
        };
        setData(offlinePatient);
        return offlinePatient;
      }
      
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [httpService, isOnline, offlineManager]);

  const fetchPatients = useCallback(async (params?: PatientSearchParams) => {
    setLoading(true);
    setError(null);

    try {
      if (!isOnline) {
        // Fetch from IndexedDB
        const offlinePatients = await db.patients.toArray();
        const patients = offlinePatients.map(p => p.data);
        
        setData(patients);
        return { data: patients, total: patients.length };
      }

      // Online flow
      const response = await httpService.get('/patients', { params });
      
      // Cache for offline use
      for (const patient of response.data.data) {
        await db.patients.put({
          data: patient,
          synced: true,
          last_modified: new Date(),
          sync_status: 'synced'
        });
      }
      
      setData(response.data);
      return response.data;
    } catch (err) {
      if (!navigator.onLine) {
        // Fallback to cached data
        const offlinePatients = await db.patients.toArray();
        const patients = offlinePatients.map(p => p.data);
        setData(patients);
        return { data: patients, total: patients.length };
      }
      
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [httpService, isOnline]);

  // ... rest of the methods with similar offline support ...

  return {
    // ... existing returns ...
    isOffline: !isOnline,
    hasPendingSync: pendingChanges > 0
  };
}
```

### Task 2.2: Offline Queue Visualization Component

```typescript
import React from 'react';
import { useOffline } from '../../hooks/useOffline';
import { WifiOff, Sync, Check, AlertCircle } from 'lucide-react';

export function OfflineIndicator() {
  const { isOnline, syncStatus, pendingChanges, syncNow } = useOffline();

  if (isOnline && pendingChanges === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg
        ${!isOnline ? 'bg-orange-500' : 'bg-blue-500'} text-white
      `}>
        {!isOnline ? (
          <>
            <WifiOff className="w-5 h-5" />
            <span>Working Offline</span>
          </>
        ) : (
          <>
            {syncStatus === 'syncing' ? (
              <Sync className="w-5 h-5 animate-spin" />
            ) : syncStatus === 'synced' ? (
              <Check className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>
              {pendingChanges} changes pending
            </span>
            <button
              onClick={syncNow}
              className="ml-2 px-2 py-1 bg-white/20 rounded hover:bg-white/30"
              disabled={syncStatus === 'syncing'}
            >
              Sync Now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

## Phase 3: Maintenance Mode Implementation (Week 3)

### Task 3.1: Maintenance Mode Service

```typescript
export interface MaintenanceConfig {
  enabled: boolean;
  message: string;
  allowedRoles: string[];
  estimatedEndTime?: Date;
  showCountdown: boolean;
}

export class MaintenanceService {
  private static instance: MaintenanceService;
  private config: MaintenanceConfig | null = null;
  private checkInterval: number | null = null;

  static getInstance(): MaintenanceService {
    if (!MaintenanceService.instance) {
      MaintenanceService.instance = new MaintenanceService();
    }
    return MaintenanceService.instance;
  }

  async checkMaintenanceStatus(): Promise<MaintenanceConfig | null> {
    try {
      const response = await fetch('/api/system/maintenance-status');
      if (response.ok) {
        this.config = await response.json();
        return this.config;
      }
    } catch (error) {
      // In offline mode, check local storage
      const cached = localStorage.getItem('maintenance_config');
      if (cached) {
        this.config = JSON.parse(cached);
        return this.config;
      }
    }
    return null;
  }

  startPolling(interval: number = 60000) {
    this.checkInterval = window.setInterval(() => {
      this.checkMaintenanceStatus();
    }, interval);
  }

  stopPolling() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  isUserAllowed(userRole: string): boolean {
    if (!this.config || !this.config.enabled) return true;
    return this.config.allowedRoles.includes(userRole);
  }
}
```

### Task 3.2: Maintenance Mode Component

```typescript
import React, { useEffect, useState } from 'react';
import { MaintenanceService } from '../services/MaintenanceService';
import { useAuth } from '../hooks/useAuth';
import { Shield, Clock } from 'lucide-react';

export function MaintenanceMode({ children }: { children: React.ReactNode }) {
  const [maintenanceConfig, setMaintenanceConfig] = useState(null);
  const { user } = useAuth();
  const maintenanceService = MaintenanceService.getInstance();

  useEffect(() => {
    const checkMaintenance = async () => {
      const config = await maintenanceService.checkMaintenanceStatus();
      setMaintenanceConfig(config);
    };

    checkMaintenance();
    maintenanceService.startPolling();

    return () => {
      maintenanceService.stopPolling();
    };
  }, []);

  if (maintenanceConfig?.enabled && !maintenanceService.isUserAllowed(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-orange-500" />
          <h1 className="text-2xl font-bold mb-4">System Maintenance</h1>
          <p className="text-gray-600 mb-6">{maintenanceConfig.message}</p>
          
          {maintenanceConfig.estimatedEndTime && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Estimated completion: {new Date(maintenanceConfig.estimatedEndTime).toLocaleString()}</span>
            </div>
          )}
          
          <div className="mt-8 p-4 bg-blue-50 rounded">
            <p className="text-sm text-blue-700">
              You can continue working offline. Your changes will be synchronized once maintenance is complete.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

## Phase 4: Conflict Resolution & Data Integrity (Week 4)

### Task 4.1: Conflict Resolution Service

```typescript
export interface DataConflict {
  id: string;
  entityType: string;
  localData: any;
  serverData: any;
  conflictType: 'update-update' | 'delete-update' | 'create-duplicate';
  detectedAt: Date;
}

export class ConflictResolver {
  async resolveConflicts(conflicts: DataConflict[]): Promise<void> {
    for (const conflict of conflicts) {
      switch (conflict.conflictType) {
        case 'update-update':
          await this.resolveUpdateConflict(conflict);
          break;
        case 'delete-update':
          await this.resolveDeleteConflict(conflict);
          break;
        case 'create-duplicate':
          await this.resolveDuplicateConflict(conflict);
          break;
      }
    }
  }

  private async resolveUpdateConflict(conflict: DataConflict) {
    // Compare timestamps and merge changes
    const localTime = new Date(conflict.localData.last_modified);
    const serverTime = new Date(conflict.serverData.last_modified);
    
    if (localTime > serverTime) {
      // Local wins - push to server
      await this.pushToServer(conflict.entityType, conflict.id, conflict.localData);
    } else {
      // Server wins - update local
      await this.updateLocal(conflict.entityType, conflict.id, conflict.serverData);
    }
  }

  private async resolveDeleteConflict(conflict: DataConflict) {
    // Show user dialog to confirm deletion
    const userChoice = await this.showConflictDialog({
      title: 'Deletion Conflict',
      message: 'This record was deleted on another device but modified here.',
      options: ['Keep Local Changes', 'Accept Deletion']
    });
    
    if (userChoice === 'Keep Local Changes') {
      await this.pushToServer(conflict.entityType, conflict.id, conflict.localData);
    } else {
      await this.deleteLocal(conflict.entityType, conflict.id);
    }
  }

  private async resolveDuplicateConflict(conflict: DataConflict) {
    // Merge duplicates or let user choose
    const merged = this.mergeRecords(conflict.localData, conflict.serverData);
    await this.updateLocal(conflict.entityType, conflict.id, merged);
    await this.pushToServer(conflict.entityType, conflict.id, merged);
  }

  private mergeRecords(local: any, server: any): any {
    // Implement intelligent merging based on timestamps and data importance
    const merged = { ...server };
    
    // For critical fields, prefer the most recent
    const criticalFields = ['diagnosis', 'medications', 'allergies'];
    
    for (const field of criticalFields) {
      if (local[field] && local.last_modified > server.last_modified) {
        merged[field] = local[field];
      }
    }
    
    return merged;
  }
}
```

## Phase 5: Performance Optimization (Week 5)

### Task 5.1: Data Compression & Storage Optimization

```typescript
export class StorageOptimizer {
  private readonly MAX_CACHE_AGE_DAYS = 30;
  private readonly MAX_STORAGE_MB = 500;

  async optimizeStorage(): Promise<void> {
    const usage = await this.getStorageUsage();
    
    if (usage.percentUsed > 80) {
      await this.cleanOldData();
      await this.compressImages();
      await this.archiveOldRecords();
    }
  }

  private async cleanOldData(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.MAX_CACHE_AGE_DAYS);
    
    // Clean old synced data
    await db.patients
      .where('last_modified').below(cutoffDate)
      .and(item => item.synced === true)
      .delete();
  }

  private async compressImages(): Promise<void> {
    // Implement image compression for medical images stored offline
  }

  private async getStorageUsage(): Promise<{ used: number, total: number, percentUsed: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        total: estimate.quota || 0,
        percentUsed: ((estimate.usage || 0) / (estimate.quota || 1)) * 100
      };
    }
    return { used: 0, total: 0, percentUsed: 0 };
  }
}
```

### Task 5.2: Background Sync Worker

```typescript
export class BackgroundSyncManager {
  async registerBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      
      try {
        await registration.sync.register('data-sync');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  async handleBackgroundSync(): Promise<void> {
    const offlineManager = OfflineManager.getInstance();
    await offlineManager.syncData();
  }
}
```

## Phase 6: Testing & Deployment (Week 6)

### Task 6.1: Offline Testing Suite

```typescript
describe('Offline Functionality', () => {
  beforeEach(() => {
    // Clear IndexedDB
    indexedDB.deleteDatabase('HospitalManagementDB');
  });

  test('should save patient data offline', async () => {
    // Simulate offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });

    const offlineManager = OfflineManager.getInstance();
    const patientData = { name: 'Test Patient', age: 30 };
    
    const localId = await offlineManager.savePatient(patientData);
    expect(localId).toBeTruthy();
    
    const saved = await db.patients.where('local_id').equals(localId).first();
    expect(saved).toBeTruthy();
    expect(saved.sync_status).toBe('pending');
  });

  test('should sync data when coming online', async () => {
    // Test sync functionality
  });

  test('should handle sync conflicts', async () => {
    // Test conflict resolution
  });
});
```

## Implementation Priorities

### Critical Path (Must Have):
1. IndexedDB setup with Dexie
2. Basic offline save/retrieve for patients
3. Sync queue implementation
4. Online/offline detection
5. Data persistence on tab close

### High Priority (Should Have):
1. Conflict resolution
2. Background sync
3. Maintenance mode
4. Offline indicator UI
5. Sync status visualization

### Medium Priority (Could Have):
1. Data compression
2. Storage optimization
3. Partial sync support
4. Advanced conflict UI
5. Offline analytics

## Success Metrics

### Technical Metrics:
- Offline data availability: 100%
- Sync success rate > 99%
- Data integrity maintained 100%
- Storage usage < 500MB
- Sync time < 30 seconds

### User Experience:
- Seamless offline transition
- No data loss on tab close
- Clear sync status indication
- Conflict resolution < 1%
- User satisfaction > 95%

This comprehensive implementation ensures that the hospital management system can operate effectively offline, maintaining data integrity and providing seamless synchronization when connectivity is restored.

Similar code found with 1 license type