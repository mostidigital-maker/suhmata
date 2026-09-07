-- ============================================================
-- MODERATION QUEUE — visitor submissions. Any staff role
-- (editor, admin, super_admin) can approve/hide/reject/delete.
-- Public can only insert their own pending submission.
-- ============================================================

CREATE TABLE public.guestbook (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  social_link text,
  facebook text,
  instagram text,
  message text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.guestbook TO anon;
GRANT INSERT ON public.guestbook TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guestbook TO authenticated;
GRANT ALL ON public.guestbook TO service_role;
ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read approved guestbook" ON public.guestbook FOR SELECT TO anon, authenticated
  USING (approved = true AND hidden = false);
CREATE POLICY "Staff read all guestbook" ON public.guestbook FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Anyone submits guestbook entry" ON public.guestbook FOR INSERT TO anon, authenticated WITH CHECK (approved = false);
CREATE POLICY "Staff moderate guestbook" ON public.guestbook FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete guestbook" ON public.guestbook FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

CREATE TABLE public.visitor_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name text NOT NULL,
  email text,
  social_link text,
  video_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT visitor_videos_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);
GRANT SELECT ON public.visitor_videos TO anon;
GRANT INSERT ON public.visitor_videos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitor_videos TO authenticated;
GRANT ALL ON public.visitor_videos TO service_role;
ALTER TABLE public.visitor_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read approved videos" ON public.visitor_videos FOR SELECT TO anon, authenticated USING (status = 'approved');
CREATE POLICY "Staff read all videos" ON public.visitor_videos FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Anyone submits pending video" ON public.visitor_videos FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending');
CREATE POLICY "Staff moderate videos" ON public.visitor_videos FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete videos" ON public.visitor_videos FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

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
CREATE POLICY "Staff read all contributions" ON public.contributions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff moderate contributions" ON public.contributions FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete contributions" ON public.contributions FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));
