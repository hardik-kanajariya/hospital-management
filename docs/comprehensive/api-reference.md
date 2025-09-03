# API Reference - MedCare Hospital Management System

> **Version**: 1.0.0  
> **Base URL**: `http://localhost:3001/api` (Development)  
> **Last Updated**: September 3, 2025

## Overview

The MedCare API is a RESTful API that provides comprehensive hospital management functionality. All API endpoints require authentication unless explicitly marked as public.

## Authentication

### Authentication Methods

The API uses **JWT (JSON Web Token)** authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Public Endpoints (No Authentication Required)

```http
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
GET  /api/auth/demo-accounts
POST /api/super-dupar-admin/auth/login
GET  /api/health
```

## Response Format

All API responses follow a consistent JSON format:

### Success Response
```json
{
  "success": true,
  "data": {}, // Response data
  "message": "Operation successful" // Optional
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": {}, // Validation errors (optional)
  "code": "ERROR_CODE" // Optional error code
}
```

## System Health

### Health Check
```http
GET /api/health
```

**Response:**
```json
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

## Authentication API

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "roleId": "role-uuid",
      "role": {
        "name": "doctor",
        "displayName": "Doctor",
        "permissions": ["read_patients", "write_patients"]
      }
    },
    "token": "jwt-token-here"
  }
}
```

### Register
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password",
  "roleId": "role-uuid",
  "organizationId": "org-uuid" // Optional
}
```

### Logout
```http
POST /api/auth/logout
```
*Requires Authentication*

### Get Current User
```http
GET /api/auth/me
```
*Requires Authentication*

### Verify Token
```http
GET /api/auth/verify
```
*Requires Authentication*

### Get Demo Accounts
```http
GET /api/auth/demo-accounts
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "email": "admin@hospital.com",
      "password": "password",
      "role": "Super Admin"
    },
    {
      "email": "doctor@hospital.com", 
      "password": "password",
      "role": "Doctor"
    }
  ]
}
```

---

## User Management API

### List Users
```http
GET /api/users?page=1&limit=10&search=term&role=doctor
```
*Requires Authentication*

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term
- `role` (string): Filter by role name

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "name": "Dr. John Doe",
        "email": "john@example.com",
        "role": {
          "name": "doctor",
          "displayName": "Doctor"
        },
        "isActive": true,
        "createdAt": "2025-09-03T10:30:00.000Z"
      }
    ],
    "meta": {
      "total": 100,
      "perPage": 10,
      "currentPage": 1,
      "lastPage": 10
    }
  }
}
```

### Get User by ID
```http
GET /api/users/:id
```
*Requires Authentication*

### Create User
```http
POST /api/users
```
*Requires Authentication*

**Request Body:**
```json
{
  "name": "Dr. Jane Smith",
  "email": "jane@example.com",
  "password": "password",
  "roleId": "role-uuid",
  "department": "Cardiology",
  "phone": "+1234567890",
  "employeeId": "EMP001"
}
```

### Update User
```http
PUT /api/users/:id
```
*Requires Authentication*

### Delete User
```http
DELETE /api/users/:id
```
*Requires Authentication*

---

## Patient Management API

### List Patients
```http
GET /api/patients?page=1&limit=10&search=term
```
*Requires Authentication*

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page  
- `search` (string): Search by name, phone, or patient ID

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "patientId": "P2025001",
        "name": "John Patient",
        "phone": "+1234567890",
        "email": "patient@example.com",
        "dateOfBirth": "1990-01-01",
        "gender": "male",
        "bloodGroup": "O+",
        "emergencyContact": {
          "name": "Emergency Contact",
          "phone": "+0987654321",
          "relationship": "spouse"
        },
        "createdAt": "2025-09-03T10:30:00.000Z"
      }
    ],
    "meta": {
      "total": 500,
      "perPage": 10,
      "currentPage": 1,
      "lastPage": 50
    }
  }
}
```

### Get Patient by ID
```http
GET /api/patients/:id
```
*Requires Authentication*

### Create Patient
```http
POST /api/patients
```
*Requires Authentication*

**Request Body:**
```json
{
  "name": "New Patient",
  "phone": "+1234567890",
  "email": "patient@example.com",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "address": "123 Main St, City, State",
  "bloodGroup": "O+",
  "emergencyContact": {
    "name": "Emergency Contact",
    "phone": "+0987654321",
    "relationship": "spouse",
    "email": "emergency@example.com",
    "address": "456 Emergency St"
  },
  "allergies": ["penicillin", "latex"],
  "chronicConditions": ["diabetes", "hypertension"],
  "insuranceInfo": {
    "provider": "Health Insurance Co",
    "policyNumber": "POL123456",
    "groupNumber": "GRP789"
  }
}
```

### Update Patient
```http
PUT /api/patients/:id
```
*Requires Authentication*

### Delete Patient (Soft Delete)
```http
DELETE /api/patients/:id
```
*Requires Authentication*

### Get Patient Statistics
```http
GET /api/patients/stats
```
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPatients": 1250,
    "newPatientsThisMonth": 45,
    "malePatients": 650,
    "femalePatients": 600,
    "averageAge": 42.5,
    "bloodGroupDistribution": {
      "O+": 380,
      "A+": 320,
      "B+": 250,
      "AB+": 120,
      "O-": 80,
      "A-": 60,
      "B-": 30,
      "AB-": 10
    }
  }
}
```

