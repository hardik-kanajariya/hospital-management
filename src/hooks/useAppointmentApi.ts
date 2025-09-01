import { useCallback } from "react";
import { useApiRequest } from "./useApiHooks";
import { Appointment } from "@/types/hospital";

/**
 * Hook for appointment management operations
 * Uses HttpService for all API calls
 */
export function useAppointmentApi() {
    const {
        data: appointments,
        loading,
        error,
        createRecord,
        updateRecord,
        deleteRecord,
        refresh
    } = useApiRequest<Appointment>('/appointments');

    const createAppointment = useCallback(async (appointmentData: Partial<Appointment>) => {
        // Validate required fields
        if (!appointmentData.patient_id || !appointmentData.doctor_id) {
            throw new Error('Patient and doctor are required');
        }

        const appointment: Omit<Appointment, 'id'> = {
            patient_id: appointmentData.patient_id,
            doctor_id: appointmentData.doctor_id,
            appointment_date: appointmentData.appointment_date || '',
            appointment_time: appointmentData.appointment_time || '',
            appointment_type: appointmentData.appointment_type || 'consultation',
            status: appointmentData.status || 'scheduled',
            reason: appointmentData.reason || '',
            notes: appointmentData.notes || '',
            doctor_name: appointmentData.doctor_name || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            duration: appointmentData.duration,
            reminder_sent: appointmentData.reminder_sent || false
        };
        return createRecord(appointment);
    }, [createRecord]);

    const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>) => {
        const updatedData = {
            ...updates,
            updated_at: new Date().toISOString()
        };
        return updateRecord(id, updatedData);
    }, [updateRecord]);

    const deleteAppointment = useCallback(async (id: string) => {
        return deleteRecord(id);
    }, [deleteRecord]);

    const getAppointmentById = useCallback((id: string) => {
        return appointments.find(appointment => appointment.id === id);
    }, [appointments]);

    const getAppointmentsByPatient = useCallback((patientId: string) => {
        return appointments.filter(appointment => appointment.patient_id === patientId);
    }, [appointments]);

    const getAppointmentsByDoctor = useCallback((doctorId: string) => {
        return appointments.filter(appointment => appointment.doctor_id === doctorId);
    }, [appointments]);

    const getAppointmentsByDate = useCallback((date: string) => {
        return appointments.filter(appointment => appointment.appointment_date === date);
    }, [appointments]);

    const getAppointmentsByStatus = useCallback((status: string) => {
        return appointments.filter(appointment => appointment.status === status);
    }, [appointments]);

    return {
        appointments,
        loading,
        error,
        createAppointment,
        updateAppointment,
        deleteAppointment,
        getAppointmentById,
        getAppointmentsByPatient,
        getAppointmentsByDoctor,
        getAppointmentsByDate,
        getAppointmentsByStatus,
        refreshAppointments: refresh
    };
}