# Live Demo Script & 5-Minute Viva Pitch
## Outpost — Shared-World Resource & Automation Game
**Presenters:** Vikryansh Singh & Hansika Malik  
**Duration:** Exactly 5 Minutes + Q&A  
**Setup Required:**  
1. Backend running: `cd Outpost/server && npm start` (`http://localhost:5000`)
2. Frontend running: `cd Outpost/client && npm run dev` (`http://localhost:3000`)
3. Two browser windows opened side-by-side (Window A on left, Window B on right).
4. Terminal open at `Outpost/server/` ready to run test suites.

---

## ⏱️ MINUTE-BY-MINUTE PRESENTATION TIMELINE

```
0:00 ─── 1:00 : The Pitch & Architectural Boundary (Problem Statement)
1:00 ─── 2:00 : Side-by-Side Dual Client & Real-Time Synchronization
2:00 ─── 3:15 : The Showstopper: In-UI Live Concurrency Lab
3:15 ─── 4:15 : Automated MK-1 Drills & Deadlock-Free Escrow Trades
4:15 ─── 5:00 : Terminal Verification (Test Suites & EXPLAIN ANALYZE)
```

---

## 🎤 MINUTE 0:00 – 1:00 | The Pitch & Architectural Boundary

### What to Say:
> *"Good morning Professors. Today we are presenting **Outpost**, a shared-world automation and resource game inspired by factory engineering games like *Satisfactory*.*
> 
> *Before showing the system, we want to highlight our **deliberate architectural boundary**:*  
> *Rather than building spatial character netcode or 3D physics—which introduce client-side prediction and desynchronization—we focused 100% of our engineering on the hardest problem in distributed web systems: **high-contention relational database concurrency, multi-row ACID transactions, and deterministic state distribution**.*
> 
> *Our project satisfies **all three hard requirements** specified in the course rubric:*
> 1. *Zero-window single-statement atomic decrement under high concurrency (Appendix A.4).*
> 2. *Deadlock-free escrow trading across multi-row transactions with clean rollback guarantees (Appendix A.9.4).*
> 3. *An append-only audit ledger scaling past 6,000+ rows with composite B-tree index benchmarks (Appendix A.5).*"

---

## 🎤 MINUTE 1:00 – 2:00 | Dual-Client Live Synchronization & Enlistment

### What to Do:
1. Show your screen with **two browser windows side-by-side**:
   * **Left Window:** Select Pioneer `Vikryansh (Industrialist)` from TopBar dropdown.
   * **Right Window:** Select Pioneer `Hansika (Pioneer)` from TopBar dropdown.
