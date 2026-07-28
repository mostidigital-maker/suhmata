import { MapPin } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { sections } from "@/i18n/translations";
import { Reveal } from "./Reveal";
import { SectionShell } from "./SectionShell";

export function EventsSection() {
  const { t } = useLanguage();
  const s = sections.events;

  return (
    <SectionShell id="events" eyebrow={t(s.eyebrow)} title={t(s.title)} body={t(s.body)}>
      <ul className="mt-12 divide-y divide-border border-y border-border">
        {s.items.map((item, i) => (
          <Reveal key={i} delay={i * 80}>
            <li className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-5 py-7 sm:gap-8">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-sm border border-accent/50 bg-secondary sm:h-20 sm:w-20">
                <span className="font-display text-2xl font-semibold">{t(item.day)}</span>
                <span className="text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase">
                  {t(item.month)}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-semibold sm:text-2xl">{t(item.title)}</h3>
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-olive">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {t(item.place)}
                </p>
                <p className="mt-3 leading-loose text-muted-foreground">{t(item.body)}</p>
              </div>
            </li>
          </Reveal>
        ))}
      </ul>
    </SectionShell>
  );
}
