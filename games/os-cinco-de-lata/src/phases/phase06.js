// Fase 6 — O Ventre do Dragão (track) · Capítulo 4
// Trovão corre pelo túnel de âmbar vivo do estômago do dragão.
// Desvie dos pilares de carne e alcance a luz antes da parede fechar.

import * as THREE from 'three';
import { GamePhase, FollowCam, Hearts } from './framework.js';
import { caveLights, colorMat, makeGecko, animateGecko } from '../world/builders.js';

const LEN = 300;
const HALF_W = 9;

export class Phase06 extends GamePhase {
  constructor() {
    super(6, 'O Ventre do Dragão', 'track',
      'Corra pelo estômago do dragão até a luz — a parede de carne vem atrás!');
  }

  build(ctx) {
    const scene = ctx.scene;
    caveLights(scene, { fogColor: 0x8a3b22, amberGlow: true });
    scene.fog.near = 18; scene.fog.far = 110; // dá ~3s de reação a 24 u/s

    // túnel de carne âmbar
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(HALF_W + 3, HALF_W + 3, LEN + 80, 12, 24, true),
      colorMat(0xa64b2a, { side: THREE.BackSide, roughness: 0.6, emissive: 0x6e2c16, emissiveIntensity: 0.35 })
    );
    tube.rotation.x = Math.PI / 2;
    tube.position.z = -LEN / 2;
    scene.add(tube);
    this.tube = tube;

