/**
 * Levels & Maps Selection Modal for Snowbound Hearts
 * Displays all 4 playable winter maps with an interactive SVG topographic preview,
 * landmark overview, snow resistance rating, and Love Letter / Victory unlocks.
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  Compass,
  Gift,
  Lock,
  Mail,
  Map as MapIcon,
  MapPin,
  Play,
  Snowflake,
  Sparkles,
  Unlock,
  X,
} from 'lucide-react';
import { LEVEL_MAPS, WORLD_SIZE, type LevelMapConfig } from '../game/constants';

interface LevelSelectModalProps {
  currentLevelId: string;
  unlockedLevelIds: string[];
  completedLevelIds: string[];
  loveLetters: number;
  playerX: number;
  playerZ: number;
  onSelectLevel: (levelId: string) => void;
  onUnlockLevel: (levelId: string) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevelId,
  unlockedLevelIds,
  completedLevelIds,
  loveLetters,
  playerX,
  playerZ,
  onSelectLevel,
  onUnlockLevel,
  onClose,
}) => {
  const [inspectedId, setInspectedId] = useState<string>(currentLevelId || LEVEL_MAPS[0].id);

  const selectedLevel: LevelMapConfig =
    LEVEL_MAPS.find((l) => l.id === inspectedId) || LEVEL_MAPS[0];

  const isUnlocked = unlockedLevelIds.includes(selectedLevel.id);
  const isCompleted = completedLevelIds.includes(selectedLevel.id);
  const isActive = currentLevelId === selectedLevel.id;
  const canAfford = loveLetters >= selectedLevel.unlockCostLetters;

  const toMapPct = (coord: number) => {
    const half = WORLD_SIZE / 2;
    return Math.max(4, Math.min(96, ((coord + half) / WORLD_SIZE) * 100));
  };

  const toSizePct = (size: number) => (size / WORLD_SIZE) * 100;

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/85 z-50 select-none">
      <div className="w-full max-w-5xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-800/60 text-cyan-400">
              <MapIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Winter Regions &amp; Topographic Maps
              </h2>
              <p className="text-xs text-slate-400">
                Each region features its own terrain paving, landmarks, buried gifts, and village dispatches.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-amber-300">
              <Mail className="w-3.5 h-3.5 text-rose-400" />
              <span className="tabular-nums font-mono">{loveLetters}</span>
              <span className="text-slate-400 font-normal">Letters</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Split Layout */}
        <div className="flex-1 overflow-y-auto py-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Level List */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {LEVEL_MAPS.map((level) => {
              const unlocked = unlockedLevelIds.includes(level.id);
              const completed = completedLevelIds.includes(level.id);
              const active = currentLevelId === level.id;
              const inspected = inspectedId === level.id;

              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setInspectedId(level.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                    inspected
                      ? 'bg-slate-800 border-cyan-400 shadow-lg'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-700"
                          style={{ color: level.theme.accentColor }}
                        >
                          LEVEL {level.number}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          {level.difficulty}
                        </span>
                        {active && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-white mt-1">{level.name}</h3>
                      <p className="text-[11px] text-slate-400">{level.subtitle}</p>
                    </div>

                    <div className="shrink-0 mt-0.5">
                      {completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : unlocked ? (
                        <Unlock className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-amber-300">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>{level.unlockCostLetters}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Topographic Map & Region Intel */}
          <div className="lg:col-span-7 flex flex-col gap-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Topographic Map SVG */}
              <div className="w-full sm:w-64 shrink-0 flex flex-col gap-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Topographic Survey</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400 uppercase">
                    {selectedLevel.theme.groundPattern}
                  </span>
                </div>

                <div className="relative w-full aspect-square rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Subtle coordinate grid */}
                    <g stroke="#1e293b" strokeWidth="0.4">
                      <line x1="25" y1="0" x2="25" y2="100" />
                      <line x1="50" y1="0" x2="50" y2="100" />
                      <line x1="75" y1="0" x2="75" y2="100" />
                      <line x1="0" y1="25" x2="100" y2="25" />
                      <line x1="0" y1="50" x2="100" y2="50" />
                      <line x1="0" y1="75" x2="100" y2="75" />
                    </g>

                    {/* Terrain Feature Zones */}
                    {selectedLevel.mapFeatures.map((zone) => {
                      const cx = toMapPct(zone.x);
                      const cz = toMapPct(zone.z);
                      const w = toSizePct(zone.width);
                      const h = toSizePct(zone.depth);
                      return (
                        <g key={zone.id}>
                          <rect
                            x={cx - w / 2}
                            y={cz - h / 2}
                            width={w}
                            height={h}
                            rx={zone.type === 'plaza' ? 3 : 1.5}
                            fill={zone.color}
                            fillOpacity={zone.type === 'water' ? 0.28 : 0.16}
                            stroke={zone.color}
                            strokeOpacity={0.55}
                            strokeWidth="0.6"
                          />
                          <text
                            x={cx}
                            y={cz + 1}
                            textAnchor="middle"
                            fill="#cbd5e1"
                            fontSize="3.2"
                            opacity="0.85"
                          >
                            {zone.label}
                          </text>
                        </g>
                      );
                    })}

                    {/* Spawn Origin */}
                    <circle cx="50" cy="50" r="2.2" fill="none" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="1,1" />

                    {/* Gifts */}
                    {selectedLevel.gifts.map((g) => (
                      <circle
                        key={g.id}
                        cx={toMapPct(g.x)}
                        cy={toMapPct(g.z)}
                        r="1.7"
                        fill="#fbbf24"
                        opacity="0.85"
                      />
                    ))}

                    {/* Landmarks */}
                    {selectedLevel.landmarks.map((lm, idx) => {
                      const lx = toMapPct(lm.x);
                      const lz = toMapPct(lm.z);
                      return (
                        <g key={lm.id} transform={`translate(${lx}, ${lz})`}>
                          <circle r="3.6" fill={selectedLevel.theme.accentColor} fillOpacity="0.3" />
                          <circle r="2.2" fill={selectedLevel.theme.accentColor} stroke="#ffffff" strokeWidth="0.5" />
                          <text
                            x="0"
                            y="-4.2"
                            textAnchor="middle"
                            fill="#f8fafc"
                            fontSize="3.1"
                            fontWeight="bold"
                          >
                            {idx + 1}
                          </text>
                        </g>
                      );
                    })}

                    {/* Live tractor pin if viewing active level */}
                    {isActive && (
                      <circle
                        cx={toMapPct(playerX)}
                        cy={toMapPct(playerZ)}
                        r="2.6"
                        fill="#ffffff"
                        stroke="#f43f5e"
                        strokeWidth="1"
                      />
                    )}
                  </svg>
                </div>

                {/* Map Legend */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <span className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: selectedLevel.theme.accentColor }}
                    />
                    Landmarks
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    Gifts ({selectedLevel.gifts.length})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-sky-400/60 inline-block" />
                    Terrain
                  </span>
                </div>
              </div>

              {/* Region Description & Stats */}
              <div className="flex-1 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-mono font-bold uppercase tracking-wider"
                      style={{ color: selectedLevel.theme.accentColor }}
                    >
                      Level {selectedLevel.number} · {selectedLevel.difficulty}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-semibold">
                        Cleared
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mt-0.5">{selectedLevel.name}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1.5">
                    {selectedLevel.description}
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block">Snow Pack</span>
                      <span className="text-xs font-bold font-mono text-cyan-300">
                        {selectedLevel.snowResistance.toFixed(2)}x
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block">Landmarks</span>
                      <span className="text-xs font-bold font-mono text-rose-300">
                        {selectedLevel.landmarks.length}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block">Dispatches</span>
                      <span className="text-xs font-bold font-mono text-amber-300">
                        {selectedLevel.quests.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Landmarks Directory */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Key Map Landmarks
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {selectedLevel.landmarks.map((lm, idx) => (
                      <div
                        key={lm.id}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] flex items-center gap-1.5"
                      >
                        <span
                          className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: selectedLevel.theme.accentColor }}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-slate-200 truncate">{lm.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                {isUnlocked ? (
                  <>
                    <Snowflake className="w-4 h-4 text-cyan-400" />
                    <span>
                      {isActive
                        ? 'Currently plowing this region.'
                        : 'Region unlocked and ready for your Heartplow.'}
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>
                      Clear Level {selectedLevel.number - 1} or unlock early with{' '}
                      <strong className="text-amber-300">{selectedLevel.unlockCostLetters} Love Letters</strong>.
                    </span>
                  </>
                )}
              </div>

              {isUnlocked ? (
                <button
                  type="button"
                  onClick={() => {
                    if (isActive) {
                      onClose();
                    } else {
                      onSelectLevel(selectedLevel.id);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-rose-600 hover:from-cyan-500 hover:to-rose-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0"
                >
                  {isActive ? <Sparkles className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{isActive ? 'Continue Here' : `Deploy to ${selectedLevel.name}`}</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canAfford}
                  onClick={() => onUnlockLevel(selectedLevel.id)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all shrink-0 ${
                    canAfford
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Unlock Region ({selectedLevel.unlockCostLetters} Letters)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Unlocked Regions: {unlockedLevelIds.length}/{LEVEL_MAPS.length}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Close Maps (Esc / M)
          </button>
        </div>
      </div>
    </div>
  );
};
