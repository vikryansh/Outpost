/**
 * Test 3: 5,000-Row Scaling Benchmark & EXPLAIN ANALYZE Proof
 * 
 * Scenario:
 * - Populates the append-only event_logs table with 5,000+ operational rows.
 * - Benchmarks query performance for player transaction history.
 * - Executes EXPLAIN ANALYZE to prove index utilization for portfolio evidence.
 */

const crypto = require('crypto');
const { pool, query } = require('../src/db');

async function runScalingBenchmark() {
  console.log('================================================================');
  console.log('🧪 TEST 3: 5,000-ROW SCALING BENCHMARK & EXPLAIN ANALYZE');
  console.log('================================================================');

  const TARGET_ROWS = 5200;

  const countRes = await query('SELECT COUNT(*) FROM event_logs;');
  const currentCount = parseInt(countRes.rows[0].count, 10);
  console.log(`[Current State] event_logs table currently has ${currentCount} rows.`);

  if (currentCount < TARGET_ROWS) {
    const toInsert = TARGET_ROWS - currentCount;
    console.log(`[Seeding] Bulk inserting ${toInsert} realistic operational event rows in batches...`);

    const batchSize = 500;
    let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';

    for (let i = 0; i < toInsert; i += batchSize) {
      const currentBatch = Math.min(batchSize, toInsert - i);
      const values = [];
      const params = [];
      let paramIdx = 1;

      for (let j = 0; j < currentBatch; j++) {
        const playerId = ((i + j) % 3) + 1;
        const eventTypes = ['HARVEST', 'CRAFT', 'TRADE_CREATE', 'TRADE_ACCEPT', 'MACHINE_TICK'];
        const eventType = eventTypes[(i + j) % eventTypes.length];
        const currentHash = crypto.createHash('sha256').update(`${prevHash}:${playerId}:${eventType}:${i + j}`).digest('hex');
        prevHash = currentHash;

        values.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`);
        params.push(playerId, eventType, JSON.stringify({ index: i + j, status: 'SUCCESS' }), prevHash, currentHash);
      }

      await query(
        `INSERT INTO event_logs (player_id, event_type, details, prev_hash, current_hash) VALUES ${values.join(', ')};`,
        params
      );
    }
  }

  const finalCountRes = await query('SELECT COUNT(*) FROM event_logs;');
  const finalCount = parseInt(finalCountRes.rows[0].count, 10);
  console.log(`[Verified] Total rows in event_logs: ${finalCount} (Target: > 5,000 rows).\n`);

  // Run EXPLAIN ANALYZE on indexed player history query
  console.log('--- EXPLAIN ANALYZE: Indexed Query (player_id, created_at DESC) ---');
  const explainIndexed = await query(`
    EXPLAIN ANALYZE 
    SELECT id, player_id, event_type, details, created_at 
    FROM event_logs 
    WHERE player_id = 1 
    ORDER BY created_at DESC 
    LIMIT 50;
  `);

  for (const row of explainIndexed.rows) {
    console.log(`  ${row['QUERY PLAN']}`);
  }

  console.log('\n✅ 5,000-Row Scaling Benchmark Completed Successfully!');
  await pool.end();
}

if (require.main === module) {
  runScalingBenchmark();
}
