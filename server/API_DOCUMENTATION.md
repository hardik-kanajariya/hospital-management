# API Documentation

## Base URL
```
Development: http://localhost:3001
```

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-08-28T12:00:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@medcare.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@medcare.com",
      "name": "System Administrator",
      "role": "super_admin",
      "is_active": true,
      "last_login": "2025-08-28T12:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Register User (Admin only)
```http
POST /api/auth/register
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "user@medcare.com",
  "password": "password123",
  "name": "John Doe",
  "role": "doctor",
  "phone": "+1234567890",
  "department": "Cardiology",
  "employee_id": "DOC002"
}
```

### Patients

#### Get All Patients
```http
GET /api/patients?page=1&limit=10&search=john
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search by name, patient ID, phone, or email

**Response:**
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "uuid",
        "patient_id": "P240001",
        "name": "John Doe",
        "phone": "+1234567890",
        "email": "john.doe@email.com",
        "date_of_birth": "1985-06-15",
        "gender": "male",
        "blood_group": "O+",
        "created_at": "2025-08-28T12:00:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_records": 50,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### Get Patient by ID
```http
GET /api/patients/{id}
Authorization: Bearer <token>
```

#### Create Patient
```http
POST /api/patients
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john.doe@email.com",
  "date_of_birth": "1985-06-15",
  "gender": "male",
  "address": "123 Main St, Anytown, USA",
  "emergency_contact": "Jane Doe - Wife - +1234567891",
  "blood_group": "O+",
  "allergies": ["Penicillin"],
  "chronic_conditions": []
}
```

**Required fields:**
- name, phone, date_of_birth, gender, address, emergency_contact

**Optional fields:**
- email, blood_group, allergies, chronic_conditions, vaccination_records, insurance_info

#### Update Patient
```http
PUT /api/patients/{id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "+1234567890"
}
```

#### Delete Patient (Admin only)
```http
DELETE /api/patients/{id}
Authorization: Bearer <admin_token>
```

### Users

#### Get All Users (Admin only)
```http
GET /api/users?page=1&limit=10&search=john&role=doctor
Authorization: Bearer <admin_token>
```

#### Update User (Admin only)
```http
PUT /api/users/{id}
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "is_active": false
}
```

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Role-Based Access Control

### Roles
- `super_admin` - Full system access
- `admin` - Administrative functions
- `doctor` - Medical operations
- `nurse` - Nursing operations
- `staff` - General staff access
- `receptionist` - Patient registration and appointments
- `lab_technician` - Laboratory operations
- `billing_manager` - Billing and payments
- `pharmacy_manager` - Pharmacy operations

### Permissions by Endpoint

| Endpoint | super_admin | admin | doctor | nurse | receptionist | others |
|----------|------------|-------|--------|-------|--------------|--------|
| GET /api/patients | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| POST /api/patients | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| PUT /api/patients | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| DELETE /api/patients | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| GET /api/users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| POST /api/auth/register | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

## Real-time Features (Socket.IO)

Connect to: `ws://localhost:3001`

### Events

#### Client to Server
- `join-room` - Join a department room
- `new-appointment` - Notify about new appointment
- `emergency-alert` - Send emergency notification
- `bed-status-update` - Update bed status

#### Server to Client
- `appointment-notification` - New appointment notification
- `emergency` - Emergency alert
- `bed-update` - Bed status update

### Example Usage
```javascript
const socket = io('http://localhost:3001');

// Join doctor room
socket.emit('join-room', 'doctors');

// Listen for notifications
socket.on('appointment-notification', (data) => {
  console.log('New appointment:', data);
});
```

## Testing Examples

### Using curl

```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medcare.com","password":"admin123"}'

# Get patients (replace with actual token)
curl http://localhost:3001/api/patients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create patient
curl -X POST http://localhost:3001/api/patients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "phone": "+1234567890",
    "date_of_birth": "1990-01-01",
    "gender": "male",
    "address": "123 Test St",
    "emergency_contact": "Emergency Contact - +1234567891"
  }'
```

### Using JavaScript fetch

```javascript
// Login
const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@medcare.com',
    password: 'admin123'
  })
});

const { data } = await loginResponse.json();
const token = data.token;

// Get patients
const patientsResponse = await fetch('http://localhost:3001/api/patients', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const patients = await patientsResponse.json();
console.log(patients);
```
