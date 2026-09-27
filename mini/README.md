# Instalar o executor Claude no Mac Mini

Quem executa: o **Codex (Computer Use)** ou o **Grok Build**, no Mini. Três passos precisam do
João, porque são login dele: estão marcados 👤.

## 1. Instalar o Claude Code
```bash
curl -fsSL https://claude.ai/install.sh | bash
claude --version
```

## 2. 👤 Autenticar com a assinatura (OAuth, sem chave de API)
```bash
claude setup-token          # abre o navegador; João entra com a conta Claude
```
Guardar o token impresso no Keychain (não colar em arquivo nem em chat):
```bash
security add-generic-password -a "$USER" -s bona-claude-oauth -w '<token>'
```

## 3. Repositório
```bash
mkdir -p ~/Bona-OS && git clone https://github.com/Bona-OS/Claude ~/Bona-OS/Claude
install -m 755 ~/Bona-OS/Claude/mini/bona-claude-worker ~/.local/bin/bona-claude-worker
```

## 4. 👤 Notion via MCP oficial (OAuth)
```bash
cd ~/Bona-OS/Claude
claude mcp add --transport http notion https://mcp.notion.com/mcp
claude            # dentro da sessão: /mcp → notion → autenticar; depois /exit
```

## 5. Conferir
```bash
bona-claude-worker route      # esperado: "pronto: <versão>"
cat > /tmp/teste.json <<'EOF'
{"request_id":"TESTE-MINI-001","from":"codex","goal":"Ler a base Frentes e dizer quantas estão Ativas","done_when":"número informado","constraints":"somente leitura","report_to":"status"}
EOF
bona-claude-worker delegate /tmp/teste.json
bona-claude-worker status TESTE-MINI-001   # repetir até FEITO ou BLOQUEIO
cat ~/.bona/claude/TESTE-MINI-001/resultado.json
```

## 6. Ligar ao Bona Memory MCP
Acrescentar o destino `claude` ao roteamento existente (`codex.worker_*` → também
`claude.worker_*`), chamando `bona-claude-worker route|delegate|status`. Mesmo contrato de pedido.

## 7. Always on the go
Sessões do Mini sempre alcançáveis pelo app e vigia de saúde: [`always-on/README.md`](always-on/README.md).

## Limites desta versão
- Ferramentas liberadas: `Read Glob Grep mcp__notion` (variável `BONA_ALLOWED_TOOLS`). Sem Gmail
  nem WhatsApp por enquanto. Sem ferramenta de envio, o «só rascunho» vale por construção.
- WACLI e Obsidian: entram quando o Radar for migrado, com um comando de leitura específico
  liberado (não um shell livre).
- 👤 Passo humano que falhar = `BLOQUEIO` informado; não contornar com chave de API.
