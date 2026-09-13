import hero from "@/assets/hero-village.jpg";
import olive from "@/assets/olive-grove.jpg";
import alley from "@/assets/stone-alley.jpg";
import map from "@/assets/village-map.jpg";
import { supabase } from "@/integrations/supabase/client";

/**
 * Bundled fallbacks for seeded media paths. Once real files are uploaded to the
 * media library, rows store a storage path or absolute URL instead.
 */
const bundled: Record<string, string> = {
  "/assets/hero-village.jpg": hero,
  "/assets/olive-grove.jpg": olive,
  "/assets/stone-alley.jpg": alley,
  "/assets/village-map.jpg": map,
};

/** True when the value is a bare path inside the public `media` storage bucket. */
export function isStoragePath(url: string | null | undefined): url is string {
  if (!url) return false;
  return !url.startsWith("http") && !url.startsWith("/") && !url.startsWith("data:");
}

/**
 * Resolves a stored media reference into something an <img> can actually
 * load: a bundled asset import, an absolute URL passed straight through, or
 * a bare `media` storage path (e.g. "site/uuid.jpg", as returned by the
 * admin upload helper) turned into its public storage URL. The `media`
 * bucket is public, so this is a pure string computation — no signed URL
 * or network round-trip needed.
 */
export function resolveMediaUrl(url: string | null | undefined, fallback?: string) {
  if (!url) return fallback;
  if (bundled[url]) return bundled[url];
  if (isStoragePath(url)) return supabase.storage.from("media").getPublicUrl(url).data.publicUrl;
  return url;
}
