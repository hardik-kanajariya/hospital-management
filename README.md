# MedCare Rural - Hospital Management System

## Overview

MedCare Rural is a comprehensive hospital management system specifically designed for rural healthcare facilities in India. Built with modern web technologies and optimized for areas with limited internet connectivity, it provides a complete solution for small to medium-sized hospitals.

### Key Features

- **Complete Hospital Management**: Patient records, appointments, billing, inventory, lab tests, and bed management
- **Offline-First Architecture**: Works without internet connection using IndexedDB with automatic synchronization
- **Role-Based Security**: Multi-level access control for different hospital staff
- **Rural Healthcare Focus**: Designed for the unique challenges of rural hospitals
- **Multi-Language Support**: Hindi, English, and regional languages
- **Mobile Responsive**: Works on tablets, phones, and desktop computers

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: MySQL with IndexedDB for offline storage
- **Backend**: Node.js with Express.js API
- **Authentication**: JWT-based with role permissions
- **Offline Storage**: IndexedDB with automatic sync
- **PWA Support**: Progressive Web App capabilities

## Installation

### Prerequisites

- Node.js 18.0 or higher
- MySQL 8.0 or higher
- npm or yarn package manager

### Quick Start

1. **Clone or extract the project**
```bash
# If you have the source code
git clone <repository-url>
cd medcare-rural

# If you have the zip file
unzip medcare-rural.zip
cd medcare-rural
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=medcare_rural
DB_USER=your_username
DB_PASSWORD=your_password

# Application Settings
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_APP_NAME="MedCare Rural"

# Security
JWT_SECRET=your_jwt_secret_key_here
ENCRYPTION_KEY=your_encryption_key_here

# SMS Configuration (Optional)
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=HOSPITAL

# Email Configuration (Optional)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_app_password
```

4. **Database Setup**
```bash
# Create database and run migrations
npm run db:setup
npm run db:migrate
npm run db:seed
```

5. **Start the application**
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm run start
```

6. **Access the application**
- Open your browser and go to `http://localhost:3000`
- Use the default credentials for testing:
  - Super Admin: `admin@hospital.com` / `password`
  - Doctor: `doctor@hospital.com` / `password`
  - Nurse: `nurse@hospital.com` / `password`

## Project Structure

```
medcare-rural/
├── docs/                       # Documentation files
│   ├── index.html             # Main documentation page
│   ├── api-reference.md       # API documentation
│   └── user-guide.md          # User guide
├── src/
│   ├── components/            # React components
│   │   ├── auth/             # Authentication components
│   │   ├── hospital/         # Hospital management components
│   │   ├── landing/          # Landing page components
│   │   └── ui/               # shadcn/ui components
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts        # Authentication hook
│   │   ├── useDatabase.ts    # Database operations hooks
│   │   └── useNotifications.ts
│   ├── lib/                  # Utility libraries
│   │   ├── database.ts       # Database management
│   │   ├── api-endpoints.ts  # API endpoint definitions
│   │   └── utils.ts          # Helper utilities
│   ├── types/                # TypeScript type definitions
│   ├── App.tsx               # Main application component
│   ├── index.css             # Global styles
│   └── main.tsx              # Application entry point
├── public/                   # Static assets
├── .env.example              # Environment template
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## Architecture

### Database Architecture

The system uses a hybrid approach:
- **MySQL Database**: Primary data storage for server-side operations
- **IndexedDB**: Local browser storage for offline functionality
- **Automatic Sync**: Changes sync between local and server when online

### Key Tables

- `patients` - Patient information and medical history
- `appointments` - Appointment scheduling and tracking
- `doctors` - Doctor profiles and availability
- `medical_records` - Electronic health records
- `billing` - Invoices and payment tracking
- `inventory` - Medical supplies and medication tracking
- `lab_tests` - Laboratory test management
- `beds` - Bed occupancy and room management
- `users` - System users and authentication
- `notifications` - System notifications and alerts

### API Endpoints

The system provides RESTful API endpoints for all operations:

- `GET /api/patients` - List all patients
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

Similar patterns exist for all other modules. See `src/lib/api-endpoints.ts` for complete endpoint definitions.

## User Roles and Permissions

### Super Admin
- Complete system access
- User management
- System configuration
- All administrative functions

### Doctor
- Patient records (read/write)
- Appointments (read/write)
- Medical records (read/write)
- Prescriptions (read/write)
- Lab test orders (read/write)

### Nurse
- Patient records (read/limited write)
- Appointments (read)
- Medical records (read/limited write)
- Vital signs (read/write)
- Medication administration (read/write)

### Billing Manager
- Billing and invoicing (read/write)
- Payment processing (read/write)
- Insurance claims (read/write)
- Financial reports (read)

### Medical Store Manager
- Inventory management (read/write)
- Purchase orders (read/write)
- Stock tracking (read/write)
- Supplier management (read/write)

### Lab Technician
- Lab tests (read/write)
- Test results (read/write)
- Report generation (read/write)
- Equipment management (read/write)

### Receptionist
- Patient registration (read/write)
- Appointment booking (read/write)
- Basic billing (read)

## Development

### Adding New Features

1. **Create Component**: Add new React component in appropriate directory
2. **Add Database Hook**: Create custom hook in `src/hooks/`
3. **Update API**: Add new endpoints in `src/lib/api-endpoints.ts`
4. **Add Permissions**: Update role permissions in `src/hooks/useAuth.ts`
5. **Update Navigation**: Add to main navigation in `src/App.tsx`

### Custom Hooks

The system uses custom hooks for data management:

```typescript
// Example: Using the patient management hook
import { usePatients } from '@/hooks/useDatabase'

