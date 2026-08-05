-- 0007: faixas de promocao (tiers) e busca de itens

alter table public.sales
  add column if not exists shirt_qty int not null default 1,
  add column if not exists shirt_cost numeric not null default 0,
  add column if not exists tax_cost numeric not null default 0;

alter table public.products
  add column if not exists promo_tiers jsonb null;

create index if not exists products_promo_tiers_idx
  on public.products ((promo_tiers is not null));