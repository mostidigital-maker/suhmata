
-- ============ categories ============
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
CREATE POLICY "Staff manage categories" ON public.categories FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

-- ============ albums ============
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
CREATE POLICY "Staff manage albums" ON public.albums FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

-- ============ gallery additions ============
ALTER TABLE public.gallery
  ADD COLUMN album_id uuid REFERENCES public.albums(id) ON DELETE SET NULL,
  ADD COLUMN sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN width integer,
  ADD COLUMN height integer;

-- ============ articles additions ============
ALTER TABLE public.articles
  ADD COLUMN slug text UNIQUE,
  ADD COLUMN excerpt_ar text NOT NULL DEFAULT '',
  ADD COLUMN excerpt_en text NOT NULL DEFAULT '',
  ADD COLUMN category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN reading_minutes integer NOT NULL DEFAULT 3,
  ADD COLUMN published_at timestamptz NOT NULL DEFAULT now();

-- ============ events additions + media ============
ALTER TABLE public.events ADD COLUMN slug text UNIQUE;

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
CREATE POLICY "Staff manage event media" ON public.event_media FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

-- ============ archive items ============
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
CREATE POLICY "Staff read all archive" ON public.archive_items FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff manage archive" ON public.archive_items FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

-- ============ map locations ============
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
CREATE POLICY "Staff manage map locations" ON public.map_locations FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

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
CREATE POLICY "Staff manage location media" ON public.map_location_media FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

-- ============ contributions ============
CREATE TABLE public.contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'story',
  contributor_name text NOT NULL,
  email text,
  social_link text,
  title text,
  body text,
  media_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.contributions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contributions TO authenticated;
GRANT ALL ON public.contributions TO service_role;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submits pending contribution" ON public.contributions FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending');
CREATE POLICY "Public read approved contributions" ON public.contributions FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "Staff read all contributions" ON public.contributions FOR SELECT TO authenticated USING (is_staff(auth.uid()));
CREATE POLICY "Staff moderate contributions" ON public.contributions FOR UPDATE TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));
CREATE POLICY "Staff delete contributions" ON public.contributions FOR DELETE TO authenticated USING (is_staff(auth.uid()));

-- ============ seed ============
INSERT INTO public.categories (slug, name_ar, name_en, sort_order) VALUES
  ('heritage', 'تراث', 'Heritage', 1),
  ('daily-life', 'الحياة اليومية', 'Daily Life', 2),
  ('land', 'الأرض والزراعة', 'Land & Farming', 3),
  ('memory', 'ذاكرة النكبة', 'Memory', 4);

INSERT INTO public.albums (slug, title_ar, title_en, description_ar, description_en, category_id, cover_image, sort_order) VALUES
  ('stone-houses', 'بيوت الحجر', 'Stone Houses', 'صور لبيوت القرية الحجرية وأقواسها.', 'Photographs of the village stone houses and their arches.', (SELECT id FROM public.categories WHERE slug='heritage'), '/assets/stone-alley.jpg', 1),
  ('olive-harvest', 'موسم الزيتون', 'Olive Harvest', 'مشاهد من موسم قطف الزيتون.', 'Scenes from the olive picking season.', (SELECT id FROM public.categories WHERE slug='land'), '/assets/olive-grove.jpg', 2),
  ('village-life', 'حياة القرية', 'Village Life', 'الأسواق والأعراس والحياة اليومية.', 'Markets, weddings and everyday life.', (SELECT id FROM public.categories WHERE slug='daily-life'), '/assets/hero-village.jpg', 3);

INSERT INTO public.gallery (album_id, album, media_url, media_type, caption_ar, caption_en, sort_order, width, height) VALUES
  ((SELECT id FROM public.albums WHERE slug='stone-houses'), 'stone-houses', '/assets/stone-alley.jpg', 'image', 'زقاق حجري في وسط القرية', 'A stone alley in the village centre', 1, 1200, 900),
  ((SELECT id FROM public.albums WHERE slug='stone-houses'), 'stone-houses', '/assets/hero-village.jpg', 'image', 'إطلالة عامة على البيوت', 'A general view of the houses', 2, 1600, 900),
  ((SELECT id FROM public.albums WHERE slug='olive-harvest'), 'olive-harvest', '/assets/olive-grove.jpg', 'image', 'بيارة زيتون قديمة', 'An old olive grove', 1, 1200, 900),
  ((SELECT id FROM public.albums WHERE slug='olive-harvest'), 'olive-harvest', '/assets/stone-alley.jpg', 'image', 'العودة من الحقل', 'Returning from the field', 2, 1200, 900),
  ((SELECT id FROM public.albums WHERE slug='village-life'), 'village-life', '/assets/hero-village.jpg', 'image', 'ساحة القرية عند الغروب', 'The village square at dusk', 1, 1600, 900),
  ((SELECT id FROM public.albums WHERE slug='village-life'), 'village-life', '/assets/village-map.jpg', 'image', 'خريطة القرية المرسومة يدويًا', 'The hand-drawn village map', 2, 1400, 900);

UPDATE public.articles SET slug = 'article-' || left(id::text, 8) WHERE slug IS NULL;
UPDATE public.events SET slug = 'event-' || left(id::text, 8) WHERE slug IS NULL;

