// Application configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const APP_CONFIG = {
  name: 'MedCare Rural',
  version: '1.0.0',
  description: 'Complete Hospital Management System for Rural Healthcare',
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
};