const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class CourseAnalytics extends Model {}

CourseAnalytics.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Courses',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  enrollments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  completionRate: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'CourseAnalytics',
  tableName: 'course_analytics',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['courseId', 'date'] }
  ]
});

module.exports = CourseAnalytics;
