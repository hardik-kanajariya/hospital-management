// MySQL Database Configuration and Environment Setup

## Overview
This document provides detailed configuration instructions for setting up the MySQL database backend for MedCare Rural Hospital Management System with offline-first capabilities.

## Prerequisites

### System Requirements
- **MySQL**: Version 8.0 or higher
- **Node.js**: Version 18.0 or higher
- **PHP**: Version 8.1 or higher (for Laravel backend)
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 20GB free space
- **Network**: Stable internet connection for initial setup

### Required Software
1. MySQL Server 8.0+
2. MySQL Workbench (optional, for GUI management)
3. Node.js with npm/yarn
4. Git for version control

## Database Installation

### 1. MySQL Server Setup

#### On Ubuntu/Debian:
```bash
# Update package repository
sudo apt update

# Install MySQL server
sudo apt install mysql-server

# Secure MySQL installation
sudo mysql_secure_installation

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### On Windows:
1. Download MySQL Installer from https://dev.mysql.com/downloads/installer/
2. Run the installer and select "Server only" or "Full" installation
3. Configure MySQL Server during installation
4. Set root password and create user accounts

#### On macOS:
```bash
# Using Homebrew
brew install mysql

# Start MySQL service
brew services start mysql

# Secure installation
mysql_secure_installation
```

### 2. Database Creation and Schema Setup

```bash
# Connect to MySQL as root
mysql -u root -p

# Create database
CREATE DATABASE medcare_rural CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create application user
CREATE USER 'medcare_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON medcare_rural.* TO 'medcare_user'@'localhost';
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;

# Import schema
mysql -u medcare_user -p medcare_rural < database/schema.sql
```

## Environment Configuration

### 1. Application Environment Variables

Create `.env` file in project root:

```env
# Application Configuration
NODE_ENV=development
APP_NAME="MedCare Rural Hospital Management"
APP_URL=http://localhost:3000
API_URL=http://localhost:3001/api

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=medcare_rural
DB_USERNAME=medcare_user
DB_PASSWORD=your_secure_password

# Redis Configuration (for caching, optional)
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Authentication
JWT_SECRET=your-very-long-and-secure-jwt-secret-key-here
JWT_EXPIRE=24h
SESSION_LIFETIME=120

# File Storage
STORAGE_DISK=local
STORAGE_PATH=./storage

# Email Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@medcare.local
MAIL_FROM_NAME="MedCare Rural"

# SMS Configuration
SMS_DRIVER=twilio
SMS_API_KEY=your_twilio_sid
SMS_API_SECRET=your_twilio_auth_token
SMS_FROM=+1234567890

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM
BACKUP_RETENTION_DAYS=30

# Security Settings
BCRYPT_ROUNDS=12
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=15  # minutes

# Logging
LOG_LEVEL=info
LOG_CHANNEL=stack

# Development Settings (remove in production)
APP_DEBUG=true
LOG_DEPRECATIONS=true
```

### 2. Database Performance Tuning

Add these settings to MySQL configuration file (`/etc/mysql/mysql.conf.d/mysqld.cnf` on Ubuntu):

```ini
[mysqld]
# Basic Settings
server-id = 1
bind-address = 127.0.0.1
port = 3306
datadir = /var/lib/mysql
socket = /var/run/mysqld/mysqld.sock

# Character Set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Performance Settings
# Adjust based on available RAM
innodb_buffer_pool_size = 2G  # 50-70% of available RAM
innodb_log_file_size = 256M
innodb_log_buffer_size = 16M
innodb_flush_log_at_trx_commit = 2
innodb_file_per_table = 1

# Query Cache (deprecated in MySQL 8.0, use alternative)
# query_cache_type = 1
# query_cache_size = 64M

# Connection Settings
max_connections = 200
max_connect_errors = 100000
wait_timeout = 600
interactive_timeout = 600

# Buffer Settings
key_buffer_size = 32M
table_open_cache = 400
sort_buffer_size = 2M
read_buffer_size = 2M
read_rnd_buffer_size = 8M
myisam_sort_buffer_size = 64M

# Binary Logging (for replication/backup)
log-bin = mysql-bin
binlog_format = ROW
expire_logs_days = 7
sync_binlog = 1

# Error Logging
log-error = /var/log/mysql/error.log
log_warnings = 2

# Slow Query Logging
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
log_queries_not_using_indexes = 1

# Security Settings
local_infile = 0
skip_name_resolve
ssl_ca = /etc/mysql/ssl/ca-cert.pem
ssl_cert = /etc/mysql/ssl/server-cert.pem
ssl_key = /etc/mysql/ssl/server-key.pem
```

## Application Setup

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install additional packages for database support
npm install mysql2 sequelize redis ioredis

# Install development dependencies
npm install --save-dev @types/mysql2
```

### 2. Database Migration and Seeding

```bash
# Run database migrations (if using a migration system)
npm run migrate

# Seed initial data
npm run seed

# Or manually import schema
mysql -u medcare_user -p medcare_rural < database/schema.sql
mysql -u medcare_user -p medcare_rural < database/sample_data.sql
```

### 3. Application Start

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm run start

