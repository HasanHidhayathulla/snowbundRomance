/**
 * Solstice Winter Pass (Heart Pass) Modal Component
 * Displays 10 progression tiers, milestone unlock statuses, XP tracker,
 * reward claiming actions, and cosmetic preview lockups.
 */

import React from 'react';
import {
  Award,
  CheckCircle,
  Crown,
  Flame,
  Gift,
  Lock,
  Mail,
  Moon,
  Sparkles,
  Snowflake,
  X,
  Zap,
} from 'lucide-react';
import { WINTER_PASS_TIERS, type WinterPassTier } from '../game/constants';

interface WinterPassModalProps {
  winterPassXp: number;
  claimedPassTierIds: number[];
  onClaimTierReward: (tierLevel: number) => void;
  onClose: () => void;
}

export const WinterPassModal: React.FC<WinterPassModalProps> = ({
  winterPassXp,
  claimedPassTierIds,
  onClaimTierReward,
  onClose,
}) => {
  const currentTier = [...WINTER_PASS_TIERS].reverse().find((t) => winterPassXp >= t.requiredXp);
  const currentLevel = currentTier ? currentTier.level : 0;
  const nextTier = WINTER_PASS_TIERS.find((t) => winterPassXp < t.requiredXp);

  const getTierIcon = (iconName: string) => {
    switch (iconName) {
      case 'Mail':
        return <Mail className="w-5 h-5 text-rose-400" />;
      case 'Snowflake':
        return <Snowflake className="w-5 h-5 text-sky-400" />;
      case 'Gift':
        return <Gift className="w-5 h-5 text-amber-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-pink-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-amber-500" />;
      case 'Moon':
        return <Moon className="w-5 h-5 text-purple-400" />;
      case 'Crown':
        return <Crown className="w-5 h-5 text-yellow-400" />;
      default:
        return <Award className="w-5 h-5 text-rose-400" />;
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/85 z-40 select-none backdrop-blur-none">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-5 max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-600 to-amber-600 text-white shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-wide text-white">SOLSTICE WINTER PASS</h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-700/60 text-[11px] font-mono font-bold text-rose-300">
                  TIER {currentLevel} / 10
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Plow snow, sustain romantic combos, and rescue village keepsakes to unlock festive rewards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Solstice Warmth XP:</span>
              <span className="font-mono text-amber-300 font-bold">{winterPassXp} XP</span>
            </span>
            <span className="text-slate-400">
              {nextTier ? `Next Tier at ${nextTier.requiredXp} XP` : 'All Pass Milestones Reached!'}
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-600 via-amber-500 to-yellow-400 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (winterPassXp / 2000) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* 10 Tiers Track Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto pr-1 flex-1 max-h-[52vh]">
          {WINTER_PASS_TIERS.map((tier) => {
            const isUnlocked = winterPassXp >= tier.requiredXp;
            const isClaimed = claimedPassTierIds.includes(tier.level);

            return (
              <div
                key={tier.level}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isClaimed
                    ? 'bg-slate-900/60 border-slate-800 opacity-80'
                    : isUnlocked
                    ? 'bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border-rose-500/80 shadow-lg'
                    : 'bg-slate-950/50 border-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                      isClaimed
                        ? 'bg-slate-800/80 border-slate-700'
                        : isUnlocked
                        ? 'bg-rose-900/40 border-rose-600 shadow-sm'
                        : 'bg-slate-900/40 border-slate-800'
                    }`}
                  >
                    {getTierIcon(tier.iconName)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        Tier {tier.level}
                      </span>
                      <span className="text-xs font-bold text-white truncate max-w-[150px]">
                        {tier.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-300 font-medium">
                      {tier.rewardDescription}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Requires {tier.requiredXp} XP
                    </span>
                  </div>
                </div>

                {/* Claim or Lock Button */}
                <div>
                  {isClaimed ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Claimed
                    </span>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => onClaimTierReward(tier.level)}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-bold text-xs shadow-md cursor-pointer transition-transform active:scale-95 flex items-center gap-1.5"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      Claim
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono">
                      <Lock className="w-3 h-3 text-slate-600" />
                      {tier.requiredXp - winterPassXp} XP left
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Tip: Clear landmarks (+120 XP) and emergency dispatches for large XP boosts.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Return to Plowing (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
