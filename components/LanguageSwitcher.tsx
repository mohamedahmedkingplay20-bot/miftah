"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white"
    >
      {language === "ar" ? "العربية" : "EN"}
    </button>
  );
}