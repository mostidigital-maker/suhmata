import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage, EmptyState } from "@/components/site/CollectionPage";
import { useLanguage } from "@/i18n/LanguageProvider";
import { heritageQueries } from "@/services/queries";

const title = "الخط الزمني | Historical timeline";
const description = "محطات تاريخية موثقة من ذاكرة القرية الفلسطينية.";

export const Route = createFileRoute("/timeline")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: TimelinePage,
});

function TimelinePage() {
  const { lang } = useLanguage();
  const { data = [] } = useQuery(heritageQueries.timeline());
  return <CollectionPage id="timeline" eyebrow={lang === "ar" ? "التاريخ" : "History"} title={lang === "ar" ? "الخط الزمني للقرية" : "Village historical timeline"} body={lang === "ar" ? "محطات من تاريخ القرية مرتبة زمنياً من السجلات المنشورة." : "Published milestones from the village history in chronological order."}>{data.length ? <ol className="border-s border-accent/50 ps-7">{data.map((entry) => <li key={entry.id} className="relative pb-10"><span className="absolute top-2 -start-[2.05rem] h-3 w-3 rotate-45 bg-accent" /><p className="text-sm text-olive">{entry.year ?? (lang === "ar" ? entry.date_label_ar : entry.date_label_en)}</p><h2 className="mt-2 text-2xl font-semibold">{lang === "ar" ? entry.title_ar : entry.title_en}</h2><p className="mt-3 leading-loose text-muted-foreground">{lang === "ar" ? entry.description_ar : entry.description_en}</p></li>)}</ol> : <EmptyState>{lang === "ar" ? "لا توجد محطات منشورة بعد." : "No published timeline entries yet."}</EmptyState>}</CollectionPage>;
}