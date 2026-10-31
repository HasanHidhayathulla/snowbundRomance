/**
 * LocalStorage Persistence and Settings Management for Snowbound Hearts
 */

export interface GameSettings {
  masterVolume: number; // 0.0 - 1.0
  musicVolume: number;  // 0.0 - 1.0
  sfxVolume: number;    // 0.0 - 1.0
  isMuted: boolean;
  showRadar: boolean;
  radarZoom: number;    // 1.0 = standard, 1.5 = wide
}

export interface PersistentProgress {
  loveLetters: number;
  upgrades: Record<string, number>;
  unlockedGiftIds: string[];
  clearedLandmarkIds: string[];
  highestCombo: number;
  totalSnowPlowedHectares: number;
}

const SETTINGS_KEY = 'snowbound_hearts_settings_v1';
const PROGRESS_KEY = 'snowbound_hearts_progress_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.7,
  musicVolume: 0.4,
  sfxVolume: 0.8,
  isMuted: false,
  showRadar: true,
  radarZoom: 1.0,
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
  highestCombo: 1,
  totalSnowPlowedHectares: 0,
};

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

export function clearGameData(): void {
  try {
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  } catch (err) {
    console.warn('Failed to clear game data:', err);
  }
}
