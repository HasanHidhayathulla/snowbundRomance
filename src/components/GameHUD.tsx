/**
 * World-Matched, Low-Occlusion HUD (<15% viewport occlusion)
 * Perimeter status clusters, collapsible bottom dock, virtual mobile controls,
 * and combo multiplier readouts with zero backdrop-filter.
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Camera,
  ChevronDown,
  ChevronUp,
  Compass,
  Gift,
  Heart,
  Landmark,
  Mail,
  Pause,
  Settings,
  Snowflake,
  Volume2,
  VolumeX,
  Wrench,
  Zap,
} from 'lucide-react';
import { COMBO_LEVELS } from '../game/constants';
import type { GameHUDStats } from '../game/engine';
import { VillageRadar } from './VillageRadar';

interface GameHUDProps {
  stats: GameHUDStats;
  onOpenWorkshop: () => void;
  onOpenScrapbook: () => void;
  onOpenPhotoMode: () => void;
  onOpenSettings: () => void;
  onPause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  showRadar: boolean;
  onVirtualInput: (throttle: number, steer: number, boost: boolean) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  onOpenWorkshop,
  onOpenScrapbook,
  onOpenPhotoMode,
  onOpenSettings,
  onPause,
  isMuted,
  onToggleMute,
  showRadar,
  onVirtualInput,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  // Active combo styling
  const comboInfo = COMBO_LEVELS[stats.comboLevel - 1] || COMBO_LEVELS[0];

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-4 overflow-hidden">
      {/* 1. TOP PERIMETER STATUS CLUSTER */}
      <div className="w-full flex items-start justify-between gap-4 pointer-events-auto">
        {/* Top-Left: Snow Clearance & Village Milestones */}
        <div className="flex flex-col gap-2">
          {/* Snow Cleared Progress Card */}
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-100 shadow-md">
            <div className="flex items-center justify-between gap-4 text-xs font-semibold mb-1.5">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Snowflake className="w-4 h-4 text-cyan-400" />
                <span>Snow Cleared</span>
              </span>
              <span className="tabular-nums font-mono text-cyan-200">{stats.snowClearedPercent}%</span>
            </div>
            {/* Clean Progress Bar (no backdrop filter) */}
            <div className="w-44 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(100, stats.snowClearedPercent)}%` }}
              />
            </div>
          </div>

          {/* Landmarks & Gifts Mini Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-rose-300 font-medium">
              <Landmark className="w-3.5 h-3.5 text-rose-400" />
              <span>Couples:</span>
              <span className="tabular-nums font-bold text-white">
                {stats.landmarksCleared}/{stats.totalLandmarks}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-amber-300 font-medium">
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span>Gifts:</span>
              <span className="tabular-nums font-bold text-white">
                {stats.giftsFound}/{stats.totalGifts}
              </span>
            </div>
          </div>
        </div>

        {/* Top-Center: Romantic Combo Multiplier Badge */}
        <div className="flex flex-col items-center">
          <div
            className={`px-4 py-2 rounded-2xl bg-slate-900/95 border transition-all duration-200 shadow-lg ${
              stats.comboLevel > 1 ? 'border-rose-500/70 scale-105' : 'border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Heart
                className={`w-4 h-4 ${
                  stats.comboLevel > 1 ? 'text-rose-500 fill-rose-500' : 'text-slate-500'
                }`}
              />
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: comboInfo.color }}
              >
                {comboInfo.title}
              </span>
              <span className="text-base font-black font-mono tabular-nums text-white">
                x{stats.comboMultiplier.toFixed(1)}
              </span>
            </div>

            {/* Combo grace timer bar */}
            {stats.comboLevel > 1 && (
              <div className="w-full h-1 mt-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: `${stats.comboTimerProgress * 100}%`,
                    backgroundColor: comboInfo.color,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Top-Right: Currency & Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Love Letters */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-amber-300 font-semibold text-xs shadow-md">
            <Mail className="w-4 h-4 text-rose-400" />
            <span className="tabular-nums font-mono text-sm">{stats.loveLetters}</span>
            <span className="text-slate-400 font-normal">Letters</span>
          </div>

          {/* Workshop Shortcut */}
          <button
            onClick={onOpenWorkshop}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900/80 border border-rose-700/60 text-xs font-semibold text-rose-200 shadow-md transition-colors cursor-pointer"
            title="Open Workshop (G)"
          >
            <Wrench className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Workshop</span>
            <span className="font-mono text-[10px] text-rose-400">[G]</span>
          </button>

          {/* Postcard Photo Mode */}
          <button
            onClick={onOpenPhotoMode}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-pink-300 shadow-md transition-colors cursor-pointer"
            title="Postcard Camera Photo Mode (P)"
          >
            <Camera className="w-4 h-4 text-pink-400" />
            <span className="hidden sm:inline">Photo</span>
            <span className="font-mono text-[10px] text-pink-400">[P]</span>
          </button>

          {/* Solstice Scrapbook / Heart Log */}
          <button
            onClick={onOpenScrapbook}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-rose-300 shadow-md transition-colors cursor-pointer"
            title="Open Solstice Scrapbook & Heart Log (L)"
          >
            <BookOpen className="w-4 h-4 text-rose-400" />
            <span className="hidden md:inline">Log</span>
          </button>

          {/* Audio Preferences */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 shadow-md transition-colors cursor-pointer"
            title="Settings & Audio Preferences"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>

          {/* Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 shadow-md transition-colors cursor-pointer"
            title="Toggle Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 shadow-md transition-colors cursor-pointer"
            title="Pause (Esc)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC EVENT MESSAGE TOAST (Centered, transient) */}
      {stats.lastEventMessage && (
        <div className="self-center my-auto px-5 py-2.5 rounded-xl bg-slate-900/95 border border-rose-500/50 shadow-xl text-center text-xs md:text-sm text-slate-100 max-w-md animate-fade-in pointer-events-none">
          <p className="font-medium text-rose-200 leading-snug">{stats.lastEventMessage}</p>
        </div>
      )}

      {/* 3. MINIMAP / VILLAGE RADAR (Floating Bottom-Right) */}
      {showRadar && (
        <div className="absolute bottom-24 right-4 pointer-events-auto">
          <VillageRadar
            playerX={stats.playerX}
            playerZ={stats.playerZ}
            heading={stats.heading}
            landmarks={stats.landmarks.map((l) => ({
              id: l.id,
              name: l.name,
              x: l.x,
              z: l.z,
              cleared: l.cleared,
            }))}
            gifts={stats.gifts.map((g) => ({
              id: g.id,
              name: g.name,
              x: g.x,
              z: g.z,
              collected: g.collected,
              revealed: !!g.revealed,
            }))}
            snowClearedPercent={stats.snowClearedPercent}
          />
        </div>
      )}

      {/* 3. COLLAPSIBLE BOTTOM CONTROL DOCK (Unified, Zero Left/Right Occlusion) */}
      <div className="w-full flex flex-col items-center pointer-events-auto mt-auto">
        {/* Collapse / Expand Toggle Button */}
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="mb-1.5 px-3 py-1 rounded-t-lg bg-slate-900/90 border-t border-x border-slate-800 text-[11px] font-medium text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
        >
          {isDockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Show HUD</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Hide HUD</span>
            </>
          )}
        </button>

        {/* The Dock Container */}
        {!isDockCollapsed && (
          <div className="w-full max-w-3xl px-5 py-3 rounded-2xl bg-slate-900/95 border border-slate-800 text-slate-200 shadow-2xl flex flex-wrap items-center justify-between gap-4">
            {/* Speed & Boost gauges */}
            <div className="flex items-center gap-6">
              {/* Speedometer */}
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Plow Speed
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black font-mono tabular-nums text-white">
                    {stats.speedKmh}
                  </span>
                  <span className="text-[11px] text-slate-400">km/h</span>
                </div>
              </div>

              {/* Steam Boost Gauge */}
              <div className="flex flex-col min-w-32">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                  <span className="flex items-center gap-1 text-rose-300">
                    <Zap className="w-3 h-3 text-rose-400" />
                    Steam Turbo
                  </span>
                  <span className="tabular-nums font-mono text-white">{stats.boostPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-600 to-amber-500 rounded-full transition-all duration-150"
                    style={{ width: `${stats.boostPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Virtual On-Screen Controls (for Touch and Mouse players) */}
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-3 gap-1">
                <div />
                <button
                  onPointerDown={() => onVirtualInput(1, 0, false)}
                  onPointerUp={() => onVirtualInput(0, 0, false)}
                  onPointerLeave={() => onVirtualInput(0, 0, false)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-rose-700 border border-slate-700 text-xs font-bold flex items-center justify-center cursor-pointer select-none"
                >
                  W
                </button>
                <div />
                <button
                  onPointerDown={() => onVirtualInput(0, 1, false)}
                  onPointerUp={() => onVirtualInput(0, 0, false)}
                  onPointerLeave={() => onVirtualInput(0, 0, false)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-rose-700 border border-slate-700 text-xs font-bold flex items-center justify-center cursor-pointer select-none"
                >
                  A
                </button>
                <button
                  onPointerDown={() => onVirtualInput(-0.8, 0, false)}
                  onPointerUp={() => onVirtualInput(0, 0, false)}
                  onPointerLeave={() => onVirtualInput(0, 0, false)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-rose-700 border border-slate-700 text-xs font-bold flex items-center justify-center cursor-pointer select-none"
                >
                  S
                </button>
                <button
                  onPointerDown={() => onVirtualInput(0, -1, false)}
                  onPointerUp={() => onVirtualInput(0, 0, false)}
                  onPointerLeave={() => onVirtualInput(0, 0, false)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-rose-700 border border-slate-700 text-xs font-bold flex items-center justify-center cursor-pointer select-none"
                >
                  D
                </button>
              </div>

              {/* Virtual Boost Button */}
              <button
                onPointerDown={() => onVirtualInput(1, 0, true)}
                onPointerUp={() => onVirtualInput(0, 0, false)}
                onPointerLeave={() => onVirtualInput(0, 0, false)}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 active:scale-95 text-white text-xs font-bold shadow-md cursor-pointer select-none flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>BOOST</span>
              </button>
            </div>

            {/* Flat Keyboard Hint */}
            <div className="hidden lg:flex items-center text-[11px] text-slate-400 gap-2 border-l border-slate-800 pl-4">
              <span>WASD steer</span>
              <span>·</span>
              <span>Space Boost</span>
              <span>·</span>
              <span>P Photo</span>
              <span>·</span>
              <span>G Garage</span>
              <span>·</span>
              <span>L Album</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
