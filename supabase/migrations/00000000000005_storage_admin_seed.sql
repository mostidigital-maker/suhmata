-- ============================================================
-- STORAGE — public "media" bucket for all uploaded images/files.
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read media" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'media');
CREATE POLICY "Staff upload media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff update media" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.is_staff(auth.uid()));
CREATE POLICY "Staff delete media" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.is_staff(auth.uid()));
-- Visitors submitting a guestbook story, video or contribution can attach
-- a file to their own submission before any staff account exists to
-- upload on their behalf.
CREATE POLICY "Visitors upload contributions" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] IN ('contributions', 'visitor-videos')
  );

-- ============================================================
-- USER MANAGEMENT — super_admin only. auth.users isn't exposed
-- to PostgREST, so these SECURITY DEFINER functions are the only
-- way for the client to list/manage accounts, and only for
-- callers who already hold the super_admin role.
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  created_at timestamptz,
  roles public.app_role[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can list users';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    p.full_name,
    u.created_at,
    COALESCE(
      array_agg(ur.role) FILTER (WHERE ur.role IS NOT NULL),
      ARRAY[]::public.app_role[]
    ) AS roles
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  LEFT JOIN public.user_roles ur ON ur.user_id = u.id
  GROUP BY u.id, u.email, p.full_name, u.created_at
  ORDER BY u.created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_user_role(
  _target_user_id uuid,
  _role public.app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can change roles';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = _target_user_id;
  IF _role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_target_user_id, _role);
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, public.app_role) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_clear_user_role(_target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can change roles';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = _target_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_clear_user_role(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_clear_user_role(uuid) TO authenticated;

-- ============================================================
-- SEED CONTENT — placeholder text so the site isn't empty.
-- Replace all of this from the admin panel.
-- ============================================================
INSERT INTO public.hero_content (title_ar, title_en, subtitle_ar, subtitle_en) VALUES
('قرية [اسم القرية]', '[Village Name]',
 'مساحة أرشيفية تجمع صور القرية ووثائقها وشهادات أهلها قبل عام ١٩٤٨.',
 'An archival space gathering the village''s photographs, documents and testimonies from before 1948.');

INSERT INTO public.association_message (title_ar, title_en, content_ar, content_en) VALUES
('أهلاً بكم في ذاكرة القرية', 'Welcome to the village''s memory',
 'هنا ستُنشر كلمة رئيس الجمعية.',
 'The association chairperson''s message will be published here.');

INSERT INTO public.history (title_ar, title_en, content_ar, content_en, sort_order) VALUES
('أصل القرية وموقعها', 'Origins and setting', 'مكان لسرد أقدم الإشارات التاريخية للقرية.', 'A place for the earliest historical references to the village.', 1),
('البيوت الحجرية والعقود', 'Stone houses and arches', 'وصف لطراز البناء بالحجر الجيري.', 'A description of limestone construction.', 2),
('الزيتون والمواسم', 'Olives and the seasons', 'مساحة لتوثيق مساحات الأرض ومواسم الزيتون.', 'Space to document the village lands and olive season.', 3),
('الرحيل والذاكرة', 'Departure and remembrance', 'هنا تُوثَّق أحداث عام ١٩٤٨.', 'Here the events of 1948 will be documented.', 4);

INSERT INTO public.settings (contact_email, rights_ar, rights_en) VALUES
('[البريد الإلكتروني]', 'جميع الحقوق محفوظة لجمعية أهالي القرية.', 'All rights reserved to the village association.');

INSERT INTO public.categories (slug, name_ar, name_en, sort_order) VALUES
  ('heritage', 'تراث', 'Heritage', 1),
  ('daily-life', 'الحياة اليومية', 'Daily Life', 2),
  ('land', 'الأرض والزراعة', 'Land & Farming', 3),
  ('memory', 'ذاكرة النكبة', 'Memory', 4);
