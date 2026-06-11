// Os Cinco de Lata — A Barra de Ferro
// Vertical slice do Capítulo 1: Tarso atravessa a barra de ferro gigante,
// coleta as lascas de papel de prata e se esconde da Sombra (o pássaro).

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// ---------------------------------------------------------------- constantes
const BEAM_LENGTH = 220;          // comprimento da barra (eixo z, jogador anda no -z)
const BEAM_WIDTH = 10;
const BEAM_TOP_Y = 0;             // topo da barra
const PLAYER_SPEED = 13;
const SPRINT_MULT = 1.6;
const JUMP_SPEED = 9;
const GRAVITY = 28;
const HOLE_RADIUS = 2.3;
const SHARD_COUNT = 5;
const MAX_HEARTS = 3;
const BIRD_FIRST_DELAY = 11;      // s até o primeiro ataque
const BIRD_WARNING = 3.2;         // s de aviso antes do bote
const BIRD_INTERVAL_MIN = 11;
const BIRD_INTERVAL_MAX = 17;

// ---------------------------------------------------------------- estado
const state = {
  shards: 0,
  hearts: MAX_HEARTS,
  over: false,
  won: false,
  birdPhase: 'idle',              // idle | warning | striking
  birdTimer: BIRD_FIRST_DELAY,
  invuln: 0,
};

const keys = {};
addEventListener('keydown', (e) => { keys[e.code] = true; dismissTitle(); });
addEventListener('keyup', (e) => { keys[e.code] = false; });

// ---------------------------------------------------------------- cena base
const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd98a4f);
scene.fog = new THREE.Fog(0xd98a4f, 40, 150);

// ambiente PBR para o metal da armadura brilhar
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 400);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ---------------------------------------------------------------- luz (pôr do sol, chiaroscuro)
const sun = new THREE.DirectionalLight(0xffc079, 2.4);
sun.position.set(-30, 35, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -40; sun.shadow.camera.right = 40;
sun.shadow.camera.top = 60; sun.shadow.camera.bottom = -60;
sun.shadow.camera.far = 160;
scene.add(sun);
scene.add(sun.target);

const hemi = new THREE.HemisphereLight(0xf5c890, 0x3a2410, 0.55);
scene.add(hemi);

// ---------------------------------------------------------------- a Barra de Ferro
const rustMat = new THREE.MeshStandardMaterial({ color: 0x8a3b22, roughness: 0.92, metalness: 0.35 });
const rustDark = new THREE.MeshStandardMaterial({ color: 0x5e2715, roughness: 0.95, metalness: 0.3 });

const beam = new THREE.Mesh(new THREE.BoxGeometry(BEAM_WIDTH, 6, BEAM_LENGTH), rustMat);
beam.position.set(0, BEAM_TOP_Y - 3, -BEAM_LENGTH / 2 + 10);
beam.receiveShadow = true;
scene.add(beam);

// flanges laterais (perfil de viga "I")
for (const side of [-1, 1]) {
  const flange = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, BEAM_LENGTH), rustDark);
  flange.position.set(side * (BEAM_WIDTH / 2 + 0.4), BEAM_TOP_Y + 0.1, beam.position.z);
  flange.receiveShadow = true; flange.castShadow = true;
  scene.add(flange);
}

// manchas de ferrugem (variação visual no topo)
const stainGeo = new THREE.CircleGeometry(1.6, 12);
const stainMat = new THREE.MeshStandardMaterial({ color: 0x6e2c16, roughness: 1 });
for (let i = 0; i < 26; i++) {
  const stain = new THREE.Mesh(stainGeo, stainMat);
  stain.rotation.x = -Math.PI / 2;
  stain.position.set((Math.random() - 0.5) * (BEAM_WIDTH - 2), BEAM_TOP_Y + 0.012, -Math.random() * BEAM_LENGTH + 8);
  stain.scale.setScalar(0.5 + Math.random() * 1.4);
  scene.add(stain);
}