### Search Patients
```http
GET /api/patients/search?q=search_term
```
*Requires Authentication*

### Get Patient Medical History
```http
GET /api/patients/:id/medical-history
```
*Requires Authentication*

### Get Patient Appointments
```http
GET /api/patients/:id/appointments
```
*Requires Authentication*

### Get Patient Bills
```http
GET /api/patients/:id/bills
```
*Requires Authentication*

---

## Appointment Management API

### List Appointments
```http
GET /api/appointments?page=1&limit=10&date=2025-09-03&doctorId=uuid&patientId=uuid&status=scheduled
```
*Requires Authentication*

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `date` (string): Filter by date (YYYY-MM-DD)
- `doctorId` (string): Filter by doctor
- `patientId` (string): Filter by patient
- `status` (string): scheduled, confirmed, cancelled, completed

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "appointmentId": "APT2025001",
        "patientId": "patient-uuid",
        "doctorId": "doctor-uuid",
        "appointmentDate": "2025-09-03",
        "appointmentTime": "2025-09-03T14:30:00.000Z",
        "duration": 30,
        "status": "scheduled",
        "type": "consultation",
        "priority": "normal",
        "reason": "Regular checkup",
        "notes": "Patient reports feeling well",
        "patient": {
          "name": "John Patient",
          "phone": "+1234567890"
        },
        "doctor": {
          "name": "Dr. Jane Smith",
          "department": "Cardiology"
        }
      }
    ],
    "meta": {
      "total": 150,
      "perPage": 10,
      "currentPage": 1,
      "lastPage": 15
    }
  }
}
```

### Get Appointment by ID
```http
GET /api/appointments/:id
```
*Requires Authentication*

### Create Appointment
```http
POST /api/appointments
```
*Requires Authentication*

**Request Body:**
```json
{
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "appointmentDate": "2025-09-03",
  "appointmentTime": "2025-09-03T14:30:00.000Z",
  "duration": 30,
  "type": "consultation",
  "priority": "normal",
  "reason": "Regular checkup",
  "notes": "Patient requested afternoon appointment",
  "symptoms": ["headache", "fatigue"],
  "vitals": {
    "bloodPressure": "120/80",
    "temperature": "98.6",
    "pulse": "72",
    "respiratoryRate": "16"
  }
}
```

### Update Appointment
```http
PUT /api/appointments/:id
```
*Requires Authentication*

### Cancel Appointment
```http
POST /api/appointments/:id/cancel
```
*Requires Authentication*

**Request Body:**
```json
{
  "reason": "Patient requested cancellation",
  "notifyPatient": true
}
```

### Reschedule Appointment
```http
POST /api/appointments/:id/reschedule
```
*Requires Authentication*

**Request Body:**
```json
{
  "newDate": "2025-09-04",
  "newTime": "2025-09-04T10:00:00.000Z",
  "reason": "Doctor not available",
  "notifyPatient": true
}
```

### Check-in Appointment
```http
POST /api/appointments/:id/check-in
```
*Requires Authentication*

**Request Body:**
```json
{
  "checkedInBy": "user-uuid",
  "notes": "Patient arrived on time"
}
```

### Check-out Appointment
```http
POST /api/appointments/:id/check-out
```
*Requires Authentication*

### Get Appointments by Patient
```http
GET /api/appointments/patient/:patientId
```
*Requires Authentication*

### Get Appointments by Doctor
```http
GET /api/appointments/doctor/:doctorId
```
*Requires Authentication*

### Get Appointments by Date
```http
GET /api/appointments/date/:date
```
*Requires Authentication*

---

## Doctor Management API

### List Doctors
```http
GET /api/doctors?page=1&limit=10&department=cardiology
```
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Dr. Jane Smith",
      "email": "jane@example.com",
      "department": "Cardiology",
      "specialization": "Interventional Cardiology",
      "phone": "+1234567890",
      "employeeId": "DOC001",
      "role": {
        "name": "doctor",
        "displayName": "Doctor"
      },
      "roleData": {
        "licenseNumber": "MD123456",
        "specialization": "Cardiology",
        "experience": "10 years",
        "qualifications": ["MBBS", "MD Cardiology"]
      }
    }
  ]
}
```

