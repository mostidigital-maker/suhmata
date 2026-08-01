import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import { useMediaSrc } from "@/hooks/useMediaSrc";
import { contentQueries } from "@/services/queries";
import type { Article } from "@/services/content";
import { articlesPage, ui } from "@/i18n/pages";
import { PageShell } from "@/components/site/PageShell";
import { SectionShell } from "@/components/site/SectionShell";
import { Reveal } from "@/components/site/Reveal";
import { cn } from "@/lib/utils";

const title = "المقالات — أرشيف القرية | Village archive articles";
const description =
  "مقالات وأبحاث ونصوص توثيقية عن القرية وأهلها قبل عام ١٩٤٨، مع بحث وتصنيفات ومقالات ذات صلة.";

export const Route = createFileRoute("/articles/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/articles" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/articles" }],
  }),
  component: ArticlesIndex,
});

function ArticleCard({ article, featured = false }: { article: Article; featured?: boolean }) {
  const field = useLocalizedField();
  const { t } = useLanguage();
  const cover = useMediaSrc(article.cover_image);

  return (
    <Link
      to="/articles/$slug"
      params={{ slug: article.slug ?? article.id }}
      className={cn(
        "group block overflow-hidden rounded-sm border border-border bg-card focus:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        featured && "sm:grid sm:grid-cols-2",
      )}
    >
      <div className={cn("sepia-frame overflow-hidden", featured ? "h-full" : "aspect-[16/10]")}>
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
      <div className="p-6">
        {featured ? (
          <p className="text-[0.7rem] tracking-[0.3em] text-olive uppercase">
            {t(articlesPage.featured)}
          </p>
        ) : null}
        <h3 className="mt-2 text-xl font-semibold sm:text-2xl">{field(article, "title")}</h3>
        <p className="mt-3 line-clamp-4 leading-loose text-muted-foreground">
          {field(article, "excerpt")}
        </p>
        <p className="mt-4 text-sm text-olive">
          {article.reading_minutes} {t(ui.readingTime)}
        </p>
      </div>
    </Link>
  );
}

function ArticlesIndex() {
  const { t } = useLanguage();
  const field = useLocalizedField();
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(term), 300);
    return () => clearTimeout(id);
  }, [term]);

  const { data: categories = [] } = useQuery(contentQueries.categories());
  const { data: featured } = useQuery(contentQueries.featuredArticle());
  const { data: articles = [], isLoading } = useQuery(
    contentQueries.articleSearch(debounced, categoryId),
  );

  const showFeatured = featured && !debounced && !categoryId;
  const list = showFeatured ? articles.filter((a) => a.id !== featured.id) : articles;

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-2 text-sm transition-colors min-h-11",
      active
        ? "border-accent bg-accent/15 text-olive"
        : "border-border text-muted-foreground hover:border-accent",
    );

  return (
    <PageShell>
      <SectionShell
        id="articles"
        className="pt-32"
        eyebrow={t(articlesPage.eyebrow)}
        title={t(articlesPage.title)}
        body={t(articlesPage.body)}
      >
        <div className="mt-10 flex flex-col gap-4">
          <label className="block max-w-md">
            <span className="sr-only">{t(ui.search)}</span>
            <input
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder={t(ui.search)}
              className="w-full rounded-sm border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setCategoryId(null)} className={chip(!categoryId)}>
              {t(ui.all)}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={chip(categoryId === c.id)}
              >
                {field(c, "name")}
              </button>
            ))}
          </div>
        </div>

        <div aria-live="polite" className="mt-10">
          {isLoading ? <p className="text-muted-foreground">{t(ui.loading)}</p> : null}
          {!isLoading && list.length === 0 && !showFeatured ? (
            <p className="text-muted-foreground">{t(articlesPage.noResults)}</p>
          ) : null}
        </div>

        {showFeatured ? (
          <Reveal>
            <ArticleCard article={featured} featured />
          </Reveal>
        ) : null}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((article, i) => (
            <Reveal key={article.id} delay={i * 70}>
              <ArticleCard article={article} />
            </Reveal>
          ))}
        </div>
      </SectionShell>
    </PageShell>
  );
}
