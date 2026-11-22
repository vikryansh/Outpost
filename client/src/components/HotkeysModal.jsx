import React from 'react';
import { Keyboard } from 'lucide-react';

export default function HotkeysModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const hotkeys = [
    { key: 'W / A / S / D', desc: 'Pan tactical terrain viewport (Up, Left, Down, Right)' },
    { key: 'Arrow Keys', desc: 'Alternative smooth viewport panning' },
    { key: 'Spacebar', desc: 'Instantly center viewport on Crater Basin / Supply Pod' },
    { key: '1', desc: 'Switch right sidebar to Crafting Workbench' },
    { key: '2', desc: 'Switch right sidebar to Escrow Trading Post' },
    { key: '3', desc: 'Switch right sidebar to Deployed Drills Monitor' },
    { key: 'M', desc: 'Toggle procedural tactical audio (Mute / Unmute)' },
    { key: 'C', desc: 'Open Live Concurrency Lab (Viva Race Simulator)' },
    { key: 'T', desc: 'Open Sector 9 Telemetry & Ledger Metrics' },
    { key: '?', desc: 'Toggle this Tactical Controls cheatsheet' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-frontier-900 border-2 border-cyan-500/80 rounded-xl max-w-md w-full p-6 shadow-neon-cyan space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-frontier-800 pb-3">
          <div className="flex items-center space-x-2 text-cyan-300 font-extrabold text-sm">
            <Keyboard className="w-4 h-4 text-cyan-400" />
            <span>TACTICAL KEYBOARD CONTROLS</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white font-bold text-sm px-2 py-0.5 rounded hover:bg-frontier-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {hotkeys.map((h) => (
            <div
              key={h.key}
              className="flex items-center justify-between bg-frontier-950 px-3 py-2 rounded border border-frontier-800"
            >
              <kbd className="bg-frontier-900 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40 font-bold text-[11px] shadow-sm">
                {h.key}
              </kbd>
              <span className="text-slate-300 text-[11px] text-right ml-3">{h.desc}</span>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center text-[10px] text-slate-500">
          Press <kbd className="text-cyan-400">ESC</kbd> or click ✕ to close.
        </div>
      </div>
    </div>
  );
}
