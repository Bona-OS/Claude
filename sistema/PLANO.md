# Plano Bona — v1 (27/09/2026)

Estado do trabalho e rumo. Muda toda semana por PR pequeno; o [`MANUAL.md`](MANUAL.md) é a regra
permanente, este arquivo é o caminho. Toda sessão (nuvem ou Mini) começa lendo este arquivo e termina
atualizando-o junto com a fila ✅ Ações no Notion. Detalhe com dado pessoal fica no Notion, não aqui.

## 1. Objetivo e medida
Um family office que roda sozinho no dia a dia; João decide só o que é externo ou irreversível e não
copia nem cola. Medida semanal, nesta ordem: vencimento surpresa = 0 · pendência sem dono = 0 ·
% de Compromissos e Contratos com fonte · horas do João servindo de ponte entre agentes.

## 2. Onde estamos (auditoria de 26–27/09, transcrição inteira)
- **~85 % encanamento, ~15 % resultado.** Ponte, OAuth, cartões, vaults, permissões e PRs tomaram a
  sessão; dado de negócio entrou em dois blocos curtos (Notion) e duas auditorias só de leitura.
- **Caixas d'água vazias:** Compromissos incompletos, contratos não extraídos, frentes sem responsável,
  grafias e vencimentos a confirmar. Lista completa na página privada de auditoria no Notion.
- **Torneiras faltando e vazamentos:** teto de 30 chamadas na ponte (estourou 6× em um dia), Grok sem
  ferramenta na ponte, Claude da nuvem mandando recado ao Codex em vez de executar, repo público com
  histórico sensível, duas fontes de regra por um tempo (Notion antigo × repo).
- **Sessões do Mini caindo (27/09):** Remote Control saía após ~10 min sem rede/sono e ninguém o
  subia de novo. Correção: LaunchAgent permanente em [`../mini/always-on/`](../mini/always-on/README.md).

## 3. Posição de comando: Claude Code no Mini (conta Max)
Lá o Claude executa (terminal, vault, launchd, Bona Memory local) e chama Grok Build e Codex como
ferramentas, não como intermediários. Condições para mudar a sede: permissões da sessão do Mini
definidas pelo João (sem classificador «auto»); Notion e GitHub configurados como MCP no Mini
(Gmail/Drive já existem via `gog`); este plano no repo. Nuvem continua para conversa, voz, Notion,
Gmail e Drive quando o João está fora. Passo a passo em [`../mini/MIGRACAO-SEDE.md`](../mini/MIGRACAO-SEDE.md).

## 4. Um papel por plataforma (tudo já pago; nada ocioso)
| Plataforma | Papel único | Chamado por |
|---|---|---|
| Claude Code no Mini | executa, orquestra, arquitetura, revisão final | João, Grokbot, rotinas |
| Claude nuvem / app / voz | mesa com João fora de casa; Notion, Gmail, Drive; captura de voz | João |
| Codex | mantém a infraestrutura do Mini (ponte, serviços, testes, Computer Use) | Claude Mini |
| Grok Build 4.7 | volume: ingest da wiki, lint, leitura de contratos | Claude Mini, rotinas |
| Grok app | mesa de análise e edição do Notion quando João pede | João |
| Grokbot | mordomo: dispara rotinas, cobra, entrega na DM; sem análise longa | rotinas, João |
| ChatGPT «Meu escritório» | segunda opinião, revisão cruzada, conversa | João, Claude Mini |

Regras: executor nunca revisa o próprio trabalho · o que mexe com dinheiro, prazo, direito ou
obrigação tem revisor de outro LLM · agente pede ao João só decisão, nunca dúvida técnica.

## 5. Fases (dono → revisor · pronto quando)
| # | Fase | Dono → revisor | Pronto quando |
|---|---|---|---|
| 0 | **Destravar** (agora): teto da ponte 100/300 com estado PARTIAL; `grok_worker_*` na ponte; sede no Mini (§3); este plano na `main` | Codex → Claude | pedido de 100 ações termina sem «resultado incerto»; Claude do Mini chama Grok e Codex direto |
| 1 | **Encher as caixas** (semana 1): Compromissos completos com fonte e próxima revisão; 73 PDFs → 📑 Contratos; Entidades e Vínculos com grafia confirmada; toda Frente com responsável; Ações sem vencidas órfãs | Grok extrai → Claude revisa; Claude escreve Notion → Grok confere | zero lacuna aberta sem dono na auditoria; briefing consegue listar vencimentos de 30 dias |
| 2 | **Wiki em regime** (semana 2): captura contínua (WhatsApp, 3 contas Gmail, Drive, Granola, Agenda) → `raw/`; ingest e lint diários; consolidação → Notion | Grok ingest → Claude revisa; Claude consolida → Grok confere | nota de cada ente e frente com «Estado atual» datado de ≤ 7 dias |
| 3 | **Rotinas do Manual** (semana 3): briefing 06h30, radar horário, lint 19h; Grokbot entrega na DM; Claude responde na DM; inbox `00-Celular` por voz | Claude Mini → Grok; Codex na infra | 7 dias de briefing sem falha e sem intervenção do João |
| 4 | **Fechar vazamentos** (quando 1–3 estáveis): repo privado e GitHub unificado; MIGRACAO (tirar configuração do Notion); WhatsApp multiagente em sandbox | Codex → Claude | Notion só com dados; nenhum segredo em repo público |

Piloto Grok × Claude (ingest da mesma frente) terminou com 7 notas de cada lado; a revisão cruzada
decide, na fase 2, quem faz volume e quem revisa. Até lá vale a tabela do §4.

## 6. Decisões que só o João fecha
1. Permissões da sessão do Mini (modo sem classificador) e das sessões da nuvem.
2. Modelo de extração dos contratos: Grok extrai e Claude revisa (recomendado) ou outro par.
3. GitHub: casa única Bona-OS com repos privados (tabela da Frente 3 aguarda marcação).
4. Vault do celular no dia a dia: original ou Bona GO (define onde fica a inbox `00-Celular`).

## 7. Como este plano muda
PR pequeno a cada sessão: o que fechou sai, o que abriu entra, a fase avança. Sem histórico aqui; o
histórico é o `git log`. Se a fase 1 não fechar em uma semana, a causa entra em [`LICOES.md`](LICOES.md).
