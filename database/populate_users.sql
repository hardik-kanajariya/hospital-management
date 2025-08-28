-- SQL Script to create and populate users for MedCare Rural Hospital Management System
-- This script aligns with the demo accounts in LoginForm.tsx

USE medcare_rural;

-- First, update the users table to match current role types
ALTER TABLE users MODIFY COLUMN role ENUM(
    'super_admin', 
    'doctor', 
    'billing_manager', 
    'nurse', 
    'lab_technician', 
    'pharmacist', 
    'receptionist', 
    'medical_store_manager'
) NOT NULL;

-- Clear existing users (optional - remove this line if you want to keep existing data)
-- DELETE FROM users;

-- Insert demo users with hashed passwords
-- Note: In production, use proper password hashing (bcrypt, etc.)
-- For demo purposes, this uses a simple hash representation

INSERT INTO users (id, email, password_hash, name, role, permissions, is_active, created_at) VALUES 

-- Super Admin
(
    UUID(), 
    'admin@medcare.com', 
    '$2b$10$rQ8Kv/1.kQ8Kv1kQ8Kv1.eO7J3J3J3J3J3J3J3J3J3J3J3J3J3J3J3', -- hashed 'admin123'
    'System Administrator', 
    'super_admin',
    JSON_OBJECT(
        'modules', JSON_ARRAY('*'),
        'actions', JSON_ARRAY('create', 'read', 'update', 'delete')
    ),
    TRUE,
    NOW()
),

-- Doctor
(
    UUID(), 
    'dr.sharma@medcare.com', 
    '$2b$10$rQ8Kv/1.kQ8Kv1kQ8Kv1.eO7J3J3J3J3J3J3J3J3J3J3J3J3J3J3J3', -- hashed 'admin123'
    'Dr. Rajesh Sharma', 
    'doctor',
    JSON_OBJECT(
        'modules', JSON_ARRAY(
            JSON_OBJECT('module', 'dashboard', 'actions', JSON_ARRAY('read')),
            JSON_OBJECT('module', 'patients', 'actions', JSON_ARRAY('create', 'read', 'update')),
            JSON_OBJECT('module', 'appointments', 'actions', JSON_ARRAY('create', 'read', 'update')),
            JSON_OBJECT('module', 'medical_records', 'actions', JSON_ARRAY('create', 'read', 'update')),
            JSON_OBJECT('module', 'doctors', 'actions', JSON_ARRAY('read', 'update')),
            JSON_OBJECT('module', 'prescriptions', 'actions', JSON_ARRAY('create', 'read', 'update')),
            JSON_OBJECT('module', 'lab_tests', 'actions', JSON_ARRAY('create', 'read')),
            JSON_OBJECT('module', 'beds', 'actions', JSON_ARRAY('read', 'update')),
            JSON_OBJECT('module', 'billing', 'actions', JSON_ARRAY('read')),
            JSON_OBJECT('module', 'notifications', 'actions', JSON_ARRAY('create', 'read'))
        )
    ),
    TRUE,
    NOW()
),

-- Billing Manager
(
    UUID(), 
    'billing@medcare.com', 
    '$2b$10$rQ8Kv/1.kQ8Kv1kQ8Kv1.eO7J3J3J3J3J3J3J3J3J3J3J3J3J3J3J3', -- hashed 'admin123'
    'Priya Billing Manager', 
    'billing_manager',
    JSON_OBJECT(
        'modules', JSON_ARRAY(
            JSON_OBJECT('module', 'dashboard', 'actions', JSON_ARRAY('read')),
            JSON_OBJECT('module', 'billing', 'actions', JSON_ARRAY('create', 'read', 'update', 'delete')),
            JSON_OBJECT('module', 'patients', 'actions', JSON_ARRAY('read', 'update')),
            JSON_OBJECT('module', 'appointments', 'actions', JSON_ARRAY('read')),
            JSON_OBJECT('module', 'insurance', 'actions', JSON_ARRAY('create', 'read', 'update')),
            JSON_OBJECT('module', 'reports', 'actions', JSON_ARRAY('read')),
            JSON_OBJECT('module', 'notifications', 'actions', JSON_ARRAY('create', 'read'))
        )
    ),
    TRUE,
    NOW()
),

-- Nurse
(
    UUID(), 
    'nurse@medcare.com', 
    '$2b$10$rQ8Kv/1.kQ8Kv1kQ8Kv1.eO7J3J3J3J3J3J3J3J3J3J3J3J3J3J3J3', -- hashed 'admin123'
    'Sister Meera Nurse', 
    'nurse',
    JSON_OBJECT(
        'modules', JSON_ARRAY(
            JSON_OBJECT('module', 'dashboard', 'actions', JSON_ARRAY('read')),
            JSON_OBJECT('module', 'patients', 'actions', JSON_ARRAY('create', 'read', 'update')),
            JSON_OBJECT('module', 'appointments', 'actions', JSON_ARRAY('read', 'update')),
            JSON_OBJECT('module', 'medical_records', 'actions', JSON_ARRAY('read', 'update')),
            JSON_OBJECT('module', 'beds', 'actions', JSON_ARRAY('read', 'update')),
            JSON_OBJECT('module', 'vital_signs', 'actions', JSON_ARRAY('create', 'read', 'update')),
            JSON_OBJECT('module', 'notifications', 'actions', JSON_ARRAY('read'))
        )
    ),
    TRUE,
    NOW()
),

