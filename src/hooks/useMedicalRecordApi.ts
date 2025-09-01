import { useState, useCallback, useEffect } from 'react';
import { httpService } from '@/services/HttpService';
import { API_ENDPOINTS } from '@/lib/api-endpoints';
import { toast } from 'sonner';

interface MedicalRecord {
    id: string;
    record_id: string;
    patient_id: string;
    doctor_id: string;
    appointment_id?: string;
    visit_date: string;
    diagnosis: string;
    treatment: string;
    medications: Array<{
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions: string;
    }>;
    lab_results: Array<{
        test_name: string;
        result: string;
        normal_range: string;
        status: string;
    }>;
    follow_up_instructions: string[];
    next_visit_date?: string;
    vital_signs: {
        temperature: string;
        blood_pressure: string;
        heart_rate: string;
        respiratory_rate: string;
        oxygen_saturation: string;
        weight: string;
        height: string;
    };
    notes?: string;
    attachments: Array<{
        name: string;
        url: string;
        type: string;
    }>;
    created_at: string;
    updated_at: string;
    patient?: {
        id: string;
        name: string;
        patient_id: string;
        phone: string;
        date_of_birth: string;
        gender: string;
        blood_group?: string;
    };
    doctor?: {
        id: string;
        name: string;
        specialization: string;
        license_number: string;
    };
}

interface MedicalRecordCreateRequest {
    patientId: string;
    doctorId: string;
    appointmentId?: string;
    visitDate: string;
    diagnosis: string;
    treatment: string;
    medications?: Array<{
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions: string;
    }>;
    labResults?: Array<{
        test_name: string;
        result: string;
        normal_range: string;
        status: string;
    }>;
    followUpInstructions?: string[];
    nextVisitDate?: string;
    vitalSigns?: {
        temperature?: string;
        blood_pressure?: string;
        heart_rate?: string;
        respiratory_rate?: string;
        oxygen_saturation?: string;
        weight?: string;
        height?: string;
    };
    notes?: string;
    attachments?: Array<{
        name: string;
        url: string;
        type: string;
    }>;
}

interface MedicalRecordSearchParams {
    page?: number;
    limit?: number;
    patientId?: string;
    doctorId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
}

/**
 * Hook for medical records management
 */
