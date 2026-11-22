import React, { useRef, useState } from 'react';
import NodeCard from './NodeCard';

const MAP_WIDTH = 2500;
const MAP_HEIGHT = 1800;

export default function MapViewport({
  nodes,
  machines,
  onHarvest,
  onDeployMachine,
  panPosition,
  setPanPosition,
}) {
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...panPosition };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    const newX = Math.min(200, Math.max(-(MAP_WIDTH - window.innerWidth + 200), panStart.current.x + dx));
    const newY = Math.min(200, Math.max(-(MAP_HEIGHT - window.innerHeight + 200), panStart.current.y + dy));

    setPanPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative flex-1 h-[calc(100vh-56px-112px)] overflow-hidden bg-[#030712] cursor-grab active:cursor-grabbing select-none"
    >
      {/* 2500x1800 Atmospheric Planetary Surface */}
      <div
        style={{
          width: `${MAP_WIDTH}px`,
          height: `${MAP_HEIGHT}px`,
          transform: `translate(${panPosition.x}px, ${panPosition.y}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.15s ease-out',
        }}
        className="relative hex-grid-pattern border-2 border-frontier-800/80"
      >
        {/* Tactical Sector Coordinate Grid (A-1 through D-5) */}
        <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 pointer-events-none border border-frontier-800">
          {['A', 'B', 'C', 'D'].map((row) =>
            [1, 2, 3, 4, 5].map((col) => (
              <div
                key={`${row}-${col}`}
                className="border border-slate-800/60 p-4 font-mono text-xs text-cyan-400/40 font-bold flex justify-between items-start"
              >
                <span>SECTOR [{row}-{col}]</span>
                <span className="text-[9px] text-slate-700">GRID REF // 0{col}</span>
              </div>
            ))
          )}
        </div>

        {/* Ambient Biome Lighting & Planetary Energy Wells */}
        <div className="absolute top-[250px] left-[400px] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[400px] left-[1150px] w-[600px] h-[600px] bg-amber-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-[350px] left-[1800px] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[1250px] left-[1200px] w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-[130px] pointer-events-none" />

        {/* Ground Conduit Power Lines (Connecting Nodes to Base) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
          <line x1="450" y1="320" x2="1100" y2="480" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 6" />
          <line x1="1100" y1="480" x2="1750" y2="400" stroke="#06b6d4" strokeWidth="2" strokeDasharray="6 6" />
          <line x1="1100" y1="480" x2="1250" y2="1400" stroke="#a855f7" strokeWidth="2" strokeDasharray="8 8" />
        </svg>

        {/* Render Interactive Resource Nodes */}
        {nodes.map((node) => {
          const attachedMachine = machines.find((m) => m.node_id === node.id);
          return (
            <NodeCard
              key={node.id}
              node={node}
              machine={attachedMachine}
              onHarvest={onHarvest}
              onDeploy={onDeployMachine}
            />
          );
        })}
      </div>
    </div>
  );
}
