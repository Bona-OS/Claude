#!/usr/bin/env bash
# Baixa as artes geradas no Higgsfield para uso local (offline).
# Rode a partir desta pasta: bash download.sh
set -euo pipefail
cd "$(dirname "$0")"

BASE="https://d8j0ntlcm91z4.cloudfront.net/user_3Cs6n4P9VtDQBLcqUPlxk1nSd2p"

# leva 1 — direção visual cinematográfica (vertical slice)
curl -f -o ref-barra.png    "$BASE/hf_20260611_160407_f39e9e8a-dd04-43e9-97e9-20d6dd0d8c44.png"
curl -f -o mirmecia.png     "$BASE/hf_20260611_160422_93ca2d36-5579-4050-ab03-bfa2ff50ab2b.png"
curl -f -o ref-capim.png    "$BASE/hf_20260611_160430_3ac06577-80b5-41aa-9ff7-1eee69d3eb43.png"
curl -f -o title.png        "$BASE/hf_20260611_160441_f64516ba-7868-45e1-a5fe-451ea23f52c4.png"
curl -f -o tarso-sheet.png  "$BASE/hf_20260611_160452_18109848-7acf-4240-8f2d-58785fbc010c.png"

# leva 2 — pixel-art 16-bit (expansão FFV)
curl -f -o px-worldmap.png  "$BASE/hf_20260611_195856_f266e6a7-93a5-4799-96af-1b42a1958f2f.png"
curl -f -o px-title.png     "$BASE/hf_20260611_195858_11234f63-3c22-43c1-9718-b6c453b50d3c.png"
curl -f -o px-lineup.png    "$BASE/hf_20260611_195917_44d8da9a-e23e-4eab-a515-aa82ade14345.png"
curl -f -o px-card-track.png  "$BASE/hf_20260611_195942_25fa81b5-cc73-42d0-9cd7-5c433ca90305.png"
curl -f -o px-card-world.png  "$BASE/hf_20260611_195943_1afb448a-5ae0-4a3b-b5ee-e91e5f0703d6.png"
curl -f -o px-card-fight.png  "$BASE/hf_20260611_195951_0216cb99-18ec-4435-8813-3f246532ad64.png"
curl -f -o px-card-arcade.png "$BASE/hf_20260611_195952_0b6126dc-4b50-4c9f-b649-1aae8b9de0ef.png"

echo "✦ Assets baixados com sucesso."