export function useMedicalRecordApi() {
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 20,
        total: 0,
        last_page: 1
    });

    // Fetch medical records with search and pagination
    const fetchMedicalRecords = useCallback(async (params?: MedicalRecordSearchParams) => {
        setLoading(true);
        setError(null);

        try {
            // Build query string from params
            const queryParams = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        queryParams.append(key, String(value));
                    }
                });
            }

            const queryString = queryParams.toString();
            const endpoint = queryString ? `${API_ENDPOINTS.MEDICAL_RECORDS.BASE}?${queryString}` : API_ENDPOINTS.MEDICAL_RECORDS.BASE;

            const response = await httpService.get<{
                data: MedicalRecord[];
                meta: typeof pagination;
            }>(endpoint);

            if (response.success && response.data) {
                if (Array.isArray(response.data)) {
                    // Direct array response
                    setMedicalRecords(response.data);
                } else if (response.data.data) {
                    // Paginated response
                    setMedicalRecords(response.data.data);
                    if (response.data.meta) {
                        setPagination(response.data.meta);
                    }
                }
            } else {
                throw new Error(response.error || 'Failed to fetch medical records');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch medical records';
            setError(errorMessage);
            console.error('Error fetching medical records:', err);
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, []);

    // Get patient's medical history
    const fetchPatientMedicalHistory = useCallback(async (patientId: string, params?: { page?: number; limit?: number }) => {
        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();
            if (params?.page) queryParams.append('page', String(params.page));
            if (params?.limit) queryParams.append('limit', String(params.limit));

            const queryString = queryParams.toString();
            const endpoint = queryString
                ? `${API_ENDPOINTS.MEDICAL_RECORDS.BY_PATIENT(patientId)}?${queryString}`
                : API_ENDPOINTS.MEDICAL_RECORDS.BY_PATIENT(patientId);

            const response = await httpService.get<{
                data: MedicalRecord[];
                meta?: typeof pagination;
            }>(endpoint);

            if (response.success && response.data) {
                if (Array.isArray(response.data)) {
                    setMedicalRecords(response.data);
                } else if (response.data.data) {
                    setMedicalRecords(response.data.data);
                    if (response.data.meta) {
                        setPagination(response.data.meta);
                    }
                }
            } else {
                throw new Error(response.error || 'Failed to fetch patient medical history');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patient medical history';
            setError(errorMessage);
            console.error('Error fetching patient medical history:', err);
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create medical record
    const createMedicalRecord = useCallback(async (recordData: MedicalRecordCreateRequest) => {
        try {
            setLoading(true);
            const response = await httpService.post<MedicalRecord>(API_ENDPOINTS.MEDICAL_RECORDS.BASE, recordData);

            if (response.success && response.data) {
                setMedicalRecords(prev => [response.data!, ...prev]);
                toast.success('Medical record created successfully');
                return response.data;
            } else {
                console.error('❌ API call unsuccessful:', response);
                throw new Error(response.error || 'Failed to create medical record');
            }
        } catch (err) {
            console.error('🚨 Error in createMedicalRecord:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to create medical record';
            console.error('🚨 Error message:', errorMessage);
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update medical record
    const updateMedicalRecord = useCallback(async (id: string, updates: Partial<MedicalRecordCreateRequest>) => {
        try {
            setLoading(true);
            const response = await httpService.put<MedicalRecord>(API_ENDPOINTS.MEDICAL_RECORDS.BY_ID(id), updates);

            if (response.success && response.data) {
                setMedicalRecords(prev => prev.map(record =>
                    record.id === id ? { ...record, ...response.data } : record
                ));
                toast.success('Medical record updated successfully');
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to update medical record');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update medical record';
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete medical record
    const deleteMedicalRecord = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const response = await httpService.delete(API_ENDPOINTS.MEDICAL_RECORDS.BY_ID(id));

            if (response.success) {
                setMedicalRecords(prev => prev.filter(record => record.id !== id));
                toast.success('Medical record deleted successfully');
            } else {
                throw new Error(response.error || 'Failed to delete medical record');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete medical record';
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Search medical records
    const searchMedicalRecords = useCallback(async (searchTerm: string, params?: MedicalRecordSearchParams) => {
        const searchParams = { ...params, search: searchTerm };
        return fetchMedicalRecords(searchParams);
    }, [fetchMedicalRecords]);

    return {
        medicalRecords,
        loading,
        error,
        pagination,
        fetchMedicalRecords,
        fetchPatientMedicalHistory,
        createMedicalRecord,
        updateMedicalRecord,
        deleteMedicalRecord,
        searchMedicalRecords,
        refreshMedicalRecords: fetchMedicalRecords
    };
}

/**
 * Hook for enhanced medical record analytics and insights
 */
export function useMedicalRecordAnalytics() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Get patient medical statistics
    const getPatientStatistics = useCallback(async (patientId: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await httpService.get(API_ENDPOINTS.MEDICAL_RECORDS.PATIENT_STATISTICS(patientId));

            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to fetch patient statistics');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patient statistics';
            setError(errorMessage);
            console.error('Error fetching patient statistics:', err);
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get patient medical timeline
    const getPatientTimeline = useCallback(async (patientId: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await httpService.get(API_ENDPOINTS.MEDICAL_RECORDS.PATIENT_TIMELINE(patientId));

            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to fetch patient timeline');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patient timeline';
            setError(errorMessage);
            console.error('Error fetching patient timeline:', err);
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get vital signs trends
    const getVitalSignsTrends = useCallback(async (patientId: string, days: number = 30) => {
        setLoading(true);
        setError(null);

        try {
            const response = await httpService.get(
                `${API_ENDPOINTS.MEDICAL_RECORDS.PATIENT_VITAL_SIGNS_TRENDS(patientId)}?days=${days}`
            );

            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to fetch vital signs trends');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vital signs trends';
            setError(errorMessage);
            console.error('Error fetching vital signs trends:', err);
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get patient alerts
    const getPatientAlerts = useCallback(async (patientId: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await httpService.get(API_ENDPOINTS.MEDICAL_RECORDS.PATIENT_ALERTS(patientId));

            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to fetch patient alerts');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patient alerts';
            setError(errorMessage);
            console.error('Error fetching patient alerts:', err);
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Validate medical data
    const validateMedicalData = useCallback(async (data: any) => {
        setLoading(true);
        setError(null);

        try {
            const response = await httpService.post(API_ENDPOINTS.MEDICAL_RECORDS.VALIDATE, data);

            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to validate medical data');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to validate medical data';
            setError(errorMessage);
            console.error('Error validating medical data:', err);
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        getPatientStatistics,
        getPatientTimeline,
        getVitalSignsTrends,
        getPatientAlerts,
        validateMedicalData
    };
}

/**
 * Hook for managing single medical record state
 */
export function useMedicalRecord(recordId?: string) {
    const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMedicalRecord = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await httpService.get<MedicalRecord>(API_ENDPOINTS.MEDICAL_RECORDS.BY_ID(id));

            if (response.success && response.data) {
                setMedicalRecord(response.data);
            } else {
                throw new Error(response.error || 'Failed to fetch medical record');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch medical record';
            setError(errorMessage);
            console.error('Error fetching medical record:', err);
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateMedicalRecord = useCallback(async (updates: Partial<MedicalRecordCreateRequest>) => {
        if (!medicalRecord) return;

        try {
            setLoading(true);
            const response = await httpService.put<MedicalRecord>(API_ENDPOINTS.MEDICAL_RECORDS.BY_ID(medicalRecord.id), updates);

            if (response.success && response.data) {
                setMedicalRecord(response.data);
                toast.success('Medical record updated successfully');
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to update medical record');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update medical record';
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [medicalRecord]);

    useEffect(() => {
        if (recordId) {
            fetchMedicalRecord(recordId);
        }
    }, [recordId, fetchMedicalRecord]);

    return {
        medicalRecord,
        loading,
        error,
        fetchMedicalRecord,
        updateMedicalRecord
    };
}