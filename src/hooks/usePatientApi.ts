import { useState, useCallback, useEffect } from 'react';
import { httpService } from '@/services/HttpService';
import { toast } from 'sonner';
import {
    Patient,
    PatientCreateRequest,
    PatientUpdateRequest,
    PatientSearchParams,
    PatientStats,
    Appointment,
    MedicalRecord,
    Bill
} from '@/types/patient';

/**
 * Enhanced Patient API Hook with comprehensive operations
 */
export function usePatientApi() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 20,
        total: 0,
        last_page: 1
    });

    // Fetch patients with search and pagination
    const fetchPatients = useCallback(async (params?: PatientSearchParams) => {
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
            const endpoint = queryString ? `/patients?${queryString}` : '/patients';

            const response = await httpService.get<{
                data: Patient[];
                meta: typeof pagination;
            }>(endpoint);

            if (response.success && response.data) {
                setPatients(response.data.data || []);
                setPagination(response.data.meta || pagination);
            } else {
                throw new Error(response.error || 'Failed to fetch patients');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patients';
            setError(errorMessage);
            console.error('Error fetching patients:', err);
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, []);

    // Get single patient with relations
    const getPatient = useCallback(async (id: string, include?: string[]) => {
        try {
            setLoading(true);
            const includeParam = include ? `?include=${include.join(',')}` : '';
            const response = await httpService.get<Patient>(`/patients/${id}${includeParam}`);

            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to fetch patient');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patient';
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Create new patient
    const createPatient = useCallback(async (patientData: PatientCreateRequest) => {
        try {
            setLoading(true);
            const response = await httpService.post<Patient>('/patients', patientData);

            if (response.success && response.data) {
                setPatients(prev => [response.data as Patient, ...prev]);
                toast.success('Patient created successfully');
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to create patient');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create patient';
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update patient
    const updatePatient = useCallback(async (id: string, updates: Partial<PatientUpdateRequest>) => {
        try {
            setLoading(true);
            const response = await httpService.put<Patient>(`/patients/${id}`, updates);

            if (response.success && response.data) {
                setPatients(prev => prev.map(patient =>
                    patient.id === id ? { ...patient, ...response.data } : patient
                ));
                toast.success('Patient updated successfully');
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to update patient');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update patient';
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete patient
    const deletePatient = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const response = await httpService.delete(`/patients/${id}`);

            if (response.success) {
                setPatients(prev => prev.filter(patient => patient.id !== id));
                toast.success('Patient deleted successfully');
            } else {
                throw new Error(response.error || 'Failed to delete patient');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete patient';
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get patient appointments
    const getPatientAppointments = useCallback(async (patientId: string) => {
        try {
            const response = await httpService.get<Appointment[]>(`/patients/${patientId}/appointments`);
            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to fetch patient appointments');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patient appointments';
            toast.error(`Error: ${errorMessage}`);
            throw err;
        }
    }, []);

    // Get patient medical records
    const getPatientMedicalRecords = useCallback(async (patientId: string) => {
        try {
            const response = await httpService.get<MedicalRecord[]>(`/patients/${patientId}/medical-records`);
            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to fetch patient medical records');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patient medical records';
            toast.error(`Error: ${errorMessage}`);
            throw err;
        }
    }, []);

    // Get patient billing history
    const getPatientBills = useCallback(async (patientId: string) => {
        try {
            const response = await httpService.get<Bill[]>(`/patients/${patientId}/bills`);
            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to fetch patient bills');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patient bills';
            toast.error(`Error: ${errorMessage}`);
            throw err;
        }
    }, []);

    // Get patient statistics
    const getPatientStats = useCallback(async () => {
        try {
            const response = await httpService.get<PatientStats>('/patients/stats');
            if (response.success && response.data) {
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to fetch patient statistics');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patient statistics';
            toast.error(`Error: ${errorMessage}`);
            throw err;
        }
    }, []);

    // Search patients by query
    const searchPatients = useCallback(async (query: string) => {
        return fetchPatients({ search: query, limit: 10 });
    }, [fetchPatients]);

    // Refresh patients list
    const refreshPatients = useCallback(() => {
        fetchPatients();
    }, [fetchPatients]);

    // Initial load
    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    return {
        // Data
        patients,
        loading,
        error,
        pagination,

        // Operations
        fetchPatients,
        getPatient,
        createPatient,
        updatePatient,
        deletePatient,
        refreshPatients,
        searchPatients,

        // Related data operations
        getPatientAppointments,
        getPatientMedicalRecords,
        getPatientBills,
        getPatientStats
    };
}

/**
 * Hook for managing single patient state
 */
export function usePatient(patientId?: string) {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPatient = useCallback(async (id: string, include?: string[]) => {
        setLoading(true);
        setError(null);

        try {
            const includeParam = include ? `?include=${include.join(',')}` : '';
            const response = await httpService.get<Patient>(`/patients/${id}${includeParam}`);

            if (response.success && response.data) {
                setPatient(response.data);
            } else {
                throw new Error(response.error || 'Failed to fetch patient');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patient';
            setError(errorMessage);
            console.error('Error fetching patient:', err);
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePatient = useCallback(async (updates: Partial<PatientUpdateRequest>) => {
        if (!patient) return;

        try {
            setLoading(true);
            const response = await httpService.put<Patient>(`/patients/${patient.id}`, updates);

            if (response.success && response.data) {
                setPatient(response.data);
                toast.success('Patient updated successfully');
                return response.data;
            } else {
                throw new Error(response.error || 'Failed to update patient');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update patient';
            toast.error(`Error: ${errorMessage}`);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [patient]);

    useEffect(() => {
        if (patientId) {
            fetchPatient(patientId, ['appointments', 'medical_records', 'bills']);
        }
    }, [patientId, fetchPatient]);

    return {
        patient,
        loading,
        error,
        fetchPatient,
        updatePatient,
        refetch: () => patientId && fetchPatient(patientId, ['appointments', 'medical_records', 'bills'])
    };
}

/**
 * Hook for patient search and filters
 */
export function usePatientSearch() {
    const [searchResults, setSearchResults] = useState<Patient[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const search = useCallback(async (query: string, filters?: Omit<PatientSearchParams, 'search'>) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        setSearchQuery(query);

        try {
            // Build query string
            const queryParams = new URLSearchParams();
            queryParams.append('search', query);
            queryParams.append('limit', '20');

            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        queryParams.append(key, String(value));
                    }
                });
            }

            const response = await httpService.get<{
                data: Patient[];
            }>(`/patients?${queryParams.toString()}`);

            if (response.success && response.data) {
                setSearchResults(response.data.data || []);
            } else {
                throw new Error(response.error || 'Failed to search patients');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to search patients';
            console.error('Error searching patients:', err);
            toast.error(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, []);

    const clearSearch = useCallback(() => {
        setSearchResults([]);
        setSearchQuery('');
    }, []);

    return {
        searchResults,
        loading,
        searchQuery,
        search,
        clearSearch
    };
}
