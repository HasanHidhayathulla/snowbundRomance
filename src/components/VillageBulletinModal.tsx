/**
 * Valentine Valley Solstice Gazette & Community Bulletin Board Modal
 * Traditional procedural application feature providing daily village news,
 * weather forecasts, town lore columns, romance horoscopes, and daily stipend check-ins.
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  CloudSnow,
  Coffee,
  Flame,
  Gift,
  Heart,
  Mail,
  Newspaper,
  Sparkles,
  Sun,
  Wind,
  X,
  Zap,
} from 'lucide-react';
import {
  GAZETTE_EDITION_ARTICLES,
  WEATHER_CONFIGS,
  type GazetteArticle,
  type WeatherCondition,
} from '../game/constants';
import {
  canClaimDailyStipend,
  claimDailyStipend,
} from '../game/storage';
import { synthAudio } from '../audio/synthAudio';

interface VillageBulletinModalProps {
  currentWeather: WeatherCondition;
  snowClearedPercent: number;
  loveLetters: number;
  landmarksCleared: number;
  totalLandmarks: number;
  onSelectWeather?: (weather: WeatherCondition) => void;
  onClaimStipend?: (lettersGained: number) => void;
  onClose: () => void;
}

export const VillageBulletinModal: React.FC<VillageBulletinModalProps> = ({
  currentWeather,
  snowClearedPercent,
  loveLetters,
  landmarksCleared,
  totalLandmarks,
  onSelectWeather,
  onClaimStipend,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'gazette' | 'weather' | 'community' | 'horoscope'>('gazette');
  const [stipendStatus, setStipendStatus] = useState(() => canClaimDailyStipend());
  const [claimFeedback, setClaimFeedback] = useState<string | null>(null);

  const currentWeatherConfig = WEATHER_CONFIGS[currentWeather] || WEATHER_CONFIGS.gentle_flurry;

  const handleClaim = () => {
    const res = claimDailyStipend();
    if (res.success) {
      synthAudio.playDailyStipendClaim();
      setClaimFeedback(`Claimed +${res.lettersGained} Love Letters! Streak: Day ${res.streak}`);
      setStipendStatus(canClaimDailyStipend());
      if (onClaimStipend) {
        onClaimStipend(res.lettersGained);
      }
      setTimeout(() => setClaimFeedback(null), 4000);
    }
  };

  const HOROSCOPES = [
    { sign: 'Winter Solstice Capricorn', reading: 'Your sturdy snow blade will strike a resonant chord on Lover’s Bridge today. Love awaits those who plow with patience.' },
    { sign: 'Aurora Borealis Aquarius', reading: 'The northern emerald skies favor romantic reunions near the Grand Solstice Tree. Expect an unexpected gift uncovered in the powder.' },
    { sign: 'Alpine Starlight Pisces', reading: 'Sweet cinnamon scents carry on the breeze from Julien’s ovens. A heartfelt gesture is all it takes to warm a chilly heart.' },
    { sign: 'Snowdrift Aries', reading: 'Use your steam boost boldly—passion and velocity align to shatter previous combo milestones before the stroke of midnight!' },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/80 z-40 select-none">
      <div className="w-full max-w-4xl bg-slate-900 border border-amber-600/50 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col max-h-[92vh]">
        {/* Newspaper Masthead */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-amber-500/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-700/60 text-amber-300">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white font-serif uppercase">
                  Valentine Valley Gazette & Solstice Dispatch
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/90 text-amber-300 border border-amber-700/60 font-semibold font-mono">
                  VOL. XLVIII · NO. 14
                </span>
              </div>
              <p className="text-xs text-amber-200/80 italic font-serif">
                “The Independent Solstice Journal of Valentine Valley · Weather, Romance & Village Notices”
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Daily Letter Stipend Claim Banner */}
            <button
              onClick={handleClaim}
              disabled={!stipendStatus.canClaim}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                stipendStatus.canClaim
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white animate-pulse'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 opacity-80 cursor-default'
              }`}
            >
              <Coffee className="w-4 h-4 text-amber-300" />
              <span>
                {stipendStatus.canClaim
                  ? `Claim Solstice Stipend (+${stipendStatus.rewardLetters} Letters)`
                  : `Stipend Claimed (Day ${stipendStatus.nextStreak})`}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {claimFeedback && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-amber-950/90 border border-amber-500 text-xs text-amber-200 flex items-center justify-between animate-fade-in">
            <span className="flex items-center gap-2 font-semibold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {claimFeedback}
            </span>
            <span className="font-mono text-[11px] text-amber-300">Balance: {loveLetters} Letters</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 py-3 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('gazette')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'gazette'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Front Page & Stories</span>
          </button>

          <button
            onClick={() => setActiveTab('weather')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'weather'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudSnow className="w-3.5 h-3.5" />
            <span>Blizzard Forecast</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'community'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Village Clearance Effort</span>
          </button>

          <button
            onClick={() => setActiveTab('horoscope')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'horoscope'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Solstice Romance Horoscope</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* TAB 1: Front Page & News */}
          {activeTab === 'gazette' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GAZETTE_EDITION_ARTICLES.map((art) => (
                <div
                  key={art.id}
                  className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/70 hover:border-amber-600/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/40">
                        {art.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{art.timestamp}</span>
                    </div>

                    <h4 className="font-bold text-base text-white font-serif mb-1 leading-snug">
                      {art.headline}
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans mt-2">
                      {art.content}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-amber-200/70 italic">
                    <span>By {art.author}</span>
                    <span className="text-slate-400 font-normal">Valentine Valley Press</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Weather Forecast & Selector */}
          {activeTab === 'weather' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/80 to-slate-900 border border-sky-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-sky-900/60 border border-sky-500/60 text-sky-300">
                    <CloudSnow className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 font-mono">
                      Current Solstice Conditions
                    </span>
                    <h3 className="text-lg font-bold text-white">{currentWeatherConfig.name}</h3>
                    <p className="text-xs text-sky-200/90 mt-0.5">{currentWeatherConfig.tagline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-right">
                    <div className="text-slate-400 text-[10px]">Combo Bonus</div>
                    <div className="text-amber-300 font-bold text-sm">x{currentWeatherConfig.comboBonusMultiplier}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400 text-[10px]">Traction</div>
                    <div className="text-cyan-300 font-bold text-sm">
                      {Math.round(currentWeatherConfig.tractionMultiplier * 100)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {Object.values(WEATHER_CONFIGS).map((w) => {
                  const isCurrent = currentWeather === w.id;
                  return (
                    <div
                      key={w.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'border-amber-500 bg-amber-950/30 shadow-md ring-1 ring-amber-500/50'
                          : 'border-slate-700/80 bg-slate-800/70 hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="font-bold text-sm text-white">{w.name}</h4>
                          {isCurrent && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 leading-snug">{w.tagline}</p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-700/60 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                          <span>Snowfall: {w.snowFallSpeed}x</span>
                          <span>·</span>
                          <span className="text-amber-300">Reward: x{w.comboBonusMultiplier}</span>
                        </div>

                        {onSelectWeather && !isCurrent && (
                          <button
                            onClick={() => onSelectWeather(w.id)}
                            className="px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold cursor-pointer"
                          >
                            Set Forecast
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Community Clearance Progress */}
          {activeTab === 'community' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Valley-Wide Snow Plowing Progress
                  </span>
                  <span className="font-mono text-sm font-bold text-cyan-300">{snowClearedPercent}% Cleared</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-rose-500 to-amber-400 transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, snowClearedPercent)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Reunited Lovers: <span className="text-rose-300 font-bold">{landmarksCleared} / {totalLandmarks}</span> couples reconnected across Valentine Valley lanes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase">
                    <Heart className="w-4 h-4" />
                    <span>Goal 1: 50% Clean Roads</span>
                  </div>
                  <p className="text-xs text-slate-300">Enables clear horse-drawn sleigh transit between the Chalets and Bakery.</p>
                  <span className={`text-[11px] font-mono font-bold mt-1 ${snowClearedPercent >= 50 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {snowClearedPercent >= 50 ? '✓ COMPLETED' : 'IN PROGRESS'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
                    <Sparkles className="w-4 h-4" />
                    <span>Goal 2: 75% Town Square</span>
                  </div>
                  <p className="text-xs text-slate-300">Allows choir rehearsal around the Grand Solstice Evergreen Tree.</p>
                  <span className={`text-[11px] font-mono font-bold mt-1 ${snowClearedPercent >= 75 ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {snowClearedPercent >= 75 ? '✓ COMPLETED' : 'IN PROGRESS'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase">
                    <Award className="w-4 h-4" />
                    <span>Goal 3: All Lovers Reunited</span>
                  </div>
                  <p className="text-xs text-slate-300">Clear all four landmarks to unlock the Solstice Grand Victory celebration.</p>
                  <span className={`text-[11px] font-mono font-bold mt-1 ${landmarksCleared >= totalLandmarks ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {landmarksCleared >= totalLandmarks ? '✓ COMPLETED' : `${landmarksCleared}/${totalLandmarks} COUPLES`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Solstice Romance Horoscope */}
          {activeTab === 'horoscope' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {HOROSCOPES.map((h, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 mb-2 text-rose-400">
                    <Heart className="w-4 h-4 fill-rose-500" />
                    <h4 className="font-bold text-sm text-white font-serif">{h.sign}</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    “{h.reading}”
                  </p>
                  <div className="pt-2 mt-2 border-t border-slate-700/60 text-[10px] text-slate-400 font-mono">
                    Constellation Solstice Aspect: Fortunate
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono text-[10px]">B</kbd> while driving to toggle this bulletin</span>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
          >
            Close Gazette (Esc / B)
          </button>
        </div>
      </div>
    </div>
  );
};
