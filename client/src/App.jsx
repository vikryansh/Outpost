import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import MapViewport from './components/MapViewport';
import RadarMinimap from './components/RadarMinimap';
import Sidebar from './components/Sidebar';
import EventTicker from './components/EventTicker';
import { socket } from './services/socket';
import {
  getNodes,
  harvestNode,
  getInventory,
  getRecipes,
  craftItem,
  getTrades,
  createTrade,
  acceptTrade,
  getMachines,
  deployMachine,
  collectMachineBuffer,
  getEvents,
} from './services/api';

export default function App() {
  const [currentPlayer, setCurrentPlayer] = useState(2); // 2 = Hansika (Pioneer), 1 = Vikryansh (Industrialist)
  const [nodes, setNodes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [recipes, setRecipes] = useState({});
  const [trades, setTrades] = useState([]);
  const [machines, setMachines] = useState([]);
  const [events, setEvents] = useState([]);
  const [serverConnected, setServerConnected] = useState(false);
  const [latestVersion, setLatestVersion] = useState(1);
  const [activeAlert, setActiveAlert] = useState(null);
  const [panPosition, setPanPosition] = useState({ x: -400, y: -200 }); // Default centered view

  // Initial Data Fetch
  const loadInitialData = async () => {
    try {
      const [nodesData, invData, recData, tradesData, machinesData, eventsData] = await Promise.all([
        getNodes(),
        getInventory(currentPlayer),
        getRecipes(),
        getTrades(),
        getMachines(),
        getEvents(),
      ]);

      setNodes(nodesData);
      setInventory(invData);
      setRecipes(recData);
      setTrades(tradesData);
      setMachines(machinesData);
      setEvents(eventsData);

      const maxVer = Math.max(...nodesData.map((n) => n.version || 1), 1);
      setLatestVersion(maxVer);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [currentPlayer]);

  // Socket.io Real-Time Synchronization with Monotonic Stale-Packet Discard Filter
  useEffect(() => {
    socket.on('connect', () => {
      setServerConnected(true);
    });

    socket.on('disconnect', () => {
      setServerConnected(false);
    });

    // 1. Authoritative Node State Update (Push-After-Commit)
    socket.on('NODE_STATE_UPDATED', (payload) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === payload.nodeId) {
            // Drop stale out-of-order packets (Monotonicity Rule)
            if (payload.version <= node.version) {
              console.warn('[Socket Filter] Discarded stale packet:', payload);
              return node;
            }
            return {
              ...node,
              remaining_units: payload.remainingUnits,
              version: payload.version,
              updated_at: payload.updatedAt,
            };
          }
          return node;
        })
      );
      setLatestVersion((prev) => Math.max(prev, payload.version));
    });

    // 2. Machine Buffer Updates
    socket.on('MACHINE_BUFFER_UPDATED', (payload) => {
      setMachines((prev) =>
        prev.map((m) => (m.id === payload.machineId ? { ...m, buffer_units: payload.bufferUnits } : m))
      );
    });

    socket.on('MACHINE_DEPLOYED', (newMachine) => {
      setMachines((prev) => [...prev, newMachine]);
    });

    // 3. Trade Updates
    socket.on('NEW_TRADE_OFFER', (newTrade) => {
      setTrades((prev) => [newTrade, ...prev]);
    });

    socket.on('TRADE_COMPLETED', (payload) => {
      setTrades((prev) => prev.filter((t) => t.id !== payload.tradeId));
      getInventory(currentPlayer).then(setInventory);
    });

    // 4. Global Event Ticker Feed
    socket.on('GLOBAL_TICKER_LOG', (log) => {
      setEvents((prev) => [...prev.slice(-49), log]);
      if (log.message.includes('🚨') || log.message.includes('Emergency')) {
        setActiveAlert(log.message);
        setTimeout(() => setActiveAlert(null), 8000);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('NODE_STATE_UPDATED');
      socket.off('MACHINE_BUFFER_UPDATED');
      socket.off('MACHINE_DEPLOYED');
      socket.off('NEW_TRADE_OFFER');
      socket.off('TRADE_COMPLETED');
      socket.off('GLOBAL_TICKER_LOG');
    };
  }, [currentPlayer]);

  // Player Actions
  const handleHarvest = async (nodeId) => {
    const res = await harvestNode(nodeId, currentPlayer);
    if (res.ok && res.success) {
      // Refresh inventory
      const inv = await getInventory(currentPlayer);
      setInventory(inv);
    }
    return res;
  };

  const handleCraft = async (item) => {
    const res = await craftItem(currentPlayer, item);
    if (res.success) {
      const inv = await getInventory(currentPlayer);
      setInventory(inv);
    }
    return res;
  };

  const handleCreateTrade = async (tradeData) => {
    const res = await createTrade(tradeData);
    if (res.success) {
      const inv = await getInventory(currentPlayer);
      setInventory(inv);
      const trs = await getTrades();
      setTrades(trs);
    }
    return res;
  };

  const handleAcceptTrade = async (tradeId) => {
    const res = await acceptTrade(tradeId, currentPlayer);
    if (res.success) {
      const inv = await getInventory(currentPlayer);
      setInventory(inv);
      const trs = await getTrades();
      setTrades(trs);
    }
    return res;
  };

  const handleDeployMachine = async (nodeId, machineType) => {
    const res = await deployMachine(currentPlayer, nodeId, machineType);
    if (res.success) {
      const inv = await getInventory(currentPlayer);
      setInventory(inv);
      const macs = await getMachines();
      setMachines(macs);
    }
    return res;
  };

  const handleCollectMachine = async (machineId) => {
    const res = await collectMachineBuffer(machineId, currentPlayer);
    if (res.success) {
      const inv = await getInventory(currentPlayer);
      setInventory(inv);
      const macs = await getMachines();
      setMachines(macs);
    }
    return res;
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-frontier-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. Top Bar */}
      <TopBar
        currentPlayer={currentPlayer}
        onSwitchPlayer={setCurrentPlayer}
        serverStatus={serverConnected}
        latestVersion={latestVersion}
        activeAlert={activeAlert}
      />

      {/* 2. Main Middle Area: Pannable Terrain Map + Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        <MapViewport
          nodes={nodes}
          machines={machines}
          onHarvest={handleHarvest}
          onDeployMachine={handleDeployMachine}
          panPosition={panPosition}
          setPanPosition={setPanPosition}
        />

        {/* Tactical Radar Minimap */}
        <RadarMinimap
          nodes={nodes}
          panPosition={panPosition}
          onPanTo={setPanPosition}
          activePing={null}
        />

        {/* Right Sidebar (Inventory, Workbench, Trading Post, Machine buffer) */}
        <Sidebar
          inventory={inventory}
          recipes={recipes}
          trades={trades}
          machines={machines}
          currentPlayer={currentPlayer}
          onCraft={handleCraft}
          onCreateTrade={handleCreateTrade}
          onAcceptTrade={handleAcceptTrade}
          onCollectMachine={handleCollectMachine}
        />
      </div>

      {/* 3. Bottom Ticker */}
      <EventTicker events={events} />
    </div>
  );
}
