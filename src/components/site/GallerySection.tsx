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
      <div className="mt-12 grid auto-rows-[180px] grid-cols-1 gap-4 sm:auto-rows-[190px] sm:grid-cols-4">
        {items.map((item, i) => {
          const caption = field(item, "caption") || t(s.captionPlaceholder);
          const src = resolveMediaUrl(item.media_url);
          return (
            <Reveal key={item.id} delay={i * 80} className={spans[i % spans.length]}>
              <figure className="sepia-frame group relative h-full overflow-hidden rounded-sm">
                {item.media_type === "video" ? (
                  <video
                    src={src}
                    controls
                    preload="none"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={src}
                    alt={caption}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  />
                )}
                <figcaption className="dusk-veil absolute inset-x-0 bottom-0 p-3 text-xs text-parchment/85 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
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
