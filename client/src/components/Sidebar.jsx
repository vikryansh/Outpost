import React, { useState } from 'react';
import { Package, Wrench, ArrowLeftRight, CheckCircle, Database } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('crafting'); // 'crafting' | 'trades' | 'machines'

  const playerMachines = machines.filter((m) => m.player_id === currentPlayer);

  return (
    <aside className="w-96 bg-frontier-900 border-l border-frontier-800 flex flex-col h-[calc(100vh-56px-112px)] z-20 shadow-2xl select-none">
      {/* 1. Inventory Summary Grid */}
      <div className="p-3.5 border-b border-frontier-800 bg-frontier-950/60">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
            <Package className="w-4 h-4" />
            <span>PLAYER INVENTORY</span>
          </div>
          <span className="text-[10px] text-slate-500">POSTGRES ACCREDITED</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
          {inventory.length === 0 ? (
            <div className="col-span-3 text-center py-2 text-[10px] text-slate-500">
              Inventory empty. Extract nodes to start!
            </div>
          ) : (
            inventory.map((item) => (
              <div
                key={item.item_type}
                className="bg-frontier-900 border border-frontier-800 px-2 py-1.5 rounded flex flex-col"
              >
                <span className="text-[10px] text-slate-400 truncate capitalize">
                  {item.item_type.replace('_', ' ')}
                </span>
                <span className="text-sm font-bold text-slate-100">{item.quantity}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Navigation Tabs (Workbench vs Trading Post vs Machines) */}
      <div className="flex border-b border-frontier-800 bg-frontier-950 text-xs font-mono">
        <button
          onClick={() => setActiveTab('crafting')}
          className={`flex-1 py-2.5 flex items-center justify-center space-x-1.5 transition-colors border-b-2 ${
            activeTab === 'crafting'
              ? 'border-cyan-400 text-cyan-400 bg-frontier-900/80 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Workbench</span>
        </button>

        <button
          onClick={() => setActiveTab('trades')}
          className={`flex-1 py-2.5 flex items-center justify-center space-x-1.5 transition-colors border-b-2 ${
            activeTab === 'trades'
              ? 'border-cyan-400 text-cyan-400 bg-frontier-900/80 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Trading Post</span>
        </button>

        <button
          onClick={() => setActiveTab('machines')}
          className={`flex-1 py-2.5 flex items-center justify-center space-x-1.5 transition-colors border-b-2 ${
            activeTab === 'machines'
              ? 'border-cyan-400 text-cyan-400 bg-frontier-900/80 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Drills ({playerMachines.length})</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      <div className="flex-1 p-3.5 overflow-hidden flex flex-col justify-between">
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
            <div className="text-slate-400 text-[11px] border-b border-frontier-800 pb-1.5 flex justify-between">
              <span>YOUR ACTIVE DRILLS</span>
              <span className="text-cyan-400">Ticking every 10s</span>
            </div>

            {playerMachines.length === 0 ? (
              <div className="text-center py-8 text-slate-500 border border-dashed border-frontier-800 rounded text-xs">
                You have no deployed drills. Craft an MK-1 Drill in the Workbench and deploy it onto an
                Ore node!
              </div>
            ) : (
              playerMachines.map((m) => (
                <div
                  key={m.id}
                  className="bg-frontier-950 border border-frontier-800 p-3 rounded space-y-2"
                >
                  <div className="flex justify-between items-center text-slate-200">
                    <span className="font-bold">MK-1 Drill #{m.id}</span>
                    <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                      AUTONOMOUS
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Mining: <span className="text-cyan-300 font-bold capitalize">{m.resource_type}</span>
                  </div>

                  <div className="flex justify-between items-center bg-frontier-900 p-2 rounded">
                    <span className="text-[11px] text-slate-400">Buffer Stored:</span>
                    <span className="text-sm font-bold text-cyan-300">
                      {m.buffer_units} / {m.buffer_capacity} Units
                    </span>
                  </div>

                  <button
                    onClick={() => onCollectMachine(m.id)}
                    disabled={m.buffer_units <= 0}
                    className={`w-full py-1.5 rounded font-bold uppercase tracking-wider text-xs transition-colors ${
                      m.buffer_units > 0
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                        : 'bg-frontier-900 text-slate-500 cursor-not-allowed border border-frontier-800'
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
