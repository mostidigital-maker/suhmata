import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import { site } from "@/i18n/translations";

/** Directional "view all" link that flips its arrow with the reading direction. */
export function ViewAllLink({ href = "#", label }: { href?: string; label?: string }) {
  const { t, isRtl } = useLanguage();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <a
      href={href}
      className="group inline-flex items-center gap-2 text-sm font-medium text-olive transition-colors hover:text-accent-foreground"
    >
      {label ?? t(site.viewAll)}
      <Arrow className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
    </a>
  );
}

export function PlaceholderBadge() {
  const { t } = useLanguage();
  return (
    <span className="inline-flex items-center rounded-full border border-accent/50 px-2.5 py-0.5 text-[0.6rem] tracking-[0.2em] text-olive uppercase">
      {t(site.placeholderBadge)}
    </span>
  );
}
