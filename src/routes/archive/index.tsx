import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import { useMediaSrc } from "@/hooks/useMediaSrc";
import { contentQueries } from "@/services/queries";
import type { ArchiveItem, ArchiveKind } from "@/services/content";
import { archivePage, ui } from "@/i18n/pages";
import { PageShell } from "@/components/site/PageShell";
import { SectionShell } from "@/components/site/SectionShell";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";

const title = "الأرشيف التاريخي — وثائق وخرائط وتسجيلات | Historical archive";
const description =
  "وثائق أصلية وخرائط وصور قديمة وتسجيلات صوتية وأفلام وملفات PDF قابلة للتحميل من أرشيف القرية.";

const kinds: ArchiveKind[] = ["document", "map", "photo", "audio", "video", "pdf"];

export const Route = createFileRoute("/archive/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/archive" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/archive" }],
  }),
  component: ArchiveIndex,
});

function ArchiveCard({ item }: { item: ArchiveItem }) {
  const field = useLocalizedField();
  const thumb = useMediaSrc(item.thumbnail_url);

  return (
    <Link
      to="/archive/$slug"
      params={{ slug: item.slug }}
      className="group block overflow-hidden rounded-sm border border-border bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="sepia-frame aspect-[4/3] overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-secondary" />
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold">{field(item, "title")}</h3>
        <p className="mt-2 line-clamp-3 leading-loose text-muted-foreground">
          {field(item, "description")}
        </p>
        <p className="mt-3 text-xs text-olive">
          {[item.year, item.source].filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  );
}

function ArchiveIndex() {
  const { t } = useLanguage();
  const [kind, setKind] = useState<ArchiveKind | null>(null);
  const { data: items = [], isLoading } = useQuery(contentQueries.archiveItems(kind));

  const chip = (active: boolean) =>
    cn(
      "min-h-11 rounded-full border px-4 py-2 text-sm transition-colors",
      active
        ? "border-accent bg-accent/15 text-olive"
        : "border-border text-muted-foreground hover:border-accent",
    );

  return (
    <PageShell>
      <SectionShell
        id="archive"
        className="pt-32"
        eyebrow={t(archivePage.eyebrow)}
        title={t(archivePage.title)}
        body={t(archivePage.body)}
      >
        <div className="mt-10 flex flex-wrap gap-2">
          <button type="button" onClick={() => setKind(null)} className={chip(!kind)}>
            {t(ui.all)}
          </button>
          {kinds.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={chip(kind === k)}
            >
              {t(archivePage.kinds[k])}
            </button>
          ))}
        </div>

        <div aria-live="polite" className="mt-8">
          {isLoading ? <p className="text-muted-foreground">{t(ui.loading)}</p> : null}
          {!isLoading && items.length === 0 ? (
            <p className="text-muted-foreground">{t(ui.empty)}</p>
          ) : null}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={i * 70}>
              <ArchiveCard item={item} />
            </Reveal>
          ))}
        </div>
      </SectionShell>
    </PageShell>
  );
}
