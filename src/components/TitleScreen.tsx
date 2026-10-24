/**
 * Title Screen for Snowbound Hearts
 * Features bespoke inline SVG title lockup, romantic story brief,
 * Start CTA, and flat control-hint line.
 */

import React from 'react';
import { Heart, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { synthAudio } from '../audio/synthAudio';

interface TitleScreenProps {
  onStart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, isMuted, onToggleMute }) => {
  return (
    <div className="absolute inset-0 flex flex-col justify-between items-center p-8 pointer-events-auto bg-slate-950/40 select-none">
      {/* Top Bar with cozy badge and mute */}
      <div className="w-full max-w-5xl flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900/80 border border-slate-700/60 text-xs font-medium tracking-wide text-rose-300">
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
          <span>VALENTINE VALLEY · WINTER SOLSTICE</span>
        </div>

        <button
          onClick={() => {
            synthAudio.init();
            onToggleMute();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900/80 border border-slate-700/60 hover:bg-slate-800 text-xs text-slate-300 transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          <span>{isMuted ? 'Sound Off' : 'Synth Audio On'}</span>
        </button>
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title Lockup */}
      <div className="flex flex-col items-center text-center max-w-2xl my-auto">
        {/* Bespoke Romantic SVG Title */}
        <div className="mb-4">
          <svg
            viewBox="0 0 540 100"
            className="w-full max-w-lg h-auto drop-shadow-[0_4px_16px_rgba(244,63,94,0.35)]"
          >
            <defs>
              <linearGradient id="roseGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff1f2" />
                <stop offset="50%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="55"
              textAnchor="middle"
              fill="url(#roseGold)"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="900"
              fontSize="48"
              letterSpacing="2"
            >
              SNOWBOUND HEARTS
            </text>
            <text
              x="50%"
              y="88"
              textAnchor="middle"
              fill="#cbd5e1"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight="600"
              fontSize="16"
              letterSpacing="7"
            >
              WINTER SOLSTICE PLOW
            </text>
          </svg>
        </div>

        <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8 max-w-lg font-light">
          A quiet blizzard has buried Valentine Valley. Jump into the vintage Heartplow tractor,
          clear the snowdrift avenues, uncover lost solstice gifts, and reunite separated lovers before the festival lights fade.
        </p>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-semibold text-lg shadow-lg shadow-rose-950/50 hover:shadow-rose-600/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-amber-200 group-hover:rotate-12 transition-transform" />
          <span>Start Plowing Snow</span>
          <span className="text-xs bg-rose-950/40 border border-white/20 px-2 py-0.5 rounded text-rose-100 font-mono">
            Enter / Space
          </span>
        </button>

        <div className="flex items-center gap-6 mt-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Procedural Synth Soundscape
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Dynamic Snow Deform Grid
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Combo Multipliers
          </span>
        </div>
      </div>

      {/* Flat Control Hint Line */}
      <div className="w-full max-w-3xl flex justify-center items-center py-2 px-4 rounded-lg bg-slate-900/85 border border-slate-800 text-slate-300 text-xs tracking-wider">
        <span className="font-mono text-slate-200 font-semibold">WASD / Arrows</span> Move
        <span className="mx-3 text-slate-600">·</span>
        <span className="font-mono text-slate-200 font-semibold">Space</span> Steam Boost
        <span className="mx-3 text-slate-600">·</span>
        <span className="font-mono text-slate-200 font-semibold">G</span> Solstice Workshop
        <span className="mx-3 text-slate-600">·</span>
        <span className="font-mono text-slate-200 font-semibold">Esc</span> Pause
      </div>
    </div>
  );
};
