// Teclado central: estado contínuo (down) + bordas (justPressed)

export class Input {
  constructor() {
    this.keys = {};
    this.pressQueue = new Map(); // code → contagem (não perde presses em frames lentos)
    this.anyListeners = [];
    addEventListener('keydown', (e) => {
      if (!e.repeat) this.pressQueue.set(e.code, (this.pressQueue.get(e.code) || 0) + 1);
      this.keys[e.code] = true;
      for (const cb of this.anyListeners) cb(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
    });
    addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    this.pressed = new Map();
  }

  // chamar uma vez por frame, no começo do loop
  beginFrame() {
    this.pressed = this.pressQueue;
    this.pressQueue = new Map();
  }

  down(...codes) { return codes.some((c) => this.keys[c]); }
  justPressed(...codes) { return codes.some((c) => this.pressed.has(c)); }
  // quantas vezes a(s) tecla(s) foram pressionadas neste frame
  presses(...codes) { return codes.reduce((n, c) => n + (this.pressed.get(c) || 0), 0); }

  // eixo de movimento WASD/setas normalizado
  axis() {
    let dx = 0, dz = 0;
    if (this.down('KeyW', 'ArrowUp')) dz -= 1;
    if (this.down('KeyS', 'ArrowDown')) dz += 1;
    if (this.down('KeyA', 'ArrowLeft')) dx -= 1;
    if (this.down('KeyD', 'ArrowRight')) dx += 1;
    const len = Math.hypot(dx, dz);
    if (len > 0) { dx /= len; dz /= len; }
    return { dx, dz, moving: len > 0 };
  }

  onAny(cb) { this.anyListeners.push(cb); }
}
