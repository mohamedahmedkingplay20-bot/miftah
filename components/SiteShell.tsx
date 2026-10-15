"use client";

import type { ReactNode } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function SiteShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <LanguageSwitcher />
      {children}
    </>
  );
}