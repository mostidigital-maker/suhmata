import { resolveMediaUrl } from "@/lib/media";

/**
 * Resolves a stored media reference to a displayable URL: a bundled asset,
 * an absolute URL, or a bare `media` storage path turned into its public
 * URL. Purely synchronous — the `media` bucket is public, so no signed URL
 * or network round-trip is needed.
 */
export function useMediaSrc(url: string | null | undefined, fallback?: string) {
  return resolveMediaUrl(url, fallback);
}
