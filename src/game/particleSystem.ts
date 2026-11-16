/**
 * High-performance Pooled Particle System for Snowbound Hearts
 * Simulates snow plow spray, ambient snowflakes, glowing romantic hearts,
 * boost embers, and 3D combo milestone burst effects (expanding halo rings,
 * rising 3D heart crest, and radial heart/starlight fountains).
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
  swirl: number;
  gravity: number;
  drag: number;
  life: number;
  maxLife: number;
  r: number;
  g: number;
  b: number;
}

interface MilestoneBurstEffect {
  active: boolean;
  age: number;
  duration: number;
  maxScale: number;
  originX: number;
  originZ: number;
  ringMesh: THREE.Mesh;
  innerRingMesh: THREE.Mesh;
  crestMesh: THREE.Mesh;
  ringMat: THREE.MeshBasicMaterial;
  innerRingMat: THREE.MeshBasicMaterial;
  crestMat: THREE.MeshStandardMaterial;
}

export class ParticleSystem {
  // Snow spray & exhaust particles
  private maxParticles = 600;
  private particles: Particle[] = [];
  private pointsMesh: THREE.Points;
  private positions: Float32Array;
  private colors: Float32Array;

  // Glowing Heart & Sparkle burst particles
  private maxHeartParticles = 260;
  private heartParticles: Particle[] = [];
  private heartPointsMesh: THREE.Points;
  private heartPositions: Float32Array;
  private heartColors: Float32Array;

  // Pooled 3D Combo Milestone Ring + Rising Heart Crest effects
  private milestonePool: MilestoneBurstEffect[] = [];
  private sharedRingGeo: THREE.RingGeometry;
  private sharedInnerRingGeo: THREE.RingGeometry;
  private sharedCrestGeo: THREE.ExtrudeGeometry;

  // Ambient falling snow particles
  private maxSnowflakes = 800;
  private snowMesh: THREE.Points;
  private snowPositions: Float32Array;
  private snowVelocities: Float32Array;

  // Procedural Canvas Textures
  private circleTexture: THREE.CanvasTexture;
  private heartTexture: THREE.CanvasTexture;

  constructor(scene: THREE.Scene) {
    this.circleTexture = this.createCircleTexture();
    this.heartTexture = this.createHeartTexture();

    // 1. Dynamic action particles (plow spray, exhaust puffs)
    this.positions = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);

    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createEmptyParticle());
      this.positions[i * 3 + 1] = -100;
    }

    const actionGeo = new THREE.BufferGeometry();
    actionGeo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    actionGeo.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    const actionMat = new THREE.PointsMaterial({
      size: 0.35,
      map: this.circleTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    this.pointsMesh = new THREE.Points(actionGeo, actionMat);
    scene.add(this.pointsMesh);

    // 2. Luminous Heart & Sparkle burst particles (additive glow)
    this.heartPositions = new Float32Array(this.maxHeartParticles * 3);
    this.heartColors = new Float32Array(this.maxHeartParticles * 3);

    for (let i = 0; i < this.maxHeartParticles; i++) {
      this.heartParticles.push(this.createEmptyParticle());
      this.heartPositions[i * 3 + 1] = -100;
    }

    const heartGeo = new THREE.BufferGeometry();
    heartGeo.setAttribute('position', new THREE.BufferAttribute(this.heartPositions, 3));
    heartGeo.setAttribute('color', new THREE.BufferAttribute(this.heartColors, 3));

    const heartMat = new THREE.PointsMaterial({
      size: 0.85,
      map: this.heartTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.heartPointsMesh = new THREE.Points(heartGeo, heartMat);
    scene.add(this.heartPointsMesh);

    // 3. Pooled 3D Combo Milestone Shockwave Rings + Extruded Heart Crest
    this.sharedRingGeo = new THREE.RingGeometry(0.75, 1.0, 40);
    this.sharedRingGeo.rotateX(-Math.PI / 2);

    this.sharedInnerRingGeo = new THREE.RingGeometry(0.45, 0.62, 32);
    this.sharedInnerRingGeo.rotateX(-Math.PI / 2);

    this.sharedCrestGeo = this.createHeartCrestGeometry();

    for (let i = 0; i < 4; i++) {
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xf472b6,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const ringMesh = new THREE.Mesh(this.sharedRingGeo, ringMat);
      ringMesh.visible = false;
      scene.add(ringMesh);

      const innerRingMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const innerRingMesh = new THREE.Mesh(this.sharedInnerRingGeo, innerRingMat);
      innerRingMesh.visible = false;
      scene.add(innerRingMesh);

      const crestMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xf43f5e,
        emissiveIntensity: 1.4,
        roughness: 0.25,
        metalness: 0.3,
        transparent: true,
        opacity: 0,
      });
      const crestMesh = new THREE.Mesh(this.sharedCrestGeo, crestMat);
      crestMesh.visible = false;
      scene.add(crestMesh);

      this.milestonePool.push({
        active: false,
        age: 0,
        duration: 0.95,
        maxScale: 4.5,
        originX: 0,
        originZ: 0,
        ringMesh,
        innerRingMesh,
        crestMesh,
        ringMat,
        innerRingMat,
        crestMat,
      });
    }

    // 4. Ambient drifting snowflakes
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
      map: this.circleTexture,
      transparent: true,
      opacity: 0.85,
      color: 0xffffff,
      depthWrite: false,
    });

    this.snowMesh = new THREE.Points(snowGeo, snowMat);
    scene.add(this.snowMesh);
  }

  private createEmptyParticle(): Particle {
    return {
      active: false,
      x: 0,
      y: -100,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      swirl: 0,
      gravity: 4.2,
      drag: 0.94,
      life: 0,
      maxLife: 1,
      r: 1,
      g: 1,
      b: 1,
    };
  }

  private createHeartCrestGeometry(): THREE.ExtrudeGeometry {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.22);
    shape.bezierCurveTo(0.18, 0.45, 0.52, 0.38, 0.52, 0.08);
    shape.bezierCurveTo(0.52, -0.18, 0.24, -0.34, 0, -0.52);
    shape.bezierCurveTo(-0.24, -0.34, -0.52, -0.18, -0.52, 0.08);
    shape.bezierCurveTo(-0.52, 0.38, -0.18, 0.45, 0, 0.22);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 2,
    });
    geo.center();
    return geo;
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

    return new THREE.CanvasTexture(canvas);
  }

  private createHeartTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Soft radiant aura behind heart
    const glow = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
    glow.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 64, 64);

    // Crisp heart silhouette
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(32, 24);
    ctx.bezierCurveTo(32, 16, 18, 12, 14, 22);
    ctx.bezierCurveTo(10, 32, 22, 42, 32, 52);
    ctx.bezierCurveTo(42, 42, 54, 32, 50, 22);
    ctx.bezierCurveTo(46, 12, 32, 16, 32, 24);
    ctx.closePath();
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
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
        this.particles,
        this.maxParticles,
        x + Math.sin(sprayAngle) * 0.8,
        y + 0.25 + Math.random() * 0.2,
        z + Math.cos(sprayAngle) * 0.8,
        Math.sin(sprayAngle) * spraySpeed + (Math.random() - 0.5) * 0.5,
        1.2 + Math.random() * 1.8,
        Math.cos(sprayAngle) * spraySpeed + (Math.random() - 0.5) * 0.5,
        0,
        4.2,
        0.94,
        0.4 + Math.random() * 0.35,
        0.95,
        0.98,
        1.0
      );
    }
  }

  /**
   * Emit glowing romantic heart burst (pickups, landmark reunions, daily challenges)
   */
  public emitRomanticHearts(x: number, y: number, z: number, count: number = 8) {
    for (let i = 0; i < count; i++) {
      const dirAngle = Math.random() * Math.PI * 2;
      const speed = 1.4 + Math.random() * 2.8;

      const isGold = Math.random() > 0.6;
      const r = isGold ? 1.0 : 0.98;
      const g = isGold ? 0.82 : 0.32;
      const b = isGold ? 0.25 : 0.55;

      this.spawnParticle(
        this.heartParticles,
        this.maxHeartParticles,
        x + (Math.random() - 0.5) * 0.7,
        y + 0.5,
        z + (Math.random() - 0.5) * 0.7,
        Math.sin(dirAngle) * speed,
        2.6 + Math.random() * 2.6,
        Math.cos(dirAngle) * speed,
        (Math.random() - 0.5) * 1.4,
        2.2,
        0.95,
        0.85 + Math.random() * 0.55,
        r,
        g,
        b
      );
    }
  }

  /**
   * Celebratory 3D particle burst & expanding shockwave halo for Combo Multiplier milestones
   */
  public emitComboMilestoneBurst(
    x: number,
    y: number,
    z: number,
    comboLevel: number,
    colorHex: string = '#f472b6'
  ) {
    const tierColor = new THREE.Color(colorHex);
    const goldColor = new THREE.Color(0xfbbf24);

    // 1. Trigger pooled 3D shockwave ring + rising 3D heart crest
    const slot = this.milestonePool.find((m) => !m.active) || this.milestonePool[0];
    slot.active = true;
    slot.age = 0;
    slot.duration = 0.85 + Math.min(0.45, comboLevel * 0.05);
    slot.maxScale = 3.8 + comboLevel * 0.65;
    slot.originX = x;
    slot.originZ = z;

    slot.ringMat.color.copy(tierColor);
    slot.ringMat.opacity = 0.95;
    slot.ringMesh.position.set(x, 0.14, z);
    slot.ringMesh.scale.setScalar(0.8);
    slot.ringMesh.visible = true;

    slot.innerRingMat.color.copy(comboLevel >= 4 ? goldColor : tierColor);
    slot.innerRingMat.opacity = 0.85;
    slot.innerRingMesh.position.set(x, 0.16, z);
    slot.innerRingMesh.scale.setScalar(0.6);
    slot.innerRingMesh.visible = true;

    slot.crestMat.color.copy(tierColor);
    slot.crestMat.emissive.copy(tierColor);
    slot.crestMat.opacity = 1.0;
    slot.crestMesh.position.set(x, y + 1.8, z);
    slot.crestMesh.rotation.set(0, 0, 0);
    slot.crestMesh.scale.setScalar(0.9 + comboLevel * 0.08);
    slot.crestMesh.visible = true;

    // 2. Radial Shockwave Ring of Luminous Hearts
    const ringCount = 14 + comboLevel * 4;
    for (let i = 0; i < ringCount; i++) {
      const theta = (i / ringCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.18;
      const radialSpeed = 4.0 + comboLevel * 0.45 + Math.random() * 1.4;
      const useGold = i % 3 === 0;
      const c = useGold ? goldColor : tierColor;

      this.spawnParticle(
        this.heartParticles,
        this.maxHeartParticles,
        x + Math.sin(theta) * 0.9,
        y + 0.6,
        z + Math.cos(theta) * 0.9,
        Math.sin(theta) * radialSpeed,
        2.4 + Math.random() * 1.8,
        Math.cos(theta) * radialSpeed,
        0.9,
        2.4,
        0.93,
        0.9 + Math.random() * 0.4,
        c.r,
        c.g,
        c.b
      );
    }

    // 3. Spiraling Starlight Fountain above the tractor
    const fountainCount = 10 + comboLevel * 3;
    for (let i = 0; i < fountainCount; i++) {
      const angle = (i / fountainCount) * Math.PI * 4;
      const speed = 1.0 + Math.random() * 1.8;
      const mix = (i % 2 === 0 ? tierColor : goldColor);

      this.spawnParticle(
        this.heartParticles,
        this.maxHeartParticles,
        x + Math.sin(angle) * 0.45,
        y + 1.2,
        z + Math.cos(angle) * 0.45,
        Math.sin(angle) * speed,
        4.6 + Math.random() * (2.2 + comboLevel * 0.35),
        Math.cos(angle) * speed,
        comboLevel >= 5 ? 2.4 : 1.6,
        1.8,
        0.96,
        1.05 + Math.random() * 0.45,
        Math.min(1, mix.r * 1.1),
        Math.min(1, mix.g * 1.1),
        Math.min(1, mix.b * 1.1)
      );
    }
  }

  /**
   * Emit steam exhaust puffs from tractor chimney
   */
  public emitExhaustPuff(x: number, y: number, z: number, isBoosting: boolean) {
    if (Math.random() > (isBoosting ? 0.9 : 0.4)) return;

    this.spawnParticle(
      this.particles,
      this.maxParticles,
      x + (Math.random() - 0.5) * 0.1,
      y,
      z + (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.3,
      1.0 + Math.random() * 1.5,
      (Math.random() - 0.5) * 0.3,
      0,
      4.2,
      0.94,
      0.6 + Math.random() * 0.4,
      isBoosting ? 0.96 : 0.9,
      isBoosting ? 0.4 : 0.9,
      isBoosting ? 0.6 : 0.9
    );
  }

  private spawnParticle(
    pool: Particle[],
    maxCount: number,
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    swirl: number,
    gravity: number,
    drag: number,
    maxLife: number,
    r: number,
    g: number,
    b: number
  ) {
    for (let i = 0; i < maxCount; i++) {
      const p = pool[i];
      if (!p.active) {
        p.active = true;
        p.x = x;
        p.y = y;
        p.z = z;
        p.vx = vx;
        p.vy = vy;
        p.vz = vz;
        p.swirl = swirl;
        p.gravity = gravity;
        p.drag = drag;
        p.life = 0;
        p.maxLife = maxLife;
        p.r = r;
        p.g = g;
        p.b = b;
        return;
      }
    }
  }

  private updateParticlePool(
    pool: Particle[],
    maxCount: number,
    positions: Float32Array,
    colors: Float32Array,
    dt: number
  ) {
    const dragPow = Math.pow(0.94, dt * 60);
    for (let i = 0; i < maxCount; i++) {
      const p = pool[i];
      if (p.active) {
        p.life += dt;
        if (p.life >= p.maxLife) {
          p.active = false;
          p.y = -100;
        } else {
          if (p.swirl !== 0) {
            const cosS = Math.cos(p.swirl * dt);
            const sinS = Math.sin(p.swirl * dt);
            const nvx = p.vx * cosS - p.vz * sinS;
            const nvz = p.vx * sinS + p.vz * cosS;
            p.vx = nvx;
            p.vz = nvz;
          }

          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.z += p.vz * dt;

          p.vy -= p.gravity * dt;
          const stepDrag = p.drag === 0.94 ? dragPow : Math.pow(p.drag, dt * 60);
          p.vx *= stepDrag;
          p.vz *= stepDrag;

          const progress = p.life / p.maxLife;
          const fade = 1 - progress;

          colors[i * 3 + 0] = p.r * fade;
          colors[i * 3 + 1] = p.g * fade;
          colors[i * 3 + 2] = p.b * fade;
        }

        positions[i * 3 + 0] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;
      }
    }
  }

  /**
   * Update particle positions and 3D milestone burst meshes per frame
   */
  public update(dt: number, cameraPos: THREE.Vector3, windSpeed: number = 0.8, particleSpeedMult: number = 1.0) {
    // 1. Update snow/exhaust particles
    const posAttr = this.pointsMesh.geometry.getAttribute('position') as THREE.BufferAttribute;
    const colAttr = this.pointsMesh.geometry.getAttribute('color') as THREE.BufferAttribute;
    this.updateParticlePool(this.particles, this.maxParticles, this.positions, this.colors, dt);
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // 2. Update glowing heart & milestone particles
    const heartPosAttr = this.heartPointsMesh.geometry.getAttribute('position') as THREE.BufferAttribute;
    const heartColAttr = this.heartPointsMesh.geometry.getAttribute('color') as THREE.BufferAttribute;
    this.updateParticlePool(this.heartParticles, this.maxHeartParticles, this.heartPositions, this.heartColors, dt);
    heartPosAttr.needsUpdate = true;
    heartColAttr.needsUpdate = true;

    // 3. Update 3D Combo Milestone Shockwave Rings & Heart Crests
    for (const m of this.milestonePool) {
      if (!m.active) continue;
      m.age += dt;
      if (m.age >= m.duration) {
        m.active = false;
        m.ringMesh.visible = false;
        m.innerRingMesh.visible = false;
        m.crestMesh.visible = false;
        continue;
      }

      const t = m.age / m.duration;
      const easeOut = 1 - Math.pow(1 - t, 3);

      // Expanding outer shockwave ring
      const outerScale = 0.8 + easeOut * m.maxScale;
      m.ringMesh.scale.setScalar(outerScale);
      m.ringMat.opacity = Math.max(0, (1 - t) * 0.9);

      // Delayed secondary inner ring
      const innerT = Math.max(0, Math.min(1, (t - 0.12) / 0.88));
      const innerEase = 1 - Math.pow(1 - innerT, 3);
      m.innerRingMesh.scale.setScalar(0.6 + innerEase * (m.maxScale * 0.72));
      m.innerRingMat.opacity = Math.max(0, (1 - innerT) * 0.8);

      // Rising, spinning 3D bevelled heart crest
      m.crestMesh.position.y = 2.0 + easeOut * 2.8;
      m.crestMesh.rotation.y += 4.2 * dt;
      const popScale = t < 0.25 ? 0.5 + (t / 0.25) * 0.8 : 1.3 - (t - 0.25) * 0.45;
      m.crestMesh.scale.setScalar(Math.max(0.1, popScale));
      m.crestMat.opacity = t > 0.65 ? Math.max(0, (1 - t) / 0.35) : 1.0;
    }

    // 4. Update ambient snow centered around camera
    const snowAttr = this.snowMesh.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < this.maxSnowflakes; i++) {
      let sx = this.snowPositions[i * 3 + 0] + (this.snowVelocities[i * 3 + 0] + windSpeed) * dt;
      let sy = this.snowPositions[i * 3 + 1] + (this.snowVelocities[i * 3 + 1] * particleSpeedMult) * dt;
      let sz = this.snowPositions[i * 3 + 2] + (this.snowVelocities[i * 3 + 2] + windSpeed * 0.3) * dt;

      // Wrap snow within camera volume
      if (sy < 0.2) {
        sy = 22 + Math.random() * 4;
        sx = cameraPos.x + (Math.random() - 0.5) * 70;
        sz = cameraPos.z + (Math.random() - 0.5) * 70;
      }
      if (Math.abs(sx - cameraPos.x) > 40) {
        sx = cameraPos.x + (Math.random() - 0.5) * 40;
      }
      if (Math.abs(sz - cameraPos.z) > 40) {
        sz = cameraPos.z + (Math.random() - 0.5) * 40;
      }

      this.snowPositions[i * 3 + 0] = sx;
      this.snowPositions[i * 3 + 1] = sy;
      this.snowPositions[i * 3 + 2] = sz;
    }

    snowAttr.needsUpdate = true;
  }

  public dispose() {
    this.pointsMesh.geometry.dispose();
    (this.pointsMesh.material as THREE.Material).dispose();
    this.heartPointsMesh.geometry.dispose();
    (this.heartPointsMesh.material as THREE.Material).dispose();
    this.snowMesh.geometry.dispose();
    (this.snowMesh.material as THREE.Material).dispose();
    this.circleTexture.dispose();
    this.heartTexture.dispose();

    this.sharedRingGeo.dispose();
    this.sharedInnerRingGeo.dispose();
    this.sharedCrestGeo.dispose();
    for (const m of this.milestonePool) {
      m.ringMat.dispose();
      m.innerRingMat.dispose();
      m.crestMat.dispose();
    }
  }
}
