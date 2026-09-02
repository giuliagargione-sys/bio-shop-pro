CREATE TABLE public.store_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  label text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.store_events TO authenticated;
GRANT INSERT ON public.store_events TO anon, authenticated;
GRANT ALL ON public.store_events TO service_role;

ALTER TABLE public.store_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY store_events_public_insert ON public.store_events FOR INSERT TO anon, authenticated WITH CHECK (store_user_id IS NOT NULL);
CREATE POLICY store_events_select_own ON public.store_events FOR SELECT TO authenticated USING ((auth.uid() = store_user_id) OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX store_events_owner_time_idx ON public.store_events (store_user_id, created_at DESC);