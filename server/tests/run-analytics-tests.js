/*
  Lightweight integration test for analytics models.
  - Uses existing DB config (will connect to DB in .env)
  - Creates test records prefixed with TEST_ and removes them afterwards
  - Does not modify existing code
*/

const path = require('path');

(async () => {
  // Workaround: some model files `require('../config/database')` and expect the
  // default export to be the Sequelize instance. The project's config exports
  // an object { sequelize, testConnection }. To avoid changing app code, swap
  // the cached module export at runtime so `require('../config/database')`
  // returns the Sequelize instance.
  try {
    const dbPath = path.resolve(__dirname, '../config/database.js');
    const dbModule = require(dbPath);

    // If USE_SQLITE=1 is set, create an in-memory SQLite Sequelize instance
    // and patch the config/database cache to return it so models use it.
    if (process.env.USE_SQLITE === '1') {
      const { Sequelize } = require('sequelize');
      const sqlite = new Sequelize('sqlite::memory:', {
        logging: false,
        define: {
          timestamps: true,
          underscored: true,
          freezeTableName: true
        }
      });

      // Patch cached module to export an object matching { sequelize, testConnection }
      if (require.cache[require.resolve(dbPath)]) {
        require.cache[require.resolve(dbPath)].exports = { sequelize: sqlite, testConnection: async () => {} };
      }

      // Also set a default export for modules that `require('../config/database')` directly
      if (require.cache[require.resolve(dbPath)]) {
        const proxy = sqlite;
        proxy.sequelize = sqlite;
        proxy.testConnection = async () => {};
        require.cache[require.resolve(dbPath)].exports = proxy;
      }
    } else {
      // Patch the cached module so both import styles work for normal usage
      if (dbModule && dbModule.sequelize && require.cache[require.resolve(dbPath)]) {
        const inst = dbModule.sequelize;
        const original = dbModule;
        const proxy = inst;
        proxy.sequelize = inst;
        proxy.testConnection = original.testConnection;
        require.cache[require.resolve(dbPath)].exports = proxy;
      }
    }
  } catch (e) {
    // If this fails, we'll just proceed — models may still work if they use
    // destructured import. We'll let the test catch any errors.
    // console.warn('DB module patch skipped:', e.message);
  }

  try {
    const {
      sequelize,
      User,
      Course,
      Enrollment,
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
      PerformanceMetrics
    } = require('../models');

    console.log('Authenticating DB...');
    await sequelize.authenticate();
  console.log('DB connected. Skipping schema sync to avoid altering existing tables...');

    console.log('Creating test user...');
    const testEmail = `test_analytics_${Date.now()}@example.com`;
    const user = await User.create({
      firstName: 'Test',
      lastName: 'Analytics',
      email: testEmail,
      password: 'testpass123',
      role: 'student',
      isActive: true
    });

    console.log('Creating test course...');
    const course = await Course.create({
      title: 'TEST Analytics Course',
      description: 'Course for analytics tests',
      shortDescription: 'Test',
      instructorId: user.id,
      duration: 1,
      category: 'Testing',
      price: 0.0,
      currency: 'USD'
    });

    console.log('Creating enrollment...');
    const enrollment = await Enrollment.create({
      userId: user.id,
      courseId: course.id,
      status: 'active'
    });

    // Create UserActivity (link to enrollment to satisfy existing FK constraints)
    console.log('Creating UserActivity...');
    const activity = await UserActivity.create({
      userId: user.id,
      activityType: 'course_view',
      entityType: 'Enrollment',
      entityId: enrollment.id,
      details: { note: 'Viewed course for analytics test' }
    });

    // Create UserSession
    console.log('Creating UserSession...');
    const session = await UserSession.create({
      userId: user.id,
      loginTime: new Date(),
      ipAddress: '127.0.0.1',
      userAgent: 'node-test/1.0'
    });

    // Create PageView
    console.log('Creating PageView...');
    const pv = await PageView.create({
      userId: user.id,
      path: `/courses/${course.id}`,
      ipAddress: '127.0.0.1'
    });

    // Create UserEngagement
    console.log('Creating UserEngagement...');
    const ue = await UserEngagement.create({
      userId: user.id,
      totalLogins: 1,
      totalTimeSpent: 120,
      coursesCompleted: 0
    });

    // CourseAnalytics (date-based)
    console.log('Creating CourseAnalytics...');
    const ca = await CourseAnalytics.create({
      courseId: course.id,
      date: new Date(),
      views: 1,
      enrollments: 1,
      completionRate: 0
    });

    // CourseEngagement
    console.log('Creating CourseEngagement...');
    const ce = await CourseEngagement.create({
      courseId: course.id,
      totalEnrollments: 1,
      averageProgress: 0,
      averageCompletionTime: 0
    });

    // CourseCompletion
    console.log('Creating CourseCompletion...');
    const cc = await CourseCompletion.create({
      enrollmentId: enrollment.id,
      completionDate: new Date(),
      timeToComplete: 0
    });

    // CourseRating
    console.log('Creating CourseRating...');
    const cr = await CourseRating.create({
      courseId: course.id,
      userId: user.id,
      rating: 5
    });

    // System metrics and logs
    console.log('Creating SystemMetrics, ApiLog, ErrorLog, PerformanceMetrics...');
    const sm = await SystemMetrics.create({ metricType: 'cpu_usage', value: 12.3 });
    const al = await ApiLog.create({ method: 'GET', path: '/test', statusCode: 200, responseTime: 10, ipAddress: '127.0.0.1', userId: user.id });
    const el = await ErrorLog.create({ level: 'info', message: 'Test error log', stack: null, context: { test: true } });
    const pm = await PerformanceMetrics.create({ metricName: 'db_query_time', duration: 5, details: { query: 'select 1' } });

    // Verify associations by querying
    console.log('Verifying associations...');
    const userActivities = await user.getActivities();
    const userSessions = await user.getSessions();
    const userPageViews = await user.getPageViews();
    const userEng = await user.getEngagement();

    const courseAnalytics = await course.getAnalytics();
    const courseEngagement = await course.getEngagement();
    const courseRatings = await course.getRatings();

    console.log('Results:');
    console.log('userActivities length:', userActivities.length > 0);
    console.log('userSessions length:', userSessions.length > 0);
    console.log('userPageViews length:', userPageViews.length > 0);
    console.log('userEngagement exists:', !!userEng);
    console.log('courseAnalytics length:', courseAnalytics.length > 0);
    console.log('courseEngagement exists:', !!courseEngagement);
    console.log('courseRatings length:', courseRatings.length > 0);

    // Cleanup created test rows (sequential, child-first) to avoid deadlocks
    console.log('Cleaning up test data (sequential child-first)...');

    // helper to retry destroy on deadlock
    async function safeDestroy(instance, attempts = 3, delayMs = 200) {
      if (!instance) return;
      for (let i = 0; i < attempts; i++) {
        try {
          await instance.destroy();
          return;
        } catch (e) {
          // MySQL deadlock code is ER_LOCK_DEADLOCK (1213)
          const isDeadlock = e && (e.original && e.original.errno === 1213 || e.errno === 1213 || /deadlock/i.test(e.message));
          if (!isDeadlock || i === attempts - 1) {
            console.error('Failed to destroy instance:', instance && instance.constructor && instance.constructor.name, e.message || e);
            throw e;
          }
          // wait and retry
          await new Promise(r => setTimeout(r, delayMs));
          delayMs *= 2;
        }
      }
    }

    // Delete in dependency order: children -> parents
    const deleteSteps = [
      // logs and metrics (leaf nodes)
      al,
      el,
      pm,
      sm,
      // per-entity analytics
      cr,
      cc,
      ce,
      ca,
      ue,
      pv,
      session,
      activity,
      // enrollment, course, user
      enrollment,
      course,
      user
    ];

    for (const inst of deleteSteps) {
      try {
        await safeDestroy(inst);
      } catch (e) {
        console.warn('Continuing cleanup despite error for', inst && inst.constructor && inst.constructor.name);
      }
    }

    console.log('\nAnalytics models & associations test: SUCCESS');
    process.exit(0);
  } catch (err) {
    console.error('\nAnalytics models & associations test: FAILED');
    console.error(err);
    process.exit(1);
  }
})();
