import { BaseSeeder } from "@adonisjs/lucid/seeders";
import Database from "@adonisjs/lucid/services/db";

export default class extends BaseSeeder {
  async run() {
    const defaultData = [
      // Departments
      {
        category: "departments",
        name: "Emergency",
        description: "Emergency Department",
        value: "emergency",
        display_order: 1,
        is_system: true,
      },
      {
        category: "departments",
        name: "Cardiology",
        description: "Heart and Cardiovascular Care",
        value: "cardiology",
        display_order: 2,
        is_system: true,
      },
      {
        category: "departments",
        name: "Neurology",
        description: "Brain and Nervous System",
        value: "neurology",
        display_order: 3,
        is_system: true,
      },
      {
        category: "departments",
        name: "Orthopedics",
        description: "Bone and Joint Care",
        value: "orthopedics",
        display_order: 4,
        is_system: true,
      },
      {
        category: "departments",
        name: "Pediatrics",
        description: "Child Healthcare",
        value: "pediatrics",
        display_order: 5,
        is_system: true,
      },
      {
        category: "departments",
        name: "Gynecology",
        description: "Women's Health",
        value: "gynecology",
        display_order: 6,
        is_system: true,
      },
      {
        category: "departments",
        name: "Surgery",
        description: "Surgical Services",
        value: "surgery",
        display_order: 7,
        is_system: true,
      },
      {
        category: "departments",
        name: "Internal Medicine",
        description: "General Internal Medicine",
        value: "internal_medicine",
        display_order: 8,
        is_system: true,
      },

      // Specializations
      {
        category: "specializations",
        name: "General Practitioner",
        description: "Family Medicine",
        value: "general_practitioner",
        display_order: 1,
        is_system: true,
      },
      {
        category: "specializations",
        name: "Cardiologist",
        description: "Heart Specialist",
        value: "cardiologist",
        display_order: 2,
        is_system: true,
      },
      {
        category: "specializations",
        name: "Neurologist",
        description: "Brain and Nerve Specialist",
        value: "neurologist",
        display_order: 3,
        is_system: true,
      },
      {
        category: "specializations",
        name: "Orthopedic Surgeon",
        description: "Bone and Joint Surgery",
        value: "orthopedic_surgeon",
        display_order: 4,
        is_system: true,
      },
      {
        category: "specializations",
        name: "Pediatrician",
        description: "Child Specialist",
        value: "pediatrician",
        display_order: 5,
        is_system: true,
      },
      {
        category: "specializations",
        name: "Gynecologist",
        description: "Women's Health Specialist",
        value: "gynecologist",
        display_order: 6,
        is_system: true,
      },
      {
        category: "specializations",
        name: "Emergency Medicine",
        description: "Emergency Care Specialist",
        value: "emergency_medicine",
        display_order: 7,
        is_system: true,
      },
      {
        category: "specializations",
        name: "Radiologist",
        description: "Medical Imaging Specialist",
        value: "radiologist",
        display_order: 8,
        is_system: true,
      },
      {
        category: "specializations",
        name: "Psychiatry",
        description: "Mental Health Specialist",
        value: "psychiatry",
        display_order: 9,
        is_system: true,
      },
      {
        category: "specializations",
        name: "Dermatology",
        description: "Skin Specialist",
        value: "dermatology",
        display_order: 10,
        is_system: true,
      },
      {
        category: "specializations",
        name: "Ophthalmology",
        description: "Eye Specialist",
        value: "ophthalmology",
        display_order: 11,
        is_system: true,
      },
      {
        category: "specializations",
        name: "General Medicine",
        description: "General Medicine",
        value: "general_medicine",
        display_order: 12,
        is_system: true,
      },
      {
        category: "specializations",
        name: "General Surgery",
        description: "General Surgery",
        value: "surgery",
        display_order: 13,
        is_system: true,
      },
      {
        category: "specializations",
        name: "Anesthesiology",
        description: "Anesthesia Specialist",
        value: "anesthesiology",
        display_order: 14,
        is_system: true,
      },
      {
        category: "specializations",
        name: "Pathology",
        description: "Disease Diagnosis",
        value: "pathology",
        display_order: 15,
        is_system: true,
      },

      // Lab Test Types
      {
        category: "lab_test_types",
        name: "Blood Test",
        description: "Complete Blood Count",
        value: "blood_test",
        display_order: 1,
        is_system: true,
      },
      {
        category: "lab_test_types",
        name: "Urine Test",
        description: "Urine Analysis",
        value: "urine_test",
        display_order: 2,
        is_system: true,
      },
      {
        category: "lab_test_types",
        name: "X-Ray",
        description: "X-Ray Imaging",
        value: "xray",
        display_order: 3,
        is_system: true,
      },
      {
        category: "lab_test_types",
        name: "CT Scan",
        description: "Computed Tomography",
        value: "ct_scan",
        display_order: 4,
        is_system: true,
      },
      {
        category: "lab_test_types",
        name: "MRI",
        description: "Magnetic Resonance Imaging",
        value: "mri",
        display_order: 5,
        is_system: true,
      },
      {
        category: "lab_test_types",
        name: "ECG",
        description: "Electrocardiogram",
        value: "ecg",
        display_order: 6,
        is_system: true,
      },
      {
        category: "lab_test_types",
        name: "Ultrasound",
        description: "Ultrasound Imaging",
        value: "ultrasound",
        display_order: 7,
        is_system: true,
      },

      // Appointment Types
      {
        category: "appointment_types",
        name: "Consultation",
        description: "Regular Doctor Consultation",
        value: "consultation",
        display_order: 1,
        is_system: true,
      },
      {
        category: "appointment_types",
        name: "Follow-up",
        description: "Follow-up Visit",
        value: "followup",
        display_order: 2,
        is_system: true,
      },
      {
        category: "appointment_types",
        name: "Emergency",
        description: "Emergency Appointment",
        value: "emergency",
        display_order: 3,
        is_system: true,
      },
      {
        category: "appointment_types",
        name: "Procedure",
        description: "Medical Procedure",
        value: "procedure",
        display_order: 4,
        is_system: true,
      },
      {
        category: "appointment_types",
        name: "Surgery",
        description: "Surgical Procedure",
        value: "surgery",
        display_order: 5,
        is_system: true,
      },

      // Blood Groups
      {
        category: "blood_groups",
        name: "A+",
        description: "A Positive",
        value: "a_positive",
        display_order: 1,
        is_system: true,
      },
      {
        category: "blood_groups",
        name: "A-",
        description: "A Negative",
        value: "a_negative",
        display_order: 2,
        is_system: true,
      },
      {
        category: "blood_groups",
        name: "B+",
        description: "B Positive",
        value: "b_positive",
        display_order: 3,
        is_system: true,
      },
      {
        category: "blood_groups",
        name: "B-",
        description: "B Negative",
        value: "b_negative",
        display_order: 4,
        is_system: true,
      },
      {
        category: "blood_groups",
        name: "AB+",
        description: "AB Positive",
        value: "ab_positive",
        display_order: 5,
        is_system: true,
      },
      {
        category: "blood_groups",
        name: "AB-",
        description: "AB Negative",
        value: "ab_negative",
        display_order: 6,
        is_system: true,
      },
      {
        category: "blood_groups",
        name: "O+",
        description: "O Positive",
        value: "o_positive",
        display_order: 7,
        is_system: true,
      },
      {
        category: "blood_groups",
        name: "O-",
        description: "O Negative",
        value: "o_negative",
        display_order: 8,
        is_system: true,
      },

      // Gender Options (corrected from 'gender' to 'genders' for consistency)
      {
        category: "genders",
        name: "Male",
        description: "Male Gender",
        value: "male",
        display_order: 1,
        is_system: true,
      },
      {
        category: "genders",
        name: "Female",
        description: "Female Gender",
        value: "female",
        display_order: 2,
        is_system: true,
      },
      {
        category: "genders",
        name: "Other",
        description: "Other Gender",
        value: "other",
        display_order: 3,
        is_system: true,
      },

      // Emergency Contact Relationships
      {
        category: "relationships",
        name: "Spouse",
        description: "Husband/Wife",
        value: "spouse",
        display_order: 1,
        is_system: true,
      },
      {
        category: "relationships",
        name: "Parent",
        description: "Father/Mother",
        value: "parent",
        display_order: 2,
        is_system: true,
      },
      {
        category: "relationships",
        name: "Child",
        description: "Son/Daughter",
        value: "child",
        display_order: 3,
        is_system: true,
      },
      {
        category: "relationships",
        name: "Sibling",
        description: "Brother/Sister",
        value: "sibling",
        display_order: 4,
        is_system: true,
      },
      {
        category: "relationships",
        name: "Friend",
        description: "Friend",
        value: "friend",
        display_order: 5,
        is_system: true,
      },
      {
        category: "relationships",
        name: "Guardian",
        description: "Legal Guardian",
        value: "guardian",
        display_order: 6,
        is_system: true,
      },
      {
        category: "relationships",
        name: "Relative",
        description: "Other Relative",
        value: "relative",
        display_order: 7,
        is_system: true,
      },
      {
        category: "relationships",
        name: "Colleague",
        description: "Work Colleague",
        value: "colleague",
        display_order: 8,
        is_system: true,
      },

      // Appointment Status
      {
        category: "appointment_status",
        name: "Scheduled",
        description: "Appointment is scheduled",
        value: "scheduled",
        display_order: 1,
        is_system: true,
      },
      {
        category: "appointment_status",
        name: "Confirmed",
        description: "Appointment is confirmed",
        value: "confirmed",
        display_order: 2,
        is_system: true,
      },
      {
        category: "appointment_status",
        name: "In Progress",
        description: "Appointment is in progress",
        value: "in_progress",
        display_order: 3,
        is_system: true,
      },
      {
        category: "appointment_status",
        name: "Completed",
        description: "Appointment is completed",
        value: "completed",
        display_order: 4,
        is_system: true,
      },
      {
        category: "appointment_status",
        name: "Cancelled",
        description: "Appointment is cancelled",
        value: "cancelled",
        display_order: 5,
        is_system: true,
      },
      {
        category: "appointment_status",
        name: "No Show",
        description: "Patient did not show up",
        value: "no_show",
        display_order: 6,
        is_system: true,
      },

      // Appointment Priorities
      {
        category: "appointment_priorities",
        name: "Normal",
        description: "Normal priority appointment",
        value: "normal",
        display_order: 1,
        is_system: true,
      },
      {
        category: "appointment_priorities",
        name: "Urgent",
        description: "Urgent priority appointment",
        value: "urgent",
        display_order: 2,
        is_system: true,
      },
      {
        category: "appointment_priorities",
        name: "Emergency",
        description: "Emergency priority appointment",
        value: "emergency",
        display_order: 3,
        is_system: true,
      },

      // Lab Test Status
      {
        category: "lab_test_status",
        name: "Ordered",
        description: "Lab test has been ordered",
        value: "ordered",
        display_order: 1,
        is_system: true,
      },
      {
        category: "lab_test_status",
        name: "Sample Collected",
        description: "Sample has been collected",
        value: "sample_collected",
        display_order: 2,
        is_system: true,
      },
      {
        category: "lab_test_status",
        name: "In Progress",
        description: "Lab test is in progress",
        value: "in_progress",
        display_order: 3,
        is_system: true,
      },
      {
        category: "lab_test_status",
        name: "Completed",
        description: "Lab test is completed",
        value: "completed",
        display_order: 4,
        is_system: true,
      },
      {
        category: "lab_test_status",
        name: "Cancelled",
        description: "Lab test is cancelled",
        value: "cancelled",
        display_order: 5,
        is_system: true,
      },

      // Lab Test Priorities
      {
        category: "lab_test_priorities",
        name: "Normal",
        description: "Normal priority lab test",
        value: "normal",
        display_order: 1,
        is_system: true,
      },
      {
        category: "lab_test_priorities",
        name: "Urgent",
        description: "Urgent priority lab test",
        value: "urgent",
        display_order: 2,
        is_system: true,
      },
      {
        category: "lab_test_priorities",
        name: "STAT",
        description: "STAT priority lab test",
        value: "stat",
        display_order: 3,
        is_system: true,
      },

      // Bed Types
      {
        category: "bed_types",
        name: "General",
        description: "General bed",
        value: "general",
        display_order: 1,
        is_system: true,
      },
      {
        category: "bed_types",
        name: "Private",
        description: "Private room bed",
        value: "private",
        display_order: 2,
        is_system: true,
      },
      {
        category: "bed_types",
        name: "ICU",
        description: "Intensive Care Unit bed",
        value: "icu",
        display_order: 3,
        is_system: true,
      },
      {
        category: "bed_types",
        name: "Emergency",
        description: "Emergency bed",
        value: "emergency",
        display_order: 4,
        is_system: true,
      },
      {
        category: "bed_types",
        name: "Pediatric",
        description: "Pediatric bed",
        value: "pediatric",
        display_order: 5,
        is_system: true,
      },
      {
        category: "bed_types",
        name: "Maternity",
        description: "Maternity bed",
        value: "maternity",
        display_order: 6,
        is_system: true,
      },

      // Bed Status
      {
        category: "bed_status",
        name: "Available",
        description: "Bed is available",
        value: "available",
        display_order: 1,
        is_system: true,
      },
      {
        category: "bed_status",
        name: "Occupied",
        description: "Bed is occupied",
        value: "occupied",
        display_order: 2,
        is_system: true,
      },
      {
        category: "bed_status",
        name: "Maintenance",
        description: "Bed is under maintenance",
        value: "maintenance",
        display_order: 3,
        is_system: true,
      },
      {
        category: "bed_status",
        name: "Cleaning",
        description: "Bed is being cleaned",
        value: "cleaning",
        display_order: 4,
        is_system: true,
      },
      {
        category: "bed_status",
        name: "Reserved",
        description: "Bed is reserved",
        value: "reserved",
        display_order: 5,
        is_system: true,
      },

      // Bill Status
      {
        category: "bill_status",
        name: "Pending",
        description: "Bill is pending payment",
        value: "pending",
        display_order: 1,
        is_system: true,
      },
      {
        category: "bill_status",
        name: "Partial",
        description: "Bill is partially paid",
        value: "partial",
        display_order: 2,
        is_system: true,
      },
      {
        category: "bill_status",
        name: "Paid",
        description: "Bill is fully paid",
        value: "paid",
        display_order: 3,
        is_system: true,
      },
      {
        category: "bill_status",
        name: "Overdue",
        description: "Bill is overdue",
        value: "overdue",
        display_order: 4,
        is_system: true,
      },
      {
        category: "bill_status",
        name: "Cancelled",
        description: "Bill is cancelled",
        value: "cancelled",
        display_order: 5,
        is_system: true,
      },

      // Payment Methods
      {
        category: "payment_methods",
        name: "Cash",
        description: "Cash payment",
        value: "cash",
        display_order: 1,
        is_system: true,
      },
      {
        category: "payment_methods",
        name: "Card",
        description: "Card payment",
        value: "card",
        display_order: 2,
        is_system: true,
      },
      {
        category: "payment_methods",
        name: "Insurance",
        description: "Insurance payment",
        value: "insurance",
        display_order: 3,
        is_system: true,
      },
      {
        category: "payment_methods",
        name: "Bank Transfer",
        description: "Bank transfer payment",
        value: "bank_transfer",
        display_order: 4,
        is_system: true,
      },
      {
        category: "payment_methods",
        name: "Other",
        description: "Other payment method",
        value: "other",
        display_order: 5,
        is_system: true,
      },

      // Inventory Categories
      {
        category: "inventory_categories",
        name: "Medication",
        description: "Medication inventory",
        value: "medication",
        display_order: 1,
        is_system: true,
      },
      {
        category: "inventory_categories",
        name: "Equipment",
        description: "Equipment inventory",
        value: "equipment",
        display_order: 2,
        is_system: true,
      },
      {
        category: "inventory_categories",
        name: "Supplies",
        description: "Supplies inventory",
        value: "supplies",
        display_order: 3,
        is_system: true,
      },
      {
        category: "inventory_categories",
        name: "Other",
        description: "Other inventory items",
        value: "other",
        display_order: 4,
        is_system: true,
      },

      // Inventory Status
      {
        category: "inventory_status",
        name: "Active",
        description: "Inventory item is active",
        value: "active",
        display_order: 1,
        is_system: true,
      },
      {
        category: "inventory_status",
        name: "Inactive",
        description: "Inventory item is inactive",
        value: "inactive",
        display_order: 2,
        is_system: true,
      },
      {
        category: "inventory_status",
        name: "Expired",
        description: "Inventory item is expired",
        value: "expired",
        display_order: 3,
        is_system: true,
      },
      {
        category: "inventory_status",
        name: "Out of Stock",
        description: "Inventory item is out of stock",
        value: "out_of_stock",
        display_order: 4,
        is_system: true,
      },

      // Prescription Status
      {
        category: "prescription_status",
        name: "Active",
        description: "Prescription is active",
        value: "active",
        display_order: 1,
        is_system: true,
      },
      {
        category: "prescription_status",
        name: "Dispensed",
        description: "Prescription is dispensed",
        value: "dispensed",
        display_order: 2,
        is_system: true,
      },
      {
        category: "prescription_status",
        name: "Completed",
        description: "Prescription is completed",
        value: "completed",
        display_order: 3,
        is_system: true,
      },
      {
        category: "prescription_status",
        name: "Cancelled",
        description: "Prescription is cancelled",
        value: "cancelled",
        display_order: 4,
        is_system: true,
      },

      // Notification Types
      {
        category: "notification_types",
        name: "Appointment",
        description: "Appointment notification",
        value: "appointment",
        display_order: 1,
        is_system: true,
      },
      {
        category: "notification_types",
        name: "Emergency",
        description: "Emergency notification",
        value: "emergency",
        display_order: 2,
        is_system: true,
      },
      {
        category: "notification_types",
        name: "System",
        description: "System notification",
        value: "system",
        display_order: 3,
        is_system: true,
      },
      {
        category: "notification_types",
        name: "Reminder",
        description: "Reminder notification",
        value: "reminder",
        display_order: 4,
        is_system: true,
      },
      {
        category: "notification_types",
        name: "Alert",
        description: "Alert notification",
        value: "alert",
        display_order: 5,
        is_system: true,
      },
      {
        category: "notification_types",
        name: "Info",
        description: "Information notification",
        value: "info",
        display_order: 6,
        is_system: true,
      },

      // Notification Priorities
      {
        category: "notification_priorities",
        name: "Low",
        description: "Low priority notification",
        value: "low",
        display_order: 1,
        is_system: true,
      },
      {
        category: "notification_priorities",
        name: "Medium",
        description: "Medium priority notification",
        value: "medium",
        display_order: 2,
        is_system: true,
      },
      {
        category: "notification_priorities",
        name: "High",
        description: "High priority notification",
        value: "high",
        display_order: 3,
        is_system: true,
      },
      {
        category: "notification_priorities",
        name: "Critical",
        description: "Critical priority notification",
        value: "critical",
        display_order: 4,
        is_system: true,
      },

      // Lab Sections
      {
        category: "lab_sections",
        name: "Hematology",
        description: "Blood Tests and Analysis",
        value: "hematology",
        display_order: 1,
        is_system: true,
      },
      {
        category: "lab_sections",
        name: "Biochemistry",
        description: "Chemical Analysis",
        value: "biochemistry",
        display_order: 2,
        is_system: true,
      },
      {
        category: "lab_sections",
        name: "Microbiology",
        description: "Microbial Analysis",
        value: "microbiology",
        display_order: 3,
        is_system: true,
      },
      {
        category: "lab_sections",
        name: "Pathology",
        description: "Disease Diagnosis",
        value: "pathology",
        display_order: 4,
        is_system: true,
      },
      {
        category: "lab_sections",
        name: "Radiology",
        description: "Medical Imaging",
        value: "radiology",
        display_order: 5,
        is_system: true,
      },
      {
        category: "lab_sections",
        name: "Blood Bank",
        description: "Blood Banking Services",
        value: "blood_bank",
        display_order: 6,
        is_system: true,
      },

      // Pharmacy Specializations
      {
        category: "pharmacy_specializations",
        name: "Clinical Pharmacy",
        description: "Patient-focused pharmaceutical care",
        value: "clinical",
        display_order: 1,
        is_system: true,
      },
      {
        category: "pharmacy_specializations",
        name: "Hospital Pharmacy",
        description: "Institutional pharmaceutical services",
        value: "hospital",
        display_order: 2,
        is_system: true,
      },
      {
        category: "pharmacy_specializations",
        name: "Retail Pharmacy",
        description: "Community pharmaceutical services",
        value: "retail",
        display_order: 3,
        is_system: true,
      },
      {
        category: "pharmacy_specializations",
        name: "Oncology Pharmacy",
        description: "Cancer medication specialization",
        value: "oncology",
        display_order: 4,
        is_system: true,
      },
      {
        category: "pharmacy_specializations",
        name: "Pediatric Pharmacy",
        description: "Children medication specialization",
        value: "pediatric",
        display_order: 5,
        is_system: true,
      },

      // Nursing Certifications
      {
        category: "nursing_certifications",
        name: "Registered Nurse (RN)",
        description: "Licensed Registered Nurse",
        value: "rn",
        display_order: 1,
        is_system: true,
      },
      {
        category: "nursing_certifications",
        name: "Licensed Practical Nurse (LPN)",
        description: "Licensed Practical Nurse",
        value: "lpn",
        display_order: 2,
        is_system: true,
      },
      {
        category: "nursing_certifications",
        name: "Certified Nursing Assistant (CNA)",
        description: "Certified Nursing Assistant",
        value: "cna",
        display_order: 3,
        is_system: true,
      },
      {
        category: "nursing_certifications",
        name: "Basic Life Support (BLS)",
        description: "Basic Life Support Certification",
        value: "bls",
        display_order: 4,
        is_system: true,
      },
      {
        category: "nursing_certifications",
        name: "Advanced Cardiac Life Support (ACLS)",
        description: "Advanced Cardiac Life Support",
        value: "acls",
        display_order: 5,
        is_system: true,
      },
      {
        category: "nursing_certifications",
        name: "Pediatric Advanced Life Support (PALS)",
        description: "Pediatric Advanced Life Support",
        value: "pals",
        display_order: 6,
        is_system: true,
      },

      // Lab Certifications
      {
        category: "lab_certifications",
        name: "Medical Laboratory Technician (MLT)",
        description: "Medical Laboratory Technician Certification",
        value: "mlt",
        display_order: 1,
        is_system: true,
      },
      {
        category: "lab_certifications",
        name: "Clinical Laboratory Scientist (CLS)",
        description: "Clinical Laboratory Scientist Certification",
        value: "cls",
        display_order: 2,
        is_system: true,
      },
      {
        category: "lab_certifications",
        name: "ASCP Certified",
        description: "American Society for Clinical Pathology Certification",
        value: "ascp",
        display_order: 3,
        is_system: true,
      },
      {
        category: "lab_certifications",
        name: "Phlebotomy Certification",
        description: "Blood Drawing Certification",
        value: "phlebotomy",
        display_order: 4,
        is_system: true,
      },

      // Work Shifts
      {
        category: "work_shifts",
        name: "Day (6 AM - 2 PM)",
        description: "Day Shift",
        value: "day",
        display_order: 1,
        is_system: true,
      },
      {
        category: "work_shifts",
        name: "Evening (2 PM - 10 PM)",
        description: "Evening Shift",
        value: "evening",
        display_order: 2,
        is_system: true,
      },
      {
        category: "work_shifts",
        name: "Night (10 PM - 6 AM)",
        description: "Night Shift",
        value: "night",
        display_order: 3,
        is_system: true,
      },
      {
        category: "work_shifts",
        name: "Rotating Shifts",
        description: "Rotating Work Schedule",
        value: "rotating",
        display_order: 4,
        is_system: true,
      },

      // Languages
      {
        category: "languages",
        name: "English",
        description: "English Language",
        value: "english",
        display_order: 1,
        is_system: true,
      },
      {
        category: "languages",
        name: "Hindi",
        description: "Hindi Language",
        value: "hindi",
        display_order: 2,
        is_system: true,
      },
      {
        category: "languages",
        name: "Spanish",
        description: "Spanish Language",
        value: "spanish",
        display_order: 3,
        is_system: true,
      },
      {
        category: "languages",
        name: "French",
        description: "French Language",
        value: "french",
        display_order: 4,
        is_system: true,
      },
      {
        category: "languages",
        name: "German",
        description: "German Language",
        value: "german",
        display_order: 5,
        is_system: true,
      },
      {
        category: "languages",
        name: "Chinese",
        description: "Chinese Language",
        value: "chinese",
        display_order: 6,
        is_system: true,
      },

      // DOCTOR SCHEDULE TYPE
      {
        category: "schedule_types",
        name: "regular",
        description: "Regular outpatient department schedule",
        value: "regular",
        displayOrder: 1,
        isSystem: true,
        metadata: { color: "#2563eb", priority: 1 },
      },
      {
        category: "schedule_types",
        name: "emergency",
        description: "Emergency department schedule",
        value: "emergency",
        displayOrder: 3,
        isSystem: true,
        metadata: { color: "#dc2626", priority: 3 },
      },
      {
        category: "schedule_types",
        name: "surgery",
        description: "Surgical procedures schedule",
        value: "surgery",
        displayOrder: 2,
        isSystem: true,
        metadata: { color: "#7c3aed", priority: 2 },
      },
      {
        category: "schedule_types",
        name: "consultation",
        description: "Special consultation schedule",
        value: "consultation",
        displayOrder: 1,
        isSystem: true,
        metadata: { color: "#059669", priority: 1 },
      },
      {
        category: "schedule_types",
        name: "rounds",
        description: "Hospital ward rounds schedule",
        value: "rounds",
        displayOrder: 2,
        isSystem: true,
        metadata: { color: "#ea580c", priority: 2 },
      },
      {
        category: "availability_types",
        name: "override",
        description: "General schedule override",
        value: "override",
        displayOrder: 1,
        isSystem: true,
        metadata: { allowCustomTiming: true },
      },
      {
        category: "availability_types",
        name: "leave",
        description: "Planned leave or vacation",
        value: "leave",
        displayOrder: 2,
        isSystem: true,
        metadata: { requiresReplacement: false, notifyPatients: true },
      },
      {
        category: "availability_types",
        name: "sick_leave",
        description: "Medical leave due to illness",
        value: "sick_leave",
        displayOrder: 3,
        isSystem: true,
        metadata: {
          requiresReplacement: true,
          notifyPatients: true,
          urgent: true,
        },
      },
      {
        category: "availability_types",
        name: "emergency_leave",
        description: "Unplanned emergency leave",
        value: "emergency_leave",
        displayOrder: 4,
        isSystem: true,
        metadata: {
          requiresReplacement: true,
          notifyPatients: true,
          urgent: true,
        },
      },
      {
        category: "availability_types",
        name: "conference",
        description: "Medical conference or training attendance",
        value: "conference",
        displayOrder: 5,
        isSystem: true,
        metadata: { requiresReplacement: false, notifyPatients: true },
      },
      {
        category: "availability_types",
        name: "emergency_duty",
        description: "Special emergency duty assignment",
        value: "emergency_duty",
        displayOrder: 6,
        isSystem: true,
        metadata: { allowCustomTiming: true, priority: 3 },
      },
      // Availability Types
      {
        category: "availability_types",
        name: "holiday",
        description: "Public or institutional holiday",
        value: "holiday",
        displayOrder: 7,
        isSystem: true,
        metadata: { requiresReplacement: false, notifyPatients: false },
      },
      {
        category: "schedule_locations",
        name: "general_opd",
        description: "General Outpatient Department",
        value: "General OPD",
        displayOrder: 1,
        isSystem: true,
        metadata: { capacity: 30, type: "outpatient" },
      },
      {
        category: "schedule_locations",
        name: "cardiology_opd",
        description: "Cardiology Outpatient Department",
        value: "Cardiology OPD",
        displayOrder: 2,
        isSystem: true,
        metadata: { capacity: 20, type: "specialized" },
      },
      {
        category: "schedule_locations",
        name: "neurology_opd",
        description: "Neurology Outpatient Department",
        value: "Neurology OPD",
        displayOrder: 3,
        isSystem: true,
        metadata: { capacity: 15, type: "specialized" },
      },
      {
        category: "schedule_locations",
        name: "pediatrics_opd",
        description: "Pediatrics Outpatient Department",
        value: "Pediatrics OPD",
        displayOrder: 4,
        isSystem: true,
        metadata: { capacity: 25, type: "specialized" },
      },
      {
        category: "schedule_locations",
        name: "orthopedics_opd",
        description: "Orthopedics Outpatient Department",
        value: "Orthopedics OPD",
        displayOrder: 5,
        isSystem: true,
        metadata: { capacity: 20, type: "specialized" },
      },
      {
        category: "schedule_locations",
        name: "emergency_dept",
        description: "Emergency Department",
        value: "Emergency Department",
        displayOrder: 6,
        isSystem: true,
        metadata: { capacity: 50, type: "emergency", available24x7: true },
      },
      {
        category: "schedule_locations",
        name: "icu",
        description: "Intensive Care Unit",
        value: "ICU",
        displayOrder: 7,
        isSystem: true,
        metadata: { capacity: 10, type: "critical", available24x7: true },
      },
      {
        category: "schedule_locations",
        name: "operation_theater_1",
        description: "Main operation theater",
        value: "Operation Theater 1",
        displayOrder: 8,
        isSystem: true,
        metadata: { capacity: 1, type: "surgery" },
      },
      {
        category: "schedule_locations",
        name: "operation_theater_2",
        description: "Secondary operation theater",
        value: "Operation Theater 2",
        displayOrder: 9,
        isSystem: true,
        metadata: { capacity: 1, type: "surgery" },
      },
      {
        category: "schedule_locations",
        name: "consultation_room_1",
        description: "Private consultation room 1",
        value: "Consultation Room 1",
        displayOrder: 10,
        isSystem: true,
        metadata: { capacity: 1, type: "consultation" },
      },
      {
        category: "schedule_locations",
        name: "consultation_room_2",
        description: "Private consultation room 2",
        value: "Consultation Room 2",
        displayOrder: 11,
        isSystem: true,
        metadata: { capacity: 1, type: "consultation" },
      },
      {
        category: "schedule_locations",
        name: "ward_general",
        description: "General patient ward",
        value: "General Ward",
        displayOrder: 12,
        isSystem: true,
        metadata: { capacity: 40, type: "inpatient" },
      },
      {
        category: "schedule_locations",
        name: "ward_private",
        description: "Private patient rooms",
        value: "Private Ward",
        displayOrder: 13,
        isSystem: true,
        metadata: { capacity: 10, type: "inpatient" },
      },
      {
        category: "slot_durations",
        name: "10_minutes",
        description: "10-minute appointment slots",
        value: "10",
        displayOrder: 1,
        isSystem: true,
        metadata: { minutes: 10, suitable_for: ["quick_check", "follow_up"] },
      },
      {
        category: "slot_durations",
        name: "15_minutes",
        description: "15-minute appointment slots",
        value: "15",
        displayOrder: 2,
        isSystem: true,
        metadata: {
          minutes: 15,
          suitable_for: ["routine_check", "consultation"],
        },
      },
      {
        category: "slot_durations",
        name: "20_minutes",
        description: "20-minute appointment slots",
        value: "20",
        displayOrder: 3,
        isSystem: true,
        metadata: { minutes: 20, suitable_for: ["detailed_consultation"] },
      },
      {
        category: "slot_durations",
        name: "30_minutes",
        description: "30-minute appointment slots",
        value: "30",
        displayOrder: 4,
        isSystem: true,
        metadata: {
          minutes: 30,
          suitable_for: ["comprehensive_check", "new_patient"],
        },
      },
      {
        category: "slot_durations",
        name: "45_minutes",
        description: "45-minute appointment slots",
        value: "45",
        displayOrder: 5,
        isSystem: true,
        metadata: {
          minutes: 45,
          suitable_for: ["complex_consultation", "therapy"],
        },
      },
      {
        category: "slot_durations",
        name: "60_minutes",
        description: "1-hour appointment slots",
        value: "60",
        displayOrder: 6,
        isSystem: true,
        metadata: {
          minutes: 60,
          suitable_for: ["surgery_consultation", "psychiatric"],
        },
      },
      {
        category: "schedule_statuses",
        name: "active",
        description: "Currently active schedule",
        value: "active",
        displayOrder: 1,
        isSystem: true,
        metadata: { color: "#22c55e", allowBooking: true },
      },
      {
        category: "schedule_statuses",
        name: "inactive",
        description: "Temporarily inactive schedule",
        value: "inactive",
        displayOrder: 2,
        isSystem: true,
        metadata: { color: "#6b7280", allowBooking: false },
      },
      {
        category: "schedule_statuses",
        name: "suspended",
        description: "Suspended due to administrative reasons",
        value: "suspended",
        displayOrder: 3,
        isSystem: true,
        metadata: { color: "#ef4444", allowBooking: false },
      },
      {
        category: "schedule_statuses",
        name: "draft",
        description: "Draft schedule not yet activated",
        value: "draft",
        displayOrder: 4,
        isSystem: true,
        metadata: { color: "#f59e0b", allowBooking: false },
      },

      // Room Types
      {
        category: "room_type",
        name: "General Ward",
        description: "General ward room",
        value: "general",
        display_order: 1,
        is_system: true,
        metadata: { daily_rate: 800 }
      },
      {
        category: "room_type",
        name: "Private Room",
        description: "Private room",
        value: "private",
        display_order: 2,
        is_system: true,
        metadata: { daily_rate: 2000 }
      },
      {
        category: "room_type",
        name: "ICU",
        description: "Intensive Care Unit",
        value: "icu",
        display_order: 3,
        is_system: true,
        metadata: { daily_rate: 5000 }
      },
      {
        category: "room_type",
        name: "Emergency",
        description: "Emergency room",
        value: "emergency",
        display_order: 4,
        is_system: true,
        metadata: { daily_rate: 1500 }
      },
      {
        category: "room_type",
        name: "Maternity Ward",
        description: "Maternity ward room",
        value: "maternity",
        display_order: 5,
        is_system: true,
        metadata: { daily_rate: 1200 }
      },
      {
        category: "room_type",
        name: "Pediatric Ward",
        description: "Pediatric ward room",
        value: "pediatric",
        display_order: 6,
        is_system: true,
        metadata: { daily_rate: 1000 }
      },
      {
        category: "room_type",
        name: "Isolation Room",
        description: "Isolation room",
        value: "isolation",
        display_order: 7,
        is_system: true,
        metadata: { daily_rate: 3000 }
      },
      {
        category: "room_type",
        name: "NICU",
        description: "Neonatal Intensive Care Unit",
        value: "nicu",
        display_order: 8,
        is_system: true,
        metadata: { daily_rate: 6000 }
      },

      // Room Amenities
      {
        category: "room_amenity",
        name: "Air Conditioning",
        description: "Air conditioning",
        value: "ac",
        display_order: 1,
        is_system: true
      },
      {
        category: "room_amenity",
        name: "Television",
        description: "Television",
        value: "tv",
        display_order: 2,
        is_system: true
      },
      {
        category: "room_amenity",
        name: "WiFi",
        description: "WiFi internet access",
        value: "wifi",
        display_order: 3,
        is_system: true
      },
      {
        category: "room_amenity",
        name: "Attached Bathroom",
        description: "Attached bathroom",
        value: "bathroom",
        display_order: 4,
        is_system: true
      },
      {
        category: "room_amenity",
        name: "Refrigerator",
        description: "Refrigerator",
        value: "fridge",
        display_order: 5,
        is_system: true
      },
      {
        category: "room_amenity",
        name: "Attendant Bed",
        description: "Attendant bed",
        value: "attendant_bed",
        display_order: 6,
        is_system: true
      },
      {
        category: "room_amenity",
        name: "Telephone",
        description: "Telephone",
        value: "phone",
        display_order: 7,
        is_system: true
      },
      {
        category: "room_amenity",
        name: "Safety Locker",
        description: "Safety locker",
        value: "safe",
        display_order: 8,
        is_system: true
      },

      // Admission Charge Types
      {
        category: "admission_charge_type",
        name: "Room Charges",
        description: "Room charges",
        value: "room",
        display_order: 1,
        is_system: true
      },
      {
        category: "admission_charge_type",
        name: "Medicine Charges",
        description: "Medicine charges",
        value: "medicine",
        display_order: 2,
        is_system: true
      },
      {
        category: "admission_charge_type",
        name: "Procedure Charges",
        description: "Procedure charges",
        value: "procedure",
        display_order: 3,
        is_system: true
      },
      {
        category: "admission_charge_type",
        name: "Lab Test Charges",
        description: "Lab test charges",
        value: "lab",
        display_order: 4,
        is_system: true
      },
      {
        category: "admission_charge_type",
        name: "Consultation Charges",
        description: "Consultation charges",
        value: "consultation",
        display_order: 5,
        is_system: true
      },
      {
        category: "admission_charge_type",
        name: "Nursing Charges",
        description: "Nursing charges",
        value: "nursing",
        display_order: 6,
        is_system: true
      },
      {
        category: "admission_charge_type",
        name: "Equipment Charges",
        description: "Equipment charges",
        value: "equipment",
        display_order: 7,
        is_system: true
      },
      {
        category: "admission_charge_type",
        name: "Dietary Charges",
        description: "Dietary charges",
        value: "dietary",
        display_order: 8,
        is_system: true
      },
      {
        category: "admission_charge_type",
        name: "Other Charges",
        description: "Other charges",
        value: "other",
        display_order: 9,
        is_system: true
      },

      // Discharge Types
      {
        category: "discharge_type",
        name: "Normal Discharge",
        description: "Normal discharge",
        value: "normal",
        display_order: 1,
        is_system: true
      },
      {
        category: "discharge_type",
        name: "Against Medical Advice",
        description: "Against medical advice",
        value: "ama",
        display_order: 2,
        is_system: true
      },
      {
        category: "discharge_type",
        name: "Absconded",
        description: "Patient absconded",
        value: "absconded",
        display_order: 3,
        is_system: true
      },
      {
        category: "discharge_type",
        name: "Transferred",
        description: "Transferred to another facility",
        value: "transferred",
        display_order: 4,
        is_system: true
      },
      {
        category: "discharge_type",
        name: "Expired",
        description: "Patient expired",
        value: "expired",
        display_order: 5,
        is_system: true
      },
      {
        category: "discharge_type",
        name: "Referred",
        description: "Referred to another facility",
        value: "referred",
        display_order: 6,
        is_system: true
      },
    ];

    console.log("🔄 Starting master data seeding...");

    // Use transaction for better performance and data consistency
    await Database.transaction(async (trx) => {
      let createdCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;

      for (const item of defaultData) {
        try {
          // Check if item exists based on category and value (unique identifier)
          const existing = await trx
            .from("master_data")
            .where("category", item.category)
            .where("value", item.value)
            .first();

          if (existing) {
            // Update existing item only if it's a system item and data has changed
            if (existing.is_system) {
              const hasChanges =
                existing.name !== item.name ||
                existing.description !== item.description ||
                existing.display_order !== item.display_order ||
                existing.is_active !== true;

              if (hasChanges) {
                await trx.from("master_data").where("id", existing.id).update({
                  name: item.name,
                  description: item.description,
                  display_order: item.display_order,
                  is_active: true,
                  updated_at: new Date(),
                });
                updatedCount++;
                console.log(`  ✅ Updated: ${item.category} -> ${item.name}`);
              } else {
                skippedCount++;
              }
            } else {
              // Skip non-system items to preserve user data
              skippedCount++;
            }
          } else {
            // Create new item
            await trx.table("master_data").insert({
              ...item,
              is_active: true,
              created_at: new Date(),
              updated_at: new Date(),
            });
            createdCount++;
            console.log(`  ➕ Created: ${item.category} -> ${item.name}`);
          }
        } catch (error) {
          console.error(
            `  ❌ Error processing ${item.category} -> ${item.name}:`,
            error.message
          );
        }
      }

      console.log("\n📊 Master data seeding summary:");
      console.log(`  ➕ Created: ${createdCount} items`);
      console.log(`  ✅ Updated: ${updatedCount} items`);
      console.log(`  ⏭️  Skipped: ${skippedCount} items`);
      console.log(`  🎯 Total processed: ${defaultData.length} items`);
    });

    console.log("✅ Master data seeded successfully");
  }
}
