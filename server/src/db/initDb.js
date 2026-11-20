const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

async function initDb() {
  console.log('[DB] Connecting to PostgreSQL to initialize schema...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await pool.query(sql);
    console.log('[DB] ✅ Authoritative Schema and Seed Data applied successfully!');
    
    // Quick verification query
    const nodes = await pool.query('SELECT COUNT(*) FROM resource_nodes;');
    const players = await pool.query('SELECT COUNT(*) FROM players;');
    console.log(`[DB] Verified state: ${nodes.rows[0].count} resource nodes, ${players.rows[0].count} players seeded.`);
  } catch (err) {
    console.error('[DB] ❌ Schema initialization failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  initDb();
}

module.exports = { initDb };