// buracos de rebite — abrigos contra a Sombra
const holes = [];
const holeMat = new THREE.MeshStandardMaterial({ color: 0x120705, roughness: 1 });
const rimMat = new THREE.MeshStandardMaterial({ color: 0x3f1c0e, roughness: 0.9, metalness: 0.4 });
for (let z = -16; z > -BEAM_LENGTH + 16; z -= 24) {
  const x = (Math.random() - 0.5) * (BEAM_WIDTH - 2 * HOLE_RADIUS - 1.5);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(HOLE_RADIUS, 28), holeMat);
  hole.rotation.x = -Math.PI / 2;
  hole.position.set(x, BEAM_TOP_Y + 0.02, z);
  scene.add(hole);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(HOLE_RADIUS, 0.13, 8, 28), rimMat);
  rim.rotation.x = -Math.PI / 2;
  rim.position.set(x, BEAM_TOP_Y + 0.05, z);
  scene.add(rim);
  holes.push(new THREE.Vector2(x, z));
}

// ---------------------------------------------------------------- selva de capim
const grassBlades = [];
{
  const bladeGeo = new THREE.PlaneGeometry(1.6, 1, 1, 4);
  bladeGeo.translate(0, 0.5, 0); // pivô na base, para o balanço
  const grassMats = [
    new THREE.MeshStandardMaterial({ color: 0x3d6b23, roughness: 0.85, side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ color: 0x4f7d2a, roughness: 0.85, side: THREE.DoubleSide }),
    new THREE.MeshStandardMaterial({ color: 0x2e5419, roughness: 0.9, side: THREE.DoubleSide }),
  ];
  for (let i = 0; i < 340; i++) {
    const blade = new THREE.Mesh(bladeGeo, grassMats[i % grassMats.length]);
    const side = Math.random() < 0.5 ? -1 : 1;
    const dist = BEAM_WIDTH / 2 + 3 + Math.random() * 26;
    blade.position.set(side * dist, BEAM_TOP_Y - 14, -Math.random() * (BEAM_LENGTH + 40) + 20);
    const h = 14 + Math.random() * 22; // capim mais alto que torres
    blade.scale.set(0.8 + Math.random() * 1.6, h, 1);
    blade.rotation.y = Math.random() * Math.PI;
    blade.userData.phase = Math.random() * Math.PI * 2;
    blade.userData.baseRotZ = (Math.random() - 0.5) * 0.18;
    scene.add(blade);
    grassBlades.push(blade);
  }
}

// chão distante sob a barra (penumbra do mato)
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(400, 400),
  new THREE.MeshStandardMaterial({ color: 0x24350f, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.set(0, BEAM_TOP_Y - 15, -BEAM_LENGTH / 2);
scene.add(ground);

// ---------------------------------------------------------------- vista de Mirmécia (fim da barra)
// usa a arte gerada no Higgsfield; se faltar, desenha uma silhueta procedural
function mirmeciaFallbackTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 512;
  const g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 512);
  sky.addColorStop(0, '#e8945a'); sky.addColorStop(0.55, '#c2602f'); sky.addColorStop(1, '#5e2715');
  g.fillStyle = sky; g.fillRect(0, 0, 1024, 512);
  g.fillStyle = 'rgba(40, 16, 8, 0.9)';
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 1024, w = 14 + Math.random() * 40, h = 60 + Math.random() * 240;
    g.fillRect(x, 512 - h, w, h);
    g.beginPath(); g.moveTo(x, 512 - h); g.lineTo(x + w / 2, 512 - h - 30 - Math.random() * 50); g.lineTo(x + w, 512 - h); g.fill();
  }
  return new THREE.CanvasTexture(c);
}

