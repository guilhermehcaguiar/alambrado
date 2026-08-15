-- 0011: tabela de estoque

create table if not exists public.stock (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  size text not null,
  quantity int not null default 0,
  updated_at timestamptz not null default now(),
  unique (product_slug, size)
);

create index if not exists stock_product_slug_idx
  on public.stock (product_slug);

alter table public.stock enable row level security;

create policy "Bloqueio de acesso publico na tabela stock"
  on public.stock
  for all
  using (false)
  with check (false);

grant select, insert, update, delete on public.stock to service_role;