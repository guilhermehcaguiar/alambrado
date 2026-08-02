-- 0004_add_league_to_products.sql
-- Adiciona a coluna "league" à tabela products para permitir filtro por liga/competição
-- no catálogo. Idempotente: pode ser re-executada sem erro.

begin;

alter table public.products
  add column if not exists league text not null default '';

create index if not exists products_available_league_idx
  on public.products (available, league);

commit;
