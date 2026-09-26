# Integração Grok · Grokbot · Claude

Proposta de 26/09/2026. **Ainda não implantada.** Precisa de GO do João e de registro na página
*Integração das plataformas* antes de virar regra.

## O problema

| Agente | Capacidade de execução | Limite de uso | Hoje |
|---|---|---|---|
| **Grok** (app) | baixa: conversa, mas quase não age | alto | João conversa muito, pouco vira ação |
| **Grokbot / CoS** | alta: Zap, Notion, Calendar, Gmail, braços | baixo | gasta a cota em trabalho braçal e longo |
| **Claude** | alta: Notion, Gmail, Calendar, Drive, GitHub, código, rotinas agendadas | alto | fora do circuito |

## Princípio: cada um faz o que é barato para ele

- **Grok = mesa.** João conversa à vontade (limite alto): análise, cláusula, checklist, redação.
  Quando algo precisa virar ação, o Grok **delega** em vez de tentar executar.
- **Grokbot = decisor operacional.** A cota vai para o que só ele faz: coordenar, empacotar GO para
  o João, falar pelo Zap/Bona. Ele **despacha** o trabalho longo, não o executa.
- **Claude = braço executor com autonomia.** Recebe pedidos com `request_id`, executa com as
  próprias ferramentas, grava o recibo no Notion e devolve `FEITO` ou `BLOQUEIO`. Também assume as
  rotinas agendadas que hoje consomem créditos de outros.

## Princípio de autenticação: OAuth da assinatura, não chave de API

Decisão de João (26/09): a conexão usa **OAuth da assinatura** de cada ferramenta, para consumir
os limites de uso já pagos. Chave de API gera cobrança à parte, por token.

| Quem | Como autentica | Consome |
|---|---|---|
| Grok (app) | Já é cliente MCP do Bona Memory via OAuth (escopo `codex:delegate` concedido) | Assinatura SuperGrok |
| Grokbot | Sessão própria | Assinatura do Grokbot |
| Codex no Mini | Login ChatGPT | Assinatura ChatGPT |
| Claude no Mini | `claude setup-token` → `CLAUDE_CODE_OAUTH_TOKEN` (login da assinatura Claude, sem API key) | Assinatura Claude |
| Rotinas do Claude na nuvem | Conta claude.ai do João | Assinatura Claude |

**Consequência para a direção das chamadas:** o Grok sempre **chama** (é o cliente MCP). Claude e
Codex são **executores** atrás do Bona Memory MCP. O caminho Claude → Grok só existe por API
paga, porque a SuperGrok não inclui API. Por isso ele fica fora do desenho, e o Claude devolve o
resultado pelo Notion, onde o Grok lê.

## Como conectar (sem criar fila nova)

```
João ──conversa──► Grok (mesa)
                     │ claude.delegate(request_id, goal, done_when, frente)
                     ▼
              Bona Memory MCP (já existe no Grok, já tem codex.worker_delegate)
                     │ novo roteamento: destino = claude
                     ▼
   bona-claude-worker (Mini, OAuth da assinatura) ──► Notion / Gmail (rascunho) / Drive / Calendar
                     │
                     ▼
         Recibo na página da frente + Work Log ──► CoS lê ──► João (só se precisar de GO)
```

1. **Grok → Claude.** Adicionar ao Bona Memory MCP um destino `claude`, ao lado de `codex`
   (mesmos `route` / `delegate` / `status`). O `delegate` chama um `bona-claude-worker` no Mini,
   espelho do `bona-codex-worker`, que roda `claude -p` com o `CLAUDE_CODE_OAUTH_TOKEN` da
   assinatura. O pedido segue o mesmo contrato da Bridge CoS↔Codex:
   `request_id`, `from`, `goal`, `done_when`, `constraints`, `report_to`.
   No Mini, o Claude também alcança o WACLI e o Obsidian; na nuvem, não.
2. **Grokbot → Claude.** O mesmo `delegate`. O CoS deixa de executar tarefas longas e passa a
   conferir o recibo (aceite ou ajuste), como já faz com o Codex.
3. **Rotinas agendadas (Lint 19h etc.).** Rodam como Rotinas do Claude na conta claude.ai do
   João, que também consomem a assinatura, e usam os conectores já ligados (Notion, Gmail, Drive,
   Calendar). Não precisam do Mini.
4. **Claude → Grok: descartado.** Só seria possível por API xAI paga (a SuperGrok não inclui API).
   O Grok lê o resultado no Notion.
5. **Retorno.** Sempre pelo Notion (recibo na frente) e, quando o João precisar saber, por um
   **rascunho** no Outbox da DM Bona 1175. Nunca envio direto.

## Primeiras rotinas a migrar para o Claude

| Rotina | Por quê |
|---|---|
| Lint do Notion (19h) | o Custom Agent do Notion parou por falta de créditos do workspace |
| Radar e-mail C1 (8h–20h) | o Claude já tem Gmail + Notion; tira carga do CoS |
| Briefing 06h (rascunho) | o Claude monta o gancho; o CoS só revisa e entrega |

## Trabalho anterior neste repositório (outras branches)
- `claude/grok-mcp-media-connector-vcdlu3`: servidor MCP `grok-media` que dá ao Claude as
  ferramentas de imagem, vídeo e fala do Grok pela API da xAI. É a base natural do item 3
  (acrescentar uma ferramenta `grok.ask`). Lembrete registrado lá: a assinatura SuperGrok **não**
  inclui a API; a chave vem do console.x.ai.
- `claude/codex-claude-code-integration-dlFaf`: relay Nuvem → Drive → Mac Mini para o Codex
  disparar o Claude Code local (maio/2026, aprovado só como relay manual). É anterior à
  Arquitetura v2. Reaproveitar apenas se não criar uma segunda fila.

## Pendências para decidir
1. GO para adicionar o destino `claude` ao Bona Memory MCP (código no Mac Mini).
2. GO para migrar o Lint das 19h para uma Rotina do Claude.
3. João rodar `claude setup-token` no Mini, uma vez, logado na assinatura Claude, e guardar o
   token no Keychain. É passo humano, porque o login é dele.
