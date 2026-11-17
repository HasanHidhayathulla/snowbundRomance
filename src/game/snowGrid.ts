/**
 * Dynamic Snow Grid System for Snowbound Hearts
 * Manages snow coverage, plowing trails, snow bank accumulation,
 * landmark clearing metrics, and buried treasure uncovering.
 */

import * as THREE from 'three';
import { WORLD_SIZE, SNOW_GRID_RES, type LevelGroundPattern } from './constants';

export interface PlowingResult {
  cellsClearedThisFrame: number;
  totalClearedPercent: number;
  isPlowingSnow: boolean;
}

export class SnowGridSystem {
  public mesh: THREE.Mesh;
  public groundMesh: THREE.Mesh;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private snowTexture: THREE.CanvasTexture;
  private groundTexture: THREE.CanvasTexture;

  // Grid of snow depth (0.0 = completely cleared, 1.0 = deep fresh powder)
  public depthGrid: Float32Array;
  private totalCells: number;
  private initialSnowCells: number = 0;
  private clearedCells: number = 0;

  constructor(scene: THREE.Scene) {
    const size = WORLD_SIZE;
    const res = SNOW_GRID_RES;
    this.totalCells = res * res;
    this.depthGrid = new Float32Array(this.totalCells);

    // Initialize 2D canvas for high-fidelity snow mask
    const texSize = 512;
    this.canvas = document.createElement('canvas');
    this.canvas.width = texSize;
    this.canvas.height = texSize;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;

    // Draw initial fresh snow blanket with subtle noise texture
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, texSize, texSize);

    // Create CanvasTexture
    this.snowTexture = new THREE.CanvasTexture(this.canvas);
    this.snowTexture.colorSpace = THREE.SRGBColorSpace;
    this.snowTexture.minFilter = THREE.LinearFilter;
    this.snowTexture.magFilter = THREE.LinearFilter;

