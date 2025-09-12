#!/usr/bin/env node

/**
 * Database Migration Runner
 * Usage: node migrate.js [up|down|status]
 */

const MigrationRunner = require('./migrations/migration-runner');

async function main() {
  const command = process.argv[2] || 'up';
  const migrationName = process.argv[3];
  
  const runner = new MigrationRunner();
  
  try {
    switch (command) {
      case 'up':
        console.log('🚀 Running database migrations...');
        await runner.runMigrations();
        break;
        
      case 'down':
        if (!migrationName) {
          console.error('❌ Migration name required for rollback');
          console.log('Usage: node migrate.js down <migration-name>');
          process.exit(1);
        }
        console.log(`🔄 Rolling back migration: ${migrationName}`);
        await runner.rollbackMigration(migrationName);
        break;
        
      case 'status':
        console.log('📊 Migration Status:');
        await runner.init();
        const executed = await runner.getExecutedMigrations();
        console.log('Executed migrations:', executed);
        break;
        
      default:
        console.log('Usage: node migrate.js [up|down|status]');
        console.log('  up     - Run all pending migrations');
        console.log('  down   - Rollback a specific migration');
        console.log('  status - Show migration status');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main();


