import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Prescription = sequelize.define('Prescription', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    prescription_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    medical_record_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'medical_records',
            key: 'id'
        }
    },
    medication_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dosage: {
        type: DataTypes.STRING,
        allowNull: false
    },
    frequency: {
        type: DataTypes.STRING,
        allowNull: false
    },
    duration: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    instructions: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'completed', 'discontinued', 'on_hold'),
        allowNull: false,
        defaultValue: 'active'
    },
    refills_remaining: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    side_effects: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    }
}, {
    tableName: 'prescriptions',
    indexes: [
        { fields: ['prescription_id'] },
        { fields: ['medical_record_id'] },
        { fields: ['medication_name'] },
        { fields: ['status'] }
    ]
});

export default Prescription;
