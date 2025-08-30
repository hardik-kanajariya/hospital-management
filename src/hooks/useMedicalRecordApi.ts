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
        console.log('🔍 fetchMedicalRecords called with params:', params);
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

            console.log('📡 Making API call to:', endpoint);

            const response = await httpService.get<{
                data: MedicalRecord[];
                meta: typeof pagination;
            }>(endpoint);

            console.log('📊 API Response:', response);

            if (response.success && response.data) {
                if (Array.isArray(response.data)) {
                    // Direct array response
                    console.log('✅ Setting medical records (direct array):', response.data);
                    setMedicalRecords(response.data);
                } else if (response.data.data) {
                    // Paginated response
                    console.log('✅ Setting medical records (paginated):', response.data.data);
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
            console.log('🏥 useMedicalRecordApi - createMedicalRecord called with:', recordData);
            console.log('🌐 API endpoint:', API_ENDPOINTS.MEDICAL_RECORDS.BASE);

            setLoading(true);
            const response = await httpService.post<MedicalRecord>(API_ENDPOINTS.MEDICAL_RECORDS.BASE, recordData);

            console.log('📡 API Response received:', response);

            if (response.success && response.data) {
                setMedicalRecords(prev => [response.data!, ...prev]);
                toast.success('Medical record created successfully');
                console.log('✅ Medical record created and added to state:', response.data);
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