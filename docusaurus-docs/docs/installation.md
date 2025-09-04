# Installation Guide - MedCare Hospital Management System

> **Version**: 1.0.0  
> **Last Updated**: September 3, 2025  
> **Estimated Setup Time**: 30-45 minutes

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Quick Start](#quick-start)
3. [Detailed Installation](#detailed-installation)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [First Run](#first-run)
7. [Production Deployment](#production-deployment)
8. [Docker Setup (Alternative)](#docker-setup)
9. [Troubleshooting](#troubleshooting)
10. [Post-Installation](#post-installation)

---

## System Requirements

### Minimum Requirements

| Component | Minimum | Recommended | Notes |
|-----------|---------|-------------|-------|
| **Operating System** | Windows 10, macOS 10.15, Ubuntu 18.04 | Windows 11, macOS 13+, Ubuntu 22.04+ | 64-bit required |
| **Node.js** | 18.0+ | 20.x LTS | [Download from nodejs.org](https://nodejs.org/) |
| **npm** | 9.0+ | Latest | Comes with Node.js |
| **MySQL** | 8.0+ | 8.0.35+ | [Download from mysql.com](https://dev.mysql.com/downloads/) |
| **Memory (RAM)** | 4 GB | 8 GB+ | For smooth development |
| **Storage** | 5 GB | 10 GB+ | Including dependencies |
| **Network** | Internet connection | Broadband | For package downloads |

### Browser Support

| Browser | Minimum Version | Recommended |
|---------|----------------|-------------|
| **Chrome** | 90+ | Latest |
| **Firefox** | 90+ | Latest |
| **Safari** | 14+ | Latest |
| **Edge** | 90+ | Latest |

### Development Tools (Optional)

- **VS Code** - Recommended code editor with extensions
- **Git** - Version control (if cloning from repository)
- **Postman** - API testing tool
- **MySQL Workbench** - Database management GUI

---

## Quick Start

> **For experienced developers who want to get started immediately**

```bash
# 1. Extract the project files
unzip medcare-hospital-management.zip
cd medcare-hospital-management

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Configure database in .env file
# Edit DB_HOST, DB_NAME, DB_USER, DB_PASSWORD

# 5. Setup and start
npm run setup
npm start

# 6. Open browser to http://localhost:3000
```

**Default Login Credentials:**
- Super Admin: `admin@hospital.com` / `password`
- Doctor: `doctor@hospital.com` / `password`

---

## Detailed Installation

### Step 1: Download and Extract

1. **Download the Project Files**
   - If you purchased from CodeCanyon, download the zip file from your downloads
   - If you have access to the repository, clone it: `git clone <repository-url>`

2. **Extract the Files**
   ```bash
   # For zip file
   unzip medcare-hospital-management.zip
   cd medcare-hospital-management
   
   # For git repository
   git clone <repository-url>
   cd medcare-hospital-management
   ```

### Step 2: Install Node.js and npm

1. **Download Node.js**
   - Visit [nodejs.org](https://nodejs.org/)
   - Download the LTS version (20.x recommended)
   - Run the installer and follow the instructions

2. **Verify Installation**
   ```bash
   node --version  # Should show v20.x.x or higher
   npm --version   # Should show 9.x.x or higher
   ```

### Step 3: Install MySQL

1. **Download MySQL**
   - Visit [MySQL Downloads](https://dev.mysql.com/downloads/)
   - Download MySQL Community Server 8.0+
   - Install following the platform-specific instructions

2. **Start MySQL Service**
   - **Windows**: Start MySQL service from Services panel
   - **macOS**: Use System Preferences or `brew services start mysql`
   - **Linux**: `sudo systemctl start mysql`

3. **Create Database**
   ```sql
   # Connect to MySQL as root
   mysql -u root -p
   
   # Create database
   CREATE DATABASE medcare_hospital;
   
   # Create user (optional, recommended for production)
   CREATE USER 'medcare_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON medcare_hospital.* TO 'medcare_user'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

### Step 4: Install Project Dependencies

```bash
# Navigate to project directory
cd medcare-hospital-management

# Install all dependencies (frontend + backend)
npm install

# This will install:
# - Frontend dependencies (React, TypeScript, etc.)
# - Backend dependencies (AdonisJS, MySQL driver, etc.)
# - Development tools (Vite, ESLint, etc.)
```

**Note**: This process may take 5-10 minutes depending on your internet connection.

---

## Environment Configuration

### Step 1: Create Environment File

```bash
# Copy the example environment file
cp .env.example .env

# For Windows
copy .env.example .env
```

### Step 2: Configure Application Settings

Edit the `.env` file with your specific configuration:

```env
# ================================
# APPLICATION SETTINGS
# ================================
NODE_ENV=development
APP_KEY=your-32-character-random-string-here
PORT=3001

# ================================
# DATABASE CONFIGURATION
# ================================
DB_HOST=localhost
DB_PORT=3306
DB_NAME=medcare_hospital
DB_USER=root
DB_PASSWORD=your_mysql_password

# ================================
# FRONTEND CONFIGURATION
# ================================
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=MedCare Hospital Management
VITE_APP_VERSION=1.0.0

# ================================
# SECURITY SETTINGS
# ================================
JWT_SECRET=your-jwt-secret-key-32-characters-long
HASH_DRIVER=bcrypt

# ================================
# EMAIL CONFIGURATION (OPTIONAL)
# ================================
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@medcare.com
MAIL_FROM_NAME=MedCare Hospital

# ================================
# SMS CONFIGURATION (OPTIONAL)
# ================================
SMS_PROVIDER=twilio
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=MEDCARE

# ================================
# FILE STORAGE
# ================================
STORAGE_DISK=local
UPLOAD_MAX_SIZE=10MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,doc,docx

# ================================
# RATE LIMITING
# ================================
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=3600000

# ================================
# LOGGING
# ================================
LOG_LEVEL=info
LOG_PRETTY_PRINT=true
```

### Step 3: Generate Application Key

```bash
# Generate a secure application key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output and paste it as APP_KEY in .env file
```

### Step 4: Generate JWT Secret

```bash
# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output and paste it as JWT_SECRET in .env file
```

---

## Database Setup

### Step 1: Configure Database Connection

Ensure your `.env` file has the correct database settings:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=medcare_hospital
DB_USER=your_username
DB_PASSWORD=your_password
```

### Step 2: Run Database Migrations

```bash
# Navigate to server directory
cd server

# Install server dependencies (if not done already)
npm install

# Run database migrations
npm run migration:run

# Alternative: Use AdonisJS Ace commands
node ace migration:run
```

### Step 3: Seed Database with Initial Data

```bash
# Seed database with demo data and default users
npm run db:seed

# Alternative: Use AdonisJS Ace commands  
node ace db:seed
```

**This will create:**
- Default user roles (Super Admin, Doctor, Nurse, etc.)
- Demo user accounts
- Sample master data (blood groups, departments, etc.)
- Sample patients, appointments, and medical records

### Step 4: Verify Database Setup

```sql
# Connect to your database
mysql -u your_username -p medcare_hospital

# Check if tables were created
SHOW TABLES;

# Check if demo data was inserted
SELECT * FROM users LIMIT 5;
SELECT * FROM patients LIMIT 5;
```

You should see tables like:
- `users`, `patients`, `appointments`
- `medical_records`, `bills`, `inventories`
- `roles`, `permissions`, `organizations`

---

## First Run

### Step 1: Start the Development Server

```bash
# From the project root directory
npm start

# This command starts both frontend and backend concurrently
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

You should see output like:
```
[CLIENT] Local:   http://localhost:3000/
[CLIENT] Network: http://192.168.1.100:3000/
[SERVER] [ info ] starting http server (pid=12345)
[SERVER] [ info ] listening on http://localhost:3001
```

### Step 2: Access the Application

1. **Open Your Browser**
   - Navigate to `http://localhost:3000`
   - You should see the MedCare login page

2. **Login with Demo Account**
   ```
   Email: admin@hospital.com
   Password: password
   Role: Super Admin
   ```

3. **Verify Installation**
   - Check if dashboard loads properly
   - Navigate through different modules
   - Create a test patient or appointment

### Step 3: API Health Check

Test the API directly:
```bash
# Check API health
curl http://localhost:3001/api/health

# Expected response:
{
  "success": true,
  "status": "OK",
  "timestamp": "2025-09-03T10:30:00.000Z",
  "environment": "development",
  "version": "1.0.0",
  "database": "connected"
}
```

---

## Production Deployment

### Environment Setup

1. **Create Production Environment File**
   ```bash
   cp .env.example .env.production
   ```

2. **Configure Production Settings**
   ```env
   NODE_ENV=production
   APP_KEY=your-production-app-key
   
   # Use production database
   DB_HOST=your-production-db-host
   DB_NAME=medcare_production
   DB_USER=production_user
   DB_PASSWORD=secure_production_password
   
   # Use production API URL
   VITE_API_BASE_URL=https://api.yourdomain.com/api
   
   # Configure production email
   MAIL_HOST=smtp.yourdomain.com
   MAIL_USERNAME=noreply@yourdomain.com
   MAIL_PASSWORD=production_email_password
   
   # Security settings
   JWT_SECRET=production-jwt-secret-64-characters-long
   RATE_LIMIT_ENABLED=true
   ```

### Build for Production

```bash
# Build both frontend and backend
npm run build:full

# This creates:
# - Optimized frontend build in dist/
# - Compiled backend in server/build/
```

### Database Migration (Production)

```bash
# Run migrations on production database
cd server
NODE_ENV=production npm run migration:run

# Seed only essential data (not demo data)
NODE_ENV=production npm run seed:production
```

### Start Production Server

```bash
# Start in production mode
NODE_ENV=production npm run server:start

# Or use PM2 for process management
npm install -g pm2
pm2 start server/build/bin/server.js --name medcare-api
```

### Web Server Configuration

#### Nginx Example

```nginx
# /etc/nginx/sites-available/medcare
server {
    listen 80;
    server_name yourdomain.com;
    
    # Frontend static files
    location / {
        root /path/to/medcare/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Apache Example

```apache
# .htaccess for frontend
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Virtual host for API proxy
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /path/to/medcare/dist
    
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3001/api/
    ProxyPassReverse /api/ http://localhost:3001/api/
</VirtualHost>
```

---

## Docker Setup

### Docker Compose (Recommended)

1. **Create docker-compose.yml**
   ```yaml
   version: '3.8'
   
   services:
     database:
       image: mysql:8.0
       environment:
         MYSQL_ROOT_PASSWORD: rootpassword
         MYSQL_DATABASE: medcare_hospital
         MYSQL_USER: medcare_user
         MYSQL_PASSWORD: medcare_password
       ports:
         - "3306:3306"
       volumes:
         - mysql_data:/var/lib/mysql
   
     backend:
       build: ./server
       environment:
         NODE_ENV: production
         DB_HOST: database
         DB_USER: medcare_user
         DB_PASSWORD: medcare_password
         DB_NAME: medcare_hospital
       ports:
         - "3001:3001"
       depends_on:
         - database
   
     frontend:
       build: .
       environment:
         VITE_API_BASE_URL: http://localhost:3001/api
       ports:
         - "3000:3000"
       depends_on:
         - backend
   
   volumes:
     mysql_data:
   ```

2. **Create Dockerfile for Frontend**
   ```dockerfile
   FROM node:20-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3000
   CMD ["npm", "run", "preview"]
   ```

3. **Create Dockerfile for Backend**
   ```dockerfile
   FROM node:20-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3001
   CMD ["npm", "start"]
   ```

4. **Run with Docker Compose**
   ```bash
   # Start all services
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   
   # Stop services
   docker-compose down
   ```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. **Cannot connect to database**

**Error**: `ECONNREFUSED` or `Access denied for user`

**Solutions**:
```bash
# Check MySQL service status
# Windows: services.msc
# macOS: brew services list | grep mysql
# Linux: systemctl status mysql

# Verify database credentials
mysql -u your_username -p

# Check if database exists
mysql -u your_username -p -e "SHOW DATABASES;"

# Reset MySQL password (if needed)
# Follow MySQL password reset procedures
```

#### 2. **Port already in use**

**Error**: `EADDRINUSE: address already in use :::3000`

**Solutions**:
```bash
# Find process using the port
# Windows: netstat -ano | findstr :3000
# macOS/Linux: lsof -i :3000

# Kill the process
# Windows: taskkill /PID <PID> /F
# macOS/Linux: kill -9 <PID>

# Or use different ports in .env
PORT=3002
VITE_PORT=3001
```

#### 3. **Node.js version issues**

**Error**: `engine "node" is incompatible with this module`

**Solutions**:
```bash
# Check current Node.js version
node --version

# Install correct version using nvm
# Windows: nvm install 20.x.x && nvm use 20.x.x
# macOS/Linux: nvm install 20 && nvm use 20

# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 4. **Environment variables not loading**

**Error**: Configuration not found or default values used

**Solutions**:
```bash
# Verify .env file exists and has correct format
cat .env  # macOS/Linux
type .env # Windows

# Check for BOM or encoding issues
# Save .env file as UTF-8 without BOM

# Restart the application after .env changes
npm start
```

#### 5. **Database migration fails**

**Error**: Migration failed or tables not created

**Solutions**:
```bash
# Reset database and re-run migrations
cd server
npm run migration:reset
npm run migration:run

# Or manually drop and recreate database
mysql -u root -p -e "DROP DATABASE medcare_hospital; CREATE DATABASE medcare_hospital;"
npm run migration:run
```

#### 6. **Frontend build errors**

**Error**: Build fails or white screen

**Solutions**:
```bash
# Clear build cache
rm -rf dist node_modules/.vite

# Reinstall dependencies
npm install

# Check for TypeScript errors
npm run typecheck

# Build in verbose mode
npm run build -- --mode development
```

### Logs and Debugging

#### Check Application Logs

```bash
# Frontend logs (in browser)
# Open Developer Tools > Console

# Backend logs
cd server
tail -f tmp/logs/app.log

# Or enable debug mode
DEBUG=* npm run dev
```

#### Database Query Logs

```sql
# Enable MySQL query log
SET GLOBAL general_log = 'ON';
SET GLOBAL general_log_file = '/var/log/mysql/queries.log';

# Monitor queries
tail -f /var/log/mysql/queries.log
```

### Performance Issues

#### Slow Loading

1. **Check System Resources**
   ```bash
   # Monitor CPU and memory
   # Windows: Task Manager
   # macOS: Activity Monitor
   # Linux: htop or top
   ```

2. **Database Performance**
   ```sql
   # Check slow queries
   SHOW VARIABLES LIKE 'slow_query_log';
   SET GLOBAL slow_query_log = 'ON';
   ```

3. **Network Issues**
   ```bash
   # Test API connectivity
   curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/api/health
   ```

---

## Post-Installation

### Security Configuration

1. **Change Default Passwords**
   ```bash
   # Login as super admin and change password
   # Navigate to User Management > Edit Profile
   ```

2. **Configure User Roles**
   ```bash
   # Set up proper role permissions
   # Navigate to Administration > Roles & Permissions
   ```

3. **Enable SSL (Production)**
   ```bash
   # Configure HTTPS in production
   # Use Let's Encrypt for free SSL certificates
   certbot --nginx -d yourdomain.com
   ```

### Backup Configuration

1. **Database Backup**
   ```bash
   # Create daily backup script
   mysqldump -u username -p medcare_hospital > backup_$(date +%Y%m%d).sql
   ```

2. **File Backup**
   ```bash
   # Backup uploaded files and configuration
   tar -czf medcare_backup_$(date +%Y%m%d).tar.gz \
       uploads/ .env storage/
   ```

### Monitoring Setup

1. **Health Monitoring**
   ```bash
   # Setup monitoring endpoint
   curl http://localhost:3001/api/health
   ```

2. **Log Rotation**
   ```bash
   # Configure log rotation (Linux)
   # Add to /etc/logrotate.d/medcare
   /path/to/medcare/server/tmp/logs/*.log {
       daily
       rotate 30
       compress
       missingok
       create 644 www-data www-data
   }
   ```

### Next Steps

1. **User Training**: Review the User Guide documentation
2. **Data Import**: Import existing patient data if needed
3. **Customization**: Configure hospital-specific settings
4. **Integration**: Setup email, SMS, and payment gateways
5. **Testing**: Perform comprehensive testing with real scenarios

---

## Support and Resources

### Getting Help

- **Documentation**: Check the complete documentation in `/docs/`
- **API Reference**: Review API endpoints at `/docs/api-reference.md`
- **User Guide**: Training materials at `/docs/user-guide.md`
- **GitHub Issues**: Report bugs and feature requests
- **Community Forum**: Join our community discussions

### Useful Commands Reference

```bash
# Development
npm start              # Start both frontend and backend
npm run dev           # Frontend only
npm run server:dev    # Backend only

# Building
npm run build         # Frontend build
npm run build:full    # Both frontend and backend

# Database
npm run migration:run # Run database migrations
npm run db:seed      # Seed database with data

# Testing
npm run test         # Run tests
npm run lint         # Check code quality

# Production
npm run server:start # Start production server
```

### System Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   React + Vite  │◄──►│   AdonisJS      │◄──►│    MySQL        │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

Congratulations! Your MedCare Hospital Management System is now installed and ready to use. The system provides comprehensive hospital management capabilities with a modern, user-friendly interface.

For additional help and advanced configuration options, please refer to the other documentation files in the `/docs/` directory.
