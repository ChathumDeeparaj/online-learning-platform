(async () => {
  try {
    const { sequelize } = require('../config/database');
    const queryInterface = sequelize.getQueryInterface();
    const Sequelize = require('sequelize');

    await sequelize.authenticate();
    console.log('DB authenticated. Adding missing timestamp columns...');

    // Helper to add column if missing
    const addIfMissing = async (table, column, definition) => {
      const desc = await queryInterface.describeTable(table).catch(() => null);
      if (!desc || !desc[column]) {
        console.log(`Adding ${column} to ${table}...`);
        await queryInterface.addColumn(table, column, definition);
      } else {
        console.log(`${table}.${column} already exists, skipping.`);
      }
    };

    const createdAtDef = { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') };
    const updatedAtDef = { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') };

    await addIfMissing('course_completions', 'created_at', createdAtDef);
    await addIfMissing('course_completions', 'updated_at', updatedAtDef);

    await addIfMissing('course_ratings', 'created_at', createdAtDef);
    await addIfMissing('course_ratings', 'updated_at', updatedAtDef);

    console.log('Timestamp fix complete.');
    process.exit(0);
  } catch (err) {
    console.error('Timestamp fix failed:', err);
    process.exit(1);
  }
})();
