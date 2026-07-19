// HUD moderno "vidro sobre pixel" (contraste HD-2D): painéis translúcidos
// nítidos, tipografia de sistema, corações desenhados, chips do grupo e
// diálogo com tag de nome. A API é a mesma de sempre — as fases só passam
// strings; o HUD é quem as veste.

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const HEART = (on) => `<svg class="hp ${on ? 'on' : 'off'}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21S4 15.6 4 9.9A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8 3.3C20 15.6 12 21 12 21z"/></svg>`;

// teclas viram <kbd> (só tokens de tecla conhecidos, com fronteira de palavra)
const kbdify = (s) => s.replace(/(^|[\s·(])((?:ENTER|ESPAÇO|SHIFT|WASD|ESC|1-5|[RQEMXP]))(?=$|[\s·)+,.])/g, (_, a, k) => `${a}<kbd>${k}</kbd>`);

// veste a linha de status: ❤/♡ → corações SVG, x/y → contador, PALAVRAS → rótulo
function dressStatus(text) {
  let h = esc(text);
  h = h.replace(/❤/g, HEART(true)).replace(/♡/g, HEART(false));
  h = h.replace(/(\d+)\s*\/\s*(\d+)/g, '<b>$1</b><i class="of">/$2</i>');
  h = h.replace(/(^|\s)([A-ZÀ-Ú]{3,})(?=\s|$)/g, '$1<span class="lbl">$2</span>');
  h = h.replace(/·/g, '<i class="dot">·</i>');
  return kbdify(h);
}

export class HUD {
  constructor() {
    const ui = document.getElementById('ui');
    ui.innerHTML = `
      <div id="hud-top">
        <div class="panel" id="hud-objective"></div>
        <div class="panel" id="hud-status"></div>
      </div>
      <div id="hud-party"></div>
      <div class="panel" id="hud-message"></div>
      <div id="hud-card" class="hidden">
        <div class="panel card-inner">
          <div class="card-type"></div>
          <div class="card-name"></div>
          <div class="card-objective"></div>
          <div class="card-hint"><kbd>ENTER</kbd> começar</div>
        </div>
      </div>
      <div id="hud-result" class="hidden">
        <div class="result-inner">
          <div class="result-title"></div>
          <div class="result-text"></div>
          <div class="result-hint"></div>
        </div>
      </div>
      <div id="danger-vignette"></div>
    `;
    this.$ = (sel) => ui.querySelector(sel);
    this.msgTimeout = null;
    this._lastStatus = '';
    this.hide('#hud-message');
  }

  show(sel) { this.$(sel).classList.remove('hidden'); }
  hide(sel) { this.$(sel).classList.add('hidden'); }

  // "3. As Montanhas" / "5/10 · Nome — TRACK": número vira chip dourado
  setObjective(text) {
    const el = this.$('#hud-objective');
    const m = String(text).match(/^\s*(\d+(?:\/\d+)?)\s*[.·]\s*(.*)$/);
    el.innerHTML = m ? `<span class="chipno">${esc(m[1])}</span><span>${esc(m[2])}</span>` : esc(text);
    el.classList.toggle('hidden', !text);
  }

  // ex.: setStatus('PETALAS 1/3   FRUTAS 0/2   ❤❤♡')
  setStatus(text) {
    const el = this.$('#hud-status');
    el.innerHTML = dressStatus(text);
    el.classList.toggle('hidden', !text);
    if (text !== this._lastStatus) {
      this._lastStatus = text;
      el.classList.remove('pop');
      void el.offsetWidth; // re-dispara a animação
      el.classList.add('pop');
    }
  }

  hearts(n, max) { return '❤'.repeat(Math.max(0, n)) + '♡'.repeat(Math.max(0, max - n)); }

  // diálogo lower-third; "Nome: — fala" e "Nome (nota): — fala" ganham tag
  say(text, { danger = false, time = 3500 } = {}) {
    const el = this.$('#hud-message');
    const m = String(text).match(/^([A-ZÀ-Ú][\wÀ-ú]{1,12})(\s*\([^)]{1,28}\))?:\s*(.+)$/s);
    el.innerHTML = m
      ? `<span class="who">${esc(m[1])}${m[2] ? esc(m[2]) : ''}</span>${esc(m[3]).replace(/\n|<br\s*\/?>/g, '<br/>')}`
      : esc(text).replace(/&lt;br\s*\/?&gt;/g, '<br/>');
    el.classList.toggle('danger', danger);
    el.classList.remove('hidden');
    clearTimeout(this.msgTimeout);
    this.msgTimeout = setTimeout(() => el.classList.add('hidden'), time);
  }

  danger(active) { this.$('#danger-vignette').classList.toggle('active', active); }

  // chips circulares do grupo: cor do herói + número; o líder expande o nome
  party(members, activeId) {
    const root = this.$('#hud-party');
    root.innerHTML = members.map((m) => `
      <div class="chip ${m.id === activeId ? 'active' : ''}">
        <span class="ring" style="--c:${esc(m.color)}">${m.id}</span>
        <span class="pname">${esc(m.name)}</span>
      </div>`).join('');
  }
  hideParty() { this.$('#hud-party').innerHTML = ''; }

  // cartão de intro da fase, com a vista pintada ao fundo quando houver
  card(phase, artUrl) {
    this.$('#hud-card .card-type').textContent = `— ${phase.type.toUpperCase()} —`;
    this.$('#hud-card .card-name').textContent = phase.name;
    this.$('#hud-card .card-objective').textContent = phase.objective;
    this.$('#hud-card').style.backgroundImage = artUrl
      ? `linear-gradient(rgba(6,9,15,.55), rgba(6,9,15,.72)), url('${artUrl}')`
      : '';
    this.show('#hud-card');
  }
  hideCard() { this.hide('#hud-card'); }

  result(title, text, hint, artUrl) {
    const root = this.$('#hud-result');
    root.classList.toggle('lose', /derrota/i.test(title));
    this.$('#hud-result .result-title').textContent = title;
    this.$('#hud-result .result-text').innerHTML = text;
    this.$('#hud-result .result-hint').innerHTML = kbdify(esc(hint));
    root.style.backgroundImage = artUrl
      ? `linear-gradient(rgba(6,9,15,.6), rgba(6,9,15,.78)), url('${artUrl}')`
      : '';
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
