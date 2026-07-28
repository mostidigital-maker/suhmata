import { useLanguage } from "@/i18n/LanguageProvider";
import { sections } from "@/i18n/translations";
import { Reveal } from "./Reveal";
import { SectionShell } from "./SectionShell";
import { PlaceholderBadge, ViewAllLink } from "./ViewAllLink";

export function NewsSection() {
  const { t } = useLanguage();
  const s = sections.news;

  return (
    <SectionShell id="news" tone="sand" eyebrow={t(s.eyebrow)} title={t(s.title)} body={t(s.body)}>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {s.items.map((item, i) => (
          <Reveal key={i} delay={i * 90}>
            <article className="flex h-full flex-col rounded-sm border border-border bg-card p-6 transition-shadow duration-500 hover:shadow-[var(--shadow-lift)]">
              <div className="flex items-center justify-between gap-3">
                <time className="text-[0.7rem] tracking-[0.25em] text-muted-foreground uppercase">
                  {t(item.date)}
                </time>
                <PlaceholderBadge />
              </div>
              <h3 className="mt-4 text-xl leading-snug font-semibold">{t(item.title)}</h3>
              <p className="mt-3 grow leading-loose text-muted-foreground">{t(item.body)}</p>
              <div className="mt-6">
                <ViewAllLink href="#news" />
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
