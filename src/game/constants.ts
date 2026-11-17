/**
 * Game constants, upgrade definitions, collectibles, and balance parameters
 */

export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GARAGE' | 'VICTORY' | 'SCRAPBOOK' | 'SETTINGS' | 'PHOTO' | 'DISPATCH_RADIO' | 'WINTER_PASS' | 'DAILY_CHALLENGE' | 'LEVEL_SELECT';

export type WeatherType = 'gentle_flurry' | 'heavy_blizzard' | 'clear_aurora' | 'starlight_freeze';

export interface WeatherCondition {
  id: WeatherType;
  name: string;
  tagline: string;
  iconName: string;
  fogDensity: number;
  snowParticleMultiplier: number;
  windSpeed: number; // m/s sideways drift
  snowAccumulationRate: number; // cells or depth added over time
  frictionMultiplier: number; // road slickness
  accentColor: string;
}

export const WEATHER_CONDITIONS: Record<WeatherType, WeatherCondition> = {
  gentle_flurry: {
    id: 'gentle_flurry',
    name: 'Gentle Flurry',
    tagline: 'Light romantic snow flurries with pleasant winter road grip.',
    iconName: 'CloudSnow',
    fogDensity: 0.016,
    snowParticleMultiplier: 1.0,
    windSpeed: 0.8,
    snowAccumulationRate: 0.0,
    frictionMultiplier: 1.0,
    accentColor: '#38bdf8',
  },
  heavy_blizzard: {
    id: 'heavy_blizzard',
    name: 'Solstice Blizzard',
    tagline: 'Gale-force gusts and whiteout drifts! Snow steadily replenishes the roads.',
    iconName: 'Wind',
    fogDensity: 0.032,
    snowParticleMultiplier: 2.2,
    windSpeed: 3.5,
    snowAccumulationRate: 0.08, // steady drift accumulation
    frictionMultiplier: 0.75, // slicker road handling
    accentColor: '#f43f5e',
  },
  clear_aurora: {
    id: 'clear_aurora',
    name: 'Dancing Aurora',
    tagline: 'Crystal clear emerald skies with crisp traction and brilliant visibility.',
    iconName: 'Sparkles',
    fogDensity: 0.011,
    snowParticleMultiplier: 0.5,
    windSpeed: 0.4,
    snowAccumulationRate: 0.0,
    frictionMultiplier: 1.15,
    accentColor: '#34d399',
  },
  starlight_freeze: {
    id: 'starlight_freeze',
    name: 'Starlight Freeze',
    tagline: 'Sub-zero crystalline calm with glistening ice crusting the cobblestones.',
    iconName: 'Moon',
    fogDensity: 0.014,
    snowParticleMultiplier: 0.7,
    windSpeed: 0.2,
    snowAccumulationRate: 0.0,
    frictionMultiplier: 0.9,
    accentColor: '#c084fc',
  },
};

export interface WinterPassTier {
  level: number;
  requiredXp: number;
  title: string;
  rewardType: 'letters' | 'paint' | 'decal' | 'title';
  rewardLetters?: number;
  rewardPaintId?: string;
  rewardDecalId?: string;
  rewardDescription: string;
  iconName: string;
}

export const WINTER_PASS_TIERS: WinterPassTier[] = [
  {
    level: 1,
    requiredXp: 50,
    title: 'Solstice Novice',
    rewardType: 'letters',
    rewardLetters: 30,
    rewardDescription: '+30 Love Letters stipend',
    iconName: 'Mail',
  },
  {
    level: 2,
    requiredXp: 120,
    title: 'Snowdrifter Scout',
    rewardType: 'decal',
    rewardDecalId: 'snowflake',
    rewardDescription: 'Solstice Snowflake Emblem',
    iconName: 'Snowflake',
  },
  {
    level: 3,
    requiredXp: 220,
    title: 'Frost Vanguard',
    rewardType: 'letters',
    rewardLetters: 45,
    rewardDescription: '+45 Love Letters supply drop',
    iconName: 'Gift',
  },
  {
    level: 4,
    requiredXp: 350,
    title: 'Warm Hearth Tender',
    rewardType: 'paint',
    rewardPaintId: 'aurora-emerald',
    rewardDescription: 'Aurora Borealis Livery Paint',
    iconName: 'Sparkles',
  },
  {
    level: 5,
    requiredXp: 520,
    title: 'Blizzard Breaker',
    rewardType: 'letters',
    rewardLetters: 60,
    rewardDescription: '+60 Love Letters & Hearth Cocoa',
    iconName: 'Flame',
  },
  {
    level: 6,
    requiredXp: 720,
    title: 'Valentine Envoy',
    rewardType: 'decal',
    rewardDecalId: 'flame',
    rewardDescription: 'Eternal Hearth Crest Decal',
    iconName: 'Flame',
  },
  {
    level: 7,
    requiredXp: 960,
    title: 'Glacial Ranger',
    rewardType: 'letters',
    rewardLetters: 80,
    rewardDescription: '+80 Love Letters festive bonus',
    iconName: 'Mail',
  },
  {
    level: 8,
    requiredXp: 1250,
    title: 'Starlight Sovereign',
    rewardType: 'paint',
    rewardPaintId: 'midnight-navy',
    rewardDescription: 'Solstice Midnight Livery Paint',
    iconName: 'Moon',
  },
  {
    level: 9,
    requiredXp: 1600,
    title: 'Valley Guardian',
    rewardType: 'decal',
    rewardDecalId: 'sparkles',
    rewardDescription: 'Starlight Garland Decal',
    iconName: 'Sparkles',
  },
  {
    level: 10,
    requiredXp: 2000,
    title: 'True Love Solstice Master',
    rewardType: 'paint',
    rewardPaintId: 'rose-gold',
    rewardDescription: 'Exclusive Candlelight Rose Gold Livery + 150 Letters',
    rewardLetters: 150,
    iconName: 'Crown',
  },
];

export interface SolsticeQuest {
  id: string;
  title: string;
  requester: string;
  category: 'delivery' | 'clearing' | 'rescue';
  description: string;
  targetX: number;
  targetZ: number;
  targetRadius: number;
  timeLimitSec: number;
  rewardLetters: number;
  dialogueSuccess: string;
  requiredClearRatio?: number;
}

