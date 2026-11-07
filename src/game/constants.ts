/**
 * Game constants, upgrade definitions, collectibles, and balance parameters
 */

export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GARAGE' | 'VICTORY' | 'SCRAPBOOK' | 'SETTINGS' | 'PHOTO' | 'DISPATCH_RADIO' | 'WINTER_PASS';

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
];

export const WORLD_SIZE = 96; // 96x96 meter village area
export const SNOW_GRID_RES = 96; // 1 meter per snow cell
