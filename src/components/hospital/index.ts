// Hospital Management System - Main Module Exports

// Patient Management
export * from './patients'

// Appointments
export * from './appointments'

// Doctors
export * from './doctors'

// Medical Records
export * from './medical'

// Billing
export * from './billing'

// Laboratory
export * from './laboratory'

// Inventory
export * from './inventory'

// Facilities
export * from './facilities'

// Dashboard
export * from './dashboard'

// Notifications
export * from './notifications'

// Administration
export * from './administration'

// Legacy exports for backward compatibility (can be removed later)
export { default as PatientCreate } from './patients/CreatePatient'
export { default as PatientEdit } from './patients/EditPatient'
export { default as PatientList } from './patients/PatientList'
export { default as PatientProfile } from './patients/PatientProfile'
export { default as PatientSearch } from './patients/PatientSearch'
export { default as AppointmentScheduling } from './appointments/AppointmentScheduling'
export { default as DoctorSchedule } from './doctors/DoctorSchedule'
export { default as MedicalRecords } from './medical/MedicalRecords'
export { default as BillingSystem } from './billing/BillingSystem'
export { default as EnhancedBillingSystem } from './billing/EnhancedBillingSystem'
export { default as LabManagement } from './laboratory/LabManagement'
export { default as InventoryManagement } from './inventory/InventoryManagement'
export { default as BedManagement } from './facilities/BedManagement'
export { default as Dashboard } from './dashboard/Dashboard'
export { default as NotificationCenter } from './notifications/NotificationCenter'
export { default as RoleManagement } from './administration/RoleManagement'
export { default as SuperAdminDashboard } from './administration/SuperAdminDashboard'
export { default as SuperAdminUserManagement } from './administration/SuperAdminUserManagement'
export { default as SystemSettings } from './administration/SystemSettingsPage'