// arte gerada no Higgsfield (ver docs/PROMPTS.md); cai para o CDN se não houver
// cópia local (rode assets/download.sh) e para a silhueta procedural se offline
const MIRMECIA_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_3Cs6n4P9VtDQBLcqUPlxk1nSd2p/hf_20260611_160422_93ca2d36-5579-4050-ab03-bfa2ff50ab2b.png';
const TITLE_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_3Cs6n4P9VtDQBLcqUPlxk1nSd2p/hf_20260611_160441_f64516ba-7868-45e1-a5fe-451ea23f52c4.png';

const vistaMat = new THREE.MeshBasicMaterial({ map: mirmeciaFallbackTexture(), fog: false });
{
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');
  const apply = (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    vistaMat.map = tex; vistaMat.needsUpdate = true;
  };
  loader.load('assets/mirmecia.png', apply, undefined,
    () => loader.load(MIRMECIA_URL, apply, undefined, () => {}));
}
const vista = new THREE.Mesh(new THREE.PlaneGeometry(150, 75), vistaMat);
vista.position.set(0, 18, -BEAM_LENGTH - 35);
scene.add(vista);

// portão de chegada
const goalZ = -BEAM_LENGTH + 14;
const goal = new THREE.Group();
{
  const postMat = new THREE.MeshStandardMaterial({ color: 0xd9d9e2, metalness: 1, roughness: 0.25 });
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 6, 10), postMat);
    post.position.set(side * 3.2, 3, 0);
    post.castShadow = true;
    goal.add(post);
  }
  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 1.4),
    new THREE.MeshStandardMaterial({ color: 0xc0392b, side: THREE.DoubleSide, roughness: 0.8 })
  );
  banner.position.set(0, 5.4, 0);
  goal.add(banner);
}
goal.position.set(0, BEAM_TOP_Y, goalZ);
scene.add(goal);

// ---------------------------------------------------------------- Tarso (jogador)
const foilMat = new THREE.MeshStandardMaterial({ color: 0xdcdce6, metalness: 1, roughness: 0.28 });
const skinMat = new THREE.MeshStandardMaterial({ color: 0xc98e63, roughness: 0.8 });
const swordMat = new THREE.MeshStandardMaterial({ color: 0x7a4a30, metalness: 0.7, roughness: 0.55 });

const player = new THREE.Group();
{
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.7, 6, 12), foilMat);
  body.position.y = 0.95; body.castShadow = true;
  player.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 12), skinMat);
  head.position.y = 1.85; head.castShadow = true;
  player.add(head);

  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), foilMat);
  helm.position.y = 1.92; helm.castShadow = true;
  player.add(helm);

  // a lasca de ferro torta — a "lâmina mais nobre do mundo"
  const sword = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 0.22), swordMat);
  sword.position.set(0.62, 1.3, 0);
  sword.rotation.z = -0.28; sword.rotation.x = 0.1;
  sword.castShadow = true;
  player.add(sword);

  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.4, 4, 8), foilMat);
    leg.position.set(side * 0.22, 0.32, 0);
    leg.castShadow = true;
    leg.name = side === -1 ? 'legL' : 'legR';
    player.add(leg);
  }
}
player.position.set(0, BEAM_TOP_Y, 4);
scene.add(player);

let velY = 0;
let onGround = true;
let facing = Math.PI; // olhando para -z

// ---------------------------------------------------------------- lascas de prata
const shards = [];
{
  const shardGeo = new THREE.OctahedronGeometry(0.55);
  const shardMat = new THREE.MeshStandardMaterial({
    color: 0xf2f2fa, metalness: 1, roughness: 0.12,
    emissive: 0x555566, emissiveIntensity: 0.35,
  });
  for (let i = 0; i < SHARD_COUNT; i++) {
    const shard = new THREE.Mesh(shardGeo, shardMat);
    const z = -25 - i * ((BEAM_LENGTH - 60) / (SHARD_COUNT - 1));
    shard.position.set((Math.random() - 0.5) * (BEAM_WIDTH - 3), BEAM_TOP_Y + 1.1, z);
    shard.castShadow = true;
    scene.add(shard);
    shards.push(shard);
  }
}

