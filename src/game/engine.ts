/**
 * Core 3D Game Engine for Snowbound Hearts
 * Isometric snow-plowing simulation with procedural PBR, combo multipliers,
 * hitstop, camera shake, vehicle kinematics, and low-occlusion HUD integration.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { synthAudio } from '../audio/synthAudio';
import {
  COMBO_LEVELS,
  LANDMARKS,
  ROMANTIC_GIFTS,
  UPGRADES,
  WORLD_SIZE,
  type GameState,
  type Landmark,
  type RomanticGift,
} from './constants';
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
}

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
  private loveLetters: number = 20; // Starting love letters for early garage exploration
  private upgrades: Record<string, number> = {
    bladeWidth: 1,
    thermalLantern: 1,
    steamBoost: 1,
    loveMagnet: 1,
    comboTimer: 1,
  };

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

    this.initWebGL();
    this.initScene();
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
    const hemiLight = new THREE.HemisphereLight(0xbfdbfe, 0x1e293b, 0.9);
    this.scene.add(hemiLight);

    // Warm Golden Key Light (Low winter sun casting long shadows)
    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    sunLight.position.set(40, 55, 30);
    if (!this.isSoftwareGl) {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 10;
      sunLight.shadow.camera.far = 130;
      const d = 45;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0004;
      sunLight.shadow.normalBias = 0.02;
    }
    this.scene.add(sunLight);

    // Soft Romantic Violet Rim Fill
    const rimLight = new THREE.DirectionalLight(0xf472b6, 0.6);
    rimLight.position.set(-35, 25, -35);
    this.scene.add(rimLight);

    // 3. Subsystems
    this.snowGrid = new SnowGridSystem(this.scene);
    this.particles = new ParticleSystem(this.scene);

    // 4. Hero Tractor
    const tractorData = createHeartPlowTractor();
    this.tractorGroup = tractorData.group;
    this.plowBladeGroup = tractorData.plowGroup;
    this.frontWheels = tractorData.wheelsFront;
    this.rearWheels = tractorData.wheelsRear;
    this.exhaustStack = tractorData.exhaustStack;
    this.headlampL = tractorData.headlightL;
    this.headlampR = tractorData.headlightR;

    this.tractorGroup.position.set(0, 0, 0);
    this.scene.add(this.tractorGroup);

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }
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
    this.landmarks = LANDMARKS.map((lm) => ({ ...lm, cleared: false }));

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

      // Reunited couple initially hidden until cleared
      const couple = createCoupleModel();
      couple.position.set(lm.x + 1.8, 0, lm.z + 1.8);
      couple.visible = false;
      this.scene.add(couple);
      this.coupleMeshes.set(lm.id, couple);
    });

    // 5. Buried Romantic Collectibles
    this.gifts = ROMANTIC_GIFTS.map((g) => ({ ...g, collected: false }));
    this.gifts.forEach((g) => {
      const giftGroup = createCollectibleGift();
      giftGroup.position.set(g.x, 0.4, g.z);
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

      synthAudio.playUpgradeSound();
      this.triggerMessage(`Upgraded ${config.name} to Tier ${currentLevel + 1}: ${nextTier.title}!`);

      // Visual upgrade adjustments (e.g. widen blade mesh)
      if (upgradeId === 'bladeWidth') {
        const width = nextTier.statValue;
        this.plowBladeGroup.scale.set(width / 2.2, 1, 1);
      }

      this.pushHUDUpdate();
      return true;
    }
    return false;
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
      this.particles.update(dt, this.camera.position);

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

    // 2. Tractor Kinematics Simulation
    const maxSpeed = (throttle >= 0 ? 12 : 6) * (this.isBoosting ? boostMultiplier : 1.0);
    const accelRate = (this.isBoosting ? 16 : 10);
    const frictionRate = 6;

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

      // Combo management: continuous plowing sustains and escalates combo
      this.comboTimer = comboWindow;
      if (this.snowClearedAccumulator > 35 * this.comboLevel) {
        this.snowClearedAccumulator = 0;
        if (this.comboLevel < COMBO_LEVELS.length) {
          this.comboLevel++;
          synthAudio.playComboChime(this.comboLevel);
          this.particles.emitRomanticHearts(this.posX, 1.2, this.posZ, 8);
          this.cameraShakeIntensity = 0.15;

          // Gain love letters on combo progression
          const currentCombo = COMBO_LEVELS[this.comboLevel - 1];
          const lettersGained = Math.round(5 * currentCombo.multiplier);
          this.loveLetters += lettersGained;
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
          synthAudio.playGiftPickup();
          this.hitstopDuration = 0.06; // brief hitstop
          this.particles.emitRomanticHearts(gift.x, 1.0, gift.z, 20);
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
          this.triggerMessage(`${landmark.name} Cleared! Couple reunited: ${randomQuote}`);
        } else {
          allCleared = false;
        }
      }
    });

    // Check Victory Condition: All 4 landmarks cleared or >85% total snow cleared
    if (allCleared && this.landmarks.length > 0) {
      this.gameState = 'VICTORY';
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

  private pushHUDUpdate() {
    if (!this.onHUDUpdate) return;

    const currentCombo = COMBO_LEVELS[this.comboLevel - 1] || COMBO_LEVELS[0];
    const comboTier = UPGRADES.comboTimer.tiers[this.upgrades.comboTimer - 1];
    const comboWindow = comboTier.statValue;

    const clearedLandmarks = this.landmarks.filter((l) => l.cleared).length;
    const collectedGifts = this.gifts.filter((g) => g.collected).length;

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
    });
  }

  public getStats(): GameHUDStats {
    const currentCombo = COMBO_LEVELS[this.comboLevel - 1] || COMBO_LEVELS[0];
    const comboTier = UPGRADES.comboTimer.tiers[this.upgrades.comboTimer - 1];
    const comboWindow = comboTier.statValue;
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
    };
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
