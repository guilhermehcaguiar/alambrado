-- 0003_rename_promocional_torcedor_to_torcedor.sql
-- Renomeia a categoria canônica de "promocional-torcedor" para "torcedor".
-- Idempotente: pode ser re-executada sem erro; falha de forma clara se houver
-- estado inesperado (ex.: restarem registros com a categoria antiga).

begin;

-- Remove qualquer constraint check da coluna category (antiga ou nova),
-- tornando a migração re-executável mesmo se o nome automático divergir.
do $$
declare
  constraint_row record;
begin
  for constraint_row in
    select conname
    from pg_constraint
    where conrelid = 'public.products'::regclass
      and contype = 'c'
      and conname like 'products_category%'
  loop
    execute format('alter table public.products drop constraint %I', constraint_row.conname);
  end loop;
end $$;

-- Atualiza registros existentes (não apaga produtos; preserva id/slug/created_at/preço).
update public.products
set category = 'torcedor'
where category = 'promocional-torcedor';

-- Confirma que não restaram registros com a categoria antiga.
do $$
declare
  remaining integer;
begin
  select count(*) into remaining
  from public.products
  where category = 'promocional-torcedor';

  if remaining > 0 then
    raise exception 'Migration 0003: % registro(s) ainda com categoria "promocional-torcedor". Abortando transação.', remaining;
  end if;
end $$;

-- Cria a nova constraint com a categoria canônica.
alter table public.products
  add constraint products_category_check
  check (category in ('torcedor', 'jogador', 'retro', 'infantil'));

-- Confirma que a nova constraint está ativa.
do $$
declare
  exists_constraint boolean;
begin
  select exists (
    select 1
    from pg_constraint
    where conrelid = 'public.products'::regclass
      and conname = 'products_category_check'
      and contype = 'c'
  ) into exists_constraint;

  if not exists_constraint then
    raise exception 'Migration 0003: constraint "products_category_check" não foi criada.';
  end if;
end $$;

commit;
