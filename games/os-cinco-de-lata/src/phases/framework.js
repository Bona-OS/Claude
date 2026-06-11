// Contrato das fases + utilitários compartilhados de gameplay.
// Toda fase estende GamePhase e implementa build(ctx) e update(ctx, dt).
// ctx é a instância de Game (main.js): scene, camera, input, hud, audio,
// party, save, e os gatilhos ctx.phaseWin(...) / ctx.phaseLose(...).

import * as THREE from 'three';
import { animateRun } from '../world/builders.js';

export class GamePhase {
  constructor(id, name, type, objective) {
    this.id = id;
    this.name = name;
    this.type = type; // 'track' | 'arcade' | 'world' | 'fight'
    this.objective = objective;
  }

  build(_ctx) { throw new Error('O método build(ctx) deve ser implementado.'); }
  update(_ctx, _dt) { throw new Error('O método update(ctx, dt) deve ser implementado.'); }

  // tema musical: por padrão segue o tipo do desafio
  get theme() { return this.type; }

  onWin(ctx, text, score) { ctx.phaseWin(text, score); }
  onLose(ctx, text) { ctx.phaseLose(text); }
}

// ------------------------------------------------------- controlador andante
// Movimento WASD + pulo + animação, com stats do líder do grupo.
export class Walker {
  constructor(ctx, mesh, {
    speed = 13, sprintMult = 1.6, jump = 9, gravity = 28,
    groundY = 0, clamp = null, // clamp: (pos) => void
  } = {}) {
    this.ctx = ctx;
    this.mesh = mesh;
    this.opts = { speed, sprintMult, jump, gravity, groundY };
    this.clamp = clamp;
    this.velY = 0;
    this.onGround = true;
    this.facing = Math.PI;
    this.frozen = false;
  }

  update(dt) {
    const { input, party } = this.ctx;
    const leader = party.leader;
    const o = this.opts;
    if (this.frozen) { animateRun(this.mesh, false); return { moving: false }; }

    const sprint = input.down('ShiftLeft', 'ShiftRight') ? o.sprintMult : 1;
    const speed = o.speed * sprint * leader.speedMult;
    const { dx, dz, moving } = input.axis();
    if (moving) {
      this.mesh.position.x += dx * speed * dt;
      this.mesh.position.z += dz * speed * dt;
      this.facing = Math.atan2(dx, dz);
    }
    let dr = this.facing - this.mesh.rotation.y;
    while (dr > Math.PI) dr -= Math.PI * 2;
    while (dr < -Math.PI) dr += Math.PI * 2;
    this.mesh.rotation.y += dr * Math.min(1, dt * 12);

    if (input.justPressed('Space') && this.onGround) {
      this.velY = o.jump * leader.jumpMult;
      this.onGround = false;
      this.ctx.audio.sfx('jump');
    }
    this.velY -= o.gravity * dt;
    this.mesh.position.y += this.velY * dt;
    if (this.mesh.position.y <= o.groundY) {
      this.mesh.position.y = o.groundY;
      this.velY = 0;
      this.onGround = true;
    }
    if (this.clamp) this.clamp(this.mesh.position);

    animateRun(this.mesh, moving && this.onGround, sprint);
    return { moving, sprint };
  }
}

// ------------------------------------------------------- câmera de seguir
export class FollowCam {
  constructor(camera, { height = 5.2, back = 10.5, lookAhead = -6, stiffness = 4 } = {}) {
    this.camera = camera;
    this.o = { height, back, lookAhead, stiffness };
    this._target = new THREE.Vector3();
  }

  update(targetPos, dt, sun = null) {
    const o = this.o;
    this._target.set(targetPos.x * 0.6, targetPos.y + o.height, targetPos.z + o.back);
    this.camera.position.lerp(this._target, Math.min(1, dt * o.stiffness));
    this.camera.lookAt(targetPos.x * 0.8, targetPos.y + 1.6, targetPos.z + o.lookAhead);
    if (sun) {
      sun.position.set(targetPos.x - 30, 35, targetPos.z + 20);
      sun.target.position.copy(targetPos);
    }
  }

  snap(targetPos) {
    this.camera.position.set(targetPos.x * 0.6, targetPos.y + this.o.height, targetPos.z + this.o.back);
  }
}

// ------------------------------------------------------- utilidades
export function dist2d(a, b) { return Math.hypot(a.x - b.x, a.z - b.z); }

// troca de líder padrão (teclas 1-5) + atualização da fila.
// Recebe o walker (não o mesh) para poder reapontar walker.mesh ao novo líder.
export function handleParty(ctx, walker) {
  for (let i = 1; i <= 5; i++) {
    if (ctx.input.justPressed(`Digit${i}`, `Numpad${i}`)) {
      const member = ctx.party.switchLeader(i);
      if (member) {
        walker.mesh = ctx.party.leaderMesh;
        ctx.hud.party(ctx.partyList(), i);
        ctx.hud.say(`${member.name} assume a frente! ${member.ability}`, { time: 2500 });
        ctx.audio.sfx('pickup');
      }
    }
  }
  ctx.party.updateFollowers(walker.mesh.position, walker.mesh.rotation.y);
}

// vidas padrão de fase, com invulnerabilidade e flash
export class Hearts {
  constructor(ctx, max = 3) {
    this.ctx = ctx;
    this.max = max;
    this.n = max;
    this.invuln = 0;
  }

  hit(why, { sfx = 'hurt' } = {}) {
    if (this.invuln > 0 || this.n <= 0) return false;
    this.n--;
    this.invuln = 2;
    this.ctx.audio.sfx(sfx);
    this.ctx.hud.say(why, { danger: true });
    return this.n <= 0; // true = morreu
  }

  update(dt, mesh) {
    this.invuln = Math.max(0, this.invuln - dt);
    if (mesh) mesh.visible = this.invuln > 0 ? Math.floor(performance.now() / 100) % 2 === 0 : true;
  }

  get display() { return '❤'.repeat(this.n) + '♡'.repeat(this.max - this.n); }
}
