# Individual Role Defense Profiles & Viva Strategy
## Outpost — Shared-World Resource & Automation Game
**Course:** Full Stack Development (B.Tech CSE)  
**Authors:** Vikryansh Singh & Hansika Malik  
**Purpose:** Ensure both team members possess tailored, high-confidence defense strategies demonstrating clear code ownership, deep theoretical mastery, and seamless collaborative handoffs during individual viva questioning.

---

# PART 1: VIKRYANSH SINGH
**Role:** Frontend Lead & Real-Time UX Architect  
**Git Author:** `vikryansh <vikryansh19113@gmail.com>`  
**Primary Ownership:**
* React 18 (Vite) + Tailwind CSS tactical dark-mode command dashboard.
* Large $2500 \times 1400\text{ px}$ pannable terrain viewport with mouse-wheel zoom (0.5x–1.4x) and camera boundary clamping.
* Radar Minimap coordinate tracking with viewport ratio calculation (`window.innerWidth - 390px`).
* Socket.io client integration with **Monotonic Stale-Packet Discard Filter** (`payload.version <= node.version`).
* Live In-UI **Concurrency Lab Modal** (`[LAB]`), Sector Telemetry Modal (`[INTEL]`), and Hotkeys Cheatsheet.
* 100% procedural Web Audio API synthesizer (`services/soundFx.js`) with zero audio file downloads.
* Smooth WASD / Arrow Key navigation, Spacebar crater centering, and conditional rendering (loading spinners, 409 error shake banners, empty inventory badges).

---

### Vikryansh's Anticipated Viva Questions & Model Answers

