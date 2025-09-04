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

    // Extended data (populated when needed)
    demographics?: PatientDemographics;
    insurances?: PatientInsurance[];
    patientAllergies?: PatientAllergy[];
    medications?: PatientMedication[];
    immunizations?: PatientImmunization[];
    familyHistory?: PatientFamilyHistory[];
    documents?: PatientDocument[];
    consents?: PatientConsent[];
    portalAccess?: PatientPortalAccess;
    communicationPreferences?: PatientCommunicationPreferences;

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

// Enhanced Patient Data Types based on new database schema

export interface PatientDemographics {
    id: string;
    patient_id: string;
    ethnicity?: string;
    race?: string;
    primary_language?: string;
    secondary_language?: string;
    marital_status?: 'single' | 'married' | 'divorced' | 'widowed' | 'separated' | 'domestic_partnership';
    occupation?: string;
    employer?: string;
    education_level?: 'none' | 'elementary' | 'high_school' | 'some_college' | 'bachelor' | 'master' | 'doctorate';
    religion?: string;
    preferred_contact_method: 'phone' | 'email' | 'sms' | 'mail';
    preferred_contact_time?: string;
    emergency_contact_1?: EmergencyContact;
    emergency_contact_2?: EmergencyContact;
    next_of_kin?: EmergencyContact;
    created_at: string;
    updated_at: string;
}

export interface PatientInsurance {
    id: string;
    patient_id: string;
    insurance_type: 'primary' | 'secondary' | 'tertiary';
    provider_name: string;
    policy_number: string;
    group_number?: string;
    subscriber_name: string;
    subscriber_relationship: 'self' | 'spouse' | 'child' | 'parent' | 'other';
    subscriber_dob?: string;
    effective_date: string;
    expiry_date?: string;
    copay_amount?: number;
    deductible_amount?: number;
    coverage_details?: any;
    card_front_image?: string;
    card_back_image?: string;
    verification_status: 'pending' | 'verified' | 'failed' | 'expired';
    verified_date?: string;
    verified_by?: string;
    status: 'active' | 'inactive' | 'expired';
    created_at: string;
    updated_at: string;
}

export interface PatientAllergy {
    id: string;
    patient_id: string;
    allergy_type: 'drug' | 'food' | 'environmental' | 'other';
    allergen: string;
    severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
    reaction_type?: string;
    onset_date?: string;
    notes?: string;
    status: 'active' | 'inactive' | 'resolved';
    reported_by?: string;
    verified_by?: string;
    created_at: string;
    updated_at: string;
}

export interface PatientMedication {
    id: string;
    patient_id: string;
    medication_name: string;
    generic_name?: string;
    dosage: string;
    frequency: string;
    route?: string;
    start_date: string;
    end_date?: string;
    prescribed_by?: string;
    pharmacy_name?: string;
    reason?: string;
    status: 'active' | 'discontinued' | 'completed';
    adherence_notes?: string;
    created_at: string;
    updated_at: string;
}

export interface PatientImmunization {
    id: string;
    patient_id: string;
    vaccine_name: string;
    vaccine_code?: string;
    dose_number: number;
    administration_date: string;
    administration_site?: string;
    lot_number?: string;
    manufacturer?: string;
    expiry_date?: string;
    administered_by?: string;
    next_due_date?: string;
    reaction_notes?: string;
    created_at: string;
    updated_at: string;
}

export interface PatientFamilyHistory {
    id: string;
    patient_id: string;
    relationship: 'father' | 'mother' | 'sibling' | 'grandparent' | 'aunt' | 'uncle' | 'cousin' | 'other';
    condition: string;
    age_at_diagnosis?: number;
    current_status?: 'living' | 'deceased' | 'unknown';
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface PatientDocument {
    id: string;
    patient_id: string;
    document_type: 'consent' | 'insurance' | 'id' | 'medical' | 'other';
    document_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    description?: string;
    uploaded_by: string;
    is_verified: boolean;
    verified_by?: string;
    expiry_date?: string;
    tags?: string[];
    metadata?: any;
    created_at: string;
    updated_at: string;
}

export interface PatientConsent {
    id: string;
    patient_id: string;
    consent_type: 'treatment' | 'data-sharing' | 'research' | 'photography' | 'marketing';
    consent_form_id?: string;
    status: 'granted' | 'revoked' | 'expired';
    granted_date: string;
    expiry_date?: string;
    revoked_date?: string;
    witness_name?: string;
    witness_signature?: string;
    patient_signature?: string;
    guardian_signature?: string;
    document_path?: string;
    created_at: string;
    updated_at: string;
}

export interface PatientPortalAccess {
    id: string;
    patient_id: string;
    username: string;
    email: string;
    is_active: boolean;
    last_login?: string;
    login_attempts: number;
    locked_until?: string;
    two_factor_enabled: boolean;
    email_verified: boolean;
    preferences?: any;
    created_at: string;
    updated_at: string;
}

export interface PatientCommunicationPreferences {
    id: string;
    patient_id: string;
    appointment_reminders: boolean;
    appointment_reminder_method: 'sms' | 'email' | 'call' | 'all';
    appointment_reminder_timing: number; // hours before
    lab_results_notification: boolean;
    lab_results_method: 'sms' | 'email' | 'portal';
    billing_notifications: boolean;
    billing_method: 'email' | 'paper' | 'both';
    marketing_communications: boolean;
    health_tips: boolean;
    survey_participation: boolean;
    preferred_pharmacy_id?: string;
    created_at: string;
    updated_at: string;
}
