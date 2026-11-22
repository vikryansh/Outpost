import React, { useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import NodeCard from './NodeCard';
import TerrainEnvironment from './TerrainEnvironment';

const MAP_WIDTH = 2500;
const MAP_HEIGHT = 1400;

export default function MapViewport({
  nodes,
  machines,
  inventory,
  currentPlayer,
  onHarvest,
  onDeployMachine,
  onCollectMachine,
  panPosition,
  setPanPosition,
}) {
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1.0);

  const hasDrillInInventory = (inventory || []).some(
    (i) => i.item_type === 'mk1_drill' && i.quantity > 0
  );

  // Wheel zoom handler
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomDelta = -e.deltaY * 0.0012;
    setZoomLevel((prev) => Math.min(1.4, Math.max(0.5, prev + zoomDelta)));
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

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

    const viewportW = window.innerWidth - 390;
    const viewportH = window.innerHeight - 168;

    const scaledWidth = MAP_WIDTH * zoomLevel;
    const scaledHeight = MAP_HEIGHT * zoomLevel;

    const minX = Math.min(0, -(scaledWidth - viewportW));
    const minY = Math.min(0, -(scaledHeight - viewportH));

    const newX = Math.min(100, Math.max(minX - 100, panStart.current.x + dx));
    const newY = Math.min(100, Math.max(minY - 100, panStart.current.y + dy));

    setPanPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleFitScreen = () => {
    const viewportW = window.innerWidth - 390;
    const viewportH = window.innerHeight - 168;
    const scale = Math.min(viewportW / MAP_WIDTH, viewportH / MAP_HEIGHT);
    setZoomLevel(Math.max(0.5, Math.min(1.2, scale * 1.05)));
    setPanPosition({ x: 0, y: 0 });
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
          transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
          transformOrigin: 'top left',
          transition: isDragging.current ? 'none' : 'transform 0.12s ease-out',
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
        <div className="absolute top-[100px] left-[150px] w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-[520px] left-[1180px] w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-[100px] left-[1500px] w-[700px] h-[500px] bg-orange-600/20 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-[950px] left-[1750px] w-[600px] h-[500px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />

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
              onCollect={onCollectMachine}
              hasDrillInInventory={hasDrillInInventory}
              currentPlayer={currentPlayer}
            />
          );
        })}
      </div>

      {/* Floating Tactical Zoom Controls HUD (Bottom Left) */}
      <div className="absolute bottom-5 left-5 z-30 flex items-center bg-frontier-950/90 border border-frontier-700/80 rounded-md p-1 shadow-2xl backdrop-blur-md font-mono text-xs text-slate-300 space-x-1">
        <button
          onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.15))}
          title="Zoom Out (Mouse Wheel Down)"
          className="p-1.5 hover:bg-frontier-800 rounded text-cyan-400 hover:text-cyan-200 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="px-2 py-0.5 bg-frontier-900 rounded text-[11px] font-bold text-cyan-300 min-w-[48px] text-center border border-frontier-800">
          {Math.round(zoomLevel * 100)}%
        </span>

        <button
          onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.15))}
          title="Zoom In (Mouse Wheel Up)"
          className="p-1.5 hover:bg-frontier-800 rounded text-cyan-400 hover:text-cyan-200 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-frontier-800 mx-1" />

        <button
          onClick={handleFitScreen}
          title="Fit Sector to Screen"
          className="px-2 py-1 hover:bg-frontier-800 rounded text-[10px] font-bold text-slate-300 hover:text-white flex items-center space-x-1 transition-colors"
        >
          <Maximize2 className="w-3 h-3" />
          <span>FIT</span>
        </button>

        <button
          onClick={() => {
            setZoomLevel(1.0);
            setPanPosition({ x: -400, y: -200 });
          }}
          title="Reset View 100%"
          className="p-1.5 hover:bg-frontier-800 rounded text-slate-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
