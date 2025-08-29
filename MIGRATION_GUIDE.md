# Hospital Management System - Enhanced Architecture Migration

This document outlines the migration from the old messy architecture to the new robust, maintainable system.

## 🚀 New Architecture Overview

### Core Components

1. **Centralized State Management** (`src/lib/store.ts`)
   - Zustand-based store with persistence
   - Organized state for auth, navigation, notifications, connection, and UI
   - Type-safe selectors and actions

2. **Robust API Client** (`src/lib/api-client.ts`)
   - Comprehensive error handling and retry logic
   - Offline action queuing and sync
   - Type-safe CRUD operations
   - Health monitoring and connection management

3. **Enhanced Notification Service** (`src/lib/notification-service.ts`)
   - Template-based notifications
   - Multi-channel delivery (SMS, Email, In-app, Push)
   - Notification history and tracking
   - Smart scheduling and retry logic

4. **Improved Storage System** (`src/lib/storage.ts`)
   - Type-safe localStorage with validation
   - TTL-based caching
   - Form persistence utilities
   - Storage usage monitoring

5. **Connection Management** (`src/hooks/useConnectionStatus.ts`)
   - Real-time connectivity monitoring
   - Automatic offline/online handling
   - Sync queue management
   - Health check intervals

## 📁 Files Replaced

### Removed Files (Moved to `.old` extension)
- `src/hooks/useDatabase.ts` → Now deprecated, use `useApiHooks.ts`
- `src/hooks/useNotifications.ts` → Replaced with `src/lib/notification-service.ts`
- `src/hooks/useNavigation.ts` → Integrated into `src/lib/store.ts`
- `src/hooks/useAuth.ts` → Integrated into `src/lib/store.ts`
- `src/hooks/useLocalStorage.ts` → Enhanced as `src/lib/storage.ts`
- `src/lib/connection.ts` → Integrated into connection status
- `src/lib/database.ts` → Replaced with `src/lib/api-client.ts`

### New Files Added
- `src/lib/store.ts` - Centralized state management
- `src/lib/api-client.ts` - Robust API client
- `src/lib/notification-service.ts` - Enhanced notifications
- `src/lib/storage.ts` - Improved localStorage utilities
- `src/lib/index.ts` - Central exports and initialization

## 🔄 Migration Guide

### 1. Authentication
```typescript
// OLD WAY
import { useAuth } from '@/hooks/useAuth';

// NEW WAY (Same API, enhanced functionality)
import { useAuth } from '@/lib/store';
// OR
import { useAuth } from '@/lib';
```

### 2. Navigation
```typescript
// OLD WAY
import { useNavigation } from '@/hooks/useNavigation';

// NEW WAY
import { useNavigation } from '@/lib/store';
```

### 3. Notifications
```typescript
// OLD WAY
import { useNotifications } from '@/hooks/useNotifications';

// NEW WAY - Enhanced with templates and multi-channel delivery
import { useNotifications, notificationService } from '@/lib/notification-service';

// Send appointment reminder
await notificationService.sendAppointmentReminder(
  patientPhone,
  patientEmail,
  {
    patientName: 'John Doe',
    doctorName: 'Dr. Smith',
    date: '2024-01-15',
    time: '10:00 AM'
  }
);
```

### 4. Local Storage
```typescript
// OLD WAY
import { useLocalStorage, useKV } from '@/hooks/useLocalStorage';

// NEW WAY - Enhanced with validation and specialized hooks
import { useLocalStorage, useUserPreferences, useCachedData } from '@/lib/storage';

// User preferences
const { preferences, updatePreference } = useUserPreferences();

// Cached data with TTL
const { data, setData, isExpired } = useCachedData('patients', [], 5);
```

### 5. Database/API Operations
```typescript
// OLD WAY
import { db } from '@/lib/database';

// NEW WAY - Enhanced with better error handling
import { apiClient } from '@/lib/api-client';
// OR for backward compatibility
import { db } from '@/lib'; // Points to apiClient

// Enhanced CRUD operations
const patients = await apiClient.getAll('/patients', { page: 1, limit: 10 });
const patient = await apiClient.create('/patients', patientData);
```

