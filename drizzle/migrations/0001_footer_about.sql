-- Footer "about" blurb under the logo — was a hardcoded translation
-- string with no admin control at all. Additive only, safe on top of
-- migrations 1-6.
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS about_ar text,
  ADD COLUMN IF NOT EXISTS about_en text;

UPDATE public.settings
SET
  about_ar = COALESCE(about_ar, 'أرشيف رقمي غير ربحي تديره جمعية أهالي القرية لحفظ الذاكرة والتراث.'),
  about_en = COALESCE(about_en, 'A non-profit digital archive run by the village association to preserve memory and heritage.')
WHERE about_ar IS NULL OR about_en IS NULL;
