# Plano de Execução — da pesquisa ao faturamento

Complementa o [`PLANO.md`](PLANO.md) (negócio e números) com o **passo a passo operacional**,
agora incorporando o **MCP do Higgsfield** como motor de criativos (imagem, vídeo e
preditor de viralidade).

Legenda: 🤖 = eu (Claude) executo · 🔑 = depende de você (conta, chave, verba, aprovação)

---

## Fase 0 — Pesquisa e validação (1–2 dias)

Objetivo: confirmar preço, posicionamento e qualidade antes de gastar 1 real em anúncio.

- 🤖 **Concorrência:** mapear Remini, MyHeritage, PhotoRestore e operações BR que vendem
  restauração via WhatsApp/Instagram — preço, promessa, tempo de entrega, reclamações.
- 🤖 **Demanda:** termos de busca ("restaurar foto antiga", "recuperar foto rasgada"),
  sazonalidade (Dia das Mães/Pais, finados, Natal) para calibrar o calendário de campanha.
- 🔑🤖 **Qualidade real:** rodar 10–20 fotos suas/da família no Gemini ("Nano Banana"),
  ajustar o prompt de restauração de `lib/gemini.ts` até o antes/depois convencer.
- 🤖 **Decisão de preço:** validar R$ 29 avulso + pacote 5/R$ 99 contra a concorrência.

**Saída:** prompt de restauração validado, preço confirmado, 3 ângulos de comunicação
(emocional/luto, presente, curiosidade tech).

---

## Fase 1 — Ligar a máquina (2–4 dias)

O código já existe; falta infraestrutura e chaves.

- 🔑 Chave Gemini → `GEMINI_API_KEY`
- 🔑 Projeto Supabase → 🤖 aplicar `supabase/migrations/0001_init.sql` + bucket `photos`
- 🔑 Número no WhatsApp Cloud API → token, phone id, verify token
- 🔑 App Mercado Pago → `MP_ACCESS_TOKEN`
- 🔑 Deploy Vercel → 🤖 configurar webhooks (`/api/whatsapp/webhook`, `/api/payments/webhook`)
- 🤖 Teste ponta a ponta: foto entra → restaura → antes/depois volta → Pix gerado → webhook
  confirma pagamento → job `paid`

**Saída:** fluxo completo funcionando com fotos reais.

---

## Fase 2 — Fábrica de criativos com Higgsfield (paralelo à Fase 1)

Aqui entra o MCP do Higgsfield, substituindo/turbinando o que `lib/marketing.ts` só descrevia:

- 🤖 **Imagens de anúncio** (`generate_image`): peças antes/depois, carrosséis, variações de
  gancho por ângulo (emoção, presente, "só paga se gostar").
- 🤖 **Vídeos/reels** (`generate_video` + `motion_control`): animação do "antes" ganhando vida
  no "depois" — o formato do reel que inspirou o projeto.
- 🤖 **Preditor de viralidade** (`virality_predictor`): pontuar gancho, retenção e força do
  criativo **antes** de colocar verba — só sobem para Ads os criativos com melhor score.
- 🤖 **Upsell técnico** (`upscale_image`): ampliação em alta resolução como produto adicional
  (R$ 10–15 extra por foto).
- 🔑 Créditos Higgsfield (monitorar com `balance`) e aprovação final das peças.

**Saída:** 8–12 criativos prontos e ranqueados, calendário de 2 semanas de conteúdo.

---

## Fase 3 — Validação com gente de verdade (semana 1–2)

- 🔑 Divulgar para 10–20 primeiros clientes (amigos, grupos de família, comunidade local).
- 🤖 Ajustar prompt, copy e preço com base no feedback; coletar depoimentos e antes/depois
  reais (com autorização) — vira prova social para os anúncios.
- Critério para avançar: **≥ 50% dos que recebem o antes/depois pagam o Pix.**

---

## Fase 4 — Tráfego pago e orgânico (semana 2+)

- 🔑 Conta Meta Ads + verba inicial **R$ 30–50/dia**.
- 🤖 Subir os criativos vencedores da Fase 2; 1 campanha, 2–3 conjuntos, CTA direto pro
  `wa.me`.
- 🤖 Orgânico: 1 reel/dia de antes/depois (Higgsfield gera, preditor ranqueia).
- 🤖 Medir: CAC, conversão clique→conversa→pagamento. **Regra: escala verba só com
  CAC < R$ 15** (metade do ticket de R$ 29).
- Rotação semanal de criativos — Higgsfield torna isso barato e rápido.

---

## Fase 5 — Faturamento e escala (mês 1+)

Meta do `PLANO.md`: **R$ 1.000/dia = ~35 fotos/dia**.

- 🤖 Painel interno: jobs do dia, receita, conversão, CAC (dados já estão no Supabase).
- 🤖 Robustez: fila para tirar o processamento do webhook, URLs assinadas no Storage,
  validação de assinatura dos webhooks (Meta e Mercado Pago).
- 🤖 Receita por cliente: pacote família (5/R$ 99), colorização P&B, ampliação (upscale),
  mensagem de recompra D+7.
- 🔑 Escalar verba conforme CAC se mantém; datas-âncora (Dia das Mães etc.) com campanhas
  dedicadas.

---

## Divisão honesta de responsabilidades

| Eu entrego (🤖) | Você fornece (🔑) |
|---|---|
| Código, deploy, webhooks, testes E2E | Chaves: Gemini, Supabase, WhatsApp, Mercado Pago |
| Pesquisa de mercado e preço | Contas (Meta Ads, Vercel, Higgsfield) |
| Criativos via Higgsfield + ranking de viralidade | Verba de anúncio e aprovação das peças |
| Painel, métricas, otimização de funil | Atendimento humano em casos sensíveis (luto) |

O gargalo continua sendo **aquisição, não tecnologia** — este plano existe para que cada real
de verba entre só depois de prompt validado (Fase 0), máquina testada (Fase 1) e criativo
ranqueado (Fase 2).
