/**
 * Solstice Weather Observatory & Barometer Modal
 * Shows atmospheric weather forecast, pressure & wind statistics,
 * descriptions of upcoming conditions, and allows manually tuning the weather.
 */

import React from 'react';
import {
  CloudSnow,
  Compass,
  Eye,
  Gauge,
  Sparkles,
  Sun,
  Thermometer,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import {
  WEATHER_CONDITIONS,
  type ActiveWeatherState,
  type WeatherCondition,
  type WeatherType,
} from '../game/constants';

interface WeatherModalProps {
  weather: ActiveWeatherState;
  onForceWeather: (weatherType: WeatherType) => void;
  onAdvanceWeather: () => void;
  onClose: () => void;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({
  weather,
  onForceWeather,
  onAdvanceWeather,
  onClose,
}) => {
  const getWeatherIcon = (name: string, className: string = 'w-5 h-5') => {
    switch (name) {
      case 'Wind':
        return <Wind className={`${className} text-sky-400`} />;
      case 'Sun':
        return <Sun className={`${className} text-amber-400`} />;
      case 'Sparkles':
        return <Sparkles className={`${className} text-emerald-400`} />;
      default:
        return <CloudSnow className={`${className} text-cyan-400`} />;
    }
  };

  const progressPercent = Math.min(
    100,
    Math.max(0, ((weather.totalDurationSec - weather.remainingSec) / weather.totalDurationSec) * 100)
  );

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/80 z-40 select-none">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col gap-5 max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-sky-400">
              <CloudSnow className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Valentine Solstice Observatory & Barometer</h3>
              <p className="text-xs text-slate-400">Atmospheric pressure, alpine forecasts & wind monitoring</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Weather Hero Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-700/80 shadow-lg flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-xl border shadow-inner"
                style={{ backgroundColor: `${weather.current.colorHex}15`, borderColor: `${weather.current.colorHex}55` }}
              >
                {getWeatherIcon(weather.current.iconName, 'w-8 h-8')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-black text-white">{weather.current.name}</h4>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-mono font-bold"
                    style={{ backgroundColor: `${weather.current.colorHex}22`, color: weather.current.colorHex }}
                  >
                    ACTIVE FRONT
                  </span>
                </div>
                <p className="text-xs text-slate-300 italic mt-0.5">{weather.current.tagline}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onAdvanceWeather}
                className="px-3 py-1.5 rounded-xl bg-sky-950 hover:bg-sky-900 border border-sky-700/60 text-sky-200 text-xs font-semibold cursor-pointer transition-colors"
                title="Trigger next weather condition immediately"
              >
                Advance Weather
              </button>
            </div>
          </div>

          {/* Meteorological Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2.5">
              <Thermometer className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Temperature</span>
                <span className="text-sm font-bold font-mono text-white">
                  {weather.temperatureC > 0 ? `+${weather.temperatureC}` : weather.temperatureC}°C
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2.5">
              <Wind className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Wind Gusts</span>
                <span className="text-sm font-bold font-mono text-white">
                  {weather.windSpeedKmh} km/h
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2.5">
              <Eye className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Visibility</span>
                <span className="text-sm font-bold font-mono text-white">
                  {weather.current.visibilityPercent}%
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Letters Multiplier</span>
                <span className="text-sm font-bold font-mono text-rose-300">
                  x{weather.current.letterMultiplier.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Front Duration Progress */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Next Forecast: {weather.next.name}</span>
              <span className="text-amber-300 font-bold">{Math.ceil(weather.remainingSec)}s remaining</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: weather.current.colorHex,
                }}
              />
            </div>
          </div>
        </div>

        {/* Alpine Forecast Timeline & Condition Tuning */}
        <div className="flex flex-col gap-3 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Solstice Weather Almanac & Custom Tuning
            </h4>
            <span className="text-[11px] text-slate-400">Select any condition to simulate</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(WEATHER_CONDITIONS).map((cond) => {
              const isActive = weather.current.id === cond.id;
              return (
                <div
                  key={cond.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                    isActive
                      ? 'border-sky-500 bg-sky-950/40 shadow-md ring-1 ring-sky-500/50'
                      : 'border-slate-800 bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {getWeatherIcon(cond.iconName)}
                        <h5 className="font-bold text-sm text-white">{cond.name}</h5>
                      </div>
                      <span className="text-xs font-mono font-bold" style={{ color: cond.colorHex }}>
                        {cond.temperatureC > 0 ? `+${cond.temperatureC}` : cond.temperatureC}°C
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-2">{cond.description}</p>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                      <span>Wind: {cond.windSpeedKmh}km/h</span>
                      <span>·</span>
                      <span className="text-amber-300 font-medium">Letters: x{cond.letterMultiplier.toFixed(1)}</span>
                      {cond.snowRefillRate > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-blue-300">Snow Refill</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Cycle Duration: {cond.durationSec}s
                    </span>

                    {isActive ? (
                      <span className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 text-xs font-bold">
                        Currently Active
                      </span>
                    ) : (
                      <button
                        onClick={() => onForceWeather(cond.id)}
                        className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Simulate Weather
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            Return to Plowing (Esc / B)
          </button>
        </div>
      </div>
    </div>
  );
};
