const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class ErrorLog extends Model {}

ErrorLog.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  level: {
    type: DataTypes.STRING,
    defaultValue: 'error' // e.g., error, warn, info
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  stack: {
    type: DataTypes.TEXT
  },
  context: {
    type: DataTypes.JSON,
    comment: 'Request details, user info, etc.'
  }
}, {
  sequelize,
  modelName: 'ErrorLog',
  tableName: 'error_logs',
  timestamps: true,
  updatedAt: false,
  indexes: [
    { fields: ['level'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = ErrorLog;
