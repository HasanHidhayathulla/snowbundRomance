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
  RADIO_STATIONS,
  ROMANTIC_GIFTS,
  SOLSTICE_CEREMONIES,
  SOLSTICE_QUESTS,
  TRACTOR_DECALS,
  TRACTOR_PAINTS,
  UPGRADES,
  WEATHER_CONDITIONS,
  WINTER_PASS_TIERS,
  WORLD_SIZE,
  type GameState,
  type Landmark,
  type RadioStation,
  type RomanticGift,
  type SolsticeFestivalCeremony,
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
  createGazebo,
  createGrandSolsticeTree,
  createHeartPlowTractor,
  createSnowman,
  createSnowPine,
  createStreetlamp,
} from './models';
import { ParticleSystem } from './particleSystem';
import { SnowGridSystem } from './snowGrid';

export interface ActiveQuestState {
  quest: SolsticeQuest;
  remainingSec: number;
  distanceToTarget: number;
  progressPercent: number;
}

export interface GameHUDStats {
  gameState: GameState;
  snowClearedPercent: number;
  loveLetters: number;
  comboLevel: number;
  comboMultiplier: number;
  comboTitle: string;
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
  currentWeather: WeatherType;
  nextWeather: WeatherType;
  timeUntilForecastSec: number;
  activeCeremonyId: string | null;
  activeCeremonyRemainingSec: number;
  weather: WeatherCondition;
  weatherCycleTimeLeft: number;
  winterPassXp: number;
  winterPassLevel: number;
  claimedPassTierIds: number[];
  unclaimedPassRewardsCount: number;
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

  // Weather & Solstice Festival State
  private currentWeather: WeatherType = 'calm_snow';
  private nextWeather: WeatherType = 'golden_dawn';
  private weatherTimer: number = 120; // 120 seconds per forecast shift
  private activeCeremonyId: string | null = null;
  private activeCeremonyTimer: number = 0;
  // Weather & Winter Pass State
  private currentWeatherType: WeatherType = 'gentle_flurry';
  private weatherCycleTimer: number = 75;
  private winterPassXp: number = 0;
  private claimedPassTierIds: number[] = [];
  private blizzardContinuousTimer: number = 0;

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

