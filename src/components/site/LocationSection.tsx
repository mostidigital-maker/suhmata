import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Facebook, Instagram, MessageCircle, Navigation } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { sections } from "@/i18n/translations";
import { locationActions } from "@/i18n/pages";
import { contentQueries } from "@/services/queries";
import { Reveal } from "./Reveal";
import { SectionShell } from "./SectionShell";
import map from "@/assets/village-map.jpg";

export function LocationSection() {
  const { t } = useLanguage();
  const s = sections.location;
  const { data: settings } = useQuery(contentQueries.settings());

  const embedUrl =
    settings?.map_embed_url ??
    `https://www.google.com/maps?output=embed&q=${encodeURIComponent(t(sections.location.title))}`;

  const actions = [
    { label: t(locationActions.openMaps), href: settings?.google_maps, icon: ExternalLink },
    { label: t(locationActions.openWaze), href: settings?.waze, icon: Navigation },
  ].filter((item) => Boolean(item.href));

  const socials = [
    { label: t(locationActions.facebook), href: settings?.facebook, icon: Facebook },
    { label: t(locationActions.instagram), href: settings?.instagram, icon: Instagram },
    { label: t(locationActions.whatsapp), href: settings?.whatsapp, icon: MessageCircle },
  ].filter((item) => Boolean(item.href));

  return (
    <SectionShell id="location" eyebrow={t(s.eyebrow)} title={t(s.title)} body={t(s.body)}>
      <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-start">
        <Reveal>
          <div className="grid gap-6">
            <figure className="sepia-frame overflow-hidden rounded-sm">
              <div className="aspect-[16/10] w-full">
                <iframe
                  src={embedUrl}
                  title={t(s.mapNote)}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full border-0"
                  allowFullScreen
                />
              </div>
              <figcaption className="border-t border-border bg-secondary px-4 py-3 text-xs text-muted-foreground">
                {t(s.mapNote)}
              </figcaption>
            </figure>

            {actions.length ? (
              <div className="flex flex-wrap gap-3">
                {actions.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href as string}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-base btn-gold"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {label}
                  </a>
                ))}
              </div>
            ) : null}

            {socials.length ? (
              <div className="flex flex-wrap gap-3">
                {socials.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href as string}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn-base btn-outline-gold text-olive"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="grid gap-8">
            <figure className="sepia-frame overflow-hidden rounded-sm">
              <img
                src={map}
                alt={t(s.mapNote)}
                loading="lazy"
                width={1400}
                height={900}
                className="h-full w-full object-cover"
              />
            </figure>
            <dl className="divide-y divide-border border-y border-border">
              {s.facts.map((fact) => (
                <div
                  key={fact.label.en}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 py-4"
                >
                  <dt className="min-w-0 text-sm tracking-wide text-muted-foreground">
                    {t(fact.label)}
                  </dt>
                  <dd className="font-display text-lg font-semibold">{t(fact.value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
