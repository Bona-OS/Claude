#!/usr/bin/env bash
# Bridge Drive -> claude /ultracode  (Mac Mini de Bona)
# Puxa missoes de Drive:Jarvis-CloudBridge/inbox, roda claude em /ultracode, devolve recibos.
# Codex: ajuste DRIVE_REMOTE/DRIVE_PULL/DRIVE_PUSH ao mecanismo de Drive do backup.
set -euo pipefail

WORK="/Users/bonaos/wiki/control/cloud-bridge"
INBOX="$WORK/inbox"; OUTBOX="$WORK/outbox"; DONE="$WORK/done"; LOG="$WORK/bridge.log"
MARKER="# JARVIS-ULTRACODE-MISSION"
DRIVE_REMOTE="${DRIVE_REMOTE:-gdrive:Jarvis-CloudBridge}"   # rclone remote OU caminho do Drive Desktop
mkdir -p "$INBOX" "$OUTBOX" "$DONE"

log(){ echo "$(date '+%F %T') $*" >>"$LOG"; }

# 1) PULL missoes do Drive (ajuste conforme seu setup)
DRIVE_PULL="${DRIVE_PULL:-rclone copy $DRIVE_REMOTE/inbox "$INBOX"}"
eval "$DRIVE_PULL" 2>>"$LOG" || log "WARN: pull falhou"

shopt -s nullglob
for m in "$INBOX"/*.md; do
  # 2) GATE: so missoes com o marcador correto
  if ! head -n1 "$m" | grep -qF "$MARKER"; then
    log "SKIP sem marcador: $m"; mv "$m" "$DONE/"; continue
  fi
  id="ultracode-$(date +%Y%m%d-%H%M%S)"
  out="$OUTBOX/$id"; mkdir -p "$out"
  cp "$m" "$out/mission.md"
  log "RUN $id <- $(basename "$m")"

  # 3) Roda claude em /ultracode. A missao e' PROMPT, nunca shell.
  #    (ultracode habilitado na config do claude; -p = nao-interativo)
  if claude -p "$(cat "$m")" >"$out/result.md" 2>>"$LOG"; then
    echo "status: ok" >"$out/receipt.md"
  else
    echo "status: failed (ver bridge.log)" >"$out/receipt.md"
  fi
  {
    echo "run_id: $id"; echo "started: $(date '+%F %T')"
    echo "mission: $(basename "$m")"; echo "host: $(scutil --get LocalHostName 2>/dev/null || hostname)"
  } >>"$out/receipt.md"
  ( cd "$out" && shasum -a 256 ./* >SHA256SUMS 2>/dev/null || true )
  mv "$m" "$DONE/"

  # 4) PUSH recibos de volta ao Drive
  DRIVE_PUSH="${DRIVE_PUSH:-rclone copy "$out" $DRIVE_REMOTE/outbox/$id}"
  eval "$DRIVE_PUSH" 2>>"$LOG" || log "WARN: push falhou ($id)"
  log "DONE $id"
done
