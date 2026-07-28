import { Quote } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { sections } from "@/i18n/translations";
import { Reveal } from "./Reveal";
import { SectionShell } from "./SectionShell";

export function StoriesSection() {
  const { t } = useLanguage();
  const s = sections.stories;

  return (
    <SectionShell id="stories" tone="deep" eyebrow={t(s.eyebrow)} title={t(s.title)} body={t(s.body)}>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {s.items.map((item, i) => (
          <Reveal key={i} delay={i * 100}>
            <figure className="h-full rounded-sm border border-gold-soft/25 bg-ink/20 p-7">
              <Quote className="h-6 w-6 text-gold-soft" />
              <blockquote className="mt-4 text-lg leading-loose text-primary-foreground/90">
                {t(item.quote)}
              </blockquote>
              <figcaption className="mt-6 border-t border-gold-soft/20 pt-4">
                <span className="block font-display text-lg">{t(item.name)}</span>
                <span className="block text-sm text-primary-foreground/65">{t(item.meta)}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
      <Reveal delay={200}>
        <div className="mt-10">
          <a
            href="#stories"
            className="inline-flex rounded-full border border-gold-soft/50 px-7 py-3 text-sm font-medium text-gold-soft transition-colors duration-300 hover:bg-accent hover:text-accent-foreground"
          >
            {t(s.cta)}
          </a>
        </div>
      </Reveal>
    </SectionShell>
  );
}
