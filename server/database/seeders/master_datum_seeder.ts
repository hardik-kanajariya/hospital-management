import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Database from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    const defaultData = [
      // Departments
      { category: 'departments', name: 'Emergency', description: 'Emergency Department', value: 'emergency', display_order: 1, is_system: true },
      { category: 'departments', name: 'Cardiology', description: 'Heart and Cardiovascular Care', value: 'cardiology', display_order: 2, is_system: true },
      { category: 'departments', name: 'Neurology', description: 'Brain and Nervous System', value: 'neurology', display_order: 3, is_system: true },
      { category: 'departments', name: 'Orthopedics', description: 'Bone and Joint Care', value: 'orthopedics', display_order: 4, is_system: true },
      { category: 'departments', name: 'Pediatrics', description: 'Child Healthcare', value: 'pediatrics', display_order: 5, is_system: true },
      { category: 'departments', name: 'Gynecology', description: 'Women\'s Health', value: 'gynecology', display_order: 6, is_system: true },
      { category: 'departments', name: 'Surgery', description: 'Surgical Services', value: 'surgery', display_order: 7, is_system: true },
      { category: 'departments', name: 'Internal Medicine', description: 'General Internal Medicine', value: 'internal_medicine', display_order: 8, is_system: true },

      // Specializations
      { category: 'specializations', name: 'General Practitioner', description: 'Family Medicine', value: 'general_practitioner', display_order: 1, is_system: true },
      { category: 'specializations', name: 'Cardiologist', description: 'Heart Specialist', value: 'cardiologist', display_order: 2, is_system: true },
      { category: 'specializations', name: 'Neurologist', description: 'Brain and Nerve Specialist', value: 'neurologist', display_order: 3, is_system: true },
      { category: 'specializations', name: 'Orthopedic Surgeon', description: 'Bone and Joint Surgery', value: 'orthopedic_surgeon', display_order: 4, is_system: true },
      { category: 'specializations', name: 'Pediatrician', description: 'Child Specialist', value: 'pediatrician', display_order: 5, is_system: true },
      { category: 'specializations', name: 'Gynecologist', description: 'Women\'s Health Specialist', value: 'gynecologist', display_order: 6, is_system: true },
      { category: 'specializations', name: 'Emergency Medicine', description: 'Emergency Care Specialist', value: 'emergency_medicine', display_order: 7, is_system: true },
      { category: 'specializations', name: 'Radiologist', description: 'Medical Imaging Specialist', value: 'radiologist', display_order: 8, is_system: true },
      { category: 'specializations', name: 'Psychiatry', description: 'Mental Health Specialist', value: 'psychiatry', display_order: 9, is_system: true },
      { category: 'specializations', name: 'Dermatology', description: 'Skin Specialist', value: 'dermatology', display_order: 10, is_system: true },
      { category: 'specializations', name: 'Ophthalmology', description: 'Eye Specialist', value: 'ophthalmology', display_order: 11, is_system: true },
      { category: 'specializations', name: 'General Medicine', description: 'General Medicine', value: 'general_medicine', display_order: 12, is_system: true },
      { category: 'specializations', name: 'General Surgery', description: 'General Surgery', value: 'surgery', display_order: 13, is_system: true },
      { category: 'specializations', name: 'Anesthesiology', description: 'Anesthesia Specialist', value: 'anesthesiology', display_order: 14, is_system: true },
      { category: 'specializations', name: 'Pathology', description: 'Disease Diagnosis', value: 'pathology', display_order: 15, is_system: true },

      // Lab Test Types
      { category: 'lab_test_types', name: 'Blood Test', description: 'Complete Blood Count', value: 'blood_test', display_order: 1, is_system: true },
      { category: 'lab_test_types', name: 'Urine Test', description: 'Urine Analysis', value: 'urine_test', display_order: 2, is_system: true },
      { category: 'lab_test_types', name: 'X-Ray', description: 'X-Ray Imaging', value: 'xray', display_order: 3, is_system: true },
      { category: 'lab_test_types', name: 'CT Scan', description: 'Computed Tomography', value: 'ct_scan', display_order: 4, is_system: true },
      { category: 'lab_test_types', name: 'MRI', description: 'Magnetic Resonance Imaging', value: 'mri', display_order: 5, is_system: true },
      { category: 'lab_test_types', name: 'ECG', description: 'Electrocardiogram', value: 'ecg', display_order: 6, is_system: true },
      { category: 'lab_test_types', name: 'Ultrasound', description: 'Ultrasound Imaging', value: 'ultrasound', display_order: 7, is_system: true },

      // Appointment Types
      { category: 'appointment_types', name: 'Consultation', description: 'Regular Doctor Consultation', value: 'consultation', display_order: 1, is_system: true },
      { category: 'appointment_types', name: 'Follow-up', description: 'Follow-up Visit', value: 'followup', display_order: 2, is_system: true },
      { category: 'appointment_types', name: 'Emergency', description: 'Emergency Appointment', value: 'emergency', display_order: 3, is_system: true },
      { category: 'appointment_types', name: 'Procedure', description: 'Medical Procedure', value: 'procedure', display_order: 4, is_system: true },
      { category: 'appointment_types', name: 'Surgery', description: 'Surgical Procedure', value: 'surgery', display_order: 5, is_system: true },

      // Blood Groups
      { category: 'blood_groups', name: 'A+', description: 'A Positive', value: 'a_positive', display_order: 1, is_system: true },
      { category: 'blood_groups', name: 'A-', description: 'A Negative', value: 'a_negative', display_order: 2, is_system: true },
      { category: 'blood_groups', name: 'B+', description: 'B Positive', value: 'b_positive', display_order: 3, is_system: true },
      { category: 'blood_groups', name: 'B-', description: 'B Negative', value: 'b_negative', display_order: 4, is_system: true },
      { category: 'blood_groups', name: 'AB+', description: 'AB Positive', value: 'ab_positive', display_order: 5, is_system: true },
      { category: 'blood_groups', name: 'AB-', description: 'AB Negative', value: 'ab_negative', display_order: 6, is_system: true },
      { category: 'blood_groups', name: 'O+', description: 'O Positive', value: 'o_positive', display_order: 7, is_system: true },
      { category: 'blood_groups', name: 'O-', description: 'O Negative', value: 'o_negative', display_order: 8, is_system: true },

      // Gender Options
      { category: 'genders', name: 'Male', description: 'Male Gender', value: 'male', display_order: 1, is_system: true },
      { category: 'genders', name: 'Female', description: 'Female Gender', value: 'female', display_order: 2, is_system: true },
      { category: 'genders', name: 'Other', description: 'Other Gender', value: 'other', display_order: 3, is_system: true },

      // Emergency Contact Relationships
      { category: 'relationships', name: 'Spouse', description: 'Husband/Wife', value: 'spouse', display_order: 1, is_system: true },
      { category: 'relationships', name: 'Parent', description: 'Father/Mother', value: 'parent', display_order: 2, is_system: true },
      { category: 'relationships', name: 'Child', description: 'Son/Daughter', value: 'child', display_order: 3, is_system: true },
      { category: 'relationships', name: 'Sibling', description: 'Brother/Sister', value: 'sibling', display_order: 4, is_system: true },
      { category: 'relationships', name: 'Friend', description: 'Friend', value: 'friend', display_order: 5, is_system: true },
      { category: 'relationships', name: 'Guardian', description: 'Legal Guardian', value: 'guardian', display_order: 6, is_system: true },
      { category: 'relationships', name: 'Relative', description: 'Other Relative', value: 'relative', display_order: 7, is_system: true },
      { category: 'relationships', name: 'Colleague', description: 'Work Colleague', value: 'colleague', display_order: 8, is_system: true },

      // Lab Sections
      { category: 'lab_sections', name: 'Hematology', description: 'Blood Tests and Analysis', value: 'hematology', display_order: 1, is_system: true },
      { category: 'lab_sections', name: 'Biochemistry', description: 'Chemical Analysis', value: 'biochemistry', display_order: 2, is_system: true },
      { category: 'lab_sections', name: 'Microbiology', description: 'Microbial Analysis', value: 'microbiology', display_order: 3, is_system: true },
      { category: 'lab_sections', name: 'Pathology', description: 'Disease Diagnosis', value: 'pathology', display_order: 4, is_system: true },
      { category: 'lab_sections', name: 'Radiology', description: 'Medical Imaging', value: 'radiology', display_order: 5, is_system: true },
      { category: 'lab_sections', name: 'Blood Bank', description: 'Blood Banking Services', value: 'blood_bank', display_order: 6, is_system: true },

      // Pharmacy Specializations
      { category: 'pharmacy_specializations', name: 'Clinical Pharmacy', description: 'Patient-focused pharmaceutical care', value: 'clinical', display_order: 1, is_system: true },
      { category: 'pharmacy_specializations', name: 'Hospital Pharmacy', description: 'Institutional pharmaceutical services', value: 'hospital', display_order: 2, is_system: true },
      { category: 'pharmacy_specializations', name: 'Retail Pharmacy', description: 'Community pharmaceutical services', value: 'retail', display_order: 3, is_system: true },
      { category: 'pharmacy_specializations', name: 'Oncology Pharmacy', description: 'Cancer medication specialization', value: 'oncology', display_order: 4, is_system: true },
      { category: 'pharmacy_specializations', name: 'Pediatric Pharmacy', description: 'Children medication specialization', value: 'pediatric', display_order: 5, is_system: true },

      // Nursing Certifications
      { category: 'nursing_certifications', name: 'Registered Nurse (RN)', description: 'Licensed Registered Nurse', value: 'rn', display_order: 1, is_system: true },
      { category: 'nursing_certifications', name: 'Licensed Practical Nurse (LPN)', description: 'Licensed Practical Nurse', value: 'lpn', display_order: 2, is_system: true },
      { category: 'nursing_certifications', name: 'Certified Nursing Assistant (CNA)', description: 'Certified Nursing Assistant', value: 'cna', display_order: 3, is_system: true },
      { category: 'nursing_certifications', name: 'Basic Life Support (BLS)', description: 'Basic Life Support Certification', value: 'bls', display_order: 4, is_system: true },
      { category: 'nursing_certifications', name: 'Advanced Cardiac Life Support (ACLS)', description: 'Advanced Cardiac Life Support', value: 'acls', display_order: 5, is_system: true },
      { category: 'nursing_certifications', name: 'Pediatric Advanced Life Support (PALS)', description: 'Pediatric Advanced Life Support', value: 'pals', display_order: 6, is_system: true },

      // Lab Certifications
      { category: 'lab_certifications', name: 'Medical Laboratory Technician (MLT)', description: 'Medical Laboratory Technician Certification', value: 'mlt', display_order: 1, is_system: true },
      { category: 'lab_certifications', name: 'Clinical Laboratory Scientist (CLS)', description: 'Clinical Laboratory Scientist Certification', value: 'cls', display_order: 2, is_system: true },
      { category: 'lab_certifications', name: 'ASCP Certified', description: 'American Society for Clinical Pathology Certification', value: 'ascp', display_order: 3, is_system: true },
      { category: 'lab_certifications', name: 'Phlebotomy Certification', description: 'Blood Drawing Certification', value: 'phlebotomy', display_order: 4, is_system: true },

      // Work Shifts
      { category: 'work_shifts', name: 'Day (6 AM - 2 PM)', description: 'Day Shift', value: 'day', display_order: 1, is_system: true },
      { category: 'work_shifts', name: 'Evening (2 PM - 10 PM)', description: 'Evening Shift', value: 'evening', display_order: 2, is_system: true },
      { category: 'work_shifts', name: 'Night (10 PM - 6 AM)', description: 'Night Shift', value: 'night', display_order: 3, is_system: true },
      { category: 'work_shifts', name: 'Rotating Shifts', description: 'Rotating Work Schedule', value: 'rotating', display_order: 4, is_system: true },

      // Languages
      { category: 'languages', name: 'English', description: 'English Language', value: 'english', display_order: 1, is_system: true },
      { category: 'languages', name: 'Hindi', description: 'Hindi Language', value: 'hindi', display_order: 2, is_system: true },
      { category: 'languages', name: 'Spanish', description: 'Spanish Language', value: 'spanish', display_order: 3, is_system: true },
      { category: 'languages', name: 'French', description: 'French Language', value: 'french', display_order: 4, is_system: true },
      { category: 'languages', name: 'German', description: 'German Language', value: 'german', display_order: 5, is_system: true },
      { category: 'languages', name: 'Chinese', description: 'Chinese Language', value: 'chinese', display_order: 6, is_system: true }
    ]

    // Insert or update data
    for (const item of defaultData) {
      const existing = await Database
        .from('master_data')
        .where('category', item.category)
        .where('value', item.value)
        .first()

      if (!existing) {
        await Database
          .table('master_data')
          .insert({
            ...item,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          })
      }
    }

    console.log('✅ Master data seeded successfully')
  }
}