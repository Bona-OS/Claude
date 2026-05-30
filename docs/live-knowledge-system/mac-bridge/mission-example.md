# JARVIS-ULTRACODE-MISSION
# (marcador obrigatorio na 1a linha — sem ele o watcher ignora)

Rode em /ultracode (dynamic workflow). Modo: AUDITORIA READ-ONLY. Gates duros: nao enviar
mensagem externa; nao tocar credenciais/config/gateway; NAO escrever em /Users/bonaos/wiki/wiki
(wiki compilada); nenhuma operacao destrutiva. Toda saida e evidencia em /raw.

Objetivo: ler e entender profundamente a Wiki (Live Knowledge System), com foco na PARTE
CLAUDE CODE, e reconciliar todas as superficies para decidir a verdade canonica + mapear
divergencias. Regra de desempate = Hierarquia de Verdade: /raw > /wiki > /control > workers >
superficies derivadas.

Faca fan-out de subagentes-leitores (um por superficie), com 2 revisores por arquivo critico
e 1 reconciliador:
  1. /Users/bonaos/wiki/wiki/00-soul (SOUL.md, IDENTITY.md)
  2. /Users/bonaos/wiki/wiki/20-wiki (Arquitetura/Contrato-Raw-Wiki-Pio.md, Playbooks/*)
  3. /Users/bonaos/wiki/wiki/90-sistema (Status/*, Agents/*, e a pagina/contrato do Claude Code)
  4. /Users/bonaos/wiki/raw  e  /Users/bonaos/wiki/control/context-packs
  5. Codex no MINI: ~/.codex, ~/Documents/Codex
  6. Codex no AIR (via ponte air<->mini): mesma leitura
  7. OpenClaw: ~/.openclaw
  8. Hermes: ~/.hermes e perfis
  9. Snapshot Drive (backup do dia) — confirmar se == canonico
 10. Repo do sistema, LIDO LOCALMENTE pelo Codex: clone local de bedinjoao/live-knowledge-system

Para a PARTE CLAUDE CODE, extraia: papel (camada Code/Codex implementacao/auditoria),
permissoes, e o contrato de integracao Codex<->Claude Code (como o Codex dispara o claude CLI).

Use o grafo nativo para ancorar contexto:
  python3 /Users/bonaos/.openclaw/workspace/scripts/wiki_native_graph.py context-pack "<missao>" --json

Classifique cada item: em-sincronia / espelho-defasado / faltando-no-espelho / orfao /
drift-de-memoria-de-worker (incl. mini vs air) / contradicao-interna. Paginas antigas do Drive
so entram se recuperarem algo perdido.

Entregue como RAW PACKAGE em /Users/bonaos/wiki/raw/inbox/Claude-Code/<run-id>/ contendo:
COMPREENSAO-WIKI.md, DIVERGENCIAS-WIKI.md, CLAUDE.bootstrap.md, manifest.json, receipt.md,
SHA256SUMS. Cada afirmacao cita path + trecho. NAO promova a wiki.

Fechamento: acione hermes-wiki-curator em DRY-RUN para propor a promocao pela rota oficial
(diff proposto, paginas checadas, rejeicoes, riscos, receipt). Promocao real so apos aprovacao.