export const SOLSTICE_QUESTS: SolsticeQuest[] = [
  {
    id: 'quest_cinnamon_delivery',
    title: 'Warm Cinnamon Delivery',
    requester: 'Julien the Baker',
    category: 'delivery',
    description: 'Rush freshly baked hot cinnamon rolls from the Bakery to Lovers’ Bridge before they turn cold!',
    targetX: 0,
    targetZ: -18,
    targetRadius: 7.0,
    timeLimitSec: 65,
    rewardLetters: 45,
    dialogueSuccess: '“They arrived still steaming! You made our bridge solstice date magical!”',
  },
  {
    id: 'quest_square_clearing',
    title: 'Grand Tree Festival Rush',
    requester: 'Mayor Holly',
    category: 'clearing',
    description: 'Plow the perimeter road leading to the Grand Solstice Tree so the festive choir can set up their songbooks!',
    targetX: 12,
    targetZ: 0,
    targetRadius: 9.0,
    timeLimitSec: 75,
    rewardLetters: 60,
    dialogueSuccess: '“The choir is assembled, and the Solstice carols are echoing across the snow!”',
    requiredClearRatio: 0.7,
  },
  {
    id: 'quest_lost_music_box',
    title: 'Lost Keepsake Rescue',
    requester: 'Grandma Clara',
    category: 'rescue',
    description: 'A sentimental vintage music box was dropped in deep snowdrifts near the North Pines. Rush over to locate it!',
    targetX: -24,
    targetZ: -20,
    targetRadius: 6.5,
    timeLimitSec: 50,
    rewardLetters: 50,
    dialogueSuccess: '“My grandmother’s waltz music box! Oh, thank you, our holiday is saved!”',
  },
  {
    id: 'quest_clocktower_chime',
    title: 'Clocktower Midnight Path',
    requester: 'Archivist Noel',
    category: 'clearing',
    description: 'Clear the snow blockade blocking the Alpine Starlight Clocktower steps before midnight bells begin!',
    targetX: -20,
    targetZ: -16,
    targetRadius: 7.5,
    timeLimitSec: 70,
    rewardLetters: 55,
    dialogueSuccess: '“Hear that chime? Every lover in the valley just looked up at the stars!”',
    requiredClearRatio: 0.65,
  },
];

export interface RadioStation {
  id: string;
  name: string;
  frequency: string;
  tagline: string;
  theme: 'solstice-folk' | 'aurora-ambient' | 'blizzard-alert' | 'lofi-cabin';
  accentColor: string;
}

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'val-classic',
    name: 'Valentine Solstice FM',
    frequency: '94.3 MHz',
    tagline: 'Cozy fireside folk melodies and warm acoustic harmonies for winter nights.',
    theme: 'solstice-folk',
    accentColor: '#fb7185',
  },
  {
    id: 'val-aurora',
    name: 'Aurora Dream Radio',
    frequency: '102.7 MHz',
    tagline: 'Shimmering celestial synth pads inspired by the dancing northern green skies.',
    theme: 'aurora-ambient',
    accentColor: '#34d399',
  },
  {
    id: 'val-lofi',
    name: 'Snowed-In Cabin Lo-Fi',
    frequency: '88.1 MHz',
    tagline: 'Mellow winter beats, tape warmth, and mellow jazzy solstice chords.',
    theme: 'lofi-cabin',
    accentColor: '#c084fc',
  },
  {
    id: 'val-dispatch',
    name: 'Valley Weather & Dispatch',
    frequency: '106.9 MHz',
    tagline: 'Live Solstice blizzard updates, urgent plow requests, and road warnings.',
    theme: 'blizzard-alert',
    accentColor: '#38bdf8',
  },
];

export interface TractorPaint {
  id: string;
  name: string;
  colorHex: number;
  finish: string;
  cost: number;
  desc: string;
}

export const TRACTOR_PAINTS: TractorPaint[] = [
  { id: 'crimson', name: 'Valentine Crimson', colorHex: 0xbe123c, finish: 'Ruby Gloss', cost: 0, desc: 'Classic romantic red with warm amber undertones.' },
  { id: 'aurora-emerald', name: 'Aurora Borealis', colorHex: 0x059669, finish: 'Pearlescent Teal', cost: 35, desc: 'Iridescent forest emerald glowing with northern lights.' },
  { id: 'midnight-navy', name: 'Solstice Midnight', colorHex: 0x1e1b4b, finish: 'Deep Velvet', cost: 45, desc: 'Quiet midnight indigo reminiscent of starry winter skies.' },
  { id: 'rose-gold', name: 'Candlelight Rose', colorHex: 0xdb2777, finish: 'Metallic Blush', cost: 60, desc: 'Glamorous champagne pink with golden reflections.' },
  { id: 'frost-silver', name: 'Glacial Titanium', colorHex: 0x475569, finish: 'Satin Alloy', cost: 75, desc: 'Industrial frosted steel with reflective blizzard armor.' },
];

export interface TractorDecal {
  id: string;
  name: string;
  iconName: string;
  colorHex: number;
  cost: number;
  desc: string;
}

export const TRACTOR_DECALS: TractorDecal[] = [
  { id: 'heart', name: 'True Love Crest', iconName: 'Heart', colorHex: 0xf43f5e, cost: 0, desc: 'Iconic glowing pink heart insignia.' },
  { id: 'snowflake', name: 'Solstice Snowflake', iconName: 'Snowflake', colorHex: 0x38bdf8, cost: 25, desc: 'Six-pointed crystalline star of the winter solstice.' },
  { id: 'flame', name: 'Eternal Hearth', iconName: 'Flame', colorHex: 0xf59e0b, cost: 40, desc: 'Golden flame emblem that radiates warmth in freezing drifts.' },
  { id: 'sparkles', name: 'Starlight Garland', iconName: 'Sparkles', colorHex: 0xe879f9, cost: 55, desc: 'Twinkling constellation celebrating reunited lovers.' },
];

export interface UpgradeTier {
  level: number;
  cost: number;
  title: string;
  desc: string;
  statValue: number;
}

export interface UpgradeConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
  tiers: UpgradeTier[];
}

