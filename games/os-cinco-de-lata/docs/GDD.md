# GDD — Os Cinco de Lata: Do Capim ao Grande Rio

Jogo 3D pixelado (estilo Final Fantasy V) baseado no livro de
Pedro de Jesus Ceni Bedin. Browser game Three.js, sem build para jogar.

## Estrutura

Mapa-múndi estilo FFV com 10 nós ligados por caminho pontilhado. Fases
liberam em sequência; progresso e recordes salvos em `localStorage`.

## Controles

| Tecla | Ação |
|---|---|
| ←/→ (no mapa) | viajar entre fases liberadas |
| ENTER (no mapa) | entrar na fase |
| 1–5 | trocar o líder (Tarso, Brio, Tino, Garra, Ávio) |
| WASD / setas | mover |
| SHIFT | correr / investir / agachar (stealth) |
| ESPAÇO | pular / martelar (forja) |
| E | habilidade do líder |
| M | som on/off |
| P | pixelização on/off (debug) |
| ESC | voltar ao mapa |
| R | repetir fase (no resultado) |

## Os cinco

| # | Personagem | Perfil | Habilidade |
|---|---|---|---|
| 1 | Tarso | equilibrado | espadada (E) |
| 2 | Brio | +25% veloz, pulo +30% | atravessa rápido |
| 3 | Tino | médio | Cuspe-Espinho: tiro (E) |
| 4 | Garra | lento e forte | escudo: segure E parado (bloqueia tudo) |
| 5 | Ávio | médio | vigia: avisos de perigo ~1,5s antes |

## As 10 fases

| # | Fase | Tipo | Capítulo | Vitória | Derrota |
|---|---|---|---|---|---|
| 1 | A Barra de Ferro | track | 1 | 5 lascas + fim da barra | 3 botes da Sombra |
| 2 | Pra Baixo | arcade | 2 | pousar nas pétalas | 3 batidas nos anéis de raiz |
| 3 | Montanhas de Pétalas | world | 2 | 3 pétalas-mapa + fuga | visto 3× pelas sentinelas |
| 4 | O Resgate de Trovão | world | 3 | pedras (Garra) + alavanca (Tino) + escolta | — (puzzle sem morte) |
| 5 | A Corrida no Capim | track | 3-4 | ≥6/8 anéis antes do tempo | tempo esgotado / <6 anéis |
| 6 | O Ventre do Dragão | track | 4 | alcançar a luz | parede de carne alcança / 3 batidas |
| 7 | A Escama do Dragão | arcade | 5 | 8 marteladas no ritmo + 5 alvos | 6 erros de ritmo |
| 8 | O Grande Rio | arcade | 6 | chegar à outra margem | 3 colisões/Leviatã |
| 9 | As Três Hostes | fight | 9-10 | sobreviver às 3 ondas | 0 corações ou estandarte destruído |
| 10 | Os Portões de Mirmécia | fight | 10-13 | romper linhas + 3 bloqueios em Élitra | 0 corações |

## Trilha sonora (procedural, WebAudio)

Sonoridade folk britânica/escocesa, mood positivo. Drone de gaita (quinta,
saws desafinados), melodia quadrada com vibrato (modos mixolídio/dórico),
harpa em arpejo, bodhrán de ruído filtrado, eco curto de "salão".

| Tema | Onde toca | Caráter |
|---|---|---|
| worldmap | mapa-múndi | jig 6/8 alegre em Ré mixolídio |
| track | fases 1, 5, 6 | reel rápido |
| arcade | fases 2, 7, 8 | pentatônica saltitante |
| world | fases 3, 4 | calmo, exploração |
| fight | fases 9, 10 | dórico marcial |
| fanfarra / lamento | vitória / derrota | não-loop |

## Pipeline visual

Render 3D em 480×270 → quantização para paleta de 32 cores (ferrugem,
ouro, capim, prata, azuis FFV) + dithering Bayer 4×4 → upscale nearest
pelo CSS. HUD com caixas azul-gradiente FFV e fonte Press Start 2P.
