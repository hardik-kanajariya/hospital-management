# Customization Guide

## Overview

MedCare Pro is designed to be highly customizable to meet the specific needs of different healthcare organizations. The system provides multiple layers of customization including themes, role-based fields, master data, system settings, and component-level modifications.

## Theme Customization

### 1. Color Scheme Customization

The application uses a **Radix-based color system** with TailwindCSS that can be completely customized.

#### Custom Theme Configuration

Create or modify the `theme.json` file in the project root:

```json
{
  "colors": {
    "primary": {
      "1": "#fefefe",
      "2": "#f9f9f9",
      "3": "#f0f0f0",
      "4": "#e8e8e8",
      "5": "#e0e0e0",
      "6": "#d9d9d9",
      "7": "#cecece",
      "8": "#bbbbbb",
      "9": "#8d8d8d",
      "10": "#838383",
      "11": "#646464",
      "12": "#202020"
    },
    "accent": {
      "1": "#fefcfe",
      "2": "#fdf7fd",
      "3": "#f9f1f9",
      "4": "#f4eaf4",
      "5": "#eee1ee",
      "6": "#e6d6e6",
      "7": "#dcc7dc",
      "8": "#d1b3d1",
      "9": "#bd96bd",
      "10": "#b088b0",
      "11": "#9c7a9c",
      "12": "#3d2e3d"
    }
  },
  "branding": {
    "organizationName": "City General Hospital",
    "logo": "/path/to/custom-logo.png",
    "favicon": "/path/to/custom-favicon.ico"
  }
}
```

#### TailwindCSS Configuration

The theme system automatically loads custom colors into TailwindCSS:

```javascript
// tailwind.config.js (already configured)
import fs from "fs";

let theme = {};
try {
  const themePath = "./theme.json";
  if (fs.existsSync(themePath)) {
    theme = JSON.parse(fs.readFileSync(themePath, "utf-8"));
  }
} catch (err) {
  console.error('failed to parse custom styles', err)
}

// Colors are automatically applied to the default theme
```

#### CSS Custom Properties

Colors are automatically converted to CSS custom properties:

```css
:root {
  --color-primary-1: /* from theme.json */;
  --color-primary-2: /* from theme.json */;
  /* ... */
}
```

### 2. Logo and Branding

#### Organization Logo

Update organization branding in the theme configuration or system settings:

```typescript
// Via API
POST /api/system/settings
{
  "key": "organization_logo",
  "value": "/uploads/custom-logo.png",
  "category": "branding"
}
```

#### Favicon and App Icons

Replace the following files in the `public` directory:
- `favicon.ico`
- `manifest.json` (PWA icons)
- `apple-touch-icon.png`

### 3. Layout Customization

#### Custom CSS Variables

Add custom CSS variables in `src/main.css`:

```css
:root {
  /* Custom spacing */
  --header-height: 4rem;
  --sidebar-width: 16rem;
  
  /* Custom shadows */
  --shadow-custom: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  
  /* Custom borders */
  --border-radius-custom: 0.75rem;
}
```

## Role-Based Field Customization

### 1. Dynamic Role Fields

MedCare Pro supports **dynamic role fields** that allow adding custom fields to user profiles based on their role.

#### Available Field Types

```typescript
type FieldType = 
  | 'text'          // Single line text
  | 'email'         // Email validation
  | 'number'        // Numeric input
  | 'decimal'       // Decimal numbers
  | 'boolean'       // Checkbox
  | 'date'          // Date picker
  | 'datetime'      // Date and time picker
  | 'select'        // Dropdown selection
  | 'multi_select'  // Multiple selection
  | 'textarea'      // Multi-line text
  | 'file'          // File upload
  | 'phone'         // Phone number
  | 'url'           // URL validation
```

#### Creating Custom Role Fields

Use the API to create custom fields for any role:

```typescript
// Create a specialization field for doctors
POST /api/role-fields/role/{doctorRoleId}/fields
{
  "fieldName": "specialization",
  "fieldLabel": "Medical Specialization",
  "fieldType": "select",
  "fieldOptions": {
    "options": [
      { "value": "cardiology", "label": "Cardiology" },
      { "value": "neurology", "label": "Neurology" },
      { "value": "orthopedics", "label": "Orthopedics" },
      { "value": "pediatrics", "label": "Pediatrics" }
    ]
  },
  "isRequired": true,
  "description": "Doctor's primary medical specialization"
}

// Create a department field
POST /api/role-fields/role/{doctorRoleId}/fields
{
  "fieldName": "department",
  "fieldLabel": "Department",
  "fieldType": "text",
  "isRequired": true,
  "validationRules": {
    "maxLength": 100
  }
}

// Create a license number field
POST /api/role-fields/role/{doctorRoleId}/fields
{
  "fieldName": "licenseNumber",
  "fieldLabel": "Medical License Number",
  "fieldType": "text",
  "isRequired": true,
  "validationRules": {
    "pattern": "^[A-Z0-9]{6,12}$",
    "patternMessage": "License number must be 6-12 alphanumeric characters"
  }
}
```

