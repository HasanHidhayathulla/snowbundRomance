/**
 * Solstice Village Dispatch & Requests Board Modal
 * Allows players to take on time-sensitive village quests, deliveries, and rescues
 */

import React from 'react';
import {
  CheckCircle2,
  Clock,
  Compass,
  Gift,
  Mail,
  MapPin,
  Send,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';
import { SOLSTICE_QUESTS, type SolsticeQuest } from '../game/constants';

interface QuestModalProps {
  activeQuest: SolsticeQuest | null;
  completedQuestIds: string[];
  loveLetters: number;
  onAcceptQuest: (questId: string) => void;
  onCancelQuest: () => void;
  onClose: () => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({
  activeQuest,
  completedQuestIds,
  loveLetters,
  onAcceptQuest,
  onCancelQuest,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/80 z-40 select-none">
      <div className="w-full max-w-3xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-800/60 text-amber-300">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Village Dispatch Board
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60 font-semibold">
                  Solstice Errands
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Take urgent town requests to plow pathways, deliver solstice baked goods, and reunite lovers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-semibold text-xs">
              <Mail className="w-4 h-4 text-rose-400" />
              <span>{loveLetters} Letters</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Quest Banner if one is running */}
        {activeQuest && (
          <div className="my-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-950/60 to-rose-950/60 border border-amber-500/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Compass className="w-5 h-5 text-amber-400 animate-spin" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  Active Dispatch Mission
                </span>
                <h4 className="text-sm font-semibold text-white">{activeQuest.title}</h4>
                <p className="text-xs text-slate-300">{activeQuest.description}</p>
              </div>
            </div>

            <button
              onClick={onCancelQuest}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Abandon Quest
            </button>
          </div>
        )}

        {/* Quests Grid */}
        <div className="flex-1 overflow-y-auto py-3 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {SOLSTICE_QUESTS.map((quest) => {
            const isCompleted = completedQuestIds.includes(quest.id);
            const isCurrent = activeQuest?.id === quest.id;

            return (
              <div
                key={quest.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                    : isCompleted
                    ? 'bg-slate-800/80 border-emerald-500/40'
                    : 'bg-slate-800/70 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-700">
                        {quest.category === 'delivery' ? (
                          <Truck className="w-4 h-4 text-cyan-400" />
                        ) : quest.category === 'clearing' ? (
                          <Sparkles className="w-4 h-4 text-amber-400" />
                        ) : (
                          <MapPin className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{quest.title}</h4>
                        <span className="text-[11px] text-amber-300/80 font-medium">
                          From: {quest.requester}
                        </span>
                      </div>
                    </div>

                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/50">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Done
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {quest.timeLimitSec}s
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                    {quest.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-rose-300 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-rose-400" />
                    +{quest.rewardLetters} Letters
                  </span>

                  {isCurrent ? (
                    <span className="px-3 py-1 text-xs font-bold text-amber-300 bg-amber-950/60 rounded border border-amber-700/60">
                      In Progress...
                    </span>
                  ) : (
                    <button
                      onClick={() => onAcceptQuest(quest.id)}
                      className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isCompleted ? 'Replay (+Letters)' : 'Accept Quest'}</span>
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
            Back to Plowing (Esc / Q)
          </button>
        </div>
      </div>
    </div>
  );
};
