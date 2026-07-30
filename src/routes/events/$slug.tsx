import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import { contentQueries } from "@/services/queries";
import { eventsPage, ui } from "@/i18n/pages";
import { PageShell } from "@/components/site/PageShell";
import { SectionShell } from "@/components/site/SectionShell";
import { MasonryGallery } from "@/components/site/MasonryGallery";
import { Lightbox } from "@/components/site/Lightbox";
import { ShareRow } from "@/components/site/ShareRow";

export const Route = createFileRoute("/events/$slug")({
  head: ({ params }) => {
    const title = `فعالية — ${params.slug} | Village event`;
    const description = "تفاصيل الفعالية وصورها وفيديوهاتها وملخّصها بعد انتهائها.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/events/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/events/${params.slug}` }],
    };
  },
  component: EventDetail,
});

function EventDetail() {
  const { slug } = Route.useParams();
  const { lang, t } = useLanguage();
  const field = useLocalizedField();
  const [index, setIndex] = useState<number | null>(null);

  const { data: event, isLoading } = useQuery(contentQueries.event(slug));
  const { data: media = [] } = useQuery(contentQueries.eventMedia(event?.id));

  const photos = media
    .filter((m) => m.media_type !== "video")
    .map((m) => ({ id: m.id, url: m.media_url, caption: field(m, "caption"), type: m.media_type }));
  const videos = media.filter((m) => m.media_type === "video");

  const date = event?.event_date
    ? new Date(event.event_date).toLocaleDateString(lang === "ar" ? "ar" : "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <PageShell>
      <SectionShell
        id="event"
        className="pt-32"
        eyebrow={t(eventsPage.eyebrow)}
        title={event ? field(event, "title") : slug}
        body={event ? field(event, "description") : undefined}
      >
        <Link
          to="/events"
          className="mt-6 inline-flex items-center gap-2 text-sm text-olive hover:text-accent-foreground"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t(eventsPage.title)}
        </Link>

        {isLoading ? <p className="mt-6 text-muted-foreground">{t(ui.loading)}</p> : null}

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-olive">
          {date ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              {date}
            </span>
          ) : null}
          {event?.location ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {event.location}
            </span>
          ) : null}
        </div>

        {event && field(event, "summary") ? (
          <div className="mt-8 rounded-sm border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">{t(eventsPage.summary)}</h2>
            <p className="mt-3 leading-loose text-muted-foreground">{field(event, "summary")}</p>
          </div>
        ) : null}

        <div className="mt-8">
          <ShareRow title={event ? field(event, "title") : slug} />
        </div>

        {photos.length ? (
          <>
            <h2 className="mt-14 text-2xl font-semibold">{t(eventsPage.photos)}</h2>
            <MasonryGallery items={photos} onOpen={setIndex} />
          </>
        ) : null}

        {videos.length ? (
          <>
            <h2 className="mt-14 text-2xl font-semibold">{t(eventsPage.videos)}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {videos.map((v) => (
                <figure key={v.id} className="sepia-frame overflow-hidden rounded-sm">
                  <video src={v.media_url} controls preload="none" className="w-full" />
                  <figcaption className="border-t border-border bg-secondary px-3 py-2 text-xs text-muted-foreground">
                    {field(v, "caption")}
                  </figcaption>
                </figure>
              ))}
            </div>
          </>
        ) : null}
      </SectionShell>

      <Lightbox items={photos} index={index} onClose={() => setIndex(null)} onIndexChange={setIndex} />
    </PageShell>
  );
}
