-- 0009: texto customizado de promocao por produto
alter table public.products
  add column if not exists promo_note text null;