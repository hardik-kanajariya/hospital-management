-- MySQL Database Schema for MedCare Rural Hospital Management System

-- Create database
CREATE DATABASE IF NOT EXISTS medcare_rural CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medcare_rural;

-- Users table for authentication and role management
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin', 'doctor', 'nurse', 'staff', 'receptionist', 'lab_technician', 'billing_manager', 'pharmacy_manager') NOT NULL,
    permissions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    address TEXT NOT NULL,
    emergency_contact VARCHAR(500) NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allergies JSON,
    chronic_conditions JSON,
    vaccination_records JSON,
    insurance_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_patient_id (patient_id),
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_name (name),
    FULLTEXT idx_search (name, phone, patient_id)
);

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    qualification VARCHAR(500) NOT NULL,
    experience_years INT DEFAULT 0,
    consultation_fee DECIMAL(10,2) DEFAULT 0,
    availability JSON,
    contact_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_specialization (specialization),
    INDEX idx_department (department)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INT DEFAULT 30,
    type ENUM('consultation', 'follow-up', 'emergency', 'surgery') DEFAULT 'consultation',
    status ENUM('scheduled', 'in-progress', 'completed', 'cancelled', 'no-show') DEFAULT 'scheduled',
    notes TEXT,
    room_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_patient (patient_id),
    INDEX idx_doctor (doctor_id),
    INDEX idx_date (appointment_date),
    INDEX idx_status (status)
);

-- Medical records table
CREATE TABLE IF NOT EXISTS medical_records (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    visit_date DATE NOT NULL,
    chief_complaint TEXT NOT NULL,
    diagnosis JSON,
    symptoms JSON,
    treatment_plan TEXT,
    prescriptions JSON,
    vital_signs JSON,
    notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_patient (patient_id),
    INDEX idx_doctor (doctor_id),
    INDEX idx_visit_date (visit_date)
);

-- Billing records table
CREATE TABLE IF NOT EXISTS billing_records (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    items JSON NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
    payment_method VARCHAR(50),
    insurance_claim JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_patient (patient_id),
    INDEX idx_invoice (invoice_number),
    INDEX idx_status (payment_status),
    INDEX idx_date (date)
);

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category ENUM('medicine', 'equipment', 'supplies', 'consumables') NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    minimum_stock INT NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL,
    supplier VARCHAR(255),
    expiry_date DATE,
    batch_number VARCHAR(100),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_stock (current_stock),
    INDEX idx_expiry (expiry_date),
    INDEX idx_name (name),
    FULLTEXT idx_search (name, supplier)
);

-- Lab tests table
CREATE TABLE IF NOT EXISTS lab_tests (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    test_category VARCHAR(100) NOT NULL,
    ordered_date DATE NOT NULL,
    sample_collected_date DATE,
    result_date DATE,
    status ENUM('ordered', 'sample_collected', 'in_progress', 'completed', 'cancelled') DEFAULT 'ordered',
    results JSON,
    notes TEXT,
    urgency ENUM('routine', 'urgent', 'stat') DEFAULT 'routine',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    INDEX idx_patient (patient_id),
    INDEX idx_doctor (doctor_id),
    INDEX idx_status (status),
    INDEX idx_ordered_date (ordered_date)
);

-- Beds table
CREATE TABLE IF NOT EXISTS beds (
    id VARCHAR(36) PRIMARY KEY,
    bed_number VARCHAR(20) UNIQUE NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    room_type ENUM('general', 'private', 'icu', 'emergency', 'surgery') NOT NULL,
    status ENUM('available', 'occupied', 'maintenance', 'reserved') DEFAULT 'available',
    patient_id VARCHAR(36),
    admission_date DATE,
    expected_discharge_date DATE,
    daily_rate DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
    INDEX idx_room (room_number),
    INDEX idx_status (status),
    INDEX idx_type (room_type)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    patient_id VARCHAR(36),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created (created_at)
);

-- Audit log table for tracking changes
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(36) NOT NULL,
    action ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_table (table_name),
    INDEX idx_record (record_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
);

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id VARCHAR(36) PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSON NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key),
    INDEX idx_public (is_public)
);

-- Reports table for storing generated reports
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    filters JSON,
    generated_by VARCHAR(36),
    file_path VARCHAR(500),
    status ENUM('generating', 'completed', 'failed') DEFAULT 'generating',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- Stock movements table for inventory tracking
