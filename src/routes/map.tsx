import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import { useMediaSrc } from "@/hooks/useMediaSrc";
import { contentQueries } from "@/services/queries";
import type { MapLocation } from "@/services/content";
import { mapPage, ui } from "@/i18n/pages";
import { PageShell } from "@/components/site/PageShell";
import { SectionShell } from "@/components/site/SectionShell";
import { cn } from "@/lib/utils";
import villageMap from "@/assets/village-map.jpg";

const title = "خريطة القرية التفاعلية | Interactive village map";
const description =
  "خريطة تفاعلية لمعالم القرية قبل ١٩٤٨: بيوت العائلات، المسجد، المقبرة، المدرسة، الآبار والمعالم المهمة.";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/map" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/map" }],
  }),
  component: MapPage,
});

function LocationMedia({ locationId }: { locationId: string }) {
  const { data: media = [] } = useQuery(contentQueries.locationMedia(locationId));
  if (!media.length) return null;
  return (
    <ul className="mt-5 grid grid-cols-2 gap-3">
      {media.map((m) => (
        <li key={m.id}>
          <MediaThumb url={m.media_url} caption={m.caption_ar || m.caption_en} />
        </li>
      ))}
    </ul>
  );
}

function MediaThumb({ url, caption }: { url: string; caption?: string }) {
  const src = useMediaSrc(url);
  if (!src) return null;
  return (
    <figure className="sepia-frame overflow-hidden rounded-sm">
      <img src={src} alt={caption ?? ""} loading="lazy" className="aspect-[4/3] w-full object-cover" />
    </figure>
  );
}

function MapPage() {
  const { t } = useLanguage();
  const field = useLocalizedField();
  const { data: locations = [], isLoading } = useQuery(contentQueries.mapLocations());
  const [activeId, setActiveId] = useState<string | null>(null);
  const active: MapLocation | undefined =
    locations.find((l) => l.id === activeId) ?? locations[0];

  return (
    <PageShell>
      <SectionShell
        id="map"
        className="pt-32"
        eyebrow={t(mapPage.eyebrow)}
        title={t(mapPage.title)}
        body={t(mapPage.body)}
      >
        {isLoading ? <p className="mt-10 text-muted-foreground">{t(ui.loading)}</p> : null}

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="sepia-frame relative overflow-hidden rounded-sm">
            <img
              src={villageMap}
              alt={t(mapPage.title)}
              className="w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            {locations.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => setActiveId(loc.id)}
                aria-pressed={active?.id === loc.id}
                aria-label={field(loc, "name")}
                style={{ left: `${loc.pos_x}%`, top: `${loc.pos_y}%` }}
                className={cn(
                  "absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-md transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  active?.id === loc.id
                    ? "scale-125 border-background bg-accent"
                    : "border-background bg-olive hover:scale-110",
                )}
              />
            ))}
          </div>

          <div>
            <h2 className="text-[0.7rem] tracking-[0.3em] text-olive uppercase">
              {t(mapPage.landmarks)}
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {locations.map((loc) => (
                <li key={loc.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(loc.id)}
                    className={cn(
                      "min-h-11 rounded-full border px-4 py-2 text-sm transition-colors",
                      active?.id === loc.id
                        ? "border-accent bg-accent/15 text-olive"
                        : "border-border text-muted-foreground hover:border-accent",
                    )}
                  >
                    {field(loc, "name")}
                  </button>
                </li>
              ))}
            </ul>

            {active ? (
              <article
                aria-live="polite"
                className="mt-6 rounded-sm border border-border bg-card p-6"
              >
                <h3 className="text-xl font-semibold">{field(active, "name")}</h3>
                <p className="mt-3 leading-loose text-muted-foreground">
                  {field(active, "description")}
                </p>
                {field(active, "notes") ? (
                  <>
                    <h4 className="mt-6 text-[0.7rem] tracking-[0.3em] text-olive uppercase">
                      {t(mapPage.notes)}
                    </h4>
                    <p className="mt-2 leading-loose whitespace-pre-line text-muted-foreground">
                      {field(active, "notes")}
                    </p>
                  </>
                ) : null}
                <LocationMedia locationId={active.id} />
              </article>
            ) : null}
          </div>
        </div>
      </SectionShell>
    </PageShell>
  );
}
