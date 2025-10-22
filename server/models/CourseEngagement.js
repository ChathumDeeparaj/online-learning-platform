const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class CourseEngagement extends Model {}

CourseEngagement.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Courses',
      key: 'id'
    }
  },
  totalEnrollments: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  averageProgress: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  averageCompletionTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Average time in days'
  }
}, {
  sequelize,
  modelName: 'CourseEngagement',
  tableName: 'course_engagements'
});

module.exports = CourseEngagement;
