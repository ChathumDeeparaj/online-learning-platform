const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class SystemMetrics extends Model {}

SystemMetrics.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  metricType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., cpu_usage, memory_usage, db_connections'
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'SystemMetrics',
  tableName: 'system_metrics',
  timestamps: true,
  updatedAt: false,
  indexes: [
    { fields: ['metricType', 'createdAt'] }
  ]
});

module.exports = SystemMetrics;
