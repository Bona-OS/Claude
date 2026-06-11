#!/usr/bin/env bash
# Baixa as artes geradas no Higgsfield para uso local (offline).
# Rode a partir desta pasta: bash download.sh
set -euo pipefail
cd "$(dirname "$0")"

BASE="https://d8j0ntlcm91z4.cloudfront.net/user_3Cs6n4P9VtDQBLcqUPlxk1nSd2p"

curl -f -o ref-barra.png   "$BASE/hf_20260611_160407_f39e9e8a-dd04-43e9-97e9-20d6dd0d8c44.png"
curl -f -o mirmecia.png    "$BASE/hf_20260611_160422_93ca2d36-5579-4050-ab03-bfa2ff50ab2b.png"
curl -f -o ref-capim.png   "$BASE/hf_20260611_160430_3ac06577-80b5-41aa-9ff7-1eee69d3eb43.png"
curl -f -o title.png       "$BASE/hf_20260611_160441_f64516ba-7868-45e1-a5fe-451ea23f52c4.png"
curl -f -o tarso-sheet.png "$BASE/hf_20260611_160452_18109848-7acf-4240-8f2d-58785fbc010c.png"

echo "✦ Assets baixados com sucesso."
