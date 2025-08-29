import sequelize from '../config/database.js';
import User from './User.js';
import Patient from './Patient.js';
import Doctor from './Doctor.js';
import Appointment from './Appointment.js';
import MedicalRecord from './MedicalRecord.js';
import Prescription from './Prescription.js';
import LabTest from './LabTest.js';
import Bill from './Bill.js';
import Bed from './Bed.js';
import Inventory from './Inventory.js';
import Notification from './Notification.js';

// Define associations

// User associations
User.hasMany(Patient, { foreignKey: 'created_by', as: 'patients_created' });
Patient.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Doctor associations
User.hasOne(Doctor, { foreignKey: 'user_id', as: 'doctor_profile' });
Doctor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Patient-Doctor associations
Doctor.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'appointments' });
Patient.hasMany(Appointment, { foreignKey: 'patient_id', as: 'appointments' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Medical Records associations
Patient.hasMany(MedicalRecord, { foreignKey: 'patient_id', as: 'medical_records' });
Doctor.hasMany(MedicalRecord, { foreignKey: 'doctor_id', as: 'medical_records' });
MedicalRecord.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
MedicalRecord.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// Prescription associations
MedicalRecord.hasMany(Prescription, { foreignKey: 'medical_record_id', as: 'prescriptions' });
Prescription.belongsTo(MedicalRecord, { foreignKey: 'medical_record_id', as: 'medical_record' });

// Lab Test associations
Patient.hasMany(LabTest, { foreignKey: 'patient_id', as: 'lab_tests' });
Doctor.hasMany(LabTest, { foreignKey: 'ordered_by', as: 'ordered_tests' });
LabTest.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });
LabTest.belongsTo(Doctor, { foreignKey: 'ordered_by', as: 'ordered_by_doctor' });

// Billing associations
Patient.hasMany(Bill, { foreignKey: 'patient_id', as: 'bills' });
Bill.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Bed associations
Patient.hasMany(Bed, { foreignKey: 'patient_id', as: 'beds' });
Bed.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Notification associations
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export {
    sequelize,
    User,
    Patient,
    Doctor,
    Appointment,
    MedicalRecord,
    Prescription,
    LabTest,
    Bill,
    Bed,
    Inventory,
    Notification
};

export default {
    sequelize,
    User,
    Patient,
    Doctor,
    Appointment,
    MedicalRecord,
    Prescription,
    LabTest,
    Bill,
    Bed,
    Inventory,
    Notification
};
