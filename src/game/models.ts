/**
 * Procedural 3D Models for Snowbound Hearts
 * Built with composite 3-12 part THREE.Group geometries, distinct roughness/metalness,
 * grounded bottom-center pivots, and zero external asset dependencies.
 */

import * as THREE from 'three';

// Shared procedural materials
export const materials = {
  tractorPaint: new THREE.MeshStandardMaterial({
    color: 0xbe123c, // Rich romantic crimson red
    roughness: 0.22,
    metalness: 0.45,
  }),
  tractorGoldTrim: new THREE.MeshStandardMaterial({
    color: 0xf59e0b, // Warm gold brass
    roughness: 0.25,
    metalness: 0.85,
  }),
  tractorCabin: new THREE.MeshStandardMaterial({
    color: 0xfef3c7, // Warm ivory cream
    roughness: 0.6,
    metalness: 0.05,
  }),
  tractorCabinRoof: new THREE.MeshStandardMaterial({
    color: 0x991b1b, // Deep wine red
    roughness: 0.4,
    metalness: 0.1,
  }),
  windowGlassGlow: new THREE.MeshStandardMaterial({
    color: 0xffedd5,
    emissive: 0xfbbf24,
    emissiveIntensity: 0.8,
    roughness: 0.1,
    metalness: 0.1,
  }),
  plowSteel: new THREE.MeshStandardMaterial({
    color: 0x64748b, // Industrial slate steel
    roughness: 0.35,
    metalness: 0.75,
  }),
  plowEdgeGlow: new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xf43f5e,
    emissiveIntensity: 0.6,
    roughness: 0.3,
    metalness: 0.5,
  }),
  rubberTire: new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.85,
    metalness: 0.05,
  }),
  tireRim: new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.3,
    metalness: 0.8,
  }),
  snowWhite: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.88,
    metalness: 0.05,
  }),
  pineWood: new THREE.MeshStandardMaterial({
    color: 0x451a03,
    roughness: 0.8,
    metalness: 0.02,
  }),
  pineFoliage: new THREE.MeshStandardMaterial({
    color: 0x064e3b,
    roughness: 0.75,
    metalness: 0.05,
  }),
  pineSnowCap: new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.82,
    metalness: 0.02,
  }),
  chaletWood: new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.7,
    metalness: 0.05,
  }),
  chaletTrim: new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    roughness: 0.5,
    metalness: 0.1,
  }),
  stoneWall: new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.9,
    metalness: 0.1,
  }),
  lampIron: new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.4,
    metalness: 0.8,
  }),
  lampLanternGlow: new THREE.MeshStandardMaterial({
    color: 0xffedd5,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.5,
    roughness: 0.1,
    metalness: 0.1,
  }),
  loveHeartPink: new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xf43f5e,
    emissiveIntensity: 0.6,
    roughness: 0.25,
    metalness: 0.3,
  }),
  solsticeGold: new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.9,
    roughness: 0.2,
    metalness: 0.8,
  }),
};

/**
 * Creates the Hero Snowplow Tractor ("The Heartplow")
 * 12-part procedural composite model
 */
