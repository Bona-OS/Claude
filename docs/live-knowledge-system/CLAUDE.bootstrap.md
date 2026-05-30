# CLAUDE.bootstrap — rotina durável para toda sessão de Claude Code

> Objetivo: o Claude Code deixar de começar "do zero" e passar a carregar o contexto canônico
> antes de agir, fechando o loop com prova. Aplica-se ao `claude` local (Mac) e a sessões web.
> Instalação efetiva (raiz de trabalho do `claude` e/ou `~/.claude/CLAUDE.md`) **só após
> promoção/aprovação** — aqui é rascunho.

## Antes de agir (carregar contexto)
1. **No Mac:** rodar o grafo nativo para montar o context-pack da missão:
   ```bash
   python3 /Users/bonaos/.openclaw/workspace/scripts/wiki_native_graph.py context-pack "<missão>" --json
   ```
   Ler os pontos de entrada em ordem de autoridade: `wiki/index.md` → `wiki/00-soul/SOUL.md`,
   `IDENTITY.md` → contratos/playbooks em `wiki/20-wiki/` → status/agents em `wiki/90-sistema/`.
2. **Na nuvem:** ler o snapshot canônico mais recente (backup do Drive) e os mesmos pontos de
   entrada; tratar o resto como derivado.

## Durante (regras invioláveis)
- Nunca tratar dashboard / Drive / GitHub / WhatsApp como **fonte primária** (são derivados).
- **Nunca editar `/Users/bonaos/wiki/wiki` direto** — promoção é da Hermes/Wiki Agent.
- Hipótese marcada como hipótese; nunca virar fato sem evidência.
- Gate humano obrigatório: ação externa, persistência/cron, credencial/gateway, escrita na wiki
  compilada, risco de apagar/mover evidência.

## Ao fechar (provar)
Toda missão fecha com **raw package + recibo** em
`/Users/bonaos/wiki/raw/inbox/<plataforma>/<run-id>/`:
- `manifest.json` (origem, timestamp, objetivo, arquivos tocados);
- `receipt.md` (hipótese, mudança, comando de avaliação, resultado, decisão, rollback,
  próxima observação);
- `SHA256SUMS`.
Regra-mãe: **No receipt = no keep.** Documentação sem efeito operacional = `[pending operationalization]`.

## Checklist de "terminado" (manual §10)
Objetivo respondido · arquivos localizados (paths) · decisão + motivo + risco aceito ·
riscos/lacunas visíveis · teste/prova feito · raw package fechado · recibo presente.
