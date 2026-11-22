import React from 'react';
import { ShieldAlert, Radio, Cpu, UserCheck, Wifi } from 'lucide-react';

export default function TopBar({
  currentPlayer,
  onSwitchPlayer,
  serverStatus,
  latestVersion,
  activeAlert,
}) {
  return (
    <header className="h-14 bg-frontier-900 border-b border-frontier-700/80 flex items-center justify-between px-5 z-40 select-none shadow-2xl relative">
      {/* Subtle top border neon line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/80 to-transparent pointer-events-none" />

      {/* Brand & Tactical Header */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5 bg-frontier-950 px-3 py-1.5 rounded-sm border border-cyan-500/50 shadow-neon-cyan bevel-both-r">
          <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="font-mono font-extrabold tracking-widest text-xs text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]">
              OUTPOST // AUTOMATA
            </span>
            <span className="text-[9px] font-mono text-slate-400 tracking-wider">
              SECTOR 9 • TACTICAL CONSOLE
            </span>
          </div>
        </div>

        {/* Player Profile Switcher */}
        <div className="flex items-center bg-frontier-950 rounded border border-frontier-800 p-0.5 text-xs font-mono">
          <button
            onClick={() => onSwitchPlayer(1)}
            className={`px-3 py-1 rounded transition-all flex items-center space-x-1.5 ${
              currentPlayer === 1
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 font-bold shadow-neon-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Vikryansh (Industrialist)</span>
          </button>
          <button
            onClick={() => onSwitchPlayer(2)}
            className={`px-3 py-1 rounded transition-all flex items-center space-x-1.5 ${
              currentPlayer === 2
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 font-bold shadow-neon-emerald'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Hansika (Pioneer)</span>
          </button>
        </div>
      </div>

      {/* Center Emergency / Event Radar Banner */}
      <div className="flex-1 max-w-xl mx-4">
        {activeAlert ? (
          <div className="bg-amber-950/80 border-2 border-amber-400/80 text-amber-200 px-4 py-1 rounded shadow-neon-amber flex items-center justify-center space-x-2.5 text-xs font-mono animate-pulse">
            <ShieldAlert className="w-4 h-4 text-amber-400 animate-bounce" />
            <span className="font-bold tracking-wider truncate uppercase">{activeAlert}</span>
          </div>
        ) : (
          <div className="bg-frontier-950/80 border border-frontier-800 px-4 py-1.5 rounded flex items-center justify-center space-x-2 text-xs font-mono text-slate-400">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="tracking-wider">
              FRONTIER RADAR NOMINAL // CONTESTED ZONES LOCKED
            </span>
          </div>
        )}
      </div>

      {/* Real-time Telemetry & Commit Version Pill */}
      <div className="flex items-center space-x-3 text-xs font-mono">
        <div className="flex items-center space-x-2 bg-frontier-950 px-3 py-1.5 rounded border border-frontier-800 shadow-inner">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-bold">
            {serverStatus ? 'LIVE 28ms' : 'OFFLINE'}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">DB COMMIT:</span>
          <span className="text-cyan-300 font-extrabold bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/40">
            v{latestVersion || 1}
          </span>
        </div>
      </div>
    </header>
  );
}
