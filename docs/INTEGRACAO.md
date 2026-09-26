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

## Como conectar (sem criar fila nova)

```
João ──conversa──► Grok (mesa)
                     │ claude.delegate(request_id, goal, done_when, frente)
                     ▼
              Bona Memory MCP (já existe no Grok, já tem codex.worker_delegate)
                     │ novo roteamento: destino = claude
                     ▼
            Rotina Claude (gatilho por API) ──► Notion / Gmail (rascunho) / Drive / Calendar
                     │
                     ▼
         Recibo na página da frente + Work Log ──► CoS lê ──► João (só se precisar de GO)
```

1. **Grok → Claude.** Adicionar ao Bona Memory MCP um destino `claude`, ao lado de `codex`
   (mesmos `route` / `delegate` / `status`). O `delegate` dispara uma Rotina do Claude Code por
   API, com o pedido no corpo. O mesmo contrato do pedido da Bridge CoS↔Codex:
   `request_id`, `from`, `goal`, `done_when`, `constraints`, `report_to`.
2. **Grokbot → Claude.** O mesmo `delegate`. O CoS deixa de executar tarefas longas e passa a
   conferir o recibo (aceite ou ajuste), como já faz com o Codex.
3. **Claude → Grok (opcional).** Um MCP pequeno `grok.ask` usando a API da xAI, para o Claude
   pedir segunda opinião ou análise longa ao Grok. Exige chave de API da xAI, com cobrança própria
   e sem acesso à memória do app Grok.
4. **Retorno.** Sempre pelo Notion (recibo na frente) e, quando o João precisar saber, por um
   **rascunho** no Outbox da DM Bona 1175. Nunca envio direto.

## Primeiras rotinas a migrar para o Claude

| Rotina | Por quê |
|---|---|
| Lint do Notion (19h) | o Custom Agent do Notion parou por falta de créditos do workspace |
| Radar e-mail C1 (8h–20h) | o Claude já tem Gmail + Notion; tira carga do CoS |
| Briefing 06h (rascunho) | o Claude monta o gancho; o CoS só revisa e entrega |

## Pendências para decidir
1. GO para adicionar o destino `claude` ao Bona Memory MCP (código no Mac Mini).
2. GO para migrar o Lint das 19h para uma Rotina do Claude.
3. Se o Claude deve consultar o Grok por API (item 3), e quem fornece a chave xAI.