### Get Doctor by ID
```http
GET /api/doctors/:userId
```
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Dr. Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "department": "Cardiology",
    "role": {
      "name": "doctor",
      "displayName": "Doctor"
    },
    "roleData": {
      "licenseNumber": "MD123456",
      "specialization": "Cardiology",
      "experience": "10 years",
      "qualifications": ["MBBS", "MD Cardiology"],
      "consultationFee": 500,
      "availableDays": ["monday", "tuesday", "wednesday"],
      "consultationHours": "9:00 AM - 5:00 PM"
    },
    "schedules": [
      {
        "dayOfWeek": "monday",
        "startTime": "09:00",
        "endTime": "17:00",
        "location": "Room 101"
      }
    ]
  }
}
```

---

## Doctor Schedule Management API

### List Doctor Schedules
```http
GET /api/doctor-schedules?doctorId=uuid&dayOfWeek=monday
```
*Requires Authentication*

### Get Schedule by ID
```http
GET /api/doctor-schedules/:id
```
*Requires Authentication*

### Create Doctor Schedule
```http
POST /api/doctor-schedules
```
*Requires Authentication*

**Request Body:**
```json
{
  "userId": "doctor-uuid",
  "dayOfWeek": "monday",
  "startTime": "09:00",
  "endTime": "17:00",
  "location": "Room 101",
  "maxPatients": 20,
  "slotDurationMinutes": 30,
  "scheduleType": "regular",
  "isRecurring": true,
  "effectiveFrom": "2025-09-01",
  "effectiveUntil": null,
  "breakTimes": [
    {
      "start_time": "12:00",
      "end_time": "13:00",
      "label": "Lunch Break"
    }
  ]
}
```

### Update Doctor Schedule
```http
PUT /api/doctor-schedules/:id
```
*Requires Authentication*

### Delete Doctor Schedule
```http
DELETE /api/doctor-schedules/:id
```
*Requires Authentication*

---

## Doctor Availability API

### List Doctor Availability
```http
GET /api/doctor-availability?doctorId=uuid&date=2025-09-03
```
*Requires Authentication*

### Check Availability
```http
GET /api/doctor-availability/check/status?doctorId=uuid&date=2025-09-03&time=14:30
```
*Requires Authentication*

### Get Availability by Date Range
```http
GET /api/doctor-availability/date-range/check?doctorId=uuid&startDate=2025-09-01&endDate=2025-09-07
```
*Requires Authentication*

### Create Availability
```http
POST /api/doctor-availability
```
*Requires Authentication*

### Update Availability
```http
PUT /api/doctor-availability/:id
```
*Requires Authentication*

---

## Medical Records API

### List Medical Records
```http
GET /api/medical-records?page=1&limit=10&patientId=uuid&doctorId=uuid
```
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "recordId": "MR2025001",
        "patientId": "patient-uuid",
        "doctorId": "doctor-uuid",
        "appointmentId": "appointment-uuid",
        "chiefComplaint": "Chest pain",
        "presentIllness": "Patient reports chest pain for 2 days",
        "physicalExamination": "Normal heart sounds, no murmurs",
        "diagnosis": "Angina pectoris",
        "treatment": "Rest, medication",
        "medications": [
          {
            "name": "Aspirin",
            "dosage": "81mg",
            "frequency": "once daily",
            "duration": "30 days"
          }
        ],
        "labResults": {
          "bloodPressure": "140/90",
          "cholesterol": "220 mg/dL",
          "glucose": "95 mg/dL"
        },
        "vitalSigns": {
          "temperature": "98.6°F",
          "pulse": "78 bpm",
          "respiratoryRate": "16/min",
          "bloodPressure": "140/90 mmHg"
        },
        "createdAt": "2025-09-03T10:30:00.000Z"
      }
    ],
    "meta": {
      "total": 25,
      "perPage": 10,
      "currentPage": 1,
      "lastPage": 3
    }
  }
}
```

