-- Link Na Bio Que Vende — painel central (Giulia) + status de pagamento
-- Rode DEPOIS do 0001_init.sql e do 0002_multi_tenant.sql. Idempotente.

-- ============================================================
-- 1) profiles — quem é admin (você) e quem é aluna
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "users can read their own profile" on profiles;
create policy "users can read their own profile"
  on profiles for select
  using (auth.uid() = id);

-- ninguém (nem a própria usuária) pode se auto-promover a admin pelo
-- client — o campo is_admin só muda via SQL Editor (você) ou service role.

-- cria a linha em profiles sozinho toda vez que alguém cria conta
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- preenche profiles pra quem já tinha conta antes dessa migração
insert into profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- ============================================================
-- 2) subscribers — status de pagamento (espelho da Hubla, por e-mail)
-- ============================================================
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'desconhecido', -- 'ativo' | 'inadimplente' | 'cancelado' | 'desconhecido'
  plan text,
  hubla_event text,
  hubla_event_at timestamptz,
  raw jsonb,
  updated_at timestamptz not null default now()
);

create unique index if not exists subscribers_email_key on subscribers (lower(email));

-- RLS ligado, SEM políticas: ninguém lê/escreve direto pelo client.
-- Só as Edge Functions (com a service role key) tocam nessa tabela —
-- é por isso que o painel /admin e o webhook da Hubla passam por elas
-- em vez de consultar a tabela direto.
alter table subscribers enable row level security;

-- ============================================================
-- 3) Depois de rodar isso, marque VOCÊ MESMA como admin:
-- ============================================================
-- update profiles set is_admin = true where email = 'seu-email-aqui@gmail.com';
