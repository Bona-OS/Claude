// Fase 10 — Os Portões de Mirmécia (fight/finale) · Capítulos 10-13
// Ato 1: Trovão blindado rompe as barricadas até o portão.
// Ato 2: o duelo com Élitra — Garra bloqueia as investidas (E no tempo).
// Epílogo: A Casa ao Lado.

import * as THREE from 'three';
import { GamePhase, Hearts, dist2d } from './framework.js';
import {
  sunsetLights, makeGround, makeGrassField, makeGecko, animateGecko,
  makeElitra, makeAnt, colorMat, makeBackdrop, mirmeciaSilhouette,
} from '../world/builders.js';

const LEN = 200;
const HALF_W = 12;

export class Phase10 extends GamePhase {
  constructor() {
    super(10, 'Os Portões de Mirmécia', 'fight',
      'Rompa as barricadas com Trovão blindado. No portão: bloqueie Élitra com Garra (E no momento certo).');
  }

  get theme() { return 'fight'; }

  build(ctx) {
    const scene = ctx.scene;
    this.sun = sunsetLights(scene, { fogColor: 0xa64b2a, fogNear: 30, fogFar: 130 });
    makeGround(scene, { y: 0, z: -LEN / 2, color: 0x3a2410 });
    this.grass = makeGrassField(scene, { count: 160, innerGap: HALF_W * 2 + 14, spread: 30, zMin: -LEN, zMax: 20, baseY: 0 });
    makeBackdrop(scene, { texture: mirmeciaSilhouette(), w: 220, h: 110, position: [0, 30, -LEN - 60] });

    // barricadas de Mirmécia (quebráveis com Trovão)
    this.barricades = [];
    for (let z = -30; z > -LEN + 40; z -= 22) {
      for (const x of [-HALF_W * 0.55, HALF_W * 0.55]) {
        if (Math.random() < 0.35) continue;
        const barricade = new THREE.Mesh(new THREE.BoxGeometry(8, 3.4, 1.4), colorMat(0x4a2f1b, { flatShading: true }));
        barricade.position.set(x + (Math.random() - 0.5) * 4, 1.7, z);
        barricade.castShadow = true;
        scene.add(barricade);
        this.barricades.push(barricade);
      }
    }
    // defensores (formigas) que Trovão simplesmente atropela — lagarto come formiga
    this.ants = [];
    for (let i = 0; i < 12; i++) {
      const ant = makeAnt();
      ant.position.set((Math.random() - 0.5) * HALF_W * 1.8, 0, -36 - Math.random() * (LEN - 80));
      scene.add(ant);
      this.ants.push(ant);
    }

    // Trovão BLINDADO, armado até os dentes
    this.gecko = makeGecko({ armored: true });
    this.gecko.position.set(0, 0, 4);
    this.gecko.rotation.y = Math.PI;
    scene.add(this.gecko);
    ctx.party.spawn(scene, new THREE.Vector3(0, 1.6, 4));
    ctx.party.soloLeader(true);
    this.rider = ctx.party.leaderMesh;
    this.rider.scale.setScalar(0.8);

    // o portão e Élitra (ato 2)
    this.gateZ = -LEN + 16;
    this.gate = new THREE.Mesh(new THREE.BoxGeometry(HALF_W * 2 + 6, 12, 2), colorMat(0x2c1d11, { flatShading: true }));
    this.gate.position.set(0, 6, this.gateZ - 8);
    scene.add(this.gate);
    this.elitra = makeElitra();
    this.elitra.position.set(0, 0, this.gateZ);
    this.elitra.visible = false;
    scene.add(this.elitra);

    this.act = 1;
    this.hearts = new Hearts(ctx);
    this.speed = 0;
    this.stunned = 0;
    // duelo
    this.duel = { phase: 'idle', timer: 2.5, blocks: 0, t: 0 };
    this._hud(ctx);
    ctx.hud.say('Trovão, blindada em escama de dragão, "armada até os dentes". Instinto: lagarto come formiga.', { time: 5500 });
  }

