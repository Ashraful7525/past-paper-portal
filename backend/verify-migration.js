import pool from './config/db.js';

async function verifyMigration() {
  try {
    console.log('🔍 Verifying contribution system migration...');
    
    // Check if new columns exist
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('last_activity_date', 'current_streak', 'longest_streak', 'reputation_tier')
      ORDER BY column_name;
    `);
    
    console.log('✅ New columns found:');
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Check if any users have the new fields populated
    const userCheck = await pool.query(`
      SELECT student_id, username, contribution, current_streak, longest_streak, reputation_tier
      FROM users 
      LIMIT 5;
    `);
    
    console.log('\n📊 Sample user data:');
    userCheck.rows.forEach(user => {
      console.log(`  - ${user.username}: ${user.contribution} points, ${user.current_streak} streak, ${user.reputation_tier} tier`);
    });
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await pool.end();
  }
}

verifyMigration();