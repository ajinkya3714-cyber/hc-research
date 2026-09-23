CREATE TABLE public.publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'Journal article',
  title text NOT NULL,
  venue text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  authors text NOT NULL DEFAULT '',
  abstract text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.publications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publications TO authenticated;
GRANT ALL ON public.publications TO service_role;

ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read publications" ON public.publications
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins write publications" ON public.publications
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
