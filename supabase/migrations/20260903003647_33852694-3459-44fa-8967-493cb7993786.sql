CREATE TABLE public.checkout_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  plan text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.checkout_signups TO anon, authenticated;
GRANT ALL ON public.checkout_signups TO service_role;
ALTER TABLE public.checkout_signups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can register interest" ON public.checkout_signups FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view signups" ON public.checkout_signups FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));