-- Lets admins replace the bundled placeholder map image on /map with
-- their own village map, on top of which the location markers are
-- positioned. Additive only, safe on top of migrations 1-7.
ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS map_background_image text;
