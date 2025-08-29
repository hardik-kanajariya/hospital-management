---
applyTo: '**'
---
# GitHub Copilot Instructions for Hospital Management System

## System Overview
This is a full-stack hospital management system with:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + MySQL
- **Architecture**: RESTful API with role-based authentication
- **Database**: MySQL with comprehensive medical data models

## 🚨 CRITICAL TERMINAL RESTRICTIONS

### ❌ PROHIBITED COMMANDS - DO NOT RUN:
- `npm start`
- `npm run dev` 
- `npm run build`
- `node server.js`
- Any server restart commands
- Any service restart commands
- Database restart commands
- if file gets currupted do not fix that, ask user to fix that and you will continue with other activity.

### ✅ ALLOWED COMMANDS:
- `npm install` / `npm i` (package installation only)
- `git` commands
- File operations (`ls`, `dir`, `cat`, etc.)
- Database query commands (when specifically requested)
- Test commands (`npm test`)
- we use windows powershell
- we are on windows 11 


### 📊 CHECKING RUNNING SERVICES
The development servers are ALWAYS running and managed by the user. To check their status:
1. Use `get_terminal_output` tool with available terminal IDs
2. Check the active terminals list in context
3. Current active terminals include:
   - Terminal ID 3344 (esbuild)
   - Terminal ID 8012 (node server)

## Project Structure Guidelines

### Frontend (`/src`)
- **Components**: Organized by feature (auth, hospital, landing, ui)
- **Hooks**: Custom React hooks for data management
- **Types**: TypeScript definitions for auth and hospital entities
- **Styles**: Theme-based CSS with Tailwind

### Backend (`/server`)
- **Models**: Sequelize models for all medical entities
- **Routes**: RESTful API endpoints by feature
- **Middleware**: Authentication, error handling, validation
- **Scripts**: Database seeding and migration utilities

### Database (`/database`)
- **Schema**: Complete MySQL schema with medical data models
- **Seeds**: Demo data population scripts
- **Documentation**: Database setup and relationship guides

## Development Workflow

### 1. Code Analysis
- Always read existing code before making changes
- Understand the current authentication flow (JWT-based)
- Check existing API endpoints before creating new ones
- Review database models for relationships

### 2. Making Changes
- Follow existing patterns and conventions
- Use TypeScript types consistently
- Maintain proper error handling
- Follow RESTful API design principles

### 3. Testing Changes
- do not test, ask user and wait for the user input to verify the changes

## Key System Features

### Authentication & Authorization
- Role-based access control (admin, doctor, nurse, receptionist, etc...)
- JWT token authentication
- Protected routes and API endpoints

### Medical Management
- **Patients**: Registration, medical history, contact info
- **Doctors**: Scheduling, specializations, availability
- **Appointments**: Booking, rescheduling, status management
- **Medical Records**: Patient history, diagnoses, treatments
- **Prescriptions**: Medication management and tracking
- **Lab Tests**: Test orders, results, reporting
- **Billing**: Invoice generation, payment tracking
- **Inventory**: Medical supplies and equipment tracking
- **Bed Management**: Room assignments, availability
- **Notifications**: Real-time alerts and messaging

### Technical Implementation
- **State Management**: React hooks with local storage sync
- **API Communication**: Axios with error handling
- **Database**: MySQL with Sequelize ORM
- **Real-time Features**: WebSocket notifications
- **Offline Support**: Local storage fallback

## File Naming Conventions
- **Components**: PascalCase (e.g., `PatientManagement.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.ts`)
- **Utils**: camelCase (e.g., `database.ts`)
- **API Routes**: kebab-case (e.g., `medical-records.js`)

## Database Best Practices
- All models have proper relationships defined
- Use transactions for multi-table operations
- Implement proper indexes for performance
- Follow medical data privacy standards
- Validate all input data before database operations

## Error Handling Standards
- Use consistent error response format
- Log errors appropriately (without sensitive data)
- Provide meaningful error messages to frontend
- Handle database connection errors gracefully

## Security Considerations
- Never expose sensitive medical data
- Validate all user inputs
- Use parameterized queries to prevent SQL injection
- Implement proper CORS policies
- Secure file upload handling

## Code Quality Guidelines
- Write self-documenting code with clear variable names
- Add comments for complex medical business logic
- Follow ESLint and TypeScript strict mode
- Maintain consistent indentation and formatting
- Use proper TypeScript types instead of 'any'

## When Working on Features
1. **Read existing code** to understand current implementation
2. **Check for similar patterns** in the codebase
3. **Understand the data flow** from frontend to database
4. **Test thoroughly** without restarting services
5. **Follow medical workflow requirements** from PRD.md

## Getting System Status
- Use terminal output tools to check server logs
- Frontend auto-reloads on file changes (Vite dev server)
- Backend auto-reloads on file changes (nodemon)
- Database connections are persistent

## Remember
- The system handles real medical data workflows
- Maintain HIPAA-compliant practices in code
- Performance matters for hospital operations
- User experience is critical for medical staff efficiency
- Always consider error scenarios in medical contexts

---
*This system is designed for hospital operations - code changes should always prioritize reliability, security, and medical workflow efficiency.*
