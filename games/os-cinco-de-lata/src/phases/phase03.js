// Fase 3 — As Montanhas de Pétalas (world) · Capítulo 2
// Stealth nos depósitos de Mirmécia: pegue 3 pétalas-mapa e fuja pela
// fenda sem ser visto pelas formigas-sentinela.

import * as THREE from 'three';
import { GamePhase, Walker, FollowCam, Hearts, handleParty, dist2d } from './framework.js';
import { caveLights, colorMat, makeAnt, makePetalMound, makeGoal } from '../world/builders.js';

const AREA = 46;

export class Phase03 extends GamePhase {
  constructor() {
    super(3, 'As Montanhas de Pétalas', 'world',
      'Pegue as 3 pétalas-mapa ❀ e fuja pela fenda — sem ser visto pelas sentinelas.');
  }

  build(ctx) {
    const scene = ctx.scene;
    caveLights(scene, { fogColor: 0x1a0e06, amberGlow: true });

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(AREA * 2.4, AREA * 2.4), colorMat(0x3a2410, { roughness: 1 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // colunas de âmbar que iluminam (e dão cobertura)
    for (let i = 0; i < 10; i++) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 16, 7),
        colorMat(0xc2602f, { emissive: 0x6e2c16, emissiveIntensity: 0.7 }));
      col.position.set((Math.random() - 0.5) * AREA * 1.8, 8, (Math.random() - 0.5) * AREA * 1.8);
      col.castShadow = true;
      scene.add(col);
    }
    // montanhas de pétalas (cobertura principal)
    this.mounds = [];
    for (let i = 0; i < 14; i++) {
      const m = makePetalMound(scene, {
        x: (Math.random() - 0.5) * AREA * 1.9,
        z: (Math.random() - 0.5) * AREA * 1.9,
        r: 3 + Math.random() * 4,
      });
      this.mounds.push(m);
    }

    // 3 pétalas-mapa para coletar
    this.petals = [];
    for (const [x, z] of [[-AREA + 8, -AREA + 8], [AREA - 8, 0], [0, AREA - 10]]) {
      const petal = new THREE.Mesh(new THREE.CircleGeometry(0.9, 8), colorMat(0xf0b46a, { emissive: 0xf0b46a, emissiveIntensity: 0.6, side: THREE.DoubleSide }));
      petal.rotation.x = -Math.PI / 2;
      petal.position.set(x, 0.4, z);
      scene.add(petal);
      this.petals.push(petal);
    }
    this.collected = 0;

    // sentinelas patrulhando em rotas circulares, com cone de visão
    this.guards = [];
    const coneGeo = new THREE.ConeGeometry(4.5, 12, 12, 1, true);
    coneGeo.translate(0, -6, 0);
    coneGeo.rotateX(-Math.PI / 2);
    for (let i = 0; i < 4; i++) {
      const ant = makeAnt({ color: 0x2c1d11 });
      ant.scale.setScalar(1.6);
      const cone = new THREE.Mesh(coneGeo, new THREE.MeshBasicMaterial({ color: 0xf0b46a, transparent: true, opacity: 0.12, side: THREE.DoubleSide }));
      cone.position.y = 1;
      ant.add(cone);
      scene.add(ant);
      this.guards.push({
        mesh: ant,
        cx: (Math.random() - 0.5) * AREA, cz: (Math.random() - 0.5) * AREA,
        r: 10 + Math.random() * 9, a: Math.random() * Math.PI * 2,
        speed: 0.45 + Math.random() * 0.25,
      });
    }

    // a fenda de saída
    this.exit = makeGoal(scene, { z: -AREA - 4, bannerColor: 0xf0b46a });
    this.exit.position.x = 0;

