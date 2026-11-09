import { describe, expect, it } from 'bun:test';
import {
  ACHIEVEMENTS,
  SOLSTICE_CEREMONIES,
  WEATHER_CONDITIONS,
  type WeatherType,
} from './constants';

describe('Solstice Weather & Festival Observatory System', () => {
  it('defines valid weather conditions with logical properties', () => {
    const weatherKeys: WeatherType[] = ['calm_snow', 'golden_dawn', 'blizzard', 'aurora_solstice'];

    weatherKeys.forEach((key) => {
      const condition = WEATHER_CONDITIONS[key];
      expect(condition).toBeDefined();
      expect(condition.id).toBe(key);
      expect(condition.name.length).toBeGreaterThan(0);
      expect(typeof condition.temperatureC).toBe('number');
      expect(typeof condition.windSpeedKmh).toBe('number');
      expect(typeof condition.snowRateMmH).toBe('number');
      expect(condition.speedMultiplier).toBeGreaterThan(0);
      expect(condition.comboBonusMultiplier).toBeGreaterThanOrEqual(1.0);
      expect(['twilight', 'golden', 'aurora']).toContain(condition.skyAtmosphere);
    });
  });

  it('provides balanced solstice festival ceremonies', () => {
    expect(SOLSTICE_CEREMONIES.length).toBeGreaterThanOrEqual(3);

    SOLSTICE_CEREMONIES.forEach((ceremony) => {
      expect(ceremony.id).toBeDefined();
      expect(ceremony.name.length).toBeGreaterThan(0);
      expect(ceremony.costLetters).toBeGreaterThan(0);
      expect(ceremony.durationSec).toBeGreaterThan(30);
      expect(WEATHER_CONDITIONS[ceremony.weatherTrigger]).toBeDefined();
    });
  });

  it('includes achievements for weather interactions', () => {
    const watcher = ACHIEVEMENTS.find((a) => a.id === 'weather_watcher');
    const aurora = ACHIEVEMENTS.find((a) => a.id === 'aurora_reveler');
    const blizzard = ACHIEVEMENTS.find((a) => a.id === 'blizzard_survivor');

    expect(watcher).toBeDefined();
    expect(watcher?.rewardLetters).toBe(25);

    expect(aurora).toBeDefined();
    expect(aurora?.rewardLetters).toBe(45);

    expect(blizzard).toBeDefined();
    expect(blizzard?.rewardLetters).toBe(50);
  });

  it('properly configures blizzard vs golden dawn multipliers', () => {
    const blizzard = WEATHER_CONDITIONS.blizzard;
    const goldenDawn = WEATHER_CONDITIONS.golden_dawn;

    // Blizzard offers high reward for slower maneuverability
    expect(blizzard.speedMultiplier).toBeLessThan(1.0);
    expect(blizzard.comboBonusMultiplier).toBe(1.5);
    expect(blizzard.windSpeedKmh).toBeGreaterThan(30);

    // Golden dawn offers faster plowing with solar warmth
    expect(goldenDawn.speedMultiplier).toBeGreaterThan(1.0);
    expect(goldenDawn.warmthAuraBonus).toBeGreaterThan(0);
  });
});
