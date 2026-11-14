/**
 * Solstice Weather Forecast & Festival Observatory Modal
 * Provides real-time atmospheric readings, weather forecasts,
 * interactive solstice ceremonies (lantern vigils, aurora chimes, blizzard dares),
 * and weather perks tracking.
 */

import React from 'react';
import {
  CloudSnow,
  Compass,
  Flame,
  Mail,
  Sparkles,
  Sun,
  Thermometer,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import {
  SOLSTICE_CEREMONIES,
  WEATHER_CONDITIONS,
  type WeatherCondition,
  type WeatherType,
} from '../game/constants';

interface WeatherFestivalModalProps {
  currentWeather: WeatherType;
  nextWeather: WeatherType;
  timeUntilForecastSec: number;
  loveLetters: number;
  activeCeremonyId: string | null;
  activeCeremonyRemainingSec: number;
  onTriggerCeremony: (ceremonyId: string) => void;
  onClose: () => void;
}

export const WeatherFestivalModal: React.FC<WeatherFestivalModalProps> = ({
  currentWeather,
  nextWeather,
  timeUntilForecastSec,
  loveLetters,
  activeCeremonyId,
  activeCeremonyRemainingSec,
  onTriggerCeremony,
  onClose,
}) => {
  const current = WEATHER_CONDITIONS[currentWeather] || WEATHER_CONDITIONS.calm_snow;
  const upcoming = WEATHER_CONDITIONS[nextWeather] || WEATHER_CONDITIONS.golden_dawn;

  const getWeatherIcon = (type: WeatherType, className = 'w-5 h-5') => {
    switch (type) {
      case 'golden_dawn':
        return <Sun className={`${className} text-amber-400`} />;
      case 'blizzard':
        return <Wind className={`${className} text-indigo-400 animate-pulse`} />;
      case 'aurora_solstice':
        return <Sparkles className={`${className} text-emerald-400 animate-spin`} />;
      case 'calm_snow':
      default:
        return <CloudSnow className={`${className} text-sky-400`} />;
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/80 z-40 select-none">
      <div className="w-full max-w-4xl bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-950/70 border border-indigo-800/60 text-indigo-400">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight text-white">
                  Solstice Weather Observatory
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-semibold uppercase tracking-wider">
                  Meteorological Forecast
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Track atmospheric shifts across Valentine Valley and invoke seasonal Solstice ceremonies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 font-semibold text-xs shadow-md">
              <Mail className="w-4 h-4 text-rose-400" />
              <span className="font-mono tabular-nums">{loveLetters}</span>
              <span className="text-slate-400 font-normal">Letters</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Ceremony Alert Banner */}
        {activeCeremonyId && (
          <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-amber-950/60 via-indigo-950/60 to-emerald-950/60 border border-amber-500/60 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Active Solstice Ceremony
                </span>
                <h4 className="text-sm font-semibold text-white">
                  {SOLSTICE_CEREMONIES.find((c) => c.id === activeCeremonyId)?.name}
                </h4>
              </div>
            </div>
            <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-amber-300">
              Ceremony Buff: {Math.ceil(activeCeremonyRemainingSec)}s
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col md:flex-row gap-6">
          {/* Left Column: Live Meteorological Telemetry */}
          <div className="w-full md:w-80 flex flex-col gap-4">
            {/* Live Weather Card */}
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  {getWeatherIcon(currentWeather, 'w-4 h-4')}
                  <span>Current Weather</span>
                </span>
                <span className="text-[11px] font-mono text-cyan-400 animate-pulse">● LIVE SENSORS</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-lg text-white" style={{ color: current.themeColor }}>
                    {current.name}
                  </h4>
                  <span className="font-mono text-sm font-bold text-slate-200">
                    {current.temperatureC}°C
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-medium">{current.subtitle}</div>
                <p className="text-[11px] text-slate-300 leading-snug mt-1">{current.description}</p>
              </div>

              {/* Sensor Readouts */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Wind className="w-3 h-3 text-cyan-400" /> Wind Velocity
                  </span>
                  <span className="font-mono font-bold text-white mt-0.5">{current.windSpeedKmh} km/h</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <CloudSnow className="w-3 h-3 text-blue-400" /> Precipitation
                  </span>
                  <span className="font-mono font-bold text-white mt-0.5">{current.snowRateMmH} mm/h</span>
                </div>
              </div>

              {/* Active Perk Pill */}
              <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-700/60 flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                  Active Weather Modifier
                </span>
                <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                  {current.perkDescription}
                </p>
              </div>
            </div>

            {/* Upcoming Forecast Card */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Upcoming Shift
                </span>
                <span className="font-mono text-xs font-semibold text-amber-300">
                  in {Math.ceil(timeUntilForecastSec)}s
                </span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800">
                {getWeatherIcon(nextWeather, 'w-5 h-5')}
                <div>
                  <div className="text-xs font-bold text-white">{upcoming.name}</div>
                  <div className="text-[10px] text-slate-400">{upcoming.subtitle}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Solstice Festival Ceremonies & Weather Invocations */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Solstice Festival Invocations (Perform rituals to shift valley skies)</span>
              </h4>
            </div>

            <div className="flex flex-col gap-3.5 overflow-y-auto">
              {SOLSTICE_CEREMONIES.map((ceremony) => {
                const canAfford = loveLetters >= ceremony.costLetters;
                const isRunning = activeCeremonyId === ceremony.id;

                return (
                  <div
                    key={ceremony.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col gap-3 ${
                      isRunning
                        ? 'border-amber-500 bg-amber-950/30 shadow-lg ring-1 ring-amber-500/50'
                        : 'border-slate-800 bg-slate-800/70 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                          {ceremony.id === 'ceremony_lanterns' ? (
                            <Flame className="w-5 h-5 text-amber-400" />
                          ) : ceremony.id === 'ceremony_aurora_bell' ? (
                            <Sparkles className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Wind className="w-5 h-5 text-indigo-400" />
                          )}
                        </div>
                        <div>
                          <h5 className="font-bold text-sm text-white">{ceremony.name}</h5>
                          <span className="text-[11px] text-indigo-300 font-medium">
                            Shifts weather to: {WEATHER_CONDITIONS[ceremony.weatherTrigger].name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 text-xs font-mono font-bold">
                        <Mail className="w-3.5 h-3.5 text-rose-400" />
                        <span>{ceremony.costLetters} Letters</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{ceremony.description}</p>

                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{ceremony.benefit}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <span className="text-[11px] text-slate-400">Duration: {ceremony.durationSec}s</span>

                      {isRunning ? (
                        <span className="text-amber-300 font-bold text-xs animate-pulse">
                          Active ({Math.ceil(activeCeremonyRemainingSec)}s left)
                        </span>
                      ) : (
                        <button
                          disabled={!canAfford}
                          onClick={() => onTriggerCeremony(ceremony.id)}
                          className={`px-4 py-1.5 rounded-lg font-semibold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white'
                              : 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>Invoke Ceremony</span>
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
            Return to Plowing (Esc / O)
          </button>
        </div>
      </div>
    </div>
  );
};
