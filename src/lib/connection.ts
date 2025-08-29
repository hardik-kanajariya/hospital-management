/**
 * Simple connection manager for HTTP-only communication
 * Monitors internet connectivity and server availability
 */

import { httpService } from '@/services/HttpService';
import { toast } from 'sonner';

interface ConnectionStats {
  isOnline: boolean;
  isConnected: boolean;
  lastCheck: string;
  serverAvailable: boolean;
}

class ConnectionManager {
  private isOnline: boolean = navigator.onLine;
  private serverAvailable: boolean = false;
  private lastCheck: Date = new Date();

  constructor() {
    this.setupEventListeners();
    this.checkServerHealth();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Internet connection restored');
      this.checkServerHealth();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.serverAvailable = false;
      console.log('Internet connection lost');
    });
  }

  private async checkServerHealth() {
    try {
      this.serverAvailable = await httpService.checkHealth();
      this.lastCheck = new Date();

      if (this.serverAvailable) {
        console.log('Server is healthy and accessible');
      } else {
        console.warn('Server health check failed');
      }
    } catch (error) {
      this.serverAvailable = false;
      this.lastCheck = new Date();
      console.error('Server health check error:', error);
    }
  }

  // Public methods
  isConnected(): boolean {
    return this.isOnline && this.serverAvailable;
  }

  isInternetAvailable(): boolean {
    return this.isOnline;
  }

  isServerAvailable(): boolean {
    return this.serverAvailable;
  }

  async forceCheck(): Promise<boolean> {
    if (!this.isOnline) {
      throw new Error('No internet connection available');
    }

    await this.checkServerHealth();
    return this.serverAvailable;
  }

  async getStats(): Promise<ConnectionStats> {
    return {
      isOnline: this.isOnline,
      isConnected: this.isConnected(),
      lastCheck: this.lastCheck.toISOString(),
      serverAvailable: this.serverAvailable
    };
  }

  // Legacy method for compatibility
  async forcSync(): Promise<void> {
    // In online-only mode, just check server health
    await this.forceCheck();
  }
}

export const connectionManager = new ConnectionManager();
export default ConnectionManager;
