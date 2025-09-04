import { useCallback } from "react";
import { useApiRequest } from "./useApiHooks";

/**
 * Hook for admission management operations
 */
export function useAdmissionApi() {
    const {
        data: admissions,
        loading,
        error,
        createRecord,
        updateRecord,
        deleteRecord,
        refresh
    } = useApiRequest('/admissions');

    const createAdmission = useCallback(async (admissionData: any) => {
        const admission = {
            ...admissionData,
            admission_date: admissionData.admission_date || new Date().toISOString(),
            status: admissionData.status || 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        return createRecord(admission);
    }, [createRecord]);

    const admitPatient = useCallback(async (patientId: string, bedId: string, admissionData: any) => {
        try {
            const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:51167'}/api/admissions/admit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    patient_id: patientId,
                    bed_id: bedId,
                    ...admissionData
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error admitting patient:', error);
            throw error;
        }
    }, []);

    const dischargePatient = useCallback(async (admissionId: string, dischargeData: any) => {
        try {
            const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:51167'}/api/admissions/${admissionId}/discharge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dischargeData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error discharging patient:', error);
            throw error;
        }
    }, []);

    const transferPatient = useCallback(async (admissionId: string, newBedId: string, transferData: any) => {
        try {
            const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:51167'}/api/admissions/${admissionId}/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    new_bed_id: newBedId,
                    ...transferData
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error transferring patient:', error);
            throw error;
        }
    }, []);

    const getAdmissionStatistics = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:51167'}/api/admissions/statistics`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching admission statistics:', error);
            throw error;
        }
    }, []);

    const getActiveAdmissions = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:51167'}/api/admissions/active`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching active admissions:', error);
            throw error;
        }
    }, []);

    const addCharge = useCallback(async (admissionId: string, chargeData: any) => {
        try {
            const response = await fetch(`${process.env.VITE_API_URL || 'http://localhost:51167'}/api/admissions/${admissionId}/charges`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chargeData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error adding charge:', error);
            throw error;
        }
    }, []);

    return {
        admissions,
        loading,
        error,
        createAdmission,
        updateAdmission: updateRecord,
        deleteAdmission: deleteRecord,
        refreshAdmissions: refresh,
        admitPatient,
        dischargePatient,
        transferPatient,
        getAdmissionStatistics,
        getActiveAdmissions,
        addCharge
    };
}
