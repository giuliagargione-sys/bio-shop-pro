-- Link Na Bio Que Vende — multi-conta (uma loja por aluna, no mesmo app)
-- Rode DEPOIS do 0001_init.sql. Também idempotente (pode rodar de novo sem medo).

-- ============================================================
-- 1) store_config passa a ter dono (user_id) e endereço (slug)
-- ============================================================
alter table store_config add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table store_config add column if not exists slug text;

-- cada usuária tem no máximo uma loja, e cada endereço (slug) é único
create unique index if not exists store_config_user_id_key on store_config (user_id);
create unique index if not exists store_config_slug_key on store_config (slug);

-- a linha "seed" criada pelo 0001_init.sql (sem dono) não serve mais nesse
-- modelo — remove ela pra não sobrar lixo (só se ainda não tiver dono)
delete from store_config where user_id is null;

-- troca as políticas antigas (linha única, sem dono) pelas políticas por dono
drop policy if exists "config is publicly readable" on store_config;
create policy "config is publicly readable"
  on store_config for select
  using (true); -- a loja pública (/loja/:slug) precisa ler a config de qualquer aluna

drop policy if exists "only authenticated can update config" on store_config;
create policy "users can update their own config"
  on store_config for update
  using (auth.uid() = user_id);

drop policy if exists "only authenticated can insert config" on store_config;
create policy "users can insert their own config"
  on store_config for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- 2) leads passam a apontar pra qual loja (aluna) pertencem
-- ============================================================
alter table leads add column if not exists store_user_id uuid references auth.users(id) on delete cascade;
create index if not exists leads_store_user_id_idx on leads (store_user_id);

drop policy if exists "anyone can insert a lead" on leads;
create policy "anyone can insert a lead for a store"
  on leads for insert
  with check (store_user_id is not null);

drop policy if exists "only authenticated can read leads" on leads;
create policy "users can read their own leads"
  on leads for select
  using (auth.uid() = store_user_id);

drop policy if exists "only authenticated can update leads" on leads;
create policy "users can update their own leads"
  on leads for update
  using (auth.uid() = store_user_id);