### Get Medical Record by ID
```http
GET /api/medical-records/:id
```
*Requires Authentication*

### Create Medical Record
```http
POST /api/medical-records
```
*Requires Authentication*

**Request Body:**
```json
{
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "appointmentId": "appointment-uuid",
  "chiefComplaint": "Chest pain",
  "presentIllness": "Patient reports chest pain for 2 days",
  "physicalExamination": "Normal heart sounds, no murmurs",
  "diagnosis": "Angina pectoris",
  "treatment": "Rest, medication",
  "medications": [
    {
      "name": "Aspirin",
      "dosage": "81mg",
      "frequency": "once daily",
      "duration": "30 days"
    }
  ],
  "labResults": {
    "bloodPressure": "140/90",
    "cholesterol": "220 mg/dL"
  },
  "vitalSigns": {
    "temperature": "98.6°F",
    "pulse": "78 bpm",
    "respiratoryRate": "16/min",
    "bloodPressure": "140/90 mmHg"
  },
  "attachments": [
    {
      "filename": "xray.jpg",
      "type": "image",
      "url": "/uploads/xray.jpg"
    }
  ]
}
```

### Update Medical Record
```http
PUT /api/medical-records/:id
```
*Requires Authentication*

### Delete Medical Record
```http
DELETE /api/medical-records/:id
```
*Requires Authentication*

### Get Patient Medical History
```http
GET /api/medical-records/patient/:patientId
```
*Requires Authentication*

### Search Medical Records
```http
GET /api/medical-records/search?q=diagnosis&patientId=uuid
```
*Requires Authentication*

### Validate Medical Record
```http
POST /api/medical-records/validate
```
*Requires Authentication*

### Get Patient Statistics
```http
GET /api/medical-records/patient/:patientId/statistics
```
*Requires Authentication*

### Get Patient Timeline
```http
GET /api/medical-records/patient/:patientId/timeline
```
*Requires Authentication*

### Get Vital Signs Trends
```http
GET /api/medical-records/patient/:patientId/vital-signs-trends
```
*Requires Authentication*

### Get Patient Alerts
```http
GET /api/medical-records/patient/:patientId/alerts
```
*Requires Authentication*

---

## Billing Management API

