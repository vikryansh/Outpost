import React from 'react';

/**
 * Holographic Ground Field Projectors & Sci-Fi Entity Models for Outpost.
 * Replaces flat clipart stickers with sleek tactical augmented-reality rings,
 * volumetric beacons, and detailed mechanical assets (Supply Pod, MK-1 Drill).
 */

// 1. Holographic Ground Field Projector for Natural Terrain Veins (Forest, Iron, Copper, Crystals)
export function TacticalBeaconGround({ theme, remainingUnits, maxCapacity, isDepleted }) {
  const fillRatio = Math.max(0, remainingUnits / maxCapacity);
  
  return (
    <div className="relative w-36 h-20 flex items-center justify-center select-none pointer-events-none">
      <svg viewBox="0 0 160 90" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id={`beacon-glow-${theme.shortName}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.glowColor} stopOpacity={isDepleted ? '0.05' : '0.35'} />
            <stop offset="100%" stopColor={theme.glowColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Ground Field Glow */}
        <ellipse
          cx="80"
          cy="48"
          rx="65"
          ry="28"
          fill={`url(#beacon-glow-${theme.shortName})`}
          className={isDepleted ? '' : 'animate-pulse'}
        />

        {/* Outer Isometric Tactical Reticle Ring */}
        <ellipse
          cx="80"
          cy="48"
          rx="58"
          ry="24"
          fill="none"
          stroke={theme.strokeColor}
          strokeWidth="1.2"
          strokeDasharray="6 4"
          strokeOpacity={isDepleted ? '0.25' : '0.6'}
          className={isDepleted ? '' : 'group-hover:stroke-opacity-100 transition-all duration-300'}
        />

        {/* Inner Tactical Range Ring */}
        <ellipse
          cx="80"
          cy="48"
          rx="38"
          ry="16"
          fill="none"
          stroke={theme.strokeColor}
          strokeWidth="1.5"
          strokeOpacity={isDepleted ? '0.2' : '0.8'}
        />

        {/* Tactical Crosshair Ticks */}
        <line x1="80" y1="20" x2="80" y2="28" stroke={theme.strokeColor} strokeWidth="1.5" strokeOpacity="0.7" />
        <line x1="80" y1="68" x2="80" y2="76" stroke={theme.strokeColor} strokeWidth="1.5" strokeOpacity="0.7" />
        <line x1="18" y1="48" x2="26" y2="48" stroke={theme.strokeColor} strokeWidth="1.5" strokeOpacity="0.7" />
        <line x1="134" y1="48" x2="142" y2="48" stroke={theme.strokeColor} strokeWidth="1.5" strokeOpacity="0.7" />

        {/* Center Ground Target Dot */}
        <circle
          cx="80"
          cy="48"
          r="3"
          fill={theme.strokeColor}
          opacity={isDepleted ? '0.3' : '0.9'}
          className={isDepleted ? '' : 'animate-ping'}
        />
        <circle cx="80" cy="48" r="2" fill="#ffffff" />
      </svg>
    </div>
  );
}

// 2. High-Tech Contested Orbital Supply Pod (Sits physically in the landing crater)
export function OrbitalPodModel({ remainingUnits }) {
  const isHealthy = remainingUnits > 0;
  return (
    <div className="relative w-36 h-28 flex items-center justify-center select-none pointer-events-none transition-transform group-hover:scale-110">
      <svg viewBox="0 0 160 120" className="w-full h-full drop-shadow-[0_10px_25px_rgba(234,179,8,0.5)] overflow-visible">
        {/* Golden Thruster Shockwave Ground Aura */}
        <ellipse
          cx="80"
          cy="86"
          rx="55"
          ry="24"
          fill="#ca8a04"
          opacity={isHealthy ? '0.35' : '0.1'}
          className={isHealthy ? 'animate-pulse' : ''}
        />
        <ellipse
          cx="80"
          cy="86"
          rx="44"
          ry="18"
          fill="none"
          stroke="#facc15"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          opacity={isHealthy ? '0.8' : '0.2'}
        />

        {/* Rising Smoke / Steam Curls from Thrusters */}
        {isHealthy && (
          <g opacity="0.65" className="animate-pulse">
            <path d="M68,76 Q60,60 66,44 T72,28" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
            <path d="M92,76 Q100,60 94,44 T88,28" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* Pod Landing Struts */}
        <line x1="68" y1="78" x2="52" y2="96" stroke="#64748b" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="92" y1="78" x2="108" y2="96" stroke="#64748b" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="80" y1="80" x2="80" y2="98" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />

        {/* Main Pod Capsule Chassis */}
        <polygon
          points="66,80 62,48 74,32 86,32 98,48 94,80"
          fill="#1e293b"
          stroke="#eab308"
          strokeWidth="1.8"
        />

        {/* Golden Armored Heat-Shield Panels */}
        <polygon points="68,74 65,50 76,38 84,38 95,50 92,74" fill="#854d0e" />
        <polygon points="71,70 69,52 77,42 83,42 91,52 89,70" fill="#facc15" />

        {/* Hazard Warning Stripes */}
        <rect x="68" y="66" width="24" height="6" fill="#0f172a" />
        <polygon points="72,66 75,66 72,72 69,72" fill="#eab308" />
        <polygon points="78,66 81,66 78,72 75,72" fill="#eab308" />
        <polygon points="84,66 87,66 84,72 81,72" fill="#eab308" />
        <polygon points="90,66 93,66 90,72 87,72" fill="#eab308" />

        {/* Antenna Beacon with Flashing Red/Gold Pulsing Light */}
        <line x1="80" y1="32" x2="80" y2="14" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        {isHealthy ? (
          <>
            <circle cx="80" cy="12" r="6" fill="#ef4444" className="animate-ping" opacity="0.8" />
            <circle cx="80" cy="12" r="3.5" fill="#facc15" />
          </>
        ) : (
          <circle cx="80" cy="12" r="3" fill="#64748b" />
        )}
      </svg>
    </div>
  );
}

// 3. Deployed MK-1 Automated Mining Drill Rig (Mobile crawler drill with sparks)
export function DrillRigGraphic({ storedUnits, capacity }) {
  return (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-24 pointer-events-none select-none z-20">
      <svg viewBox="0 0 120 90" className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.7)] overflow-visible">
        {/* Chassis Crawler Treads */}
        <rect x="36" y="62" width="48" height="12" rx="3" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
        <circle cx="42" cy="68" r="3" fill="#334155" />
        <circle cx="50" cy="68" r="3" fill="#334155" />
        <circle cx="58" cy="68" r="3" fill="#334155" />
        <circle cx="66" cy="68" r="3" fill="#334155" />
        <circle cx="74" cy="68" r="3" fill="#334155" />

        {/* Mechanical Crane Arm */}
        <line x1="60" y1="62" x2="60" y2="28" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
        <line x1="60" y1="28" x2="84" y2="38" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />

        {/* Drill Motor Housing */}
        <rect x="48" y="20" width="24" height="16" rx="2" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.5" />
        <circle cx="60" cy="28" r="4" fill="#06b6d4" className="animate-pulse" />

        {/* Drill Piston & Rotating Bit (Animated Bounce) */}
        <g className="animate-bounce">
          <line x1="84" y1="38" x2="84" y2="72" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
          <polygon points="79,72 89,72 84,80" fill="#38bdf8" />
        </g>

        {/* Sparks Flying off Rock Bed */}
        <circle cx="80" cy="76" r="1.5" fill="#f59e0b" className="animate-ping" />
        <circle cx="88" cy="78" r="1.5" fill="#fbbf24" className="animate-ping" />
        <circle cx="84" cy="80" r="2" fill="#f97316" className="animate-ping" />
      </svg>
    </div>
  );
}
