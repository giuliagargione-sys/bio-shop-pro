-- 1) Mapeamento oferta da Hubla -> plano
CREATE TABLE public.plan_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hubla_product_id text,
  hubla_offer_id text NOT NULL,
  plan text NOT NULL CHECK (plan IN ('essential','pro')),
  label text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX plan_mapping_offer_uidx ON public.plan_mapping (hubla_offer_id);
GRANT SELECT ON public.plan_mapping TO authenticated;
GRANT ALL ON public.plan_mapping TO service_role;
ALTER TABLE public.plan_mapping ENABLE ROW LEVEL SECURITY;
CREATE POLICY plan_mapping_admin_read ON public.plan_mapping FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER plan_mapping_set_updated_at BEFORE UPDATE ON public.plan_mapping
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.plan_mapping (hubla_offer_id, plan, label) VALUES
  ('iAOkp8rxyHpqSFRI3uMi', 'essential', 'Essencial mensal'),
  ('0hREHGC9ZXVNfzBtwwFi', 'essential', 'Essencial anual'),
  ('S4COKdt38PWGnWEHCnWi', 'pro', 'PRO mensal'),
  ('t4lUs4AIHqiJ3k05S8FZ', 'pro', 'PRO anual');

-- 2) Assinaturas (com historico: varias linhas por cliente)
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  store_id uuid REFERENCES public.store_config(id) ON DELETE SET NULL,
  hubla_subscription_id text,
  hubla_product_id text,
  hubla_offer_id text,
  plan text CHECK (plan IN ('essential','pro')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled','expired','suspended')),
  is_current boolean NOT NULL DEFAULT true,
  started_at timestamptz,
  current_period_end timestamptz,
  period_end_source text,
  auto_renew boolean NOT NULL DEFAULT true,
  cancelled_at timestamptz,
  deactivated_at timestamptz,
  last_event_type text,
  last_event_at timestamptz,
  last_event_version integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX subscriptions_hubla_id_uidx ON public.subscriptions (hubla_subscription_id)
  WHERE hubla_subscription_id IS NOT NULL;
CREATE INDEX subscriptions_email_idx ON public.subscriptions (lower(email));
CREATE INDEX subscriptions_user_idx ON public.subscriptions (user_id);
CREATE INDEX subscriptions_store_idx ON public.subscriptions (store_id);
CREATE INDEX subscriptions_status_idx ON public.subscriptions (status);
CREATE INDEX subscriptions_offer_idx ON public.subscriptions (hubla_offer_id);
CREATE INDEX subscriptions_period_end_idx ON public.subscriptions (current_period_end);
CREATE INDEX subscriptions_current_idx ON public.subscriptions (is_current) WHERE is_current;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscriptions_select_own ON public.subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER subscriptions_set_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3) Recursos por plano (fonte unica de permissoes)
CREATE TABLE public.plan_features (
  plan text NOT NULL CHECK (plan IN ('essential','pro')),
  feature text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (plan, feature)
);
GRANT SELECT ON public.plan_features TO anon, authenticated;
GRANT ALL ON public.plan_features TO service_role;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY plan_features_public_read ON public.plan_features FOR SELECT USING (true);

INSERT INTO public.plan_features (plan, feature, enabled) VALUES
  ('essential','store',true),
  ('essential','brand',true),
  ('essential','hero',true),
  ('essential','structure',true),
  ('essential','products',true),
  ('essential','quiz',true),
  ('essential','leads',true),
  ('essential','banners',true),
  ('essential','footer',true),
  ('essential','contact',true),
  ('essential','analytics',true),
  ('essential','ai_insights',false),
  ('essential','videos',false),
  ('essential','extra_buttons',false),
  ('essential','priority_support',false),
  ('pro','store',true),
  ('pro','brand',true),
  ('pro','hero',true),
  ('pro','structure',true),
  ('pro','products',true),
  ('pro','quiz',true),
  ('pro','leads',true),
  ('pro','banners',true),
  ('pro','footer',true),
  ('pro','contact',true),
  ('pro','analytics',true),
  ('pro','ai_insights',true),
  ('pro','videos',true),
  ('pro','extra_buttons',true),
  ('pro','priority_support',true);

-- 4) Idempotencia dos avisos da Hubla
CREATE TABLE public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'hubla',
  hubla_event_id text NOT NULL,
  event_type text,
  event_at timestamptz,
  email text,
  hubla_subscription_id text,
  payload jsonb,
  processed boolean NOT NULL DEFAULT false,
  processed_at timestamptz,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX webhook_events_event_uidx ON public.webhook_events (source, hubla_event_id);
CREATE INDEX webhook_events_sub_idx ON public.webhook_events (hubla_subscription_id);
CREATE INDEX webhook_events_created_idx ON public.webhook_events (created_at DESC);
GRANT SELECT ON public.webhook_events TO authenticated;
GRANT ALL ON public.webhook_events TO service_role;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY webhook_events_admin_read ON public.webhook_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 5) Situacao da loja + janela de recuperacao (nada e apagado)
ALTER TABLE public.store_config
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS backup_until timestamptz;
ALTER TABLE public.store_config
  ADD CONSTRAINT store_config_status_check CHECK (status IN ('active','suspended','archived'));
CREATE INDEX IF NOT EXISTS store_config_status_idx ON public.store_config (status);
CREATE INDEX IF NOT EXISTS store_config_backup_until_idx ON public.store_config (backup_until);

-- 6) Cliente nao pode mexer em situacao/janela de recuperacao da propria loja
CREATE OR REPLACE FUNCTION public.enforce_store_lifecycle_admin_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.backup_until IS DISTINCT FROM OLD.backup_until THEN
      RAISE EXCEPTION 'Somente a administracao central pode alterar a situacao da loja';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER store_config_lifecycle_admin_only BEFORE UPDATE ON public.store_config
  FOR EACH ROW EXECUTE FUNCTION public.enforce_store_lifecycle_admin_only();