-- Link Na Bio Que Vende — schema inicial
-- Rode este arquivo no SQL Editor do Supabase (ou via CLI: supabase db push)

-- ============================================================
-- 1) Configuração da loja (a personalização feita na dashboard)
-- ============================================================
create table if not exists store_config (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table store_config enable row level security;

-- Qualquer visitante pode LER a configuração — é o que faz a loja
-- publica (rota "/") funcionar pra qualquer pessoa, sem login.
drop policy if exists "config is publicly readable" on store_config;
create policy "config is publicly readable"
  on store_config for select
  using (true);

-- Só quem está logado (a aluna, na dashboard) pode criar/editar.
drop policy if exists "only authenticated can update config" on store_config;
create policy "only authenticated can update config"
  on store_config for update
  using (auth.role() = 'authenticated');

drop policy if exists "only authenticated can insert config" on store_config;
create policy "only authenticated can insert config"
  on store_config for insert
  with check (auth.role() = 'authenticated');

-- Garante que já existe uma linha de configuração pra loja usar assim
-- que o projeto é criado (evita a loja publica aparecer vazia).
insert into store_config (data)
select '{}'::jsonb
where not exists (select 1 from store_config);

-- ============================================================
-- 2) Leads capturados no quiz de estilo
-- ============================================================
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  whatsapp text not null,
  answers jsonb not null default '{}'::jsonb,
  contacted boolean not null default false
);

alter table leads enable row level security;

-- Qualquer visitante pode CRIAR um lead (ao terminar o quiz) — sem login,
-- senão a captura na loja publica não funcionaria.
drop policy if exists "anyone can insert a lead" on leads;
create policy "anyone can insert a lead"
  on leads for insert
  with check (true);

-- Só quem está logado (a aluna) pode ver e atualizar os leads.
drop policy if exists "only authenticated can read leads" on leads;
create policy "only authenticated can read leads"
  on leads for select
  using (auth.role() = 'authenticated');

drop policy if exists "only authenticated can update leads" on leads;
create policy "only authenticated can update leads"
  on leads for update
  using (auth.role() = 'authenticated');

create index if not exists leads_created_at_idx on leads (created_at desc);
