# API Reference

## Overview

The MedCare Pro API is a RESTful API built with AdonisJS that provides comprehensive hospital management functionality. All API endpoints are secured with JWT authentication and support multi-tenant organization isolation.

## Base Information

- **Base URL**: `/api`
- **Authentication**: JWT Bearer Token
- **Content Type**: `application/json`
- **API Version**: `1.0.0`

## Authentication

### Authentication Flow

All API endpoints (except authentication endpoints) require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### POST /api/auth/login

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "doctor@hospital.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "doctor@hospital.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": {
        "id": "uuid",
        "name": "doctor",
        "displayName": "Doctor"
      },
      "organizationId": "uuid"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/auth/register

Register a new user (requires appropriate permissions).

**Request Body:**
```json
{
  "email": "newuser@hospital.com",
  "password": "securePassword123",
  "firstName": "Jane",
  "lastName": "Smith",
  "roleId": "uuid",
  "organizationId": "uuid"
}
```

#### POST /api/auth/logout

Invalidate current JWT token.

#### GET /api/auth/me

Get current authenticated user information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "doctor@hospital.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": {
      "id": "uuid", 
      "name": "doctor",
      "displayName": "Doctor"
    },
    "organization": {
      "id": "uuid",
      "name": "City General Hospital"
    }
  }
}
```

#### GET /api/auth/demo-accounts

Get available demo accounts for testing.

## Patient Management

### GET /api/patients

Retrieve paginated list of patients.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term for name/email/phone
- `status` (string): Filter by patient status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Patient",
      "email": "patient@email.com",
      "phone": "+1234567890",
      "dateOfBirth": "1990-01-15",
      "gender": "male",
      "address": "123 Main St",
      "emergencyContact": {
        "name": "Emergency Contact",
        "phone": "+0987654321"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 100,
    "perPage": 10,
    "currentPage": 1,
    "lastPage": 10
  }
}
```

### POST /api/patients

Create a new patient.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Patient", 
  "email": "patient@email.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "address": "123 Main St",
  "emergencyContact": {
    "name": "Emergency Contact",
    "phone": "+0987654321"
  }
}
```

### GET /api/patients/:id

Get specific patient by ID.

### PUT /api/patients/:id

Update patient information.

### DELETE /api/patients/:id

Soft delete patient.

### GET /api/patients/:id/medical-history

Get patient's complete medical history.

### GET /api/patients/:id/appointments

Get patient's appointment history.

### GET /api/patients/:id/bills

Get patient's billing history.

### GET /api/patients/search

Search patients with advanced filters.

### GET /api/patients/stats

Get patient statistics for dashboard.

## Appointment Management

### GET /api/appointments

Get paginated list of appointments.

**Query Parameters:**
- `page`, `limit`: Pagination
- `patientId`: Filter by patient
- `doctorId`: Filter by doctor  
- `date`: Filter by specific date
- `status`: Filter by appointment status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "patientId": "uuid",
      "doctorId": "uuid", 
      "scheduledDate": "2024-01-15",
      "scheduledTime": "14:30:00",
      "duration": 30,
      "status": "scheduled",
      "type": "consultation",
      "notes": "Regular checkup",
      "patient": {
        "firstName": "John",
        "lastName": "Patient"
      },
      "doctor": {
        "firstName": "Dr. Jane",
        "lastName": "Smith"
      }
    }
  ]
}
```

### POST /api/appointments

Schedule a new appointment.

**Request Body:**
```json
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "scheduledDate": "2024-01-15", 
  "scheduledTime": "14:30:00",
  "duration": 30,
  "type": "consultation",
  "notes": "Regular checkup"
}
```

### PUT /api/appointments/:id

Update appointment details.

### DELETE /api/appointments/:id

Cancel appointment.

### POST /api/appointments/:id/check-in

Check in patient for appointment.

### POST /api/appointments/:id/check-out

Check out patient after appointment.

### POST /api/appointments/:id/reschedule

Reschedule appointment to new date/time.

**Request Body:**
```json
{
  "scheduledDate": "2024-01-16",
  "scheduledTime": "15:00:00",
  "reason": "Doctor availability change"
}
```

## Medical Records

### GET /api/medical-records

Get paginated medical records.

### POST /api/medical-records

Create new medical record.

**Request Body:**
```json
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "appointmentId": "uuid",
  "symptoms": "Fever, headache",
  "diagnosis": "Viral infection",
  "treatment": "Rest and fluids",
  "medications": [
    {
      "name": "Paracetamol",
      "dosage": "500mg",
      "frequency": "3 times daily"
    }
  ],
  "vitalSigns": {
    "temperature": "101.2°F",
    "bloodPressure": "120/80",
    "heartRate": "75 bpm"
  },
  "notes": "Follow up in 3 days"
}
```

### GET /api/medical-records/:id

Get specific medical record.

### GET /api/medical-records/patient/:patientId

Get patient's complete medical history.

### GET /api/medical-records/patient/:patientId/timeline

Get chronological timeline of patient's medical records.

### GET /api/medical-records/patient/:patientId/vital-signs-trends

Get trends analysis of patient's vital signs.

## Doctor Management

### GET /api/doctors

