// Trilha sonora procedural — sintetizador WebAudio, zero arquivos.
// Sonoridade folk britânica/escocesa: drone de gaita (quinta), melodia
// modal (mixolídio/dórico) com vibrato e ornamentos, harpa em arpejo e
// bodhrán de ruído filtrado. Mood positivo. Tecla M muta.
//
// DSL de melodia: cada token = 1 colcheia. Dígito = grau da escala
// (1..7), "+" oitava acima, "-" oitava abaixo, "." pausa, "_" sustenta.

const MODES = {
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
};

function parseLine(str) {
  // → [{step, deg, oct, len}]
  const tokens = str.replace(/\|/g, ' ').trim().split(/\s+/);
  const events = [];
  tokens.forEach((tok, i) => {
    if (tok === '.') return;
    if (tok === '_') { if (events.length) events[events.length - 1].len++; return; }
    const deg = parseInt(tok[0], 10);
    const oct = (tok.match(/\+/g) || []).length - (tok.match(/-/g) || []).length;
    events.push({ step: i, deg, oct, len: 1 });
  });
  return { events, steps: tokens.length };
}

const THEMES = {
  // mapa-múndi: jig 6/8 alegre em Ré mixolídio
  worldmap: {
    root: 62, mode: 'mixolydian', stepDur: 0.175,
    melody: parseLine(`
      1 2 3 5 _ 3 | 6 5 6 1+ _ 6 | 5 3 5 6 5 3 | 2 1 2 3 _ .
      1 2 3 5 _ 3 | 6 5 6 1+ _ 6 | 5 6 5 3 2 7- | 1 _ _ 1 _ .
      1+ _ 7 6 _ 5 | 6 _ 5 3 _ 1 | 2 3 2 7- _ 2 | 1 _ _ 1 _ .`),
    harp: [1, 1, 4, 5, 1, 1, 7, 1], // graus-raiz dos acordes por compasso (cíclico)
    perc: 'X..x.x',
    drone: true,
  },
  // fases track: reel rápido
  track: {
    root: 64, mode: 'mixolydian', stepDur: 0.125,
    melody: parseLine(`
      1 3 5 3 6 5 3 1 | 2 4 6 4 5 4 2 7- | 1 3 5 3 6 5 3 5 | 6 5 3 2 1 _ 1 _
      1+ 6 5 6 1+ 6 5 3 | 2 4 6 4 2 _ 2 . | 5 6 1+ 6 5 3 2 3 | 1 _ _ _ 1 _ . .`),
    harp: [1, 4, 1, 5, 1, 4, 5, 1],
    perc: 'X.x.X.x.',
    drone: true,
  },
  // fases fight: dórico marcial
  fight: {
    root: 57, mode: 'dorian', stepDur: 0.15,
    melody: parseLine(`
      1 _ 1 3 _ 3 | 4 _ 4 5 _ _ | 7 _ 6 5 _ 4 | 5 _ _ 1 _ _
      1 _ 1 3 _ 3 | 4 _ 4 7 _ _ | 1+ _ 7 5 _ 7 | 1 _ _ 1 _ _`),
    harp: [1, 1, 4, 5, 1, 1, 7, 1],
    perc: 'XxxXxx',
    drone: true,
  },
  // fases arcade: saltitante, pentatônica maior
  arcade: {
    root: 67, mode: 'major', stepDur: 0.14,
    melody: parseLine(`
      1 3 5 6 5 3 | 2 3 2 6- _ . | 1 3 5 6 1+ 6 | 5 _ _ 5 _ .
      6 5 3 5 6 1+ | 5 3 2 3 _ . | 1 2 3 5 3 2 | 1 _ _ 1 _ .`),
    harp: [1, 4, 1, 5, 1, 4, 5, 1],
    perc: 'X..x..',
    drone: false,
  },
  // fases world: calmo, exploração
  world: {
    root: 60, mode: 'major', stepDur: 0.21,
    melody: parseLine(`
      3 _ 2 1 _ _ | 6- _ 1 2 _ _ | 3 _ 5 6 _ 5 | 3 _ 2 1 _ _
      3 _ 5 6 _ 1+ | 6 _ 5 3 _ 2 | 1 _ 2 3 _ 2 | 1 _ _ _ _ _`),
    harp: [1, 6, 4, 5, 1, 6, 4, 1],
    perc: '......',
    drone: true,
  },
};

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.themeName = null;
    this._timer = null;
    this._droneNodes = [];
  }

  // chamar num gesto do usuário (política de autoplay)
  ensure() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.32;
    // eco curto dá "ar" de salão folk
    this.delay = this.ctx.createDelay(0.4);
    this.delay.delayTime.value = 0.22;
    this.delayGain = this.ctx.createGain();
    this.delayGain.gain.value = 0.18;
    this.master.connect(this.ctx.destination);
    this.master.connect(this.delay);
    this.delay.connect(this.delayGain);
    this.delayGain.connect(this.ctx.destination);
    if (this.themeName) this._startScheduler(this.themeName);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.32;
    return this.muted;
  }

  freq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }
  degToMidi(theme, deg, oct = 0) {
    const scale = MODES[theme.mode];
    return theme.root + scale[(deg - 1) % 7] + 12 * (Math.floor((deg - 1) / 7) + oct);
  }

  playTheme(name) {
    if (this.themeName === name) return;
    this.themeName = name;
    this.stopScheduler();
    if (this.ctx && name) this._startScheduler(name);
  }

  stopScheduler() {
    clearInterval(this._timer);
    this._timer = null;
    for (const n of this._droneNodes) { try { n.stop(); } catch { /* já parado */ } }
    this._droneNodes = [];
  }

  _startScheduler(name) {
    const theme = THEMES[name];
    if (!theme) return;
    const ctx = this.ctx;
    if (theme.drone) this._startDrone(theme);
    let step = 0;
    let nextTime = ctx.currentTime + 0.1;
    const totalSteps = theme.melody.steps;
    const barLen = theme.perc.length;

    this._timer = setInterval(() => {
      while (nextTime < ctx.currentTime + 0.35) {
        const s = step % totalSteps;
        // melodia
        for (const ev of theme.melody.events) {
          if (ev.step === s) {
            const midi = this.degToMidi(theme, ev.deg, ev.oct);
            this._lead(this.freq(midi), nextTime, ev.len * theme.stepDur);
          }
        }
        // harpa: arpejo raiz-5ª-oitava no início de cada compasso
        if (s % barLen === 0) {
          const bar = Math.floor(s / barLen);
          const rootDeg = theme.harp[bar % theme.harp.length];
          const m = this.degToMidi(theme, rootDeg, -1);
          [0, 7, 12].forEach((iv, i) => {
            this._pluck(this.freq(m + iv), nextTime + i * theme.stepDur * 0.5);
          });
        }
        // bodhrán
        const p = theme.perc[s % barLen];
        if (p === 'X') this._perc(nextTime, 1);
        else if (p === 'x') this._perc(nextTime, 0.45);
        step++;
        nextTime += theme.stepDur;
      }
    }, 90);
  }

  _startDrone(theme) {
    const ctx = this.ctx;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 520;
    const g = ctx.createGain(); g.gain.value = 0.05;
    lp.connect(g); g.connect(this.master);
    for (const iv of [0, 7]) { // tônica + quinta, levemente desafinadas (gaita)
      for (const det of [-4, 4]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = this.freq(theme.root - 12 + iv);
        o.detune.value = det;
        o.connect(lp);
        o.start();
        this._droneNodes.push(o);
      }
    }
  }

  _lead(freq, t, dur) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.setValueAtTime(freq, t);
    // vibrato (entra depois do ataque, como flauta folk)
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 5.5;
    const lfoG = ctx.createGain(); lfoG.gain.setValueAtTime(0, t);
    lfoG.gain.linearRampToValueAtTime(freq * 0.012, t + Math.min(0.12, dur * 0.5));
    lfo.connect(lfoG); lfoG.connect(o.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.085, t + 0.015);
    g.gain.setValueAtTime(0.085, t + Math.max(0.02, dur - 0.04));
    g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.05);
    lfo.start(t); lfo.stop(t + dur + 0.05);
  }

  _pluck(freq, t) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.07, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + 0.55);
  }

  _perc(t, accent) {
    const ctx = this.ctx;
    const len = 0.09;
    const buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = accent === 1 ? 130 : 300; bp.Q.value = 1.2;
    const g = ctx.createGain(); g.gain.value = 0.5 * accent;
    src.connect(bp); bp.connect(g); g.connect(this.master);
    src.start(t);
  }

  // ---- efeitos sonoros ----
  _now() { return this.ctx ? this.ctx.currentTime : 0; }

  sfx(name) {
    if (!this.ctx) return;
    const t = this._now();
    const seq = {
      pickup: () => [880, 1175, 1760].forEach((f, i) => this._pluck(f, t + i * 0.06)),
      hurt: () => this._slide(420, 120, t, 0.25, 'sawtooth', 0.12),
      clang: () => { this._slide(1900, 1500, t, 0.18, 'square', 0.1); this._perc(t, 1); },
      jump: () => this._slide(300, 600, t, 0.12, 'square', 0.05),
      shoot: () => this._slide(900, 300, t, 0.1, 'square', 0.06),
      block: () => this._slide(200, 180, t, 0.15, 'square', 0.1),
      step: () => this._perc(t, 0.25),
    }[name];
    if (seq) seq();
  }

  _slide(f0, f1, t, dur, type, vol) {
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  // fanfarra de vitória (não-loop)
  fanfare() {
    if (!this.ctx) return;
    const t = this._now() + 0.05;
    const root = 62;
    [[0, 0], [4, 0.16], [7, 0.32], [12, 0.48], [12, 0.8], [11, 0.95], [12, 1.1]].forEach(([iv, dt]) => {
      this._lead(this.freq(root + iv + 12), t + dt, dt >= 0.8 ? 0.4 : 0.15);
    });
  }

  lament() {
    if (!this.ctx) return;
    const t = this._now() + 0.05;
    const root = 57;
    [[12, 0], [10, 0.35], [7, 0.7], [3, 1.05], [0, 1.4]].forEach(([iv, dt]) => {
      this._lead(this.freq(root + iv), t + dt, 0.32);
    });
  }
}
