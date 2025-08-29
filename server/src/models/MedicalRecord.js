import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MedicalRecord = sequelize.define('MedicalRecord', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    record_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    patient_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'patients',
            key: 'id'
        }
    },
    doctor_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'doctors',
            key: 'id'
        }
    },
    appointment_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'appointments',
            key: 'id'
        }
    },
    visit_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    chief_complaint: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    history_of_present_illness: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    past_medical_history: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    family_history: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    social_history: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    physical_examination: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    vital_signs: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    diagnosis: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    differential_diagnosis: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    treatment_plan: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    follow_up_instructions: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    attachments: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    lab_results: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    imaging_results: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    status: {
        type: DataTypes.ENUM('active', 'completed', 'archived'),
        allowNull: false,
        defaultValue: 'active'
    }
}, {
    tableName: 'medical_records',
    indexes: [
        { fields: ['record_id'] },
        { fields: ['patient_id'] },
        { fields: ['doctor_id'] },
        { fields: ['visit_date'] },
        { fields: ['status'] }
    ]
});

export default MedicalRecord;
