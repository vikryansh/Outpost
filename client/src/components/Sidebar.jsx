import React, { useState } from 'react';
import { Package, Wrench, ArrowLeftRight, Database, Shield } from 'lucide-react';
import CraftingWorkbench from './CraftingWorkbench';
import TradingPost from './TradingPost';

export default function Sidebar({
  inventory,
  recipes,
  trades,
  machines,
  currentPlayer,
  onCraft,
  onCreateTrade,
  onAcceptTrade,
  onCollectMachine,
}) {
  const [activeTab, setActiveTab] = useState('crafting');

  const playerMachines = machines.filter((m) => m.player_id === currentPlayer);

  return (
    <aside className="w-[390px] bg-frontier-900 border-l border-frontier-700/80 flex flex-col h-[calc(100vh-56px-112px)] z-30 shadow-2xl select-none">
      {/* 1. Inventory Terminal Dock */}
      <div className="p-4 border-b border-frontier-800 bg-frontier-950/80">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2.5">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-extrabold tracking-wider">
            <Package className="w-4 h-4" />
            <span>PLAYER INVENTORY DOCK</span>
          </div>
          <span className="text-[9px] font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/40">
            SECURE LEDGER
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 font-mono text-xs">
          {inventory.length === 0 ? (
            <div className="col-span-3 text-center py-4 text-xs text-slate-500 border border-dashed border-frontier-800 rounded">
              Storage empty. Extract nodes to harvest ores!
            </div>
          ) : (
            inventory.map((item) => (
              <div
                key={item.item_type}
                className="bg-frontier-900 border border-frontier-800 p-2 rounded flex flex-col justify-between hover:border-frontier-700 transition-colors shadow-inner"
              >
                <span className="text-[10px] text-slate-400 truncate capitalize">
                  {item.item_type.replace('_', ' ')}
                </span>
                <span className="text-base font-extrabold text-cyan-300 tracking-tight">
                  {item.quantity}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-frontier-800 bg-frontier-950 text-xs font-mono">
        <button
          onClick={() => setActiveTab('crafting')}
          className={`flex-1 py-3 flex items-center justify-center space-x-1.5 transition-all border-b-2 ${
            activeTab === 'crafting'
              ? 'border-cyan-400 text-cyan-300 bg-frontier-900 font-extrabold shadow-neon-cyan'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Workbench</span>
        </button>

        <button
          onClick={() => setActiveTab('trades')}
          className={`flex-1 py-3 flex items-center justify-center space-x-1.5 transition-all border-b-2 ${
            activeTab === 'trades'
              ? 'border-cyan-400 text-cyan-300 bg-frontier-900 font-extrabold shadow-neon-cyan'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Trading Post</span>
        </button>

        <button
          onClick={() => setActiveTab('machines')}
          className={`flex-1 py-3 flex items-center justify-center space-x-1.5 transition-all border-b-2 ${
            activeTab === 'machines'
              ? 'border-cyan-400 text-cyan-300 bg-frontier-900 font-extrabold shadow-neon-cyan'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Drills ({playerMachines.length})</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col justify-between">
        {activeTab === 'crafting' && (
          <CraftingWorkbench inventory={inventory} recipes={recipes} onCraft={onCraft} />
        )}

        {activeTab === 'trades' && (
          <TradingPost
            trades={trades}
            currentPlayer={currentPlayer}
            onCreateOffer={onCreateTrade}
            onAcceptOffer={onAcceptTrade}
          />
        )}

        {activeTab === 'machines' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="text-slate-400 text-[11px] border-b border-frontier-800 pb-2 flex justify-between items-center">
              <span className="font-bold text-slate-300">ACTIVE MK-1 MINING DRILLS</span>
              <span className="text-cyan-400 text-[10px] bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                10s INTERVAL TICK
              </span>
            </div>

            {playerMachines.length === 0 ? (
              <div className="text-center py-10 text-slate-500 border border-dashed border-frontier-800 rounded text-xs p-4">
                No active automated drills deployed. Assemble an MK-1 Drill in the Workbench to start
                automatic extraction!
              </div>
            ) : (
              playerMachines.map((m) => (
                <div
                  key={m.id}
                  className="bg-frontier-950 border border-cyan-500/40 p-3 rounded space-y-2.5 shadow-neon-cyan"
                >
                  <div className="flex justify-between items-center text-slate-200">
                    <span className="font-extrabold text-cyan-300">MK-1 DRILL RIG #{m.id}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                      AUTONOMOUS
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Extracting:{' '}
                    <span className="text-slate-100 font-bold uppercase">{m.resource_type}</span>
                  </div>

                  <div className="flex justify-between items-center bg-frontier-900 p-2.5 rounded border border-frontier-800">
                    <span className="text-[11px] text-slate-400">Buffer Stored:</span>
                    <span className="text-sm font-extrabold text-cyan-300">
                      {m.buffer_units} / {m.buffer_capacity} UNITS
                    </span>
                  </div>

                  <button
                    onClick={() => onCollectMachine(m.id)}
                    disabled={m.buffer_units <= 0}
                    className={`w-full py-2 rounded font-extrabold uppercase tracking-wider text-xs transition-all bevel-both-r ${
                      m.buffer_units > 0
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-neon-emerald active:scale-95'
                        : 'bg-frontier-900 text-slate-600 cursor-not-allowed border border-frontier-800'
                    }`}
                  >
                    {m.buffer_units > 0 ? `COLLECT (+${m.buffer_units} ORE)` : 'BUFFER EMPTY'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
