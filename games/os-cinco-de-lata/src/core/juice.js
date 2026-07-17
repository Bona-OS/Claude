// "Juice": camada de feedback visual compartilhada — screen-shake (trauma),
// hit-stop (congelamento de frames), flash de tela e partículas de impacto.
// Instanciada uma vez em main.js (ctx.juice) e atualizada todo frame.
//
// API de hit-stop (congelamento do mundo por N frames):
//   juice.hitStop(seg)       — acumula um pedido de pausa de `seg` segundos.
//   juice.consumeHitStop(dt) — chamar UMA vez por frame, ANTES de atualizar a
//                              fase atual. Desconta dt do acumulador e retorna
//                              true se a fase deve ser PULADA neste frame
//                              (mundo congelado). Se retornar false, a fase
//                              atualiza normalmente.
//   juice.frozen             — getter só-leitura: true se ainda há hit-stop
//                              pendente (não desconta nada, é só consulta).
//   juice.update(dt)         — roda SEMPRE, mesmo durante o hit-stop, pois
//                              shake/flash/partículas não devem congelar.
//
// Uso típico no loop:
//   const paused = ctx.juice.consumeHitStop(dt);
//   if (!paused) currentPhase.update(ctx, dt);
//   ctx.juice.update(dt);
//   camera.position.x += ctx.juice.getShakeOffset().x; // etc, antes do render

import * as THREE from 'three';

const SHAKE_MAX = 0.55; // deslocamento máximo de câmera (unidades de mundo)
const PARTICLE_GEO = new THREE.BoxGeometry(1, 1, 1); // geometria unitária compartilhada

// pseudo-ruído suave (soma de senos) — evita jitter puro de Math.random
function noise1(t, seed) {
  return Math.sin(t * 13.7 + seed) * 0.5
    + Math.sin(t * 7.3 + seed * 2.1) * 0.3
    + Math.sin(t * 23.1 + seed * 0.7) * 0.2;
}

export class Juice {
  constructor() {
    this._trauma = 0;
    this._shakeDuration = 0.25;
    this._shakeT = 0;
    this._shakeOffset = { x: 0, y: 0 };

    this._stop = 0; // segundos de hit-stop pendentes

    this._flash = null; // { alpha, duration, t }
    this._flashEl = null;

    this._particles = [];
  }

  // --------------------------------------------------------- screen-shake
  // modelo de "trauma": trauma decai linearmente até 0; o deslocamento visto
  // usa trauma² para que o shake acabe suave (não corta seco no fim).
  shake(intensity = 0.4, duration = 0.25) {
    this._trauma = Math.min(1, this._trauma + intensity);
    this._shakeDuration = duration;
  }

  getShakeOffset() { return this._shakeOffset; }

  // ------------------------------------------------------------ hit-stop
  hitStop(seconds = 0.06) {
    this._stop = Math.max(this._stop, seconds);
  }

  get frozen() { return this._stop > 0; }

  // chamar antes do update da fase; retorna true se a fase deve congelar
  consumeHitStop(dt) {
    if (this._stop <= 0) return false;
    this._stop = Math.max(0, this._stop - dt);
    return true;
  }

  // ---------------------------------------------------------------- flash
  _ensureFlashEl() {
    if (this._flashEl) return this._flashEl;
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;opacity:0;';
    document.body.appendChild(el);
    this._flashEl = el;
    return el;
  }

  flash(color = '#ffffff', alpha = 0.5, duration = 0.15) {
    const el = this._ensureFlashEl();
    el.style.background = color;
    this._flash = { alpha, duration, t: 0 };
    el.style.opacity = String(alpha);
  }

  // -------------------------------------------------------------- burst
  // partículas simples (cubos minúsculos) que explodem a partir de `position`
  // e se removem sozinhas ao fim da vida.
  burst(scene, position, { count = 12, color = 0xf0b46a, speed = 6, size = 0.25, life = 0.5, gravity = -9 } = {}) {
    for (let i = 0; i < count; i++) {
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
      const mesh = new THREE.Mesh(PARTICLE_GEO, mat);
      mesh.scale.setScalar(size);
      mesh.position.copy(position);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const v = speed * (0.5 + Math.random() * 0.5);
      const vel = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * v,
        Math.abs(Math.cos(phi)) * v, // tende pra cima, fica com jeito de explosão
        Math.sin(phi) * Math.sin(theta) * v,
      );
      scene.add(mesh);
      this._particles.push({ mesh, mat, vel, gravity, life, age: 0 });
    }
  }

  // ---------------------------------------------------------------- loop
  update(dt) {
    // trauma decai linearmente; deslocamento = trauma² * máximo, com ruído
    if (this._trauma > 0) {
      const rate = this._shakeDuration > 0 ? 1 / this._shakeDuration : 4;
      this._trauma = Math.max(0, this._trauma - rate * dt);
    }
    this._shakeT += dt;
    if (this._trauma > 0) {
      const amt = this._trauma * this._trauma * SHAKE_MAX;
      this._shakeOffset.x = amt * noise1(this._shakeT, 1.7);
      this._shakeOffset.y = amt * noise1(this._shakeT, 9.3);
    } else {
      this._shakeOffset.x = 0;
      this._shakeOffset.y = 0;
    }

    // flash de tela
    if (this._flash) {
      this._flash.t += dt;
      const k = Math.max(0, 1 - this._flash.t / this._flash.duration);
      if (this._flashEl) this._flashEl.style.opacity = String(this._flash.alpha * k);
      if (this._flash.t >= this._flash.duration) {
        this._flash = null;
        if (this._flashEl) this._flashEl.style.opacity = '0';
      }
    }

    // partículas de impacto
    if (this._particles.length) {
      this._particles = this._particles.filter((p) => {
        p.age += dt;
        if (p.age >= p.life) {
          if (p.mesh.parent) p.mesh.parent.remove(p.mesh);
          p.mat.dispose();
          return false;
        }
        p.vel.y += p.gravity * dt;
        p.mesh.position.addScaledVector(p.vel, dt);
        p.mat.opacity = 1 - p.age / p.life;
        return true;
      });
    }
  }
}