export function createHeartPlowTractor(): {
  group: THREE.Group;
  plowGroup: THREE.Group;
  wheelsFront: THREE.Group[];
  wheelsRear: THREE.Group[];
  exhaustStack: THREE.Mesh;
  headlightL: THREE.SpotLight;
  headlightR: THREE.SpotLight;
} {
  const group = new THREE.Group();
  group.name = 'HeartPlow';

  // 1. Lower Chassis Frame (Heavy iron undercarriage)
  const chassisGeo = new THREE.BoxGeometry(1.4, 0.45, 2.6);
  const chassisMesh = new THREE.Mesh(chassisGeo, materials.plowSteel);
  chassisMesh.position.set(0, 0.45, 0);
  chassisMesh.castShadow = true;
  chassisMesh.receiveShadow = true;
  group.add(chassisMesh);

  // 2. Engine Hood (Crimson curved hood)
  const hoodGeo = new THREE.BoxGeometry(1.2, 0.7, 1.4);
  const hoodMesh = new THREE.Mesh(hoodGeo, materials.tractorPaint);
  hoodMesh.position.set(0, 0.85, 0.6);
  hoodMesh.castShadow = true;
  hoodMesh.receiveShadow = true;
  group.add(hoodMesh);

  // 3. Vintage Brass Front Grille
  const grilleGeo = new THREE.BoxGeometry(1.1, 0.6, 0.1);
  const grilleMesh = new THREE.Mesh(grilleGeo, materials.tractorGoldTrim);
  grilleMesh.position.set(0, 0.85, 1.35);
  group.add(grilleMesh);

  // 4. Operator Cabin (Ivory warm cottage-styled enclosed cab)
  const cabGeo = new THREE.BoxGeometry(1.28, 1.0, 1.1);
  const cabMesh = new THREE.Mesh(cabGeo, materials.tractorCabin);
  cabMesh.position.set(0, 1.3, -0.45);
  cabMesh.castShadow = true;
  group.add(cabMesh);

  // 5. Alpine Slanted Cabin Roof with snow rim
  const roofGeo = new THREE.BoxGeometry(1.4, 0.2, 1.25);
  const roofMesh = new THREE.Mesh(roofGeo, materials.tractorCabinRoof);
  roofMesh.position.set(0, 1.88, -0.45);
  roofMesh.castShadow = true;
  group.add(roofMesh);

  // Cabin Snow on Roof
  const roofSnowGeo = new THREE.BoxGeometry(1.3, 0.08, 1.15);
  const roofSnowMesh = new THREE.Mesh(roofSnowGeo, materials.snowWhite);
  roofSnowMesh.position.set(0, 1.98, -0.45);
  group.add(roofSnowMesh);

  // 6. Glowing Amber Windows (Front, Sides, Back)
  const frontWinGeo = new THREE.PlaneGeometry(1.0, 0.55);
  const frontWin = new THREE.Mesh(frontWinGeo, materials.windowGlassGlow);
  frontWin.position.set(0, 1.35, 0.11);
  group.add(frontWin);

  const backWin = new THREE.Mesh(frontWinGeo, materials.windowGlassGlow);
  backWin.position.set(0, 1.35, -1.01);
  backWin.rotation.y = Math.PI;
  group.add(backWin);

  const sideWinGeo = new THREE.PlaneGeometry(0.75, 0.5);
  const sideWinL = new THREE.Mesh(sideWinGeo, materials.windowGlassGlow);
  sideWinL.position.set(-0.65, 1.35, -0.45);
  sideWinL.rotation.y = -Math.PI / 2;
  group.add(sideWinL);

  const sideWinR = new THREE.Mesh(sideWinGeo, materials.windowGlassGlow);
  sideWinR.position.set(0.65, 1.35, -0.45);
  sideWinR.rotation.y = Math.PI / 2;
  group.add(sideWinR);

  // 7. Exhaust Stack (Tractor chimney puffing steam/hearts)
  const exhaustGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.75, 10);
  const exhaustStack = new THREE.Mesh(exhaustGeo, materials.plowSteel);
  exhaustStack.position.set(0.45, 1.4, 0.8);
  exhaustStack.castShadow = true;
  group.add(exhaustStack);

  const exhaustCapGeo = new THREE.CylinderGeometry(0.12, 0.08, 0.15, 10);
  const exhaustCap = new THREE.Mesh(exhaustCapGeo, materials.tractorGoldTrim);
  exhaustCap.position.set(0.45, 1.78, 0.8);
  group.add(exhaustCap);

  // 8. Wheels: Large treaded rear wheels, smaller front steerable wheels
  const wheelsRear: THREE.Group[] = [];
  const wheelsFront: THREE.Group[] = [];

  const createWheel = (radius: number, width: number) => {
    const wheelGroup = new THREE.Group();
    const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 16);
    tireGeo.rotateZ(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, materials.rubberTire);
    tire.castShadow = true;
    wheelGroup.add(tire);

    const rimGeo = new THREE.CylinderGeometry(radius * 0.65, radius * 0.65, width + 0.02, 12);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, materials.tireRim);
    wheelGroup.add(rim);

    // Tread ribs
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const ribGeo = new THREE.BoxGeometry(width + 0.04, radius * 0.14, 0.08);
      const rib = new THREE.Mesh(ribGeo, materials.rubberTire);
      rib.position.set(0, Math.sin(angle) * (radius * 0.95), Math.cos(angle) * (radius * 0.95));
      rib.rotation.x = angle;
      wheelGroup.add(rib);
    }
    return wheelGroup;
  };

  // Rear Wheels (radius 0.65, wider)
  const rearL = createWheel(0.65, 0.38);
  rearL.position.set(-0.85, 0.65, -0.6);
  group.add(rearL);
  wheelsRear.push(rearL);

  const rearR = createWheel(0.65, 0.38);
  rearR.position.set(0.85, 0.65, -0.6);
  group.add(rearR);
  wheelsRear.push(rearR);

  // Front Wheels (radius 0.45)
  const frontL = createWheel(0.45, 0.28);
  frontL.position.set(-0.75, 0.45, 0.85);
  group.add(frontL);
  wheelsFront.push(frontL);

  const frontR = createWheel(0.45, 0.28);
  frontR.position.set(0.75, 0.45, 0.85);
  group.add(frontR);
  wheelsFront.push(frontR);

  // 9. Front Snowplow Assembly (V-shaped or curved scoop with hydraulic arms)
  const plowGroup = new THREE.Group();
  plowGroup.position.set(0, 0.35, 1.45);

  // Curved V-Blade constructed with angled wings
  const bladeWingGeo = new THREE.BoxGeometry(1.2, 0.65, 0.12);
  const bladeL = new THREE.Mesh(bladeWingGeo, materials.plowSteel);
  bladeL.position.set(-0.55, 0.05, 0.25);
  bladeL.rotation.y = -0.32;
  bladeL.castShadow = true;
  plowGroup.add(bladeL);

  const bladeR = new THREE.Mesh(bladeWingGeo, materials.plowSteel);
  bladeR.position.set(0.55, 0.05, 0.25);
  bladeR.rotation.y = 0.32;
  bladeR.castShadow = true;
  plowGroup.add(bladeR);

  // Glowing scraper bottom edge
  const edgeGeo = new THREE.BoxGeometry(2.3, 0.08, 0.14);
  const edgeMesh = new THREE.Mesh(edgeGeo, materials.plowEdgeGlow);
  edgeMesh.position.set(0, -0.25, 0.38);
  plowGroup.add(edgeMesh);

  // Hydraulic struts
  const strutGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6);
  const strutL = new THREE.Mesh(strutGeo, materials.tractorGoldTrim);
  strutL.position.set(-0.4, 0.2, -0.15);
  strutL.rotation.x = Math.PI / 3;
  plowGroup.add(strutL);

  const strutR = new THREE.Mesh(strutGeo, materials.tractorGoldTrim);
  strutR.position.set(0.4, 0.2, -0.15);
  strutR.rotation.x = Math.PI / 3;
  plowGroup.add(strutR);

  group.add(plowGroup);

  // 10. Front Wreath & Golden Heart Emblem
  const heartShape = new THREE.Shape();
  heartShape.moveTo(0, 0);
  heartShape.bezierCurveTo(0, 0.1, -0.12, 0.2, -0.2, 0.2);
  heartShape.bezierCurveTo(-0.35, 0.2, -0.35, -0.05, -0.35, -0.05);
  heartShape.bezierCurveTo(-0.35, -0.2, -0.15, -0.35, 0, -0.5);
  heartShape.bezierCurveTo(0.15, -0.35, 0.35, -0.2, 0.35, -0.05);
  heartShape.bezierCurveTo(0.35, -0.05, 0.35, 0.2, 0.2, 0.2);
  heartShape.bezierCurveTo(0.12, 0.2, 0, 0.1, 0, 0);

  const heartGeo = new THREE.ExtrudeGeometry(heartShape, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
  heartGeo.scale(0.4, 0.4, 0.4);
  heartGeo.rotateZ(Math.PI);
  const heartEmblem = new THREE.Mesh(heartGeo, materials.loveHeartPink);
  heartEmblem.position.set(0, 0.95, 1.42);
  group.add(heartEmblem);

  // 11. Volumetric Headlights
  const createHeadlamp = (x: number) => {
    const lampCanGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.22, 12);
    lampCanGeo.rotateX(Math.PI / 2);
    const lampCan = new THREE.Mesh(lampCanGeo, materials.tractorGoldTrim);
    lampCan.position.set(x, 0.85, 1.32);
    group.add(lampCan);

    const lensGeo = new THREE.CircleGeometry(0.13, 12);
    const lens = new THREE.Mesh(lensGeo, materials.lampLanternGlow);
    lens.position.set(x, 0.85, 1.44);
    group.add(lens);

    const light = new THREE.SpotLight(0xfff1b8, 4.0, 18, Math.PI / 6, 0.4, 1.2);
    light.position.set(x, 0.85, 1.45);
    light.target.position.set(x, 0, 8);
    group.add(light);
    group.add(light.target);
    return light;
  };

  const headlightL = createHeadlamp(-0.48);
  const headlightR = createHeadlamp(0.48);

  return {
    group,
    plowGroup,
    wheelsFront,
    wheelsRear,
    exhaustStack,
    headlightL,
    headlightR,
  };
}

