import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LabTest = sequelize.define('LabTest', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    test_id: {
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
    ordered_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'doctors',
            key: 'id'
        }
    },
    test_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    test_type: {
        type: DataTypes.ENUM('blood', 'urine', 'stool', 'imaging', 'biopsy', 'culture', 'other'),
        allowNull: false
    },
    test_category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ordered_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    sample_collected_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    completed_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('ordered', 'sample_collected', 'in_progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'ordered'
    },
    priority: {
        type: DataTypes.ENUM('routine', 'urgent', 'stat'),
        allowNull: false,
        defaultValue: 'routine'
    },
    results: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    reference_ranges: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    technician_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    report_file: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'lab_tests',
    indexes: [
        { fields: ['test_id'] },
        { fields: ['patient_id'] },
        { fields: ['ordered_by'] },
        { fields: ['status'] },
        { fields: ['test_type'] }
    ]
});

export default LabTest;
