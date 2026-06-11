# Direção visual — prompts Higgsfield

Todas as imagens foram geradas via Higgsfield MCP em 2026-06-11, seguindo o
**Prompt Mestre** do Plano Mestre da saga (pasta "Os cinco de lata" no Drive):

> *fusão do estilo de Final Fantasy Tactics com a escala macro de Arthur e os
> Minimoys, iluminação chiaroscuro dramática, altamente detalhado.*

| Arquivo | Modelo | Job ID | Uso no jogo |
|---|---|---|---|
| `ref-barra.png` | soul_location | `f39e9e8a-dd04-43e9-97e9-20d6dd0d8c44` | Referência de mundo (barra de ferro + capim) — guiou cores/atmosfera da cena |
| `mirmecia.png` | soul_location | `93ca2d36-5579-4050-ab03-bfa2ff50ab2b` | Backdrop da vista de Mirmécia no fim da barra |
| `ref-capim.png` | soul_location | `3ac06577-80b5-41aa-9ff7-1eee69d3eb43` | Referência da selva de capim + sombra do pássaro |
| `title.png` | nano_banana_pro | `f64516ba-7868-45e1-a5fe-451ea23f52c4` | Tela-título / fundo da tela de vitória |
| `tarso-sheet.png` | nano_banana_pro | `18109848-7acf-4240-8f2d-58785fbc010c` | Model sheet do Tarso (referência para o modelo 3D) |

CDN base: `https://d8j0ntlcm91z4.cloudfront.net/user_3Cs6n4P9VtDQBLcqUPlxk1nSd2p/`
(arquivos `hf_20260611_16XXXX_<job-id>.png`). Para cópias locais: `bash assets/download.sh`.

## Prompts completos

### 1. A Barra de Ferro (`ref-barra.png`)
```
A colossal rusted iron beam crossing a jungle of giant green grass blades like a
bridge of forgotten gods, five tiny child warriors in crumpled aluminum foil armor
marching in single file on its red rusty surface, round rivet holes in the metal,
golden sunset light, fusion of Final Fantasy Tactics character art style and Arthur
and the Invisibles macro scale, dramatic chiaroscuro lighting, highly detailed,
epic fantasy macro scale
```

### 2. A Visão de Mirmécia (`mirmecia.png`)
```
A colossal subterranean ant-city built inside a valley of giant grass, towers made
of earth and amber rising in impossible spirals, thousands of bright flower petal
flags in red gold and blue fluttering on balconies, rows of soldier ants with
gleaming carapaces in tight formation on the ramps, cinematic wide shot at golden
dusk, dramatic chiaroscuro lighting, epic fantasy macro scale, fusion of Final
Fantasy Tactics art style and Arthur and the Invisibles macro scale, highly detailed
```

### 3. A Selva de Capim / a Sombra (`ref-capim.png`)
```
View from inside a dense jungle of giant grass blades taller than castle towers,
swaying green walls, warm golden sunset light filtering through the blades, a huge
dark bird shadow sweeping across a rusty iron surface below, sense of danger from
the hungry blue sky above, macro scale fantasy, dramatic chiaroscuro lighting,
fusion of Final Fantasy Tactics art style and Arthur and the Invisibles macro
scale, highly detailed
```

### 4. Tela-título (`title.png`)
```
Epic video game title screen key art with the title text "OS CINCO DE LATA" in
elegant weathered serif metallic letters. A cinematic low-angle shot of five tiny
miniature child warriors walking in single file on a giant rusted iron beam,
wearing armor made of crumpled aluminum foil, the leader pointing a crooked rusty
iron splinter sword forward, surrounded by a dense jungle of giant green grass
blades swaying in the wind, golden sunset lighting, epic fantasy macro scale,
dramatic chiaroscuro, fusion of Final Fantasy Tactics art style and Arthur and the
Invisibles macro scale, highly detailed
```

### 5. Model sheet do Tarso (`tarso-sheet.png`)
```
Character design concept sheet of a tiny warrior boy named Tarso, leader of five
orphans. He wears crumpled aluminum foil armor with a dented foil helmet, holds a
crooked rusty iron splinter sword, confident audacious hungry smile of someone who
never had anything and therefore wants everything. Multiple angles: front, side,
back. Final Fantasy Tactics character design style, clean white background, game
concept art sheet, highly detailed
```

## Prompts prontos para gerar depois (próxima leva)

- **Trovão (a lagartixa montaria):** `Concept art sheet of a giant gecko lizard
  wearing heavy war barding made of dark dragon scales and iron caps on its teeth,
  saddled for miniature riders, dynamic action poses and side profile, RPG mount
  design, highly detailed, white background`
- **O pássaro (a Sombra):** `A monstrous hungry bird of prey diving low over a
  giant rusted iron beam at sunset, enormous wings cutting the sun, seen from the
  perspective of tiny warriors on the beam, dramatic backlit silhouette,
  chiaroscuro, macro scale fantasy, highly detailed`
- **Buraco de rebite (abrigo):** `Interior of a perfectly round rivet crater in a
  colossal rusted iron beam, five tiny warriors in crumpled foil armor huddled in
  the reddish darkness, a sliver of golden light entering from above, dramatic
  chiaroscuro, macro scale fantasy`
