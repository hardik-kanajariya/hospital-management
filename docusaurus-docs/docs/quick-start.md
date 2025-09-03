---
sidebar_position: 2
---

# Quick Start Guide

Get your MedCare Pro Hospital Management System up and running in under 10 minutes! This guide will walk you through the essential steps to deploy and configure your healthcare management solution.

## 🎯 Before You Begin

### System Requirements
- **Node.js**: Version 18.0 or higher
- **MySQL**: Version 8.0 or higher  
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: At least 10GB free space
- **Operating System**: Windows 10+, macOS 10.15+, or Linux

### What You'll Need
- ✅ MySQL database credentials
- ✅ SMTP email configuration (optional but recommended)
- ✅ Domain name or server IP address
- ✅ Basic command line knowledge

## 🚀 5-Minute Quick Setup

### Step 1: Download and Extract
1. Download MedCare Pro from CodeCanyon
2. Extract the files to your desired directory
3. Open terminal/command prompt

### Step 2: Backend Setup
```bash
# Navigate to server directory
cd hospital-management/server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Step 3: Configure Environment
Edit the `.env` file with your settings:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_DATABASE=medcare_pro

# Application Settings
APP_KEY=your_32_character_secret_key
APP_URL=http://localhost:3333
NODE_ENV=development

# Email Configuration (Optional)
MAIL_DRIVER=smtp
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USERNAME=your_email@domain.com
SMTP_PASSWORD=your_email_password
```

### Step 4: Database Setup
```bash
# Create database
mysql -u your_username -p -e "CREATE DATABASE medcare_pro;"

# Run migrations
node ace migration:run

# Seed demo data (optional)
node ace db:seed
```

### Step 5: Start Backend Server
```bash
# Start the backend server
npm run dev
```
Backend will be running at: `http://localhost:3333`

### Step 6: Frontend Setup
Open a new terminal:
```bash
# Navigate to frontend directory
cd hospital-management

# Install dependencies
npm install

# Start frontend development server
npm run dev
```
Frontend will be running at: `http://localhost:5173`

## 🎉 Success! Your System is Ready

Visit `http://localhost:5173` to access your MedCare Pro system.

### Default Login Credentials

#### Super Admin
- **Email**: superadmin@medcarepro.com
- **Password**: SuperAdmin@123

#### Hospital Admin  
- **Email**: admin@hospital.com
- **Password**: HospitalAdmin@123

#### Doctor
- **Email**: doctor@hospital.com
- **Password**: Doctor@123

> ⚠️ **Security Note**: Change all default passwords immediately after login!

## 🔧 Next Steps

### 1. Initial Configuration
- [ ] Change default passwords
- [ ] Configure organization settings
- [ ] Set up user roles and permissions
- [ ] Configure email settings
- [ ] Upload organization logo

### 2. Master Data Setup
- [ ] Add departments
- [ ] Configure bed types and rooms
- [ ] Set up appointment types
- [ ] Configure lab test categories
- [ ] Add inventory categories

### 3. User Management
- [ ] Create doctor accounts
- [ ] Add nursing staff
- [ ] Set up receptionist accounts
- [ ] Configure role permissions
- [ ] Test user access levels

## 🆘 Need Help?

### Common Issues

**Database Connection Error**
- Check MySQL is running
- Verify database credentials in `.env`
- Ensure database exists

**Port Already in Use**
- Backend: Change `PORT` in `.env` file
- Frontend: Change port in `vite.config.ts`

**Permission Errors**
- Check file permissions
- Run as administrator (Windows) or use `sudo` (Linux/Mac)

### Getting Support
- 📖 **Full Documentation**: [Complete User Guide](./user-guide)
- 🔧 **Technical Details**: [Installation Guide](./installation)
- 💬 **Support**: Contact support@medcarepro.com
- 🐛 **Issues**: GitHub Issues page

## 🎊 What's Next?

Now that your system is running, explore these key features:

1. **[Patient Management](./user-guide#patient-management)** - Add your first patient
2. **[Appointment Scheduling](./user-guide#appointments)** - Schedule your first appointment
3. **[Medical Records](./user-guide#medical-records)** - Create medical records
4. **[Billing System](./user-guide#billing)** - Generate bills and track payments

Congratulations! You're ready to revolutionize your healthcare operations with MedCare Pro! 🏥✨
