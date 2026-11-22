import React from 'react';

/**
 * High-detail visual terrain illustrations for Outpost planetary nodes.
 * Recreates the lush forests, craggy volcanic mines, crystal spires, and drop pods from the concept artwork.
 */

// 1. Forest Biome: Dense alien pine trees, mossy grass terrain, and bioluminescent spore particles
export function ForestBiome({ remainingUnits, maxCapacity }) {
  const isHealthy = remainingUnits > 0;
  return (
    <div className="relative w-48 h-32 flex items-center justify-center select-none transition-transform group-hover:scale-105">
      <svg viewBox="0 0 200 130" className="w-full h-full drop-shadow-[0_10px_20px_rgba(16,185,129,0.35)]">
        {/* Soft bioluminescent grass & moss mound */}
        <ellipse cx="100" cy="85" rx="85" ry="36" fill="#042113" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.6" />
        <ellipse cx="100" cy="87" rx="68" ry="26" fill="#02140b" />

        {/* Grass tufts & bioluminescent fungi */}
        <path d="M45,86 L42,74 M48,87 L47,72 M52,88 L54,75" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M145,89 L143,77 M149,90 L151,76 M154,91 L157,78" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M95,96 L94,84 M99,97 L102,83" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" />

        {/* Glowing alien spore dots */}
        {isHealthy && (
          <g className="animate-pulse">
            <circle cx="55" cy="50" r="2.5" fill="#6ee7b7" opacity="0.9" />
            <circle cx="85" cy="30" r="3" fill="#a7f3d0" opacity="0.9" />
            <circle cx="120" cy="45" r="2.5" fill="#34d399" opacity="0.9" />
            <circle cx="145" cy="65" r="2" fill="#6ee7b7" opacity="0.9" />
          </g>
        )}

        {/* Tree 1: Left Alien Pine */}
        <g transform="translate(35, 30)">
          <rect x="22" y="44" width="7" height="20" rx="1" fill="#2d180c" />
          <polygon points="25,12 8,46 42,46" fill={isHealthy ? "#065f46" : "#27272a"} />
          <polygon points="25,2 12,30 38,30" fill={isHealthy ? "#047857" : "#3f3f46"} />
          <polygon points="25,-6 16,16 34,16" fill={isHealthy ? "#10b981" : "#52525b"} />
          {isHealthy && <circle cx="25" cy="-6" r="3" fill="#6ee7b7" className="animate-pulse" />}
        </g>

        {/* Tree 2: Center Giant Canopy Tree */}
        <g transform="translate(75, 12)">
          <rect x="22" y="52" width="10" height="26" rx="2" fill="#1e1008" />
          <polygon points="27,14 6,54 48,54" fill={isHealthy ? "#044e39" : "#18181b"} />
          <polygon points="27,2 10,34 44,34" fill={isHealthy ? "#059669" : "#27272a"} />
          <polygon points="27,-8 14,18 40,18" fill={isHealthy ? "#34d399" : "#3f3f46"} />
          {isHealthy && (
            <>
              <circle cx="27" cy="-8" r="4" fill="#a7f3d0" className="animate-pulse" />
              <circle cx="12" cy="18" r="2.5" fill="#6ee7b7" />
              <circle cx="42" cy="18" r="2.5" fill="#6ee7b7" />
            </>
          )}
        </g>

        {/* Tree 3: Right Alien Pine */}
        <g transform="translate(120, 36)">
          <rect x="22" y="38" width="7" height="18" rx="1" fill="#2d180c" />
          <polygon points="25,10 10,40 40,40" fill={isHealthy ? "#065f46" : "#27272a"} />
          <polygon points="25,0 14,24 36,24" fill={isHealthy ? "#10b981" : "#3f3f46"} />
          <polygon points="25,-6 18,12 32,12" fill={isHealthy ? "#6ee7b7" : "#52525b"} />
        </g>
      </svg>
    </div>
  );
}

// 2. Iron Mine Biome: Craggy volcanic rock outcrops, molten iron veins, and ore rubble
export function IronMineBiome({ remainingUnits }) {
  const isHealthy = remainingUnits > 0;
  return (
    <div className="relative w-48 h-32 flex items-center justify-center select-none transition-transform group-hover:scale-105">
      <svg viewBox="0 0 200 130" className="w-full h-full drop-shadow-[0_10px_20px_rgba(245,158,11,0.35)]">
        {/* Rocky Gravel Base */}
        <ellipse cx="100" cy="86" rx="86" ry="34" fill="#1c140d" stroke="#b45309" strokeWidth="1.5" strokeOpacity="0.5" />
        <ellipse cx="100" cy="88" rx="70" ry="24" fill="#0f0b07" />

        {/* Molten / Raw Iron Seams */}
        {isHealthy && (
          <path
            d="M50,90 Q80,84 110,92 T155,86"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeDasharray="6 3"
            className="animate-pulse"
          />
        )}

        {/* Left Iron Boulder */}
        <polygon points="40,90 52,55 80,50 92,80 70,96" fill="#291e17" stroke="#451a03" strokeWidth="1.2" />
        <polygon points="52,55 80,50 72,68 48,70" fill="#451a03" />
        {isHealthy && <polygon points="58,58 68,54 65,65 55,66" fill="#f59e0b" />}

        {/* Central High Iron Peak */}
        <polygon points="82,92 100,38 126,34 140,65 120,96" fill="#3d2a1f" stroke="#78350f" strokeWidth="1.2" />
        <polygon points="100,38 126,34 115,60 94,62" fill="#78350f" />
        {/* Raw Iron Vein Highlights */}
        {isHealthy && (
          <>
            <polygon points="102,42 116,39 110,52 100,50" fill="#fbbf24" />
            <polygon points="112,65 126,60 120,76 108,74" fill="#f59e0b" />
          </>
        )}

        {/* Right Jagged Rock */}
        <polygon points="130,90 148,60 168,64 172,86 152,96" fill="#291e17" stroke="#451a03" strokeWidth="1.2" />
        <polygon points="148,60 168,64 158,76 142,74" fill="#5c2606" />
        {isHealthy && <polygon points="152,66 162,68 156,76 148,74" fill="#d97706" />}
      </svg>
    </div>
  );
}

