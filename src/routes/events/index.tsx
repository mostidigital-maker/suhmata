import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import { contentQueries } from "@/services/queries";
import type { VillageEvent } from "@/services/content";
import { eventsPage, ui } from "@/i18n/pages";
import { PageShell } from "@/components/site/PageShell";
import { SectionShell } from "@/components/site/SectionShell";
import { Reveal } from "@/components/site/Reveal";

const title = "الفعاليات — لقاءات وأرشيف جمعية القرية | Events";
const description = "الفعاليات القادمة وأرشيف الفعاليات السابقة مع صورها وفيديوهاتها وملخّصاتها.";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/events" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: EventsIndex,
});

function EventCard({ event }: { event: VillageEvent }) {
  const { lang } = useLanguage();
  const field = useLocalizedField();
  const date = event.event_date
    ? new Date(event.event_date).toLocaleDateString(lang === "ar" ? "ar" : "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const body = (
    <>
      <div className="flex flex-wrap items-center gap-4 text-sm text-olive">
        {date ? (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            {date}
          </span>
        ) : null}
        {event.location ? (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {event.location}
          </span>
        ) : null}
      </div>
      <h3 className="mt-3 text-xl font-semibold">{field(event, "title")}</h3>
      <p className="mt-3 line-clamp-3 leading-loose text-muted-foreground">
        {field(event, "summary") || field(event, "description")}
      </p>
    </>
  );

  return (
    <article className="h-full rounded-sm border border-border bg-card p-6 transition-shadow duration-500 hover:shadow-[var(--shadow-lift)]">
      {event.slug ? (
        <Link
          to="/events/$slug"
          params={{ slug: event.slug }}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {body}
        </Link>
      ) : (
        body
      )}
    </article>
  );
}

function EventsIndex() {
  const { t } = useLanguage();
  const { data: upcoming = [], isLoading } = useQuery(contentQueries.upcomingEvents());
  const { data: past = [] } = useQuery(contentQueries.pastEvents());

  return (
    <PageShell>
      <SectionShell
        id="events"
        className="pt-32"
        eyebrow={t(eventsPage.eyebrow)}
        title={t(eventsPage.title)}
        body={t(eventsPage.body)}
      >
        <h2 className="mt-12 text-2xl font-semibold">{t(eventsPage.upcoming)}</h2>
        {isLoading ? <p className="mt-4 text-muted-foreground">{t(ui.loading)}</p> : null}
        {!isLoading && upcoming.length === 0 ? (
          <p className="mt-4 text-muted-foreground">{t(eventsPage.noUpcoming)}</p>
        ) : null}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((event, i) => (
            <Reveal key={event.id} delay={i * 80}>
              <EventCard event={event} />
            </Reveal>
          ))}
        </div>

        <h2 className="mt-16 text-2xl font-semibold">{t(eventsPage.past)}</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {past.map((event, i) => (
            <Reveal key={event.id} delay={i * 80}>
              <EventCard event={event} />
            </Reveal>
          ))}
        </div>
      </SectionShell>
    </PageShell>
  );
}
