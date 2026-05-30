# Divergências da Wiki — reconciliação multi-superfície (esqueleto + achados de nuvem)

> Status: **parcial**. As linhas de nuvem são definitivas; as marcadas **[só-Mac]** serão
> preenchidas pelo run `/ultracode` no Mac (que vê Wiki + memória de Codex/OpenClaw/Hermes).
> Regra de desempate: Hierarquia de Verdade (`/raw` > `/wiki` > `/control` > workers > derivados).
> Classes: `em-sincronia` / `espelho-defasado` / `faltando-no-espelho` / `órfão-no-espelho` /
> `drift-de-memória-de-worker` / `contradição-interna`.

## Achados já confirmados pela nuvem

| Tópico | Superfícies comparadas | Classe | Canônico | Nota |
|---|---|---|---|---|
| Repo do sistema | `bona-os/claude` (FotoRestaura) × `bedinjoao/live-knowledge-system` | contradição-estrutural | `bedinjoao/live-knowledge-system` | A sessão web está apontada ao repo errado (FotoRestaura). Confirmar onde gravam os outputs. |
| Wiki pessoal/operacional no Drive | backup do Drive × `/Users/bonaos/wiki` | faltando-no-espelho (por design) | Mac `/wiki` | O backup exclui de propósito WhatsApp/família/financeiro/credenciais/mídia. |
| Cópias antigas do Drive (2026-05-05) | `wiki/`, `raw-body/` antigos × backup de hoje | espelho-defasado / ruído | backup de hoje | Incluir só se recuperarem algo perdido. |
| Backup do dia | `live-knowledge-system-20260530-031007.zip` × canônico Mac | a validar | Mac | Hash conferido (`f4996e8f…827c`); confirmar igualdade de conteúdo no Mac. |
| Pasta "control" achada no Drive | pacote Python de física × `/control` da wiki | falso-positivo | — | `wigner.py`, `paulialgebra.py`, `quantum/` — ruído, não é a wiki. |

## A preencher no run do Mac

| Tópico | Superfícies | Classe | Canônico | Nota |
|---|---|---|---|---|
| SOUL / IDENTITY | `wiki/00-soul` × memória workers | [só-Mac] | — | |
| Contrato Raw-Wiki-Pio | `wiki/20-wiki/Arquitetura` × Hermes config | [só-Mac] | — | |
| Página/contrato Claude Code | `wiki/90-sistema` × prática Codex↔claude | [só-Mac] | — | |
| Memória Codex MINI vs AIR | `~/.codex` (mini) × `~/.codex` (air) | [só-Mac] drift | — | foco no drift entre máquinas |
| OpenClaw / Hermes | `~/.openclaw`, `~/.hermes` × `/wiki` | [só-Mac] | — | |
| context-packs | `control/context-packs` × grafo nativo | [só-Mac] | — | |
