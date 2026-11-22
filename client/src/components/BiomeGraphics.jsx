import React from 'react';

/**
 * High-detail visual terrain illustrations for Outpost planetary nodes.
 * Recreates the lush forests, craggy volcanic mines, crystal spires, and drop pods from the concept artwork.
 */

// 1. Forest Biome: Dense alien pine trees, mossy grass terrain, and spore particles
export function ForestBiome({ remainingUnits, maxCapacity }) {
  const isHealthy = remainingUnits > 0;
  return (
    <div className="relative w-44 h-28 flex items-center justify-center pointer-events-none select-none">
      {/* Ground Grass / Moss Patch */}
      <svg viewBox="0 0 180 110" className="w-full h-full drop-shadow-[0_10px_15px_rgba(16,185,129,0.25)]">
        {/* Soft grass mound */}
        <ellipse cx="90" cy="70" rx="75" ry="32" fill="#062817" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.5" />
        <ellipse cx="90" cy="72" rx="60" ry="22" fill="#041a0f" />
        
        {/* Grass tufts */}
        <path d="M45,72 L42,62 M48,73 L47,60 M52,74 L54,63" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M125,75 L123,65 M129,76 L131,64 M134,77 L137,66" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M85,82 L84,72 M89,83 L92,71" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />

        {/* Tree 1: Left Pine */}
        <g transform="translate(30, 20)">
          <rect x="22" y="38" width="6" height="18" fill="#3d2110" />
          <polygon points="25,10 10,40 40,40" fill={isHealthy ? "#065f46" : "#27272a"} />
          <polygon points="25,2 14,26 36,26" fill={isHealthy ? "#047857" : "#3f3f46"} />
          <polygon points="25,-4 18,14 32,14" fill={isHealthy ? "#10b981" : "#52525b"} />
        </g>

        {/* Tree 2: Center Big Pine */}
        <g transform="translate(65, 8)">
          <rect x="22" y="44" width="8" height="22" fill="#2d180c" />
          <polygon points="26,12 8,46 44,46" fill={isHealthy ? "#044e39" : "#18181b"} />
          <polygon points="26,2 12,30 40,30" fill={isHealthy ? "#059669" : "#27272a"} />
          <polygon points="26,-6 16,16 36,16" fill={isHealthy ? "#34d399" : "#3f3f46"} />
        </g>

        {/* Tree 3: Right Pine */}
        <g transform="translate(105, 24)">
          <rect x="22" y="34" width="6" height="16" fill="#3d2110" />
          <polygon points="25,8 12,36 38,36" fill={isHealthy ? "#065f46" : "#27272a"} />
          <polygon points="25,0 15,22 35,22" fill={isHealthy ? "#10b981" : "#3f3f46"} />
          <polygon points="25,-6 19,10 31,10" fill={isHealthy ? "#6ee7b7" : "#52525b"} />
        </g>
      </svg>
    </div>
  );
}

// 2. Iron Mine Biome: Craggy volcanic rock outcrops, molten iron veins, and ore rubble
export function IronMineBiome({ remainingUnits }) {
  const isHealthy = remainingUnits > 0;
  return (
    <div className="relative w-44 h-28 flex items-center justify-center pointer-events-none select-none">
      <svg viewBox="0 0 180 110" className="w-full h-full drop-shadow-[0_10px_15px_rgba(245,158,11,0.25)]">
        {/* Rocky Gravel Base */}
        <ellipse cx="90" cy="72" rx="78" ry="30" fill="#1c140d" stroke="#b45309" strokeWidth="1.5" strokeOpacity="0.4" />
        <ellipse cx="90" cy="74" rx="64" ry="20" fill="#0f0b07" />

        {/* Molten / Raw Iron Seams */}
        {isHealthy && (
          <path
            d="M50,75 Q70,72 90,78 T135,72"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeDasharray="4 2"
            className="animate-pulse"
          />
        )}

        {/* Boulders & Ore Crags */}
        {/* Big Left Iron Boulder */}
        <polygon points="35,76 45,45 70,40 80,68 60,82" fill="#291e17" stroke="#451a03" strokeWidth="1" />
        <polygon points="45,45 70,40 62,56 42,58" fill="#451a03" />
        {isHealthy && <polygon points="50,48 58,45 56,54 48,55" fill="#f59e0b" />}

        {/* Central High Iron Peak */}
        <polygon points="72,78 88,32 110,28 122,55 105,82" fill="#3d2a1f" stroke="#78350f" strokeWidth="1" />
        <polygon points="88,32 110,28 100,50 82,52" fill="#78350f" />
        {/* Shiny Raw Iron Vein Highlights */}
        {isHealthy && (
          <>
            <polygon points="90,36 102,33 96,44 87,42" fill="#fbbf24" />
            <polygon points="98,55 110,50 106,64 95,62" fill="#f59e0b" />
          </>
        )}

        {/* Right Jagged Rock */}
        <polygon points="115,76 130,50 148,54 152,74 135,82" fill="#291e17" stroke="#451a03" strokeWidth="1" />
        <polygon points="130,50 148,54 140,64 126,62" fill="#5c2606" />
        {isHealthy && <polygon points="133,54 142,56 138,62 131,60" fill="#d97706" />}
      </svg>
    </div>
  );
}

