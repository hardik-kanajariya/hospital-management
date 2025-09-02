# BedManagement Module - Complete Development Task List

## Phase 1: Database Schema & Models

### Task 1.1: Create Rooms Table
- Create migration for `rooms` table with columns:
  - id (primary key)
  - room_number (unique, not null)
  - room_type (enum: general, private, icu, emergency, maternity, pediatric)
  - department_id (foreign key to departments)
  - floor (integer)
  - capacity (integer, default 1)
  - amenities (JSON array)
  - daily_rate (decimal)
  - status (enum: active, maintenance, inactive)
  - created_at, updated_at

### Task 1.2: Update Beds Table
- Modify existing beds table to include:
  - room_id (foreign key to rooms)
  - bed_number (unique within room)
  - type (inherit from room type)
  - last_cleaned (datetime)
  - notes (text)
  - Add unique constraint on (room_id, bed_number)

### Task 1.3: Create Admissions Table
- Create migration for `admissions` table:
  - id (primary key)
  - admission_number (unique, auto-generated)
  - patient_id (foreign key)
  - bed_id (foreign key)
  - admitting_doctor_id (foreign key)
  - admission_date (datetime)
  - expected_discharge_date (datetime)
  - actual_discharge_date (datetime)
  - status (enum: active, discharged, transferred)
  - diagnosis (text)
  - admission_notes (text)
  - discharge_notes (text)
  - created_by (foreign key to users)
  - updated_by (foreign key to users)
  - created_at, updated_at

### Task 1.4: Create Admission Charges Table
- Create migration for `admission_charges`:
  - id (primary key)
  - admission_id (foreign key)
  - charge_type (enum: room, medicine, procedure, lab, other)
  - description (text)
  - amount (decimal)
  - quantity (integer, default 1)
  - charge_date (date)
  - created_by (foreign key to users)
  - created_at

### Task 1.5: Master Data Tables
- Add to master_lookups:
  - Room types with rates
  - Amenities list
  - Charge types
  - Bed statuses
  - Admission statuses

## Phase 2: Backend Models & Relationships

### Task 2.1: Create Room Model
- Define Sequelize model for Room
- Set up associations:
  - hasMany beds
  - belongsTo department
  - hasMany admissions through beds

### Task 2.2: Update Bed Model
- Add new fields to existing Bed model
- Set up associations:
  - belongsTo room
  - hasMany admissions
  - hasOne currentAdmission (where status='active')

### Task 2.3: Create Admission Model
- Define Sequelize model for Admission
- Set up associations:
  - belongsTo patient
  - belongsTo bed
  - belongsTo doctor (admitting)
  - hasMany charges
  - belongsTo createdBy/updatedBy (User)

### Task 2.4: Create AdmissionCharge Model
- Define Sequelize model
- Set up associations:
  - belongsTo admission
  - belongsTo createdBy (User)

## Phase 3: API Routes & Controllers

### Task 3.1: Room Management APIs
- GET /api/rooms (with filters: department, floor, type, status)
- GET /api/rooms/:id (with beds included)
- POST /api/rooms (create room with beds)
- PUT /api/rooms/:id (update room details)
- DELETE /api/rooms/:id (soft delete, check no active admissions)
- GET /api/rooms/availability (real-time availability stats)

### Task 3.2: Bed Management APIs
- GET /api/beds (with filters: status, room, type)
- GET /api/beds/:id (with current admission)
- PUT /api/beds/:id/status (update bed status)
- POST /api/beds/:id/clean (mark as cleaned)
- GET /api/beds/occupancy-stats (department-wise stats)

### Task 3.3: Admission APIs
- GET /api/admissions (with filters: status, date range, patient, doctor)
- GET /api/admissions/:id (full details with charges)
- POST /api/admissions (admit patient)
- PUT /api/admissions/:id (update admission)
- POST /api/admissions/:id/discharge (discharge patient)
- POST /api/admissions/:id/transfer (transfer to another bed)
- GET /api/admissions/active (all active admissions)
- GET /api/admissions/statistics (admission stats)

### Task 3.4: Admission Charges APIs
- GET /api/admissions/:id/charges (list all charges)
- POST /api/admissions/:id/charges (add charge)
- PUT /api/charges/:id (update charge)
- DELETE /api/charges/:id (remove charge)
- GET /api/admissions/:id/bill-summary (total bill calculation)

## Phase 4: Business Logic & Validations

### Task 4.1: Admission Rules
- Validate patient not already admitted
- Check bed availability before admission
- Auto-calculate room charges based on days
- Prevent discharge without settling bills
- Validate doctor is active and available

### Task 4.2: Bed Management Rules
- Auto-update bed status on admission/discharge
- Track bed cleaning schedule
- Implement bed blocking for maintenance
- Handle emergency bed allocation
- Bed transfer validations

### Task 4.3: Billing Logic
- Daily room charge calculation
- Auto-generate charges on admission
- Support for different charge types
- Tax calculations if applicable
- Generate billing summary

## Phase 5: Frontend Integration

### Task 5.1: Update API Hooks
- Create useRoomApi hook
- Create useAdmissionApi hook
- Update existing useBedApi hook
- Add error handling and loading states

### Task 5.2: Replace Mock Data
- Remove all useState for rooms and admissions
- Connect to real API endpoints
- Implement proper data fetching
- Add real-time updates using polling/websockets

### Task 5.3: Form Validations
- Add client-side validations
- Show server-side validation errors
- Implement confirmation dialogs
- Add loading states for all actions

### Task 5.4: UI Enhancements
- Add bed allocation timeline view
- Implement drag-drop bed transfers
- Add print functionality for admission slips
- Create discharge summary generation

## Phase 6: Advanced Features

### Task 6.1: Bed Reservation System
- Allow advance bed booking
- Implement waiting list
- Priority-based allocation
- Automatic reservation expiry

### Task 6.2: Reporting & Analytics
- Bed utilization reports
- Department-wise occupancy
- Revenue analytics
- Average length of stay
- Readmission tracking

### Task 6.3: Notifications
- Alert for expected discharge
- Bed cleaning reminders
- Low availability warnings
- Admission/discharge notifications

### Task 6.4: Integration Features
- Link with billing module
- Connect with pharmacy for medicines
- Lab test integration
- Insurance claim processing

## Phase 7: Role-Based Access

### Task 7.1: Permission Setup
- Define permissions for each role
- Admins: Full access
- Doctors: View admissions, discharge
- Nurses: Update bed status, cleaning
- Receptionist: Admission, bed allocation
- Billing: View charges, generate bills

### Task 7.2: UI Access Control
- Show/hide features based on role
- Disable actions without permission
- Add role-based menu items

## Phase 8: Data Seeding & Testing

### Task 8.1: Create Seeders
- Seed sample rooms
- Seed initial bed setup
- Create test admissions
- Add sample charges

### Task 8.2: Testing
- Test admission workflow
- Verify bed status updates
- Check billing calculations
- Test concurrent bed allocations

## Phase 9: Performance & Optimization

### Task 9.1: Database Optimization
- Add indexes on frequently queried columns
- Optimize bed availability queries
- Cache room and bed configurations

### Task 9.2: Frontend Optimization
- Implement pagination for large lists
- Add search and filters
- Lazy load admission history
- Optimize re-renders

## Phase 10: Documentation & Deployment

### Task 10.1: API Documentation
- Document all endpoints
- Provide sample requests/responses
- List all error codes

### Task 10.2: User Documentation
- Create user guide for bed management
- Document admission process
- Billing workflow documentation
````

This task list breaks down the complete development of the BedManagement module into small, manageable tasks. Each task is specific and can be completed independently. Should I start with Phase 1, Task 1.1 - Creating the rooms table migration?

