import { useState, useEffect, useCallback } from 'react';
import { httpService } from '@/services/HttpService';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

export interface Role {
    id: string;
    name: string;
    description?: string;
    is_active: boolean;
    permissions: Permission[];
    created_at: string;
    updated_at: string;
}

export interface Permission {
    id: string;
    name: string;
    module: string;
    action: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateRoleData {
    name: string;
    description?: string;
    permission_ids: string[];
}

export interface UpdateRoleData {
    name?: string;
    description?: string;
    is_active?: boolean;
    permission_ids?: string[];
}

export const useRoles = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRoles = useCallback(async () => {
        try {
            setError(null);
            const response = await httpService.get(API_ENDPOINTS.ROLES.BASE);

            if (response.success) {
                setRoles(response.data || []);
            } else {
                setError(response.error || 'Failed to fetch roles');
            }
        } catch (err) {
            console.error('Roles fetch error:', err);
            setError('An error occurred while fetching roles');
        }
    }, []);

    const fetchPermissions = useCallback(async () => {
        try {
            setError(null);
            const response = await httpService.get(API_ENDPOINTS.PERMISSIONS.BASE);

            if (response.success) {
                setPermissions(response.data || []);
            } else {
                setError(response.error || 'Failed to fetch permissions');
            }
        } catch (err) {
            console.error('Permissions fetch error:', err);
            setError('An error occurred while fetching permissions');
        }
    }, []);

    const fetchInitialData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            await Promise.all([fetchRoles(), fetchPermissions()]);
        } catch (err) {
            console.error('Initial data fetch error:', err);
            setError('An error occurred while loading data');
        } finally {
            setLoading(false);
        }
    }, [fetchRoles, fetchPermissions]);

    const createRole = useCallback(async (roleData: CreateRoleData) => {
        try {
            const response = await httpService.post(API_ENDPOINTS.ROLES.BASE, roleData);

            if (response.success) {
                await fetchRoles(); // Refresh the roles list
                return { success: true, data: response.data };
            } else {
                return { success: false, error: response.error || 'Failed to create role' };
            }
        } catch (err) {
            console.error('Role creation error:', err);
            return { success: false, error: 'An error occurred while creating the role' };
        }
    }, [fetchRoles]);

    const updateRole = useCallback(async (roleId: string, roleData: UpdateRoleData) => {
        try {
            const response = await httpService.put(API_ENDPOINTS.ROLES.BY_ID(roleId), roleData);

            if (response.success) {
                await fetchRoles(); // Refresh the roles list
                return { success: true, data: response.data };
            } else {
                return { success: false, error: response.error || 'Failed to update role' };
            }
        } catch (err) {
            console.error('Role update error:', err);
            return { success: false, error: 'An error occurred while updating the role' };
        }
    }, [fetchRoles]);

    const deleteRole = useCallback(async (roleId: string) => {
        try {
            const response = await httpService.delete(API_ENDPOINTS.ROLES.BY_ID(roleId));

            if (response.success) {
                await fetchRoles(); // Refresh the roles list
                return { success: true };
            } else {
                return { success: false, error: response.error || 'Failed to delete role' };
            }
        } catch (err) {
            console.error('Role deletion error:', err);
            return { success: false, error: 'An error occurred while deleting the role' };
        }
    }, [fetchRoles]);

    const assignPermissions = useCallback(async (roleId: string, permissionIds: string[]) => {
        try {
            const response = await httpService.post(API_ENDPOINTS.ROLES.ASSIGN_PERMISSION(roleId), {
                permission_ids: permissionIds
            });

            if (response.success) {
                await fetchRoles(); // Refresh the roles list
                return { success: true };
            } else {
                return { success: false, error: response.error || 'Failed to assign permissions' };
            }
        } catch (err) {
            console.error('Permission assignment error:', err);
            return { success: false, error: 'An error occurred while assigning permissions' };
        }
    }, [fetchRoles]);

    const revokePermission = useCallback(async (roleId: string, permissionId: string) => {
        try {
            const response = await httpService.delete(API_ENDPOINTS.ROLES.REVOKE_PERMISSION(roleId, permissionId));

            if (response.success) {
                await fetchRoles(); // Refresh the roles list
                return { success: true };
            } else {
                return { success: false, error: response.error || 'Failed to revoke permission' };
            }
        } catch (err) {
            console.error('Permission revocation error:', err);
            return { success: false, error: 'An error occurred while revoking permission' };
        }
    }, [fetchRoles]);

    const getPermissionsByModule = useCallback(() => {
        const grouped: Record<string, Permission[]> = {};

        permissions.forEach(permission => {
            if (!grouped[permission.module]) {
                grouped[permission.module] = [];
            }
            grouped[permission.module].push(permission);
        });

        return grouped;
    }, [permissions]);

    const getRoleById = useCallback((roleId: string): Role | undefined => {
        return roles.find(role => role.id === roleId);
    }, [roles]);

    const getPermissionById = useCallback((permissionId: string): Permission | undefined => {
        return permissions.find(permission => permission.id === permissionId);
    }, [permissions]);

    const refreshData = useCallback(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    return {
        roles,
        permissions,
        loading,
        error,
        createRole,
        updateRole,
        deleteRole,
        assignPermissions,
        revokePermission,
        getPermissionsByModule,
        getRoleById,
        getPermissionById,
        refreshData
    };
};

export default useRoles;
