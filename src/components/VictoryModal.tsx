/**
 * Grand Solstice Celebration Victory Modal
 */

import React from 'react';
import { Heart, Sparkles, RotateCcw, Play } from 'lucide-react';

interface VictoryModalProps {
  snowClearedPercent: number;
  loveLetters: number;
  giftsFound: number;
  totalGifts: number;
  onContinue: () => void;
  onRestart: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  snowClearedPercent,
  loveLetters,
  giftsFound,
  totalGifts,
  onContinue,
  onRestart,
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/80 z-40 select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col items-center text-center gap-5">
        <div className="p-3 rounded-2xl bg-rose-950/60 border border-rose-800/60">
          <Heart className="w-10 h-10 text-rose-500 fill-rose-500" />
        </div>

        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Grand Solstice Celebration!
          </h2>
          <p className="text-xs text-rose-300 font-semibold uppercase tracking-widest mt-1">
            All Lovers Reunited · Village Lit with Hope
          </p>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            The snowdrift lanes are open, the festival lights shine across the frozen river,
            and the laughter of reunited couples echoes across Valentine Valley.
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

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
          <button
            onClick={onContinue}
            className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Keep Plowing Free Roam</span>
          </button>

          <button
            onClick={onRestart}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Fresh Snowfall</span>
          </button>
        </div>
      </div>
    </div>
  );
};
