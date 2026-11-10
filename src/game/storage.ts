/**
 * LocalStorage Persistence and Settings Management for Snowbound Hearts
 */

import type { WeatherCondition } from './constants';

export type SolsticeAtmosphere = 'twilight' | 'golden' | 'aurora';

export interface GameSettings {
  masterVolume: number; // 0.0 - 1.0
  musicVolume: number;  // 0.0 - 1.0
  sfxVolume: number;    // 0.0 - 1.0
  windVolume: number;   // 0.0 - 1.0
  isMuted: boolean;
  showRadar: boolean;
  radarZoom: number;    // 1.0 = standard, 1.5 = wide
  atmosphere: SolsticeAtmosphere;
  weatherCondition: WeatherCondition;
  radioStationId: string;
}

export interface SavedPostcard {
  id: string;
  timestamp: number;
  imageDataUrl: string;
  caption: string;
  filterName: string;
  stampName: string;
  clearedPercent: number;
}

export interface PersistentProgress {
  loveLetters: number;
  upgrades: Record<string, number>;
  unlockedGiftIds: string[];
  clearedLandmarkIds: string[];
  unlockedAchievementIds: string[];
  highestCombo: number;
  totalCellsPlowed: number;
  postcardsCaptured: number;
  totalSnowPlowedHectares: number;
  completedQuestIds: string[];
  unlockedPaintIds: string[];
  selectedPaintId: string;
  unlockedDecalIds: string[];
  selectedDecalId: string;
  savedPostcards?: SavedPostcard[];
  lastDailyClaimDate?: string; // YYYY-MM-DD
  dailyStreakCount?: number;
}

const SETTINGS_KEY = 'snowbound_hearts_settings_v1';
const PROGRESS_KEY = 'snowbound_hearts_progress_v1';
const POSTCARDS_KEY = 'snowbound_hearts_postcards_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.7,
  musicVolume: 0.4,
  sfxVolume: 0.8,
  windVolume: 0.6,
  isMuted: false,
  showRadar: true,
  radarZoom: 1.0,
  atmosphere: 'twilight',
  weatherCondition: 'gentle_flurry',
  radioStationId: 'val-classic',
};

export const DEFAULT_PROGRESS: PersistentProgress = {
  loveLetters: 20,
  upgrades: {
    bladeWidth: 1,
    thermalLantern: 1,
    steamBoost: 1,
    loveMagnet: 1,
    comboTimer: 1,
  },
  unlockedGiftIds: [],
  clearedLandmarkIds: [],
  unlockedAchievementIds: [],
  highestCombo: 1,
  totalCellsPlowed: 0,
  postcardsCaptured: 0,
  totalSnowPlowedHectares: 0,
  completedQuestIds: [],
  unlockedPaintIds: ['crimson'],
  selectedPaintId: 'crimson',
  unlockedDecalIds: ['heart'],
  selectedDecalId: 'heart',
  lastDailyClaimDate: '',
  dailyStreakCount: 0,
};

export function canClaimDailyStipend(): { canClaim: boolean; nextStreak: number; rewardLetters: number } {
  const progress = loadGameProgress();
  const today = new Date().toISOString().slice(0, 10);
  const lastDate = progress.lastDailyClaimDate || '';

  if (lastDate === today) {
    return {
      canClaim: false,
      nextStreak: progress.dailyStreakCount || 1,
      rewardLetters: 25 + Math.min(5, (progress.dailyStreakCount || 1) - 1) * 10,
    };
  }

  // Check if yesterday or first time
  let streak = progress.dailyStreakCount || 0;
  if (lastDate) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastDate === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }
  } else {
    streak = 1;
  }

  const rewardLetters = 25 + Math.min(5, streak - 1) * 10;
  return { canClaim: true, nextStreak: streak, rewardLetters };
}

export function claimDailyStipend(): { success: boolean; lettersGained: number; streak: number } {
  const { canClaim, nextStreak, rewardLetters } = canClaimDailyStipend();
  if (!canClaim) {
    return { success: false, lettersGained: 0, streak: nextStreak };
  }

  const today = new Date().toISOString().slice(0, 10);
  const progress = loadGameProgress();
  const newLetters = (progress.loveLetters || 0) + rewardLetters;

  saveGameProgress({
    loveLetters: newLetters,
    lastDailyClaimDate: today,
    dailyStreakCount: nextStreak,
  });

  return { success: true, lettersGained: rewardLetters, streak: nextStreak };
}

export function loadGameSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Failed to load game settings:', err);
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveGameSettings(settings: Partial<GameSettings>): GameSettings {
  try {
    const current = loadGameSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save game settings:', err);
    return { ...DEFAULT_SETTINGS, ...settings };
  }
}

export function loadGameProgress(): PersistentProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Failed to load game progress:', err);
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveGameProgress(progress: Partial<PersistentProgress>): PersistentProgress {
  try {
    const current = loadGameProgress();
    const updated = { ...current, ...progress };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save game progress:', err);
    return { ...DEFAULT_PROGRESS, ...progress };
  }
}

export function loadSavedPostcards(): SavedPostcard[] {
  try {
    const raw = localStorage.getItem(POSTCARDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load saved postcards:', err);
    return [];
  }
}

export function savePostcardToStorage(postcard: SavedPostcard): SavedPostcard[] {
  try {
    const existing = loadSavedPostcards();
    // Keep max 12 postcards to avoid exceeding localStorage quota
    const updated = [postcard, ...existing.filter((p) => p.id !== postcard.id)].slice(0, 12);
    localStorage.setItem(POSTCARDS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save postcard:', err);
    return loadSavedPostcards();
  }
}

export function deletePostcardFromStorage(id: string): SavedPostcard[] {
  try {
    const existing = loadSavedPostcards();
    const updated = existing.filter((p) => p.id !== id);
    localStorage.setItem(POSTCARDS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to delete postcard:', err);
    return loadSavedPostcards();
  }
}

export function exportSaveDataJSON(): string {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    progress: loadGameProgress(),
    settings: loadGameSettings(),
  };
  return JSON.stringify(data, null, 2);
}

export function importSaveDataJSON(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.progress) {
      saveGameProgress(parsed.progress);
      if (parsed.settings) {
        saveGameSettings(parsed.settings);
      }
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to import save data:', err);
    return false;
  }
}

export function clearGameData(): void {
  try {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(POSTCARDS_KEY);
  } catch (err) {
    console.warn('Failed to clear game data:', err);
  }
}
