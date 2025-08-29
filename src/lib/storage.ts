/**
 * Enhanced Local Storage Hook
 * Type-safe localStorage with validation and error handling
 */

import { useState, useEffect, useCallback } from 'react';

// Storage configuration
interface StorageConfig<T> {
    defaultValue: T;
    validate?: (value: any) => value is T;
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
}

/**
 * Enhanced hook for localStorage with validation and error handling
 */
export function useLocalStorage<T>(
    key: string,
    defaultValue: T,
    config?: Partial<StorageConfig<T>>
): [T, (value: T | ((val: T) => T)) => void, () => void] {
    const storageConfig: StorageConfig<T> = {
        defaultValue,
        validate: config?.validate,
        serialize: config?.serialize || JSON.stringify,
        deserialize: config?.deserialize || JSON.parse,
    };

    // Get value from localStorage safely
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return storageConfig.defaultValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            if (item === null) {
                return storageConfig.defaultValue;
            }

            const parsedValue = storageConfig.deserialize!(item);

            // Validate if validator is provided
            if (storageConfig.validate && !storageConfig.validate(parsedValue)) {
                console.warn(`Invalid value in localStorage for key "${key}", using default`);
                return storageConfig.defaultValue;
            }

            return parsedValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return storageConfig.defaultValue;
        }
    });

    // Set value in localStorage
    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have the same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            // Validate if validator is provided
            if (storageConfig.validate && !storageConfig.validate(valueToStore)) {
                throw new Error(`Value validation failed for key "${key}"`);
            }

            setStoredValue(valueToStore);

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, storageConfig.serialize!(valueToStore));
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue, storageConfig]);

    // Remove value from localStorage
    const removeValue = useCallback(() => {
        try {
            setStoredValue(storageConfig.defaultValue);
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key);
            }
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, storageConfig.defaultValue]);

    // Listen for changes to this key in other tabs
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue !== null) {
                try {
                    const newValue = storageConfig.deserialize!(e.newValue);
                    if (!storageConfig.validate || storageConfig.validate(newValue)) {
                        setStoredValue(newValue);
                    }
                } catch (error) {
                    console.error(`Error handling storage change for key "${key}":`, error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key, storageConfig]);

    return [storedValue, setValue, removeValue];
}

/**
 * Specialized hook for storing user preferences
 */
export function useUserPreferences() {
    const [preferences, setPreferences, clearPreferences] = useLocalStorage('user-preferences', {
        theme: 'system' as 'light' | 'dark' | 'system',
        language: 'en',
        notifications: true,
        autoSync: true,
        compactView: false,
    });

    const updatePreference = useCallback(<K extends keyof typeof preferences>(
        key: K,
        value: typeof preferences[K]
    ) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value,
        }));
    }, [setPreferences]);

    return {
        preferences,
        updatePreference,
        clearPreferences,
    };
}

/**
 * Hook for caching API responses with TTL
 */
export function useCachedData<T>(
    key: string,
    defaultValue: T,
    ttlMinutes: number = 5
) {
    interface CachedItem<T> {
        data: T;
        timestamp: number;
        ttl: number;
    }

    const isValidCachedItem = (value: any): value is CachedItem<T> => {
        return (
            value &&
            typeof value === 'object' &&
            'data' in value &&
            'timestamp' in value &&
            'ttl' in value &&
            typeof value.timestamp === 'number' &&
            typeof value.ttl === 'number'
        );
    };

    const [cachedData, setCachedData, clearCache] = useLocalStorage<CachedItem<T> | null>(
        `cache-${key}`,
        null,
        {
            validate: (value): value is CachedItem<T> | null =>
                value === null || isValidCachedItem(value),
        }
    );

    // Check if cached data is still valid
    const isValid = cachedData &&
        (Date.now() - cachedData.timestamp) < (cachedData.ttl * 60 * 1000);

    const data = isValid ? cachedData.data : defaultValue;

    const setData = useCallback((newData: T) => {
        setCachedData({
            data: newData,
            timestamp: Date.now(),
            ttl: ttlMinutes,
        });
    }, [setCachedData, ttlMinutes]);

    const isExpired = cachedData && !isValid;

    return {
        data,
        setData,
        clearCache,
        isExpired,
        isValid: !!isValid,
    };
}

/**
 * Hook for form data persistence
 */
export function useFormPersistence<T extends Record<string, any>>(
    formId: string,
    initialData: T
) {
    const [formData, setFormData, clearFormData] = useLocalStorage(
        `form-${formId}`,
        initialData
    );

    const updateField = useCallback(<K extends keyof T>(
        field: K,
        value: T[K]
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    }, [setFormData]);

    const resetForm = useCallback(() => {
        setFormData(initialData);
    }, [setFormData, initialData]);

    return {
        formData,
        updateField,
        resetForm,
        clearFormData,
    };
}

/**
 * Hook for recent searches/history
 */
export function useRecentItems<T>(
    key: string,
    maxItems: number = 10
) {
    const [items, setItems] = useLocalStorage<T[]>(`recent-${key}`, []);

    const addItem = useCallback((item: T) => {
        setItems(prev => {
            // Remove item if it already exists
            const filtered = prev.filter(existingItem =>
                JSON.stringify(existingItem) !== JSON.stringify(item)
            );

            // Add to front and limit length
            return [item, ...filtered].slice(0, maxItems);
        });
    }, [setItems, maxItems]);

    const removeItem = useCallback((item: T) => {
        setItems(prev => prev.filter(existingItem =>
            JSON.stringify(existingItem) !== JSON.stringify(item)
        ));
    }, [setItems]);

    const clearItems = useCallback(() => {
        setItems([]);
    }, [setItems]);

    return {
        items,
        addItem,
        removeItem,
        clearItems,
    };
}

// Legacy compatibility export
export function useKV<T>(key: string, initialValue: T) {
    return useLocalStorage(key, initialValue);
}

// Storage utilities
export const storageUtils = {
    // Clear all app data
    clearAll: () => {
        if (typeof window !== 'undefined') {
            const keys = Object.keys(window.localStorage);
            keys.forEach(key => {
                if (key.startsWith('hospital-') || key.startsWith('user-') || key.startsWith('form-')) {
                    window.localStorage.removeItem(key);
                }
            });
        }
    },

    // Get storage usage info
    getStorageInfo: () => {
        if (typeof window === 'undefined') return null;

        const totalSize = new Blob(Object.values(window.localStorage)).size;
        const itemCount = Object.keys(window.localStorage).length;

        return {
            totalSize,
            itemCount,
            maxSize: 5 * 1024 * 1024, // Typical 5MB limit
            usagePercent: (totalSize / (5 * 1024 * 1024)) * 100,
        };
    },

    // Check if storage is available
    isAvailable: () => {
        try {
            const test = '__storage_test__';
            window.localStorage.setItem(test, test);
            window.localStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    },
};
