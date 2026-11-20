const { getClient } = require('../db');

const RECIPES = {
  iron_plate: {
    ingredients: [{ item: 'iron_ore', quantity: 2 }],
    outputQuantity: 1,
  },
  copper_wire: {
    ingredients: [{ item: 'copper_ore', quantity: 2 }],
    outputQuantity: 1,
  },
  circuit_board: {
    ingredients: [
      { item: 'copper_wire', quantity: 2 },
      { item: 'iron_plate', quantity: 1 },
    ],
    outputQuantity: 1,
  },
  reinforced_frame: {
    ingredients: [
      { item: 'iron_plate', quantity: 2 },
      { item: 'timber', quantity: 2 },
    ],
    outputQuantity: 1,
  },
  mk1_drill: {
    ingredients: [
      { item: 'reinforced_frame', quantity: 1 },
      { item: 'circuit_board', quantity: 1 },
      { item: 'iron_plate', quantity: 2 },
    ],
    outputQuantity: 1,
  },
  surveyors_beacon: {
    ingredients: [
      { item: 'reinforced_frame', quantity: 2 },
      { item: 'circuit_board', quantity: 3 },
      { item: 'energy_crystal', quantity: 2 },
    ],
    outputQuantity: 1,
  },
};

/**
 * Atomic multi-row crafting transaction
 * Consumes all required ingredients in deterministic sorted order (Appendix A.9.2)
 * Rollback leaves all inventory intact if any single ingredient is deficient.
 */
async function craftItem(playerId, targetItem) {
  const recipe = RECIPES[targetItem];
  if (!recipe) {
    return { success: false, status: 400, error: 'UNKNOWN_RECIPE', message: `No recipe found for ${targetItem}` };
  }

  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Sort ingredients to ensure deterministic lock acquisition order (Appendix A.9.2 Fix 1)
    const sortedIngredients = [...recipe.ingredients].sort((a, b) => a.item.localeCompare(b.item));

    // 2. Validate and consume each ingredient atomically
    for (const req of sortedIngredients) {
      const invCheck = await client.query(
        'SELECT quantity FROM inventories WHERE player_id = $1 AND item_type = $2 FOR UPDATE;',
        [playerId, req.item]
      );

      const available = invCheck.rows.length > 0 ? invCheck.rows[0].quantity : 0;
      if (available < req.quantity) {
        await client.query('ROLLBACK');
        return {
          success: false,
          status: 422,
          error: 'INSUFFICIENT_INGREDIENTS',
          message: `Insufficient ${req.item}. Needed: ${req.quantity}, Available: ${available}`,
        };
      }

      // Decrement ingredient
      await client.query(
        'UPDATE inventories SET quantity = quantity - $1, updated_at = NOW() WHERE player_id = $2 AND item_type = $3;',
        [req.quantity, playerId, req.item]
      );
    }

    // 3. Deposit crafted item
    const depositRes = await client.query(
      `INSERT INTO inventories (player_id, item_type, quantity, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (player_id, item_type)
       DO UPDATE SET quantity = inventories.quantity + $3, updated_at = NOW()
       RETURNING quantity;`,
      [playerId, targetItem, recipe.outputQuantity]
    );

    // 4. Log craft event in append-only audit ledger
    await client.query(
      `INSERT INTO event_logs (player_id, event_type, details)
       VALUES ($1, 'CRAFT', $2);`,
      [playerId, JSON.stringify({ item: targetItem, quantity: recipe.outputQuantity, ingredients: recipe.ingredients })]
    );

    await client.query('COMMIT');

    return {
      success: true,
      status: 200,
      data: {
        craftedItem: targetItem,
        quantity: recipe.outputQuantity,
        totalInInventory: depositRes.rows[0].quantity,
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
  RECIPES,
  craftItem,
};