export const UPGRADES: Record<string, UpgradeConfig> = {
  bladeWidth: {
    id: 'bladeWidth',
    name: 'Gilded Snowblade',
    icon: 'Snowflake',
    description: 'Widens plow blade wings and increases snow pushing clearance.',
    tiers: [
      { level: 1, cost: 0, title: 'Standard Steel', desc: 'Standard 2.2m clearance blade', statValue: 2.2 },
      { level: 2, cost: 35, title: 'Wider Wings', desc: 'Extends plow wings to 3.0m', statValue: 3.0 },
      { level: 3, cost: 80, title: 'Reinforced Sweeper', desc: 'Expands wings to 3.8m with side baffles', statValue: 3.8 },
      { level: 4, cost: 160, title: 'Grand Avalanche Blade', desc: 'Maximum 4.6m romantic boulevard sweeper', statValue: 4.6 },
    ],
  },
  thermalLantern: {
    id: 'thermalLantern',
    name: 'Warmth Lantern',
    icon: 'Flame',
    description: 'Radiates cozy warmth that automatically melts snow around the tractor.',
    tiers: [
      { level: 1, cost: 0, title: 'Dim Candle', desc: 'No passive melting', statValue: 0 },
      { level: 2, cost: 45, title: 'Brass Kerosene Lantern', desc: 'Melts a 2.5m gentle warmth aura', statValue: 2.5 },
      { level: 3, cost: 110, title: 'Solstice Hearth Glow', desc: 'Melts a 4.0m warm amber radius', statValue: 4.0 },
      { level: 4, cost: 220, title: 'Heartfire Radiance', desc: 'Melts a 6.0m blazing romantic aura', statValue: 6.0 },
    ],
  },
  steamBoost: {
    id: 'steamBoost',
    name: 'Steam Heart Turbo',
    icon: 'Zap',
    description: 'Enhances boost acceleration, top speed, and steam tank capacity.',
    tiers: [
      { level: 1, cost: 0, title: 'Stock Boiler', desc: '1.4x boost speed, 3s boost tank', statValue: 1.4 },
      { level: 2, cost: 40, title: 'Copper Pressure Valve', desc: '1.7x boost speed, 4.5s boost tank', statValue: 1.7 },
      { level: 3, cost: 95, title: 'Double Piston Turbo', desc: '2.0x boost speed, 6.0s boost tank', statValue: 2.0 },
      { level: 4, cost: 180, title: 'Supercharged Love Engine', desc: '2.4x boost speed, 8.0s boost tank', statValue: 2.4 },
    ],
  },
  loveMagnet: {
    id: 'loveMagnet',
    name: 'Cupid Magnet',
    icon: 'Heart',
    description: 'Attracts buried love letters, hearts, and gift boxes from afar.',
    tiers: [
      { level: 1, cost: 0, title: 'Hand Pick', desc: 'Normal 2.0m pickup radius', statValue: 2.0 },
      { level: 2, cost: 30, title: 'Magnetic Horseshoe', desc: 'Pulls gifts within 4.5m', statValue: 4.5 },
      { level: 3, cost: 75, title: 'Heart Compass', desc: 'Pulls gifts within 7.5m', statValue: 7.5 },
      { level: 4, cost: 150, title: 'Soulmate Resonance', desc: 'Pulls gifts within 12.0m with beam trails', statValue: 12.0 },
    ],
  },
  comboTimer: {
    id: 'comboTimer',
    name: 'Romantic Rhythm',
    icon: 'Music',
    description: 'Extends combo multiplier grace time and boosts bonus hearts.',
    tiers: [
      { level: 1, cost: 0, title: 'Fleeting Spark', desc: '2.5s combo decay window', statValue: 2.5 },
      { level: 2, cost: 35, title: 'Warm Conversation', desc: '3.8s combo decay window', statValue: 3.8 },
      { level: 3, cost: 85, title: 'Starlit Serenade', desc: '5.2s combo decay window', statValue: 5.2 },
      { level: 4, cost: 175, title: 'Everlasting Harmony', desc: '7.0s combo decay window & 2x heart bonus', statValue: 7.0 },
    ],
  },
};

export interface RomanticGift {
  id: string;
  name: string;
  icon: string;
  quote: string;
  x: number;
  z: number;
  value: number; // Love Letters gained
  collected: boolean;
  revealed?: boolean;
}

export const ROMANTIC_GIFTS: Omit<RomanticGift, 'collected'>[] = [
  { id: 'gift-1', name: 'Hand-Knit Wool Mittens', icon: 'Mitten', quote: '“Keep your fingers warm while we hold hands.”', x: -18, z: 12, value: 20 },
  { id: 'gift-2', name: 'Steaming Cocoa Mug with Marshmallows', icon: 'Coffee', quote: '“A dash of cinnamon and two lumps of sugar, just how you like it.”', x: 16, z: -14, value: 25 },
  { id: 'gift-3', name: 'Vintage Music Box', icon: 'Music', quote: '“It plays that soft waltz we danced to under the snow.”', x: -24, z: -20, value: 35 },
  { id: 'gift-4', name: 'Golden Snowflake Locket', icon: 'Lock', quote: '“Inside is a pressed evergreen leaf from our first winter walk.”', x: 26, z: 18, value: 40 },
  { id: 'gift-5', name: 'Velvet Ribbon Love Letter', icon: 'Mail', quote: '“No storm is cold enough to freeze what I feel for you.”', x: 4, z: 32, value: 30 },
  { id: 'gift-6', name: 'Crystal Solstice Rose', icon: 'Flower', quote: '“Blooms only on the longest, quietest winter night.”', x: -6, z: -34, value: 50 },
];

export interface Landmark {
  id: string;
  name: string;
  description: string;
  x: number;
  z: number;
  radius: number;
  cleared: boolean;
  requiredClearRatio: number;
  coupleCoupleQuotes: string[];
  kind?: 'tree' | 'bakery' | 'gazebo' | 'lighthouse' | 'observatory' | 'fountain' | 'crystal';
}

export const LANDMARKS: Omit<Landmark, 'cleared'>[] = [
  {
    id: 'bakery',
    name: 'The Cinnamon & Clove Bakery',
    description: 'Clear the driveway to rescue pastry chef Julien and his beloved floriste Elodie!',
    x: -22,
    z: 22,
    radius: 7,
    requiredClearRatio: 0.65,
    coupleCoupleQuotes: ['“The ovens are warm again! Come taste the ginger tarts!”', '“You saved our solstice date!”'],
  },
  {
    id: 'lovers-bridge',
    name: 'Stone Lover’s Bridge',
    description: 'Plow across the archway connecting the North and South village lanes.',
    x: 0,
    z: -18,
    radius: 6,
    requiredClearRatio: 0.70,
    coupleCoupleQuotes: ['“We can finally cross to each other’s side of the stream!”', '“Look at the reflection in the frozen pond!”'],
  },
  {
    id: 'town-square',
    name: 'Grand Solstice Gazebo & Tree',
    description: 'The festival centerpiece! Clear the town square to light up the fairy tree.',
    x: 12,
    z: 0,
    radius: 8.5,
    requiredClearRatio: 0.75,
    coupleCoupleQuotes: ['“The Solstice lights are sparkling brighter than the northern stars!”', '“Happy Solstice, darling!”'],
  },
  {
    id: 'clocktower',
    name: 'Alpine Starlight Clocktower',
    description: 'Clear the plaza so the village bells can ring midnight for all the lovers.',
    x: -20,
    z: -16,
    radius: 7,
    requiredClearRatio: 0.70,
    coupleCoupleQuotes: ['“Hear the bells echo across the valley!”', '“Every chime is a heartbeat.”'],
  },
];

export const COMBO_LEVELS = [
  { level: 1, multiplier: 1.0, title: 'Cozy Flurry', color: '#93c5fd' },
  { level: 2, multiplier: 1.5, title: 'Warm Breath', color: '#67e8f9' },
  { level: 3, multiplier: 2.0, title: 'Holding Hands', color: '#f472b6' },
  { level: 4, multiplier: 2.5, title: 'Heartfelt Glance', color: '#fb7185' },
  { level: 5, multiplier: 3.5, title: 'Midnight Waltz', color: '#ec4899' },
  { level: 6, multiplier: 5.0, title: 'Soulmate Spark', color: '#f43f5e' },
  { level: 7, multiplier: 7.0, title: 'Aurora Romance', color: '#e11d48' },
  { level: 8, multiplier: 10.0, title: 'True Love Eternal', color: '#ff0055' },
];

