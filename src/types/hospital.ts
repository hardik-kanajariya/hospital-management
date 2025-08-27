// Hospital management types
export interface Patient {
  id: string;
  mrNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phoneNumber: string;
  email?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  bloodGroup?: string;
  allergies: string[];
  chronicConditions: ChronicCondition[];
  vaccinationRecords: VaccinationRecord[];
  insuranceInfo?: InsuranceInfo;
  createdAt: string;
  updatedAt: string;
}

export interface ChronicCondition {
  id: string;
  condition: string;
  diagnosedDate: string;
  severity: 'mild' | 'moderate' | 'severe';
  medications: string[];
  lastReviewDate: string;
  notes?: string;
}

export interface VaccinationRecord {
  id: string;
  vaccineName: string;
  dateAdministered: string;
  batchNumber: string;
  administeredBy: string;
  nextDueDate?: string;
  notes?: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  expiryDate: string;
  coverageAmount: number;
  copayAmount: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  type: 'consultation' | 'follow_up' | 'procedure' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reason: string;
  notes?: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  licenseNumber: string;
  phoneNumber: string;
  email: string;
  schedule: DoctorSchedule[];
  consultationFee: number;
  isActive: boolean;
  department: string;
}

export interface DoctorSchedule {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  maxPatients: number;
  breakStartTime?: string;
  breakEndTime?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  visitDate: string;
  doctorId: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  physicalExamination: string;
  diagnosis: string;
  prescription: Prescription[];
  labTests: string[];
  followUpDate?: string;
  notes?: string;
  vitalSigns: VitalSigns;
}

export interface VitalSigns {
  temperature: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  heartRate: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  weight: number;
  height: number;
}

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
}

export interface LabTest {
  id: string;
  patientId: string;
  testName: string;
  testCode: string;
  orderedBy: string;
  orderedDate: string;
  sampleCollectedDate?: string;
  resultDate?: string;
  status: 'ordered' | 'sample_collected' | 'in_progress' | 'completed' | 'cancelled';
  results?: LabResult[];
  notes?: string;
  urgency: 'routine' | 'urgent' | 'stat';
}

export interface LabResult {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  abnormalFlag?: 'high' | 'low' | 'critical';
}

export interface Bed {
  id: string;
  bedNumber: string;
  ward: string;
  bedType: 'general' | 'private' | 'icu' | 'emergency';
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  patientId?: string;
  admissionDate?: string;
  expectedDischargeDate?: string;
  dailyRate: number;
}

export interface InventoryItem {
  id: string;
  itemName: string;
  itemCode: string;
  category: 'medicine' | 'surgical' | 'diagnostic' | 'consumable';
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unitPrice: number;
  reorderLevel: number;
  location: string;
  supplier: string;
  lastUpdated: string;
}

export interface Bill {
  id: string;
  patientId: string;
  billDate: string;
  items: BillItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'insurance' | 'credit';
  status: 'pending' | 'partially_paid' | 'paid' | 'overdue';
  dueDate: string;
  insuranceClaim?: InsuranceClaim;
}

export interface BillItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  category: 'consultation' | 'procedure' | 'medication' | 'lab_test' | 'room_charges' | 'other';
}

export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  submittedDate: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid';
  claimAmount: number;
  approvedAmount?: number;
  rejectionReason?: string;
  documents: string[];
}

export interface Notification {
  id: string;
  type: 'sms' | 'email' | 'in_app';
  recipientId: string;
  recipientType: 'patient' | 'doctor' | 'staff';
  subject: string;
  message: string;
  scheduledAt: string;
  sentAt?: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  templateType: 'appointment_reminder' | 'lab_result' | 'billing_reminder' | 'prescription_ready';
}