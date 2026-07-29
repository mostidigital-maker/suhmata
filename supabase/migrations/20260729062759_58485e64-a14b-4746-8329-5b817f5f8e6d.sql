-- ROLES ------------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

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

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- SINGLETON CONTENT --------------------------------------------------------
CREATE TABLE public.hero_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  subtitle_ar text NOT NULL DEFAULT '',
  subtitle_en text NOT NULL DEFAULT '',
  background_image text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.association_message (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  content_ar text NOT NULL DEFAULT '',
  content_en text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  content_ar text NOT NULL DEFAULT '',
  content_en text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  logo text,
  facebook text,
  instagram text,
  whatsapp text,
  google_maps text,
  waze text,
  contact_email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  content_ar text NOT NULL DEFAULT '',
  content_en text NOT NULL DEFAULT '',
  cover_image text,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE public.gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album text NOT NULL DEFAULT 'general',
  media_url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  caption_ar text NOT NULL DEFAULT '',
  caption_en text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.visitor_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name text NOT NULL,
  email text,
  social_link text,
  video_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT visitor_videos_status_check CHECK (status IN ('pending','approved','rejected'))
);

CREATE TABLE public.guestbook (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  social_link text,
  message text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- GRANTS -------------------------------------------------------------------
GRANT SELECT ON public.hero_content, public.association_message, public.history,
  public.settings, public.articles, public.events, public.gallery,
  public.visitor_videos, public.guestbook TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_content, public.association_message,
  public.history, public.settings, public.articles, public.events, public.gallery,
  public.visitor_videos, public.guestbook TO authenticated;
GRANT INSERT ON public.visitor_videos, public.guestbook TO anon;
GRANT ALL ON public.hero_content, public.association_message, public.history,
  public.settings, public.articles, public.events, public.gallery,
  public.visitor_videos, public.guestbook TO service_role;

ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.association_message ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES -----------------------------------------------------
CREATE POLICY "Public read hero" ON public.hero_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read association" ON public.association_message FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read history" ON public.history FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read settings" ON public.settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read gallery" ON public.gallery FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read published articles" ON public.articles FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Staff read all articles" ON public.articles FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Public read active events" ON public.events FOR SELECT TO anon, authenticated USING (archived = false);
CREATE POLICY "Staff read all events" ON public.events FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Public read approved videos" ON public.visitor_videos FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "Staff read all videos" ON public.visitor_videos FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Public read approved guestbook" ON public.guestbook FOR SELECT TO anon, authenticated USING (approved = true);
CREATE POLICY "Staff read all guestbook" ON public.guestbook FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- PUBLIC SUBMISSIONS -------------------------------------------------------
CREATE POLICY "Anyone submits pending video" ON public.visitor_videos FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending');
CREATE POLICY "Anyone submits guestbook entry" ON public.guestbook FOR INSERT TO anon, authenticated WITH CHECK (approved = false);

-- STAFF WRITE POLICIES -----------------------------------------------------
CREATE POLICY "Staff manage hero" ON public.hero_content FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff manage association" ON public.association_message FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff manage history" ON public.history FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admins manage settings" ON public.settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Staff manage articles" ON public.articles FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff manage events" ON public.events FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff manage gallery" ON public.gallery FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff moderate videos" ON public.visitor_videos FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete videos" ON public.visitor_videos FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff moderate guestbook" ON public.guestbook FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete guestbook" ON public.guestbook FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- SEED CONTENT -------------------------------------------------------------
INSERT INTO public.hero_content (title_ar, title_en, subtitle_ar, subtitle_en) VALUES
('قرية [اسم القرية]', '[Village Name]',
 'مساحة أرشيفية تجمع صور القرية ووثائقها وشهادات أهلها قبل عام ١٩٤٨.',
 'An archival space gathering the village''s photographs, documents and testimonies from before 1948.');

INSERT INTO public.association_message (title_ar, title_en, content_ar, content_en) VALUES
('أهلاً بكم في ذاكرة القرية', 'Welcome to the village''s memory',
 'هنا ستُنشر كلمة رئيس الجمعية: تعريف بالهدف من الأرشيف، ودعوة لأبناء القرية وأحفادهم للمساهمة بالصور والوثائق والروايات الشفوية.',
 'The association chairperson''s message will be published here: the purpose of the archive, and an invitation to the village''s descendants to contribute photographs, documents and oral testimonies.');

INSERT INTO public.history (title_ar, title_en, content_ar, content_en, sort_order) VALUES
('أصل القرية وموقعها', 'Origins and setting', 'مكان لسرد أقدم الإشارات التاريخية للقرية، وموقعها على السفح، ومصادر مياهها.', 'A place for the earliest historical references to the village, its hillside setting and water sources.', 1),
('البيوت الحجرية والعقود', 'Stone houses and arches', 'وصف لطراز البناء بالحجر الجيري، والعقود المتقاطعة، والأحواش المشتركة بين العائلات.', 'A description of limestone construction, cross-vaulted rooms and the shared courtyards between families.', 2),
('الزيتون والمواسم', 'Olives and the seasons', 'مساحة لتوثيق مساحات الأرض، ومواسم الزيتون والحصاد، والمعاصر القديمة.', 'Space to document the village lands, the olive and harvest seasons, and the old presses.', 3),
('الرحيل والذاكرة', 'Departure and remembrance', 'هنا تُوثَّق أحداث عام ١٩٤٨ كما رواها الشهود، وأسماء العائلات وأماكن لجوئها.', 'Here the events of 1948 will be documented as told by witnesses, with family names and places of refuge.', 4);

INSERT INTO public.articles (title_ar, title_en, content_ar, content_en, featured, published) VALUES
('عنوان الخبر الأول', 'First news headline', 'ملخص قصير للخبر: إعلانات الجمعية، إصدارات أرشيفية جديدة، أو نتائج جمع الوثائق.', 'A short summary: association announcements, newly released archive material, or results of document collection.', true, true),
('عنوان الخبر الثاني', 'Second news headline', 'ملخص قصير للخبر يُدار لاحقاً من لوحة التحكم.', 'A short summary, later managed from the admin dashboard.', false, true),
('عنوان الخبر الثالث', 'Third news headline', 'ملخص قصير للخبر يُدار لاحقاً من لوحة التحكم.', 'A short summary, later managed from the admin dashboard.', false, true);

INSERT INTO public.events (title_ar, title_en, description_ar, description_en, summary_ar, summary_en, event_date, location) VALUES
('عنوان الفعالية الأولى', 'First event title', 'وصف مختصر للفعالية وبرنامجها وطريقة التسجيل.', 'A brief description of the event, its programme and how to register.', 'لقاء الأهالي', 'Family gathering', now() + interval '30 days', '[المكان] / [Venue]'),
('عنوان الفعالية الثانية', 'Second event title', 'وصف مختصر للفعالية وبرنامجها وطريقة التسجيل.', 'A brief description of the event, its programme and how to register.', 'أمسية رواية شفوية', 'Oral history evening', now() + interval '60 days', '[المكان] / [Venue]'),
('عنوان الفعالية الثالثة', 'Third event title', 'وصف مختصر للفعالية وبرنامجها وطريقة التسجيل.', 'A brief description of the event, its programme and how to register.', 'معرض صور', 'Photography exhibition', now() + interval '90 days', '[المكان] / [Venue]');

INSERT INTO public.gallery (album, media_url, media_type, caption_ar, caption_en) VALUES
('village', '/assets/hero-village.jpg', 'image', '[وصف الصورة وتاريخها ومصدرها]', '[Caption, date and source]'),
('village', '/assets/stone-alley.jpg', 'image', '[وصف الصورة وتاريخها ومصدرها]', '[Caption, date and source]'),
('land', '/assets/olive-grove.jpg', 'image', '[وصف الصورة وتاريخها ومصدرها]', '[Caption, date and source]'),
('maps', '/assets/village-map.jpg', 'image', '[وصف الصورة وتاريخها ومصدرها]', '[Caption, date and source]');

INSERT INTO public.guestbook (name, message, approved) VALUES
('[اسم الراوي] / [Narrator name]', '«مكان لاقتباس من رواية شفوية يرويها أحد أبناء القرية عن بيتها أو أرضها أو موسم الزيتون.»', true),
('[اسم الراوي] / [Narrator name]', '«مكان لاقتباس ثانٍ من شهادة موثّقة، مع الإشارة إلى تاريخ التسجيل ومصدره.»', true);

INSERT INTO public.settings (contact_email) VALUES ('[البريد الإلكتروني]');
