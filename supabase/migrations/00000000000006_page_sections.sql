-- ============================================================
-- Fills in homepage content that was previously hardcoded in the
-- frontend (static translation strings / bundled images) instead
-- of coming from the database — so it wasn't editable at all,
-- regardless of role. Additive only; safe to run on top of the
-- initial 5 migrations without losing any existing data.
-- ============================================================

-- The short "قضاء [...] · فلسطين · قبل ١٩٤٨" line under the village
-- name (hero, header, footer) — was pure static text before this.
ALTER TABLE public.hero_content
  ADD COLUMN IF NOT EXISTS district_ar text,
  ADD COLUMN IF NOT EXISTS district_en text;

-- Association welcome message: who signs it, and its illustration.
ALTER TABLE public.association_message
  ADD COLUMN IF NOT EXISTS author_name_ar text,
  ADD COLUMN IF NOT EXISTS author_name_en text,
  ADD COLUMN IF NOT EXISTS author_title_ar text,
  ADD COLUMN IF NOT EXISTS author_title_en text,
  ADD COLUMN IF NOT EXISTS image text;

-- Generic "section intro" content: a title/body/image for a
-- homepage section that isn't a list of its own items (history and
-- location both need this; more sections can reuse the same table
-- later by inserting another row with a new key).
CREATE TABLE public.section_intros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  body_ar text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.section_intros TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.section_intros TO authenticated;
GRANT ALL ON public.section_intros TO service_role;
ALTER TABLE public.section_intros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read section intros" ON public.section_intros
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage section intros" ON public.section_intros
  FOR ALL TO authenticated USING (public.is_admin_or_above(auth.uid())) WITH CHECK (public.is_admin_or_above(auth.uid()));
CREATE TRIGGER trg_section_intros_updated BEFORE UPDATE ON public.section_intros
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.section_intros (key, title_ar, title_en, body_ar, body_en) VALUES
('history', 'حجرٌ وزيتون وذاكرة', 'Stone, Olive and Memory',
 'سيتضمن هذا القسم سرداً تاريخياً موثقاً لنشأة القرية، وعمارتها الحجرية، وأراضيها الزراعية، وعائلاتها، وحياتها اليومية حتى عام ١٩٤٨. النص أدناه وصفٌ للمحتوى القادم.',
 'This section will hold a documented historical account of the village''s founding, its stone architecture, farmland, families and daily life up to 1948. The text below describes upcoming content.'),
('location', 'أين كانت القرية', 'Where the Village Stood',
 'ستُعرض هنا خريطة تفاعلية لموقع القرية وحدود أراضيها والقرى المجاورة، مع مرجعية الخرائط التاريخية.',
 'An interactive map of the village''s location, its land boundaries and neighbouring villages will be shown here, referencing historical maps.');

-- Location "fact sheet" (district, altitude, land area, population)
-- shown beside the map. A working map embed URL already had a column
-- (map_embed_url) but no admin UI ever exposed it, so it silently
-- fell back to a meaningless full-text Google Maps search.
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS location_district_ar text,
  ADD COLUMN IF NOT EXISTS location_district_en text,
  ADD COLUMN IF NOT EXISTS location_altitude_ar text,
  ADD COLUMN IF NOT EXISTS location_altitude_en text,
  ADD COLUMN IF NOT EXISTS location_land_area_ar text,
  ADD COLUMN IF NOT EXISTS location_land_area_en text,
  ADD COLUMN IF NOT EXISTS location_population_ar text,
  ADD COLUMN IF NOT EXISTS location_population_en text;
