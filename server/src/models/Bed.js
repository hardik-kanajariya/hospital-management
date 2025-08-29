import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Bed = sequelize.define('Bed', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    bed_number: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true
    },
    room_number: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    ward: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    bed_type: {
        type: DataTypes.ENUM('general', 'private', 'icu', 'emergency', 'pediatric', 'maternity'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('available', 'occupied', 'maintenance', 'reserved', 'out_of_service'),
        allowNull: false,
        defaultValue: 'available'
    },
    patient_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'patients',
            key: 'id'
        }
    },
    admission_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    discharge_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    daily_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    features: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    last_cleaned: {
        type: DataTypes.DATE,
        allowNull: true
    },
    assigned_nurse: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'beds',
    indexes: [
        { fields: ['bed_number'] },
        { fields: ['room_number'] },
        { fields: ['ward'] },
        { fields: ['status'] },
        { fields: ['patient_id'] }
    ]
});

export default Bed;
