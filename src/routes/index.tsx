import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { HeroSection } from "@/components/site/HeroSection";
import { WelcomeSection } from "@/components/site/WelcomeSection";
import { HistorySection } from "@/components/site/HistorySection";
import { NewsSection } from "@/components/site/NewsSection";
import { EventsSection } from "@/components/site/EventsSection";
import { GallerySection } from "@/components/site/GallerySection";
import { StoriesSection } from "@/components/site/StoriesSection";
import { LocationSection } from "@/components/site/LocationSection";

const title = "قرية [اسم القرية] — أرشيف التراث الفلسطيني قبل ١٩٤٨";
const description =
  "أرشيف رقمي لقرية فلسطينية قبل عام ١٩٤٨: تاريخها، صورها، فعالياتها وروايات أهلها. A digital heritage archive of a Palestinian village before 1948.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: title,
          description,
          inLanguage: ["ar", "en"],
          publisher: {
            "@type": "Organization",
            name: "Village Heritage & Memory Association",
          },
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <PageShell>
      <HeroSection />
      <WelcomeSection />
      <HistorySection />
      <NewsSection />
      <EventsSection />
      <GallerySection />
      <StoriesSection />
      <LocationSection />
    </PageShell>
  );
}
