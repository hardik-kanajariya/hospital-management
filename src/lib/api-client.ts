/**
 * Robust API Client
 * Handles all API communication with comprehensive error handling and retry logic
 */

import { httpService } from '@/services/HttpService';
import { useAppStore } from './store';

export interface ApiClientConfig {
    baseUrl?: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

class RobustApiClient {
    private static instance: RobustApiClient;
    private initialized = false;
    private healthCheckInterval?: NodeJS.Timeout;
    private config: Required<ApiClientConfig>;

    private constructor(config: ApiClientConfig = {}) {
        this.config = {
            baseUrl: config.baseUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
            timeout: config.timeout || 30000,
            retries: config.retries || 3,
            retryDelay: config.retryDelay || 1000,
        };
    }

    static getInstance(config?: ApiClientConfig): RobustApiClient {
        if (!RobustApiClient.instance) {
            RobustApiClient.instance = new RobustApiClient(config);
        }
        return RobustApiClient.instance;
    }

    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            // Check if server is available
            const isHealthy = await httpService.checkHealth();

            if (isHealthy) {
                useAppStore.getState().setServerReachable(true);
                console.log('API client initialized successfully');
            } else {
                useAppStore.getState().setServerReachable(false);
                console.warn('Server health check failed - continuing anyway');
            }

