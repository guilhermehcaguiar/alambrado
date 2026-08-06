-- 0010: corrige leitura publica da price_config (RLS bloqueava o site)

alter table public.price_config enable row level security;

create policy "Leitura publica da configuracao de precos"
  on public.price_config
  for select
  to anon
  using (true);

create policy "Bloqueio de escrita publica na tabela price_config"
  on public.price_config
  for all
  to anon
  using (false)
  with check (false);

grant select on public.price_config to anon;
grant select, insert, update on public.price_config to service_role;
