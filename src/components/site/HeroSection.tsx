import { useLanguage } from "@/i18n/LanguageProvider";
import { site } from "@/i18n/translations";
import heroImage from "@/assets/hero-village.jpg";
import crest from "@/assets/village-crest.png";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section id="top" className="relative isolate min-h-[92svh] overflow-hidden">
      <img
        src={heroImage}
        alt=""
        width={1920}
        height={1280}
        fetchPriority="high"
        className="absolute inset-0 -z-20 h-full w-full scale-105 object-cover"
      />
      <div className="dusk-veil absolute inset-0 -z-10" />

      <div className="mx-auto flex min-h-[92svh] max-w-6xl flex-col items-center justify-center px-5 pt-28 pb-24 text-center sm:px-8">
        <img
          src={crest}
          alt={t(site.associationName)}
          width={816}
          height={816}
          className="fade-in-slow h-24 w-24 sm:h-28 sm:w-28"
        />

        <p className="rise-in mt-8 font-body text-[0.7rem] tracking-[0.4em] text-gold-soft uppercase">
          {t(site.villageTagline)}
        </p>

        <h1
          className="rise-in mt-5 text-4xl leading-tight font-semibold text-parchment sm:text-6xl md:text-7xl"
          style={{ animationDelay: "120ms" }}
        >
          {t(site.villageName)}
        </h1>

        <div className="gold-rule mt-8 max-w-xs" />

        <p
          className="rise-in mt-8 max-w-2xl text-base leading-loose text-parchment/85 sm:text-lg"
          style={{ animationDelay: "240ms" }}
        >
          {t(site.heroIntro)}
        </p>

        <div
          className="rise-in mt-10 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: "360ms" }}
        >
          <a
            href="#history"
            className="rounded-full bg-accent px-7 py-3 text-sm font-medium text-accent-foreground transition-transform duration-300 hover:-translate-y-0.5"
          >
            {t(site.heroCta)}
          </a>
          <a
            href="#gallery"
            className="rounded-full border border-parchment/40 px-7 py-3 text-sm font-medium text-parchment transition-colors duration-300 hover:border-accent hover:text-gold-soft"
          >
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