2. In Left Window: Harvest 1 Timber from *Ancient Timber Grove Alpha* (Node #1).
3. **Point to Right Window:** Show that Hansika's screen instantly updated the node capacity bar from `10/10` to `9/10`, and the bottom ticker logged the commit in real time.

### What to Say:
> *"Here we have two distinct players in the same persistent sector. Notice that when Vikryansh extracts from Node #1, Hansika’s view updates instantaneously via WebSockets.*
> 
> *However, we strictly enforce the **Push-After-Commit Rule**: our WebSocket server never emits state while a transaction is open. It emits only in a post-commit callback after PostgreSQL writes to disk. Furthermore, each update carries an incremental database `version` sequence number. If a stale packet arrives out-of-order due to network latency, our client-side **Monotonic Stale-Packet Discard Filter** automatically drops it, guaranteeing client state never moves backwards in time.*
> 
> *Let's also enlist a new pioneer live:* [Click `+ ENLIST` in TopBar]. *Entering callsign 'Commander Shepard' with role 'Field Engineer'. Notice that this executes an atomic transaction: it verifies callsign uniqueness, creates the player profile, seeds a starter kit (Timber, Iron, Copper, 50 Credits), writes an audit log entry, and broadcasts enlistment to all connected peers."*

---

## 🎤 MINUTE 2:00 – 3:15 | The Showstopper: In-UI Concurrency Lab

### What to Do:
1. In Left Window: Click **`[LAB]`** in TopBar (or press the **`C`** key).
2. Point out the Viva Callout box citing **Appendix A.4**.
3. Select **Target Node:** `#8 Contested Orbital Supply Pod Alpha` (Current Stock: 1 unit) or `#3 Iron Ridge Vein #1`.
4. Select **Burst Size:** `40 REQS`.
5. Click **`[FIRE 40 CONCURRENT REQUESTS]`**.
6. The simulation runs in ~150ms. Point to the scoreboard:
   * **Dispatched:** `40`
   * **200 OK (Won):** `1` (or matching remaining stock)
   * **409 Conflict:** `39`
   * **Final DB Stock:** `0`
   * **Database Integrity:** `ZERO NEGATIVE STOCK DRIFT VERIFIED`

### What to Say:
> *"Examiners often ask: 'How can you prove live that 40 simultaneous users clicking at the exact same millisecond won't drive stock negative?'*
> 
> *We built a dedicated **Live Concurrency Lab** directly into our tactical console. We just fired 40 simultaneous parallel requests directly against a node with only 1 unit of stock.*
> 
> *Notice the result: exactly **1 request succeeded with 200 OK**, and exactly **39 requests were rejected with 409 Conflict**. The final database stock is exactly 0. Zero negative inventory drift.*
> 
> *This is achieved without expensive application-level mutexes through our **single-statement conditional update**:*
> ```sql
> UPDATE resource_nodes
> SET remaining_units = remaining_units - 1, version = version + 1
> WHERE id = $1 AND remaining_units > 0;
> ```
> *PostgreSQL acquires the row lock at the tuple level. The first request decrements stock to 0. When the remaining 39 waiting transactions evaluate the `WHERE remaining_units > 0` clause during `EvalPlanQual`, it evaluates to `FALSE`, affecting exactly 0 rows. In addition, our relational schema enforces `CHECK (remaining_units >= 0)` as an unbreakable engine-level invariant."*

---

## 🎤 MINUTE 3:15 – 4:15 | Automated Machines & Deadlock-Free Escrow Trades

### What to Do:
1. In Left Window: Open Sidebar **Workbench** tab. Craft an `Iron Plate` $\rightarrow$ then craft a `Reinforced Frame` $\rightarrow$ then assemble an **`Automated Miner (MK-1 Drill)`**.
2. Pan map to Node #4 (`Iron Ridge Vein #2`). Click **`[⚙ DEPLOY MK-1 DRILL]`**.
3. Watch the drill appear on the map with mechanical mining animations and storage capacity (`Stored: 1/10`).
4. In Right Window (Hansika): Try to click **`[COLLECT]`** on Vikryansh's drill $\rightarrow$ Show the error: rejected with **`403 Forbidden` (Resource Ownership Guard)**.
5. In Left Window: Switch to **Trading Post** tab. Create an escrow offer: Offer 2 Timber for 2 Copper Ore.
6. In Right Window: Click **`[ACCEPT OFFER]`** $\rightarrow$ Show instant atomic swap.

### What to Say:
> *"Here we transition from manual gathering into industrial automation. Vikryansh crafted and deployed an MK-1 Drill Rig onto Node #4.*
> 
> *Our **Autonomous Machine Engine** runs periodic background ticks every 10 seconds. To prevent duplicate ticks across a multi-server cluster, each drill tick claims its turn using **PostgreSQL Session-Level Advisory Locks (`pg_try_advisory_lock`)**. Crucially, automated drills contend for the exact same database rows as human players using the identical atomic decrement query.*
> 
> *Notice security: when Hansika attempts to collect from Vikryansh's drill, the server rejects her with **403 Forbidden** because machine ownership is validated at the database layer.*
> 
> *Now observe trading: Vikryansh created an offer swapping Timber for Copper. We eliminated deadlocks using an **Escrow Standing-Offer Architecture (Appendix A.9.4 Fix 3)**. When Vikryansh created the offer, his Timber was immediately deducted into escrow. When Hansika accepts, **only Hansika's transaction runs**. Because only one transaction acquires locks during acceptance, a mutual wait deadlock cycle is structurally impossible."*

---

## 🎤 MINUTE 4:15 – 5:00 | Terminal Verification & Database Scaling

### What to Do:
1. Switch to your Terminal in `Outpost/server/`.
2. Run the test command:
   ```bash
   npm run test:all
   ```
3. Point to the terminal output:
   * **Test 1:** 40-Client Concurrency Race $\rightarrow$ `ALL CONCURRENCY ASSERTIONS PASSED`
   * **Test 2:** 100-Iteration Trade Rollback Fault Injection $\rightarrow$ `ALL ROLLBACK ASSERTIONS PASSED (100/100)`
   * **Test 3:** 5,000-Row Scaling Benchmark $\rightarrow$ `6,280+ rows verified`, `EXPLAIN ANALYZE execution time: 0.16 ms`
   * **Test 4:** Machine Concurrency & Authorization $\rightarrow$ `403 Forbidden verified`
4. Show [`postman_collection.json`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/postman_collection.json) and turnkey [`docker-compose.yml`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/docker-compose.yml).

### What to Say:
> *"To ensure rigorous automated verification, we wrote four automated test suites:*
> * *Our trade rollback suite runs **100 consecutive iterations with mid-transaction injected faults**, proving 100% clean rollback with zero balance drift.*
> * *Our scale test proves our append-only audit ledger currently holds **over 6,280 rows**. Using our composite B-tree index on `(player_id, created_at DESC)`, `EXPLAIN ANALYZE` proves our reverse-chronological scan executes in **0.16 milliseconds**.*
> * *Finally, the entire stack—PostgreSQL 16 with automatic schema initialization, Express WebSocket backend, and React Nginx frontend—runs in a single turnkey command via `docker compose up --build`, and includes a complete Postman Collection covering all endpoints.*
> 
> *Thank you Professors. We are ready to answer your technical questions or dive deeper into any line of code."*

---

## 🎯 Emergency Backup Plan (If Something Goes Wrong Live)

| Scenario | Immediate Action | What to Say |
| :--- | :--- | :--- |
| **Node stock is depleted before demo** | Click **`[RESET WORLD]`** in TopBar | *"We have an authoritative sector reset endpoint that restores all 8 nodes, removes drills, and resets inventories via an atomic transaction."* |
| **Browser tab loses socket connection** | TopBar displays `OFFLINE` in red. Refresh page (`F5`). | *"Our client implements automatic socket reconnection with monotonic version resynchronization."* |
| **Examiner asks to see raw database rows** | Open terminal: `docker exec -it outpost_postgres psql -U outpost_user -d outpost_db -c "SELECT * FROM resource_nodes;"` | *"Here is the authoritative PostgreSQL table directly in psql showing remaining units, versions, and CHECK constraints."* |
