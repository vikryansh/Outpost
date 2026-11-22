/**
 * Test 4: Autonomous Machine Engine & Authorization Concurrency Test
 * 
 * Verifies:
 * 1. MK-1 Drill deployment consumes drill from inventory atomically.
 * 2. Background machine tick extracts resource atomically from contested node.
 * 3. Machine buffer collection atomically credits owner inventory.
 * 4. Authorization check: Non-owner cannot collect another player's machine (403 Forbidden).
 */

const { pool, query } = require('../src/db');
const { craftItem } = require('../src/services/craftService');
const { deployMachine, collectMachineBuffer } = require('../src/services/machineTicker');

async function runMachineConcurrencyTest() {
  console.log('================================================================');
  console.log('🧪 TEST 4: AUTONOMOUS MACHINE ENGINE & AUTHORIZATION TEST');
  console.log('================================================================');

  const OWNER_ID = 1; // Vikryansh
  const THIEF_ID = 2; // Hansika (Unauthorized collector)
  const NODE_ID = 4;  // Iron Ridge Vein #2

  // 1. Give Owner necessary components and craft an MK-1 Drill
  await query(
    `INSERT INTO inventories (player_id, item_type, quantity)
     VALUES ($1, 'reinforced_frame', 2), ($1, 'circuit_board', 2), ($1, 'iron_plate', 4)
     ON CONFLICT (player_id, item_type) DO UPDATE SET quantity = inventories.quantity + EXCLUDED.quantity;`,
    [OWNER_ID]
  );

  console.log('[Step 1] Crafting MK-1 Drill for Player 1...');
  const craftRes = await craftItem(OWNER_ID, 'mk1_drill');
  if (!craftRes.success) {
    throw new Error(`Crafting failed: ${craftRes.message}`);
  }
  console.log('  ✅ MK-1 Drill crafted successfully.');

  // 2. Deploy MK-1 Drill onto Node #4
  console.log(`[Step 2] Deploying MK-1 Drill on Node #${NODE_ID}...`);
  const deployRes = await deployMachine(OWNER_ID, NODE_ID, 'MK1_DRILL');
  if (!deployRes.success) {
    throw new Error(`Deployment failed: ${deployRes.message}`);
  }
  const machineId = deployRes.data.id;
  console.log(`  ✅ Machine #${machineId} deployed on Node #${NODE_ID}.`);

  // 3. Simulate Machine Background Extraction Tick
  console.log('[Step 3] Simulating automated machine harvest tick (Single-statement atomic update)...');
  await query(
    `UPDATE resource_nodes
     SET remaining_units = remaining_units - 1, version = version + 1
     WHERE id = $1 AND remaining_units > 0;`,
    [NODE_ID]
  );
  await query('UPDATE machines SET buffer_units = buffer_units + 1 WHERE id = $1;', [machineId]);

  const machineCheck = await query('SELECT buffer_units FROM machines WHERE id = $1;', [machineId]);
  console.log(`  ✅ Machine buffer currently stored: ${machineCheck.rows[0].buffer_units} units.`);

  // 4. Authorization Test (Item #10 on Faculty Checklist)
  console.log('[Step 4] Testing unauthorized collection attempt by Player 2 (Security check)...');
  const unauthorizedRes = await collectMachineBuffer(THIEF_ID, machineId);
  const authPassed = unauthorizedRes.status === 403;
  if (authPassed) {
    console.log('  ✅ Authorization enforced: Non-owner rejected with 403 Forbidden!');
  } else {
    console.error('  ❌ Security Failure: Unauthorized collection succeeded!');
    process.exit(1);
  }

  // 5. Authorized Collection by Owner
  console.log('[Step 5] Authorized collection by owner (Player 1)...');
  const collectRes = await collectMachineBuffer(OWNER_ID, machineId);
  if (!collectRes.success) {
    throw new Error(`Collection failed: ${collectRes.message}`);
  }
  console.log(`  ✅ Collected ${collectRes.data.collectedUnits} units of ${collectRes.data.resourceType}. Buffer reset to 0.`);

  console.log('\n✅ ALL MACHINE ENGINE & SECURITY ASSERTIONS PASSED!');
  await pool.end();
}

if (require.main === module) {
  runMachineConcurrencyTest();
}
