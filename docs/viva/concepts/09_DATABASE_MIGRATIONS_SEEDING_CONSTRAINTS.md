# Concept 09: Database Migrations, Seeding & Relational Invariants
## Full Stack Development Course Revision Guide

---

### 1. What It Is in Theory (Course Definition)
* **Data Definition Language (DDL):** SQL commands (`CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`) that define the structural schema and relational constraints.
* **Data Manipulation Language (DML):** SQL commands (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) that query and mutate data tuples.
* **Database Seeding:** Automated scripts that insert baseline reference data (initial players, geographic resource nodes, recipe trees) into an empty database to ensure reproducible test and deployment environments.
* **Relational Invariants:** Rules defined at the database engine level that physically prevent invalid data from ever being written.

---

### 2. Constraints & Seeding Used in Outpost

#### 1. Relational Invariants in [`server/src/db/schema.sql`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/db/schema.sql)
```sql
-- 1. Check Constraint protecting stock from negative drift:
CONSTRAINT chk_remaining_units_non_negative CHECK (remaining_units >= 0)

-- 2. Check Constraint protecting inventory balances:
CONSTRAINT chk_quantity_non_negative CHECK (quantity >= 0)

-- 3. Composite Unique Constraint preventing duplicate inventory records:
CONSTRAINT uq_player_item UNIQUE (player_id, item_type)

-- 4. Foreign Key with Cascading Deletions:
player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE
```

#### 2. Automated Baseline Seeding in [`server/src/db/initDb.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/src/db/initDb.js)
Seeds the 8 landmark geological resource nodes with exact spatial coordinates $(X, Y)$ and sector grids:
* Node 1: *Ancient Timber Grove Alpha* at (420, 340) in Sector A-1.
* Node 2: *Deep Timber Grove Beta* at (540, 760) in Sector B-2.
* Node 3: *Iron Ridge Vein #1* at (1060, 440) in Sector A-3.
* Node 4: *Iron Ridge Vein #2* at (1440, 950) in Sector C-3.
* Node 5: *Copper Ridge Deposit Alpha* at (1750, 360) in Sector A-4.
* Node 6: *Copper Ridge Deposit Beta* at (2060, 620) in Sector B-5.
* Node 7: *Subterranean Crystal Geode Prime* at (1950, 1180) in Sector D-4.
* Node 8: *Contested Orbital Supply Pod Alpha* at (1380, 720) in Sector B-3 (Crater Basin).

#### 3. Scale Volume Generator in [`server/tests/seed-scale.js`](file:///home/vikryansh/Workspace/projects/fsd/Outpost/server/tests/seed-scale.js)
Seeds over **6,000+ operational records** into `event_logs` to enable realistic B-tree indexing benchmarks (`EXPLAIN ANALYZE`).

---

### 3. Common Viva Questions & Model Answers

#### Q: "What is the difference between `ON DELETE CASCADE` and `ON DELETE SET NULL`?"
> **Answer:**  
> "* **`ON DELETE CASCADE`:** When a parent record is deleted (e.g., a player is removed from `players`), PostgreSQL automatically and atomically deletes all child records referencing that player ID (e.g., all rows in `inventories`, `machines`, and `standing_trades`). This prevents orphaned child rows.
> * **`ON DELETE SET NULL`:** When the parent record is deleted, the foreign key column in the child table is set to `NULL` rather than deleting the row. We use this on `event_logs.player_id` so that our historical audit trail is preserved permanently even if a player account is deleted."

#### Q: "Why is a `CHECK` constraint superior to a trigger for enforcing non-negative inventory?"
> **Answer:**  
> "`CHECK` constraints are declarative relational invariants compiled directly into PostgreSQL's heap tuple storage engine. They evaluate with near-zero overhead during row validation. Triggers, by contrast, require compiling procedural PL/pgSQL code, executing context switches, and maintaining execution state for every modified row, introducing significant performance penalties under high concurrency."