export interface SolsticeAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardLetters: number;
}

export const ACHIEVEMENTS: SolsticeAchievement[] = [
  {
    id: 'first_tracks',
    title: 'First Tracks in the Powder',
    description: 'Plow your first snowdrifts through Valentine Valley.',
    icon: 'Snowflake',
    rewardLetters: 15,
  },
  {
    id: 'speed_demon',
    title: 'Blizzard Dasher',
    description: 'Reach a blistering plow speed of 24 km/h using Steam Turbo.',
    icon: 'Zap',
    rewardLetters: 25,
  },
  {
    id: 'sweet_combo',
    title: 'Warm Conversation',
    description: 'Reach a Combo Multiplier of x2.0 or higher.',
    icon: 'Flame',
    rewardLetters: 30,
  },
  {
    id: 'midnight_waltz',
    title: 'Midnight Waltz',
    description: 'Achieve a romantic Combo Multiplier of x3.5 or higher.',
    icon: 'Heart',
    rewardLetters: 50,
  },
  {
    id: 'keepsake_hunter',
    title: 'Solstice Sleuth',
    description: 'Uncover and collect at least 3 buried solstice keepsakes.',
    icon: 'Gift',
    rewardLetters: 35,
  },
  {
    id: 'first_reunion',
    title: 'Love Reconnected',
    description: 'Clear the snow around your first village landmark.',
    icon: 'MapPin',
    rewardLetters: 40,
  },
  {
    id: 'master_mechanic',
    title: 'Master Blacksmith',
    description: 'Upgrade any tractor equipment to its maximum tier.',
    icon: 'Wrench',
    rewardLetters: 60,
  },
  {
    id: 'shutterbug',
    title: 'Solstice Photographer',
    description: 'Capture a scenic postcard using Photo Mode.',
    icon: 'Camera',
    rewardLetters: 20,
  },
  {
    id: 'grand_savior',
    title: 'Valley of Reunited Hearts',
    description: 'Clear all 4 landmarks and bring all lovers together.',
    icon: 'Sparkles',
    rewardLetters: 100,
  },
  {
    id: 'first_dispatch',
    title: 'Solstice Courier',
    description: 'Complete your first emergency village dispatch quest.',
    icon: 'Zap',
    rewardLetters: 35,
  },
  {
    id: 'radio_enthusiast',
    title: 'Valley Broadcast Tuner',
    description: 'Tune into different Solstice Radio stations on the plow radio.',
    icon: 'Music',
    rewardLetters: 25,
  },
  {
    id: 'atelier_customizer',
    title: 'Atelier Artisan',
    description: 'Customize your Heartplow tractor with a new livery paint job.',
    icon: 'Flame',
    rewardLetters: 30,
  },
  {
    id: 'blizzard_survivor',
    title: 'Whiteout Survivor',
    description: 'Plow roads continuously through a raging Solstice Blizzard event.',
    icon: 'Wind',
    rewardLetters: 45,
  },
  {
    id: 'winter_pass_initiate',
    title: 'Pass Challenger',
    description: 'Unlock and claim your first Solstice Winter Pass milestone tier.',
    icon: 'Award',
    rewardLetters: 35,
  },
  {
    id: 'winter_pass_master',
    title: 'Grand Solstice Champion',
    description: 'Reach the pinnacle Tier 10 in the Solstice Winter Pass.',
    icon: 'Crown',
    rewardLetters: 150,
  },
  {
    id: 'daily_devotion',
    title: 'Solstice Sweetheart',
    description: 'Complete a rotating 24-hour Daily Romantic Challenge.',
    icon: 'Heart',
    rewardLetters: 40,
  },
];

export type DailyChallengeCategory = 'landmark_visit' | 'snow_pattern';

export interface DailyPatternPoint {
  id: string;
  label: string;
  x: number;
  z: number;
}

export interface DailyRomanticChallenge {
  id: string;
  title: string;
  subtitle: string;
  category: DailyChallengeCategory;
  patternName?: string;
  description: string;
  rewardLetters: number;
  rewardPassXp: number;
  requiredLandmarkIds?: string[];
  patternPoints?: DailyPatternPoint[];
}

export const DAILY_ROMANTIC_CHALLENGES: DailyRomanticChallenge[] = [
  {
    id: 'daily_heart_carve',
    title: 'Heart in the Valley Powder',
    subtitle: 'Romantic Snow Art',
    category: 'snow_pattern',
    patternName: 'Heart Loop',
    description: 'Plow a giant glowing heart trail across the central Valentine Meadow by carving through all 8 heart waypoints.',
    rewardLetters: 90,
    rewardPassXp: 150,
    patternPoints: [
      { id: 'pt-0', label: 'Heart Cleft (Top Center)', x: 0, z: 2 },
      { id: 'pt-1', label: 'Right Lobe Crest', x: 6, z: -2 },
      { id: 'pt-2', label: 'Right Shoulder Curve', x: 10, z: 3 },
      { id: 'pt-3', label: 'Right Taper Sweep', x: 6, z: 10 },
      { id: 'pt-4', label: 'Heart Tip (South Point)', x: 0, z: 16 },
      { id: 'pt-5', label: 'Left Taper Sweep', x: -6, z: 10 },
      { id: 'pt-6', label: 'Left Shoulder Curve', x: -10, z: 3 },
      { id: 'pt-7', label: 'Left Lobe Crest', x: -6, z: -2 },
    ],
  },
  {
    id: 'daily_bridge_bakery_date',
    title: 'Bridge to Bakery Promenade',
    subtitle: 'Landmark Pilgrimage',
    category: 'landmark_visit',
    description: 'Drive your Heartplow from Stone Lover’s Bridge to The Cinnamon & Clove Bakery to deliver warm solstice wishes.',
    rewardLetters: 75,
    rewardPassXp: 120,
    requiredLandmarkIds: ['lovers-bridge', 'bakery'],
  },
  {
    id: 'daily_solstice_halo',
    title: 'Ring Around the Solstice Tree',
    subtitle: 'Romantic Snow Art',
    category: 'snow_pattern',
    patternName: 'Solstice Ring',
    description: 'Carve a radiant circular halo in the snow encircling the Grand Solstice Tree in Town Square.',
    rewardLetters: 85,
    rewardPassXp: 140,
    patternPoints: [
      { id: 'pt-0', label: 'North Square Arch', x: 12, z: -10 },
      { id: 'pt-1', label: 'Northeast Garland', x: 19, z: -7 },
      { id: 'pt-2', label: 'East Festival Lane', x: 22, z: 0 },
      { id: 'pt-3', label: 'Southeast Lanterns', x: 19, z: 7 },
      { id: 'pt-4', label: 'South Square Steps', x: 12, z: 10 },
      { id: 'pt-5', label: 'Southwest Evergreen', x: 5, z: 7 },
      { id: 'pt-6', label: 'West Gazebo Edge', x: 2, z: 0 },
      { id: 'pt-7', label: 'Northwest Hearth', x: 5, z: -7 },
    ],
  },
  {
    id: 'daily_clocktower_square',
    title: 'Starlight Chimes Tour',
    subtitle: 'Landmark Pilgrimage',
    category: 'landmark_visit',
    description: 'Visit the Alpine Starlight Clocktower and the Grand Solstice Gazebo & Tree during a single winter patrol.',
    rewardLetters: 80,
    rewardPassXp: 130,
    requiredLandmarkIds: ['clocktower', 'town-square'],
  },
  {
    id: 'daily_figure_eight_waltz',
    title: 'Snowlit Figure-Eight Waltz',
    subtitle: 'Romantic Snow Art',
    category: 'snow_pattern',
    patternName: 'Infinity Waltz',
    description: 'Trace a graceful figure-eight dance across the open snowfields between the East and West meadows.',
    rewardLetters: 95,
    rewardPassXp: 160,
    patternPoints: [
      { id: 'pt-0', label: 'Center Pivot', x: 0, z: 0 },
      { id: 'pt-1', label: 'East Loop North', x: 7, z: -6 },
      { id: 'pt-2', label: 'East Loop Apex', x: 12, z: 0 },
      { id: 'pt-3', label: 'East Loop South', x: 7, z: 6 },
      { id: 'pt-4', label: 'West Loop North', x: -7, z: -6 },
      { id: 'pt-5', label: 'West Loop Apex', x: -12, z: 0 },
      { id: 'pt-6', label: 'West Loop South', x: -7, z: 6 },
    ],
  },
  {
    id: 'daily_grand_valley_tour',
    title: 'Grand Lovers’ Valley Tour',
    subtitle: 'Landmark Pilgrimage',
    category: 'landmark_visit',
    description: 'Make a heartwarming tour across three iconic romantic landmarks: Lover’s Bridge, Clocktower, and Bakery.',
    rewardLetters: 110,
    rewardPassXp: 180,
    requiredLandmarkIds: ['lovers-bridge', 'clocktower', 'bakery'],
  },
];

