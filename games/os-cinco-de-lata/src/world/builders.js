// Cenografia e atores reutilizáveis por todas as fases.
// Tudo em primitivas low-poly — a pixelização (core/pixel.js) faz o estilo.

import * as THREE from 'three';

// ---------------------------------------------------------------- materiais
export const MAT = {
  rust: new THREE.MeshStandardMaterial({ color: 0x8a3b22, roughness: 0.92, metalness: 0.35 }),
  rustDark: new THREE.MeshStandardMaterial({ color: 0x5e2715, roughness: 0.95, metalness: 0.3 }),
  foil: new THREE.MeshStandardMaterial({ color: 0xdcdce6, metalness: 1, roughness: 0.28 }),
  skin: new THREE.MeshStandardMaterial({ color: 0xc98e63, roughness: 0.8 }),
  iron: new THREE.MeshStandardMaterial({ color: 0x7a4a30, metalness: 0.7, roughness: 0.55 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x17110d, roughness: 0.9 }),
  amber: new THREE.MeshStandardMaterial({ color: 0xc2602f, roughness: 0.5, emissive: 0x6e2c16, emissiveIntensity: 0.6 }),
  petal: new THREE.MeshStandardMaterial({ color: 0xe07a9a, roughness: 0.7, side: THREE.DoubleSide }),
  scale: new THREE.MeshStandardMaterial({ color: 0x2c2c34, metalness: 0.8, roughness: 0.4 }),
  water: new THREE.MeshStandardMaterial({ color: 0x274b8a, roughness: 0.25, metalness: 0.1 }),
};

export function colorMat(hex, opts = {}) {
  return new THREE.MeshStandardMaterial({ color: hex, roughness: 0.8, ...opts });
}

// ---------------------------------------------------------------- ambiente PBR
// textura de ambiente compartilhada (PMREM) — sem ela, metalness=1 fica preto
let ENV = null;
export function setEnvironment(texture) { ENV = texture; }

// ---------------------------------------------------------------- luz / clima
export function sunsetLights(scene, { fogColor = 0xd98a4f, fogNear = 40, fogFar = 150 } = {}) {
  if (ENV) scene.environment = ENV;
  scene.background = new THREE.Color(fogColor);
  scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
  const sun = new THREE.DirectionalLight(0xffc079, 2.4);
  sun.position.set(-30, 35, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -45; sun.shadow.camera.right = 45;
  sun.shadow.camera.top = 60; sun.shadow.camera.bottom = -60;
  sun.shadow.camera.far = 160;
  scene.add(sun, sun.target);
  scene.add(new THREE.HemisphereLight(0xf5c890, 0x3a2410, 0.55));
  return sun;
}

export function caveLights(scene, { fogColor = 0x2c1d11, amberGlow = true } = {}) {
  if (ENV) scene.environment = ENV;
  scene.background = new THREE.Color(fogColor);
  scene.fog = new THREE.Fog(fogColor, 18, 90);
  const main = new THREE.DirectionalLight(0xe8945a, 1.2);
  main.position.set(10, 30, 10);
  main.castShadow = true;
  scene.add(main, main.target);
  scene.add(new THREE.HemisphereLight(amberGlow ? 0xc2602f : 0x69a0f0, 0x1a0e06, 0.7));
  return main;
}

// ---------------------------------------------------------------- barra de ferro
export function makeBeam(scene, { length = 220, width = 10, holeEvery = 24 } = {}) {
  const beam = new THREE.Mesh(new THREE.BoxGeometry(width, 6, length), MAT.rust);
  beam.position.set(0, -3, -length / 2 + 10);
  beam.receiveShadow = true;
  scene.add(beam);

  for (const side of [-1, 1]) {
    const flange = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, length), MAT.rustDark);
    flange.position.set(side * (width / 2 + 0.4), 0.1, beam.position.z);
    flange.receiveShadow = true; flange.castShadow = true;
    scene.add(flange);
  }

  const stainGeo = new THREE.CircleGeometry(1.6, 10);
  const stainMat = colorMat(0x6e2c16, { roughness: 1 });
  for (let i = 0; i < 22; i++) {
    const stain = new THREE.Mesh(stainGeo, stainMat);
    stain.rotation.x = -Math.PI / 2;
    stain.position.set((Math.random() - 0.5) * (width - 2), 0.012, -Math.random() * length + 8);
    stain.scale.setScalar(0.5 + Math.random() * 1.4);
    scene.add(stain);
  }

  const holes = [];
  const holeRadius = 2.3;
  const holeMat = colorMat(0x120705, { roughness: 1 });
  const rimMat = colorMat(0x3f1c0e, { roughness: 0.9, metalness: 0.4 });
  for (let z = -16; z > -length + 16; z -= holeEvery) {
    const x = (Math.random() - 0.5) * (width - 2 * holeRadius - 1.5);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(holeRadius, 20), holeMat);
    hole.rotation.x = -Math.PI / 2;
    hole.position.set(x, 0.02, z);
    scene.add(hole);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(holeRadius, 0.13, 6, 20), rimMat);
    rim.rotation.x = -Math.PI / 2;
    rim.position.set(x, 0.05, z);
    scene.add(rim);
    holes.push(new THREE.Vector2(x, z));
  }
  return { holes, holeRadius, length, width };
}

