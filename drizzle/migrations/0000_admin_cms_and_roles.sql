-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Auto profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Editable text content
CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT '',
  multiline boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read content" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins write content" ON public.site_content FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.bio_rows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  value text NOT NULL,
  important boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.bio_rows TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bio_rows TO authenticated;
GRANT ALL ON public.bio_rows TO service_role;
ALTER TABLE public.bio_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read bio" ON public.bio_rows FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins write bio" ON public.bio_rows FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'Study guide',
  title text NOT NULL,
  detail text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.resources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read resources" ON public.resources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins write resources" ON public.resources FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.messages TO anon;
GRANT SELECT, INSERT, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send message" ON public.messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read messages" ON public.messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete messages" ON public.messages FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed current site copy
INSERT INTO public.site_content (key, value, label, multiline, sort_order) VALUES
('site_name', 'Harun Chaudhari', 'Name', false, 1),
('hero_eyebrow', 'English Literature & Academic Research', 'Hero eyebrow', false, 2),
('hero_subtitle', 'Ph.D. Candidate in English Literature & Academic Researcher', 'Hero subtitle', false, 3),
('about_heading', 'A life dedicated to literature, inquiry, and the classroom.', 'About heading', false, 4),
('about_body', 'A dedicated literature scholar with a focused interest in seventeenth-century prose, Harun Chaudhari studies the rich intersections of reason, faith, language, and imagination. His academic work brings close reading and historical inquiry together to illuminate enduring literary questions.', 'About paragraph', true, 5),
('about_quote', 'To read deeply is to enter a conversation across centuries.', 'About quote', true, 6),
('research_field', 'English Literature
Seventeenth-Century Studies', 'Research field', true, 7),
('research_title', '“Logic and mysticism in the selected works of Thomas Browne”', 'Research title', true, 8),
('research_body', 'This doctoral study examines the productive tension between rational inquiry and mystical thought in selected prose works by Sir Thomas Browne. Through close analysis of seventeenth-century treatises and essays, the research considers how Browne’s language reconciles empirical observation, theological reflection, and imaginative wonder.', 'Research summary', true, 9),
('research_tags', 'Thomas Browne, Early Modern Prose, Logic & Mysticism', 'Research tags (comma separated)', false, 10),
('teaching_role', 'Assistant Professor of English', 'Teaching role', false, 11),
('teaching_institution', 'Shree Morarji Desai Arts & Com. College, Buhari', 'Institution', false, 12),
('teaching_body', 'Taught undergraduate English with an emphasis on rigorous textual interpretation, accessible instruction, and active student engagement.', 'Teaching description', true, 13),
('pedagogy_body', 'Experienced in developing higher education curricula, structured study guides, and multiple-choice questions designed to strengthen comprehension and assessment outcomes.', 'Pedagogy description', true, 14),
('pedagogy_tags', 'Environmental Literature, Literary Theory, English Grammar', 'Pedagogy tags (comma separated)', false, 15),
('resources_intro', 'Selected guides, course materials, and working notes from teaching and research.', 'Resources intro', true, 16),
('contact_heading', 'Let’s begin a scholarly conversation.', 'Contact heading', false, 17),
('contact_body', 'For academic correspondence, research discussions, or teaching opportunities, please send a message.', 'Contact intro', true, 18),
('linkedin_url', 'https://www.linkedin.com', 'LinkedIn URL', false, 19),
('scholar_url', 'https://scholar.google.com', 'Google Scholar URL', false, 20),
('cv_url', '', 'CV download link', false, 21);

INSERT INTO public.bio_rows (term, value, important, sort_order) VALUES
('Age', '33', false, 1),
('Marital Status', 'Married', false, 2),
('Core Qualification', 'GSET (Gujarat State Eligibility Test) Cleared', true, 3);

INSERT INTO public.resources (type, title, detail, url, sort_order) VALUES
('Study guide', 'Approaching Seventeenth-Century Prose', 'PDF · 12 pages', '', 1),
('Course material', 'Literary Theory: Essential Concepts', 'PDF · 18 pages', '', 2),
('Research notes', 'Thomas Browne: Selected Bibliography', 'PDF · 8 pages', '', 3);
