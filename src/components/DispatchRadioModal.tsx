/**
 * Solstice Emergency Dispatch & Radio Station Studio Modal
 * Combines:
 * 1. Solstice Emergency Dispatches (timed mission calls from village citizens)
 * 2. Valentine Valley Weather & Radio Synthesizer Tuner
 * 3. Heartplow Tractor Paint & Livery Finishes
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Compass,
  Croissant,
  Flame,
  Heart,
  HeartPulse,
  Mail,
  Music,
  Paintbrush,
  Palette,
  Radio,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import {
  RADIO_STATIONS,
  TRACTOR_SKINS,
  VILLAGE_DISPATCHES,
  type RadioStation,
  type TractorSkin,
  type VillageDispatch,
} from '../game/constants';

interface DispatchRadioModalProps {
  loveLetters: number;
  activeSkinId: string;
  unlockedSkinIds: string[];
  activeDispatchId: string | null;
  activeDispatchProgress: number;
  completedDispatchIds: string[];
  radioStationId: string;
  onSelectDispatch: (dispatchId: string) => void;
  onSelectStation: (stationId: string) => void;
  onApplySkin: (skinId: string) => void;
  onClose: () => void;
}

export const DispatchRadioModal: React.FC<DispatchRadioModalProps> = ({
  loveLetters,
  activeSkinId,
  unlockedSkinIds,
  activeDispatchId,
  activeDispatchProgress,
  completedDispatchIds,
  radioStationId,
  onSelectDispatch,
  onSelectStation,
  onApplySkin,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'dispatches' | 'radio' | 'skins'>('dispatches');

  const getDispatchIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-rose-400" />;
      case 'Croissant':
        return <Croissant className="w-5 h-5 text-amber-400" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-pink-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/80 z-40 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-4 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-rose-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Village Radio & Citizen Dispatches</h3>
              <p className="text-xs text-slate-400">Emergency plowing requests, valley broadcasts, and tractor liveries</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-bold text-xs">
              <Mail className="w-3.5 h-3.5 text-rose-400" />
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('dispatches')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'dispatches' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Emergency Dispatches ({completedDispatchIds.length}/{VILLAGE_DISPATCHES.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('radio')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'radio' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Valley Radio</span>
          </button>

          <button
            onClick={() => setActiveTab('skins')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'skins' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Tractor Livery</span>
          </button>
        </div>

        {/* TAB 1: EMERGENCY DISPATCH MISSIONS */}
        {activeTab === 'dispatches' && (
          <div className="flex flex-col gap-3 overflow-y-auto pr-1">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300">
              Citizens in Valentine Valley are cut off by heavy snowdrifts. Select a dispatch to broadcast its beacon to your radar and plow the required clearing radius for rewards!
            </div>

            <div className="flex flex-col gap-2.5">
              {VILLAGE_DISPATCHES.map((dispatch) => {
                const isCompleted = completedDispatchIds.includes(dispatch.id);
                const isActive = activeDispatchId === dispatch.id;

                return (
                  <div
                    key={dispatch.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-rose-950/30 border-rose-500/80 shadow-md ring-1 ring-rose-500/30'
                        : isCompleted
                        ? 'bg-slate-800/40 border-slate-800 opacity-70'
                        : 'bg-slate-800/80 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-700/70 mt-0.5">
                          {getDispatchIcon(dispatch.icon)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-white">{dispatch.title}</h4>
                            {isCompleted ? (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Rescued
                              </span>
                            ) : isActive ? (
                              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-600 text-white animate-pulse">
                                Active Target
                              </span>
                            ) : null}
                          </div>
                          <div className="text-[11px] text-rose-300/90 font-medium mt-0.5">
                            {dispatch.caller}
                          </div>
                          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                            {dispatch.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700">
                          <Mail className="w-3.5 h-3.5 text-rose-400" />
                          <span>+{dispatch.rewardLetters} Letters</span>
                        </div>

                        {!isCompleted && (
                          <button
                            onClick={() => onSelectDispatch(dispatch.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                              isActive
                                ? 'bg-rose-600 text-white hover:bg-rose-500'
                                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                            }`}
                          >
                            {isActive ? 'Tracking on Radar' : 'Track on Radar'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar if active */}
                    {isActive && !isCompleted && (
                      <div className="mt-3 pt-2.5 border-t border-rose-900/40">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                          <span>Snow Clearance Progress:</span>
                          <span className="font-mono text-cyan-300">
                            {Math.round(activeDispatchProgress * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-rose-500 transition-all duration-200 rounded-full"
                            style={{ width: `${Math.round(activeDispatchProgress * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: VALLEY RADIO FREQUENCIES */}
        {activeTab === 'radio' && (
          <div className="flex flex-col gap-4 overflow-y-auto pr-1">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-900 text-rose-400 flex-shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <p>
                The Valentine Valley Radio Relay broadcasts cozy procedural synthesizer soundscapes straight into your tractor's dashboard receiver.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {RADIO_STATIONS.map((station) => {
                const isCurrent = radioStationId === station.id;

                return (
                  <div
                    key={station.id}
                    onClick={() => onSelectStation(station.id)}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-rose-950/40 border-rose-500 shadow-lg ring-1 ring-rose-500/40'
                        : 'bg-slate-800/70 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-mono font-black text-xs border ${
                          isCurrent
                            ? 'bg-rose-600 border-rose-400 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        <span>{station.freq.split(' ')[0]}</span>
                        <span className="text-[9px] font-normal opacity-80">FM</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-white">{station.name}</h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-600/80 text-[10px] text-white font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              ON AIR
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-rose-300/90 font-medium mt-0.5">
                          {station.genre}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{station.description}</p>
                      </div>
                    </div>

                    <button
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      }`}
                    >
                      {isCurrent ? 'Listening' : 'Tune In'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: TRACTOR PAINT & LIVERY */}
        {activeTab === 'skins' && (
          <div className="flex flex-col gap-4 overflow-y-auto pr-1">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300 flex items-center gap-3">
              <Paintbrush className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <p>
                Coat the vintage Heartplow tractor in specialized alpine lacquers. Paint liveries are saved persistently and render in 3D during gameplay and Solstice photo postcards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TRACTOR_SKINS.map((skin) => {
                const isUnlocked = unlockedSkinIds.includes(skin.id);
                const isEquipped = activeSkinId === skin.id;
                const canAfford = loveLetters >= skin.unlockCost;

                return (
                  <div
                    key={skin.id}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                      isEquipped
                        ? 'bg-rose-950/40 border-rose-500 shadow-md ring-1 ring-rose-500/40'
                        : 'bg-slate-800/70 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      {/* Color Preview Swatch */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-lg border border-white/20 shadow-sm"
                            style={{ backgroundColor: `#${skin.paintColor.toString(16).padStart(6, '0')}` }}
                          />
                          <div
                            className="w-4 h-4 rounded-md border border-white/20 shadow-sm -ml-2"
                            style={{ backgroundColor: `#${skin.cabinRoofColor.toString(16).padStart(6, '0')}` }}
                          />
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm -ml-1.5"
                            style={{ backgroundColor: `#${skin.trimColor.toString(16).padStart(6, '0')}` }}
                          />
                          <span className="font-semibold text-xs text-slate-100 ml-1">
                            {skin.name}
                          </span>
                        </div>

                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                          {skin.tag}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        {skin.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                      {isUnlocked ? (
                        <span className="text-[11px] text-emerald-400 font-medium">Unlocked</span>
                      ) : (
                        <span className="text-[11px] text-amber-300 font-mono font-bold flex items-center gap-1">
                          <Mail className="w-3 h-3 text-rose-400" />
                          {skin.unlockCost} Letters
                        </span>
                      )}

                      {isEquipped ? (
                        <span className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold shadow-sm">
                          Equipped
                        </span>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => onApplySkin(skin.id)}
                          className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Equip Finish
                        </button>
                      ) : (
                        <button
                          disabled={!canAfford}
                          onClick={() => onApplySkin(skin.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            canAfford
                              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                          }`}
                        >
                          Unlock Livery
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Return to Plowing (Esc / R)
          </button>
        </div>
      </div>
    </div>
  );
};
