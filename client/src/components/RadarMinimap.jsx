import React from 'react';
import { Crosshair, Compass } from 'lucide-react';

const MAP_WIDTH = 2500;
const MAP_HEIGHT = 1800;
const MINI_WIDTH = 240;
const MINI_HEIGHT = 175;

export default function RadarMinimap({ nodes, panPosition, onPanTo, activePing }) {
  const scaleX = MINI_WIDTH / MAP_WIDTH;
  const scaleY = MINI_HEIGHT / MAP_HEIGHT;

  const viewWidth = window.innerWidth * scaleX;
  const viewHeight = (window.innerHeight - 168) * scaleY;
  const viewX = Math.max(0, -panPosition.x * scaleX);
  const viewY = Math.max(0, -panPosition.y * scaleY);

  const handleMinimapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const targetMapX = clickX / scaleX;
    const targetMapY = clickY / scaleY;

    const newPanX = -targetMapX + window.innerWidth / 2;
    const newPanY = -targetMapY + (window.innerHeight - 168) / 2;

    onPanTo({ x: newPanX, y: newPanY });
  };

  return (
    <div className="absolute bottom-32 right-[400px] z-30 select-none shadow-2xl">
      <div className="bg-frontier-900/95 border-2 border-frontier-700 rounded-lg p-2.5 backdrop-blur-md bevel-both-r shadow-neon-cyan">
        {/* Header */}
        <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 mb-1.5 px-1 font-bold">
          <div className="flex items-center space-x-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>TACTICAL RADAR HUD</span>
          </div>
          <span className="text-slate-400">RANGE: 30KM</span>
        </div>

        {/* Radar Screen with Sweep Effect */}
        <div
          onClick={handleMinimapClick}
          style={{ width: `${MINI_WIDTH}px`, height: `${MINI_HEIGHT}px` }}
          className="relative bg-[#020617] border border-cyan-500/40 rounded overflow-hidden cursor-crosshair shadow-inner"
        >
          {/* Concentric Range Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-36 h-36 rounded-full border border-cyan-500/20" />
            <div className="w-24 h-24 rounded-full border border-cyan-500/25" />
            <div className="w-12 h-12 rounded-full border border-cyan-500/30" />
          </div>

          {/* Crosshairs Axis */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
            <div className="w-full h-[1px] bg-cyan-400" />
            <div className="h-full w-[1px] bg-cyan-400" />
          </div>

          {/* 360-degree Rotating Radar Sweep Beam */}
          <div className="absolute inset-0 pointer-events-none animate-radar-sweep origin-center">
            <div className="w-1/2 h-1/2 bg-gradient-to-br from-cyan-400/25 to-transparent rounded-tl-full" />
          </div>

          {/* Node Blips */}
          {nodes.map((node) => {
            const x = node.coord_x * scaleX;
            const y = node.coord_y * scaleY;
            const dotColor =
              node.resource_type === 'timber'
                ? 'bg-emerald-400 shadow-neon-emerald'
                : node.resource_type === 'iron_ore'
                ? 'bg-amber-400 shadow-neon-amber'
                : node.resource_type === 'copper_ore'
                ? 'bg-cyan-400 shadow-neon-cyan'
                : 'bg-purple-400 shadow-neon-purple';

            return (
              <div
                key={node.id}
                style={{ left: `${x}px`, top: `${y}px` }}
                className={`absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 ${dotColor} ${
                  node.remaining_units <= 0 ? 'opacity-20' : 'animate-pulse'
                }`}
              />
            );
          })}

          {/* Camera Viewport Indicator Box */}
          <div
            style={{
              left: `${viewX}px`,
              top: `${viewY}px`,
              width: `${viewWidth}px`,
              height: `${viewHeight}px`,
            }}
            className="absolute border border-cyan-300 bg-cyan-400/15 pointer-events-none rounded-xs transition-all duration-75 shadow-neon-cyan"
          />
        </div>
      </div>
    </div>
  );
}
