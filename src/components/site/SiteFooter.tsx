import { useLanguage } from "@/i18n/LanguageProvider";
import { nav, sections, site } from "@/i18n/translations";
import crest from "@/assets/village-crest.png";

export function SiteFooter() {
  const { lang, t } = useLanguage();
  const f = sections.footer;
  const year = new Date().getFullYear();

  return (
    <footer className="paper-grain border-t border-border bg-secondary px-5 py-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex min-w-0 items-center gap-3">
              <img src={crest} alt="" loading="lazy" width={816} height={816} className="h-11 w-11 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate font-display text-lg font-semibold">
                  {t(site.villageName)}
                </span>
                <span className="block truncate text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase">
                  {t(site.villageTagline)}
                </span>
              </span>
            </div>
            <p className="mt-5 leading-loose text-muted-foreground">{t(f.about)}</p>
          </div>

          <nav>
            <h3 className="text-sm tracking-[0.25em] text-olive uppercase">{t(f.linksTitle)}</h3>
            <ul className="mt-4 space-y-2">
              {nav.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item[lang]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-sm tracking-[0.25em] text-olive uppercase">{t(f.contactTitle)}</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>{t(f.email)}</li>
              <li dir="ltr" className="rtl:text-end">
                {t(f.phone)}
              </li>
              <li>{t(f.address)}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm tracking-[0.25em] text-olive uppercase">
              {t(f.contributeTitle)}
            </h3>
            <p className="mt-4 leading-loose text-muted-foreground">{t(f.contributeBody)}</p>
          </div>
        </div>

        <div className="gold-rule mt-12" />

        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {t(f.rights)}
          </p>
          {/* Reserved entry point for the future Admin Dashboard. */}
          <a href="#top" className="transition-colors hover:text-foreground">
            {t(f.adminLink)}
          </a>
        </div>
      </div>
    </footer>
  );
}
