# How the Game Works: Complete Gameplay Guide & Rules
## Outpost — Shared-World Resource & Automation Game
**Target Audience:** Evaluators, Players, and Viva Presenters  
**Inspiration:** *Satisfactory*, *Factorio*, and High-Concurrency Distributed Systems

---

## 🌌 1. The Setting & Ultimate Objective

### The Narrative
You are an expedition commander in **Sector 9 — The Frontier Rim**, an uncharted planetary sector rich in raw geological elements: ancient timber forests, dense iron veins, conductive copper ridges, and deep geothermal crystal geodes. 

Multiple independent pioneers (both human players and automated mining machines) operate simultaneously in this persistent sector. All players compete and cooperate to extract finite natural resources, smelt basic materials into intermediate components, deploy automated industrial mining rigs, trade goods on a deadlock-free market, and ultimately assemble the high-tier **Surveyor's Beacon** to declare sector dominance.

### The Victory Condition
The game is won when any pioneer manufactures the **Surveyor's Beacon**:
$$\mathbf{1\times \text{Reinforced Frame}} + \mathbf{2\times \text{Circuit Boards}} + \mathbf{1\times \text{Energy Crystal}} \implies \mathbf{\text{Surveyor's Beacon (Sector 9 Victory!)}}$$
Upon crafting, the server broadcasts an authoritative `VICTORY_ACHIEVED` celebration modal across every connected player's screen with procedural fanfare audio.

---

## 🔄 2. The Core Gameplay Automation Loop

The gameplay transitions across 4 progressive tiers:

```
┌─────────────────────────┐
│ Tier 1: Manual Harvest  │ ──> Click ore nodes on map (Timber, Iron, Copper, Crystals)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Tier 2: Smelting/Craft  │ ──> Assemble Iron Plates, Copper Wires & Circuit Boards
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Tier 3: Industrial Auto │ ──> Build MK-1 Drills & deploy onto veins (Autoharvest every 10s)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Tier 4: Market & Beacon │ ──> Escrow P2P Trades & assemble the endgame Surveyor's Beacon!
└─────────────────────────┘
```

---

## 🗺️ 3. Navigation & Tactical Interface

### The $2500 \times 1400\text{ px}$ Planetary Viewport
* **Pannable Surface:** Click-and-drag with your mouse, or use the **`W`**, **`A`**, **`S`**, **`D`** / **Arrow Keys** to smoothly pan the camera across the planetary landscape.
* **Canvas Zoom:** Use your **mouse wheel** or the HUD zoom buttons (`[ - ]`, `[ 100% ]`, `[ + ]`, `[ FIT ]`) to scale the map between `0.5x` and `1.4x`.
* **Centering Hotkey:** Press **`Spacebar`** at any time to instantly snap your camera dead-center onto the **Crater Basin / Contested Supply Pod**.

### The Tactical Radar Minimap (Bottom-Right)
* Located at the bottom-right corner of the screen.
* Displays a real-time bird's-eye view of all 8 geological landmark nodes.
* Shows your current viewport camera boundaries as a white rectangular reticle.
* **Instant Tactical Pan:** Click anywhere on the radar minimap to immediately pan your main camera to that sector coordinate.

---

## ⛏️ 4. Gathering Resources (Manual Harvesting)

Sector 9 features **8 Authoritative Natural Resource Nodes** mapped to exact terrain features:

| Node ID | Landmark Name | Resource Type | Capacity | Map Location | Terrain Feature |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **#1** | Ancient Timber Grove Alpha | `timber` | 10 | (420, 340) | Western dense canopy forest |
| **#2** | Deep Timber Grove Beta | `timber` | 10 | (540, 760) | Southern forest dirt track |
| **#3** | Iron Ridge Vein #1 | `iron_ore` | 10 | (1060, 440) | Northern rocky mountain crag |
| **#4** | Iron Ridge Vein #2 | `iron_ore` | 10 | (1440, 950) | Central quarry road |
| **#5** | Copper Ridge Deposit Alpha | `copper_ore` | 10 | (1750, 360) | Volcanic mountain slope |
| **#6** | Copper Ridge Deposit Beta | `copper_ore` | 10 | (2060, 620) | Eastern volcanic ridge |
| **#7** | Crystal Geode Prime | `energy_crystal` | 5 | (1950, 1180) | Subterranean amethyst cavern mouth |
| **#8** | Contested Orbital Supply Pod Alpha | `circuit_board` | 1 (Refills) | (1380, 720) | Dead-center inside the impact crater |

### How to Harvest:
1. Hover your cursor over any node ground reticle or compact HUD badge.
2. Click **`[EXTRACT]`** (or click the glowing holographic ground beacon directly).
3. The server executes an atomic decrement query:
   * If stock is available: You hear a laser extraction pulse, `+1 Resource` floating particles rise from the beacon, your inventory increments, and the node capacity decreases.
   * If stock is `0/10` (exhausted): The button displays `DEPLETED`, and competing requests receive `409 Conflict`.
4. Over time, the server's **Sector Replenishment Engine** slowly regenerates depleted nodes, or an administrator can trigger an **Orbital Supply Pod Drop**.

---

## 🛠️ 5. The Tiered Crafting Tree (Workbench)

Open the **Workbench** tab on the right sidebar (or press **`1`**):

```
RAW ORES                    TIER 1 COMPONENTS            TIER 2 & 3 ADVANCED ASSEMBLED ITEMS
─────────                    ─────────────────            ───────────────────────────────────
Iron Ore (x2)   ─────────>   Iron Plate (x1)
                                   │
                                   ├─── (x1 Iron Plate)
                                   │  + (x2 Copper Wire) ───────> Circuit Board (x1)
                                   │                                    │
Copper Ore (x2) ─────────>   Copper Wire (x1)                           │  + (x1 Reinforced Frame)
                                                                        │  + (x2 Iron Plate)
                                                                        │  └─────────> MK-1 DRILL (x1)
                                                                        │
Iron Plate (x2) + Timber (x2) ──────────────────────────────────> Reinforced Frame (x1)
                                                                        │
Reinforced Frame (x1) + Circuit Board (x2) + Energy Crystal (x1) ───────┴────────────> SURVEYOR'S BEACON (🏆)
```

### Complete Recipe Specifications:
1. **Iron Plate (T1):** Requires `2x Iron Ore`. Base structural metal.
2. **Copper Wire (T1):** Requires `2x Copper Ore`. Conductive wiring.
3. **Circuit Board (T2):** Requires `1x Iron Plate + 2x Copper Wire`. Logic module.
4. **Reinforced Frame (T2):** Requires `2x Iron Plate + 2x Timber`. Structural chassis.
5. **Automated Miner (MK-1 Drill) (T3):** Requires `1x Reinforced Frame + 1x Circuit Board + 2x Iron Plate`. Deployable autonomous machine rig.
6. **Surveyor's Beacon (T3 Endgame):** Requires `1x Reinforced Frame + 2x Circuit Board + 1x Energy Crystal`.

* **Validation:** If you lack ingredients, the craft button is disabled. If a request is forced through via Postman, the server validates inventory within an atomic transaction and rejects with `422 Unprocessable Entity`.

---

## ⚙️ 6. Industrial Automation (MK-1 Mining Drills)

Once you craft an **MK-1 Drill**, you can automate resource extraction:
1. Locate a mineable node (**Iron Vein #1, Iron Vein #2, Copper Alpha, or Copper Beta**).
2. The HUD badge will display a golden button: **`[⚙ DEPLOY MK-1 DRILL]`**.
3. Click Deploy:
   * 1x `mk1_drill` is atomically consumed from your inventory.
   * A heavy mechanical deployment graphic locks onto the vein.
   * A status pill appears: `MK-1 Drill #N (You) | Stored: 0/10`.
4. **Autonomous Machine Ticker:**
   * Every 10 seconds, the server executes a background worker tick using PostgreSQL Advisory Locks (`pg_try_advisory_lock`).
   * The drill extracts 1 unit from the node and deposits it into the drill's internal buffer (`buffer_units = buffer_units + 1`).
5. **Collecting Buffer:**
   * As owner, click **`[COLLECT (+N ORE)]`** on the node card or in the **Drills** sidebar tab.
   * All buffered ore transfers atomically into your personal inventory.
6. **Security Access Guard:**
   * If another player attempts to click Collect on your drill, the server rejects them with HTTP **`403 Forbidden`**.

---

## 🤝 7. Deadlock-Free Escrow Trading (Trading Post)

Need copper for circuit boards but only have timber? Use the **Trading Post** (or press **`2`**):

### Creating an Offer (Escrow Lock):
1. Switch to the **Create Offer** tab.
2. Select what you are offering (e.g. `2x Timber`) and what you demand in return (e.g. `2x Copper Ore`).
3. Click **`Post Escrow Offer`**:
   * Your 2 Timber are **immediately and atomically deducted** from your active inventory and held in escrow by the database inside `standing_trades`.
   * Your offer appears on the public market board across all connected players' screens.
4. **Cancelling:** You can click **`[↩ CANCEL]`** at any time to remove your open trade and receive an **instant, atomic refund** of your escrowed items.

### Accepting an Offer (One-Sided Atomic Swap):
1. Any other player with the demanded items browses the market and clicks **`[ACCEPT OFFER]`**.
2. **The Atomic Swap Executes:**
   * The buyer's 2 Copper Ore are debited.
   * The seller's escrowed 2 Timber are deposited to the buyer.
   * The buyer's 2 Copper Ore are deposited to the seller.
   * The trade status flips to `'COMPLETED'`.
3. **Deadlock Proof:** Because the seller's items were already escrowed in step 1, **only the buyer's transaction executes during acceptance**. A mutual wait deadlock cycle is structurally impossible.

---

## 🎛️ 8. Tactical Console Controls & Examiner Features

Located in the TopBar:

* **Dynamic Pioneer Enlistment (`[+ ENLIST]`):**  
  Register new callsigns on the fly (e.g. *Commander Shepard, Dr. Sharma*) and choose a tactical specialization (*Pioneer, Industrialist, Field Engineer, Geologist*). Each new recruit receives an initial starter pack (6 Timber, 4 Iron Ore, 2 Copper Wire, 50 Credits) seeded via an atomic transaction.
* **Pioneer Perspective Dropdown:**  
  Instantly switch perspectives between players (e.g. from *Vikryansh* to *Hansika*) to demonstrate multi-user mechanics on a single machine.
* **Live Concurrency Lab (`[LAB]` or `C` key):**  
  Fire 10, 20, or 40 simultaneous requests against any node live in front of examiners to prove zero negative inventory drift.
* **Sector 9 Telemetry (`[INTEL]` or `T` key):**  
  View global ore depletion percentages, node capacity bars, active drill count, open trades, and the 6,280+ row audit ledger telemetry.
* **Orbital Supply Drop (`[DROP]`):**  
  Dispatches an authoritative high-tier supply drop to Node #8 in Crater Basin.
* **Audio Mute Toggle (`[🔊 / 🔇]` or `M` key):**  
  Toggles synthesized Web Audio procedural sound effects.
* **Authoritative Game Reset (`[RESET WORLD]`):**  
  Executes an atomic sector reinitialization: restores all 8 nodes to 100% capacity, removes active drills, cancels open trades, resets starter inventories, and emits `GAME_RESET` across all connected browser tabs.

---

## ⌨️ 9. Quick Hotkeys Cheatsheet

| Key | Tactical Action |
| :---: | :--- |
| **`W / A / S / D`** or **Arrows** | Pan the planetary terrain map |
| **`Spacebar`** | Snap camera to Crater Basin / Supply Pod |
| **`1`** | Switch right sidebar to Crafting Workbench |
| **`2`** | Switch right sidebar to Escrow Trading Post |
| **`3`** | Switch right sidebar to Deployed Drills Monitor |
| **`M`** | Toggle procedural audio mute |
| **`C`** | Open Live Concurrency Lab |
| **`T`** | Open Sector 9 Telemetry & Metrics |
| **`?`** | Open Keyboard Controls Cheatsheet |
| **`Escape`** | Close any open modal |
