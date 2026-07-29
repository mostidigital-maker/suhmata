import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/LanguageProvider";
import { sections } from "@/i18n/translations";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import { contentQueries } from "@/services/queries";
import { Reveal } from "./Reveal";
import { SectionShell } from "./SectionShell";
import alley from "@/assets/stone-alley.jpg";

export function HistorySection() {
  const { t } = useLanguage();
  const field = useLocalizedField();
  const s = sections.history;
  const { data: entries = [] } = useQuery(contentQueries.history());

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

        <ol className="relative space-y-10 border-s border-border ps-8">
          {entries.map((entry, i) => (
            <li key={entry.id} className="relative">
              <span className="absolute -start-[2.05rem] top-2 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-background" />
              <Reveal delay={i * 90}>
                <h3 className="text-2xl font-semibold">{field(entry, "title")}</h3>
                <p className="mt-3 leading-loose text-muted-foreground">
                  {field(entry, "content")}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </SectionShell>
  );
}
