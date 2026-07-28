import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Language } from "@/i18n/translations";

const OPTIONS: { value: Language; label: string }[] = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
];

export function LanguageSwitcher({
  variant = "default",
}: {
  variant?: "default" | "onDark";
}) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label={lang === "ar" ? "اللغة" : "Language"}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border p-1 backdrop-blur-sm",
        variant === "onDark"
          ? "border-gold-soft/40 bg-ink/30"
          : "border-border bg-card/70",
      )}
    >
      {OPTIONS.map((option) => {
        const active = option.value === lang;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLang(option.value)}
            aria-pressed={active}
            lang={option.value}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors duration-300",
              active
                ? "bg-accent text-accent-foreground"
                : variant === "onDark"
                  ? "text-parchment/75 hover:text-parchment"
                  : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
