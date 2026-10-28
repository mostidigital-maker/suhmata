-- Footer fields the site and admin dashboard already expect
-- (phone, postal address, copyright line) — additive only.
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address_ar text,
  ADD COLUMN IF NOT EXISTS address_en text,
  ADD COLUMN IF NOT EXISTS rights_ar text,
  ADD COLUMN IF NOT EXISTS rights_en text;

-- The roles panel offers a "Super Admin" level above admin; the enum
-- never had it, so the option could never be stored.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- User management RPCs used by the roles panel: list accounts (auth.users
-- isn't readable by the client) and set/clear a user's staff role.
-- Every function re-checks the caller is an admin (or super admin) so it
-- cannot be abused by a plain authenticated user.

CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (id uuid, email text, full_name text, roles public.app_role[])
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.id,
         u.email,
         COALESCE(u.raw_user_meta_data ->> 'full_name', ''),
         COALESCE(
           ARRAY_AGG(r.role) FILTER (WHERE r.role IS NOT NULL),
           '{}'::public.app_role[]
         )
  FROM auth.users u
  LEFT JOIN public.user_roles r ON r.user_id = u.id
  GROUP BY u.id, u.email, u.raw_user_meta_data
  ORDER BY u.created_at;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_user_role(_target_user_id uuid, _role text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  caller_is_admin boolean := EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  );
  caller_is_super boolean := EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  );
BEGIN
  IF NOT caller_is_admin THEN
    RAISE EXCEPTION 'Only admins can manage roles';
  END IF;
  IF _role NOT IN ('admin', 'editor', 'super_admin') THEN
    RAISE EXCEPTION 'Unknown role';
  END IF;
  IF _role = 'super_admin' AND NOT caller_is_super THEN
    RAISE EXCEPTION 'Only a super admin can grant the super admin role';
  END IF;
  DELETE FROM public.user_roles WHERE user_id = _target_user_id;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, _role::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_clear_user_role(_target_user_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Only admins can manage roles';
  END IF;
  DELETE FROM public.user_roles WHERE user_id = _target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_user_role(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_clear_user_role(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_clear_user_role(uuid) TO authenticated;
