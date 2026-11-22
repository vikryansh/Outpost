import React, { useState } from 'react';
import { Hammer, Check, X, Sparkles, AlertTriangle } from 'lucide-react';
import { soundFx } from '../services/soundFx';

export default function CraftingWorkbench({ inventory, recipes, onCraft }) {
  const [craftingItem, setCraftingItem] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const getInventoryCount = (itemType) => {
    const item = inventory.find((i) => i.item_type === itemType);
    return item ? item.quantity : 0;
  };

  const handleCraft = async (itemName) => {
    setCraftingItem(itemName);
    setErrorMsg(null);
    const res = await onCraft(itemName);
    setCraftingItem(null);
    if (res && res.success) {
      soundFx.playCraft();
    } else if (res && !res.success) {
      soundFx.playAlert();
      setErrorMsg(res.message || 'Craft failed. Check your inventory.');
    }
  };

  return (
    <div className="space-y-3">
      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-red-950/80 border border-red-500/60 p-2 rounded flex items-center space-x-2 text-xs font-mono text-red-300 animate-shake">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="flex-1">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white font-bold">
            ✕
          </button>
        </div>
      )}

      <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-frontier-800 pb-2">
        <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
          <Hammer className="w-4 h-4" />
          <span>WORKBENCH RECIPES</span>
        </div>
        <span className="text-[10px] text-slate-500">ATOMIC CONSUME</span>
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
        {Object.entries(recipes).map(([recipeKey, recipe]) => {
          // Check if player has all required ingredients
          let canCraft = true;
          const ingredientStatus = recipe.ingredients.map((ing) => {
            const have = getInventoryCount(ing.item);
            const satisfied = have >= ing.quantity;
            if (!satisfied) canCraft = false;
            return { ...ing, have, satisfied };
          });

          return (
            <div
              key={recipeKey}
              className={`p-3 rounded border transition-all duration-150 ${
                canCraft
                  ? 'bg-frontier-900/90 border-frontier-700/80 hover:border-cyan-500/50'
                  : 'bg-frontier-950/60 border-frontier-800/60 opacity-75'
              }`}
            >
              {/* Recipe Name and Tier */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-xs uppercase text-slate-200">
                  {recipeKey.replace('_', ' ')}
                </span>
                {recipeKey === 'mk1_drill' && (
                  <span className="text-[9px] font-mono bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30">
                    MACHINE (T3)
                  </span>
                )}
                {recipeKey === 'surveyors_beacon' && (
                  <span className="text-[9px] font-mono bg-gold/20 text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-500/40 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-yellow-400" />
                    <span>VICTORY GOAL</span>
                  </span>
                )}
              </div>

              {/* Required Ingredients Breakdown */}
              <div className="grid grid-cols-2 gap-1 mb-2.5">
                {ingredientStatus.map((ing) => (
                  <div
                    key={ing.item}
                    className="flex items-center justify-between text-[10px] font-mono bg-frontier-950 px-2 py-1 rounded border border-frontier-800"
                  >
                    <span className="text-slate-400 capitalize truncate w-16">
                      {ing.item.replace('_', ' ')}:
                    </span>
                    <span
                      className={`font-semibold flex items-center space-x-1 ${
                        ing.satisfied ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      <span>
                        {ing.have}/{ing.quantity}
                      </span>
                      {ing.satisfied ? (
                        <Check className="w-2.5 h-2.5" />
                      ) : (
                        <X className="w-2.5 h-2.5" />
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleCraft(recipeKey)}
                disabled={!canCraft || craftingItem === recipeKey}
                className={`w-full py-1.5 rounded font-mono font-bold text-xs uppercase tracking-wider transition-all duration-150 flex items-center justify-center space-x-1.5 ${
                  canCraft
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md active:scale-95'
                    : 'bg-frontier-900 text-slate-500 cursor-not-allowed border border-frontier-800'
                }`}
              >
                <span>
                  {craftingItem === recipeKey
                    ? 'COMMITTING...'
                    : canCraft
                    ? 'CRAFT ITEM'
                    : 'LOCKED (DEFICIENT)'}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
