/**
 * Daily Romantic Challenge Modal
 * Displays today's 24-hour rotating challenge (landmark pilgrimage or snow pattern carving),
 * live reset countdown, visual valley blueprint, step checklist, and bonus love letter rewards.
 */

import React, { useEffect, useState } from 'react';
import {
  CalendarHeart,
  CheckCircle2,
  Clock,
  Compass,
  Heart,
  Mail,
  MapPin,
  Sparkles,
  X,
} from 'lucide-react';
import { WORLD_SIZE, getDailyChallengeForDate } from '../game/constants';
import type { DailyChallengeStatus } from '../game/engine';

interface DailyChallengeModalProps {
  dailyChallenge: DailyChallengeStatus;
  playerX: number;
  playerZ: number;
  onClose: () => void;
}

function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  dailyChallenge,
  playerX,
  playerZ,
  onClose,
}) => {
  const [msLeft, setMsLeft] = useState<number>(() => getDailyChallengeForDate().msUntilReset);

  useEffect(() => {
    const id = window.setInterval(() => {
      setMsLeft(getDailyChallengeForDate().msUntilReset);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const { challenge, steps, completedCount, totalCount, completed, dayKey } = dailyChallenge;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const mapToSvg = (val: number) => {
    const half = WORLD_SIZE / 2;
    return Math.max(8, Math.min(92, ((val + half) / WORLD_SIZE) * 100));
  };

  const px = mapToSvg(playerX);
  const pz = mapToSvg(playerZ);

  const pathPoints = steps.map((s) => `${mapToSvg(s.x)},${mapToSvg(s.z)}`);
  if (challenge.category === 'snow_pattern' && challenge.patternName !== 'Infinity Waltz' && pathPoints.length > 1) {
    pathPoints.push(pathPoints[0]);
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/80 z-40 select-none">
      <div className="w-full max-w-3xl bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-700/60 text-rose-400">
              <CalendarHeart className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold tracking-tight text-white">Daily Romantic Challenge</h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-800/60 font-semibold uppercase tracking-wider">
                  {challenge.category === 'snow_pattern' ? 'Snow Pattern' : 'Landmark Visit'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Rotates every 24 hours · Active Date: <span className="font-mono text-slate-300">{dayKey}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 font-mono tabular-nums">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Resets in {formatCountdown(msLeft)}</span>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col md:flex-row gap-5">
          {/* Left: Pattern / Landmark Blueprint Map */}
          <div className="w-full md:w-64 shrink-0 flex flex-col gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-rose-300">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-rose-400" />
                  <span>{challenge.patternName ? `${challenge.patternName} Blueprint` : 'Valley Route'}</span>
                </span>
                <span className="font-mono tabular-nums text-slate-400">{completedCount}/{totalCount}</span>
              </div>

              <div className="relative w-full aspect-square rounded-lg bg-slate-900 border border-slate-800 overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Faint grid */}
                  <line x1="50" y1="0" x2="50" y2="100" stroke="#1e293b" strokeWidth="0.6" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeWidth="0.6" />

                  {/* Pattern guide loop */}
                  {pathPoints.length >= 2 && (
                    <polyline
                      points={pathPoints.join(' ')}
                      fill="none"
                      stroke="#fb7185"
                      strokeOpacity="0.45"
                      strokeWidth="1.4"
                      strokeDasharray={challenge.category === 'snow_pattern' ? '2.5 2' : '3 3'}
                    />
                  )}

                  {/* Waypoint nodes */}
                  {steps.map((step, i) => {
                    const sx = mapToSvg(step.x);
                    const sz = mapToSvg(step.z);
                    return (
                      <g key={step.id} transform={`translate(${sx}, ${sz})`}>
                        <circle
                          r={step.completed ? 3.2 : 3.6}
                          fill={step.completed ? '#10b981' : '#f43f5e'}
                          stroke="#ffffff"
                          strokeWidth="0.8"
                        />
                        <text
                          x="0"
                          y="1.6"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="4.2"
                          fontWeight="bold"
                        >
                          {step.completed ? '✓' : i + 1}
                        </text>
                      </g>
                    );
                  })}

                  {/* Player marker */}
                  <g transform={`translate(${px}, ${pz})`}>
                    <circle r="3.4" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.9" />
                  </g>
                </svg>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  Pending
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Cleared
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                  You
                </span>
              </div>
            </div>

            {/* Mobile countdown */}
            <div className="sm:hidden flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 font-mono tabular-nums">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Resets in {formatCountdown(msLeft)}</span>
            </div>
          </div>

          {/* Right: Challenge Details, Rewards, & Steps */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/70 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">
                    {challenge.subtitle}
                  </span>
                  <h4 className="text-lg font-extrabold text-white mt-0.5">{challenge.title}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/70 border border-amber-700/50 text-amber-300 text-xs font-mono font-bold">
                    <Mail className="w-3.5 h-3.5 text-rose-400" />
                    <span>+{challenge.rewardLetters} Letters</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-950/70 border border-sky-700/50 text-sky-300 text-xs font-mono font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>+{challenge.rewardPassXp} XP</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{challenge.description}</p>

              {/* Progress Bar */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">Challenge Progress</span>
                  <span className="font-mono tabular-nums text-rose-300">
                    {completedCount}/{totalCount} ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      completed
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-rose-500 to-amber-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {completed && (
              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-600/60 flex items-center gap-3 text-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-white">Today’s Challenge Complete!</div>
                  <div className="text-emerald-300/90 mt-0.5">
                    Bonus +{challenge.rewardLetters} Love Letters and +{challenge.rewardPassXp} Pass XP awarded. A fresh challenge arrives in {formatCountdown(msLeft)}.
                  </div>
                </div>
              </div>
            )}

            {/* Step Checklist */}
            <div className="flex flex-col gap-2">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {challenge.category === 'snow_pattern' ? 'Snow Pattern Waypoints' : 'Required Romantic Landmarks'}
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`px-3 py-2 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                      step.completed
                        ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-200'
                        : 'bg-slate-800/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span className="truncate font-medium">
                        {idx + 1}. {step.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {step.completed ? 'Done' : 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
            <span>Follow the glowing rose-gold rings across the snow to complete each waypoint.</span>
          </p>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            {completed ? 'Back to Valley (C)' : 'Plow Challenge Now (C)'}
          </button>
        </div>
      </div>
    </div>
  );
};