function PatientComponent() {
  const { patients, loading, error, addPatient, updatePatient } = usePatients()
  
  // Component logic here
}
```

### Database Operations

All database operations go through the centralized database class:

```typescript
import { db } from '@/lib/database'

// Get all records
const patients = await db.getAll('patients')

// Add new record
const id = await db.add('patients', patientData)

// Update record
await db.update('patients', id, updates)

// Delete record
await db.delete('patients', id)
```

### Offline Support

The system automatically handles offline/online states:
- Data is stored locally in IndexedDB when offline
- Changes are queued for synchronization
- Automatic sync when internet connection is restored
- Visual indicators show connection status

## Customization

### Theming

Colors and styling can be customized in `src/index.css`:

```css
:root {
  --primary: oklch(0.6 0.12 240);      /* Primary brand color */
  --secondary: oklch(0.96 0 0);        /* Secondary color */
  --accent: oklch(0.7 0.15 140);       /* Accent color */
  --destructive: oklch(0.65 0.2 20);   /* Warning/error color */
  /* ... other color variables */
}
```

### Adding Custom Fields

To add custom fields to any module:

1. Update the TypeScript interface
2. Add fields to the database migration
3. Update the form components
4. Add validation rules

### Multi-Language Support

The system supports multiple languages. To add a new language:

1. Create translation files
2. Update the language selector
3. Add locale-specific formatting

## Deployment

### Production Build

```bash
# Build for production
npm run build

# The build files will be in the 'dist' directory
```

### Docker Deployment

```bash
# Build Docker image
docker build -t medcare-rural .

# Run with Docker Compose
docker-compose up -d
```

### Server Requirements

- **Minimum**: 4GB RAM, 2 CPU cores, 100GB storage
- **Recommended**: 8GB RAM, 4 CPU cores, 500GB storage
- **Operating System**: Ubuntu 20.04+ or CentOS 8+
- **Database**: MySQL 8.0+
- **Web Server**: Nginx (recommended) or Apache

## Security

### Data Encryption
- All sensitive data is encrypted at rest
- JWT tokens for authentication
- HTTPS required for production
- HIPAA-compliant data handling

### Access Control
- Role-based permissions
- Session timeout management
- Audit trail logging
- Failed login attempt monitoring

## Testing

### Running Tests

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e
```

### Test Coverage

The system includes comprehensive tests for:
- Authentication and authorization
- Database operations
- API endpoints
- Component functionality
- Offline/online sync

## Performance

### Optimization Features
- Lazy loading of components
- Database query optimization
- Caching strategies
- Image optimization
- Bundle splitting

### Monitoring
- Performance metrics tracking
- Error logging and reporting
- User activity monitoring
- System health checks

## Support and Maintenance

### Getting Help

1. **Documentation**: Check the docs/ directory for detailed guides
2. **Issues**: Report bugs or request features
3. **Email Support**: For licensed users
4. **Phone Support**: Available with premium support plans

### Maintenance

- Regular backups (automated)
- Software updates (quarterly)
- Security patches (as needed)
- Performance monitoring (continuous)

### Backup and Recovery

```bash
# Create database backup
npm run backup:create

# Restore from backup
npm run backup:restore backup_filename.sql

# Automated daily backups (configure in cron)
0 2 * * * /path/to/backup-script.sh
```

## License

This is a premium commercial software product. All rights reserved.

**IMPORTANT**: This software requires a valid license for use. Unauthorized use, distribution, or modification is strictly prohibited and may result in legal action.

### License Types

- **Single Hospital License**: ₹25,000 - ₹40,000 (one-time)
- **Multi-Location License**: Custom pricing
- **Enterprise License**: Custom pricing with additional features

### What's Included

- Software license
- Installation support
- Basic documentation
- Email support (first year)
- Software updates (first year)

### Support Plans

- **Basic Support**: ₹15,000/year
- **Professional Support**: ₹25,000/year  
- **Enterprise Support**: ₹50,000/year

## Contributing

For licensed users who want to contribute:

1. Follow the coding standards
2. Write comprehensive tests
3. Update documentation
4. Submit pull requests for review

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Complete hospital management features
- Offline support
- Role-based authentication
- Multi-language support

---

**© 2024 MedCare Rural. All rights reserved.**

For technical support: support@medcare-rural.com  
For sales inquiries: sales@medcare-rural.com  
Phone: +91-XXXX-XXXXXX