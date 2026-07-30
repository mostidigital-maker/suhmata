import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isStoragePath, resolveMediaUrl } from "@/lib/media";

/**
 * Resolves a stored media reference to a displayable URL. Bundled asset paths
 * and absolute URLs pass straight through; private storage paths are exchanged
 * for a short-lived signed URL.
 */
export function useMediaSrc(url: string | null | undefined, fallback?: string) {
  const needsSigning = isStoragePath(url);
  const { data } = useQuery({
    queryKey: ["signed-media", url],
    enabled: needsSigning,
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("media")
        .createSignedUrl(url as string, 60 * 60);
      if (error) throw new Error(error.message);
      return data.signedUrl;
    },
  });

  if (needsSigning) return data ?? fallback;
  return resolveMediaUrl(url, fallback);
}