#### Pre-built Role Templates

The system includes templates for common healthcare roles:

```typescript
// Create doctor role with standard fields
POST /api/role-fields/role/{roleId}/fields/doctor-template
{
  "includeFields": [
    "specialization",
    "licenseNumber", 
    "department",
    "experience",
    "education",
    "contactNumber",
    "emergencyContact"
  ]
}
```

### 2. Field Validation Rules

Custom validation can be applied to role fields:

```typescript
{
  "validationRules": {
    "required": true,
    "minLength": 3,
    "maxLength": 100,
    "pattern": "^[A-Za-z ]+$",
    "patternMessage": "Only letters and spaces allowed",
    "min": 0,              // for numbers
    "max": 100,            // for numbers
    "step": 0.1,           // for decimals
    "allowedFileTypes": [".pdf", ".jpg", ".png"], // for files
    "maxFileSize": 5242880 // 5MB in bytes
  }
}
```

## Master Data Customization

### 1. Configurable Dropdown Values

The system uses a **master data** system for configurable dropdown values:

#### Creating Master Data Categories

```typescript
// Create a new category
POST /api/master-data/categories
{
  "category": "blood_types",
  "name": "Blood Types",
  "description": "Available blood type options"
}

// Add values to the category
POST /api/master-data
{
  "category": "blood_types",
  "code": "A_POSITIVE",
  "name": "A+",
  "sortOrder": 1
}

POST /api/master-data
{
  "category": "blood_types", 
  "code": "O_NEGATIVE",
  "name": "O-",
  "sortOrder": 8
}
```

#### Common Master Data Categories

The system comes with pre-configured categories:

```typescript
// Appointment types
POST /api/master-data
{
  "category": "appointment_types",
  "code": "consultation",
  "name": "Consultation",
  "metadata": {
    "duration": 30,
    "color": "#3B82F6"
  }
}

// Medical specializations
POST /api/master-data
{
  "category": "specializations",
  "code": "cardiology",
  "name": "Cardiology",
  "description": "Heart and cardiovascular system"
}

// Lab test categories
POST /api/master-data
{
  "category": "lab_categories",
  "code": "blood_work",
  "name": "Blood Work",
  "metadata": {
    "iconName": "droplet",
    "processingTime": "24 hours"
  }
}
```

### 2. Organization-Specific Master Data

Master data can be global or organization-specific:

```typescript
// Global master data (available to all organizations)
POST /api/master-data
{
  "category": "countries",
  "code": "US",
  "name": "United States",
  "organizationId": null // null = global
}

// Organization-specific master data
POST /api/master-data
{
  "category": "departments",
  "code": "emergency",
  "name": "Emergency Department",
  "organizationId": "org-uuid" // specific to organization
}
```

## System Settings Customization

### 1. Application Settings

Configure system-wide settings via the API:

```typescript
// Organization settings
POST /api/hospital/settings
{
  "organizationName": "City General Hospital",
  "address": "123 Medical Center Dr",
  "phone": "+1-555-0123",
  "email": "info@citygeneral.com",
  "website": "https://www.citygeneral.com",
  "logo": "/uploads/hospital-logo.png",
  "timezone": "America/New_York",
  "dateFormat": "MM/DD/YYYY",
  "timeFormat": "12", // 12 or 24 hour
  "currency": "USD",
  "language": "en"
}

// Appointment settings
POST /api/system/settings
{
  "key": "default_appointment_duration",
  "value": "30",
  "dataType": "number",
  "category": "appointments"
}

POST /api/system/settings
{
  "key": "appointment_reminder_hours",
  "value": "24",
  "dataType": "number",
  "category": "notifications"
}

// Billing settings
POST /api/system/settings
{
  "key": "invoice_due_days",
  "value": "30",
  "dataType": "number",
  "category": "billing"
}

POST /api/system/settings
{
  "key": "late_fee_percentage",
  "value": "5.0",
  "dataType": "number",
  "category": "billing"
}
```

### 2. Feature Toggles

Enable or disable specific features:

```typescript
POST /api/system/settings
{
  "key": "enable_telemedicine",
  "value": "true",
  "dataType": "boolean",
  "category": "features"
}

POST /api/system/settings
{
  "key": "enable_patient_portal",
  "value": "true",
  "dataType": "boolean",
  "category": "features"
}

POST /api/system/settings
{
  "key": "enable_lab_integration",
  "value": "false",
  "dataType": "boolean",
  "category": "integrations"
}
```

