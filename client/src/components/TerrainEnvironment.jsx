import React from 'react';

/**
 * Procedural Planetary Environment Layer for Outpost (2500 x 1800 px)
 * Fills the vast landscape between interactive nodes with mountain ranges,
 * dense background forests, industrial pipelines, craters, and crystal clusters.
 */
export default function TerrainEnvironment() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      <svg viewBox="0 0 2500 1800" className="w-full h-full">
        {/* ================================================================= */}
        {/* 1. MOUNTAIN RANGES & ROCKY RIDGES (Elevations)                    */}
        {/* ================================================================= */}
        <g id="mountain-ridges" opacity="0.65">
          {/* North-Central High Ridge (Behind Iron Vein 1 & 2) */}
          <polygon
            points="900,280 980,180 1060,240 1140,150 1250,220 1340,160 1440,230 1520,180 1580,260 1540,320 920,330"
            fill="#17120e"
            stroke="#451a03"
            strokeWidth="2"
          />
          {/* Ridge shadows & highlights */}
          <polygon points="980,180 1060,240 1030,270 960,240" fill="#291e17" />
          <polygon points="1140,150 1250,220 1200,260 1110,210" fill="#3d2a1f" />
          <polygon points="1340,160 1440,230 1390,270 1310,220" fill="#291e17" />

          {/* South-West Volcanic Ridge */}
          <polygon
            points="200,950 320,820 450,910 580,840 680,940 550,1020 220,1000"
            fill="#1c140d"
            stroke="#78350f"
            strokeWidth="1.5"
          />
          <polygon points="320,820 450,910 400,960 290,900" fill="#291e17" />

          {/* East Copper Mountain Range */}
          <polygon
            points="1600,250 1720,120 1850,220 1980,140 2120,240 2250,160 2380,260 2300,340 1620,330"
            fill="#082226"
            stroke="#0e7490"
            strokeWidth="2"
          />
          <polygon points="1720,120 1850,220 1800,260 1690,190" fill="#164e63" />
          <polygon points="1980,140 2120,240 2060,280 1940,200" fill="#155e75" />
        </g>

        {/* ================================================================= */}
        {/* 2. DENSE BACKGROUND ALIEN FORESTS (Pine & Canopy Clusters)        */}
        {/* ================================================================= */}
        <g id="dense-forests">
          {/* West Forest Belt (Surrounding Ancient Grove) */}
          {[
            { x: 300, y: 220, scale: 0.8 },
            { x: 340, y: 280, scale: 0.9 },
            { x: 260, y: 350, scale: 1.0 },
            { x: 320, y: 420, scale: 0.85 },
            { x: 380, y: 480, scale: 0.95 },
            { x: 520, y: 240, scale: 0.75 },
            { x: 580, y: 320, scale: 0.8 },
            { x: 640, y: 220, scale: 0.7 },
            { x: 220, y: 280, scale: 0.85 },
            { x: 420, y: 180, scale: 0.8 },
            { x: 480, y: 400, scale: 0.9 },
            // Deeper South-West Forest
            { x: 500, y: 680, scale: 0.9 },
            { x: 550, y: 740, scale: 1.1 },
            { x: 700, y: 720, scale: 0.85 },
            { x: 740, y: 800, scale: 0.95 },
            { x: 620, y: 860, scale: 1.0 },
            { x: 480, y: 820, scale: 0.8 },
            { x: 540, y: 920, scale: 0.75 },
          ].map((t, idx) => (
            <g key={`bg-tree-${idx}`} transform={`translate(${t.x}, ${t.y}) scale(${t.scale})`} opacity="0.8">
              <ellipse cx="20" cy="38" rx="18" ry="8" fill="#041a0f" opacity="0.6" />
              <rect x="18" y="24" width="4" height="14" fill="#2d180c" />
              <polygon points="20,4 8,26 32,26" fill="#064e3b" />
              <polygon points="20,-4 11,14 29,14" fill="#047857" />
              <polygon points="20,-10 14,4 26,4" fill="#10b981" />
            </g>
          ))}
        </g>

        {/* ================================================================= */}
        {/* 3. ROCKY BOULDER CLUSTERS & GRAVEL FIELDS                         */}
        {/* ================================================================= */}
        <g id="rock-clusters" opacity="0.75">
          {[
            { x: 950, y: 400 },
            { x: 1220, y: 420 },
            { x: 1280, y: 560 },
            { x: 1040, y: 620 },
            { x: 1180, y: 680 },
            { x: 1420, y: 840 },
            { x: 1280, y: 980 },
            { x: 1480, y: 960 },
          ].map((rock, idx) => (
            <g key={`bg-rock-${idx}`} transform={`translate(${rock.x}, ${rock.y})`}>
              <ellipse cx="25" cy="22" rx="28" ry="12" fill="#0f0b07" opacity="0.5" />
              <polygon points="10,22 18,8 32,6 38,18 28,26" fill="#291e17" stroke="#451a03" strokeWidth="1" />
              <polygon points="18,8 32,6 28,14 16,15" fill="#451a03" />
              <polygon points="32,24 40,12 50,14 54,24 42,28" fill="#3d2a1f" stroke="#78350f" strokeWidth="0.8" />
              {/* Glowing orange molten speck */}
              <circle cx="24" cy="14" r="1.5" fill="#f59e0b" className="animate-pulse" />
            </g>
          ))}
        </g>

        {/* ================================================================= */}
        {/* 4. CRYSTALLINE CHASMS & AMETHYST FORMATIONS                       */}
        {/* ================================================================= */}
        <g id="crystal-fields">
          {[
            { x: 1050, y: 1320, s: 0.8 },
            { x: 1150, y: 1480, s: 0.7 },
            { x: 1350, y: 1320, s: 0.9 },
            { x: 1420, y: 1460, s: 0.75 },
            { x: 1280, y: 1550, s: 0.85 },
            { x: 980, y: 1420, s: 0.7 },
          ].map((c, idx) => (
            <g key={`bg-crystal-${idx}`} transform={`translate(${c.x}, ${c.y}) scale(${c.s})`} opacity="0.85">
              <ellipse cx="20" cy="25" rx="22" ry="8" fill="#150724" opacity="0.6" />
              <polygon points="14,25 20,4 26,10 22,26" fill="#7e22ce" stroke="#c084fc" strokeWidth="0.8" />
              <polygon points="20,4 26,10 24,18 18,16" fill="#e9d5ff" />
              <polygon points="24,26 30,12 36,16 32,27" fill="#9333ea" stroke="#d8b4fe" strokeWidth="0.8" />
            </g>
          ))}
        </g>

        {/* ================================================================= */}
        {/* 5. INDUSTRIAL PIPELINES & GROUND CONDUITS (Factory Infrastructure)*/}
        {/* ================================================================= */}
        <g id="industrial-pipes" opacity="0.7">
          {/* Main Pipeline from Iron Ridge (1100, 480) down to Industrial Hub */}
          <path
            d="M1100,520 L1100,720 L1350,720 L1350,880"
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M1100,520 L1100,720 L1350,720 L1350,880"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3"
            strokeDasharray="16 8"
            className="animate-pulse"
          />
          {/* Pipe Joint Junctions */}
          <circle cx="1100" cy="720" r="10" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
          <circle cx="1350" cy="720" r="10" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />

          {/* East Pipeline from Copper Deposit (1750, 400) */}
          <path
            d="M1750,440 L1600,600 L1450,600 L1350,720"
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M1750,440 L1600,600 L1450,600 L1350,720"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeDasharray="12 6"
          />
        </g>

        {/* ================================================================= */}
        {/* 6. IMPACT CRATERS, SCORCH MARKS & CARGO DROPS                     */}
        {/* ================================================================= */}
        <g id="craters" opacity="0.6">
          {/* Crater near Supply Pod */}
          <ellipse cx="1400" cy="650" rx="45" ry="20" fill="#09090b" stroke="#3f3f46" strokeWidth="1.5" />
          <ellipse cx="1395" cy="652" rx="35" ry="14" fill="#030712" />

          {/* Old impact crater South-East */}
          <ellipse cx="1850" cy="1150" rx="65" ry="28" fill="#09090b" stroke="#27272a" strokeWidth="2" strokeDasharray="8 4" />
          <ellipse cx="1845" cy="1152" rx="50" ry="20" fill="#020617" />
        </g>

        {/* ================================================================= */}
        {/* 7. LANDING RUNWAY & TACTICAL TARMAC STRIP                          */}
        {/* ================================================================= */}
        <g id="tarmac-runway" opacity="0.5">
          {/* Tarmac Strip at Sector B-3 / C-3 */}
          <rect x="1450" y="1050" width="300" height="70" rx="4" fill="#090d16" stroke="#1e293b" strokeWidth="2" />
          <line x1="1470" y1="1085" x2="1730" y2="1085" stroke="#f59e0b" strokeWidth="2" strokeDasharray="12 12" />
          {/* Hazard Landing Corners */}
          <path d="M1455,1055 L1470,1055 M1455,1055 L1455,1070" stroke="#f59e0b" strokeWidth="2" />
          <path d="M1745,1055 L1730,1055 M1745,1055 L1745,1070" stroke="#f59e0b" strokeWidth="2" />
          <path d="M1455,1115 L1470,1115 M1455,1115 L1455,1100" stroke="#f59e0b" strokeWidth="2" />
          <path d="M1745,1115 L1730,1115 M1745,1115 L1745,1100" stroke="#f59e0b" strokeWidth="2" />
          <text x="1480" y="1075" fill="#64748b" fontSize="10" fontFamily="monospace" fontWeight="bold">
            RUNWAY // LZ-09 [RELOAD ZONE]
          </text>
        </g>
      </svg>
    </div>
  );
}
