/**
 * API Endpoints Configuration
 * This file defines all the backend API endpoints that the application will use
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    VERIFY: `${API_BASE_URL}/auth/verify`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`
  },

  // Patient management endpoints
  PATIENTS: {
    BASE: `${API_BASE_URL}/patients`,
    BY_ID: (id: string) => `${API_BASE_URL}/patients/${id}`,
    SEARCH: `${API_BASE_URL}/patients/search`,
    BULK_IMPORT: `${API_BASE_URL}/patients/bulk-import`,
    EXPORT: `${API_BASE_URL}/patients/export`,
    MEDICAL_HISTORY: (id: string) => `${API_BASE_URL}/patients/${id}/medical-history`,
    VACCINATIONS: (id: string) => `${API_BASE_URL}/patients/${id}/vaccinations`,
    ALLERGIES: (id: string) => `${API_BASE_URL}/patients/${id}/allergies`,
    CHRONIC_CONDITIONS: (id: string) => `${API_BASE_URL}/patients/${id}/chronic-conditions`
  },

  // Appointment management endpoints
  APPOINTMENTS: {
    BASE: `${API_BASE_URL}/appointments`,
    BY_ID: (id: string) => `${API_BASE_URL}/appointments/${id}`,
    BY_PATIENT: (patientId: string) => `${API_BASE_URL}/appointments/patient/${patientId}`,
    BY_DOCTOR: (doctorId: string) => `${API_BASE_URL}/appointments/doctor/${doctorId}`,
    BY_DATE: (date: string) => `${API_BASE_URL}/appointments/date/${date}`,
    SCHEDULE: `${API_BASE_URL}/appointments/schedule`,
    RESCHEDULE: (id: string) => `${API_BASE_URL}/appointments/${id}/reschedule`,
    CANCEL: (id: string) => `${API_BASE_URL}/appointments/${id}/cancel`,
    CONFIRM: (id: string) => `${API_BASE_URL}/appointments/${id}/confirm`,
    CHECK_IN: (id: string) => `${API_BASE_URL}/appointments/${id}/check-in`,
    REMINDERS: `${API_BASE_URL}/appointments/reminders`
  },

  // Doctor management endpoints
  DOCTORS: {
    BASE: `${API_BASE_URL}/doctors`,
    BY_ID: (id: string) => `${API_BASE_URL}/doctors/${id}`,
    AVAILABILITY: (id: string) => `${API_BASE_URL}/doctors/${id}/availability`,
    SCHEDULE: (id: string) => `${API_BASE_URL}/doctors/${id}/schedule`,
    SPECIALIZATIONS: `${API_BASE_URL}/doctors/specializations`,
    WORKING_HOURS: (id: string) => `${API_BASE_URL}/doctors/${id}/working-hours`,
    LEAVE_REQUESTS: (id: string) => `${API_BASE_URL}/doctors/${id}/leave-requests`,
    CONSULTATIONS: (id: string) => `${API_BASE_URL}/doctors/${id}/consultations`
  },

  // Medical records endpoints
  MEDICAL_RECORDS: {
    BASE: `${API_BASE_URL}/medical-records`,
    BY_ID: (id: string) => `${API_BASE_URL}/medical-records/${id}`,
    BY_PATIENT: (patientId: string) => `${API_BASE_URL}/medical-records/patient/${patientId}`,
    CONSULTATIONS: `${API_BASE_URL}/medical-records/consultations`,
    PRESCRIPTIONS: `${API_BASE_URL}/medical-records/prescriptions`,
    DIAGNOSES: `${API_BASE_URL}/medical-records/diagnoses`,
    VITAL_SIGNS: `${API_BASE_URL}/medical-records/vital-signs`,
    PROGRESS_NOTES: `${API_BASE_URL}/medical-records/progress-notes`,
    DISCHARGE_SUMMARY: `${API_BASE_URL}/medical-records/discharge-summary`
  },

  // Billing and invoicing endpoints
  BILLING: {
    BASE: `${API_BASE_URL}/billing`,
    INVOICES: `${API_BASE_URL}/billing/invoices`,
    BY_ID: (id: string) => `${API_BASE_URL}/billing/invoices/${id}`,
    BY_PATIENT: (patientId: string) => `${API_BASE_URL}/billing/invoices/patient/${patientId}`,
    PAYMENTS: `${API_BASE_URL}/billing/payments`,
    INSURANCE_CLAIMS: `${API_BASE_URL}/billing/insurance-claims`,
    FINANCIAL_REPORTS: `${API_BASE_URL}/billing/reports`,
    TAX_REPORTS: `${API_BASE_URL}/billing/tax-reports`,
    OUTSTANDING: `${API_BASE_URL}/billing/outstanding`,
    REVENUE_ANALYTICS: `${API_BASE_URL}/billing/analytics`
  },

  // Inventory management endpoints
  INVENTORY: {
    BASE: `${API_BASE_URL}/inventory`,
    ITEMS: `${API_BASE_URL}/inventory/items`,
    BY_ID: (id: string) => `${API_BASE_URL}/inventory/items/${id}`,
    CATEGORIES: `${API_BASE_URL}/inventory/categories`,
    SUPPLIERS: `${API_BASE_URL}/inventory/suppliers`,
    STOCK_MOVEMENTS: `${API_BASE_URL}/inventory/stock-movements`,
    LOW_STOCK: `${API_BASE_URL}/inventory/low-stock`,
    EXPIRED_ITEMS: `${API_BASE_URL}/inventory/expired`,
    PURCHASE_ORDERS: `${API_BASE_URL}/inventory/purchase-orders`,
    STOCK_REPORTS: `${API_BASE_URL}/inventory/reports`
  },

  // Laboratory management endpoints
  LAB_TESTS: {
    BASE: `${API_BASE_URL}/lab-tests`,
    BY_ID: (id: string) => `${API_BASE_URL}/lab-tests/${id}`,
    ORDER: `${API_BASE_URL}/lab-tests/order`,
    RESULTS: `${API_BASE_URL}/lab-tests/results`,
    BY_PATIENT: (patientId: string) => `${API_BASE_URL}/lab-tests/patient/${patientId}`,
    PENDING: `${API_BASE_URL}/lab-tests/pending`,
    COMPLETED: `${API_BASE_URL}/lab-tests/completed`,
    REPORTS: `${API_BASE_URL}/lab-tests/reports`,
    TEST_TYPES: `${API_BASE_URL}/lab-tests/test-types`,
    REFERENCE_VALUES: `${API_BASE_URL}/lab-tests/reference-values`
  },

  // Bed management endpoints
  BEDS: {
    BASE: `${API_BASE_URL}/beds`,
    BY_ID: (id: string) => `${API_BASE_URL}/beds/${id}`,
    AVAILABILITY: `${API_BASE_URL}/beds/availability`,
    OCCUPANCY: `${API_BASE_URL}/beds/occupancy`,
    ROOMS: `${API_BASE_URL}/beds/rooms`,
    WARDS: `${API_BASE_URL}/beds/wards`,
    ADMISSIONS: `${API_BASE_URL}/beds/admissions`,
    DISCHARGES: `${API_BASE_URL}/beds/discharges`,
    TRANSFERS: `${API_BASE_URL}/beds/transfers`,
    OCCUPANCY_REPORTS: `${API_BASE_URL}/beds/occupancy-reports`
  },

  // User management endpoints
  USERS: {
    BASE: `${API_BASE_URL}/users`,
    BY_ID: (id: string) => `${API_BASE_URL}/users/${id}`,
    PROFILE: `${API_BASE_URL}/users/profile`,
    ROLES: `${API_BASE_URL}/users/roles`,
    PERMISSIONS: `${API_BASE_URL}/users/permissions`,
    STAFF: `${API_BASE_URL}/users/staff`,
    DEPARTMENTS: `${API_BASE_URL}/users/departments`,
    ACTIVITY_LOG: `${API_BASE_URL}/users/activity-log`
  },

  // Notification endpoints
  NOTIFICATIONS: {
    BASE: `${API_BASE_URL}/notifications`,
    BY_ID: (id: string) => `${API_BASE_URL}/notifications/${id}`,
    UNREAD: `${API_BASE_URL}/notifications/unread`,
    MARK_READ: (id: string) => `${API_BASE_URL}/notifications/${id}/mark-read`,
    MARK_ALL_READ: `${API_BASE_URL}/notifications/mark-all-read`,
    SMS: `${API_BASE_URL}/notifications/sms`,
    EMAIL: `${API_BASE_URL}/notifications/email`,
    PREFERENCES: `${API_BASE_URL}/notifications/preferences`
  },

  // Reports and analytics endpoints
  REPORTS: {
    BASE: `${API_BASE_URL}/reports`,
    PATIENT_STATISTICS: `${API_BASE_URL}/reports/patient-statistics`,
    APPOINTMENT_ANALYTICS: `${API_BASE_URL}/reports/appointment-analytics`,
    REVENUE_REPORTS: `${API_BASE_URL}/reports/revenue`,
    INVENTORY_REPORTS: `${API_BASE_URL}/reports/inventory`,
    DOCTOR_PERFORMANCE: `${API_BASE_URL}/reports/doctor-performance`,
    HOSPITAL_METRICS: `${API_BASE_URL}/reports/hospital-metrics`,
    COMPLIANCE_REPORTS: `${API_BASE_URL}/reports/compliance`,
    CUSTOM_REPORTS: `${API_BASE_URL}/reports/custom`
  },

  // Hospital configuration endpoints
  HOSPITAL: {
    SETTINGS: `${API_BASE_URL}/hospital/settings`,
    DEPARTMENTS: `${API_BASE_URL}/hospital/departments`,
    SPECIALIZATIONS: `${API_BASE_URL}/hospital/specializations`,
    SERVICES: `${API_BASE_URL}/hospital/services`,
    INSURANCE_PROVIDERS: `${API_BASE_URL}/hospital/insurance-providers`,
    TREATMENT_PACKAGES: `${API_BASE_URL}/hospital/treatment-packages`,
    BRANCH_LOCATIONS: `${API_BASE_URL}/hospital/branches`
  },

  // System endpoints
  SYSTEM: {
    HEALTH: `${API_BASE_URL}/system/health`,
    VERSION: `${API_BASE_URL}/system/version`,
    BACKUP: `${API_BASE_URL}/system/backup`,
    RESTORE: `${API_BASE_URL}/system/restore`,
    SYNC_STATUS: `${API_BASE_URL}/system/sync-status`,
    LOGS: `${API_BASE_URL}/system/logs`,
    AUDIT_TRAIL: `${API_BASE_URL}/system/audit-trail`
  }
};

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

// Request timeout configurations
export const TIMEOUT_CONFIG = {
  SHORT: 5000,      // 5 seconds for quick operations
  MEDIUM: 15000,    // 15 seconds for normal operations  
  LONG: 30000,      // 30 seconds for heavy operations
  SYNC: 60000       // 60 seconds for sync operations
} as const;