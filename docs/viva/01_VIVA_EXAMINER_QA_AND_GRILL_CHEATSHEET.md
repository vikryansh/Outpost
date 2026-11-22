# Viva Examiner Q&A & Defense Cheatsheet
## Outpost — Shared-World Resource & Automation Game
**Course:** Full Stack Development (B.Tech CSE)  
**Authors:** Hansika Malik & Vikryansh Singh  
**Focus:** Concurrency, Multi-Row Transactions, PostgreSQL 16 Invariants, and Real-Time Systems

---

## 📌 How to Use This Document
In the viva, examiners will intentionally test whether you **deeply understand the database mechanics** or whether you merely built a superficial UI. The course guide specifically warns that naive seat-booking tutorials contain race conditions. This cheatsheet equips you with **rock-solid, technically authoritative answers** using exact database terminology.

---

# SECTION 1: The Core Concurrency & Database Questions (The 45-Mark Zone)

### Q1: "Why didn't you just use `SELECT ... FOR UPDATE`? Why single-statement conditional update?"
> **Answer:**  
> "`SELECT ... FOR UPDATE` acquires an exclusive row lock and holds it open while the application layer processes business logic and issues a subsequent `UPDATE`. This creates a latency window (application-database roundtrip time) where other concurrent threads are blocked waiting for the lock, causing lock contention and high latency under burst traffic.  
> Instead, we implemented **Appendix A.4: Zero-Window Single-Statement Conditional Atomic Update**:
> ```sql
> UPDATE resource_nodes
> SET remaining_units = remaining_units - 1, version = version + 1, updated_at = NOW()
> WHERE id = $1 AND remaining_units > 0
> RETURNING remaining_units, version;
> ```
> This executes entirely inside PostgreSQL's engine in a single atomic step. The row lock is acquired and released instantaneously at the database page level. If stock is available, PostgreSQL decrements and returns the row. If exhausted, it affects 0 rows, immediately allowing our Node backend to return `409 Conflict`. There is zero application lock window."

---

### Q2: "What happens inside PostgreSQL if 40 requests hit that single-statement UPDATE at the exact same microsecond?"
> **Answer:**  
> "PostgreSQL uses row-level locking managed by its tuple header lock bits (`xmax`). When 40 concurrent transactions attempt to update the exact same tuple in `resource_nodes`:
> 1. The first transaction to arrive obtains an exclusive row lock on the target tuple.
> 2. The other 39 transactions enter a wait queue on that row's lock.
> 3. Under the default **Read Committed** isolation level, when Transaction #1 commits, Transaction #2 wakes up and evaluates PostgreSQL's `EvalPlanQual` (EPQ) re-check: it reads the *newly committed version* of the tuple and re-evaluates the `WHERE` clause (`remaining_units > 0`).
> 4. If `remaining_units` is still $> 0$, Transaction #2 proceeds and decrements.
> 5. As soon as a transaction reduces `remaining_units` to 0, all subsequent waiting transactions re-evaluate `remaining_units > 0`, find it evaluates to `FALSE`, and update **0 rows**.
> 6. This is mathematically deterministic: exactly $N$ requests succeed (where $N = \text{initial stock}$), and all remaining requests affect 0 rows with zero race window."

---

### Q3: "What transaction isolation level does Outpost run on? Why not Serializable?"
> **Answer:**  
> "We run on PostgreSQL's default **Read Committed** isolation level.  
> We deliberately chose not to use **Serializable** because:
> 1. Serializable uses Serializable Snapshot Isolation (SSI), which detects read-write conflicts (rw-antidependencies) and aborts transactions with `40001 serialization_failure`. This requires the application to implement complex retry loops and incurs significant overhead.
> 2. Because our critical queries are designed as **single-statement atomic updates** and **deterministic primary-key ordered multi-row transactions**, we achieve absolute serial consistency and zero race conditions under Read Committed *without* serialization abort overhead."

