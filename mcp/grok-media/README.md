# grok-media-mcp

Servidor MCP que permite ao Claude (Claude Code, Claude Desktop etc.) gerar **imagens**, **vídeos** e **áudio/fala** diretamente nos modelos de mídia da xAI (Grok Imagine + TTS).

## ⚠️ Antes de tudo: SuperGrok Heavy ≠ acesso à API

A assinatura **SuperGrok / SuperGrok Heavy** (grok.com) é um produto de consumo e **não inclui acesso à API da xAI**. A API tem conta, cobrança e créditos próprios:

1. Crie uma conta/chave em <https://console.x.ai>.
2. Novas contas ganham **US$ 25 em créditos promocionais** (expiram em 30 dias).
3. Opcionalmente, aderindo ao programa de compartilhamento de dados da xAI, você recebe **US$ 150/mês em créditos** adicionais.

Ou seja: mantenha o SuperGrok Heavy para o uso no app/site, mas para este conector você precisa de uma `XAI_API_KEY` do console.

## Ferramentas expostas

| Ferramenta | Endpoint xAI | O que faz |
|---|---|---|
| `generate_image` | `POST /v1/images/generations` | Texto → imagem (modelo `grok-imagine-image-quality`, até 10 por chamada, `aspect_ratio` configurável) |
| `generate_video` | `POST /v1/videos/generations` + polling `GET /v1/videos/{id}` | Texto → vídeo ou imagem → vídeo (modelo `grok-imagine-video`, com áudio nativo; duração/resolução configuráveis) |
| `generate_speech` | `POST /v1/tts` | Texto → fala (vozes expressivas do Grok, ex.: `ara`, `eve`; suporta vozes clonadas) |

Os arquivos gerados são salvos em `GROK_MEDIA_OUTPUT_DIR` (padrão: `./grok-media-output/`) e a ferramenta retorna os caminhos.

## Instalação

```bash
cd mcp/grok-media
npm install
npm run build   # gera dist/index.js
```

## Registro no Claude Code

Opção A — via CLI (escopo do usuário, vale para todos os projetos):

```bash
claude mcp add grok-media \
  --env XAI_API_KEY=sua-chave-aqui \
  -- node /caminho/para/mcp/grok-media/dist/index.js
```

Opção B — via `.mcp.json` na raiz do projeto (já incluído neste repositório). Basta exportar `XAI_API_KEY` no seu ambiente antes de abrir o Claude Code:

```bash
export XAI_API_KEY=sua-chave-aqui
claude
```

No **Claude Desktop**, adicione em `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "grok-media": {
      "command": "node",
      "args": ["/caminho/para/mcp/grok-media/dist/index.js"],
      "env": { "XAI_API_KEY": "sua-chave-aqui" }
    }
  }
}
```

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `XAI_API_KEY` | — (obrigatória) | Chave da API criada em console.x.ai |
| `XAI_API_BASE` | `https://api.x.ai/v1` | Base da API |
| `XAI_IMAGE_MODEL` | `grok-imagine-image-quality` | Modelo de imagem |
| `XAI_VIDEO_MODEL` | `grok-imagine-video` | Modelo de vídeo |
| `XAI_VIDEO_TIMEOUT_MS` | `600000` (10 min) | Tempo máximo de espera pelo vídeo |
| `GROK_MEDIA_OUTPUT_DIR` | `./grok-media-output` | Pasta onde os arquivos são salvos |

## Exemplos de uso (dentro do Claude)

> "Gere uma imagem 16:9 de um farol ao pôr do sol em estilo aquarela"
>
> "Anime esta imagem (https://exemplo.com/foto.png) em um vídeo de 10 segundos em 720p"
>
> "Gere um áudio com a voz ara dizendo 'Bem-vindo à FotoRestaura' em inglês"

## Notas

- A geração de vídeo é assíncrona na xAI: a ferramenta faz o polling automaticamente (a cada 5 s) e só retorna quando o vídeo está pronto — gerações longas podem levar alguns minutos.
- Os vídeos do Grok Imagine já incluem **áudio nativo** (trilha/efeitos); para narração/fala pura, use `generate_speech`.
- Modelos e parâmetros mudam com frequência — confira <https://docs.x.ai> se algum modelo for descontinuado (ex.: `grok-imagine-image-pro` foi descontinuado em 15/05/2026).
