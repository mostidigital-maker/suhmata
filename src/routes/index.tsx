import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { SiteHeader } from "@/components/site/SiteHeader";
import { HeroSection } from "@/components/site/HeroSection";
import { WelcomeSection } from "@/components/site/WelcomeSection";
import { HistorySection } from "@/components/site/HistorySection";
import { NewsSection } from "@/components/site/NewsSection";
import { EventsSection } from "@/components/site/EventsSection";
import { GallerySection } from "@/components/site/GallerySection";
import { StoriesSection } from "@/components/site/StoriesSection";
import { LocationSection } from "@/components/site/LocationSection";
import { SiteFooter } from "@/components/site/SiteFooter";

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
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <LanguageProvider>
      <SiteHeader />
      <main>
        <HeroSection />
        <WelcomeSection />
        <HistorySection />
        <NewsSection />
        <EventsSection />
        <GallerySection />
        <StoriesSection />
        <LocationSection />
      </main>
      <SiteFooter />
      <Toaster position="top-center" />
    </LanguageProvider>
  );
}