### List Bills
```http
GET /api/billing?page=1&limit=10&patientId=uuid&status=pending
```
*Requires Authentication*

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `patientId` (string): Filter by patient
- `status` (string): pending, paid, overdue, cancelled

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "billNumber": "BILL2025001",
        "patientId": "patient-uuid",
        "appointmentId": "appointment-uuid",
        "amount": 1500.00,
        "tax": 150.00,
        "discount": 50.00,
        "totalAmount": 1600.00,
        "status": "pending",
        "dueDate": "2025-09-10",
        "items": [
          {
            "description": "Consultation",
            "quantity": 1,
            "rate": 500.00,
            "amount": 500.00
          },
          {
            "description": "Blood Test",
            "quantity": 1,
            "rate": 1000.00,
            "amount": 1000.00
          }
        ],
        "patient": {
          "name": "John Patient",
          "patientId": "P2025001"
        },
        "createdAt": "2025-09-03T10:30:00.000Z"
      }
    ],
    "meta": {
      "total": 75,
      "perPage": 10,
      "currentPage": 1,
      "lastPage": 8
    }
  }
}
```

### Get Bill by ID
```http
GET /api/billing/:id
```
*Requires Authentication*

### Create Bill
```http
POST /api/billing
```
*Requires Authentication*

**Request Body:**
```json
{
  "patientId": "patient-uuid",
  "appointmentId": "appointment-uuid",
  "items": [
    {
      "description": "Consultation",
      "quantity": 1,
      "rate": 500.00,
      "amount": 500.00
    },
    {
      "description": "Blood Test", 
      "quantity": 1,
      "rate": 1000.00,
      "amount": 1000.00
    }
  ],
  "amount": 1500.00,
  "tax": 150.00,
  "discount": 50.00,
  "totalAmount": 1600.00,
  "dueDate": "2025-09-10",
  "notes": "Regular consultation bill"
}
```

### Update Bill
```http
PUT /api/billing/:id
```
*Requires Authentication*

### Delete Bill
```http
DELETE /api/billing/:id
```
*Requires Authentication*

### Record Payment
```http
POST /api/billing/:id/payment
```
*Requires Authentication*

**Request Body:**
```json
{
  "amount": 1600.00,
  "method": "cash", // cash, card, check, online
  "reference": "REF123456",
  "notes": "Full payment received",
  "receivedBy": "user-uuid"
}
```

### Get Bills by Patient
```http
GET /api/billing/patient/:patientId
```
*Requires Authentication*

---

## Inventory Management API

### List Inventory Items
```http
GET /api/inventory?page=1&limit=10&category=medicine&lowStock=true
```
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "itemCode": "MED001",
        "name": "Paracetamol 500mg",
        "category": "medicine",
        "manufacturer": "PharmaCorp",
        "batchNumber": "B2025001",
        "expiryDate": "2025-12-31",
        "currentStock": 500,
        "minimumStock": 100,
        "maximumStock": 1000,
        "unitPrice": 2.50,
        "supplier": "Medical Supplies Ltd",
        "location": "Pharmacy-A1",
        "status": "active",
        "createdAt": "2025-09-03T10:30:00.000Z"
      }
    ],
    "meta": {
      "total": 250,
      "perPage": 10,
      "currentPage": 1,
      "lastPage": 25
    }
  }
}
```

### Get Inventory Item by ID
```http
GET /api/inventory/:id
```
*Requires Authentication*

### Create Inventory Item
```http
POST /api/inventory
```
*Requires Authentication*

**Request Body:**
```json
{
  "itemCode": "MED002",
  "name": "Aspirin 325mg",
  "category": "medicine",
  "manufacturer": "PharmaCorp",
  "batchNumber": "B2025002",
  "expiryDate": "2025-12-31",
  "currentStock": 300,
  "minimumStock": 50,
  "maximumStock": 500,
  "unitPrice": 1.25,
  "supplier": "Medical Supplies Ltd",
  "location": "Pharmacy-A2",
  "description": "Pain relief medication"
}
```

### Update Inventory Item
```http
PUT /api/inventory/:id
```
*Requires Authentication*

### Delete Inventory Item
```http
DELETE /api/inventory/:id
```
*Requires Authentication*

### Get Low Stock Items
```http
GET /api/inventory/low-stock
```
*Requires Authentication*

### Get Expired Items
```http
GET /api/inventory/expired
```
*Requires Authentication*

---

## Laboratory Management API

