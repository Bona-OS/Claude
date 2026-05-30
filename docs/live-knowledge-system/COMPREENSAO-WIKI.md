# Compreensão da Wiki — Live Knowledge System (rascunho lado-nuvem)

> Status: **rascunho do Motor B (nuvem)**. Fundamentado na leitura read-only do backup
> `live-knowledge-system-20260530-031007.zip` (hash `f4996e8f…827c`, conferido) e do
> `manual-do-usuario-stack-jarvis.md`. As seções marcadas **[só-Mac]** dependem do run
> `/ultracode` no Mac para serem preenchidas/confirmadas (a wiki pessoal/operacional e a
> memória dos workers não estão na nuvem por design).

## 1. O que é o sistema

**Live Knowledge System** — arquitetura Software 3.0 para memória viva, pesquisa agêntica e
execução verificável. Repo privado `bedinjoao/live-knowledge-system`
(*"Code/Codex + OpenClaw + Hermes + Wiki + AutoResearch + Software 3.0"*). Tese central
(`public-repo/README.md`):

```text
Context is the program. LLM is the runtime. Receipts are the control layer.
AutoResearch is the improvement engine. Wiki is the durable memory.
OpenClaw is the action/channel layer. Codex is the implementation/audit layer.
Hermes is the research/wiki-curation layer.
```

As **três ferramentas do Karpathy** que João combina estão todas presentes:
- **LLM Wiki** → a camada de memória durável (`/wiki`).
- **AutoResearch** → adaptação literal de `karpathy/autoresearch` (ver §4).
- **Software 3.0** → o filtro/manifesto (ver §5).

## 2. Camadas e hierarquia de verdade

Arquitetura (`public-repo/docs/architecture.md`):

```text
Raw Evidence → Compiled Wiki → Operational Memory/Pio → Action+Channel → Receipts+Audit
  ↺ AutoResearch Improvement Loop
```

**Hierarquia de Verdade** (manual §4) — regra de desempate para reconciliação:
`/raw` > `/wiki` > `/control` > workers (Codex/OpenClaw/Hermes/Claude Code/GitHub) >
superfícies derivadas (dashboards, exports, Drive). Físico:
`/Users/bonaos/wiki/{raw,wiki,control,Interface-Humana}` no **Mac Mini**.

## 3. Papéis (roles.md) — e a PARTE CLAUDE CODE

| Papel | Função |
|---|---|
| Humano/Principal | Julgamento, entendimento, aprovações, decisão final |
| OpenClaw | Camada de canal e ação (WhatsApp, lembretes, sessões, ferramentas, recibos) |
| **Codex / Code** | **Camada ministerial de implementação/auditoria** |
| Hermes | Pesquisa e curadoria de wiki (busca, ingestão, gaps, promoção, auditoria) |
| Wiki | Contexto durável e conhecimento compilado |
| AutoResearch | Motor que converte fricção em experimentos medidos |

### Parte Claude Code (foco do pedido)
Na arquitetura, **"Claude Code" é a camada "Code/Codex"** — implementação e auditoria,
**ministerial** (`roles.md`: "Builds scripts, patches, evals, tests, rollbacks, and
implementation receipts"). Os princípios que regem o Claude Code (de `manifesto.md` e
`software-3-filter.md`):
1. **LLM é runtime, não dono** — o modelo executa/interpreta; o humano mantém autoridade.
2. **Verificabilidade habilita autonomia** — sem checagem objetiva → assistência supervisionada,
   não execução autônoma.
3. **No receipt = no keep** — toda ação relevante precisa de prova (path, hash, diff, teste,
   tool output, message id, screenshot, reconciliação).
4. **Proibido escrever direto na wiki compilada** (manual §4.4) — promoção é da Hermes/Wiki Agent.
5. **Gate humano obrigatório** para: ação externa, persistência/cron, credencial/gateway,
   mudança na wiki compilada, risco de apagar/mover evidência (`codex-plan.md` §8).

**Integração Codex↔Claude Code (estado atual):** missão no WhatsApp → OpenClaw → Codex →
`claude` (CLI) no Mac. O Codex é o orquestrador local; o Claude Code é sub-worker de
implementação. CLI verificado (manual §12): `/opt/homebrew/bin/claude`; comandos `claude`,
`claude -p "<tarefa>"`, `claude -c`. **[só-Mac]** O contrato formal de papel/permissões do
Claude Code (página dedicada em `wiki/90-sistema/`) precisa ser lido in loco no run do Mac.

## 4. AutoResearch (motor de melhoria)

Adaptação de `karpathy/autoresearch` (`public-repo/docs/autoresearch-loop.md`,
`raw-evidence/autoresearch-improvement-run/codex-plan.md`):

| Karpathy | Live Knowledge System |
|---|---|
| `program.md` | `research_program.md` |
| `train.py` (editável limitado) | allowlist pequena de arquivos sob teste |
| `prepare.py`/eval (harness fixo) | `harness/eval_improvement.py` + `probes.jsonl` |
| `val_bpb` (métrica) | `ops_loss` (menor é melhor) |
| loop | modificar → rodar → medir → keep/discard → receipt |

`ops_loss = 0.35·failure_recurrence + 0.25·context_miss_rate + 0.20·no_receipt_rate +
0.10·manual_friction + 0.10·complexity_penalty`. Regra-mãe: **No receipt = no keep**;
descarta melhoria só-documental sem efeito operacional. Run real verificado
(`eval.json`): `openclaw-autoresearch-pilot-20260524-2140`, `ops_loss=0.15`, status `keep`,
efeito operacional = harness executável que bloqueia "melhorias só-documentais".

## 5. Software 3.0 (filtro de decisão)

`public-repo/docs/software-3-filter.md` — filtro permanente para produtos/automações/agentes:
contexto é o programa; LLM é runtime; verificabilidade habilita autonomia; recibos provam ação;
moat = contexto + ação + confiança. Saída **não-binária**: o que melhora / o que enfraquece /
contexto faltante / próximo experimento / gate / receipt / o que monitorar.

## 6. Os cinco loops (README do public-repo)
Evidência → Conhecimento → Ação → AutoResearch → Recuperação. "Uma página de wiki sem efeito
operacional não é um loop fechado." Recuperação: GitHub + Drive backup + raw receipts +
arquitetura documentada + scripts reproduzíveis.

## 7. Fronteira de conhecimento (cloud vs Mac)
- **Verificado pela nuvem:** arquitetura, papéis, AutoResearch, Software 3.0, templates, um run
  real (tudo no backup do Drive).
- **[só-Mac] a confirmar no run `/ultracode`:** `wiki/00-soul/SOUL.md` e `IDENTITY.md`;
  `Contrato-Raw-Wiki-Pio.md`; `Raw-to-Wiki-Agent-Handoff.md`; `Oficial-de-Operacoes.md`;
  a página/contrato do Claude Code; `control/context-packs/`; e a **memória de Codex (mini+air),
  OpenClaw e Hermes** — incluindo o **drift entre mini e air**.

## Fontes (dentro do backup)
`BACKUP-README.md`, `github/repo.json`, `public-repo/{README.md,docs/*}`,
`openclaw-autoresearch/{research_program.md,results.tsv,harness/*}`,
`raw-evidence/autoresearch-improvement-run/{receipt.md,context.md,codex-plan.md,hermes-plan.md,eval.json}`,
e o `manual-do-usuario-stack-jarvis.md` (Drive).