    // chão úmido
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALF_W * 2 + 4, LEN + 80), colorMat(0x8a3b22, { roughness: 0.4 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -LEN / 2);
    floor.receiveShadow = true;
    scene.add(floor);

    // pilares de carne pulsante — brilham âmbar e marcam o chão (legíveis no escuro)
    this.pillars = [];
    const ringGeo = new THREE.RingGeometry(1.9, 2.5, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf0b46a, transparent: true, opacity: 0.6 });
    for (let z = -22; z > -LEN + 20; z -= 13) {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(1.3, 1.7, 12, 7),
        colorMat(0xd98a4f, { roughness: 0.5, emissive: 0xc2602f, emissiveIntensity: 0.9, transparent: true })
      );
      pillar.position.set((Math.random() - 0.5) * HALF_W * 1.8, 6, z);
      pillar.userData.phase = Math.random() * Math.PI * 2;
      scene.add(pillar);
      this.pillars.push(pillar);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(pillar.position.x, 0.06, z);
      scene.add(ring);
    }

    // nódulos bioluminescentes espiralando pelas paredes: senso de rumo e velocidade
    const nodMat = new THREE.MeshBasicMaterial({ color: 0xf0b46a });
    const nodGeo = new THREE.SphereGeometry(0.32, 6, 5);
    for (let z = -8; z > -LEN - 10; z -= 7) {
      const a = z * 0.22;
      const nod = new THREE.Mesh(nodGeo, nodMat);
      nod.position.set(Math.cos(a) * (HALF_W + 2.2), 5.5 + Math.sin(a) * 4.5, z);
      scene.add(nod);
    }

    // a luz que o grupo carrega: lampião de Tino aceso no lombo de Trovão
    this.lantern = new THREE.PointLight(0xf0b46a, 110, 42);
    this.lantern.position.set(0, 4, 0);
    scene.add(this.lantern);

    // a luz no fim
    const glow = new THREE.PointLight(0xf3e9d2, 60, 90);
    glow.position.set(0, 4, -LEN - 10);
    scene.add(glow);
    const exit = new THREE.Mesh(new THREE.CircleGeometry(7, 16), new THREE.MeshBasicMaterial({ color: 0xf3e9d2, fog: false }));
    exit.position.set(0, 5, -LEN - 16);
    scene.add(exit);

    // Trovão + grupo montado
    this.gecko = makeGecko();
    this.gecko.position.set(0, 0, 0);
    this.gecko.rotation.y = Math.PI;
    scene.add(this.gecko);
    ctx.party.spawn(scene, new THREE.Vector3(0, 1.6, 0));
    ctx.party.soloLeader(true);
    this.rider = ctx.party.leaderMesh;
    this.rider.userData.riding = true;
    this.rider.scale.setScalar(0.8);

    // a parede de carne que persegue
    this.wallZ = 26;
    this.wall = new THREE.Mesh(new THREE.CircleGeometry(HALF_W + 4, 14), colorMat(0x5e2715, { emissive: 0x2c1d11, emissiveIntensity: 0.6 }));
    this.wall.position.set(0, 5, this.wallZ);
    scene.add(this.wall);

    this.cam = new FollowCam(ctx.camera, { height: 5.5, back: 10, stiffness: 5 });
    this.cam.snap(this.gecko.position);
    this.hearts = new Hearts(ctx);
    this.speed = 0;
    this.stunned = 0;
    this._hud(ctx);
    ctx.hud.say('Tarso: — ESPADAS PRA FORA! A gente abre caminho cortando!', { time: 4000 });
  }

  _hud(ctx) {
    const prog = Math.min(100, Math.round((-this.gecko.position.z / LEN) * 100));
    ctx.hud.setStatus(`SAIDA ${prog}%   ${this.hearts.display}`);
  }

  update(ctx, dt) {
    const g = this.gecko.position;
    this.stunned = Math.max(0, this.stunned - dt);
    const maxSpeed = this.stunned > 0 ? 7 : 24;
    this.speed = THREE.MathUtils.lerp(this.speed, maxSpeed, dt * 1.6);
    g.z -= this.speed * dt;
    const { dx } = ctx.input.axis();
    g.x = THREE.MathUtils.clamp(g.x + dx * 16 * dt, -HALF_W, HALF_W);
    this.gecko.rotation.y = Math.PI + dx * -0.35;
    animateGecko(this.gecko, true);
    this.rider.position.set(g.x, 1.7, g.z + 0.3);
    this.rider.rotation.y = Math.PI;
    ctx.party.updateFollowers(this.rider.position, this.rider.rotation.y);

    // pilares pulsam e machucam
    for (const pillar of this.pillars) {
      const s = 1 + Math.sin(performance.now() * 0.003 + pillar.userData.phase) * 0.18;
      pillar.scale.set(s, 1, s);
      // pilar entre a câmera e o grupo fica translúcido — a tela nunca é cegada
      pillar.material.opacity = pillar.position.z > g.z - 1.2 ? 0.22 : 1;
      if (!pillar.userData.hit && Math.abs(g.z - pillar.position.z) < 1.6 && Math.abs(g.x - pillar.position.x) < 1.9 * s) {
        pillar.userData.hit = true;
        this.stunned = 0.75;
        ctx.audio.sfx('hurt');
        if (this.hearts.hit('A parede de carne se fechou em volta — Trovão se arrancou no susto!')) {
          return this.onLose(ctx, 'O âmbar escureceu. O dragão nem percebeu o lanche.');
        }
        this._hud(ctx);
      }
    }

    // o lampião acompanha o grupo
    this.lantern.position.set(g.x, 4, g.z - 4);
    this.lantern.intensity = 100 + Math.sin(performance.now() * 0.008) * 14;

    // a parede persegue: punição por derrapar, mas velocidade máxima RECUPERA
    // (24×0.8+3.2 = 22.4 < 24 — depois de um erro sempre dá pra fugir)
    this.wallZ -= (this.speed * 0.8 + 3.2) * dt;
    this.wall.position.z = this.wallZ;
    if (this.wallZ <= g.z + 2) {
      ctx.audio.sfx('hurt');
      return this.onLose(ctx, 'A onda de músculo alcançou os cinco.<br/>Ávio: — Foi você que disse “atalho”, Tarso.');
    }
    ctx.hud.danger(this.wallZ - g.z < 18);

    this.hearts.update(dt, this.rider);
    this._hud(ctx);

    // tubo "respira"
    this.tube.scale.x = this.tube.scale.y = 1 + Math.sin(performance.now() * 0.002) * 0.03;

    if (g.z <= -LEN) {
      return this.onWin(ctx,
        'Cortaram a última membrana e despencaram na luz.<br/>Atrás deles, o dragão arrotou.',
        this.hearts.n);
    }

    this.cam.update(g, dt);
  }
}
