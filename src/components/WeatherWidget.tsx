/**
 * Weather Forecast Widget for Low-Occlusion GameHUD
 * Displays live weather conditions, wind speed, temperature,
 * and upcoming weather transition countdown.
 */

import React from 'react';
import { CloudSnow, Compass, Sparkles, Sun, Wind, ChevronRight } from 'lucide-react';
import type { ActiveWeatherState } from '../game/constants';

interface WeatherWidgetProps {
  weather: ActiveWeatherState;
  onOpenWeatherModal: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  onOpenWeatherModal,
}) => {
  const getWeatherIcon = (name: string) => {
    switch (name) {
      case 'Wind':
        return <Wind className="w-4 h-4 text-sky-300 animate-pulse" />;
      case 'Sun':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />;
      default:
        return <CloudSnow className="w-4 h-4 text-cyan-300" />;
    }
  };

  const isBlizzard = weather.current.id === 'blizzard';
  const isAurora = weather.current.id === 'aurora_shower';

  return (
    <button
      onClick={onOpenWeatherModal}
      className={`px-3 py-2 rounded-xl text-left border shadow-md transition-all cursor-pointer pointer-events-auto flex items-center gap-3 ${
        isBlizzard
          ? 'bg-blue-950/90 border-blue-400/80 ring-1 ring-blue-400/40 text-blue-100 hover:border-blue-300'
          : isAurora
          ? 'bg-emerald-950/90 border-emerald-400/80 ring-1 ring-emerald-400/40 text-emerald-100 hover:border-emerald-300'
          : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:border-slate-700'
      }`}
      title="Open Solstice Weather Observatory & Barometer (B)"
    >
      <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
        {getWeatherIcon(weather.current.iconName)}
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-white truncate max-w-[120px] sm:max-w-none">
            {weather.current.name}
          </span>
          <span
            className="text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold"
            style={{ backgroundColor: `${weather.current.colorHex}22`, color: weather.current.colorHex }}
          >
            {weather.temperatureC > 0 ? `+${weather.temperatureC}` : weather.temperatureC}°C
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
          <span>{weather.windSpeedKmh} km/h wind</span>
          <span>·</span>
          <span className="text-amber-300 font-medium">
            Next: {weather.next.name.split(' ')[0]} ({Math.ceil(weather.remainingSec)}s)
          </span>
        </div>
      </div>

      <ChevronRight className="w-3.5 h-3.5 text-slate-500 hidden sm:block ml-1" />
    </button>
  );
};
