import React, { useRef, useState, useEffect } from 'react';
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

  // Mouse drag handlers for local viewport panning (Zero Server Netcode)
  const handleMouseDown = (e) => {
    // Only drag with left mouse button when not clicking a button/card
    if (e.button !== 0) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...panPosition };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    // Constrain pan within reasonable bounds
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
      {/* 2500x1800 Planetary Canvas */}
      <div
        style={{
          width: `${MAP_WIDTH}px`,
          height: `${MAP_HEIGHT}px`,
          transform: `translate(${panPosition.x}px, ${panPosition.y}px)`,
          transition: isDragging.current ? 'none' : 'transform 0.15s ease-out',
        }}
        className="relative bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px]"
      >
        {/* Sector Grid Overlay (A-1 through E-5) */}
        <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 pointer-events-none opacity-20 border border-slate-800">
          {['A', 'B', 'C', 'D'].map((row) =>
            [1, 2, 3, 4, 5].map((col) => (
              <div
                key={`${row}-${col}`}
                className="border border-slate-800/80 p-3 font-mono text-sm text-cyan-400/60 font-bold"
              >
                SECTOR {row}-{col}
              </div>
            ))
          )}
        </div>

        {/* Ambient Biome Illustrations / Highlights */}
        <div className="absolute top-[200px] left-[350px] w-96 h-96 bg-emerald-950/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[350px] left-[1000px] w-[500px] h-[500px] bg-amber-950/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[300px] left-[1650px] w-96 h-96 bg-cyan-950/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-[1200px] left-[1100px] w-80 h-80 bg-purple-950/30 rounded-full blur-3xl pointer-events-none" />

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