// ---------------------------------------------------------------- capim
export function makeGrassField(scene, { count = 300, innerGap = 8, spread = 26, zMin = -260, zMax = 20, baseY = -14 } = {}) {
  const bladeGeo = new THREE.PlaneGeometry(1.6, 1, 1, 3);
  bladeGeo.translate(0, 0.5, 0);
  const mats = [colorMat(0x3d6b23, { side: THREE.DoubleSide }), colorMat(0x4f7d2a, { side: THREE.DoubleSide }), colorMat(0x2e5419, { side: THREE.DoubleSide })];
  const blades = [];
  for (let i = 0; i < count; i++) {
    const blade = new THREE.Mesh(bladeGeo, mats[i % 3]);
    const side = Math.random() < 0.5 ? -1 : 1;
    blade.position.set(
      side * (innerGap / 2 + 3 + Math.random() * spread),
      baseY,
      zMin + Math.random() * (zMax - zMin)
    );
    blade.scale.set(0.8 + Math.random() * 1.6, 14 + Math.random() * 22, 1);
    blade.rotation.y = Math.random() * Math.PI;
    blade.userData.phase = Math.random() * Math.PI * 2;
    blade.userData.baseRotZ = (Math.random() - 0.5) * 0.18;
    scene.add(blade);
    blades.push(blade);
  }
  return {
    update() {
      const t = performance.now() * 0.0006;
      for (const b of blades) b.rotation.z = b.userData.baseRotZ + Math.sin(t + b.userData.phase) * 0.07;
    },
  };
}

export function makeGround(scene, { color = 0x24350f, y = -15, size = 500, z = -120 } = {}) {
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(size, size), colorMat(color, { roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, y, z);
  ground.receiveShadow = true;
  scene.add(ground);
  return ground;
}

// ---------------------------------------------------------------- backdrop / vista
export function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function mirmeciaSilhouette() {
  return canvasTexture(1024, 512, (g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#e8945a'); sky.addColorStop(0.55, '#c2602f'); sky.addColorStop(1, '#5e2715');
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(40,16,8,0.9)';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * w, tw = 14 + Math.random() * 40, th = 60 + Math.random() * 240;
      g.fillRect(x, h - th, tw, th);
      g.beginPath(); g.moveTo(x, h - th); g.lineTo(x + tw / 2, h - th - 30 - Math.random() * 50); g.lineTo(x + tw, h - th); g.fill();
    }
  });
}

export function makeBackdrop(scene, { texture, url, w = 150, h = 75, position = [0, 18, -255] } = {}) {
  const mat = new THREE.MeshBasicMaterial({ map: texture, fog: false });
  if (url) {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(url, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      mat.map = tex; mat.needsUpdate = true;
    }, undefined, () => {});
  }
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  plane.position.set(...position);
  scene.add(plane);
  return plane;
}

export function makeGoal(scene, { z = 0, bannerColor = 0xc0392b } = {}) {
  const goal = new THREE.Group();
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 6, 8), MAT.foil);
    post.position.set(side * 3.2, 3, 0);
    post.castShadow = true;
    goal.add(post);
  }
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.4), colorMat(bannerColor, { side: THREE.DoubleSide }));
  banner.position.set(0, 5.4, 0);
  goal.add(banner);
  goal.position.set(0, 0, z);
  scene.add(goal);
  return goal;
}

