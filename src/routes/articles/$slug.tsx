import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import { useMediaSrc } from "@/hooks/useMediaSrc";
import { contentQueries } from "@/services/queries";
import { articlesPage, ui } from "@/i18n/pages";
import { PageShell } from "@/components/site/PageShell";
import { SectionShell } from "@/components/site/SectionShell";
import { ShareRow } from "@/components/site/ShareRow";

export const Route = createFileRoute("/articles/$slug")({
  head: ({ params }) => {
    const title = `مقال — أرشيف القرية (${params.slug})`;
    const description = "مقال توثيقي من أرشيف القرية عن الحياة والذاكرة قبل عام ١٩٤٨.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/articles/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/articles/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description,
            mainEntityOfPage: `/articles/${params.slug}`,
          }),
        },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { t } = useLanguage();
  const field = useLocalizedField();

  const { data: article, isLoading } = useQuery(contentQueries.article(slug));
  const { data: related = [] } = useQuery(contentQueries.relatedArticles(article));
  const cover = useMediaSrc(article?.cover_image);

  return (
    <PageShell>
      <SectionShell
        id="article"
        className="pt-32"
        eyebrow={t(articlesPage.eyebrow)}
        title={article ? field(article, "title") : slug}
        body={article ? field(article, "excerpt") : undefined}
      >
        <Link
          to="/articles"
          className="mt-6 inline-flex items-center gap-2 text-sm text-olive hover:text-accent-foreground"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t(articlesPage.title)}
        </Link>

        {isLoading ? <p className="mt-10 text-muted-foreground">{t(ui.loading)}</p> : null}
        {!isLoading && !article ? (
          <p className="mt-10 text-muted-foreground">{t(ui.empty)}</p>
        ) : null}

        {article ? (
          <article className="mt-10 max-w-3xl">
            <p className="text-sm text-olive">
              {article.reading_minutes} {t(ui.readingTime)}
            </p>
            {cover ? (
              <div className="sepia-frame mt-6 overflow-hidden rounded-sm">
                <img
                  src={cover}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full object-cover"
                />
              </div>
            ) : null}
            <div className="mt-8 space-y-5 leading-loose whitespace-pre-line text-foreground/90">
              {field(article, "content")}
            </div>
            <div className="mt-10">
              <ShareRow title={field(article, "title")} />
            </div>
          </article>
        ) : null}

        {related.length ? (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold">{t(articlesPage.related)}</h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id} className="rounded-sm border border-border bg-card p-5">
                  <Link
                    to="/articles/$slug"
                    params={{ slug: item.slug ?? item.id }}
                    className="text-lg font-semibold hover:text-accent-foreground"
                  >
                    {field(item, "title")}
                  </Link>
                  <p className="mt-2 line-clamp-3 leading-loose text-muted-foreground">
                    {field(item, "excerpt")}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </SectionShell>
    </PageShell>
  );
}
