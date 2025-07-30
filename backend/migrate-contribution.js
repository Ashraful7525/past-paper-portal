import pool from './config/db.js';
import fs from 'fs';

async function runMigration() {
  try {
    console.log('🚀 Starting contribution system migration...');
    
    // Read the migration file
    const migrationSQL = fs.readFileSync('./database/add_contribution_system.sql', 'utf8');
    
    // Execute the migration
    await pool.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('📝 Added new fields:');
    console.log('   - last_activity_date (DATE)');
    console.log('   - current_streak (INTEGER)');
    console.log('   - longest_streak (INTEGER)');
    console.log('   - reputation_tier (VARCHAR)');
    console.log('📊 Created indexes for performance');
    console.log('🔄 Updated existing users with default values');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Some fields already exist, this is normal');
    } else {
      console.error('Full error:', error);
    }
  } finally {
    await pool.end();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
runMigration();