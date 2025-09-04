import { useCallback } from "react";
import { useApiRequest } from "./useApiHooks";

/**
 * Hook for room management operations
 */
export function useRoomApi() {
    const {
        data: rooms,
        loading,
        error,
        createRecord,
        updateRecord,
        deleteRecord,
        refresh
    } = useApiRequest('/rooms');

    const createRoom = useCallback(async (roomData: any) => {
        const room = {
            ...roomData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: roomData.status || 'available'
        };
        return createRecord(room);
    }, [createRecord]);

    const getRoomStatistics = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:51167'}/api/rooms/statistics`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching room statistics:', error);
            throw error;
        }
    }, []);

    const getRoomsByType = useCallback(async (roomTypeId: string) => {
        try {
            const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:51167'}/api/rooms?room_type_id=${roomTypeId}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching rooms by type:', error);
            throw error;
        }
    }, []);

    const getAvailableRooms = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:51167'}/api/rooms/available`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching available rooms:', error);
            throw error;
        }
    }, []);

    return {
        rooms,
        loading,
        error,
        createRoom,
        updateRoom: updateRecord,
        deleteRoom: deleteRecord,
        refreshRooms: refresh,
        getRoomStatistics,
        getRoomsByType,
        getAvailableRooms
    };
}
