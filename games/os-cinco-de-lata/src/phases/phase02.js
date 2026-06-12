// Fase 2 — Pra Baixo (arcade) · Capítulo 2
// A queda pelo cano de raiz: desviar dos anéis de raiz e pousar nas pétalas.

import * as THREE from 'three';
import { GamePhase, Hearts } from './framework.js';
import { caveLights, colorMat, makePetalMound, makeRing } from '../world/builders.js';

const DEPTH = 240;      // profundidade total da queda
const TUBE_R = 7;

export class Phase02 extends GamePhase {
  constructor() {
    super(2, 'Pra Baixo', 'arcade',
      'Caia pelo cano de raiz! Desvie dos anéis de raiz seca e pouse nas pétalas.');
  }

  build(ctx) {
    const scene = ctx.scene;
    caveLights(scene, { fogColor: 0x4a2f1b });
    scene.fog.near = 12; scene.fog.far = 80;
    // a queda iluminada: o lampião cai junto com o grupo
    this.lantern = new THREE.PointLight(0xf0b46a, 90, 36);
    scene.add(this.lantern);

    // o tubo (cilindro invertido, visto por dentro)
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(TUBE_R, TUBE_R, DEPTH + 60, 14, 1, true),
      colorMat(0x6e4a26, { side: THREE.BackSide, roughness: 1, emissive: 0x3a2410, emissiveIntensity: 0.4 })
    );
    tube.position.y = -DEPTH / 2;
    scene.add(tube);

    // raízes salientes nas paredes (decoração)
    for (let i = 0; i < 40; i++) {
      const root = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 4 + Math.random() * 5, 5), colorMat(0x3a2410));
      const a = Math.random() * Math.PI * 2;
      root.position.set(Math.cos(a) * (TUBE_R - 0.5), -Math.random() * DEPTH, Math.sin(a) * (TUBE_R - 0.5));
      root.rotation.z = Math.random() * Math.PI;
      scene.add(root);
    }

    // obstáculos: anéis de raiz com uma abertura — passe pelo buraco
    this.obstacles = [];
    for (let y = -22; y > -DEPTH + 25; y -= 16) {
      const group = new THREE.Group();
      const gapAngle = Math.random() * Math.PI * 2;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(TUBE_R - 1.6, 1.1, 6, 14, Math.PI * 1.55),
        colorMat(0x8a5a2e, { roughness: 1, emissive: 0x6e2c16, emissiveIntensity: 0.55 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.rotation.z = gapAngle;
      group.add(ring);
      group.position.y = y;
      group.userData = { gapAngle: gapAngle + Math.PI * 1.55 + (Math.PI * 0.45) / 2, hit: false };
      scene.add(group);
      this.obstacles.push(group);
    }

    // pétalas no fundo
    const floor = new THREE.Mesh(new THREE.CircleGeometry(TUBE_R, 16), colorMat(0xe07a9a));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -DEPTH;
    scene.add(floor);
    for (let i = 0; i < 5; i++) {
      makePetalMound(scene, {
        x: (Math.random() - 0.5) * 8, z: (Math.random() - 0.5) * 8, r: 1.5 + Math.random() * 1.5,
      }).position.y = -DEPTH;
    }
    // luz no fim do túnel
    const glow = new THREE.PointLight(0xe07a9a, 30, 60);
    glow.position.y = -DEPTH + 6;
    scene.add(glow);

    // o líder cai; os outros caem em volta (cosmético)
    this.player = ctx.party.spawn(scene, new THREE.Vector3(0, -4, 0));
    this.fallSpeed = 16;
    this.hearts = new Hearts(ctx);
    this._hud(ctx);
    ctx.hud.say('Tino: — Confia em mim! — e se jogou primeiro.', { time: 4000 });
  }

  _hud(ctx) {
    const prog = Math.min(100, Math.round((-this.player.position.y / DEPTH) * 100));
    ctx.hud.setStatus(`DESCIDA ${prog}%   ${this.hearts.display}`);
  }

  update(ctx, dt) {
    const p = this.player.position;
    this.lantern.position.set(p.x, p.y - 6, p.z); // ilumina o que vem de baixo
    // controle radial durante a queda
    const { dx, dz } = ctx.input.axis();
    p.x = THREE.MathUtils.clamp(p.x + dx * 11 * dt, -TUBE_R + 1.4, TUBE_R - 1.4);
    p.z = THREE.MathUtils.clamp(p.z + dz * 11 * dt, -TUBE_R + 1.4, TUBE_R - 1.4);
    const rr = Math.hypot(p.x, p.z);
    if (rr > TUBE_R - 1.4) { p.x *= (TUBE_R - 1.4) / rr; p.z *= (TUBE_R - 1.4) / rr; }
    // Shift acelera a queda (risco/recompensa), Brio cai mais manobrável
    const fall = this.fallSpeed * (ctx.input.down('ShiftLeft', 'ShiftRight') ? 1.6 : 1);
    p.y -= fall * dt;
    this.player.rotation.y += dt * 1.5; // girando na queda
    ctx.party.updateFollowers(this.player.position, this.player.rotation.y);

    // colisão com os anéis: na altura do anel, precisa estar no setor do vão
    for (const ob of this.obstacles) {
      if (ob.userData.hit) continue;
      if (Math.abs(p.y - ob.position.y) < 1.2) {
        const angle = Math.atan2(p.z, p.x);
        let diff = angle - ob.userData.gapAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const inGap = Math.abs(diff) < (Math.PI * 0.45) / 2 || rr < TUBE_R - 4.5;
        if (!inGap) {
          ob.userData.hit = true;
          ctx.audio.sfx('clang');
          if (this.hearts.hit('Cotoveladas e alumínio rangendo na raiz seca!')) {
            return this.onLose(ctx, 'O escuro engoliu os cinco — e dessa vez não soltou.');
          }
          this._hud(ctx);
        }
      }
    }

    this.hearts.update(dt, this.player);
    this._hud(ctx);

    // pouso
    if (p.y <= -DEPTH + 2) {
      return this.onWin(ctx,
        'Boom. Montanhas de pétalas perfumadas, vermelhas e douradas.<br/>O lugar mais perigoso da cidade inteira.',
        this.hearts.n);
    }

    // câmera: acima do jogador, olhando pra baixo
    ctx.camera.position.lerp(new THREE.Vector3(p.x * 0.6, p.y + 9, p.z * 0.6 + 4), Math.min(1, dt * 5));
    ctx.camera.lookAt(p.x, p.y - 6, p.z);
  }
}
