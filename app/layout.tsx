import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import SiteShell from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "مِفتاح",
  description: "مفتاحك لعالم المعرفة والإبداع.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <LanguageProvider>
          <ThemeProvider>
            <SiteShell>
              {children}
            </SiteShell>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}