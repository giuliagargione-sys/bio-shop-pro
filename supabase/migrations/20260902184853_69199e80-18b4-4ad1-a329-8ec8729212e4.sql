CREATE OR REPLACE FUNCTION public.enforce_store_active_admin_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.active IS DISTINCT FROM OLD.active
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Somente a administracao central pode ativar ou desativar o link da loja';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS store_config_active_admin_only ON public.store_config;
CREATE TRIGGER store_config_active_admin_only
BEFORE UPDATE ON public.store_config
FOR EACH ROW EXECUTE FUNCTION public.enforce_store_active_admin_only();