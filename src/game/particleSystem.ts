/**
 * High-performance Pooled Particle System for Snowbound Hearts
 * Simulates snow plow spray, ambient snowflakes, floating romantic hearts,
 * boost embers, and celebration sparks.
 */

import * as THREE from 'three';

interface Particle {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  r: number;
  g: number;
  b: number;
  alpha: number;
}

export class ParticleSystem {
  // Snow spray & sparks particles (Instanced or BufferGeometry points)
  private maxParticles = 600;
  private particles: Particle[] = [];
  private pointsMesh: THREE.Points;
  private positions: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;

  // Ambient falling snow particles
  private maxSnowflakes = 800;
  private snowMesh: THREE.Points;
  private snowPositions: Float32Array;
  private snowVelocities: Float32Array;

  // Weather-driven dynamics
  private windVx: number = 0.5;
  private windVz: number = 0.2;
  private weatherIntensity: number = 1.0;
  private isBlizzard: boolean = false;
  private isAurora: boolean = false;

  constructor(scene: THREE.Scene) {
    // 1. Dynamic action particles (plow spray, hearts, sparks)
    this.positions = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);
    this.sizes = new Float32Array(this.maxParticles);

    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push({
        active: false,
        x: 0,
        y: -100,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 1,
        size: 1,
        r: 1,
        g: 1,
        b: 1,
        alpha: 1,
      });
      this.positions[i * 3 + 1] = -100;
      this.sizes[i] = 0;
    }

    const actionGeo = new THREE.BufferGeometry();
    actionGeo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    actionGeo.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    actionGeo.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));

    const particleTexture = this.createCircleTexture();
    const actionMat = new THREE.PointsMaterial({
      size: 0.35,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    this.pointsMesh = new THREE.Points(actionGeo, actionMat);
    scene.add(this.pointsMesh);

    // 2. Ambient drifting snowflakes
    this.snowPositions = new Float32Array(this.maxSnowflakes * 3);
    this.snowVelocities = new Float32Array(this.maxSnowflakes * 3);

    for (let i = 0; i < this.maxSnowflakes; i++) {
      this.snowPositions[i * 3 + 0] = (Math.random() - 0.5) * 80;
      this.snowPositions[i * 3 + 1] = Math.random() * 24;
      this.snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 80;

      this.snowVelocities[i * 3 + 0] = (Math.random() - 0.5) * 0.8;
      this.snowVelocities[i * 3 + 1] = -1.2 - Math.random() * 1.5;
      this.snowVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }

    const snowGeo = new THREE.BufferGeometry();
    snowGeo.setAttribute('position', new THREE.BufferAttribute(this.snowPositions, 3));

    const snowMat = new THREE.PointsMaterial({
      size: 0.22,
      map: particleTexture,
      transparent: true,
      opacity: 0.85,
      color: 0xffffff,
      depthWrite: false,
    });

    this.snowMesh = new THREE.Points(snowGeo, snowMat);
    scene.add(this.snowMesh);
  }

  private createCircleTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(16, 16, 16, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  /**
   * Emit snow spray bursts from the plow blade wings
   */
  public emitSnowSpray(x: number, y: number, z: number, angle: number, speed: number) {
    const count = Math.min(10, Math.floor(speed * 1.6));
    const leftAngle = angle + Math.PI / 2 + (Math.random() - 0.5) * 0.4;
    const rightAngle = angle - Math.PI / 2 + (Math.random() - 0.5) * 0.4;

    for (let i = 0; i < count; i++) {
      const sprayAngle = i % 2 === 0 ? leftAngle : rightAngle;
      const spraySpeed = 1.5 + Math.random() * speed * 0.8;

      this.spawnParticle(
        x + Math.sin(sprayAngle) * 0.8,
        y + 0.25 + Math.random() * 0.2,
        z + Math.cos(sprayAngle) * 0.8,
        Math.sin(sprayAngle) * spraySpeed + (Math.random() - 0.5) * 0.5,
        1.2 + Math.random() * 1.8,
        Math.cos(sprayAngle) * spraySpeed + (Math.random() - 0.5) * 0.5,
        0.4 + Math.random() * 0.35,
        0.35 + Math.random() * 0.3,
        0.95,
        0.98,
        1.0 // crisp white-blue snow powder
      );
    }
  }

  /**
   * Emit romantic heart / sparkle burst
   */
  /**
   * Set ambient wind and weather characteristics for falling snow & particles
   */
  public setWeatherParameters(windSpeedKmh: number, windAngleRad: number, weatherType: string) {
    const speedRatio = windSpeedKmh / 30; // normalized speed
    this.windVx = Math.sin(windAngleRad) * speedRatio * 3.5;
    this.windVz = Math.cos(windAngleRad) * speedRatio * 3.5;
    this.isBlizzard = weatherType === 'blizzard';
    this.isAurora = weatherType === 'aurora_shower';
    this.weatherIntensity = this.isBlizzard ? 2.2 : (weatherType === 'golden_hearth' ? 0.6 : 1.0);

    // Modulate snowflake material appearance
    const mat = this.snowMesh.material as THREE.PointsMaterial;
    if (this.isBlizzard) {
      mat.size = 0.38;
      mat.opacity = 0.95;
      mat.color.setHex(0xe2e8f0);
    } else if (this.isAurora) {
      mat.size = 0.28;
      mat.opacity = 0.9;
      mat.color.setHex(0xa7f3d0); // subtle shimmering green tint
    } else {
      mat.size = 0.22;
      mat.opacity = 0.85;
      mat.color.setHex(0xffffff);
    }
  }

  /**
   * Emit celestial aurora starlight sparkle
   */
  public emitAuroraSparkles(x: number, y: number, z: number, count: number = 6) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 1.5;
      const isEmerald = Math.random() > 0.4;

      this.spawnParticle(
        x + (Math.random() - 0.5) * 2,
        y + 0.5 + Math.random() * 1.5,
        z + (Math.random() - 0.5) * 2,
        Math.sin(angle) * speed,
        0.5 + Math.random() * 1.5,
        Math.cos(angle) * speed,
        0.9 + Math.random() * 0.5,
        0.4,
        isEmerald ? 0.2 : 0.75,
        isEmerald ? 0.95 : 0.4,
        isEmerald ? 0.7 : 0.95
      );
    }
  }

  public emitRomanticHearts(x: number, y: number, z: number, count: number = 8) {
    for (let i = 0; i < count; i++) {
      const dirAngle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 2.5;

      const isGold = Math.random() > 0.6;
      const r = isGold ? 0.98 : 0.95;
      const g = isGold ? 0.75 : 0.25;
      const b = isGold ? 0.15 : 0.45;

      this.spawnParticle(
        x + (Math.random() - 0.5) * 0.6,
        y + 0.5,
        z + (Math.random() - 0.5) * 0.6,
        Math.sin(dirAngle) * speed,
        2.0 + Math.random() * 2.5,
        Math.cos(dirAngle) * speed,
        0.7 + Math.random() * 0.6,
        0.45 + Math.random() * 0.4,
        r,
        g,
        b
      );
    }
  }

  /**
   * Emit steam exhaust puffs from tractor chimney
   */
  public emitExhaustPuff(x: number, y: number, z: number, isBoosting: boolean) {
    if (Math.random() > (isBoosting ? 0.9 : 0.4)) return;

    this.spawnParticle(
      x + (Math.random() - 0.5) * 0.1,
      y,
      z + (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.3,
      1.0 + Math.random() * 1.5,
      (Math.random() - 0.5) * 0.3,
      0.6 + Math.random() * 0.4,
      0.35,
      isBoosting ? 0.96 : 0.9,
      isBoosting ? 0.4 : 0.9,
      isBoosting ? 0.6 : 0.9
    );
  }

  private spawnParticle(
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    maxLife: number,
    size: number,
    r: number,
    g: number,
    b: number
  ) {
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.particles[i];
      if (!p.active) {
        p.active = true;
        p.x = x;
        p.y = y;
        p.z = z;
        p.vx = vx;
        p.vy = vy;
        p.vz = vz;
        p.life = 0;
        p.maxLife = maxLife;
        p.size = size;
        p.r = r;
        p.g = g;
        p.b = b;
        return;
      }
    }
  }

  /**
   * Update particle positions per frame
   */
  public update(dt: number, cameraPos: THREE.Vector3) {
    const posAttr = this.pointsMesh.geometry.getAttribute('position') as THREE.BufferAttribute;
    const colAttr = this.pointsMesh.geometry.getAttribute('color') as THREE.BufferAttribute;

    // 1. Update action particles
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.particles[i];
      if (p.active) {
        p.life += dt;
        if (p.life >= p.maxLife) {
          p.active = false;
          p.y = -100;
        } else {
          // Physics
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.z += p.vz * dt;

          // Drag and gravity
          p.vy -= 4.2 * dt;
          p.vx *= 0.94;
          p.vz *= 0.94;

          const progress = p.life / p.maxLife;
          const fade = 1 - progress;

          this.colors[i * 3 + 0] = p.r * fade;
          this.colors[i * 3 + 1] = p.g * fade;
          this.colors[i * 3 + 2] = p.b * fade;
        }

        this.positions[i * 3 + 0] = p.x;
        this.positions[i * 3 + 1] = p.y;
        this.positions[i * 3 + 2] = p.z;
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // 2. Update ambient snow centered around camera with wind drift
    const snowAttr = this.snowMesh.geometry.getAttribute('position') as THREE.BufferAttribute;
    const fallSpeedMult = this.isBlizzard ? 1.8 : 1.0;

    for (let i = 0; i < this.maxSnowflakes; i++) {
      // Apply ambient wind vector
      const currentVx = this.snowVelocities[i * 3 + 0] + this.windVx;
      const currentVy = this.snowVelocities[i * 3 + 1] * fallSpeedMult;
      const currentVz = this.snowVelocities[i * 3 + 2] + this.windVz;

      let sx = this.snowPositions[i * 3 + 0] + currentVx * dt;
      let sy = this.snowPositions[i * 3 + 1] + currentVy * dt;
      let sz = this.snowPositions[i * 3 + 2] + currentVz * dt;

      // Wrap snow within camera volume
      if (sy < 0.2) {
        sy = 24 + Math.random() * 4;
        sx = cameraPos.x + (Math.random() - 0.5) * 75 - this.windVx * 2;
        sz = cameraPos.z + (Math.random() - 0.5) * 75 - this.windVz * 2;
      }
      if (Math.abs(sx - cameraPos.x) > 45) {
        sx = cameraPos.x + (Math.random() - 0.5) * 45;
      }
      if (Math.abs(sz - cameraPos.z) > 45) {
        sz = cameraPos.z + (Math.random() - 0.5) * 45;
      }

      this.snowPositions[i * 3 + 0] = sx;
      this.snowPositions[i * 3 + 1] = sy;
      this.snowPositions[i * 3 + 2] = sz;
    }

    snowAttr.needsUpdate = true;
  }

  public dispose() {
    this.pointsMesh.geometry.dispose();
    this.snowMesh.geometry.dispose();
  }
}
