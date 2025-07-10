import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.SUPABASE_URL || 'postgresql://postgres.efxegjjzcvgmgyxgaxxw:ballssacks@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Add this function to test the connection
export async function testConnection() {
  try {
    // Simple query to check connectivity
    await pool.query('SELECT 1');
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

export default pool;