// ---------------------------------------------------------------- a Sombra (o pássaro)
const bird = new THREE.Group();
{
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x17110d, roughness: 0.9 });
  const bodyB = new THREE.Mesh(new THREE.ConeGeometry(1.2, 5, 8), darkMat);
  bodyB.rotation.x = -Math.PI / 2;
  bird.add(bodyB);
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.PlaneGeometry(7, 2.6), new THREE.MeshStandardMaterial({ color: 0x17110d, side: THREE.DoubleSide, roughness: 0.9 }));
    wing.position.set(side * 3.6, 0.3, 0.4);
    wing.rotation.z = side * 0.25;
    wing.name = side === -1 ? 'wingL' : 'wingR';
    bird.add(wing);
  }
}
bird.visible = false;
scene.add(bird);

// sombra projetada do pássaro no chão (aviso visual)
const birdShadow = new THREE.Mesh(
  new THREE.CircleGeometry(4, 24),
  new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 })
);
birdShadow.rotation.x = -Math.PI / 2;
birdShadow.position.y = BEAM_TOP_Y + 0.03;
scene.add(birdShadow);

let strikeT = 0;       // progresso do bote 0..1
let strikeZ = 0;       // onde o bote vai acertar
let strikeChecked = false;

// ---------------------------------------------------------------- HUD / interface
const $ = (id) => document.getElementById(id);
const msgEl = $('message');
let msgTimeout = null;

function say(text, { danger = false, time = 3500 } = {}) {
  msgEl.textContent = text;
  msgEl.classList.toggle('danger', danger);
  msgEl.classList.add('show');
  clearTimeout(msgTimeout);
  msgTimeout = setTimeout(() => msgEl.classList.remove('show'), time);
}

function updateHUD() {
  $('shard-count').textContent = state.shards;
  $('hearts').textContent = '❤'.repeat(state.hearts) + '♡'.repeat(MAX_HEARTS - state.hearts);
}
updateHUD();

let titleDismissed = false;
function dismissTitle() {
  if (titleDismissed) return;
  titleDismissed = true;
  $('title-card').classList.add('fade');
}
setTimeout(dismissTitle, 7000);

// resolve a arte de título: local → CDN → só o gradiente
let titleArtUrl = null;
{
  const probeLocal = new Image();
  probeLocal.onload = () => { titleArtUrl = 'assets/title.png'; };
  probeLocal.onerror = () => {
    const probeRemote = new Image();
    probeRemote.onload = () => { titleArtUrl = TITLE_URL; };
    probeRemote.src = TITLE_URL;
  };
  probeLocal.src = 'assets/title.png';
}

function endGame(won) {
  state.over = true; state.won = won;
  const end = $('endscreen');
  if (won) {
    $('end-title').textContent = 'Mirmécia à vista';
    $('end-text').innerHTML =
      'Cinco pontinhos de prata no fim de uma barra de ferro.<br/>' +
      '“— Achei nossa casa.” — disse Tarso, sorrindo aquele sorriso doido e faminto.<br/>' +
      '“— Ai, não. De novo, não.” — murmurou Ávio.';
    end.style.backgroundImage = 'linear-gradient(rgba(12,6,2,.55), rgba(12,6,2,.75))' +
      (titleArtUrl ? `, url('${titleArtUrl}')` : '');
  } else {
    $('end-title').textContent = 'A Sombra venceu';
    $('end-text').innerHTML =
      'Tudo naquele céu queria comê-los — porque órfão aprende cedo.<br/>' +
      '“— Eu avisei.” — suspirou Ávio, fechando os olhos.';
    end.style.backgroundImage = 'linear-gradient(rgba(12,6,2,.8), rgba(12,6,2,.9))';
  }
  end.classList.remove('hidden');
}

$('restart').addEventListener('click', () => location.reload());
addEventListener('keydown', (e) => { if (state.over && e.code === 'KeyR') location.reload(); });

