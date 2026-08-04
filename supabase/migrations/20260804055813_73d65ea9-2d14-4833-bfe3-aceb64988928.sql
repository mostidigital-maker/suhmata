-- ============================================================
-- Future expansion schema
-- Every table: create -> grant -> enable RLS -> policies
-- ============================================================

-- shared updated_at helper
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ---------------------------------------------- payment methods
CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  kind text NOT NULL DEFAULT 'bank',
  name_ar text NOT NULL DEFAULT '',
  name_en text NOT NULL DEFAULT '',
  instructions_ar text NOT NULL DEFAULT '',
  instructions_en text NOT NULL DEFAULT '',
  account_details text,
  external_url text,
  logo text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.payment_methods TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated;
GRANT ALL ON public.payment_methods TO service_role;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active payment methods" ON public.payment_methods
  FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Staff read all payment methods" ON public.payment_methods
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff manage payment methods" ON public.payment_methods
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_payment_methods_updated BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------- donation campaigns
CREATE TABLE public.donation_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  cover_image text,
  goal_amount numeric(12,2) NOT NULL DEFAULT 0,
  raised_amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'ILS',
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.donation_campaigns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.donation_campaigns TO authenticated;
GRANT ALL ON public.donation_campaigns TO service_role;
ALTER TABLE public.donation_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active campaigns" ON public.donation_campaigns
  FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Staff read all campaigns" ON public.donation_campaigns
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff manage campaigns" ON public.donation_campaigns
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_campaigns_updated BEFORE UPDATE ON public.donation_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------- donations
CREATE TABLE public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.donation_campaigns(id) ON DELETE SET NULL,
  payment_method_id uuid REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  donor_name text,
  donor_email text,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'ILS',
  message text,
  anonymous boolean NOT NULL DEFAULT false,
  is_public boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_donations_campaign ON public.donations (campaign_id, created_at DESC);
GRANT SELECT ON public.donations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read completed public donations" ON public.donations
  FOR SELECT TO anon, authenticated USING (status = 'completed' AND is_public = true);
CREATE POLICY "Staff read all donations" ON public.donations
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff manage donations" ON public.donations
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_donations_updated BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------- family tree
CREATE TABLE public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  family_name_ar text NOT NULL DEFAULT '',
  family_name_en text NOT NULL DEFAULT '',
  full_name_ar text NOT NULL DEFAULT '',
  full_name_en text NOT NULL DEFAULT '',
  gender text,
  birth_year text,
  death_year text,
  notes_ar text NOT NULL DEFAULT '',
  notes_en text NOT NULL DEFAULT '',
  photo text,
  father_id uuid REFERENCES public.family_members(id) ON DELETE SET NULL,
  mother_id uuid REFERENCES public.family_members(id) ON DELETE SET NULL,
  spouse_id uuid REFERENCES public.family_members(id) ON DELETE SET NULL,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_family_members_father ON public.family_members (father_id);
CREATE INDEX idx_family_members_family ON public.family_members (family_name_ar);
GRANT SELECT ON public.family_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_members TO authenticated;
GRANT ALL ON public.family_members TO service_role;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published family members" ON public.family_members
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Staff read all family members" ON public.family_members
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff manage family members" ON public.family_members
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_family_members_updated BEFORE UPDATE ON public.family_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------- historical timeline
CREATE TABLE public.timeline_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  year integer,
  date_label_ar text NOT NULL DEFAULT '',
  date_label_en text NOT NULL DEFAULT '',
  era text,
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  image text,
  published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_timeline_year ON public.timeline_entries (year);
GRANT SELECT ON public.timeline_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timeline_entries TO authenticated;
GRANT ALL ON public.timeline_entries TO service_role;
ALTER TABLE public.timeline_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published timeline" ON public.timeline_entries
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Staff read all timeline" ON public.timeline_entries
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff manage timeline" ON public.timeline_entries
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_timeline_updated BEFORE UPDATE ON public.timeline_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------- memorials
CREATE TABLE public.memorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  full_name_ar text NOT NULL DEFAULT '',
  full_name_en text NOT NULL DEFAULT '',
  family_member_id uuid REFERENCES public.family_members(id) ON DELETE SET NULL,
  birth_year text,
  death_year text,
  biography_ar text NOT NULL DEFAULT '',
  biography_en text NOT NULL DEFAULT '',
  photo text,
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.memorials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memorials TO authenticated;
GRANT ALL ON public.memorials TO service_role;
ALTER TABLE public.memorials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published memorials" ON public.memorials
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Staff read all memorials" ON public.memorials
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff manage memorials" ON public.memorials
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_memorials_updated BEFORE UPDATE ON public.memorials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------- notification subscribers
CREATE TABLE public.notification_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL DEFAULT 'email',
  email text,
  push_endpoint text,
  push_keys jsonb,
  language text NOT NULL DEFAULT 'ar',
  topics text[] NOT NULL DEFAULT ARRAY['news']::text[],
  confirmed boolean NOT NULL DEFAULT false,
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_subscribers_email ON public.notification_subscribers (lower(email)) WHERE email IS NOT NULL;
GRANT INSERT ON public.notification_subscribers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_subscribers TO authenticated;
GRANT ALL ON public.notification_subscribers TO service_role;
ALTER TABLE public.notification_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.notification_subscribers
  FOR INSERT TO anon, authenticated WITH CHECK (confirmed = false);
CREATE POLICY "Staff read subscribers" ON public.notification_subscribers
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff manage subscribers" ON public.notification_subscribers
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_subscribers_updated BEFORE UPDATE ON public.notification_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------- notification log
CREATE TABLE public.notification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL DEFAULT 'email',
  subscriber_id uuid REFERENCES public.notification_subscribers(id) ON DELETE SET NULL,
  topic text,
  subject text,
  body text,
  status text NOT NULL DEFAULT 'queued',
  error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notification_log_created ON public.notification_log (created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_log TO authenticated;
GRANT ALL ON public.notification_log TO service_role;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read notification log" ON public.notification_log
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff manage notification log" ON public.notification_log
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ---------------------------------------------- unified search index
CREATE TABLE public.search_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  slug text,
  route text,
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  body_ar text NOT NULL DEFAULT '',
  body_en text NOT NULL DEFAULT '',
  thumbnail text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id)
);
CREATE INDEX idx_search_title_ar ON public.search_index USING gin (title_ar gin_trgm_ops);
CREATE INDEX idx_search_title_en ON public.search_index USING gin (title_en gin_trgm_ops);
GRANT SELECT ON public.search_index TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.search_index TO authenticated;
GRANT ALL ON public.search_index TO service_role;
ALTER TABLE public.search_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published search index" ON public.search_index
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Staff manage search index" ON public.search_index
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER trg_search_index_updated BEFORE UPDATE ON public.search_index
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
