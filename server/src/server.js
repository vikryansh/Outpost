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
const { createStandingOffer, acceptStandingOffer } = require('./services/tradeService');

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
  res.json({ status: 'OK', service: 'Outpost Backend', timestamp: new Date().toISOString() });
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
    res.status(result.status).json(result);
  } catch (err) {
    res.status(500).json({ error: 'HARVEST_ERROR', message: err.message });
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

// 4. Crafting Endpoint
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
    res.status(result.status).json(result);
  } catch (err) {
    res.status(500).json({ error: 'ACCEPT_ERROR', message: err.message });
  }
});

// 6. Recent Event Logs (Audit Feed & Ticker)
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
// WEBSOCKET LOGIC (Socket.io)
// ==============================================================================

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Outpost Server] 🚀 Listening on http://localhost:${PORT}`);
});

module.exports = { app, server, io };
