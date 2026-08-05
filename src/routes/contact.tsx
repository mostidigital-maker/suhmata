import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { LocationSection } from "@/components/site/LocationSection";

const title = "التواصل والموقع | Contact and location";
const description = "موقع القرية وروابط الخرائط والتواصل مع جمعية أهالي القرية.";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <PageShell><div className="pt-20"><LocationSection /></div></PageShell>,
});