import { useLanguage } from "@/i18n/LanguageProvider";
import { sections } from "@/i18n/translations";
import { Reveal } from "./Reveal";
import { SectionShell } from "./SectionShell";
import { ViewAllLink } from "./ViewAllLink";
import hero from "@/assets/hero-village.jpg";
import olive from "@/assets/olive-grove.jpg";
import alley from "@/assets/stone-alley.jpg";
import map from "@/assets/village-map.jpg";

const frames = [
  { src: hero, w: 1920, h: 1280, span: "sm:col-span-2 sm:row-span-2" },
  { src: alley, w: 1200, h: 900, span: "" },
  { src: olive, w: 1200, h: 900, span: "" },
  { src: map, w: 1400, h: 900, span: "sm:col-span-2" },
];

export function GallerySection() {
  const { t } = useLanguage();
  const s = sections.gallery;

  return (
    <SectionShell
      id="gallery"
      tone="sand"
      eyebrow={t(s.eyebrow)}
      title={t(s.title)}
      body={t(s.body)}
    >
      <div className="mt-12 grid auto-rows-[180px] grid-cols-1 gap-4 sm:grid-cols-4 sm:auto-rows-[190px]">
        {frames.map((frame, i) => (
          <Reveal key={i} delay={i * 80} className={frame.span}>
            <figure className="sepia-frame group relative h-full overflow-hidden rounded-sm">
              <img
                src={frame.src}
                alt={t(s.captionPlaceholder)}
                loading="lazy"
                width={frame.w}
                height={frame.h}
                className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
              />
              <figcaption className="dusk-veil absolute inset-x-0 bottom-0 p-3 text-xs text-parchment/85 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                {t(s.captionPlaceholder)}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
      <div className="mt-8">
        <ViewAllLink href="#gallery" />
      </div>
    </SectionShell>
  );
}
