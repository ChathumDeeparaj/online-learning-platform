const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class CourseRating extends Model {}

CourseRating.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: 'user_course_rating',
    references: {
      model: 'Courses',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: 'user_course_rating',
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'CourseRating',
  tableName: 'course_ratings'
});

module.exports = CourseRating;