// ---------------------------------------------------------------- lógica de jogo
function isInHole() {
  return holes.some((h) =>
    Math.hypot(player.position.x - h.x, player.position.z - h.y) < HOLE_RADIUS * 0.92
  );
}

function loseHeart(why) {
  if (state.invuln > 0 || state.over) return;
  state.hearts--;
  state.invuln = 2;
  updateHUD();
  say(why, { danger: true });
  if (state.hearts <= 0) endGame(false);
}

function startBirdWarning() {
  state.birdPhase = 'warning';
  state.birdTimer = BIRD_WARNING;
  say('Ávio: — SOMBRA NO CÉU! Entra num buraco, AGORA!', { danger: true, time: BIRD_WARNING * 1000 });
  $('danger-vignette').classList.add('active');
  strikeZ = player.position.z; // o pássaro mira onde o jogador estava
}

function startBirdStrike() {
  state.birdPhase = 'striking';
  strikeT = 0;
  strikeChecked = false;
  bird.visible = true;
  strikeZ = player.position.z; // corrige a mira no último instante
}

function scheduleNextBird() {
  state.birdPhase = 'idle';
  state.birdTimer = BIRD_INTERVAL_MIN + Math.random() * (BIRD_INTERVAL_MAX - BIRD_INTERVAL_MIN);
  bird.visible = false;
  birdShadow.material.opacity = 0;
  $('danger-vignette').classList.remove('active');
}

function updateBird(dt) {
  state.birdTimer -= dt;

  if (state.birdPhase === 'idle' && state.birdTimer <= 0) startBirdWarning();
  else if (state.birdPhase === 'warning') {
    // sombra crescendo no ponto do bote
    birdShadow.position.set(player.position.x, BEAM_TOP_Y + 0.03, strikeZ);
    birdShadow.material.opacity = Math.min(0.55, 0.55 * (1 - state.birdTimer / BIRD_WARNING));
    if (state.birdTimer <= 0) startBirdStrike();
  } else if (state.birdPhase === 'striking') {
    strikeT += dt / 1.4; // duração do mergulho
    const t = Math.min(strikeT, 1);
    // arco de mergulho: entra alto de um lado, rasga a barra, sobe do outro
    const x = THREE.MathUtils.lerp(-45, 45, t);
    const y = BEAM_TOP_Y + 1.2 + 38 * Math.pow(2 * t - 1, 2);
    bird.position.set(x, y, strikeZ);
    bird.lookAt(x + 1, y - (t < 0.5 ? 1 : -1) * 0.8, strikeZ);
    const flap = Math.sin(performance.now() * 0.02) * 0.5;
    bird.getObjectByName('wingL').rotation.z = -0.25 - flap;
    bird.getObjectByName('wingR').rotation.z = 0.25 + flap;
    birdShadow.position.set(x * 0.5, BEAM_TOP_Y + 0.03, strikeZ);
    birdShadow.material.opacity = 0.55;

    // no ponto mais baixo, confere se o jogador se protegeu
    if (!strikeChecked && t >= 0.5) {
      strikeChecked = true;
      const exposed = Math.abs(player.position.z - strikeZ) < 7 && !isInHole();
      if (exposed) loseHeart('O bico da Sombra bateu com um CLANG que sacudiu os ossos!');
      else if (isInHole()) say('Brio começou a rir — sempre ria depois do perigo.');
    }
    if (t >= 1) scheduleNextBird();
  }
}

