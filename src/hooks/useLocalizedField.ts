import { useLanguage } from "@/i18n/LanguageProvider";

type Bilingual = Record<string, unknown>;

/**
 * Reads the `*_ar` / `*_en` column pair of a backend row for the active language.
 */
export function useLocalizedField() {
  const { lang } = useLanguage();
  return <T extends Bilingual>(row: T | null | undefined, field: string): string => {
    if (!row) return "";
    const value = row[`${field}_${lang}`] ?? row[`${field}_ar`] ?? row[`${field}_en`];
    return typeof value === "string" ? value : "";
  };
}
