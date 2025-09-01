# Hospital Management System - Component Structure

This directory contains all hospital management components organized into logical modules for better maintainability and scalability.

## 📁 Module Structure

### 🏥 **patients/** - Patient Management
- `CreatePatient.tsx` - Patient registration form
- `EditPatient.tsx` - Patient information editing
- `PatientList.tsx` - Patient listing and search
- `PatientProfile.tsx` - Individual patient profile view
- `PatientManagement.tsx` - Main patient management hub

### 📅 **appointments/** - Appointment Management
- `AppointmentList.tsx` - Appointment booking and scheduling system

### 👨‍⚕️ **doctors/** - Doctor Management
- `DoctorSchedule.tsx` - Doctor availability and schedule management

### 📋 **medical/** - Medical Records
- `MedicalRecordsList.tsx` - Patient medical history and records management

### 💰 **billing/** - Billing System
- `BillingSystem.tsx` - Basic billing functionality
- `EnhancedBillingSystem.tsx` - Advanced billing with insurance support

### 🧪 **laboratory/** - Laboratory Management
- `LabManagement.tsx` - Lab test ordering, results, and management

### 📦 **inventory/** - Inventory Management
- `InventoryManagement.tsx` - Medical supplies and equipment tracking

### 🏨 **facilities/** - Hospital Facilities
- `BedManagement.tsx` - Bed allocation and room management

### 📊 **dashboard/** - Dashboard Views
- `Dashboard.tsx` - Main hospital dashboard with analytics

### 🔔 **notifications/** - Notification System
- `NotificationCenter.tsx` - Real-time notifications and alerts

### ⚙️ **administration/** - System Administration
- `RoleManagement.tsx` - User roles and permissions
- `SuperAdminDashboard.tsx` - Super admin control panel
- `SuperAdminUserManagement.tsx` - User account management
- `SystemSettings.tsx` - System configuration and settings

## 🚀 Usage

### Import Individual Components
```typescript
import { CreatePatient, PatientList } from '@/components/hospital/patients'
import { AppointmentList } from '@/components/hospital/appointments'
import { Dashboard } from '@/components/hospital/dashboard'
```

### Import Entire Modules
```typescript
import * as Patients from '@/components/hospital/patients'
import * as Administration from '@/components/hospital/administration'
```

### Legacy Imports (Backward Compatibility)
```typescript
// These still work but are deprecated
import { PatientCreate, PatientEdit } from '@/components/hospital'
```

## 📝 Naming Conventions

- **Components**: PascalCase (e.g., `CreatePatient.tsx`)
- **Directories**: lowercase (e.g., `patients/`, `appointments/`)
- **Index files**: Export all module components for easy importing

## 🔄 Migration Guide

If you're updating imports from the old flat structure:

| Old Import | New Import |
|------------|------------|
| `import PatientCreate from '../hospital/PatientCreate'` | `import { CreatePatient } from '../hospital/patients'` |
| `import PatientEdit from '../hospital/PatientEdit'` | `import { EditPatient } from '../hospital/patients'` |
| `import SuperAdminDashboard from '../hospital/SuperAdminDashboard'` | `import { SuperAdminDashboard } from '../hospital/administration'` |

## 🏗️ Benefits of This Structure

1. **Better Organization**: Related components are grouped together
2. **Easier Maintenance**: Modules can be worked on independently
3. **Scalability**: Easy to add new features within existing modules
4. **Clear Dependencies**: Module boundaries make dependencies obvious
5. **Team Collaboration**: Different teams can work on different modules
6. **Code Reusability**: Modules can be easily reused or extracted

## 🔮 Future Considerations

- Each module could potentially be extracted into separate packages
- Shared utilities and types could be moved to a common module
- Module-specific hooks and services could be co-located
- Module-level testing strategies can be implemented

---

*This structure follows modern React/TypeScript best practices for large-scale applications.*
