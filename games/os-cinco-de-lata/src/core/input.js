// Teclado central: estado contínuo (down) + bordas (justPressed)

export class Input {
  constructor() {
    this.keys = {};
    this.pressedQueue = new Set();
    this.anyListeners = [];
    addEventListener('keydown', (e) => {
      if (!this.keys[e.code]) this.pressedQueue.add(e.code);
      this.keys[e.code] = true;
      for (const cb of this.anyListeners) cb(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
    });
    addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    this.pressed = new Set();
  }

  // chamar uma vez por frame, no começo do loop
  beginFrame() {
    this.pressed = this.pressedQueue;
    this.pressedQueue = new Set();
  }

  down(...codes) { return codes.some((c) => this.keys[c]); }
  justPressed(...codes) { return codes.some((c) => this.pressed.has(c)); }

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
