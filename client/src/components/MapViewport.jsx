import React, { useRef } from 'react';
import NodeCard from './NodeCard';
import TerrainEnvironment from './TerrainEnvironment';

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
      {/* 2500x1800 Seamless Planetary Terrain Surface */}
      <div
        style={{
          width: `${MAP_WIDTH}px`,
          height: `${MAP_HEIGHT}px`,
          transform: `translate(${panPosition.x}px, ${panPosition.y}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.15s ease-out',
        }}
        className="relative hex-grid-pattern border-2 border-frontier-800"
      >
        {/* 1. Sector Grid Overlay (Coordinates A-1 through D-5) */}
        <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 pointer-events-none border border-frontier-800">
          {['A', 'B', 'C', 'D'].map((row) =>
            [1, 2, 3, 4, 5].map((col) => (
              <div
                key={`${row}-${col}`}
                className="border border-slate-800/40 p-4 font-mono text-xs text-cyan-400/25 font-bold flex justify-between items-start"
              >
                <span>SECTOR [{row}-{col}]</span>
                <span className="text-[9px] text-slate-700">GRID // 0{col}</span>
              </div>
            ))
          )}
        </div>

        {/* 2. Rich Continuous Environment Layer (Forest belts, Mountain chains, Pipes, Craters) */}
        <TerrainEnvironment />

        {/* 3. Ambient Volumetric Biome Glow Wells */}
        <div className="absolute top-[200px] left-[350px] w-[550px] h-[550px] bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-[350px] left-[1050px] w-[650px] h-[650px] bg-amber-600/20 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-[300px] left-[1700px] w-[550px] h-[550px] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-[1200px] left-[1100px] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />

        {/* 4. Interactive Resource Nodes with Ground Dioramas & Holographic Cards */}
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
