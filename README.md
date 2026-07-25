# Forneria Paulistana 🍕

Site de **pedidos on-line** da Forneria Paulistana — pizzaria paulistana de forno a lenha
em **Jurerê, Florianópolis/SC**. O cliente monta o pedido no cardápio (incluindo pizza
**meio a meio**), escolhe entrega ou retirada e paga por **Pix** (Mercado Pago) ou na entrega.

## O que já está pronto

- **Cardápio interativo** — pizzas salgadas, doces, entradas, bebidas e sobremesas.
- **Carrinho** com meio a meio, tamanhos (média/grande/família), taxa de entrega e pedido mínimo,
  persistido no navegador (`localStorage`).
- **Checkout** com dados do cliente, entrega/retirada e escolha de pagamento.
- **Pagamento por Pix** via Mercado Pago (QR Code + copia e cola) com confirmação automática
  por webhook + polling.
- **Página de acompanhamento** do pedido (`/pedido/[id]`).
- **Banco de dados** em Supabase (Postgres) — com *fallback* em memória para rodar sem chaves.

> Preços, endereço, horários e número de WhatsApp são **placeholders** em `lib/store.ts` e
> `lib/menu.ts` — troque pelos dados reais da loja antes de publicar.

## Arquitetura

```
Navegador (cliente)
   │  monta o carrinho (React, lib/cart.ts + components/CartProvider)
   ▼
/checkout ──POST──► /api/orders
   │                   ├─ revalida itens e preços a partir do cardápio (nunca confia no cliente)
   │                   ├─ grava o pedido (lib/orders.ts → Supabase ou memória)
   │                   └─ se Pix: cria cobrança (lib/mercadopago.ts) e devolve QR + copia e cola
   ▼
/pedido/[id] ──GET──► /api/orders/[id]  (mostra status; consulta o Pix enquanto pendente)

Mercado Pago ──webhook──► /api/payments/webhook ──► confirma e marca o pedido como "paid"
```

| Camada | Tecnologia |
|---|---|
| App + API | Next.js 14 (App Router, TypeScript) — deploy na Vercel |
| Banco | Supabase (Postgres) |
| Pagamento | Mercado Pago (Pix) |

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # opcional para o básico; preencha para Pix/DB
npm run dev                  # http://localhost:3000
```

Sem `.env.local` o site funciona em **modo demonstração**: o cardápio e o carrinho
rodam normalmente e os pedidos com "pagar na entrega" são registrados **em memória**
(some ao reiniciar o servidor). Para persistir de verdade e habilitar o Pix, configure
as variáveis abaixo.

## Variáveis de ambiente

Veja [`.env.example`](.env.example):

| Variável | Para quê |
|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Persistir pedidos no Postgres |
| `MP_ACCESS_TOKEN` | Habilitar pagamento por Pix (Mercado Pago) |
| `NEXT_PUBLIC_SITE_URL` | Montar a URL do webhook do Pix |
| `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_BRAND` | Contato e nome exibidos no site |

Aplique o schema em `supabase/migrations/0001_init.sql` (painel do Supabase → SQL Editor).

## Checklist para ir ao ar

Passo a passo de publicação em [`docs/PLANO.md`](docs/PLANO.md).
