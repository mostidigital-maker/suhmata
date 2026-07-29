import hero from "@/assets/hero-village.jpg";
import olive from "@/assets/olive-grove.jpg";
import alley from "@/assets/stone-alley.jpg";
import map from "@/assets/village-map.jpg";

/**
 * Bundled fallbacks for seeded media paths. Once real files are uploaded to the
 * media library, rows store an absolute URL and this map is bypassed.
 */
const bundled: Record<string, string> = {
  "/assets/hero-village.jpg": hero,
  "/assets/olive-grove.jpg": olive,
  "/assets/stone-alley.jpg": alley,
  "/assets/village-map.jpg": map,
};

export function resolveMediaUrl(url: string | null | undefined, fallback?: string) {
  if (!url) return fallback;
  return bundled[url] ?? url;
}