// ---------------------------------------------------------------- heróis
export function makeHero(member) {
  const g = new THREE.Group();
  const foil = new THREE.MeshStandardMaterial({ color: member.color, metalness: 1, roughness: 0.3 });
  const wide = member.look.broad ? 1.3 : 1;

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42 * wide, 0.7, 4, 10), foil);
  body.position.y = 0.95; body.castShadow = true;
  g.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), MAT.skin);
  head.position.y = 1.85; head.castShadow = true;
  g.add(head);

  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), foil);
  helm.position.y = member.look.hood ? 1.88 : 1.92;
  helm.castShadow = true;
  g.add(helm);

  if (member.look.sword) {
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 0.22), MAT.iron);
    sword.position.set(0.62, 1.3, 0);
    sword.rotation.z = -0.28; sword.rotation.x = 0.1;
    sword.castShadow = true;
    sword.name = 'weapon';
    g.add(sword);
  }
  if (member.look.crossbow) {
    const bow = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.4), MAT.iron);
    bow.position.set(0.55, 1.2, 0.1);
    bow.name = 'weapon';
    g.add(bow);
  }
  if (member.look.shield) {
    const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.12, 8), MAT.scale);
    shield.rotation.z = Math.PI / 2;
    shield.position.set(-0.62 * wide, 1.1, 0);
    shield.castShadow = true;
    shield.name = 'weapon';
    g.add(shield);
  }
  if (member.look.cape) {
    const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.9), colorMat(0xa64b2a, { side: THREE.DoubleSide }));
    cape.position.set(0, 1.2, -0.45);
    g.add(cape);
  }

  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.4, 3, 6), foil);
    leg.position.set(side * 0.22 * wide, 0.32, 0);
    leg.castShadow = true;
    leg.name = side === -1 ? 'legL' : 'legR';
    g.add(leg);
  }

  g.scale.setScalar(member.scale);
  return g;
}

export function animateRun(hero, moving, sprint = 1) {
  const swing = moving ? Math.sin(performance.now() * 0.012 * sprint) * 0.35 : 0;
  const l = hero.getObjectByName('legL');
  const r = hero.getObjectByName('legR');
  if (l) l.position.z = swing;
  if (r) r.position.z = -swing;
}

// ---------------------------------------------------------------- atores
export function makeShard() {
  const shard = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.55),
    new THREE.MeshStandardMaterial({ color: 0xf2f2fa, metalness: 1, roughness: 0.12, emissive: 0x555566, emissiveIntensity: 0.35 })
  );
  shard.castShadow = true;
  return shard;
}

export function makeBird() {
  const bird = new THREE.Group();
  const body = new THREE.Mesh(new THREE.ConeGeometry(1.2, 5, 6), MAT.dark);
  body.rotation.x = -Math.PI / 2;
  bird.add(body);
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.PlaneGeometry(7, 2.6), new THREE.MeshStandardMaterial({ color: 0x17110d, side: THREE.DoubleSide }));
    wing.position.set(side * 3.6, 0.3, 0.4);
    wing.rotation.z = side * 0.25;
    wing.name = side === -1 ? 'wingL' : 'wingR';
    bird.add(wing);
  }
  return bird;
}

export function flapWings(bird) {
  const flap = Math.sin(performance.now() * 0.02) * 0.5;
  bird.getObjectByName('wingL').rotation.z = -0.25 - flap;
  bird.getObjectByName('wingR').rotation.z = 0.25 + flap;
}

// Trovão — a lagartixa do tamanho de um cavalo de guerra
export function makeGecko({ armored = false } = {}) {
  const g = new THREE.Group();
  const mat = armored ? MAT.scale : colorMat(0x6fa03a, { roughness: 0.6 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.9, 2.6, 4, 10), mat);
  body.rotation.x = Math.PI / 2;
  body.position.y = 0.9;
  body.castShadow = true;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.75, 10, 8), mat);
  head.scale.set(1, 0.8, 1.3);
  head.position.set(0, 1.0, 2.1);
  head.castShadow = true;
  g.add(head);
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.7, 3, 6), mat);
    leg.position.set(sx * 0.95, 0.45, sz * 1.1);
    leg.name = `leg${sx > 0 ? 'R' : 'L'}${sz > 0 ? 'F' : 'B'}`;
    g.add(leg);
  }
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.8, 8), mat);
  tail.rotation.x = Math.PI / 2 + 0.15;
  tail.position.set(0, 0.85, -2.6);
  g.add(tail);
  const eyeMat = colorMat(0x1a0e06);
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 6), eyeMat);
    eye.position.set(side * 0.42, 1.35, 2.5);
    g.add(eye);
  }
  return g;
}

