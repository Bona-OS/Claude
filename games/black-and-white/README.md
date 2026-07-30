# Deus do Vale 🖐⚡🐄

Um mini *god game* em um único arquivo HTML — homenagem a **Black & White**
(Lionhead Studios, 2001), aquele em que você era um deus com uma mão gigante,
uma criatura colossal e um povo que rezava (por amor… ou por medo).

## Como jogar

Abra o `index.html` em qualquer navegador moderno. Sem build, sem dependências.

```bash
# opcional: servir localmente
npx serve games/black-and-white
```

## Mecânicas

| Sistema | Como funciona |
|---|---|
| ✋ Mão de Deus | Seu cursor. Segure e arraste aldeões, árvores e comida; solte com força para arremessar. Jogar aldeão no mar é maldade (e conta como tal). |
| 🙏 Crença | Aldeões rezando no templo geram Crença — a energia dos milagres. Deuses malignos colhem mais crença (medo); deuses bondosos têm população que cresce mais rápido (amor). |
| 🌾 Economia | Chuva molha as plantações → colheita vira comida → comida vira novos aldeões. Sem comida, o povo passa fome. |
| ✨ Milagres | 🍞 Comida, 🌧️ Chuva e 🌳 Floresta puxam você para o **Bem**; ⚡ Relâmpago e 🔥 Bola de Fogo para o **Mal**. O mundo muda de cor com seu alinhamento. |
| 🐄 Criatura | Age sozinha: rega plantações, dança no templo (gera crença), come o estoque ou assusta aldeões. Depois de cada ação, **acaricie** (segure e esfregue) para incentivar ou dê um **tapa** (clique rápido) para reprimir — ela aprende e as tendências mudam (painel à direita). Se você recompensar maldade demais… ela começa a devorar gente. |
| 🔥 Fogo | Se espalha por árvores e casas; chuva apaga. Casas queimadas são reconstruídas com o tempo. |
| 🌙 Dia e noite | Ciclo de 90 segundos, com estrelas e o orbe do templo pulsando à noite. |

## Controles

- **Mouse** — mão divina (segurar/arrastar/arremessar, acariciar, tapa)
- **1–6** — troca de ferramenta/milagre
- **Esc** — volta para a mão
- **H** — ajuda

Tudo desenhado em canvas 2D, sons sintetizados com WebAudio, zero assets externos.
