import React, { useState } from 'react';
import { ArrowLeftRight, PlusCircle, CheckCircle, Handshake } from 'lucide-react';

export default function TradingPost({ trades, currentPlayer, onCreateOffer, onAcceptOffer }) {
  const [tab, setTab] = useState('browse'); // 'browse' | 'create'
  const [offeredItem, setOfferedItem] = useState('timber');
  const [offeredQty, setOfferedQty] = useState(2);
  const [demandedItem, setDemandedItem] = useState('copper_ore');
  const [demandedQty, setDemandedQty] = useState(2);
  const [loading, setLoading] = useState(false);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onCreateOffer({
      creatorPlayerId: currentPlayer,
      offeredItem,
      offeredQuantity: parseInt(offeredQty, 10),
      demandedItem,
      demandedQuantity: parseInt(demandedQty, 10),
    });
    setLoading(false);
    setTab('browse');
  };

  const ITEMS = [
    'timber',
    'iron_ore',
    'copper_ore',
    'energy_crystal',
    'iron_plate',
    'copper_wire',
    'circuit_board',
    'reinforced_frame',
    'mk1_drill',
  ];

  return (
    <div className="space-y-3">
      {/* Sub-Tabs: Browse Offers vs Create Offer */}
      <div className="flex rounded border border-frontier-800 bg-frontier-950 p-0.5 text-xs font-mono">
        <button
          onClick={() => setTab('browse')}
          className={`flex-1 py-1 rounded text-center transition-colors ${
            tab === 'browse'
              ? 'bg-frontier-800 text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Market ({trades.length})
        </button>
        <button
          onClick={() => setTab('create')}
          className={`flex-1 py-1 rounded text-center transition-colors ${
            tab === 'create'
              ? 'bg-frontier-800 text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          + Post Escrow Offer
        </button>
      </div>

      {/* Tab 1: Browse Active Market Offers */}
      {tab === 'browse' && (
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
          {trades.length === 0 ? (
            <div className="text-center py-8 text-xs font-mono text-slate-500 border border-dashed border-frontier-800 rounded">
              No open market offers right now. Post an offer!
            </div>
          ) : (
            trades.map((t) => {
              const isOwnOffer = t.creator_player_id === currentPlayer;
              return (
                <div
                  key={t.id}
                  className="bg-frontier-950/80 border border-frontier-800/80 p-3 rounded flex flex-col justify-between space-y-2.5"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-cyan-400 font-bold">
                      Trade #{t.id} by {t.creator_name}
                    </span>
                    <span className="text-[9px] bg-frontier-900 text-slate-400 px-1.5 py-0.5 rounded border border-frontier-700">
                      ESCROWED
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-frontier-900/60 p-2 rounded text-xs font-mono">
                    <div className="text-emerald-400 font-bold">
                      +{t.offered_quantity} {t.offered_item.replace('_', ' ')}
                    </div>
                    <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
                    <div className="text-amber-400 font-bold">
                      -{t.demanded_quantity} {t.demanded_item.replace('_', ' ')}
                    </div>
                  </div>

                  <button
                    onClick={() => onAcceptOffer(t.id)}
                    disabled={isOwnOffer}
                    className={`w-full py-1.5 rounded font-mono font-bold text-xs uppercase tracking-wider transition-all duration-150 flex items-center justify-center space-x-1.5 ${
                      isOwnOffer
                        ? 'bg-frontier-900 text-slate-500 cursor-not-allowed border border-frontier-800'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md active:scale-95'
                    }`}
                  >
                    <Handshake className="w-3.5 h-3.5" />
                    <span>{isOwnOffer ? 'YOUR ESCROW' : 'ACCEPT SWAP'}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Create Standing Offer Form */}
      {tab === 'create' && (
        <form onSubmit={handleCreateSubmit} className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-slate-400 mb-1 text-[11px]">
              You Escrow (Offered Item):
            </label>
            <div className="flex space-x-2">
              <select
                value={offeredItem}
                onChange={(e) => setOfferedItem(e.target.value)}
                className="flex-1 bg-frontier-950 border border-frontier-700 rounded px-2.5 py-1.5 text-slate-200 capitalize"
              >
                {ITEMS.map((item) => (
                  <option key={item} value={item}>
                    {item.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                max="50"
                value={offeredQty}
                onChange={(e) => setOfferedQty(e.target.value)}
                className="w-16 bg-frontier-950 border border-frontier-700 rounded px-2 py-1.5 text-center text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 text-[11px]">
              You Request (Demanded Payment):
            </label>
            <div className="flex space-x-2">
              <select
                value={demandedItem}
                onChange={(e) => setDemandedItem(e.target.value)}
                className="flex-1 bg-frontier-950 border border-frontier-700 rounded px-2.5 py-1.5 text-slate-200 capitalize"
              >
                {ITEMS.map((item) => (
                  <option key={item} value={item}>
                    {item.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                max="50"
                value={demandedQty}
                onChange={(e) => setDemandedQty(e.target.value)}
                className="w-16 bg-frontier-950 border border-frontier-700 rounded px-2 py-1.5 text-center text-slate-200"
              />
            </div>
          </div>

          <p className="text-[10px] text-slate-500 bg-frontier-950 p-2 rounded border border-frontier-800">
            ℹ️ Escrow Rule: Offered items are immediately deducted from your inventory and held safely by
            the database until accepted or cancelled.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold tracking-wider uppercase transition-colors"
          >
            {loading ? 'ESCROWING...' : 'POST STANDING OFFER'}
          </button>
        </form>
      )}
    </div>
  );
}
