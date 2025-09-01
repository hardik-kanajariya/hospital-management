// Patient management specific types aligned with backend model

export interface Patient {
    id: string;
    patient_id: string; // Auto-generated patient ID like PAT001
    name: string;
    phone: string;
    email?: string;
    date_of_birth: string;
    gender: string;
    address: string;
    emergency_contact: EmergencyContact;
    blood_group?: string;
    allergies: string[];
    chronic_conditions: string[];
    vaccination_records: VaccinationRecord[];
    insurance_info?: InsuranceInfo;
    created_at: string;
    updated_at: string;

    // Related data (populated when needed)
    appointments?: Appointment[];
    medicalRecords?: MedicalRecord[];
    bills?: Bill[];

    // UI specific fields
    synced?: boolean;
    local_changes?: boolean;
}

export interface EmergencyContact {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address?: string;
}

export interface VaccinationRecord {
    vaccine_name: string;
    date_administered: string;
    next_due_date?: string;
    administered_by: string;
    batch_number?: string;
    notes?: string;
}

export interface InsuranceInfo {
    provider: string;
    policy_number: string;
    coverage_amount: number;
    expiry_date: string;
    copay_amount?: number;
    network_hospitals?: string[];
}

// Related models for patient profile
export interface Appointment {
    id: string;
    patient_id: string;
    doctor_id: string;
    appointment_date: string;
    appointment_time: string;
    duration: number;
    type: string;
    status: string;
    reason: string;
    notes?: string;
    created_at: string;
    updated_at: string;

    // Populated data
    doctor?: Doctor;
}

export interface MedicalRecord {
    id: string;
    patient_id: string;
    doctor_id: string;
    visit_date: string;
    chief_complaint: string;
    symptoms: string[];
    diagnosis: string;
    treatment: string;
    prescriptions: Prescription[];
    lab_tests?: LabTest[];
    notes: string;
    follow_up_date?: string;
    created_at: string;
    updated_at: string;

    // Populated data
    doctor?: Doctor;
}

export interface Prescription {
    id: string;
    medication_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    quantity: number;
}

export interface LabTest {
    id: string;
    test_name: string;
    test_type: string;
    status: string;
    ordered_date: string;
    sample_collected_date?: string;
    result_date?: string;
    results?: LabTestResult[];
    notes?: string;
}

export interface LabTestResult {
    parameter: string;
    value: string;
    unit: string;
    reference_range: string;
    status: string;
}

export interface Bill {
    id: string;
    patient_id: string;
    bill_number: string;
    bill_date: string;
    items: BillItem[];
    subtotal: number;
    tax_amount: number;
    discount_amount: number;
    total_amount: number;
    paid_amount: number;
    balance_amount: number;
    status: string;
    payment_method?: string;
    insurance_claim_amount?: number;
    created_at: string;
    updated_at: string;
}

export interface BillItem {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    type: string;
}

export interface Doctor {
    id: string;
    name: string;
    specialization: string;
    qualification: string;
    license_number: string;
    phone: string;
    email: string;
    department: string;
    consultation_fee: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Form types for create/update operations
export interface PatientCreateRequest {
    name: string;
    phone: string;
    email?: string;
    date_of_birth: string;
    gender: string;
    address: string;
    emergency_contact: EmergencyContact;
    blood_group?: string;
    allergies?: string[];
    chronic_conditions?: string[];
    vaccination_records?: VaccinationRecord[];
    insurance_info?: InsuranceInfo;
}

export interface PatientUpdateRequest extends Partial<PatientCreateRequest> {
    id: string;
}

// Search and filter types
export interface PatientSearchParams {
    page?: number;
    limit?: number;
    search?: string;
    blood_group?: string;
    gender?: string;
    age_min?: number;
    age_max?: number;
    has_allergies?: boolean;
    has_chronic_conditions?: boolean;
    sort_by?: 'name' | 'created_at' | 'patient_id';
    sort_order?: 'asc' | 'desc';
}

export interface PatientStats {
    total_patients: number;
    new_patients_today: number;
    new_patients_this_week: number;
    new_patients_this_month: number;
    patients_with_appointments_today: number;
    patients_by_gender: {
        male: number;
        female: number;
        other: number;
    };
    patients_by_age_group: {
        '0-18': number;
        '19-35': number;
        '36-50': number;
        '51-65': number;
        '65+': number;
    };
    patients_with_allergies: number;
    patients_with_chronic_conditions: number;
}
