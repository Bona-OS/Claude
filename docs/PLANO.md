# Plano de go-live — Forneria Paulistana

Checklist para colocar o site de pedidos no ar de verdade.

## 1. Personalizar a loja

- [ ] `lib/store.ts`: nome, endereço, horário, WhatsApp, Instagram, bairros atendidos,
      taxa de entrega (`deliveryFeeCents`), pedido mínimo (`minOrderCents`) e tempos estimados.
- [ ] `lib/menu.ts`: cardápio real (pizzas, tamanhos, preços em **centavos**, entradas,
      bebidas e sobremesas).
- [ ] Revisar textos da home em `app/page.tsx`.

## 2. Banco de dados (Supabase)

- [ ] Criar projeto em https://supabase.com.
- [ ] Rodar `supabase/migrations/0001_init.sql` no SQL Editor.
- [ ] Copiar `Project URL` → `SUPABASE_URL` e a `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`.

## 3. Pagamento por Pix (Mercado Pago)

- [ ] Criar aplicação em https://www.mercadopago.com.br/developers/panel/app.
- [ ] Copiar o **Access Token de produção** → `MP_ACCESS_TOKEN`.
- [ ] Configurar o webhook apontando para `https://SEU_DOMINIO/api/payments/webhook`
      (eventos de *payment*).
- [ ] Testar com o cartão/fluxo de sandbox antes de ativar produção.

## 4. Deploy (Vercel)

- [ ] Importar o repositório na Vercel.
- [ ] Preencher as variáveis de ambiente (`.env.example` como referência).
- [ ] Definir `NEXT_PUBLIC_SITE_URL` com o domínio final (para o webhook do Pix).
- [ ] Apontar o domínio (ex.: `forneriapaulistana.com.br`).

## 5. Antes de divulgar

- [ ] Fazer um pedido de teste ponta a ponta (Pix e "pagar na entrega").
- [ ] Confirmar recebimento do pedido pela equipe da cozinha (ver seção abaixo).
- [ ] Conferir taxa/tempo de entrega por bairro.

## Ideias de evolução (pós-MVP)

- Painel da cozinha (`/admin`) listando pedidos em tempo real e mudando status.
- Notificação do novo pedido no WhatsApp da loja (WhatsApp Cloud API).
- Cupons e frete grátis acima de X.
- Horário de funcionamento automático (bloquear checkout fora do expediente).
- Cálculo de frete por distância/CEP em vez de taxa fixa.
- Login opcional e histórico de pedidos do cliente.
