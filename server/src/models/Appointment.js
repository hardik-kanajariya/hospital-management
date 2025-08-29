import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Appointment = sequelize.define('Appointment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    appointment_id: {
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
    appointment_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER, // Duration in minutes
        allowNull: false,
        defaultValue: 30
    },
    type: {
        type: DataTypes.ENUM('consultation', 'follow_up', 'emergency', 'routine_checkup'),
        allowNull: false,
        defaultValue: 'consultation'
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'),
        allowNull: false,
        defaultValue: 'scheduled'
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'emergency'),
        allowNull: false,
        defaultValue: 'medium'
    },
    symptoms: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    consultation_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'paid', 'partial', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
    },
    reminder_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'appointments',
    indexes: [
        { fields: ['appointment_id'] },
        { fields: ['patient_id'] },
        { fields: ['doctor_id'] },
        { fields: ['appointment_date'] },
        { fields: ['status'] }
    ]
});

export default Appointment;
