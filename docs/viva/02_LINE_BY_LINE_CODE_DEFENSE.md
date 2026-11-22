# Line-by-Line Code Defense & Architectural Breakdown
## Outpost — Shared-World Resource & Automation Game
**Course:** Full Stack Development (B.Tech CSE)  
**Authors:** Hansika Malik & Vikryansh Singh  
**Purpose:** Prepare team members to explain every single line of SQL, transaction demarcation, advisory locking, and client state filtering during the viva examination.

---

# MODULE 1: Contested Node Atomic Harvest
**File:** [`server/src/services/harvestService.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/services/harvestService.js)

```javascript
8: async function harvestNode(playerId, nodeId, postCommitEmitter = null) {
9:   const client = await getClient();
10:  try {
11:    await client.query('BEGIN');
```
* **Line 9 (`const client = await getClient();`):**  
  Acquires a dedicated PostgreSQL connection from the connection pool (`pg.Pool`). Multi-statement transactions **must** execute on the exact same client connection; executing on `pool.query()` would run queries across arbitrary pool connections and break transaction boundaries.
* **Line 11 (`await client.query('BEGIN');`):**  
  Explicitly starts a new ACID transaction block on the dedicated connection.

```javascript
15:    const updateSql = `
16:      UPDATE resource_nodes
17:      SET remaining_units = remaining_units - 1,
18:          version = version + 1,
19:          updated_at = NOW()
20:      WHERE id = $1 AND remaining_units > 0
21:      RETURNING id, name, resource_type, remaining_units, max_capacity, version;
22:    `;
23:    const res = await client.query(updateSql, [nodeId]);
```
* **Line 17 (`remaining_units = remaining_units - 1`):**  
  Direct in-place decrement executed inside the database engine. Eliminates the naive `SELECT ... then UPDATE` read-modify-write pattern.
* **Line 18 (`version = version + 1`):**  
  Increments the monotonic sequence version. Client observers use this to discard out-of-order stale WebSocket packets.
* **Line 20 (`WHERE id = $1 AND remaining_units > 0`):**  
  **The Core Concurrency Guard (Appendix A.4).** The condition `remaining_units > 0` is evaluated by PostgreSQL while holding the row lock during `EvalPlanQual`. If another concurrent transaction just decremented the last unit to 0, this clause evaluates to `FALSE`.
* **Line 21 (`RETURNING ...`):**  
  Returns the updated tuple immediately, avoiding an unnecessary secondary `SELECT` query.

```javascript
25:    // 0 rows affected means the node was exhausted by a competing request
26:    if (res.rowCount === 0) {
27:      await client.query('ROLLBACK');
28:      return {
29:        success: false,
30:        status: 409,
31:        error: 'RESOURCE_EXHAUSTED',
32:        message: 'Resource node already exhausted.',
33:      };
34:    }
```
* **Line 26 (`if (res.rowCount === 0)`):**  
  If the node had 0 units remaining, PostgreSQL affected 0 rows.
* **Line 27 (`await client.query('ROLLBACK');`):**  
  Immediately rolls back the transaction, releasing all connection resources cleanly.
* **Line 30 (`status: 409`):**  
  Returns HTTP `409 Conflict`, indicating state conflict under concurrency.

```javascript
39:    const inventorySql = `
40:      INSERT INTO inventories (player_id, item_type, quantity, updated_at)
41:      VALUES ($1, $2, 1, NOW())
42:      ON CONFLICT (player_id, item_type)
43:      DO UPDATE SET quantity = inventories.quantity + 1, updated_at = NOW()
44:      RETURNING quantity;
45:    `;
46:    const invRes = await client.query(inventorySql, [playerId, node.resource_type]);
```
* **Lines 40–43 (`ON CONFLICT (player_id, item_type) DO UPDATE ...`):**  
  Atomic UPSERT. If the player does not have an inventory row for this item type, it inserts one with quantity 1. If the row already exists (violating `uq_player_item`), PostgreSQL atomically increments `quantity = inventories.quantity + 1`.

```javascript
50:    const prevLog = await client.query('SELECT current_hash FROM event_logs ORDER BY id DESC LIMIT 1;');
51:    const prevHash = prevLog.rows[0]?.current_hash || '0'.repeat(64);
52:    const currentHash = crypto.createHash('sha256')
53:      .update(`${prevHash}:${playerId}:HARVEST:${nodeId}:${node.version}`)
54:      .digest('hex');
55:    await client.query(`
56:      INSERT INTO event_logs (player_id, event_type, node_id, details, version, prev_hash, current_hash)
57:      VALUES ($1, 'HARVEST', $2, $3, $4, $5, $6);
58:    `, [playerId, nodeId, JSON.stringify({ harvested: node.resource_type }), node.version, prevHash, currentHash]);
```
* **Lines 50–58:**  
  Appends an immutable audit log entry into `event_logs`. Uses SHA-256 cryptographic hash chaining (`prev_hash` $\rightarrow$ `current_hash`) to guarantee that the history cannot be retroactively modified without invalidating the chain.

```javascript
60:    await client.query('COMMIT');
61:
62:    // 4. Push-After-Commit Socket.io broadcast (Strict Ordering)
63:    if (postCommitEmitter) {
64:      postCommitEmitter('NODE_STATE_UPDATED', {
65:        nodeId: node.id,
66:        remainingUnits: node.remaining_units,
67:        version: node.version,
68:        updatedAt: new Date().toISOString(),
69:      });
70:    }
```
* **Line 60 (`await client.query('COMMIT');`):**  
  Persists all changes (node decrement, inventory increment, audit log) atomically to disk and the Write-Ahead Log (WAL).
* **Lines 63–70 (`Push-After-Commit`):**  
  The WebSocket broadcast fires **strictly after** `COMMIT`. Observers never see uncommitted, rollback-prone phantom state.

```javascript
75:  } catch (err) {
76:    await client.query('ROLLBACK');
77:    throw err;
78:  } finally {
79:    client.release();
80:  }
```
* **Line 76 (`ROLLBACK`):**  
  Ensures that if any database error occurs, every statement in the transaction is completely undone.
* **Line 79 (`client.release();`):**  
  **Crucial Resource Management.** Releases the dedicated client back to the pool in the `finally` block, preventing connection pool exhaustion leaks.

---

# MODULE 2: Deadlock-Free Escrow Trading
**File:** [`server/src/services/tradeService.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/services/tradeService.js)

### Creating Standing Escrow Offer
```javascript
25:  await client.query('BEGIN');
26:  // Deduct offered items from creator's inventory (Escrow lock)
27:  const deductRes = await client.query(`
28:    UPDATE inventories
29:    SET quantity = quantity - $1, updated_at = NOW()
30:    WHERE player_id = $2 AND item_type = $3 AND quantity >= $1
31:    RETURNING quantity;
32:  `, [offeredQuantity, creatorPlayerId, offeredItem]);
```
* **Lines 28–30 (`WHERE player_id = $2 AND quantity >= $1`):**  
  Atomically locks and debits the seller's items into escrow. If the seller lacks sufficient items, `deductRes.rowCount === 0`, and the transaction aborts with `422 Unprocessable Entity`. The items are safely stored in the `standing_trades` table with `status = 'OPEN'`.

### One-Sided Acceptance (Deadlock Elimination per Appendix A.9.4 Fix 3)
```javascript
70:  await client.query('BEGIN');
71:  // 1. Lock the trade row exclusively
72:  const tradeRes = await client.query(`
73:    SELECT * FROM standing_trades WHERE id = $1 AND status = 'OPEN' FOR UPDATE;
74:  `, [tradeId]);
```
* **Line 73 (`FOR UPDATE`):**  
  Acquires an exclusive row lock on the trade offer record. If two buyers simultaneously click "Accept", the second buyer waits for the first. Once the first buyer commits, the trade row status becomes `'COMPLETED'`, and the second buyer's query returns 0 rows (`status = 'OPEN'` evaluates to false), cleanly preventing double-claiming.

```javascript
88:  // 2. Lock buyer's demanded item inventory
89:  const buyerInv = await client.query(`
90:    UPDATE inventories
91:    SET quantity = quantity - $1, updated_at = NOW()
92:    WHERE player_id = $2 AND item_type = $3 AND quantity >= $1
93:    RETURNING quantity;
94:  `, [trade.demanded_quantity, buyerPlayerId, trade.demanded_item]);
```
* **Lines 90–92:**  
  Debits the payment from the buyer's inventory. Note that only **one party's inventory** is modified at this step. Because only one transaction is executing during acceptance, no circular wait cycle can form.

```javascript
105: // 3. Deposit escrowed items to buyer
106: await client.query(`
107:   INSERT INTO inventories (player_id, item_type, quantity, updated_at)
108:   VALUES ($1, $2, $3, NOW())
109:   ON CONFLICT (player_id, item_type)
110:   DO UPDATE SET quantity = inventories.quantity + $3, updated_at = NOW();
111: `, [buyerPlayerId, trade.offered_item, trade.offered_quantity]);
112:
113: // 4. Deposit payment to seller
114: await client.query(`
115:   INSERT INTO inventories (player_id, item_type, quantity, updated_at)
116:   VALUES ($1, $2, $3, NOW())
117:   ON CONFLICT (player_id, item_type)
118:   DO UPDATE SET quantity = inventories.quantity + $3, updated_at = NOW();
119: `, [trade.creator_player_id, trade.demanded_item, trade.demanded_quantity]);
```
* **Lines 106–119:**  
  Transfers the escrowed goods to the buyer and deposits payment to the creator. If any database fault occurs, the entire transaction rolls back cleanly.

```javascript
125: if (simulateFault) {
126:   throw new Error('[Fault Injection] Simulating database crash mid-transaction');
127: }
```
* **Lines 125–127:**  
  The test hook used by `tests/trade-rollback.js` to prove that 100/100 mid-transaction crashes result in zero balance drift.

---

# MODULE 3: Autonomous Machine Engine & Advisory Locks
**File:** [`server/src/services/machineTicker.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/services/machineTicker.js)

```javascript
45: async function processMachineTick(machine, io) {
46:   const client = await getClient();
47:   try {
48:     // 1. Acquire non-blocking session-level advisory lock
49:     const lockRes = await client.query('SELECT pg_try_advisory_lock($1);', [machine.id]);
50:     if (!lockRes.rows[0].pg_try_advisory_lock) {
51:       // Another server instance is currently processing this machine
52:       return;
53:     }
```
* **Line 49 (`SELECT pg_try_advisory_lock($1);`):**  
  **Multi-Instance Cluster Safety (Appendix A.6 & A.8).** Uses application-defined 64-bit integer keys. If Instance #1 holds the lock for `machine.id`, Instance #2 receives `false` in Line 50 and immediately returns without blocking or locking table rows.

```javascript
58:     await client.query('BEGIN');
59:     // Machine contends with human players for finite node stock!
60:     const harvestRes = await client.query(`
61:       UPDATE resource_nodes
62:       SET remaining_units = remaining_units - 1, version = version + 1, updated_at = NOW()
63:       WHERE id = $1 AND remaining_units > 0
64:       RETURNING id, remaining_units, version;
65:     `, [machine.node_id]);
```
* **Lines 60–65:**  
  The machine engine executes the **identical zero-window atomic decrement query** as human clicks. Machines do not get privileged access; they contend for the same finite database rows.

```javascript
75:     // Atomically increment machine buffer if capacity permits
76:     await client.query(`
77:       UPDATE machines
78:       SET buffer_units = buffer_units + 1, last_tick_at = NOW()
79:       WHERE id = $1 AND buffer_units < buffer_capacity;
80:     `, [machine.id]);
81:     await client.query('COMMIT');
```
* **Lines 76–80:**  
  Buffers the harvested ore into the machine's internal buffer (`buffer_capacity = 10`).

```javascript
95:   } finally {
96:     await client.query('SELECT pg_advisory_unlock($1);', [machine.id]);
97:     client.release();
98:   }
```
* **Line 96 (`pg_advisory_unlock($1);`):**  
  Guarantees the advisory lock is released even if an unhandled error occurs during execution.

### Security Authorization Guard
```javascript
120: async function collectMachineBuffer(machineId, playerId) {
...
135:   if (machine.player_id !== playerId) {
136:     return { success: false, status: 403, error: 'FORBIDDEN', message: 'You do not own this machine.' };
137:   }
```
* **Line 135:**  
  Enforces resource-level authorization. Non-owners attempting to steal ore from another player's automated drill are rejected with HTTP `403 Forbidden`.

---

# MODULE 4: Relational Schema & Table Invariants
**File:** [`server/src/db/schema.sql`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/db/schema.sql)

```sql
35: CONSTRAINT chk_remaining_units_non_negative CHECK (remaining_units >= 0)
```
* **`CHECK (remaining_units >= 0)`:**  
  PostgreSQL database-level constraint. If any transaction attempts to set `remaining_units` to `-1`, PostgreSQL immediately halts execution and aborts the transaction.

```sql
45: CONSTRAINT chk_quantity_non_negative CHECK (quantity >= 0),
46: CONSTRAINT uq_player_item UNIQUE (player_id, item_type)
```
* **`CHECK (quantity >= 0)`:**  
  Guarantees player inventory can never go negative under concurrent crafts or trades.
* **`UNIQUE (player_id, item_type)`:**  
  Prevents duplicate item rows for a single player; enables clean `ON CONFLICT ... DO UPDATE` UPSERT operations.

```sql
61: CONSTRAINT chk_buffer_units_non_negative CHECK (buffer_units >= 0)
```
* **`CHECK (buffer_units >= 0)`:**  
  Protects automated machine buffers from negative drift during simultaneous buffer collection.

```sql
106: CREATE INDEX IF NOT EXISTS idx_event_logs_player_created 
107: ON event_logs(player_id, created_at DESC);
```
* **`idx_event_logs_player_created`:**  
  Composite B-tree index. In [`tests/seed-scale.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/tests/seed-scale.js), this reduces scan time across 6,280+ audit rows from a multi-millisecond sequential table scan to a **0.16 ms** direct index traverse.

---

# MODULE 5: Client Monotonic Stale-Packet Discard Filter
**File:** [`client/src/App.jsx`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/client/src/App.jsx)

```javascript
79: socket.on('NODE_STATE_UPDATED', (payload) => {
80:   setNodes((prevNodes) =>
81:     prevNodes.map((node) => {
82:       if (node.id === payload.nodeId) {
83:         // Drop stale out-of-order packets (Monotonicity Rule)
84:         if (payload.version <= node.version) {
85:           console.warn('[Socket Filter] Discarded stale packet:', payload);
86:           return node;
87:         }
88:         return {
89:           ...node,
90:           remaining_units: payload.remainingUnits,
91:           version: payload.version,
92:           updated_at: payload.updatedAt,
93:         };
94:       }
95:       return node;
96:     })
97:   );
98: });
```
* **Lines 84–87:**  
  **The Monotonicity Filter.** If network latency causes an earlier version packet (`v4`) to arrive after a later version packet (`v5`), the condition `payload.version <= node.version` detects the regression and immediately discards the stale packet. The client UI is mathematically guaranteed to only transition forwards in state.
