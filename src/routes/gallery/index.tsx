import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import { useMediaSrc } from "@/hooks/useMediaSrc";
import { contentQueries } from "@/services/queries";
import type { Album } from "@/services/content";
import { galleryPage, ui } from "@/i18n/pages";
import { PageShell } from "@/components/site/PageShell";
import { SectionShell } from "@/components/site/SectionShell";
import { Reveal } from "@/components/site/Reveal";

const title = "معرض الصور — أرشيف القرية | Village photo gallery";
const description =
  "ألبومات مصنّفة من أرشيف القرية: البيوت الحجرية، مواسم الزيتون، الوجوه والوثائق المصوّرة.";

export const Route = createFileRoute("/gallery/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/gallery" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: GalleryIndex,
});

function AlbumCard({ album }: { album: Album }) {
  const field = useLocalizedField();
  const { t } = useLanguage();
  const cover = useMediaSrc(album.cover_image);

  return (
    <Link
      to="/gallery/$album"
      params={{ album: album.slug }}
      className="group block rounded-sm border border-border bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="sepia-frame aspect-[4/3] overflow-hidden rounded-t-sm">
        {cover ? (
          <img
            src={cover}
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
        <h3 className="text-xl font-semibold">{field(album, "title")}</h3>
        <p className="mt-2 line-clamp-3 leading-loose text-muted-foreground">
          {field(album, "description")}
        </p>
        <span className="mt-4 inline-block text-sm text-olive">{t(galleryPage.openAlbum)}</span>
      </div>
    </Link>
  );
}

function GalleryIndex() {
  const { t } = useLanguage();
  const { data: albums = [], isLoading } = useQuery(contentQueries.albums());

  return (
    <PageShell>
      <SectionShell
        id="gallery"
        className="pt-32"
        eyebrow={t(galleryPage.eyebrow)}
        title={t(galleryPage.title)}
        body={t(galleryPage.body)}
      >
        {isLoading ? <p className="mt-10 text-muted-foreground">{t(ui.loading)}</p> : null}
        {!isLoading && albums.length === 0 ? (
          <p className="mt-10 text-muted-foreground">{t(ui.empty)}</p>
        ) : null}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album, i) => (
            <Reveal key={album.id} delay={i * 80}>
              <AlbumCard album={album} />
            </Reveal>
          ))}
        </div>
      </SectionShell>
    </PageShell>
  );
}
