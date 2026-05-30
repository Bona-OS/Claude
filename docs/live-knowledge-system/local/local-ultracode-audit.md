# Missão LOCAL 2 — auditoria /ultracode completa (rodar no Mac Mini, só após a validação 1)

> Cole no `claude` local com `/ultracode` (dynamic workflow) habilitado. READ_ONLY.
> Sem Drive. Saída canônica em /raw; promoção fica para a Hermes.

```text
Rode em /ultracode (dynamic workflow). Modo: AUDITORIA READ_ONLY no Mac Mini. Gates duros:
sem mensagem externa; sem credenciais/config/gateway; NAO escrever em /Users/bonaos/wiki/wiki
(wiki compilada); nenhuma operacao destrutiva. Toda saida e evidencia em /raw.

Objetivo: ler e entender profundamente a Wiki (Live Knowledge System), com foco na PARTE
CLAUDE CODE, e reconciliar todas as superficies para decidir a verdade canonica + mapear
divergencias. Regra de desempate = Hierarquia de Verdade: /raw > /wiki > /control > workers >
superficies derivadas.

Fan-out de subagentes-leitores (1 por superficie), 2 revisores por arquivo critico, 1 reconciliador:
  1. /Users/bonaos/wiki/wiki/00-soul (SOUL.md, IDENTITY.md)
  2. /Users/bonaos/wiki/wiki/20-wiki (Arquitetura/Contrato-Raw-Wiki-Pio.md, Playbooks/*)
  3. /Users/bonaos/wiki/wiki/90-sistema (Status/*, Agents/*, e a pagina/contrato do Claude Code)
  4. /Users/bonaos/wiki/raw  e  /Users/bonaos/wiki/control/context-packs
  5. Codex no MINI: ~/.codex, ~/Documents/Codex
  6. Codex no AIR (via ponte air<->mini)
  7. OpenClaw: ~/.openclaw    8. Hermes: ~/.hermes e perfis
  9. Backup do dia no Drive — confirmar se == canonico
 10. Clone local de bedinjoao/live-knowledge-system (lido pelo Codex)

Para a PARTE CLAUDE CODE, extraia: papel (camada Code/Codex implementacao/auditoria),
permissoes, e o contrato Codex<->Claude Code (como o Codex dispara o claude CLI).

Ancore contexto no grafo:
  python3 /Users/bonaos/.openclaw/workspace/scripts/wiki_native_graph.py context-pack "<missao>" --json

Classifique cada item: em-sincronia / espelho-defasado / faltando-no-espelho / orfao /
drift-de-memoria-de-worker (incl. mini vs air) / contradicao-interna. Paginas antigas do Drive
so entram se recuperarem algo perdido.

Entregue RAW PACKAGE em /Users/bonaos/wiki/raw/inbox/Codex-mini/<run-id>/ com:
COMPREENSAO-WIKI.md, DIVERGENCIAS-WIKI.md, CLAUDE.bootstrap.md, manifest.json, receipt.md,
SHA256SUMS. Cada afirmacao cita path + trecho. NAO promova a wiki. Imprima o caminho ao final.

Fechamento: acione hermes-wiki-curator em DRY-RUN propondo a promocao pela rota oficial
(diff proposto, paginas checadas, rejeicoes, riscos, receipt). Promocao real so apos aprovacao.
```
