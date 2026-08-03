import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/LanguageProvider";
import { sections } from "@/i18n/translations";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import { contentQueries } from "@/services/queries";
import { Reveal } from "./Reveal";
import { SectionShell } from "./SectionShell";
import olive from "@/assets/olive-grove.jpg";

export function WelcomeSection() {
  const { t } = useLanguage();
  const field = useLocalizedField();
  const s = sections.welcome;
  const { data: message } = useQuery(contentQueries.association());

  return (
    <SectionShell
      id="welcome"
      tone="sand"
      eyebrow={t(s.eyebrow)}
      title={field(message, "title") || t(s.title)}
    >
      <div className="mt-14 grid gap-12 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:items-center">
        <Reveal>
          <blockquote className="border-s-2 border-accent/70 ps-6 font-display text-2xl leading-relaxed text-foreground/90">
            {field(message, "content")}
          </blockquote>
          <div className="mt-8">
            <p className="font-display text-xl font-semibold">{t(s.signatureName)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t(s.signatureRole)}</p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <figure className="sepia-frame overflow-hidden rounded-sm">
            <img
              src={olive}
              alt=""
              loading="lazy"
              width={1200}
              height={900}
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out hover:scale-[1.03]"
            />
          </figure>
        </Reveal>
      </div>
    </SectionShell>
  );
}
