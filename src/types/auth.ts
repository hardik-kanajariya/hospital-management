// Authentication and authorization types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions: Permission[];
}

export type UserRole = 
  | 'super_admin'
  | 'doctor'
  | 'billing_manager'
  | 'nurse'
  | 'lab_technician'
  | 'pharmacist'
  | 'receptionist'
  | 'medical_store_manager';

export interface Permission {
  module: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface RoleConfig {
  role: UserRole;
  displayName: string;
  permissions: Permission[];
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
      { module: 'patients', actions: ['create', 'read', 'update'] },
      { module: 'appointments', actions: ['create', 'read', 'update'] },
      { module: 'medical_records', actions: ['create', 'read', 'update'] },
      { module: 'prescriptions', actions: ['create', 'read', 'update'] },
      { module: 'lab_tests', actions: ['create', 'read'] },
      { module: 'billing', actions: ['read'] }
    ]
  },
  {
    role: 'billing_manager',
    displayName: 'Billing Manager',
    accessLevel: 6,
    permissions: [
      { module: 'billing', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'patients', actions: ['read', 'update'] },
      { module: 'appointments', actions: ['read'] },
      { module: 'insurance', actions: ['create', 'read', 'update'] },
      { module: 'reports', actions: ['read'] }
    ]
  },
  {
    role: 'nurse',
    displayName: 'Nurse',
    accessLevel: 5,
    permissions: [
      { module: 'patients', actions: ['create', 'read', 'update'] },
      { module: 'appointments', actions: ['read', 'update'] },
      { module: 'medical_records', actions: ['read', 'update'] },
      { module: 'beds', actions: ['read', 'update'] },
      { module: 'vital_signs', actions: ['create', 'read', 'update'] }
    ]
  },
  {
    role: 'lab_technician',
    displayName: 'Lab Technician',
    accessLevel: 4,
    permissions: [
      { module: 'lab_tests', actions: ['create', 'read', 'update'] },
      { module: 'patients', actions: ['read'] },
      { module: 'lab_results', actions: ['create', 'read', 'update'] }
    ]
  },
  {
    role: 'pharmacist',
    displayName: 'Pharmacist',
    accessLevel: 4,
    permissions: [
      { module: 'inventory', actions: ['create', 'read', 'update'] },
      { module: 'prescriptions', actions: ['read', 'update'] },
      { module: 'patients', actions: ['read'] },
      { module: 'medical_store', actions: ['create', 'read', 'update', 'delete'] }
    ]
  },
  {
    role: 'medical_store_manager',
    displayName: 'Medical Store Manager',
    accessLevel: 5,
    permissions: [
      { module: 'inventory', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'medical_store', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'suppliers', actions: ['create', 'read', 'update'] },
      { module: 'purchases', actions: ['create', 'read', 'update'] }
    ]
  },
  {
    role: 'receptionist',
    displayName: 'Receptionist',
    accessLevel: 3,
    permissions: [
      { module: 'patients', actions: ['create', 'read', 'update'] },
      { module: 'appointments', actions: ['create', 'read', 'update'] },
      { module: 'billing', actions: ['read'] }
    ]
  }
];