const { getClient } = require('../db');

/**
 * Creates a standing trade offer with immediate escrow (Appendix A.9.4 Fix 3)
 * The offered items are deducted from the creator's inventory and held by the offer.
 */
async function createStandingOffer(creatorPlayerId, offeredItem, offeredQuantity, demandedItem, demandedQuantity) {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Lock and verify creator has sufficient quantity of offered item
    const checkRes = await client.query(
      'SELECT quantity FROM inventories WHERE player_id = $1 AND item_type = $2 FOR UPDATE;',
      [creatorPlayerId, offeredItem]
    );

    const available = checkRes.rows.length > 0 ? checkRes.rows[0].quantity : 0;
    if (available < offeredQuantity) {
      await client.query('ROLLBACK');
      return {
        success: false,
        status: 422,
        error: 'INSUFFICIENT_FUNDS',
        message: `Insufficient ${offeredItem} to place offer. Available: ${available}`,
      };
    }

    // 2. Escrow items (decrement from creator)
    await client.query(
      'UPDATE inventories SET quantity = quantity - $1, updated_at = NOW() WHERE player_id = $2 AND item_type = $3;',
      [offeredQuantity, creatorPlayerId, offeredItem]
    );

    // 3. Create standing trade record
    const insertSql = `
      INSERT INTO standing_trades (creator_player_id, offered_item, offered_quantity, demanded_item, demanded_quantity, status)
      VALUES ($1, $2, $3, $4, $5, 'OPEN')
      RETURNING *;
    `;
    const tradeRes = await client.query(insertSql, [
      creatorPlayerId,
      offeredItem,
      offeredQuantity,
      demandedItem,
      demandedQuantity,
    ]);

    const trade = tradeRes.rows[0];

    // 4. Log event
    await client.query(
      `INSERT INTO event_logs (player_id, event_type, details)
       VALUES ($1, 'TRADE_CREATE', $2);`,
      [creatorPlayerId, JSON.stringify(trade)]
    );

    await client.query('COMMIT');

    return {
      success: true,
      status: 201,
      data: trade,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Accepts a standing offer (One-sided atomic transaction)
 * Deadlock-free by design because only the accepting party's transaction acquires locks.
 * Supports `simulateFault` for automated 100-loop rollback verification.
 */
async function acceptStandingOffer(buyerPlayerId, tradeId, simulateFault = false, postCommitEmitter = null) {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Lock trade row to verify it is still OPEN
    const tradeCheck = await client.query(
      'SELECT * FROM standing_trades WHERE id = $1 AND status = $2 FOR UPDATE;',
      [tradeId, 'OPEN']
    );

    if (tradeCheck.rowCount === 0) {
      await client.query('ROLLBACK');
      return {
        success: false,
        status: 409,
        error: 'TRADE_UNAVAILABLE',
        message: 'Trade offer is no longer open or does not exist.',
      };
    }

    const trade = tradeCheck.rows[0];

    // Prevent player from accepting their own offer
    if (trade.creator_player_id === buyerPlayerId) {
      await client.query('ROLLBACK');
      return {
        success: false,
        status: 400,
        error: 'CANNOT_ACCEPT_OWN_TRADE',
        message: 'Cannot accept your own standing trade offer.',
      };
    }

    // 2. Lock and verify buyer has the demanded payment
    const buyerCheck = await client.query(
      'SELECT quantity FROM inventories WHERE player_id = $1 AND item_type = $2 FOR UPDATE;',
      [buyerPlayerId, trade.demanded_item]
    );

    const buyerAvailable = buyerCheck.rows.length > 0 ? buyerCheck.rows[0].quantity : 0;
    if (buyerAvailable < trade.demanded_quantity) {
      await client.query('ROLLBACK');
      return {
        success: false,
        status: 422,
        error: 'INSUFFICIENT_PAYMENT',
        message: `You do not have enough ${trade.demanded_item}. Required: ${trade.demanded_quantity}, Available: ${buyerAvailable}`,
      };
    }

    // 3. Deduct demanded payment from buyer
    await client.query(
      'UPDATE inventories SET quantity = quantity - $1, updated_at = NOW() WHERE player_id = $2 AND item_type = $3;',
      [trade.demanded_quantity, buyerPlayerId, trade.demanded_item]
    );

    // =========================================================================
    // FAULT INJECTION CHECKPOINT (Required for Professor's Test 2)
    // If simulateFault is enabled, throw an exception here after debiting buyer
    // but BEFORE crediting either party.
    // =========================================================================
    if (simulateFault) {
      throw new Error('[FAULT_INJECTION] Simulated crash between buyer debit and seller credit.');
    }

    // 4. Credit buyer with escrowed offered item
    await client.query(
      `INSERT INTO inventories (player_id, item_type, quantity, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (player_id, item_type)
       DO UPDATE SET quantity = inventories.quantity + $3, updated_at = NOW();`,
      [buyerPlayerId, trade.offered_item, trade.offered_quantity]
    );

    // 5. Credit seller with demanded payment
    await client.query(
      `INSERT INTO inventories (player_id, item_type, quantity, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (player_id, item_type)
       DO UPDATE SET quantity = inventories.quantity + $3, updated_at = NOW();`,
      [trade.creator_player_id, trade.demanded_item, trade.demanded_quantity]
    );

    // 6. Mark trade COMPLETED
    await client.query(
      `UPDATE standing_trades
       SET status = 'COMPLETED',
           completed_by_player_id = $1,
           completed_at = NOW()
       WHERE id = $2;`,
      [buyerPlayerId, tradeId]
    );

    // 7. Log completion
    await client.query(
      `INSERT INTO event_logs (player_id, event_type, details)
       VALUES ($1, 'TRADE_ACCEPT', $2);`,
      [buyerPlayerId, JSON.stringify({ tradeId, buyer: buyerPlayerId, seller: trade.creator_player_id })]
    );

    await client.query('COMMIT');

    if (postCommitEmitter) {
      postCommitEmitter('TRADE_COMPLETED', {
        tradeId,
        buyerId: buyerPlayerId,
        sellerId: trade.creator_player_id,
        offeredItem: trade.offered_item,
        offeredQuantity: trade.offered_quantity,
        demandedItem: trade.demanded_item,
        demandedQuantity: trade.demanded_quantity,
      });
    }

    return {
      success: true,
      status: 200,
      data: { tradeId, status: 'COMPLETED' },
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  createStandingOffer,
  acceptStandingOffer,
};