### List Lab Tests
```http
GET /api/lab?page=1&limit=10&patientId=uuid&status=completed
```
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "testId": "LAB2025001",
        "patientId": "patient-uuid",
        "doctorId": "doctor-uuid",
        "testName": "Complete Blood Count",
        "testType": "blood",
        "status": "completed",
        "orderedDate": "2025-09-01",
        "sampleCollectedDate": "2025-09-02",
        "resultDate": "2025-09-03",
        "results": {
          "hemoglobin": "14.2 g/dL",
          "wbc": "7500 cells/μL",
          "rbc": "4.8 million cells/μL",
          "platelets": "250,000 cells/μL"
        },
        "normalRanges": {
          "hemoglobin": "12.0-15.5 g/dL",
          "wbc": "4500-11000 cells/μL"
        },
        "notes": "All values within normal range",
        "patient": {
          "name": "John Patient",
          "patientId": "P2025001"
        },
        "doctor": {
          "name": "Dr. Jane Smith"
        }
      }
    ],
    "meta": {
      "total": 125,
      "perPage": 10,
      "currentPage": 1,
      "lastPage": 13
    }
  }
}
```

### Get Lab Test by ID
```http
GET /api/lab/:id
```
*Requires Authentication*

### Create Lab Test Order
```http
POST /api/lab
```
*Requires Authentication*

**Request Body:**
```json
{
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "testName": "Complete Blood Count",
  "testType": "blood",
  "urgency": "routine", // routine, urgent, stat
  "instructions": "Fasting required",
  "notes": "Patient has history of anemia"
}
```

### Update Lab Test
```http
PUT /api/lab/:id
```
*Requires Authentication*

### Delete Lab Test
```http
DELETE /api/lab/:id
```
*Requires Authentication*

### Update Test Results
```http
POST /api/lab/:id/results
```
*Requires Authentication*

**Request Body:**
```json
{
  "results": {
    "hemoglobin": "14.2 g/dL",
    "wbc": "7500 cells/μL",
    "rbc": "4.8 million cells/μL",
    "platelets": "250,000 cells/μL"
  },
  "normalRanges": {
    "hemoglobin": "12.0-15.5 g/dL",
    "wbc": "4500-11000 cells/μL"
  },
  "abnormalFlags": [],
  "technician": "Lab Tech Name",
  "notes": "All values within normal range"
}
```

### Get Lab Tests by Patient
```http
GET /api/lab/patient/:patientId
```
*Requires Authentication*

---

## Bed Management API

### List Beds
```http
GET /api/beds?page=1&limit=10&ward=ICU&status=available
```
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "bedNumber": "ICU-001",
        "ward": "ICU",
        "room": "Room 101",
        "bedType": "critical",
        "status": "occupied", // available, occupied, maintenance, reserved
        "patientId": "patient-uuid",
        "admissionDate": "2025-09-01",
        "estimatedDischarge": "2025-09-05",
        "dailyRate": 2000.00,
        "features": ["ventilator", "monitor", "oxygen"],
        "patient": {
          "name": "John Patient",
          "patientId": "P2025001"
        },
        "assignedNurse": "Nurse Jane",
        "createdAt": "2025-09-03T10:30:00.000Z"
      }
    ],
    "meta": {
      "total": 50,
      "perPage": 10,
      "currentPage": 1,
      "lastPage": 5
    }
  }
}
```

### Get Bed by ID
```http
GET /api/beds/:id
```
*Requires Authentication*

### Create Bed
```http
POST /api/beds
```
*Requires Authentication*

**Request Body:**
```json
{
  "bedNumber": "ICU-002",
  "ward": "ICU",
  "room": "Room 102",
  "bedType": "critical",
  "dailyRate": 2000.00,
  "features": ["ventilator", "monitor", "oxygen"],
  "description": "ICU bed with advanced monitoring"
}
```

### Update Bed
```http
PUT /api/beds/:id
```
*Requires Authentication*

### Delete Bed
```http
DELETE /api/beds/:id
```
*Requires Authentication*

### Get Available Beds
```http
GET /api/beds/available?ward=ICU&bedType=critical
```
*Requires Authentication*

### Assign Bed to Patient
```http
POST /api/beds/:id/assign
```
*Requires Authentication*

**Request Body:**
```json
{
  "patientId": "patient-uuid",
  "admissionDate": "2025-09-03",
  "estimatedDischarge": "2025-09-07",
  "assignedNurse": "Nurse Jane",
  "notes": "Patient requires continuous monitoring"
}
```

### Discharge Patient from Bed
```http
POST /api/beds/:id/discharge
```
*Requires Authentication*

**Request Body:**
```json
{
  "dischargeDate": "2025-09-03T14:30:00.000Z",
  "dischargeNotes": "Patient recovered well",
  "dischargedBy": "doctor-uuid"
}
```

---

## Prescription Management API

### List Prescriptions
```http
GET /api/prescriptions?page=1&limit=10&patientId=uuid&status=active
```
*Requires Authentication*

### Get Prescription by ID
```http
GET /api/prescriptions/:id
```
*Requires Authentication*

### Create Prescription
```http
POST /api/prescriptions
```
*Requires Authentication*

**Request Body:**
```json
{
  "patientId": "patient-uuid",
  "doctorId": "doctor-uuid",
  "appointmentId": "appointment-uuid",
  "medications": [
    {
      "medicationName": "Paracetamol",
      "dosage": "500mg",
      "frequency": "twice daily",
      "duration": "5 days",
      "instructions": "Take after meals",
      "quantity": 10
    }
  ],
  "instructions": "Complete the full course",
  "notes": "Monitor for any adverse reactions"
}
```