/**
 * Creates an alpine winter chalet (Composite 5-9 parts)
 */
export function createChalet(colorTint: number = 0x78350f): THREE.Group {
  const group = new THREE.Group();
  group.name = 'AlpineChalet';

  // 1. Stone foundation
  const baseGeo = new THREE.BoxGeometry(5.2, 0.6, 5.2);
  const base = new THREE.Mesh(baseGeo, materials.stoneWall);
  base.position.y = 0.3;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // 2. Timber House Body
  const chaletMat = new THREE.MeshStandardMaterial({
    color: colorTint,
    roughness: 0.75,
    metalness: 0.05,
  });
  const bodyGeo = new THREE.BoxGeometry(4.8, 3.2, 4.8);
  const body = new THREE.Mesh(bodyGeo, chaletMat);
  body.position.y = 2.2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // 3. Steep Alpine Gable Roof (Prism)
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-3.0, 0);
  roofShape.lineTo(0, 2.4);
  roofShape.lineTo(3.0, 0);
  roofShape.closePath();

  const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
    depth: 5.6,
    bevelEnabled: false,
  });
  roofGeo.center();
  const roof = new THREE.Mesh(roofGeo, materials.chaletWood);
  roof.position.set(0, 4.8, 0);
  roof.castShadow = true;
  group.add(roof);

  // 4. Thick Romantic Snow Layer on Roof
  const snowRoofShape = new THREE.Shape();
  snowRoofShape.moveTo(-3.1, 0);
  snowRoofShape.lineTo(0, 2.5);
  snowRoofShape.lineTo(3.1, 0);
  snowRoofShape.lineTo(2.9, 0);
  snowRoofShape.lineTo(0, 2.3);
  snowRoofShape.lineTo(-2.9, 0);
  snowRoofShape.closePath();

  const snowRoofGeo = new THREE.ExtrudeGeometry(snowRoofShape, {
    depth: 5.8,
    bevelEnabled: false,
  });
  snowRoofGeo.center();
  const snowRoof = new THREE.Mesh(snowRoofGeo, materials.snowWhite);
  snowRoof.position.set(0, 4.9, 0);
  snowRoof.castShadow = true;
  group.add(snowRoof);

  // 5. Brick Chimney
  const chimneyGeo = new THREE.BoxGeometry(0.7, 1.8, 0.7);
  const chimney = new THREE.Mesh(chimneyGeo, materials.stoneWall);
  chimney.position.set(1.4, 5.4, 0.8);
  chimney.castShadow = true;
  group.add(chimney);

  const chimneySnowGeo = new THREE.BoxGeometry(0.85, 0.2, 0.85);
  const chimneySnow = new THREE.Mesh(chimneySnowGeo, materials.snowWhite);
  chimneySnow.position.set(1.4, 6.35, 0.8);
  group.add(chimneySnow);

  // 6. Glowing Mullioned Windows with Warm Light
  const winGeo = new THREE.PlaneGeometry(0.85, 1.1);
  const frontWin1 = new THREE.Mesh(winGeo, materials.lampLanternGlow);
  frontWin1.position.set(-1.4, 2.3, 2.42);
  group.add(frontWin1);

  const frontWin2 = new THREE.Mesh(winGeo, materials.lampLanternGlow);
  frontWin2.position.set(1.4, 2.3, 2.42);
  group.add(frontWin2);

  const atticWin = new THREE.Mesh(new THREE.CircleGeometry(0.45, 8), materials.lampLanternGlow);
  atticWin.position.set(0, 4.2, 2.81);
  group.add(atticWin);

  // 7. Entrance Door & Warm Canopy
  const doorGeo = new THREE.BoxGeometry(1.0, 1.8, 0.1);
  const door = new THREE.Mesh(doorGeo, materials.chaletWood);
  door.position.set(0, 1.5, 2.44);
  group.add(door);

  const canopyGeo = new THREE.BoxGeometry(1.4, 0.15, 0.8);
  const canopy = new THREE.Mesh(canopyGeo, materials.snowWhite);
  canopy.position.set(0, 2.5, 2.75);
  canopy.castShadow = true;
  group.add(canopy);

  // Warm doorway lantern
  const doorLanternGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const doorLantern = new THREE.Mesh(doorLanternGeo, materials.lampLanternGlow);
  doorLantern.position.set(0.65, 2.3, 2.5);
  group.add(doorLantern);

  return group;
}

