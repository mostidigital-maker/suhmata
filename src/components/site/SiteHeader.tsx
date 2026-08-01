import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";
import { site } from "@/i18n/translations";
import { mainNav } from "@/i18n/pages";
import { LanguageSwitcher } from "./LanguageSwitcher";
import crest from "@/assets/village-crest.png";

export function SiteHeader() {
  const { lang, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [lang]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        scrolled || open
          ? "border-b border-border/70 bg-background/92 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 sm:px-8 lg:flex lg:justify-between">
        <a href="#top" className="flex min-w-0 items-center gap-3">
          <img
            src={crest}
            alt=""
            width={816}
            height={816}
            className={cn(
              "h-10 w-10 shrink-0 transition-opacity duration-500 sm:h-11 sm:w-11",
              scrolled || open ? "opacity-100" : "opacity-95",
            )}
          />
          <span className="min-w-0">
            <span
              className={cn(
                "block truncate font-display text-base leading-tight font-semibold sm:text-lg",
                scrolled || open ? "text-foreground" : "text-parchment",
              )}
            >
              {t(site.villageName)}
            </span>
            <span
              className={cn(
                "block truncate text-[0.65rem] tracking-[0.22em] uppercase",
                scrolled || open ? "text-muted-foreground" : "text-parchment/70",
              )}
            >
              {t(site.associationName)}
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {nav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                "text-sm transition-colors duration-300 hover:text-accent",
                scrolled ? "text-foreground/80" : "text-parchment/85",
              )}
            >
              {item[lang]}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <LanguageSwitcher variant={scrolled || open ? "default" : "onDark"} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={t(site.menu)}
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors lg:hidden",
              scrolled || open
                ? "border-border text-foreground"
                : "border-parchment/40 text-parchment",
            )}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-border/60 bg-background/97 px-5 pb-5 lg:hidden">
          <ul className="mx-auto max-w-6xl">
            {nav.map((item) => (
              <li key={item.id} className="border-b border-border/50 last:border-0">
                <a
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-sm text-foreground/85 transition-colors hover:text-accent"
                >
                  {item[lang]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
