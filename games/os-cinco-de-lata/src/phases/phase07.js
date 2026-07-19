// Fase 7 — A Escama do Dragão (arcade) · Capítulo 5
// A forja: martele a escama no ritmo certo (Espaço na zona dourada) e
// depois prove a armadura — acerte os alvos com o Cuspe-Espinho.

import * as THREE from 'three';
import { GamePhase } from './framework.js';
import { caveLights, colorMat, MAT, makeRing } from '../world/builders.js';

const HAMMERS = 8;
const TARGETS = 5;

export class Phase07 extends GamePhase {
  constructor() {
    super(7, 'A Escama do Dragão', 'arcade',
      `Forje: ${HAMMERS} marteladas no ritmo (ESPAÇO na zona dourada). Depois, ${TARGETS} alvos com o Cuspe-Espinho (E).`);
  }

  build(ctx) {
    const scene = ctx.scene;
    caveLights(scene, { fogColor: 0x2c1d11 });
    scene.environmentIntensity = 0.8; // a forja é um poço de luz na noite
    scene.add(new THREE.HemisphereLight(0xd9863f, 0x3a2410, 1.2));

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), colorMat(0x2c1d11, { roughness: 1 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // a bigorna de pedra com a escama
    const anvil = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 3), colorMat(0x56575e, { flatShading: true }));
    anvil.position.set(0, 1, -6);
    anvil.castShadow = true;
    scene.add(anvil);
    this.scale = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.4, 8), MAT.scale);
    this.scale.position.set(0, 2.3, -6);
    scene.add(this.scale);
    const fire = new THREE.PointLight(0xe8945a, 150, 60);
    fire.position.set(4, 4, -6);
    scene.add(fire);
    this.fire = fire;
    // brasas da forja: preenchimento quente para a cena não afogar no escuro
    const embers = new THREE.PointLight(0xc2602f, 110, 80);
    embers.position.set(-4, 6, 0);
    scene.add(embers);
    // clarão alto da fornalha sobre a bigorna
    const overhead = new THREE.PointLight(0xd9863f, 90, 70);
    overhead.position.set(0, 12, -4);
    scene.add(overhead);

    // o martelo
    this.hammer = new THREE.Group();
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3, 6), colorMat(0x4a2f1b));
    const headM = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.8), colorMat(0x56575e, { flatShading: true }));
    headM.position.y = 1.5;
    this.hammer.add(handle, headM);
    this.hammer.position.set(0, 3.4, -6);
    this.hammer.rotation.z = 0.9;
    scene.add(this.hammer);

    // grupo em volta da forja
    ctx.party.spawn(scene, new THREE.Vector3(0, 0, -1));
    this.smith = ctx.party.leaderMesh;
    this.smith.rotation.y = Math.PI;

    // alvos da 2ª etapa (desligados por enquanto)
    this.targets = [];
    for (let i = 0; i < TARGETS; i++) {
      const t = makeRing(0xc0392b);
      t.scale.setScalar(0.55);
      t.position.set(-10 + i * 5, 3 + (i % 2) * 2.5, -22);
      t.visible = false;
      scene.add(t);
      this.targets.push(t);
    }
    this.bolts = [];

    this.stage = 'forge';
    this.hammered = 0;
    this.shot = 0;
    this.meter = 0;          // 0..1 vai-e-vem
    this.meterDir = 1;
    this.meterSpeed = 0.9;
    this.misses = 0;
    this._hud(ctx);
    ctx.hud.say('Garra arrancou a escama da carcaça sozinho. Agora: martelar a noite inteira.', { time: 4500 });
  }

  _hud(ctx) {
    if (this.stage === 'forge') {
      // barra de ritmo em texto: a zona dourada é o meio
      const pos = Math.round(this.meter * 20);
      let bar = '';
      for (let i = 0; i <= 20; i++) {
        bar += i === pos ? '◆' : (i >= 8 && i <= 12 ? '▒' : '·');
      }
      ctx.hud.setStatus(`MARTELO ${this.hammered}/${HAMMERS}  [${bar}]`);
    } else {
      ctx.hud.setStatus(`ALVOS ${this.shot}/${TARGETS} — mire com setas e dispare com E`);
    }
  }

  update(ctx, dt) {
    ctx.party.updateFollowers(this.smith.position, this.smith.rotation.y);

    if (this.stage === 'forge') {
      this.meter += this.meterDir * this.meterSpeed * dt;
      if (this.meter >= 1) { this.meter = 1; this.meterDir = -1; }
      if (this.meter <= 0) { this.meter = 0; this.meterDir = 1; }
      this._hud(ctx);

      if (ctx.input.justPressed('Space')) {
        // golpe do martelo
        this.hammer.rotation.z = -0.4;
        setTimeout(() => { this.hammer.rotation.z = 0.9; }, 120);
        const inZone = this.meter >= 0.4 && this.meter <= 0.6;
        if (inZone) {
          this.hammered++;
          this.meterSpeed += 0.14; // acelera a cada acerto
          this.scale.scale.y = Math.max(0.4, this.scale.scale.y - 0.07);
          ctx.audio.sfx('clang');
          ctx.hud.say(['TANG!', 'TUNG!', 'A escama cedeu um fio.', 'Faísca azul!'][this.hammered % 4], { time: 900 });
          if (this.hammered >= HAMMERS) {
            this.stage = 'shoot';
            for (const t of this.targets) t.visible = true;
            this.aimX = 0;
            ctx.hud.say('Tino: — Armadura pronta. Agora testa o Cuspe-Espinho — cinco alvos!', { time: 4000 });
          }
        } else {
          this.misses++;
          ctx.audio.sfx('hurt');
          ctx.hud.say('Errou o tempo — a escama esfriou.', { danger: true, time: 1200 });
          if (this.misses >= 6) {
            return this.onLose(ctx, 'A escama rachou no frio.<br/>Garra olhou pra carcaça: teria que arrancar outra.');
          }
        }
        this._hud(ctx);
      }
    } else {
      // etapa do Cuspe-Espinho
      const { dx } = ctx.input.axis();
      this.aimX = THREE.MathUtils.clamp((this.aimX || 0) + dx * 14 * dt, -12, 12);
      this.smith.position.x = this.aimX;
      this.smith.rotation.y = Math.PI;

      if (ctx.input.justPressed('KeyE')) {
        ctx.audio.sfx('shoot');
        const bolt = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1, 5), colorMat(0x6fa03a));
        bolt.rotation.x = -Math.PI / 2;
        bolt.position.set(this.aimX, 1.6, -2);
        ctx.scene.add(bolt);
        this.bolts.push(bolt);
      }
      for (let i = this.bolts.length - 1; i >= 0; i--) {
        const b = this.bolts[i];
        b.position.z -= 30 * dt;
        b.position.y += 4 * dt;
        let consumed = false;
        for (const t of this.targets) {
          if (t.visible && Math.abs(b.position.z - t.position.z) < 1 &&
              Math.hypot(b.position.x - t.position.x, b.position.y - t.position.y) < 1.6) {
            t.visible = false;
            this.shot++;
            consumed = true;
            ctx.audio.sfx('pickup');
            this._hud(ctx);
            break;
          }
        }
        if (consumed || b.position.z < -30) {
          ctx.scene.remove(b);
          this.bolts.splice(i, 1);
        }
      }
      this._hud(ctx);
      if (this.shot >= TARGETS) {
        return this.onWin(ctx,
          'Cinco mendigos de lata viraram cinco cavaleiros de escama.<br/>Escuros, pesados — e pela primeira vez, invisíveis no escuro.',
          HAMMERS - this.misses);
      }

      // alvos balançam
      for (const t of this.targets) {
        if (t.visible) t.position.y += Math.sin(performance.now() * 0.002 + t.position.x) * dt * 0.8;
      }
    }

    // câmera fixa de forja
    ctx.camera.position.lerp(new THREE.Vector3(this.stage === 'forge' ? 6 : 0, 6, 6), Math.min(1, dt * 3));
    ctx.camera.lookAt(0, 2, this.stage === 'forge' ? -6 : -16);
    this.fire.intensity = 150 + Math.sin(performance.now() * 0.01) * 35;
  }
}