// 3. Copper Ridge Biome: Oxidized turquoise mineral rock faces with glowing copper strata
export function CopperMineBiome({ remainingUnits }) {
  const isHealthy = remainingUnits > 0;
  return (
    <div className="relative w-44 h-28 flex items-center justify-center pointer-events-none select-none">
      <svg viewBox="0 0 180 110" className="w-full h-full drop-shadow-[0_10px_15px_rgba(6,182,212,0.25)]">
        {/* Turquoise Oxide Ground Ring */}
        <ellipse cx="90" cy="72" rx="76" ry="30" fill="#082226" stroke="#0891b2" strokeWidth="1.5" strokeOpacity="0.4" />
        <ellipse cx="90" cy="74" rx="62" ry="20" fill="#041214" />

        {/* Copper Seam Line */}
        {isHealthy && (
          <path
            d="M48,70 Q80,65 110,75 T140,68"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeDasharray="5 3"
            className="animate-pulse"
          />
        )}

        {/* Copper Crag Left */}
        <polygon points="38,78 52,48 76,44 82,72 60,82" fill="#164e63" stroke="#0e7490" strokeWidth="1" />
        <polygon points="52,48 76,44 68,58 48,60" fill="#0891b2" />
        {isHealthy && <polygon points="56,50 68,48 64,55 54,54" fill="#67e8f9" />}

        {/* Central Copper Spire */}
        <polygon points="76,80 94,30 116,26 126,58 108,82" fill="#0e7490" stroke="#06b6d4" strokeWidth="1" />
        <polygon points="94,30 116,26 108,46 90,48" fill="#0891b2" />
        {isHealthy && (
          <>
            <polygon points="98,34 110,30 104,42 94,40" fill="#a5f3fc" />
            <polygon points="102,52 116,48 112,62 100,60" fill="#22d3ee" />
          </>
        )}

        {/* Copper Crag Right */}
        <polygon points="120,78 134,52 152,56 154,76 138,82" fill="#164e63" stroke="#0891b2" strokeWidth="1" />
        <polygon points="134,52 152,56 144,65 130,64" fill="#0e7490" />
      </svg>
    </div>
  );
}

// 4. Crystal Geode Biome: Glowing geometric amethyst/sapphire crystal spires with facets
export function CrystalGeodeBiome({ remainingUnits }) {
  const isHealthy = remainingUnits > 0;
  return (
    <div className="relative w-44 h-28 flex items-center justify-center pointer-events-none select-none">
      <svg viewBox="0 0 180 110" className="w-full h-full drop-shadow-[0_10px_20px_rgba(168,85,247,0.35)]">
        {/* Crystal Bed Mound */}
        <ellipse cx="90" cy="72" rx="74" ry="28" fill="#240e3b" stroke="#9333ea" strokeWidth="1.5" strokeOpacity="0.5" />
        <ellipse cx="90" cy="74" rx="60" ry="18" fill="#150724" />

        {/* Radiant Crystal Core Glow */}
        {isHealthy && (
          <ellipse cx="90" cy="65" rx="30" ry="12" fill="#a855f7" opacity="0.3" className="animate-pulse" />
        )}

        {/* Left Crystal Spire */}
        <polygon points="50,75 58,35 68,45 62,80" fill={isHealthy ? "#7e22ce" : "#3f3f46"} stroke="#a855f7" strokeWidth="0.8" />
        <polygon points="58,35 68,45 64,55 56,50" fill={isHealthy ? "#c084fc" : "#71717a"} />

        {/* Main Center Crystal Spire (Tall & Faceted) */}
        <polygon points="80,78 90,14 104,26 98,82" fill={isHealthy ? "#6b21a8" : "#27272a"} stroke="#c084fc" strokeWidth="1" />
        <polygon points="90,14 104,26 96,50 86,45" fill={isHealthy ? "#e9d5ff" : "#52525b"} />
        <polygon points="86,45 96,50 94,76 82,74" fill={isHealthy ? "#a855f7" : "#3f3f46"} />

        {/* Right Crystal Spire */}
        <polygon points="106,78 118,30 126,40 120,80" fill={isHealthy ? "#7e22ce" : "#3f3f46"} stroke="#a855f7" strokeWidth="0.8" />
        <polygon points="118,30 126,40 122,54 114,48" fill={isHealthy ? "#d8b4fe" : "#71717a"} />

        {/* Front Small Crystal Clusters */}
        <polygon points="70,82 74,58 80,64 76,84" fill={isHealthy ? "#c084fc" : "#52525b"} />
        <polygon points="100,84 105,62 110,68 106,85" fill={isHealthy ? "#c084fc" : "#52525b"} />
      </svg>
    </div>
  );
}

