# Live Knowledge System — rascunhos lado-nuvem (Motor B)

Artefatos produzidos pela sessão Claude Code on the web a partir da leitura read-only do
backup do Drive `live-knowledge-system-20260530-031007.zip` (hash conferido) e do manual.
São **baseline/rascunho**: a versão canônica é produzida pelo run `/ultracode` no Mac e
salva em `/Users/bonaos/wiki/raw/inbox/Claude-Code/<run-id>/`, depois promovida pela Hermes.

| Arquivo | O que é |
|---|---|
| `dispatch-ultracode.md` | Prompt pronto para o Codex disparar o `claude /ultracode` no Mac |
| `COMPREENSAO-WIKI.md` | Dossiê de compreensão (arquitetura + parte Claude Code), com fronteira cloud/Mac |
| `DIVERGENCIAS-WIKI.md` | Reconciliação multi-superfície: achados de nuvem + esqueleto [só-Mac] |
| `CLAUDE.bootstrap.md` | Rotina durável de bootstrap para toda sessão de Claude Code |

## `mac-bridge/` — incluir o Claude Code da nuvem no loop (via Codex)
Como esta sessão na nuvem não tem rede até o Mac (sem SSH/rota IP; só HTTPS proxied), o gatilho
roda pela ponte **Mac → Drive** que já existe. Entregue `CODEX-ONBOARDING.md` ao Codex no
Mac Mini de Bona; ele instala **uma vez** (gate humano):

| Arquivo | O que é |
|---|---|
| `CODEX-ONBOARDING.md` | Pedido + passo a passo para o Codex instalar o bridge |
| `drive-command-watcher.sh` | Watcher: puxa missão do Drive → roda `claude /ultracode` → devolve recibo |
| `com.bonaos.ultracode-bridge.plist` | launchd que roda o watcher a cada 5 min |
| `mission-example.md` | Missão `/ultracode` (com marcador) que a nuvem solta no Drive |

**Status (review do Codex, 2026-05-30):** aprovado como **relay manual**, não como daemon.
Drive = fila; Mac mini = enforcement point que valida cada missão; READ_ONLY no início;
launchd (`com.bonaos.ultracode-bridge.plist`) **adiado** para fase 2. Canal Drive
`Jarvis-CloudBridge/{inbox,outbox}` já criado e privado; primeira missão read-only em
`inbox/relay-validation-001.md` aguardando validação manual.

Plano completo: `/root/.claude/plans/fizzy-sauteeing-fog.md` (na sessão).
