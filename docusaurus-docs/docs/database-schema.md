# Database Schema Documentation

## Overview

The MedCare Hospital Management System uses a comprehensive MySQL database schema designed for multi-tenant healthcare operations. The database consists of 40+ tables with proper relationships, indexing, and constraints to ensure data integrity and performance.

## Database Technology Stack

- **Database Engine**: MySQL 8.0+
- **ORM**: Lucid ORM 21.6.1 (AdonisJS)
- **Migration System**: AdonisJS Schema Migrations
- **Character Set**: UTF-8
- **Collation**: utf8mb4_unicode_ci

## Core Entity Relationships

```
Organizations (Multi-tenancy)
├── Users (Doctors, Nurses, Staff)
├── Patients
├── Appointments
├── Medical Records
├── Bills
├── Inventory Items
├── Lab Tests
└── Prescriptions
```

## Table Structure

### Core Tables

#### 1. Organizations Table
**Purpose**: Multi-tenant organization management
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NULL,
    registration_number VARCHAR(100) UNIQUE NULL,
    address TEXT NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(191) NULL,
    website VARCHAR(255) NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    settings JSON NULL,
    branding JSON NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    language VARCHAR(5) DEFAULT 'en',
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

#### 2. Users Table
**Purpose**: System users (doctors, nurses, staff, admins)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    organization_id UUID NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(191) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'doctor', 'billing_manager', 'nurse', 
              'lab_technician', 'pharmacist', 'medical_store_manager', 
              'receptionist') NOT NULL,
    permissions JSON NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    phone VARCHAR(20) NULL,
    department VARCHAR(255) NULL,
    employee_id VARCHAR(50) UNIQUE NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