export function animateGecko(gecko, moving) {
  const swing = moving ? Math.sin(performance.now() * 0.016) * 0.4 : 0;
  for (const n of ['legLF', 'legRB']) { const l = gecko.getObjectByName(n); if (l) l.position.y = 0.45 + Math.max(0, swing) * 0.3; }
  for (const n of ['legRF', 'legLB']) { const l = gecko.getObjectByName(n); if (l) l.position.y = 0.45 + Math.max(0, -swing) * 0.3; }
}

// formiga-soldado de Mirmécia
export function makeAnt({ color = 0x3a2410 } = {}) {
  const g = new THREE.Group();
  const mat = colorMat(color, { roughness: 0.4, metalness: 0.3 });
  const sizes = [[0.5, 0.7], [0.4, 0], [0.6, -0.85]];
  sizes.forEach(([r, z]) => {
    const part = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), mat);
    part.position.set(0, 0.55, z);
    part.castShadow = true;
    g.add(part);
  });
  for (let i = 0; i < 3; i++) {
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 4), mat);
      leg.position.set(side * 0.45, 0.3, 0.4 - i * 0.45);
      leg.rotation.z = side * 0.7;
      g.add(leg);
    }
  }
  return g;
}

// vespa do Cônsul
export function makeWasp() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 1.0, 4, 8), colorMat(0xe9bc7e, { roughness: 0.5 }));
  body.rotation.x = Math.PI / 2;
  body.position.y = 1.4;
  g.add(body);
  const stripes = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.1, 6, 12), colorMat(0x1a0e06));
  stripes.position.set(0, 1.4, -0.3);
  g.add(stripes);
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.5), new THREE.MeshStandardMaterial({ color: 0xa8c8f8, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
    wing.position.set(side * 0.8, 1.75, 0);
    wing.name = side === -1 ? 'wingL' : 'wingR';
    g.add(wing);
  }
  const sting = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 6), colorMat(0x1a0e06));
  sting.rotation.x = Math.PI / 2;
  sting.position.set(0, 1.4, -1.1);
  g.add(sting);
  return g;
}

// Élitra — a princesa-herdeira
export function makeElitra() {
  const g = makeHero({ color: '#e07a9a', scale: 1.05, look: {} });
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.25, 6, 1, true), colorMat(0xf0b46a, { metalness: 0.9, roughness: 0.3 }));
  crown.position.y = 2.2;
  crown.rotation.z = 0.12; // a coroa torta
  g.add(crown);
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 0.16), colorMat(0xaeb0bb, { metalness: 1, roughness: 0.2 }));
  blade.position.set(0.6, 1.35, 0);
  blade.rotation.z = -0.2;
  blade.name = 'weapon';
  g.add(blade);
  return g;
}

// o drakkar "A Lata"
export function makeBoat() {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1, 7), MAT.foil);
  hull.position.y = 0.5;
  hull.castShadow = true;
  g.add(hull);
  const prow = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 6), MAT.foil);
  prow.position.set(0, 1.3, 3.6);
  g.add(prow);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 4, 6), MAT.iron);
  mast.position.y = 2.5;
  g.add(mast);
  const sail = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.2), new THREE.MeshStandardMaterial({ color: 0xdcdce6, metalness: 0.8, roughness: 0.35, side: THREE.DoubleSide }));
  sail.position.set(0, 2.6, -0.2);
  g.add(sail);
  return g;
}

// água do Grande Rio com faixas que correm
export function makeWater(scene, { size = 500, y = 0 } = {}) {
  const tex = canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = '#274b8a'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#3a6fd8'; g.lineWidth = 5;
    for (let i = 0; i < 12; i++) {
      g.beginPath();
      g.moveTo(0, i * 22 + Math.random() * 8);
      g.bezierCurveTo(w / 3, i * 22 - 10, (2 * w) / 3, i * 22 + 10, w, i * 22);
      g.stroke();
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3 }));
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, y, -size / 4);
  scene.add(water);
  return { mesh: water, update(dt) { tex.offset.y += dt * 0.18; } };
}

// montanhas de pétalas
export function makePetalMound(scene, { x = 0, z = 0, r = 5 } = {}) {
  const mound = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), MAT.petal);
  mound.position.set(x, 0, z);
  mound.castShadow = true; mound.receiveShadow = true;
  scene.add(mound);
  return mound;
}

// pilares/anéis genéricos
export function makeRing(color = 0xf0b46a) {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.25, 8, 18), colorMat(color, { emissive: color, emissiveIntensity: 0.5 }));
  return ring;
}

export function makeRock({ r = 1.5, color = 0x56575e } = {}) {
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), colorMat(color, { roughness: 1, flatShading: true }));
  rock.castShadow = true;
  return rock;
}
