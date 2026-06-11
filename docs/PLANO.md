# Plano — FotoRestaura

Empresa de **restauração de fotos antigas via WhatsApp**. Documento vivo: negócio, números,
arquitetura e o que falta pra ir ao ar. O passo a passo operacional (pesquisa → faturamento,
com criativos via Higgsfield) está em [`EXECUCAO.md`](EXECUCAO.md).

---

## 1. A ideia em uma frase

O cliente manda a foto velha/danificada no WhatsApp, a IA restaura, ele recebe o **antes e
depois** na hora e paga **R$ 29 por Pix** se gostar. Sem app, sem cadastro, zero fricção.

- **Público:** famílias, idosos, pessoas em luto, quem quer presentear.
- **Diferencial:** WhatsApp (onde o público já está) + resultado em < 1 min + "só paga se gostar".

---

## 2. A meta de R$ 1.000/dia — a conta real

A esteira de código aguenta isso tranquilo. O dinheiro depende de **tráfego + verba**. A conta:

| Variável | Valor |
|---|---|
| Preço por foto | R$ 29 |
| **Vendas/dia p/ R$ 1.000** | **~35 fotos** (~1.050/mês ≈ R$ 30k/mês) |
| Custo por foto (Gemini + WhatsApp + storage) | ~R$ 0,30–0,60 → **margem ~98%** sobre COGS |
| Conversão típica landing/anúncio → pagante | 2–4% |
| Visitas/dia necessárias | ~900–1.750 |

**O gargalo NÃO é tecnologia — é aquisição.** Para gerar ~35 vendas/dia você precisa de:

1. **Verba de anúncio** (Meta/TikTok). Estime CAC de R$ 8–25 por cliente pagante no início.
   - Cenário conservador: 35 vendas × R$ 15 CAC = **~R$ 525/dia de Ads** para faturar R$ 1.000/dia.
   - Lucro real só escala quando entram **orgânico (antes/depois viral) + indicação + recompra**.
2. **Criativos** girando (a `lib/marketing.ts` já gera legenda/hashtags/prompt de criativo).
3. **Prova social** (depoimentos, antes/depois reais) — começa com os primeiros clientes.

> Resumo honesto: dá pra **construir a máquina que cobra 35+ fotos/dia hoje**. Bater
> R$ 1.000/dia de forma **lucrativa** é trabalho de marketing + verba ao longo de semanas, não
> um deploy. Eu entrego a máquina e o motor de criativos; a verba e as contas são suas.

---

## 3. Modelo de receita

- **Avulso:** R$ 29/foto (impulso, Pix).
- **Pacote família:** 5 fotos por R$ 99 (aumenta ticket médio).
- **Upsell:** colorização de P&B, impressão física, ampliação em alta.

---

## 4. Arquitetura (já no repo)

- **Next.js** (landing + APIs) na Vercel.
- **Supabase** (Postgres + Storage) — schema em `supabase/migrations/0001_init.sql`.
- **Gemini "Nano Banana"** (`lib/gemini.ts`) — restauração e colorização.
- **WhatsApp Cloud API** (`lib/whatsapp.ts`, `app/api/whatsapp/webhook`).
- **Mercado Pago Pix** (`lib/mercadopago.ts`, `app/api/payments/webhook`).
- **Marketing** (`lib/marketing.ts`) — gera peças antes/depois.

---

## 5. Checklist para ir ao ar 🚦

Marcações: ✅ pronto no código · 🔑 precisa de você (conta/chave/verba)

- [x] ✅ Produto: receber foto → restaurar → entregar antes/depois → cobrar Pix
- [x] ✅ Landing page com CTA pro WhatsApp
- [x] ✅ Schema do banco + bucket de fotos
- [x] ✅ Gerador automático de criativo/legenda de campanha
- [ ] 🔑 **Chave do Gemini** (https://aistudio.google.com/apikey) → `GEMINI_API_KEY`
- [ ] 🔑 **Projeto Supabase** + aplicar a migration → `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] 🔑 **WhatsApp**: número na Cloud API (ou Z-API) → token + phone id + verify token
- [ ] 🔑 **Mercado Pago**: app + `MP_ACCESS_TOKEN` (Pix)
- [ ] 🔑 **Deploy na Vercel** + configurar o webhook do WhatsApp apontando pra `/api/whatsapp/webhook`
- [ ] 🔑 **Contas de Ads** (Meta/TikTok) + verba + método de pagamento
- [ ] ⏳ Domínio (opcional, ~R$ 40/ano) — dá pra checar disponibilidade e apontar pra Vercel

---

## 6. Escala (quando começar a bombar)

- Tirar o processamento pesado do webhook (a Meta exige resposta rápida) e jogar numa **fila /
  Supabase Edge Function** ou QStash, com retry.
- Trocar URLs públicas do Storage por **URLs assinadas** com expiração.
- Validar **assinatura** dos webhooks (Meta `X-Hub-Signature-256`, Mercado Pago).
- Painel interno simples (jobs, receita do dia, taxa de conversão).

---

## 7. Roadmap sugerido

1. **Semana 1 — ligar a máquina:** plugar as 4 chaves, deploy, testar fluxo ponta a ponta com fotos reais.
2. **Semana 1–2 — validar:** 10–20 clientes (amigos/comunidade), ajustar prompt de restauração e preço.
3. **Semana 2+ — tração:** abrir Instagram/TikTok com antes/depois, ligar Ads com verba pequena (R$ 30–50/dia) e medir CAC.
4. **Escalar verba** conforme CAC < ticket, somar pacotes e recompra.
