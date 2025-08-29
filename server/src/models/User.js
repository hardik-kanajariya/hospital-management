import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM(
            'super_admin',
            'doctor',
            'billing_manager',
            'nurse',
            'lab_technician',
            'pharmacist',
            'medical_store_manager',
            'receptionist'
        ),
        allowNull: false
    },
    permissions: {
        type: DataTypes.JSON,
        defaultValue: {}
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true
    },
    employee_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    }
}, {
    tableName: 'users',
    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password_hash')) {
                const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
                user.password_hash = await bcrypt.hash(user.password_hash, salt);
            }

            // Set permissions based on role
            if (user.changed('role') || !user.permissions || Object.keys(user.permissions).length === 0) {
                user.permissions = User.getPermissionsForRole(user.role);
            }
        }
    }
});

// Static method to get permissions for a role
User.getPermissionsForRole = function (role) {
    const rolePermissions = {
        'super_admin': [
            { module: '*', actions: ['create', 'read', 'update', 'delete'] }
        ],
        'doctor': [
            { module: 'dashboard', actions: ['read'] },
            { module: 'patients', actions: ['create', 'read', 'update'] },
            { module: 'appointments', actions: ['create', 'read', 'update'] },
            { module: 'medical_records', actions: ['create', 'read', 'update'] },
            { module: 'doctors', actions: ['read', 'update'] },
            { module: 'prescriptions', actions: ['create', 'read', 'update'] },
            { module: 'lab_tests', actions: ['create', 'read'] },
            { module: 'beds', actions: ['read', 'update'] },
            { module: 'billing', actions: ['read'] },
            { module: 'notifications', actions: ['create', 'read'] }
        ],
        'billing_manager': [
            { module: 'dashboard', actions: ['read'] },
            { module: 'billing', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'patients', actions: ['read', 'update'] },
            { module: 'appointments', actions: ['read'] },
            { module: 'insurance', actions: ['create', 'read', 'update'] },
            { module: 'reports', actions: ['read'] },
            { module: 'notifications', actions: ['create', 'read'] }
        ],
        'nurse': [
            { module: 'dashboard', actions: ['read'] },
            { module: 'patients', actions: ['create', 'read', 'update'] },
            { module: 'appointments', actions: ['read', 'update'] },
            { module: 'medical_records', actions: ['read', 'update'] },
            { module: 'beds', actions: ['read', 'update'] },
            { module: 'vital_signs', actions: ['create', 'read', 'update'] },
            { module: 'notifications', actions: ['read'] }
        ],
        'lab_technician': [
            { module: 'dashboard', actions: ['read'] },
            { module: 'lab_tests', actions: ['create', 'read', 'update'] },
            { module: 'patients', actions: ['read'] },
            { module: 'lab_results', actions: ['create', 'read', 'update'] },
            { module: 'notifications', actions: ['create', 'read'] }
        ],
        'pharmacist': [
            { module: 'dashboard', actions: ['read'] },
            { module: 'inventory', actions: ['create', 'read', 'update'] },
            { module: 'prescriptions', actions: ['read', 'update'] },
            { module: 'patients', actions: ['read'] },
            { module: 'medical_store', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'notifications', actions: ['read'] }
        ],
        'medical_store_manager': [
            { module: 'dashboard', actions: ['read'] },
            { module: 'inventory', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'medical_store', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'suppliers', actions: ['create', 'read', 'update'] },
            { module: 'purchases', actions: ['create', 'read', 'update'] },
            { module: 'notifications', actions: ['read'] }
        ],
        'receptionist': [
            { module: 'dashboard', actions: ['read'] },
            { module: 'patients', actions: ['create', 'read', 'update'] },
            { module: 'appointments', actions: ['create', 'read', 'update'] },
            { module: 'billing', actions: ['read'] },
            { module: 'notifications', actions: ['create', 'read'] }
        ]
    };

    return rolePermissions[role] || [];
};

// Instance methods
User.prototype.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password_hash);
};

User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    delete values.password_hash;
    return values;
};

export default User;
