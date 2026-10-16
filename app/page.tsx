"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

type Category = "study" | "gaming" | "calculations" | string;

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  category: Category;
  role: string;
  xp: number;
  premiumDiscount: number;
  discountClaimed: boolean;
  profile?: Record<string, unknown>;
};

type View =
  | "home"
  | "study"
  | "gaming"
  | "calculator"
  | "ai"
  | "review"
  | "plan"
  | "settings";

type SettingsTab =
  | "account"
  | "password"
  | "themes"
  | "language"
  | "notifications"
  | "preferences";

type Theme = {
  id: string;
  name: string;
  accent: string;
  second: string;
  premium?: boolean;
};

const themes: Theme[] = [
  { id: "blue", name: "أزرق نيون", accent: "#2563eb", second: "#06b6d4" },
  { id: "purple", name: "بنفسجي", accent: "#8b5cf6", second: "#ec4899" },
  { id: "cyan", name: "سماوي", accent: "#06b6d4", second: "#22d3ee" },
  { id: "green", name: "أخضر", accent: "#22c55e", second: "#14b8a6" },
  { id: "red", name: "أحمر", accent: "#ef4444", second: "#f97316" },
  { id: "orange", name: "برتقالي", accent: "#f97316", second: "#ef4444" },
  { id: "yellow", name: "أصفر", accent: "#eab308", second: "#facc15" },
  { id: "lime", name: "ليموني", accent: "#84cc16", second: "#22c55e" },
  { id: "emerald", name: "زمردي", accent: "#10b981", second: "#14b8a6" },
  { id: "teal", name: "تركواز", accent: "#14b8a6", second: "#06b6d4" },
  { id: "indigo", name: "نيلي", accent: "#6366f1", second: "#8b5cf6" },
  { id: "violet", name: "بنفسجي نيون", accent: "#7c3aed", second: "#a855f7" },
  { id: "rose", name: "وردي أحمر", accent: "#f43f5e", second: "#fb7185" },
  { id: "pink", name: "Neon Pink", accent: "#f472b6", second: "#ec4899", premium: true },
  { id: "gold", name: "ذهبي", accent: "#facc15", second: "#f59e0b", premium: true },
  { id: "ice", name: "Ice", accent: "#67e8f9", second: "#93c5fd", premium: true },
  { id: "crimson", name: "Crimson", accent: "#dc2626", second: "#991b1b", premium: true },
  { id: "black", name: "أسود", accent: "#94a3b8", second: "#475569" },
  { id: "white", name: "أبيض", accent: "#e2e8f0", second: "#94a3b8" },
  { id: "rainbow", name: "Rainbow", accent: "#3b82f6", second: "#ec4899", premium: true },
];

const icon = {
  key: "🔑",
  study: "📚",
  gaming: "🎮",
  calculator: "🧮",
  ai: "🤖",
  user: "👤",
  settings: "⚙️",
  theme: "🎨",
  notifications: "🔔",
  trophy: "🏆",
  rocket: "🚀",
  fire: "🔥",
  check: "✅",
};

const characters = ["🤖", "🥷", "🧙", "👾", "🚀"];

export default function HomePage() {
  const { isArabic, setLanguage } = useLanguage();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("home");
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("account");
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeId, setThemeId] = useState("blue");
  const [studyDurationMinutes, setStudyDurationMinutes] = useState(15);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [character, setCharacter] = useState(0);

  async function loadUser() {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data?.user) {
        setUser(null);
        return null;
      }

      setUser(data.user);
      return data.user as User;
    } catch {
      setUser(null);
      return null;
    }
  }

  useEffect(() => {
    loadUser().finally(() => {
      setLoading(false);
    });

    try {
      const savedTheme = localStorage.getItem("miftah-theme");
      if (savedTheme && themes.some((item) => item.id === savedTheme)) setThemeId(savedTheme);
      const savedDuration = Number(localStorage.getItem("miftah-study-duration"));
      if ([5, 10, 15, 20, 25, 30, 45, 60].includes(savedDuration)) setStudyDurationMinutes(savedDuration);
      const savedNotifications = localStorage.getItem("miftah-notifications");
      if (savedNotifications !== null) setNotificationsEnabled(savedNotifications === "on");
    } catch {}
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCharacter((value) => (value + 1) % characters.length);
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  const theme = themes.find((item) => item.id === themeId) || themes[0];
  const xp = user?.xp ?? 0;
  const level = Math.floor(xp / 100) + 1;
  const currentXp = xp % 100;
  const xpPercent = currentXp;

  const rank =
    level >= 20 ? (isArabic ? "خبير" : "Master") :
    level >= 10 ? (isArabic ? "متقدم جدًا" : "Expert") :
    level >= 5 ? (isArabic ? "متقدم" : "Advanced") :
    (isArabic ? "مبتدئ" : "Beginner");

  async function logout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      });

      if (!response.ok) {
        alert(isArabic ? "فشل تسجيل الخروج." : "Logout failed.");
        return;
      }

      setUser(null);
      setMenuOpen(false);
      window.location.replace("/login");
    } catch {
      alert(isArabic ? "تعذر الاتصال بالسيرفر." : "Could not connect to the server.");
    }
  }

  function startNow() {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (user.category === "study") { setView("study"); return; }
    if (user.category === "gaming") { setView("gaming"); return; }
    if (user.category === "calculations") { setView("calculator"); return; }
    setView("home");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030712] text-white">
        <div className="animate-pulse text-4xl font-black" style={{ color: theme.accent }}>
          {icon.key} مِفتاح
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main dir="rtl" className="min-h-screen overflow-hidden bg-[#030712] text-white">
        <div className="pointer-events-none fixed inset-0">
          <div
            className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full blur-[140px]"
            style={{ background: theme.accent, opacity: 0.12 }}
          />
          <div
            className="absolute -right-40 top-[30%] h-[500px] w-[500px] rounded-full blur-[150px]"
            style={{ background: theme.second, opacity: 0.1 }}
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
          <div className="w-full rounded-[35px] border border-white/10 bg-[#091221]/95 p-10 text-center shadow-2xl">
            <div className="text-7xl">{icon.key}</div>
            <h1 className="mt-7 text-5xl font-black">أهلاً بك في مِفتاح</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
              سجّل الدخول عشان تدخل حسابك وتكمل تقدمك وXP ومهامك.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="rounded-2xl px-8 py-4 font-black text-white shadow-xl transition hover:-translate-y-1"
                style={{ background: `linear-gradient(135deg,${theme.accent},${theme.second})` }}
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/signup"
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-4 font-bold transition hover:bg-white/[0.08]"
              >
                إنشاء حساب
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen overflow-x-hidden bg-[#030712] text-white"
      style={{ "--accent": theme.accent, "--second": theme.second } as React.CSSProperties}
    >
      {/* بقية محتوى الموقع الرئيسي هنا */}
    </main>
  );
}