hkdevs-copilot: Now in this check also how many code we have already completed, and is there any components, api which are already there like tables migrations, this are task designed for github copilot to perform action on this, so make it as detailed as you can. so it can complete the development of this feature, and also we have to integrate this with patient module, doctor module, diffrent roles can have diffrent access to this module, masters module we should also possibaly have to add some new category for this, so go through all the available possiblities, and make it complete corporte application, I have attached all the context for you just go through it and make it complete. 

GitHub Copilot: After analyzing the codebase, I can see that we already have a significant foundation for the BedManagement module. Let me create a comprehensive task list that accounts for what's already implemented and what needs to be completed.

````markdown
# BedManagement Module - Complete Development Task List (Revised)

## Current State Analysis

### Already Implemented:
1. **Database**:
   - `beds` table exists (migration: `1756454744524_create_beds_table.ts`)
   - Basic Bed model (`server/app/models/bed.ts`)
   - Beds controller with basic CRUD operations

2. **Frontend**:
   - BedManagement component with UI for rooms, beds, and admissions
   - useBedApi hook for API communication
   - Basic bed status management

3. **Master Data**:
   - Master data system is in place
   - MasterDropdown component available

### Missing Components:
1. **Database**:
   - No `rooms` table
   - No `admissions` table
   - No `admission_charges` table
   - Bed table needs additional fields

2. **Backend**:
   - No Room model/controller
   - No Admission model/controller
   - No billing integration for bed charges

3. **Frontend**:
   - Room and Admission API hooks missing
   - Integration with Patient/Doctor modules incomplete

## Phase 1: Database Schema Updates

### Task 1.1: Create Rooms Table Migration
````typescript
// filepath: /home/hardik/Documents/GitHub/hospital-management/server/database/migrations/1756950000000_create_rooms_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rooms'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('room_number', 50).notNullable().unique()
      table.string('room_type', 50).notNullable() // Will reference master_data
      table.integer('department_id').unsigned().references('id').inTable('master_data')
      table.integer('floor').notNullable()
      table.integer('capacity').defaultTo(1)
      table.json('amenities') // Array of amenity IDs from master_data
      table.decimal('daily_rate', 10, 2).notNullable()
      table.string('status', 20).defaultTo('active') // active, maintenance, inactive
      table.text('notes').nullable()
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
      
      table.index(['room_type', 'status'])
      table.index('department_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
````

### Task 1.2: Update Beds Table Migration
````typescript
// filepath: /home/hardik/Documents/GitHub/hospital-management/server/database/migrations/1756950000001_update_beds_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'beds'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('room_id').unsigned().references('id').inTable('rooms').after('id')
      table.datetime('last_cleaned').nullable()
      table.datetime('last_maintained').nullable()
      table.integer('current_patient_id').unsigned().references('id').inTable('patients').nullable()
      table.datetime('admission_date').nullable()
      table.datetime('expected_discharge_date').nullable()
      
      table.index('room_id')
      table.index('current_patient_id')
      table.unique(['room_id', 'bed_number'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('room_id')
      table.dropForeign('current_patient_id')
      table.dropColumn('room_id')
      table.dropColumn('last_cleaned')
      table.dropColumn('last_maintained')
      table.dropColumn('current_patient_id')
      table.dropColumn('admission_date')
      table.dropColumn('expected_discharge_date')
    })
  }
}
````

### Task 1.3: Create Admissions Table Migration
````typescript
// filepath: /home/hardik/Documents/GitHub/hospital-management/server/database/migrations/1756950000002_create_admissions_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'admissions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('admission_number', 50).notNullable().unique()
      table.integer('patient_id').unsigned().notNullable().references('id').inTable('patients')
      table.integer('bed_id').unsigned().notNullable().references('id').inTable('beds')
      table.integer('admitting_doctor_id').unsigned().notNullable().references('id').inTable('user_role_data')
      table.datetime('admission_date').notNullable()
      table.datetime('expected_discharge_date').nullable()
      table.datetime('actual_discharge_date').nullable()
      table.string('status', 20).defaultTo('active') // active, discharged, transferred
      table.text('chief_complaint').nullable()
      table.text('diagnosis').nullable()
      table.text('admission_notes').nullable()
      table.text('discharge_notes').nullable()
      table.string('discharge_type', 50).nullable() // Will reference master_data
      table.integer('transferred_to_bed_id').unsigned().references('id').inTable('beds').nullable()
      table.integer('created_by').unsigned().notNullable().references('id').inTable('users')
      table.integer('updated_by').unsigned().nullable().references('id').inTable('users')
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
      
      table.index(['patient_id', 'status'])
      table.index(['bed_id', 'status'])
      table.index('admission_date')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
````

### Task 1.4: Create Admission Charges Table Migration
````typescript
// filepath: /home/hardik/Documents/GitHub/hospital-management/server/database/migrations/1756950000003_create_admission_charges_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'admission_charges'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('admission_id').unsigned().notNullable().references('id').inTable('admissions')
      table.string('charge_type', 50).notNullable() // Will reference master_data
      table.string('description').notNullable()
      table.decimal('amount', 10, 2).notNullable()
      table.integer('quantity').defaultTo(1)
      table.decimal('total_amount', 10, 2).notNullable()
      table.date('charge_date').notNullable()
      table.boolean('is_billable').defaultTo(true)
      table.integer('bill_id').unsigned().references('id').inTable('bills').nullable()
      table.integer('created_by').unsigned().notNullable().references('id').inTable('users')
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
      
      table.index(['admission_id', 'charge_type'])
      table.index('charge_date')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
````

### Task 1.5: Update Master Data Seeder
````typescript
// filepath: /home/hardik/Documents/GitHub/hospital-management/server/database/seeders/master_data_seeder.ts
// ...existing code...

// Add these new categories to the run() method
const roomTypes = [
  { code: 'GENERAL', name: 'General Ward', value: 'general', metadata: { daily_rate: 800 } },
  { code: 'PRIVATE', name: 'Private Room', value: 'private', metadata: { daily_rate: 2000 } },
  { code: 'ICU', name: 'ICU', value: 'icu', metadata: { daily_rate: 5000 } },
  { code: 'EMERGENCY', name: 'Emergency', value: 'emergency', metadata: { daily_rate: 1500 } },
  { code: 'MATERNITY', name: 'Maternity Ward', value: 'maternity', metadata: { daily_rate: 1200 } },
  { code: 'PEDIATRIC', name: 'Pediatric Ward', value: 'pediatric', metadata: { daily_rate: 1000 } },
  { code: 'ISOLATION', name: 'Isolation Room', value: 'isolation', metadata: { daily_rate: 3000 } },
  { code: 'NICU', name: 'NICU', value: 'nicu', metadata: { daily_rate: 6000 } }
]

const roomAmenities = [
  { code: 'AC', name: 'Air Conditioning', value: 'ac' },
  { code: 'TV', name: 'Television', value: 'tv' },
  { code: 'WIFI', name: 'WiFi', value: 'wifi' },
  { code: 'BATHROOM', name: 'Attached Bathroom', value: 'bathroom' },
  { code: 'FRIDGE', name: 'Refrigerator', value: 'fridge' },
  { code: 'ATTENDANT_BED', name: 'Attendant Bed', value: 'attendant_bed' },
  { code: 'PHONE', name: 'Telephone', value: 'phone' },
  { code: 'SAFE', name: 'Safety Locker', value: 'safe' },
  { code: 'SOFA', name: 'Sofa Set', value: 'sofa' },
  { code: 'MICROWAVE', name: 'Microwave', value: 'microwave' }
]

