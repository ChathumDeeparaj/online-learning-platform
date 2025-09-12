const { sequelize } = require('../config/database');
const fs = require('fs');
const path = require('path');

class MigrationRunner {
  constructor() {
    this.migrationsTable = 'migrations';
  }

  async init() {
    // Create migrations table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async getExecutedMigrations() {
    const [results] = await sequelize.query(
      `SELECT name FROM ${this.migrationsTable} ORDER BY executed_at`
    );
    return results.map(row => row.name);
  }

  async markAsExecuted(migrationName) {
    await sequelize.query(
      `INSERT INTO ${this.migrationsTable} (name) VALUES (?)`,
      { replacements: [migrationName] }
    );
  }

  async runMigrations() {
    await this.init();
    
    const migrationsDir = path.join(__dirname);
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js') && file !== 'migration-runner.js')
      .sort();

    const executedMigrations = await this.getExecutedMigrations();
    const pendingMigrations = migrationFiles.filter(file => 
      !executedMigrations.includes(file.replace('.js', ''))
    );

    console.log(`Found ${pendingMigrations.length} pending migrations`);

    for (const file of pendingMigrations) {
      const migrationName = file.replace('.js', '');
      console.log(`Running migration: ${migrationName}`);
      
      try {
        const migration = require(path.join(migrationsDir, file));
        await migration.up(sequelize);
        await this.markAsExecuted(migrationName);
        console.log(`✅ Migration ${migrationName} completed`);
      } catch (error) {
        console.error(`❌ Migration ${migrationName} failed:`, error.message);
        throw error;
      }
    }

    console.log('All migrations completed successfully!');
  }

  async rollbackMigration(migrationName) {
    await this.init();
    
    try {
      const migration = require(path.join(__dirname, `${migrationName}.js`));
      await migration.down(sequelize);
      await sequelize.query(
        `DELETE FROM ${this.migrationsTable} WHERE name = ?`,
        { replacements: [migrationName] }
      );
      console.log(`✅ Migration ${migrationName} rolled back successfully`);
    } catch (error) {
      console.error(`❌ Rollback of ${migrationName} failed:`, error.message);
      throw error;
    }
  }
}

module.exports = MigrationRunner;


