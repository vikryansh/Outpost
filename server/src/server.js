const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { pool, query } = require('./db');
const { harvestNode } = require('./services/harvestService');
const { craftItem, RECIPES } = require('./services/craftService');
const { createStandingOffer, acceptStandingOffer, cancelStandingOffer } = require('./services/tradeService');
const {
  deployMachine,
  collectMachineBuffer,
  startMachineEngine,
  startRegenerationEngine,
} = require('./services/machineTicker');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Helper for Push-After-Commit Socket emissions
function emitSocketEvent(eventName, payload) {
  io.emit(eventName, payload);
}

// ==============================================================================
// REST API ROUTES
// ==============================================================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'Outpost Backend Engine', timestamp: new Date().toISOString() });
});

// 1. Get all planetary resource nodes
app.get('/api/nodes', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, resource_type, max_capacity, remaining_units, version, coord_x, coord_y, grid_sector, status, updated_at FROM resource_nodes ORDER BY id ASC;'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// 2. Contested Node Harvest Endpoint (Single-Statement Conditional Update)
app.post('/api/nodes/:id/harvest', async (req, res) => {
  const nodeId = parseInt(req.params.id, 10);
  const playerId = parseInt(req.body.playerId || 1, 10);

  try {
    const result = await harvestNode(playerId, nodeId, emitSocketEvent);
    if (!result.success) {
      return res.status(result.status).json(result);
    }

    emitSocketEvent('GLOBAL_TICKER_LOG', {
      message: `⛏️ Player #${playerId} harvested 1 ${result.data.harvestedItem} from node #${nodeId}`,
      timestamp: new Date().toISOString(),
    });

    res.status(result.status).json(result);
  } catch (err) {
    res.status(500).json({ error: 'HARVEST_ERROR', message: err.message });
  }
});

// 3. Player Registration & Profiles
app.get('/api/players', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, username, role, outpost_tier, credits, created_at FROM players ORDER BY id ASC;'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

app.post('/api/players', async (req, res) => {
  const { username, role } = req.body;
  if (!username || !username.trim()) {
    return res.status(400).json({ error: 'MISSING_PARAM', message: 'Username is required.' });
  }

  const cleanUsername = username.trim();
  const cleanRole = role && role.trim() ? role.trim() : 'Pioneer';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if username already exists
    const checkUser = await client.query('SELECT id FROM players WHERE username = $1;', [cleanUsername]);
    if (checkUser.rowCount > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        error: 'USERNAME_TAKEN',
        message: `Pioneer callsign "${cleanUsername}" is already registered.`,
      });
    }

    // Insert new player
    const playerRes = await client.query(
      `INSERT INTO players (username, role, outpost_tier, credits)
       VALUES ($1, $2, 1, 50)
       RETURNING id, username, role, outpost_tier, credits, created_at;`,
      [cleanUsername, cleanRole]
    );
    const newPlayer = playerRes.rows[0];

    // Seed starter inventory
    const starterItems = [
      ['timber', 6],
      ['iron_ore', 4],
      ['copper_wire', 2],
    ];
    for (const [item, qty] of starterItems) {
      await client.query(
        `INSERT INTO inventories (player_id, item_type, quantity)
         VALUES ($1, $2, $3);`,
        [newPlayer.id, item, qty]
      );
    }

    // Log registration event
    await client.query(
      `INSERT INTO event_logs (player_id, event_type, details)
       VALUES ($1, 'PLAYER_REGISTER', $2);`,
      [newPlayer.id, JSON.stringify({ username: cleanUsername, role: cleanRole })]
    );

    await client.query('COMMIT');

    emitSocketEvent('PLAYER_REGISTERED', newPlayer);
    emitSocketEvent('GLOBAL_TICKER_LOG', {
      message: `🚀 New Pioneer enlisted: ${newPlayer.username} (${newPlayer.role}) joined Sector 9`,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({ success: true, data: newPlayer });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'REGISTRATION_ERROR', message: err.message });
  } finally {
    client.release();
  }
});

