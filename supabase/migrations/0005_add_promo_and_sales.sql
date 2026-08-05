-- 0005: promoções por item + vendas

alter table public.products
  add column if not exists promo_price numeric,
  add column if not exists promo_min_qty int,
  add column if not exists promo_starts_at date;

create index if not exists products_promo_idx
  on public.products (available, category)
  where promo_price is not null and promo_price >= 0;

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null default '',
  order_summary text not null default '',
  order_date date not null default current_date,
  order_value numeric not null default 0,
  tracking_sent_date date,
  status text not null default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sales_order_date_idx
  on public.sales (order_date desc);

create index if not exists sales_status_idx
  on public.sales (status);

alter table public.sales enable row level security;

create policy "Bloqueio de acesso publico na tabela sales"
  on public.sales
  for all
  using (false)
  with check (false);

grant select, insert, update, delete on public.sales to service_role;
