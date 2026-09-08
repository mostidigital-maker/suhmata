import { useState, useEffect } from "react";

/**
 * Resolves to `primary` if given, falling back to `fallback` — and also
 * falls back automatically if `primary` fails to actually load (a broken
 * or stale URL saved in the database, a deleted storage file, etc.),
 * instead of leaving a broken image in place.
 */
export function useFallbackImage(primary: string | null | undefined, fallback: string) {
  const [failed, setFailed] = useState(false);

  // Give a new primary URL a fresh chance to load.
  useEffect(() => {
    setFailed(false);
  }, [primary]);

  const src = primary && !failed ? primary : fallback;
  const onError = () => setFailed(true);

  return { src, onError };
}
