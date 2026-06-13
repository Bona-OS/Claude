// Fase 8 — O Grande Rio (arcade) · Capítulo 6
// Velejar o drakkar A Lata: desviar de troncos e redemoinhos, e
// sobreviver às ondas do Leviatã até a outra margem.

import * as THREE from 'three';
import { GamePhase, Hearts } from './framework.js';
import { ART } from '../world/art.js';
import { horizonArt, sunsetLights, makeWater, makeBoat, colorMat, makeRock } from '../world/builders.js';

const LEN = 380;
const HALF_W = 18;

export class Phase08 extends GamePhase {
  constructor() {
    super(8, 'O Grande Rio', 'arcade',
      'Pilote A Lata até a outra margem. Troncos, redemoinhos — e o Leviatã.');
  }

  build(ctx) {
    const scene = ctx.scene;
    this.horizon = horizonArt(scene, ART.rio, { w: 460, h: 150, position: [0, 38, -LEN - 100], sky: '#d98a4f', ground: '#16203a' });
    this.sun = sunsetLights(scene, { fogColor: 0xe8945a, fogNear: 45, fogFar: 160 });
    this.water = makeWater(scene, { size: 700 });

    // margens
    for (const side of [-1, 1]) {
      const bank = new THREE.Mesh(new THREE.BoxGeometry(30, 3, LEN + 200), colorMat(0x3d6b23));
      bank.position.set(side * (HALF_W + 17), 0.4, -LEN / 2);
      scene.add(bank);
    }
    // margem de chegada
    const shore = new THREE.Mesh(new THREE.BoxGeometry(80, 3, 30), colorMat(0x4f7d2a));
    shore.position.set(0, 0.4, -LEN - 18);
    scene.add(shore);

    // o drakkar com o grupo
    this.boat = makeBoat();
    this.boat.position.set(0, 0.4, 0);
    this.boat.rotation.y = Math.PI;
    scene.add(this.boat);
    ctx.party.spawn(scene, new THREE.Vector3(0, 1.2, 0));
    ctx.party.soloLeader(true);
    this.captain = ctx.party.leaderMesh;
    this.captain.userData.riding = true;
    this.captain.scale.setScalar(0.7);

    // troncos e redemoinhos
    this.hazards = [];
    for (let i = 0; i < 22; i++) {
      const isLog = Math.random() < 0.6;
      let mesh;
      if (isLog) {
        mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 7 + Math.random() * 5, 7), colorMat(0x4a2f1b));
        mesh.rotation.z = Math.PI / 2;
        mesh.rotation.y = Math.random();
      } else {
        mesh = new THREE.Mesh(new THREE.TorusGeometry(2, 0.5, 6, 14), colorMat(0x16203a));
        mesh.rotation.x = -Math.PI / 2;
      }
      mesh.position.set((Math.random() - 0.5) * HALF_W * 1.9, 0.4, -25 - Math.random() * (LEN - 50));
      mesh.userData.spin = !isLog;
      scene.add(mesh);
      this.hazards.push(mesh);
    }

    // o Leviatã (dorso que cruza o rio em ondas)
    this.leviathan = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const hump = new THREE.Mesh(new THREE.SphereGeometry(2.2 - i * 0.25, 10, 8), colorMat(0x16203a, { roughness: 0.3 }));
      hump.position.set(0, 0, i * 4.5);
      this.leviathan.add(hump);
    }
    this.leviathan.visible = false;
    scene.add(this.leviathan);
    this.levPhase = 'idle';
    this.levTimer = 13;
    this.levT = 0;
    this.levZ = 0;

    this.cam = null;
    this.hearts = new Hearts(ctx);
    this.speed = 0;
    this.stunned = 0;
    this._hud(ctx);
    ctx.hud.say('Tino projetou. Garra remou. Tarso batizou: A LATA.', { time: 4500 });
  }

  _hud(ctx) {
    const prog = Math.min(100, Math.round((-this.boat.position.z / LEN) * 100));
    ctx.hud.setStatus(`TRAVESSIA ${prog}%   ${this.hearts.display}`);
  }

  _warningTime(ctx) { return ctx.party.activeLeaderId === 5 ? 4.4 : 3.0; }

  update(ctx, dt) {
    const b = this.boat.position;
    this.stunned = Math.max(0, this.stunned - dt);
    const maxSpeed = this.stunned > 0 ? 6 : 19;
    this.speed = THREE.MathUtils.lerp(this.speed, maxSpeed, dt * 1.2);
    b.z -= this.speed * dt;
    const { dx } = ctx.input.axis();
    b.x = THREE.MathUtils.clamp(b.x + dx * 14 * dt, -HALF_W, HALF_W);
    this.boat.rotation.y = Math.PI + dx * -0.3;
    this.boat.rotation.z = Math.sin(performance.now() * 0.0015) * 0.06; // jogado pelas ondas
    this.captain.position.set(b.x, 1.3, b.z + 0.3);
    this.captain.rotation.y = Math.PI;
    ctx.party.updateFollowers(this.captain.position, this.captain.rotation.y);
    this.water.update(dt);

    // perigos
    for (const hz of this.hazards) {
      if (hz.userData.spin) hz.rotation.z += dt * 2;
      if (hz.userData.hit) continue;
      if (Math.abs(b.z - hz.position.z) < 2.4 && Math.abs(b.x - hz.position.x) < 3) {
        hz.userData.hit = true;
        this.stunned = 1.3;
        ctx.audio.sfx('clang');
        if (this.hearts.hit('O casco de lata GEMEU — entrou água!')) {
          return this.onLose(ctx, 'A Lata afundou devagar, digna até o fim.<br/>Ávio: — Barco de papel de prata. Eu AVISEI.');
        }
        this._hud(ctx);
      }
    }

    // ciclo do Leviatã: aviso → dorso cruza o rio numa faixa de z
    this.levTimer -= dt;
    if (this.levPhase === 'idle' && this.levTimer <= 0) {
      this.levPhase = 'warning';
      this.levTimer = this._warningTime(ctx);
      this.levZ = b.z - 14;
      ctx.hud.danger(true);
      ctx.hud.say('Ávio: — TEM COISA GRANDE EMBAIXO DA GENTE! Sai da frente dela!', { danger: true, time: this.levTimer * 1000 });
    } else if (this.levPhase === 'warning' && this.levTimer <= 0) {
      this.levPhase = 'crossing';
      this.levT = 0;
      this.leviathan.visible = true;
    } else if (this.levPhase === 'crossing') {
      this.levT += dt / 2.2;
      const t = Math.min(this.levT, 1);
      const x = THREE.MathUtils.lerp(-HALF_W - 12, HALF_W + 12, t);
      this.leviathan.position.set(x, Math.sin(t * Math.PI) * 1.2 - 0.8, this.levZ);
      this.leviathan.rotation.y = Math.PI / 2;
      if (Math.abs(b.z - this.levZ) < 4 && Math.abs(b.x - x) < 6) {
        if (!this.leviathan.userData.hit) {
          this.leviathan.userData.hit = true;
          ctx.audio.sfx('hurt');
          if (this.hearts.hit('O dorso do Leviatã ergueu A Lata pro céu!')) {
            return this.onLose(ctx, 'O Grande Rio guarda os seus monstros.<br/>E daquela vez, ficou com o barco.');
          }
          this._hud(ctx);
        }
      }
      if (t >= 1) {
        this.levPhase = 'idle';
        this.levTimer = 12 + Math.random() * 7;
        this.leviathan.visible = false;
        this.leviathan.userData.hit = false;
        ctx.hud.danger(false);
      }
    }

    this.hearts.update(dt, this.captain);
    this._hud(ctx);

    if (b.z <= -LEN) {
      return this.onWin(ctx,
        'A quilha de lata raspou na areia da outra margem.<br/>Atrás deles, o Grande Rio. Na frente, o resto do mundo.',
        this.hearts.n);
    }

    // câmera náutica
    ctx.camera.position.lerp(new THREE.Vector3(b.x * 0.5, 7, b.z + 13), Math.min(1, dt * 4));
    ctx.camera.lookAt(b.x * 0.8, 1, b.z - 8);
    this.sun.position.set(b.x - 30, 35, b.z + 20);
    this.sun.target.position.copy(b);
  }
}
