/**
 * Snowbound Hearts: 3D Isometric Snow-Plowing Game
 * Main React Container with isolated WebGL canvas ref lifecycle.
 */

import React, { useEffect, useRef, useState } from 'react';
import { synthAudio } from './audio/synthAudio';
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
import { ACHIEVEMENTS, LANDMARKS, ROMANTIC_GIFTS, WEATHER_CONDITIONS } from './game/constants';
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
  });

  useEffect(() => {
    if (!canvasMountRef.current) return;

    // Initialize 3D Engine once inside isolated container
    const engine = new SnowPlowGameEngine(canvasMountRef.current, (newStats) => {
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

  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.startGame();
    }
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
    if (newVals.radioStationId !== undefined && engineRef.current) {
      engineRef.current.setRadioStation(newVals.radioStationId);
    }
    if (newVals.atmosphere !== undefined && engineRef.current) {
      engineRef.current.applyAtmosphere(newVals.atmosphere);
    }
  };

  const handleOpenDispatchRadio = () => {
    if (engineRef.current) {
      engineRef.current.setGameState('DISPATCH_RADIO');
    }
  };

  const handleOpenWinterPass = () => {
    if (engineRef.current) {
      engineRef.current.setGameState('WINTER_PASS');
    }
  };

  const handleClaimPassTierReward = (tierLevel: number) => {
    if (engineRef.current) {
      engineRef.current.claimPassTierReward(tierLevel);
    }
  };

  const handleSelectRadioStation = (stationId: string) => {
    if (engineRef.current) {
      engineRef.current.setRadioStation(stationId);
    }
  };

  const handleCycleRadio = () => {
    if (engineRef.current) {
      engineRef.current.cycleRadioStation();
    }
  };

  const handleStartQuest = (questId: string) => {
    if (engineRef.current) {
      engineRef.current.startQuest(questId);
    }
  };

  const handleCancelQuest = () => {
    if (engineRef.current) {
      engineRef.current.cancelQuest();
    }
  };

  const handleSelectPaint = (paintId: string) => {
    if (engineRef.current) {
      engineRef.current.purchasePaint(paintId);
    }
  };

  const handleSelectDecal = (decalId: string) => {
    if (engineRef.current) {
      engineRef.current.purchaseDecal(decalId);
    }
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
    if (engineRef.current) {
      engineRef.current.setGameState('GARAGE');
    }
  };

  const handleOpenScrapbook = () => {
    if (engineRef.current) {
      engineRef.current.setGameState('SCRAPBOOK');
    }
  };

  const handleOpenPhotoMode = () => {
    if (engineRef.current) {
      engineRef.current.setGameState('PHOTO');
    }
  };

  const handleCapturePostcard = async (filterId: string, stampId: string, caption: string) => {
    if (engineRef.current) {
      return engineRef.current.capturePostcard(filterId, stampId, caption);
    }
    return '';
  };

  const handleOpenSettings = () => {
    if (engineRef.current) {
      engineRef.current.setGameState('SETTINGS');
    }
  };

  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.setGameState('PAUSED');
    }
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.setGameState('PLAYING');
    }
  };

  const handleBuyUpgrade = (upgradeId: string) => {
    if (engineRef.current) {
      engineRef.current.purchaseUpgrade(upgradeId);
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.resetGame();
    }
  };

  const handleResetProgress = () => {
    clearGameData();
    setHighestCombo(1);
    if (engineRef.current) {
      engineRef.current.resetGame();
    }
  };

  const handleVirtualInput = (throttle: number, steer: number, boost: boolean) => {
    if (engineRef.current) {
      engineRef.current.setVirtualInput(throttle, steer, boost);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Isolated WebGL 3D Canvas Mount Point */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'none' }}
      />

      {/* 2. Title Screen Overlay */}
      {stats.gameState === 'TITLE' && (
        <TitleScreen
          onStart={handleStartGame}
          isMuted={settings.isMuted}
          onToggleMute={handleToggleMute}
          onOpenDispatchRadio={handleOpenDispatchRadio}
          onOpenWinterPass={handleOpenWinterPass}
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

      {/* 7. Solstice Scrapbook (Heart Log & Album) Modal */}
      {stats.gameState === 'SCRAPBOOK' && (
        <ScrapbookModal
          unlockedGifts={stats.gifts}
          clearedLandmarks={stats.landmarks}
          unlockedAchievementIds={stats.unlockedAchievementIds}
          highestCombo={highestCombo}
          totalLetters={stats.loveLetters}
          onClose={stats.snowClearedPercent > 0 ? handleResume : () => engineRef.current?.setGameState('TITLE')}
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
          onClose={stats.snowClearedPercent > 0 ? handleResume : () => engineRef.current?.setGameState('TITLE')}
        />
      )}

      {/* 6. Victory Modal */}
      {stats.gameState === 'VICTORY' && (
        <VictoryModal
          snowClearedPercent={stats.snowClearedPercent}
          loveLetters={stats.loveLetters}
          giftsFound={stats.giftsFound}
          totalGifts={stats.totalGifts}
          onContinue={handleResume}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
