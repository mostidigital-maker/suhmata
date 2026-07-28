import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Language, LocalizedText } from "./translations";

const STORAGE_KEY = "village-heritage-lang";
const DEFAULT_LANG: Language = "ar";

type LanguageContextValue = {
  lang: Language;
  dir: "rtl" | "ltr";
  isRtl: boolean;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  /** Resolve a bilingual entry to the active language. */
  t: (entry: LocalizedText) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(DEFAULT_LANG);

  // Read the stored preference after hydration to avoid SSR mismatches.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "ar" || stored === "en") setLangState(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      isRtl: lang === "ar",
      setLang,
      toggleLang: () => setLang(lang === "ar" ? "en" : "ar"),
      t: (entry: LocalizedText) => entry[lang],
    }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside a LanguageProvider");
  return ctx;
}