### 6. Connection Status
```typescript
// OLD WAY
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

// NEW WAY - Enhanced with sync management
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

const { connectionState, forceSync, syncOfflineActions } = useConnectionStatus();
```

## ✨ Key Improvements

### 1. **Type Safety**
- Full TypeScript support with proper type inference
- Validated localStorage operations
- Type-safe API operations

### 2. **Error Handling**
- Comprehensive error boundaries
- Graceful fallbacks for offline scenarios
- Retry logic with exponential backoff

### 3. **Performance**
- Optimized re-renders with proper selectors
- Memoized operations
- Efficient state updates

### 4. **Offline Support**
- Automatic offline detection
- Action queuing when offline
- Smart sync when connection restored

### 5. **Developer Experience**
- Better debugging with detailed logging
- Clear separation of concerns
- Consistent API patterns

## 🛠 Usage Examples

### Initialize the Application
```typescript
import { initializeApp } from '@/lib';

// In your main App component
useEffect(() => {
  initializeApp();
}, []);
```

### Authentication with Enhanced Error Handling
```typescript
import { useAuth } from '@/lib';

const { login, logout, user, isLoading, error } = useAuth();

const handleLogin = async (email: string, password: string) => {
  try {
    await login(email, password);
    // Automatic navigation and state updates
  } catch (error) {
    // Error handling with user-friendly messages
    console.error('Login failed:', error.message);
  }
};
```

### Smart Notifications
```typescript
import { notificationService } from '@/lib';

// Send multi-channel notification
await notificationService.sendNotification({
  template: 'appointment_reminder',
  recipient: {
    id: patient.id,
    name: patient.name,
    email: patient.email,
    phone: patient.phone,
    type: 'patient'
  },
  variables: {
    doctorName: 'Dr. Smith',
    date: '2024-01-15',
    time: '10:00 AM'
  },
  deliveryMethods: ['sms', 'email', 'in-app']
});
```

### Offline-First Data Operations
```typescript
import { apiClient } from '@/lib';

// Automatic offline handling
try {
  const result = await apiClient.create('/patients', patientData);
  // Success - data saved to server
} catch (error) {
  // Automatically queued for sync when online
  console.log('Saved offline, will sync when connection restored');
}
```

## 🔧 Configuration

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### Store Configuration
The store automatically persists:
- User authentication state
- UI preferences (theme, sidebar state)
- Offline actions queue

### API Client Configuration
```typescript
import { RobustApiClient } from '@/lib';

const customClient = RobustApiClient.getInstance({
  baseUrl: 'https://custom-api.com',
  timeout: 60000,
  retries: 5,
  retryDelay: 2000
});
```

## 📊 Monitoring and Debugging

### Storage Usage
```typescript
import { storageUtils } from '@/lib';

const storageInfo = storageUtils.getStorageInfo();
console.log(`Storage usage: ${storageInfo.usagePercent}%`);
```

### Connection Monitoring
```typescript
import { useConnectionStatus } from '@/lib';

const { connectionState } = useConnectionStatus();
console.log(`Connection: ${connectionState.connectionState}`);
console.log(`Offline actions: ${connectionState.offlineActionsCount}`);
```

## 🎯 Best Practices

1. **Use Selectors**: Import specific selectors instead of the entire store
2. **Handle Errors**: Always wrap API calls in try-catch blocks
3. **Offline First**: Design features to work offline when possible
4. **Type Safety**: Use TypeScript types for all data structures
5. **Performance**: Use React.memo and useMemo for expensive operations

## 🚨 Breaking Changes

1. **Hook Imports**: Update import paths for hooks
2. **Database API**: `db.getAll()` now returns paginated results by default
3. **Notifications**: API changed to support templates and multi-channel delivery
4. **Storage**: Validation is now built-in, may throw errors for invalid data

## 🔄 Backward Compatibility

Most APIs maintain backward compatibility through wrapper functions and re-exports. However, it's recommended to migrate to the new APIs for better functionality and type safety.

## 📝 TODO for Full Migration

1. Update all component imports to use new hooks
2. Replace old error handling patterns with new error boundaries
3. Migrate to new notification templates
4. Update tests to use new API patterns
5. Remove old files after thorough testing

---

**Note**: The old files are preserved with `.old` extension for reference during migration. Remove them after successful migration and testing.
