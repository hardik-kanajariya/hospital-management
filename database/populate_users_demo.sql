-- Development/Demo SQL Script for MedCare Users
-- WARNING: This uses plain text passwords - ONLY for development/demo purposes!
-- In production, always use proper password hashing (bcrypt, argon2, etc.)

USE medcare_rural;

-- Update the users table schema to match current role types
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

-- Clear existing demo users (optional)
DELETE FROM users WHERE email LIKE '%@medcare.com';

-- Insert demo users with simple password hash representation
-- Note: Using MD5 just for demo - DO NOT use in production!
INSERT INTO users (id, email, password_hash, name, role, is_active, created_at) VALUES 

-- Super Admin
(UUID(), 'admin@medcare.com', MD5('admin123'), 'System Administrator', 'super_admin', TRUE, NOW()),

-- Doctor  
(UUID(), 'dr.sharma@medcare.com', MD5('admin123'), 'Dr. Rajesh Sharma', 'doctor', TRUE, NOW()),

-- Billing Manager
(UUID(), 'billing@medcare.com', MD5('admin123'), 'Priya Billing Manager', 'billing_manager', TRUE, NOW()),

-- Nurse
(UUID(), 'nurse@medcare.com', MD5('admin123'), 'Sister Meera Nurse', 'nurse', TRUE, NOW()),

-- Lab Technician  
(UUID(), 'lab@medcare.com', MD5('admin123'), 'Ramesh Lab Technician', 'lab_technician', TRUE, NOW()),

-- Pharmacist
(UUID(), 'pharmacy@medcare.com', MD5('admin123'), 'Sunita Pharmacist', 'pharmacist', TRUE, NOW()),

-- Medical Store Manager
(UUID(), 'store@medcare.com', MD5('admin123'), 'Amit Store Manager', 'medical_store_manager', TRUE, NOW()),

-- Receptionist
(UUID(), 'reception@medcare.com', MD5('admin123'), 'Kavita Receptionist', 'receptionist', TRUE, NOW());

-- Verify the inserted users
SELECT 
    email,
    name, 
    role,
    is_active,
    created_at 
FROM users 
WHERE email LIKE '%@medcare.com'
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

-- Update permissions column with proper JSON structure for each role
UPDATE users SET permissions = JSON_OBJECT('modules', JSON_ARRAY(JSON_OBJECT('module', '*', 'actions', JSON_ARRAY('create', 'read', 'update', 'delete')))) WHERE role = 'super_admin';

UPDATE users SET permissions = JSON_OBJECT('modules', JSON_ARRAY(
    JSON_OBJECT('module', 'dashboard', 'actions', JSON_ARRAY('read')),
    JSON_OBJECT('module', 'patients', 'actions', JSON_ARRAY('create', 'read', 'update')),
    JSON_OBJECT('module', 'appointments', 'actions', JSON_ARRAY('create', 'read', 'update')),
    JSON_OBJECT('module', 'medical_records', 'actions', JSON_ARRAY('create', 'read', 'update')),
    JSON_OBJECT('module', 'doctors', 'actions', JSON_ARRAY('read', 'update')),
    JSON_OBJECT('module', 'lab_tests', 'actions', JSON_ARRAY('create', 'read')),
    JSON_OBJECT('module', 'beds', 'actions', JSON_ARRAY('read', 'update')),
    JSON_OBJECT('module', 'billing', 'actions', JSON_ARRAY('read')),
    JSON_OBJECT('module', 'notifications', 'actions', JSON_ARRAY('create', 'read'))
)) WHERE role = 'doctor';

UPDATE users SET permissions = JSON_OBJECT('modules', JSON_ARRAY(
    JSON_OBJECT('module', 'dashboard', 'actions', JSON_ARRAY('read')),
    JSON_OBJECT('module', 'billing', 'actions', JSON_ARRAY('create', 'read', 'update', 'delete')),
    JSON_OBJECT('module', 'patients', 'actions', JSON_ARRAY('read', 'update')),
    JSON_OBJECT('module', 'appointments', 'actions', JSON_ARRAY('read')),
    JSON_OBJECT('module', 'reports', 'actions', JSON_ARRAY('read')),
    JSON_OBJECT('module', 'notifications', 'actions', JSON_ARRAY('create', 'read'))
)) WHERE role = 'billing_manager';

UPDATE users SET permissions = JSON_OBJECT('modules', JSON_ARRAY(
    JSON_OBJECT('module', 'dashboard', 'actions', JSON_ARRAY('read')),
    JSON_OBJECT('module', 'patients', 'actions', JSON_ARRAY('create', 'read', 'update')),
    JSON_OBJECT('module', 'appointments', 'actions', JSON_ARRAY('read', 'update')),
    JSON_OBJECT('module', 'medical_records', 'actions', JSON_ARRAY('read', 'update')),
    JSON_OBJECT('module', 'beds', 'actions', JSON_ARRAY('read', 'update')),
    JSON_OBJECT('module', 'notifications', 'actions', JSON_ARRAY('read'))
)) WHERE role = 'nurse';

UPDATE users SET permissions = JSON_OBJECT('modules', JSON_ARRAY(
    JSON_OBJECT('module', 'dashboard', 'actions', JSON_ARRAY('read')),
    JSON_OBJECT('module', 'lab_tests', 'actions', JSON_ARRAY('create', 'read', 'update')),
    JSON_OBJECT('module', 'patients', 'actions', JSON_ARRAY('read')),
    JSON_OBJECT('module', 'notifications', 'actions', JSON_ARRAY('create', 'read'))
)) WHERE role = 'lab_technician';

UPDATE users SET permissions = JSON_OBJECT('modules', JSON_ARRAY(
    JSON_OBJECT('module', 'dashboard', 'actions', JSON_ARRAY('read')),
    JSON_OBJECT('module', 'inventory', 'actions', JSON_ARRAY('create', 'read', 'update')),
    JSON_OBJECT('module', 'patients', 'actions', JSON_ARRAY('read')),
    JSON_OBJECT('module', 'notifications', 'actions', JSON_ARRAY('read'))
)) WHERE role = 'pharmacist';

UPDATE users SET permissions = JSON_OBJECT('modules', JSON_ARRAY(
    JSON_OBJECT('module', 'dashboard', 'actions', JSON_ARRAY('read')),
    JSON_OBJECT('module', 'inventory', 'actions', JSON_ARRAY('create', 'read', 'update', 'delete')),
    JSON_OBJECT('module', 'notifications', 'actions', JSON_ARRAY('read'))
)) WHERE role = 'medical_store_manager';

UPDATE users SET permissions = JSON_OBJECT('modules', JSON_ARRAY(
    JSON_OBJECT('module', 'dashboard', 'actions', JSON_ARRAY('read')),
    JSON_OBJECT('module', 'patients', 'actions', JSON_ARRAY('create', 'read', 'update')),
    JSON_OBJECT('module', 'appointments', 'actions', JSON_ARRAY('create', 'read', 'update')),
    JSON_OBJECT('module', 'billing', 'actions', JSON_ARRAY('read')),
    JSON_OBJECT('module', 'notifications', 'actions', JSON_ARRAY('create', 'read'))
)) WHERE role = 'receptionist';

-- Final verification with formatted permissions
SELECT 
    name,
    email,
    role,
    JSON_PRETTY(permissions) as permissions,
    is_active
FROM users 
WHERE email LIKE '%@medcare.com'
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
