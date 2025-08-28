import { useState, useEffect } from 'react';

/**
 * Custom hook to manage state with localStorage persistence
 * Replaces the GitHub Spark useKV hook
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
    // Get value from localStorage
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Set value in localStorage
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    // Remove value from localStorage
    const removeValue = () => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue, removeValue] as const;
}

// Compatibility function to match the useKV API from Spark
export function useKV<T>(key: string, initialValue: T) {
    const [value, setValue, removeValue] = useLocalStorage(key, initialValue);

    // Return the value directly in an array format to match Spark's useKV API
    return [value, setValue, removeValue] as const;
}