const MS_PER_DAY = 86_400_000;

export function getUtcDayKey(nowMs: number = Date.now()): string {
  return new Date(nowMs).toISOString().slice(0, 10);
}

export function getDailyChallengeForDate(nowMs: number = Date.now()): {
  challenge: DailyRomanticChallenge;
  dayKey: string;
  msUntilReset: number;
} {
  const dayIndex = Math.floor(nowMs / MS_PER_DAY);
  const dayKey = getUtcDayKey(nowMs);
  const nextResetMs = (dayIndex + 1) * MS_PER_DAY;
  const challenge = DAILY_ROMANTIC_CHALLENGES[dayIndex % DAILY_ROMANTIC_CHALLENGES.length];
  return {
    challenge,
    dayKey,
    msUntilReset: Math.max(0, nextResetMs - nowMs),
  };
}

export type LevelGroundPattern = 'cobblestone' | 'boardwalk' | 'granite' | 'marble';

export interface MapFeatureZone {
  id: string;
  type: 'water' | 'plaza' | 'road' | 'garden';
  label: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  color: string;
  colorHex: number;
}

export interface LevelMapConfig {
  id: string;
  number: number;
  name: string;
  subtitle: string;
  description: string;
  difficulty: 'Cozy' | 'Brisk' | 'Alpine' | 'Grand';
  unlockCostLetters: number;
  snowResistance: number;
  theme: {
    groundPattern: LevelGroundPattern;
    groundColor: number;
    snowTintHex: number;
    accentColor: string;
    chaletColor: number;
    rimLightHex: number;
  };
  mapFeatures: MapFeatureZone[];
  landmarks: Omit<Landmark, 'cleared'>[];
  gifts: Omit<RomanticGift, 'collected'>[];
  quests: SolsticeQuest[];
  props: {
    chalets: Array<{ x: number; z: number; rot: number; color: number }>;
    pines: Array<{ x: number; z: number; s: number }>;
    snowmen: Array<{ x: number; z: number }>;
    crystals?: Array<{ x: number; z: number; s: number }>;
  };
}

