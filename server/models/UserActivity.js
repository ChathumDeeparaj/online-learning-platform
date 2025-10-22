const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class UserActivity extends Model {}

UserActivity.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // 'Users' is the table name
      key: 'id'
    }
  },
  activityType: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'e.g., course_view, lesson_complete, quiz_start, login'
  },
  entityType: {
    type: DataTypes.STRING,
    comment: 'e.g., Course, Lesson, Quiz'
  },
  entityId: {
    type: DataTypes.INTEGER
  },
  details: {
    type: DataTypes.JSON,
    comment: 'Additional details about the activity'
  }
}, {
  sequelize,
  modelName: 'UserActivity',
  tableName: 'user_activities',
  timestamps: true,
  updatedAt: false, // Only createdAt is needed for activity logs
  indexes: [
    { fields: ['userId', 'createdAt'] },
    { fields: ['activityType', 'createdAt'] }
  ]
});

module.exports = UserActivity;
