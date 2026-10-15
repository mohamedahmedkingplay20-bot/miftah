"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type Language = "ar" | "en";

type LanguageContextType = {
  language: Language;
  isArabic: boolean;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("miftah_language");

    if (saved === "ar" || saved === "en") {
      setLanguageState(saved);
    }

    setReady(true);
  }, []);

  function setLanguage(language: Language) {
    setLanguageState(language);
    localStorage.setItem("miftah_language", language);

    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

    window.dispatchEvent(
      new CustomEvent("miftah-language-change", {
        detail: language,
      })
    );
  }

  function toggleLanguage() {
    setLanguage(language === "ar" ? "en" : "ar");
  }

  useEffect(() => {
    if (!ready) return;

    document.documentElement.lang = language;
    document.documentElement.dir =
      language === "ar" ? "rtl" : "ltr";
  }, [language, ready]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        isArabic: language === "ar",
        setLanguage,
        toggleLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}