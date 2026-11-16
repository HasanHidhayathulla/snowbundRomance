/**
 * Snowbound Hearts: 3D Isometric Snow-Plowing Game
 * Main React Container with isolated WebGL canvas ref lifecycle.
 */

import React, { useEffect, useRef, useState } from 'react';
import { synthAudio } from './audio/synthAudio';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { DispatchRadioModal } from './components/DispatchRadioModal';
import { GameHUD } from './components/GameHUD';
import { PauseModal } from './components/PauseModal';
import { PhotoModeModal } from './components/PhotoModeModal';
import { ScrapbookModal } from './components/ScrapbookModal';
import { SettingsModal } from './components/SettingsModal';
import { ShopModal } from './components/ShopModal';
import { TitleScreen } from './components/TitleScreen';
import { VictoryModal } from './components/VictoryModal';
import { WinterPassModal } from './components/WinterPassModal';
import { ACHIEVEMENTS, LANDMARKS, ROMANTIC_GIFTS, WEATHER_CONDITIONS, getDailyChallengeForDate } from './game/constants';
import { SnowPlowGameEngine, type GameHUDStats } from './game/engine';
import {
  clearGameData,
  loadGameProgress,
  loadGameSettings,
  saveGameProgress,
  saveGameSettings,
  type GameSettings,
  type SolsticeAtmosphere,
} from './game/storage';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SnowPlowGameEngine | null>(null);

  // Settings & Audio state
  const [settings, setSettings] = useState<GameSettings>(() => loadGameSettings());
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [highestCombo, setHighestCombo] = useState<number>(() => loadGameProgress().highestCombo || 1);

  // HUD stats mirrored for React rendering
  const [stats, setStats] = useState<GameHUDStats>({
    gameState: 'TITLE',
    snowClearedPercent: 0,
    loveLetters: 20,
    comboLevel: 1,
    comboMultiplier: 1.0,
    comboTitle: 'Cozy Flurry',
    comboClipTitle: null,
    comboTimerProgress: 0,
    boostPercent: 100,
    speedKmh: 0,
    landmarksCleared: 0,
    totalLandmarks: 4,
    giftsFound: 0,
    totalGifts: 6,
    lastEventMessage: null,
    playerX: 0,
    playerZ: 0,
    heading: Math.PI,
    landmarks: LANDMARKS.map((l) => ({ ...l, cleared: false })),
    gifts: ROMANTIC_GIFTS.map((g) => ({ ...g, collected: false, revealed: false })),
    upgrades: {
      bladeWidth: 1,
      thermalLantern: 1,
      steamBoost: 1,
      loveMagnet: 1,
      comboTimer: 1,
    },
    unlockedAchievementIds: [],
    atmosphere: settings.atmosphere || 'twilight',
    radioStationId: settings.radioStationId || 'val-classic',
    radioStationName: 'Valentine Solstice FM',
    activeQuest: null,
    completedQuestIds: [],
    selectedPaintId: 'crimson',
    unlockedPaintIds: ['crimson'],
    selectedDecalId: 'heart',
    unlockedDecalIds: ['heart'],
    weather: WEATHER_CONDITIONS.gentle_flurry,
    weatherCycleTimeLeft: 75,
    winterPassXp: 0,
    winterPassLevel: 0,
    claimedPassTierIds: [],
    unclaimedPassRewardsCount: 0,
    dailyChallenge: (() => {
      const initial = getDailyChallengeForDate();
      const steps =
        initial.challenge.category === 'snow_pattern' && initial.challenge.patternPoints
          ? initial.challenge.patternPoints.map((pt) => ({ ...pt, completed: false }))
          : (initial.challenge.requiredLandmarkIds || [])
              .map((id) => LANDMARKS.find((l) => l.id === id))
              .filter((l): l is NonNullable<typeof l> => Boolean(l))
              .map((l) => ({ id: l.id, label: l.name, x: l.x, z: l.z, completed: false }));
      return {
        challenge: initial.challenge,
        dayKey: initial.dayKey,
        msUntilReset: initial.msUntilReset,
        steps,
        completedCount: 0,
        totalCount: steps.length,
        completed: false,
      };
    })(),
  });

  const returnStateRef = useRef<'TITLE' | 'PLAYING'>('TITLE');

  useEffect(() => {
    if (!canvasMountRef.current) return;

    // Initialize 3D Engine once inside isolated container
    const engine = new SnowPlowGameEngine(canvasMountRef.current, (newStats) => {
      if (newStats.gameState === 'TITLE') {
        returnStateRef.current = 'TITLE';
      } else if (newStats.gameState === 'PLAYING') {
        returnStateRef.current = 'PLAYING';
      }
      setStats(newStats);
      if (newStats.comboMultiplier > highestCombo) {
        setHighestCombo(newStats.comboMultiplier);
        saveGameProgress({ highestCombo: newStats.comboMultiplier });
      }
    });
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const getEngine = (action: string): SnowPlowGameEngine | null => {
    if (!engineRef.current) {
      console.warn(`[Snowbound Hearts] Cannot run "${action}": game engine is not initialized yet.`);
      return null;
    }
    return engineRef.current;
  };

  const handleStartGame = () => {
    const engine = getEngine('handleStartGame');
    if (!engine) return;
    engine.startGame();
  };

  // Apply loaded audio settings on mount
  useEffect(() => {
    synthAudio.setMasterVolume(settings.masterVolume);
    synthAudio.setMusicVolume(settings.musicVolume);
    synthAudio.setSfxVolume(settings.sfxVolume);
    synthAudio.setMute(settings.isMuted);
  }, []);

  const handleUpdateSettings = (newVals: Partial<GameSettings>) => {
    const updated = saveGameSettings(newVals);
    setSettings(updated);

    if (newVals.masterVolume !== undefined) synthAudio.setMasterVolume(newVals.masterVolume);
    if (newVals.musicVolume !== undefined) synthAudio.setMusicVolume(newVals.musicVolume);
    if (newVals.sfxVolume !== undefined) synthAudio.setSfxVolume(newVals.sfxVolume);
    if (newVals.isMuted !== undefined) synthAudio.setMute(newVals.isMuted);

    if (newVals.radioStationId !== undefined || newVals.atmosphere !== undefined) {
      const engine = getEngine('handleUpdateSettings');
      if (!engine) return;
      if (newVals.radioStationId !== undefined) {
        engine.setRadioStation(newVals.radioStationId);
      }
      if (newVals.atmosphere !== undefined) {
        engine.applyAtmosphere(newVals.atmosphere);
      }
    }
  };

  const handleOpenDispatchRadio = () => {
    const engine = getEngine('handleOpenDispatchRadio');
    if (!engine) return;
    engine.setGameState('DISPATCH_RADIO');
  };

  const handleOpenWinterPass = () => {
    const engine = getEngine('handleOpenWinterPass');
    if (!engine) return;
    engine.setGameState('WINTER_PASS');
  };

  const handleOpenDailyChallenge = () => {
    const engine = getEngine('handleOpenDailyChallenge');
    if (!engine) return;
    engine.setGameState('DAILY_CHALLENGE');
  };

  const handleClaimPassTierReward = (tierLevel: number) => {
    const engine = getEngine('handleClaimPassTierReward');
    if (!engine) return;
    engine.claimPassTierReward(tierLevel);
  };

  const handleSelectRadioStation = (stationId: string) => {
    const engine = getEngine('handleSelectRadioStation');
    if (!engine) return;
    engine.setRadioStation(stationId);
  };

  const handleCycleRadio = () => {
    const engine = getEngine('handleCycleRadio');
    if (!engine) return;
    engine.cycleRadioStation();
  };

  const handleStartQuest = (questId: string) => {
    const engine = getEngine('handleStartQuest');
    if (!engine) return;
    engine.startQuest(questId);
  };

  const handleCancelQuest = () => {
    const engine = getEngine('handleCancelQuest');
    if (!engine) return;
    engine.cancelQuest();
  };

  const handleSelectPaint = (paintId: string) => {
    const engine = getEngine('handleSelectPaint');
    if (!engine) return;
    engine.purchasePaint(paintId);
  };

  const handleSelectDecal = (decalId: string) => {
    const engine = getEngine('handleSelectDecal');
    if (!engine) return;
    engine.purchaseDecal(decalId);
  };

  const handleToggleMute = () => {
    const nextMuted = !settings.isMuted;
    handleUpdateSettings({ isMuted: nextMuted });
  };

  const handleToggleMusic = () => {
    const musicOn = synthAudio.toggleMusic();
    setIsMusicEnabled(musicOn);
  };

  const handleOpenWorkshop = () => {
    const engine = getEngine('handleOpenWorkshop');
    if (!engine) return;
    engine.setGameState('GARAGE');
  };

  const handleOpenScrapbook = () => {
    const engine = getEngine('handleOpenScrapbook');
    if (!engine) return;
    engine.setGameState('SCRAPBOOK');
  };

  const handleOpenPhotoMode = () => {
    const engine = getEngine('handleOpenPhotoMode');
    if (!engine) return;
    engine.setGameState('PHOTO');
  };

  const handleCapturePostcard = async (filterId: string, stampId: string, caption: string) => {
    const engine = getEngine('handleCapturePostcard');
    if (!engine) return '';
    return engine.capturePostcard(filterId, stampId, caption);
  };

  const handleOpenSettings = () => {
    const engine = getEngine('handleOpenSettings');
    if (!engine) return;
    engine.setGameState('SETTINGS');
  };

  const handlePause = () => {
    const engine = getEngine('handlePause');
    if (!engine) return;
    engine.setGameState('PAUSED');
  };

  const handleResume = () => {
    const engine = getEngine('handleResume');
    if (!engine) return;
    engine.setGameState('PLAYING');
  };

  const handleReturnToTitle = () => {
    const engine = getEngine('handleReturnToTitle');
    if (!engine) return;
    engine.setGameState('TITLE');
  };

  const handleContinueFreeRoam = () => {
    const engine = getEngine('handleContinueFreeRoam');
    if (!engine) return;
    engine.continueFreeRoam();
  };

  const handleBuyUpgrade = (upgradeId: string) => {
    const engine = getEngine('handleBuyUpgrade');
    if (!engine) return;
    engine.purchaseUpgrade(upgradeId);
  };

  const handleRestart = () => {
    const engine = getEngine('handleRestart');
    if (!engine) return;
    engine.resetGame();
  };

  const handleResetProgress = () => {
    clearGameData();
    setHighestCombo(1);
    const engine = getEngine('handleResetProgress');
    if (!engine) return;
    engine.resetGame();
  };

  const handleVirtualInput = (throttle: number, steer: number, boost: boolean) => {
    const engine = getEngine('handleVirtualInput');
    if (!engine) return;
    engine.setVirtualInput(throttle, steer, boost);
  };

  const getWeatherOverlayClass = (): string => {
    const weatherId = stats.weather.id;
    const isGoldenSky = stats.atmosphere === 'golden';

    if (weatherId === 'heavy_blizzard') {
      return 'bg-sky-900/25 shadow-[inset_0_0_120px_rgba(125,211,252,0.28)]';
    }
    if (weatherId === 'clear_aurora') {
      return isGoldenSky
        ? 'bg-amber-400/15 shadow-[inset_0_0_100px_rgba(251,191,36,0.24)]'
        : 'bg-emerald-500/10 shadow-[inset_0_0_110px_rgba(52,211,153,0.18)]';
    }
    if (weatherId === 'starlight_freeze') {
      return 'bg-indigo-950/20 shadow-[inset_0_0_110px_rgba(167,139,250,0.2)]';
    }
    // gentle_flurry
    return isGoldenSky
      ? 'bg-amber-400/10 shadow-[inset_0_0_90px_rgba(251,191,36,0.18)]'
      : 'bg-cyan-500/8 shadow-[inset_0_0_90px_rgba(56,189,248,0.14)]';
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Isolated WebGL 3D Canvas Mount Point */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'none' }}
      />

      {/* 1.5 Weather-Reactive Atmospheric Tint Overlay */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none transition-all duration-1000 ${getWeatherOverlayClass()}`}
      />

      {/* 2. Title Screen Overlay */}
      {stats.gameState === 'TITLE' && (
        <TitleScreen
          onStart={handleStartGame}
          isMuted={settings.isMuted}
          onToggleMute={handleToggleMute}
          onOpenDispatchRadio={handleOpenDispatchRadio}
          onOpenWinterPass={handleOpenWinterPass}
          onOpenDailyChallenge={handleOpenDailyChallenge}
          onOpenScrapbook={handleOpenScrapbook}
          onOpenSettings={handleOpenSettings}
        />
      )}

      {/* 3. In-Game Low-Occlusion HUD */}
      {stats.gameState !== 'TITLE' && (
        <GameHUD
          stats={stats}
          onOpenWorkshop={handleOpenWorkshop}
          onOpenScrapbook={handleOpenScrapbook}
          onOpenPhotoMode={handleOpenPhotoMode}
          onOpenDispatchRadio={handleOpenDispatchRadio}
          onOpenWinterPass={handleOpenWinterPass}
          onOpenDailyChallenge={handleOpenDailyChallenge}
          onOpenSettings={handleOpenSettings}
          onPause={handlePause}
          onCycleRadio={handleCycleRadio}
          isMuted={settings.isMuted}
          onToggleMute={handleToggleMute}
          showRadar={settings.showRadar}
          onVirtualInput={handleVirtualInput}
        />
      )}

      {/* 3.5 Solstice Emergency Dispatch & Radio Modal */}
      {stats.gameState === 'DISPATCH_RADIO' && (
        <DispatchRadioModal
          radioStationId={stats.radioStationId}
          activeQuest={stats.activeQuest}
          completedQuestIds={stats.completedQuestIds}
          loveLetters={stats.loveLetters}
          onSelectRadioStation={handleSelectRadioStation}
          onStartQuest={handleStartQuest}
          onCancelQuest={handleCancelQuest}
          onClose={handleResume}
        />
      )}

      {/* 4. Solstice Workshop (Garage) Modal */}
      {stats.gameState === 'GARAGE' && (
        <ShopModal
          loveLetters={stats.loveLetters}
          upgrades={stats.upgrades}
          selectedPaintId={stats.selectedPaintId}
          unlockedPaintIds={stats.unlockedPaintIds}
          selectedDecalId={stats.selectedDecalId}
          unlockedDecalIds={stats.unlockedDecalIds}
          onBuyUpgrade={handleBuyUpgrade}
          onSelectPaint={handleSelectPaint}
          onSelectDecal={handleSelectDecal}
          onClose={handleResume}
        />
      )}

      {/* 5. Pause Modal */}
      {stats.gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onOpenWorkshop={handleOpenWorkshop}
          onOpenDispatchRadio={handleOpenDispatchRadio}
          onOpenWinterPass={handleOpenWinterPass}
          onOpenDailyChallenge={handleOpenDailyChallenge}
          onOpenScrapbook={handleOpenScrapbook}
          onOpenPhotoMode={handleOpenPhotoMode}
          onOpenSettings={handleOpenSettings}
          isMuted={settings.isMuted}
          onToggleMute={handleToggleMute}
          isMusicEnabled={isMusicEnabled}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {/* 6. Solstice Photo Mode (Snapshot Camera) */}
      {stats.gameState === 'PHOTO' && (
        <PhotoModeModal
          snowClearedPercent={stats.snowClearedPercent}
          onCapture={handleCapturePostcard}
          onClose={handleResume}
          onOpenScrapbook={handleOpenScrapbook}
        />
      )}

      {/* 3.8 Solstice Winter Pass Modal */}
      {stats.gameState === 'WINTER_PASS' && (
        <WinterPassModal
          winterPassXp={stats.winterPassXp}
          claimedPassTierIds={stats.claimedPassTierIds}
          onClaimTierReward={handleClaimPassTierReward}
          onClose={handleResume}
        />
      )}

      {/* 3.9 Daily Romantic Challenge Modal */}
      {stats.gameState === 'DAILY_CHALLENGE' && (
        <DailyChallengeModal
          dailyChallenge={stats.dailyChallenge}
          playerX={stats.playerX}
          playerZ={stats.playerZ}
          onClose={returnStateRef.current === 'PLAYING' ? handleResume : handleReturnToTitle}
        />
      )}

      {/* 7. Solstice Scrapbook (Heart Log & Album) Modal */}
      {stats.gameState === 'SCRAPBOOK' && (
        <ScrapbookModal
          unlockedGifts={stats.gifts}
          clearedLandmarks={stats.landmarks}
          unlockedAchievementIds={stats.unlockedAchievementIds}
          highestCombo={highestCombo}
          totalLetters={stats.loveLetters}
          onClose={stats.snowClearedPercent > 0 ? handleResume : handleReturnToTitle}
          onOpenPhotoMode={handleOpenPhotoMode}
        />
      )}

      {/* 7. Solstice Postcard Photo Mode Modal */}
      {/* 8. Solstice Postcard Photo Mode Modal */}

      {/* 8. Settings Modal */}
      {stats.gameState === 'SETTINGS' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onResetProgress={handleResetProgress}
          onClose={stats.snowClearedPercent > 0 ? handleResume : handleReturnToTitle}
        />
      )}

      {/* 6. Victory Modal */}
      {stats.gameState === 'VICTORY' && (
        <VictoryModal
          snowClearedPercent={stats.snowClearedPercent}
          loveLetters={stats.loveLetters}
          giftsFound={stats.giftsFound}
          totalGifts={stats.totalGifts}
          onContinue={handleContinueFreeRoam}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