# With PM2 (production)
pm2 start ecosystem.config.js
```

## Offline-First Configuration

### 1. IndexedDB Setup

The application automatically initializes IndexedDB for offline storage. Configure sync intervals:

```javascript
// In src/lib/database.ts
const SYNC_INTERVAL = 30000; // 30 seconds
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000; // 5 seconds
```

### 2. Service Worker (Optional)

For advanced offline capabilities, configure a service worker:

```javascript
// public/sw.js
const CACHE_NAME = 'medcare-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  // Add other critical assets
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

## Security Configuration

### 1. Database Security

```sql
-- Create read-only user for reporting
CREATE USER 'medcare_readonly'@'localhost' IDENTIFIED BY 'readonly_password';
GRANT SELECT ON medcare_rural.* TO 'medcare_readonly'@'localhost';

-- Create backup user
CREATE USER 'medcare_backup'@'localhost' IDENTIFIED BY 'backup_password';
GRANT SELECT, LOCK TABLES, SHOW VIEW ON medcare_rural.* TO 'medcare_backup'@'localhost';

-- Remove test databases and users
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.user WHERE User='';
FLUSH PRIVILEGES;
```

### 2. SSL/TLS Configuration

Generate SSL certificates for MySQL:

```bash
# Generate CA certificate
openssl genrsa 2048 > ca-key.pem
openssl req -new -x509 -nodes -days 3600 -key ca-key.pem -out ca.pem

# Generate server certificate
openssl req -newkey rsa:2048 -days 3600 -nodes -keyout server-key.pem -out server-req.pem
openssl rsa -in server-key.pem -out server-key.pem
openssl x509 -req -in server-req.pem -days 3600 -CA ca.pem -CAkey ca-key.pem -set_serial 01 -out server-cert.pem

# Copy to MySQL directory
sudo cp *.pem /etc/mysql/ssl/
sudo chown mysql:mysql /etc/mysql/ssl/*.pem
sudo chmod 600 /etc/mysql/ssl/*.pem
```

## Monitoring and Maintenance

### 1. Performance Monitoring

```sql
-- Monitor database performance
SELECT 
    SCHEMA_NAME as 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as 'Size (MB)'
FROM information_schema.schemata s
LEFT JOIN information_schema.tables t ON s.schema_name = t.table_schema
WHERE s.schema_name = 'medcare_rural'
GROUP BY s.schema_name;

-- Check slow queries
SELECT 
    query_time,
    lock_time,
    rows_sent,
    rows_examined,
    sql_text
FROM mysql.slow_log
ORDER BY query_time DESC
LIMIT 10;
```

### 2. Automated Backups

Create backup script (`scripts/backup.sh`):

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/medcare"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="medcare_rural"
DB_USER="medcare_backup"
DB_PASS="backup_password"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
mysqldump -u$DB_USER -p$DB_PASS --single-transaction --routines --triggers $DB_NAME > $BACKUP_DIR/medcare_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/medcare_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "medcare_*.sql.gz" -mtime +30 -delete

echo "Backup completed: medcare_$DATE.sql.gz"
```

### 3. Health Check Endpoints

```javascript
// src/routes/health.js
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    await db.query('SELECT 1');
    
    // Check disk space
    const stats = await fs.promises.statfs('./');
    const freeSpace = stats.bavail * stats.bsize;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      disk_space_mb: Math.round(freeSpace / 1024 / 1024),
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   ```bash
   # Check MySQL service status
   sudo systemctl status mysql
   
   # Restart if needed
   sudo systemctl restart mysql
   ```

2. **Access Denied**
   ```sql
   -- Reset user password
   ALTER USER 'medcare_user'@'localhost' IDENTIFIED BY 'new_password';
   FLUSH PRIVILEGES;
   ```

3. **Slow Performance**
   ```sql
   -- Analyze table usage
   ANALYZE TABLE patients, appointments, medical_records;
   
   -- Optimize tables
   OPTIMIZE TABLE patients, appointments, medical_records;
   ```

4. **Sync Issues**
   - Check network connectivity
   - Verify API endpoints are accessible
   - Clear IndexedDB cache if corrupted
   - Check browser console for sync errors

### Log Files

Monitor these log files for issues:
- MySQL: `/var/log/mysql/error.log`
- Application: `./logs/app.log`
- Access: `./logs/access.log`
- Sync: `./logs/sync.log`

## Production Deployment

### 1. Production Checklist

- [ ] Change all default passwords
- [ ] Enable SSL/TLS encryption
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Configure monitoring alerts
- [ ] Test disaster recovery procedures
- [ ] Update all dependencies
- [ ] Configure rate limiting
- [ ] Set up log rotation
- [ ] Test offline functionality

### 2. Environment-Specific Settings

```env
# Production environment
NODE_ENV=production
APP_DEBUG=false
LOG_LEVEL=error

# Use stronger encryption
BCRYPT_ROUNDS=14

# Tighter rate limits
RATE_LIMIT_REQUESTS=50
RATE_LIMIT_WINDOW=15

# Secure session settings
SESSION_SECURE=true
SESSION_SAME_SITE=strict
```

This configuration provides a robust foundation for the MedCare Rural Hospital Management System with full offline-first capabilities and MySQL backend integration.