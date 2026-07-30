import hero from "@/assets/hero-village.jpg";
import olive from "@/assets/olive-grove.jpg";
import alley from "@/assets/stone-alley.jpg";
import map from "@/assets/village-map.jpg";

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

/** True when the value is a path inside the private `media` storage bucket. */
export function isStoragePath(url: string | null | undefined): url is string {
  if (!url) return false;
  return !url.startsWith("http") && !url.startsWith("/") && !url.startsWith("data:");
}

export function resolveMediaUrl(url: string | null | undefined, fallback?: string) {
  if (!url) return fallback;
  return bundled[url] ?? url;
}
