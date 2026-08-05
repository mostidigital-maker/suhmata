import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage, EmptyState } from "@/components/site/CollectionPage";
import { useLanguage } from "@/i18n/LanguageProvider";
import { heritageQueries } from "@/services/queries";

const title = "شجرة العائلات | Village family tree";
const description = "سجل عائلات القرية وأفرادها المنشور ضمن الأرشيف الثقافي.";

export const Route = createFileRoute("/family-tree")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: FamilyTreePage,
});

function FamilyTreePage() {
  const { lang } = useLanguage();
  const { data = [] } = useQuery(heritageQueries.familyMembers());
  return <CollectionPage id="family-tree" eyebrow={lang === "ar" ? "الأنساب" : "Genealogy"} title={lang === "ar" ? "شجرة عائلات القرية" : "Village family tree"} body={lang === "ar" ? "سجل موثّق لأسماء العائلات وأفرادها وروابط القرابة المنشورة." : "A documented record of village families, people and published relationships."}>{data.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.map((person) => <article key={person.id} className="card-museum p-5"><h2 className="text-xl font-semibold">{lang === "ar" ? person.full_name_ar : person.full_name_en}</h2><p className="mt-2 text-sm text-muted-foreground">{lang === "ar" ? person.family_name_ar : person.family_name_en}</p></article>)}</div> : <EmptyState>{lang === "ar" ? "لا توجد سجلات منشورة بعد." : "No published family records yet."}</EmptyState>}</CollectionPage>;
}