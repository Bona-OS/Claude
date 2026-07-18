// Mapa-múndi estilo Final Fantasy V: a jornada do capim ao Grande Rio.
// Caminho pontilhado, 10 nós; ←/→ anda entre nós liberados, Enter entra.

import * as THREE from 'three';
import { canvasTexture, colorMat, makeHero, dayLights, horizonArt, groundTexture } from './builders.js';
import { ART } from './art.js';
import { PARTY_MEMBERS } from '../core/party.js';

// posições dos 10 nós no plano do mapa (x, z) — serpenteando NO→SE
const NODES = [
  [-46, 26], [-34, 18], [-26, 28], [-14, 20], [-2, 26],
  [8, 14], [20, 22], [30, 10], [38, 20], [48, 8],
];

// arte do mapa gerada no Higgsfield (ver docs/PROMPTS.md); fallback procedural se offline
export let WORLDMAP_ART_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_3Cs6n4P9VtDQBLcqUPlxk1nSd2p/hf_20260718_135543_e6888cbf-cd42-4a41-8bbc-cf61a112aa97.png';
export function setWorldmapArt(url) { WORLDMAP_ART_URL = url; }

function paintMap() {
  return canvasTexture(1024, 640, (g, w, h) => {
    // campo
    g.fillStyle = '#3d6b23'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 700; i++) {
      g.fillStyle = ['#4f7d2a', '#2e5419', '#6fa03a'][i % 3];
      g.fillRect(Math.random() * w, Math.random() * h, 4, 8);
    }
    // a barra de ferro (NO)
    g.save();
    g.translate(60, 120); g.rotate(0.5);
    g.fillStyle = '#8a3b22'; g.fillRect(-30, -14, 260, 28);
    g.fillStyle = '#6e2c16';
    for (let i = 0; i < 8; i++) g.beginPath(), g.arc(i * 32, 0, 6, 0, 7), g.fill();
    g.restore();
    // Mirmécia (centro): morro com torres
    g.fillStyle = '#4a2f1b';
    g.beginPath(); g.arc(w * 0.5, h * 0.42, 85, 0, 7); g.fill();
    g.fillStyle = '#c2602f';
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      g.fillRect(w * 0.5 + Math.cos(a) * 50 - 5, h * 0.42 + Math.sin(a) * 40 - 22, 10, 26);
    }
    // o Grande Rio (SE)
    g.strokeStyle = '#274b8a'; g.lineWidth = 60;
    g.beginPath();
    g.moveTo(w * 0.7, h);
    g.bezierCurveTo(w * 0.78, h * 0.6, w * 0.9, h * 0.5, w, h * 0.3);
    g.stroke();
    g.strokeStyle = '#3a6fd8'; g.lineWidth = 8;
    g.stroke();
    // caminho pontilhado pelos nós
    g.fillStyle = '#f3e9d2';
    for (let i = 0; i < NODES.length - 1; i++) {
      const [x1, z1] = NODES[i], [x2, z2] = NODES[i + 1];
      for (let t = 0.15; t < 1; t += 0.2) {
        const px = ((x1 + (x2 - x1) * t) / 120 + 0.5) * w;
        const py = ((z1 + (z2 - z1) * t) / 68 + 0.5) * h;
        g.beginPath(); g.arc(px, py, 5, 0, 7); g.fill();
      }
    }
  });
}

export class WorldMap {
  constructor(ctx, phases) {
    this.ctx = ctx;
    this.phases = phases;
    this.cursor = 0;
    this.scene = null;
  }

