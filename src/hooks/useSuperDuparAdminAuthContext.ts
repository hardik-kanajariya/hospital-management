import { useContext } from 'react';
import { SuperDuparAdminAuthContext } from '@/components/auth/SuperDuparAdminAuthProvider';
import { SuperDuparAdminAuthContextType } from '@/hooks/useSuperDuparAdminAuth';

export const useSuperDuparAdminAuth = (): SuperDuparAdminAuthContextType => {
    const context = useContext(SuperDuparAdminAuthContext);
    if (context === undefined) {
        throw new Error('useSuperDuparAdminAuth must be used within a SuperDuparAdminAuthProvider');
    }
    return context;
};
