CREATE OR REPLACE FUNCTION public.enforce_store_active_admin_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.active IS DISTINCT FROM OLD.active
     AND auth.uid() IS NOT NULL
     AND NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Somente a administracao central pode ativar ou desativar o link da loja';
  END IF;
  RETURN NEW;
END;
$function$;