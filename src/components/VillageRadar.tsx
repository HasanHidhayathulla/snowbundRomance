/**
 * Real-time Village Radar / Minimap for Snowbound Hearts
 * Provides low-occlusion spatial situational awareness for landmarks,
 * plow position/heading, and buried solstice gifts.
 */

import React, { useState } from 'react';
import { Compass, Gift, Heart, MapPin, Maximize2, Minimize2 } from 'lucide-react';
import { WORLD_SIZE } from '../game/constants';

export interface RadarLandmark {
  id: string;
  name: string;
  x: number;
  z: number;
  cleared: boolean;
}

export interface RadarGift {
  id: string;
  name: string;
  x: number;
  z: number;
  collected: boolean;
  revealed: boolean;
}

interface VillageRadarProps {
  playerX: number;
  playerZ: number;
  heading: number; // yaw in radians
  landmarks: RadarLandmark[];
  gifts: RadarGift[];
  snowClearedPercent: number;
}

export const VillageRadar: React.FC<VillageRadarProps> = ({
  playerX,
  playerZ,
  heading,
  landmarks,
  gifts,
  snowClearedPercent,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  // Map world coordinate (-WORLD_SIZE/2 .. WORLD_SIZE/2) to radar SVG % (0 .. 100)
  const mapToPercent = (val: number) => {
    const half = WORLD_SIZE / 2;
    return Math.max(4, Math.min(96, ((val + half) / WORLD_SIZE) * 100));
  };

  const px = mapToPercent(playerX);
  const pz = mapToPercent(playerZ);
  // Heading in degrees: ThreeJS heading 0 is forward (+Z), heading increases counter-clockwise or clockwise
  const headingDeg = (heading * 180) / Math.PI;

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-rose-300 shadow-lg cursor-pointer transition-colors"
        title="Show Village Radar"
      >
        <Compass className="w-3.5 h-3.5 text-rose-400" />
        <span>Radar</span>
        <Maximize2 className="w-3 h-3 text-slate-400" />
      </button>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl p-2.5 w-44 backdrop-blur-none text-slate-200 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[11px] font-semibold">
        <div className="flex items-center gap-1 text-rose-300">
          <Compass className="w-3.5 h-3.5 text-rose-400" />
          <span>Village Radar</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-cyan-300 font-mono">{snowClearedPercent}%</span>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title="Minimize Radar"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Radar Viewport */}
      <div className="relative w-full aspect-square rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Subtle grid lines */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-20">
          <div className="border-r border-b border-cyan-500" />
          <div className="border-r border-b border-cyan-500" />
          <div className="border-r border-b border-cyan-500" />
          <div className="border-b border-cyan-500" />
          <div className="border-r border-b border-cyan-500" />
          <div className="border-r border-b border-cyan-500" />
          <div className="border-r border-b border-cyan-500" />
          <div className="border-b border-cyan-500" />
          <div className="border-r border-b border-cyan-500" />
          <div className="border-r border-b border-cyan-500" />
          <div className="border-r border-b border-cyan-500" />
          <div className="border-b border-cyan-500" />
        </div>

        {/* Concentric distance rings */}
        <div className="absolute w-3/4 h-3/4 rounded-full border border-slate-800/80 pointer-events-none" />
        <div className="absolute w-1/2 h-1/2 rounded-full border border-slate-800/60 pointer-events-none" />

        {/* SVG Marker Layer with explicit viewBox */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          {/* Landmark Pins */}
          {landmarks.map((lm) => {
            const lx = mapToPercent(lm.x);
            const lz = mapToPercent(lm.z);
            return (
              <g key={lm.id} transform={`translate(${lx}, ${lz})`}>
                {lm.cleared ? (
                  // Reunited landmark heart
                  <g>
                    <circle r="4.5" cx="0" cy="0" fill="#f43f5e" opacity="0.4" />
                    <circle r="3" cx="0" cy="0" fill="#e11d48" />
                  </g>
                ) : (
                  // Pending landmark pin
                  <g>
                    <rect x="-3" y="-3" width="6" height="6" rx="1.5" fill="#38bdf8" stroke="#0284c7" strokeWidth="0.8" />
                  </g>
                )}
              </g>
            );
          })}

          {/* Collectible Gifts */}
          {gifts.map((g) => {
            if (g.collected) return null;
            const gx = mapToPercent(g.x);
            const gz = mapToPercent(g.z);
            return (
              <g key={g.id} transform={`translate(${gx}, ${gz})`}>
                {g.revealed ? (
                  <circle r="3" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
                ) : (
                  <circle r="1.8" fill="#94a3b8" opacity="0.7" />
                )}
              </g>
            );
          })}

          {/* Player Tractor Blip with Heading Arrow */}
          <g transform={`translate(${px}, ${pz})`}>
            {/* Soft tractor aura */}
            <circle r="4.5" fill="#f43f5e" opacity="0.4" />
            <g transform={`rotate(${headingDeg})`}>
              {/* Arrow pointing in forward direction */}
              <polygon points="0,-6 3.5,4 -3.5,4" fill="#fb7185" stroke="#ffffff" strokeWidth="0.8" />
            </g>
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[9px] text-slate-400 mt-2 px-1">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-sky-400 inline-block" />
          Landmark
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
          Reunited
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          Gift
        </span>
      </div>
    </div>
  );
};
