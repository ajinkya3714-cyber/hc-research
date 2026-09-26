CREATE TABLE public.thesis_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_label TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  synopsis TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'In progress',
  url TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.thesis_chapters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.thesis_chapters TO authenticated;
GRANT ALL ON public.thesis_chapters TO service_role;

ALTER TABLE public.thesis_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read chapters" ON public.thesis_chapters
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins write chapters" ON public.thesis_chapters
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));