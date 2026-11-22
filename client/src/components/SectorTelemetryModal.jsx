import React, { useState, useEffect } from 'react';
import {
  Activity,
  Database,
  Cpu,
  Layers,
  TrendingDown,
  ShieldAlert,
  Server,
  RefreshCw,
} from 'lucide-react';
import { getSectorTelemetry } from '../services/api';

export default function SectorTelemetryModal({ isOpen, onClose }) {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const data = await getSectorTelemetry();
      setTelemetry(data);
    } catch (err) {
      console.error('Failed to fetch sector telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTelemetry();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-frontier-900 border-2 border-cyan-500/80 rounded-xl max-w-2xl w-full p-6 shadow-neon-cyan space-y-5 font-mono text-xs max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-frontier-800 pb-3">
          <div className="flex items-center space-x-2.5 text-cyan-300 font-extrabold text-sm tracking-wide">
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span>SECTOR 9 TELEMETRY // DATABASE & LEDGER METRICS</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchTelemetry}
              disabled={loading}
              className="text-slate-400 hover:text-cyan-300 p-1.5 rounded hover:bg-frontier-800 transition-colors"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white font-bold text-sm px-2 py-0.5 rounded hover:bg-frontier-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {telemetry ? (
          <>
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-frontier-950 p-3 rounded-lg border border-frontier-800">
                <span className="text-[10px] text-slate-400 block mb-1">TOTAL ORE RESERVES</span>
                <span className="text-xl font-extrabold text-cyan-300">
                  {telemetry.totalRemainingUnits} / {telemetry.totalMaxCapacity}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">
                  {telemetry.depletionPercent}% DEPLETED
                </span>
              </div>

              <div className="bg-frontier-950 p-3 rounded-lg border border-frontier-800">
                <span className="text-[10px] text-slate-400 block mb-1">ACTIVE MACHINES</span>
                <span className="text-xl font-extrabold text-emerald-400">
                  {telemetry.activeMachines}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">
                  MK-1 DRILL WORKERS
                </span>
              </div>

              <div className="bg-frontier-950 p-3 rounded-lg border border-frontier-800">
                <span className="text-[10px] text-slate-400 block mb-1">AUDIT LEDGER ROWS</span>
                <span className="text-xl font-extrabold text-purple-400">
                  {telemetry.totalEventLogs}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">
                  B-TREE INDEXED
                </span>
              </div>

              <div className="bg-frontier-950 p-3 rounded-lg border border-frontier-800">
                <span className="text-[10px] text-slate-400 block mb-1">ESCROW TRADES</span>
                <span className="text-xl font-extrabold text-amber-400">
                  {telemetry.openTrades}
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">
                  DEADLOCK-FREE OFFERS
                </span>
              </div>
            </div>

            {/* Sector Depletion Progress Bar */}
            <div className="bg-frontier-950 p-3.5 rounded-lg border border-frontier-800 space-y-2">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-400">SECTOR DEPLETION INDEX:</span>
                <span className="text-cyan-300">{telemetry.depletionPercent}% Depleted</span>
              </div>
              <div className="w-full bg-frontier-900 h-2.5 rounded-full overflow-hidden border border-frontier-800">
                <div
                  className="bg-gradient-to-r from-cyan-500 via-yellow-500 to-red-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(telemetry.depletionPercent, 100)}%` }}
                />
              </div>
            </div>

            {/* Node Breakdown Table */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-slate-300">
                GEOLOGICAL LANDMARK SURVEY & MONOTONIC VERSIONS:
              </div>
              <div className="grid grid-cols-2 gap-2">
                {telemetry.nodes?.map((node) => {
                  const pct = Math.round((node.remaining_units / node.max_capacity) * 100);
                  const isDepleted = node.remaining_units === 0;

                  return (
                    <div
                      key={node.id}
                      className={`p-2.5 rounded border ${
                        isDepleted
                          ? 'bg-red-950/30 border-red-500/40'
                          : 'bg-frontier-950 border-frontier-800'
                      } flex items-center justify-between text-[11px]`}
                    >
                      <div className="flex flex-col">
                        <span className={`font-bold ${isDepleted ? 'text-red-300' : 'text-slate-200'}`}>
                          #{node.id} {node.name}
                        </span>
                        <span className="text-[9px] text-slate-500 capitalize">
                          {node.resource_type.replace('_', ' ')} • DB Commit v{node.version || 1}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-extrabold ${
                            isDepleted
                              ? 'text-red-400 animate-pulse'
                              : pct < 40
                              ? 'text-amber-400'
                              : 'text-cyan-300'
                          }`}
                        >
                          {node.remaining_units} / {node.max_capacity}
                        </span>
                        <span className="text-[9px] text-slate-500 block">
                          {isDepleted ? 'EXHAUSTED' : `${pct}% Available`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Academic Footnote */}
            <div className="bg-frontier-950 p-3 rounded border border-frontier-800 text-[10px] text-slate-400 flex items-center justify-between">
              <span>
                Engineered with PostgreSQL 16 ACID transactions, composite B-tree indexing on <code className="text-cyan-300">event_logs(player_id, created_at DESC)</code>, and Push-After-Commit Socket.io distribution.
              </span>
              <span className="text-emerald-400 font-bold shrink-0 ml-3">
                UPTIME: {telemetry.serverUptimeSec}s
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-slate-500">
            Querying PostgreSQL database metrics...
          </div>
        )}
      </div>
    </div>
  );
}
