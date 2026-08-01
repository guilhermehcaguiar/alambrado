create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  club text not null default '',
  season text not null default '',
  category text not null check (category in ('promocional-torcedor', 'infantil', 'jogador', 'retro')),
  description text not null default '',
  price numeric not null default 0,
  image_url text not null default '',
  featured boolean not null default false,
  available boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists products_available_category_idx
  on public.products (available, category);

alter table public.products enable row level security;

create policy "Leitura publica de produtos disponiveis"
  on public.products
  for select
  using (available = true);

create policy "Bloqueio de escrita publica na tabela products"
  on public.products
  for all
  using (false)
  with check (false);

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

create policy "Leitura publica do bucket products"
  on storage.objects
  for select
  using (bucket_id = 'products');

create policy "Bloqueio de escrita publica no bucket products"
  on storage.objects
  for all
  using (bucket_id = 'products' and false)
  with check (bucket_id = 'products' and false);