### Update Prescription
```http
PUT /api/prescriptions/:id
```
*Requires Authentication*

### Delete Prescription
```http
DELETE /api/prescriptions/:id
```
*Requires Authentication*

### Get Prescriptions by Patient
```http
GET /api/prescriptions/patient/:patientId
```
*Requires Authentication*

### Dispense Medication
```http
POST /api/prescriptions/:id/dispense
```
*Requires Authentication*

**Request Body:**
```json
{
  "dispensedBy": "pharmacist-uuid",
  "dispensedDate": "2025-09-03T10:30:00.000Z",
  "notes": "Full quantity dispensed"
}
```

---

## Notification Management API

### List Notifications
```http
GET /api/notifications?page=1&limit=10&unread=true
```
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "title": "New Appointment Scheduled",
        "message": "You have a new appointment with Dr. Smith",
        "type": "appointment",
        "priority": "normal",
        "isRead": false,
        "data": {
          "appointmentId": "appointment-uuid",
          "patientName": "John Patient"
        },
        "createdAt": "2025-09-03T10:30:00.000Z"
      }
    ],
    "meta": {
      "total": 25,
      "perPage": 10,
      "currentPage": 1,
      "lastPage": 3
    }
  }
}
```

### Get Unread Count
```http
GET /api/notifications/unread-count
```
*Requires Authentication*

### Create Notification
```http
POST /api/notifications
```
*Requires Authentication*

**Request Body:**
```json
{
  "recipientId": "user-uuid",
  "title": "Lab Results Ready",
  "message": "Your lab results are now available",
  "type": "lab_result",
  "priority": "high",
  "data": {
    "labTestId": "lab-uuid",
    "patientId": "patient-uuid"
  }
}
```

### Mark as Read
```http
PATCH /api/notifications/:id/read
```
*Requires Authentication*

### Mark All as Read
```http
PATCH /api/notifications/mark-all-read
```
*Requires Authentication*

### Delete Notification
```http
DELETE /api/notifications/:id
```
*Requires Authentication*

---

## Dashboard API

### Get Dashboard Data
```http
GET /api/dashboard
```
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalPatients": 1250,
      "totalAppointments": 89,
      "totalDoctors": 25,
      "totalRevenue": 125000
    },
    "todayStats": {
      "appointmentsToday": 15,
      "newPatients": 3,
      "completedAppointments": 8,
      "pendingBills": 12
    },
    "recentActivities": [
      {
        "type": "appointment_created",
        "message": "New appointment scheduled with Dr. Smith",
        "timestamp": "2025-09-03T10:30:00.000Z"
      }
    ],
    "upcomingAppointments": [
      {
        "id": "uuid",
        "patientName": "John Patient",
        "doctorName": "Dr. Smith",
        "time": "2025-09-03T14:30:00.000Z"
      }
    ]
  }
}
```

### Get User Dashboard
```http
GET /api/dashboard/user
```
*Requires Authentication*

### Get Dashboard Statistics
```http
GET /api/dashboard/stats
```
*Requires Authentication*

### Get Recent Activities
```http
GET /api/dashboard/recent-activities
```
*Requires Authentication*

### Get Dashboard Alerts
```http
GET /api/dashboard/alerts
```
*Requires Authentication*

### Get Super Admin Dashboard
```http
GET /api/dashboard/super-admin
```
*Requires Super Admin Authentication*

---

## Organization Management API

### List Organizations
```http
GET /api/organizations?page=1&limit=10
```
*Requires Super Admin Authentication*

### Get Organization by ID
```http
GET /api/organizations/:id
```
*Requires Authentication*

### Get Organization Statistics
```http
GET /api/organizations/:id/stats
```
*Requires Authentication*

### Create Organization
```http
POST /api/organizations
```
*Requires Super Admin Authentication*

### Update Organization
```http
PUT /api/organizations/:id
```
*Requires Authentication*

### Delete Organization
```http
DELETE /api/organizations/:id
```
*Requires Super Admin Authentication*

---

## Role Management API

### List Roles
```http
GET /api/roles?page=1&limit=10
```
*Requires Authentication*

### Get Role by ID
```http
GET /api/roles/:id
```
*Requires Authentication*

### Create Role
```http
POST /api/roles
```
*Requires Super Admin Authentication*