// 5. Contested Orbital Supply Pod: Sci-fi metallic drop capsule with hazard stripes & beacon
export function OrbitalPodBiome({ remainingUnits }) {
  const isHealthy = remainingUnits > 0;
  return (
    <div className="relative w-44 h-28 flex items-center justify-center pointer-events-none select-none">
      <svg viewBox="0 0 180 110" className="w-full h-full drop-shadow-[0_10px_25px_rgba(234,179,8,0.4)]">
        {/* Impact Scorch Crater */}
        <ellipse cx="90" cy="74" rx="76" ry="28" fill="#1c1917" stroke="#ca8a04" strokeWidth="1.5" strokeDasharray="6 3" />
        <ellipse cx="90" cy="76" rx="55" ry="18" fill="#0c0a09" />

        {/* Capsule Landing Legs */}
        <line x1="75" y1="65" x2="60" y2="82" stroke="#78716c" strokeWidth="4" strokeLinecap="round" />
        <line x1="105" y1="65" x2="120" y2="82" stroke="#78716c" strokeWidth="4" strokeLinecap="round" />
        <line x1="90" y1="68" x2="90" y2="84" stroke="#57534e" strokeWidth="4" strokeLinecap="round" />

        {/* Main Pod Capsule Body */}
        <rect x="74" y="32" width="32" height="40" rx="6" fill="#292524" stroke="#eab308" strokeWidth="1.5" />
        
        {/* Golden Front Shielding */}
        <rect x="78" y="36" width="24" height="20" rx="3" fill="#ca8a04" />
        <rect x="80" y="38" width="20" height="16" rx="2" fill="#facc15" />

        {/* Industrial Yellow/Black Hazard Stripes */}
        <g transform="translate(74, 58)">
          <rect x="0" y="0" width="32" height="8" fill="#1c1917" />
          <polygon points="4,0 8,0 4,8 0,8" fill="#eab308" />
          <polygon points="12,0 16,0 12,8 8,8" fill="#eab308" />
          <polygon points="20,0 24,0 20,8 16,8" fill="#eab308" />
          <polygon points="28,0 32,0 28,8 24,8" fill="#eab308" />
        </g>

        {/* Top Antenna Beacon with Flashing Red/Gold Light */}
        <line x1="90" y1="32" x2="90" y2="16" stroke="#a8a29e" strokeWidth="2" />
        {isHealthy ? (
          <>
            <circle cx="90" cy="14" r="5" fill="#ef4444" className="animate-ping" />
            <circle cx="90" cy="14" r="3" fill="#facc15" />
          </>
        ) : (
          <circle cx="90" cy="14" r="3" fill="#57534e" />
        )}
      </svg>
    </div>
  );
}

// 6. Deployed MK-1 Automated Mining Drill Rig (Pumps when active)
export function DrillRigGraphic({ storedUnits, capacity }) {
  return (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-28 h-20 pointer-events-none select-none z-10">
      <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
        {/* Rig Legs & Girders */}
        <line x1="30" y1="70" x2="45" y2="25" stroke="#334155" strokeWidth="3" />
        <line x1="70" y1="70" x2="55" y2="25" stroke="#334155" strokeWidth="3" />
        <line x1="35" y1="50" x2="65" y2="50" stroke="#475569" strokeWidth="2" />

        {/* Motor Chassis */}
        <rect x="38" y="15" width="24" height="18" rx="2" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
        <circle cx="50" cy="24" r="4" fill="#06b6d4" className="animate-pulse" />

        {/* Drill Piston Rod (Pumps up and down) */}
        <g className="animate-bounce">
          <line x1="50" y1="33" x2="50" y2="65" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
          <polygon points="46,65 54,65 50,72" fill="#38bdf8" />
        </g>
      </svg>
    </div>
  );
}
