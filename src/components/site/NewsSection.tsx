import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/i18n/LanguageProvider";
import { sections } from "@/i18n/translations";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import { contentQueries } from "@/services/queries";
import { Reveal } from "./Reveal";
import { SectionShell } from "./SectionShell";

export function NewsSection() {
  const { lang, t } = useLanguage();
  const field = useLocalizedField();
  const s = sections.news;
  const { data: articles = [] } = useQuery(contentQueries.articles(3));

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(lang === "ar" ? "ar" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <SectionShell id="news" tone="sand" eyebrow={t(s.eyebrow)} title={t(s.title)} body={t(s.body)}>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((item, i) => (
          <Reveal key={item.id} delay={i * 90}>
            <article className="flex h-full flex-col rounded-sm border border-border bg-card p-6 transition-shadow duration-500 hover:shadow-[var(--shadow-lift)]">
              <div className="flex items-center justify-between gap-3">
                <time className="text-[0.7rem] tracking-[0.25em] text-muted-foreground uppercase">
                  {formatDate(item.created_at)}
                </time>
                {item.featured ? (
                  <span className="inline-flex items-center rounded-full border border-accent/50 px-2.5 py-0.5 text-[0.6rem] tracking-[0.2em] text-olive uppercase">
                    {lang === "ar" ? "مميّز" : "Featured"}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-4 text-xl leading-snug font-semibold">{field(item, "title")}</h3>
              <p className="mt-3 grow leading-loose text-muted-foreground">
                {field(item, "content")}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