/**
 * Creates layered snow-covered pine evergreen (Composite 5-7 parts)
 */
export function createSnowPine(scale: number = 1.0): THREE.Group {
  const group = new THREE.Group();
  group.name = 'SnowPine';

  // 1. Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.25 * scale, 0.35 * scale, 2.0 * scale, 8);
  const trunk = new THREE.Mesh(trunkGeo, materials.pineWood);
  trunk.position.y = 1.0 * scale;
  trunk.castShadow = true;
  group.add(trunk);

  // 2. Layered foliage tiers
  const tiers = [
    { y: 1.8 * scale, r: 2.1 * scale, h: 1.8 * scale },
    { y: 3.0 * scale, r: 1.65 * scale, h: 1.6 * scale },
    { y: 4.1 * scale, r: 1.2 * scale, h: 1.4 * scale },
    { y: 5.0 * scale, r: 0.75 * scale, h: 1.2 * scale },
  ];

  tiers.forEach((tier) => {
    // Green foliage cone
    const coneGeo = new THREE.ConeGeometry(tier.r, tier.h, 8);
    const cone = new THREE.Mesh(coneGeo, materials.pineFoliage);
    cone.position.y = tier.y;
    cone.castShadow = true;
    group.add(cone);

    // Snow frosting rim
    const snowCapGeo = new THREE.ConeGeometry(tier.r * 1.03, tier.h * 0.45, 8);
    const snowCap = new THREE.Mesh(snowCapGeo, materials.pineSnowCap);
    snowCap.position.y = tier.y + tier.h * 0.28;
    snowCap.castShadow = true;
    group.add(snowCap);
  });

  return group;
}

