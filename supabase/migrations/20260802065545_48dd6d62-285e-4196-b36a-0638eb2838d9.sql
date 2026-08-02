ALTER TABLE public.guestbook
  ADD COLUMN IF NOT EXISTS facebook text,
  ADD COLUMN IF NOT EXISTS instagram text,
  ADD COLUMN IF NOT EXISTS hidden boolean NOT NULL DEFAULT false;

ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS map_embed_url text;

DROP POLICY IF EXISTS "Public read approved guestbook" ON public.guestbook;
CREATE POLICY "Public read approved guestbook" ON public.guestbook
  FOR SELECT TO anon, authenticated
  USING (approved = true AND hidden = false);