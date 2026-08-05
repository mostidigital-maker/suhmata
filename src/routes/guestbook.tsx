import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { StoriesSection } from "@/components/site/StoriesSection";

const title = "سجل الزوار | Village guestbook";
const description = "روايات ورسائل زوار أرشيف القرية، مع مراجعة المساهمات قبل نشرها.";

export const Route = createFileRoute("/guestbook")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <PageShell><div className="pt-20"><StoriesSection /></div></PageShell>,
});