// 3. Copper Ridge Biome: Oxidized turquoise mineral rock faces with glowing copper strata
export function CopperMineBiome({ remainingUnits }) {
  const isHealthy = remainingUnits > 0;
  return (
    <div className="relative w-48 h-32 flex items-center justify-center select-none transition-transform group-hover:scale-105">
      <svg viewBox="0 0 200 130" className="w-full h-full drop-shadow-[0_10px_20px_rgba(6,182,212,0.35)]">
        {/* Turquoise Oxide Ground Ring */}
        <ellipse cx="100" cy="86" rx="86" ry="34" fill="#082226" stroke="#0891b2" strokeWidth="1.5" strokeOpacity="0.5" />
        <ellipse cx="100" cy="88" rx="70" ry="24" fill="#041214" />

        {/* Copper Seam Line */}
        {isHealthy && (
          <path
            d="M52,84 Q90,78 125,90 T160,82"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3"
            strokeDasharray="6 3"
            className="animate-pulse"
          />
        )}

        {/* Copper Crag Left */}
        <polygon points="44,92 60,58 88,54 94,84 70,96" fill="#164e63" stroke="#0e7490" strokeWidth="1.2" />
        <polygon points="60,58 88,54 78,70 54,72" fill="#0891b2" />
        {isHealthy && <polygon points="65,60 78,58 74,66 62,65" fill="#67e8f9" />}

        {/* Central Copper Spire */}
        <polygon points="86,94 106,36 132,32 144,68 124,96" fill="#0e7490" stroke="#06b6d4" strokeWidth="1.2" />
        <polygon points="106,36 132,32 122,56 102,58" fill="#0891b2" />
        {isHealthy && (
          <>
            <polygon points="110,40 125,36 118,50 106,48" fill="#a5f3fc" />
            <polygon points="115,62 132,58 126,74 112,72" fill="#22d3ee" />
          </>
        )}

        {/* Copper Crag Right */}
        <polygon points="135,92 152,62 172,66 174,88 156,96" fill="#164e63" stroke="#0891b2" strokeWidth="1.2" />
        <polygon points="152,62 172,66 162,77 146,76" fill="#0e7490" />
      </svg>
    </div>
  );
}

// 4. Crystal Geode Biome: Glowing geometric amethyst/sapphire crystal spires with facets
export function CrystalGeodeBiome({ remainingUnits }) {
  const isHealthy = remainingUnits > 0;
  return (
    <div className="relative w-48 h-32 flex items-center justify-center select-none transition-transform group-hover:scale-105">
      <svg viewBox="0 0 200 130" className="w-full h-full drop-shadow-[0_10px_25px_rgba(168,85,247,0.4)]">
        {/* Crystal Bed Mound */}
        <ellipse cx="100" cy="86" rx="84" ry="32" fill="#240e3b" stroke="#9333ea" strokeWidth="1.5" strokeOpacity="0.6" />
        <ellipse cx="100" cy="88" rx="68" ry="22" fill="#150724" />

        {/* Radiant Crystal Core Glow */}
        {isHealthy && (
          <ellipse cx="100" cy="78" rx="36" ry="16" fill="#a855f7" opacity="0.4" className="animate-pulse" />
        )}

        {/* Left Crystal Spire */}
        <polygon points="56,90 66,42 78,54 70,95" fill={isHealthy ? "#7e22ce" : "#3f3f46"} stroke="#a855f7" strokeWidth="1" />
        <polygon points="66,42 78,54 74,66 64,60" fill={isHealthy ? "#c084fc" : "#71717a"} />

        {/* Main Center Crystal Spire (Tall & Faceted) */}
        <polygon points="90,94 102,18 118,32 110,98" fill={isHealthy ? "#6b21a8" : "#27272a"} stroke="#c084fc" strokeWidth="1.2" />
        <polygon points="102,18 118,32 110,58 98,52" fill={isHealthy ? "#e9d5ff" : "#52525b"} />
        <polygon points="98,52 110,58 106,90 92,88" fill={isHealthy ? "#a855f7" : "#3f3f46"} />

        {/* Right Crystal Spire */}
        <polygon points="120,94 134,36 144,48 136,96" fill={isHealthy ? "#7e22ce" : "#3f3f46"} stroke="#a855f7" strokeWidth="1" />
        <polygon points="134,36 144,48 138,64 130,58" fill={isHealthy ? "#d8b4fe" : "#71717a"} />

        {/* Front Small Crystal Clusters */}
        <polygon points="78,98 84,70 90,78 86,100" fill={isHealthy ? "#c084fc" : "#52525b"} />
        <polygon points="112,100 118,74 124,82 120,102" fill={isHealthy ? "#e9d5ff" : "#52525b"} />
      </svg>
    </div>
  );
}

