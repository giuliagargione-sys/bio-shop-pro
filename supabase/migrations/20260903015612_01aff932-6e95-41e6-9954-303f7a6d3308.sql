ALTER TABLE public.store_events ADD COLUMN IF NOT EXISTS session_id text;
CREATE INDEX IF NOT EXISTS store_events_session_idx ON public.store_events (store_user_id, session_id);