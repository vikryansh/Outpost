const crypto = require('crypto');
const { getClient } = require('../db');

/**
 * Executes a single-statement Conditional Atomic Update (Appendix A.4)
 * Guarantees zero race-window over-harvesting even under high burst concurrency.
 */
async function harvestNode(playerId, nodeId, postCommitEmitter = null) {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Single-statement conditional atomic decrement
    const updateSql = `
      UPDATE resource_nodes
      SET remaining_units = remaining_units - 1,
          version = version + 1,
          updated_at = NOW()
      WHERE id = $1 AND remaining_units > 0
      RETURNING id, name, resource_type, remaining_units, max_capacity, version;
    `;
    const res = await client.query(updateSql, [nodeId]);

    // 0 rows affected means the node was exhausted by a competing request
    if (res.rowCount === 0) {
      await client.query('ROLLBACK');
      return {
        success: false,
        status: 409,
        error: 'RESOURCE_EXHAUSTED',
        message: 'Resource node already exhausted.',
      };
    }

    const node = res.rows[0];

    // 2. Atomically deposit harvested resource into player inventory
    const inventorySql = `
      INSERT INTO inventories (player_id, item_type, quantity, updated_at)
      VALUES ($1, $2, 1, NOW())
      ON CONFLICT (player_id, item_type)
      DO UPDATE SET quantity = inventories.quantity + 1, updated_at = NOW()
      RETURNING quantity;
    `;
    const invRes = await client.query(inventorySql, [playerId, node.resource_type]);
    const newInventoryQty = invRes.rows[0].quantity;

    // 3. Append to immutable audit event log
    const prevLog = await client.query('SELECT current_hash FROM event_logs ORDER BY id DESC LIMIT 1;');
    const prevHash = prevLog.rows.length > 0 ? prevLog.rows[0].current_hash : '0000000000000000000000000000000000000000000000000000000000000000';
    const currentHash = crypto.createHash('sha256').update(`${prevHash}:${playerId}:HARVEST:${node.id}:${node.version}`).digest('hex');

    await client.query(
      `INSERT INTO event_logs (player_id, event_type, node_id, version, details, prev_hash, current_hash)
       VALUES ($1, 'HARVEST', $2, $3, $4, $5, $6);`,
      [
        playerId,
        node.id,
        node.version,
        JSON.stringify({ resource: node.resource_type, remaining: node.remaining_units }),
        prevHash,
        currentHash,
      ]
    );

    // 4. Commit transaction
    await client.query('COMMIT');

    // 5. Push-After-Commit Rule: Broadcast strictly AFTER database commit resolves
    if (postCommitEmitter) {
      postCommitEmitter('NODE_STATE_UPDATED', {
        nodeId: node.id,
        remainingUnits: node.remaining_units,
        version: node.version,
        updatedAt: new Date().toISOString(),
      });
    }

    return {
      success: true,
      status: 200,
      data: {
        node,
        harvestedItem: node.resource_type,
        playerInventoryTotal: newInventoryQty,
      },
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  harvestNode,
};
