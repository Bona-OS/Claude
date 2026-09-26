# Conector WhatsApp do Claude — extensão do Bona Memory MCP

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
- Escopos do Claude: `radar:read` + `dm_joao:send` (novo). **Sem** `codex:delegate` e sem escopo
  de envio a terceiros.
- Consentimento dado pelo João na tela do servidor.

## 2. Ferramentas novas (só 3)
| Ferramenta | Faz | Trava |
|---|---|---|
| `whatsapp.dm_joao.send(text, reply_to?)` | 1175 → `JOAO_JID`, pela outbox da ponte | destino fixo no servidor; o cliente não escolhe o destinatário. Máx. 4.000 caracteres. Idempotência por `client_msg_id` |
| `whatsapp.dm_joao.read(since?, limit?)` | mensagens da DM Bona (as duas direções), mais novas primeiro | só leitura; inclui transcrição de áudio quando houver |
| `whatsapp.dm_joao.status(client_msg_id)` | `queued` · `sent` · `delivered` · `failed: motivo` | — |

Leitura do resto do WhatsApp: as ferramentas `radar.search` e `radar.context` que já existem.

## 3. Horário quieto no servidor
`dm_joao.send` fora da janela permitida (antes das 6h30; noite das crianças) → fica `queued` até
a janela abrir. Exceção só com `urgent=true` + motivo (boleto que vence hoje), registrado no log.

## 4. Aceite (Codex executa e registra)
1. `claude.ai` → Conectores → Adicionar personalizado → `BONA_MCP_URL` → login e consentimento do
   João. As 3 ferramentas novas e `radar.*` aparecem; `codex.*` e o envio a terceiros **não**.
2. Numa sessão do Claude: `dm_joao.send("Teste Claude 1")` → chega no 3008 vindo do 1175;
   `status` = `delivered`.
3. João responde na DM → `dm_joao.read` devolve a resposta.
4. Mesmo `client_msg_id` duas vezes → uma mensagem só.
5. Tentativa de destino diferente → impossível pela interface (não há parâmetro).
6. Chamada às 23h sem `urgent` → `queued`; sai às 6h30.

## 5. Responder quando o João escreve (fase 2)
O conector deixa o Claude **falar e ler**. Para o Claude **responder sozinho** quando o João
escreve, a ponte precisa chamar o Claude ao chegar mensagem (adaptador `bona-claude-chat`,
guardado fora do repositório até o João decidir). Fica para depois do aceite acima.