## Component Customization

### 1. Custom UI Components

The system uses **Radix UI** components that can be customized:

#### Custom Form Components

Create custom form components for specific needs:

```typescript
// src/components/custom/CustomPatientForm.tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MasterDropdown } from "@/components/ui/MasterDropdown"

const patientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  bloodGroup: z.string().optional(),
  department: z.string().min(1, "Department is required")
})

export function CustomPatientForm() {
  const form = useForm({
    resolver: zodResolver(patientSchema)
  })

  return (
    <form>
      <Input {...form.register("name")} placeholder="Patient Name" />
      <Input {...form.register("email")} type="email" placeholder="Email" />
      
      {/* Master data dropdown */}
      <MasterDropdown 
        category="blood_types"
        {...form.register("bloodGroup")}
        placeholder="Select Blood Group"
      />
      
      {/* Organization-specific dropdown */}
      <MasterDropdown
        category="departments"
        organizationSpecific={true}
        {...form.register("department")}
        placeholder="Select Department"
      />
      
      <Button type="submit">Save Patient</Button>
    </form>
  )
}
```

#### Custom Dashboard Widgets

Create custom dashboard widgets:

```typescript
// src/components/custom/CustomStatsWidget.tsx
export function CustomStatsWidget() {
  const { data: stats } = useQuery({
    queryKey: ['custom-stats'],
    queryFn: () => fetch('/api/dashboard/custom-stats').then(r => r.json())
  })

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="text-lg font-semibold mb-4">Custom Statistics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Total Patients</p>
          <p className="text-2xl font-bold">{stats?.totalPatients}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-2xl font-bold text-green-600">{stats?.thisMonth}</p>
        </div>
      </div>
    </div>
  )
}
```

### 2. Theme Variants

Create component variants for different themes:

```typescript
// src/components/ui/custom-button.tsx
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        medical: "bg-blue-600 text-white hover:bg-blue-700",
        emergency: "bg-red-600 text-white hover:bg-red-700",
        success: "bg-green-600 text-white hover:bg-green-700"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode
  className?: string
}

export function CustomButton({ variant, size, className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </button>
  )
}
```

## Role and Permission Customization

### 1. Custom Role Creation

Create custom roles for specific organizational needs:

```typescript
// Create a custom role
POST /api/roles
{
  "name": "lab_supervisor",
  "displayName": "Laboratory Supervisor",
  "description": "Supervises laboratory operations and staff",
  "permissions": {
    "lab": ["read", "write", "approve"],
    "patients": ["read"],
    "reports": ["read", "generate"],
    "staff": ["read", "manage_lab_staff"]
  }
}

// Create role from template and customize
POST /api/roles/from-template
{
  "templateName": "doctor",
  "customizations": {
    "displayName": "Specialist Doctor",
    "additionalPermissions": {
      "surgery": ["read", "write", "schedule"]
    }
  }
}
```

### 2. Permission Management

Define granular permissions for different modules:

```typescript
// Create custom permissions
POST /api/permissions
{
  "name": "manage_inventory_orders",
  "displayName": "Manage Inventory Orders",
  "module": "inventory",
  "description": "Can create and approve inventory orders"
}

POST /api/permissions
{
  "name": "view_financial_reports",
  "displayName": "View Financial Reports", 
  "module": "billing",
  "description": "Can view detailed financial reports"
}
```

## Workflow Customization

### 1. Custom Appointment Workflows

Customize appointment workflows per organization:

```typescript
// Custom appointment statuses
POST /api/master-data
{
  "category": "appointment_statuses",
  "code": "pre_screening",
  "name": "Pre-screening",
  "metadata": {
    "color": "#FFA500",
    "nextStatuses": ["confirmed", "cancelled"],
    "requiresAction": true
  }
}

// Custom appointment types with specific workflows
POST /api/master-data
{
  "category": "appointment_types",
  "code": "surgery_consultation",
  "name": "Surgery Consultation",
  "metadata": {
    "duration": 60,
    "requiresPreAuth": true,
    "followUpRequired": true,
    "preTasks": ["insurance_verification", "medical_history_review"]
  }
}
```

### 2. Custom Notification Templates

Create custom notification templates:

