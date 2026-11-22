import React from 'react';
import { Crosshair } from 'lucide-react';

const MAP_WIDTH = 2500;
const MAP_HEIGHT = 1800;
const MINI_WIDTH = 220;
const MINI_HEIGHT = 160;

export default function RadarMinimap({ nodes, panPosition, onPanTo, activePing }) {
  const scaleX = MINI_WIDTH / MAP_WIDTH;
  const scaleY = MINI_HEIGHT / MAP_HEIGHT;

  // Viewport camera rectangle bounds
  const viewWidth = window.innerWidth * scaleX;
  const viewHeight = (window.innerHeight - 168) * scaleY;
  const viewX = Math.max(0, -panPosition.x * scaleX);
  const viewY = Math.max(0, -panPosition.y * scaleY);

  const handleMinimapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert minimap coordinate to main map offset
    const targetMapX = clickX / scaleX;
    const targetMapY = clickY / scaleY;

    // Center camera on target coordinate
    const newPanX = -targetMapX + window.innerWidth / 2;
    const newPanY = -targetMapY + (window.innerHeight - 168) / 2;

    onPanTo({ x: newPanX, y: newPanY });
  };

  return (
    <div className="absolute bottom-32 right-96 z-20 select-none shadow-2xl">
      <div className="bg-frontier-900/90 border border-frontier-700/80 rounded-lg p-2 backdrop-blur-md">
        <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 mb-1 px-1">
          <div className="flex items-center space-x-1">
            <Crosshair className="w-3 h-3 animate-spin" />
            <span>RADAR MINIMAP</span>
          </div>
          <span className="text-slate-400">SECTOR 9</span>
        </div>

        {/* Minimap Screen */}
        <div
          onClick={handleMinimapClick}
          style={{ width: `${MINI_WIDTH}px`, height: `${MINI_HEIGHT}px` }}
          className="relative bg-frontier-950 border border-frontier-800 rounded overflow-hidden cursor-crosshair"
        >
          {/* Subtle Sector Grid Lines */}
          <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 pointer-events-none opacity-20 border border-frontier-700" />

          {/* Render Nodes as Radar Dots */}
          {nodes.map((node) => {
            const x = node.coord_x * scaleX;
            const y = node.coord_y * scaleY;
            const dotColor =
              node.resource_type === 'timber'
                ? 'bg-emerald-400'
                : node.resource_type === 'iron_ore'
                ? 'bg-amber-400'
                : node.resource_type === 'copper_ore'
                ? 'bg-cyan-400'
                : 'bg-purple-400';

            return (
              <div
                key={node.id}
                style={{ left: `${x}px`, top: `${y}px` }}
                className={`absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 ${dotColor} ${
                  node.remaining_units <= 0 ? 'opacity-30' : 'animate-pulse'
                }`}
                title={`${node.name} (${node.remaining_units}/${node.max_capacity})`}
              />
            );
          })}

          {/* Active Event Radar Ping (e.g. Supply Pod Landing) */}
          {activePing && (
            <div
              style={{
                left: `${activePing.x * scaleX}px`,
                top: `${activePing.y * scaleY}px`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            >
              <span className="absolute w-6 h-6 rounded-full bg-red-500/40 animate-ping -translate-x-1/2 -translate-y-1/2" />
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 block -translate-x-1/2 -translate-y-1/2" />
            </div>
          )}

          {/* Camera Viewport Indicator Box */}
          <div
            style={{
              left: `${viewX}px`,
              top: `${viewY}px`,
              width: `${viewWidth}px`,
              height: `${viewHeight}px`,
            }}
            className="absolute border border-cyan-400/70 bg-cyan-500/10 pointer-events-none rounded-sm transition-all duration-75"
          />
        </div>
      </div>
    </div>
  );
}
