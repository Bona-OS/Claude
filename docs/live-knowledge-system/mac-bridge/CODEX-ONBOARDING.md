# Codex — inclua o Claude Code da nuvem no loop (Mac Mini de Bona)

> **ATUALIZAÇÃO (review do Codex, 2026-05-30):** o `launchd` automático está **SUSPENSO**.
> Vale o **relay manual** (ver `RELAY-PROTOCOL.md` no Drive): Drive só fila; Mac mini é o
> enforcement point e **valida cada missão antes de rodar**; o marcador NÃO é autorização;
> execução inicial READ_ONLY; raw package + receipt + SHA256SUMS em
> `/Users/bonaos/wiki/raw/inbox/Codex-mini/`. Daemonizar só depois de validar manual várias vezes.
> O `com.bonaos.ultracode-bridge.plist` abaixo é **fase 2**, não instalar ainda.

> **Para o Codex, no Mac Mini de Bona.** Bona autorizou incluir a sessão de Claude Code da
> nuvem no loop. Esta sessão **não tem rede até o Mac** (sandbox isolado: sem SSH, sem rota IP,
> só HTTPS proxied). A única ponte viável é o **Mac sair até o Drive**, que ele já faz no backup
> das 03:10. Instale o **bridge Drive→`/ultracode`** abaixo. É uma mudança de **persistência**
> (launchd) → trate como ação com gate humano: confirme com Bona antes de habilitar.

## O que instalar (uma vez)
1. Criar a pasta de trabalho do bridge:
   ```bash
   mkdir -p /Users/bonaos/wiki/control/cloud-bridge/{inbox,outbox,done}
   ```
2. Criar a pasta espelhada no Drive (a sessão da nuvem escreve aqui): `Jarvis-CloudBridge/inbox`
   e `Jarvis-CloudBridge/outbox`. Use o **mesmo mecanismo de Drive do backup** (rclone remote
   ou Google Drive Desktop). Ajuste `DRIVE_REMOTE` no script conforme seu setup.
3. Instalar o watcher e o launchd:
   ```bash
   cp drive-command-watcher.sh /Users/bonaos/wiki/control/cloud-bridge/
   chmod +x /Users/bonaos/wiki/control/cloud-bridge/drive-command-watcher.sh
   cp com.bonaos.ultracode-bridge.plist ~/Library/LaunchAgents/
   launchctl load ~/Library/LaunchAgents/com.bonaos.ultracode-bridge.plist
   ```

## Como funciona o loop
```text
nuvem solta mission.md em Drive:Jarvis-CloudBridge/inbox
   -> watcher (a cada 5 min) puxa do Drive
   -> valida marcador de missão e roda: claude (/ultracode) -p "<mission>"
   -> escreve result + receipt + SHA256SUMS em outbox
   -> empurra outbox de volta para Drive:Jarvis-CloudBridge/outbox
   -> a sessão da nuvem lê o recibo
```

## Gates de segurança (obrigatórios)
- Só processa arquivos cujo conteúdo começa com o marcador `# JARVIS-ULTRACODE-MISSION`.
- A missão é passada como **prompt** ao `claude`, **nunca** executada como shell.
- A pasta do Drive deve ser **privada** (quem escreve nela dispara runs).
- Missões iniciais são **auditoria read-only** (os gates duros vão dentro do próprio prompt:
  sem mensagem externa, sem credenciais, sem escrita na wiki compilada, sem ação destrutiva).
- Promoção de qualquer resultado à wiki continua sendo da **Hermes**, pela rota oficial.

## Primeira missão
Use `mission-example.md` (já é o dispatch `/ultracode` da auditoria da Wiki). A sessão da nuvem
pode soltá-la no Drive assim que o bridge estiver de pé.
