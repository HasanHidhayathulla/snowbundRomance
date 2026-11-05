/**
 * Solstice Workshop (Garage / Upgrades Modal)
 * Allows player to spend gathered Love Letters on snowplow upgrades
 */

import React, { useState } from 'react';
import { Check, Flame, Heart, Mail, Music, Palette, Snowflake, Wrench, X, Zap } from 'lucide-react';
import { PAINT_LIVERIES, UPGRADES, type PaintLivery } from '../game/constants';

interface ShopModalProps {
  loveLetters: number;
  upgrades: Record<string, number>;
  onBuyUpgrade: (upgradeId: string) => void;
  onClose: () => void;
  selectedLiveryId?: string;
  unlockedLiveryIds?: string[];
  onSelectLivery?: (liveryId: string) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  loveLetters,
  upgrades,
  onBuyUpgrade,
  onClose,
  selectedLiveryId = 'crimson_valentine',
  unlockedLiveryIds = ['crimson_valentine'],
  onSelectLivery,
}) => {
  const [activeTab, setActiveTab] = useState<'upgrades' | 'paint'>('upgrades');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Snowflake':
        return <Snowflake className="w-5 h-5 text-cyan-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-rose-400" />;
      case 'Heart':
        return <Heart className="w-5 h-5 text-pink-400" />;
      case 'Music':
        return <Music className="w-5 h-5 text-purple-400" />;
      default:
        return <Snowflake className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/75 z-40 select-none">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-rose-400">
                Solstice Workshop & Garage
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-950/60 border border-rose-800/50 text-rose-300">
                Cozy Forge
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Tune your vintage Heartplow tractor using Love Letters found in the snowdrifts.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-bold tabular-nums">
              <Mail className="w-4 h-4 text-rose-400" />
              <span>{loveLetters} Letters</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workshop Navigation Tabs */}
        <div className="flex items-center gap-2 pt-3">
          <button
            onClick={() => setActiveTab('upgrades')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'upgrades'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Equipment Upgrades</span>
          </button>

          <button
            onClick={() => setActiveTab('paint')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'paint'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Solstice Paint Works ({unlockedLiveryIds.length}/{PAINT_LIVERIES.length})</span>
          </button>
        </div>

        {/* Tab 1: Equipment Upgrades */}
        {activeTab === 'upgrades' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 overflow-y-auto">
          {Object.values(UPGRADES).map((item) => {
            const currentLevel = upgrades[item.id] || 1;
            const isMaxed = currentLevel >= item.tiers.length;
            const currentTier = item.tiers[currentLevel - 1];
            const nextTier = !isMaxed ? item.tiers[currentLevel] : null;
            const canAfford = nextTier ? loveLetters >= nextTier.cost : false;

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                        {getIcon(item.icon)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-slate-100">{item.name}</h4>
                        <span className="text-xs text-slate-400">{currentTier.title}</span>
                      </div>
                    </div>

                    {/* Level pips */}
                    <div className="flex items-center gap-1">
                      {item.tiers.map((t) => (
                        <span
                          key={t.level}
                          className={`w-2 h-2 rounded-full ${
                            t.level <= currentLevel ? 'bg-rose-500' : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                    {currentTier.desc}
                  </p>
                  {!isMaxed && nextTier && (
                    <div className="text-[11px] text-amber-300/90 font-medium mb-3">
                      Next Tier: {nextTier.desc}
                    </div>
                  )}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Tier {currentLevel} of {item.tiers.length}
                  </span>

                  {isMaxed ? (
                    <span className="text-xs font-semibold text-emerald-400 px-3 py-1 bg-emerald-950/40 rounded border border-emerald-800/40">
                      MAX TIER
                    </span>
                  ) : (
                    <button
                      disabled={!canAfford}
                      onClick={() => onBuyUpgrade(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/50'
                          : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Upgrade ({nextTier?.cost} Letters)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}

        {/* Tab 2: Tractor Paint Finishes */}
        {activeTab === 'paint' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 overflow-y-auto">
            {PAINT_LIVERIES.map((livery) => {
              const isUnlocked = unlockedLiveryIds.includes(livery.id);
              const isEquipped = selectedLiveryId === livery.id;
              const canAfford = loveLetters >= livery.cost;

              // Convert integer hex colors to CSS strings
              const hexBody = `#${livery.bodyColor.toString(16).padStart(6, '0')}`;
              const hexTrim = `#${livery.trimColor.toString(16).padStart(6, '0')}`;
              const hexRoof = `#${livery.roofColor.toString(16).padStart(6, '0')}`;

              return (
                <div
                  key={livery.id}
                  className={`flex flex-col justify-between p-4 rounded-xl border transition-all ${
                    isEquipped
                      ? 'bg-slate-800/95 border-rose-500 shadow-md ring-1 ring-rose-500/50'
                      : isUnlocked
                      ? 'bg-slate-800/70 border-slate-700 hover:border-slate-600'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {/* Color swatch trio */}
                        <div className="flex items-center -space-x-1.5">
                          <span
                            className="w-5 h-5 rounded-full border-2 border-slate-900 shadow-sm"
                            style={{ backgroundColor: hexBody }}
                          />
                          <span
                            className="w-5 h-5 rounded-full border-2 border-slate-900 shadow-sm"
                            style={{ backgroundColor: hexRoof }}
                          />
                          <span
                            className="w-5 h-5 rounded-full border-2 border-slate-900 shadow-sm"
                            style={{ backgroundColor: hexTrim }}
                          />
                        </div>

                        <div>
                          <h4 className="font-semibold text-sm text-white">{livery.name}</h4>
                          <span className="text-[11px] text-slate-400">{livery.colorName}</span>
                        </div>
                      </div>

                      {isEquipped && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-rose-300 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800/60">
                          <Check className="w-3.5 h-3.5" />
                          EQUIPPED
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                      {livery.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {livery.cost === 0 ? 'Classic Default' : `${livery.cost} Love Letters`}
                    </span>

                    {isEquipped ? (
                      <span className="text-xs font-semibold text-slate-400">Active</span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => onSelectLivery && onSelectLivery(livery.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Equip Livery
                      </button>
                    ) : (
                      <button
                        disabled={!canAfford}
                        onClick={() => onSelectLivery && onSelectLivery(livery.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          canAfford
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
                            : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <Palette className="w-3.5 h-3.5" />
                        <span>Unlock ({livery.cost} Letters)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            Back to Plowing (Esc / G)
          </button>
        </div>
      </div>
    </div>
  );
};
