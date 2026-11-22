import React, { useState } from 'react';
import { Pickaxe, Wrench, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  ForestBiome,
  IronMineBiome,
  CopperMineBiome,
  CrystalGeodeBiome,
  OrbitalPodBiome,
  DrillRigGraphic,
} from './BiomeGraphics';

const BIOME_THEMES = {
  timber: {
    badge: 'border-emerald-500/60 bg-frontier-900/95 text-emerald-300',
    barFill: 'bg-emerald-400 shadow-neon-emerald',
    Component: ForestBiome,
  },
  iron_ore: {
    badge: 'border-amber-500/60 bg-frontier-900/95 text-amber-300',
    barFill: 'bg-amber-400 shadow-neon-amber',
    Component: IronMineBiome,
  },
  copper_ore: {
    badge: 'border-cyan-500/60 bg-frontier-900/95 text-cyan-300',
    barFill: 'bg-cyan-400 shadow-neon-cyan',
    Component: CopperMineBiome,
  },
  energy_crystal: {
    badge: 'border-purple-500/60 bg-frontier-900/95 text-purple-300',
    barFill: 'bg-purple-400 shadow-neon-purple',
    Component: CrystalGeodeBiome,
  },
  circuit_board: {
    badge: 'border-yellow-400/80 bg-frontier-900/95 text-yellow-300',
    barFill: 'bg-yellow-400 shadow-neon-gold',
    Component: OrbitalPodBiome,
  },
};

export default function NodeCard({ node, machine, onHarvest, onDeploy }) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const theme = BIOME_THEMES[node.resource_type] || BIOME_THEMES.timber;
  const BiomeGraphic = theme.Component;
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
      {/* 1. Floating Holographic Data Plate (Above the terrain diorama) */}
      <div
        className={`w-64 border-2 rounded-lg p-3 backdrop-blur-md shadow-2xl transition-all duration-200 ${
          theme.badge
        } ${feedback?.type === 'error' ? 'animate-shake border-red-500 bg-red-950/95' : ''}`}
      >
        {/* Sector Tag & Version Badge */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-mono font-extrabold bg-frontier-950 px-2 py-0.5 rounded border border-frontier-700 text-cyan-300">
              SECTOR {node.grid_sector}
            </span>
            <span className="text-[10px] font-mono text-slate-400">v{node.version}</span>
          </div>

          <span
            className={`text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded ${
              isDepleted
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            {isDepleted ? 'DEPLETED' : 'CONTESTED'}
          </span>
        </div>

        {/* Node Name */}
        <h4 className="text-xs font-extrabold text-slate-100 truncate mb-2" title={node.name}>
          {node.name}
        </h4>

        {/* Segmented Capacity Indicator */}
        <div className="mb-2.5 bg-frontier-950 p-1.5 rounded border border-frontier-800">
          <div className="flex justify-between text-[9px] font-mono mb-1">
            <span className="text-slate-400">Resource Reserve</span>
            <span className="text-cyan-300 font-bold">
              {node.remaining_units}/{node.max_capacity}
            </span>
          </div>

          <div className="flex space-x-0.5 h-1.5">
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

        {/* Machine Overlay (If deployed) */}
        {machine && (
          <div className="mb-2 bg-frontier-950 border border-cyan-500/50 p-1.5 rounded text-xs font-mono flex items-center justify-between shadow-neon-cyan">
            <div className="flex items-center space-x-1.5">
              <Wrench className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span className="text-slate-200 text-[10px] font-bold">MK-1 Drill #{machine.id}</span>
            </div>
            <span className="text-cyan-300 text-[10px] font-extrabold bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/40">
              {machine.buffer_units}/{machine.buffer_capacity}
            </span>
          </div>
        )}

        {/* Action Feedback */}
        {feedback && (
          <div
            className={`mb-2 py-1 px-2 rounded text-center text-[10px] font-mono font-bold flex items-center justify-center space-x-1 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-neon-emerald'
                : 'bg-red-500/20 text-red-300 border border-red-500/50'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertTriangle className="w-3 h-3" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Extract Button */}
        <button
          onClick={handleHarvestClick}
          disabled={loading || isDepleted}
          className={`w-full py-1.5 rounded font-mono font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 bevel-both-r ${
            isDepleted
              ? 'bg-frontier-950 text-slate-600 border border-frontier-800 cursor-not-allowed'
              : 'bg-frontier-800 hover:bg-cyan-600 text-white border border-cyan-500/50 hover:shadow-neon-cyan active:scale-95'
          }`}
        >
          <Pickaxe className="w-3.5 h-3.5" />
          <span>{loading ? 'COMMITTING...' : isDepleted ? 'EXHAUSTED' : 'EXTRACT ORE'}</span>
        </button>
      </div>

      {/* 2. Holographic Energy Stalk Line */}
      <div className="w-[2px] h-6 bg-gradient-to-b from-cyan-400 via-cyan-500 to-transparent pointer-events-none" />

      {/* 3. Illustrated Ground Diorama (Visual Trees, Mines, Crystals, Drop Pod) */}
      <div className="relative pointer-events-none flex items-center justify-center -mt-2">
        {machine && (
          <DrillRigGraphic storedUnits={machine.buffer_units} capacity={machine.buffer_capacity} />
        )}
        <BiomeGraphic remainingUnits={node.remaining_units} maxCapacity={node.max_capacity} />
      </div>
    </div>
  );
}
