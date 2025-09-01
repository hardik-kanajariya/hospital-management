import { useCallback, useState, useEffect } from "react";
import { httpService } from "../services/HttpService";
import { useDoctorApi } from "./useDoctorApi";

interface DoctorSchedule {
    id: string;
    userId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    location: string;
    maxPatients: number;
    slotDurationMinutes: number;
    scheduleType: string;
    status: string;
    notes?: string;
    breakTimes: Array<{ start_time: string; end_time: string; label?: string }>;
    isRecurring: boolean;
    effectiveFrom: string;
    effectiveUntil?: string;
    priority: number;
    doctor?: any;
    totalSlots?: number;
    duration?: string;
    createdAt: string;
    updatedAt: string;
}

interface DoctorAvailability {
    id: string;
    userId: string;
    date: string;
    isAvailable: boolean;
    availabilityType: string;
    reason?: string;
    replacementDoctorId?: string;
    customStartTime?: string;
    customEndTime?: string;
    customLocation?: string;
    customMaxPatients?: number;
    notes?: string;
    notifyPatients: boolean;
    autoReschedule: boolean;
    doctor?: any;
    replacementDoctor?: any;
    createdAt: string;
    updatedAt: string;
}

export function useDoctorScheduleApi() {
    const { doctors } = useDoctorApi();
    const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
    const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch doctor schedules
    const fetchSchedules = useCallback(async (filters?: {
        userId?: string;
        dayOfWeek?: string;
        scheduleType?: string;
        location?: string;
        status?: string;
        page?: number;
        limit?: number;
    }) => {
        try {
            setLoading(true);
            setError(null);

            const queryParams = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        queryParams.append(key, String(value));
                    }
                });
            }

            const response = await httpService.get(`/doctor-schedules?${queryParams.toString()}`);

            if (response.success && response.data) {
                const schedulesData = response.data.data || response.data;
                setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
            } else {
                throw new Error(response.message || 'Failed to fetch schedules');
            }
        } catch (error: any) {
            console.error('❌ Error fetching doctor schedules:', error);
            setError(error.message || 'Failed to fetch schedules');
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create doctor schedule
    const createSchedule = useCallback(async (scheduleData: Partial<DoctorSchedule>) => {
        try {
            setLoading(true);
            setError(null);

            const response = await httpService.post('/doctor-schedules', {
                ...scheduleData,
                effectiveFrom: scheduleData.effectiveFrom || new Date().toISOString().split('T')[0],
                breakTimes: scheduleData.breakTimes || []
            });

            if (response.success && response.data) {
                setSchedules(current => [...current, response.data]);
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to create schedule');
            }
        } catch (error: any) {
            console.error('❌ Error creating schedule:', error);
            setError(error.message || 'Failed to create schedule');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update doctor schedule
    const updateSchedule = useCallback(async (scheduleId: string, scheduleData: Partial<DoctorSchedule>) => {
        try {
            setLoading(true);
            setError(null);

            const response = await httpService.put(`/doctor-schedules/${scheduleId}`, scheduleData);

            if (response.success && response.data) {
                setSchedules(current =>
                    current.map(schedule =>
                        schedule.id === scheduleId ? response.data : schedule
                    )
                );
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to update schedule');
            }
        } catch (error: any) {
            console.error('❌ Error updating schedule:', error);
            setError(error.message || 'Failed to update schedule');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete doctor schedule
    const deleteSchedule = useCallback(async (scheduleId: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await httpService.delete(`/doctor-schedules/${scheduleId}`);

            if (response.success) {
                setSchedules(current => current.filter(schedule => schedule.id !== scheduleId));
                return response;
            } else {
                throw new Error(response.message || 'Failed to delete schedule');
            }
        } catch (error: any) {
            console.error('❌ Error deleting schedule:', error);
            setError(error.message || 'Failed to delete schedule');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch doctor availability
    const fetchAvailability = useCallback(async (filters?: {
        userId?: string;
        fromDate?: string;
        toDate?: string;
        availabilityType?: string;
        isAvailable?: boolean;
        page?: number;
        limit?: number;
    }) => {
        try {
            setLoading(true);
            setError(null);

            const queryParams = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        queryParams.append(key, String(value));
                    }
                });
            }

            const response = await httpService.get(`/doctor-availability?${queryParams.toString()}`);

            if (response.success && response.data) {
                const availabilityData = response.data.data || response.data;
                setAvailability(Array.isArray(availabilityData) ? availabilityData : []);
            } else {
                throw new Error(response.message || 'Failed to fetch availability');
            }
        } catch (error: any) {
            console.error('❌ Error fetching doctor availability:', error);
            setError(error.message || 'Failed to fetch availability');
            setAvailability([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create or update doctor availability
    const upsertAvailability = useCallback(async (availabilityData: Partial<DoctorAvailability>) => {
        try {
            setLoading(true);
            setError(null);

            const response = await httpService.post('/doctor-availability', availabilityData);

            if (response.success && response.data) {
                const newAvailability = response.data;
                setAvailability(current => {
                    const existingIndex = current.findIndex(
                        item => item.userId === newAvailability.userId && item.date === newAvailability.date
                    );

                    if (existingIndex >= 0) {
                        // Update existing
                        const updated = [...current];
                        updated[existingIndex] = newAvailability;
                        return updated;
                    } else {
                        // Add new
                        return [...current, newAvailability];
                    }
                });
                return newAvailability;
            } else {
                throw new Error(response.message || 'Failed to update availability');
            }
        } catch (error: any) {
            console.error('❌ Error updating availability:', error);
            setError(error.message || 'Failed to update availability');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete doctor availability
    const deleteAvailability = useCallback(async (availabilityId: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await httpService.delete(`/doctor-availability/${availabilityId}`);

            if (response.success) {
                setAvailability(current => current.filter(item => item.id !== availabilityId));
                return response;
            } else {
                throw new Error(response.message || 'Failed to delete availability');
            }
        } catch (error: any) {
            console.error('❌ Error deleting availability:', error);
            setError(error.message || 'Failed to delete availability');
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    // Check doctor availability for a specific date
    const checkAvailability = useCallback(async (userId: string, date: string) => {
        try {
            const response = await httpService.get(`/doctor-availability/check/status?userId=${userId}&date=${date}`);

            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to check availability');
            }
        } catch (error: any) {
            console.error('❌ Error checking availability:', error);
            throw error;
        }
    }, []);

    // Get availability by date range
    const getAvailabilityByDateRange = useCallback(async (userId: string, fromDate: string, toDate: string) => {
        try {
            const response = await httpService.get(`/doctor-availability/date-range/check?userId=${userId}&fromDate=${fromDate}&toDate=${toDate}`);

            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.message || 'Failed to get availability');
            }
        } catch (error: any) {
            console.error('❌ Error getting availability by date range:', error);
            throw error;
        }
    }, []);

    // Get utility functions
    const getSchedulesByDay = useCallback((day: string) => {
        return schedules.filter(s => s.dayOfWeek === day && s.status === 'active');
    }, [schedules]);

    const getDoctorAvailability = useCallback((doctorId: string, date: string) => {
        return availability.find(a => a.userId === doctorId && a.date === date);
    }, [availability]);

    const getActiveDoctors = useCallback(() => {
        return doctors.filter(d => d.isActive);
    }, [doctors]);

    // Auto-fetch data when hook is initialized
    useEffect(() => {
        fetchSchedules();
        fetchAvailability();
    }, [fetchSchedules, fetchAvailability]);

    return {
        // Data
        schedules,
        availability,
        doctors: getActiveDoctors(),
        loading,
        error,

        // Schedule operations
        fetchSchedules,
        createSchedule,
        updateSchedule,
        deleteSchedule,

        // Availability operations
        fetchAvailability,
        upsertAvailability,
        deleteAvailability,
        checkAvailability,
        getAvailabilityByDateRange,

        // Utility functions
        getSchedulesByDay,
        getDoctorAvailability,

        // Refresh all data
        refresh: useCallback(() => {
            fetchSchedules();
            fetchAvailability();
        }, [fetchSchedules, fetchAvailability])
    };
}
