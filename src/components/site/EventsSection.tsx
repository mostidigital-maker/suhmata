import { MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/LanguageProvider";
import { sections } from "@/i18n/translations";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import { contentQueries } from "@/services/queries";
import { Reveal } from "./Reveal";
import { SectionShell } from "./SectionShell";

export function EventsSection() {
  const { lang, t } = useLanguage();
  const field = useLocalizedField();
  const s = sections.events;
  const { data: events = [] } = useQuery(contentQueries.events(6));

  const parts = (value: string | null) => {
    if (!value) return { day: "--", month: lang === "ar" ? "الشهر" : "Month" };
    const date = new Date(value);
    return {
      day: date.toLocaleDateString(lang === "ar" ? "ar" : "en-GB", { day: "2-digit" }),
      month: date.toLocaleDateString(lang === "ar" ? "ar" : "en-GB", { month: "short" }),
    };
  };

  return (
    <SectionShell id="events" eyebrow={t(s.eyebrow)} title={t(s.title)} body={t(s.body)}>
      <ul className="mt-12 divide-y divide-border border-y border-border">
        {events.map((item, i) => {
          const { day, month } = parts(item.event_date);
          return (
            <Reveal key={item.id} delay={i * 80}>
              <li className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-5 py-7 sm:gap-8">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-sm border border-accent/50 bg-secondary sm:h-20 sm:w-20">
                  <span className="font-display text-2xl font-semibold">{day}</span>
                  <span className="text-[0.6rem] tracking-[0.2em] text-muted-foreground uppercase">
                    {month}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-semibold sm:text-2xl">{field(item, "title")}</h3>
                  {item.location ? (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-olive">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {item.location}
                    </p>
                  ) : null}
                  <p className="mt-3 leading-loose text-muted-foreground">
                    {field(item, "description")}
                  </p>
                </div>
              </li>
            </Reveal>
          );
        })}
      </ul>
    </SectionShell>
  );
}
