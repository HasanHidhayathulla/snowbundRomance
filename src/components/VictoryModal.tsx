/**
 * Grand Solstice Celebration Victory Modal
 */

import React from 'react';
import { ArrowRight, Heart, Map as MapIcon, RotateCcw, Sparkles } from 'lucide-react';

interface VictoryModalProps {
  levelNumber: number;
  levelName: string;
  nextLevelName: string | null;
  snowClearedPercent: number;
  loveLetters: number;
  giftsFound: number;
  totalGifts: number;
  onNextLevel?: () => void;
  onOpenLevelSelect: () => void;
  onContinue: () => void;
  onRestart: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelNumber,
  levelName,
  nextLevelName,
  snowClearedPercent,
  loveLetters,
  giftsFound,
  totalGifts,
  onNextLevel,
  onOpenLevelSelect,
  onContinue,
  onRestart,
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/80 z-50 select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col items-center text-center gap-5">
        <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-800/60">
          <Heart className="w-10 h-10 text-rose-500 fill-rose-500" />
        </div>

        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-cyan-300">
            Level {levelNumber} Cleared · {levelName}
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1">
            Grand Solstice Celebration!
          </h2>
          <p className="text-xs text-rose-300 font-semibold uppercase tracking-widest mt-1">
            All Lovers Reunited · Region Lit with Hope
          </p>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            The snowdrift lanes are open, the festival lights shine bright, and the laughter of
            reunited couples echoes across {levelName}.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 w-full">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">Snow Cleared</span>
            <span className="text-xl font-bold text-cyan-300 tabular-nums">{snowClearedPercent}%</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">Love Letters</span>
            <span className="text-xl font-bold text-amber-300 tabular-nums">{loveLetters}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block mb-1">Gifts Discovered</span>
            <span className="text-xl font-bold text-rose-300 tabular-nums">{giftsFound}/{totalGifts}</span>
          </div>
        </div>

        {/* Primary Next Level CTA when unlocked */}
        {nextLevelName && onNextLevel && (
          <button
            type="button"
            onClick={onNextLevel}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-rose-600 hover:from-cyan-500 hover:to-rose-500 font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <span>Advance to Level {levelNumber + 1}: {nextLevelName}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* Secondary Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 font-semibold text-xs text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Keep Plowing Free Roam</span>
          </button>

          <button
            type="button"
            onClick={onOpenLevelSelect}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <MapIcon className="w-4 h-4" />
            <span>Maps</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Fresh Snowfall</span>
          </button>
        </div>
      </div>
    </div>
  );
};
