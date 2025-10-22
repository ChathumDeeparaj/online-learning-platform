const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class ApiLog extends Model {}

ApiLog.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  method: {
    type: DataTypes.STRING,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  statusCode: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  responseTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Response time in ms'
  },
  ipAddress: {
    type: DataTypes.STRING
  },
  userId: {
    type: DataTypes.INTEGER
  }
}, {
  sequelize,
  modelName: 'ApiLog',
  tableName: 'api_logs',
  timestamps: true,
  updatedAt: false,
  indexes: [
    { fields: ['path'] },
    { fields: ['statusCode'] },
    { fields: ['userId'] }
  ]
});

module.exports = ApiLog;
