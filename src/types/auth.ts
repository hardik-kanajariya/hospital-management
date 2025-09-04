// Authentication and authorization types
export interface User {
  id: string;
  email: string;
  name: string;
  role?: Role; // Now optional and object-based
  roleId?: string;
  department?: string;
  phone?: string;
  employeeId?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions: Permission[];
  
  // Patient portal specific properties
  avatar?: string;
  patientId?: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  accessLevel: number;
  isActive: boolean;
  isSystemRole: boolean;
  permissions?: Permission[];
  users?: User[];
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  module: string;
  description?: string;
  isActive: boolean;
  actions?: ('create' | 'read' | 'update' | 'delete')[];
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

// Legacy types for backward compatibility
export type UserRole =
  | 'super_admin'
  | 'doctor'
  | 'billing_manager'
  | 'nurse'
  | 'lab_technician'
  | 'pharmacist'
  | 'receptionist'
  | 'medical_store_manager';

export interface LegacyPermission {
  module: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface RoleConfig {
  role: UserRole;
  displayName: string;
  permissions: LegacyPermission[];
  accessLevel: number;
}

// Default role configurations
export const ROLE_CONFIGS: RoleConfig[] = [
  {
    role: 'super_admin',
    displayName: 'Super Administrator',
    accessLevel: 10,
    permissions: [
      { module: '*', actions: ['create', 'read', 'update', 'delete'] }
    ]
  },
  {
    role: 'doctor',
    displayName: 'Doctor',
    accessLevel: 8,
    permissions: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'patients', actions: ['create', 'read', 'update'] },
      { module: 'appointments', actions: ['create', 'read', 'update'] },
      { module: 'medical_records', actions: ['create', 'read', 'update'] },
      { module: 'doctors', actions: ['read', 'update'] },
      { module: 'prescriptions', actions: ['create', 'read', 'update'] },
      { module: 'lab_tests', actions: ['create', 'read'] },
      { module: 'beds', actions: ['read', 'update'] },
      { module: 'billing', actions: ['read'] },
      { module: 'notifications', actions: ['create', 'read'] }
    ]
  },
  {
    role: 'billing_manager',
    displayName: 'Billing Manager',
    accessLevel: 6,
    permissions: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'billing', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'patients', actions: ['read', 'update'] },
      { module: 'appointments', actions: ['read'] },
      { module: 'insurance', actions: ['create', 'read', 'update'] },
      { module: 'reports', actions: ['read'] },
      { module: 'notifications', actions: ['create', 'read'] }
    ]
  },
  {
    role: 'nurse',
    displayName: 'Nurse',
    accessLevel: 5,
    permissions: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'patients', actions: ['create', 'read', 'update'] },
      { module: 'appointments', actions: ['read', 'update'] },
      { module: 'medical_records', actions: ['read', 'update'] },
      { module: 'beds', actions: ['read', 'update'] },
      { module: 'vital_signs', actions: ['create', 'read', 'update'] },
      { module: 'notifications', actions: ['read'] }
    ]
  },
  {
    role: 'lab_technician',
    displayName: 'Lab Technician',
    accessLevel: 4,
    permissions: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'lab_tests', actions: ['create', 'read', 'update'] },
      { module: 'patients', actions: ['read'] },
      { module: 'lab_results', actions: ['create', 'read', 'update'] },
      { module: 'notifications', actions: ['create', 'read'] }
    ]
  },
  {
    role: 'pharmacist',
    displayName: 'Pharmacist',
    accessLevel: 4,
    permissions: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'inventory', actions: ['create', 'read', 'update'] },
      { module: 'prescriptions', actions: ['read', 'update'] },
      { module: 'patients', actions: ['read'] },
      { module: 'medical_store', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'notifications', actions: ['read'] }
    ]
  },
  {
    role: 'medical_store_manager',
    displayName: 'Medical Store Manager',
    accessLevel: 5,
    permissions: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'inventory', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'medical_store', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'suppliers', actions: ['create', 'read', 'update'] },
      { module: 'purchases', actions: ['create', 'read', 'update'] },
      { module: 'notifications', actions: ['read'] }
    ]
  },
  {
    role: 'receptionist',
    displayName: 'Receptionist',
    accessLevel: 3,
    permissions: [
      { module: 'dashboard', actions: ['read'] },
      { module: 'patients', actions: ['create', 'read', 'update'] },
      { module: 'appointments', actions: ['create', 'read', 'update'] },
      { module: 'billing', actions: ['read'] },
      { module: 'notifications', actions: ['create', 'read'] }
    ]
  }
];