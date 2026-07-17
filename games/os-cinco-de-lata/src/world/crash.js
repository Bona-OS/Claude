// Sistemas de "quebra-quebra" reutilizáveis por qualquer fase a pé: caixas
// quebráveis (Crate), stomp em inimigos (stompCheck), giro de ataque do
// líder (SpinAttack), bandeira de checkpoint (Checkpoint) e coletáveis
// flutuantes estilo Wumpa (Collectibles). Tudo consome ctx.juice para o
// feedback (shake/hitStop/flash/burst) — ver core/juice.js.

import * as THREE from 'three';
import { colorMat, MAT } from './builders.js';
import { dist2d } from '../phases/framework.js';

// ---------------------------------------------------------------- caixas
const CRATE_RADIUS = 0.9;

export class Crate {
  // type: 'normal' (quebra com qualquer golpe + solta coletável), 'bounce'
  // (nunca quebra, empurra o jogador pra cima), 'iron' (só quebra com giro).
  constructor(scene, position, { type = 'normal', collectibles = null } = {}) {
    this.type = type;
    this.position = position.clone();
    this.radius = CRATE_RADIUS;
    this.broken = false;
    this.collectibles = collectibles;
    this.mesh = this._buildMesh();
    this.mesh.position.copy(this.position);
    scene.add(this.mesh);
  }

  _buildMesh() {
    const g = new THREE.Group();
    const bodyMat = this.type === 'iron' ? MAT.iron
      : this.type === 'bounce' ? colorMat(0xd9a441, { metalness: 0.2, roughness: 0.55 })
      : colorMat(0x8a5a2f, { roughness: 0.88 });
    const box = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), bodyMat);
    box.castShadow = true; box.receiveShadow = true;
    g.add(box);

    if (this.type !== 'iron') {
      // ripas cruzadas — leem como caixote de madeira/lata
      const stripMat = colorMat(0x5e3d1f, { roughness: 0.9 });
      for (const rot of [0.52, -0.52]) {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.16, 0.16), stripMat);
        strip.rotation.z = rot;
        g.add(strip);
      }
    }
    if (this.type === 'bounce') {
      // seta pra cima: marca visual de "empurra"
      const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.7, 4),
        colorMat(0xfff2c2, { emissive: 0xffdd88, emissiveIntensity: 0.65 }));
      arrow.position.y = 0.95;
      arrow.rotation.y = Math.PI / 4;
      g.add(arrow);
    }
    if (this.type === 'iron') {
      // rebites nos cantos — metálica, óbvia de "resistente"
      const rivetMat = colorMat(0x2b2b30, { metalness: 0.8, roughness: 0.3 });
      for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 5), rivetMat);
        rivet.position.set(sx * 0.68, sy * 0.68, 0.76);
        g.add(rivet);
      }
    }
    return g;
  }

  // kind: 'stomp' | 'spin' | 'bump'. Retorna 'broke', 'bounced' ou null
  // (nada aconteceu — ex.: ferro atingido sem giro).
  hitBy(ctx, kind) {
    if (this.broken) return null;
    if (this.type === 'bounce') return 'bounced';
    if (this.type === 'iron' && kind !== 'spin') return null;
    this.break(ctx);
    return 'broke';
  }

  // idempotente: chamar duas vezes não duplica efeito.
  break(ctx) {
    if (this.broken) return;
    this.broken = true;
    const scene = this.mesh.parent;
    if (scene) scene.remove(this.mesh);
    if (ctx?.juice) {
      ctx.juice.burst(scene ?? ctx.scene, this.position, {
        count: 14, color: this.type === 'iron' ? 0x9099a8 : 0xa9713a, speed: 5.5, size: 0.22,
      });
      ctx.juice.shake(0.25, 0.15);
    }
    ctx?.audio?.sfx('clang');
    if (this.type === 'normal' && this.collectibles) {
      const spawnPos = this.position.clone();
      spawnPos.y += 1.6;
      this.collectibles.spawn(scene ?? ctx.scene, spawnPos);
    }
  }
}

// ------------------------------------------------------------- stomp em pé
// Chamar todo frame: se o jogador está caindo e passa perto do topo de um
// inimigo vivo, mata-o (marca .userData.dead) e dá um quique no jogador.
// `enemies` é uma lista de Object3D com `.position` (e opcionalmente
// `.userData.stompHeight`, default 1.6). Retorna quantos stomps ocorreram.
export function stompCheck(ctx, walker, enemies, { onStomp, radius = 1.2, bounce = 11 } = {}) {
  if (walker.velY >= 0) return 0;
  const p = walker.mesh.position;
  let hits = 0;
  for (const enemy of enemies) {
    if (!enemy || enemy.userData?.dead) continue;
    if (dist2d(p, enemy.position) > radius) continue;
    const topY = enemy.position.y + (enemy.userData?.stompHeight ?? 1.6);
    if (p.y < topY - 0.9 || p.y > topY + 0.9) continue; // só conta perto do topo
    enemy.userData.dead = true;
    walker.velY = bounce;
    walker.onGround = false;
    ctx.juice.burst(ctx.scene, enemy.position.clone().setY(topY * 0.6), { count: 10, color: 0x3a2410, speed: 5, size: 0.2 });
    ctx.juice.hitStop(0.05);
    ctx.audio.sfx('pickup');
    onStomp?.(enemy);
    hits++;
  }
  return hits;
}

// ------------------------------------------------------------- giro de ataque
// Giro curto do líder: quebra Crates (inclusive de ferro) e empurra
// inimigos ao redor. A fase escolhe a tecla — chamar .trigger() no
// justPressed e .update(dt, origin, {crates, enemies}) todo frame.
const SPIN_DURATION = 0.4;
const SPIN_COOLDOWN = 0.6;