Get all doctors (users with doctor role).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "doctor@hospital.com",
      "role": {
        "name": "doctor",
        "displayName": "Doctor"
      },
      "roleData": {
        "specialization": "Cardiology",
        "licenseNumber": "MD123456",
        "department": "Cardiology",
        "experience": "10 years"
      }
    }
  ]
}
```

### GET /api/doctors/:userId

Get specific doctor profile by user ID.

## Doctor Schedules

### GET /api/doctor-schedules

Get doctor schedules.

### POST /api/doctor-schedules  

Create doctor schedule.

**Request Body:**
```json
{
  "doctorId": "uuid",
  "dayOfWeek": "monday",
  "startTime": "09:00:00",
  "endTime": "17:00:00",
  "slotDuration": 30,
  "isAvailable": true
}
```

## Doctor Availability

### GET /api/doctor-availability

Get doctor availability records.

### POST /api/doctor-availability

Set doctor availability for specific dates.

### GET /api/doctor-availability/check/status

Check doctor availability for specific date/time.

## Billing

### GET /api/billing

Get billing records.

### POST /api/billing

Create new bill.

**Request Body:**
```json
{
  "patientId": "uuid",
  "appointmentId": "uuid",
  "items": [
    {
      "description": "Consultation Fee",
      "quantity": 1,
      "unitPrice": 100.00,
      "total": 100.00
    }
  ],
  "subtotal": 100.00,
  "tax": 10.00,
  "total": 110.00,
  "dueDate": "2024-01-30"
}
```

### POST /api/billing/:id/payment

Record payment for bill.

## Laboratory

### GET /api/lab

Get lab test records.

### POST /api/lab

Order new lab test.

**Request Body:**
```json
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "testName": "Complete Blood Count",
  "category": "blood-test",
  "priority": "normal",
  "instructions": "Fasting required",
  "scheduledDate": "2024-01-16"
}
```

### POST /api/lab/:id/results

Update lab test results.

## Inventory

### GET /api/inventory

Get inventory items.

### POST /api/inventory

Add inventory item.

### GET /api/inventory/low-stock

Get items with low stock levels.

### GET /api/inventory/expired

Get expired inventory items.

## Prescriptions

### GET /api/prescriptions

Get prescriptions.

### POST /api/prescriptions

Create new prescription.

**Request Body:**
```json
{
  "patientId": "uuid",
  "doctorId": "uuid",
  "medications": [
    {
      "name": "Amoxicillin",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "7 days",
      "instructions": "Take with food"
    }
  ],
  "notes": "Complete full course"
}
```

### POST /api/prescriptions/:id/dispense

Mark prescription as dispensed.

## Bed Management

### GET /api/beds

Get bed inventory.

### POST /api/beds

Add new bed.

### GET /api/beds/available

Get available beds.

### POST /api/beds/:id/assign

Assign bed to patient.

### POST /api/beds/:id/discharge

Discharge patient from bed.

## Notifications

### GET /api/notifications

Get user notifications.

### GET /api/notifications/unread-count

Get count of unread notifications.

### POST /api/notifications

Create notification.

### PATCH /api/notifications/:id/read

Mark notification as read.

### PATCH /api/notifications/mark-all-read

Mark all notifications as read.

## Dashboard

### GET /api/dashboard

Get general dashboard data.

### GET /api/dashboard/user

Get user-specific dashboard data.

### GET /api/dashboard/stats

Get dashboard statistics.

### GET /api/dashboard/recent-activities

Get recent activities.

### GET /api/dashboard/alerts

Get system alerts.

## Super Admin APIs

### Authentication

#### POST /api/super-dupar-admin/auth/login

Super admin login.

#### POST /api/super-dupar-admin/auth/logout

Super admin logout.

### Management

#### GET /api/super-dupar-admin/dashboard-stats

Get super admin dashboard statistics.

#### GET /api/super-dupar-admin/organizations

Get all organizations.

#### GET /api/super-dupar-admin/super-admins

Get all super admin accounts.

#### POST /api/super-dupar-admin/super-admins

Create new super admin.

## Role Management

### GET /api/roles

Get all roles.

### POST /api/roles

Create new role.

### GET /api/roles/templates

Get role templates.

### POST /api/roles/from-template

Create role from template.

## Master Data

### GET /api/master-data

Get master data entries.

### GET /api/master-data/categories

Get available categories.

### GET /api/master-data/category/:category

Get entries for specific category.

### POST /api/master-data

Create master data entry.

## Role Fields

### GET /api/role-fields/role/:roleId/fields

Get dynamic fields for role.

### POST /api/role-fields/role/:roleId/fields

Create new role field.

### POST /api/role-fields/user-data

Set user role-specific data.

### GET /api/role-fields/user/:userId/data

Get user's role-specific data.

## System Management

### GET /api/system/health

Get system health status.

### GET /api/system/performance

Get system performance metrics.

### GET /api/system/audit-trail

Get system audit trail.

### POST /api/system/backup

Create system backup.

## Standard Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": {}, // Response data
  "meta": {}  // Metadata (pagination, etc.)
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": {}  // Validation errors (if applicable)
}
```

## Error Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

## Rate Limiting

API requests are rate limited to prevent abuse:
- **General endpoints**: 100 requests per minute
- **Authentication endpoints**: 10 requests per minute
- **Super admin endpoints**: 200 requests per minute

## Pagination

List endpoints support pagination with these parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response includes pagination metadata:
```json
{
  "meta": {
    "total": 150,
    "perPage": 10,
    "currentPage": 1,
    "lastPage": 15,
    "firstPageUrl": "...",
    "lastPageUrl": "...",
    "nextPageUrl": "...",
    "prevPageUrl": "..."
  }
}
```

This API reference covers all currently implemented endpoints in the MedCare Pro system. For integration examples and SDKs, see the [Integration Guide](/docs/developer/integration).
