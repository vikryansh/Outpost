import React, { useState } from 'react';
import {
  ShieldAlert,
  Radio,
  Cpu,
  UserCheck,
  UserPlus,
  RotateCcw,
  Wifi,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  VolumeX,
  FlaskConical,
  Activity,
  Keyboard,
  Rocket,
} from 'lucide-react';
import { soundFx } from '../services/soundFx';

export default function TopBar({
  currentPlayer,
  players = [],
  onSwitchPlayer,
  onRegisterPlayer,
  onResetGame,
  onOpenLab,
  onOpenTelemetry,
  onOpenHotkeys,
  onTriggerSupplyDrop,
  serverStatus,
  latestVersion,
  activeAlert,
}) {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState('Pioneer');
  const [registerError, setRegisterError] = useState(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(soundFx.isMuted());

  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
  };

  const activePlayer = players.find((p) => p.id === currentPlayer) || {
    id: currentPlayer,
    username: currentPlayer === 1 ? 'Vikryansh' : 'Hansika',
    role: currentPlayer === 1 ? 'Industrialist' : 'Pioneer',
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    setRegisterLoading(true);
    setRegisterError(null);

    const res = await onRegisterPlayer(newUsername.trim(), newRole);
    setRegisterLoading(false);

    if (res && res.error) {
      setRegisterError(res.message || 'Callsign already enlisted or invalid.');
    } else {
      setNewUsername('');
      setShowRegisterModal(false);
    }
  };

  const handleResetSubmit = async () => {
    setResetLoading(true);
    await onResetGame();
    setResetLoading(false);
    setShowResetModal(false);
  };

  return (
    <>
      <header className="h-14 bg-frontier-900 border-b border-frontier-700/80 flex items-center justify-between px-5 z-40 select-none shadow-2xl relative">
        {/* Top neon edge */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/80 to-transparent pointer-events-none" />

        {/* Brand & Tactical Header */}
        <div className="flex items-center space-x-3.5">
          <div className="flex items-center space-x-2 bg-frontier-950 px-2.5 py-1.5 rounded border border-cyan-500/50 shadow-neon-cyan bevel-both-r">
            <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="font-mono font-extrabold tracking-widest text-xs text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]">
                OUTPOST // AUTOMATA
              </span>
              <span className="text-[8px] font-mono text-slate-400 tracking-wider">
                SECTOR 9 • TACTICAL CONSOLE
              </span>
            </div>
          </div>

          {/* Dynamic Pioneer Profile Selector Dropdown */}
          <div className="flex items-center bg-frontier-950 rounded border border-frontier-800 p-0.5 text-xs font-mono space-x-1">
            <div className="flex items-center space-x-1 px-2 py-1 text-slate-300">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={currentPlayer}
                onChange={(e) => onSwitchPlayer(parseInt(e.target.value, 10))}
                className="bg-frontier-900 border border-frontier-700 rounded px-2 py-0.5 text-xs font-bold text-cyan-300 cursor-pointer focus:outline-none focus:border-cyan-400"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.username} ({p.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Enlist Pioneer Button */}
            <button
              onClick={() => setShowRegisterModal(true)}
              title="Register a new Pioneer callsign"
              className="px-2 py-1 hover:bg-frontier-900 text-slate-400 hover:text-cyan-300 rounded transition-colors flex items-center space-x-1 border-l border-frontier-800 text-[10px]"
            >
              <UserPlus className="w-3 h-3 text-cyan-400" />
              <span>+ ENLIST</span>
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

        {/* Right Controls: Lab, Metrics, Supply Drop, Audio, Reset World & Telemetry */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          {/* Concurrency Lab Button */}
          <button
            onClick={onOpenLab}
            title="Open Live Concurrency Lab & Viva Demonstration Suite"
            className="px-2 py-1 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 rounded transition-all flex items-center space-x-1 text-[10px] font-bold shadow-sm active:scale-95"
          >
            <FlaskConical className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">LAB</span>
          </button>

          {/* Sector Metrics / Telemetry Button */}
          <button
            onClick={onOpenTelemetry}
            title="Open Sector 9 Database & Ledger Telemetry"
            className="px-2 py-1 bg-frontier-950 hover:bg-frontier-800 border border-frontier-700 hover:border-frontier-600 text-slate-300 rounded transition-all flex items-center space-x-1 text-[10px] font-bold shadow-sm active:scale-95"
          >
            <Activity className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">INTEL</span>
          </button>

          {/* Supply Pod Drop Quick Trigger */}
          <button
            onClick={onTriggerSupplyDrop}
            title="Dispatch Orbital Supply Pod Drop into Crater Basin (Grid B-2)"
            className="px-2 py-1 bg-frontier-950 hover:bg-frontier-800 border border-purple-500/40 hover:border-purple-400 text-purple-300 rounded transition-all flex items-center space-x-1 text-[10px] font-bold shadow-sm active:scale-95"
          >
            <Rocket className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">DROP</span>
          </button>

          {/* Audio Mute/Unmute Toggle */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute procedural tactical audio' : 'Mute procedural tactical audio'}
            className="px-2 py-1 bg-frontier-950 hover:bg-frontier-800 border border-frontier-800 hover:border-frontier-700 text-slate-400 hover:text-cyan-300 rounded transition-colors text-[10px]"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            )}
          </button>

          {/* Hotkeys Cheatsheet Button */}
          <button
            onClick={onOpenHotkeys}
            title="Tactical Keyboard Controls [?]"
            className="px-2 py-1 bg-frontier-950 hover:bg-frontier-800 border border-frontier-800 hover:border-frontier-700 text-slate-400 hover:text-cyan-300 rounded transition-colors text-[10px] font-bold"
          >
            <Keyboard className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Sector Reset Button */}
          <button
            onClick={() => setShowResetModal(true)}
            title="Reset Sector 9 resources, machines, and inventories"
            className="px-2 py-1 bg-red-950/60 hover:bg-red-900/80 border border-red-500/50 hover:border-red-400 text-red-300 rounded transition-all flex items-center space-x-1 text-[10px] font-bold shadow-sm active:scale-95"
          >
            <RotateCcw className="w-3 h-3 text-red-400" />
            <span className="hidden sm:inline">RESET</span>
          </button>

          {/* Telemetry & DB Version */}
          <div className="flex items-center space-x-2 bg-frontier-950 px-2.5 py-1 rounded border border-frontier-800 shadow-inner">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 font-bold text-[10px]">
              {serverStatus ? 'LIVE' : 'OFFLINE'}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300 font-extrabold bg-cyan-950/80 px-1 py-0.5 rounded border border-cyan-500/40 text-[10px]">
              v{latestVersion || 1}
            </span>
          </div>
        </div>
      </header>

      {/* 1. Enlist Pioneer / User Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in select-none">
          <div className="bg-frontier-900 border-2 border-cyan-500/80 rounded-lg max-w-md w-full p-6 shadow-neon-cyan space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-frontier-800 pb-3">
              <div className="flex items-center space-x-2 text-cyan-300 font-bold text-sm">
                <UserPlus className="w-4 h-4 text-cyan-400" />
                <span>ENLIST NEW PIONEER // USER REGISTRATION</span>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-500 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {registerError && (
              <div className="bg-red-950/80 border border-red-500/60 p-2.5 rounded text-red-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{registerError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-slate-400 mb-1 text-[11px] font-bold">
                  PIONEER CALLSIGN (USERNAME):
                </label>
                <input
                  type="text"
                  required
                  maxLength="24"
                  placeholder="e.g. Dr. Sharma, Commander, Pioneer_X"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-frontier-950 border border-frontier-700 rounded px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 text-[11px] font-bold">
                  SPECIALIZATION ROLE:
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-frontier-950 border border-frontier-700 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400 font-mono text-xs capitalize"
                >
                  <option value="Pioneer">Pioneer (Frontier Exploration & Scavenger)</option>
                  <option value="Industrialist">Industrialist (Resource Mining & Factory Refinement)</option>
                  <option value="Field Engineer">Field Engineer (Automation & MK-1 Drill Logistics)</option>
                  <option value="Geologist">Geologist (Deep Ore Survey & Crystal Extraction)</option>
                </select>
              </div>

              <div className="bg-frontier-950 p-2.5 rounded border border-frontier-800 text-[10px] text-slate-400 space-y-1">
                <span className="font-bold text-cyan-400">STARTER PACK ALLOCATION:</span>
                <p>• 6x Timber, 4x Iron Ore, 2x Copper Wire</p>
                <p>• 50 Frontier Credits & Outpost Tier 1 Clearance</p>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 py-2 bg-frontier-950 hover:bg-frontier-800 border border-frontier-700 rounded text-slate-400 font-bold uppercase transition-colors"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase rounded shadow-neon-cyan transition-all active:scale-95"
                >
                  {registerLoading ? 'ENLISTING...' : 'ENLIST PIONEER'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Sector World Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in select-none">
          <div className="bg-frontier-900 border-2 border-red-500 rounded-lg max-w-md w-full p-6 shadow-[0_0_25px_rgba(239,68,68,0.5)] space-y-4 font-mono text-xs">
            <div className="flex items-center space-x-2.5 text-red-400 font-extrabold text-sm border-b border-frontier-800 pb-3">
              <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
              <span>AUTHORITATIVE GAME RESET // SECTOR REINITIALIZE</span>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Are you sure you want to reinitialize Sector 9? This action executes an authoritative
              PostgreSQL rollback to clean factory conditions:
            </p>

            <ul className="bg-frontier-950 p-3 rounded border border-frontier-800 text-[11px] text-slate-400 space-y-1 list-disc list-inside">
              <li>All 8 resource nodes restored to 100% capacity</li>
              <li>All deployed automated drills removed from terrain</li>
              <li>All standing trade escrow offers cancelled and refunded</li>
              <li>Inventories restored to starter kits</li>
            </ul>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2 bg-frontier-950 hover:bg-frontier-800 border border-frontier-700 rounded text-slate-300 font-bold uppercase transition-colors"
              >
                ABORT
              </button>
              <button
                type="button"
                onClick={handleResetSubmit}
                disabled={resetLoading}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-bold uppercase rounded shadow-lg transition-all active:scale-95"
              >
                {resetLoading ? 'REINITIALIZING...' : 'CONFIRM RESET'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
