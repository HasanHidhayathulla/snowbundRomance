/**
 * Core 3D Game Engine for Snowbound Hearts
 * Isometric snow-plowing simulation with procedural PBR, combo multipliers,
 * hitstop, camera shake, vehicle kinematics, and low-occlusion HUD integration.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { synthAudio } from '../audio/synthAudio';
import {
  ACHIEVEMENTS,
  COMBO_LEVELS,
  LANDMARKS,
  LEVEL_MAPS,
  RADIO_STATIONS,
  ROMANTIC_GIFTS,
  SOLSTICE_QUESTS,
  TRACTOR_DECALS,
  TRACTOR_PAINTS,
  UPGRADES,
  WEATHER_CONDITIONS,
  WINTER_PASS_TIERS,
  WORLD_SIZE,
  getDailyChallengeForDate,
  getUtcDayKey,
  type DailyRomanticChallenge,
  type GameState,
  type Landmark,
  type LevelMapConfig,
  type RadioStation,
  type RomanticGift,
  type SolsticeQuest,
  type TractorDecal,
  type TractorPaint,
  type WeatherCondition,
  type WeatherType,
  type WinterPassTier,
} from './constants';
import {
  loadGameProgress,
  saveGameProgress,
  loadGameSettings,
  saveGameSettings,
  type SolsticeAtmosphere,
} from './storage';
import {
  createChalet,
  createCollectibleGift,
  createCoupleModel,
  createCrystalSpireCluster,
  createGazebo,
  createGrandSolsticeTree,
  createHeartPlowTractor,
  createLighthouse,
  createMarbleFountain,
  createObservatoryDome,
  createSnowman,
  createSnowPine,
  createStreetlamp,
  materials,
} from './models';
import { ParticleSystem } from './particleSystem';
import { SnowGridSystem } from './snowGrid';

export interface ActiveQuestState {
  quest: SolsticeQuest;
  remainingSec: number;
  distanceToTarget: number;
  progressPercent: number;
}

export interface DailyChallengeStep {
  id: string;
  label: string;
  x: number;
  z: number;
  completed: boolean;
}

export interface DailyChallengeStatus {
  challenge: DailyRomanticChallenge;
  dayKey: string;
  msUntilReset: number;
  steps: DailyChallengeStep[];
  completedCount: number;
  totalCount: number;
  completed: boolean;
}

export interface GameHUDStats {
  gameState: GameState;
  snowClearedPercent: number;
  loveLetters: number;
  comboLevel: number;
  comboMultiplier: number;
  comboTitle: string;
  comboClipTitle: string | null;
  comboTimerProgress: number; // 0 to 1
  boostPercent: number;
  speedKmh: number;
  landmarksCleared: number;
  totalLandmarks: number;
  giftsFound: number;
  totalGifts: number;
  lastEventMessage: string | null;
  upgrades: Record<string, number>;
  playerX: number;
  playerZ: number;
  heading: number;
  landmarks: Landmark[];
  gifts: RomanticGift[];
  unlockedAchievementIds: string[];
  atmosphere: SolsticeAtmosphere;
  radioStationId: string;
  radioStationName: string;
  activeQuest: ActiveQuestState | null;
  completedQuestIds: string[];
  selectedPaintId: string;
  unlockedPaintIds: string[];
  selectedDecalId: string;
  unlockedDecalIds: string[];
  weather: WeatherCondition;
  weatherCycleTimeLeft: number;
  winterPassXp: number;
  winterPassLevel: number;
  claimedPassTierIds: number[];
  unclaimedPassRewardsCount: number;
  dailyChallenge: DailyChallengeStatus;
  currentLevel: LevelMapConfig;
  unlockedLevelIds: string[];
  completedLevelIds: string[];
  availableQuests: SolsticeQuest[];
}

import {
  generatePostcardDataUrl,
  type CompositePostcardOptions,
} from './photoCapture';

export class SnowPlowGameEngine {
  public container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean = false;
  private frameId: number = 0;
  private isDisposed: boolean = false;

  // Game Subsystems
  private snowGrid!: SnowGridSystem;
  private particles!: ParticleSystem;

  // Hero Vehicle
  private tractorGroup!: THREE.Group;
  private plowBladeGroup!: THREE.Group;
  private frontWheels: THREE.Group[] = [];
  private rearWheels: THREE.Group[] = [];
  private exhaustStack!: THREE.Mesh;
  private headlampL!: THREE.SpotLight;
  private headlampR!: THREE.SpotLight;
  private tractorBodyMesh!: THREE.Mesh;
  private tractorRoofMesh!: THREE.Mesh;
  private tractorEmblemMesh!: THREE.Mesh;
  private comboFlashLight!: THREE.PointLight;

  // Lighting References for Atmosphere
  private hemiLight!: THREE.HemisphereLight;
  private sunLight!: THREE.DirectionalLight;
  private rimLight!: THREE.DirectionalLight;
  private atmosphere: SolsticeAtmosphere = 'twilight';

  // Vehicle Physics State
  private posX: number = 0;
  private posZ: number = 0;
  private heading: number = Math.PI; // radians (facing forward)
  private speed: number = 0;
  private steerAngle: number = 0;
  private boostFuel: number = 100;
  private isBoosting: boolean = false;
  private isPlowing: boolean = false;

  // Input State
  private keysHeld: Record<string, boolean> = {};
  private virtualThrottle: number = 0; // -1 to 1
  private virtualSteer: number = 0; // -1 to 1
  private virtualBoost: boolean = false;

  // Combo & Progression State
  private comboLevel: number = 1;
  private comboTimer: number = 0;
  private comboClipTitle: string | null = null;
  private comboClipTimer: number = 0;
  private comboEncoreCount: number = 0;
  private snowClearedAccumulator: number = 0;
  private snowClearedPercent: number = 0;
  private loveLetters: number = 20;
  private upgrades: Record<string, number> = {
    bladeWidth: 1,
    thermalLantern: 1,
    steamBoost: 1,
    loveMagnet: 1,
    comboTimer: 1,
  };
  private unlockedAchievementIds: string[] = [];

  // Quests & Radio & Livery State
  private radioStationId: string = 'val-classic';
  private activeQuest: ActiveQuestState | null = null;
  private completedQuestIds: string[] = [];
  private selectedPaintId: string = 'crimson';
  private unlockedPaintIds: string[] = ['crimson'];
  private selectedDecalId: string = 'heart';
  private unlockedDecalIds: string[] = ['heart'];
  private questBeaconGroup!: THREE.Group;

  // Weather & Winter Pass State
  private currentWeatherType: WeatherType = 'gentle_flurry';
  private weatherCycleTimer: number = 75;
  private winterPassXp: number = 0;
  private claimedPassTierIds: number[] = [];
  private blizzardContinuousTimer: number = 0;

  // Daily Romantic Challenge State (rotates every 24h UTC)
  private dailyChallenge!: DailyRomanticChallenge;
  private dailyDayKey: string = '';
  private dailyCompletedStepIds: string[] = [];
  private dailyCompleted: boolean = false;
  private dailyGuideGroup!: THREE.Group;
  private dailyStepMeshes: Map<string, THREE.Group> = new Map();
  private dailySyncTimer: number = 0;

  // Level & Map Progression
  private currentLevel: LevelMapConfig = LEVEL_MAPS[0];
  private unlockedLevelIds: string[] = ['valentine-valley'];
  private completedLevelIds: string[] = [];
  private worldGroup: THREE.Group = new THREE.Group();

  // World Elements
  private landmarks: Landmark[] = [];
  private landmarkMeshes: Map<string, THREE.Group> = new Map();
  private coupleMeshes: Map<string, THREE.Group> = new Map();
  private gifts: RomanticGift[] = [];
  private giftMeshes: Map<string, THREE.Group> = new Map();

  // Camera & Screen Feel
  private targetCameraPos = new THREE.Vector3();
  private cameraShakeIntensity: number = 0;
  private hitstopDuration: number = 0;
  private squashStretchY: number = 1;

  // HUD Callback
  private onHUDUpdate: ((stats: GameHUDStats) => void) | null = null;
  private lastHUDPushTime: number = 0;
  private lastEventMessage: string | null = null;
  private messageClearTimer: number = 0;

  // Active Game State
  private gameState: GameState = 'TITLE';
  private hasTriggeredVictory: boolean = false;

  constructor(container: HTMLElement, onHUDUpdate?: (stats: GameHUDStats) => void) {
    this.container = container;
    this.onHUDUpdate = onHUDUpdate || null;

    // Load saved progress
    const saved = loadGameProgress();
    this.loveLetters = saved.loveLetters || 20;
    this.upgrades = { ...this.upgrades, ...saved.upgrades };
    this.unlockedAchievementIds = [...(saved.unlockedAchievementIds || [])];

    // Load level progression
    this.unlockedLevelIds =
      saved.unlockedLevelIds && saved.unlockedLevelIds.length > 0
        ? [...new Set(['valentine-valley', ...saved.unlockedLevelIds])]
        : ['valentine-valley'];
    this.completedLevelIds = [...(saved.completedLevelIds || [])];
    const savedLevel = LEVEL_MAPS.find((l) => l.id === saved.currentLevelId);
    if (savedLevel && this.unlockedLevelIds.includes(savedLevel.id)) {
      this.currentLevel = savedLevel;
    } else {
      this.currentLevel = LEVEL_MAPS[0];
    }

    // Load saved settings
    const settings = loadGameSettings();
    this.atmosphere = settings.atmosphere || 'twilight';
    this.radioStationId = settings.radioStationId || 'val-classic';
    const levelSave = saved.levelProgress?.[this.currentLevel.id];
    this.completedQuestIds = levelSave
      ? [...(levelSave.completedQuestIds || [])]
      : this.currentLevel.id === 'valentine-valley'
      ? [...(saved.completedQuestIds || [])]
      : [];
    this.unlockedPaintIds = saved.unlockedPaintIds || ['crimson'];
    this.selectedPaintId = saved.selectedPaintId || 'crimson';
    this.unlockedDecalIds = saved.unlockedDecalIds || ['heart'];
    this.selectedDecalId = saved.selectedDecalId || 'heart';
    this.winterPassXp = saved.winterPassXp || 0;
    this.claimedPassTierIds = saved.claimedPassTierIds || [];

    this.initWebGL();
    this.initScene();
    this.applyAtmosphere(this.atmosphere);
    this.initWorldEntities();
    this.initDailyChallenge();
    this.setupEventListeners();
    this.pushHUDUpdate();
    this.startLoop();
  }

  private initWebGL() {
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    this.container.appendChild(this.renderer.domElement);
  }

  private initScene() {
    this.scene = new THREE.Scene();

    // Romantic Winter Twilight Atmosphere: deep navy horizon with soft amethyst blush
    const skyColor = new THREE.Color(0x0c1322);
    this.scene.background = skyColor;
    this.scene.fog = new THREE.FogExp2(0x0e172a, 0.016);

    // Studio Environment Reflections via RoomEnvironment
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 1. Isometric Perspective Camera (Classic 45° angle)
    const aspect = (this.container.clientWidth || window.innerWidth) / (this.container.clientHeight || window.innerHeight);
    this.camera = new THREE.PerspectiveCamera(40, aspect, 1, 300);
    this.camera.position.set(24, 28, 28);
    this.camera.lookAt(0, 0, 0);

    // 2. Lighting Rig
    // Cool Winter Ambient Fill
    this.hemiLight = new THREE.HemisphereLight(0xbfdbfe, 0x1e293b, 0.9);
    this.scene.add(this.hemiLight);

    // Warm Golden Key Light (Low winter sun casting long shadows)
    this.sunLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    this.sunLight.position.set(40, 55, 30);
    if (!this.isSoftwareGl) {
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.width = 2048;
      this.sunLight.shadow.mapSize.height = 2048;
      this.sunLight.shadow.camera.near = 10;
      this.sunLight.shadow.camera.far = 130;
      const d = 45;
      this.sunLight.shadow.camera.left = -d;
      this.sunLight.shadow.camera.right = d;
      this.sunLight.shadow.camera.top = d;
      this.sunLight.shadow.camera.bottom = -d;
      this.sunLight.shadow.bias = -0.0004;
      this.sunLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.sunLight);

    // Soft Romantic Violet Rim Fill
    this.rimLight = new THREE.DirectionalLight(0xf472b6, 0.6);
    this.rimLight.position.set(-35, 25, -35);
    this.scene.add(this.rimLight);

    // 3. Subsystems
    this.snowGrid = new SnowGridSystem(this.scene);
    this.particles = new ParticleSystem(this.scene);

    // Load persistent progress if available
    const saved = loadGameProgress();
    if (saved) {
      if (typeof saved.loveLetters === 'number') this.loveLetters = saved.loveLetters;
      if (saved.upgrades) this.upgrades = { ...this.upgrades, ...saved.upgrades };
    }

    // 4. Hero Tractor
    const currentPaint = TRACTOR_PAINTS.find((p) => p.id === this.selectedPaintId) || TRACTOR_PAINTS[0];
    const currentDecal = TRACTOR_DECALS.find((d) => d.id === this.selectedDecalId) || TRACTOR_DECALS[0];

    const tractorData = createHeartPlowTractor(currentPaint.colorHex, currentDecal.colorHex);
    this.tractorGroup = tractorData.group;
    this.plowBladeGroup = tractorData.plowGroup;
    this.frontWheels = tractorData.wheelsFront;
    this.rearWheels = tractorData.wheelsRear;
    this.exhaustStack = tractorData.exhaustStack;
    this.headlampL = tractorData.headlightL;
    this.headlampR = tractorData.headlightR;
    this.tractorBodyMesh = tractorData.bodyMesh;
    this.tractorRoofMesh = tractorData.roofMesh;
    this.tractorEmblemMesh = tractorData.emblemMesh;

    this.tractorGroup.position.set(0, 0, 0);
    this.comboFlashLight = new THREE.PointLight(0xf472b6, 0, 14, 1.6);
    this.comboFlashLight.position.set(0, 2.2, 0);
    this.tractorGroup.add(this.comboFlashLight);
    this.scene.add(this.tractorGroup);

    // 5. Waypoint / Quest Beacon Mesh & World Props Group
    this.initQuestBeacon();
    this.scene.add(this.worldGroup);

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }
  }

  private initQuestBeacon() {
    this.questBeaconGroup = new THREE.Group();
    this.questBeaconGroup.visible = false;

    // Glowing pulsating ring on the snow
    const ringGeo = new THREE.RingGeometry(2.8, 3.2, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.12;
    this.questBeaconGroup.add(ringMesh);

    // Floating vertical beacon cylinder / column
    const cylGeo = new THREE.CylinderGeometry(0.35, 1.8, 6.0, 16, 1, true);
    const cylMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const cyl = new THREE.Mesh(cylGeo, cylMat);
    cyl.position.y = 3.0;
    this.questBeaconGroup.add(cyl);

    // Floating diamond insignia at top
    const octaGeo = new THREE.OctahedronGeometry(0.7, 0);
    const octaMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    });
    const diamond = new THREE.Mesh(octaGeo, octaMat);
    diamond.position.y = 6.2;
    this.questBeaconGroup.add(diamond);

    this.scene.add(this.questBeaconGroup);
  }

  private clearWorldGroup() {
    const sharedMats = new Set<THREE.Material>(Object.values(materials));
    this.worldGroup.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => {
            if (!sharedMats.has(m)) m.dispose();
          });
        } else if (!sharedMats.has(mesh.material)) {
          mesh.material.dispose();
        }
      }
    });
    this.worldGroup.clear();
    this.landmarkMeshes.clear();
    this.coupleMeshes.clear();
    this.giftMeshes.clear();
  }

  private initWorldEntities() {
    this.clearWorldGroup();

    const level = this.currentLevel;

    // Configure Ground Texture & Snow Tint for this region
    this.snowGrid.configureMapTheme(
      level.theme.groundPattern,
      level.theme.groundColor,
      level.theme.snowTintHex
    );

    if (this.rimLight && this.atmosphere === 'twilight') {
      this.rimLight.color.setHex(level.theme.rimLightHex);
    }

    // 0. Terrain Feature Decals (Frozen waterways, plazas, avenues, glades)
    level.mapFeatures.forEach((zone) => {
      const geo = new THREE.PlaneGeometry(zone.width, zone.depth);
      geo.rotateX(-Math.PI / 2);
      const isWater = zone.type === 'water';
      const mat = new THREE.MeshStandardMaterial({
        color: zone.colorHex,
        roughness: isWater ? 0.14 : 0.72,
        metalness: isWater ? 0.45 : 0.08,
        emissive: isWater ? zone.colorHex : 0x000000,
        emissiveIntensity: isWater ? 0.18 : 0,
      });
      const pad = new THREE.Mesh(geo, mat);
      pad.position.set(zone.x, isWater ? 0.02 : 0.015, zone.z);
      pad.receiveShadow = true;
      this.worldGroup.add(pad);
    });

    // 1. Natural Mountain / Pine Perimeter to avoid floating void box
    for (let i = 0; i < 48; i++) {
      const angle = (i / 48) * Math.PI * 2;
      const r = (WORLD_SIZE / 2) - 1.5 + (Math.sin(i * 3) * 2.5);
      const px = Math.cos(angle) * r;
      const pz = Math.sin(angle) * r;
      const pine = createSnowPine(1.2 + Math.random() * 0.7);
      pine.position.set(px, 0, pz);
      pine.rotation.y = Math.random() * Math.PI * 2;
      this.worldGroup.add(pine);
    }

    // 2. Region Chalets & Streetlamps
    level.props.chalets.forEach((c) => {
      const house = createChalet(c.color);
      house.position.set(c.x, 0, c.z);
      house.rotation.y = c.rot;
      this.worldGroup.add(house);

      const { group: lamp } = createStreetlamp();
      lamp.position.set(c.x + 3.6, 0, c.z + 3.6);
      this.worldGroup.add(lamp);
    });

    // 3. Scattered Festive Evergreens, Snowmen & Crystal Spires
    level.props.pines.forEach((p) => {
      const pine = createSnowPine(p.s);
      pine.position.set(p.x, 0, p.z);
      this.worldGroup.add(pine);
    });

    level.props.snowmen.forEach((sp) => {
      const sm = createSnowman();
      sm.position.set(sp.x, 0, sp.z);
      sm.rotation.y = Math.random() * Math.PI * 2;
      this.worldGroup.add(sm);
    });

    if (level.props.crystals) {
      level.props.crystals.forEach((cr) => {
        const spire = createCrystalSpireCluster(cr.s);
        spire.position.set(cr.x, 0, cr.z);
        this.worldGroup.add(spire);
      });
    }

    // 4. Region Landmarks & Saved Progress
    const saved = loadGameProgress();
    const levelSave = saved?.levelProgress?.[level.id];
    const savedClearedIds = new Set(
      levelSave
        ? levelSave.clearedLandmarkIds || []
        : level.id === 'valentine-valley'
        ? saved?.clearedLandmarkIds || []
        : []
    );
    const savedGiftIds = new Set(
      levelSave
        ? levelSave.unlockedGiftIds || []
        : level.id === 'valentine-valley'
        ? saved?.unlockedGiftIds || []
        : []
    );
    this.completedQuestIds = levelSave
      ? [...(levelSave.completedQuestIds || [])]
      : level.id === 'valentine-valley'
      ? [...(saved?.completedQuestIds || [])]
      : [];

    this.landmarks = level.landmarks.map((lm) => ({
      ...lm,
      cleared: savedClearedIds.has(lm.id),
    }));
    this.hasTriggeredVictory = this.landmarks.length > 0 && this.landmarks.every((l) => l.cleared);

    this.landmarks.forEach((lm) => {
      let landmarkMesh: THREE.Group;
      if (lm.kind === 'tree' || lm.id === 'town-square') {
        landmarkMesh = createGrandSolsticeTree();
        const gazebo = createGazebo();
        gazebo.position.set(-6, 0, 4);
        landmarkMesh.add(gazebo);
      } else if (lm.kind === 'bakery' || lm.id === 'bakery') {
        landmarkMesh = createChalet(level.theme.chaletColor);
        const { group: lamp } = createStreetlamp();
        lamp.position.set(3, 0, 3);
        landmarkMesh.add(lamp);
      } else if (lm.kind === 'lighthouse') {
        landmarkMesh = createLighthouse();
      } else if (lm.kind === 'observatory') {
        landmarkMesh = createObservatoryDome();
      } else if (lm.kind === 'crystal') {
        landmarkMesh = createCrystalSpireCluster(1.4);
      } else if (lm.kind === 'fountain') {
        landmarkMesh = createMarbleFountain();
      } else {
        landmarkMesh = createGazebo();
      }

      landmarkMesh.position.set(lm.x, 0, lm.z);
      this.worldGroup.add(landmarkMesh);
      this.landmarkMeshes.set(lm.id, landmarkMesh);

      // Reunited couple
      const couple = createCoupleModel();
      couple.position.set(lm.x + 1.8, 0, lm.z + 1.8);
      couple.visible = lm.cleared;
      this.worldGroup.add(couple);
      this.coupleMeshes.set(lm.id, couple);
    });

    // 5. Buried Romantic Collectibles for this level
    this.gifts = level.gifts.map((g) => ({
      ...g,
      collected: savedGiftIds.has(g.id),
    }));
    this.gifts.forEach((g) => {
      const giftGroup = createCollectibleGift();
      giftGroup.position.set(g.x, 0.4, g.z);
      giftGroup.visible = !g.collected;
      this.worldGroup.add(giftGroup);
      this.giftMeshes.set(g.id, giftGroup);
    });
  }

  private initDailyChallenge(isRollover: boolean = false) {
    const { challenge, dayKey } = getDailyChallengeForDate();
    this.dailyChallenge = challenge;
    this.dailyDayKey = dayKey;

    const saved = loadGameProgress();
    const savedDaily = saved.dailyChallenge;
    if (!isRollover && savedDaily && savedDaily.dayKey === dayKey && savedDaily.challengeId === challenge.id) {
      this.dailyCompletedStepIds = [...(savedDaily.completedStepIds || [])];
      this.dailyCompleted = Boolean(savedDaily.completed);
    } else {
      this.dailyCompletedStepIds = [];
      this.dailyCompleted = false;
      saveGameProgress({
        dailyChallenge: {
          dayKey,
          challengeId: challenge.id,
          completedStepIds: [],
          completed: false,
        },
      });
      if (isRollover) {
        this.triggerMessage(`New Daily Romantic Challenge: "${challenge.title}" (+${challenge.rewardLetters} Letters)`);
      }
    }

    this.buildDailyGuideMeshes();
  }

  private getDailyChallengeSteps(): DailyChallengeStep[] {
    if (this.dailyChallenge.category === 'snow_pattern' && this.dailyChallenge.patternPoints) {
      return this.dailyChallenge.patternPoints.map((pt) => ({
        id: pt.id,
        label: pt.label,
        x: pt.x,
        z: pt.z,
        completed: this.dailyCompletedStepIds.includes(pt.id),
      }));
    }

    const reqIds = this.dailyChallenge.requiredLandmarkIds || [];
    const activeLandmarks = this.currentLevel.landmarks;
    return reqIds
      .map((lmId, idx) => {
        const direct = activeLandmarks.find((l) => l.id === lmId);
        if (direct) return direct;
        const baseIdx = LANDMARKS.findIndex((l) => l.id === lmId);
        return activeLandmarks[(baseIdx >= 0 ? baseIdx : idx) % activeLandmarks.length];
      })
      .filter((lm): lm is NonNullable<typeof lm> => Boolean(lm))
      .map((lm) => ({
        id: lm.id,
        label: lm.name,
        x: lm.x,
        z: lm.z,
        completed: this.dailyCompletedStepIds.includes(lm.id),
      }));
  }

  private buildDailyGuideMeshes() {
    if (this.dailyGuideGroup) {
      this.scene.remove(this.dailyGuideGroup);
      this.dailyGuideGroup.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        const mat = (obj as THREE.Mesh).material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat) mat.dispose();
      });
    }

    this.dailyGuideGroup = new THREE.Group();
    this.dailyStepMeshes.clear();

    const steps = this.getDailyChallengeSteps();
    if (this.dailyCompleted || steps.length === 0) {
      this.dailyGuideGroup.visible = false;
      this.scene.add(this.dailyGuideGroup);
      return;
    }

    // For snow patterns, trace a subtle glowing rose-gold guide loop on the snow
    if (this.dailyChallenge.category === 'snow_pattern' && steps.length >= 2) {
      const linePts = steps.map((s) => new THREE.Vector3(s.x, 0.08, s.z));
      if (this.dailyChallenge.patternName !== 'Infinity Waltz') {
        linePts.push(new THREE.Vector3(steps[0].x, 0.08, steps[0].z));
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xf472b6,
        transparent: true,
        opacity: 0.45,
      });
      const guideLine = new THREE.Line(lineGeo, lineMat);
      this.dailyGuideGroup.add(guideLine);
    }

    steps.forEach((step) => {
      const markerGroup = new THREE.Group();
      markerGroup.position.set(step.x, 0, step.z);
      markerGroup.visible = !step.completed;

      const ringGeo = new THREE.RingGeometry(1.5, 1.95, 28);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xfb7185,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.78,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.09;
      markerGroup.add(ring);

      const gemGeo = new THREE.OctahedronGeometry(0.42, 0);
      const gemMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xe11d48,
        emissiveIntensity: 1.1,
        roughness: 0.2,
      });
      const gem = new THREE.Mesh(gemGeo, gemMat);
      gem.position.y = 2.4;
      markerGroup.add(gem);

      this.dailyGuideGroup.add(markerGroup);
      this.dailyStepMeshes.set(step.id, markerGroup);
    });

    this.scene.add(this.dailyGuideGroup);
  }

  private getDailyChallengeStatus(): DailyChallengeStatus {
    const { msUntilReset } = getDailyChallengeForDate();
    const steps = this.getDailyChallengeSteps();
    const completedCount = steps.filter((s) => s.completed).length;
    return {
      challenge: this.dailyChallenge,
      dayKey: this.dailyDayKey,
      msUntilReset,
      steps,
      completedCount,
      totalCount: steps.length,
      completed: this.dailyCompleted,
    };
  }

  private updateDailyChallengeProgress(dt: number, bladeWorldX: number, bladeWorldZ: number) {
    // Check 24h UTC rollover periodically
    this.dailySyncTimer += dt;
    if (this.dailySyncTimer >= 2.0) {
      this.dailySyncTimer = 0;
      if (getUtcDayKey() !== this.dailyDayKey) {
        this.initDailyChallenge(true);
        this.pushHUDUpdate();
        return;
      }
    }

    if (this.dailyCompleted) return;

    // Animate visible step markers
    const nowSec = performance.now() * 0.004;
    let idx = 0;
    this.dailyStepMeshes.forEach((group) => {
      if (group.visible) {
        const gem = group.children[1];
        if (gem) {
          gem.position.y = 2.4 + Math.sin(nowSec + idx * 0.8) * 0.25;
          gem.rotation.y += 1.6 * dt;
        }
      }
      idx++;
    });

    const steps = this.getDailyChallengeSteps();
    let changed = false;

    for (const step of steps) {
      if (step.completed) continue;

      let stepReached = false;
      if (this.dailyChallenge.category === 'landmark_visit') {
        const lm = this.currentLevel.landmarks.find((l) => l.id === step.id);
        const visitRadius = (lm ? lm.radius : 6.5) + 1.5;
        const dist = Math.hypot(step.x - this.posX, step.z - this.posZ);
        stepReached = dist <= visitRadius;
      } else {
        const distTractor = Math.hypot(step.x - this.posX, step.z - this.posZ);
        const distBlade = Math.hypot(step.x - bladeWorldX, step.z - bladeWorldZ);
        stepReached = Math.min(distTractor, distBlade) <= 3.3 && Math.abs(this.speed) > 0.25;
      }

      if (stepReached) {
        this.dailyCompletedStepIds.push(step.id);
        const marker = this.dailyStepMeshes.get(step.id);
        if (marker) marker.visible = false;
        this.particles.emitRomanticHearts(step.x, 1.2, step.z, 12);
        changed = true;
      }
    }

    if (!changed) return;

    const updatedSteps = this.getDailyChallengeSteps();
    const doneCount = updatedSteps.filter((s) => s.completed).length;

    if (doneCount >= updatedSteps.length && updatedSteps.length > 0) {
      this.dailyCompleted = true;
      if (this.dailyGuideGroup) this.dailyGuideGroup.visible = false;

      this.loveLetters += this.dailyChallenge.rewardLetters;
      this.addWinterPassXp(this.dailyChallenge.rewardPassXp);
      const prevCount = loadGameProgress().dailyChallengesCompletedCount || 0;

      saveGameProgress({
        loveLetters: this.loveLetters,
        dailyChallengesCompletedCount: prevCount + 1,
        dailyChallenge: {
          dayKey: this.dailyDayKey,
          challengeId: this.dailyChallenge.id,
          completedStepIds: [...this.dailyCompletedStepIds],
          completed: true,
        },
      });

      this.checkAchievement('daily_devotion');
      synthAudio.playLandmarkReunion();
      this.particles.emitRomanticHearts(this.posX, 1.8, this.posZ, 28);
      this.cameraShakeIntensity = 0.25;
      this.triggerMessage(
        `Daily Challenge Complete: ${this.dailyChallenge.title}! (+${this.dailyChallenge.rewardLetters} Letters)`
      );
    } else {
      synthAudio.playComboChime(3);
      saveGameProgress({
        dailyChallenge: {
          dayKey: this.dailyDayKey,
          challengeId: this.dailyChallenge.id,
          completedStepIds: [...this.dailyCompletedStepIds],
          completed: false,
        },
      });
      this.triggerMessage(
        `Daily Challenge (${doneCount}/${updatedSteps.length}): ${this.dailyChallenge.title}`
      );
    }

    this.pushHUDUpdate();
  }

  private setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      this.keysHeld[e.code] = true;

      // Ensure audio context resumes upon user interaction
      synthAudio.init();
      synthAudio.resume();

      if (e.code === 'Space') {
        e.preventDefault();
        if (this.gameState === 'TITLE') {
          this.startGame();
        }
      }
      if (e.code === 'Enter') {
        if (this.gameState === 'TITLE') {
          this.startGame();
        }
      }
      if (e.code === 'Escape') {
        if (this.gameState === 'PLAYING') {
          this.setGameState('PAUSED');
        } else if (this.gameState === 'PAUSED') {
          this.setGameState('PLAYING');
        } else if (this.gameState === 'VICTORY') {
          this.continueFreeRoam();
        }
      }
      if (e.code === 'KeyL') {
        if (this.gameState === 'PLAYING') {
          this.setGameState('SCRAPBOOK');
        } else if (this.gameState === 'SCRAPBOOK') {
          this.setGameState('PLAYING');
        }
      }
      if (e.code === 'KeyG') {
        if (this.gameState === 'PLAYING') {
          this.setGameState('GARAGE');
        } else if (this.gameState === 'GARAGE') {
          this.setGameState('PLAYING');
        }
      }
      if (e.code === 'KeyP') {
        if (this.gameState === 'PLAYING') {
          this.setGameState('PHOTO');
        } else if (this.gameState === 'PHOTO') {
          this.setGameState('PLAYING');
        }
      }
      if (e.code === 'KeyQ') {
        if (this.gameState === 'PLAYING') {
          this.setGameState('DISPATCH_RADIO');
        } else if (this.gameState === 'DISPATCH_RADIO') {
          this.setGameState('PLAYING');
        }
      }
      if (e.code === 'KeyR') {
        if (this.gameState === 'PLAYING') {
          this.cycleRadioStation();
        }
      }
      if (e.code === 'KeyB') {
        if (this.gameState === 'PLAYING') {
          this.setGameState('WINTER_PASS');
        } else if (this.gameState === 'WINTER_PASS') {
          this.setGameState('PLAYING');
        }
      }
      if (e.code === 'KeyC') {
        if (this.gameState === 'PLAYING') {
          this.setGameState('DAILY_CHALLENGE');
        } else if (this.gameState === 'DAILY_CHALLENGE') {
          this.setGameState('PLAYING');
        }
      }
      if (e.code === 'KeyM') {
        if (this.gameState === 'PLAYING' || this.gameState === 'TITLE') {
          this.setGameState('LEVEL_SELECT');
        } else if (this.gameState === 'LEVEL_SELECT') {
          this.setGameState('PLAYING');
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysHeld[e.code] = false;
    });

    window.addEventListener('blur', () => {
      this.keysHeld = {};
      this.virtualThrottle = 0;
      this.virtualSteer = 0;
      this.virtualBoost = false;
    });

    window.addEventListener('resize', this.handleResize);
  }

  private handleResize = () => {
    if (!this.container || this.isDisposed) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  /**
   * Virtual on-screen controls for mobile/mouse touch
   */
  public setVirtualInput(throttle: number, steer: number, boost: boolean) {
    this.virtualThrottle = throttle;
    this.virtualSteer = steer;
    this.virtualBoost = boost;
    synthAudio.init();
    synthAudio.resume();
  }

  public applyAtmosphere(atm: SolsticeAtmosphere) {
    this.atmosphere = atm;
    if (!this.scene) return;

    if (atm === 'golden') {
      this.scene.background = new THREE.Color(0x1a0f0a);
      if (this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.color.setHex(0x271306);
        this.scene.fog.density = 0.014;
      }
      if (this.hemiLight) {
        this.hemiLight.color.setHex(0xfef08a);
        this.hemiLight.groundColor.setHex(0x451a03);
        this.hemiLight.intensity = 1.0;
      }
      if (this.sunLight) {
        this.sunLight.color.setHex(0xfde68a);
        this.sunLight.intensity = 2.0;
      }
      if (this.rimLight) {
        this.rimLight.color.setHex(0xf97316);
        this.rimLight.intensity = 0.8;
      }
    } else if (atm === 'aurora') {
      this.scene.background = new THREE.Color(0x061814);
      if (this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.color.setHex(0x08261e);
        this.scene.fog.density = 0.015;
      }
      if (this.hemiLight) {
        this.hemiLight.color.setHex(0x6ee7b7);
        this.hemiLight.groundColor.setHex(0x022c22);
        this.hemiLight.intensity = 0.95;
      }
      if (this.sunLight) {
        this.sunLight.color.setHex(0xa7f3d0);
        this.sunLight.intensity = 1.6;
      }
      if (this.rimLight) {
        this.rimLight.color.setHex(0xc084fc);
        this.rimLight.intensity = 0.9;
      }
    } else {
      // Twilight default
      this.scene.background = new THREE.Color(0x0c1322);
      if (this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.color.setHex(0x0e172a);
        this.scene.fog.density = 0.016;
      }
      if (this.hemiLight) {
        this.hemiLight.color.setHex(0xbfdbfe);
        this.hemiLight.groundColor.setHex(0x1e293b);
        this.hemiLight.intensity = 0.9;
      }
      if (this.sunLight) {
        this.sunLight.color.setHex(0xffedd5);
        this.sunLight.intensity = 1.8;
      }
      if (this.rimLight) {
        this.rimLight.color.setHex(0xf472b6);
        this.rimLight.intensity = 0.6;
      }
    }
  }

  public captureSnapshot(): string {
    // Force a render pass and grab base64 image data url
    this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png');
    this.checkAchievement('shutterbug');
    return dataUrl;
  }

  public checkAchievement(id: string) {
    if (this.unlockedAchievementIds.includes(id)) return;
    const ach = ACHIEVEMENTS.find((a) => a.id === id);
    if (!ach) return;

    this.unlockedAchievementIds.push(id);
    this.loveLetters += ach.rewardLetters;
    this.addWinterPassXp(ach.rewardLetters * 2);
    saveGameProgress({
      unlockedAchievementIds: [...this.unlockedAchievementIds],
      loveLetters: this.loveLetters,
    });

    synthAudio.playGiftPickup();
    this.particles.emitRomanticHearts(this.posX, 1.8, this.posZ, 16);
    this.triggerMessage(`🏆 Solstice Milestone: ${ach.title}! (+${ach.rewardLetters} Letters)`);
  }

  public startGame() {
    this.gameState = 'PLAYING';
    synthAudio.init();
    synthAudio.resume();
    this.triggerMessage(`Welcome to ${this.currentLevel.name}! Clear the snowy roads & reunite the lovers!`);
  }

  public setGameState(state: GameState) {
    if (state === 'DAILY_CHALLENGE' && getUtcDayKey() !== this.dailyDayKey) {
      this.initDailyChallenge(true);
    }
    this.gameState = state;
    if (state === 'PLAYING') {
      synthAudio.resume();
    }
    this.pushHUDUpdate();
  }

  public continueFreeRoam() {
    this.hasTriggeredVictory = true;
    this.gameState = 'PLAYING';
    synthAudio.init();
    synthAudio.resume();
    this.triggerMessage('Free Roam Mode: Keep plowing snow & discovering hidden gifts!');
    this.pushHUDUpdate();
  }

  public purchaseUpgrade(upgradeId: string): boolean {
    const config = UPGRADES[upgradeId];
    if (!config) return false;

    const currentLevel = this.upgrades[upgradeId] || 1;
    if (currentLevel >= config.tiers.length) return false;

    const nextTier = config.tiers[currentLevel];
    if (this.loveLetters >= nextTier.cost) {
      this.loveLetters -= nextTier.cost;
      this.upgrades[upgradeId] = currentLevel + 1;

      if (this.upgrades[upgradeId] === config.tiers.length) {
        this.checkAchievement('master_mechanic');
      }

      synthAudio.playUpgradeSound();
      this.addWinterPassXp(35 * (currentLevel + 1));
      this.triggerMessage(`Upgraded ${config.name} to Tier ${currentLevel + 1}: ${nextTier.title}!`);

      // Visual upgrade adjustments (e.g. widen blade mesh)
      if (upgradeId === 'bladeWidth') {
        const width = nextTier.statValue;
        this.plowBladeGroup.scale.set(width / 2.2, 1, 1);
      }

      this.saveProgressState();
      this.pushHUDUpdate();
      return true;
    }
    return false;
  }

  public setRadioStation(stationId: string) {
    this.radioStationId = stationId;
    synthAudio.setRadioStation(stationId);
    saveGameSettings({ radioStationId: stationId });
    this.checkAchievement('radio_enthusiast');
    const station = RADIO_STATIONS.find((s) => s.id === stationId);
    if (station) {
      this.triggerMessage(`📻 Tuned to ${station.name} (${station.frequency})`);
    }
    this.pushHUDUpdate();
  }

  public cycleRadioStation() {
    const idx = RADIO_STATIONS.findIndex((s) => s.id === this.radioStationId);
    const nextIdx = (idx + 1) % RADIO_STATIONS.length;
    this.setRadioStation(RADIO_STATIONS[nextIdx].id);
  }

  public startQuest(questId: string): boolean {
    const quest =
      this.currentLevel.quests.find((q) => q.id === questId) ||
      SOLSTICE_QUESTS.find((q) => q.id === questId);
    if (!quest) return false;

    this.activeQuest = {
      quest,
      remainingSec: quest.timeLimitSec,
      distanceToTarget: Math.hypot(quest.targetX - this.posX, quest.targetZ - this.posZ),
      progressPercent: 0,
    };

    // Position waypoint beacon
    this.questBeaconGroup.position.set(quest.targetX, 0, quest.targetZ);
    this.questBeaconGroup.visible = true;

    synthAudio.playQuestStart();
    this.triggerMessage(`🚨 New Dispatch: ${quest.title}! (${quest.timeLimitSec}s)`);
    this.setGameState('PLAYING');
    return true;
  }

  public cancelQuest() {
    this.activeQuest = null;
    this.questBeaconGroup.visible = false;
    this.triggerMessage('Dispatch cancelled.');
    this.pushHUDUpdate();
  }

  public purchasePaint(paintId: string): boolean {
    const paint = TRACTOR_PAINTS.find((p) => p.id === paintId);
    if (!paint) return false;

    if (!this.unlockedPaintIds.includes(paintId)) {
      if (this.loveLetters < paint.cost) return false;
      this.loveLetters -= paint.cost;
      this.unlockedPaintIds.push(paintId);
    }

    this.selectedPaintId = paintId;
    if (this.tractorBodyMesh && this.tractorBodyMesh.material instanceof THREE.MeshStandardMaterial) {
      this.tractorBodyMesh.material.color.setHex(paint.colorHex);
    }

    this.checkAchievement('atelier_customizer');
    synthAudio.playUpgradeSound();
    this.triggerMessage(`Painted Heartplow with ${paint.name}!`);
    this.saveProgressState();
    this.pushHUDUpdate();
    return true;
  }

  public purchaseDecal(decalId: string): boolean {
    const decal = TRACTOR_DECALS.find((d) => d.id === decalId);
    if (!decal) return false;

    if (!this.unlockedDecalIds.includes(decalId)) {
      if (this.loveLetters < decal.cost) return false;
      this.loveLetters -= decal.cost;
      this.unlockedDecalIds.push(decalId);
    }

    this.selectedDecalId = decalId;
    if (this.tractorEmblemMesh && this.tractorEmblemMesh.material instanceof THREE.MeshStandardMaterial) {
      this.tractorEmblemMesh.material.color.setHex(decal.colorHex);
      this.tractorEmblemMesh.material.emissive.setHex(decal.colorHex);
    }

    this.checkAchievement('atelier_customizer');
    synthAudio.playUpgradeSound();
    this.triggerMessage(`Applied ${decal.name} to Heartplow!`);
    this.saveProgressState();
    this.pushHUDUpdate();
    return true;
  }

  public addWinterPassXp(amount: number) {
    if (amount <= 0) return;
    const oldXp = this.winterPassXp;
    this.winterPassXp += amount;

    // Check if new tiers unlocked
    WINTER_PASS_TIERS.forEach((tier) => {
      if (oldXp < tier.requiredXp && this.winterPassXp >= tier.requiredXp) {
        this.triggerMessage(`🌟 Winter Pass Milestone! Tier ${tier.level} (${tier.title}) reached!`);
        synthAudio.playComboChime(tier.level);
      }
    });

    if (this.winterPassXp >= 2000) {
      this.checkAchievement('winter_pass_master');
    }

    this.saveProgressState();
    this.pushHUDUpdate();
  }

  public claimPassTierReward(tierLevel: number): boolean {
    const tier = WINTER_PASS_TIERS.find((t) => t.level === tierLevel);
    if (!tier) return false;
    if (this.winterPassXp < tier.requiredXp) return false;
    if (this.claimedPassTierIds.includes(tierLevel)) return false;

    this.claimedPassTierIds.push(tierLevel);

    if (tier.rewardLetters) {
      this.loveLetters += tier.rewardLetters;
    }
    if (tier.rewardPaintId && !this.unlockedPaintIds.includes(tier.rewardPaintId)) {
      this.unlockedPaintIds.push(tier.rewardPaintId);
    }
    if (tier.rewardDecalId && !this.unlockedDecalIds.includes(tier.rewardDecalId)) {
      this.unlockedDecalIds.push(tier.rewardDecalId);
    }

    synthAudio.playPassClaimSound();
    this.particles.emitRomanticHearts(this.posX, 2.0, this.posZ, 25);
    this.triggerMessage(`🎁 Winter Pass Reward Claimed! ${tier.title}: ${tier.rewardDescription}`);

    this.checkAchievement('winter_pass_initiate');
    this.saveProgressState();
    this.pushHUDUpdate();
    return true;
  }

  public setWeather(weatherId: WeatherType) {
    this.currentWeatherType = weatherId;
    const cond = WEATHER_CONDITIONS[weatherId];
    if (cond) {
      if (this.scene && this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.density = cond.fogDensity;
      }
      if (weatherId === 'heavy_blizzard') {
        synthAudio.playBlizzardWarningSound();
        this.triggerMessage(`⚠️ Solstice Blizzard Warning! Visibility dropping & snow drifting!`);
      } else {
        this.triggerMessage(`🌤️ Forecast updated: ${cond.name} · ${cond.tagline}`);
      }
    }
    this.pushHUDUpdate();
  }

  public cycleWeather() {
    const keys: WeatherType[] = ['gentle_flurry', 'heavy_blizzard', 'clear_aurora', 'starlight_freeze'];
    const idx = keys.indexOf(this.currentWeatherType);
    const next = keys[(idx + 1) % keys.length];
    this.setWeather(next);
  }

  public selectLevel(levelId: string): boolean {
    const target = LEVEL_MAPS.find((l) => l.id === levelId);
    if (!target || !this.unlockedLevelIds.includes(levelId)) return false;

    this.saveProgressState();
    this.currentLevel = target;

    // Reset tractor & run state for the newly loaded map
    this.posX = 0;
    this.posZ = 0;
    this.heading = Math.PI;
    this.speed = 0;
    this.steerAngle = 0;
    this.boostFuel = 100;
    this.isBoosting = false;
    this.isPlowing = false;
    this.comboLevel = 1;
    this.comboTimer = 0;
    this.comboClipTitle = null;
    this.comboClipTimer = 0;
    this.comboEncoreCount = 0;
    this.snowClearedAccumulator = 0;
    this.snowClearedPercent = 0;
    this.activeQuest = null;
    this.questBeaconGroup.visible = false;

    this.tractorGroup.position.set(0, 0, 0);
    this.tractorGroup.rotation.y = Math.PI;
    this.tractorGroup.scale.set(1, 1, 1);
    if (this.comboFlashLight) this.comboFlashLight.intensity = 0;

    this.snowGrid.resetSnow();
    this.initWorldEntities();
    this.buildDailyGuideMeshes();
    this.saveProgressState();

    this.gameState = 'PLAYING';
    synthAudio.init();
    synthAudio.resume();
    synthAudio.playUpgradeSound();
    this.triggerMessage(`Deployed to Level ${target.number}: ${target.name} — ${target.subtitle}!`);
    this.pushHUDUpdate();
    return true;
  }

  public unlockLevel(levelId: string): boolean {
    if (this.unlockedLevelIds.includes(levelId)) {
      return this.selectLevel(levelId);
    }
    const target = LEVEL_MAPS.find((l) => l.id === levelId);
    if (!target || this.loveLetters < target.unlockCostLetters) return false;

    this.loveLetters -= target.unlockCostLetters;
    this.unlockedLevelIds.push(levelId);
    this.saveProgressState();
    return this.selectLevel(levelId);
  }

  public advanceToNextLevel(): boolean {
    const idx = LEVEL_MAPS.findIndex((l) => l.id === this.currentLevel.id);
    if (idx < 0 || idx + 1 >= LEVEL_MAPS.length) return false;
    const next = LEVEL_MAPS[idx + 1];
    if (!this.unlockedLevelIds.includes(next.id)) {
      this.unlockedLevelIds.push(next.id);
    }
    return this.selectLevel(next.id);
  }

  private saveProgressState() {
    const prev = loadGameProgress();
    const levelProgress = { ...(prev.levelProgress || {}) };
    levelProgress[this.currentLevel.id] = {
      clearedLandmarkIds: this.landmarks.filter((l) => l.cleared).map((l) => l.id),
      unlockedGiftIds: this.gifts.filter((g) => g.collected).map((g) => g.id),
      completedQuestIds: [...this.completedQuestIds],
    };

    saveGameProgress({
      loveLetters: this.loveLetters,
      upgrades: { ...this.upgrades },
      clearedLandmarkIds:
        this.currentLevel.id === 'valentine-valley'
          ? this.landmarks.filter((l) => l.cleared).map((l) => l.id)
          : prev.clearedLandmarkIds,
      unlockedGiftIds:
        this.currentLevel.id === 'valentine-valley'
          ? this.gifts.filter((g) => g.collected).map((g) => g.id)
          : prev.unlockedGiftIds,
      completedQuestIds:
        this.currentLevel.id === 'valentine-valley'
          ? [...this.completedQuestIds]
          : prev.completedQuestIds,
      currentLevelId: this.currentLevel.id,
      unlockedLevelIds: [...this.unlockedLevelIds],
      completedLevelIds: [...this.completedLevelIds],
      levelProgress,
      unlockedPaintIds: [...this.unlockedPaintIds],
      selectedPaintId: this.selectedPaintId,
      unlockedDecalIds: [...this.unlockedDecalIds],
      selectedDecalId: this.selectedDecalId,
      winterPassXp: this.winterPassXp,
      claimedPassTierIds: [...this.claimedPassTierIds],
    });
  }

  private triggerMessage(msg: string) {
    this.lastEventMessage = msg;
    this.messageClearTimer = 4.5;
    this.pushHUDUpdate();
  }

  /**
   * Main Simulation Loop (Fixed/clamped 60fps)
   */
  private startLoop() {
    let lastTime = performance.now();

    const tick = (now: number) => {
      if (this.isDisposed) return;

      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);

      // Handle hitstop freeze
      if (this.hitstopDuration > 0) {
        this.hitstopDuration -= dt;
      } else {
        this.updateSimulation(dt);
      }

      this.updateCamera(dt);
      const cond = WEATHER_CONDITIONS[this.currentWeatherType];
      this.particles.update(dt, this.camera.position, cond.windSpeed, cond.snowParticleMultiplier);
      synthAudio.updateWeatherAudio(this.currentWeatherType === 'heavy_blizzard' ? 1.0 : 0.0);

      this.renderer.render(this.scene, this.camera);

      // Software WebGL pacing guard
      if (this.isSoftwareGl) {
        this.afterDraw(() => {
          this.frameId = window.setTimeout(() => tick(performance.now()), 16);
        });
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.frameId = window.setTimeout(() => tick(performance.now()), 16);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        cb();
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  /**
   * Update kinematics, snow plowing, upgrades, and pickups
   */
  private updateSimulation(dt: number) {
    if (this.messageClearTimer > 0) {
      this.messageClearTimer -= dt;
      if (this.messageClearTimer <= 0) {
        this.lastEventMessage = null;
        this.pushHUDUpdate();
      }
    }

    if (this.gameState === 'TITLE') {
      // In title screen: perform cinematic slow rotation around village center
      const time = performance.now() * 0.0003;
      this.posX = Math.cos(time) * 4;
      this.posZ = Math.sin(time) * 4;
      this.tractorGroup.position.set(this.posX, 0, this.posZ);
      this.tractorGroup.rotation.y = time + Math.PI / 2;
      return;
    }

    if (this.gameState !== 'PLAYING') {
      synthAudio.updateVehicleAudio(0, false, false);
      if (this.comboFlashLight && this.comboFlashLight.intensity > 0) {
        this.comboFlashLight.intensity = 0;
      }
      return;
    }

    if (this.comboFlashLight && this.comboFlashLight.intensity > 0.01) {
      this.comboFlashLight.intensity *= Math.pow(0.02, dt);
      if (this.comboFlashLight.intensity < 0.05) this.comboFlashLight.intensity = 0;
    }

    // 1. Process Inputs (Continuous Held Keys + Virtual Inputs)
    let throttle = 0;
    if (this.keysHeld['KeyW'] || this.keysHeld['ArrowUp']) throttle += 1;
    if (this.keysHeld['KeyS'] || this.keysHeld['ArrowDown']) throttle -= 0.8;
    if (this.virtualThrottle !== 0) throttle = this.virtualThrottle;

    let steer = 0;
    if (this.keysHeld['KeyA'] || this.keysHeld['ArrowLeft']) steer += 1;
    if (this.keysHeld['KeyD'] || this.keysHeld['ArrowRight']) steer -= 1;
    if (this.virtualSteer !== 0) steer = this.virtualSteer;

    const wantsBoost = (this.keysHeld['Space'] || this.virtualBoost) && this.boostFuel > 5 && throttle > 0;

    // Upgrades values
    const bladeTier = UPGRADES.bladeWidth.tiers[this.upgrades.bladeWidth - 1];
    const bladeWidth = bladeTier.statValue;

    const lanternTier = UPGRADES.thermalLantern.tiers[this.upgrades.thermalLantern - 1];
    const thermalRadius = lanternTier.statValue;

    const boostTier = UPGRADES.steamBoost.tiers[this.upgrades.steamBoost - 1];
    const boostMultiplier = boostTier.statValue;

    const magnetTier = UPGRADES.loveMagnet.tiers[this.upgrades.loveMagnet - 1];
    const magnetRadius = magnetTier.statValue;

    const comboTier = UPGRADES.comboTimer.tiers[this.upgrades.comboTimer - 1];
    const comboWindow = comboTier.statValue;

    // Boost consumption & replenishment
    if (wantsBoost) {
      this.isBoosting = true;
      this.boostFuel = Math.max(0, this.boostFuel - 32 * dt);
      if (Math.random() < 0.15) synthAudio.playBoostStart();
    } else {
      this.isBoosting = false;
      this.boostFuel = Math.min(100, this.boostFuel + 14 * dt);
    }

    // 2. Weather Cycle & Physics Modifiers
    this.weatherCycleTimer -= dt;
    if (this.weatherCycleTimer <= 0) {
      this.weatherCycleTimer = 65 + Math.random() * 40;
      this.cycleWeather();
    }

    const cond = WEATHER_CONDITIONS[this.currentWeatherType];

    // Snow Accumulation during blizzard
    if (cond.snowAccumulationRate > 0) {
      this.snowGrid.accumulateSnowDrifts(dt, cond.snowAccumulationRate);
    }

    if (this.currentWeatherType === 'heavy_blizzard' && Math.abs(this.speed) > 2) {
      this.blizzardContinuousTimer += dt;
      if (this.blizzardContinuousTimer >= 15) {
        this.checkAchievement('blizzard_survivor');
      }
    } else {
      this.blizzardContinuousTimer = 0;
    }

    // 2.5 Tractor Kinematics Simulation
    const frictionMult = cond.frictionMultiplier;
    const snowPackFactor = this.isPlowing ? Math.max(0.84, 1 - (this.currentLevel.snowResistance - 1) * 0.25) : 1.0;
    const maxSpeed = (throttle >= 0 ? 12 : 6) * (this.isBoosting ? boostMultiplier : 1.0) * snowPackFactor;
    const accelRate = (this.isBoosting ? 16 : 10) * (throttle < 0 ? 1 : Math.max(0.8, frictionMult));
    const frictionRate = 6 * frictionMult;

    if (throttle !== 0) {
      this.speed += throttle * accelRate * dt;
      this.speed = Math.max(-6, Math.min(maxSpeed, this.speed));
    } else {
      if (this.speed > 0) {
        this.speed = Math.max(0, this.speed - frictionRate * dt);
      } else if (this.speed < 0) {
        this.speed = Math.min(0, this.speed + frictionRate * dt);
      }
    }

    // Steering with speed sensitivity
    const speedRatio = Math.abs(this.speed) / 12;
    const maxSteerAngle = 0.55;
    const targetSteer = steer * maxSteerAngle;
    this.steerAngle = THREE.MathUtils.damp(this.steerAngle, targetSteer, 10, dt);

    if (Math.abs(this.speed) > 0.05) {
      const turnDir = this.speed >= 0 ? 1 : -1;
      this.heading += this.steerAngle * (this.speed / 4.5) * turnDir * dt;
    }

    // Velocity vector
    const vx = Math.sin(this.heading) * this.speed;
    const vz = Math.cos(this.heading) * this.speed;

    const nextX = this.posX + vx * dt;
    const nextZ = this.posZ + vz * dt;

    // Collision with world bounds
    const limit = (WORLD_SIZE / 2) - 3.5;
    if (Math.abs(nextX) < limit && Math.abs(nextZ) < limit) {
      this.posX = nextX;
      this.posZ = nextZ;
    } else {
      this.speed = -this.speed * 0.4;
      this.cameraShakeIntensity = 0.35;
      synthAudio.playBumpSound();
    }

    // Update 3D Tractor position & rotation
    this.tractorGroup.position.set(this.posX, 0, this.posZ);
    this.tractorGroup.rotation.y = this.heading;

    // Check Speed milestone (24 km/h = ~6.67 m/s)
    if (Math.abs(this.speed) * 3.6 >= 24) {
      this.checkAchievement('speed_demon');
    }

    // Wheel animation & steering
    const wheelRotSpeed = (this.speed / 0.65) * dt;
    this.frontWheels.forEach((w) => {
      w.rotation.x += wheelRotSpeed;
      w.rotation.y = this.steerAngle;
    });
    this.rearWheels.forEach((w) => {
      w.rotation.x += wheelRotSpeed;
    });

    // Squash & Stretch on acceleration or plow impact
    const targetSquash = 1.0 - Math.min(0.2, (Math.abs(this.speed) / 14) * 0.15);
    this.squashStretchY = THREE.MathUtils.damp(this.squashStretchY, targetSquash, 8, dt);
    this.tractorGroup.scale.set(1 / Math.sqrt(this.squashStretchY), this.squashStretchY, 1 / Math.sqrt(this.squashStretchY));

    // Exhaust particle puffs
    this.particles.emitExhaustPuff(
      this.posX + Math.sin(this.heading) * 0.8 + 0.4,
      1.8,
      this.posZ + Math.cos(this.heading) * 0.8 + 0.8,
      this.isBoosting
    );

    // 3. Snow Plowing & Carving
    // Position of blade center ahead of tractor
    const bladeDistance = 1.8;
    const bladeWorldX = this.posX + Math.sin(this.heading) * bladeDistance;
    const bladeWorldZ = this.posZ + Math.cos(this.heading) * bladeDistance;

    const plowing = this.snowGrid.plowSnow(
      bladeWorldX,
      bladeWorldZ,
      this.heading,
      bladeWidth,
      thermalRadius
    );

    this.isPlowing = plowing.isPlowingSnow && Math.abs(this.speed) > 0.5;
    this.snowClearedPercent = plowing.totalClearedPercent;

    if (this.isPlowing) {
      this.snowClearedAccumulator += plowing.cellsClearedThisFrame;
      this.particles.emitSnowSpray(bladeWorldX, 0.1, bladeWorldZ, this.heading, Math.abs(this.speed));

      // Award Winter Pass XP for plowing
      if (plowing.cellsClearedThisFrame > 0) {
        this.addWinterPassXp(Math.max(1, Math.round(plowing.cellsClearedThisFrame * 0.15)));
      }

      if (this.snowClearedPercent > 0) {
        this.checkAchievement('first_tracks');
      }

      // Combo audio clip title display timer
      if (this.comboClipTimer > 0) {
        this.comboClipTimer -= dt;
        if (this.comboClipTimer <= 0) {
          this.comboClipTimer = 0;
          this.comboClipTitle = null;
          this.pushHUDUpdate();
        }
      }

      // Combo management: continuous plowing sustains and escalates combo
      this.comboTimer = comboWindow;
      if (this.snowClearedAccumulator > 35 * this.comboLevel) {
        this.snowClearedAccumulator = 0;
        if (this.comboLevel < COMBO_LEVELS.length) {
          this.comboLevel++;

          if (this.comboLevel >= 3) {
            this.checkAchievement('sweet_combo');
          }
          if (this.comboLevel >= 5) {
            this.checkAchievement('midnight_waltz');
          }

          if (this.comboLevel >= 3) {
            this.comboClipTitle = synthAudio.playHighComboClip(this.comboLevel);
            this.comboClipTimer = 2.6;
          } else {
            synthAudio.playComboChime(this.comboLevel);
          }

          const currentCombo = COMBO_LEVELS[this.comboLevel - 1];
          this.particles.emitComboMilestoneBurst(
            this.posX,
            0.3,
            this.posZ,
            this.comboLevel,
            currentCombo.color
          );
          this.comboFlashLight.color.set(currentCombo.color);
          this.comboFlashLight.intensity = 4.5 + this.comboLevel * 0.6;
          this.squashStretchY = 1.24;
          this.cameraShakeIntensity = 0.14 + this.comboLevel * 0.025;

          // Gain love letters on combo progression
          const lettersGained = Math.round(5 * currentCombo.multiplier);
          this.loveLetters += lettersGained;
          this.addWinterPassXp(Math.round(15 * currentCombo.multiplier));
          saveGameProgress({ loveLetters: this.loveLetters });
          this.triggerMessage(`${currentCombo.title}! Combo x${currentCombo.multiplier.toFixed(1)} (+${lettersGained} Letters)`);
        } else {
          // Sustained Max Combo (Level 8): rotate encore romantic audio clips
          const maxCombo = COMBO_LEVELS[COMBO_LEVELS.length - 1];
          this.comboClipTitle = synthAudio.playHighComboClip(8, this.comboEncoreCount++);
          this.comboClipTimer = 2.6;
          this.particles.emitComboMilestoneBurst(this.posX, 0.3, this.posZ, 8, maxCombo.color);
          this.comboFlashLight.color.set(maxCombo.color);
          this.comboFlashLight.intensity = 8.0;
          this.squashStretchY = 1.26;
          this.cameraShakeIntensity = 0.2;
          const encoreLetters = 25;
          this.loveLetters += encoreLetters;
          this.addWinterPassXp(60);
          saveGameProgress({ loveLetters: this.loveLetters });
          this.triggerMessage(`${this.comboClipTitle}! Max Combo Encore (+${encoreLetters} Letters)`);
        }
      }
    } else {
      if (this.comboClipTimer > 0) {
        this.comboClipTimer -= dt;
        if (this.comboClipTimer <= 0) {
          this.comboClipTimer = 0;
          this.comboClipTitle = null;
          this.pushHUDUpdate();
        }
      }

      // Decay combo timer when not actively plowing snow
      if (this.comboTimer > 0) {
        this.comboTimer -= dt;
        if (this.comboTimer <= 0) {
          if (this.comboLevel > 1) {
            if (this.comboLevel >= 3) {
              synthAudio.playComboFadeChime();
            }
            this.comboLevel = 1;
            this.comboEncoreCount = 0;
            this.comboClipTitle = null;
            this.comboClipTimer = 0;
            this.snowClearedAccumulator = 0;
            this.pushHUDUpdate();
          }
        }
      }
    }

    // Update continuous audio
    synthAudio.updateVehicleAudio(speedRatio, this.isPlowing, this.isBoosting);

    // 3.5 Active Quest simulation & Waypoint beacon update
    if (this.activeQuest) {
      const q = this.activeQuest.quest;
      this.activeQuest.remainingSec -= dt;
      const dist = Math.hypot(q.targetX - this.posX, q.targetZ - this.posZ);
      this.activeQuest.distanceToTarget = Math.round(dist);

      // Animate Beacon
      if (this.questBeaconGroup.visible) {
        this.questBeaconGroup.rotation.y += 1.5 * dt;
        const diamond = this.questBeaconGroup.children[2];
        if (diamond) diamond.position.y = 6.0 + Math.sin(performance.now() * 0.005) * 0.4;
      }

      // Check clearing progress if required
      if (q.requiredClearRatio) {
        const clearedRatio = this.snowGrid.getRegionClearedRatio(q.targetX, q.targetZ, q.targetRadius);
        this.activeQuest.progressPercent = Math.min(100, Math.round((clearedRatio / q.requiredClearRatio) * 100));

        if (clearedRatio >= q.requiredClearRatio && dist <= q.targetRadius + 1) {
          // Success!
          this.completeCurrentQuest();
        }
      } else {
        // Delivery / Rescue reached
        this.activeQuest.progressPercent = Math.min(100, Math.round(Math.max(0, 1 - dist / 50) * 100));
        if (dist <= q.targetRadius) {
          this.completeCurrentQuest();
        }
      }

      // Urgent ticking warning when time < 10s
      if (this.activeQuest && this.activeQuest.remainingSec <= 10 && this.activeQuest.remainingSec > 0) {
        if (Math.floor(this.activeQuest.remainingSec) !== Math.floor(this.activeQuest.remainingSec + dt)) {
          synthAudio.playQuestTick();
        }
      }

      // Quest failed timeout
      if (this.activeQuest && this.activeQuest.remainingSec <= 0) {
        this.triggerMessage(`⏳ Time's up! Dispatch "${q.title}" expired.`);
        this.activeQuest = null;
        this.questBeaconGroup.visible = false;
        this.pushHUDUpdate();
      }
    }

    // 4. Buried Gifts Collection
    this.gifts.forEach((gift) => {
      if (gift.collected) return;

      const dist = Math.hypot(gift.x - this.posX, gift.z - this.posZ);
      const giftMesh = this.giftMeshes.get(gift.id);

      // Buried snow depth check: is snow above gift cleared?
      const localSnow = this.snowGrid.getSnowDepthAt(gift.x, gift.z);
      const isRevealed = localSnow < 0.45;
      gift.revealed = isRevealed;

      if (isRevealed && giftMesh) {
        giftMesh.visible = true;
        // Idle bobbing and spinning
        giftMesh.position.y = 0.5 + Math.sin(performance.now() * 0.004) * 0.15;
        giftMesh.rotation.y += 1.5 * dt;

        // Magnet attraction towards plow
        if (dist <= magnetRadius) {
          const pullSpeed = 6.0 * dt;
          gift.x += ((this.posX - gift.x) / dist) * pullSpeed;
          gift.z += ((this.posZ - gift.z) / dist) * pullSpeed;
          giftMesh.position.set(gift.x, giftMesh.position.y, gift.z);
        }

        // Collection trigger
        if (dist < 1.8) {
          gift.collected = true;
          giftMesh.visible = false;
          this.loveLetters += gift.value;
          this.addWinterPassXp(gift.value * 2);

          const collectedCount = this.gifts.filter((g) => g.collected).length;
          if (collectedCount >= 3) {
            this.checkAchievement('keepsake_hunter');
          }

          synthAudio.playGiftPickup();
          this.hitstopDuration = 0.06; // brief hitstop
          this.particles.emitRomanticHearts(gift.x, 1.0, gift.z, 20);
          this.saveProgressState();
          this.triggerMessage(`Found ${gift.name}! ${gift.quote}`);
        }
      } else if (giftMesh) {
        giftMesh.visible = false; // still buried in deep snow
      }
    });

    // 5. Landmarks Clearing Progress
    let allCleared = true;
    this.landmarks.forEach((landmark) => {
      if (!landmark.cleared) {
        const clearedRatio = this.snowGrid.getRegionClearedRatio(landmark.x, landmark.z, landmark.radius);
        if (clearedRatio >= landmark.requiredClearRatio) {
          landmark.cleared = true;
          const coupleMesh = this.coupleMeshes.get(landmark.id);
          if (coupleMesh) coupleMesh.visible = true;

          synthAudio.playLandmarkReunion();
          this.hitstopDuration = 0.09;
          this.cameraShakeIntensity = 0.45;
          this.particles.emitRomanticHearts(landmark.x, 2.5, landmark.z, 30);

          const randomQuote = landmark.coupleCoupleQuotes[Math.floor(Math.random() * landmark.coupleCoupleQuotes.length)];
          this.loveLetters += 50;
          this.addWinterPassXp(120);
          this.checkAchievement('first_reunion');
          this.saveProgressState();
          this.triggerMessage(`${landmark.name} Cleared! Couple reunited: ${randomQuote}`);
        } else {
          allCleared = false;
        }
      }
    });

    // Check Victory Condition: All landmarks cleared (trigger once per run)
    if (allCleared && this.landmarks.length > 0 && !this.hasTriggeredVictory) {
      this.hasTriggeredVictory = true;
      if (!this.completedLevelIds.includes(this.currentLevel.id)) {
        this.completedLevelIds.push(this.currentLevel.id);
      }
      const lvlIdx = LEVEL_MAPS.findIndex((l) => l.id === this.currentLevel.id);
      const nextLvl = lvlIdx >= 0 && lvlIdx + 1 < LEVEL_MAPS.length ? LEVEL_MAPS[lvlIdx + 1] : null;
      if (nextLvl && !this.unlockedLevelIds.includes(nextLvl.id)) {
        this.unlockedLevelIds.push(nextLvl.id);
      }
      this.saveProgressState();
      this.gameState = 'VICTORY';
      this.checkAchievement('grand_savior');
      synthAudio.playLandmarkReunion();
      this.triggerMessage(
        nextLvl
          ? `${this.currentLevel.name} Cleared! ${nextLvl.name} is now unlocked!`
          : `${this.currentLevel.name} Cleared! The entire solstice world shines in love!`
      );
    }

    // 6. Daily Romantic Challenge Tracking (24h Rotating)
    this.updateDailyChallengeProgress(dt, bladeWorldX, bladeWorldZ);

    // Push periodically to HUD without overloading React
    const now = performance.now();
    if (now - this.lastHUDPushTime > 80) {
      this.lastHUDPushTime = now;
      this.pushHUDUpdate();
    }
  }

  /**
   * Smooth camera tracking & dynamic decaying shake
   */
  private updateCamera(dt: number) {
    // Decaying camera shake
    let shakeOffsetX = 0;
    let shakeOffsetZ = 0;
    if (this.cameraShakeIntensity > 0.001) {
      shakeOffsetX = (Math.random() - 0.5) * this.cameraShakeIntensity;
      shakeOffsetZ = (Math.random() - 0.5) * this.cameraShakeIntensity;
      this.cameraShakeIntensity *= Math.pow(0.04, dt);
    }

    // Isometric camera offset (fixed angle looking down at 45°)
    const isoOffset = new THREE.Vector3(20, 24, 20);
    this.targetCameraPos.set(
      this.posX + isoOffset.x + shakeOffsetX,
      isoOffset.y,
      this.posZ + isoOffset.z + shakeOffsetZ
    );

    // Smooth exponential damping
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.targetCameraPos.x, 4.5, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.targetCameraPos.y, 4.5, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.targetCameraPos.z, 4.5, dt);

    // Look slightly ahead of the plow
    const lookTarget = new THREE.Vector3(
      this.posX + Math.sin(this.heading) * 2,
      0.8,
      this.posZ + Math.cos(this.heading) * 2
    );
    this.camera.lookAt(lookTarget);
  }

  private completeCurrentQuest() {
    if (!this.activeQuest) return;
    const q = this.activeQuest.quest;

    if (!this.completedQuestIds.includes(q.id)) {
      this.completedQuestIds.push(q.id);
    }
    this.loveLetters += q.rewardLetters;
    this.addWinterPassXp(q.rewardLetters * 3);
    this.checkAchievement('first_dispatch');

    synthAudio.playQuestSuccess();
    this.hitstopDuration = 0.08;
    this.particles.emitRomanticHearts(this.posX, 2.0, this.posZ, 25);
    this.triggerMessage(`✅ Dispatch Completed! ${q.dialogueSuccess} (+${q.rewardLetters} Letters)`);

    this.activeQuest = null;
    this.questBeaconGroup.visible = false;
    this.saveProgressState();
    this.pushHUDUpdate();
  }

  private pushHUDUpdate() {
    if (!this.onHUDUpdate) return;

    const currentCombo = COMBO_LEVELS[this.comboLevel - 1] || COMBO_LEVELS[0];
    const comboTier = UPGRADES.comboTimer.tiers[this.upgrades.comboTimer - 1];
    const comboWindow = comboTier.statValue;

    const clearedLandmarks = this.landmarks.filter((l) => l.cleared).length;
    const collectedGifts = this.gifts.filter((g) => g.collected).length;

    const weatherCond = WEATHER_CONDITIONS[this.currentWeatherType] || WEATHER_CONDITIONS.gentle_flurry;
    const currentPassTier = WINTER_PASS_TIERS.filter((t) => this.winterPassXp >= t.requiredXp).pop();
    const currentLevel = currentPassTier ? currentPassTier.level : 0;
    const unclaimedCount = WINTER_PASS_TIERS.filter(
      (t) => this.winterPassXp >= t.requiredXp && !this.claimedPassTierIds.includes(t.level)
    ).length;

    const station = RADIO_STATIONS.find((s) => s.id === this.radioStationId) || RADIO_STATIONS[0];

    this.onHUDUpdate({
      gameState: this.gameState,
      snowClearedPercent: this.snowClearedPercent,
      loveLetters: this.loveLetters,
      comboLevel: this.comboLevel,
      comboMultiplier: currentCombo.multiplier,
      comboTitle: currentCombo.title,
      comboClipTitle: this.comboClipTitle,
      comboTimerProgress: this.comboTimer > 0 ? this.comboTimer / comboWindow : 0,
      boostPercent: Math.round(this.boostFuel),
      speedKmh: Math.round(Math.abs(this.speed) * 3.6),
      landmarksCleared: clearedLandmarks,
      totalLandmarks: this.landmarks.length,
      giftsFound: collectedGifts,
      totalGifts: this.gifts.length,
      lastEventMessage: this.lastEventMessage,
      upgrades: { ...this.upgrades },
      playerX: this.posX,
      playerZ: this.posZ,
      heading: this.heading,
      landmarks: this.landmarks.map((l) => ({ ...l })),
      gifts: this.gifts.map((g) => ({ ...g })),
      unlockedAchievementIds: [...this.unlockedAchievementIds],
      atmosphere: this.atmosphere,
      radioStationId: this.radioStationId,
      radioStationName: station.name,
      activeQuest: this.activeQuest ? { ...this.activeQuest } : null,
      completedQuestIds: [...this.completedQuestIds],
      selectedPaintId: this.selectedPaintId,
      unlockedPaintIds: [...this.unlockedPaintIds],
      selectedDecalId: this.selectedDecalId,
      unlockedDecalIds: [...this.unlockedDecalIds],
      weather: weatherCond,
      weatherCycleTimeLeft: Math.max(0, Math.round(this.weatherCycleTimer)),
      winterPassXp: this.winterPassXp,
      winterPassLevel: currentLevel,
      claimedPassTierIds: [...this.claimedPassTierIds],
      unclaimedPassRewardsCount: unclaimedCount,
      dailyChallenge: this.getDailyChallengeStatus(),
      currentLevel: this.currentLevel,
      unlockedLevelIds: [...this.unlockedLevelIds],
      completedLevelIds: [...this.completedLevelIds],
      availableQuests: this.currentLevel.quests,
    });
  }

  public getStats(): GameHUDStats {
    const currentCombo = COMBO_LEVELS[this.comboLevel - 1] || COMBO_LEVELS[0];
    const comboTier = UPGRADES.comboTimer.tiers[this.upgrades.comboTimer - 1];
    const comboWindow = comboTier.statValue;
    const station = RADIO_STATIONS.find((s) => s.id === this.radioStationId) || RADIO_STATIONS[0];
    const weatherCond = WEATHER_CONDITIONS[this.currentWeatherType] || WEATHER_CONDITIONS.gentle_flurry;
    const currentPassTier = WINTER_PASS_TIERS.filter((t) => this.winterPassXp >= t.requiredXp).pop();
    const currentLevel = currentPassTier ? currentPassTier.level : 0;
    const unclaimedCount = WINTER_PASS_TIERS.filter(
      (t) => this.winterPassXp >= t.requiredXp && !this.claimedPassTierIds.includes(t.level)
    ).length;

    return {
      gameState: this.gameState,
      snowClearedPercent: this.snowClearedPercent,
      loveLetters: this.loveLetters,
      comboLevel: this.comboLevel,
      comboMultiplier: currentCombo.multiplier,
      comboTitle: currentCombo.title,
      comboClipTitle: this.comboClipTitle,
      comboTimerProgress: this.comboTimer > 0 ? this.comboTimer / comboWindow : 0,
      boostPercent: Math.round(this.boostFuel),
      speedKmh: Math.round(Math.abs(this.speed) * 3.6),
      landmarksCleared: this.landmarks.filter((l) => l.cleared).length,
      totalLandmarks: this.landmarks.length,
      giftsFound: this.gifts.filter((g) => g.collected).length,
      totalGifts: this.gifts.length,
      lastEventMessage: this.lastEventMessage,
      upgrades: { ...this.upgrades },
      playerX: this.posX,
      playerZ: this.posZ,
      heading: this.heading,
      landmarks: this.landmarks.map((l) => ({ ...l })),
      gifts: this.gifts.map((g) => ({ ...g })),
      unlockedAchievementIds: [...this.unlockedAchievementIds],
      atmosphere: this.atmosphere,
      radioStationId: this.radioStationId,
      radioStationName: station.name,
      activeQuest: this.activeQuest ? { ...this.activeQuest } : null,
      completedQuestIds: [...this.completedQuestIds],
      selectedPaintId: this.selectedPaintId,
      unlockedPaintIds: [...this.unlockedPaintIds],
      selectedDecalId: this.selectedDecalId,
      unlockedDecalIds: [...this.unlockedDecalIds],
      weather: weatherCond,
      weatherCycleTimeLeft: Math.max(0, Math.round(this.weatherCycleTimer)),
      winterPassXp: this.winterPassXp,
      winterPassLevel: currentLevel,
      claimedPassTierIds: [...this.claimedPassTierIds],
      unclaimedPassRewardsCount: unclaimedCount,
      dailyChallenge: this.getDailyChallengeStatus(),
      currentLevel: this.currentLevel,
      unlockedLevelIds: [...this.unlockedLevelIds],
      completedLevelIds: [...this.completedLevelIds],
      availableQuests: this.currentLevel.quests,
    };
  }

  /**
   * Take a high-resolution snapshot from the WebGL canvas and generate a postcard
   */
  public async capturePostcard(filterId: string, stampId: string, caption: string): Promise<string> {
    // Render current frame cleanly
    this.renderer.render(this.scene, this.camera);

    return generatePostcardDataUrl({
      sourceCanvas: this.renderer.domElement,
      filterId,
      stampId,
      caption,
      clearedPercent: this.snowClearedPercent,
    });
  }

  public resetGame() {
    this.posX = 0;
    this.posZ = 0;
    this.heading = Math.PI;
    this.speed = 0;
    this.steerAngle = 0;
    this.boostFuel = 100;
    this.isBoosting = false;
    this.isPlowing = false;
    this.comboLevel = 1;
    this.comboTimer = 0;
    this.comboClipTitle = null;
    this.comboClipTimer = 0;
    this.comboEncoreCount = 0;
    this.snowClearedAccumulator = 0;
    this.snowClearedPercent = 0;
    this.blizzardContinuousTimer = 0;
    this.hitstopDuration = 0;
    this.cameraShakeIntensity = 0;
    this.squashStretchY = 1;
    this.hasTriggeredVictory = false;

    // Reset tractor visual transform
    this.tractorGroup.position.set(0, 0, 0);
    this.tractorGroup.rotation.y = Math.PI;
    this.tractorGroup.scale.set(1, 1, 1);
    if (this.comboFlashLight) this.comboFlashLight.intensity = 0;

    // Clear active dispatch quest if any
    this.activeQuest = null;
    this.questBeaconGroup.visible = false;

    // Replenish fresh snow blanket & mathematical depth grid
    this.snowGrid.resetSnow();

    // Reset landmarks & gifts (restore original coordinates for magnet-pulled gifts)
    this.landmarks.forEach((l) => {
      l.cleared = false;
      const c = this.coupleMeshes.get(l.id);
      if (c) c.visible = false;
    });
    this.gifts = this.currentLevel.gifts.map((g) => ({
      ...g,
      collected: false,
      revealed: false,
    }));
    this.gifts.forEach((g) => {
      const m = this.giftMeshes.get(g.id);
      if (m) {
        m.position.set(g.x, 0.4, g.z);
        m.visible = false;
      }
    });

    this.saveProgressState();
    this.gameState = 'PLAYING';
    synthAudio.init();
    synthAudio.resume();
    this.triggerMessage('Fresh snow has fallen! Clear the pathways once more!');
    this.pushHUDUpdate();
  }

  public dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    window.removeEventListener('resize', this.handleResize);

    this.snowGrid.dispose();
    this.particles.dispose();
    this.renderer.dispose();
    synthAudio.stopAmbientMusic();

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
