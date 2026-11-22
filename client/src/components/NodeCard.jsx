import React, { useState } from 'react';
import { Pickaxe, Wrench, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  TacticalBeaconGround,
  OrbitalPodModel,
  DrillRigGraphic,
} from './BiomeGraphics';

const BIOME_THEMES = {
  timber: {
    border: 'border-emerald-500/70',
    glow: 'shadow-neon-emerald',
    text: 'text-emerald-300',
    barFill: 'bg-emerald-400',
    strokeColor: '#10b981',
    glowColor: '#34d399',
    shortName: 'Ancient Timber Grove',
    icon: '🌲',
    isSpecialModel: false,
  },
  iron_ore: {
    border: 'border-amber-500/70',
    glow: 'shadow-neon-amber',
    text: 'text-amber-300',
    barFill: 'bg-amber-400',
    strokeColor: '#f59e0b',
    glowColor: '#fbbf24',
    shortName: 'Iron Ridge Vein',
    icon: '⛏️',
    isSpecialModel: false,
  },
  copper_ore: {
    border: 'border-cyan-500/70',
    glow: 'shadow-neon-cyan',
    text: 'text-cyan-300',
    barFill: 'bg-cyan-400',
    strokeColor: '#06b6d4',
    glowColor: '#67e8f9',
    shortName: 'Copper Ridge Deposit',
    icon: '⚡',
    isSpecialModel: false,
  },
  energy_crystal: {
    border: 'border-purple-500/70',
    glow: 'shadow-neon-purple',
    text: 'text-purple-300',
    barFill: 'bg-purple-400',
    strokeColor: '#a855f7',
    glowColor: '#c084fc',
    shortName: 'Crystal Geode Prime',
    icon: '💎',
    isSpecialModel: false,
  },
  circuit_board: {
    border: 'border-yellow-400/80',
    glow: 'shadow-neon-gold',
    text: 'text-yellow-300',
    barFill: 'bg-yellow-400',
    strokeColor: '#eab308',
    glowColor: '#facc15',
    shortName: 'Orbital Supply Pod',
    icon: '📦',
    isSpecialModel: true,
  },
};