            this.initialized = true;
            this.startHealthChecking();
        } catch (error) {
            console.error('Failed to initialize API client:', error);
            useAppStore.getState().setServerReachable(false);
            this.initialized = true; // Allow app to continue
        }
    }

    private startHealthChecking(): void {
        // Check server health every 30 seconds
        this.healthCheckInterval = setInterval(async () => {
            try {
                const isHealthy = await httpService.checkHealth();
                useAppStore.getState().setServerReachable(isHealthy);
            } catch (error) {
                useAppStore.getState().setServerReachable(false);
            }
        }, 30000);
    }

    async destroy(): Promise<void> {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        this.initialized = false;
    }

    // Generic CRUD operations
    async getAll<T>(
        endpoint: string,
        params?: PaginationParams
    ): Promise<T[] | PaginatedResponse<T>> {
        this.ensureInitialized();
        this.ensureOnline();

        try {
            const queryParams = params ? new URLSearchParams(
                Object.entries(params)
                    .filter(([_, value]) => value !== undefined)
                    .map(([key, value]) => [key, String(value)])
            ).toString() : '';

            const url = queryParams ? `${endpoint}?${queryParams}` : endpoint;
            const response = await httpService.get<T[] | PaginatedResponse<T>>(url);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error(response.error || 'Failed to fetch data from server');
        } catch (error) {
            console.error(`API call failed for ${endpoint}:`, error);
            throw new Error('Failed to fetch data from server. Please check your connection and try again.');
        }
    }

    async getById<T>(endpoint: string, id: string | number): Promise<T> {
        this.ensureInitialized();
        this.ensureOnline();

        try {
            const response = await httpService.get<T>(`${endpoint}/${id}`);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error(response.error || 'Failed to fetch record from server');
        } catch (error) {
            console.error(`API call failed for ${endpoint}/${id}:`, error);
            throw new Error('Failed to fetch record from server. Please check your connection and try again.');
        }
    }

    async create<T>(endpoint: string, data: Omit<T, 'id'>): Promise<T> {
        this.ensureInitialized();
        this.ensureOnline();

        try {
            const response = await httpService.post<T>(endpoint, data);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error(response.error || 'Failed to save data to server');
        } catch (error) {
            console.error(`API call failed for POST ${endpoint}:`, error);
            throw new Error('Failed to save data to server. Please check your connection and try again.');
        }
    }

    async update<T>(endpoint: string, id: string | number, data: Partial<T>): Promise<T> {
        this.ensureInitialized();
        this.ensureOnline();

        try {
            const response = await httpService.put<T>(`${endpoint}/${id}`, data);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error(response.error || 'Failed to update data on server');
        } catch (error) {
            console.error(`API call failed for PUT ${endpoint}/${id}:`, error);
            throw new Error('Failed to update data on server. Please check your connection and try again.');
        }
    }

    async delete(endpoint: string, id: string | number): Promise<void> {
        this.ensureInitialized();
        this.ensureOnline();

        try {
            const response = await httpService.delete(`${endpoint}/${id}`);

            if (!response.success) {
                throw new Error(response.error || 'Failed to delete data from server');
            }
        } catch (error) {
            console.error(`API call failed for DELETE ${endpoint}/${id}:`, error);
            throw new Error('Failed to delete data from server. Please check your connection and try again.');
        }
    }

    // Authentication methods
    async authenticate(email: string, password: string): Promise<any> {
        this.ensureOnline();

        try {
            return await httpService.authenticate(email, password);
        } catch (error) {
            console.error('Authentication error:', error);
            throw new Error('Authentication failed');
        }
    }

    logout(): void {
        httpService.clearToken();
    }

    // Specialized methods for hospital entities
    async searchPatients(query: string, limit = 10): Promise<any[]> {
        const result = await this.getAll('/patients', { search: query, limit });
        return Array.isArray(result) ? result : result.data;
    }

    async getPatientHistory(patientId: string): Promise<any[]> {
        const result = await this.getAll(`/patients/${patientId}/medical-history`);
        return Array.isArray(result) ? result : result.data;
    }

    async getAppointmentsByDate(date: string): Promise<any[]> {
        const result = await this.getAll(`/appointments/date/${date}`);
        return Array.isArray(result) ? result : result.data;
    }

    async getDoctorAvailability(doctorId: string, date: string): Promise<any> {
        return this.getById('/doctors', `${doctorId}/availability?date=${date}`);
    }

    async getLabTestResults(testId: string): Promise<any> {
        return this.getById('/lab-tests', `${testId}/results`);
    }

    async generateBill(patientId: string, items: any[]): Promise<any> {
        return this.create('/billing', { patientId, items });
    }

    async updateInventoryStock(itemId: string, quantity: number): Promise<any> {
        return this.update('/inventory', itemId, { quantity });
    }

    async sendNotification(notification: any): Promise<any> {
        return this.create('/notifications', notification);
    }

    // Bulk operations
    async bulkCreate<T>(endpoint: string, data: Omit<T, 'id'>[]): Promise<T[]> {
        this.ensureInitialized();
        this.ensureOnline();

        try {
            const response = await httpService.post<T[]>(`${endpoint}/bulk`, { data });

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error(response.error || 'Failed to save bulk data to server');
        } catch (error) {
            console.error(`Bulk create failed for ${endpoint}:`, error);
            throw new Error('Failed to save bulk data to server. Please check your connection and try again.');
        }
    }

    async bulkUpdate<T>(endpoint: string, updates: { id: string | number; data: Partial<T> }[]): Promise<T[]> {
        this.ensureInitialized();
        this.ensureOnline();

        try {
            const response = await httpService.put<T[]>(`${endpoint}/bulk`, { updates });

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error(response.error || 'Failed to update bulk data on server');
        } catch (error) {
            console.error(`Bulk update failed for ${endpoint}:`, error);
            throw new Error('Failed to update bulk data on server. Please check your connection and try again.');
        }
    }

    async bulkDelete(endpoint: string, ids: (string | number)[]): Promise<void> {
        this.ensureInitialized();
        this.ensureOnline();

        try {
            const response = await httpService.post(`${endpoint}/bulk-delete`, { ids });

            if (!response.success) {
                throw new Error(response.error || 'Failed to delete bulk data from server');
            }
        } catch (error) {
            console.error(`Bulk delete failed for ${endpoint}:`, error);
            throw new Error('Failed to delete bulk data from server. Please check your connection and try again.');
        }
    }

    // Utility methods
    private ensureInitialized(): void {
        if (!this.initialized) {
            throw new Error('API client not initialized. Please wait for initialization to complete.');
        }
    }

    private ensureOnline(): void {
        if (!navigator.onLine) {
            throw new Error('Internet connection is required. Please check your connection and try again.');
        }
    }

    isInitialized(): boolean {
        return this.initialized;
    }

    getConfig(): Required<ApiClientConfig> {
        return { ...this.config };
    }
}

// Export the singleton instance
export const apiClient = RobustApiClient.getInstance();

// Export the class for custom instances if needed
export { RobustApiClient };

// Backward compatibility exports
export const db = apiClient; // For existing code that uses `db`
