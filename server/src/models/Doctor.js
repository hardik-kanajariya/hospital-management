import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Doctor = sequelize.define('Doctor', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    medical_license: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    specialization: {
        type: DataTypes.STRING,
        allowNull: false
    },
    qualification: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    experience_years: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    consultation_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    working_hours: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    available_days: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    room_number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'doctors',
    indexes: [
        { fields: ['user_id'] },
        { fields: ['medical_license'] },
        { fields: ['specialization'] }
    ]
});

export default Doctor;
