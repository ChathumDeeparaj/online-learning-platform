/**
 * Migration: create analytics and system metrics tables
 * Generated: 2025-10-21
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const dbName = queryInterface.sequelize.config.database;

    const addIndexIfNotExists = async (tableName, indexName, fields) => {
      const indexes = await queryInterface.showIndex(tableName);
      const indexExists = indexes.some(index => index.name === indexName);
      if (!indexExists) {
        await queryInterface.addIndex(tableName, fields, { name: indexName });
      }
    };

    const addConstraintIfNotExists = async (tableName, constraintName, options) => {
      const constraints = await queryInterface.sequelize.query(
        `SELECT * FROM information_schema.table_constraints WHERE constraint_schema = '${dbName}' AND table_name = '${tableName}' AND constraint_name = '${constraintName}';`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      if (constraints.length === 0) await queryInterface.addConstraint(tableName, options);
    };

    const addColumnIfNotExists = async (tableName, columnName, definition) => {
      const tableDescription = await queryInterface.describeTable(tableName);
      if (!tableDescription[columnName]) {
        await queryInterface.addColumn(tableName, columnName, definition);
      }
    };

    // User engagement (one row per user)
    await queryInterface.createTable('user_engagements', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      total_logins: { type: Sequelize.INTEGER, defaultValue: 0 },
      total_time_spent: { type: Sequelize.INTEGER, defaultValue: 0 },
      courses_completed: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, { ifNotExists: true });

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
    }, { ifNotExists: true });

    // Page views
    await queryInterface.createTable('page_views', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      path: { type: Sequelize.STRING, allowNull: false },
      ip_address: { type: Sequelize.STRING },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, { ifNotExists: true });
    await addIndexIfNotExists('page_views', 'page_views_path', ['path']);
    await addIndexIfNotExists('page_views', 'page_views_user_id', ['user_id']);

    // User activities (events)
    await queryInterface.createTable('user_activities', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      activity_type: { type: Sequelize.STRING, allowNull: false },
      entity_type: { type: Sequelize.STRING },
      entity_id: { type: Sequelize.INTEGER },
      details: { type: Sequelize.JSON },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, { ifNotExists: true });
    await addIndexIfNotExists('user_activities', 'idx_user_activities_user_timestamp', ['user_id', 'created_at']);
    await addIndexIfNotExists('user_activities', 'idx_user_activities_type_timestamp', ['activity_type', 'created_at']);

    // Course analytics (daily)
    await queryInterface.createTable('course_analytics', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      course_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'courses', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      views: { type: Sequelize.INTEGER, defaultValue: 0 },
      enrollments: { type: Sequelize.INTEGER, defaultValue: 0 },
      completion_rate: { type: Sequelize.FLOAT, defaultValue: 0 }
    }, { ifNotExists: true });
    await addConstraintIfNotExists('course_analytics', 'uniq_course_date', { fields: ['course_id', 'date'], type: 'unique', name: 'uniq_course_date' });
    await addIndexIfNotExists('course_analytics', 'idx_course_analytics_course_date', ['course_id', 'date']);

    // Course engagement (aggregated)
    await queryInterface.createTable('course_engagements', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      course_id: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: 'courses', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      total_enrollments: { type: Sequelize.INTEGER, defaultValue: 0 },
      average_progress: { type: Sequelize.FLOAT, defaultValue: 0 },
      average_completion_time: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, { ifNotExists: true });

    // Course ratings
    await queryInterface.createTable('course_ratings', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      course_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'courses', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      rating: { type: Sequelize.INTEGER, allowNull: false }
    }, { ifNotExists: true });
    await addConstraintIfNotExists('course_ratings', 'user_course_rating', { fields: ['course_id', 'user_id'], type: 'unique', name: 'user_course_rating' });
    await addColumnIfNotExists('course_ratings', 'created_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') });
    await addColumnIfNotExists('course_ratings', 'updated_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') });

    // Course completion (per enrollment)
    await queryInterface.createTable('course_completions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      enrollment_id: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: 'enrollments', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      completion_date: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      time_to_complete: { type: Sequelize.INTEGER }
    }, { ifNotExists: true });
    await addColumnIfNotExists('course_completions', 'created_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') });
    await addColumnIfNotExists('course_completions', 'updated_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') });
    await addIndexIfNotExists('course_completions', 'course_completions_completion_date', ['completion_date']);

    // System metrics
    await queryInterface.createTable('system_metrics', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      metric_type: { type: Sequelize.STRING, allowNull: false },
      value: { type: Sequelize.FLOAT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, { ifNotExists: true });
    await addIndexIfNotExists('system_metrics', 'idx_system_metrics_type_timestamp', ['metric_type', 'created_at']);

    // API logs
    await queryInterface.createTable('api_logs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      method: { type: Sequelize.STRING, allowNull: false },
      path: { type: Sequelize.STRING, allowNull: false },
      status_code: { type: Sequelize.INTEGER, allowNull: false },
      response_time: { type: Sequelize.INTEGER, allowNull: false },
      ip_address: { type: Sequelize.STRING },
      user_id: { type: Sequelize.INTEGER },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, { ifNotExists: true });
    await addIndexIfNotExists('api_logs', 'api_logs_path', ['path']);
    await addIndexIfNotExists('api_logs', 'api_logs_status_code', ['status_code']);
    await addIndexIfNotExists('api_logs', 'api_logs_user_id', ['user_id']);

    // Error logs
    await queryInterface.createTable('error_logs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      level: { type: Sequelize.STRING, defaultValue: 'error' },
      message: { type: Sequelize.TEXT, allowNull: false },
      stack: { type: Sequelize.TEXT },
      context: { type: Sequelize.JSON },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, { ifNotExists: true });
    await addIndexIfNotExists('error_logs', 'error_logs_level', ['level']);
    await addIndexIfNotExists('error_logs', 'error_logs_created_at', ['created_at']);

    // Performance metrics
    await queryInterface.createTable('performance_metrics', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      metric_name: { type: Sequelize.STRING, allowNull: false },
      duration: { type: Sequelize.INTEGER, allowNull: false },
      details: { type: Sequelize.JSON },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    }, { ifNotExists: true });
    await addIndexIfNotExists('performance_metrics', 'performance_metrics_metric_name', ['metric_name']);
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
