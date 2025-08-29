/**
 * API Client for Hospital Management System
 * Provides simple HTTP-based communication with the backend server
 */

import { httpService, ApiResponse } from '@/services/HttpService';

export class HospitalApiClient {
  private static instance: HospitalApiClient;
  private initialized = false;

  private constructor() { }

  static getInstance(): HospitalApiClient {
    if (!HospitalApiClient.instance) {
      HospitalApiClient.instance = new HospitalApiClient();
    }
    return HospitalApiClient.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Check if server is available
      const isHealthy = await httpService.checkHealth();

      if (!isHealthy) {
        console.warn('Server health check failed - continuing anyway');
      }

      this.initialized = true;
      console.log('Hospital API client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize API client:', error);
      // Don't throw - allow the app to continue
      this.initialized = true;
    }
  }

  async getAll(tableName: string): Promise<any[]> {
    if (!this.initialized) {
      throw new Error('API client not initialized. Please wait for initialization to complete.');
    }

    if (!navigator.onLine) {
      throw new Error('Internet connection is required. Please check your connection and try again.');
    }

    try {
      const response = await httpService.get(`/${tableName}`);

      if (response.success && response.data) {
        return Array.isArray(response.data) ? response.data : [];
      }

      throw new Error(response.error || 'Failed to fetch data from server');
    } catch (error) {
      console.error('API call failed:', error);
      throw new Error('Failed to fetch data from server. Please check your connection and try again.');
    }
  }

  async add(tableName: string, data: any): Promise<number> {
    if (!this.initialized) {
      throw new Error('API client not initialized. Please wait for initialization to complete.');
    }

    if (!navigator.onLine) {
      throw new Error('Internet connection is required to add data. Please check your connection and try again.');
    }

    try {
      const response = await httpService.post(`/${tableName}`, data);

      if (response.success) {
        return response.data?.id || Date.now();
      }

      throw new Error(response.error || 'Failed to save data to server');
    } catch (error) {
      console.error('Failed to add data to server:', error);
      throw new Error('Failed to save data to server. Please check your connection and try again.');
    }
  }

  async update(tableName: string, id: number, data: any): Promise<void> {
    if (!this.initialized) {
      throw new Error('API client not initialized. Please wait for initialization to complete.');
    }

    if (!navigator.onLine) {
      throw new Error('Internet connection is required to update data. Please check your connection and try again.');
    }

    try {
      const response = await httpService.put(`/${tableName}/${id}`, data);

      if (!response.success) {
        throw new Error(response.error || 'Failed to update data on server');
      }
    } catch (error) {
      console.error('Failed to update data on server:', error);
      throw new Error('Failed to update data on server. Please check your connection and try again.');
    }
  }

  async delete(tableName: string, id: number): Promise<void> {
    if (!this.initialized) {
      throw new Error('API client not initialized. Please wait for initialization to complete.');
    }

    if (!navigator.onLine) {
      throw new Error('Internet connection is required to delete data. Please check your connection and try again.');
    }

    try {
      const response = await httpService.delete(`/${tableName}/${id}`);

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete data from server');
      }
    } catch (error) {
      console.error('Failed to delete data from server:', error);
      throw new Error('Failed to delete data from server. Please check your connection and try again.');
    }
  }

  async authenticate(email: string, password: string): Promise<any> {
    if (!navigator.onLine) {
      throw new Error('Authentication requires internet connection');
    }

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

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export the singleton instance
export const db = HospitalApiClient.getInstance();