  _hud(ctx) {
    if (this.act === 1) {
      const prog = Math.min(100, Math.round((-this.gecko.position.z / (LEN - 30)) * 100));
      ctx.hud.setStatus(`⚔ ${prog}%   ${this.hearts.display}`);
    } else {
      ctx.hud.setStatus(`Élitra: ${'◆'.repeat(3 - this.duel.blocks)}${'◇'.repeat(this.duel.blocks)}   ${this.hearts.display}  — Garra (4) + E no tempo!`);
    }
  }

  update(ctx, dt) {
    if (this.act === 1) return this._updateCharge(ctx, dt);
    return this._updateDuel(ctx, dt);
  }

  _updateCharge(ctx, dt) {
    const g = this.gecko.position;
    this.stunned = Math.max(0, this.stunned - dt);
    const maxSpeed = this.stunned > 0 ? 6 : 22;
    this.speed = THREE.MathUtils.lerp(this.speed, maxSpeed, dt * 1.4);
    g.z -= this.speed * dt;
    const { dx } = ctx.input.axis();
    g.x = THREE.MathUtils.clamp(g.x + dx * 15 * dt, -HALF_W, HALF_W);
    this.gecko.rotation.y = Math.PI + dx * -0.3;
    animateGecko(this.gecko, true);
    this.rider.position.set(g.x, 1.7, g.z + 0.3);
    this.rider.rotation.y = Math.PI;
    ctx.party.updateFollowers(this.rider.position, this.rider.rotation.y);

    // barricadas: Trovão blindado ROMPE (com Shift = investida, sem dano)
    for (const barricade of this.barricades) {
      if (barricade.userData.broken) continue;
      if (Math.abs(g.z - barricade.position.z) < 1.8 && Math.abs(g.x - barricade.position.x) < 5) {
        barricade.userData.broken = true;
        barricade.rotation.x = -1.2;
        barricade.position.y = 0.4;
        ctx.audio.sfx('clang');
        if (!ctx.input.down('ShiftLeft', 'ShiftRight')) {
          this.stunned = 0.8;
          if (this.hearts.hit('A barricada raspou a blindagem — use SHIFT para investir!')) {
            return this.onLose(ctx, 'A muralha de Mirmécia segurou mais uma vez.<br/>"A Roma que nunca caiu."');
          }
          this._hud(ctx);
        } else {
          ctx.hud.say('Trovão ROMPEU a linha como se fosse capim!', { time: 1500 });
        }
      }
    }
    // formigas: atropeladas de graça (instinto ancestral)
    for (const ant of this.ants) {
      if (ant.userData.eaten) continue;
      const d = dist2d(g, ant.position);
      if (d < 14) {
        // fogem de Trovão
        const dir = new THREE.Vector3(ant.position.x - g.x, 0, ant.position.z - g.z).normalize();
        ant.position.addScaledVector(dir, 5 * dt);
      }
      if (d < 2.4) {
        ant.userData.eaten = true;
        ant.visible = false;
        ctx.audio.sfx('pickup');
      }
    }

    this.hearts.update(dt, this.rider);
    this._hud(ctx);

    if (g.z <= this.gateZ + 8) {
      this.act = 2;
      this.speed = 0;
      this.elitra.visible = true;
      this.gecko.position.set(-7, 0, this.gateZ + 12);
      this.rider.position.set(0, 0, this.gateZ + 10);
      this.rider.scale.setScalar(ctx.party.leader.scale); // volta à escala a pé
      ctx.party.soloLeader(false);
      ctx.party.switchLeader(4); // Garra assume para o bloqueio
      ctx.hud.party(ctx.partyList(), 4);
      ctx.hud.say('Élitra, no portão. O que se quebrou nela virou ódio frio.<br>— VOCÊS. — disse ela.', { danger: true, time: 5000 });
      this._hud(ctx);
    }

    this.grass.update();
    ctx.camera.position.lerp(new THREE.Vector3(g.x * 0.5, 7, g.z + 13), Math.min(1, dt * 4));
    ctx.camera.lookAt(g.x * 0.8, 1.5, g.z - 8);
    this.sun.position.set(g.x - 30, 35, g.z + 20);
    this.sun.target.position.copy(g);
  }