export const LEVEL_MAPS: LevelMapConfig[] = [
  {
    id: 'valentine-valley',
    number: 1,
    name: 'Valentine Valley',
    subtitle: 'Alpine Village Heartlands',
    description: 'Warm cobblestone lanes winding past timber chalets, the Cinnamon Bakery, Lover’s Bridge, and the Grand Solstice Tree.',
    difficulty: 'Cozy',
    unlockCostLetters: 0,
    snowResistance: 1.0,
    theme: {
      groundPattern: 'cobblestone',
      groundColor: 0x334155,
      snowTintHex: 0xf8fafc,
      accentColor: '#f43f5e',
      chaletColor: 0x78350f,
      rimLightHex: 0xf472b6,
    },
    mapFeatures: [
      { id: 'vv-stream', type: 'water', label: 'Frozen Stream', x: 0, z: -18, width: 88, depth: 6, color: '#38bdf8', colorHex: 0x0c4a6e },
      { id: 'vv-square', type: 'plaza', label: 'Town Square', x: 12, z: 0, width: 18, depth: 18, color: '#f59e0b', colorHex: 0x475569 },
      { id: 'vv-avenue', type: 'road', label: 'Solstice Avenue', x: 0, z: 4, width: 8, depth: 56, color: '#94a3b8', colorHex: 0x334155 },
    ],
    landmarks: LANDMARKS,
    gifts: ROMANTIC_GIFTS,
    quests: SOLSTICE_QUESTS,
    props: {
      chalets: [
        { x: -16, z: -8, rot: 0.3, color: 0x78350f },
        { x: -28, z: 8, rot: 1.1, color: 0x92400e },
        { x: -32, z: 28, rot: -0.4, color: 0x854d0e },
        { x: 24, z: -22, rot: -1.2, color: 0x713f12 },
        { x: 30, z: -6, rot: 2.8, color: 0x78350f },
        { x: 26, z: 24, rot: 0.6, color: 0x9a3412 },
        { x: -8, z: 34, rot: 3.1, color: 0x7c2d12 },
        { x: 8, z: -30, rot: -0.2, color: 0x854d0e },
      ],
      pines: [
        { x: -10, z: 12, s: 0.9 },
        { x: -6, z: -12, s: 1.1 },
        { x: 18, z: 10, s: 1.0 },
        { x: 6, z: 22, s: 0.8 },
        { x: -18, z: -28, s: 1.3 },
        { x: 22, z: -32, s: 0.9 },
      ],
      snowmen: [
        { x: -4, z: 8 },
        { x: 16, z: -8 },
        { x: -12, z: -6 },
      ],
    },
  },
  {
    id: 'lantern-harbor',
    number: 2,
    name: 'Frozen Lantern Harbor',
    subtitle: 'Boardwalk & Sea-Mist Cove',
    description: 'Plow the frost-rimmed boardwalk piers, crimson coastal lighthouse, and ice-bound canal barges by the moonlit cove.',
    difficulty: 'Brisk',
    unlockCostLetters: 60,
    snowResistance: 1.15,
    theme: {
      groundPattern: 'boardwalk',
      groundColor: 0x2c3e55,
      snowTintHex: 0xf0f9ff,
      accentColor: '#38bdf8',
      chaletColor: 0x1e3a5f,
      rimLightHex: 0x38bdf8,
    },
    mapFeatures: [
      { id: 'lh-bay', type: 'water', label: 'Moonlit Ice Cove', x: 22, z: 20, width: 34, depth: 28, color: '#0ea5e9', colorHex: 0x075985 },
      { id: 'lh-canal', type: 'water', label: 'Harbor Canal', x: 0, z: -22, width: 76, depth: 7, color: '#38bdf8', colorHex: 0x0c4a6e },
      { id: 'lh-pier', type: 'plaza', label: 'Lantern Pier Deck', x: -16, z: 18, width: 20, depth: 16, color: '#fbbf24', colorHex: 0x334155 },
    ],
    landmarks: [
      {
        id: 'harbor-lighthouse',
        name: 'Crimson Harbor Lighthouse',
        description: 'Clear the sea-mist drift around the beacon tower so fishing boats can spot home.',
        x: 24,
        z: 16,
        radius: 7.5,
        requiredClearRatio: 0.68,
        kind: 'lighthouse',
        coupleCoupleQuotes: ['“The beacon sweeps across the bay again—welcome ashore!”', '“No sea fog can dim this lantern.”'],
      },
      {
        id: 'cocoa-barge',
        name: 'Floating Cocoa Wharf',
        description: 'Sweep the boardwalk plaza beside the moored cocoa boathouse.',
        x: -18,
        z: 20,
        radius: 7,
        requiredClearRatio: 0.68,
        kind: 'bakery',
        coupleCoupleQuotes: ['“Spiced cider and sea salt caramels are piping hot!”', '“Best waterfront view in winter!”'],
      },
      {
        id: 'canal-arch',
        name: 'Frozen Canal Promenade',
        description: 'Carve a clear crossing over the northern harbor canal.',
        x: 0,
        z: -20,
        radius: 6.5,
        requiredClearRatio: 0.70,
        kind: 'gazebo',
        coupleCoupleQuotes: ['“Look at the lantern reflections dancing on the blue ice!”', '“Hand in hand across the cove.”'],
      },
      {
        id: 'starlight-boathouse',
        name: 'Starlight Boathouse',
        description: 'Open the western harbor dockside where the choir gathers by the boats.',
        x: -24,
        z: -12,
        radius: 7,
        requiredClearRatio: 0.70,
        kind: 'tree',
        coupleCoupleQuotes: ['“The harbor bells sound sweeter over frozen waves!”', '“Every dock lantern is lit for us.”'],
      },
    ],
    gifts: [
      { id: 'lh-gift-1', name: 'Sea-Glass Heart Compass', icon: 'Lock', quote: '“Always points toward warm harbors and warmer hearts.”', x: 14, z: 12, value: 30 },
      { id: 'lh-gift-2', name: 'Mariner’s Cashmere Scarf', icon: 'Mitten', quote: '“Woven to block the sharpest north sea gale.”', x: -12, z: -8, value: 25 },
      { id: 'lh-gift-3', name: 'Message in a Frost Bottle', icon: 'Mail', quote: '“Meet me under the crimson lighthouse at high tide.”', x: 26, z: -14, value: 40 },
      { id: 'lh-gift-4', name: 'Spiced Gingerbread Tin', icon: 'Coffee', quote: '“Baked aboard the cocoa wharf this very morning.”', x: -28, z: 12, value: 35 },
      { id: 'lh-gift-5', name: 'Driftwood Music Locket', icon: 'Music', quote: '“Hums a gentle harbor lullaby when opened.”', x: 4, z: 28, value: 45 },
      { id: 'lh-gift-6', name: 'Sapphire Tide Rose', icon: 'Flower', quote: '“Crystallized spray from the calmest winter tide.”', x: -8, z: -32, value: 55 },
    ],
    quests: [
      {
        id: 'lh_quest_beacon_fuel',
        title: 'Lighthouse Lamp Oil Run',
        requester: 'Keeper Marina',
        category: 'delivery',
        description: 'Rush warm lantern oil across the harbor ice to the Crimson Harbor Lighthouse!',
        targetX: 24,
        targetZ: 16,
        targetRadius: 7.5,
        timeLimitSec: 60,
        rewardLetters: 55,
        dialogueSuccess: '“The crimson beam just pierced the cove fog! Brilliant driving!”',
      },
      {
        id: 'lh_quest_wharf_clear',
        title: 'Cocoa Wharf Opening',
        requester: 'Captain Bram',
        category: 'clearing',
        description: 'Clear the boardwalk snowdrifts around Floating Cocoa Wharf before the evening ferry docks!',
        targetX: -18,
        targetZ: 20,
        targetRadius: 8.0,
        timeLimitSec: 70,
        rewardLetters: 65,
        dialogueSuccess: '“Docklines secured and hot mugs poured for everyone!”',
        requiredClearRatio: 0.68,
      },
      {
        id: 'lh_quest_bottle_rescue',
        title: 'Lost Driftwood Letter',
        requester: 'Poet Celeste',
        category: 'rescue',
        description: 'Recover a sealed love letter trapped in drifts along the northern harbor seawall!',
        targetX: 26,
        targetZ: -14,
        targetRadius: 6.5,
        timeLimitSec: 55,
        rewardLetters: 60,
        dialogueSuccess: '“Not a single drop of seawater touched the ink! Thank you!”',
      },
    ],
    props: {
      chalets: [
        { x: -18, z: -2, rot: 0.4, color: 0x1e3a5f },
        { x: -30, z: 24, rot: 0.9, color: 0x334155 },
        { x: 14, z: -28, rot: -0.5, color: 0x1e3a5f },
        { x: 32, z: -4, rot: 2.1, color: 0x475569 },
        { x: -6, z: 32, rot: 3.1, color: 0x1e3a5f },
        { x: 18, z: 30, rot: -0.8, color: 0x334155 },
      ],
      pines: [
        { x: -10, z: 10, s: 0.9 },
        { x: 12, z: -12, s: 1.0 },
        { x: -28, z: -26, s: 1.2 },
        { x: 30, z: -26, s: 1.1 },
        { x: 8, z: 20, s: 0.85 },
      ],
      snowmen: [
        { x: -6, z: 10 },
        { x: 12, z: 8 },
        { x: -12, z: -14 },
      ],
    },
  },
  {
    id: 'observatory-ridge',
    number: 3,
    name: 'Starlight Observatory Ridge',
    subtitle: 'Aurora Peaks & Crystal Glade',
    description: 'High above the clouds among glowing aurora crystal spires, granite ridge trails, and the copper dome of the Sky Observatory.',
    difficulty: 'Alpine',
    unlockCostLetters: 110,
    snowResistance: 1.25,
    theme: {
      groundPattern: 'granite',
      groundColor: 0x2e2640,
      snowTintHex: 0xf5f3ff,
      accentColor: '#c084fc',
      chaletColor: 0x312e81,
      rimLightHex: 0xa855f7,
    },
    mapFeatures: [
      { id: 'or-plaza', type: 'plaza', label: 'Observatory Terrace', x: 0, z: -24, width: 22, depth: 18, color: '#c084fc', colorHex: 0x3b0764 },
      { id: 'or-glade', type: 'garden', label: 'Aurora Crystal Glade', x: 24, z: -8, width: 20, depth: 20, color: '#34d399', colorHex: 0x064e3b },
      { id: 'or-trail', type: 'road', label: 'Ridge Crest Trail', x: 0, z: 2, width: 10, depth: 62, color: '#a78bfa', colorHex: 0x312e81 },
    ],
    landmarks: [
      {
        id: 'sky-observatory',
        name: 'Solstice Sky Observatory',
        description: 'Clear the terrace dome courtyard so astronomers can align the twin Valentine telescope.',
        x: 0,
        z: -24,
        radius: 7.5,
        requiredClearRatio: 0.72,
        kind: 'observatory',
        coupleCoupleQuotes: ['“Look through the lens—two shooting stars just crossed!”', '“Under a million constellations with you.”'],
      },
      {
        id: 'crystal-overlook',
        name: 'Aurora Crystal Overlook',
        description: 'Sweep the sparkling snow around the singing emerald ice spires.',
        x: 24,
        z: -8,
        radius: 7.5,
        requiredClearRatio: 0.70,
        kind: 'crystal',
        coupleCoupleQuotes: ['“The crystals hum whenever the northern lights ripple!”', '“Pure emerald starlight!”'],
      },
      {
        id: 'summit-lodge',
        name: 'Summit Hearth Lodge',
        description: 'Open the alpine ski lodge doorway to warm stranded stargazers.',
        x: -22,
        z: 14,
        radius: 7,
        requiredClearRatio: 0.70,
        kind: 'bakery',
        coupleCoupleQuotes: ['“Chestnuts roasting and alpine fondue ready at last!”', '“Coziest refuge on the ridge.”'],
      },
      {
        id: 'pine-chapel',
        name: 'Whispering Pine Gazebo',
        description: 'Clear the southern overlook where lovers make solstice wishes.',
        x: 16,
        z: 22,
        radius: 7,
        requiredClearRatio: 0.72,
        kind: 'gazebo',
        coupleCoupleQuotes: ['“Every wish whispered here echoes down the valley!”', '“Forever begins on the snowy ridge.”'],
      },
    ],
    gifts: [
      { id: 'or-gift-1', name: 'Brass Pocket Astrolabe', icon: 'Lock', quote: '“Charts every winter constellation over our heads.”', x: 14, z: -18, value: 40 },
      { id: 'or-gift-2', name: 'Aurora Prism Pendant', icon: 'Flower', quote: '“Splits candlelight into ribbons of violet and green.”', x: -16, z: -12, value: 45 },
      { id: 'or-gift-3', name: 'Stargazer’s Wool Blanket', icon: 'Mitten', quote: '“Wide enough for two beneath the meteor shower.”', x: -10, z: 24, value: 35 },
      { id: 'or-gift-4', name: 'Spiced Alpine Mulled Cider', icon: 'Coffee', quote: '“Infused with star anise and mountain honey.”', x: 26, z: 12, value: 40 },
      { id: 'or-gift-5', name: 'Celestial Chime Box', icon: 'Music', quote: '“Rings in harmony with the solstice midnight bell.”', x: -28, z: -2, value: 50 },
      { id: 'or-gift-6', name: 'Comet-Seal Love Letter', icon: 'Mail', quote: '“Written in silver ink at 9,000 feet.”', x: 2, z: 32, value: 60 },
    ],
    quests: [
      {
        id: 'or_quest_lens_align',
        title: 'Comet Lens Calibration',
        requester: 'Astronomer Lyra',
        category: 'clearing',
        description: 'Clear deep alpine snow off the Solstice Sky Observatory terrace before the comet peaks!',
        targetX: 0,
        targetZ: -24,
        targetRadius: 8.0,
        timeLimitSec: 70,
        rewardLetters: 75,
        dialogueSuccess: '“Shutter open! What a dazzling streak across the northern sky!”',
        requiredClearRatio: 0.7,
      },
      {
        id: 'or_quest_lodge_blankets',
        title: 'Summit Cocoa & Blankets',
        requester: 'Innkeeper Soren',
        category: 'delivery',
        description: 'Deliver warm wool blankets from the ridge trail to Summit Hearth Lodge!',
        targetX: -22,
        targetZ: 14,
        targetRadius: 7.0,
        timeLimitSec: 58,
        rewardLetters: 65,
        dialogueSuccess: '“Everyone by the fireplace is cheering for the Heartplow!”',
      },
      {
        id: 'or_quest_crystal_chime',
        title: 'Crystal Glade Resonance',
        requester: 'Guide Astrid',
        category: 'rescue',
        description: 'Recover a dropped silver tuning fork near the Aurora Crystal Overlook!',
        targetX: 24,
        targetZ: -8,
        targetRadius: 7.0,
        timeLimitSec: 52,
        rewardLetters: 70,
        dialogueSuccess: '“Listen to those emerald spires sing in tune again!”',
      },
    ],
    props: {
      chalets: [
        { x: -24, z: -18, rot: 0.7, color: 0x312e81 },
        { x: 26, z: -26, rot: -0.9, color: 0x3b0764 },
        { x: -30, z: 28, rot: 0.3, color: 0x1e1b4b },
        { x: 28, z: 26, rot: 2.5, color: 0x312e81 },
        { x: -10, z: -32, rot: -0.2, color: 0x3b0764 },
      ],
      pines: [
        { x: -12, z: 6, s: 1.0 },
        { x: 12, z: 8, s: 1.1 },
        { x: -16, z: 28, s: 1.2 },
        { x: 10, z: -12, s: 0.9 },
        { x: 32, z: 4, s: 1.2 },
      ],
      snowmen: [
        { x: 8, z: -14 },
        { x: -10, z: 12 },
      ],
      crystals: [
        { x: 20, z: -14, s: 1.1 },
        { x: 29, z: -4, s: 1.3 },
        { x: 22, z: -2, s: 0.9 },
        { x: -20, z: -24, s: 1.0 },
        { x: 10, z: 28, s: 1.1 },
      ],
    },
  },
  {
    id: 'solstice-palace',
    number: 4,
    name: 'Grand Solstice Palace',
    subtitle: 'Royal Mirror Gardens',
    description: 'Clear ceremonial snowdrifts across marble courtyard avenues, frozen mirror ponds, and candlelit royal pavilions.',
    difficulty: 'Grand',
    unlockCostLetters: 160,
    snowResistance: 1.35,
    theme: {
      groundPattern: 'marble',
      groundColor: 0x4a3b47,
      snowTintHex: 0xfff1f2,
      accentColor: '#fbbf24',
      chaletColor: 0x881337,
      rimLightHex: 0xfbbf24,
    },
    mapFeatures: [
      { id: 'sp-courtyard', type: 'plaza', label: 'Royal Rose Courtyard', x: 0, z: 0, width: 32, depth: 32, color: '#fbbf24', colorHex: 0x523b4e },
      { id: 'sp-pond-e', type: 'water', label: 'Mirror Pond East', x: 24, z: 4, width: 16, depth: 26, color: '#f472b6', colorHex: 0x831843 },
      { id: 'sp-pond-w', type: 'water', label: 'Mirror Pond West', x: -24, z: 4, width: 16, depth: 26, color: '#f472b6', colorHex: 0x831843 },
    ],
    landmarks: [
      {
        id: 'royal-pavilion',
        name: 'Royal Solstice Pavilion',
        description: 'Clear the grand northern steps where the Winter Ball begins at midnight.',
        x: 0,
        z: -24,
        radius: 8,
        requiredClearRatio: 0.74,
        kind: 'fountain',
        coupleCoupleQuotes: ['“The royal chandeliers glow across the marble terrace!”', '“May I have this midnight waltz?”'],
      },
      {
        id: 'mirror-pond-east',
        name: 'Rose Mirror Fountain',
        description: 'Sweep the eastern garden walkway beside the frozen rose-gold mirror lake.',
        x: 24,
        z: 4,
        radius: 7.5,
        requiredClearRatio: 0.72,
        kind: 'gazebo',
        coupleCoupleQuotes: ['“Two golden swans just glided past the frozen fountain!”', '“Like stepping inside a snowglobe.”'],
      },
      {
        id: 'candle-conservatory',
        name: 'Candlelight Conservatory',
        description: 'Clear the western glasshouse courtyard blooming with winter camellias.',
        x: -24,
        z: 4,
        radius: 7.5,
        requiredClearRatio: 0.72,
        kind: 'bakery',
        coupleCoupleQuotes: ['“Warm honey-rose tea inside the glasshouse awaits!”', '“Even in midwinter, the roses bloom.”'],
      },
      {
        id: 'golden-gatehouse',
        name: 'Golden Bell Gatehouse',
        description: 'Open the southern grand boulevard arch leading into the Palace Gardens.',
        x: 0,
        z: 24,
        radius: 8,
        requiredClearRatio: 0.75,
        kind: 'tree',
        coupleCoupleQuotes: ['“Every bell in the palace tower rings for Valentine Valley!”', '“The Grand Solstice shines eternal!”'],
      },
    ],
    gifts: [
      { id: 'sp-gift-1', name: 'Royal Rose-Gold Signet', icon: 'Lock', quote: '“Stamped with the crest of united hearts.”', x: 14, z: -14, value: 50 },
      { id: 'sp-gift-2', name: 'Velvet Masquerade Ribbon', icon: 'Mitten', quote: '“Silk scarlet ribbon left on the pavilion stairs.”', x: -14, z: -14, value: 45 },
      { id: 'sp-gift-3', name: 'Golden Swan Music Box', icon: 'Music', quote: '“Plays the Royal Solstice Finale in pure celesta chords.”', x: 14, z: 16, value: 60 },
      { id: 'sp-gift-4', name: 'Camellia Blossom Elixir', icon: 'Coffee', quote: '“Fragrant warmth brewed in the winter conservatory.”', x: -14, z: 16, value: 50 },
      { id: 'sp-gift-5', name: 'Imperial Wax-Sealed Letter', icon: 'Mail', quote: '“You are the hero of the entire Winter Solstice.”', x: 30, z: -20, value: 70 },
      { id: 'sp-gift-6', name: 'Eternal Solstice Crown Rose', icon: 'Flower', quote: '“A crystallized rose spun from candlelight and frost.”', x: -30, z: -20, value: 80 },
    ],
    quests: [
      {
        id: 'sp_quest_ball_courtyard',
        title: 'Royal Ball Grand Entrance',
        requester: 'Chamberlain Aurelia',
        category: 'clearing',
        description: 'Clear ceremonial snow from the Royal Solstice Pavilion steps before the orchestra strikes midnight!',
        targetX: 0,
        targetZ: -24,
        targetRadius: 8.5,
        timeLimitSec: 75,
        rewardLetters: 90,
        dialogueSuccess: '“The brass fanfare echoes! The Winter Solstice Ball is officially open!”',
        requiredClearRatio: 0.72,
      },
      {
        id: 'sp_quest_tea_delivery',
        title: 'Conservatory Rose Tea Express',
        requester: 'Botanist Fleur',
        category: 'delivery',
        description: 'Carry freshly steeped camellia tea from the Conservatory to the Rose Mirror Fountain!',
        targetX: 24,
        targetZ: 4,
        targetRadius: 7.5,
        timeLimitSec: 55,
        rewardLetters: 80,
        dialogueSuccess: '“Still steaming with rose petals—the royal guests are delighted!”',
      },
      {
        id: 'sp_quest_crown_keepsake',
        title: 'Missing Signet Recovery',
        requester: 'Prince Julian',
        category: 'rescue',
        description: 'Find the dropped Royal Rose-Gold Signet buried in deep palace courtyard drifts!',
        targetX: 14,
        targetZ: -14,
        targetRadius: 6.5,
        timeLimitSec: 50,
        rewardLetters: 85,
        dialogueSuccess: '“You found it in seconds! Tonight’s proposal can go ahead after all!”',
      },
    ],
    props: {
      chalets: [
        { x: -24, z: -24, rot: 0.8, color: 0x881337 },
        { x: 24, z: -24, rot: -0.8, color: 0x881337 },
        { x: -28, z: 24, rot: 2.3, color: 0x9f1239 },
        { x: 28, z: 24, rot: -2.3, color: 0x9f1239 },
      ],
      pines: [
        { x: -12, z: -12, s: 1.0 },
        { x: 12, z: -12, s: 1.0 },
        { x: -12, z: 12, s: 1.0 },
        { x: 12, z: 12, s: 1.0 },
        { x: 34, z: -8, s: 1.2 },
        { x: -34, z: -8, s: 1.2 },
      ],
      snowmen: [
        { x: -8, z: 8 },
        { x: 8, z: -8 },
      ],
      crystals: [
        { x: 20, z: -16, s: 1.1 },
        { x: -20, z: -16, s: 1.1 },
        { x: 20, z: 18, s: 1.0 },
        { x: -20, z: 18, s: 1.0 },
      ],
    },
  },
];

export const WORLD_SIZE = 96; // 96x96 meter village area
export const SNOW_GRID_RES = 96; // 1 meter per snow cell
