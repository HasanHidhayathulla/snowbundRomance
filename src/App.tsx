/**
 * Snowbound Hearts: 3D Isometric Snow-Plowing Game
 * Main React Container with isolated WebGL canvas ref lifecycle.
 */

import React, { useEffect, useRef, useState } from 'react';
import { synthAudio } from './audio/synthAudio';
import { GameHUD } from './components/GameHUD';
import { PauseModal } from './components/PauseModal';
import { ShopModal } from './components/ShopModal';
import { TitleScreen } from './components/TitleScreen';
import { VictoryModal } from './components/VictoryModal';
import { SnowPlowGameEngine, type GameHUDStats } from './game/engine';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<SnowPlowGameEngine | null>(null);

  // Audio settings state
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);

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
    upgrades: {
      bladeWidth: 1,
      thermalLantern: 1,
      steamBoost: 1,
      loveMagnet: 1,
      comboTimer: 1,
    },
  });

  useEffect(() => {
    if (!canvasMountRef.current) return;

    // Initialize 3D Engine once inside isolated container
    const engine = new SnowPlowGameEngine(canvasMountRef.current, (newStats) => {
      setStats(newStats);
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

  const handleToggleMute = () => {
    const muted = synthAudio.toggleMute();
    setIsMuted(muted);
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
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* 3. In-Game Low-Occlusion HUD */}
      {stats.gameState !== 'TITLE' && (
        <GameHUD
          stats={stats}
          onOpenWorkshop={handleOpenWorkshop}
          onPause={handlePause}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onVirtualInput={handleVirtualInput}
        />
      )}

      {/* 4. Solstice Workshop (Garage) Modal */}
      {stats.gameState === 'GARAGE' && (
        <ShopModal
          loveLetters={stats.loveLetters}
          upgrades={stats.upgrades}
          onBuyUpgrade={handleBuyUpgrade}
          onClose={handleResume}
        />
      )}

      {/* 5. Pause Modal */}
      {stats.gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onOpenWorkshop={handleOpenWorkshop}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isMusicEnabled={isMusicEnabled}
          onToggleMusic={handleToggleMusic}
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
