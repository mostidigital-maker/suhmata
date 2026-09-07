-- ============================================================
-- CONTENT — admin (and super_admin) managed. Public reads what's
-- published; editors have no write access here at all.
-- ============================================================

CREATE TABLE public.association_message (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  content_ar text NOT NULL DEFAULT '',
  content_en text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.association_message TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.association_message TO authenticated;
GRANT ALL ON public.association_message TO service_role;
ALTER TABLE public.association_message ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read association" ON public.association_message FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage association" ON public.association_message FOR ALL TO authenticated
  USING (public.is_admin_or_above(auth.uid())) WITH CHECK (public.is_admin_or_above(auth.uid()));

CREATE TABLE public.history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  content_ar text NOT NULL DEFAULT '',
  content_en text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.history TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.history TO authenticated;
GRANT ALL ON public.history TO service_role;
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read history" ON public.history FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage history" ON public.history FOR ALL TO authenticated
  USING (public.is_admin_or_above(auth.uid())) WITH CHECK (public.is_admin_or_above(auth.uid()));

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name_ar text NOT NULL DEFAULT '',
  name_en text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.is_admin_or_above(auth.uid())) WITH CHECK (public.is_admin_or_above(auth.uid()));

CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  excerpt_ar text NOT NULL DEFAULT '',
  excerpt_en text NOT NULL DEFAULT '',
  content_ar text NOT NULL DEFAULT '',
  content_en text NOT NULL DEFAULT '',
  cover_image text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  reading_minutes integer NOT NULL DEFAULT 3,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published articles" ON public.articles FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Staff read all articles" ON public.articles FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins manage articles" ON public.articles FOR ALL TO authenticated
  USING (public.is_admin_or_above(auth.uid())) WITH CHECK (public.is_admin_or_above(auth.uid()));

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  summary_ar text NOT NULL DEFAULT '',
  summary_en text NOT NULL DEFAULT '',
  event_date timestamptz,
  location text,
  cover_image text,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active events" ON public.events FOR SELECT TO anon, authenticated USING (archived = false);
CREATE POLICY "Staff read all events" ON public.events FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins manage events" ON public.events FOR ALL TO authenticated
  USING (public.is_admin_or_above(auth.uid())) WITH CHECK (public.is_admin_or_above(auth.uid()));

CREATE TABLE public.event_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  caption_ar text NOT NULL DEFAULT '',
  caption_en text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.event_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_media TO authenticated;
GRANT ALL ON public.event_media TO service_role;
ALTER TABLE public.event_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read event media" ON public.event_media FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage event media" ON public.event_media FOR ALL TO authenticated
  USING (public.is_admin_or_above(auth.uid())) WITH CHECK (public.is_admin_or_above(auth.uid()));

CREATE TABLE public.albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  cover_image text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.albums TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.albums TO authenticated;
GRANT ALL ON public.albums TO service_role;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read albums" ON public.albums FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage albums" ON public.albums FOR ALL TO authenticated
  USING (public.is_admin_or_above(auth.uid())) WITH CHECK (public.is_admin_or_above(auth.uid()));

CREATE TABLE public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album text NOT NULL DEFAULT 'general',
  album_id uuid REFERENCES public.albums(id) ON DELETE SET NULL,
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  caption_ar text NOT NULL DEFAULT '',
  caption_en text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  width integer,
  height integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery TO authenticated;
GRANT ALL ON public.gallery TO service_role;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read gallery" ON public.gallery FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage gallery" ON public.gallery FOR ALL TO authenticated
  USING (public.is_admin_or_above(auth.uid())) WITH CHECK (public.is_admin_or_above(auth.uid()));

CREATE TABLE public.archive_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  kind text NOT NULL DEFAULT 'document',
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  notes_ar text NOT NULL DEFAULT '',
  notes_en text NOT NULL DEFAULT '',
  file_url text NOT NULL,
  thumbnail_url text,
  year text,
  source text,
  downloadable boolean NOT NULL DEFAULT true,
  published boolean NOT NULL DEFAULT true,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.archive_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.archive_items TO authenticated;
GRANT ALL ON public.archive_items TO service_role;
ALTER TABLE public.archive_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published archive" ON public.archive_items FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Staff read all archive" ON public.archive_items FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins manage archive" ON public.archive_items FOR ALL TO authenticated
  USING (public.is_admin_or_above(auth.uid())) WITH CHECK (public.is_admin_or_above(auth.uid()));

CREATE TABLE public.map_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  kind text NOT NULL DEFAULT 'landmark',
  name_ar text NOT NULL DEFAULT '',
  name_en text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  notes_ar text NOT NULL DEFAULT '',
  notes_en text NOT NULL DEFAULT '',
  pos_x numeric NOT NULL DEFAULT 50,
  pos_y numeric NOT NULL DEFAULT 50,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.map_locations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.map_locations TO authenticated;
GRANT ALL ON public.map_locations TO service_role;
ALTER TABLE public.map_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read map locations" ON public.map_locations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage map locations" ON public.map_locations FOR ALL TO authenticated
  USING (public.is_admin_or_above(auth.uid())) WITH CHECK (public.is_admin_or_above(auth.uid()));

CREATE TABLE public.map_location_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES public.map_locations(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  caption_ar text NOT NULL DEFAULT '',
  caption_en text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.map_location_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.map_location_media TO authenticated;
GRANT ALL ON public.map_location_media TO service_role;
ALTER TABLE public.map_location_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read location media" ON public.map_location_media FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage location media" ON public.map_location_media FOR ALL TO authenticated
  USING (public.is_admin_or_above(auth.uid())) WITH CHECK (public.is_admin_or_above(auth.uid()));