CREATE TABLE IF NOT EXISTS stock_movements (
    id VARCHAR(36) PRIMARY KEY,
    inventory_item_id VARCHAR(36) NOT NULL,
    type ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
    quantity INT NOT NULL,
    reason VARCHAR(255),
    reference_id VARCHAR(36),
    reference_type VARCHAR(50),
    performed_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_item (inventory_item_id),
    INDEX idx_type (type),
    INDEX idx_created (created_at)
);

-- Insurance providers table
CREATE TABLE IF NOT EXISTS insurance_providers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_info JSON,
    coverage_details JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_active (is_active)
);

-- Default admin user (password: admin123)
INSERT INTO users (id, email, password_hash, name, role, permissions) VALUES 
(UUID(), 'admin@medcare.local', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'super_admin', '["all"]');

-- Sample system settings
INSERT INTO system_settings (id, setting_key, setting_value, description, is_public) VALUES 
(UUID(), 'hospital_name', '"MedCare Rural Hospital"', 'Hospital name displayed in the system', true),
(UUID(), 'hospital_address', '"Rural Healthcare Center, Village Road, District"', 'Hospital address', true),
(UUID(), 'hospital_phone', '"+91-1234567890"', 'Hospital contact phone', true),
(UUID(), 'currency', '"INR"', 'Default currency for billing', false),
(UUID(), 'timezone', '"Asia/Kolkata"', 'Hospital timezone', false),
(UUID(), 'backup_enabled', 'true', 'Enable automatic backups', false),
(UUID(), 'sms_enabled', 'true', 'Enable SMS notifications', false),
(UUID(), 'email_enabled', 'true', 'Enable email notifications', false);

-- Sample insurance providers
INSERT INTO insurance_providers (id, name, contact_info, coverage_details, is_active) VALUES 
(UUID(), 'Star Health Insurance', '{"phone": "+91-1800-425-2255", "email": "care@starhealth.in", "website": "www.starhealth.in"}', '{"max_coverage": 500000, "cashless": true, "network_hospital": true}', true),
(UUID(), 'HDFC ERGO Health Insurance', '{"phone": "+91-1800-266-4444", "email": "care@hdfcergo.com", "website": "www.hdfcergo.com"}', '{"max_coverage": 1000000, "cashless": true, "network_hospital": true}', true),
(UUID(), 'Ayushman Bharat (PMJAY)', '{"phone": "+91-14555", "website": "pmjay.gov.in"}', '{"max_coverage": 500000, "cashless": true, "government_scheme": true}', true);

-- Create indexes for better performance
CREATE INDEX idx_patients_dob ON patients(date_of_birth);
CREATE INDEX idx_appointments_datetime ON appointments(appointment_date, appointment_time);
CREATE INDEX idx_billing_amount ON billing_records(total_amount);
CREATE INDEX idx_inventory_low_stock ON inventory_items(current_stock, minimum_stock);
CREATE INDEX idx_beds_availability ON beds(status, room_type);

-- Create views for common queries
CREATE VIEW patient_summary AS
SELECT 
    p.id,
    p.patient_id,
    p.name,
    p.phone,
    p.email,
    p.date_of_birth,
    p.gender,
    p.blood_group,
    FLOOR(DATEDIFF(CURDATE(), p.date_of_birth) / 365.25) as age,
    JSON_LENGTH(p.allergies) as allergy_count,
    JSON_LENGTH(p.chronic_conditions) as chronic_condition_count,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT mr.id) as total_visits,
    MAX(a.appointment_date) as last_appointment_date,
    p.created_at,
    p.updated_at
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
LEFT JOIN medical_records mr ON p.id = mr.patient_id
GROUP BY p.id;

CREATE VIEW doctor_workload AS
SELECT 
    d.id,
    d.name,
    d.specialization,
    d.department,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT CASE WHEN a.appointment_date = CURDATE() THEN a.id END) as today_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'scheduled' AND a.appointment_date >= CURDATE() THEN a.id END) as upcoming_appointments,
    AVG(d.consultation_fee) as avg_consultation_fee
FROM doctors d
LEFT JOIN appointments a ON d.id = a.doctor_id
GROUP BY d.id;

CREATE VIEW inventory_alerts AS
SELECT 
    i.id,
    i.name,
    i.category,
    i.current_stock,
    i.minimum_stock,
    i.expiry_date,
    CASE 
        WHEN i.current_stock <= i.minimum_stock THEN 'LOW_STOCK'
        WHEN i.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'EXPIRING_SOON'
        ELSE 'OK'
    END as alert_type,
    CASE 
        WHEN i.current_stock <= i.minimum_stock THEN CONCAT('Stock is low: ', i.current_stock, ' remaining')
        WHEN i.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN CONCAT('Expires on: ', DATE_FORMAT(i.expiry_date, '%d/%m/%Y'))
        ELSE 'No alerts'
    END as alert_message
