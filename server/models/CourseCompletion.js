const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class CourseCompletion extends Model {}

CourseCompletion.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  enrollmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Enrollments',
      key: 'id'
    }
  },
  completionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  timeToComplete: {
    type: DataTypes.INTEGER,
    comment: 'Time to complete in days'
  }
}, {
  sequelize,
  modelName: 'CourseCompletion',
  tableName: 'course_completions',
  indexes: [
    { fields: ['completionDate'] }
  ]
});

module.exports = CourseCompletion;
