# Os Cinco de Lata — Do Capim ao Grande Rio

Jogo 3D **pixelado estilo Final Fantasy V**, baseado no livro *Os Cinco de
Lata*, de Pedro de Jesus Ceni Bedin. 10 fases num mapa-múndi, os cinco
personagens jogáveis, trilha sonora celta de sintetizador gerada em código.
A primeira tela já é o jogo — sem landing page.

## Como rodar

**Jeito mais fácil (Mac/qualquer um):** abra `dist/os-cinco-de-lata.html`
com dois cliques. Tudo embutido (Three.js, fonte, música procedural).

**Modo desenvolvimento:**
```bash
cd games/os-cinco-de-lata
python3 -m http.server 8000   # abra http://localhost:8000
```

Para regenerar o arquivo único: `node scripts/build-dist.mjs`.
As artes do Higgsfield carregam do CDN (fallback procedural offline);
cópias locais: `bash assets/download.sh`.

## O jogo

A jornada completa do livro, do Capítulo 1 ao 13: a Barra de Ferro, a
queda Pra Baixo, as Montanhas de Pétalas, o Resgate de Trovão, a Corrida
no Capim, o Ventre do Dragão, a forja da Escama, o Grande Rio, as Três
Hostes e os Portões de Mirmécia — com o epílogo *A Casa ao Lado*.

Controles e detalhes de cada fase: [`docs/GDD.md`](docs/GDD.md).
Essencial: **←/→ + ENTER** no mapa, **1-5** troca o líder, **WASD** move,
**E** habilidade, **M** som.

## O que foi feito

- **Pipeline pixel FFV** (`src/core/pixel.js`): render 480×270, paleta de
  32 cores, dithering Bayer 4×4, upscale nearest — tecla P compara com/sem.
- **Trilha celta procedural** (`src/core/audio.js`): jig 6/8, drone de
  gaita, harpa, bodhrán — 5 temas + fanfarra/lamento, zero arquivos.
- **Os 5 jogáveis** (`src/core/party.js`): troca de líder, fila de
  seguidores, stats e habilidades distintas por personagem.
- **Mapa-múndi FFV** (`src/world/worldmap.js`) com progressão salva.
- **10 fases** (`src/phases/`) nos 4 tipos (track/arcade/world/fight),
  todas com vitória/derrota e falas do livro.
- **Direção visual Higgsfield**: 12 artes (5 cinematográficas + 7
  pixel-art 16-bit) — prompts documentados em [`docs/PROMPTS.md`](docs/PROMPTS.md).

## Próximos upgrades possíveis

1. Cartões de intro únicos por fase (prompts prontos no PROMPTS.md).
2. Sprites billboard dos personagens a partir do `px-lineup.png`.
3. Chefes extras: a Grande Serpe e o Dragão dos Gigantes como fases bônus.
4. Controles de toque (mobile) e gamepad.
5. Modo "Livro 2": a faísca de Élitra (gancho da sequência).
