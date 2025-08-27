# MedCare Rural - Database Setup Instructions

## Prerequisites

- MySQL 8.0 or higher
- Node.js 18+ for the API server
- PHP 8.1+ with Laravel (optional for backend API)

## Database Setup

### 1. Create Database

```bash
# Connect to MySQL
mysql -u root -p

# Source the schema file
source /path/to/database/schema.sql
```

### 2. Environment Configuration

Create a `.env` file in your project root:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=medcare_rural
DB_USERNAME=your_username
DB_PASSWORD=your_password

# API Configuration
API_URL=http://localhost:3001/api
JWT_SECRET=your_jwt_secret_key_here

# Application Settings
APP_NAME="MedCare Rural"
APP_ENV=development
APP_DEBUG=true

# SMS Configuration (optional)
SMS_ENABLED=true
SMS_PROVIDER=twilio
SMS_API_KEY=your_sms_api_key
SMS_API_SECRET=your_sms_api_secret

# Email Configuration (optional)
MAIL_ENABLED=true
MAIL_DRIVER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

### 3. Default Login Credentials

After running the schema, you can login with:

- **Email**: admin@medcare.local
- **Password**: admin123

**Important**: Change the default password immediately after first login.

## Database Features

### Tables Overview

1. **users** - User authentication and role management
2. **patients** - Patient records with medical history
3. **doctors** - Doctor profiles and availability
4. **appointments** - Appointment scheduling
5. **medical_records** - Electronic medical records
6. **billing_records** - Billing and invoicing
7. **inventory_items** - Medical inventory management
8. **lab_tests** - Laboratory test management
9. **beds** - Hospital bed management
10. **notifications** - System notifications
11. **audit_logs** - System audit trail
12. **system_settings** - Configuration settings

### Key Features

- **Multi-tenant ready** with proper data isolation
- **Audit logging** for all critical operations
- **JSON fields** for flexible data storage
- **Full-text search** on patient and inventory records
- **Automated triggers** for stock movements
- **Stored procedures** for complex operations
- **Views** for optimized common queries

### Indexes and Performance

The schema includes comprehensive indexing for:
- Patient search operations
- Appointment queries by date/doctor
- Billing status filtering
- Inventory stock levels
- Audit log tracking

### Sample Data

The schema includes sample data for:
- Default admin user
- System settings
- Insurance providers (including Ayushman Bharat)

## API Endpoints Structure

The database supports a RESTful API structure:

```
GET    /api/patients              - List patients
POST   /api/patients              - Create patient
GET    /api/patients/{id}         - Get patient
PUT    /api/patients/{id}         - Update patient
DELETE /api/patients/{id}         - Delete patient

GET    /api/appointments          - List appointments
POST   /api/appointments          - Create appointment
GET    /api/appointments/{id}     - Get appointment
PUT    /api/appointments/{id}     - Update appointment

GET    /api/doctors               - List doctors
GET    /api/doctors/{id}/schedule - Get doctor schedule
PUT    /api/doctors/{id}/schedule - Update doctor schedule

GET    /api/inventory             - List inventory items
POST   /api/inventory/{id}/stock  - Update stock levels

GET    /api/billing               - List billing records
POST   /api/billing/invoices      - Create invoice
POST   /api/billing/payments      - Process payment

GET    /api/lab-tests             - List lab tests
POST   /api/lab-tests             - Order lab test
PUT    /api/lab-tests/{id}/results - Update test results

GET    /api/beds                  - List beds
POST   /api/beds/{id}/assign      - Assign bed
POST   /api/beds/{id}/discharge   - Discharge bed

GET    /api/reports/{type}        - Generate reports
GET    /api/system/stats          - System statistics
```

## Backup and Restore

### Automated Backup

The database includes settings for automated backups. Configure in `system_settings`:

```sql
UPDATE system_settings 
SET setting_value = 'true' 
WHERE setting_key = 'backup_enabled';
```

### Manual Backup

```bash
# Create backup
mysqldump -u username -p medcare_rural > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
mysql -u username -p medcare_rural < backup_file.sql
```

## Security Considerations

1. **Change default passwords** immediately
2. **Use strong JWT secrets** for API authentication
3. **Enable SSL/TLS** for database connections
4. **Regular security updates** for MySQL
5. **Monitor audit logs** for suspicious activity
6. **Implement rate limiting** on API endpoints
7. **Validate input data** before database operations

## Monitoring and Maintenance

### Performance Monitoring

```sql
-- Check table sizes
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'medcare_rural'
ORDER BY (data_length + index_length) DESC;

-- Check index usage
SELECT 
    object_schema,
    object_name,
    index_name,
    count_read,
    count_write,
    count_fetch
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE object_schema = 'medcare_rural';
```

### Regular Maintenance

```sql
-- Optimize tables monthly
OPTIMIZE TABLE patients, appointments, medical_records, billing_records;

-- Clean old audit logs (older than 1 year)
DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Update table statistics
ANALYZE TABLE patients, appointments, medical_records;
```

## Troubleshooting

### Common Issues

1. **Connection refused**: Check MySQL service status
2. **Permission denied**: Verify user privileges
3. **Table doesn't exist**: Ensure schema is properly loaded
4. **Slow queries**: Check indexes and query optimization
5. **Disk space**: Monitor database size and clean old data

### Useful Queries

```sql
-- Check database size
SELECT SUM(ROUND(((data_length + index_length) / 1024 / 1024), 2)) AS 'DB Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'medcare_rural';

-- Find slow queries
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;

-- Check active connections
SHOW PROCESSLIST;

-- View current settings
SELECT * FROM system_settings WHERE is_public = true;
```