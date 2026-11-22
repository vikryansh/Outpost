const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.DATABASE_URL;

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Required for cloud databases like Supabase
      },
      max: 50,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5433', 10),
      user: process.env.DB_USER || 'outpost_user',
      password: process.env.DB_PASSWORD || 'outpost_password',
      database: process.env.DB_NAME || 'outpost_db',
      max: 50,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[PostgreSQL Pool Error]', err);
});

/**
 * Execute raw parameterized query with standard pooling
 */
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // Log slow queries for profiling
  if (duration > 50) {
    console.log('[Slow Query]', { text: text.slice(0, 60), duration, rows: res.rowCount });
  }
  return res;
}

/**
 * Get dedicated client for raw multi-statement transaction control (BEGIN / COMMIT / ROLLBACK)
 */
async function getClient() {
  const client = await pool.connect();
  return client;
}

module.exports = {
  pool,
  query,
  getClient,
};
