// Os Cinco de Lata — Do Capim ao Grande Rio
// Boot + máquina de estados: WORLDMAP ↔ CARD → PHASE → RESULT.
// O render passa pelo pipeline de pixelização (estilo FFV) em core/pixel.js.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { PixelPipeline, PIXEL_W, PIXEL_H } from './core/pixel.js';
import { setEnvironment } from './world/builders.js';
import { Input } from './core/input.js';
import { HUD } from './core/hud.js';
import { AudioEngine } from './core/audio.js';
import { PartyManager, PARTY_MEMBERS } from './core/party.js';
import { Save } from './core/save.js';
import { WorldMap } from './world/worldmap.js';
import { Phase01 } from './phases/phase01.js';
import { Phase02 } from './phases/phase02.js';
import { Phase03 } from './phases/phase03.js';
import { Phase04 } from './phases/phase04.js';
import { Phase05 } from './phases/phase05.js';
import { Phase06 } from './phases/phase06.js';
import { Phase07 } from './phases/phase07.js';
import { Phase08 } from './phases/phase08.js';
import { Phase09 } from './phases/phase09.js';
import { Phase10 } from './phases/phase10.js';

const PHASE_CLASSES = [Phase01, Phase02, Phase03, Phase04, Phase05, Phase06, Phase07, Phase08, Phase09, Phase10];

// artes pixel 16-bit geradas no Higgsfield (docs/PROMPTS.md) — cartões por tipo
const CDN = 'https://d8j0ntlcm91z4.cloudfront.net/user_3Cs6n4P9VtDQBLcqUPlxk1nSd2p';
const ART = {
  track: `${CDN}/hf_20260611_195942_25fa81b5-cc73-42d0-9cd7-5c433ca90305.png`,
  world: `${CDN}/hf_20260611_195943_1afb448a-5ae0-4a3b-b5ee-e91e5f0703d6.png`,
  fight: `${CDN}/hf_20260611_195951_0216cb99-18ec-4435-8813-3f246532ad64.png`,
  arcade: `${CDN}/hf_20260611_195952_0b6126dc-4b50-4c9f-b649-1aae8b9de0ef.png`,
  title: `${CDN}/hf_20260611_195858_11234f63-3c22-43c1-9718-b6c453b50d3c.png`,
};

class Game {
  constructor() {
    this.state = 'BOOT';
    this.input = new Input();
    this.hud = new HUD();
    this.audio = new AudioEngine();
    this.party = new PartyManager();
    this.save = new Save();
    this.pipeline = new PixelPipeline(document.getElementById('game'));
    const pmrem = new THREE.PMREMGenerator(this.pipeline.renderer);
    setEnvironment(pmrem.fromScene(new RoomEnvironment(), 0.04).texture);
    this.camera = new THREE.PerspectiveCamera(58, PIXEL_W / PIXEL_H, 0.1, 500);
    this.scene = new THREE.Scene();
    this.currentPhase = null;
    this.currentPhaseId = null;
    this.phaseMeta = PHASE_CLASSES.map((C) => new C()); // só para nome/tipo no mapa

    // áudio só pode nascer num gesto do usuário
    this.input.onAny(() => {
      this.audio.ensure();
      this._dismissTitle();
    });

    addEventListener('keydown', (e) => {
      if (e.code === 'KeyM') {
        const muted = this.audio.toggleMute();
        this.hud.say(muted ? '♪ som desligado' : '♪ som ligado', { time: 1200 });
      }
      if (e.code === 'KeyP') {
        this.pipeline.enabled = !this.pipeline.enabled;
        this.hud.say(this.pipeline.enabled ? 'pixel ON' : 'pixel OFF (debug)', { time: 1200 });
      }
    });

    this.gotoWorldmap();
    setTimeout(() => this._dismissTitle(), 7000);

    this.lastTime = performance.now();
    this.loop();
    window.__OCDL = this; // handle de debug/automação
  }

  partyList() { return PARTY_MEMBERS; }

  _dismissTitle() {
    const t = document.getElementById('title-card');
    if (t) t.classList.add('fade');
  }

  // ---------------------------------------------------------------- estados
  gotoWorldmap() {
    this.hud.clear();
    this.currentPhase = null;
    this.worldmap = new WorldMap(this, this.phaseMeta);
    this.scene = this.worldmap.build();
    this.state = 'WORLDMAP';
    this.audio.playTheme('worldmap');
  }

  startPhase(id) {
    this.hud.clear();
    this.currentPhaseId = id;
    this.currentPhase = new PHASE_CLASSES[id - 1]();
    this.scene = new THREE.Scene();
    this.currentPhase.build(this);
    this.hud.card(this.currentPhase, ART[this.currentPhase.type]);
    this.hud.party(PARTY_MEMBERS, this.party.activeLeaderId);
    this.state = 'CARD';
    this.audio.playTheme(null);
  }

  phaseWin(text, score) {
    if (this.state !== 'PHASE') return;
    this.state = 'RESULT';
    this.resultWon = true;
    this.save.complete(this.currentPhaseId, score);
    this.audio.playTheme(null);
    this.audio.fanfare();
    const last = this.currentPhaseId === 10;
    this.hud.result(
      last ? '✦ A CASA AO LADO ✦' : 'VITÓRIA',
      text,
      last ? 'ENTER · voltar ao mapa' : 'ENTER · mapa    R · jogar de novo',
      last ? ART.title : undefined
    );
  }

  phaseLose(text) {
    if (this.state !== 'PHASE') return;
    this.state = 'RESULT';
    this.resultWon = false;
    this.audio.playTheme(null);
    this.audio.lament();
    this.hud.result('DERROTA', text, 'R · tentar de novo    ENTER · mapa');
  }

  // ---------------------------------------------------------------- loop
  loop() {
    requestAnimationFrame(() => this.loop());
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    this.input.beginFrame();

    if (this.state === 'WORLDMAP') {
      this.worldmap.update(dt);
    } else if (this.state === 'CARD') {
      if (this.input.justPressed('Enter', 'Space')) {
        this.hud.hideCard();
        this.hud.setObjective(`${this.currentPhase.id}. ${this.currentPhase.name}`);
        this.state = 'PHASE';
        this.audio.playTheme(this.currentPhase.theme);
      }
      if (this.input.justPressed('Escape')) this.gotoWorldmap();
    } else if (this.state === 'PHASE') {
      this.currentPhase.update(this, dt);
      if (this.input.justPressed('Escape')) this.gotoWorldmap();
    } else if (this.state === 'RESULT') {
      if (this.input.justPressed('Enter')) this.gotoWorldmap();
      if (this.input.justPressed('KeyR')) this.startPhase(this.currentPhaseId);
    }

    this.pipeline.render(this.scene, this.camera);
  }
}

new Game();