#### Q1: "How does your pannable map viewport handle canvas bounding with the 390px sidebar?"
> **Answer:**  
> "The map canvas is $2500 \times 1400\text{ px}$, but the browser viewport is partially occupied by our 390px right sidebar and 168px header/ticker bars.  
> In [`MapViewport.jsx`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/client/src/components/MapViewport.jsx#L56-L69), the available viewable dimensions are dynamically calculated as:
> ```javascript
> const viewportW = window.innerWidth - 390;
> const viewportH = window.innerHeight - 168;
> const scaledWidth = MAP_WIDTH * zoomLevel;
> const scaledHeight = MAP_HEIGHT * zoomLevel;
> const minX = Math.min(0, -(scaledWidth - viewportW));
> const minY = Math.min(0, -(scaledHeight - viewportH));
> ```
> We clamp the pan coordinates between `minX - 100` and `+100`. This guarantees that even when fully zoomed out or panned to the right edge, the map never slides out of view or clips behind the sidebar dock."

---

#### Q2: "Why did you implement a Monotonic Stale-Packet Filter in React? Doesn't TCP already guarantee in-order delivery?"
> **Answer:**  
> "TCP guarantees ordered packet delivery across a *single* socket connection, but it cannot prevent out-of-order state reception across *concurrent distributed operations*.  
> For example: Request A starts at $T_0$, but encounters a 50ms database lock wait. Request B starts at $T_1$, commits immediately, and emits version `v5`. Request A finally commits at $T_2$ and emits version `v4`.  
> If client browsers accepted packets blindly, they would overwrite `v5` with stale state `v4`, moving backwards in time.  
> In [`App.jsx`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/client/src/App.jsx#L84-L87), we enforce a logical sequence rule:
> ```javascript
> if (payload.version <= node.version) {
>   console.warn('[Socket Filter] Discarded stale packet:', payload);
>   return node; // Drop stale out-of-order update
> }
> ```
> This guarantees that client state progresses monotonically forward."

---

#### Q3: "How did you implement procedural audio without external audio files?"
> **Answer:**  
> "In [`services/soundFx.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/client/src/services/soundFx.js), we used the native browser **Web Audio API**.  
> We synthesize procedural sound waves using oscillators and gain envelopes:
> * **Harvest Laser:** Triangle oscillator with an exponential frequency ramp from 450Hz down to 180Hz over 120ms.
> * **Craft Chime:** Ascending three-tone sine arpeggio (C5: 523Hz, E5: 659Hz, G5: 783Hz).
> * **Drill Deployment:** Low sawtooth wave sweeping from 180Hz down to 50Hz simulating a hydraulic industrial thud.
> * **Emergency Siren:** Sawtooth oscillator sweeping between 700Hz and 950Hz.  
> This eliminates external MP3 downloads, guarantees zero network audio latency, and includes a persistent localStorage mute toggle."

---

#### Q4: "How does the in-UI Concurrency Lab fire 40 simultaneous requests from the browser?"
> **Answer:**  
> "In [`ConcurrencyLabModal.jsx`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/client/src/components/ConcurrencyLabModal.jsx), we call our backend simulation endpoint (`POST /api/simulation/concurrency-race`), which dispatches 40 simultaneous promises via `Promise.all` directly contending for the target database row.  
> The client receives the execution breakdown in ~150ms and renders an animated scoreboard comparing total dispatched requests against `200 OK` winners and `409 Conflict` rejections, proving zero negative inventory drift live on screen."

---

# PART 2: HANSIKA MALIK
**Role:** Backend Lead & Database Concurrency Architect  
**Git Author:** `hansikamalik <thehansikamalik@gmail.com>`  
**Primary Ownership:**
* PostgreSQL 16 schema, relational constraints (`CHECK remaining_units >= 0`), foreign keys, and indexes.
* Zero-window single-statement conditional atomic decrement (Appendix A.4).
* Deadlock-free escrow trading service with deterministic primary-key item ordering (Appendix A.9.4 Fix 3).
* Autonomous Machine Engine using PostgreSQL Session-Level Advisory Locks (`pg_try_advisory_lock`).
* Dynamic player enlistment and authoritative sector world reset (`POST /api/game/reset`).
* 4 Automated verification test suites: Concurrency race, 100-iteration rollback fault injection, 5,000-row B-tree scaling benchmark, and machine authorization security.
* Multi-stage Dockerfiles and turnkey full-stack Docker Compose configuration.

---

### Hansika's Anticipated Viva Questions & Model Answers

#### Q1: "Explain how your single-statement atomic decrement prevents race conditions at the database level."
> **Answer:**  
> "In [`harvestService.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/services/harvestService.js#L16-L23), we execute:
> ```sql
> UPDATE resource_nodes
> SET remaining_units = remaining_units - 1, version = version + 1, updated_at = NOW()
> WHERE id = $1 AND remaining_units > 0
> RETURNING remaining_units, version;
> ```
> When multiple concurrent transactions execute this query against the same node ID:
> 1. PostgreSQL's lock manager grants an exclusive row lock on the tuple to the first arriving transaction.
> 2. The other transactions wait in a FIFO queue on that tuple lock.
> 3. Under Read Committed isolation, when Transaction #1 commits, Transaction #2 wakes up and performs `EvalPlanQual` (EPQ): it re-reads the updated tuple and re-evaluates `remaining_units > 0`.
> 4. If remaining stock is still $> 0$, it proceeds. The instant a transaction reduces stock to 0, all subsequent waiting transactions re-evaluate `remaining_units > 0`, find it evaluates to `FALSE`, and affect **0 rows**.
> 5. Our backend checks `res.rowCount === 0` and immediately responds with `409 Conflict`. Zero negative stock is mathematically guaranteed."

---

#### Q2: "How does your 100-iteration rollback fault injection test prove transactional atomicity?"
> **Answer:**  
> "In [`tests/trade-rollback.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/tests/trade-rollback.js), we test our escrow acceptance service under simulated catastrophic crashes:
> * We seed Seller Timber = 500, Buyer Copper = 500.
> * We run **100 consecutive iterations** where an artificial unhandled exception is injected mid-transaction right after escrow deduction but before payment deposit.
> * The test verifies that in **100 out of 100 iterations**, the `catch` block catches the exception and executes `client.query('ROLLBACK')`.
> * The test asserts that Seller Timber balance drift is exactly `0`, Buyer Copper balance drift is exactly `0`, and no orphan items remain in the database."

---

#### Q3: "What is an Advisory Lock and why did you use `pg_try_advisory_lock` for the Machine Ticker?"
> **Answer:**  
> "Standard table and row locks lock actual relational data and cause contention with human players.  
> PostgreSQL Advisory Locks are application-defined, lightweight distributed locks managed in PostgreSQL's shared memory lock table.  
> In [`machineTicker.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/services/machineTicker.js#L49), we call:
> ```sql
> SELECT pg_try_advisory_lock($1);
> ```
> Passing the machine ID as the lock key:
> 1. `pg_try_advisory_lock` is non-blocking: if Server Instance A claims the lock for Machine #1, it receives `true` and processes the harvest tick.
> 2. If Server Instance B tries to process Machine #1 at the same second, it receives `false` and skips immediately without waiting.
> 3. This guarantees single-instance execution across a multi-server cluster without using an external Redis coordinator or locking relational data."

---

#### Q4: "Explain the `EXPLAIN ANALYZE` metrics in your 5,000-row scaling test."
> **Answer:**  
> "In [`tests/seed-scale.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/tests/seed-scale.js), `event_logs` holds **6,280+ rows**.
> We ran `EXPLAIN ANALYZE` on:
> ```sql
> SELECT * FROM event_logs WHERE player_id = 1 ORDER BY created_at DESC LIMIT 50;
> ```
> Output:
> * `Index Scan using idx_event_logs_player_created`: Demonstrates that PostgreSQL used our composite B-tree index on `(player_id, created_at DESC)` rather than scanning all 6,280 rows sequentially.
> * `cost=0.28..18.58`: Estimated startup and completion page I/O cost.
> * `Execution Time: 0.160 ms`: The query executes in less than **one-fifth of a millisecond**. The composite index stores rows pre-ordered by player and timestamp, eliminating in-memory sorting completely."

---

# PART 3: Seamless Full-Stack Collaborative Handoffs

When an examiner asks a comprehensive question, demonstrate seamless teamwork using this handoff formula:

### Example Question: "Walk me through what happens when a player clicks 'Extract' on an ore node."

* **Vikryansh (Starts):**  
  > *"When the player clicks the node or the Extract button, our React component in `NodeCard.jsx` immediately sets local loading state to prevent double-clicks, plays an audio laser extraction pulse, and dispatches a `POST` request to `/api/nodes/:id/harvest`. At this point, I will hand over to Hansika for the backend transaction flow."*

* **Hansika (Takes Over):**  
  > *"On the backend, our Express controller receives the request and checks out a dedicated connection from the `pg.Pool`. It opens a transaction with `BEGIN` and executes our single-statement atomic decrement: `UPDATE resource_nodes SET remaining_units = remaining_units - 1 WHERE id = $1 AND remaining_units > 0`.  
  > If stock is available, it upserts the player's inventory, appends an entry to our SHA-256 hash-chained `event_logs`, commits to disk, and triggers our post-commit emitter callback before releasing the client back to the pool. I'll pass back to Vikryansh for how the UI updates."*

* **Vikryansh (Concludes):**  
  > *"Once the commit succeeds, our Socket.io server broadcasts `NODE_STATE_UPDATED`. All connected browser clients receive the payload, pass it through our Monotonic Stale-Packet Discard Filter (`payload.version <= node.version`), update the remaining units progress bar, and display floating gain particles on screen. If the node was exhausted, the client displays an error shake animation citing HTTP 409."*

---

### Examiner Takeaway:
This handoff proves to the examination committee that:
1. Neither student is a passenger.
2. Both partners thoroughly understand their respective layers.
3. The full-stack connection points are cleanly engineered and mathematically verified.
