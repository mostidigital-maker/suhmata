import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import { contentQueries } from "@/services/queries";
import { galleryPage, ui } from "@/i18n/pages";
import { PageShell } from "@/components/site/PageShell";
import { SectionShell } from "@/components/site/SectionShell";
import { MasonryGallery } from "@/components/site/MasonryGallery";
import { Lightbox } from "@/components/site/Lightbox";

export const Route = createFileRoute("/gallery/$album")({
  head: ({ params }) => {
    const title = `ألبوم ${params.album} — معرض أرشيف القرية`;
    const description = "ألبوم مصوّر من أرشيف القرية بعرض متدرّج وعارض صور بملء الشاشة.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/gallery/${params.album}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/gallery/${params.album}` }],
    };
  },
  component: AlbumPage,
});

function AlbumPage() {
  const { album: slug } = Route.useParams();
  const { t } = useLanguage();
  const field = useLocalizedField();
  const [index, setIndex] = useState<number | null>(null);

  const { data: album, isLoading: albumLoading } = useQuery(contentQueries.album(slug));
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery(
    contentQueries.galleryPages(albumLoading ? undefined : (album?.id ?? null)),
  );

  const items = useMemo(
    () =>
      (data?.pages.flat() ?? []).map((row) => ({
        id: row.id,
        url: row.media_url,
        caption: field(row, "caption"),
        type: row.media_type,
        width: row.width,
        height: row.height,
      })),
    [data, field],
  );

  return (
    <PageShell>
      <SectionShell
        id="album"
        className="pt-32"
        eyebrow={t(galleryPage.eyebrow)}
        title={album ? field(album, "title") : slug}
        body={album ? field(album, "description") : undefined}
      >
        <Link
          to="/gallery"
          className="mt-6 inline-flex items-center gap-2 text-sm text-olive hover:text-accent-foreground"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t(galleryPage.title)}
        </Link>

        {isLoading ? <p className="mt-10 text-muted-foreground">{t(ui.loading)}</p> : null}
        {!isLoading && items.length === 0 ? (
          <p className="mt-10 text-muted-foreground">{t(ui.empty)}</p>
        ) : null}

        <MasonryGallery
          items={items}
          onOpen={setIndex}
          hasMore={hasNextPage}
          onReachEnd={() => {
            if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
          }}
        />

        {hasNextPage ? (
          <button
            type="button"
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
            className="mt-6 rounded-full border border-accent/50 px-7 py-3 text-sm font-medium text-olive disabled:opacity-60"
          >
            {t(ui.loadMore)}
          </button>
        ) : null}
      </SectionShell>

      <Lightbox items={items} index={index} onClose={() => setIndex(null)} onIndexChange={setIndex} />
    </PageShell>
  );
}
