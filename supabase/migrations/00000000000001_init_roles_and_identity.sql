-- ============================================================
-- Suhmata — full schema for a brand-new, independent Supabase
-- project (no connection to Lovable). Run this once, in full,
-- in the Supabase Dashboard → SQL Editor of a fresh project.
--
-- Role model (three tiers):
--   super_admin — the only role that can change site identity
--                 (logo, hero background, village name/subtitle,
--                 footer copyright text, contact/social links)
--                 and the only role that can grant/revoke the
--                 admin and editor roles.
--   admin       — manages everyday content: articles, events,
--                 gallery, map locations, archive items, history,
--                 categories, albums — full add/edit/delete, but
--                 cannot touch site identity or roles.
--   editor      — moderation only: approve/hide/reject/delete
--                 visitor submissions (guestbook, visitor videos,
--                 contributions). No content or identity access.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- ROLES
-- ============================================================
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'editor');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Any of the three roles — used for moderation access and staff-only reads.
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

-- admin or super_admin — used for everyday content management.
CREATE OR REPLACE FUNCTION public.is_admin_or_above(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'super_admin')
  );
$$;

-- super_admin only — used for site identity and role management.
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_above(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin_or_above(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Super admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Super admins read roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

-- ============================================================
-- SITE IDENTITY — super_admin only (logo, background, name, rights)
-- ============================================================
CREATE TABLE public.hero_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  subtitle_ar text NOT NULL DEFAULT '',
  subtitle_en text NOT NULL DEFAULT '',
  background_image text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hero_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_content TO authenticated;
GRANT ALL ON public.hero_content TO service_role;
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read hero" ON public.hero_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Super admins manage hero" ON public.hero_content FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo text,
  facebook text,
  instagram text,
  whatsapp text,
  google_maps text,
  waze text,
  map_embed_url text,
  contact_email text,
  phone text,
  address_ar text,
  address_en text,
  rights_ar text,
  rights_en text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON public.settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Super admins manage settings" ON public.settings FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