/**
 * Creates romantic vintage streetlamp casting amber glow
 */
export function createStreetlamp(): { group: THREE.Group; light: THREE.PointLight } {
  const group = new THREE.Group();
  group.name = 'Streetlamp';

  // Base
  const baseGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 8);
  const base = new THREE.Mesh(baseGeo, materials.lampIron);
  base.position.y = 0.25;
  base.castShadow = true;
  group.add(base);

  // Post
  const poleGeo = new THREE.CylinderGeometry(0.08, 0.1, 3.2, 8);
  const pole = new THREE.Mesh(poleGeo, materials.lampIron);
  pole.position.y = 1.85;
  pole.castShadow = true;
  group.add(pole);

  // Ornate brackets
  const bracketGeo = new THREE.BoxGeometry(0.6, 0.06, 0.06);
  const bracket = new THREE.Mesh(bracketGeo, materials.lampIron);
  bracket.position.y = 3.3;
  group.add(bracket);

  // Hexagonal Lantern Cage
  const cageGeo = new THREE.CylinderGeometry(0.24, 0.16, 0.45, 6);
  const cage = new THREE.Mesh(cageGeo, materials.lampLanternGlow);
  cage.position.y = 3.65;
  group.add(cage);

  // Lantern Snowcap
  const capGeo = new THREE.ConeGeometry(0.3, 0.22, 6);
  const cap = new THREE.Mesh(capGeo, materials.snowWhite);
  cap.position.y = 3.96;
  group.add(cap);

  // Warm amber point light
  const light = new THREE.PointLight(0xf59e0b, 2.2, 10, 1.4);
  light.position.y = 3.65;
  group.add(light);

  return { group, light };
}