FROM inventory_items i
WHERE i.current_stock <= i.minimum_stock 
   OR i.expiry_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY);

-- Create stored procedures for common operations
DELIMITER //

CREATE PROCEDURE GetPatientHistory(IN patient_uuid VARCHAR(36))
BEGIN
    SELECT 
        'appointment' as record_type,
        a.appointment_date as date,
        CONCAT('Appointment with Dr. ', d.name, ' (', a.type, ')') as description,
        a.status,
        a.notes
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    WHERE a.patient_id = patient_uuid
    
    UNION ALL
    
    SELECT 
        'medical_record' as record_type,
        mr.visit_date as date,
        CONCAT('Visit - ', mr.chief_complaint) as description,
        'completed' as status,
        mr.notes
    FROM medical_records mr
    WHERE mr.patient_id = patient_uuid
    
    UNION ALL
    
    SELECT 
        'lab_test' as record_type,
        lt.ordered_date as date,
        CONCAT('Lab Test - ', lt.test_name) as description,
        lt.status,
        lt.notes
    FROM lab_tests lt
    WHERE lt.patient_id = patient_uuid
    
    ORDER BY date DESC;
END //

CREATE PROCEDURE GetDoctorSchedule(IN doctor_uuid VARCHAR(36), IN schedule_date DATE)
BEGIN
    SELECT 
        a.id,
        a.appointment_time,
        a.duration,
        p.name as patient_name,
        p.phone as patient_phone,
        a.type,
        a.status,
        a.room_number
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    WHERE a.doctor_id = doctor_uuid 
      AND a.appointment_date = schedule_date
    ORDER BY a.appointment_time;
END //

CREATE PROCEDURE GenerateInvoice(
    IN patient_uuid VARCHAR(36),
    IN items_json JSON,
    OUT invoice_id VARCHAR(36)
)
BEGIN
    DECLARE total DECIMAL(10,2) DEFAULT 0;
    DECLARE invoice_num VARCHAR(50);
    
    -- Generate invoice number
    SET invoice_num = CONCAT('INV-', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD((SELECT COUNT(*) + 1 FROM billing_records WHERE DATE(created_at) = CURDATE()), 4, '0'));
    
    -- Calculate total from JSON items
    SELECT SUM(JSON_UNQUOTE(JSON_EXTRACT(value, '$.total_price'))) INTO total
    FROM JSON_TABLE(items_json, '$[*]' COLUMNS (value JSON PATH '$')) as jt;
    
    -- Insert billing record
    SET invoice_id = UUID();
    INSERT INTO billing_records (
        id, patient_id, invoice_number, date, items, 
        subtotal, total_amount, payment_status
    ) VALUES (
        invoice_id, patient_uuid, invoice_num, CURDATE(), items_json,
        total, total, 'pending'
    );
END //

DELIMITER ;

-- Create triggers for audit logging
DELIMITER //

CREATE TRIGGER patients_audit_insert AFTER INSERT ON patients
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (id, table_name, record_id, action, new_values, created_at)
    VALUES (UUID(), 'patients', NEW.id, 'CREATE', JSON_OBJECT(
        'name', NEW.name,
        'phone', NEW.phone,
        'email', NEW.email
    ), NOW());
END //

CREATE TRIGGER patients_audit_update AFTER UPDATE ON patients
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (id, table_name, record_id, action, old_values, new_values, created_at)
    VALUES (UUID(), 'patients', NEW.id, 'UPDATE', 
        JSON_OBJECT('name', OLD.name, 'phone', OLD.phone, 'email', OLD.email),
        JSON_OBJECT('name', NEW.name, 'phone', NEW.phone, 'email', NEW.email),
        NOW());
END //

CREATE TRIGGER inventory_stock_update AFTER UPDATE ON inventory_items
FOR EACH ROW
BEGIN
    IF OLD.current_stock != NEW.current_stock THEN
        INSERT INTO stock_movements (id, inventory_item_id, type, quantity, reason, created_at)
        VALUES (UUID(), NEW.id, 'ADJUSTMENT', NEW.current_stock - OLD.current_stock, 'Stock adjustment', NOW());
    END IF;
END //

DELIMITER ;