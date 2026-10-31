/**
 * Solstice Scrapbook & Heart Log (Lore & Collectibles Codex)
 * Shows unlocked Solstice gifts, reunited village couples with their love stories,
 * and player journey stats.
 */

import React, { useState } from 'react';
import { BookOpen, Coffee, Flower, Gift, Heart, Lock, Mail, Music, Sparkles, X } from 'lucide-react';
import { LANDMARKS, ROMANTIC_GIFTS, type Landmark, type RomanticGift } from '../game/constants';

interface ScrapbookModalProps {
  unlockedGifts: RomanticGift[];
  clearedLandmarks: Landmark[];
  highestCombo: number;
  totalLetters: number;
  onClose: () => void;
}

export const ScrapbookModal: React.FC<ScrapbookModalProps> = ({
  unlockedGifts,
  clearedLandmarks,
  highestCombo,
  totalLetters,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'gifts' | 'couples'>('gifts');

  const getGiftIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-amber-400" />;
      case 'Music':
        return <Music className="w-5 h-5 text-purple-400" />;
      case 'Lock':
        return <Lock className="w-5 h-5 text-cyan-400" />;
      case 'Mail':
        return <Mail className="w-5 h-5 text-rose-400" />;
      case 'Flower':
        return <Flower className="w-5 h-5 text-pink-400" />;
      default:
        return <Gift className="w-5 h-5 text-amber-300" />;
    }
  };

  const collectedCount = unlockedGifts.filter((g) => g.collected).length;
  const reunitedCount = clearedLandmarks.filter((l) => l.cleared).length;

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/80 z-40 select-none">
      <div className="w-full max-w-3xl bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800/60 text-rose-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-white">Solstice Scrapbook & Heart Log</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800/60 font-semibold">
                  Memories & Lore
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Archived romantic keepsakes and village reunions uncovered from the snow.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs & Overview Counters */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('gifts')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'gifts'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Solstice Keepsakes ({collectedCount}/{ROMANTIC_GIFTS.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('couples')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'couples'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Reunited Couples ({reunitedCount}/{LANDMARKS.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1 font-mono text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Best Combo: x{highestCombo.toFixed(1)}</span>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4">
          {activeTab === 'gifts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {ROMANTIC_GIFTS.map((g) => {
                const found = unlockedGifts.find((item) => item.id === g.id)?.collected;
                return (
                  <div
                    key={g.id}
                    className={`p-4 rounded-xl border transition-all ${
                      found
                        ? 'bg-slate-800/90 border-rose-500/40 shadow-sm'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-lg border ${
                          found
                            ? 'bg-slate-900 border-slate-700'
                            : 'bg-slate-950/60 border-slate-800 text-slate-600'
                        }`}
                      >
                        {found ? getGiftIcon(g.icon) : <Lock className="w-5 h-5 text-slate-600" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`font-semibold text-sm ${
                              found ? 'text-slate-100' : 'text-slate-500'
                            }`}
                          >
                            {found ? g.name : 'Buried Keepsake'}
                          </h4>
                          {found ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 font-mono">
                              +{g.value} Letters
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-600 uppercase font-mono">
                              Buried in Powder
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-rose-300/90 italic mt-2 leading-relaxed">
                          {found ? g.quote : 'Plow the village drifts to discover this solstice sentiment.'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'couples' && (
            <div className="flex flex-col gap-3.5">
              {LANDMARKS.map((lm) => {
                const isCleared = clearedLandmarks.find((item) => item.id === lm.id)?.cleared;
                return (
                  <div
                    key={lm.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCleared
                        ? 'bg-slate-800/90 border-rose-500/40 shadow-sm'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <Heart
                          className={`w-4 h-4 ${
                            isCleared ? 'text-rose-500 fill-rose-500' : 'text-slate-600'
                          }`}
                        />
                        <h4
                          className={`font-bold text-sm ${
                            isCleared ? 'text-white' : 'text-slate-400'
                          }`}
                        >
                          {lm.name}
                        </h4>
                      </div>

                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                          isCleared
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {isCleared ? 'Reunited' : 'Road Blocked by Snow'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                      {lm.description}
                    </p>

                    {isCleared ? (
                      <div className="mt-2 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-rose-300 italic">
                        {lm.coupleCoupleQuotes.map((q, i) => (
                          <p key={i} className="mb-1 last:mb-0">
                            {q}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-cyan-400/80 font-mono">
                        Clear {(lm.requiredClearRatio * 100).toFixed(0)}% snow in this area to reunite the lovers.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            Close Scrapbook (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
