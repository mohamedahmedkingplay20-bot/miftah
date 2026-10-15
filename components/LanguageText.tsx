"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function LanguageText({
  ar,
  en,
}: {
  ar: string;
  en: string;
}) {
  const { language } = useLanguage();

  return <>{language === "ar" ? ar : en}</>;
}
