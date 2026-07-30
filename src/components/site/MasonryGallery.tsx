import { useEffect, useRef } from "react";
import { useMediaSrc } from "@/hooks/useMediaSrc";
import type { LightboxItem } from "./Lightbox";

function MasonryTile({
  item,
  onOpen,
  index,
}: {
  item: LightboxItem & { width?: number | null; height?: number | null };
  onOpen: (index: number) => void;
  index: number;
}) {
  const src = useMediaSrc(item.url);
  const ratio = item.width && item.height ? item.width / item.height : 4 / 3;

  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className="sepia-frame group mb-4 block w-full overflow-hidden rounded-sm break-inside-avoid focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-label={item.caption || `Item ${index + 1}`}
    >
      {item.type === "video" ? (
        <video src={src} preload="none" className="w-full" style={{ aspectRatio: ratio }} />
      ) : (
        <img
          src={src}
          alt={item.caption ?? ""}
          loading="lazy"
          decoding="async"
          style={{ aspectRatio: ratio }}
          className="w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
      )}
      {item.caption ? (
        <span className="block border-t border-border bg-secondary px-3 py-2 text-start text-xs text-muted-foreground">
          {item.caption}
        </span>
      ) : null}
    </button>
  );
}

/** CSS-column masonry grid with a sentinel that drives infinite scrolling. */
export function MasonryGallery({
  items,
  onOpen,
  onReachEnd,
  hasMore,
}: {
  items: (LightboxItem & { width?: number | null; height?: number | null })[];
  onOpen: (index: number) => void;
  onReachEnd?: () => void;
  hasMore?: boolean;
}) {
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasMore || !onReachEnd) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && onReachEnd()),
      { rootMargin: "600px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, onReachEnd]);

  return (
    <>
      <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((item, i) => (
          <MasonryTile key={item.id} item={item} index={i} onOpen={onOpen} />
        ))}
      </div>
      <div ref={sentinel} aria-hidden className="h-px" />
    </>
  );
}