  build() {
    const ctx = this.ctx;
    this.scene = new THREE.Scene();
    const scene = this.scene;
    dayLights(scene, { fogNear: 140, fogFar: 520 });
    // vista pintada no horizonte: o mundo continua alem do mapa
    horizonArt(scene, ART.capim, { w: 520, h: 170, position: [0, 40, -110] });
    // mapa
    const mapMat = new THREE.MeshStandardMaterial({ map: paintMap(), roughness: 0.9 });
    if (WORLDMAP_ART_URL) {
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin('anonymous');
      loader.load(WORLDMAP_ART_URL, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        mapMat.map = tex; mapMat.needsUpdate = true;
      }, undefined, () => {});
    }
    const map = new THREE.Mesh(new THREE.PlaneGeometry(120, 68), mapMat);
    map.rotation.x = -Math.PI / 2;
    map.receiveShadow = true;
    scene.add(map);
    // capim texturizado além da borda do mapa — o mundo continua
    const skirtTex = groundTexture(0x2e5419, { variant: 'grass' });
    skirtTex.wrapS = skirtTex.wrapT = THREE.RepeatWrapping;
    skirtTex.repeat.set(26, 26);
    const skirt = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), new THREE.MeshStandardMaterial({ map: skirtTex, roughness: 1 }));
    skirt.rotation.x = -Math.PI / 2;
    skirt.position.y = -0.15;
    scene.add(skirt);

    // nós: bandeirinha (completa = pétala vermelha; ativa = dourada; travada = mastro)
    this.flags = [];
    NODES.forEach(([x, z], i) => {
      const id = i + 1;
      const group = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 3, 6), colorMat(0x4a2f1b));
      pole.position.y = 1.5;
      group.add(pole);
      const flag = new THREE.Mesh(
        new THREE.PlaneGeometry(1.6, 1),
        colorMat(ctx.save.isCompleted(id) ? 0xc0392b : ctx.save.isUnlocked(id) ? 0xf0b46a : 0x56575e, { side: THREE.DoubleSide })
      );
      flag.position.set(0.8, 2.6, 0);
      group.add(flag);
      group.position.set(x, 0, z);
      scene.add(group);
      this.flags.push(group);
    });

    // token do grupo: o líder em miniatura
    this.token = makeHero(this.ctx.party.leader);
    this.token.scale.setScalar(1.4);
    const start = Math.min(this.ctx.save.data.unlocked, 10) - 1;
    this.cursor = start;
    this.token.position.set(NODES[start][0], 0, NODES[start][1]);
    scene.add(this.token);

    this._updateHud();
    return scene;
  }

  _updateHud() {
    const ctx = this.ctx;
    const phase = this.phases[this.cursor];
    const id = this.cursor + 1;
    const status = ctx.save.isCompleted(id) ? ' ✓' : ctx.save.isUnlocked(id) ? '' : ' 🔒';
    ctx.hud.setObjective(`${id}/10 · ${phase.name}${status} — ${phase.type.toUpperCase()}`);
    ctx.hud.setStatus('←/→ viajar · ENTER entrar · M som');
    ctx.hud.party(PARTY_MEMBERS, ctx.party.activeLeaderId);
  }

  update(dt) {
    const ctx = this.ctx;
    // escolha do líder direto no mapa (1-5)
    for (let i = 1; i <= 5; i++) {
      if (ctx.input.justPressed(`Digit${i}`, `Numpad${i}`) && ctx.party.activeLeaderId !== i) {
        ctx.party.activeLeaderId = i;
        const pos = this.token.position.clone();
        const rot = this.token.rotation.y;
        this.scene.remove(this.token);
        this.token = makeHero(ctx.party.leader);
        this.token.scale.setScalar(1.4);
        this.token.position.copy(pos);
        this.token.rotation.y = rot;
        this.scene.add(this.token);
        this._updateHud();
        ctx.hud.say(`${ctx.party.leader.name} lidera a marcha. ${ctx.party.leader.ability}`, { time: 2500 });
        ctx.audio.sfx('pickup');
      }
    }
    // navegação entre nós (por contagem: não perde presses em frames lentos)
    let steps = ctx.input.presses('ArrowRight', 'KeyD') - ctx.input.presses('ArrowLeft', 'KeyA');
    while (steps > 0 && this.cursor < 9 && ctx.save.isUnlocked(this.cursor + 2)) {
      this.cursor++; steps--; this._updateHud(); ctx.audio.sfx('step');
    }
    while (steps < 0 && this.cursor > 0) {
      this.cursor--; steps++; this._updateHud(); ctx.audio.sfx('step');
    }
    if (ctx.input.justPressed('Enter')) {
      const id = this.cursor + 1;
      if (ctx.save.isUnlocked(id)) ctx.startPhase(id);
      else ctx.hud.say('Ávio: — Ainda não. Uma coisa de cada vez.', { danger: true });
    }
    // o token caminha até o nó do cursor
    const [tx, tz] = NODES[this.cursor];
    const target = new THREE.Vector3(tx, 0, tz);
    const d = target.distanceTo(this.token.position);
    if (d > 0.1) {
      this.token.position.lerp(target, Math.min(1, dt * 3));
      this.token.lookAt(target.x, 0, target.z);
    }
    // câmera FFV: alta, inclinada, seguindo o token
    const cam = ctx.camera;
    const goal = new THREE.Vector3(this.token.position.x * 0.7, 25, this.token.position.z + 27);
    cam.position.lerp(goal, Math.min(1, dt * 3));
    cam.lookAt(this.token.position.x, 2, this.token.position.z - 14);
  }
}
