# FotoRestaura 📸✨

Restauração de fotos antigas **pelo WhatsApp**, com IA (Google Gemini / "Nano Banana") e
cobrança por **Pix**. O cliente manda a foto → a IA restaura → ele recebe o *antes e depois*
na hora → paga via Pix se gostar.

> **Status honesto:** este repositório é a **máquina** (produto + cobrança + landing + geração
> de criativos de campanha). Ela processa e cobra fotos de ponta a ponta. O que **não** vem no
> código é a receita em si — faturar depende de tráfego, verba de anúncio e das suas contas
> (Gemini, WhatsApp, Mercado Pago, Ads). Veja [`docs/PLANO.md`](docs/PLANO.md) para a conta
> completa e o checklist de "ir ao ar".

## Arquitetura

```
WhatsApp (cliente)
      │  foto
      ▼
/api/whatsapp/webhook ──► baixa mídia ──► Supabase Storage (original)
      │
      ├─► Gemini (lib/gemini.ts) ──► restaura ──► Supabase Storage (restaurada)
      ├─► Mercado Pago (lib/mercadopago.ts) ──► cobrança Pix
      └─► WhatsApp ──► envia antes/depois + Pix copia-e-cola

/api/payments/webhook ──► confirma Pix ──► marca job como "paid"

/ (landing Next.js)  ──► CTA para o WhatsApp
lib/marketing.ts     ──► gera criativo + legenda + hashtags (antes/depois)
```

| Camada | Tecnologia |
|---|---|
| App + API | Next.js 14 (App Router, TypeScript) — deploy na Vercel |
| Restauração | Google Gemini Image ("Nano Banana") via `@google/genai` |
| Banco + arquivos | Supabase (Postgres + Storage) |
| Canal | WhatsApp Cloud API (Meta) |
| Pagamento | Mercado Pago (Pix) |

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha as chaves
npm run dev                  # http://localhost:3000
```

Aplique o schema do banco em `supabase/migrations/0001_init.sql` (via painel do Supabase ou MCP).

## Variáveis de ambiente

Veja [`.env.example`](.env.example). Em resumo: `GEMINI_API_KEY`, `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
`WHATSAPP_VERIFY_TOKEN`, `MP_ACCESS_TOKEN`, `PRICE_BRL`, `NEXT_PUBLIC_WHATSAPP_LINK`.

## Ferramentas de dev (Claude Code)

O repo configura automaticamente os plugins do time (Superpowers, Claude Mem, Caveman,
Security Guidance, /last30days e /watch) via `.claude/settings.json`, e o Context7 (MCP) via
`.mcp.json`. Catálogo completo — incluindo o "Top 10 AI Skills" opcional — em
[`docs/PLUGINS.md`](docs/PLUGINS.md).

## Próximos passos

Checklist de go-live e roadmap em [`docs/PLANO.md`](docs/PLANO.md).
