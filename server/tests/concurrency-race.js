/**
 * Test 1: Scaled Concurrency Race (Required by Faculty Review)
 * 
 * Scenario:
 * - A contested resource node is seeded with exactly 5 remaining units.
 * - 40 simultaneous harvest requests are dispatched at the exact same instant via Promise.all().
 * 
 * Assertions:
 * 1. Exactly 5 requests receive 200 OK.
 * 2. Exactly 35 requests receive 409 Conflict ('RESOURCE_EXHAUSTED').
 * 3. A direct SQL query asserts remaining_units = 0 (never negative).
 * 4. Exactly 5 harvest log rows were added to the audit table.
 */

const { pool, query } = require('../src/db');
const { harvestNode } = require('../src/services/harvestService');

async function runConcurrencyRaceTest() {
  console.log('================================================================');
  console.log('🧪 TEST 1: SCALED CONCURRENCY RACE (40 Requests vs 5 Units)');
  console.log('================================================================');

  const TARGET_NODE_ID = 3; // Iron Ridge Vein #1
  const INITIAL_UNITS = 5;
  const CONCURRENT_CLIENTS = 40;

  // 1. Setup & Seed Target Node
  await query(
    'UPDATE resource_nodes SET remaining_units = $1, version = 1 WHERE id = $2;',
    [INITIAL_UNITS, TARGET_NODE_ID]
  );

  const initialLogCountRes = await query(
    'SELECT COUNT(*) FROM event_logs WHERE node_id = $1 AND event_type = $2;',
    [TARGET_NODE_ID, 'HARVEST']
  );
  const initialLogs = parseInt(initialLogCountRes.rows[0].count, 10);

  console.log(`[Setup] Node #${TARGET_NODE_ID} seeded with remaining_units = ${INITIAL_UNITS}.`);
  console.log(`[Execution] Firing ${CONCURRENT_CLIENTS} simultaneous harvest requests via Promise.all()...\n`);

  const startTime = Date.now();

  // 2. Dispatch 40 concurrent harvest operations
  const requests = Array.from({ length: CONCURRENT_CLIENTS }, (_, idx) => {
    const playerId = (idx % 2) + 1; // Alternating between Player 1 (Vikryansh) and Player 2 (Hansika)
    return harvestNode(playerId, TARGET_NODE_ID);
  });

  const results = await Promise.all(requests);
  const duration = Date.now() - startTime;

  // 3. Analyze Results
  let successCount = 0;
  let rejectedCount = 0;

  for (const r of results) {
    if (r.status === 200 && r.success) {
      successCount++;
    } else if (r.status === 409) {
      rejectedCount++;
    }
  }

  // 4. Verification Queries directly from PostgreSQL
  const nodeCheck = await query('SELECT remaining_units, version FROM resource_nodes WHERE id = $1;', [TARGET_NODE_ID]);
  const finalUnits = nodeCheck.rows[0].remaining_units;
  const finalVersion = nodeCheck.rows[0].version;

  const finalLogRes = await query(
    'SELECT COUNT(*) FROM event_logs WHERE node_id = $1 AND event_type = $2;',
    [TARGET_NODE_ID, 'HARVEST']
  );
  const newLogsCommitted = parseInt(finalLogRes.rows[0].count, 10) - initialLogs;

  console.log('--- TEST RESULTS ---');
  console.log(`Total Requests:         ${CONCURRENT_CLIENTS}`);
  console.log(`Successful (200 OK):    ${successCount} (Expected: ${INITIAL_UNITS})`);
  console.log(`Rejected (409 Exhaust): ${rejectedCount} (Expected: ${CONCURRENT_CLIENTS - INITIAL_UNITS})`);
  console.log(`Final Database Stock:   ${finalUnits} (Expected: 0)`);
  console.log(`New Audit Logs Added:   ${newLogsCommitted} (Expected: ${INITIAL_UNITS})`);
  console.log(`Execution Duration:     ${duration}ms\n`);

  // Assertions
  const pass1 = successCount === INITIAL_UNITS;
  const pass2 = rejectedCount === CONCURRENT_CLIENTS - INITIAL_UNITS;
  const pass3 = finalUnits === 0;
  const pass4 = newLogsCommitted === INITIAL_UNITS;

  if (pass1 && pass2 && pass3 && pass4) {
    console.log('✅ ALL CONCURRENCY ASSERTIONS PASSED!');
    console.log('Single-statement conditional atomic update mathematically guarantees 0 negative units under contention.\n');
  } else {
    console.error('❌ CONCURRENCY ASSERTIONS FAILED!');
    process.exit(1);
  }

  await pool.end();
}

if (require.main === module) {
  runConcurrencyRaceTest();
}
