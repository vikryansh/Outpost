import React from 'react';

/**
 * Tactical Planetary Environment Overlay for Outpost (2500 x 1400 px)
 * Renders atmospheric effects, glowing volcanic magma pulses, industrial pipeline conduits,
 * bioluminescent forest spore motes, and military tactical coordinates over the terrain map.
 */
export default function TerrainEnvironment() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      <svg viewBox="0 0 2500 1400" className="w-full h-full">
        <defs>
          {/* Glowing Heat Filter for Magma */}
          <filter id="magma-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Bioluminescent Spore Glow */}
          <filter id="spore-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ================================================================= */}
        {/* 1. PULSATING VOLCANIC MAGMA VEINS & FISSURES (Northeast Mountains)*/}
        {/* ================================================================= */}
        <g id="magma-fissures" filter="url(#magma-glow)" opacity="0.85">
          {/* Main Volcano Caldera #1 Lava Pulse */}
          <path
            d="M1520,40 Q1550,120 1510,180 T1480,260 T1400,320"
            fill="none"
            stroke="#f97316"
            strokeWidth="3.5"
            strokeDasharray="12 6"
            className="animate-pulse"
          />
          <path
            d="M1520,40 Q1580,110 1620,160 T1680,240"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeDasharray="8 4"
            className="animate-pulse"
          />

          {/* High Peak Volcano #2 Lava Streams */}
          <path
            d="M2160,50 Q2180,140 2140,210 T2080,290 T2020,380"
            fill="none"
            stroke="#ef4444"
            strokeWidth="4"
            strokeDasharray="14 6"
            className="animate-pulse"
          />
          <path
            d="M2160,50 Q2220,130 2280,200 T2360,310"
            fill="none"
            stroke="#f97316"
            strokeWidth="3"
            strokeDasharray="10 4"
            className="animate-pulse"
          />
          <path
            d="M2140,210 Q2210,240 2260,280 T2310,380"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="2"
            strokeDasharray="6 3"
            className="animate-pulse"
          />

          {/* East Ridge Magma Seam */}
          <path
            d="M2320,360 Q2380,420 2340,490 T2260,560"
            fill="none"
            stroke="#f97316"
            strokeWidth="3"
            strokeDasharray="12 4"
            className="animate-pulse"
          />
        </g>

        {/* ================================================================= */}
        {/* 2. INDUSTRIAL PIPELINES & GROUND CONDUITS                         */}
        {/* ================================================================= */}
        <g id="industrial-pipes" opacity="0.8">
          {/* Main Pipeline from Iron Ridge (1080, 420) down towards Central Hub */}
          <path
            d="M1080,440 L1080,560 L1200,560 L1200,640"
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M1080,440 L1080,560 L1200,560 L1200,640"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeDasharray="14 6"
            className="animate-pulse"
          />
          <circle cx="1080" cy="560" r="7" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
          <circle cx="1200" cy="560" r="7" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />

          {/* Pipeline from Central Landing Hub (1260, 650) to Iron Ridge #2 (1420, 920) */}
          <path
            d="M1280,680 L1350,760 L1420,880"
            fill="none"
            stroke="#1e293b"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M1280,680 L1350,760 L1420,880"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="10 5"
          />

          {/* Eastern Pipeline from Copper Ridge (1760, 380) */}
          <path
            d="M1760,410 L1660,520 L1540,520 L1450,600"
            fill="none"
            stroke="#1e293b"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M1760,410 L1660,520 L1540,520 L1450,600"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            strokeDasharray="12 6"
          />
        </g>

        {/* ================================================================= */}
        {/* 3. BIOLUMINESCENT SPORE MOTES (Drifting over Forest in the West)   */}
        {/* ================================================================= */}
        <g id="bioluminescent-spores" filter="url(#spore-glow)">
          {[
            { cx: 180, cy: 150, r: 2.5, fill: "#34d399", anim: "animate-pulse" },
            { cx: 320, cy: 180, r: 3, fill: "#6ee7b7", anim: "animate-ping" },
            { cx: 240, cy: 260, r: 2, fill: "#a7f3d0", anim: "animate-pulse" },
            { cx: 420, cy: 220, r: 3, fill: "#34d399", anim: "animate-pulse" },
            { cx: 160, cy: 380, r: 2.5, fill: "#6ee7b7", anim: "animate-ping" },
            { cx: 280, cy: 460, r: 2, fill: "#a7f3d0", anim: "animate-pulse" },
            { cx: 380, cy: 520, r: 3, fill: "#34d399", anim: "animate-pulse" },
            { cx: 200, cy: 620, r: 2.5, fill: "#6ee7b7", anim: "animate-ping" },
            { cx: 340, cy: 700, r: 2, fill: "#a7f3d0", anim: "animate-pulse" },
            { cx: 480, cy: 650, r: 3, fill: "#34d399", anim: "animate-pulse" },
            { cx: 220, cy: 820, r: 2.5, fill: "#6ee7b7", anim: "animate-pulse" },
            { cx: 360, cy: 920, r: 2, fill: "#a7f3d0", anim: "animate-ping" },
            { cx: 150, cy: 980, r: 3, fill: "#34d399", anim: "animate-pulse" },
          ].map((spore, idx) => (
            <circle
              key={`spore-${idx}`}
              cx={spore.cx}
              cy={spore.cy}
              r={spore.r}
              fill={spore.fill}
              className={spore.anim}
              opacity="0.8"
            />
          ))}
        </g>

        {/* ================================================================= */}
        {/* 4. TACTICAL RETICLES, CONTOUR LABELS & SATELLITE MARKINGS         */}
        {/* ================================================================= */}
        <g id="tactical-markings" opacity="0.6">
          {/* Target Reticle around Central Crater Landing Zone */}
          <circle
            cx="1260"
            cy="650"
            r="120"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1"
            strokeDasharray="8 8"
          />
          <circle
            cx="1260"
            cy="650"
            r="160"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="0.8"
            strokeOpacity="0.4"
            strokeDasharray="16 16"
          />
          {/* Reticle Tick Crosshairs */}
          <line x1="1260" y1="510" x2="1260" y2="525" stroke="#f59e0b" strokeWidth="2" />
          <line x1="1260" y1="775" x2="1260" y2="790" stroke="#f59e0b" strokeWidth="2" />
          <line x1="1120" y1="650" x2="1135" y2="650" stroke="#f59e0b" strokeWidth="2" />
          <line x1="1385" y1="650" x2="1400" y2="650" stroke="#f59e0b" strokeWidth="2" />

          {/* Contour Sector Coordinates */}
          <text x="1275" y="525" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold">
            LZ-ALPHA // IMPACT DROP ZONE [B-2]
          </text>

          {/* Southeast Cavern Entrance Marker */}
          <circle
            cx="1850"
            cy="1150"
            r="110"
            fill="none"
            stroke="#c084fc"
            strokeWidth="1"
            strokeDasharray="6 6"
          />
          <text x="1740" y="1025" fill="#c084fc" fontSize="10" fontFamily="monospace" fontWeight="bold">
            SUBTERRANEAN CHASM PRIME // ENERGY ANOMALY [C-4]
          </text>
        </g>
      </svg>
    </div>
  );
}
