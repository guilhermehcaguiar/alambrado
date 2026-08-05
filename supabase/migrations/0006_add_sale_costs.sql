-- 0006: custos e lucro nas vendas

alter table public.sales
  add column if not exists shirt_qty int not null default 1,
  add column if not exists shirt_cost numeric not null default 0,
  add column if not exists tax_cost numeric not null default 0;