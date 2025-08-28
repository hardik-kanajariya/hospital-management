import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  patient_id: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  emergency_contact: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  blood_group: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: true
  },
  allergies: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  chronic_conditions: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  vaccination_records: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  insurance_info: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'patients',
  indexes: [
    { fields: ['patient_id'] },
    { fields: ['phone'] },
    { fields: ['email'] },
    { fields: ['name'] }
  ]
});

export default Patient;
