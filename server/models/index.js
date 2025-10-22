const { sequelize, testConnection } = require('../config/database');
const User = require('./User');
const Course = require('./Course');
const Enrollment = require('./Enrollment');

// Analytics models
const UserActivity = require('./UserActivity');
const UserSession = require('./UserSession');
const PageView = require('./PageView');
const UserEngagement = require('./UserEngagement');

const CourseAnalytics = require('./CourseAnalytics');
const CourseEngagement = require('./CourseEngagement');
const CourseCompletion = require('./CourseCompletion');
const CourseRating = require('./CourseRating');

const SystemMetrics = require('./SystemMetrics');
const ApiLog = require('./ApiLogs');
const ErrorLog = require('./ErrorLogs');
const PerformanceMetrics = require('./PerformanceMetrics');

// Define associations
User.hasMany(Enrollment, {
  foreignKey: 'userId',
  as: 'enrollments',
  onDelete: 'CASCADE'
});

Course.hasMany(Enrollment, {
  foreignKey: 'courseId',
  as: 'enrollments',
  onDelete: 'CASCADE'
});

Enrollment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Enrollment.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course'
});

// Many-to-many relationship through Enrollment
User.belongsToMany(Course, {
  through: Enrollment,
  foreignKey: 'userId',
  otherKey: 'courseId',
  as: 'courses'
});

Course.belongsToMany(User, {
  through: Enrollment,
  foreignKey: 'courseId',
  otherKey: 'userId',
  as: 'students'
});

// Course-Instructor relationship
Course.belongsTo(User, {
  foreignKey: 'instructorId',
  as: 'instructorUser'
});

User.hasMany(Course, {
  foreignKey: 'instructorId',
  as: 'instructedCourses'
});

// === Analytics associations ===
// User activity & session
User.hasMany(UserActivity, { foreignKey: 'userId', as: 'activities' });
User.hasMany(UserSession, { foreignKey: 'userId', as: 'sessions' });
User.hasOne(UserEngagement, { foreignKey: 'userId', as: 'engagement' });

UserActivity.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserEngagement.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Page views
User.hasMany(PageView, { foreignKey: 'userId', as: 'pageViews' });
PageView.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Course analytics
Course.hasMany(CourseAnalytics, { foreignKey: 'courseId', as: 'analytics' });
Course.hasMany(CourseEngagement, { foreignKey: 'courseId', as: 'engagement' });
Course.hasMany(CourseRating, { foreignKey: 'courseId', as: 'ratings' });
CourseAnalytics.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
CourseEngagement.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
CourseRating.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Course completion associations via Enrollment
Enrollment.hasOne(CourseCompletion, { foreignKey: 'enrollmentId', as: 'completion' });
CourseCompletion.belongsTo(Enrollment, { foreignKey: 'enrollmentId', as: 'enrollment' });

// Ratings tie to users as well
User.hasMany(CourseRating, { foreignKey: 'userId', as: 'courseRatings' });
CourseRating.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Link activities to enrollments/entities when applicable
Enrollment.hasMany(UserActivity, { foreignKey: 'entityId', as: 'activities' });

// System & performance metrics
// no direct FK relationships required but export for usage


// Sync database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Database synchronized successfully.');
    
    // Create default admin user if not exists
    if (force || process.env.NODE_ENV === 'development') {
      await createDefaultAdmin();
    }
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    throw error;
  }
};

const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    
    if (!adminExists) {
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: process.env.ADMIN_EMAIL || 'admin@learningplatform.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Default admin user created.');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};

module.exports = {
  sequelize,
  testConnection,
  User,
  Course,
  Enrollment,
  // Analytics models
  UserActivity,
  UserSession,
  PageView,
  UserEngagement,
  CourseAnalytics,
  CourseEngagement,
  CourseCompletion,
  CourseRating,
  SystemMetrics,
  ApiLog,
  ErrorLog,
  PerformanceMetrics,
  syncDatabase
};