-- Lab Technician
(
    UUID(), 
    'lab@medcare.com', 
    '$2b$10$rQ8Kv/1.kQ8Kv1kQ8Kv1.eO7J3J3J3J3J3J3J3J3J3J3J3J3J3J3J3', -- hashed 'admin123'
    'Ramesh Lab Technician', 
    'lab_technician',
    JSON_OBJECT(
        'modules', JSON_ARRAY(
            JSON_OBJECT('module', 'dashboard', 'actions', JSON_ARRAY('read')),
            JSON_OBJECT('module', 'lab_tests', 'actions', JSON_ARRAY('create', 'read', 'update')),
            JSON_OBJECT('module', 'patients', 'actions', JSON_ARRAY('read')),
            JSON_OBJECT('module', 'lab_results', 'actions', JSON_ARRAY('create', 'read', 'update')),
            JSON_OBJECT('module', 'notifications', 'actions', JSON_ARRAY('create', 'read'))
        )
    ),
    TRUE,
    NOW()
),

-- Pharmacist
(
    UUID(), 
    'pharmacy@medcare.com', 
    '$2b$10$rQ8Kv/1.kQ8Kv1kQ8Kv1.eO7J3J3J3J3J3J3J3J3J3J3J3J3J3J3J3', -- hashed 'admin123'
    'Sunita Pharmacist', 
    'pharmacist',
    JSON_OBJECT(
        'modules', JSON_ARRAY(
            JSON_OBJECT('module', 'dashboard', 'actions', JSON_ARRAY('read')),
            JSON_OBJECT('module', 'inventory', 'actions', JSON_ARRAY('create', 'read', 'update')),
            JSON_OBJECT('module', 'prescriptions', 'actions', JSON_ARRAY('read', 'update')),
            JSON_OBJECT('module', 'patients', 'actions', JSON_ARRAY('read')),
            JSON_OBJECT('module', 'medical_store', 'actions', JSON_ARRAY('create', 'read', 'update', 'delete')),
            JSON_OBJECT('module', 'notifications', 'actions', JSON_ARRAY('read'))
        )
    ),
    TRUE,
    NOW()
),

-- Medical Store Manager
(
    UUID(), 
    'store@medcare.com', 
    '$2b$10$rQ8Kv/1.kQ8Kv1kQ8Kv1.eO7J3J3J3J3J3J3J3J3J3J3J3J3J3J3J3', -- hashed 'admin123'
    'Amit Store Manager', 
    'medical_store_manager',
    JSON_OBJECT(
        'modules', JSON_ARRAY(
            JSON_OBJECT('module', 'dashboard', 'actions', JSON_ARRAY('read')),
            JSON_OBJECT('module', 'inventory', 'actions', JSON_ARRAY('create', 'read', 'update', 'delete')),
            JSON_OBJECT('module', 'medical_store', 'actions', JSON_ARRAY('create', 'read', 'update', 'delete')),
            JSON_OBJECT('module', 'suppliers', 'actions', JSON_ARRAY('create', 'read', 'update')),
            JSON_OBJECT('module', 'purchases', 'actions', JSON_ARRAY('create', 'read', 'update')),
            JSON_OBJECT('module', 'notifications', 'actions', JSON_ARRAY('read'))
        )
    ),
    TRUE,
    NOW()
),

-- Receptionist
(
    UUID(), 
    'reception@medcare.com', 
    '$2b$10$rQ8Kv/1.kQ8Kv1kQ8Kv1.eO7J3J3J3J3J3J3J3J3J3J3J3J3J3J3J3', -- hashed 'admin123'
    'Kavita Receptionist', 
    'receptionist',
    JSON_OBJECT(
        'modules', JSON_ARRAY(
            JSON_OBJECT('module', 'dashboard', 'actions', JSON_ARRAY('read')),
            JSON_OBJECT('module', 'patients', 'actions', JSON_ARRAY('create', 'read', 'update')),
            JSON_OBJECT('module', 'appointments', 'actions', JSON_ARRAY('create', 'read', 'update')),
            JSON_OBJECT('module', 'billing', 'actions', JSON_ARRAY('read')),
            JSON_OBJECT('module', 'notifications', 'actions', JSON_ARRAY('create', 'read'))
        )
    ),
    TRUE,
    NOW()
);

-- Verify the inserted users
SELECT 
    id,
    email,
    name,
    role,
    is_active,
    created_at
FROM users 
ORDER BY role, name;

-- Show permissions for each role (formatted)
SELECT 
    role,
    name,
    email,
    JSON_PRETTY(permissions) as formatted_permissions
FROM users 
ORDER BY 
    CASE role
        WHEN 'super_admin' THEN 1
        WHEN 'doctor' THEN 2
        WHEN 'billing_manager' THEN 3
        WHEN 'nurse' THEN 4
        WHEN 'lab_technician' THEN 5
        WHEN 'pharmacist' THEN 6
        WHEN 'medical_store_manager' THEN 7
        WHEN 'receptionist' THEN 8
    END;
