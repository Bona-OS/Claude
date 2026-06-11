// Fase 1 — A Barra de Ferro (track) · Capítulo 1
// Coletar as 5 lascas de prata e chegar ao fim da barra, escondendo-se
// da Sombra nos buracos de rebite.

import * as THREE from 'three';
import { GamePhase, Walker, FollowCam, Hearts, handleParty, dist2d } from './framework.js';
import {
  sunsetLights, makeBeam, makeGrassField, makeGround, makeBackdrop,
  mirmeciaSilhouette, makeGoal, makeShard, makeBird, flapWings,
} from '../world/builders.js';

const LEN = 220, WIDTH = 10, SHARDS = 5;
const MIRMECIA_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_3Cs6n4P9VtDQBLcqUPlxk1nSd2p/hf_20260611_160422_93ca2d36-5579-4050-ab03-bfa2ff50ab2b.png';

export class Phase01 extends GamePhase {
  constructor() {
    super(1, 'A Barra de Ferro', 'track',
      'Colete as 5 lascas de prata ✦ e chegue ao fim da barra. SOMBRA no céu? Buraco!');
  }

  build(ctx) {
    const scene = ctx.scene;
    this.sun = sunsetLights(scene);
    const beamInfo = makeBeam(scene, { length: LEN, width: WIDTH });
    this.holes = beamInfo.holes;
    this.holeRadius = beamInfo.holeRadius;
    this.grass = makeGrassField(scene, { zMin: -LEN - 40, zMax: 20 });
    makeGround(scene, { z: -LEN / 2 });
    makeBackdrop(scene, { texture: mirmeciaSilhouette(), url: MIRMECIA_URL, position: [0, 18, -LEN - 35] });
    this.goalZ = -LEN + 14;
    makeGoal(scene, { z: this.goalZ });

    // grupo
    const leaderMesh = ctx.party.spawn(scene, new THREE.Vector3(0, 0, 4));
    this.walker = new Walker(ctx, leaderMesh, {
      clamp: (p) => {
        p.x = THREE.MathUtils.clamp(p.x, -WIDTH / 2 + 0.5, WIDTH / 2 - 0.5);
        p.z = THREE.MathUtils.clamp(p.z, -LEN + 6, 8);
      },
    });
    this.cam = new FollowCam(ctx.camera);
    this.cam.snap(leaderMesh.position);

    // lascas
    this.shards = [];
    for (let i = 0; i < SHARDS; i++) {
      const s = makeShard();
      s.position.set((Math.random() - 0.5) * (WIDTH - 3), 1.1, -25 - i * ((LEN - 60) / (SHARDS - 1)));
      scene.add(s);
      this.shards.push(s);
    }
    this.collected = 0;

    // a Sombra
    this.bird = makeBird();
    this.bird.visible = false;
    scene.add(this.bird);
    this.birdShadow = new THREE.Mesh(
      new THREE.CircleGeometry(4, 20),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 })
    );
    this.birdShadow.rotation.x = -Math.PI / 2;
    this.birdShadow.position.y = 0.03;
    scene.add(this.birdShadow);
    this.birdPhase = 'idle';
    this.birdTimer = 11;
    this.strikeT = 0;
    this.strikeZ = 0;
    this.strikeChecked = false;

    this.hearts = new Hearts(ctx);
    ctx.hud.say('Tarso: — Um dia a gente vai ter uma cidade. Muralha. Portão. “Bem-vindos pra casa”.', { time: 6000 });
    this._hud(ctx);
  }

  _hud(ctx) {
    ctx.hud.setStatus(`✦ ${this.collected}/${SHARDS}   ${this.hearts.display}`);
  }

  _inHole(pos) {
    return this.holes.some((h) => Math.hypot(pos.x - h.x, pos.z - h.y) < this.holeRadius * 0.92);
  }

  _warningTime(ctx) {
    // Ávio na liderança = vigia: o aviso chega antes
    return ctx.party.activeLeaderId === 5 ? 4.7 : 3.2;
  }

  _updateBird(ctx, dt) {
    const player = this.walker.mesh.position;
    this.birdTimer -= dt;

    if (this.birdPhase === 'idle' && this.birdTimer <= 0) {
      this.birdPhase = 'warning';
      this.birdTimer = this._warningTime(ctx);
      this._warnDur = this.birdTimer;
      ctx.hud.say('Ávio: — SOMBRA NO CÉU! Entra num buraco, AGORA!', { danger: true, time: this.birdTimer * 1000 });
      ctx.hud.danger(true);
      this.strikeZ = player.z;
    } else if (this.birdPhase === 'warning') {
      this.birdShadow.position.set(player.x, 0.03, this.strikeZ);
      this.birdShadow.material.opacity = Math.min(0.55, 0.55 * (1 - this.birdTimer / this._warnDur));
      if (this.birdTimer <= 0) {
        this.birdPhase = 'striking';
        this.strikeT = 0;
        this.strikeChecked = false;
        this.bird.visible = true;
        this.strikeZ = player.z;
      }
    } else if (this.birdPhase === 'striking') {
      this.strikeT += dt / 1.4;
      const t = Math.min(this.strikeT, 1);
      const x = THREE.MathUtils.lerp(-45, 45, t);
      const y = 1.2 + 38 * Math.pow(2 * t - 1, 2);
      this.bird.position.set(x, y, this.strikeZ);
      this.bird.lookAt(x + 1, y - (t < 0.5 ? 1 : -1) * 0.8, this.strikeZ);
      flapWings(this.bird);
      this.birdShadow.position.set(x * 0.5, 0.03, this.strikeZ);
      this.birdShadow.material.opacity = 0.55;

      if (!this.strikeChecked && t >= 0.5) {
        this.strikeChecked = true;
        const blocking = ctx.party.activeLeaderId === 4 && ctx.input.down('KeyE');
        const exposed = Math.abs(player.z - this.strikeZ) < 7 && !this._inHole(player) && !blocking;
        if (exposed) {
          ctx.audio.sfx('clang');
          if (this.hearts.hit('O bico da Sombra bateu com um CLANG que sacudiu os ossos!')) {
            return this.onLose(ctx, 'Tudo naquele céu queria comê-los — porque órfão aprende cedo.<br/>“— Eu avisei.” — suspirou Ávio.');
          }
          this._hud(ctx);
        } else if (blocking) {
          ctx.audio.sfx('block');
          ctx.hud.say('Garra segurou o escudo de lata. O bico ricocheteou!');
        } else if (this._inHole(player)) {
          ctx.hud.say('Brio começou a rir — sempre ria depois do perigo.');
        }
      }
      if (t >= 1) {
        this.birdPhase = 'idle';
        this.birdTimer = 11 + Math.random() * 6;
        this.bird.visible = false;
        this.birdShadow.material.opacity = 0;
        ctx.hud.danger(false);
      }
    }
  }

  update(ctx, dt) {
    this.walker.update(dt);
    handleParty(ctx, this.walker);
    const player = this.walker.mesh.position;

    // lascas
    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      s.rotation.y += dt * 2;
      s.position.y = 1.1 + Math.sin(performance.now() * 0.003 + i) * 0.18;
      if (s.position.distanceTo(player) < 1.6) {
        ctx.scene.remove(s);
        this.shards.splice(i, 1);
        this.collected++;
        ctx.audio.sfx('pickup');
        this._hud(ctx);
        ctx.hud.say(this.collected === SHARDS
          ? 'Tino: — É isso! Agora corre pro fim da barra!'
          : `Um pedaço de lua derretida... (${this.collected}/${SHARDS})`);
      }
    }

    this._updateBird(ctx, dt);
    if (this.hearts.n <= 0) return;
    this.hearts.update(dt, this.walker.mesh);

    // chegada
    if (player.z <= this.goalZ + 3) {
      if (this.collected >= SHARDS) {
        return this.onWin(ctx,
          'Cinco pontinhos de prata no fim de uma barra de ferro.<br/>“— Achei nossa casa.” — disse Tarso.',
          this.hearts.n);
      }
      ctx.hud.say(`Ávio: — Volta! Faltam ${SHARDS - this.collected} lascas!`, { danger: true });
      player.z = this.goalZ + 4;
    }

    this.grass.update();
    this.cam.update(player, dt, this.sun);
  }
}
