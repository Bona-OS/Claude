# Dispatch — Codex → `claude /ultracode` (leitura profunda + reconciliação da Wiki)

> Cole isto como missão para o Codex disparar no `claude` local (CLI) do Mac Mini, em modo
> `/ultracode` (dynamic workflow). É **auditoria read-only**: nenhuma escrita na wiki compilada;
> toda saída é evidência em `/raw`; promoção fica para a Hermes pela rota oficial.

```text
Rode em /ultracode (dynamic workflow). Modo: AUDITORIA READ-ONLY. Gates duros: não enviar
mensagem externa; não tocar credenciais/config/gateway; NÃO escrever em /Users/bonaos/wiki/wiki
(wiki compilada); nenhuma operação destrutiva. Toda saída é evidência em /raw.

Objetivo: ler e entender profundamente a Wiki (Live Knowledge System), com foco na PARTE
CLAUDE CODE, e reconciliar todas as superfícies para decidir a verdade canônica + mapear
divergências. Regra de desempate = Hierarquia de Verdade: /raw > /wiki > /control > workers >
superfícies derivadas.

Faça fan-out de subagentes-leitores (um por superfície), com 2 revisores por arquivo crítico
e 1 reconciliador:
  1. /Users/bonaos/wiki/wiki/00-soul (SOUL.md, IDENTITY.md)
  2. /Users/bonaos/wiki/wiki/20-wiki (Arquitetura/Contrato-Raw-Wiki-Pio.md, Playbooks/*)
  3. /Users/bonaos/wiki/wiki/90-sistema (Status/*, Agents/*, e a página/contrato do Claude Code)
  4. /Users/bonaos/wiki/raw  e  /Users/bonaos/wiki/control/context-packs
  5. Codex no MINI: ~/.codex, ~/Documents/Codex
  6. Codex no AIR (via ponte air↔mini): mesma leitura
  7. OpenClaw: ~/.openclaw
  8. Hermes: ~/.hermes e perfis
  9. Snapshot Drive (backup do dia) — confirmar se == canônico
 10. Repo bedinjoao/live-knowledge-system (se acessível)

Para a PARTE CLAUDE CODE, extraia: papel (camada Code/Codex implementação/auditoria),
permissões, e o contrato de integração Codex↔Claude Code (como o Codex dispara o claude CLI).

Use o grafo nativo para ancorar contexto:
  python3 /Users/bonaos/.openclaw/workspace/scripts/wiki_native_graph.py context-pack "<missão>" --json

Classifique cada item: em-sincronia / espelho-defasado / faltando-no-espelho / órfão /
drift-de-memória-de-worker (incl. mini vs air) / contradição-interna. Páginas antigas do Drive
só entram se recuperarem algo perdido.

Entregue como RAW PACKAGE em /Users/bonaos/wiki/raw/inbox/Claude-Code/<run-id>/ contendo:
COMPREENSAO-WIKI.md, DIVERGENCIAS-WIKI.md, CLAUDE.bootstrap.md, manifest.json, receipt.md,
SHA256SUMS. Cada afirmação cita path + trecho. NÃO promova à wiki.

Fechamento: acione hermes-wiki-curator em DRY-RUN para propor a promoção pela rota oficial
(diff proposto, páginas checadas, rejeições, riscos, receipt). Promoção real só após aprovação.
```

## Notas de uso
- `<run-id>` sugerido: `claude-code-wiki-audit-<YYYYMMDD-HHMM>`.
- Requer Claude Code **v2.1.154+** e `/ultracode` habilitado (Opus 4.8).
- Os rascunhos lado-nuvem em `docs/live-knowledge-system/` (este repo) servem de baseline:
  o run no Mac confirma/expande e produz a versão canônica em `/raw`.
