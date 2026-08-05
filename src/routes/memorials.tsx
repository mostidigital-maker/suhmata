import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage, EmptyState } from "@/components/site/CollectionPage";
import { useLanguage } from "@/i18n/LanguageProvider";
import { heritageQueries } from "@/services/queries";

const title = "صفحات الذاكرة | Village memorials";
const description = "صفحات تكريم تحفظ سيرة أبناء وبنات القرية.";

export const Route = createFileRoute("/memorials")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: MemorialsPage,
});

function MemorialsPage() {
  const { lang } = useLanguage();
  const { data = [] } = useQuery(heritageQueries.memorials());
  return <CollectionPage id="memorials" eyebrow={lang === "ar" ? "وفاء" : "In remembrance"} title={lang === "ar" ? "صفحات الذاكرة" : "Memorial pages"} body={lang === "ar" ? "سير محفوظة باحترام لأبناء وبنات القرية." : "Respectfully preserved biographies of village community members."}>{data.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.map((person) => <article key={person.id} className="card-museum p-6"><h2 className="text-2xl font-semibold">{lang === "ar" ? person.full_name_ar : person.full_name_en}</h2><p className="mt-2 text-sm text-olive">{[person.birth_year, person.death_year].filter(Boolean).join(" — ")}</p><p className="mt-4 line-clamp-4 leading-loose text-muted-foreground">{lang === "ar" ? person.biography_ar : person.biography_en}</p></article>)}</div> : <EmptyState>{lang === "ar" ? "لا توجد صفحات منشورة بعد." : "No published memorials yet."}</EmptyState>}</CollectionPage>;
}