---

### Q4: "Why do you have `CHECK (remaining_units >= 0)` in your schema if your application already checks `remaining_units > 0`?"
> **Answer:**  
> "This follows the principle of **Defense-in-Depth**.  
> Application-level validation can be bypassed by software bugs, direct database connections, unhandled exceptions, or administrative scripts. A relational `CHECK` constraint is an immutable database engine invariant. Even if an attacker completely bypasses our Express API using raw SQL injection or direct `psql` access, PostgreSQL's transaction manager will reject any decrement below zero with an immediate constraint violation error and force an automatic transaction `ROLLBACK`. The database is the ultimate authority."

---

### Q5: "Why did you choose PostgreSQL over MongoDB or Firebase?"
> **Answer:**  
> "Our application's core requirement is **shared-state concurrency under contention and multi-row transactional integrity**.
> 1. MongoDB and Firebase are NoSQL document stores designed for eventual consistency, horizontal sharding, and unconstrained hierarchical documents. They lack robust relational `CHECK` constraints, cross-document deterministic lock hierarchies, and native advisory locks.
> 2. In MongoDB, two users attempting multi-document balance swaps require multi-document transactions with WiredTiger snapshot locks, which frequently abort under write conflicts.
> 3. PostgreSQL 16 provides strict ACID guarantees, granular row-level locks, table-level advisory locks (`pg_try_advisory_lock`), relational foreign keys with cascading integrity, and deterministic execution via B-tree indexed execution plans."

---

# SECTION 2: Multi-Row Transactions & Deadlock Elimination

