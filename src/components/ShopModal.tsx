/**
 * Solstice Workshop (Garage / Upgrades Modal)
 * Allows player to spend gathered Love Letters on snowplow upgrades
 */

import React, { useState } from 'react';
import { Check, Flame, Heart, Mail, Music, Palette, Snowflake, Sparkles, Wrench, X, Zap } from 'lucide-react';
import {
  TRACTOR_DECALS,
  TRACTOR_PAINTS,
  UPGRADES,
  type TractorDecal,
  type TractorPaint,
} from '../game/constants';

interface ShopModalProps {
  loveLetters: number;
  upgrades: Record<string, number>;
  selectedPaintId?: string;
  unlockedPaintIds?: string[];
  selectedDecalId?: string;
  unlockedDecalIds?: string[];
  onBuyUpgrade: (upgradeId: string) => void;
  onSelectPaint?: (paintId: string) => void;
  onSelectDecal?: (decalId: string) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  loveLetters,
  upgrades,
  selectedPaintId = 'crimson',
  unlockedPaintIds = ['crimson'],
  selectedDecalId = 'heart',
  unlockedDecalIds = ['heart'],
  onBuyUpgrade,
  onSelectPaint,
  onSelectDecal,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'equipment' | 'paint'>('equipment');
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
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-rose-400">
                Solstice Workshop & Atelier
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-950/60 border border-rose-800/50 text-rose-300">
                Cozy Forge
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tune plow mechanics or customize colors & liveries using Love Letters found in the snowdrifts.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-bold tabular-nums text-sm">
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

        {/* Tab switcher */}
        <div className="flex items-center gap-2 pt-3">
          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'equipment'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Equipment Upgrades</span>
          </button>

          <button
            onClick={() => setActiveTab('paint')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'paint'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Paint & Livery Atelier</span>
          </button>
        </div>

        {/* Tab 1: Equipment Upgrades */}
        {activeTab === 'equipment' && (
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

        {/* Tab 2: Custom Paint & Decals */}
        {activeTab === 'paint' && (
          <div className="flex flex-col gap-5 py-4 overflow-y-auto">
            {/* Paints */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Heartplow Bodywork Coatings
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {TRACTOR_PAINTS.map((paint) => {
                  const isUnlocked = unlockedPaintIds.includes(paint.id);
                  const isEquipped = selectedPaintId === paint.id;
                  const canAfford = loveLetters >= paint.cost;

                  return (
                    <div
                      key={paint.id}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                        isEquipped
                          ? 'border-rose-500 bg-rose-950/40 shadow-md ring-1 ring-rose-500/50'
                          : 'border-slate-700/70 bg-slate-800/70 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                              style={{ backgroundColor: `#${paint.colorHex.toString(16).padStart(6, '0')}` }}
                            />
                            <span className="font-semibold text-sm text-white">{paint.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{paint.finish}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-snug">{paint.desc}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between">
                        <span className="text-[11px] text-amber-300 font-mono">
                          {isUnlocked ? 'Unlocked' : `${paint.cost} Letters`}
                        </span>

                        {isEquipped ? (
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Equipped</span>
                          </span>
                        ) : isUnlocked ? (
                          <button
                            onClick={() => onSelectPaint && onSelectPaint(paint.id)}
                            className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold cursor-pointer"
                          >
                            Apply Color
                          </button>
                        ) : (
                          <button
                            disabled={!canAfford}
                            onClick={() => onSelectPaint && onSelectPaint(paint.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                              canAfford
                                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                            }`}
                          >
                            Unlock
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Decals & Crests */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Front Grille Emblems & Crests
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {TRACTOR_DECALS.map((decal) => {
                  const isUnlocked = unlockedDecalIds.includes(decal.id);
                  const isEquipped = selectedDecalId === decal.id;
                  const canAfford = loveLetters >= decal.cost;

                  return (
                    <div
                      key={decal.id}
                      className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                        isEquipped
                          ? 'border-rose-500 bg-rose-950/40 shadow-md ring-1 ring-rose-500/50'
                          : 'border-slate-700/70 bg-slate-800/70 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/40"
                            style={{ backgroundColor: `#${decal.colorHex.toString(16).padStart(6, '0')}` }}
                          />
                          <span className="font-semibold text-xs text-white">{decal.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{decal.desc}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between">
                        <span className="text-[10px] text-amber-300 font-mono">
                          {isUnlocked ? 'Unlocked' : `${decal.cost} Letters`}
                        </span>

                        {isEquipped ? (
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Equipped</span>
                          </span>
                        ) : isUnlocked ? (
                          <button
                            onClick={() => onSelectDecal && onSelectDecal(decal.id)}
                            className="px-2.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-semibold cursor-pointer"
                          >
                            Apply
                          </button>
                        ) : (
                          <button
                            disabled={!canAfford}
                            onClick={() => onSelectDecal && onSelectDecal(decal.id)}
                            className={`px-2.5 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                              canAfford
                                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                            }`}
                          >
                            Unlock
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
