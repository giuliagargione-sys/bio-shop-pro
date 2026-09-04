CREATE TABLE IF NOT EXISTS public.compradores_ativos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'ativo',
  plano text,
  hubla_event text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.compradores_ativos TO service_role;
GRANT SELECT ON public.compradores_ativos TO authenticated;

ALTER TABLE public.compradores_ativos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS compradores_ativos_admin_read ON public.compradores_ativos;
CREATE POLICY compradores_ativos_admin_read ON public.compradores_ativos
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS compradores_ativos_set_updated_at ON public.compradores_ativos;
CREATE TRIGGER compradores_ativos_set_updated_at
BEFORE UPDATE ON public.compradores_ativos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();