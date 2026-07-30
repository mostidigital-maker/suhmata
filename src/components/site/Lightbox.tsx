import { useCallback, useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ui } from "@/i18n/pages";
import { useMediaSrc } from "@/hooks/useMediaSrc";

export type LightboxItem = {
  id: string;
  url: string;
  caption?: string;
  type?: string;
};

function LightboxMedia({ item, zoom }: { item: LightboxItem; zoom: number }) {
  const src = useMediaSrc(item.url);
  if (item.type === "video") {
    return <video src={src} controls className="max-h-[80vh] max-w-full rounded-sm" />;
  }
  return (
    <img
      src={src}
      alt={item.caption ?? ""}
      className="max-h-[80vh] max-w-full rounded-sm object-contain transition-transform duration-300"
      style={{ transform: `scale(${zoom})` }}
    />
  );
}

/** Accessible full-screen viewer with keyboard navigation and zoom. */
export function Lightbox({
  items,
  index,
  onClose,
  onIndexChange,
}: {
  items: LightboxItem[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}) {
  const { t } = useLanguage();
  const [zoom, setZoom] = useState(1);
  const open = index !== null && items.length > 0;

  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      setZoom(1);
      onIndexChange((index + delta + items.length) % items.length);
    },
    [index, items.length, onIndexChange],
  );

  useEffect(() => setZoom(1), [index]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(3, z + 0.25));
      if (e.key === "-") setZoom((z) => Math.max(1, z - 0.25));
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose, step]);

  if (!open || index === null) return null;
  const item = items[index];

  const controlClass =
    "grid h-11 w-11 place-items-center rounded-full border border-gold-soft/40 bg-ink/60 text-parchment transition-colors hover:bg-accent hover:text-accent-foreground";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.caption ?? t(ui.share)}
      className="fixed inset-0 z-[120] flex flex-col bg-ink/95 p-4 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            className={controlClass}
            aria-label={t(ui.zoomOut)}
            onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={controlClass}
            aria-label={t(ui.zoomIn)}
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
        <button type="button" className={controlClass} aria-label={t(ui.close)} onClick={onClose} autoFocus>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center gap-3 overflow-hidden py-4">
        <button
          type="button"
          className={`${controlClass} shrink-0`}
          aria-label={t(ui.previous)}
          onClick={() => step(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <LightboxMedia item={item} zoom={zoom} />
        <button
          type="button"
          className={`${controlClass} shrink-0`}
          aria-label={t(ui.next)}
          onClick={() => step(1)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <p className="text-center text-sm text-parchment/80">
        {item.caption} <span className="text-parchment/50">{index + 1} / {items.length}</span>
      </p>
    </div>
  );
}