const admissionChargeTypes = [
  { code: 'ROOM', name: 'Room Charges', value: 'room' },
  { code: 'MEDICINE', name: 'Medicine Charges', value: 'medicine' },
  { code: 'PROCEDURE', name: 'Procedure Charges', value: 'procedure' },
  { code: 'LAB', name: 'Lab Test Charges', value: 'lab' },
  { code: 'CONSULTATION', name: 'Consultation Charges', value: 'consultation' },
  { code: 'NURSING', name: 'Nursing Charges', value: 'nursing' },
  { code: 'EQUIPMENT', name: 'Equipment Charges', value: 'equipment' },
  { code: 'DIETARY', name: 'Dietary Charges', value: 'dietary' },
  { code: 'OTHER', name: 'Other Charges', value: 'other' }
]

const dischargeTypes = [
  { code: 'NORMAL', name: 'Normal Discharge', value: 'normal' },
  { code: 'AMA', name: 'Against Medical Advice', value: 'ama' },
  { code: 'ABSCONDED', name: 'Absconded', value: 'absconded' },
  { code: 'TRANSFERRED', name: 'Transferred', value: 'transferred' },
  { code: 'EXPIRED', name: 'Expired', value: 'expired' },
  { code: 'REFERRED', name: 'Referred', value: 'referred' }
]

// Add to categories array
await MasterData.createMany([
  ...roomTypes.map(item => ({ 
    category: 'room_type', 
    ...item, 
    is_active: true, 
    is_system: true 
  })),
  ...roomAmenities.map(item => ({ 
    category: 'room_amenity', 
    ...item, 
    is_active: true, 
    is_system: true 
  })),
  ...admissionChargeTypes.map(item => ({ 
    category: 'admission_charge_type', 
    ...item, 
    is_active: true, 
    is_system: true 
  })),
  ...dischargeTypes.map(item => ({ 
    category: 'discharge_type', 
    ...item, 
    is_active: true, 
    is_system: true 
  }))
])

// ...existing code...
````

## Phase 2: Backend Models

### Task 2.1: Create Room Model
````typescript
// filepath: /home/hardik/Documents/GitHub/hospital-management/server/app/models/room.ts
import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, belongsTo, computed } from '@adonisjs/lucid/orm'
import type { HasMany, BelongsTo } from '@adonisjs/lucid/types/relations'
import Bed from './bed.js'
import MasterData from './master_data.js'

export default class Room extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare roomNumber: string

  @column()
  declare roomType: string

  @column()
  declare departmentId: number

  @column()
  declare floor: number

  @column()
  declare capacity: number

  @column()
  declare amenities: string[] | null

  @column()
  declare dailyRate: number

  @column()
  declare status: 'active' | 'maintenance' | 'inactive'

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Bed)
  declare beds: HasMany<typeof Bed>

  @belongsTo(() => MasterData, {
    foreignKey: 'departmentId',
  })
  declare department: BelongsTo<typeof MasterData>

  @computed()
  get occupiedBeds() {
    if (!this.beds) return 0
    return this.beds.filter(bed => bed.status === 'occupied').length
  }

  @computed()
  get availableBeds() {
    if (!this.beds) return this.capacity
    return this.beds.filter(bed => bed.status === 'available').length
  }

  @computed()
  get occupancyRate() {
    if (!this.capacity || this.capacity === 0) return 0
    return Math.round((this.occupiedBeds / this.capacity) * 100)
  }
}
````

### Task 2.2: Update Bed Model
````typescript
// filepath: /home/hardik/Documents/GitHub/hospital-management/server/app/models/bed.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Room from './room.js'
import Patient from './patient.js'
import Admission from './admission.js'

export default class Bed extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare roomId: number

  @column()
  declare bedNumber: string

  @column()
  declare type: string

  @column()
  declare status: 'available' | 'occupied' | 'maintenance' | 'reserved'

  @column()
  declare currentPatientId: number | null

  @column.dateTime()
  declare admissionDate: DateTime | null

  @column.dateTime()
  declare expectedDischargeDate: DateTime | null

  @column.dateTime()
  declare lastCleaned: DateTime | null

  @column.dateTime()
  declare lastMaintained: DateTime | null

  @column()
  declare notes: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Room)
  declare room: BelongsTo<typeof Room>

  @belongsTo(() => Patient, {
    foreignKey: 'currentPatientId',
  })
  declare currentPatient: BelongsTo<typeof Patient>

  @hasMany(() => Admission)
  declare admissions: HasMany<typeof Admission>

  async markAsOccupied(patientId: number, admissionDate: DateTime, expectedDischarge?: DateTime) {
    this.status = 'occupied'
    this.currentPatientId = patientId
    this.admissionDate = admissionDate
    this.expectedDischargeDate = expectedDischarge || null
    await this.save()
  }

  async markAsAvailable() {
    this.status = 'available'
    this.currentPatientId = null
    this.admissionDate = null
    this.expectedDischargeDate = null
    this.lastCleaned = DateTime.now()
    await this.save()
  }

  async markAsCleaned() {
    this.lastCleaned = DateTime.now()
    await this.save()
  }

  async markAsMaintained() {
    this.lastMaintained = DateTime.now()
    await this.save()
  }
}
````

### Task 2.3: Create Admission Model
````typescript
// filepath: /home/hardik/Documents/GitHub/hospital-management/server/app/models/admission.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany, beforeCreate, computed } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Patient from './patient.js'
import Bed from './bed.js'
import User from './user.js'
import UserRoleData from './user_role_data.js'
import AdmissionCharge from './admission_charge.js'
import Bill from './bill.js'

