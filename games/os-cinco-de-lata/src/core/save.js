// Progresso em localStorage: fases liberadas/completas e recordes.

const KEY = 'os-cinco-de-lata-save-v1';

const DEFAULTS = { unlocked: 1, completed: {}, best: {} };

export class Save {
  constructor() {
    try {
      this.data = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
    } catch {
      this.data = { ...DEFAULTS };
    }
  }

  _write() {
    try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch { /* modo privado */ }
  }

  isUnlocked(phaseId) { return phaseId <= this.data.unlocked; }
  isCompleted(phaseId) { return !!this.data.completed[phaseId]; }

  complete(phaseId, score) {
    this.data.completed[phaseId] = true;
    if (phaseId + 1 > this.data.unlocked) this.data.unlocked = Math.min(10, phaseId + 1);
    if (score != null) {
      const prev = this.data.best[phaseId];
      if (prev == null || score > prev) this.data.best[phaseId] = score;
    }
    this._write();
  }

  best(phaseId) { return this.data.best[phaseId]; }

  reset() { this.data = { ...DEFAULTS, completed: {}, best: {} }; this._write(); }
}
