// Fase 9 — As Três Hostes (fight) · Capítulos 9-10
// Defesa em ondas: a cavalaria de vespas do Cônsul ataca em três hostes.
// Use as habilidades: Tarso espadada (E), Tino tiro (E), Garra bloqueio (E).

import * as THREE from 'three';
import { GamePhase, Walker, FollowCam, Hearts, handleParty, dist2d } from './framework.js';
import { ART } from '../world/art.js';
import { horizonArt, sunsetLights, makeGround, makeGrassField, makeWasp, colorMat } from '../world/builders.js';

const ARENA = 26;
const WAVES = [4, 6, 8];

export class Phase09 extends GamePhase {
  constructor() {
    super(9, 'As Três Hostes', 'fight',
      'Três hostes de vespas. Tarso corta (E), Tino atira (E), Garra bloqueia (segure E).');
  }

  build(ctx) {
    const scene = ctx.scene;
    this.sun = sunsetLights(scene, { fogColor: 0xc2602f, fogNear: 30, fogFar: 110 });
    makeGround(scene, { y: 0, z: 0, color: 0x3d6b23 });
    horizonArt(scene, ART.capim, { w: 360, h: 120, position: [0, 30, -160] });
    this.grass = makeGrassField(scene, { count: 200, innerGap: ARENA * 2 + 10, spread: 26, zMin: -60, zMax: 60, baseY: 0 });

    // o estandarte a defender (a flor de capim do Brio)
    this.banner = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 6, 6), colorMat(0x4a2f1b));
    pole.position.y = 3;
    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.8, 8, 6), colorMat(0xf0b46a, { emissive: 0xf0b46a, emissiveIntensity: 0.4 }));
    flower.position.y = 6.2;
    this.banner.add(pole, flower);
    scene.add(this.banner);
    this.bannerHP = 3;

    const leaderMesh = ctx.party.spawn(scene, new THREE.Vector3(0, 0, 6));
    this.walker = new Walker(ctx, leaderMesh, {
      speed: 12,
      clamp: (p) => {
        p.x = THREE.MathUtils.clamp(p.x, -ARENA, ARENA);
        p.z = THREE.MathUtils.clamp(p.z, -ARENA, ARENA);
      },
    });
    this.cam = new FollowCam(ctx.camera, { height: 9, back: 13 });
    this.cam.snap(leaderMesh.position);

    this.hearts = new Hearts(ctx);
    this.wave = 0;
    this.wasps = [];
    this.bolts = [];
    this.slash = 0;
    this._nextWave(ctx);
    ctx.hud.say('Tino: — Não é uma república. É uma ditadura usando roupa de república.', { time: 5000 });
  }

  _nextWave(ctx) {
    this.wave++;
    const count = WAVES[this.wave - 1];
    for (let i = 0; i < count; i++) {
      const wasp = makeWasp();
      const a = Math.random() * Math.PI * 2;
      const r = ARENA + 12 + Math.random() * 8;
      wasp.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      wasp.userData = { hp: this.wave >= 3 ? 2 : 1, speed: 4.2 + Math.random() * 1.6 + this.wave * 0.4, stun: 0 };
      ctx.scene.add(wasp);
      this.wasps.push(wasp);
    }
    ctx.hud.say(`A ${['PRIMEIRA', 'SEGUNDA', 'TERCEIRA'][this.wave - 1]} HOSTE desceu do céu em formação!`, { danger: true, time: 3000 });
    this._hud(ctx);
  }

  _hud(ctx) {
    ctx.hud.setStatus(`HOSTE ${this.wave}/3 · VESPAS ${this.wasps.length} · FLOR ${'●'.repeat(this.bannerHP)}   ${this.hearts.display}`);
  }

  update(ctx, dt) {
    this.walker.update(dt);
    handleParty(ctx, this.walker);
    const p = this.walker.mesh.position;
    const leaderId = ctx.party.activeLeaderId;
    this.slash = Math.max(0, this.slash - dt);

    // habilidades
    const blocking = leaderId === 4 && ctx.input.down('KeyE');
    this.walker.frozen = blocking;
    if (ctx.input.justPressed('KeyE')) {
      if (leaderId === 1) {
        this.slash = 0.25;
        ctx.audio.sfx('clang');
        const w = this.walker.mesh.getObjectByName('weapon');
        if (w) { w.rotation.z = -1.6; setTimeout(() => { w.rotation.z = -0.28; }, 150); }
      } else if (leaderId === 3) {
        ctx.audio.sfx('shoot');
        const bolt = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1, 5), colorMat(0x6fa03a));
        bolt.rotation.x = Math.PI / 2;
        bolt.position.copy(p).setY(1.4);
        bolt.userData.dir = new THREE.Vector3(Math.sin(this.walker.facing), 0, Math.cos(this.walker.facing));
        ctx.scene.add(bolt);
        this.bolts.push(bolt);
      } else if (leaderId === 4) {
        ctx.audio.sfx('block');
      } else {
        ctx.hud.say(`${ctx.party.leader.name} não luta — troque para Tarso (1), Tino (3) ou Garra (4)!`, { time: 2000 });
      }
    }

    // tiros do Tino
    for (let i = this.bolts.length - 1; i >= 0; i--) {
      const b = this.bolts[i];
      b.position.addScaledVector(b.userData.dir, 28 * dt);
      b.lookAt(b.position.clone().add(b.userData.dir));
      let used = false;
      for (const wasp of this.wasps) {
        if (dist2d(b.position, wasp.position) < 1.4) { this._hitWasp(ctx, wasp); used = true; break; }
      }
      if (used || b.position.length() > 80) { ctx.scene.remove(b); this.bolts.splice(i, 1); }
    }

    // vespas: voam para o mais próximo entre líder e estandarte
    for (const wasp of this.wasps) {
      wasp.userData.stun = Math.max(0, wasp.userData.stun - dt);
      const wingFlap = Math.sin(performance.now() * 0.03) * 0.5;
      wasp.getObjectByName('wingL').rotation.z = wingFlap;
      wasp.getObjectByName('wingR').rotation.z = -wingFlap;
      if (wasp.userData.stun > 0) continue;
      const target = dist2d(wasp.position, p) < dist2d(wasp.position, this.banner.position) ? p : this.banner.position;
      const dir = new THREE.Vector3(target.x - wasp.position.x, 0, target.z - wasp.position.z).normalize();
      wasp.position.addScaledVector(dir, wasp.userData.speed * dt);
      wasp.position.y = 0.4 + Math.sin(performance.now() * 0.004 + wasp.id) * 0.3;
      wasp.rotation.y = Math.atan2(dir.x, dir.z);

      // espadada do Tarso
      if (this.slash > 0 && dist2d(wasp.position, p) < 3.2) {
        this._hitWasp(ctx, wasp, 1);
        continue;
      }
      // contato com o líder
      if (dist2d(wasp.position, p) < 1.5) {
        if (blocking) {
          ctx.audio.sfx('block');
          wasp.userData.stun = 1.2;
          wasp.position.addScaledVector(dir, -6);
        } else {
          wasp.userData.stun = 1;
          if (this.hearts.hit('Ferrão! As fileiras do Cônsul não erram duas vezes.')) {
            return this.onLose(ctx, 'As Três Hostes fecharam o cerco.<br/>Relojoaria contra bravura bagunçada — e a relojoaria venceu.');
          }
          this._hud(ctx);
        }
      }
      // contato com o estandarte
      if (dist2d(wasp.position, this.banner.position) < 2) {
        wasp.userData.stun = 1.6;
        this.bannerHP--;
        ctx.audio.sfx('hurt');
        ctx.hud.say('A flor de capim do Brio está sob ataque!', { danger: true, time: 1800 });
        this._hud(ctx);
        if (this.bannerHP <= 0) {
          return this.onLose(ctx, 'A flor torta caiu no chão pisoteado.<br/>Brio não riu dessa vez.');
        }
      }
    }

    // remover vespas mortas e avançar de hoste
    if (this.wasps.length === 0) {
      if (this.wave >= 3) {
        return this.onWin(ctx,
          'A terceira hoste recuou — pela primeira vez em cem anos.<br/>No alto do morro, o Cônsul fechou a luneta devagar.',
          this.hearts.n + this.bannerHP);
      }
      this._nextWave(ctx);
    }

    this.hearts.update(dt, this.walker.mesh);
    this.grass.update();
    this.cam.update(p, dt, this.sun);
  }

  _hitWasp(ctx, wasp, dmg = 1) {
    wasp.userData.hp -= dmg;
    wasp.userData.stun = 0.6;
    if (wasp.userData.hp <= 0) {
      ctx.scene.remove(wasp);
      this.wasps.splice(this.wasps.indexOf(wasp), 1);
      ctx.audio.sfx('pickup');
      this._hud(ctx);
    }
  }
}