export default class Admission extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare admissionNumber: string

  @column()
  declare patientId: number

  @column()
  declare bedId: number

  @column()
  declare admittingDoctorId: number

  @column.dateTime()
  declare admissionDate: DateTime

  @column.dateTime()
  declare expectedDischargeDate: DateTime | null

  @column.dateTime()
  declare actualDischargeDate: DateTime | null

  @column()
  declare status: 'active' | 'discharged' | 'transferred'

  @column()
  declare chiefComplaint: string | null

  @column()
  declare diagnosis: string | null

  @column()
  declare admissionNotes: string | null

  @column()
  declare dischargeNotes: string | null

  @column()
  declare dischargeType: string | null

  @column()
  declare transferredToBedId: number | null

  @column()
  declare createdBy: number

  @column()
  declare updatedBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Patient)
  declare patient: BelongsTo<typeof Patient>

  @belongsTo(() => Bed)
  declare bed: BelongsTo<typeof Bed>

  @belongsTo(() => UserRoleData, {
    foreignKey: 'admittingDoctorId',
  })
  declare admittingDoctor: BelongsTo<typeof UserRoleData>

  @belongsTo(() => User, {
    foreignKey: 'createdBy',
  })
  declare creator: BelongsTo<typeof User>

  @hasMany(() => AdmissionCharge)
  declare charges: HasMany<typeof AdmissionCharge>

  @hasMany(() => Bill)
  declare bills: HasMany<typeof Bill>

  @computed()
  get lengthOfStay() {
    const endDate = this.actualDischargeDate || DateTime.now()
    return Math.ceil(endDate.diff(this.admissionDate, 'days').days)
  }

  @computed()
  get totalCharges() {
    if (!this.charges) return 0
    return this.charges.reduce((sum, charge) => sum + Number(charge.totalAmount), 0)
  }

  @beforeCreate()
  static async generateAdmissionNumber(admission: Admission) {
    const year = DateTime.now().year
    const lastAdmission = await Admission.query()
      .where('admission_number', 'like', `ADM${year}%`)
      .orderBy('id', 'desc')
      .first()

    let nextNumber = 1
    if (lastAdmission) {
      const lastNumber = parseInt(lastAdmission.admissionNumber.replace(`ADM${year}`, ''))
      nextNumber = lastNumber + 1
    }

    admission.admissionNumber = `ADM${year}${nextNumber.toString().padStart(6, '0')}`
  }

  async discharge(dischargeNotes: string, dischargeType: string, userId: number) {
    this.actualDischargeDate = DateTime.now()
    this.dischargeNotes = dischargeNotes
    this.dischargeType = dischargeType
    this.status = 'discharged'
    this.updatedBy = userId
    await this.save()

    // Mark bed as available
    const bed = await this.related('bed').query().first()
    if (bed) {
      await bed.markAsAvailable()
    }
  }

  async transfer(newBedId: number, userId: number) {
    const oldBed = await this.related('bed').query().first()
    
    this.transferredToBedId = this.bedId
    this.bedId = newBedId
    this.status = 'transferred'
    this.updatedBy = userId
    await this.save()

    // Update old bed
    if (oldBed) {
      await oldBed.markAsAvailable()
    }

    // Update new bed
    const newBed = await Bed.find(newBedId)
    if (newBed) {
      await newBed.markAsOccupied(this.patientId, this.admissionDate, this.expectedDischargeDate)
    }

    // Create new admission for the new bed
    const newAdmission = await Admission.create({
      patientId: this.patientId,
      bedId: newBedId,
      admittingDoctorId: this.admittingDoctorId,
      admissionDate: DateTime.now(),
      expectedDischargeDate: this.expectedDischargeDate,
      status: 'active',
      chiefComplaint: this.chiefComplaint,
      diagnosis: this.diagnosis,
      admissionNotes: `Transferred from bed ${oldBed?.bedNumber}. ${this.admissionNotes || ''}`,
      createdBy: userId,
    })

    return newAdmission
  }

  async addCharge(chargeData: Partial<AdmissionCharge>) {
    return await this.related('charges').create(chargeData)
  }

  async calculateDailyRoomCharges() {
    await this.load('bed', (query) => {
      query.preload('room')
    })

    const days = this.lengthOfStay
    const dailyRate = this.bed.room.dailyRate
    const totalRoomCharges = days * dailyRate

    // Check if room charge for today already exists
    const today = DateTime.now().toFormat('yyyy-MM-dd')
    const existingCharge = await this.related('charges').query()
      .where('charge_type', 'room')
      .where('charge_date', today)
      .first()

    if (!existingCharge) {
      await this.addCharge({
        chargeType: 'room',
        description: `Room charges for ${this.bed.room.roomNumber} - Day ${days}`,
        amount: dailyRate,
        quantity: 1,
        totalAmount: dailyRate,
        chargeDate: DateTime.now(),
        createdBy: 1, // System user
      })
    }

    return totalRoomCharges
  }
}
````

### Task 2.4: Create AdmissionCharge Model
````typescript
// filepath: /home/hardik/Documents/GitHub/hospital-management/server/app/models/admission_charge.ts
import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, beforeSave } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Admission from './admission.js'
import Bill from './bill.js'
import User from './user.js'

export default class AdmissionCharge extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare admissionId: number

  @column()
  declare chargeType: string

  @column()
  declare description: string

  @column()
  declare amount: number

  @column()
  declare quantity: number

  @column()
  declare totalAmount: number

  @column.date()
  declare chargeDate: DateTime

  @column()
  declare isBillable: boolean

  @column()
  declare billId: number | null

  @column()
  declare createdBy: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Admission)
  declare admission: BelongsTo<typeof Admission>

  @belongsTo(() => Bill)
  declare bill: BelongsTo<typeof Bill>

  @belongsTo(() => User, {
    foreignKey: 'createdBy',
  })
  declare creator: BelongsTo<typeof User>

  @beforeSave()
  static async calculateTotal(charge: AdmissionCharge) {
    charge.totalAmount = charge.amount * charge.quantity
  }
}
````

## Phase 3: Backend Controllers & Routes

### Task 3.1: Create Rooms Controller
````typescript
// filepath: /home/hardik/Documents/GitHub/hospital-management/server/app/controllers/rooms_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Room from '#models/room'
import Bed from '#models/bed'
import { createRoomValidator, updateRoomValidator } from '#validators/room'
import { DateTime } from 'luxon'

export default class RoomsController {
  async index({ request, response }: HttpContext) {
    const {
      page = 1,
      limit = 10,
      search,
      department_id,
      floor,
      room_type,
      status,
      available_only
    } = request.qs()

    const query = Room.query()
      .preload('beds', (bedsQuery) => {
        bedsQuery.preload('currentPatient')
      })
      .preload('department')

    if (search) {
      query.where('room_number', 'like', `%${search}%`)
    }

    if (department_id) {
      query.where('department_id', department_id)
    }

    if (floor) {
      query.where('floor', floor)
    }

    if (room_type) {
      query.where('room_type', room_type)
    }

    if (status) {
      query.where('status', status)
    }

    if (available_only === 'true') {
      query.whereHas('beds', (bedsQuery) => {
        bedsQuery.where('status', 'available')
      })
    }

    const rooms = await query.paginate(page, limit)

    // Add computed properties
    const roomsData = rooms.toJSON()
    roomsData.data = roomsData.data.map(room => ({
      ...room,
      occupied_beds: room.beds.filter(bed => bed.status === 'occupied').length,
      available_beds: room.beds.filter(bed => bed.status === 'available').length,
      occupancy_rate: room.capacity > 0 
        ? Math.round((room.beds.filter(bed => bed.status === 'occupied').length / room.capacity) * 100)
        : 0
    }))

    return response.ok({
      success: true,
      data: roomsData,
      message: 'Rooms fetched successfully'
    })
  }

  async show({ params, response }: HttpContext) {
    const room = await Room.query()
      .where('id', params.id)
      .preload('beds', (query) => {
        query.preload('currentPatient')
          .preload('admissions', (admQuery) => {
            admQuery.where('status', 'active')
          })
      })
      .preload('department')
      .firstOrFail()

    return response.ok({
      success: true,
      data: room,
      message: 'Room details fetched successfully'
    })
  }

  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validate(createRoomValidator)
    
    const room = await Room.create({
      ...payload,
      status: payload.status || 'active',
    })

    // Create beds for the room
    const beds = []
    for (let i = 1; i <= room.capacity; i++) {
      const bed = await Bed.create({
        roomId: room.id,
        bedNumber: `${room.roomNumber}-${i}`,
        type: room.roomType,
        status: 'available',
        lastCleaned: DateTime.now(),
      })
      beds.push(bed)
    }

    await room.load('beds')
    await room.load('department')

