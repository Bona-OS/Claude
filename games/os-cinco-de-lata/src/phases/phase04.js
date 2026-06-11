// Fase 4 — O Resgate de Trovão (world) · Capítulo 3
// A lagartixa está presa sob uma raiz. Garra ergue as pedras (E),
// Tino arma a alavanca (E), e o grupo escolta Trovão até a clareira.

import * as THREE from 'three';
import { GamePhase, Walker, FollowCam, handleParty, dist2d } from './framework.js';
import {
  sunsetLights, makeGrassField, makeGround, makeGecko, animateGecko,
  makeRock, colorMat, makeGoal,
} from '../world/builders.js';

export class Phase04 extends GamePhase {
  constructor() {
    super(4, 'O Resgate de Trovão', 'world',
      'Garra (4+E) remove as pedras, Tino (3+E) solta a raiz — e levem a lagartixa à clareira.');
  }

  build(ctx) {
    const scene = ctx.scene;
    this.sun = sunsetLights(scene, { fogNear: 30, fogFar: 120 });
    makeGround(scene, { y: 0, z: -40, color: 0x2e5419 });
    this.grass = makeGrassField(scene, { count: 260, innerGap: 26, spread: 34, zMin: -110, zMax: 30, baseY: 0 });

    // Trovão preso sob a raiz
    this.gecko = makeGecko();
    this.gecko.position.set(0, 0, -38);
    this.gecko.rotation.y = 0.7;
    scene.add(this.gecko);

    this.root = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 14, 7), colorMat(0x4a2f1b, { roughness: 1 }));
    this.root.rotation.z = Math.PI / 2 - 0.15;
    this.root.position.set(0, 1.4, -39.5);
    this.root.castShadow = true;
    scene.add(this.root);

    // 3 pedras sobre a raiz — só Garra remove
    this.rocks = [];
    for (const x of [-3, 0.5, 3.5]) {
      const rock = makeRock({ r: 1.6 });
      rock.position.set(x, 1.2, -40.5);
      scene.add(rock);
      this.rocks.push(rock);
    }
    // a alavanca de raiz — só Tino arma
    this.lever = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.2, 0.4), colorMat(0x6e2c16));
    this.lever.position.set(6.5, 1.6, -38);
    this.lever.rotation.z = -0.5;
    scene.add(this.lever);

    // clareira de chegada
    this.goal = makeGoal(scene, { z: -100, bannerColor: 0x6fa03a });

    const leaderMesh = ctx.party.spawn(scene, new THREE.Vector3(0, 0, 8));
    this.walker = new Walker(ctx, leaderMesh, {
      speed: 11,
      clamp: (p) => {
        p.x = THREE.MathUtils.clamp(p.x, -22, 22);
        p.z = THREE.MathUtils.clamp(p.z, -104, 14);
      },
    });
    this.cam = new FollowCam(ctx.camera, { height: 7, back: 12 });
    this.cam.snap(leaderMesh.position);

    this.stage = 'rocks'; // rocks → lever → escort → win
    this.rocksLeft = 3;
    this.geckoFree = false;
    this._hud(ctx);
    ctx.hud.say('Brio: — Tá ferida! A pata presa embaixo da raiz... a gente TEM que ajudar.', { time: 5000 });
  }

  _hud(ctx) {
    const txt = {
      rocks: `Garra: tire as pedras (${this.rocksLeft} restam)`,
      lever: 'Tino: arme a alavanca na raiz',
      escort: 'Levem Trovão até a clareira ao sul!',
    }[this.stage];
    ctx.hud.setStatus(txt || '');
  }

  update(ctx, dt) {
    this.walker.update(dt);
    handleParty(ctx, this.walker);
    const p = this.walker.mesh.position;

    if (ctx.input.justPressed('KeyE')) {
      const leaderId = ctx.party.activeLeaderId;
      if (this.stage === 'rocks') {
        const near = this.rocks.find((r) => r.parent && dist2d(p, r.position) < 3);
        if (near) {
          if (leaderId === 4) {
            ctx.scene.remove(near);
            this.rocksLeft--;
            ctx.audio.sfx('clang');
            ctx.hud.say(near && this.rocksLeft > 0
              ? `Garra ergueu a pedra sozinho. (${this.rocksLeft} restam)`
              : 'Garra: — Inteiro. — E jogou a última pedra longe.');
            if (this.rocksLeft <= 0) this.stage = 'lever';
            this._hud(ctx);
          } else {
            ctx.hud.say('Pesada demais... Só o Garra (tecla 4) levanta isso.', { danger: true });
          }
        }
      } else if (this.stage === 'lever') {
        if (dist2d(p, this.lever.position) < 3.5) {
          if (leaderId === 3) {
            this.lever.rotation.z = 0.6;
            this.root.position.y = 4.2;
            this.root.rotation.z = Math.PI / 2 - 0.45;
            this.geckoFree = true;
            this.stage = 'escort';
            ctx.audio.sfx('pickup');
            ctx.hud.say('Tino calculou o ponto de apoio. A raiz subiu — e Trovão se arrastou pra fora!', { time: 4500 });
            this._hud(ctx);
          } else {
            ctx.hud.say('Tem um jeito certo de armar isso... É com o Tino (tecla 3).', { danger: true });
          }
        }
      }
    }

    // Trovão segue o grupo depois de livre
    if (this.geckoFree) {
      const d = dist2d(this.gecko.position, p);
      if (d > 5) {
        const dir = new THREE.Vector3(p.x - this.gecko.position.x, 0, p.z - this.gecko.position.z).normalize();
        this.gecko.position.addScaledVector(dir, 9 * dt);
        this.gecko.rotation.y = Math.atan2(dir.x, dir.z);
        animateGecko(this.gecko, true);
      } else {
        animateGecko(this.gecko, false);
      }
      // chegada: o grupo E Trovão na clareira
      if (p.z <= -96 && dist2d(this.gecko.position, p) < 9) {
        return this.onWin(ctx,
          '— Trovão — decidiu Brio. — Porque quando ela corre vai fazer barulho de trovão.<br/>Ela não fazia barulho nenhum. O nome pegou.',
          1);
      }
    }

    this.grass.update();
    this.cam.update(p, dt, this.sun);
  }
}
