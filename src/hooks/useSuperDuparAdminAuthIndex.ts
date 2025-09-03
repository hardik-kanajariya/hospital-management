// Export the hook for consuming the auth context
export { useSuperDuparAdminAuth } from './useSuperDuparAdminAuthContext';

// Export the provider component
export { SuperDuparAdminAuthProvider } from '@/components/auth/SuperDuparAdminAuthProvider';

// Export types and helpers
export {
    authHelpers,
    type SuperDuparAdmin,
    type AuthToken,
    type SuperDuparAdminAuthState,
    type SuperDuparAdminAuthContextType,
    STORAGE_KEY,
    USER_STORAGE_KEY
} from './useSuperDuparAdminAuth';
