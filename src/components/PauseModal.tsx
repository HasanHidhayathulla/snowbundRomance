/**
 * Pause Modal for Snowbound Hearts
 */

import React from 'react';
import { BookOpen, Camera, Play, RotateCcw, Settings, Volume2, VolumeX, Wrench } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenWorkshop: () => void;
  onOpenScrapbook: () => void;
  onOpenPhotoMode: () => void;
  onOpenSettings: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isMusicEnabled: boolean;
  onToggleMusic: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenWorkshop,
  onOpenScrapbook,
  onOpenPhotoMode,
  onOpenSettings,
  isMuted,
  onToggleMute,
  isMusicEnabled,
  onToggleMusic,
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/75 z-40 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-5">
        <div className="text-center">
          <h2 className="text-xl font-bold tracking-tight text-rose-400">Plow Engine Paused</h2>
          <p className="text-xs text-slate-400 mt-1">Take a breath beside the warmth of the cabin hearth.</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume Plowing (Esc)</span>
          </button>

          <button
            onClick={onOpenWorkshop}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Solstice Workshop & Upgrades (G)</span>
          </button>

          <button
            onClick={onOpenPhotoMode}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4 text-pink-400" />
            <span>Solstice Postcard Camera (P)</span>
          </button>

          <button
            onClick={onOpenScrapbook}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-rose-400" />
            <span>Solstice Scrapbook & Album (L)</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-purple-400" />
            <span>Sound & Minimap Settings</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>Reset Village Snow</span>
          </button>
        </div>

        {/* Audio Toggles */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800">
          <button
            onClick={onToggleMute}
            className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isMuted ? 'Muted' : 'Sound FX On'}</span>
          </button>

          <button
            onClick={onToggleMusic}
            className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className={`w-2 h-2 rounded-full ${isMusicEnabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <span>{isMusicEnabled ? 'Music On' : 'Music Off'}</span>
          </button>
        </div>

        {/* Controls Quick Reference */}
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed text-center">
          <p><span className="text-slate-200 font-mono font-semibold">WASD / Arrows</span> to steer plow</p>
          <p><span className="text-slate-200 font-mono font-semibold">Space</span> for Steam Heart Turbo</p>
          <p>Maintain continuous plowing to build <span className="text-rose-400 font-semibold">True Love Combos</span></p>
        </div>
      </div>
    </div>
  );
};