INSERT INTO public.archive_items (slug, kind, title_ar, title_en, description_ar, description_en, notes_ar, notes_en, file_url, thumbnail_url, year, source, category_id) VALUES
  ('land-registry-1945', 'document', 'سجل الأراضي ١٩٤٥', 'Land Registry, 1945', 'صفحة من سجل أراضي القرية.', 'A page from the village land registry.', 'محفوظ في أرشيف العائلة.', 'Preserved in the family archive.', '/assets/village-map.jpg', '/assets/village-map.jpg', '1945', 'Village Association Archive', (SELECT id FROM public.categories WHERE slug='land')),
  ('survey-map-1942', 'map', 'خريطة المساحة ١٩٤٢', 'Survey Map, 1942', 'خريطة مسح للقرية وحدودها.', 'A survey map of the village and its boundaries.', 'أعيد رسمها اعتمادًا على النسخة الأصلية.', 'Redrawn from the original sheet.', '/assets/village-map.jpg', '/assets/village-map.jpg', '1942', 'Survey Department', (SELECT id FROM public.categories WHERE slug='land')),
  ('old-photo-square', 'photo', 'ساحة القرية', 'The Village Square', 'صورة قديمة لساحة القرية.', 'An old photograph of the village square.', 'مصدر الصورة مجهول.', 'Photographer unknown.', '/assets/hero-village.jpg', '/assets/hero-village.jpg', '1938', 'Private collection', (SELECT id FROM public.categories WHERE slug='daily-life')),
  ('oral-history-abu-yusuf', 'audio', 'شهادة أبو يوسف', 'Testimony of Abu Yusuf', 'تسجيل صوتي لذكريات عن القرية.', 'An audio recording of memories of the village.', 'سُجّل عام ١٩٩٨.', 'Recorded in 1998.', '/assets/olive-grove.jpg', '/assets/olive-grove.jpg', '1998', 'Oral history project', (SELECT id FROM public.categories WHERE slug='memory')),
  ('harvest-footage', 'video', 'لقطات من موسم الحصاد', 'Harvest Footage', 'مقاطع من موسم الحصاد في القرية.', 'Footage from the harvest season in the village.', 'نُقلت عن شريط ٨ ملم.', 'Transferred from 8mm film.', '/assets/olive-grove.jpg', '/assets/olive-grove.jpg', '1947', 'Family film reel', (SELECT id FROM public.categories WHERE slug='land')),
  ('village-booklet-pdf', 'pdf', 'كتيّب القرية', 'The Village Booklet', 'كتيّب تعريفي عن تاريخ القرية.', 'An introductory booklet about the village history.', 'متاح للتحميل.', 'Available for download.', '/assets/stone-alley.jpg', '/assets/stone-alley.jpg', '2019', 'Village Association', (SELECT id FROM public.categories WHERE slug='heritage'));

INSERT INTO public.map_locations (slug, kind, name_ar, name_en, description_ar, description_en, notes_ar, notes_en, pos_x, pos_y, sort_order) VALUES
  ('mosque', 'mosque', 'المسجد الكبير', 'The Great Mosque', 'مسجد القرية القديم في وسط الحارة الشرقية.', 'The old village mosque at the heart of the eastern quarter.', 'بُنيت مئذنته من الحجر المحلي.', 'Its minaret was built from local stone.', 46, 38, 1),
  ('cemetery', 'cemetery', 'المقبرة', 'The Cemetery', 'مقبرة القرية على التلة الشمالية.', 'The village cemetery on the northern hill.', 'تحيط بها أشجار السرو.', 'Surrounded by cypress trees.', 62, 20, 2),
  ('school', 'school', 'المدرسة', 'The School', 'مدرسة القرية الابتدائية.', 'The village elementary school.', 'افتُتحت في ثلاثينيات القرن الماضي.', 'Opened in the 1930s.', 34, 52, 3),
  ('north-well', 'well', 'البئر الشمالي', 'The Northern Well', 'بئر المياه الرئيسي لأهل القرية.', 'The main water well for the villagers.', 'كان ملتقى النساء كل صباح.', 'A gathering point for women each morning.', 55, 62, 4),
  ('house-of-abu-salim', 'family_home', 'دار أبو سالم', 'House of Abu Salim', 'بيت حجري بقناطر ثلاث.', 'A stone house with three arches.', 'من أقدم بيوت الحارة الغربية.', 'Among the oldest houses of the western quarter.', 25, 40, 5),
  ('threshing-floor', 'landmark', 'البيدر', 'The Threshing Floor', 'ساحة درس القمح جنوب القرية.', 'The wheat threshing ground south of the village.', 'كانت تُقام فيها الأعراس أيضًا.', 'Weddings were also held here.', 48, 78, 6);

INSERT INTO public.map_location_media (location_id, media_url, caption_ar, caption_en, sort_order) VALUES
  ((SELECT id FROM public.map_locations WHERE slug='mosque'), '/assets/stone-alley.jpg', 'الطريق إلى المسجد', 'The path to the mosque', 1),
  ((SELECT id FROM public.map_locations WHERE slug='school'), '/assets/hero-village.jpg', 'ساحة المدرسة', 'The school yard', 1),
  ((SELECT id FROM public.map_locations WHERE slug='threshing-floor'), '/assets/olive-grove.jpg', 'البيدر في الصيف', 'The threshing floor in summer', 1);

INSERT INTO public.contributions (kind, contributor_name, title, body, media_url, status) VALUES
  ('story', 'أم خالد', 'ذكرى الصباح', 'كنا نخرج مع الفجر إلى الحقل، ورائحة الزعتر تسبقنا.', NULL, 'approved'),
  ('story', 'Yusuf N.', 'My grandfather''s key', 'He kept the key of the house in his coat pocket until his last day.', NULL, 'approved'),
  ('image', 'Layla A.', 'The old doorway', 'A photograph of the doorway of our family home.', '/assets/stone-alley.jpg', 'approved');
