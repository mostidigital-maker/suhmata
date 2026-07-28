import { useLanguage } from "@/i18n/LanguageProvider";
import { sections } from "@/i18n/translations";
import { Reveal } from "./Reveal";
import { SectionShell } from "./SectionShell";
import alley from "@/assets/stone-alley.jpg";

export function HistorySection() {
  const { t } = useLanguage();
  const s = sections.history;

  return (
    <SectionShell id="history" eyebrow={t(s.eyebrow)} title={t(s.title)} body={t(s.body)}>
      <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <figure className="sepia-frame overflow-hidden rounded-sm">
            <img
              src={alley}
              alt=""
              loading="lazy"
              width={1200}
              height={900}
              className="h-full w-full object-cover"
            />
          </figure>
        </Reveal>

        <ol className="relative border-s border-border ps-8">
          {s.timeline.map((entry, i) => (
            <Reveal key={entry.period.en} delay={i * 90}>
              <li className="relative pb-10 last:pb-0">
                <span className="absolute -start-[2.05rem] top-2 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-background" />
                <p className="font-body text-[0.7rem] tracking-[0.3em] text-olive uppercase">
                  {t(entry.period)}
                </p>
                <h3 className="mt-2 text-2xl font-semibold">{t(entry.title)}</h3>
                <p className="mt-3 leading-loose text-muted-foreground">{t(entry.body)}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </SectionShell>
  );
}
