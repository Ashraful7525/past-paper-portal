import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.SUPABASE_URL || 'postgresql://postgres.efxegjjzcvgmgyxgaxxw:ballssacks@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default pool;