/**
 * Creates the Solstice Gazebo (Town Square Landmark)
 */
export function createGazebo(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'SolsticeGazebo';

  // Octagonal Stone Platform
  const platformGeo = new THREE.CylinderGeometry(4.2, 4.4, 0.5, 8);
  const platform = new THREE.Mesh(platformGeo, materials.stoneWall);
  platform.position.y = 0.25;
  platform.receiveShadow = true;
  group.add(platform);

  // 8 Wooden Columns
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const px = Math.cos(angle) * 3.6;
    const pz = Math.sin(angle) * 3.6;

    const colGeo = new THREE.CylinderGeometry(0.12, 0.14, 2.8, 8);
    const col = new THREE.Mesh(colGeo, materials.chaletTrim);
    col.position.set(px, 1.8, pz);
    col.castShadow = true;
    group.add(col);
  }

  // Peaked Roof
  const roofGeo = new THREE.ConeGeometry(4.5, 2.4, 8);
  const roof = new THREE.Mesh(roofGeo, materials.chaletWood);
  roof.position.y = 4.2;
  roof.castShadow = true;
  group.add(roof);

  // Thick Snow on Roof
  const snowRoofGeo = new THREE.ConeGeometry(4.65, 1.4, 8);
  const snowRoof = new THREE.Mesh(snowRoofGeo, materials.snowWhite);
  snowRoof.position.y = 4.8;
  snowRoof.castShadow = true;
  group.add(snowRoof);

  // Golden Heart Finial on Top
  const finialGeo = new THREE.SphereGeometry(0.3, 8, 8);
  const finial = new THREE.Mesh(finialGeo, materials.solsticeGold);
  finial.position.y = 5.6;
  group.add(finial);

  // Center romantic chandelier
  const chandelier = new THREE.PointLight(0xf43f5e, 3.0, 9, 1.2);
  chandelier.position.y = 2.6;
  group.add(chandelier);

  const glowOrb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), materials.loveHeartPink);
  glowOrb.position.y = 2.6;
  group.add(glowOrb);

  return group;
}

/**
 * Creates Grand Solstice Christmas Tree (Landmark)
 */
export function createGrandSolsticeTree(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'GrandSolsticeTree';

  // Base Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.6, 0.9, 3.0, 8);
  const trunk = new THREE.Mesh(trunkGeo, materials.pineWood);
  trunk.position.y = 1.5;
  group.add(trunk);

  // 5 Massive Pine Foliage Tiers
  const tiers = [
    { y: 3.2, r: 4.5, h: 3.2 },
    { y: 5.2, r: 3.7, h: 2.8 },
    { y: 7.0, r: 2.8, h: 2.5 },
    { y: 8.6, r: 1.9, h: 2.2 },
    { y: 9.9, r: 1.0, h: 1.8 },
  ];

  tiers.forEach((tier) => {
    const coneGeo = new THREE.ConeGeometry(tier.r, tier.h, 10);
    const cone = new THREE.Mesh(coneGeo, materials.pineFoliage);
    cone.position.y = tier.y;
    cone.castShadow = true;
    group.add(cone);

    const snowGeo = new THREE.ConeGeometry(tier.r * 1.02, tier.h * 0.45, 10);
    const snow = new THREE.Mesh(snowGeo, materials.snowWhite);
    snow.position.y = tier.y + tier.h * 0.3;
    group.add(snow);
  });

  // Glowing Solstice Star
  const starGeo = new THREE.OctahedronGeometry(0.7, 0);
  const star = new THREE.Mesh(starGeo, materials.solsticeGold);
  star.position.y = 11.2;
  group.add(star);

  const starLight = new THREE.PointLight(0xfef08a, 4.0, 16, 1.1);
  starLight.position.y = 11.2;
  group.add(starLight);

  return group;
}

