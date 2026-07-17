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
const COYOTE_TIME = 0.1;  // segundos após sair do chão em que ainda dá pra pular
const JUMP_BUFFER = 0.12; // segundos que um pulo pedido antes de aterrissar fica "guardado"

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
    this.coyote = 0;       // tempo restante de coyote-time
    this.jumpBuffer = 0;   // tempo restante de jump buffer
    this.cutJump = false;  // já cortou a subida deste pulo (pulo variável)?
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

    // coyote-time: no chão, o crédito de pulo fica sempre cheio; ao sair,
    // decai — permitindo pular um pouco depois de deixar a borda
    this.coyote = this.onGround ? COYOTE_TIME : Math.max(0, this.coyote - dt);
    // jump buffer: guarda um pedido de pulo feito pouco antes de aterrissar
    if (input.justPressed('Space')) this.jumpBuffer = JUMP_BUFFER;
    else this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);

    if (this.jumpBuffer > 0 && this.coyote > 0) {
      this.velY = o.jump * leader.jumpMult;
      this.onGround = false;
      this.coyote = 0;
      this.jumpBuffer = 0;
      this.cutJump = false;
      this.ctx.audio.sfx('jump');
    }

    // pulo variável: soltar Espaço durante a subida encurta o pulo (uma vez)
    if (!this.onGround && this.velY > 0 && !this.cutJump && !input.down('Space')) {
      this.velY *= 0.5;
      this.cutJump = true;
    }

    this.velY -= o.gravity * dt;
    this.mesh.position.y += this.velY * dt;
    if (this.mesh.position.y <= o.groundY) {
      this.mesh.position.y = o.groundY;
      this.velY = 0;
      this.onGround = true;
      this.cutJump = false;
    }
    if (this.clamp) this.clamp(this.mesh.position);

    animateRun(this.mesh, moving && this.onGround, sprint);
    return { moving, sprint };
  }
}

// ------------------------------------------------------- câmera de seguir
export class FollowCam {
  // `lookAhead` (existente) é o offset fixo de mira em Z. `velocityLookAhead`
  // (novo, default 0 = comportamento idêntico ao antigo) é quanto a câmera
  // antecipa na direção do movimento do alvo, derivado da velocidade e
  // amortecido — nome diferente pra não colidir com o parâmetro já existente.
  constructor(camera, { height = 5.2, back = 10.5, lookAhead = -6, stiffness = 4, velocityLookAhead = 0 } = {}) {
    this.camera = camera;
    this.o = { height, back, lookAhead, stiffness, velocityLookAhead };
    this._target = new THREE.Vector3();
    this._prevPos = null;
    this._anticip = new THREE.Vector3(); // deslocamento de antecipação (amortecido)
  }

  update(targetPos, dt, sun = null) {
    const o = this.o;
    if (o.velocityLookAhead > 0) {
      if (!this._prevPos) this._prevPos = targetPos.clone();
      const vx = (targetPos.x - this._prevPos.x) / Math.max(dt, 1e-4);
      const vz = (targetPos.z - this._prevPos.z) / Math.max(dt, 1e-4);
      const wantX = vx * o.velocityLookAhead;
      const wantZ = vz * o.velocityLookAhead;
      const k = Math.min(1, dt * 3);
      this._anticip.x += (wantX - this._anticip.x) * k;
      this._anticip.z += (wantZ - this._anticip.z) * k;
      this._prevPos.copy(targetPos);
    }
    const aheadX = targetPos.x + this._anticip.x;
    const aheadZ = targetPos.z + this._anticip.z;

    this._target.set(aheadX * 0.6, targetPos.y + o.height, aheadZ + o.back);
    this.camera.position.lerp(this._target, Math.min(1, dt * o.stiffness));
    this.camera.lookAt(aheadX * 0.8, targetPos.y + 1.6, aheadZ + o.lookAhead);
    if (sun) {
      sun.position.set(targetPos.x - 30, 35, targetPos.z + 20);
      sun.target.position.copy(targetPos);
    }
  }

  snap(targetPos) {
    this.camera.position.set(targetPos.x * 0.6, targetPos.y + this.o.height, targetPos.z + this.o.back);
    this._prevPos = targetPos.clone();
    this._anticip.set(0, 0, 0);
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