  constructor(container: HTMLElement, onHUDUpdate?: (stats: GameHUDStats) => void) {
    this.container = container;
    this.onHUDUpdate = onHUDUpdate || null;

    // Load saved progress
    const saved = loadGameProgress();
    this.loveLetters = saved.loveLetters || 20;
    this.upgrades = { ...this.upgrades, ...saved.upgrades };
    this.unlockedAchievementIds = [...(saved.unlockedAchievementIds || [])];

    // Load saved settings
    const settings = loadGameSettings();
    this.atmosphere = settings.atmosphere || 'twilight';
    this.radioStationId = settings.radioStationId || 'val-classic';
    this.completedQuestIds = saved.completedQuestIds || [];
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
    this.setupEventListeners();
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
    this.scene.add(this.tractorGroup);

    // 5. Waypoint / Quest Beacon Mesh
    this.initQuestBeacon();

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

  private initWorldEntities() {
    // 1. Natural Mountain / Pine Perimeter to avoid floating void box
    for (let i = 0; i < 48; i++) {
      const angle = (i / 48) * Math.PI * 2;
      const r = (WORLD_SIZE / 2) - 1.5 + (Math.sin(i * 3) * 2.5);
      const px = Math.cos(angle) * r;
      const pz = Math.sin(angle) * r;
      const pine = createSnowPine(1.2 + Math.random() * 0.7);
      pine.position.set(px, 0, pz);
      pine.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(pine);
    }

    // 2. Village Chalets
    const chaletCoords = [
      { x: -16, z: -8, rot: 0.3, color: 0x78350f },
      { x: -28, z: 8, rot: 1.1, color: 0x92400e },
      { x: -32, z: 28, rot: -0.4, color: 0x854d0e },
      { x: 24, z: -22, rot: -1.2, color: 0x713f12 },
      { x: 30, z: -6, rot: 2.8, color: 0x78350f },
      { x: 26, z: 24, rot: 0.6, color: 0x9a3412 },
      { x: -8, z: 34, rot: 3.1, color: 0x7c2d12 },
      { x: 8, z: -30, rot: -0.2, color: 0x854d0e },
    ];

    chaletCoords.forEach((c) => {
      const house = createChalet(c.color);
      house.position.set(c.x, 0, c.z);
      house.rotation.y = c.rot;
      this.scene.add(house);

      // Add a couple streetlamps near houses
      const { group: lamp } = createStreetlamp();
      lamp.position.set(c.x + 3.6, 0, c.z + 3.6);
      this.scene.add(lamp);
    });

    // 3. Scattered Festive Evergreens and Snowmen in gardens
    const innerPines = [
      { x: -10, z: 12, s: 0.9 },
      { x: -6, z: -12, s: 1.1 },
      { x: 18, z: 10, s: 1.0 },
      { x: 6, z: 22, s: 0.8 },
      { x: -18, z: -28, s: 1.3 },
      { x: 22, z: -32, s: 0.9 },
    ];
    innerPines.forEach((p) => {
      const pine = createSnowPine(p.s);
      pine.position.set(p.x, 0, p.z);
      this.scene.add(pine);
    });

    // Snowmen
    const snowmanPositions = [
      { x: -4, z: 8 },
      { x: 16, z: -8 },
      { x: -12, z: -6 },
    ];
    snowmanPositions.forEach((sp) => {
      const sm = createSnowman();
      sm.position.set(sp.x, 0, sp.z);
      sm.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(sm);
    });

    // 4. Landmarks
    const saved = loadGameProgress();
    const savedClearedIds = new Set(saved?.clearedLandmarkIds || []);
    const savedGiftIds = new Set(saved?.unlockedGiftIds || []);

    this.landmarks = LANDMARKS.map((lm) => ({
      ...lm,
      cleared: savedClearedIds.has(lm.id),
    }));

    this.landmarks.forEach((lm) => {
      let landmarkMesh: THREE.Group;
      if (lm.id === 'town-square') {
        landmarkMesh = createGrandSolsticeTree();
        const gazebo = createGazebo();
        gazebo.position.set(-6, 0, 4);
        landmarkMesh.add(gazebo);
      } else if (lm.id === 'bakery') {
        landmarkMesh = createChalet(0xa16207);
        const { group: lamp } = createStreetlamp();
        lamp.position.set(3, 0, 3);
        landmarkMesh.add(lamp);
      } else {
        landmarkMesh = createGazebo();
      }

      landmarkMesh.position.set(lm.x, 0, lm.z);
      this.scene.add(landmarkMesh);
      this.landmarkMeshes.set(lm.id, landmarkMesh);

      // Reunited couple
      const couple = createCoupleModel();
      couple.position.set(lm.x + 1.8, 0, lm.z + 1.8);
      couple.visible = lm.cleared;
      this.scene.add(couple);
      this.coupleMeshes.set(lm.id, couple);
    });

    // 5. Buried Romantic Collectibles
    this.gifts = ROMANTIC_GIFTS.map((g) => ({
      ...g,
      collected: savedGiftIds.has(g.id),
    }));
    this.gifts.forEach((g) => {
      const giftGroup = createCollectibleGift();
      giftGroup.position.set(g.x, 0.4, g.z);
      giftGroup.visible = !g.collected;
      this.scene.add(giftGroup);
      this.giftMeshes.set(g.id, giftGroup);
    });
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
      if (e.code === 'KeyO') {
        if (this.gameState === 'PLAYING') {
          this.setGameState('OBSERVATORY');
          this.checkAchievement('weather_watcher');
        } else if (this.gameState === 'OBSERVATORY') {
      if (e.code === 'KeyB') {
        if (this.gameState === 'PLAYING') {
          this.setGameState('WINTER_PASS');
        } else if (this.gameState === 'WINTER_PASS') {
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

  public setWeather(weather: WeatherType) {
    this.currentWeather = weather;
    const cond = WEATHER_CONDITIONS[weather];
    this.applyAtmosphere(cond.skyAtmosphere);

    synthAudio.updateWeatherAudio(cond.windSpeedKmh, weather === 'blizzard');
    this.particles.setWeatherModifiers(cond.windSpeedKmh, weather === 'blizzard');

    if (weather === 'aurora_solstice') {
      synthAudio.playCelestialShimmer();
      this.checkAchievement('aurora_reveler');
    }
    if (weather === 'blizzard') {
      this.checkAchievement('blizzard_survivor');
    }

    this.triggerMessage(`Weather Shift: ${cond.name} (${cond.temperatureC}°C, Wind ${cond.windSpeedKmh}km/h)!`);
    this.pushHUDUpdate();
  }

  public triggerSolsticeCeremony(ceremonyId: string): boolean {
    const ceremony = SOLSTICE_CEREMONIES.find((c) => c.id === ceremonyId);
    if (!ceremony) return false;

    if (this.loveLetters < ceremony.costLetters) return false;
    this.loveLetters -= ceremony.costLetters;

    this.activeCeremonyId = ceremony.id;
    this.activeCeremonyTimer = ceremony.durationSec;

    synthAudio.playCelestialShimmer();
    this.setWeather(ceremony.weatherTrigger);
    this.particles.emitRomanticHearts(this.posX, 2.5, this.posZ, 30);
    this.triggerMessage(`✨ Solstice Ceremony Invoked: ${ceremony.name}!`);

    this.saveProgressState();
    this.pushHUDUpdate();
    return true;
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
    this.triggerMessage('Welcome to Valentine Valley! Clear the snowy roads & reunite the lovers!');
  }

  public setGameState(state: GameState) {
    this.gameState = state;
    if (state === 'PLAYING') {
      synthAudio.resume();
    }
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
    const quest = SOLSTICE_QUESTS.find((q) => q.id === questId);
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

  private saveProgressState() {
    saveGameProgress({
      loveLetters: this.loveLetters,
      upgrades: { ...this.upgrades },
      clearedLandmarkIds: this.landmarks.filter((l) => l.cleared).map((l) => l.id),
      unlockedGiftIds: this.gifts.filter((g) => g.collected).map((g) => g.id),
      completedQuestIds: [...this.completedQuestIds],
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
      return;
    }

    // Dynamic Weather progression & forecast timer
    this.weatherTimer -= dt;
    if (this.weatherTimer <= 0) {
      this.weatherTimer = 120;
      this.setWeather(this.nextWeather);

      const weatherTypes: WeatherType[] = ['calm_snow', 'golden_dawn', 'blizzard', 'aurora_solstice'];
      const remainingTypes = weatherTypes.filter((w) => w !== this.currentWeather);
      this.nextWeather = remainingTypes[Math.floor(Math.random() * remainingTypes.length)];
    }

    if (this.activeCeremonyId && this.activeCeremonyTimer > 0) {
      this.activeCeremonyTimer -= dt;
      if (this.activeCeremonyTimer <= 0) {
        this.activeCeremonyId = null;
        this.triggerMessage('Solstice ceremony duration ended.');
      }
    }

    const currentWeatherCond = WEATHER_CONDITIONS[this.currentWeather];

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

    // Upgrades values & Weather bonus
    const bladeTier = UPGRADES.bladeWidth.tiers[this.upgrades.bladeWidth - 1];
    const bladeWidth = bladeTier.statValue;

    const lanternTier = UPGRADES.thermalLantern.tiers[this.upgrades.thermalLantern - 1];
    const thermalRadius = Math.max(0, lanternTier.statValue + currentWeatherCond.warmthAuraBonus);

    const boostTier = UPGRADES.steamBoost.tiers[this.upgrades.steamBoost - 1];
    const boostMultiplier = boostTier.statValue;

    const magnetTier = UPGRADES.loveMagnet.tiers[this.upgrades.loveMagnet - 1];
    const magnetRadius = magnetTier.statValue * (this.currentWeather === 'aurora_solstice' ? 1.5 : 1.0);

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

    // 2. Tractor Kinematics Simulation
    const maxSpeed = (throttle >= 0 ? 12 : 6) * (this.isBoosting ? boostMultiplier : 1.0) * currentWeatherCond.speedMultiplier;
    const accelRate = (this.isBoosting ? 16 : 10) * currentWeatherCond.speedMultiplier;
    const frictionRate = 6;
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
    const maxSpeed = (throttle >= 0 ? 12 : 6) * (this.isBoosting ? boostMultiplier : 1.0);
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

          synthAudio.playComboChime(this.comboLevel);
          this.particles.emitRomanticHearts(this.posX, 1.2, this.posZ, 8);
          this.cameraShakeIntensity = 0.15;

          // Gain love letters on combo progression with weather bonus multiplier
          const currentCombo = COMBO_LEVELS[this.comboLevel - 1];
          const lettersGained = Math.round(5 * currentCombo.multiplier * currentWeatherCond.comboBonusMultiplier);
          this.loveLetters += lettersGained;
          this.addWinterPassXp(Math.round(15 * currentCombo.multiplier));
          saveGameProgress({ loveLetters: this.loveLetters });
          this.triggerMessage(`${currentCombo.title}! Combo x${currentCombo.multiplier.toFixed(1)} (+${lettersGained} Letters)`);
        }
      }
    } else {
      // Decay combo timer when not actively plowing snow
      if (this.comboTimer > 0) {
        this.comboTimer -= dt;
        if (this.comboTimer <= 0) {
          if (this.comboLevel > 1) {
            this.comboLevel = 1;
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

          saveGameProgress({
            unlockedGiftIds: this.gifts.filter((g) => g.collected).map((g) => g.id),
            loveLetters: this.loveLetters,
          });

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

    // Check Victory Condition: All 4 landmarks cleared
    if (allCleared && this.landmarks.length > 0) {
      this.gameState = 'VICTORY';
      this.checkAchievement('grand_savior');
      synthAudio.playLandmarkReunion();
      this.triggerMessage('Grand Solstice Reached! The whole village is reunited in love!');
    }

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
      currentWeather: this.currentWeather,
      nextWeather: this.nextWeather,
      timeUntilForecastSec: Math.max(0, this.weatherTimer),
      activeCeremonyId: this.activeCeremonyId,
      activeCeremonyRemainingSec: Math.max(0, this.activeCeremonyTimer),
      weather: weatherCond,
      weatherCycleTimeLeft: Math.max(0, Math.round(this.weatherCycleTimer)),
      winterPassXp: this.winterPassXp,
      winterPassLevel: currentLevel,
      claimedPassTierIds: [...this.claimedPassTierIds],
      unclaimedPassRewardsCount: unclaimedCount,
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
      currentWeather: this.currentWeather,
      nextWeather: this.nextWeather,
      timeUntilForecastSec: Math.max(0, this.weatherTimer),
      activeCeremonyId: this.activeCeremonyId,
      activeCeremonyRemainingSec: Math.max(0, this.activeCeremonyTimer),
      weather: weatherCond,
      weatherCycleTimeLeft: Math.max(0, Math.round(this.weatherCycleTimer)),
      winterPassXp: this.winterPassXp,
      winterPassLevel: currentLevel,
      claimedPassTierIds: [...this.claimedPassTierIds],
      unclaimedPassRewardsCount: unclaimedCount,
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
    this.comboLevel = 1;
    this.comboTimer = 0;
    this.snowClearedAccumulator = 0;
    this.snowClearedPercent = 0;

    // Reset landmarks & gifts
    this.landmarks.forEach((l) => {
      l.cleared = false;
      const c = this.coupleMeshes.get(l.id);
      if (c) c.visible = false;
    });
    this.gifts.forEach((g) => {
      g.collected = false;
      const m = this.giftMeshes.get(g.id);
      if (m) m.visible = false;
    });

    this.gameState = 'PLAYING';
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
