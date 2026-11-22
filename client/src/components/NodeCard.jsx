import React, { useState } from 'react';
import { Trees, Pickaxe, Zap, Box, Wrench, CheckCircle2, AlertCircle } from 'lucide-react';

const ICONS = {
  timber: Trees,
  iron_ore: Pickaxe,
  copper_ore: Zap,
  energy_crystal: Box,
  circuit_board: Box,
};

const BIOME_COLORS = {
  timber: { border: 'border-emerald-500/40', bg: 'bg-emerald-950/40', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  iron_ore: { border: 'border-amber-500/40', bg: 'bg-amber-950/40', text: 'text-amber-400', bar: 'bg-amber-500' },
  copper_ore: { border: 'border-cyan-500/40', bg: 'bg-cyan-950/40', text: 'text-cyan-400', bar: 'bg-cyan-500' },
  energy_crystal: { border: 'border-purple-500/40', bg: 'bg-purple-950/40', text: 'text-purple-400', bar: 'bg-purple-500' },
  circuit_board: { border: 'border-gold/60', bg: 'bg-yellow-950/60', text: 'text-gold', bar: 'bg-gold' },
};

export default function NodeCard({ node, machine, onHarvest, onDeploy, isOwner }) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text }

  const Icon = ICONS[node.resource_type] || Box;
  const theme = BIOME_COLORS[node.resource_type] || BIOME_COLORS.timber;
  const isDepleted = node.remaining_units <= 0;
  const capacityPercent = Math.round((node.remaining_units / node.max_capacity) * 100);

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
      className={`w-64 rounded-lg backdrop-blur-md p-3.5 border transition-all duration-200 select-none shadow-2xl ${
        theme.border
      } ${theme.bg} ${
        feedback?.type === 'error' ? 'animate-shake border-red-500/80 bg-red-950/60' : ''
      }`}
    >
      {/* Header with Sector Tag and Node Name */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded bg-frontier-950/80 border ${theme.border}`}>
            <Icon className={`w-4 h-4 ${theme.text}`} />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-mono bg-frontier-900/90 text-cyan-300 px-1.5 py-0.5 rounded border border-frontier-700">
                {node.grid_sector}
              </span>
              <span className="text-[10px] font-mono text-slate-400">v{node.version}</span>
            </div>
            <h4 className="text-xs font-bold text-slate-100 truncate w-36" title={node.name}>
              {node.name}
            </h4>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
            isDepleted
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}
        >
          {isDepleted ? 'EXHAUSTED' : 'ACTIVE'}
        </span>
      </div>

      {/* Capacity Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
          <span>Capacity</span>
          <span className="text-slate-200 font-semibold">
            {node.remaining_units} / {node.max_capacity} Units
          </span>
        </div>
        <div className="w-full h-1.5 bg-frontier-950 rounded-full overflow-hidden border border-frontier-800">
          <div
            className={`h-full transition-all duration-300 ${theme.bar}`}
            style={{ width: `${capacityPercent}%` }}
          />
        </div>
      </div>

      {/* Deployed Machine Info (If present on this node) */}
      {machine && (
        <div className="mb-2 bg-frontier-950/80 p-2 rounded border border-cyan-500/30 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <Wrench className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span className="text-slate-300">MK-1 Drill #{machine.id}</span>
          </div>
          <span className="text-cyan-300 font-bold">
            Buffer: {machine.buffer_units}/{machine.buffer_capacity}
          </span>
        </div>
      )}

      {/* Floating Action Feedback */}
      {feedback && (
        <div
          className={`mb-2 py-1 px-2 rounded text-center text-[10px] font-mono font-bold flex items-center justify-center space-x-1.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
              : 'bg-red-500/20 text-red-300 border border-red-500/50'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <AlertCircle className="w-3 h-3" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Primary Action Button */}
      <button
        onClick={handleHarvestClick}
        disabled={loading || isDepleted}
        className={`w-full py-1.5 rounded font-mono font-bold text-xs uppercase tracking-wider transition-all duration-150 flex items-center justify-center space-x-1.5 ${
          isDepleted
            ? 'bg-frontier-900 text-slate-500 cursor-not-allowed border border-frontier-800'
            : 'bg-frontier-800 hover:bg-frontier-700 text-slate-100 border border-frontier-700 hover:border-slate-400 active:scale-95 shadow-md'
        }`}
      >
        <Pickaxe className="w-3.5 h-3.5" />
        <span>{loading ? 'TRANSACTING...' : isDepleted ? 'DEPLETED' : 'EXTRACT (1x)'}</span>
      </button>
    </div>
  );
}
