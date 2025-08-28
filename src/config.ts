// Application configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
export const DB_CONFIG = {
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  user: import.meta.env.VITE_DB_USER || 'root',
  password: import.meta.env.VITE_DB_PASSWORD || '',
  database: import.meta.env.VITE_DB_NAME || 'medcare_rural',
  port: parseInt(import.meta.env.VITE_DB_PORT || '3306'),
};

export const APP_CONFIG = {
  name: 'MedCare Rural',
  version: '1.0.0',
  description: 'Complete Hospital Management System for Rural Healthcare',
  offlineSupport: true,
  syncInterval: 5000, // 5 seconds
  autoSync: import.meta.env.VITE_AUTO_SYNC !== 'false', // Can be disabled via environment variable
};