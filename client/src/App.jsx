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
  cancelTrade,
  getMachines,
  deployMachine,
  collectMachineBuffer,
  getEvents,
  getPlayers,
  registerPlayer,
  resetGameWorld,
} from './services/api';

export default function App() {
  const [currentPlayer, setCurrentPlayer] = useState(2); // 2 = Hansika (Pioneer), 1 = Vikryansh (Industrialist)
  const [players, setPlayers] = useState([
    { id: 2, username: 'Hansika', role: 'Pioneer' },
    { id: 1, username: 'Vikryansh', role: 'Industrialist' },
  ]);
  const [nodes, setNodes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [recipes, setRecipes] = useState({});
  const [trades, setTrades] = useState([]);
  const [machines, setMachines] = useState([]);
  const [events, setEvents] = useState([]);
  const [serverConnected, setServerConnected] = useState(false);
  const [latestVersion, setLatestVersion] = useState(1);
  const [activeAlert, setActiveAlert] = useState(null);
  const [victoryState, setVictoryState] = useState(null);
  const [panPosition, setPanPosition] = useState({ x: -400, y: -200 }); // Default centered view

  // Initial Data Fetch
  const loadInitialData = async () => {
    try {
      const [nodesData, invData, recData, tradesData, machinesData, eventsData, playersData] = await Promise.all([
        getNodes(),
        getInventory(currentPlayer),
        getRecipes(),
        getTrades(),
        getMachines(),
        getEvents(),
        getPlayers(),
      ]);

      setNodes(nodesData);
      setInventory(invData);
      setRecipes(recData);
      setTrades(tradesData);
      setMachines(machinesData);
      setEvents(eventsData);
      if (Array.isArray(playersData) && playersData.length > 0) {
        setPlayers(playersData);
      }

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

    socket.on('TRADE_CANCELLED', (payload) => {
      setTrades((prev) => prev.filter((t) => t.id !== payload.tradeId));
      getInventory(currentPlayer).then(setInventory);
    });

    // 4. Victory Condition Broadcast
    socket.on('VICTORY_ACHIEVED', (payload) => {
      setVictoryState(payload);
    });

    // 5. Dynamic Player Enlistment Broadcast
    socket.on('PLAYER_REGISTERED', (newPlayer) => {
      setPlayers((prev) => {
        if (prev.some((p) => p.id === newPlayer.id)) return prev;
        return [...prev, newPlayer];
      });
    });

    // 6. Sector World Reset Broadcast
    socket.on('GAME_RESET', () => {
      loadInitialData();
      setActiveAlert('🔄 SECTOR RESET: Planet state restored to nominal baseline.');
      setTimeout(() => setActiveAlert(null), 8000);
    });

    // 7. Global Event Ticker Feed
    socket.on('GLOBAL_TICKER_LOG', (log) => {
      setEvents((prev) => [...prev.slice(-49), log]);
      if (log.message.includes('🚨') || log.message.includes('Emergency') || log.message.includes('🏆')) {
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
      socket.off('TRADE_CANCELLED');
      socket.off('VICTORY_ACHIEVED');
      socket.off('PLAYER_REGISTERED');
      socket.off('GAME_RESET');
      socket.off('GLOBAL_TICKER_LOG');
    };
  }, [currentPlayer]);

  // Player Actions
  const handleHarvest = async (nodeId) => {
    const res = await harvestNode(nodeId, currentPlayer);
    if (res.ok && res.success) {
      if (res.data?.node) {
        setNodes((prev) =>
          prev.map((n) => (n.id === nodeId ? { ...n, ...res.data.node } : n))
        );
        setLatestVersion((prev) => Math.max(prev, res.data.node.version));
      }
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
      if (item === 'surveyors_beacon') {
        setVictoryState({
          playerId: currentPlayer,
          message: `🏆 CONGRATULATIONS! You assembled the Surveyor's Beacon! Sector 9 Frontier Secured!`,
        });
      }
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

  const handleCancelTrade = async (tradeId) => {
    const res = await cancelTrade(tradeId, currentPlayer);
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

  const handleRegisterPlayer = async (username, role) => {
    try {
      const res = await registerPlayer(username, role);
      if (res.error) {
        return res;
      }
      if (res.player) {
        setPlayers((prev) => {
          if (prev.some((p) => p.id === res.player.id)) return prev;
          return [...prev, res.player];
        });
        setCurrentPlayer(res.player.id);
      }
      return res;
    } catch (err) {
      console.error('Failed to register pioneer:', err);
      return { error: 'REGISTRATION_FAILED', message: err.message };
    }
  };

  const handleResetGame = async () => {
    try {
      const res = await resetGameWorld();
      await loadInitialData();
      return res;
    } catch (err) {
      console.error('Failed to reset game:', err);
      return { error: 'RESET_FAILED', message: err.message };
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-frontier-950 text-slate-100 overflow-hidden font-sans">
      {/* 1. Top Bar */}
      <TopBar
        currentPlayer={currentPlayer}
        players={players}
        onSwitchPlayer={setCurrentPlayer}
        onRegisterPlayer={handleRegisterPlayer}
        onResetGame={handleResetGame}
        serverStatus={serverConnected}
        latestVersion={latestVersion}
        activeAlert={activeAlert}
      />

      {/* Victory Celebration Modal */}
      {victoryState && (
        <div className="absolute inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-frontier-900 border-2 border-yellow-400 rounded-lg p-6 max-w-lg w-full text-center shadow-neon-gold space-y-4">
            <div className="text-4xl animate-bounce">🏆</div>
            <h2 className="text-xl font-mono font-extrabold text-yellow-300 tracking-wider uppercase">
              SECTOR 9 SURVEY COMPLETED!
            </h2>
            <p className="font-mono text-sm text-slate-200">
              {victoryState.message}
            </p>
            <div className="bg-frontier-950 border border-yellow-500/40 p-3 rounded font-mono text-xs text-yellow-200">
              The planetary communications beacon is transmitting telemetry back to Central Command. All objectives achieved!
            </div>
            <button
              onClick={() => setVictoryState(null)}
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-frontier-950 font-mono font-extrabold uppercase rounded shadow-lg transition-transform active:scale-95"
            >
              CONTINUE EXPLORING
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Middle Area: Pannable Terrain Map + Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        <MapViewport
          nodes={nodes}
          machines={machines}
          inventory={inventory}
          currentPlayer={currentPlayer}
          onHarvest={handleHarvest}
          onDeployMachine={handleDeployMachine}
          onCollectMachine={handleCollectMachine}
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
          onCancelTrade={handleCancelTrade}
          onCollectMachine={handleCollectMachine}
        />
      </div>

      {/* 3. Bottom Ticker */}
      <EventTicker events={events} />
    </div>
  );
}