// 3. Get Player Inventory
app.get('/api/players/:id/inventory', async (req, res) => {
  const playerId = parseInt(req.params.id, 10);
  try {
    const result = await query(
      'SELECT item_type, quantity, updated_at FROM inventories WHERE player_id = $1 ORDER BY item_type ASC;',
      [playerId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// 3.1. Game / Sector World Reset Endpoint
app.post('/api/game/reset', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Reset all resource nodes to full max_capacity and version 1
    await client.query(`
      UPDATE resource_nodes
      SET remaining_units = max_capacity,
          version = 1,
          status = 'ACTIVE',
          updated_at = NOW();
    `);

    // 2. Remove all active machines
    await client.query(`DELETE FROM machines;`);

    // 3. Cancel all open standing trades
    await client.query(`UPDATE standing_trades SET status = 'CANCELLED', completed_at = NOW() WHERE status = 'OPEN';`);

    // 4. Reset starter inventories for players
    await client.query(`
      DELETE FROM inventories;
      INSERT INTO inventories (player_id, item_type, quantity)
      VALUES
        (1, 'timber', 6),
        (1, 'iron_ore', 4),
        (1, 'copper_wire', 2),
        (2, 'timber', 8),
        (2, 'copper_ore', 6),
        (2, 'iron_plate', 2)
      ON CONFLICT (player_id, item_type) DO UPDATE SET quantity = EXCLUDED.quantity;
    `);

    // 5. Append reset event log
    await client.query(`
      INSERT INTO event_logs (player_id, event_type, details)
      VALUES (1, 'GAME_RESET', '{"message": "Authoritative sector reset executed. All nodes and inventories restored to factory baseline."}');
    `);

    await client.query('COMMIT');

    // Broadcast GAME_RESET to all connected sockets
    emitSocketEvent('GAME_RESET', {
      timestamp: new Date().toISOString(),
      message: 'Sector 9 planetary state has been authoritatively reset to baseline.',
    });
    emitSocketEvent('GLOBAL_TICKER_LOG', {
      message: '🔄 SECTOR RESET: Planet state, resource reserves, and inventory ledgers restored to nominal baseline.',
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Game world and resource sectors reset successfully.' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'RESET_ERROR', message: err.message });
  } finally {
    client.release();
  }
});

// 4. Crafting Endpoints
app.get('/api/recipes', (req, res) => {
  res.json(RECIPES);
});

app.post('/api/craft', async (req, res) => {
  const { playerId, item } = req.body;
  if (!item) {
    return res.status(400).json({ error: 'MISSING_PARAM', message: 'Item is required.' });
  }

  try {
    const result = await craftItem(parseInt(playerId || 1, 10), item);
    if (!result.success) {
      return res.status(result.status).json(result);
    }

    emitSocketEvent('GLOBAL_TICKER_LOG', {
      message: `⚒️ Player #${playerId || 1} assembled 1x ${item}`,
      timestamp: new Date().toISOString(),
    });

    if (item === 'surveyors_beacon') {
      emitSocketEvent('VICTORY_ACHIEVED', {
        playerId: parseInt(playerId || 1, 10),
        message: `🏆 VICTORY! Player #${playerId || 1} assembled the Surveyor's Beacon! Sector 9 Frontier Secured!`,
        timestamp: new Date().toISOString(),
      });
      emitSocketEvent('GLOBAL_TICKER_LOG', {
        message: `🏆 VICTORY! Player #${playerId || 1} assembled the Surveyor's Beacon! Sector 9 Frontier Secured!`,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(result.status).json(result);
  } catch (err) {
    res.status(500).json({ error: 'CRAFT_ERROR', message: err.message });
  }
});

// 5. Standing-Offer Trade Endpoints (Deadlock Prevention)
app.get('/api/trades', async (req, res) => {
  try {
    const result = await query(
      `SELECT t.*, p.username as creator_name 
       FROM standing_trades t 
       JOIN players p ON t.creator_player_id = p.id 
       WHERE t.status = 'OPEN' 
       ORDER BY t.created_at DESC;`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

app.post('/api/trades', async (req, res) => {
  const { creatorPlayerId, offeredItem, offeredQuantity, demandedItem, demandedQuantity } = req.body;
  try {
    const result = await createStandingOffer(
      parseInt(creatorPlayerId, 10),
      offeredItem,
      parseInt(offeredQuantity, 10),
      demandedItem,
      parseInt(demandedQuantity, 10)
    );
    if (!result.success) {
      return res.status(result.status).json(result);
    }

    emitSocketEvent('NEW_TRADE_OFFER', result.data);
    emitSocketEvent('GLOBAL_TICKER_LOG', {
      message: `📦 New Trade Offer: ${offeredQuantity}x ${offeredItem} for ${demandedQuantity}x ${demandedItem}`,
      timestamp: new Date().toISOString(),
    });

    res.status(result.status).json(result);
  } catch (err) {
    res.status(500).json({ error: 'TRADE_ERROR', message: err.message });
  }
});

app.post('/api/trades/:id/accept', async (req, res) => {
  const tradeId = parseInt(req.params.id, 10);
  const { buyerPlayerId, simulateFault } = req.body;

  try {
    const result = await acceptStandingOffer(
      parseInt(buyerPlayerId, 10),
      tradeId,
      Boolean(simulateFault),
      emitSocketEvent
    );
    if (!result.success) {
      return res.status(result.status).json(result);
    }

    emitSocketEvent('GLOBAL_TICKER_LOG', {
      message: `🤝 Trade #${tradeId} accepted by Player #${buyerPlayerId}`,
      timestamp: new Date().toISOString(),
    });

    res.status(result.status).json(result);
  } catch (err) {
    res.status(500).json({ error: 'ACCEPT_ERROR', message: err.message });
  }
});

app.post('/api/trades/:id/cancel', async (req, res) => {
  const tradeId = parseInt(req.params.id, 10);
  const { creatorPlayerId } = req.body;

  try {
    const result = await cancelStandingOffer(
      tradeId,
      parseInt(creatorPlayerId, 10),
      emitSocketEvent
    );
    if (!result.success) {
      return res.status(result.status).json(result);
    }

    emitSocketEvent('GLOBAL_TICKER_LOG', {
      message: `↩️ Trade #${tradeId} cancelled by Player #${creatorPlayerId} (Escrow Refunded)`,
      timestamp: new Date().toISOString(),
    });

    res.status(result.status).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.error || 'CANCEL_ERROR', message: err.message });
  }
});

// 6. Deployable Machines (Satisfactory-Style Automation)
app.get('/api/machines', async (req, res) => {
  try {
    const result = await query(
      `SELECT m.*, n.name as node_name, n.resource_type, p.username as owner_name
       FROM machines m
       JOIN resource_nodes n ON m.node_id = n.id
       JOIN players p ON m.player_id = p.id
       ORDER BY m.id ASC;`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

app.post('/api/machines/deploy', async (req, res) => {
  const { playerId, nodeId, machineType } = req.body;
  try {
    const result = await deployMachine(
      parseInt(playerId, 10),
      parseInt(nodeId, 10),
      machineType || 'MK1_DRILL'
    );
    if (!result.success) {
      return res.status(result.status).json(result);
    }

    emitSocketEvent('MACHINE_DEPLOYED', result.data);
    emitSocketEvent('GLOBAL_TICKER_LOG', {
      message: `🏭 Player #${playerId} deployed an ${machineType || 'MK-1 Drill'} on node #${nodeId}`,
      timestamp: new Date().toISOString(),
    });

    res.status(result.status).json(result);
  } catch (err) {
    res.status(500).json({ error: 'DEPLOY_ERROR', message: err.message });
  }
});

app.post('/api/machines/:id/collect', async (req, res) => {
  const machineId = parseInt(req.params.id, 10);
  const { playerId } = req.body;

  try {
    const result = await collectMachineBuffer(parseInt(playerId, 10), machineId);
    if (!result.success) {
      return res.status(result.status).json(result);
    }

    emitSocketEvent('MACHINE_BUFFER_UPDATED', {
      machineId,
      playerId: parseInt(playerId, 10),
      bufferUnits: 0,
    });

    res.status(result.status).json(result);
  } catch (err) {
    res.status(500).json({ error: 'COLLECT_ERROR', message: err.message });
  }
});

// 7. Recent Event Logs (Audit Feed)
app.get('/api/events', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, player_id, event_type, details, version, created_at FROM event_logs ORDER BY id DESC LIMIT 50;'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// ==============================================================================
// WEBSOCKET LOGIC & BACKGROUND ENGINES
// ==============================================================================

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Start Background Machine & Regeneration Workers
const machineTickerInterval = startMachineEngine(io, 10000);
const regenTickerInterval = startRegenerationEngine(io, 25000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Outpost Server] 🚀 Listening on http://localhost:${PORT}`);
});

module.exports = { app, server, io, machineTickerInterval, regenTickerInterval };