#### 3. Patients Table
**Purpose**: Patient information and medical history
```sql
CREATE TABLE patients (
    id UUID PRIMARY KEY,
    patient_id UUID UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(191) NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    address TEXT NOT NULL,
    emergency_contact JSON NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NULL,
    allergies JSON NULL,
    chronic_conditions JSON NULL,
    vaccination_records JSON NULL,
    insurance_info JSON NULL,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

#### 4. Appointments Table
**Purpose**: Patient appointment scheduling and management
```sql
CREATE TABLE appointments (
    id UUID PRIMARY KEY,
    appointment_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_date DATETIME NOT NULL,
    appointment_time DATETIME NOT NULL,
    duration INTEGER DEFAULT 30,
    status ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    type ENUM('consultation', 'follow_up', 'emergency', 'surgery', 'checkup') DEFAULT 'consultation',
    priority ENUM('normal', 'urgent', 'emergency') DEFAULT 'normal',
    reason VARCHAR(500) NOT NULL,
    notes TEXT NULL,
    symptoms JSON NULL,
    vitals JSON NULL,
    checked_in_at DATETIME NULL,
    checked_out_at DATETIME NULL,
    room_number VARCHAR(50) NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

#### 5. Medical Records Table
**Purpose**: Patient medical history and treatment records
```sql
CREATE TABLE medical_records (
    id UUID PRIMARY KEY,
    record_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_id UUID NULL REFERENCES appointments(id) ON DELETE SET NULL,
    visit_date DATETIME NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment TEXT NOT NULL,
    medications JSON NULL,
    lab_results JSON NULL,
    vital_signs JSON NULL,
    notes TEXT NULL,
    follow_up_instructions JSON NULL,
    next_visit_date DATETIME NULL,
    attachments JSON NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

### Financial Management Tables

#### 6. Bills Table
**Purpose**: Patient billing and payment tracking
```sql
CREATE TABLE bills (
    id UUID PRIMARY KEY,
    bill_number VARCHAR(20) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_id UUID NULL REFERENCES appointments(id) ON DELETE SET NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    due_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'partial', 'paid', 'cancelled') DEFAULT 'pending',
    payment_method ENUM('cash', 'card', 'insurance', 'cheque', 'online') NULL,
    items JSON NOT NULL,
    notes TEXT NULL,
    due_date DATE NULL,
    paid_date DATETIME NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

### Inventory Management Tables

#### 7. Inventories Table
**Purpose**: Medical supplies and equipment tracking
```sql
CREATE TABLE inventories (
    id UUID PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    item_code VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NULL,
    unit VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_quantity INTEGER NOT NULL DEFAULT 0,
    max_quantity INTEGER NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_value DECIMAL(12,2) NOT NULL,
    supplier_name VARCHAR(255) NULL,
    supplier_contact JSON NULL,
    expiry_date DATE NULL,
    batch_number VARCHAR(100) NULL,
    location VARCHAR(255) NULL,
    status ENUM('active', 'inactive', 'expired', 'out_of_stock') DEFAULT 'active',
    last_restocked DATETIME NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

### Laboratory Management Tables

#### 8. Lab Tests Table
**Purpose**: Laboratory test orders and results
```sql
CREATE TABLE lab_tests (
    id UUID PRIMARY KEY,
    test_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_id UUID NULL REFERENCES appointments(id) ON DELETE SET NULL,
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(100) NOT NULL,
    sample_type VARCHAR(100) NOT NULL,
    status ENUM('ordered', 'sample_collected', 'in_progress', 'completed', 'cancelled') DEFAULT 'ordered',
    priority ENUM('normal', 'urgent', 'emergency') DEFAULT 'normal',
    ordered_date DATETIME NOT NULL,
    sample_collected_date DATETIME NULL,
    result_date DATETIME NULL,
    results JSON NULL,
    normal_ranges JSON NULL,
    technician_notes TEXT NULL,
    doctor_notes TEXT NULL,
    cost DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

### Prescription Management Tables

#### 9. Prescriptions Table
**Purpose**: Medicine prescriptions and pharmacy management
```sql
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY,
    prescription_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_id UUID NULL REFERENCES appointments(id) ON DELETE SET NULL,
    medications JSON NOT NULL,
    instructions TEXT NULL,
    status ENUM('pending', 'dispensed', 'partially_dispensed', 'cancelled') DEFAULT 'pending',
    issued_date DATETIME NOT NULL,
    dispensed_date DATETIME NULL,
    pharmacist_id UUID NULL REFERENCES users(id),
    total_cost DECIMAL(10,2) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

### Bed Management Tables

#### 10. Beds Table
**Purpose**: Hospital bed allocation and management
```sql
CREATE TABLE beds (
    id UUID PRIMARY KEY,
    bed_number VARCHAR(50) UNIQUE NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    ward VARCHAR(255) NOT NULL,
    floor VARCHAR(50) NOT NULL,
    type ENUM('general', 'private', 'icu', 'emergency', 'pediatric', 'maternity') NOT NULL,
    status ENUM('available', 'occupied', 'maintenance', 'cleaning', 'reserved') DEFAULT 'available',
    patient_id UUID NULL REFERENCES patients(id) ON DELETE SET NULL,
    admission_date DATETIME NULL,
    discharge_date DATETIME NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    features JSON NULL,
    notes TEXT NULL,
    last_cleaned DATETIME NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

### Doctor Management Tables

#### 11. Doctor Schedules Table
**Purpose**: Doctor working schedules and availability
```sql
CREATE TABLE doctor_schedules (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start_time TIME NULL,
    break_end_time TIME NULL,
    max_patients INTEGER NOT NULL DEFAULT 20,
    location VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

#### 12. Doctor Availability Table
**Purpose**: Doctor availability overrides and leave management
```sql
CREATE TABLE doctor_availabilities (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    availability_type VARCHAR(50) NOT NULL DEFAULT 'override',
    reason TEXT NULL,
    replacement_doctor_id UUID NULL REFERENCES users(id),
    custom_start_time TIME NULL,
    custom_end_time TIME NULL,
    custom_location VARCHAR(255) NULL,
    custom_max_patients INTEGER NULL,
    notify_patients BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

### System Configuration Tables

#### 13. Master Data Table
**Purpose**: System configuration and dropdown values
```sql
CREATE TABLE master_data (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    value VARCHAR(100) NULL,
    display_order INTEGER DEFAULT 0,
    is_system BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSON NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE KEY(category, name)
);
```

#### 14. System Settings Table
**Purpose**: Application-wide configuration settings
```sql
CREATE TABLE system_settings (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(50) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT NULL,
    is_editable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE KEY(category, key)
);
```

### Permission Management Tables

#### 15. Permissions Table
**Purpose**: System permissions and access control
```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    module VARCHAR(100) NOT NULL,
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

#### 16. Roles Table
**Purpose**: User role definitions and permissions
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY,
    organization_id UUID NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    permissions JSON NULL,
    is_system BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

### Flexible User Data Tables

#### 17. Role Fields Table
**Purpose**: Dynamic role-specific field definitions
```sql
CREATE TABLE role_fields (
    id UUID PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_label VARCHAR(255) NOT NULL,
    field_type ENUM('text', 'number', 'email', 'phone', 'date', 'datetime', 
                    'boolean', 'select', 'multiselect', 'textarea', 'file') NOT NULL,
    field_options JSON NULL,
    is_required BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    is_editable BOOLEAN DEFAULT TRUE,
    is_system BOOLEAN DEFAULT FALSE,
    validation_rules JSON NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

#### 18. User Role Data Table
**Purpose**: Storage for dynamic role-specific user data
```sql
CREATE TABLE user_role_data (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_field_id UUID NOT NULL REFERENCES role_fields(id) ON DELETE CASCADE,
    field_value TEXT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    UNIQUE KEY(user_id, role_field_id)
);
```

#### 19. User Profiles Table
**Purpose**: Extended user profile information
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    field_key VARCHAR(100) NOT NULL,
    field_value TEXT NULL,
    field_type ENUM('text', 'number', 'date', 'datetime', 'boolean', 
                    'select', 'multiselect', 'file', 'email', 'phone', 'url') DEFAULT 'text',
    field_options JSON NULL,
    is_required BOOLEAN DEFAULT FALSE,
    is_visible BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

### Super Admin Management Tables

#### 20. Super Dupar Admins Table
**Purpose**: Platform super administrators
```sql
CREATE TABLE super_dupar_admins (
    id UUID PRIMARY KEY,
    email VARCHAR(191) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    settings JSON NULL,
    permissions JSON NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

#### 21. Super Dupar Admin Activities Table
**Purpose**: Super admin activity logging
```sql
CREATE TABLE super_dupar_admin_activities (
    id UUID PRIMARY KEY,
    super_dupar_admin_id UUID NOT NULL REFERENCES super_dupar_admins(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    description TEXT NULL,
    target_type VARCHAR(100) NULL,
    target_id VARCHAR(255) NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP NOT NULL
);
```

### Audit and Tracking Tables

#### 22. User Audit Logs Table
**Purpose**: User activity and audit trail
```sql
CREATE TABLE user_audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NULL,
    entity_id VARCHAR(255) NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP NOT NULL
);
```

## Database Indexes

### Primary Indexes
- All tables use UUID primary keys
- Unique constraints on business identifiers (patient_id, appointment_id, etc.)

### Performance Indexes
- **Users**: email, role, organization_id, is_active
- **Patients**: patient_id, phone, email, name, organization_id
- **Appointments**: appointment_id, patient_id, doctor_id, appointment_date, status
- **Medical Records**: record_id, patient_id, doctor_id, visit_date
- **Bills**: bill_number, patient_id, doctor_id, status, due_date
- **Lab Tests**: test_id, patient_id, doctor_id, status, ordered_date
- **Inventories**: item_code, category, status, expiry_date
- **Beds**: bed_number, room_number, ward, status, type

### Composite Indexes
- **Doctor Schedules**: (user_id, day_of_week), (day_of_week, is_active)
- **Doctor Availability**: (user_id, date), (date, is_available)
- **Master Data**: (category, name), (category, display_order), (category, is_active)
- **Role Fields**: (role, field_name), (role, sort_order)
- **User Role Data**: (user_id, role_field_id)

## Foreign Key Relationships

### Core Relationships
1. **Organizations → Users**: One-to-many (multi-tenancy)
2. **Users → Appointments**: One-to-many (doctor appointments)
3. **Patients → Appointments**: One-to-many (patient appointments)
4. **Appointments → Medical Records**: One-to-one/many
5. **Patients → Medical Records**: One-to-many
6. **Users → Medical Records**: One-to-many (doctor records)
7. **Patients → Bills**: One-to-many
8. **Appointments → Bills**: One-to-one/many
9. **Patients → Lab Tests**: One-to-many
10. **Users → Lab Tests**: One-to-many (ordering doctor)

### Referential Integrity
- **CASCADE**: Organization deletion removes all related records
- **SET NULL**: Soft relationships (appointment deletion doesn't remove medical records)
- **RESTRICT**: Prevents deletion of referenced records

## Data Types and Constraints

### UUID Usage
- All primary keys use UUID for security and distributed systems
- Business identifiers use shorter formats (patient_id, appointment_id)

### JSON Fields
- **Flexible Storage**: Emergency contacts, medications, lab results
- **Configuration**: Settings, permissions, metadata
- **Performance**: Indexed JSON queries for specific use cases

### Enum Constraints
- **User Roles**: Predefined system roles
- **Status Fields**: Controlled status workflows
- **Priority Levels**: Standardized priority classifications

### Validation Rules
- **Email**: RFC compliant validation
- **Phone**: International format support
- **Dates**: Future date validation for appointments
- **Currency**: Decimal precision for financial calculations

## Migration Strategy

### Version Control
- Sequential migration files with timestamps
- Rollback capabilities for each migration
- Environment-specific migration tracking

### Data Migration
- Enum to master data conversion
- Foreign key relationship updates
- Index optimization migrations

### Schema Evolution
- Non-breaking changes prioritized
- Backward compatibility maintained
- Gradual deprecation of legacy fields

## Performance Considerations

### Query Optimization
- Proper indexing on frequently queried columns
- Composite indexes for multi-column searches
- JSON field indexing for specific queries

### Data Archival
- Soft deletes with deleted_at timestamps
- Historical data retention policies
- Regular cleanup procedures

### Scaling Strategies
- Read replica support
- Table partitioning for large datasets
- Connection pooling optimization

## Security Features

### Data Protection
- Password hashing with bcrypt
- Sensitive data encryption
- Audit trail for all changes

### Access Control
- Role-based permissions
- Multi-tenant data isolation
- API rate limiting support

### Compliance
- HIPAA compliance considerations
- Data retention policies
- Privacy controls

## Backup and Recovery

### Backup Strategy
- Daily automated backups
- Point-in-time recovery
- Cross-region backup storage

### Recovery Procedures
- Database restoration procedures
- Data validation after recovery
- Minimal downtime strategies

## Monitoring and Maintenance

### Performance Monitoring
- Query performance tracking
- Index usage analysis
- Connection monitoring

### Maintenance Tasks
- Regular index rebuilding
- Statistics updates
- Cleanup procedures

This database schema provides a robust foundation for a comprehensive hospital management system with proper data integrity, performance optimization, and scalability considerations.
