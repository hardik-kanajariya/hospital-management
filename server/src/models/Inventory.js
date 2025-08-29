import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Inventory = sequelize.define('Inventory', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    item_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.ENUM('medication', 'medical_equipment', 'surgical_instruments', 'consumables', 'office_supplies'),
        allowNull: false
    },
    unit: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    current_stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    minimum_stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    maximum_stock: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    unit_cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    selling_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    supplier: {
        type: DataTypes.STRING,
        allowNull: true
    },
    manufacturer: {
        type: DataTypes.STRING,
        allowNull: true
    },
    batch_number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    expiry_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'discontinued', 'out_of_stock'),
        allowNull: false,
        defaultValue: 'active'
    },
    last_restocked: {
        type: DataTypes.DATE,
        allowNull: true
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'inventory',
    indexes: [
        { fields: ['item_code'] },
        { fields: ['name'] },
        { fields: ['category'] },
        { fields: ['status'] },
        { fields: ['current_stock'] }
    ]
});

export default Inventory;