export class SpinAttack {
  constructor(ctx) {
    this.ctx = ctx;
    this.t = 0;            // tempo restante da janela ativa
    this.cooldown = 0;
    this.spinning = false; // true durante toda a animação do giro
    this.active = false;   // true só durante a janela que causa dano/quebra
    this._hitOnce = new Set();
    // anel visual — escala/gira/some conforme o giro avança
    this.ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.3, 0.14, 6, 16),
      new THREE.MeshBasicMaterial({ color: 0xf0d9a0, transparent: true, opacity: 0 })
    );
    this.ring.rotation.x = Math.PI / 2;
    ctx.scene.add(this.ring);
  }

  trigger() {
    if (this.cooldown > 0) return false;
    this.t = SPIN_DURATION;
    this.cooldown = SPIN_COOLDOWN + SPIN_DURATION;
    this._hitOnce.clear();
    this.ctx.audio.sfx('clang');
    this.ctx.juice.shake(0.2, 0.15);
    return true;
  }

  update(dt, origin, { crates = [], enemies = [], radius = 2.5 } = {}) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    if (this.t <= 0) {
      this.spinning = false;
      this.active = false;
      this.ring.material.opacity = 0;
      return;
    }
    this.t = Math.max(0, this.t - dt);
    this.spinning = true;
    this.active = this.t > 0;

    this.ring.position.set(origin.x, origin.y + 0.3, origin.z);
    this.ring.rotation.z += dt * 26;
    this.ring.material.opacity = 0.55 * (this.t / SPIN_DURATION);

    if (!this.active) return;
    for (const crate of crates) {
      if (crate.broken || this._hitOnce.has(crate)) continue;
      if (dist2d(origin, crate.position) <= radius) {
        if (crate.hitBy(this.ctx, 'spin')) this._hitOnce.add(crate);
      }
    }
    for (const enemy of enemies) {
      if (!enemy || enemy.userData?.dead || this._hitOnce.has(enemy)) continue;
      if (dist2d(origin, enemy.position) <= radius) {
        this._hitOnce.add(enemy);
        const dir = new THREE.Vector3(enemy.position.x - origin.x, 0, enemy.position.z - origin.z);
        if (dir.lengthSq() < 1e-4) dir.set(1, 0, 0); else dir.normalize();
        enemy.position.addScaledVector(dir, 3.2);
        this.ctx.juice.burst(this.ctx.scene, enemy.position, { count: 8, color: 0xf0b46a, speed: 4, size: 0.18 });
      }
    }
  }
}

// -------------------------------------------------------------- checkpoint
// Bandeira de passagem: `.check(ctx, playerPos)` ativa (uma vez) quando o
// jogador chega perto, virando dourada e guardando `.pos` como referência
// de respawn para quem quiser usá-la.
const CHECKPOINT_RADIUS = 2.5;

export class Checkpoint {
  constructor(scene, position) {
    this.pos = position.clone();
    this.active = false;
    this.mesh = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 4.4, 6), MAT.iron);
    pole.position.y = 2.2;
    pole.castShadow = true;
    this.mesh.add(pole);
    this.flagMat = colorMat(0xaeb0bb, { roughness: 0.6 });
    this.flag = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.8), this.flagMat);
    this.flag.position.set(0.68, 3.7, 0);
    this.mesh.add(this.flag);
    this.mesh.position.copy(this.pos);
    scene.add(this.mesh);
  }

  check(ctx, playerPos) {
    if (this.active) return false;
    if (dist2d(playerPos, this.pos) > CHECKPOINT_RADIUS) return false;
    this.active = true;
    this.flagMat.color.set(0xf0b46a);
    this.flagMat.emissive.set(0xf0b46a);
    this.flagMat.emissiveIntensity = 0.5;
    ctx.juice?.flash('#f0d9a0', 0.18, 0.25);
    ctx.audio?.sfx('pickup');
    return true;
  }
}

// -------------------------------------------------------------- coletáveis
// Contador compartilhado de coletáveis flutuantes (estilo Wumpa). Se `goal`
// vier > 0 (total já conhecido) o total fica fixo; se vier 0, cada `.spawn`
// cresce o total dinamicamente (útil quando o total depende do que quebra).
const COLLECT_RADIUS = 1.4;

export class Collectibles {
  constructor(ctx, { goal = 0 } = {}) {
    this.ctx = ctx;
    this.total = goal;
    this._autoTotal = goal === 0;
    this.count = 0;
    this.items = [];
  }

  spawn(scene, position) {
    const mesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.4),
      new THREE.MeshStandardMaterial({ color: 0xf0c94a, emissive: 0xf0c94a, emissiveIntensity: 0.7, roughness: 0.3, metalness: 0.4 })
    );
    mesh.position.copy(position);
    mesh.userData.baseY = position.y;
    mesh.userData.phase = Math.random() * Math.PI * 2;
    scene.add(mesh);
    this.items.push(mesh);
    if (this._autoTotal) this.total++;
    return mesh;
  }

  update(dt, playerPos) {
    const t = performance.now() * 0.001;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.rotation.y += dt * 2.4;
      item.position.y = item.userData.baseY + Math.sin(t * 2 + item.userData.phase) * 0.2;
      if (dist2d(playerPos, item.position) < COLLECT_RADIUS) {
        item.parent?.remove(item);
        this.items.splice(i, 1);
        this.count++;
        this.ctx.juice?.burst(this.ctx.scene, item.position, { count: 10, color: 0xf0c94a, speed: 4.5, size: 0.16 });
        this.ctx.audio?.sfx('pickup');
      }
    }
  }

  hud() { return `FRUTAS ${this.count}/${this.total}`; }
}
