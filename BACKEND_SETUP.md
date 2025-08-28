# Backend API Setup Guide

This guide will help you set up the Node.js backend API for the MedCare Hospital Management System.

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## 🚀 Quick Setup

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
npm run server:install
```

### Step 2: Database Setup

1. **Start MySQL service** (make sure MySQL is running)

2. **Create the database:**
   ```sql
   CREATE DATABASE medcare_rural CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Create a MySQL user (optional but recommended):**
   ```sql
   CREATE USER 'medcare_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON medcare_rural.* TO 'medcare_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Step 3: Environment Configuration

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Copy the environment template:**
   ```bash
   copy .env.example .env
   ```

3. **Edit the `.env` file** with your database credentials:
   ```env
   NODE_ENV=development
   PORT=3001

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=medcare_rural
   DB_USER=root
   DB_PASSWORD=your_mysql_password

   # JWT Configuration (generate secure keys for production)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d

   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173
   ```

### Step 4: Initialize Database

```bash
# From the root directory
npm run server:seed
```

This will:
- Create all necessary tables
- Insert default user accounts
- Add sample patient data

### Step 5: Start the Development Servers

```bash
# Option 1: Run both frontend and backend together
npm run dev:full

# Option 2: Run them separately
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend  
npm run server:dev
```

## 🔑 Default Login Credentials

After seeding, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@medcare.com | admin123 |
| Doctor | doctor@medcare.com | doctor123 |
| Nurse | nurse@medcare.com | nurse123 |
| Receptionist | receptionist@medcare.com | reception123 |

## 🌐 API Endpoints

The backend API will be available at: `http://localhost:3001`

### Health Check
- `GET /health` - Check if the API is running

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)
- `GET /api/auth/me` - Get current user profile

### Patient Management
- `GET /api/patients` - Get all patients (with pagination)
- `POST /api/patients` - Create new patient
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

## 🔧 Testing the API

### Using curl:
```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medcare.com","password":"admin123"}'

# Get patients (replace TOKEN with the JWT from login)
curl http://localhost:3001/api/patients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using a REST client:
You can use tools like Postman, Insomnia, or VS Code REST Client extension to test the API endpoints.

## 🐛 Troubleshooting

### Database Connection Issues
1. **Check MySQL is running:**
   ```bash
   # Windows
   net start mysql

   # Check MySQL status
   mysql -u root -p -e "SELECT 1"
   ```

2. **Verify database exists:**
   ```sql
   SHOW DATABASES;
   USE medcare_rural;
   SHOW TABLES;
   ```

### Port Conflicts
If port 3001 is already in use:
1. Change the PORT in `server/.env`
2. Update CORS_ORIGIN if needed
3. Update any frontend API URLs

### Permission Issues
If you get permission errors:
1. Check MySQL user permissions
2. Verify file permissions in the project directory

## 📁 Project Structure

```
server/
├── src/
│   ├── config/          # Database configuration
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API route handlers
│   ├── scripts/         # Utility scripts
│   ├── utils/           # Helper functions
│   └── server.js        # Main server file
├── .env                 # Environment variables
├── .env.example         # Environment template
├── package.json         # Dependencies
└── README.md           # Documentation
```

## 🔒 Security Notes

- Change all default passwords in production
- Use strong JWT secrets
- Enable SSL/HTTPS in production
- Implement proper backup strategies
- Review and update CORS settings for production

## 📝 Next Steps

1. **Customize the API** for your specific needs
2. **Add more endpoints** as required
3. **Implement additional security** measures
4. **Set up monitoring** and logging
5. **Deploy to production** environment

For detailed API documentation, see `/server/README.md`
