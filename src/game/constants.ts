/**
 * Game constants, upgrade definitions, collectibles, and balance parameters
 */

export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GARAGE' | 'VICTORY' | 'SCRAPBOOK' | 'SETTINGS' | 'PHOTO' | 'PHOTO_MODE' | 'DISPATCH';

export interface TractorSkin {
  id: string;
  name: string;
  desc: string;
  paintColor: number; // Hex
  cabinRoofColor: number;
  trimColor: number;
  unlockCost: number; // In love letters
  tag: string;
}

export const TRACTOR_SKINS: TractorSkin[] = [
  {
    id: 'classic-crimson',
    name: 'Classic Solstice Crimson',
    desc: 'The iconic Valentine Valley red finish with gold brass trim.',
    paintColor: 0xbe123c,
    cabinRoofColor: 0x991b1b,
    trimColor: 0xf59e0b,
    unlockCost: 0,
    tag: 'Default',
  },
  {
    id: 'emerald-evergreen',
    name: 'Nordic Emerald Frost',
    desc: 'Deep alpine pine green with frosty pearl silver detailing.',
    paintColor: 0x065f46,
    cabinRoofColor: 0x064e3b,
    trimColor: 0xe2e8f0,
    unlockCost: 45,
    tag: 'Alpine',
  },
  {
    id: 'midnight-aurora',
    name: 'Midnight Aurora Violet',
    desc: 'Luminous starlight amethyst with glowing celestial accents.',
    paintColor: 0x581c87,
    cabinRoofColor: 0x3b0764,
    trimColor: 0x38bdf8,
    unlockCost: 80,
    tag: 'Starlight',
  },
  {
    id: 'golden-hearth',
    name: 'Golden Solstice Hearth',
    desc: 'Radiant honey amber and polished warm bronze for festive plowing.',
    paintColor: 0xd97706,
    cabinRoofColor: 0x92400e,
    trimColor: 0xfef08a,
    unlockCost: 120,
    tag: 'Festive',
  },
  {
    id: 'rose-quartz',
    name: 'Sweetheart Rose Quartz',
    desc: 'Blushing blossom pink with sweet sugar trim.',
    paintColor: 0xf43f5e,
    cabinRoofColor: 0xbe123c,
    trimColor: 0xfdf2f8,
    unlockCost: 65,
    tag: 'Romantic',
  },
];

export interface VillageDispatch {
  id: string;
  title: string;
  caller: string;
  description: string;
  x: number;
  z: number;
  radius: number;
  requiredClearRatio: number;
  rewardLetters: number;
  timeLimitSec?: number;
  icon: string;
}

export const VILLAGE_DISPATCHES: VillageDispatch[] = [
  {
    id: 'dispatch-doctor',
    title: 'Clinic Medicine Lane Emergency',
    caller: 'Nurse Clara · Valentine Valley Clinic',
    description: 'Drifting powder has sealed the clinic delivery route! Clear the North Alley so essential winter warmth supplies can reach our patients.',
    x: -12,
    z: -4,
    radius: 6.0,
    requiredClearRatio: 0.70,
    rewardLetters: 45,
    icon: 'HeartPulse',
  },
  {
    id: 'dispatch-baker',
    title: 'Warm Cinnamon Flour Supply',
    caller: 'Master Baker Julien · Cinnamon Bakery',
    description: 'The morning solstice flour sleigh is stuck on the East Ridge incline! Shovel the slope so the village can have fresh ginger buns.',
    x: 18,
    z: 16,
    radius: 6.5,
    requiredClearRatio: 0.65,
    rewardLetters: 50,
    icon: 'Croissant',
  },
  {
    id: 'dispatch-gazebo-lights',
    title: 'Festival Fairy Lights Wire Repair',
    caller: 'Electrician Mateo · Solstice Festival Committee',
    description: 'High winds toppled snow over the underground lighting junction near the fountain. Plow the access circle before the evening ceremony!',
    x: 4,
    z: 12,
    radius: 5.5,
    requiredClearRatio: 0.75,
    rewardLetters: 55,
    icon: 'Sparkles',
  },
  {
    id: 'dispatch-lovers-kiss',
    title: 'Romantic Starlight Overlook',
    caller: 'Postman Leo · Valentine Valley Mail',
    description: 'A couple is stranded at the Western Overlook trying to watch the twilight aurora! Plow their romantic retreat path.',
    x: -28,
    z: -10,
    radius: 6.0,
    requiredClearRatio: 0.70,
    rewardLetters: 60,
    icon: 'Compass',
  },
];

export interface RadioStation {
  id: string;
  freq: string;
  name: string;
  genre: string;
  description: string;
}

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'val-classic',
    freq: '94.3 FM',
    name: 'Valentine Valley Harmonies',
    genre: 'Retro Solstice Wurlitzer & Strings',
    description: 'Warm analog chords and soft nostalgic winter ballads broadcast across the snowcapped pines.',
  },
  {
    id: 'cozy-lofi',
    freq: '101.8 FM',
    name: 'Fireside Hearth Lofi',
    genre: 'Gentle Beats & Amber Chords',
    description: 'Subtle rhythmic warmth to accompany the meditative hum of the snowplow engine.',
  },
  {
    id: 'aurora-ambient',
    freq: '107.5 FM',
    name: 'Northern Aurora Skywaves',
    genre: 'Ethereal Winter Dreamscape',
    description: 'Deep resonant crystal pads inspired by the dancing emerald lights above the valley.',
  },
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
];

export const WORLD_SIZE = 96; // 96x96 meter village area
export const SNOW_GRID_RES = 96; // 1 meter per snow cell
