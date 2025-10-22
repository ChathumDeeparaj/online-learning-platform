const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class UserEngagement extends Model {}

UserEngagement.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  totalLogins: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalTimeSpent: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total time in seconds'
  },
  coursesCompleted: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'UserEngagement',
  tableName: 'user_engagements',
  timestamps: true
});

module.exports = UserEngagement;