    return response.created({
      success: true,
      data: room,
      message: 'Room created successfully with beds'
    })
  }

  async update({ params, request, response, auth }: HttpContext) {
    const room = await Room.findOrFail(params.id)
    const payload = await request.validate(updateRoomValidator)

    // If capacity is reduced, check if beds are occupied
    if (payload.capacity && payload.capacity < room.capacity) {
      const occupiedBeds = await Bed.query()
        .where('room_id', room.id)
        .where('status', 'occupied')
        .count('* as total')

      if (occupiedBeds[0].$extras.total > payload.capacity) {
        return response.badRequest({
          success: false,
          message: 'Cannot reduce capacity below number of occupied beds'
        })
      }
    }

    room.merge(payload)
    await room.save()

    // Handle capacity changes
    if (payload.capacity) {
      const currentBeds = await room.related('beds').query()
      
      if (payload.capacity > currentBeds.length) {
        // Add more beds
        for (let i = currentBeds.length + 1; i <= payload.capacity; i++) {
          await Bed.create({
            roomId: room.id,
            bedNumber: `${room.roomNumber}-${i}`,
            type: room.roomType,
            status: 'available',
            lastCleaned: DateTime.now(),
          })
        }
      } else if (payload.capacity < currentBeds.length) {
        // Remove extra beds (only if available)
        const bedsToRemove = await Bed.query()
          .where('room_id', room.id)
          .where('status', 'available')
          .orderBy('bed_number', 'desc')
          .limit(currentBeds.length - payload.capacity)

        for (const bed of bedsToRemove) {
          await bed.delete()
        }
      }
    }

    await room.load('beds')
    await room.load('department')

    return response.ok({
      success: true,
      data: room,
      message: 'Room updated successfully'
    })
  }

  async destroy({ params, response }: HttpContext) {
    const room = await Room.findOrFail(params.id)

    // Check if any bed is occupied
    const occupiedBeds = await Bed.query()
      .where('room_id', room.id)
      .where('status', 'occupied')
      .first()

    if (occupiedBeds) {
      return response.badRequest({
        success: false,
        message: 'Cannot delete room with occupied beds'
      })
    }

    // Delete all beds first
    await Bed.query().where('room_id', room.id).delete()
    
    // Delete room
    await room.delete()

    return response.ok({
      success: true,
      message: 'Room deleted successfully'
    })
  }

  async availability({ response }: HttpContext) {
    const stats = await Room.query()
      .select('room_type')
      .count('* as total_rooms')
      .groupBy('room_type')

    const bedStats = await Bed.query()
      .select('type')
      .select('status')
      .count('* as count')
      .groupBy('type', 'status')

    // Process stats
    const availability = {}
    
    for (const stat of stats) {
      const type = stat.$extras.room_type
      availability[type] = {
        total_rooms: stat.$extras.total_rooms,
        total_beds: 0,
        available_beds: 0,
        occupied_beds: 0,
        maintenance_beds: 0,
        occupancy_rate: 0
      }
    }

    for (const bedStat of bedStats) {
      const type = bedStat.type
      const status = bedStat.status
      const count = bedStat.$extras.count

      if (availability[type]) {
        availability[type].total_beds += count
        availability[type][`${status}_beds`] = count
      }
    }

    // Calculate occupancy rates
    for (const type in availability) {
      const data = availability[type]
      if (data.total_beds > 0) {
        data.occupancy_rate = Math.round((data.occupied_beds / data.total_beds) * 100)
      }
    }

    return response.ok({
      success: true,
      data: availability,
      message: 'Room availability fetched successfully'
    })
  }
}
````

### Task 3.2: Create Admissions Controller
````typescript
// filepath: /home/hardik/Documents/GitHub/hospital-management/server/app/controllers/admissions_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Admission from '#models/admission'
import Bed from '#models/bed'
import Patient from '#models/patient'
import Bill from '#models/bill'
import { createAdmissionValidator, updateAdmissionValidator, dischargeValidator, transferValidator } from '#validators/admission'
import { DateTime } from 'luxon'
import Database from '@adonisjs/lucid/services/db'

