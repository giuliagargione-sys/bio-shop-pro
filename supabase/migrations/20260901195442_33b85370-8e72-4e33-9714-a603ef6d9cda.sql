-- ROLES
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','aluna');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- STORE CONFIG
CREATE TABLE IF NOT EXISTS public.store_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS store_config_user_id_key ON public.store_config (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS store_config_slug_key ON public.store_config (lower(slug));
GRANT SELECT ON public.store_config TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_config TO authenticated;
GRANT ALL ON public.store_config TO service_role;
ALTER TABLE public.store_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "store_config_public_read" ON public.store_config;
CREATE POLICY "store_config_public_read" ON public.store_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "store_config_insert_own" ON public.store_config;
CREATE POLICY "store_config_insert_own" ON public.store_config FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "store_config_update_own" ON public.store_config;
CREATE POLICY "store_config_update_own" ON public.store_config FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "store_config_delete_own" ON public.store_config;
CREATE POLICY "store_config_delete_own" ON public.store_config FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- LEADS
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  whatsapp text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  contacted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS leads_store_user_id_idx ON public.leads (store_user_id, created_at DESC);
GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "leads_public_insert" ON public.leads;
CREATE POLICY "leads_public_insert" ON public.leads FOR INSERT WITH CHECK (store_user_id IS NOT NULL);
DROP POLICY IF EXISTS "leads_select_own" ON public.leads;
CREATE POLICY "leads_select_own" ON public.leads FOR SELECT TO authenticated USING (auth.uid() = store_user_id OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "leads_update_own" ON public.leads;
CREATE POLICY "leads_update_own" ON public.leads FOR UPDATE TO authenticated USING (auth.uid() = store_user_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = store_user_id OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "leads_delete_own" ON public.leads;
CREATE POLICY "leads_delete_own" ON public.leads FOR DELETE TO authenticated USING (auth.uid() = store_user_id OR public.has_role(auth.uid(),'admin'));

-- SUBSCRIBERS (somente edge functions)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  status text NOT NULL DEFAULT 'desconhecido',
  plan text,
  hubla_event text,
  hubla_event_at timestamptz,
  raw jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS subscribers_email_key ON public.subscribers (lower(email));
GRANT ALL ON public.subscribers TO service_role;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS store_config_set_updated_at ON public.store_config;
CREATE TRIGGER store_config_set_updated_at BEFORE UPDATE ON public.store_config FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- novo usuário -> profile + papel aluna
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email) VALUES (NEW.id, NEW.email) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'aluna') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();