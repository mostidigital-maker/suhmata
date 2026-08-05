import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CollectionPage, EmptyState } from "@/components/site/CollectionPage";
import { useLanguage } from "@/i18n/LanguageProvider";
import { donationQueries } from "@/services/queries";

const title = "دعم الأرشيف | Support the archive";
const description = "حملات ووسائل دعم جمعية أرشيف القرية الثقافي.";

export const Route = createFileRoute("/donate")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: DonatePage,
});

function DonatePage() {
  const { lang } = useLanguage();
  const { data: campaigns = [] } = useQuery(donationQueries.campaigns());
  const { data: methods = [] } = useQuery(donationQueries.paymentMethods());
  return <CollectionPage id="donate" eyebrow={lang === "ar" ? "الدعم" : "Support"} title={lang === "ar" ? "ساهم في حفظ الذاكرة" : "Help preserve the memory"} body={lang === "ar" ? "الحملات النشطة ووسائل الدعم المعتمدة لدى الجمعية." : "Active campaigns and payment methods approved by the association."}>{campaigns.length || methods.length ? <div className="grid gap-8 lg:grid-cols-2"><div className="grid gap-4">{campaigns.map((campaign) => <article key={campaign.id} className="card-museum p-6"><h2 className="text-2xl font-semibold">{lang === "ar" ? campaign.title_ar : campaign.title_en}</h2><p className="mt-3 leading-loose text-muted-foreground">{lang === "ar" ? campaign.description_ar : campaign.description_en}</p><p className="mt-4 text-sm text-olive">{campaign.raised_amount} / {campaign.goal_amount} {campaign.currency}</p></article>)}</div><div className="grid gap-4">{methods.map((method) => <article key={method.id} className="border-y border-border py-5"><h2 className="text-xl font-semibold">{lang === "ar" ? method.name_ar : method.name_en}</h2><p className="mt-2 leading-loose text-muted-foreground">{lang === "ar" ? method.instructions_ar : method.instructions_en}</p></article>)}</div></div> : <EmptyState>{lang === "ar" ? "لا توجد حملات دعم نشطة حالياً." : "No active support campaigns at the moment."}</EmptyState>}</CollectionPage>;
}