import { useCallback } from "react";
import { useApiRequest } from "./useApiHooks";

/**
 * Hook for bed management operations
 */
export function useBedApi() {
    const {
        data: beds,
        loading,
        error,
        createRecord,
        updateRecord,
        deleteRecord,
        refresh
    } = useApiRequest('/beds');

    const createBed = useCallback(async (bedData: any) => {
        const bed = {
            ...bedData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: bedData.status || 'available'
        };
        return createRecord(bed);
    }, [createRecord]);

    const getBedStatistics = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:51167'}/api/beds/statistics`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching bed statistics:', error);
            throw error;
        }
    }, []);

    const getAvailableBeds = useCallback(async (roomId?: string) => {
        try {
            const url = roomId
                ? `${process.env.VITE_API_URL || 'http://localhost:51167'}/api/beds/available?room_id=${roomId}`
                : `${process.env.VITE_API_URL || 'http://localhost:51167'}/api/beds/available`;
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Error fetching available beds:', error);
            throw error;
        }
    }, []);

    const getBedsByRoom = useCallback(async (roomId: string) => {
        try {
            const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:51167'}/api/beds?room_id=${roomId}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching beds by room:', error);
            throw error;
        }
    }, []);

    const updateBedStatus = useCallback(async (bedId: string, status: string) => {
        try {
            const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:51167'}/api/beds/${bedId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status })
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating bed status:', error);
            throw error;
        }
    }, []);

    return {
        beds,
        loading,
        error,
        createBed,
        updateBed: updateRecord,
        deleteBed: deleteRecord,
        refreshBeds: refresh,
        getBedStatistics,
        getAvailableBeds,
        getBedsByRoom,
        updateBedStatus
    };
}