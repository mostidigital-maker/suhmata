import { useLanguage } from "@/i18n/LanguageProvider";
import { sections } from "@/i18n/translations";
import { Reveal } from "./Reveal";
import { SectionShell } from "./SectionShell";
import map from "@/assets/village-map.jpg";

export function LocationSection() {
  const { t } = useLanguage();
  const s = sections.location;

  return (
    <SectionShell id="location" eyebrow={t(s.eyebrow)} title={t(s.title)} body={t(s.body)}>
      <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-start">
        <Reveal>
          <figure className="sepia-frame overflow-hidden rounded-sm">
            <img
              src={map}
              alt={t(s.mapNote)}
              loading="lazy"
              width={1400}
              height={900}
              className="h-full w-full object-cover"
            />
            <figcaption className="border-t border-border bg-secondary px-4 py-3 text-xs text-muted-foreground">
              {t(s.mapNote)}
            </figcaption>
          </figure>
        </Reveal>

        <Reveal delay={120}>
          <dl className="divide-y divide-border border-y border-border">
            {s.facts.map((fact) => (
              <div
                key={fact.label.en}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 py-4"
              >
                <dt className="min-w-0 text-sm tracking-wide text-muted-foreground">
                  {t(fact.label)}
                </dt>
                <dd className="font-display text-lg font-semibold">{t(fact.value)}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </SectionShell>
  );
}
