# Os Cinco de Lata — A Barra de Ferro

Vertical slice jogável do Capítulo 1 do livro *Os Cinco de Lata*, de
Pedro de Jesus Ceni Bedin. Browser game 3D (Three.js), sem build, sem landing
page — a primeira tela já é o jogo.

## Como rodar

Por usar ES modules, precisa de um servidor local (qualquer um):

```bash
cd games/os-cinco-de-lata
python3 -m http.server 8000
# abra http://localhost:8000
```

(ou `npx serve .`, ou a extensão Live Server do VS Code.)

O Three.js já vem embutido em `vendor/` — o jogo roda offline. As artes do
Higgsfield carregam do CDN deles; para tê-las locais: `bash assets/download.sh`
(sem elas o jogo usa placeholders procedurais e continua jogável).

## O jogo

Você é **Tarso**. Atravesse a barra de ferro gigante, colete as **5 lascas de
papel de prata** ("pedaços de lua derretida") e chegue ao fim da barra, onde o
capim se abre para a vista de **Mirmécia**.

Mas a barra fica exposta demais — Ávio avisou. Quando ele gritar **"SOMBRA!"**,
você tem ~3 segundos para entrar num **buraco de rebite** antes do bote do
pássaro. Cada bote a descoberto custa um coração. Três corações e acabou.

| Controle | Ação |
|---|---|
| WASD / setas | mover |
| Shift | correr |
| Espaço | pular |
| R (no fim de jogo) | reiniciar |

## O que foi feito

- **Núcleo definido**: aventura/coleta 3D, loop de 30s (correr → coletar →
  esconder da Sombra), vitória/derrota claras.
- **Protótipo Three.js**: barra de ferro enferrujada com flanges e manchas,
  buracos de rebite funcionais (abrigo), selva de capim com 340 lâminas
  balançando, personagem em primitivas com armadura PBR metálica (papel de
  prata), câmera em terceira pessoa com lerp, pulo/gravidade, colisão por
  proximidade, HUD mínimo (lascas, corações, falas dos personagens).
- **Direção visual via Higgsfield MCP**: 3 referências de mundo, 1 tela-título
  com tipografia, 1 model sheet do Tarso — todas seguindo o Prompt Mestre da
  saga (FF Tactics × Minimoys × chiaroscuro). Prompts documentados em
  [`docs/PROMPTS.md`](docs/PROMPTS.md).
- **Integração das referências**: paleta do jogo (ferrugem `#8a3b22`, pôr do
  sol `#d98a4f`, capim `#3d6b23`) extraída das imagens; backdrop de Mirmécia
  usa a arte gerada (com fallback procedural offline); tela de vitória usa a
  key art de título.
- **Eventos**: ciclo da Sombra (aviso → sombra crescendo no chão → mergulho do
  pássaro → checagem de abrigo), falas do livro como mensagens de jogo.

## Próximos upgrades possíveis

1. **Trovão**: desbloquear a lagartixa como montaria na segunda metade da barra
   (mais rápida, mas não cabe nos buracos — troca de risco).
2. **Trocar primitivas por sprites/billboards** gerados do model sheet do
   Tarso, ou modelos low-poly inspirados nele.
3. **Fase 2 — Pra Baixo**: o escorregador de raiz para dentro de Mirmécia
   (Capítulo 2), com as montanhas de pétalas.
4. **Áudio**: vento no capim, o *clang* do bico, corneta de Mirmécia ao vencer.
5. **Os outros quatro**: Brio, Tino, Garra e Ávio seguindo o jogador em fila
   (boids simples) — e cada um perdível/resgatável.
6. **Mobile**: controles de toque (joystick virtual).
