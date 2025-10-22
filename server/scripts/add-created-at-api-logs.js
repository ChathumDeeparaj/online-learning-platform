(async () => {
  try {
    const { sequelize } = require('../config/database');
    const queryInterface = sequelize.getQueryInterface();
    const Sequelize = require('sequelize');

    await sequelize.authenticate();
    console.log('DB authenticated. Ensuring api_logs has created_at...');

    const desc = await queryInterface.describeTable('api_logs').catch(() => null);
    if (!desc) {
      throw new Error('api_logs table does not exist');
    }

    if (!desc.created_at) {
      console.log('Adding created_at to api_logs...');
      await queryInterface.addColumn('api_logs', 'created_at', { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') });
    } else {
      console.log('api_logs.created_at already exists.');
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
})();
