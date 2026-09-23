INSERT INTO public.site_content (key, value, label, multiline, sort_order)
VALUES
  ('portrait_path', '', 'Portrait photo', false, 25),
  ('portrait_caption', 'Harun Chaudhari', 'Portrait caption', false, 26)
ON CONFLICT (key) DO NOTHING;

CREATE POLICY "Admins upload portraits" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portraits' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins update portraits" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'portraits' AND public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (bucket_id = 'portraits' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins delete portraits" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'portraits' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins read portraits" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'portraits' AND public.has_role(auth.uid(), 'admin'::public.app_role));