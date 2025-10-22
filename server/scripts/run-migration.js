(async () => {
  try {
    const { sequelize } = require('../config/database');
    const migration = require('../migrations/20251021-create-analytics-tables');
    await sequelize.authenticate();
    console.log('DB authenticated. Applying migration...');
    await migration.up(sequelize.getQueryInterface(), require('sequelize'));
    console.log('Migration applied successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
})();