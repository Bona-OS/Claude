-- Forneria Paulistana — schema inicial (pedidos on-line)
create extension if not exists "pgcrypto";

-- Um registro por pedido. Os itens ficam em JSONB (snapshot no momento do pedido,
-- para o histórico não mudar se o cardápio/preços mudarem depois).
create table if not exists orders (
  id                 uuid primary key default gen_random_uuid(),
  status             text not null default 'pending_payment',
  -- pending_payment | paid | received | cancelled
  fulfillment        text not null default 'delivery',
  -- delivery | pickup
  payment_method     text not null default 'pix',
  -- pix | on_delivery
  customer           jsonb not null,
  -- { name, phone, email?, address?, neighborhood?, notes?, changeFor? }
  items              jsonb not null,
  -- [ { key, kind, refId, name, unitCents, qty, meta? }, ... ]
  subtotal_cents     integer not null,
  delivery_fee_cents integer not null default 0,
  total_cents        integer not null,
  -- Dados do Pix (Mercado Pago), quando o pagamento é on-line.
  pix_payment_id     text,
  pix_copia_e_cola   text,
  pix_qr_base64      text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists orders_status_idx on orders(status);
create index if not exists orders_created_idx on orders(created_at desc);
create index if not exists orders_pix_payment_idx on orders(pix_payment_id);

-- Mantém updated_at em dia.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- Observação sobre segurança:
-- A tabela é acessada apenas pelo backend (rotas /api/*) com a SERVICE ROLE KEY,
-- que ignora RLS. Não há acesso direto do navegador. Se um dia expuser leitura
-- pública, habilite RLS e políticas específicas antes.
