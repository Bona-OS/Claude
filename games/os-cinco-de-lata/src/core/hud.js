// HUD estilo menu de Final Fantasy V: caixas azul-gradiente com borda
// branca dupla, fonte pixel. Todo o DOM é criado aqui dentro de #ui.

export class HUD {
  constructor() {
    const ui = document.getElementById('ui');
    ui.innerHTML = `
      <div id="hud-top">
        <div class="ffv-box" id="hud-objective"></div>
        <div class="ffv-box" id="hud-status"></div>
      </div>
      <div id="hud-party"></div>
      <div class="ffv-box" id="hud-message"></div>
      <div id="hud-card" class="hidden">
        <div class="ffv-box card-inner">
          <div class="card-type"></div>
          <div class="card-name"></div>
          <div class="card-objective"></div>
          <div class="card-hint">ENTER para começar</div>
        </div>
      </div>
      <div id="hud-result" class="hidden">
        <div class="ffv-box result-inner">
          <div class="result-title"></div>
          <div class="result-text"></div>
          <div class="result-hint"></div>
        </div>
      </div>
      <div id="danger-vignette"></div>
    `;
    this.$ = (sel) => ui.querySelector(sel);
    this.msgTimeout = null;
    this.hide('#hud-message');
  }

  show(sel) { this.$(sel).classList.remove('hidden'); }
  hide(sel) { this.$(sel).classList.add('hidden'); }

  setObjective(text) {
    const el = this.$('#hud-objective');
    el.textContent = text;
    el.classList.toggle('hidden', !text);
  }

  // ex.: setStatus('✦ 3/5   ❤❤❤') — uma linha compacta estilo FFV
  setStatus(text) {
    const el = this.$('#hud-status');
    el.textContent = text;
    el.classList.toggle('hidden', !text);
  }

  hearts(n, max) { return '❤'.repeat(Math.max(0, n)) + '♡'.repeat(Math.max(0, max - n)); }

  say(text, { danger = false, time = 3500 } = {}) {
    const el = this.$('#hud-message');
    el.textContent = text;
    el.classList.toggle('danger', danger);
    el.classList.remove('hidden');
    clearTimeout(this.msgTimeout);
    this.msgTimeout = setTimeout(() => el.classList.add('hidden'), time);
  }

  danger(active) { this.$('#danger-vignette').classList.toggle('active', active); }

  // retratos dos cinco com o líder destacado
  party(members, activeId) {
    const root = this.$('#hud-party');
    root.innerHTML = members.map((m) => `
      <div class="ffv-box portrait ${m.id === activeId ? 'active' : ''}">
        <span class="dot" style="background:${m.color}"></span>${m.id}·${m.name}
      </div>`).join('');
  }
  hideParty() { this.$('#hud-party').innerHTML = ''; }

  // cartão de intro da fase (FFV style)
  card(phase) {
    this.$('#hud-card .card-type').textContent = `— ${phase.type.toUpperCase()} —`;
    this.$('#hud-card .card-name').textContent = phase.name;
    this.$('#hud-card .card-objective').textContent = phase.objective;
    this.show('#hud-card');
  }
  hideCard() { this.hide('#hud-card'); }

  result(title, text, hint) {
    this.$('#hud-result .result-title').textContent = title;
    this.$('#hud-result .result-text').innerHTML = text;
    this.$('#hud-result .result-hint').textContent = hint;
    this.show('#hud-result');
  }
  hideResult() { this.hide('#hud-result'); }

  clear() {
    this.setObjective('');
    this.setStatus('');
    this.hideParty();
    this.hideCard();
    this.hideResult();
    this.danger(false);
    this.hide('#hud-message');
  }
}
