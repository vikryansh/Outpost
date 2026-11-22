import React, { useRef } from 'react';
import NodeCard from './NodeCard';
import TerrainEnvironment from './TerrainEnvironment';

const MAP_WIDTH = 2500;
const MAP_HEIGHT = 1400;

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
      {/* 2500x1400 Seamless Planetary Terrain Surface */}
      <div
        style={{
          width: `${MAP_WIDTH}px`,
          height: `${MAP_HEIGHT}px`,
          transform: `translate(${panPosition.x}px, ${panPosition.y}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.15s ease-out',
        }}
        className="relative overflow-hidden border-2 border-frontier-800"
      >
        {/* 1. High-Resolution Painted Planetary Terrain Landscape */}
        <img
          src="/terrain_map_bg.jpg"
          alt="Sector 9 Planetary Terrain"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none brightness-95 contrast-105"
        />

        {/* 2. Tactical Hex & Sector Coordinates Overlay */}
        <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 pointer-events-none border border-frontier-800/40">
          {['A', 'B', 'C', 'D'].map((row) =>
            [1, 2, 3, 4, 5].map((col) => (
              <div
                key={`${row}-${col}`}
                className="border border-cyan-500/10 p-3 font-mono text-xs text-cyan-400/20 font-bold flex justify-between items-start"
              >
                <span>SECTOR [{row}-{col}]</span>
                <span className="text-[9px] text-slate-500/40">GRID // 0{col}</span>
              </div>
            ))
          )}
        </div>

        {/* 3. Rich Vector Atmosphere & Tactical Pipeline Overlay */}
        <TerrainEnvironment />

        {/* 4. Ambient Volumetric Biome Glow Wells */}
        {/* West Forest Canopy Glow */}
        <div className="absolute top-[100px] left-[150px] w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
        {/* Central Landing Crater Glow */}
        <div className="absolute top-[450px] left-[1050px] w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[130px] pointer-events-none" />
        {/* Northeast Volcanic Magma Glow */}
        <div className="absolute top-[100px] left-[1500px] w-[700px] h-[500px] bg-orange-600/20 rounded-full blur-[150px] pointer-events-none" />
        {/* Southeast Crystal Geode Cave Glow */}
        <div className="absolute top-[850px] left-[1650px] w-[600px] h-[500px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />

        {/* 5. Interactive Resource Nodes with Ground Dioramas & Sleek Tactical Pins */}
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