export default class AdmissionsController {
  async index({ request, response }: HttpContext) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      patient_id,
      doctor_id,
      bed_id,
      from_date,
      to_date
    } = request.qs()

    const query = Admission.query()
      .preload('patient')
      .preload('bed', (bedQuery) => {
        bedQuery.preload('room')
      })
      .preload('admittingDoctor', (doctorQuery) => {
        doctorQuery.preload('user')
      })
      .preload('charges')

    if (search) {
      query.whereHas('patient', (patientQuery) => {
        patientQuery.where('name', 'like', `%${search}%`)
          .orWhere('patient_id', 'like', `%${search}%`)
      }).orWhere('admission_number', 'like', `%${search}%`)
    }

    if (status) {
      query.where('status', status)
    }

    if (patient_id) {
      query.where('patient_id', patient_id)
    }

    if (doctor_id) {
      query.where('admitting_doctor_id', doctor_id)
    }

    if (bed_id) {
      query.where('bed_id', bed_id)
    }

    if (from_date) {
      query.where('admission_date', '>=', from_date)
    }

    if (to_date) {
      query.where('admission_date', '<=', to_date)
    }

    const admissions = await query
      .orderBy('admission_date', 'desc')
      .paginate(page, limit)

    // Add computed properties
    const admissionsData = admissions.toJSON()
    admissionsData.data = admissionsData.data.map(admission => ({
      ...admission,
      length_of_stay: this.calculateLengthOfStay(admission.admission_date, admission.actual_discharge_date),
      total_charges: admission.charges.reduce((sum, charge) => sum + Number(charge.total_amount), 0)
    }))

    return response.ok({
      success: true,
      data: admissionsData,
      message: 'Admissions fetched successfully'
    })
  }

  async show({ params, response }: HttpContext) {
    const admission = await Admission.query()
      .where('id', params.id)
      .preload('patient')
      .preload('bed', (query) => {
        query.preload('room')
      })
      .preload('admittingDoctor', (query) => {
        query.preload('user')
      })
      .preload('charges', (query) => {
        query.orderBy('charge_date', 'desc')
      })
      .preload('bills')
      .firstOrFail()

    const admissionData = admission.toJSON()
    admissionData.length_of_stay = admission.lengthOfStay
    admissionData.total_charges = admission.totalCharges

    return response.ok({
      success: true,
      data: admissionData,
      message: 'Admission details fetched successfully'
    })
  }

  async store({ request, response, auth }: HttpContext) {
    const payload = await request.validate(createAdmissionValidator)
    const userId = auth.user!.id

    // Start transaction
    const trx = await Database.transaction()

    try {
      // Check if patient is already admitted
      const existingAdmission = await Admission.query()
        .where('patient_id', payload.patientId)
        .where('status', 'active')
        .first()

      if (existingAdmission) {
        await trx.rollback()
        return response.badRequest({
          success: false,
          message: 'Patient is already admitted'
        })
      }

      // Check if bed is available
      const bed = await Bed.findOrFail(payload.bedId)
      if (bed.status !== 'available') {
        await trx.rollback()
        return response.badRequest({
          success: false,
          message: 'Selected bed is not available'
        })
      }

      // Create admission
      const admission = await Admission.create({
        ...payload,
        status: 'active',
        createdBy: userId,
      }, { client: trx })

      // Update bed status
      bed.useTransaction(trx)
      await bed.markAsOccupied(
        payload.patientId,
        DateTime.fromISO(payload.admissionDate),
        payload.expectedDischargeDate ? DateTime.fromISO(payload.expectedDischargeDate) : undefined
      )

      // Add initial room charge
      await admission.useTransaction(trx).calculateDailyRoomCharges()

      await trx.commit()

      // Load relationships
      await admission.load('patient')
      await admission.load('bed', (query) => {
        query.preload('room')
      })
      await admission.load('admittingDoctor', (query) => {
        query.preload('user')
      })

      return response.created({
        success: true,
        data: admission,
        message: 'Patient admitted successfully'
      })
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async update({ params, request, response, auth }: HttpContext) {
    const admission = await Admission.findOrFail(params.id)
    const payload = await request.validate(updateAdmissionValidator)
    const userId = auth.user!.id

    if (admission.status !== 'active') {
      return response.badRequest({
        success: false,
        message: 'Cannot update discharged or transferred admission'
      })
    }

    admission.merge({
      ...payload,
      updatedBy: userId,
    })
    await admission.save()

    // Update bed's expected discharge date if changed
    if (payload.expectedDischargeDate) {
      const bed = await Bed.find(admission.bedId)
      if (bed) {
        bed.expectedDischargeDate = DateTime.fromISO(payload.expectedDischargeDate)
        await bed.save()
      }
    }

    await admission.load('patient')
    await admission.load('bed', (query) => {
      query.preload('room')
    })
    await admission.load('admittingDoctor', (query) => {
      query.preload('user')
    })

    return response.ok({
      success: true,
      data: admission,
      message: 'Admission updated successfully'
    })
  }

  async discharge({ params, request, response, auth }: HttpContext) {
    const admission = await Admission.findOrFail(params.id)
    const payload = await request.validate(dischargeValidator)
    const userId = auth.user!.id

    if (admission.status !== 'active') {
      return response.badRequest({
        success: false,
        message: 'Admission is not active'
      })
    }

    // Check if there are unpaid bills
    const unpaidCharges = await admission.related('charges').query()
      .where('is_billable', true)
      .whereNull('bill_id')
      .first()

    if (unpaidCharges && !payload.force) {
      return response.badRequest({
        success: false,
        message: 'There are unpaid charges. Generate bill before discharge or use force discharge.'
      })
    }

    // Discharge patient
    await admission.discharge(
      payload.dischargeNotes,
      payload.dischargeType,
      userId
    )

    return response.ok({
      success: true,
      data: admission,
      message: 'Patient discharged successfully'
    })
  }

  async transfer({ params, request, response, auth }: HttpContext) {
    const admission = await Admission.findOrFail(params.id)
    const payload = await request.validate(transferValidator)
    const userId = auth.user!.id

    if (admission.status !== 'active') {
      return response.badRequest({
        success: false,
        message: 'Only active admissions can be transferred'
      })
    }

    // Check if new bed is available
    const newBed = await Bed.findOrFail(payload.newBedId)
    if (newBed.status !== 'available') {
      return response.badRequest({
        success: false,
        message: 'Selected bed is not available'
      })
    }

    // Transfer patient
    const newAdmission = await admission.transfer(payload.newBedId, userId)

    await newAdmission.load('patient')
    await newAdmission.load('bed', (query) => {
      query.preload('room')
    })

    return response.ok({
      success: true,
      data: newAdmission,
      message: 'Patient transferred successfully'
    })
  }

  async addCharge({ params, request, response, auth }: HttpContext) {
    const admission = await Admission.findOrFail(params.id)
    const payload = await request.validate(createChargeValidator)
    const userId = auth.user!.id

    if (admission.status !== 'active') {
      return response.badRequest({
        success: false,
        message: 'Cannot add charges to inactive admission'
      })
    }

    const charge = await admission.addCharge({
      ...payload,
      createdBy: userId,
    })

    return response.created({
      success: true,
      data: charge,
      message: 'Charge added successfully'
    })
  }

  async billSummary({ params, response }: HttpContext) {
    const admission = await Admission.query()
      .where('id', params.id)
      .preload('charges')
      .preload('bills')
      .firstOrFail()

    const summary = {
      admission_number: admission.admissionNumber,
      total_charges: 0,
      paid_amount: 0,
      pending_amount: 0,
      charges_by_type: {},
      bills: []
    }

    // Calculate charges by type
    for (const charge of admission.charges) {
      summary.total_charges += Number(charge.totalAmount)
      
      if (!summary.charges_by_type[charge.chargeType]) {
        summary.charges_by_type[charge.chargeType] = 0
      }
      summary.charges_by_type[charge.chargeType] += Number(charge.totalAmount)
    }

    // Calculate paid amount from bills
    for (const bill of admission.bills) {
      if (bill.status === 'paid') {
        summary.paid_amount += Number(bill.totalAmount)
      }
      summary.bills.push({
        bill_number: bill.billNumber,
        amount: bill.totalAmount,
        status: bill.status,
        date: bill.createdAt
      })
    }

    summary.pending_amount = summary.total_charges - summary.paid_amount

    return response.ok({
      success: true,
      data: summary,
      message: 'Bill summary fetched successfully'
    })
  }

  async statistics({ request, response }: HttpContext) {
    const { from_date, to_date } = request.qs()

    const baseQuery = Admission.query()
    
    if (from_date) {
      baseQuery.where('admission_date', '>=', from_date)
    }
    
    if (to_date) {
      baseQuery.where('admission_date', '<=', to_date)
    }

    // Get admission statistics
    const totalAdmissions = await baseQuery.clone().count('* as total')
    const activeAdmissions = await baseQuery.clone().where('status', 'active').count('* as total')
    const dischargedAdmissions = await baseQuery.clone().where('status', 'discharged').count('* as total')

    // Average length of stay
    const avgLengthOfStay = await Admission.query()
      .where('status', 'discharged')
      .whereNotNull('actual_discharge_date')
      .select(
        Database.raw('AVG(DATEDIFF(actual_discharge_date, admission_date)) as avg_days')
      )
      .first()

    // Department-wise admissions
    const departmentStats = await Database
      .from('admissions')
      .join('beds', 'admissions.bed_id', 'beds.id')
      .join('rooms', 'beds.room_id', 'rooms.id')
      .join('master_data', 'rooms.department_id', 'master_data.id')
      .select('master_data.name as department')
      .count('admissions.id as count')
      .groupBy('master_data.name')

    return response.ok({
      success: true,
      data: {
        total_admissions: totalAdmissions[0].$extras.total,
        active_admissions: activeAdmissions[0].$extras.total,
        discharged_admissions: dischargedAdmissions[0].$extras.total,
        average_length_of_stay: avgLengthOfStay?.$extras.avg_days || 0,
        department_statistics: departmentStats
      },
      message: 'Admission statistics fetched successfully'
    })
  }

  private calculateLengthOfStay(admissionDate: string, dischargeDate?: string): number {
    const start = DateTime.fromISO(admissionDate)
    const end = dischargeDate ? DateTime.fromISO(dischargeDate) : DateTime.now()
    return Math.ceil(end.diff(start, 'days').days)
  }
}
````

### Task 3.3: Update Beds Controller
````typescript
// filepath: /home/hardik/Documents/GitHub/hospital-management/server/app/controllers/beds_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Bed from '#models/bed'
import Room from '#models/room'
import { updateBedValidator } from '#validators/bed'
import { DateTime } from 'luxon'
import Database from '@adonisjs/lucid/services/db'

export default class BedsController {
  async index({ request, response }: HttpContext) {
    const {
      page = 1,
      limit = 10,
      search,
      room_id,
      status,
      type,
      floor
    } = request.qs()

    const query = Bed.query()
      .preload('room', (roomQuery) => {
        roomQuery.preload('department')
      })
      .preload('currentPatient')

    if (search) {
      query.where('bed_number', 'like', `%${search}%`)
        .orWhereHas('currentPatient', (patientQuery) => {
          patientQuery.where('name', 'like', `%${search}%`)
        })
    }

    if (room_id) {
      query.where('room_id', room_id)
    }

    if (status) {
      query.where('status', status)
    }

    if (type) {
      query.where('type', type)
    }

    if (floor) {
      query.whereHas('room', (roomQuery) => {
        roomQuery.where('floor', floor)
      })
    }

    const beds = await query.paginate(page, limit)

    return response.ok({
      success: true,
      data: beds,
      message: 'Beds fetched successfully'
    })
  }

  async show({ params, response }: HttpContext) {
    const bed = await Bed.query()
      .where('id', params.id)
      .preload('room', (query) => {
        query.preload('department')
      })
      .preload('currentPatient')
      .preload('admissions', (query) => {
        query.orderBy('admission_date', 'desc')
          .limit(5)
          .preload('patient')
      })
      .firstOrFail()

    return response.ok({
      success: true,
      data: bed,
      message: 'Bed details fetched successfully'
    })
  }

  async update({ params, request, response }: HttpContext) {
    const bed = await Bed.findOrFail(params.id)
    const payload = await request.validate(updateBedValidator)

    // Handle status changes
    if (payload.status) {
      if (payload.status === 'available' && bed.status === 'occupied') {
        // If marking as available from occupied, clear patient data
        bed.currentPatientId = null
        bed.admissionDate = null
        bed.expectedDischargeDate = null
        bed.lastCleaned = DateTime.now()
      } else if (payload.status === 'maintenance') {
        // If marking for maintenance, ensure it's not occupied
        if (bed.status === 'occupied') {
          return response.badRequest({
            success: false,
            message: 'Cannot mark occupied bed for maintenance'
          })
        }
      }
    }

    bed.merge(payload)
    await bed.save()

    await bed.load('room')
    await bed.load('currentPatient')

    return response.ok({
      success: true,
      data: bed,
      message: 'Bed updated successfully'
    })
  }

  async clean({ params, response }: HttpContext) {
    const bed = await Bed.findOrFail(params.id)
    
    await bed.markAsCleaned()

    return response.ok({
      success: true,
      data: bed,
      message: 'Bed marked as cleaned'
    })
  }

  async maintain({ params, response }: HttpContext) {
    const bed = await Bed.findOrFail(params.id)
    
    if (bed.status === 'occupied') {
      return response.badRequest({
        success: false,
        message: 'Cannot perform maintenance on occupied bed'
      })
    }

    bed.status = 'maintenance'
    await bed.markAsMaintained()

    return response.ok({
      success: true,
      data: bed,
      message: 'Bed marked for maintenance'
    })
  }

  async occupancyStats({ request, response }: HttpContext) {
    const { department_id, floor } = request.qs()

    let query = Database
      .from('beds')
      .join('rooms', 'beds.room_id', 'rooms.id')
      .select('rooms.department_id')
      .select('beds.status')
      .count('* as count')
      .groupBy('rooms.department_id', 'beds.status')

    if (department_id) {
      query = query.where('rooms.department_id', department_id)
    }

    if (floor) {
      query = query.where('rooms.floor', floor)
    }

    const stats = await query

    // Process stats by department
    const departmentStats = {}
    
    for (const stat of stats) {
      const deptId = stat.department_id
      if (!departmentStats[deptId]) {
        departmentStats[deptId] = {
          total: 0,
          available: 0,
          occupied: 0,
          maintenance: 0,
          reserved: 0,
          occupancy_rate: 0
        }
      }
      
      departmentStats[deptId][stat.status] = stat.count
      departmentStats[deptId].total += Number(stat.count)
    }

    // Calculate occupancy rates and get department names
    const departments = await Database
      .from('master_data')
      .whereIn('id', Object.keys(departmentStats))
      .select('id', 'name')

    const result = {}
    for (const dept of departments) {
      const stats = departmentStats[dept.id]
      stats.occupancy_rate = stats.total > 0 
        ? Math.round((stats.occupied / stats.total) * 100)
        : 0
      // filepath: /home/hardik/Documents/GitHub/hospital-management/server/app/controllers/beds_controller.ts
import type { HttpContext } from '@adonisjs/core/http'
import Bed from '#models/bed'
import Room from '#models/room'
import { updateBedValidator } from '#validators/bed'
import { DateTime } from 'luxon'
import Database from '@adonisjs/lucid/services/db'

export default class BedsController {
  async index({ request, response }: HttpContext) {
    const {
      page = 1,
      limit = 10,
      search,
      room_id,
      status,
      type,
      floor
    } = request.qs()

    const query = Bed.query()
      .preload('room', (roomQuery) => {
        roomQuery.preload('department')
      })
      .preload('currentPatient')

    if (search) {
      query.where('bed_number', 'like', `%${search}%`)
        .orWhereHas('currentPatient', (patientQuery) => {
          patientQuery.where('name', 'like', `%${search}%`)
        })
    }

    if (room_id) {
      query.where('room_id', room_id)
    }

    if (status) {
      query.where('status', status)
    }

    if (type) {
      query.where('type', type)
    }

    if (floor) {
      query.whereHas('room', (roomQuery) => {
        roomQuery.where('floor', floor)
      })
    }

    const beds = await query.paginate(page, limit)

    return response.ok({
      success: true,
      data: beds,
      message: 'Beds fetched successfully'
    })
  }

  async show({ params, response }: HttpContext) {
    const bed = await Bed.query()
      .where('id', params.id)
      .preload('room', (query) => {
        query.preload('department')
      })
      .preload('currentPatient')
      .preload('admissions', (query) => {
        query.orderBy('admission_date', 'desc')
          .limit(5)
          .preload('patient')
      })
      .firstOrFail()

    return response.ok({
      success: true,
      data: bed,
      message: 'Bed details fetched successfully'
    })
  }

  async update({ params, request, response }: HttpContext) {
    const bed = await Bed.findOrFail(params.id)
    const payload = await request.validate(updateBedValidator)

    // Handle status changes
    if (payload.status) {
      if (payload.status === 'available' && bed.status === 'occupied') {
        // If marking as available from occupied, clear patient data
        bed.currentPatientId = null
        bed.admissionDate = null
        bed.expectedDischargeDate = null
        bed.lastCleaned = DateTime.now()
      } else if (payload.status === 'maintenance') {
        // If marking for maintenance, ensure it's not occupied
        if (bed.status === 'occupied') {
          return response.badRequest({
            success: false,
            message: 'Cannot mark occupied bed for maintenance'
          })
        }
      }
    }

    bed.merge(payload)
    await bed.save()

    await bed.load('room')
    await bed.load('currentPatient')

    return response.ok({
      success: true,
      data: bed,
      message: 'Bed updated successfully'
    })
  }

  async clean({ params, response }: HttpContext) {
    const bed = await Bed.findOrFail(params.id)
    
    await bed.markAsCleaned()

    return response.ok({
      success: true,
      data: bed,
      message: 'Bed marked as cleaned'
    })
  }

  async maintain({ params, response }: HttpContext) {
    const bed = await Bed.findOrFail(params.id)
    
    if (bed.status === 'occupied') {
      return response.badRequest({
        success: false,
        message: 'Cannot perform maintenance on occupied bed'
      })
    }

    bed.status = 'maintenance'
    await bed.markAsMaintained()

    return response.ok({
      success: true,
      data: bed,
      message: 'Bed marked for maintenance'
    })
  }

  async occupancyStats({ request, response }: HttpContext) {
    const { department_id, floor } = request.qs()

    let query = Database
      .from('beds')
      .join('rooms', 'beds.room_id', 'rooms.id')
      .select('rooms.department_id')
      .select('beds.status')
      .count('* as count')
      .groupBy('rooms.department_id', 'beds.status')

    if (department_id) {
      query = query.where('rooms.department_id', department_id)
    }

    if (floor) {
      query = query.where('rooms.floor', floor)
    }

    const stats = await query

    // Process stats by department
    const departmentStats = {}
    
    for (const stat of stats) {
      const deptId = stat.department_id
      if (!departmentStats[deptId]) {
        departmentStats[deptId] = {
          total: 0,
          available: 0,
          occupied: 0,
          maintenance: 0,
          reserved: 0,
          occupancy_rate: 0
        }
      }
      
      departmentStats[deptId][stat.status] = stat.count
      departmentStats[deptId].total += Number(stat.count)
    }

    // Calculate occupancy rates and get department names
    const departments = await Database
      .from('master_data')
      .whereIn('id', Object.keys(departmentStats))
      .select('id', 'name')

    const result = {}
    for (const dept of departments) {
      const stats = departmentStats[dept.id]
      stats.occupancy_rate = stats.total > 0 
        ? Math.round((stats.occupied / stats.total) * 100)
        : 0

### Task 3.3: Update Beds Controller (Continued)
The occupancyStats method needs to complete the result formatting:
- Map department IDs to names
- Include floor-wise statistics if requested
- Add summary totals across all departments
- Format response with proper department names and calculated metrics

### Task 3.4: Create Validators
Create validation schemas for all the new endpoints:

**Room Validators** (`server/app/validators/room.ts`):
- `createRoomValidator`: Validate room creation with required fields (room_number, room_type, department_id, floor, capacity, daily_rate)
- `updateRoomValidator`: Allow partial updates with same validation rules
- Ensure room_number uniqueness
- Validate room_type against master data
- Validate department exists in master data

**Admission Validators** (`server/app/validators/admission.ts`):
- `createAdmissionValidator`: Validate patient_id, bed_id, admitting_doctor_id, admission_date
- `updateAdmissionValidator`: Allow updates to diagnosis, expected_discharge_date, notes
- `dischargeValidator`: Require discharge_notes and discharge_type
- `transferValidator`: Validate new_bed_id and ensure it's different from current
- `createChargeValidator`: Validate charge_type, amount, quantity

### Task 3.5: Update Routes
Add new routes to routes.ts:

```typescript
// Room Management Routes
router.group(() => {
  router.get('/', 'RoomsController.index')
  router.post('/', 'RoomsController.store')
  router.get('/availability', 'RoomsController.availability')
  router.get('/:id', 'RoomsController.show')
  router.put('/:id', 'RoomsController.update')
  router.delete('/:id', 'RoomsController.destroy')
}).prefix('/api/rooms').middleware('auth')

// Admission Management Routes
router.group(() => {
  router.get('/', 'AdmissionsController.index')
  router.post('/', 'AdmissionsController.store')
  router.get('/statistics', 'AdmissionsController.statistics')
  router.get('/active', 'AdmissionsController.index') // with status=active filter
  router.get('/:id', 'AdmissionsController.show')
  router.put('/:id', 'AdmissionsController.update')
  router.post('/:id/discharge', 'AdmissionsController.discharge')
  router.post('/:id/transfer', 'AdmissionsController.transfer')
  router.get('/:id/bill-summary', 'AdmissionsController.billSummary')
  router.post('/:id/charges', 'AdmissionsController.addCharge')
}).prefix('/api/admissions').middleware('auth')

// Update existing bed routes
router.post('/beds/:id/clean', 'BedsController.clean')
router.post('/beds/:id/maintain', 'BedsController.maintain')
router.get('/beds/occupancy-stats', 'BedsController.occupancyStats')
```

## Phase 4: Frontend API Hooks

### Task 4.1: Create useRoomApi Hook
Create `src/hooks/useRoomApi.ts`:
- Implement CRUD operations for rooms
- Add availability stats fetching
- Include error handling and loading states
- Support filtering and pagination
- Cache room data for performance

### Task 4.2: Create useAdmissionApi Hook
Create `src/hooks/useAdmissionApi.ts`:
- Implement admission CRUD operations
- Add discharge and transfer functions
- Include charge management
- Add bill summary fetching
- Support admission statistics

### Task 4.3: Update useBedApi Hook
Enhance the existing hook with:
- Clean and maintain operations
- Occupancy statistics
- Better relationship loading (include room and patient data)
- Real-time status updates

## Phase 5: Frontend Component Updates

### Task 5.1: Update BedManagement Component
Remove mock data and connect to real APIs:
- Replace useState for rooms with useRoomApi
- Replace useState for admissions with useAdmissionApi
- Implement proper loading states
- Add error boundary for API failures
- Update all CRUD operations to use API calls

### Task 5.2: Create Sub-components

**RoomManagementDialog**:
- Form for creating/editing rooms
- Amenities multi-select using MasterDropdown
- Department selection from master data
- Capacity and bed generation logic
- Validation and error display

**AdmissionDialog**:
- Patient selection with search
- Available bed selection (filtered by type/department)
- Doctor selection (only active doctors)
- Expected discharge date picker
- Initial diagnosis and notes

**DischargeDialog**:
- Discharge type selection from master data
- Discharge notes textarea
- Bill summary display
- Warning for unpaid charges
- Confirmation before discharge

**TransferDialog**:
- Available bed selection
- Transfer reason
- Automatic charge calculation for partial days
- Update patient location

### Task 5.3: Enhance UI Features

**Bed Status Visualization**:
- Color-coded bed cards (green=available, red=occupied, yellow=maintenance, blue=reserved)
- Quick status change buttons
- Cleaning status indicator
- Days since last cleaning/maintenance

**Room Layout View**:
- Visual representation of room layouts
- Drag-and-drop for bed transfers
- Quick patient information on hover
- Department-wise floor plans

**Admission Timeline**:
- Visual timeline of patient admissions
- Expected vs actual discharge dates
- Transfer history
- Charge accumulation over time

## Phase 6: Integration with Other Modules

### Task 6.1: Patient Module Integration
- Display active admission in patient profile
- Show admission history
- Link to medical records during admission
- Quick admit button from patient list

### Task 6.2: Doctor Module Integration
- Show doctor's current admitted patients
- Allow doctors to update diagnosis
- Discharge recommendations
- Transfer requests

### Task 6.3: Billing Module Integration
- Auto-generate bills on discharge
- Daily room charge calculation job
- Integration with existing bill structure
- Insurance claim processing

### Task 6.4: Notification Integration
- Notify nurses for bed cleaning
- Alert for expected discharges
- Low bed availability warnings
- Emergency admission alerts

## Phase 7: Role-Based Permissions

### Task 7.1: Define Permissions
Add to permissions table:
- `beds.view`, `beds.create`, `beds.update`, `beds.delete`
- `rooms.view`, `rooms.create`, `rooms.update`, `rooms.delete`
- `admissions.view`, `admissions.create`, `admissions.update`, `admissions.discharge`
- `admissions.transfer`, `admissions.charges.manage`

### Task 7.2: Role Permission Mapping
- **Admin**: All permissions
- **Doctor**: View all, discharge own patients, update diagnosis
- **Nurse**: View all, update bed status, mark cleaning
- **Receptionist**: Create admissions, view availability
- **Billing**: View admissions, manage charges, generate bills

### Task 7.3: Frontend Permission Checks
- Use RoleBasedAccess component to hide/show features
- Disable buttons based on permissions
- Show appropriate error messages

## Phase 8: Advanced Features

### Task 8.1: Bed Reservation System
- Allow advance bed booking for scheduled admissions
- Waiting list management
- Priority queue for emergency cases
- Auto-cancel expired reservations

### Task 8.2: Analytics Dashboard
- Real-time occupancy dashboard
- Department-wise utilization graphs
- Average length of stay trends
- Revenue analysis by room type
- Predictive analytics for bed demand

### Task 8.3: Automated Workflows
- Daily room charge generation cron job
- Bed cleaning reminder notifications
- Discharge planning alerts
- Bed turnover optimization

### Task 8.4: Mobile Responsiveness
- Responsive bed grid layout
- Touch-friendly status updates
- Mobile-optimized admission forms
- Quick actions for common tasks

This completes the comprehensive development plan for the BedManagement module. Each task should be implemented incrementally, tested thoroughly, and integrated with existing modules to create a fully functional, production-ready hospital bed management system.