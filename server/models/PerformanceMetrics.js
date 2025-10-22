const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class PerformanceMetrics extends Model {}

PerformanceMetrics.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  metricName: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., db_query_time, external_api_call'
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duration in ms'
  },
  details: {
    type: DataTypes.JSON
  }
}, {
  sequelize,
  modelName: 'PerformanceMetrics',
  tableName: 'performance_metrics',
  timestamps: true,
  updatedAt: false,
  indexes: [
    { fields: ['metricName'] }
  ]
});

module.exports = PerformanceMetrics;
