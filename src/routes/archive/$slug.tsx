import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import { useMediaSrc } from "@/hooks/useMediaSrc";
import { contentQueries } from "@/services/queries";
import type { ArchiveItem } from "@/services/content";
import { archivePage, ui } from "@/i18n/pages";
import { PageShell } from "@/components/site/PageShell";
import { SectionShell } from "@/components/site/SectionShell";
import { ShareRow } from "@/components/site/ShareRow";

export const Route = createFileRoute("/archive/$slug")({
  head: ({ params }) => {
    const title = `مادة أرشيفية — ${params.slug} | أرشيف القرية`;
    const description = "وثيقة أو خريطة أو تسجيل من الأرشيف التاريخي للقرية، مع إمكانية التحميل.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/archive/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/archive/${params.slug}` }],
    };
  },
  component: ArchiveDetail,
});

function ArchiveViewer({ item }: { item: ArchiveItem }) {
  const field = useLocalizedField();
  const src = useMediaSrc(item.file_url);
  if (!src) return null;

  if (item.kind === "audio") return <audio src={src} controls className="mt-8 w-full" />;
  if (item.kind === "video")
    return <video src={src} controls className="mt-8 w-full rounded-sm" preload="metadata" />;
  if (item.kind === "pdf" || item.kind === "document")
    return (
      <iframe
        src={src}
        title={field(item, "title")}
        className="mt-8 h-[70vh] w-full rounded-sm border border-border"
      />
    );
  return (
    <div className="sepia-frame mt-8 overflow-hidden rounded-sm">
      <img src={src} alt={field(item, "title")} loading="lazy" className="w-full object-contain" />
    </div>
  );
}

function DownloadLink({ item }: { item: ArchiveItem }) {
  const { t } = useLanguage();
  const src = useMediaSrc(item.file_url);
  if (!item.downloadable || !src) return null;
  return (
    <a
      href={src}
      download
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-accent/50 px-6 py-3 text-sm font-medium text-olive hover:border-accent"
    >
      <Download className="h-4 w-4" />
      {t(ui.download)}
    </a>
  );
}

function ArchiveDetail() {
  const { slug } = Route.useParams();
  const { t } = useLanguage();
  const field = useLocalizedField();
  const { data: item, isLoading } = useQuery(contentQueries.archiveItem(slug));

  return (
    <PageShell>
      <SectionShell
        id="archive-item"
        className="pt-32"
        eyebrow={t(archivePage.eyebrow)}
        title={item ? field(item, "title") : slug}
        body={item ? field(item, "description") : undefined}
      >
        <Link
          to="/archive"
          className="mt-6 inline-flex items-center gap-2 text-sm text-olive hover:text-accent-foreground"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t(archivePage.title)}
        </Link>

        {isLoading ? <p className="mt-10 text-muted-foreground">{t(ui.loading)}</p> : null}
        {!isLoading && !item ? <p className="mt-10 text-muted-foreground">{t(ui.empty)}</p> : null}

        {item ? (
          <>
            <ArchiveViewer item={item} />
            <dl className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
              {item.year ? (
                <div>
                  <dt className="text-olive">{t(archivePage.year)}</dt>
                  <dd className="text-muted-foreground">{item.year}</dd>
                </div>
              ) : null}
              {item.source ? (
                <div>
                  <dt className="text-olive">{t(archivePage.source)}</dt>
                  <dd className="text-muted-foreground">{item.source}</dd>
                </div>
              ) : null}
            </dl>
            {field(item, "notes") ? (
              <p className="mt-6 max-w-3xl leading-loose whitespace-pre-line text-muted-foreground">
                {field(item, "notes")}
              </p>
            ) : null}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <DownloadLink item={item} />
              <ShareRow title={field(item, "title")} />
            </div>
          </>
        ) : null}
      </SectionShell>
    </PageShell>
  );
}