### Q6: "How does your trading system eliminate deadlocks? Explain your solution."
> **Answer:**  
> "Traditional peer-to-peer exchanges suffer from Dijkstra's deadlock cycle:
> * User A wants to swap Timber for Copper with User B.
> * Transaction 1 (User A) locks User A's timber, then attempts to lock User B's copper.
> * Simultaneously, Transaction 2 (User B) locks User B's copper, then attempts to lock User A's timber.
> * This creates a classic circular wait: Transaction 1 waits for B, while Transaction 2 waits for A.
> 
> We architecturally eliminated this using **Appendix A.9.4 Fix 3: Standing-Offer Escrow Architecture**:
> 1. **Offer Creation:** Player A creates an offer. Their offered items are atomically escrowed (deducted from Player A's active inventory into the `standing_trades` table).
> 2. **One-Sided Acceptance:** When Player B accepts the trade, **only one transaction executes**. Player B's transaction verifies their inventory, transfers the escrowed items to Player B, and deposits Player B's payment into Player A's account.
> 3. **Mathematical Guarantee:** Because only one transaction ever acquires locks during acceptance, a mutual wait cycle is **structurally impossible**.
> 4. Furthermore, within that single transaction, multiple item rows are always locked in deterministic primary key order (`ORDER BY item_type ASC`) to eliminate intra-transaction lock contention."

---

### Q7: "What happens if the Node backend crashes or power cuts halfway through accepting a trade?"
> **Answer:**  
> "PostgreSQL guarantees **ACID Atomicity and Durability**:
> * All operations (deducting buyer payment, depositing escrowed items, marking trade `COMPLETED`, writing audit log) are wrapped inside a single `BEGIN ... COMMIT` block.
> * PostgreSQL uses a Write-Ahead Log (WAL). Changes are written to the WAL before being applied to the actual data pages.
> * If the server crashes mid-transaction before the final `COMMIT` statement is acknowledged, the transaction is uncommitted.
> * Upon server restart, PostgreSQL's crash recovery process scans the WAL, identifies uncommitted transactions, and executes an automatic rollback. Neither the seller nor the buyer loses a single item; zero orphan items exist."

---

### Q8: "How does your `trade-rollback.js` test prove this?"
> **Answer:**  
> "In [`tests/trade-rollback.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/tests/trade-rollback.js), we run **100 consecutive iterations** where we intentionally inject an unhandled mid-transaction exception after escrow deduction but before payment deposit.  
> The test verifies that in 100 out of 100 iterations:
> 1. The exception is caught.
> 2. The client executes `ROLLBACK`.
> 3. The seller's timber balance drift is exactly `0`.
> 4. The buyer's copper balance drift is exactly `0`.
> 5. No orphan rows remain in the trade ledger."

---

# SECTION 3: Autonomous Machine Engine & Advisory Locks

### Q9: "How do your automated MK-1 Drills work? What happens if you run 3 server instances behind a load balancer?"
> **Answer:**  
> "Deployable MK-1 Drills harvest ores autonomously every 10 seconds. In a scaled multi-instance deployment (e.g. 3 Node.js containers), multiple instances must not process the same drill tick simultaneously, which would cause double-harvesting.  
> We solved this using **PostgreSQL Session-Level Advisory Locks (Appendix A.6 & A.8)**:
> ```sql
> SELECT pg_try_advisory_lock($1);
> ```
> 1. Before an automated tick runs, the worker attempts to acquire an advisory lock keyed to the machine ID (`machine.id`).
> 2. `pg_try_advisory_lock` is non-blocking: if Instance #1 claims the lock, it receives `true` and proceeds. If Instance #2 attempts to claim it at the same time, it receives `false` and immediately skips execution without blocking.
> 3. Unlike row locks, advisory locks do not lock table data or interfere with human players harvesting the same node.
> 4. Once the tick transaction commits and updates the machine buffer, the lock is released with `pg_advisory_unlock($1)`."

---

# SECTION 4: WebSockets & Distributed Real-Time Observers

### Q10: "What is the Push-After-Commit rule? Why is it a fatal mistake to emit WebSocket messages inside the transaction?"
> **Answer:**  
> "If you emit a WebSocket event *inside* the transaction block (before `COMMIT`):
> 1. **Dirty Read Phenomenon:** Connected client browsers receive the notification that stock decremented before PostgreSQL commits the data.
> 2. **Rollback Desynchronization:** If the transaction subsequently fails (e.g., due to a constraint violation or connection reset) and executes `ROLLBACK`, the clients will have already displayed phantom state that was never committed to the database.
> 3. **Race Window:** Another player who receives the socket alert might immediately send a harvest request, but their query might arrive at the database before the original transaction finishes committing.
> 
> Under our **Push-After-Commit architecture**, WebSocket emissions are strictly bound to post-commit event handlers. The socket message fires **only after** PostgreSQL returns `COMMIT` acknowledgment."

---

### Q11: "What is your Monotonic Stale-Packet Discard Filter? Why is it necessary if WebSockets use TCP?"
> **Answer:**  
> "While TCP guarantees ordered packet delivery over a *single* socket connection, it does not prevent out-of-order state updates when multiple concurrent operations complete on the server with varying execution latencies (e.g., Request A starts before Request B, but Request B commits and emits first).  
> To prevent a client observer from seeing state travel backwards in time, every node update carries an incremental monotonically increasing `version` sequence number.  
> In [`client/src/App.jsx`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/client/src/App.jsx#L83-L98):
> ```javascript
> if (payload.version <= node.version) {
>   console.warn('[Socket Filter] Discarded stale packet:', payload);
>   return node; // Discard stale update
> }
> ```
> If a delayed packet arrives with an older version, the client silently discards it, guaranteeing strict monotonic state progression."

---

# SECTION 5: 5,000-Row Scaling Benchmark & EXPLAIN ANALYZE

### Q12: "Explain your `EXPLAIN ANALYZE` output. What do the numbers actually mean?"
> **Answer:**  
> "In [`tests/seed-scale.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/tests/seed-scale.js), we tested our append-only audit ledger (`event_logs`) with **6,280+ rows**.
> When running:
> ```sql
> EXPLAIN ANALYZE 
> SELECT * FROM event_logs WHERE player_id = 1 ORDER BY created_at DESC LIMIT 50;
> ```
> PostgreSQL output:
> ```text
> Limit (cost=0.28..18.58 rows=50 width=97) (actual time=0.052..0.089 rows=50 loops=1)
>   -> Index Scan using idx_event_logs_player_created on event_logs (cost=0.28..843.56 ...)
> Planning Time: 0.988 ms
> Execution Time: 0.181 ms
> ```
> **Interpretation:**
> * `cost=0.28..18.58`: The estimated startup cost to fetch the first tuple (0.28 page I/O units) and the total cost to return 50 tuples (18.58 units).
> * `actual time=0.052..0.089`: The exact wall-clock time in milliseconds measured during actual execution.
> * `loops=1`: The index scan was executed once.
> * `Index Scan using idx_event_logs_player_created`: PostgreSQL used our composite B-tree index rather than a Sequential Table Scan (`Seq Scan`).
> * `Execution Time: 0.181 ms`: The query returned in less than **one-fifth of a millisecond** even across thousands of audit rows."

---

### Q13: "Why did you create a composite index on `(player_id, created_at DESC)` instead of two separate indexes?"
> **Answer:**  
> "If we created two independent indexes (one on `player_id` and one on `created_at`), PostgreSQL would have to perform a **Bitmap Index Scan**, loading bitmap pointers from both index trees, performing a bitwise `AND` operation, and then sorting the results in memory (`Sort Key: created_at DESC`).  
> A composite B-tree index on `(player_id, created_at DESC)` stores entries pre-sorted primarily by `player_id` and secondarily by `created_at` in reverse chronological order. This allows PostgreSQL to perform a single direct index traverse to the exact player's slice and immediately read the latest 50 entries off the leaf pages with **zero sort overhead**."

---

# SECTION 6: Authentication & Security Strategy

### Q14: "Why doesn't Outpost use traditional username/password authentication with JWT?"
> **Answer:**  
> "Outpost is an industrial tactical automation console. For gameplay and multiplayer demonstration purposes, evaluators and players can switch between pioneer perspectives (e.g., *Vikryansh (Industrialist)* and *Hansika (Pioneer)*) or enlist new pioneers on the fly without session cookie lock-in.  
> However, **authorization is strictly enforced at the resource layer**:
> 1. Non-owners cannot collect automated drill buffers: [`server.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/server.js#L415) validates `machine.player_id === playerId` and returns `403 Forbidden` if a non-owner attempts collection.
> 2. Non-creators cannot cancel open trades.
> 3. Inventory mutations require atomic ownership verification before debiting."

---

# SECTION 7: Viva "Trap" Questions & Confidence Killers

### Q15: "Can't a user bypass your React UI by sending requests directly through Postman or curl?"
> **Answer:**  
> "Yes, and our backend is specifically engineered to handle that.  
> The student guide explicitly states: *'Refuse invalid requests even when they bypass your interface.'*  
> If an attacker fires direct HTTP requests with deficient resources, invalid roles, or negative quantities, our Express controllers execute server-side validation:
> * Deficient ingredients reject with `422 Unprocessable Entity`.
> * Exhausted nodes reject with `409 Conflict`.
> * Negative balances are blocked by PostgreSQL relational `CHECK` constraints.
> The UI is purely a client presentation layer; the backend Express API and PostgreSQL database are 100% self-defending."

---

### Q16: "Did you write all this code yourself, or did an AI write it?"
> **Answer (Say this with absolute confidence):**  
> *"The course guide explicitly permits AI assistants provided students can explain every line of code submitted. We designed the architecture, relational schema, and concurrency strategy ourselves following Appendix A.4 and A.9.4 of the faculty guidelines. We can explain every single line of SQL, transaction demarcation, and index scan across the entire repository."*
