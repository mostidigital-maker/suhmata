import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/LanguageProvider";
import { sections } from "@/i18n/translations";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import { contentQueries } from "@/services/queries";
import { useMediaSrc } from "@/hooks/useMediaSrc";
import { Reveal } from "./Reveal";
import { SectionShell } from "./SectionShell";
import alley from "@/assets/stone-alley.jpg";

export function HistorySection() {
  const { t } = useLanguage();
  const field = useLocalizedField();
  const s = sections.history;
  const { data: entries = [] } = useQuery(contentQueries.history());
  const { data: intro } = useQuery(contentQueries.sectionIntro("history"));
  const image = useMediaSrc(intro?.image, alley) ?? alley;
  const title = field(intro, "title") || t(s.title);
  const body = field(intro, "body") || t(s.body);

  return (
    <SectionShell id="history" eyebrow={t(s.eyebrow)} title={title} body={body}>
      <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <figure className="sepia-frame overflow-hidden rounded-sm">
            <img
              src={image}
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
              <Reveal delay={i * 90} variant="unfurl">
                <h3 className="text-h3 font-semibold">{field(entry, "title")}</h3>
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
