import { useCallback, useState, useEffect } from "react";
import { useApiRequest } from "./useApiHooks";
import { httpService } from "../services/HttpService";

/**
 * Hook for doctor management operations
 */
export function useDoctorApi() {
    const {
        data: doctors,
        loading,
        error,
        createRecord,
        updateRecord,
        deleteRecord,
        refresh
    } = useApiRequest('/doctors');

    const [doctorUsers, setDoctorUsers] = useState<any[]>([]);
    const [loadingDoctorUsers, setLoadingDoctorUsers] = useState(false);
    const [doctorUsersError, setDoctorUsersError] = useState<string | null>(null);

    const createDoctor = useCallback(async (doctorData: any) => {
        const doctor = {
            ...doctorData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: doctorData.status || 'active'
        };
        return createRecord(doctor);
    }, [createRecord]);

    // Fetch users with doctor role
    const fetchDoctorUsers = useCallback(async () => {
        try {
            setLoadingDoctorUsers(true);
            setDoctorUsersError(null);

            const response = await httpService.get('/users');

            if (response.success && response.data) {
                // Filter users who have doctor role
                const users = Array.isArray(response.data.data) ? response.data.data :
                    Array.isArray(response.data) ? response.data : [];

                const doctorRoleUsers = users.filter((user: any) => {
                    // Handle both object and string role structures
                    if (typeof user.role === 'object' && user.role?.name) {
                        return user.role.name === 'doctor' && user.isActive;
                    }
                    if (typeof user.role === 'string') {
                        return user.role === 'doctor' && user.isActive;
                    }
                    return false;
                });

                // Transform to doctor-like format for compatibility
                const transformedDoctors = doctorRoleUsers.map((user: any) => ({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    department: user.department || 'General Medicine',
                    specialization: user.specialization || user.department || 'General Medicine', // Use department as fallback
                    isActive: user.isActive
                }));

                setDoctorUsers(transformedDoctors);
            } else {
                setDoctorUsers([]);
            }
        } catch (error) {
            console.error('❌ Error fetching doctor users:', error);
            setDoctorUsersError('Failed to fetch doctor users');
            setDoctorUsers([]);
        } finally {
            setLoadingDoctorUsers(false);
        }
    }, []);

    // Auto-fetch doctor users when hook is used
    useEffect(() => {
        fetchDoctorUsers();
    }, [fetchDoctorUsers]);

    return {
        doctors,
        loading,
        error,
        createDoctor,
        updateDoctor: updateRecord,
        deleteDoctor: deleteRecord,
        refreshDoctors: refresh,
        // New doctor users functionality
        doctorUsers,
        loadingDoctorUsers,
        doctorUsersError,
        refreshDoctorUsers: fetchDoctorUsers
    };
}