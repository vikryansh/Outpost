# Outpost: Frontend UI & Tactical Viewport Specification

## Overview
This specification details the component hierarchy, visual themes, user interactions, and WebSocket state bindings for the **Outpost** client dashboard, built with **React (Vite)**, **Tailwind CSS**, and **Socket.io-client**.

Reference Visual Mockup: `docs/outpost_ui_concept.png`

---

## 1. Visual Theme & Layout

* **Theme:** Sci-fi Frontier Tactical Command Console (Dark Mode).
* **Color System:**
  * Backgrounds: `bg-slate-950` (viewport base), `bg-slate-900/90` (panels), `bg-slate-800/80` (cards).
  * Accents: `border-cyan-500/30` (console frames), `text-emerald-400` (success/active status), `text-amber-400` (warnings/contested), `text-red-400` (exhausted/failed).
  * Font: Monospace (`font-mono`) for metrics, coordinates, timers, and transaction versions.

---

## 2. Component Hierarchy

```
<App>
  ├── <TopBar>
  │     ├── <PlayerIdentityBadge> (Name, Specialization, Outpost Tier)
  │     ├── <EmergencyAlertBanner> (Orbital drop countdown, pulse animation)
  │     └── <NetworkSyncBadge> (Server Version v142, Ping latency)
  │
  ├── <MainContainer> (Grid layout: Map Viewport on left, Sidebar on right)
  │     ├── <ViewportCanvas> (Pannable 2500x1800px terrain)
  │     │     ├── <TerrainLayer> (Biome graphics, sector grid lines A1..E5)
  │     │     ├── <ResourceNodesLayer> (Timber, Mines, Crystals)
  │     │     ├── <MachinesLayer> (MK-1 Drills with live storage meters)
  │     │     ├── <OrbitalDropLayer> (Landed supply pods with beacon rings)
  │     │     └── <MinimapRadar> (Fixed bottom-right corner with coordinate ping)
  │     │
  │     └── <SidebarPanel> (Right column)
  │           ├── <InventoryDock> (Player item slots with live quantities)
  │           ├── <CraftingWorkbench> (Recipe cards with atomic craft buttons)
  │           └── <TradingPostTab> (Standing market offers & escrow creation)
  │
  └── <BottomTerminalTicker> (Real-time auto-scrolling WebSocket event feed)
```

---

## 3. Interactive Subsystems

### A. The Pannable Map Viewport (`<ViewportCanvas>`)
* **Local Pan Mechanics:** Implemented via standard mouse drag (`onMouseDown` + `mousemove`) or CSS `transform: translate(x, y)`. The server is never sent camera coordinates, completely eliminating spatial netcode lag.
* **Node Cards:** Rendered at fixed world coordinates:
  * Each card shows: Resource Icon, Current Stock Bar (`4/10 Units`), Monotonic Version (`v24`), and the **[HARVEST]** action button.
  * **Optimistic / Reactive Response:** On click, button triggers `POST /api/nodes/:id/harvest`.
    * If 200 OK: Emerald flash + float badge `+1 Ore`.
    * If 409 Conflict: Card shake + amber warning `Node exhausted by another player`.

### B. The Radar Minimap (`<MinimapRadar>`)
* Fixed in the bottom-right viewport corner.
* Displays a 1:10 scaled down visual of the entire sector.
* Renders a white rectangle representing the user's current camera viewport.
* **Coordinate Pings:** When an event occurs (e.g. `SUPPLY_DROP_LANDED` at `B-2`), a glowing red ripple flashes at `B-2`. Clicking that minimap quadrant immediately pans the camera to center on `B-2`.

### C. Deployable MK-1 Automated Drills (`<MachinesLayer>`)
* When crafted, players click **[DEPLOY DRILL]** on an available node.
* Renders an animated mechanical drill graphic on the node with an overlay badge:
  * `Stored: 6/10 Ore`
  * Action button: **[COLLECT BUFFER]** (atomically transfers stored ores into player inventory).

### D. The Standing-Offer Trading Post (`<TradingPostTab>`)
* **Create Offer:** Select offered item (e.g., 2 Circuit Boards) and demanded item (e.g., 1 Energy Crystal). Clicking **[POST OFFER]** moves items into server-side escrow.
* **Market List:** Displays all active standing offers from other players.
* **One-Click Accept:** Clicking **[ACCEPT]** executes the single-sided atomic swap.

---

## 4. WebSocket Event Bindings (Socket.io)

| Server Event | Payload | Client Action |
| :--- | :--- | :--- |
| `NODE_STATE_UPDATED` | `{ nodeId, remainingUnits, version }` | If `version > localNodeVersion`: update capacity bar and version tag. Else discard stale update. |
| `MACHINE_BUFFER_UPDATED` | `{ machineId, storedUnits, version }` | Update stored units badge on drill card. |
| `SUPPLY_DROP_LANDED` | `{ dropId, gridCoord, contents }` | Trigger siren sound, flash alert banner, and trigger red ping on Minimap. |
| `GLOBAL_TICKER_LOG` | `{ message, timestamp, type }` | Append new line to bottom terminal ticker. |
| `MATCH_WON` | `{ winnerId, winnerName, victoryType }` | Freeze gameplay; display full-screen Sector Claimed victory/defeat overlay. |
