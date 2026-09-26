# Conector WhatsApp do Claude — extensão do Bona Memory MCP

**Estado (26/09):** release r43 ativa no Mini. 495 testes MCP + 10 da outbox passaram. Aceites 4, 5
e 6 aprovados; 1–3 aguardam o consentimento do João e o teste real na DM.

**Decisão:** não criar um servidor novo. O Bona Memory MCP no Mini já tem OAuth com escopos, 33
ferramentas, leitura do 3008 (WACLI) e a ponte 1175 (Baileys) com trava humana para envio. O
Claude entra como **mais um cliente OAuth** desse servidor, e o servidor ganha só o que falta:
falar com o João.

> Repositório público: nenhum número de telefone, JID, URL do servidor ou segredo neste arquivo.
> Use as variáveis `JOAO_JID`, `BONA_JID` e `BONA_MCP_URL`, configuradas só no Mini.

## Regras que já valem (não mudam)
- **3008 (João):** só leitura, via WACLI. Nunca abrir socket nem sessão no 3008.
- **1175 (Bona):** único número que envia, pela ponte Baileys existente. Nunca uma 2ª sessão Baileys.
- **Terceiros:** mensagem a qualquer outro contato continua rascunho, com a trava humana vigente
  (aprovação vinculada ao destinatário e ao hash exato).
- **Canal João:** GO de 24/09 — «o que precisar de João cai na DM Bona». Enviar 1175 → 3008 não
  precisa de GO por mensagem.

## 1. Cliente OAuth para o Claude
- Registrar o Claude como cliente (o claude.ai usa registro dinâmico; se o servidor não aceitar,
  criar um cliente manual).
- Callback do claude.ai: `https://claude.ai/api/mcp/auth_callback` (conferir na tela de conexão).
- Escopos do Claude (autorização do João em 26/09): `whatsapp:read` (inclui `radar.*`) + `dm_joao:send` (novo) +
  `codex:delegate` (controlar o Codex pelos `codex.worker_*` existentes) + envio a terceiros **pela
  trava humana existente** (rascunho → aprovação do João vinculada ao destinatário e ao hash),
  escopo `whatsapp:send_gated`, portado para o servidor OAuth. Cliente fixo no Auth0.
- Consentimento dado pelo João na tela do servidor.

## 2. Ferramentas novas (só 3)
| Ferramenta | Faz | Trava |
|---|---|---|
| `whatsapp.dm_joao.send(text, reply_to?)` | 1175 → `JOAO_JID`, pela outbox da ponte | destino fixo no servidor; o cliente não escolhe o destinatário. Máx. 4.000 caracteres. Idempotência por `client_msg_id` |
| `whatsapp.dm_joao.read(since?, limit?)` | mensagens da DM Bona (as duas direções), mais novas primeiro | só leitura; inclui transcrição de áudio quando houver |
| `whatsapp.dm_joao.status(client_msg_id)` | `queued` · `sent` · `delivered` · `failed: motivo` | — |

Envio a outros números: pelas ferramentas de rascunho e aprovação que já existem (a mesma trava do
Grok). O Claude prepara, o João aprova, o servidor envia. Sem aprovação, não sai.

Leitura do resto do WhatsApp: as ferramentas `radar.search` e `radar.context` que já existem.

## 3. Horário
Implantado na r43 (26/09): **sem retenção no servidor**. DM para João sai em qualquer horário.
João liberou mensagens a qualquer hora (26/09); regra 8 do Manual.

## 4. Aceite (Codex executa e registra)
1. `claude.ai` → Conectores → Adicionar personalizado → `BONA_MCP_URL` → login e consentimento do
   João (o Codex pode fazer isso por Computer Use na sessão do João no Mini). Aparecem: as 3
   ferramentas novas, `radar.*`, `codex.worker_*` e as de rascunho/aprovação para terceiros.
2. Numa sessão do Claude: `dm_joao.send("Teste Claude 1")` → chega no 3008 vindo do 1175;
   `status` = `delivered`.
3. João responde na DM → `dm_joao.read` devolve a resposta.
4. Mesmo `client_msg_id` duas vezes → uma mensagem só.
5. `dm_joao.send` não aceita destino. Envio a terceiro sem aprovação do João → recusado.
6. Chamada às 23h → sai na hora (sem retenção, r43).

## 5. Responder quando o João escreve (fase 2)
O conector deixa o Claude **falar e ler**. Para o Claude **responder sozinho** quando o João
escreve, a ponte precisa chamar o Claude ao chegar mensagem (adaptador `bona-claude-chat`,
guardado fora do repositório até o João decidir). Fica para depois do aceite acima.