/**
 * Creates adorable snowman with scarf and top hat
 */
export function createSnowman(): THREE.Group {
  const group = new THREE.Group();

  // Bottom sphere
  const b1 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 12), materials.snowWhite);
  b1.position.y = 0.55;
  b1.castShadow = true;
  group.add(b1);

  // Middle sphere
  const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 12), materials.snowWhite);
  b2.position.y = 1.35;
  b2.castShadow = true;
  group.add(b2);

  // Head sphere
  const b3 = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), materials.snowWhite);
  b3.position.y = 1.95;
  b3.castShadow = true;
  group.add(b3);

  // Cozy Red Scarf
  const scarfGeo = new THREE.TorusGeometry(0.36, 0.09, 8, 16);
  scarfGeo.rotateX(Math.PI / 2);
  const scarfMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.6 });
  const scarf = new THREE.Mesh(scarfGeo, scarfMat);
  scarf.position.y = 1.7;
  group.add(scarf);

  // Carrot Nose
  const carrotGeo = new THREE.ConeGeometry(0.06, 0.3, 8);
  carrotGeo.rotateX(Math.PI / 2);
  const carrotMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 });
  const carrot = new THREE.Mesh(carrotGeo, carrotMat);
  carrot.position.set(0, 1.95, 0.4);
  group.add(carrot);

  // Black Top Hat
  const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 12), materials.lampIron);
  hatBrim.position.y = 2.25;
  group.add(hatBrim);

  const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.4, 12), materials.lampIron);
  hatTop.position.y = 2.45;
  group.add(hatTop);

  return group;
}

/**
 * Creates collectible buried gift box / love letter
 */
export function createCollectibleGift(): THREE.Group {
  const group = new THREE.Group();

  // Floating gift cube
  const boxGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
  const boxMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    roughness: 0.3,
    metalness: 0.2,
  });
  const box = new THREE.Mesh(boxGeo, boxMat);
  box.castShadow = true;
  group.add(box);

  // Golden Ribbon
  const rib1 = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.82, 0.18), materials.tractorGoldTrim);
  group.add(rib1);
  const rib2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.82, 0.84), materials.tractorGoldTrim);
  group.add(rib2);

  // Golden Bow on top
  const bowGeo = new THREE.SphereGeometry(0.18, 8, 8);
  const bow = new THREE.Mesh(bowGeo, materials.tractorGoldTrim);
  bow.position.y = 0.45;
  group.add(bow);

  // Warm beacon aura
  const aura = new THREE.PointLight(0xf43f5e, 1.5, 4, 1.5);
  aura.position.y = 0.5;
  group.add(aura);

  return group;
}

/**
 * Creates stylized couple reunited at landmark
 */
export function createCoupleModel(): THREE.Group {
  const group = new THREE.Group();

  const createPerson = (x: number, coatColor: number, hatColor: number) => {
    const p = new THREE.Group();
    p.position.x = x;

    // Coat / Body
    const coatMat = new THREE.MeshStandardMaterial({ color: coatColor, roughness: 0.7 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 1.1, 8), coatMat);
    body.position.y = 0.65;
    body.castShadow = true;
    p.add(body);

    // Head
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.4 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), headMat);
    head.position.y = 1.35;
    p.add(head);

    // Beanie
    const hatMat = new THREE.MeshStandardMaterial({ color: hatColor, roughness: 0.8 });
    const hat = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), hatMat);
    hat.position.y = 1.45;
    p.add(hat);

    // Pom pom
    const pom = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), materials.snowWhite);
    pom.position.y = 1.65;
    p.add(pom);

    return p;
  };

  const person1 = createPerson(-0.35, 0x1d4ed8, 0xbe123c);
  const person2 = createPerson(0.35, 0xe11d48, 0xf59e0b);
  group.add(person1);
  group.add(person2);

  // Floating heart overhead
  const heartMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), materials.loveHeartPink);
  heartMesh.position.y = 2.1;
  group.add(heartMesh);

  return group;
}
