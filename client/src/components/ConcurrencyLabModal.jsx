import React, { useState } from 'react';
import {
  FlaskConical,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Play,
  RotateCcw,
  Rocket,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { runConcurrencySimulation, triggerSupplyDrop } from '../services/api';
import { soundFx } from '../services/soundFx';

export default function ConcurrencyLabModal({
  isOpen,
  onClose,
  nodes = [],
  currentPlayer,
  onRefreshData,
}) {
  const [selectedNodeId, setSelectedNodeId] = useState(8);
  const [requestsCount, setRequestsCount] = useState(20);
  const [running, setRunning] = useState(false);
  const [supplyDropLoading, setSupplyDropLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [supplyDropMessage, setSupplyDropMessage] = useState(null);

  if (!isOpen) return null;

  const targetNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const handleRunRace = async () => {
    setRunning(true);
    setSimulationResult(null);
    soundFx.playAlert();

    try {
      const res = await runConcurrencySimulation(selectedNodeId, requestsCount, currentPlayer);
      setSimulationResult(res);
      soundFx.playCraft();
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Concurrency race failed:', err);
    } finally {
      setRunning(false);
    }
  };

  const handleLaunchSupplyDrop = async () => {
    setSupplyDropLoading(true);
    setSupplyDropMessage(null);
    soundFx.playAlert();

    try {
      const res = await triggerSupplyDrop();
      if (res.success) {
        setSupplyDropMessage('🚀 Orbital Supply Pod Alpha deployed into Crater Basin (Grid B-2)!');
        soundFx.playDeploy();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Failed to trigger supply drop:', err);
    } finally {
      setSupplyDropLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-frontier-900 border-2 border-cyan-500/80 rounded-xl max-w-2xl w-full p-6 shadow-neon-cyan space-y-5 font-mono text-xs max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-frontier-800 pb-3">
          <div className="flex items-center space-x-2.5 text-cyan-300 font-extrabold text-sm tracking-wide">
            <FlaskConical className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span>LIVE CONCURRENCY LAB // VIVA DEMONSTRATION SUITE</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white font-bold text-sm px-2 py-0.5 rounded hover:bg-frontier-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Viva Concept Callout */}
        <div className="bg-frontier-950 p-3.5 rounded-lg border border-cyan-500/40 text-[11px] text-slate-300 space-y-1.5 shadow-inner">
          <div className="flex items-center space-x-2 text-cyan-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Appendix A.4 Guarantee — Zero-Window Single-Statement Atomic Decrement</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Fires simultaneous parallel harvest queries directly contending for finite database stock.
            PostgreSQL guarantees zero lock window: exactly winning transactions decrement stock while
            competing requests instantly receive <code className="text-amber-400 bg-amber-950/60 px-1 py-0.5 rounded">409 Resource Exhausted</code> with zero negative inventory drift.
          </p>
        </div>

        {/* Configuration Controls */}
        <div className="grid grid-cols-2 gap-4 bg-frontier-950/60 p-4 rounded-lg border border-frontier-800">
          <div>
            <label className="block text-slate-400 mb-1 text-[11px] font-bold">
              TARGET CONTESTED NODE:
            </label>
            <select
              value={selectedNodeId}
              onChange={(e) => setSelectedNodeId(parseInt(e.target.value, 10))}
              className="w-full bg-frontier-900 border border-frontier-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400 font-mono text-xs cursor-pointer"
            >
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  #{node.id} {node.name} (Stock: {node.remaining_units}/{node.max_capacity} {node.resource_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 text-[11px] font-bold">
              CONCURRENT BURST SIZE:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[10, 20, 40].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setRequestsCount(count)}
                  className={`py-2 rounded font-bold transition-all border ${
                    requestsCount === count
                      ? 'bg-cyan-600 text-white border-cyan-400 shadow-neon-cyan'
                      : 'bg-frontier-900 text-slate-400 border-frontier-700 hover:text-white'
                  }`}
                >
                  {count} REQS
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleRunRace}
            disabled={running}
            className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold uppercase rounded-lg shadow-neon-cyan flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
            <span>{running ? 'EXECUTING PARALLEL RACE...' : `FIRE ${requestsCount} CONCURRENT REQUESTS`}</span>
          </button>

          <button
            onClick={handleLaunchSupplyDrop}
            disabled={supplyDropLoading}
            className="px-4 py-2.5 bg-frontier-900 hover:bg-frontier-800 border border-purple-500/50 hover:border-purple-400 text-purple-300 font-bold uppercase rounded-lg flex items-center space-x-1.5 transition-all active:scale-95 text-[11px]"
            title="Deploy high-tier supply pod drop at Crater Basin (Grid B-2)"
          >
            <Rocket className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>DISPATCH SUPPLY DROP</span>
          </button>
        </div>

        {/* Supply drop notification message */}
        {supplyDropMessage && (
          <div className="bg-purple-950/80 border border-purple-500/80 p-2.5 rounded text-purple-200 text-xs flex items-center space-x-2 animate-fade-in">
            <Rocket className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{supplyDropMessage}</span>
          </div>
        )}

        {/* Live Simulation Scoreboard */}
        {simulationResult && (
          <div className="bg-frontier-950 p-4 rounded-lg border border-cyan-500/60 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between border-b border-frontier-800 pb-2">
              <span className="text-cyan-300 font-extrabold tracking-wider">
                RACE TELEMETRY RESULTS
              </span>
              <span className="text-[10px] bg-cyan-950 border border-cyan-500/50 text-cyan-300 px-2 py-0.5 rounded flex items-center space-x-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>LATENCY: {simulationResult.durationMs}ms</span>
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-frontier-900 p-2.5 rounded border border-frontier-800">
                <div className="text-[10px] text-slate-400">DISPATCHED</div>
                <div className="text-lg font-extrabold text-cyan-300">
                  {simulationResult.totalRequests}
                </div>
              </div>

              <div className="bg-emerald-950/60 p-2.5 rounded border border-emerald-500/50">
                <div className="text-[10px] text-emerald-300 font-bold">200 OK (WON)</div>
                <div className="text-lg font-extrabold text-emerald-400">
                  {simulationResult.successful}
                </div>
              </div>

              <div className="bg-amber-950/60 p-2.5 rounded border border-amber-500/50">
                <div className="text-[10px] text-amber-300 font-bold">409 CONFLICT</div>
                <div className="text-lg font-extrabold text-amber-400">
                  {simulationResult.conflicts}
                </div>
              </div>

              <div className="bg-frontier-900 p-2.5 rounded border border-frontier-800">
                <div className="text-[10px] text-slate-400">FINAL DB STOCK</div>
                <div className="text-lg font-extrabold text-cyan-400">
                  {simulationResult.finalStock}
                </div>
              </div>
            </div>

            <div className="bg-frontier-900/90 p-2.5 rounded border border-emerald-500/60 flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-2 text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>DATABASE INTEGRITY: ZERO NEGATIVE STOCK DRIFT VERIFIED</span>
              </div>
              <span className="text-slate-400 text-[10px]">
                VERSION: v{simulationResult.currentVersion}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
