// Fase 5 — A Corrida no Capim (track) · Capítulos 3-4
// Montados em Trovão: slalom pela selva de capim passando pelos anéis
// de checkpoint antes do tempo acabar.

import * as THREE from 'three';
import { GamePhase, FollowCam } from './framework.js';
import {
  sunsetLights, makeGround, makeGrassField, makeGecko, animateGecko,
  makeRing, makeRock,
} from '../world/builders.js';

const LEN = 360;
const HALF_W = 16;
const TIME_LIMIT = 75;
const RINGS = 8;

export class Phase05 extends GamePhase {
  constructor() {
    super(5, 'A Corrida no Capim', 'track',
      `Montados em Trovão! Passe pelos ${RINGS} anéis ◯ antes do tempo acabar.`);
  }

  build(ctx) {
    const scene = ctx.scene;
    this.sun = sunsetLights(scene, { fogNear: 35, fogFar: 130 });
    makeGround(scene, { y: 0, z: -LEN / 2, size: 800, color: 0x2e5419 });
    this.grass = makeGrassField(scene, { count: 380, innerGap: HALF_W * 2 + 8, spread: 40, zMin: -LEN - 30, zMax: 30, baseY: 0 });

    // Trovão com o grupo montado
    this.gecko = makeGecko();
    this.gecko.position.set(0, 0, 0);
    this.gecko.rotation.y = Math.PI;
    scene.add(this.gecko);
    ctx.party.spawn(scene, new THREE.Vector3(0, 1.6, 0));
    ctx.party.soloLeader(true);
    this.rider = ctx.party.leaderMesh;
    this.rider.userData.riding = true;
    this.rider.scale.setScalar(0.8);

    // anéis de checkpoint
    this.rings = [];
    for (let i = 0; i < RINGS; i++) {
      const ring = makeRing();
      ring.position.set((Math.random() - 0.5) * HALF_W * 1.7, 2.6, -28 - i * ((LEN - 50) / (RINGS - 1)));
      scene.add(ring);
      this.rings.push(ring);
    }
    this.passed = 0;

    // pedras no caminho (batida = derrapada, perde tempo)
    this.rocks = [];
    for (let i = 0; i < 16; i++) {
      const rock = makeRock({ r: 1.2 + Math.random() });
      rock.position.set((Math.random() - 0.5) * HALF_W * 1.9, 0.8, -20 - Math.random() * (LEN - 40));
      scene.add(rock);
      this.rocks.push(rock);
    }

    this.cam = new FollowCam(ctx.camera, { height: 6.5, back: 12, stiffness: 5 });
    this.cam.snap(this.gecko.position);
    this.time = TIME_LIMIT;
    this.speed = 0;
    this.stunned = 0;
    this._hud(ctx);
    ctx.hud.say('Brio (gritando contra o vento): — MAIS RÁPIDO! ELA AGUENTA!', { time: 4000 });
  }

  _hud(ctx) {
    ctx.hud.setStatus(`ANEIS ${this.passed}/${RINGS} · TEMPO ${Math.ceil(this.time)}s`);
  }

  update(ctx, dt) {
    this.time -= dt;
    if (this.time <= 0) {
      return this.onLose(ctx, 'Tarde demais — a patrulha fechou a trilha.<br/>Ávio: — Eu disse que era pra ontem.');
    }

    const g = this.gecko.position;
    this.stunned = Math.max(0, this.stunned - dt);
    // aceleração automática para frente; A/D fazem o slalom
    const maxSpeed = this.stunned > 0 ? 8 : 26;
    this.speed = THREE.MathUtils.lerp(this.speed, maxSpeed, dt * 1.5);
    g.z -= this.speed * dt;
    const { dx } = ctx.input.axis();
    g.x = THREE.MathUtils.clamp(g.x + dx * 17 * dt, -HALF_W, HALF_W);
    this.gecko.rotation.y = Math.PI + dx * -0.35;
    animateGecko(this.gecko, true);

    // grupo montado acompanha
    this.rider.position.set(g.x, 1.7, g.z + 0.3);
    this.rider.rotation.y = Math.PI;
    ctx.party.updateFollowers(this.rider.position, this.rider.rotation.y);

    // anéis
    for (const ring of this.rings) {
      if (ring.userData.done) continue;
      ring.rotation.y += dt * 2;
      if (Math.abs(g.z - ring.position.z) < 1.6 && Math.abs(g.x - ring.position.x) < 2.8) {
        ring.userData.done = true;
        ring.material = ring.material.clone();
        ring.material.color.set(0x6fa03a);
        ring.material.emissive.set(0x6fa03a);
        this.passed++;
        this.time = Math.min(TIME_LIMIT, this.time + 3);
        ctx.audio.sfx('pickup');
        this._hud(ctx);
      } else if (g.z < ring.position.z - 2 && !ring.userData.missed) {
        ring.userData.missed = true;
        ctx.hud.say('Anel perdido!', { danger: true, time: 1200 });
      }
    }

    // pedras
    for (const rock of this.rocks) {
      if (rock.userData.hit) continue;
      if (Math.abs(g.z - rock.position.z) < 1.8 && Math.abs(g.x - rock.position.x) < 2) {
        rock.userData.hit = true;
        this.stunned = 1.2;
        ctx.audio.sfx('clang');
        ctx.hud.say('Trovão derrapou na pedra!', { danger: true, time: 1500 });
      }
    }

    this._hud(ctx);

    // linha de chegada
    if (g.z <= -LEN) {
      if (this.passed >= RINGS - 2) {
        return this.onWin(ctx,
          'Trovão não fazia barulho nenhum — só o capim, abrindo alas.<br/>Nem a cavalaria de Mirmécia corre assim.',
          this.passed);
      }
      return this.onLose(ctx, `Só ${this.passed} anéis — a trilha certa se perdeu no capim.`);
    }

    this.grass.update();
    this.cam.update(g, dt, this.sun);
  }
}
