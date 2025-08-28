// Application configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
export const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'medcare_rural',
  port: parseInt(process.env.DB_PORT || '3306'),
};

export const APP_CONFIG = {
  name: 'MedCare Rural',
  version: '1.0.0',
  description: 'Complete Hospital Management System for Rural Healthcare',
  offlineSupport: true,
  syncInterval: 5000, // 5 seconds
};