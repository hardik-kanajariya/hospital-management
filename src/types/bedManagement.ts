export interface Room {
  id: string;
  room_number: string;
  room_type_id: string;
  floor: number;
  building?: string;
  capacity: number;
  amenities?: string[];
  daily_rate: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  description?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  room_type?: {
    id: string;
    name: string;
    description?: string;
  };
  beds?: Bed[];
}

export interface Bed {
  id: string;
  bed_number: string;
  room_id: string;
  bed_type_id: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  current_patient_id?: string;
  features?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  room?: Room;
  bed_type?: {
    id: string;
    name: string;
    description?: string;
  };
  current_patient?: Patient;
  current_admission?: Admission;
}

export interface Admission {
  id: string;
  patient_id: string;
  bed_id: string;
  room_id: string;
  admission_date: string;
  estimated_discharge_date?: string;
  actual_discharge_date?: string;
  admission_type: string;
  admission_reason: string;
  diagnosis?: string;
  treatment_plan?: string;
  notes?: string;
  status: 'active' | 'discharged' | 'transferred';
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  patient?: Patient;
  bed?: Bed;
  room?: Room;
  charges?: AdmissionCharge[];
  created_by_user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AdmissionCharge {
  id: string;
  admission_id: string;
  charge_type_id: string;
  description: string;
  amount: number;
  quantity: number;
  total_amount: number;
  charge_date: string;
  created_by: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  admission?: Admission;
  charge_type?: {
    id: string;
    name: string;
    category: string;
    default_amount?: number;
  };
  created_by_user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  emergency_contact?: string;
  medical_history?: string;
  created_at: string;
  updated_at: string;
}

// Statistics and Dashboard Types
export interface BedStatistics {
  total_beds: number;
  available_beds: number;
  occupied_beds: number;
  maintenance_beds: number;
  reserved_beds: number;
  occupancy_rate: number;
  beds_by_type: Array<{
    type: string;
    total: number;
    available: number;
    occupied: number;
  }>;
}

export interface RoomStatistics {
  total_rooms: number;
  available_rooms: number;
  occupied_rooms: number;
  maintenance_rooms: number;
  reserved_rooms: number;
  occupancy_rate: number;
  rooms_by_type: Array<{
    type: string;
    total: number;
    available: number;
    occupied: number;
  }>;
  rooms_by_floor: Array<{
    floor: number;
    total: number;
    available: number;
    occupied: number;
  }>;
}

export interface AdmissionStatistics {
  total_admissions: number;
  active_admissions: number;
  today_admissions: number;
  today_discharges: number;
  average_length_of_stay: number;
  admissions_by_type: Array<{
    type: string;
    count: number;
  }>;
  monthly_admissions: Array<{
    month: string;
    count: number;
  }>;
}

// Form Types
export interface CreateRoomFormData {
  room_number: string;
  room_type_id: string;
  floor: number;
  building?: string;
  capacity: number;
  amenities?: string[];
  daily_rate: number;
  description?: string;
}

export interface CreateBedFormData {
  bed_number: string;
  room_id: string;
  bed_type_id: string;
  features?: string[];
  notes?: string;
}

export interface AdmitPatientFormData {
  patient_id: string;
  bed_id: string;
  admission_type: string;
  admission_reason: string;
  diagnosis?: string;
  treatment_plan?: string;
  estimated_discharge_date?: string;
  notes?: string;
}

export interface DischargePatientFormData {
  actual_discharge_date: string;
  discharge_reason: string;
  discharge_notes?: string;
  follow_up_instructions?: string;
}

export interface TransferPatientFormData {
  new_bed_id: string;
  transfer_reason: string;
  transfer_notes?: string;
}

export interface AddChargeFormData {
  charge_type_id: string;
  description: string;
  amount: number;
  quantity: number;
  notes?: string;
}
