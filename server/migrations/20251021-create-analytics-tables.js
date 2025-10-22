/**
 * Migration: create analytics and system metrics tables
 * Generated: 2025-10-21
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // User engagement (one row per user)
    await queryInterface.createTable('user_engagements', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      total_logins: { type: Sequelize.INTEGER, defaultValue: 0 },
      total_time_spent: { type: Sequelize.INTEGER, defaultValue: 0 },
      courses_completed: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // User sessions
    await queryInterface.createTable('user_sessions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      login_time: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      logout_time: { type: Sequelize.DATE },
      ip_address: { type: Sequelize.STRING },
      user_agent: { type: Sequelize.STRING },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // Page views
    await queryInterface.createTable('page_views', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      path: { type: Sequelize.STRING, allowNull: false },
      ip_address: { type: Sequelize.STRING },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('page_views', ['path']);
    await queryInterface.addIndex('page_views', ['user_id']);

    // User activities (events)
    await queryInterface.createTable('user_activities', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      activity_type: { type: Sequelize.STRING, allowNull: false },
      entity_type: { type: Sequelize.STRING },
      entity_id: { type: Sequelize.INTEGER },
      details: { type: Sequelize.JSON },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('user_activities', ['user_id', 'created_at'], { name: 'idx_user_activities_user_timestamp' });
    await queryInterface.addIndex('user_activities', ['activity_type', 'created_at'], { name: 'idx_user_activities_type_timestamp' });

    // Course analytics (daily)
    await queryInterface.createTable('course_analytics', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      course_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'courses', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      views: { type: Sequelize.INTEGER, defaultValue: 0 },
      enrollments: { type: Sequelize.INTEGER, defaultValue: 0 },
      completion_rate: { type: Sequelize.FLOAT, defaultValue: 0 }
    });
    await queryInterface.addConstraint('course_analytics', { fields: ['course_id', 'date'], type: 'unique', name: 'uniq_course_date' });
    await queryInterface.addIndex('course_analytics', ['course_id', 'date'], { name: 'idx_course_analytics_course_date' });

    // Course engagement (aggregated)
    await queryInterface.createTable('course_engagements', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      course_id: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: 'courses', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      total_enrollments: { type: Sequelize.INTEGER, defaultValue: 0 },
      average_progress: { type: Sequelize.FLOAT, defaultValue: 0 },
      average_completion_time: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // Course ratings
    await queryInterface.createTable('course_ratings', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      course_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'courses', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      rating: { type: Sequelize.INTEGER, allowNull: false }
    });
    await queryInterface.addConstraint('course_ratings', { fields: ['course_id', 'user_id'], type: 'unique', name: 'user_course_rating' });

    // Course completion (per enrollment)
    await queryInterface.createTable('course_completions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      enrollment_id: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: 'enrollments', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      completion_date: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      time_to_complete: { type: Sequelize.INTEGER }
    });
    await queryInterface.addIndex('course_completions', ['completion_date']);

    // System metrics
    await queryInterface.createTable('system_metrics', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      metric_type: { type: Sequelize.STRING, allowNull: false },
      value: { type: Sequelize.FLOAT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('system_metrics', ['metric_type', 'created_at'], { name: 'idx_system_metrics_type_timestamp' });

    // API logs
    await queryInterface.createTable('api_logs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      method: { type: Sequelize.STRING, allowNull: false },
      path: { type: Sequelize.STRING, allowNull: false },
      status_code: { type: Sequelize.INTEGER, allowNull: false },
      response_time: { type: Sequelize.INTEGER, allowNull: false },
      ip_address: { type: Sequelize.STRING },
      user_id: { type: Sequelize.INTEGER }
    });
    await queryInterface.addIndex('api_logs', ['path']);
    await queryInterface.addIndex('api_logs', ['status_code']);
    await queryInterface.addIndex('api_logs', ['user_id']);

    // Error logs
    await queryInterface.createTable('error_logs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      level: { type: Sequelize.STRING, defaultValue: 'error' },
      message: { type: Sequelize.TEXT, allowNull: false },
      stack: { type: Sequelize.TEXT },
      context: { type: Sequelize.JSON },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('error_logs', ['level']);
    await queryInterface.addIndex('error_logs', ['created_at']);

    // Performance metrics
    await queryInterface.createTable('performance_metrics', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      metric_name: { type: Sequelize.STRING, allowNull: false },
      duration: { type: Sequelize.INTEGER, allowNull: false },
      details: { type: Sequelize.JSON },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('performance_metrics', ['metric_name']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('performance_metrics');
    await queryInterface.dropTable('error_logs');
    await queryInterface.dropTable('api_logs');
    await queryInterface.dropTable('system_metrics');
    await queryInterface.dropTable('course_completions');
    await queryInterface.dropTable('course_ratings');
    await queryInterface.dropTable('course_engagements');
    await queryInterface.dropTable('course_analytics');
    await queryInterface.dropTable('user_activities');
    await queryInterface.dropTable('page_views');
    await queryInterface.dropTable('user_sessions');
    await queryInterface.dropTable('user_engagements');
  }
};
