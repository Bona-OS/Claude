# Mudança de sede: Claude Code no Mini (27/09/2026)

A sessão de comando passa da nuvem para o Claude Code no Mac Mini (conta Max). Nuvem fica para
conversa, voz, Notion, Gmail e Drive quando o João está fora. Rumo em [`../sistema/PLANO.md`](../sistema/PLANO.md).

## 1. Antes de abrir a sessão (João, uma vez)
1. No Mini, no repo clonado (`~/Bona-OS/Claude` ou onde estiver): `git pull origin main` depois que o
   PR do plano entrar. O `.claude/settings.json` do repo já define o modo «aceitar edições» e libera
   Bona Memory, GitHub, Notion e os CLIs; vale para toda sessão aberta nessa pasta.
2. Conectores que a nuvem tem e o Mini ainda não: Notion e GitHub como MCP.
   `claude mcp add --transport http notion https://mcp.notion.com/mcp` e
   `claude mcp add --transport http github https://api.githubcopilot.com/mcp/` (login OAuth no primeiro uso).
   Gmail, Drive e Calendar já existem pelo `gog`.
3. Limite da ponte: pedir ao Codex, no app dele, o prompt da seção 3. É a única mudança na ponte
   feita fora do Claude; o resto o Claude do Mini pede ao Codex direto.

## 2. Prompt de abertura da sessão no Mini
```
Leia sistema/PLANO.md, sistema/MANUAL.md e sistema/CARTAO.md deste repo. Você é a sede: executa
aqui, chama Grok Build (grok) e Codex (codex) como ferramentas e não manda recado ao João.
Primeira tarefa: auditoria da infraestrutura do Mini, só leitura, sem segredos no relatório:
Bona Memory (ferramentas, gates, tetos, quem chama quem), LaunchAgents ai.bona.*, CLIs grok/codex/
claude e como autenticam, MCPs configurados, vault Joao-Radar (raw/, wiki/, wiki-piloto/), WhatsApp
(WACLI e Baileys, sem tocar no socket), gog. Liste as travas artificiais (limites, gates que pedem
autorização para coisa interna, ponte de mão única) e proponha a correção de cada uma, com backup e
teste antes de trocar. Segunda tarefa: Parte C do piloto (revisar wiki-piloto/A-grok contra raw/;
pedir ao Grok Build revisar B-claude) e recomendar quem faz volume e quem revisa.
Entregue tudo hierarquizado: urgente → importante → informativo, com recomendação.
```

## 3. Prompt para o Codex (só o teto da ponte)
```
No codex-memory-mcp (Bona Memory), suba o teto de max_tool_calls de codex_worker_delegate e
claude_worker_delegate: padrão 100, máximo 300, timeout como está. Quando o teto estourar, o turno
termina em estado PARTIAL com resumo do que foi feito e do que falta, e o mesmo request_id com
continue=true retoma sem reexecutar. Não altere gates de efeito externo nem autorização. Backup
antes, build e testes (incluindo estouro → PARTIAL → continuação), release imutável, trocar o plist
só depois dos testes, canário simples no fim. Autorização: João, 27/09/2026, "só vamos tirar esse
limite de 30 tool calls do Bona Memory".
```