function updatePlayer(dt) {
  const sprint = (keys['ShiftLeft'] || keys['ShiftRight']) ? SPRINT_MULT : 1;
  const speed = PLAYER_SPEED * sprint;
  let dx = 0, dz = 0;
  if (keys['KeyW'] || keys['ArrowUp']) dz -= 1;
  if (keys['KeyS'] || keys['ArrowDown']) dz += 1;
  if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
  if (keys['KeyD'] || keys['ArrowRight']) dx += 1;
  const len = Math.hypot(dx, dz);
  if (len > 0) {
    dx /= len; dz /= len;
    player.position.x += dx * speed * dt;
    player.position.z += dz * speed * dt;
    facing = Math.atan2(dx, dz);
  }
  // suaviza a rotação para a direção do movimento
  let dr = facing - player.rotation.y;
  while (dr > Math.PI) dr -= Math.PI * 2;
  while (dr < -Math.PI) dr += Math.PI * 2;
  player.rotation.y += dr * Math.min(1, dt * 12);

  // limites da barra
  player.position.x = THREE.MathUtils.clamp(player.position.x, -BEAM_WIDTH / 2 + 0.5, BEAM_WIDTH / 2 - 0.5);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -BEAM_LENGTH + 6, 8);

  // pulo / gravidade
  if ((keys['Space']) && onGround) { velY = JUMP_SPEED; onGround = false; }
  velY -= GRAVITY * dt;
  player.position.y += velY * dt;
  if (player.position.y <= BEAM_TOP_Y) { player.position.y = BEAM_TOP_Y; velY = 0; onGround = true; }

  // animação simples de corrida
  const moving = len > 0 && onGround;
  const swing = moving ? Math.sin(performance.now() * 0.012 * sprint) * 0.35 : 0;
  player.getObjectByName('legL').position.z = swing;
  player.getObjectByName('legR').position.z = -swing;

  // piscar quando invulnerável
  state.invuln = Math.max(0, state.invuln - dt);
  player.visible = state.invuln > 0 ? Math.floor(performance.now() / 100) % 2 === 0 : true;
}

function updateShards(dt) {
  for (let i = shards.length - 1; i >= 0; i--) {
    const s = shards[i];
    s.rotation.y += dt * 2;
    s.position.y = BEAM_TOP_Y + 1.1 + Math.sin(performance.now() * 0.003 + i) * 0.18;
    if (s.position.distanceTo(player.position) < 1.6) {
      scene.remove(s);
      shards.splice(i, 1);
      state.shards++;
      updateHUD();
      if (state.shards === SHARD_COUNT) {
        say('Tino: — É isso! Dá pra martelar uma armadura nova. Agora corre pro fim da barra!', { time: 5000 });
      } else {
        say(`Um pedaço de lua derretida... (${state.shards}/${SHARD_COUNT})`);
      }
    }
  }
}

function checkGoal() {
  if (player.position.z > goalZ + 3) return;
  if (state.shards >= SHARD_COUNT) endGame(true);
  else {
    say(`Ávio: — Volta! Ainda faltam ${SHARD_COUNT - state.shards} lascas de prata!`, { danger: true });
    player.position.z = goalZ + 4;
  }
}

function updateCamera(dt) {
  const target = new THREE.Vector3(
    player.position.x * 0.6,
    player.position.y + 5.2,
    player.position.z + 10.5
  );
  camera.position.lerp(target, Math.min(1, dt * 4));
  camera.lookAt(player.position.x * 0.8, player.position.y + 1.6, player.position.z - 6);

  // o sol acompanha o jogador para a sombra continuar nítida
  sun.position.set(player.position.x - 30, 35, player.position.z + 20);
  sun.target.position.copy(player.position);
}

function updateGrass() {
  const t = performance.now() * 0.0006;
  for (const blade of grassBlades) {
    blade.rotation.z = blade.userData.baseRotZ + Math.sin(t + blade.userData.phase) * 0.07;
  }
}

// ---------------------------------------------------------------- loop principal
const clock = new THREE.Clock();
say('Tarso: — Um dia a gente vai ter uma cidade. Muralha. Portão. Um lugar que diga “bem-vindos pra casa”.', { time: 6000 });

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if (!state.over) {
    updatePlayer(dt);
    updateShards(dt);
    updateBird(dt);
    checkGoal();
  }
  updateGrass();
  updateCamera(dt);
  renderer.render(scene, camera);
}
animate();
