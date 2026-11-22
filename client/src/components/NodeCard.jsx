import React, { useState } from 'react';
import { Pickaxe, Trees, Mountain, Zap, Box, Wrench, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

const BIOME_THEMES = {
  timber: {
    name: 'Ancient Timber Grove',
    accent: 'emerald',
    badge: 'border-emerald-500/50 bg-emerald-950/60 text-emerald-400',
    barFill: 'bg-emerald-400 shadow-neon-emerald',
    glowRing: 'border-emerald-400/40 bg-emerald-500/10',
    icon: Trees,
  },
  iron_ore: {
    name: 'Deep Iron Mine Vein',
    accent: 'amber',
    badge: 'border-amber-500/50 bg-amber-950/60 text-amber-400',
    barFill: 'bg-amber-400 shadow-neon-amber',
    glowRing: 'border-amber-400/40 bg-amber-500/10',
    icon: Mountain,
  },
  copper_ore: {
    name: 'Copper Ridge Deposit',
    accent: 'cyan',
    badge: 'border-cyan-500/50 bg-cyan-950/60 text-cyan-400',
    barFill: 'bg-cyan-400 shadow-neon-cyan',
    glowRing: 'border-cyan-400/40 bg-cyan-500/10',
    icon: Zap,
  },
  energy_crystal: {
    name: 'Subterranean Crystal Geode',
    accent: 'purple',
    badge: 'border-purple-500/50 bg-purple-950/60 text-purple-400',
    barFill: 'bg-purple-400 shadow-neon-purple',
    glowRing: 'border-purple-400/40 bg-purple-500/10',
    icon: Box,
  },
  circuit_board: {
    name: 'Contested Orbital Supply Pod',
    accent: 'gold',
    badge: 'border-yellow-400/80 bg-yellow-950/80 text-yellow-300',
    barFill: 'bg-yellow-400 shadow-neon-gold',
    glowRing: 'border-yellow-400/80 bg-yellow-400/20 animate-pulse',
    icon: Box,
  },
};

export default function NodeCard({ node, machine, onHarvest, onDeploy }) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const theme = BIOME_THEMES[node.resource_type] || BIOME_THEMES.timber;
  const Icon = theme.icon;
  const isDepleted = node.remaining_units <= 0;
  const isOrbitalPod = node.resource_type === 'circuit_board';

  const handleHarvestClick = async (e) => {
    e.stopPropagation();
    if (loading || isDepleted) return;

    setLoading(true);
    setFeedback(null);

    const res = await onHarvest(node.id);
    setLoading(false);

    if (res.ok && res.success) {
      setFeedback({ type: 'success', text: `+1 ${node.resource_type.toUpperCase()}` });
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
      className="flex flex-col items-center select-none z-20 group"
    >
      {/* 1. Floating Holographic Data Plate */}
      <div
        className={`w-72 bg-frontier-900/95 border-2 rounded-lg p-3.5 backdrop-blur-md shadow-2xl transition-all duration-200 ${
          theme.badge
        } ${feedback?.type === 'error' ? 'animate-shake border-red-500 bg-red-950/90' : ''}`}
      >
        {/* Top Tag & Sector Grid */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-extrabold bg-frontier-950 px-2 py-0.5 rounded border border-frontier-700 text-cyan-300">
              SECTOR {node.grid_sector}
            </span>
            <span className="text-[10px] font-mono text-slate-400">v{node.version}</span>
          </div>

          <span
            className={`text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded ${
              isDepleted
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            {isDepleted ? 'EXHAUSTED' : 'CONTESTED'}
          </span>
        </div>

        {/* Node Name & Biome Icon */}
        <div className="flex items-center space-x-2.5 mb-2.5">
          <div className="p-2 rounded bg-frontier-950 border border-frontier-700 shadow-inner">
            <Icon className="w-5 h-5 text-slate-100" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-100 truncate" title={node.name}>
              {node.name}
            </h4>
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              {node.resource_type.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Segmented Neon Capacity Bar (10 Blocks) */}
        <div className="mb-3 bg-frontier-950 p-2 rounded border border-frontier-800">
          <div className="flex justify-between text-[10px] font-mono mb-1.5">
            <span className="text-slate-400">Available Stock</span>
            <span className="text-cyan-300 font-extrabold">
              {node.remaining_units} / {node.max_capacity} UNITS
            </span>
          </div>

          <div className="flex space-x-1 h-2">
            {Array.from({ length: node.max_capacity }).map((_, idx) => {
              const isFilled = idx < node.remaining_units;
              return (
                <div
                  key={idx}
                  className={`flex-1 rounded-xs transition-all duration-300 ${
                    isFilled ? theme.barFill : 'bg-frontier-800/60'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Deployed Machine Overlay (MK-1 Drill) */}
        {machine && (
          <div className="mb-2 bg-frontier-950 border border-cyan-500/50 p-2 rounded text-xs font-mono flex items-center justify-between shadow-neon-cyan">
            <div className="flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-cyan-400 animate-spin" />
              <div className="flex flex-col">
                <span className="text-slate-200 font-bold">MK-1 Drill #{machine.id}</span>
                <span className="text-[9px] text-emerald-400">AUTONOMOUS HARVEST</span>
              </div>
            </div>
            <span className="text-cyan-300 font-extrabold bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/40">
              {machine.buffer_units}/{machine.buffer_capacity}
            </span>
          </div>
        )}

        {/* Feedback Alert Pill */}
        {feedback && (
          <div
            className={`mb-2 py-1.5 px-2 rounded text-center text-[10px] font-mono font-bold flex items-center justify-center space-x-1.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-neon-emerald'
                : 'bg-red-500/20 text-red-300 border border-red-500/50'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Tactical Action Button */}
        <button
          onClick={handleHarvestClick}
          disabled={loading || isDepleted}
          className={`w-full py-2 rounded font-mono font-extrabold text-xs uppercase tracking-wider transition-all duration-150 flex items-center justify-center space-x-2 bevel-both-r ${
            isDepleted
              ? 'bg-frontier-950 text-slate-600 border border-frontier-800 cursor-not-allowed'
              : 'bg-frontier-800 hover:bg-cyan-600 text-white border border-cyan-500/50 hover:shadow-neon-cyan active:scale-95'
          }`}
        >
          <Pickaxe className="w-4 h-4" />
          <span>
            {loading ? 'COMMITTING...' : isDepleted ? 'SECTOR DEPLETED' : 'EXTRACT RESOURCE'}
          </span>
        </button>
      </div>

      {/* 2. Holographic Ground Conduit / Stalk Line */}
      <div className="w-[2px] h-8 bg-gradient-to-b from-cyan-400 to-transparent pointer-events-none" />

      {/* 3. Ground Anchor / Isometric Terrain Visual */}
      <div className="relative pointer-events-none flex items-center justify-center">
        {/* Pulsing Ground Energy Ring */}
        <div
          className={`w-16 h-8 rounded-full border-2 ${theme.glowRing} ${
            isOrbitalPod ? 'animate-ping' : ''
          }`}
        />

        {/* Center Ground Anchor Glyph */}
        <div className="absolute w-4 h-4 rounded-full bg-frontier-950 border border-cyan-400 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        </div>
      </div>
    </div>
  );
}