    // 1. Cleared Ground Mesh (Underneath)
    this.groundTexture = this.createGroundTexture('cobblestone');
    const groundGeo = new THREE.PlaneGeometry(size + 16, size + 16);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      map: this.groundTexture,
      roughness: 0.85,
      metalness: 0.1,
      color: 0x334155,
    });
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.position.y = 0.0;
    this.groundMesh.receiveShadow = true;
    scene.add(this.groundMesh);

    // 2. Snow Blanket Mesh (Slightly elevated, uses dynamic alpha mask)
    const snowGeo = new THREE.PlaneGeometry(size, size, 32, 32);
    snowGeo.rotateX(-Math.PI / 2);

    const snowMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.85,
      metalness: 0.05,
      alphaMap: this.snowTexture,
      transparent: true,
      depthWrite: true,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    this.mesh = new THREE.Mesh(snowGeo, snowMat);
    this.mesh.position.y = 0.04;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);

    // Initialize snow grid values
    this.initSnowGrid();
  }

  private initSnowGrid() {
    this.initialSnowCells = 0;
    for (let i = 0; i < this.totalCells; i++) {
      this.depthGrid[i] = 1.0;
      this.initialSnowCells++;
    }
    this.clearedCells = 0;
  }

  /**
   * Swap ground paving pattern and snow tint to match the selected level map
   */
  public configureMapTheme(pattern: LevelGroundPattern, groundColor: number, snowTintHex: number) {
    const nextTex = this.createGroundTexture(pattern);
    const groundMat = this.groundMesh.material as THREE.MeshStandardMaterial;
    if (this.groundTexture) {
      this.groundTexture.dispose();
    }
    this.groundTexture = nextTex;
    groundMat.map = nextTex;
    groundMat.color.setHex(groundColor);
    groundMat.roughness = pattern === 'marble' ? 0.55 : pattern === 'boardwalk' ? 0.8 : 0.85;
    groundMat.metalness = pattern === 'marble' ? 0.2 : 0.1;
    groundMat.needsUpdate = true;

    const snowMat = this.mesh.material as THREE.MeshStandardMaterial;
    snowMat.color.setHex(snowTintHex);
    snowMat.needsUpdate = true;
  }

  /**
   * Restore full fresh snow blanket across the entire village
   */
  public resetSnow() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.globalAlpha = 1.0;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
    this.snowTexture.needsUpdate = true;
    this.initSnowGrid();
  }

  /**
   * Generates procedural ground pattern texture for each level theme
   */
  private createGroundTexture(pattern: LevelGroundPattern): THREE.CanvasTexture {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;

    if (pattern === 'boardwalk') {
      ctx.fillStyle = '#253244';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#141d29';
      ctx.lineWidth = 2;
      for (let y = 0; y < 256; y += 16) {
        const shade = 24 + ((y * 7) % 10);
        ctx.fillStyle = `hsl(212, 22%, ${shade}%)`;
        ctx.fillRect(0, y + 1, 256, 14);
        ctx.strokeRect(0, y, 256, 16);
        for (let x = 0; x < 256; x += 64) {
          const seamOffset = (y / 16) % 2 === 0 ? 0 : 32;
          ctx.beginPath();
          ctx.moveTo((x + seamOffset) % 256, y);
          ctx.lineTo((x + seamOffset) % 256, y + 16);
          ctx.stroke();
        }
      }
    } else if (pattern === 'granite') {
      ctx.fillStyle = '#262038';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#181326';
      ctx.lineWidth = 3;
      for (let y = 0; y < 256; y += 32) {
        const offsetX = (y / 32) % 2 === 0 ? 0 : 16;
        for (let x = -16; x < 272; x += 32) {
          ctx.fillStyle = `hsl(258, 18%, ${22 + ((x * 11 + y * 5) % 10)}%)`;
          ctx.fillRect(x + offsetX + 2, y + 2, 28, 28);
          ctx.strokeRect(x + offsetX, y, 32, 32);
        }
      }
    } else if (pattern === 'marble') {
      ctx.fillStyle = '#3f2e3d';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      for (let y = 0; y < 256; y += 32) {
        for (let x = 0; x < 256; x += 32) {
          const isAlt = ((x + y) / 32) % 2 === 0;
          ctx.fillStyle = isAlt ? '#4e3b4c' : '#3a2b38';
          ctx.fillRect(x + 1, y + 1, 30, 30);
          ctx.globalAlpha = 0.25;
          ctx.strokeRect(x, y, 32, 32);
          ctx.globalAlpha = 1.0;
        }
      }
    } else {
      ctx.fillStyle = '#2d3748';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#1a202c';
      ctx.lineWidth = 3;
      for (let y = 0; y < 256; y += 16) {
        const offsetX = (y / 16) % 2 === 0 ? 0 : 8;
        for (let x = -8; x < 264; x += 16) {
          ctx.fillStyle = `hsl(215, 12%, ${24 + ((x * 13 + y * 7) % 12)}%)`;
          ctx.fillRect(x + offsetX + 1, y + 1, 14, 14);
          ctx.strokeRect(x + offsetX, y, 16, 16);
        }
      }
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(24, 24);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  /**
   * Carve snow when the snowplow blade drives forward
   * @param bladeX World X position of blade center
   * @param bladeZ World Z position of blade center
   * @param angle World rotation angle (yaw)
   * @param bladeWidth Width of the plow blade in meters
   * @param thermalRadius Extra melting radius from warmth lantern
   */
  public plowSnow(
    bladeX: number,
    bladeZ: number,
    angle: number,
    bladeWidth: number,
    thermalRadius: number = 0
  ): PlowingResult {
    const halfWorld = WORLD_SIZE / 2;
    const texSize = this.canvas.width;

    // Convert world position to canvas coordinates
    const toCanvasX = (wx: number) => ((wx + halfWorld) / WORLD_SIZE) * texSize;
    const toCanvasY = (wz: number) => ((wz + halfWorld) / WORLD_SIZE) * texSize;

    const cx = toCanvasX(bladeX);
    const cy = toCanvasY(bladeZ);
    const bladePixelRadius = (bladeWidth / WORLD_SIZE) * texSize * 0.55;

    let clearedCount = 0;

    // 1. Carve plow blade path on Canvas mask (destination-out cuts away snow)
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';

    // Front blade ellipse / sweep
    this.ctx.translate(cx, cy);
    this.ctx.rotate(-angle + Math.PI / 2);

    this.ctx.beginPath();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.ellipse(0, 0, bladePixelRadius, bladePixelRadius * 0.45, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // If thermal lantern upgrade is active, carve a warm circular aura
    if (thermalRadius > 0.5) {
      const thermalPixelRadius = (thermalRadius / WORLD_SIZE) * texSize;
      this.ctx.beginPath();
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      this.ctx.arc(0, 0, thermalPixelRadius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
    this.snowTexture.needsUpdate = true;

    // 2. Update mathematical grid cells for collision, resistance, and scoring
    const effectiveRadius = Math.max(bladeWidth * 0.55, thermalRadius * 0.7);
    const minX = Math.max(0, Math.floor(((bladeX - effectiveRadius + halfWorld) / WORLD_SIZE) * SNOW_GRID_RES));
    const maxX = Math.min(SNOW_GRID_RES - 1, Math.floor(((bladeX + effectiveRadius + halfWorld) / WORLD_SIZE) * SNOW_GRID_RES));
    const minZ = Math.max(0, Math.floor(((bladeZ - effectiveRadius + halfWorld) / WORLD_SIZE) * SNOW_GRID_RES));
    const maxZ = Math.min(SNOW_GRID_RES - 1, Math.floor(((bladeZ + effectiveRadius + halfWorld) / WORLD_SIZE) * SNOW_GRID_RES));

    for (let gz = minZ; gz <= maxZ; gz++) {
      const wz = (gz / SNOW_GRID_RES) * WORLD_SIZE - halfWorld;
      for (let gx = minX; gx <= maxX; gx++) {
        const wx = (gx / SNOW_GRID_RES) * WORLD_SIZE - halfWorld;
        const distSq = (wx - bladeX) * (wx - bladeX) + (wz - bladeZ) * (wz - bladeZ);

        if (distSq <= effectiveRadius * effectiveRadius) {
          const idx = gz * SNOW_GRID_RES + gx;
          const currentDepth = this.depthGrid[idx];
          if (currentDepth > 0.1) {
            clearedCount += currentDepth;
            this.depthGrid[idx] = 0;
            this.clearedCells++;
          }
        }
      }
    }

    const totalClearedPercent = Math.min(100, Math.round((this.clearedCells / this.initialSnowCells) * 100));

    return {
      cellsClearedThisFrame: clearedCount,
      totalClearedPercent,
      isPlowingSnow: clearedCount > 0.5,
    };
  }

  /**
   * Stamp a crisp heart-shaped tire tread imprint into the snow blanket mask
   */
  public stampHeartTread(wx: number, wz: number, angle: number, radiusMeters: number = 0.42) {
    const halfWorld = WORLD_SIZE / 2;
    const texSize = this.canvas.width;
    const cx = ((wx + halfWorld) / WORLD_SIZE) * texSize;
    const cy = ((wz + halfWorld) / WORLD_SIZE) * texSize;
    const r = (radiusMeters / WORLD_SIZE) * texSize;

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.translate(cx, cy);
    this.ctx.rotate(-angle);

    // Draw heart silhouette pointing in travel direction (+Z before rotation)
    this.ctx.beginPath();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.moveTo(0, r * 0.85);
    this.ctx.bezierCurveTo(r * 1.15, r * 0.15, r * 0.95, -r * 0.85, 0, -r * 0.28);
    this.ctx.bezierCurveTo(-r * 0.95, -r * 0.85, -r * 1.15, r * 0.15, 0, r * 0.85);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
    this.snowTexture.needsUpdate = true;
  }

  /**
   * Check snow depth at a given world position
   */
  public getSnowDepthAt(wx: number, wz: number): number {
    const halfWorld = WORLD_SIZE / 2;
    const gx = Math.floor(((wx + halfWorld) / WORLD_SIZE) * SNOW_GRID_RES);
    const gz = Math.floor(((wz + halfWorld) / WORLD_SIZE) * SNOW_GRID_RES);

    if (gx < 0 || gx >= SNOW_GRID_RES || gz < 0 || gz >= SNOW_GRID_RES) {
      return 0;
    }
    return this.depthGrid[gz * SNOW_GRID_RES + gx];
  }

  /**
   * Calculate cleared snow ratio in a circular region around landmark
   */
  public getRegionClearedRatio(centerX: number, centerZ: number, radius: number): number {
    const halfWorld = WORLD_SIZE / 2;
    const minX = Math.max(0, Math.floor(((centerX - radius + halfWorld) / WORLD_SIZE) * SNOW_GRID_RES));
    const maxX = Math.min(SNOW_GRID_RES - 1, Math.floor(((centerX + radius + halfWorld) / WORLD_SIZE) * SNOW_GRID_RES));
    const minZ = Math.max(0, Math.floor(((centerZ - radius + halfWorld) / WORLD_SIZE) * SNOW_GRID_RES));
    const maxZ = Math.min(SNOW_GRID_RES - 1, Math.floor(((centerZ + radius + halfWorld) / WORLD_SIZE) * SNOW_GRID_RES));

    let total = 0;
    let cleared = 0;

    for (let gz = minZ; gz <= maxZ; gz++) {
      const wz = (gz / SNOW_GRID_RES) * WORLD_SIZE - halfWorld;
      for (let gx = minX; gx <= maxX; gx++) {
        const wx = (gx / SNOW_GRID_RES) * WORLD_SIZE - halfWorld;
        const distSq = (wx - centerX) * (wx - centerX) + (wz - centerZ) * (wz - centerZ);
        if (distSq <= radius * radius) {
          total++;
          if (this.depthGrid[gz * SNOW_GRID_RES + gx] < 0.2) {
            cleared++;
          }
        }
      }
    }

    return total > 0 ? cleared / total : 0;
  }

  /**
   * Slowly replenish snow drifts during heavy blizzard events
   * @param dt delta time in seconds
   * @param rate accumulation factor (0 to 1)
   */
  public accumulateSnowDrifts(dt: number, rate: number) {
    if (rate <= 0) return;
    const texSize = this.canvas.width;

    // Softly spray opaque white dust back onto the canvas alpha mask
    const sprayAlpha = Math.min(0.12, rate * dt * 0.4);
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillStyle = `rgba(255, 255, 255, ${sprayAlpha})`;

    // Random scattered flakes on canvas
    const patches = Math.floor(4 * (rate / 0.08));
    for (let i = 0; i < patches; i++) {
      const rx = Math.random() * texSize;
      const ry = Math.random() * texSize;
      const rRad = 20 + Math.random() * 45;
      this.ctx.beginPath();
      this.ctx.arc(rx, ry, rRad, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
    this.snowTexture.needsUpdate = true;

    // Replenish a few depth grid cells
    const cellUpdates = Math.floor(15 * (rate / 0.08));
    for (let i = 0; i < cellUpdates; i++) {
      const rIdx = Math.floor(Math.random() * this.totalCells);
      if (this.depthGrid[rIdx] < 0.8) {
        if (this.depthGrid[rIdx] === 0 && this.clearedCells > 0) {
          this.clearedCells--;
        }
        this.depthGrid[rIdx] = Math.min(1.0, this.depthGrid[rIdx] + 0.25);
      }
    }
  }

  public dispose() {
    this.snowTexture.dispose();
    if (this.groundTexture) {
      this.groundTexture.dispose();
    }
    this.mesh.geometry.dispose();
    if (Array.isArray(this.mesh.material)) this.mesh.material.forEach((m) => m.dispose());
    else this.mesh.material.dispose();
    this.groundMesh.geometry.dispose();
    if (Array.isArray(this.groundMesh.material)) this.groundMesh.material.forEach((m) => m.dispose());
    else this.groundMesh.material.dispose();
  }
}
