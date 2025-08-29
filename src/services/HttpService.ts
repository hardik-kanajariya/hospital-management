/**
 * HTTP Service for Hospital Management System
 * Handles all API communication with proper error handling and retry logic
 */

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface AuthResponse {
    token: {
        type: string,
        token: string;
        expiresAt: string;
    };
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
        permissions: string[];
    };
    expires_at: string;
}

export interface RequestConfig {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}

class HttpService {
    private baseUrl: string;
    private token: string | null = null;
    private defaultTimeout = 30000; // 30 seconds
    private defaultRetries = 3;
    private defaultRetryDelay = 1000; // 1 second

    constructor() {
        this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
        this.token = localStorage.getItem('auth_token');
    }

    /**
     * Private method to make HTTP requests with retry logic
     */
    private async makeRequest<T>(
        method: string,
        endpoint: string,
        data?: any,
        config: RequestConfig = {}
    ): Promise<ApiResponse<T>> {
        const {
            timeout = this.defaultTimeout,
            retries = this.defaultRetries,
            retryDelay = this.defaultRetryDelay
        } = config;

        const url = `${this.baseUrl}${endpoint}`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const requestConfig: RequestInit = {
            method,
            headers,
            body: data ? JSON.stringify(data) : undefined,
        };

        // Add timeout using AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        requestConfig.signal = controller.signal;

        let lastError: Error;

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url, requestConfig);
                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorText = await response.text();
                    let errorMessage: string;

                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
                    } catch {
                        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                    }

                    throw new Error(errorMessage);
                }

                const responseData = await response.json();
                return responseData;
            } catch (error) {
                lastError = error as Error;

                // If it's the last attempt or a non-retryable error, throw
                if (attempt === retries || error instanceof TypeError || error.name === 'AbortError') {
                    break;
                }

                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
            }
        }

        clearTimeout(timeoutId);
        throw new Error(`Request failed after ${retries} attempts: ${lastError!.message}`);
    }

    /**
     * GET request
     */
    async get<T = any>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.makeRequest<T>('GET', endpoint, undefined, config);
    }

    /**
     * POST request
     */
    async post<T = any>(endpoint: string, data: any, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.makeRequest<T>('POST', endpoint, data, config);
    }

    /**
     * PUT request
     */
    async put<T = any>(endpoint: string, data: any, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.makeRequest<T>('PUT', endpoint, data, config);
    }

    /**
     * PATCH request
     */
    async patch<T = any>(endpoint: string, data: any, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.makeRequest<T>('PATCH', endpoint, data, config);
    }

    /**
     * DELETE request
     */
    async delete<T = any>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.makeRequest<T>('DELETE', endpoint, undefined, config);
    }

    /**
     * Set authentication token
     */
    setToken(token: string): void {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    /**
     * Get current authentication token
     */
    getToken(): string | null {
        return this.token;
    }

    /**
     * Clear authentication token
     */
    clearToken(): void {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.token;
    }

    /**
     * Set base URL for API requests
     */
    setBaseUrl(url: string): void {
        this.baseUrl = url;
    }

    /**
     * Get current base URL
     */
    getBaseUrl(): string {
        return this.baseUrl;
    }

    /**
     * Authenticate user
     */
    async authenticate(email: string, password: string): Promise<AuthResponse> {
        const response = await this.post<AuthResponse>('/auth/login', { email, password });

        if (response.success && response.data?.token) {
            this.setToken(response.data.token.token);
            return response.data;
        }

        throw new Error(response.error || 'Authentication failed');
    }

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        try {
            await this.post('/auth/logout', {});
        } catch (error) {
            console.warn('Logout request failed:', error);
        } finally {
            this.clearToken();
        }
    }

    /**
     * Refresh authentication token
     */
    async refreshToken(): Promise<AuthResponse> {
        const response = await this.post<AuthResponse>('/auth/refresh', {});

        if (response.success && response.data?.token) {
            this.setToken(response.data.token.token);
            return response.data;
        }

        throw new Error(response.error || 'Token refresh failed');
    }

    /**
     * Check server health/connectivity
     */
    async checkHealth(): Promise<boolean> {
        try {
            const response = await this.get('/health', { timeout: 5000, retries: 1 });
            return response.success;
        } catch {
            return false;
        }
    }
}

// Export singleton instance
export const httpService = new HttpService();
export default HttpService;
