import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/LanguageProvider";
import { site } from "@/i18n/translations";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import { contentQueries } from "@/services/queries";
import { useMediaSrc } from "@/hooks/useMediaSrc";
import heroImage from "@/assets/hero-village.jpg";
import crest from "@/assets/village-crest.png";

export function HeroSection() {
  const { t } = useLanguage();
  const field = useLocalizedField();
  const { data: hero } = useQuery(contentQueries.hero());

  const background = useMediaSrc(hero?.background_image, heroImage) ?? heroImage;
  const title = field(hero, "title") || t(site.villageName);
  const subtitle = field(hero, "subtitle") || t(site.heroIntro);

  return (
    <section id="top" className="relative isolate min-h-[92svh] overflow-hidden">
      <img
        src={background}
        alt=""
        width={1920}
        height={1280}
        fetchPriority="high"
        decoding="async"
        className="drift-slow absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="dusk-veil absolute inset-0 -z-10" />
      {/* Gilded plate border, like a framed museum photograph. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-4 -z-10 border border-parchment/15 sm:inset-7"
      />

      <div className="mx-auto flex min-h-[92svh] max-w-6xl flex-col items-center justify-center px-gutter pt-32 pb-28 text-center">
        <img
          src={crest}
          alt={t(site.associationName)}
          width={816}
          height={816}
          fetchPriority="high"
          className="fade-in-slow h-24 w-24 sm:h-28 sm:w-28"
        />

        <p className="rise-in mt-9 font-body text-[0.7rem] tracking-[0.45em] text-gold-soft uppercase">
          {t(site.villageTagline)}
        </p>

        <h1
          className="rise-in mt-6 text-display font-semibold text-parchment"
          style={{ animationDelay: "120ms" }}
        >
          {title}
        </h1>

        <div className="ornament rise-in mt-9" style={{ animationDelay: "200ms" }} aria-hidden>
          <span className="h-2 w-2 rotate-45 bg-current" />
        </div>

        <p
          className="rise-in mt-8 max-w-2xl text-lede text-parchment/85"
          style={{ animationDelay: "300ms" }}
        >
          {subtitle}
        </p>

        <div
          className="rise-in mt-11 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "420ms" }}
        >
          <a href="#history" className="btn-base btn-gold">
            {t(site.heroCta)}
          </a>
          <a href="#gallery" className="btn-base btn-onDark">
            {t(site.heroCtaSecondary)}
          </a>
        </div>
      </div>

      <span className="absolute inset-x-0 bottom-6 text-center text-[0.6rem] tracking-[0.35em] text-parchment/55 uppercase">
        {t(site.scrollHint)}
      </span>
    </section>
  );
}
