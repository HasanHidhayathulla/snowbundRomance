/**
 * Solstice Emergency Dispatch & Radio Modal
 * Allows players to accept urgent village requests (deliveries, snow clearing, rescues),
 * monitor timers and rewards, and tune the Valley Solstice Radio.
 */

import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Music,
  Radio,
  Sparkles,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import {
  RADIO_STATIONS,
  SOLSTICE_QUESTS,
  type RadioStation,
  type SolsticeQuest,
} from '../game/constants';
import type { ActiveQuestState } from '../game/engine';

interface DispatchRadioModalProps {
  radioStationId: string;
  activeQuest: ActiveQuestState | null;
  completedQuestIds: string[];
  loveLetters: number;
  onSelectRadioStation: (stationId: string) => void;
  onStartQuest: (questId: string) => void;
  onCancelQuest: () => void;
  onClose: () => void;
}

export const DispatchRadioModal: React.FC<DispatchRadioModalProps> = ({
  radioStationId,
  activeQuest,
  completedQuestIds,
  loveLetters,
  onSelectRadioStation,
  onStartQuest,
  onCancelQuest,
  onClose,
}) => {
  const currentStation = RADIO_STATIONS.find((s) => s.id === radioStationId) || RADIO_STATIONS[0];

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/80 z-40 select-none">
      <div className="w-full max-w-4xl bg-slate-900 border border-sky-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-950/70 border border-sky-800/60 text-sky-400">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-white">Valley Dispatch & Solstice Radio</h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800/60 font-semibold uppercase tracking-wider">
                  Emergency Broadcast
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Answer priority calls from stranded villagers and tune into cozy winter frequencies.
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col md:flex-row gap-6">
          {/* Left Column: Radio Tuner */}
          <div className="w-full md:w-80 flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-sky-400" />
                  <span>Plow Radio Tuner</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400 animate-pulse">● BROADCAST LIVE</span>
              </div>

              {/* Station display card */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{currentStation.name}</span>
                  <span className="font-mono text-xs font-semibold text-amber-300">{currentStation.frequency}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{currentStation.tagline}</p>
              </div>

              {/* Stations Grid */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Select Frequency
                </label>
                {RADIO_STATIONS.map((station) => (
                  <button
                    key={station.id}
                    onClick={() => onSelectRadioStation(station.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                      radioStationId === station.id
                        ? 'border-sky-500 bg-sky-950/60 text-white shadow-md'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{station.name}</span>
                      <span className="text-[10px] text-slate-400">{station.frequency}</span>
                    </div>
                    {radioStationId === station.id && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">
                        TUNED
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Tip Card */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-sky-300 font-mono text-[10px]">R</kbd> during gameplay to quickly cycle radio stations while driving!
              </span>
            </div>
          </div>

          {/* Right Column: Village Emergency Dispatches */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Emergency Village Dispatches ({completedQuestIds.length}/{SOLSTICE_QUESTS.length} Completed)</span>
              </h4>
              {activeQuest && (
                <button
                  onClick={onCancelQuest}
                  className="text-xs text-rose-400 hover:text-rose-300 underline cursor-pointer"
                >
                  Abandon Active Mission
                </button>
              )}
            </div>

            {/* Active Quest Alert Banner */}
            {activeQuest && (
              <div className="p-3.5 rounded-xl bg-sky-950/70 border border-sky-500 text-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-5 h-5 text-sky-300 shrink-0 mt-0.5 animate-spin" />
                  <div>
                    <div className="font-bold text-sm text-white">Active Dispatch: {activeQuest.quest.title}</div>
                    <div className="text-xs text-sky-300/90 mt-0.5">
                      Requested by {activeQuest.quest.requester} · Target is ~{activeQuest.distanceToTarget}m away
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-300 font-medium">Time Left</div>
                    <div className="text-base font-mono font-bold text-amber-300">
                      {Math.ceil(activeQuest.remainingSec)}s
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
                  >
                    Track in Valley
                  </button>
                </div>
              </div>
            )}

            {/* Quests List */}
            <div className="flex flex-col gap-3 overflow-y-auto">
              {SOLSTICE_QUESTS.map((quest) => {
                const isCompleted = completedQuestIds.includes(quest.id);
                const isActive = activeQuest?.quest.id === quest.id;

                return (
                  <div
                    key={quest.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col gap-2.5 ${
                      isActive
                        ? 'border-sky-500 bg-slate-800/95 shadow-md'
                        : isCompleted
                        ? 'border-emerald-700/50 bg-slate-900/60'
                        : 'border-slate-800 bg-slate-800/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Compass className="w-5 h-5 text-sky-400" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-sm text-white">{quest.title}</h5>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-semibold uppercase">
                              {quest.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">Caller: {quest.requester}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800/40 text-amber-300 text-xs font-mono font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>+{quest.rewardLetters} Letters</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{quest.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Limit: {quest.timeLimitSec}s</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Beacon Waypoint</span>
                        </span>
                      </div>

                      {isCompleted ? (
                        <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolved</span>
                        </span>
                      ) : isActive ? (
                        <span className="text-sky-300 font-semibold text-xs animate-pulse">
                          Mission In Progress...
                        </span>
                      ) : (
                        <button
                          onClick={() => onStartQuest(quest.id)}
                          className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
                        >
                          Accept Callout
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            Return to Plowing (Esc / Q)
          </button>
        </div>
      </div>
    </div>
  );
};
