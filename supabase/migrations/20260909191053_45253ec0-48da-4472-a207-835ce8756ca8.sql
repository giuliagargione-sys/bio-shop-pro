CREATE OR REPLACE FUNCTION public.run_subscription_lifecycle()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  expired_count integer := 0;
  suspended_count integer := 0;
  archived_count integer := 0;
BEGIN
  -- 1) Periodo pago realmente terminou -> assinatura expirada
  WITH due AS (
    UPDATE public.subscriptions s
       SET status = 'expired', auto_renew = false, updated_at = now()
     WHERE s.status IN ('active','cancelled')
       AND s.current_period_end IS NOT NULL
       AND s.current_period_end < now()
    RETURNING s.user_id, s.current_period_end
  ), suspend AS (
    UPDATE public.store_config sc
       SET status = 'suspended',
           backup_until = due.current_period_end + interval '30 days',
           active = false
      FROM due
     WHERE sc.user_id = due.user_id
       AND sc.status = 'active'
    RETURNING sc.id
  )
  SELECT (SELECT count(*) FROM due), (SELECT count(*) FROM suspend)
    INTO expired_count, suspended_count;

  -- 2) Janela de recuperacao encerrada -> arquiva (sem excluir nada)
  WITH archived AS (
    UPDATE public.store_config
       SET status = 'archived'
     WHERE status = 'suspended'
       AND backup_until IS NOT NULL
       AND backup_until < now()
    RETURNING id
  )
  SELECT count(*) INTO archived_count FROM archived;

  RETURN jsonb_build_object(
    'expired', expired_count,
    'suspended', suspended_count,
    'archived', archived_count,
    'ran_at', now()
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.run_subscription_lifecycle() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.run_subscription_lifecycle() TO service_role;