```typescript
// Email notification template
POST /api/system/settings
{
  "key": "appointment_reminder_email",
  "value": {
    "subject": "Appointment Reminder - {{organizationName}}",
    "body": "Dear {{patientName}}, this is a reminder that you have an appointment with Dr. {{doctorName}} on {{appointmentDate}} at {{appointmentTime}}. Please arrive 15 minutes early.",
    "footer": "{{organizationName}} - {{organizationPhone}}"
  },
  "dataType": "json",
  "category": "notifications"
}

// SMS notification template
POST /api/system/settings
{
  "key": "appointment_confirmation_sms",
  "value": "Hello {{patientName}}, your appointment with Dr. {{doctorName}} is confirmed for {{appointmentDate}} at {{appointmentTime}}. Reply STOP to opt out.",
  "dataType": "string",
  "category": "notifications"
}
```

## Database Customization

### 1. Custom Fields via JSON Columns

Many entities support custom fields through JSON columns:

```typescript
// Add custom fields to patient records
PUT /api/patients/{patientId}
{
  "customFields": {
    "preferredLanguage": "Spanish",
    "dietaryRestrictions": ["Vegetarian", "Gluten-free"],
    "mobilityAids": "Wheelchair",
    "emergencyProtocol": "Contact family first"
  }
}

// Add custom fields to medical records
POST /api/medical-records
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "diagnosis": ["Hypertension"],
  "customFields": {
    "riskFactors": ["Family history", "Smoking"],
    "treatmentGoals": "Reduce BP to <130/80",
    "patientEducation": "Provided lifestyle modification brochure"
  }
}
```

### 2. Custom Reports

Create custom report configurations:

```typescript
// Define custom report
POST /api/system/settings
{
  "key": "custom_patient_report",
  "value": {
    "name": "Monthly Patient Summary",
    "description": "Summary of patient visits and treatments",
    "query": {
      "dateRange": "last_30_days",
      "groupBy": "department",
      "metrics": ["patient_count", "appointment_count", "revenue"],
      "filters": {
        "status": ["completed"],
        "excludeTestPatients": true
      }
    },
    "visualization": {
      "type": "chart",
      "chartType": "bar",
      "xAxis": "department",
      "yAxis": "patient_count"
    }
  },
  "dataType": "json",
  "category": "reports"
}
```

## Integration Customization

### 1. Custom API Endpoints

Add custom endpoints for specific organizational needs:

```typescript
// server/start/routes.ts - Add custom routes
router.group(() => {
  // Custom patient discharge workflow
  router.post('/patients/:id/custom-discharge', async ({ params, request, response }) => {
    // Custom discharge logic
    const patient = await Patient.findOrFail(params.id)
    const dischargeData = request.only(['dischargeDate', 'followUpInstructions', 'customFields'])
    
    // Your custom logic here
    
    return response.ok({ success: true, data: patient })
  })
  
  // Custom billing calculations
  router.get('/billing/custom-calculations/:patientId', async ({ params, response }) => {
    // Custom billing logic
    const calculations = await calculateCustomBilling(params.patientId)
    return response.ok({ data: calculations })
  })
}).prefix('/api/custom').use(middleware.auth())
```

### 2. External System Integration

Configure external system integrations:

```typescript
// Laboratory system integration
POST /api/system/settings
{
  "key": "lab_integration_config",
  "value": {
    "enabled": true,
    "apiUrl": "https://lab-system.example.com/api",
    "apiKey": "your-api-key",
    "autoSync": true,
    "syncInterval": 300, // seconds
    "fieldMappings": {
      "patientId": "external_patient_id",
      "testCode": "lab_test_code",
      "results": "test_results"
    }
  },
  "dataType": "json",
  "category": "integrations"
}

// Pharmacy system integration  
POST /api/system/settings
{
  "key": "pharmacy_integration_config",
  "value": {
    "enabled": true,
    "apiUrl": "https://pharmacy.example.com/api",
    "autoSendPrescriptions": true,
    "requirePharmacyConfirmation": true
  },
  "dataType": "json",
  "category": "integrations"
}
```

## Best Practices

### 1. Customization Guidelines

- **Maintain Compatibility**: Ensure customizations don't break core functionality
- **Use System Settings**: Prefer configuration over code changes
- **Version Control**: Track all customizations in version control
- **Documentation**: Document all custom configurations and fields
- **Testing**: Test customizations thoroughly before deployment

### 2. Performance Considerations

- **Index Custom Fields**: Add database indexes for frequently queried custom fields
- **Validate Input**: Always validate custom field data
- **Cache Settings**: Cache frequently accessed system settings
- **Optimize Queries**: Ensure custom reports don't impact system performance

### 3. Security Best Practices

- **Permission Checks**: Ensure custom roles respect permission boundaries
- **Data Validation**: Validate all custom field input
- **Audit Trail**: Log changes to custom configurations
- **Access Control**: Restrict customization capabilities to appropriate roles

This customization guide provides comprehensive coverage of all available customization options in MedCare Pro, from simple theme changes to complex workflow modifications and external system integrations.
