/**
 * Solstice Workshop (Garage / Upgrades Modal)
 * Allows player to spend gathered Love Letters on snowplow upgrades
 */

import React from 'react';
import { Flame, Heart, Mail, Music, Snowflake, X, Zap } from 'lucide-react';
import { UPGRADES } from '../game/constants';

interface ShopModalProps {
  loveLetters: number;
  upgrades: Record<string, number>;
  onBuyUpgrade: (upgradeId: string) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  loveLetters,
  upgrades,
  onBuyUpgrade,
  onClose,
}) => {
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

        {/* Upgrades List */}
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