    const leaderMesh = ctx.party.spawn(scene, new THREE.Vector3(0, 0, AREA - 4));
    this.walker = new Walker(ctx, leaderMesh, {
      speed: 10,
      clamp: (p) => {
        p.x = THREE.MathUtils.clamp(p.x, -AREA, AREA);
        p.z = THREE.MathUtils.clamp(p.z, -AREA - 6, AREA);
      },
    });
    this.cam = new FollowCam(ctx.camera, { height: 8, back: 12 });
    this.cam.snap(leaderMesh.position);
    this.hearts = new Hearts(ctx);
    this.alarm = 0;
    this._hud(ctx);
    ctx.hud.say('Ávio: — Pisa leve. Aqui embaixo até as pétalas escutam.', { time: 4500 });
  }

  _hud(ctx) {
    ctx.hud.setStatus(`❀ ${this.collected}/3   ${this.hearts.display}`);
  }

  _seen(ctx, guard) {
    const p = this.walker.mesh.position;
    const g = guard.mesh.position;
    const d = dist2d(p, g);
    if (d > 13) return false;
    // atrás de uma montanha de pétalas = escondido
    for (const m of this.mounds) {
      if (dist2d(p, m.position) < m.geometry.parameters.radius * 0.9) return false;
    }
    // dentro do cone (ângulo até a direção da sentinela)
    const dir = Math.atan2(p.x - g.x, p.z - g.z);
    let diff = dir - guard.mesh.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    // Shift = andar agachado: cone efetivo menor
    const halfAngle = ctx.input.down('ShiftLeft', 'ShiftRight') ? 0.28 : 0.42;
    return Math.abs(diff) < halfAngle;
  }

  update(ctx, dt) {
    this.walker.update(dt);
    handleParty(ctx, this.walker);
    const p = this.walker.mesh.position;

    // pétalas
    for (let i = this.petals.length - 1; i >= 0; i--) {
      const petal = this.petals[i];
      petal.rotation.z += dt;
      if (dist2d(p, petal.position) < 1.8) {
        ctx.scene.remove(petal);
        this.petals.splice(i, 1);
        this.collected++;
        ctx.audio.sfx('pickup');
        this._hud(ctx);
        ctx.hud.say(this.collected === 3
          ? 'Tino: — É um mapa da cidade! Agora a fenda, rápido!'
          : `Uma pétala prensada com marcas... (${this.collected}/3)`);
      }
    }

    // sentinelas
    let spotted = false;
    for (const guard of this.guards) {
      guard.a += guard.speed * dt;
      const gx = guard.cx + Math.cos(guard.a) * guard.r;
      const gz = guard.cz + Math.sin(guard.a) * guard.r;
      guard.mesh.rotation.y = Math.atan2(gx - guard.mesh.position.x, gz - guard.mesh.position.z);
      guard.mesh.position.set(gx, 0, gz);
      if (this._seen(ctx, guard)) spotted = true;
    }
    if (spotted) {
      this.alarm += dt;
      ctx.hud.danger(true);
      if (this.alarm > 1.1) {
        this.alarm = 0;
        ctx.audio.sfx('hurt');
        if (this.hearts.hit('— INTRUSOS! — A corneta de pétala ecoou pelos depósitos!')) {
          return this.onLose(ctx, 'Em Mirmécia, tudo que brilha é vigiado.<br/>E cinco de lata brilham demais.');
        }
        this._hud(ctx);
      }
    } else {
      this.alarm = Math.max(0, this.alarm - dt * 2);
      ctx.hud.danger(false);
    }

    this.hearts.update(dt, this.walker.mesh);

    // fuga
    if (p.z <= -AREA - 1) {
      if (this.collected >= 3) {
        return this.onWin(ctx,
          'Saíram pela fenda com o mapa nas mãos e o coração na boca.<br/>Brio riu — depois do perigo, como sempre.',
          this.hearts.n);
      }
      ctx.hud.say(`Tino: — Sem o mapa a gente se perde! Faltam ${3 - this.collected} pétalas.`, { danger: true });
      p.z = -AREA + 1;
    }

    this.cam.update(p, dt);
  }
}