export default function NodeCard({ node, machine, onHarvest, onDeploy }) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [floatingParticles, setFloatingParticles] = useState([]);

  const theme = BIOME_THEMES[node.resource_type] || BIOME_THEMES.timber;
  const isDepleted = node.remaining_units <= 0;

  const handleHarvestClick = async (e) => {
    e.stopPropagation();
    if (loading || isDepleted) return;

    setLoading(true);
    setFeedback(null);

    const res = await onHarvest(node.id);
    setLoading(false);

    if (res.ok && res.success) {
      setFeedback({ type: 'success', text: `+1 ${node.resource_type.toUpperCase()}` });
      const pId = Date.now();
      setFloatingParticles((prev) => [
        ...prev,
        { id: pId, text: `+1 ${node.resource_type.replace('_', ' ').toUpperCase()}` },
      ]);
      setTimeout(() => {
        setFloatingParticles((prev) => prev.filter((p) => p.id !== pId));
      }, 1500);
    } else {
      setFeedback({ type: 'error', text: res.message || 'RACE LOST (409)' });
    }

    setTimeout(() => setFeedback(null), 2500);
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${node.coord_x}px`,
        top: `${node.coord_y}px`,
        transform: 'translate(-50%, -50%)',
      }}
      className="flex flex-col items-center select-none z-20 group pointer-events-auto"
    >
      {/* Floating Gain Particle Animation */}
      {floatingParticles.map((p) => (
        <div
          key={p.id}
          className="absolute -top-16 font-mono font-extrabold text-xs text-emerald-300 bg-frontier-950/95 px-2.5 py-0.5 rounded border border-emerald-400 shadow-neon-emerald animate-bounce z-40 pointer-events-none"
        >
          {p.text}
        </div>
      ))}

      {/* 1. Sleek Compact Tactical HUD Pin (Floating Above Entity) */}
      <div
        className={`w-44 bg-frontier-950/90 border backdrop-blur-md rounded-md p-1.5 shadow-2xl transition-all duration-200 z-30 ${
          theme.border
        } group-hover:scale-105 group-hover:bg-frontier-900 ${
          feedback?.type === 'error' ? 'animate-shake border-red-500 bg-red-950/95' : ''
        }`}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between text-[10px] font-mono mb-1 leading-tight">
          <div className="flex items-center space-x-1 font-bold truncate">
            <span className="text-xs">{theme.icon}</span>
            <span className={`truncate ${theme.text}`}>{theme.shortName}</span>
          </div>

          <span className="text-[9px] font-extrabold px-1 rounded bg-frontier-900 text-slate-300 border border-slate-700">
            {node.grid_sector}
          </span>
        </div>

        {/* Capacity Indicator & Ratio */}
        <div className="flex items-center space-x-1.5 mb-1.5">
          <div className="flex-1 flex space-x-0.5 h-1.5 bg-frontier-900 p-0.5 rounded">
            {Array.from({ length: node.max_capacity }).map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 rounded-xs transition-all duration-200 ${
                  idx < node.remaining_units ? theme.barFill : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
          <span className="text-[9px] font-mono font-bold text-slate-300">
            {node.remaining_units}/{node.max_capacity}
          </span>
        </div>

        {/* Machine Status Pill (If MK-1 Drill deployed) */}
        {machine && (
          <div className="mb-1.5 px-1.5 py-0.5 bg-cyan-950/80 border border-cyan-500/50 rounded flex items-center justify-between text-[9px] font-mono text-cyan-300">
            <div className="flex items-center space-x-1">
              <Wrench className="w-2.5 h-2.5 animate-spin" />
              <span className="font-bold">MK-1 Drill</span>
            </div>
            <span className="font-extrabold bg-cyan-900/60 px-1 rounded">
              {machine.buffer_units}/{machine.buffer_capacity}
            </span>
          </div>
        )}

        {/* Action Extract Button */}
        <button
          onClick={handleHarvestClick}
          disabled={loading || isDepleted}
          className={`w-full py-1 rounded font-mono font-extrabold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center space-x-1 bevel-both-r ${
            isDepleted
              ? 'bg-frontier-900 text-slate-600 border border-slate-800 cursor-not-allowed'
              : 'bg-frontier-800 hover:bg-cyan-600 text-white border border-cyan-500/50 hover:shadow-neon-cyan active:scale-95'
          }`}
        >
          <Pickaxe className="w-3 h-3" />
          <span>{loading ? 'LOCKING...' : isDepleted ? 'DEPLETED' : 'EXTRACT'}</span>
        </button>

        {/* Feedback Alert Pill */}
        {feedback && (
          <div
            className={`mt-1 py-0.5 px-1.5 rounded text-center text-[9px] font-mono font-bold flex items-center justify-center space-x-1 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                : 'bg-red-500/20 text-red-300 border border-red-500/50'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-2.5 h-2.5" />
            ) : (
              <AlertTriangle className="w-2.5 h-2.5" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}
      </div>

      {/* 2. Delicate Holographic Energy Pointer Stalk */}
      <div className="w-[1.5px] h-3 bg-gradient-to-b from-cyan-400 to-transparent pointer-events-none" />

      {/* 3. Interactive Ground Entity (Clickable Ground Target) */}
      <div
        onClick={handleHarvestClick}
        title={`Click to extract from ${node.name}`}
        className="relative cursor-pointer flex items-center justify-center -mt-2 group/diorama"
      >
        {/* If MK-1 Drill is deployed */}
        {machine && (
          <DrillRigGraphic storedUnits={machine.buffer_units} capacity={machine.buffer_capacity} />
        )}

        {/* Render Model: Pod for Supply Pod, Holographic Tactical Ground Beacon for Veins */}
        {theme.isSpecialModel ? (
          <OrbitalPodModel remainingUnits={node.remaining_units} />
        ) : (
          <TacticalBeaconGround
            theme={theme}
            remainingUnits={node.remaining_units}
            maxCapacity={node.max_capacity}
            isDepleted={isDepleted}
          />
        )}
      </div>
    </div>
  );
}
