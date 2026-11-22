-- ==============================================================================
-- Outpost: PostgreSQL Authoritative Schema
-- Features: ACID Concurrency, CHECK Constraints, Exclusion Constraints, 
--           Append-Only Event Ledger, and Composite B-Tree Indexing.
-- ==============================================================================

-- Enable btree_gist extension for range exclusion constraints (Appendix A.2)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 1. Players Table
CREATE TABLE IF NOT EXISTS players (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'Industrialist',
    outpost_tier INT NOT NULL DEFAULT 1,
    credits INT NOT NULL DEFAULT 0 CHECK (credits >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Resource Nodes (Contested Harvest Targets)
-- Concurrency Mechanism: Conditional Atomic Update (Appendix A.4)
CREATE TABLE IF NOT EXISTS resource_nodes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL, -- 'timber', 'iron_ore', 'copper_ore', 'energy_crystal'
    max_capacity INT NOT NULL DEFAULT 10,
    remaining_units INT NOT NULL DEFAULT 10,
    version INT NOT NULL DEFAULT 1,
    coord_x INT NOT NULL,
    coord_y INT NOT NULL,
    grid_sector VARCHAR(10) NOT NULL, -- e.g. 'A1', 'B2', 'C4'
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'DEPLETED', 'LOCKED'
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- The ultimate database-level defense against race condition overselling:
    CONSTRAINT chk_remaining_units_non_negative CHECK (remaining_units >= 0)
);

-- 3. Player Inventories
CREATE TABLE IF NOT EXISTS inventories (
    id SERIAL PRIMARY KEY,
    player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_quantity_non_negative CHECK (quantity >= 0),
    CONSTRAINT uq_player_item UNIQUE (player_id, item_type)
);

-- 4. Deployable Automated Machines (MK-1 Drills)
-- Concurrency Mechanism: Background worker with PostgreSQL Advisory Locks (Appendix A.6 & A.8)
CREATE TABLE IF NOT EXISTS machines (
    id SERIAL PRIMARY KEY,
    player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    node_id INT NOT NULL REFERENCES resource_nodes(id) ON DELETE CASCADE,
    machine_type VARCHAR(50) NOT NULL DEFAULT 'MK1_DRILL',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'HALTED', 'UNPOWERED'
    buffer_units INT NOT NULL DEFAULT 0,
    buffer_capacity INT NOT NULL DEFAULT 10,
    last_tick_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_buffer_units_non_negative CHECK (buffer_units >= 0)
);

-- 5. Standing-Offer Trades (Deadlock Elimination per Appendix A.9.4 Fix 3)
CREATE TABLE IF NOT EXISTS standing_trades (
    id SERIAL PRIMARY KEY,
    creator_player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    offered_item VARCHAR(50) NOT NULL,
    offered_quantity INT NOT NULL CHECK (offered_quantity > 0),
    demanded_item VARCHAR(50) NOT NULL,
    demanded_quantity INT NOT NULL CHECK (demanded_quantity > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'COMPLETED', 'CANCELLED')),
    completed_by_player_id INT REFERENCES players(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 6. Node Claims (Exclusive Mining Rights per Appendix A.2)
-- Exclusion constraint prevents overlapping time-range leases on the same node
CREATE TABLE IF NOT EXISTS node_claims (
    id SERIAL PRIMARY KEY,
    node_id INT NOT NULL REFERENCES resource_nodes(id) ON DELETE CASCADE,
    player_id INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    claim_duration TSRANGE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT no_overlapping_node_claims EXCLUDE USING gist (node_id WITH =, claim_duration WITH &&)
);

-- 7. Append-Only Event Ledger (5,000+ Row Natural Volume Generator & Audit)
CREATE TABLE IF NOT EXISTS event_logs (
    id BIGSERIAL PRIMARY KEY,
    player_id INT REFERENCES players(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL, -- 'HARVEST', 'CRAFT', 'TRADE_CREATE', 'TRADE_ACCEPT', 'MACHINE_TICK'
    node_id INT REFERENCES resource_nodes(id) ON DELETE SET NULL,
    details JSONB NOT NULL DEFAULT '{}',
    version INT,
    prev_hash VARCHAR(64),
    current_hash VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Composite B-Tree Index for the 5,000-Row Scaling Benchmark:
CREATE INDEX IF NOT EXISTS idx_event_logs_player_created ON event_logs(player_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_logs_type ON event_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_resource_nodes_status ON resource_nodes(status);
CREATE INDEX IF NOT EXISTS idx_standing_trades_status ON standing_trades(status);

-- ==============================================================================
-- Initial Seed Data
-- ==============================================================================

-- Seed Default Test Players
INSERT INTO players (id, username, role, outpost_tier, credits)
VALUES 
    (1, 'Vikryansh', 'Industrialist', 2, 50),
    (2, 'Hansika', 'Pioneer', 1, 50),
    (3, 'TestObserver', 'Observer', 1, 0)
ON CONFLICT (id) DO NOTHING;

-- Seed Diverse Planetary Resource Nodes (Coordinates match the 2500x1400 viewport)
INSERT INTO resource_nodes (id, name, resource_type, max_capacity, remaining_units, version, coord_x, coord_y, grid_sector, status)
VALUES
    (1, 'Ancient Timber Grove Alpha', 'timber', 10, 10, 1, 420, 340, 'A-1', 'ACTIVE'),
    (2, 'Deep Timber Grove Beta', 'timber', 10, 10, 1, 540, 760, 'A-2', 'ACTIVE'),
    (3, 'Iron Ridge Vein #1', 'iron_ore', 10, 10, 1, 1060, 440, 'B-2', 'ACTIVE'),
    (4, 'Iron Ridge Vein #2', 'iron_ore', 10, 10, 1, 1440, 950, 'B-3', 'ACTIVE'),
    (5, 'Copper Ridge Deposit Alpha', 'copper_ore', 10, 10, 1, 1750, 360, 'C-1', 'ACTIVE'),
    (6, 'Copper Ridge Deposit Beta', 'copper_ore', 10, 10, 1, 2060, 620, 'C-3', 'ACTIVE'),
    (7, 'Subterranean Crystal Geode Prime', 'energy_crystal', 5, 5, 1, 1950, 1180, 'C-4', 'ACTIVE'),
    (8, 'Contested Orbital Supply Pod Alpha', 'circuit_board', 1, 1, 1, 1380, 720, 'B-2', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    coord_x = EXCLUDED.coord_x,
    coord_y = EXCLUDED.coord_y,
    grid_sector = EXCLUDED.grid_sector;

-- Seed Starting Inventories for Testing
INSERT INTO inventories (player_id, item_type, quantity)
VALUES
    (1, 'timber', 6),
    (1, 'iron_ore', 4),
    (1, 'copper_wire', 2),
    (2, 'timber', 8),
    (2, 'copper_ore', 6),
    (2, 'iron_plate', 2)
ON CONFLICT (player_id, item_type) DO UPDATE SET quantity = EXCLUDED.quantity;

-- Reset sequence IDs
SELECT setval('players_id_seq', (SELECT MAX(id) FROM players));
SELECT setval('resource_nodes_id_seq', (SELECT MAX(id) FROM resource_nodes));
