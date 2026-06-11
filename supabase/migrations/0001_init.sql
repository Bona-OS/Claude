-- FotoRestaura — schema inicial
create extension if not exists "pgcrypto";

-- Clientes identificados pelo número do WhatsApp.
create table if not exists customers (
  id          uuid primary key default gen_random_uuid(),
  wa_id       text unique not null,
  name        text,
  created_at  timestamptz not null default now()
);

-- Cada foto enviada vira um "job" de restauração.
create table if not exists jobs (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid references customers(id) on delete set null,
  status        text not null default 'received',
  -- received | processing | delivered | paid | failed
  original_url  text,
  restored_url  text,
  price_cents   integer not null default 2900,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Cobranças (Pix via Mercado Pago).
create table if not exists payments (
  id           uuid primary key default gen_random_uuid(),
  job_id       uuid references jobs(id) on delete cascade,
  provider     text not null default 'mercadopago',
  provider_id  text,
  status       text not null default 'pending',
  -- pending | approved | rejected
  amount_cents integer not null,
  created_at   timestamptz not null default now()
);

create index if not exists jobs_customer_idx on jobs(customer_id);
create index if not exists jobs_status_idx on jobs(status);
create index if not exists payments_job_idx on payments(job_id);

-- Bucket de fotos. Público para entregar via link no WhatsApp no MVP.
-- (Depois dá pra trocar por URLs assinadas com expiração.)
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;
