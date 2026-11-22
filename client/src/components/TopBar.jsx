import React from 'react';
import { Activity, ShieldAlert, Cpu, Radio, UserCheck } from 'lucide-react';

export default function TopBar({
  currentPlayer,
  onSwitchPlayer,
  serverStatus,
  latestVersion,
  activeAlert,
}) {
  return (
    <header className="h-14 bg-frontier-900 border-b border-frontier-800 flex items-center justify-between px-4 z-30 select-none shadow-lg">
      {/* Brand & Sector Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-frontier-800/80 px-2.5 py-1 rounded border border-cyan-500/30">
          <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="font-mono font-bold tracking-wider text-sm text-cyan-400">
            OUTPOST // SECTOR 9
          </span>
        </div>

        {/* Player Identity Switcher (Vikryansh <-> Hansika) */}
        <div className="flex items-center bg-frontier-950 rounded border border-frontier-700/60 p-0.5 text-xs font-mono">
          <button
            onClick={() => onSwitchPlayer(2)}
            className={`px-2.5 py-1 rounded transition-colors flex items-center space-x-1.5 ${
              currentPlayer === 2
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Hansika (Pioneer)</span>
          </button>
          <button
            onClick={() => onSwitchPlayer(1)}
            className={`px-2.5 py-1 rounded transition-colors flex items-center space-x-1.5 ${
              currentPlayer === 1
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Vikryansh (Industrialist)</span>
          </button>
        </div>
      </div>

      {/* Center Emergency / Event Banner */}
      <div className="flex-1 max-w-xl mx-4">
        {activeAlert ? (
          <div className="bg-amber-500/15 border border-amber-500/40 text-amber-300 px-3 py-1 rounded flex items-center justify-center space-x-2 text-xs font-mono animate-pulse">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="truncate">{activeAlert}</span>
          </div>
        ) : (
          <div className="bg-frontier-950/60 border border-frontier-800 px-3 py-1 rounded flex items-center justify-center space-x-2 text-xs font-mono text-slate-400">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>SECTOR RADAR NOMINAL // ALL RESOURCE ZONES COMMITTED</span>
          </div>
        )}
      </div>

      {/* Network & Authoritative Version Badge */}
      <div className="flex items-center space-x-3 text-xs font-mono">
        <div className="flex items-center space-x-1.5 bg-frontier-950 px-2.5 py-1 rounded border border-frontier-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-semibold">
            {serverStatus ? 'LIVE SYNC' : 'OFFLINE'}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-300">v{latestVersion || 1}</span>
        </div>
      </div>
    </header>
  );
}
