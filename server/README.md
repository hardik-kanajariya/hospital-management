# MedCare Hospital Management - Node.js API Server

A comprehensive Node.js backend API for the MedCare Hospital Management System built with Express.js, Sequelize ORM, and MySQL.

## Features

- 🔐 **Authentication & Authorization**: JWT-based auth with role-based access control
- 👥 **User Management**: Multi-role user system (admin, doctor, nurse, etc.)
- 🏥 **Patient Management**: Complete patient records and information
- 📅 **Appointment System**: Scheduling and management
- 📋 **Medical Records**: Patient medical history and documentation
- 💰 **Billing System**: Healthcare billing and payments
- 🧪 **Laboratory Management**: Lab tests and results
- 📦 **Inventory Management**: Medical supplies and equipment
- 🛏️ **Bed Management**: Hospital bed allocation and status
- 📊 **Dashboard & Analytics**: Real-time insights and reports
- 🔄 **Real-time Updates**: Socket.IO for live notifications

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi & Express-validator
- **Real-time**: Socket.IO
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Morgan
- **File Upload**: Multer

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   ├── errorHandler.js      # Error handling
│   │   └── notFound.js          # 404 handler
│   ├── models/
│   │   ├── User.js              # User model
│   │   └── Patient.js           # Patient model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── users.js             # User management
│   │   ├── patients.js          # Patient management
│   │   └── ...                  # Other route modules
│   ├── scripts/
│   │   └── seed.js              # Database seeding
│   ├── utils/
│   │   ├── auth.js              # Auth utilities
│   │   └── response.js          # Response helpers
│   └── server.js                # Main server file
├── .env.example                 # Environment variables template
└── package.json                 # Dependencies and scripts
```

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

### 3. Database Setup

Make sure MySQL is running and create the database:

```sql
CREATE DATABASE medcare_rural CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run Database Migrations & Seeding

```bash
# Seed initial data (creates default users and sample patients)
npm run seed
```

### 5. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users` - Get all users (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)

### Patient Management
- `GET /api/patients` - Get all patients with pagination/search
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient (Admin only)

### Other Modules
- `/api/doctors` - Doctor management
- `/api/appointments` - Appointment scheduling
- `/api/medical-records` - Medical records
- `/api/billing` - Billing system
- `/api/inventory` - Inventory management
- `/api/lab` - Laboratory management
- `/api/beds` - Bed management
- `/api/dashboard` - Dashboard statistics

## Default Users

After running the seed script, you can login with these default accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@medcare.com | admin123 | super_admin |
| doctor@medcare.com | doctor123 | doctor |
| nurse@medcare.com | nurse123 | nurse |
| receptionist@medcare.com | reception123 | receptionist |

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Different permission levels for different roles
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input validation and sanitization
- **CORS Protection**: Configurable CORS settings
- **Helmet Security**: Security headers with Helmet.js
- **Password Hashing**: bcrypt for secure password storage

## Real-time Features

The API includes Socket.IO for real-time features:

- **Live Notifications**: Real-time appointment notifications
- **Emergency Alerts**: Instant emergency notifications
- **Bed Status Updates**: Live bed availability updates
- **Room-based Communication**: Department-specific message rooms

## Environment Variables

```env
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=medcare_rural
DB_USER=root
DB_PASSWORD=

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

## Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
