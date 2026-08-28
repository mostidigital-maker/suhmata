-- ============================================================
-- 1. Extend settings with editable contact/footer fields
-- ============================================================
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address_ar text,
  ADD COLUMN IF NOT EXISTS address_en text,
  ADD COLUMN IF NOT EXISTS rights_ar text,
  ADD COLUMN IF NOT EXISTS rights_en text;

-- Seed the footer copyright text once, so admins have something to edit
-- rather than an empty field. Only touches rows that don't already have it.
UPDATE public.settings
SET
  rights_ar = COALESCE(rights_ar, 'جميع الحقوق محفوظة لجمعية أهالي القرية.'),
  rights_en = COALESCE(rights_en, 'All rights reserved to the village association.')
WHERE rights_ar IS NULL OR rights_en IS NULL;

-- ============================================================
-- 2. Narrow the "editor" role to moderation only.
--    Previously every staff-write policy used is_staff(), which is true
--    for both 'admin' and 'editor'. Editors should only be able to
--    approve/hide/delete visitor submissions (guestbook, visitor videos,
--    contributions) — everything else (site identity, articles, events,
--    gallery, categories, albums, archive items, map locations, settings)
--    becomes admin-only.
--    Read access for staff is left as-is (is_staff) so an editor's admin
--    screen can still show unpublished/draft rows without erroring; only
--    write access is tightened.
-- ============================================================
DROP POLICY IF EXISTS "Staff manage hero" ON public.hero_content;
CREATE POLICY "Admins manage hero" ON public.hero_content
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff manage association" ON public.association_message;
CREATE POLICY "Admins manage association" ON public.association_message
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff manage history" ON public.history;
CREATE POLICY "Admins manage history" ON public.history
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff manage articles" ON public.articles;
CREATE POLICY "Admins manage articles" ON public.articles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff manage events" ON public.events;
CREATE POLICY "Admins manage events" ON public.events
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff manage event media" ON public.event_media;
CREATE POLICY "Admins manage event media" ON public.event_media
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff manage gallery" ON public.gallery;
CREATE POLICY "Admins manage gallery" ON public.gallery
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff manage categories" ON public.categories;
CREATE POLICY "Admins manage categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff manage albums" ON public.albums;
CREATE POLICY "Admins manage albums" ON public.albums
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff manage archive" ON public.archive_items;
CREATE POLICY "Admins manage archive" ON public.archive_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff manage map locations" ON public.map_locations;
CREATE POLICY "Admins manage map locations" ON public.map_locations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Staff manage location media" ON public.map_location_media;
CREATE POLICY "Admins manage location media" ON public.map_location_media
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Guestbook, visitor videos and contributions are left untouched here:
-- their "Staff moderate/delete ..." policies already use is_staff(), so
-- both admins and editors keep the ability to approve/hide/reject/delete
-- visitor submissions. "Admins manage settings" (admin-only) already
-- existed before this migration and is unchanged.

-- ============================================================
-- 3. Let admins list registered users and their roles.
--    auth.users isn't exposed to PostgREST, so this security-definer
--    function is the only way for the client to read it — and only for
--    callers who already hold the admin role.
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
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can list users';
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

-- ============================================================
-- 4. Let admins set a user's single role (or clear it back to "guest")
--    via one call instead of a delete-then-insert from the client.
-- ============================================================
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
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can change roles';
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
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can change roles';
  END IF;

  DELETE FROM public.user_roles WHERE user_id = _target_user_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_clear_user_role(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_clear_user_role(uuid) TO authenticated;