// 5. Contested Orbital Supply Pod: Sci-fi metallic drop capsule with hazard stripes, thruster smoke & beacon
export function OrbitalPodBiome({ remainingUnits }) {
  const isHealthy = remainingUnits > 0;
  return (
    <div className="relative w-48 h-32 flex items-center justify-center select-none transition-transform group-hover:scale-105">
      <svg viewBox="0 0 200 130" className="w-full h-full drop-shadow-[0_10px_30px_rgba(234,179,8,0.5)]">
        {/* Impact Scorch Crater & Shockwaves */}
        <ellipse cx="100" cy="88" rx="86" ry="32" fill="#1c1917" stroke="#ca8a04" strokeWidth="1.5" strokeDasharray="6 3" />
        <ellipse cx="100" cy="90" rx="64" ry="22" fill="#0c0a09" />

        {/* Golden Thruster Shockwave Glow */}
        {isHealthy && (
          <ellipse cx="100" cy="88" rx="45" ry="16" fill="#facc15" opacity="0.25" className="animate-pulse" />
        )}

        {/* Capsule Landing Struts */}
        <line x1="84" y1="78" x2="68" y2="98" stroke="#78716c" strokeWidth="4" strokeLinecap="round" />
        <line x1="116" y1="78" x2="132" y2="98" stroke="#78716c" strokeWidth="4" strokeLinecap="round" />
        <line x1="100" y1="82" x2="100" y2="100" stroke="#57534e" strokeWidth="4" strokeLinecap="round" />

        {/* Main Pod Capsule Body */}
        <rect x="82" y="38" width="36" height="46" rx="8" fill="#292524" stroke="#eab308" strokeWidth="1.8" />

        {/* Golden Front Shielding */}
        <rect x="86" y="42" width="28" height="24" rx="4" fill="#ca8a04" />
        <rect x="89" y="45" width="22" height="18" rx="3" fill="#facc15" />

        {/* Industrial Yellow/Black Hazard Stripes */}
        <g transform="translate(82, 68)">
          <rect x="0" y="0" width="36" height="10" fill="#1c1917" />
          <polygon points="4,0 9,0 5,10 0,10" fill="#eab308" />
          <polygon points="13,0 18,0 14,10 9,10" fill="#eab308" />
          <polygon points="22,0 27,0 23,10 18,10" fill="#eab308" />
          <polygon points="31,0 36,0 32,10 27,10" fill="#eab308" />
        </g>

        {/* Top Antenna Beacon with Flashing Pulse */}
        <line x1="100" y1="38" x2="100" y2="20" stroke="#a8a29e" strokeWidth="2.5" />
        {isHealthy ? (
          <>
            <circle cx="100" cy="18" r="6" fill="#ef4444" className="animate-ping" opacity="0.75" />
            <circle cx="100" cy="18" r="3.5" fill="#facc15" />
          </>
        ) : (
          <circle cx="100" cy="18" r="3.5" fill="#57534e" />
        )}
      </svg>
    </div>
  );
}

// 6. Deployed MK-1 Automated Mining Drill Rig with drilling sparks
export function DrillRigGraphic({ storedUnits, capacity }) {
  return (
    <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-32 h-24 pointer-events-none select-none z-10">
      <svg viewBox="0 0 120 90" className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.7)]">
        {/* Rig Legs & Girders */}
        <line x1="36" y1="80" x2="54" y2="28" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="84" y1="80" x2="66" y2="28" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="42" y1="56" x2="78" y2="56" stroke="#475569" strokeWidth="2.5" />

        {/* Motor Chassis */}
        <rect x="46" y="16" width="28" height="20" rx="3" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
        <circle cx="60" cy="26" r="4.5" fill="#06b6d4" className="animate-pulse" />

        {/* Drill Piston Rod (Pumps up and down) */}
        <g className="animate-bounce">
          <line x1="60" y1="36" x2="60" y2="74" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
          <polygon points="55,74 65,74 60,82" fill="#38bdf8" />
        </g>

        {/* Mining Sparks */}
        <circle cx="56" cy="78" r="1.5" fill="#f59e0b" className="animate-ping" />
        <circle cx="64" cy="80" r="1.5" fill="#fbbf24" className="animate-ping" />
        <circle cx="60" cy="82" r="2" fill="#f97316" className="animate-ping" />
      </svg>
    </div>
  );
}
