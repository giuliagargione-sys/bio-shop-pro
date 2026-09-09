REVOKE EXECUTE ON FUNCTION public.enforce_store_lifecycle_admin_only() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enforce_store_active_admin_only() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;