  _updateDuel(ctx, dt) {
    const duel = this.duel;
    const player = ctx.party.leaderMesh;
    const e = this.elitra;

    duel.timer -= dt;
    if (duel.phase === 'idle' && duel.timer <= 0) {
      duel.phase = 'telegraph';
      duel.timer = 1.1;
      ctx.hud.say('Élitra ergueu a lâmina — AGORA NÃO! Espere o bote!', { danger: true, time: 1100 });
      ctx.hud.danger(true);
    } else if (duel.phase === 'telegraph') {
      e.position.x = Math.sin(performance.now() * 0.02) * 0.3; // tremendo de fúria
      if (duel.timer <= 0) {
        duel.phase = 'strike';
        duel.t = 0;
        duel.from = e.position.clone();
      }
    } else if (duel.phase === 'strike') {
      duel.t += dt / 0.5;
      const t = Math.min(duel.t, 1);
      e.position.lerpVectors(duel.from, player.position, t * 0.92);
      e.lookAt(player.position.x, 0, player.position.z);
      if (t >= 0.75 && !duel.checked) {
        duel.checked = true;
        const blocking = ctx.party.activeLeaderId === 4 && ctx.input.down('KeyE');
        if (blocking) {
          duel.blocks++;
          ctx.audio.sfx('block');
          ctx.hud.say(['Garra bloqueou — enorme, irredutível.',
            'O golpe quicou no escudo de escama!',
            'Garra, gentil do jeito brutal dele, segurou a lâmina — e a prendeu.'][duel.blocks - 1], { time: 2500 });
        } else {
          ctx.audio.sfx('hurt');
          if (this.hearts.hit('A lâmina de Élitra encontrou a fresta da armadura!')) {
            return this.onLose(ctx, 'O ódio frio dela era mais velho que a raiva deles.<br/>Mirmécia teve sua vingança no portão.');
          }
        }
        this._hud(ctx);
      }
      if (duel.t >= 1) {
        duel.checked = false;
        if (duel.blocks >= 3) return this._epilogue(ctx);
        duel.phase = 'recover';
        duel.timer = 1.6;
        ctx.hud.danger(false);
      }
    } else if (duel.phase === 'recover') {
      // ela recua em círculo
      const back = new THREE.Vector3(player.position.x + Math.sin(performance.now() * 0.001) * 8, 0, this.gateZ);
      e.position.lerp(back, dt * 2);
      if (duel.timer <= 0) { duel.phase = 'idle'; duel.timer = 0.8; }
    }

    this.hearts.update(dt, player);
    ctx.camera.position.lerp(new THREE.Vector3(player.position.x + 6, 5, player.position.z + 10), Math.min(1, dt * 3));
    ctx.camera.lookAt(e.position.x, 1.5, e.position.z);
  }

  _epilogue(ctx) {
    return this.onWin(ctx,
      'Garra a prendeu sem um arranhão a mais. Mirmécia caiu — e não encheu nada por dentro.<br/><br/>' +
      'Meses depois, numa colina com vista pro Grande Rio, os cinco construíram DUAS casas. ' +
      'Na janela de uma delas, Brio deixou uma flor de capim torta.<br/><br/>' +
      '“— Saiam da minha casa.” — disse Élitra, baixinho.<br/>' +
      'E não era perdão. Mas também não era só ódio.<br/><br/>✦ FIM DO LIVRO 1 ✦',
      this.hearts.n);
  }
}