### Update Role
```http
PUT /api/roles/:id
```
*Requires Super Admin Authentication*

### Delete Role
```http
DELETE /api/roles/:id
```
*Requires Super Admin Authentication*

### Get Role Templates
```http
GET /api/roles/templates
```
*Requires Authentication*

### Create Role from Template
```http
POST /api/roles/from-template
```
*Requires Super Admin Authentication*

### Get Permissions
```http
GET /api/roles/permissions
```
*Requires Authentication*

### Bulk Role Operations
```http
POST /api/roles/bulk-operation
```
*Requires Super Admin Authentication*

---

## Master Data Management API

### List Master Data
```http
GET /api/master-data?category=blood_group&status=active
```
*Requires Authentication*

### Get Categories
```http
GET /api/master-data/categories
```
*Requires Authentication*

### Get Data by Category
```http
GET /api/master-data/category/:category
```
*Requires Authentication*

### Create Master Data
```http
POST /api/master-data
```
*Requires Authentication*

### Update Master Data
```http
PUT /api/master-data/:id
```
*Requires Authentication*

### Toggle Status
```http
POST /api/master-data/:id/toggle-status
```
*Requires Authentication*

### Delete Master Data
```http
DELETE /api/master-data/:id
```
*Requires Authentication*

### Create Category
```http
POST /api/master-data/categories
```
*Requires Authentication*

### Delete Category
```http
DELETE /api/master-data/categories/:category
```
*Requires Authentication*

---

## System Management API

### System Health
```http
GET /api/system/health
```
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "memory": {
      "used": "256 MB",
      "total": "1 GB",
      "percentage": 25
    },
    "cpu": {
      "usage": "15%",
      "cores": 4
    },
    "uptime": "5 days, 12 hours",
    "version": "1.0.0"
  }
}
```

### System Performance
```http
GET /api/system/performance
```
*Requires Authentication*

### System Uptime
```http
GET /api/system/uptime
```
*Requires Authentication*

### System Version
```http
GET /api/system/version
```
*Requires Authentication*

### System Logs
```http
GET /api/system/logs?level=error&limit=100
```
*Requires Authentication*

### Audit Trail
```http
GET /api/system/audit-trail?action=create&limit=50
```
*Requires Authentication*

### Create Backup
```http
POST /api/system/backup
```
*Requires Super Admin Authentication*

---

## Error Codes

### Authentication Errors
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Token expired
- `AUTH_003`: Insufficient permissions
- `AUTH_004`: Account suspended

### Validation Errors
- `VAL_001`: Required field missing
- `VAL_002`: Invalid format
- `VAL_003`: Value out of range
- `VAL_004`: Duplicate entry

### System Errors
- `SYS_001`: Database connection error
- `SYS_002`: Internal server error
- `SYS_003`: Service unavailable
- `SYS_004`: Rate limit exceeded

### Resource Errors
- `RES_001`: Resource not found
- `RES_002`: Resource already exists
- `RES_003`: Resource in use
- `RES_004`: Resource access denied

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General API**: 1000 requests per hour per user
- **Authentication**: 10 login attempts per 15 minutes per IP
- **File Upload**: 50 uploads per hour per user
- **Bulk Operations**: 100 operations per hour per user

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1625097600
```

---

## Pagination

List endpoints support pagination with consistent parameters:

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `sort` (string): Sort field (default: createdAt)
- `order` (string): Sort order (asc/desc, default: desc)

**Response Meta:**
```json
{
  "meta": {
    "total": 500,
    "perPage": 10,
    "currentPage": 1,
    "lastPage": 50,
    "firstPageUrl": "/api/patients?page=1",
    "lastPageUrl": "/api/patients?page=50",
    "nextPageUrl": "/api/patients?page=2",
    "prevPageUrl": null
  }
}
```

---

## Filtering and Searching

Most list endpoints support filtering and searching:

**Common Filter Parameters:**
- `search` (string): Search across multiple fields
- `startDate` (date): Filter by date range start
- `endDate` (date): Filter by date range end
- `status` (string): Filter by status
- `category` (string): Filter by category

**Example:**
```http
GET /api/patients?search=john&startDate=2025-09-01&endDate=2025-09-03
```

This comprehensive API reference covers all currently implemented endpoints in the MedCare Hospital Management System. The API follows RESTful conventions and provides consistent response formats for optimal developer experience.
