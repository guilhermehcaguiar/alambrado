-- 0008: configuracao de precos de extras (tamanho/personalizacao/patch)

create table if not exists public.price_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

grant select on public.price_config to anon;
grant select, insert, update on public.price_config to service_role;

insert into public.price_config (key, value) values
  ('extras', '{"oversizedSizes":["3XG","4XG"],"oversizedSurcharge":19.9,"personalizationPrice":0,"patchPrice":0}'::jsonb)
on conflict (key) do nothing;