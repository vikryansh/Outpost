const { getClient, query } = require('../db');

/**
 * Deploys an automated machine (e.g. MK-1 Drill) onto a resource node
 * Atomically consumes 1x mk1_drill from the player's inventory.
 */
async function deployMachine(playerId, nodeId, machineType = 'MK1_DRILL') {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Verify player has an MK-1 Drill in inventory
    const itemKey = machineType === 'MK1_DRILL' ? 'mk1_drill' : machineType.toLowerCase();
    const invCheck = await client.query(
      'SELECT quantity FROM inventories WHERE player_id = $1 AND item_type = $2 FOR UPDATE;',
      [playerId, itemKey]
    );

    const available = invCheck.rows.length > 0 ? invCheck.rows[0].quantity : 0;
    if (available < 1) {
      await client.query('ROLLBACK');
      return {
        success: false,
        status: 422,
        error: 'NO_MACHINE_IN_INVENTORY',
        message: `You do not have a ${machineType} in your inventory to deploy. Craft one first!`,
      };
    }

    // 2. Consume 1 drill from inventory
    await client.query(
      'UPDATE inventories SET quantity = quantity - 1, updated_at = NOW() WHERE player_id = $1 AND item_type = $2;',
      [playerId, itemKey]
    );

    // 3. Create machine record deployed on the node
    const insertMachineSql = `
      INSERT INTO machines (player_id, node_id, machine_type, status, buffer_units, buffer_capacity, last_tick_at)
      VALUES ($1, $2, $3, 'ACTIVE', 0, 10, NOW())
      RETURNING *;
    `;
    const machineRes = await client.query(insertMachineSql, [playerId, nodeId, machineType]);
    const machine = machineRes.rows[0];

    // 4. Log event
    await client.query(
      `INSERT INTO event_logs (player_id, event_type, node_id, details)
       VALUES ($1, 'MACHINE_DEPLOY', $2, $3);`,
      [playerId, nodeId, JSON.stringify(machine)]
    );

    await client.query('COMMIT');

    return {
      success: true,
      status: 201,
      data: machine,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Collects harvested resources stored in a machine's internal buffer
 * Transfers buffer_units atomically into the player's inventory.
 */
async function collectMachineBuffer(playerId, machineId) {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Lock machine record and verify ownership
    const machineCheck = await client.query(
      `SELECT m.*, n.resource_type 
       FROM machines m 
       JOIN resource_nodes n ON m.node_id = n.id 
       WHERE m.id = $1 FOR UPDATE;`,
      [machineId]
    );

    if (machineCheck.rowCount === 0) {
      await client.query('ROLLBACK');
      return { success: false, status: 404, error: 'NOT_FOUND', message: 'Machine not found.' };
    }

    const machine = machineCheck.rows[0];
    if (machine.player_id !== playerId) {
      await client.query('ROLLBACK');
      return { success: false, status: 403, error: 'FORBIDDEN', message: 'You do not own this machine.' };
    }

    const unitsToCollect = machine.buffer_units;
    if (unitsToCollect <= 0) {
      await client.query('ROLLBACK');
      return { success: false, status: 400, error: 'EMPTY_BUFFER', message: 'Machine buffer is empty.' };
    }

    // 2. Empty machine buffer
    await client.query(
      'UPDATE machines SET buffer_units = 0, last_tick_at = NOW() WHERE id = $1;',
      [machineId]
    );

    // 3. Deposit extracted resources into player inventory
    const invRes = await client.query(
      `INSERT INTO inventories (player_id, item_type, quantity, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (player_id, item_type)
       DO UPDATE SET quantity = inventories.quantity + $3, updated_at = NOW()
       RETURNING quantity;`,
      [playerId, machine.resource_type, unitsToCollect]
    );

    // 4. Log collection event
    await client.query(
      `INSERT INTO event_logs (player_id, event_type, node_id, details)
       VALUES ($1, 'MACHINE_COLLECT', $2, $3);`,
      [playerId, machine.node_id, JSON.stringify({ machineId, unitsCollected: unitsToCollect })]
    );

    await client.query('COMMIT');

    return {
      success: true,
      status: 200,
      data: {
        machineId,
        collectedUnits: unitsToCollect,
        resourceType: machine.resource_type,
        newInventoryTotal: invRes.rows[0].quantity,
      },
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Background Machine Tick Engine (Satisfactory-Style Automation)
 * Executes every 10 seconds. Protected by PostgreSQL Advisory Lock (Appendix A.6)
 * to guarantee exactly-once processing across multiple backend instances.
 */
function startMachineEngine(io, tickIntervalMs = 10000) {
  console.log(`[Machine Engine] ⚙️ Autonomous Machine Ticker initialized (Interval: ${tickIntervalMs / 1000}s)`);

  const intervalId = setInterval(async () => {
    const client = await getClient();

    try {
      // Advisory Lock 9001: Machine Engine tick lock
      const lockRes = await client.query('SELECT pg_try_advisory_lock(9001) as locked;');
      if (!lockRes.rows[0].locked) {
        // Another instance is already running this tick cycle cleanly
        return;
      }

      // Find active machines with space in their buffer
      const activeMachines = await client.query(
        `SELECT m.id, m.player_id, m.node_id, m.buffer_units, m.buffer_capacity, n.resource_type, n.remaining_units
         FROM machines m
         JOIN resource_nodes n ON m.node_id = n.id
         WHERE m.status = 'ACTIVE' AND m.buffer_units < m.buffer_capacity;`
      );

      for (const machine of activeMachines.rows) {
        // Attempt single-statement atomic harvest against the node
        const harvestRes = await client.query(
          `UPDATE resource_nodes
           SET remaining_units = remaining_units - 1,
               version = version + 1,
               updated_at = NOW()
           WHERE id = $1 AND remaining_units > 0
           RETURNING remaining_units, version;`,
          [machine.node_id]
        );

        if (harvestRes.rowCount > 0) {
          const updatedNode = harvestRes.rows[0];

          // Store extracted unit in machine buffer
          const bufRes = await client.query(
            `UPDATE machines
             SET buffer_units = buffer_units + 1,
                 last_tick_at = NOW()
             WHERE id = $1
             RETURNING buffer_units;`,
            [machine.id]
          );

          const newBuffer = bufRes.rows[0].buffer_units;

          // Log machine extraction event
          await client.query(
            `INSERT INTO event_logs (player_id, event_type, node_id, version, details)
             VALUES ($1, 'MACHINE_EXTRACT', $2, $3, $4);`,
            [
              machine.player_id,
              machine.node_id,
              updatedNode.version,
              JSON.stringify({ machineId: machine.id, bufferUnits: newBuffer }),
            ]
          );

          // Push-After-Commit broadcast via Socket.io
          if (io) {
            io.emit('NODE_STATE_UPDATED', {
              nodeId: machine.node_id,
              remainingUnits: updatedNode.remaining_units,
              version: updatedNode.version,
              updatedAt: new Date().toISOString(),
            });

            io.emit('MACHINE_BUFFER_UPDATED', {
              machineId: machine.id,
              playerId: machine.player_id,
              bufferUnits: newBuffer,
            });

            io.emit('GLOBAL_TICKER_LOG', {
              message: `🏭 MK-1 Drill #${machine.id} extracted 1 ${machine.resource_type} (Stored: ${newBuffer}/${machine.buffer_capacity})`,
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    } catch (err) {
      console.error('[Machine Engine Error]', err);
    } finally {
      // Release advisory lock
      try {
        await client.query('SELECT pg_advisory_unlock(9001);');
      } catch (unlockErr) {
        // Ignore unlock error on disconnect
      }
      client.release();
    }
  }, tickIntervalMs);

  return intervalId;
}

/**
 * Background Node Replenishment Routine (Appendix A.6)
 * Replenishes depleted nodes periodically. Protected by Advisory Lock 9002.
 */
function startRegenerationEngine(io, regenIntervalMs = 25000) {
  console.log(`[Regen Engine] 🌊 Sector Replenishment Engine initialized (Interval: ${regenIntervalMs / 1000}s)`);

  const intervalId = setInterval(async () => {
    const client = await getClient();

    try {
      const lockRes = await client.query('SELECT pg_try_advisory_lock(9002) as locked;');
      if (!lockRes.rows[0].locked) return;

      // Replenish +2 units up to max_capacity for nodes that have space
      const regenRes = await client.query(
        `UPDATE resource_nodes
         SET remaining_units = LEAST(max_capacity, remaining_units + 2),
             version = version + 1,
             updated_at = NOW()
         WHERE remaining_units < max_capacity
         RETURNING id, name, remaining_units, max_capacity, version;`
      );

      if (regenRes.rowCount > 0 && io) {
        for (const node of regenRes.rows) {
          io.emit('NODE_STATE_UPDATED', {
            nodeId: node.id,
            remainingUnits: node.remaining_units,
            version: node.version,
            updatedAt: new Date().toISOString(),
          });
        }

        io.emit('GLOBAL_TICKER_LOG', {
          message: `🌊 Sector Replenishment Wave: ${regenRes.rowCount} nodes received fresh deposits.`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('[Regen Engine Error]', err);
    } finally {
      try {
        await client.query('SELECT pg_advisory_unlock(9002);');
      } catch (unlockErr) {}
      client.release();
    }
  }, regenIntervalMs);

  return intervalId;
}

module.exports = {
  deployMachine,
  collectMachineBuffer,
  startMachineEngine,
  startRegenerationEngine,
};
