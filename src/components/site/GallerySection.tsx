import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/LanguageProvider";
import { sections } from "@/i18n/translations";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import { contentQueries } from "@/services/queries";
import { resolveMediaUrl } from "@/lib/media";
import { Reveal } from "./Reveal";
import { SectionShell } from "./SectionShell";

const spans = ["sm:col-span-2 sm:row-span-2", "", "", "sm:col-span-2"];

export function GallerySection() {
  const { t } = useLanguage();
  const field = useLocalizedField();
  const s = sections.gallery;
  const { data: items = [] } = useQuery(contentQueries.gallery(8));

  return (
    <SectionShell
      id="gallery"
      tone="sand"
      eyebrow={t(s.eyebrow)}
      title={t(s.title)}
      body={t(s.body)}
    >
      <div className="mt-14 grid auto-rows-[190px] grid-cols-1 gap-4 sm:auto-rows-[200px] sm:grid-cols-4">
        {items.map((item, i) => {
          const caption = field(item, "caption") || t(s.captionPlaceholder);
          const src = resolveMediaUrl(item.media_url);
          return (
            <Reveal
              key={item.id}
              delay={i * 80}
              variant="veil"
              className={`h-full ${spans[i % spans.length]}`}
            >
              <figure className="sepia-frame group relative h-full overflow-hidden rounded-sm">
                {item.media_type === "video" ? (
                  <video src={src} controls preload="none" className="h-full w-full object-cover" />
                ) : (
                  <img
                    src={src}
                    alt={caption}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-105"
                  />
                )}
                <figcaption className="dusk-veil absolute inset-x-0 bottom-0 translate-y-2 p-4 text-xs leading-relaxed text-parchment/90 opacity-0 transition-all duration-500 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
                  {caption}
                </figcaption>
              </figure>
            </Reveal>
          );
        })}
      </div>
    </SectionShell>
  );
}
