CREATE TABLE public.browne_chronology (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Major work',
  summary TEXT NOT NULL DEFAULT '',
  connection TEXT NOT NULL DEFAULT '',
  quote TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.browne_chronology TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.browne_chronology TO authenticated;
GRANT ALL ON public.browne_chronology TO service_role;
ALTER TABLE public.browne_chronology ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read chronology" ON public.browne_chronology FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins write chronology" ON public.browne_chronology FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));