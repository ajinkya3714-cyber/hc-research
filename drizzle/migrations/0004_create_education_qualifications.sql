CREATE TABLE public.education_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  degree TEXT NOT NULL,
  board TEXT NOT NULL DEFAULT '',
  passing_date TEXT NOT NULL DEFAULT '',
  seat_number TEXT NOT NULL DEFAULT '',
  percentage TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.education_qualifications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.education_qualifications TO authenticated;
GRANT ALL ON public.education_qualifications TO service_role;

ALTER TABLE public.education_qualifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read education" ON public.education_qualifications
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins write education" ON public.education_qualifications
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));