CREATE TABLE public.plan_overrides (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_overrides TO authenticated;
GRANT ALL ON public.plan_overrides TO service_role;

ALTER TABLE public.plan_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plan_overrides_admin_all" ON public.plan_overrides
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "plan_overrides_select_own" ON public.plan_overrides
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER plan_overrides_set_updated_at
  BEFORE UPDATE ON public.plan_overrides
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();