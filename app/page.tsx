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
  {
    id: "blue",
    name: "أزرق نيون",
    accent: "#2563eb",
    second: "#06b6d4",
  },
  {
    id: "purple",
    name: "بنفسجي",
    accent: "#8b5cf6",
    second: "#ec4899",
  },
  {
    id: "cyan",
    name: "سماوي",
    accent: "#06b6d4",
    second: "#22d3ee",
  },
  {
    id: "green",
    name: "أخضر",
    accent: "#22c55e",
    second: "#14b8a6",
  },
  {
    id: "red",
    name: "أحمر",
    accent: "#ef4444",
    second: "#f97316",
  },
  {
    id: "orange",
    name: "برتقالي",
    accent: "#f97316",
    second: "#ef4444",
  },
  {
    id: "yellow",
    name: "أصفر",
    accent: "#eab308",
    second: "#facc15",
  },
  {
    id: "lime",
    name: "ليموني",
    accent: "#84cc16",
    second: "#22c55e",
  },
  {
    id: "emerald",
    name: "زمردي",
    accent: "#10b981",
    second: "#14b8a6",
  },
  {
    id: "teal",
    name: "تركواز",
    accent: "#14b8a6",
    second: "#06b6d4",
  },
  {
    id: "indigo",
    name: "نيلي",
    accent: "#6366f1",
    second: "#8b5cf6",
  },
  {
    id: "violet",
    name: "بنفسجي نيون",
    accent: "#7c3aed",
    second: "#a855f7",
  },
  {
    id: "rose",
    name: "وردي أحمر",
    accent: "#f43f5e",
    second: "#fb7185",
  },
  {
    id: "pink",
    name: "Neon Pink",
    accent: "#f472b6",
    second: "#ec4899",
    premium: true,
  },
  {
    id: "gold",
    name: "ذهبي",
    accent: "#facc15",
    second: "#f59e0b",
    premium: true,
  },
  {
    id: "ice",
    name: "Ice",
    accent: "#67e8f9",
    second: "#93c5fd",
    premium: true,
  },
  {
    id: "crimson",
    name: "Crimson",
    accent: "#dc2626",
    second: "#991b1b",
    premium: true,
  },
  {
    id: "black",
    name: "أسود",
    accent: "#94a3b8",
    second: "#475569",
  },
  {
    id: "white",
    name: "أبيض",
    accent: "#e2e8f0",
    second: "#94a3b8",
  },
  {
    id: "rainbow",
    name: "Rainbow",
    accent: "#3b82f6",
    second: "#ec4899",
    premium: true,
  },
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
  language: "🌐",
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

  const [settingsTab, setSettingsTab] =
    useState<SettingsTab>("account");

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
      setCharacter((value) => {
        return (value + 1) % characters.length;
      });
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  const theme =
    themes.find((item) => item.id === themeId) ||
    themes[0];

  const xp = user?.xp ?? 0;

  const level = Math.floor(xp / 100) + 1;

  const currentXp = xp % 100;

  const xpPercent = currentXp;

  const rank =
    level >= 20
      ? isArabic
        ? "خبير"
        : "Master"
      : level >= 10
      ? isArabic
        ? "متقدم جدًا"
        : "Expert"
      : level >= 5
      ? isArabic
        ? "متقدم"
        : "Advanced"
      : isArabic
      ? "مبتدئ"
      : "Beginner";


  async function logout() {
    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        alert(
          isArabic
            ? "فشل تسجيل الخروج."
            : "Logout failed."
        );

        return;
      }

      setUser(null);
      setMenuOpen(false);

      window.location.replace("/login");
    } catch {
      alert(
        isArabic
          ? "تعذر الاتصال بالسيرفر."
          : "Could not connect to the server."
      );
    }
  }

  function startNow() {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (user.category === "study") {
      setView("study");
      return;
    }

    if (user.category === "gaming") {
      setView("gaming");
      return;
    }

    if (user.category === "calculations") {
      setView("calculator");
      return;
    }

    setView("home");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030712] text-white">
        <div
          className="animate-pulse text-4xl font-black"
          style={{
            color: theme.accent,
          }}
        >
  <img
  src="/miftah-logo.png"
  alt="مِفتاح"
  width={48}
  height={48}
  className="h-12 w-12 rounded-2xl object-cover"
/>

  if (!user) {
    return (
      <main
        dir="rtl"
        className="min-h-screen overflow-hidden bg-[#030712] text-white"
      >
        <div className="pointer-events-none fixed inset-0">
          <div
            className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full blur-[140px]"
            style={{
              background: theme.accent,
              opacity: 0.12,
            }}
          />

          <div
            className="absolute -right-40 top-[30%] h-[500px] w-[500px] rounded-full blur-[150px]"
            style={{
              background: theme.second,
              opacity: 0.1,
            }}
          />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
          <div className="w-full rounded-[35px] border border-white/10 bg-[#091221]/95 p-10 text-center shadow-2xl">
            <div className="text-7xl">
              {icon.key}
            </div>

            <h1 className="mt-7 text-5xl font-black">
              أهلاً بك في مِفتاح
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
              سجّل الدخول عشان تدخل حسابك وتكمل تقدمك وXP ومهامك.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="rounded-2xl px-8 py-4 font-black text-white shadow-xl transition hover:-translate-y-1"
                style={{
                  background:
                    `linear-gradient(135deg,${theme.accent},${theme.second})`,
                }}
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
      style={
        {
          "--accent": theme.accent,
          "--second": theme.second,
        } as React.CSSProperties
      }
    >
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full blur-[140px]"
          style={{
            background: theme.accent,
            opacity: 0.18,
          }}
        />

        <div
          className="absolute -right-40 top-[30%] h-[520px] w-[520px] rounded-full blur-[150px]"
          style={{
            background: theme.second,
            opacity: 0.12,
          }}
        />

        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      <header className="relative z-50 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-10">
        <button
          onClick={() => {
            setView("home");
            setMenuOpen(false);
          }}
          className="flex items-center gap-3"
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl text-white shadow-xl"
            style={{
              background:
                `linear-gradient(135deg,${theme.accent},${theme.second})`,
              boxShadow:
                `0 0 30px ${theme.accent}35`,
            }}
          >
            {icon.key}
          </div>

          <div className="text-start">
            <div
              className="text-xl font-black"
              style={{
                color: theme.accent,
              }}
            >
              مِفتاح
            </div>

            <div className="text-[9px] font-bold tracking-[.25em] text-slate-500">
              YOUR WORLD STARTS HERE
            </div>
          </div>
        </button>

        <div className="relative">
          <button
            onClick={() =>
              setMenuOpen((value) => !value)
            }
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#081120]/90 px-3 py-2 shadow-xl backdrop-blur-xl transition hover:bg-[#0d182b]"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl font-black text-white"
              style={{
                background:
                  `linear-gradient(135deg,${theme.accent},${theme.second})`,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="hidden text-start sm:block">
              <div className="text-xs font-black">
                {user.name}
              </div>

              <div className="text-[10px] text-slate-500">
                {user.username}
              </div>
            </div>

            <span>
              {menuOpen ? "▲" : "▼"}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-white/10 bg-[#081120]/95 p-2 shadow-2xl backdrop-blur-xl">
              <div className="border-b border-white/10 px-4 py-4">
                <div className="font-black">
                  {user.name}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  @{user.username}
                </div>

                <div
                  className="mt-2 text-xs font-bold"
                  style={{
                    color: theme.second,
                  }}
                >
                  Level {level} • {xp} XP
                </div>
              </div>

              <button
                onClick={() => {
                  setView("settings");
                  setSettingsTab("account");
                  setMenuOpen(false);
                }}
                className="menu-item"
              >
                {icon.user}{" "}
                {isArabic
                  ? "الحساب"
                  : "Account"}
              </button>

              <button
                onClick={() => {
                  setView("settings");
                  setSettingsTab("themes");
                  setMenuOpen(false);
                }}
                className="menu-item"
              >
                {icon.theme}{" "}
                {isArabic
                  ? "الثيمات"
                  : "Themes"}
              </button>

              <button
                onClick={() => {
                  setView("settings");
                  setSettingsTab("account");
                  setMenuOpen(false);
                }}
                className="menu-item"
              >
                {icon.settings}{" "}
                {isArabic ? "الإعدادات" : "Settings"}
              </button>

              <button
                onClick={() => {
                  setView("settings");
                  setSettingsTab("notifications");
                  setMenuOpen(false);
                }}
                className="menu-item"
              >
                {icon.notifications}{" "}
                {isArabic
                  ? "الإشعارات"
                  : "Notifications"}
              </button>

              <div className="my-2 h-px bg-white/10" />

              <button
                onClick={logout}
                className="menu-item text-red-400 hover:bg-red-500/10"
              >
                🚪{" "}
                {isArabic
                  ? "تسجيل الخروج"
                  : "Logout"}
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-20 lg:px-10">
        {view === "home" && (
          <HomeDashboard
            user={user}
            theme={theme}
            level={level}
            xp={xp}
            xpPercent={xpPercent}
            rank={rank}
            ar={isArabic}
            startNow={startNow}
            setView={setView}
          />
        )}

        {view === "study" && (
          <StudyView
            theme={theme}
            ar={isArabic}
            go={setView}
            reloadUser={loadUser}
            durationMinutes={studyDurationMinutes}
          />
        )}

        {view === "gaming" && (
          <GamingView
            theme={theme}
            ar={isArabic}
            go={setView}
            reloadUser={loadUser}
          />
        )}

        {view === "calculator" && (
          <CalculatorView
            theme={theme}
            ar={isArabic}
            go={setView}
          />
        )}

        {view === "ai" && (
          <AIView
            theme={theme}
            ar={isArabic}
            go={setView}
          />
        )}

        {view === "review" && (
          <ReviewView
            theme={theme}
            ar={isArabic}
            go={setView}
            reloadUser={loadUser}
          />
        )}

        {view === "plan" && (
          <PlanView
            theme={theme}
            ar={isArabic}
            go={setView}
            notifications={notificationsEnabled}
          />
        )}

        {view === "settings" && (
          <SettingsView
            theme={theme}
            ar={isArabic}
            tab={settingsTab}
            setTab={setSettingsTab}
            user={user}
            themeId={themeId}
            setThemeId={(value) => {
              setThemeId(value);

              try {
                localStorage.setItem(
                  "miftah-theme",
                  value
                );
              } catch {}
            }}
            notifications={notificationsEnabled}
            setNotificationsEnabled={(enabled) => {
              setNotificationsEnabled(enabled);
              try { localStorage.setItem("miftah-notifications", enabled ? "on" : "off"); } catch {}
            }}
            setLanguage={setLanguage}
            durationMinutes={studyDurationMinutes}
            setDurationMinutes={(value) => {
              setStudyDurationMinutes(value);
              try { localStorage.setItem("miftah-study-duration", String(value)); } catch {}
            }}
            logout={logout}
            go={setView}
          />
        )}
      </div>

      {view === "home" && (
        <div className="fixed bottom-7 left-[-110px] z-40 pointer-events-none mascot-run">
          <div
            className="rounded-full border bg-[#07101d]/90 px-4 py-2 text-3xl shadow-xl backdrop-blur-xl"
            style={{
              borderColor: `${theme.accent}35`,
              boxShadow:
                `0 0 35px ${theme.accent}18`,
            }}
          >
            {characters[character]} {icon.key}
          </div>
        </div>
      )}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #030712;
          font-family: Arial, Helvetica, sans-serif;
        }

        button,
        a {
          cursor: pointer;
        }

        .grid-bg {
          background-image:
            linear-gradient(
              rgba(255,255,255,.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,.035) 1px,
              transparent 1px
            );
          background-size: 42px 42px;
        }

        .menu-item {
          width: 100%;
          border-radius: 15px;
          padding: 12px 14px;
          text-align: start;
          font-weight: 800;
          color: #cbd5e1;
          transition: .2s ease;
        }

        .menu-item:hover {
          background: rgba(255,255,255,.06);
          color: white;
        }

        .mascot-run {
          animation: mascot 15s linear infinite;
        }

        @keyframes mascot {
          0% {
            transform: translateX(0);
            opacity: 0;
          }

          8% {
            opacity: 1;
          }

          90% {
            opacity: 1;
          }

          100% {
            transform: translateX(calc(100vw + 200px));
            opacity: 0;
          }
        }

        .rainbow-theme {
          background: linear-gradient(
            90deg,
            #ef4444,
            #f97316,
            #eab308,
            #22c55e,
            #06b6d4,
            #3b82f6,
            #8b5cf6,
            #ec4899
          );
          background-size: 400% 100%;
          animation: rainbow 5s linear infinite;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        @keyframes rainbow {
          0% {
            background-position: 0% 50%;
          }

          100% {
            background-position: 400% 50%;
          }
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   HOME
========================================================= */

function HomeDashboard({
  user,
  theme,
  level,
  xp,
  xpPercent,
  rank,
  ar,
  startNow,
  setView,
}: {
  user: User;
  theme: Theme;
  level: number;
  xp: number;
  xpPercent: number;
  rank: string;
  ar: boolean;
  startNow: () => void;
  setView: (view: View) => void;
}) {
  const categoryName =
    user.category === "study"
      ? ar
        ? "الدراسة"
        : "Study"
      : user.category === "gaming"
      ? ar
        ? "الألعاب"
        : "Gaming"
      : user.category === "calculations"
      ? ar
        ? "الحسابات"
        : "Calculations"
      : ar
      ? "مِفتاح"
      : "Miftah";

  return (
    <section className="pt-10">
      <div className="grid min-h-[620px] items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black"
            style={{
              color: theme.accent,
              borderColor:
                `${theme.accent}45`,
              background:
                `${theme.accent}0d`,
            }}
          >
            ●{" "}
            {ar
              ? "مِفتاح جاهز لك"
              : "Miftah is ready"}
          </div>

          <h1 className="mt-7 text-6xl font-black leading-[.95] tracking-tight sm:text-7xl lg:text-8xl">
            {ar ? "أهلاً" : "Welcome"}

            <br />

            <span
              style={{
                background:
                  `linear-gradient(90deg,${theme.accent},${theme.second})`,
                WebkitBackgroundClip:
                  "text",
                color: "transparent",
              }}
            >
              {user.name}
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-9 text-slate-400">
            {ar
              ? `قسمك الأساسي هو ${categoryName}. مِفتاح هيبدأك من المكان الصح.`
              : `Your main category is ${categoryName}. Miftah will start you in the right place.`}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={startNow}
              className="rounded-2xl px-7 py-4 font-black text-white shadow-2xl transition hover:-translate-y-1 hover:scale-105"
              style={{
                background:
                  `linear-gradient(135deg,${theme.accent},${theme.second})`,
                boxShadow:
                  `0 12px 35px ${theme.accent}30`,
              }}
            >
              {icon.rocket}{" "}
              {ar
                ? "ابدأ الآن"
                : "Start now"}
            </button>

            <button
              onClick={() => setView("settings")}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-7 py-4 font-bold hover:bg-white/[0.08]"
            >
              {icon.settings}{" "}
              {ar
                ? "الإعدادات"
                : "Settings"}
            </button>
          </div>

          <div className="mt-9 max-w-2xl rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black text-white"
                style={{
                  background:
                    `linear-gradient(135deg,${theme.accent},${theme.second})`,
                }}
              >
                {user.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="flex-1">
                <div className="text-xs text-slate-500">
                  @{user.username}
                </div>

                <div className="mt-1 text-xl font-black">
                  Level {level} • {rank}
                </div>
              </div>

              <div className="text-center">
                <div
                  className="text-3xl font-black"
                  style={{
                    color: theme.accent,
                  }}
                >
                  {xp}
                </div>

                <div className="text-[9px] text-slate-500">
                  XP
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {ar
                  ? "المستوى التالي"
                  : "Next level"}
              </span>

              <span>
                {xpPercent} / 100 XP
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${xpPercent}%`,
                  background:
                    `linear-gradient(90deg,${theme.accent},${theme.second})`,
                }}
              />
            </div>

            {xp >= 100 && (
              <div className="mt-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-sm font-bold text-yellow-300">
                💎{" "}
                {ar
                  ? "مكافأة Premium الخاصة بك أصبحت مفتوحة."
                  : "Your Premium reward is unlocked."}
              </div>
            )}
          </div>
        </div>

        <div className="relative hidden h-[500px] items-center justify-center lg:flex">
          <div
            className="absolute h-[450px] w-[450px] rounded-full border"
            style={{
              borderColor:
                `${theme.accent}25`,
            }}
          />

          <div
            className="absolute h-[330px] w-[330px] animate-spin rounded-full border"
            style={{
              borderColor:
                `${theme.second}25`,
              animationDuration: "12s",
            }}
          />

          <div
            className="absolute h-[220px] w-[220px] rounded-full border"
            style={{
              borderColor:
                `${theme.accent}30`,
            }}
          />

          <div
            className="relative z-10 flex h-48 w-48 flex-col items-center justify-center rounded-full border border-white/10"
            style={{
              background:
                `radial-gradient(circle,${theme.accent}40,#030712 70%)`,
              boxShadow:
                `0 0 100px ${theme.accent}25`,
            }}
          >
            <div className="text-7xl">
              {icon.key}
            </div>

            <div
              className="mt-3 text-xs font-black tracking-[.4em]"
              style={{
                color: theme.second,
              }}
            >
              MIFTAH
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-7">
          <div
            className="text-xs font-black tracking-[.3em]"
            style={{
              color: theme.accent,
            }}
          >
            EXPLORE
          </div>

          <h2 className="mt-2 text-4xl font-black">
            {ar
              ? "استكشف عالم مِفتاح"
              : "Explore Miftah"}
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            icon={icon.study}
            title={ar ? "الدراسة" : "Study"}
            description={
              ar
                ? "ذاكر وركز واجمع XP."
                : "Study, focus and earn XP."
            }
            onClick={() =>
              setView("study")
            }
            theme={theme}
          />

          <DashboardCard
            icon={icon.gaming}
            title={ar ? "الألعاب" : "Gaming"}
            description={
              ar
                ? "تحديات وأسئلة Gaming."
                : "Gaming challenges."
            }
            onClick={() =>
              setView("gaming")
            }
            theme={theme}
          />

          <DashboardCard
            icon={icon.calculator}
            title={
              ar
                ? "الحسابات"
                : "Calculations"
            }
            description={
              ar
                ? "آلة حاسبة شغالة."
                : "A working calculator."
            }
            onClick={() =>
              setView("calculator")
            }
            theme={theme}
          />

          <DashboardCard
            icon={icon.ai}
            title={ar ? "مِفتاح AI" : "Miftah AI"}
            description={
              ar
                ? "اسأل الذكاء الاصطناعي."
                : "Ask the AI."
            }
            onClick={() =>
              setView("ai")
            }
            theme={theme}
          />
        </div>
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <DashboardCard
          icon={icon.trophy}
          title={
            ar
              ? "الاختبارات"
              : "Exams"
          }
          description={
            ar
              ? "اختار المادة والصعوبة وحل امتحان جديد."
              : "Choose a subject and difficulty for a new exam."
          }
          onClick={() =>
            setView("review")
          }
          theme={theme}
        />

        <DashboardCard
          icon={icon.fire}
          title={
            ar
              ? "جدول المذاكرة"
              : "Study plan"
          }
          description={
            ar
              ? "نظم يومك ومواعيدك."
              : "Organize your day."
          }
          onClick={() =>
            setView("plan")
          }
          theme={theme}
        />
      </div>

      <footer className="py-14 text-center text-xs text-slate-600">
        © 2026 مِفتاح — مفتاحك لعالم المعرفة والإبداع.
      </footer>
    </section>
  );
}

function DashboardCard({
  icon,
  title,
  description,
  onClick,
  theme,
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  theme: Theme;
}) {
  return (
    <button
      onClick={onClick}
      className="group min-h-[230px] rounded-[28px] border border-white/10 bg-[#091221]/90 p-6 text-start transition duration-300 hover:-translate-y-2 hover:border-white/20"
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition group-hover:scale-110"
        style={{
          color: theme.accent,
          background:
            `${theme.accent}12`,
        }}
      >
        {icon}
      </div>

      <h3 className="mt-7 text-2xl font-black">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-500">
        {description}
      </p>

      <div
        className="mt-7 font-black"
        style={{
          color: theme.accent,
        }}
      >
        {theme.id === "rainbow" ? (
          <span className="rainbow-theme">
            افتح ←
          </span>
        ) : (
          "افتح ←"
        )}
      </div>
    </button>
  );
}

/* =========================================================
   STUDY
========================================================= */

function StudyView({
  theme,
  ar,
  go,
  reloadUser,
  durationMinutes,
}: {
  theme: Theme;
  ar: boolean;
  go: (view: View) => void;
  reloadUser: () => Promise<User | null>;
  durationMinutes: number;
}) {
  const [studyMode, setStudyMode] = useState<"choose" | "time">("choose");
  const SESSION_SECONDS = durationMinutes * 60;

  const [seconds, setSeconds] =
    useState(SESSION_SECONDS);

  const [running, setRunning] =
    useState(false);

  const [startedAt, setStartedAt] =
    useState<number | null>(null);

  const [sessionId, setSessionId] =
    useState<string | null>(null);

  const [finished, setFinished] =
    useState(false);

  const [starting, setStarting] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [taskId, setTaskId] =
    useState(1);

  const [task, setTask] = useState({
    title: "جلسة تركيز",
    description:
      "ذاكر أو اقرأ أو راجع درسك للمدة اللي اخترتها بدون تشتت.",
  });

  useEffect(() => {
    if (!running || !startedAt) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - startedAt) / 1000
      );

      const remaining = Math.max(
        0,
        SESSION_SECONDS - elapsed
      );

      setSeconds(remaining);

      if (remaining <= 0) {
        setRunning(false);
      }
    }, 250);

    return () => clearInterval(timer);
  }, [running, startedAt, SESSION_SECONDS]);

  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");

  const secs = (seconds % 60)
    .toString()
    .padStart(2, "0");

  async function startSession() {
    if (starting || running) return;

    setStarting(true);
    try {
      const response = await fetch("/api/study/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "start", taskId, durationMinutes }),
      });
      const data = await response.json();

      if (!response.ok || !data?.sessionId || !data?.startedAt) {
        alert(data?.error || (ar ? "تعذر بدء جلسة المذاكرة." : "Could not start the study session."));
        return;
      }

      setSessionId(data.sessionId);
      setStartedAt(Number(data.startedAt));
      setSeconds(SESSION_SECONDS);
      setRunning(true);
      setFinished(false);
    } catch {
      alert(ar ? "تعذر الاتصال بالسيرفر لبدء الجلسة." : "Could not connect to start the session.");
    } finally {
      setStarting(false);
    }
  }

  async function resetSession() {
    const oldSessionId = sessionId;
    setRunning(false);
    setStartedAt(null);
    setSessionId(null);
    setSeconds(SESSION_SECONDS);
    setFinished(false);
    setSaving(false);
    setStudyMode("choose");

    if (oldSessionId) {
      try {
        await fetch("/api/study/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ action: "cancel", sessionId: oldSessionId }),
        });
      } catch {
        // Reset the visible timer even if cancelling the server session fails.
      }
    }
  }

  async function finish() {
    if (
      saving ||
      finished ||
      !sessionId ||
      seconds > 0
    ) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/api/study/session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "finish",
            sessionId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data?.error ||
            "لسه وقت الجلسة مخلصش."
        );

        return;
      }

      setFinished(true);

      if (data?.task) {
        setTaskId(data.task.id);
        setTask({
          title: data.task.title,
          description:
            data.task.description,
        });
      }

      await reloadUser();

      alert(
        ar
          ? "🎉 ممتاز! خلصت جلسة المذاكرة وحصلت على +10 XP."
          : "🎉 Great! Study session completed. +10 XP."
      );

      resetSession();
    } catch {
      alert(
        ar
          ? "تعذر الاتصال بالسيرفر."
          : "Could not connect to the server."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell
      title={ar ? "الدراسة" : "Study"}
      subtitle={
        ar
          ? "جلسة مذاكرة حقيقية مع XP."
          : "A real study session with XP."
      }
      theme={theme}
      ar={ar}
      go={go}
    >
      {studyMode === "choose" ? (
        <div className="grid gap-5 md:grid-cols-2">
          <button onClick={() => setStudyMode("time")} className="rounded-[30px] border border-white/10 bg-white/[0.03] p-8 text-start transition hover:-translate-y-1">
            <div className="text-5xl">⏱️</div>
            <h2 className="mt-5 text-2xl font-black">{ar ? "مذاكرة بالوقت" : "Timed study"}</h2>
            <p className="mt-3 leading-7 text-slate-400">{ar ? `ذاكر لمدة ${durationMinutes} دقيقة، وبعدها اضغط أنجزت المهمة للحصول على XP.` : `Study for ${durationMinutes} minutes, then complete the task to earn XP.`}</p>
            <div className="mt-6 font-black" style={{ color: theme.accent }}>{ar ? "ابدأ جلسة ←" : "Start session →"}</div>
          </button>
          <button onClick={() => go("review")} className="rounded-[30px] border border-white/10 bg-white/[0.03] p-8 text-start transition hover:-translate-y-1">
            <div className="text-5xl">📝</div>
            <h2 className="mt-5 text-2xl font-black">{ar ? "مذاكرة بالأسئلة" : "Question-based study"}</h2>
            <p className="mt-3 leading-7 text-slate-400">{ar ? "اختار المادة والصعوبة، وجاوب على الأسئلة. المكافأة تتحدد حسب نتيجتك." : "Choose a subject and difficulty, then earn a reward based on your answers."}</p>
            <div className="mt-6 font-black" style={{ color: theme.accent }}>{ar ? "اختار مادة ←" : "Choose a subject →"}</div>
          </button>
        </div>
      ) : (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8 text-center">
          <div className="text-sm text-slate-500">
            ⏱️{" "}
            {ar
              ? `جلسة التركيز — ${durationMinutes} دقيقة`
              : `Focus session — ${durationMinutes} minutes`}
          </div>

          <div
            className="mt-8 text-7xl font-black tracking-wider"
            style={{
              color: theme.accent,
              textShadow:
                `0 0 35px ${theme.accent}30`,
            }}
          >
            {minutes}:{secs}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {!running && seconds === SESSION_SECONDS && !sessionId && (
              <button
                onClick={startSession}
                disabled={starting}
                className="rounded-2xl px-7 py-4 font-black text-white disabled:opacity-50"
                style={{
                  background:
                    `linear-gradient(135deg,${theme.accent},${theme.second})`,
                }}
              >
                {starting ? "⏳ جاري بدء الجلسة..." : "▶️ ابدأ الجلسة"}
              </button>
            )}



            <button
              onClick={resetSession}
              className="rounded-2xl border border-white/10 px-7 py-4 font-bold"
            >
              🔄 إعادة
            </button>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8">
          <div className="text-5xl">
            {icon.study}
          </div>

          <h2 className="mt-5 text-3xl font-black">
            {task.title}
          </h2>

          <p className="mt-4 leading-8 text-slate-400">
            {task.description}
          </p>

          <div
            className="mt-6 rounded-2xl border p-4 text-sm font-bold"
            style={{
              borderColor:
                `${theme.accent}25`,
              background:
                `${theme.accent}08`,
              color: theme.accent,
            }}
          >
            {seconds > 0
              ? `🔒 لازم تستنى ${minutes}:${secs} قبل إنهاء المهمة.`
              : "🔓 الوقت خلص! تقدر تنهي المهمة الآن."}
          </div>

          <button
            onClick={finish}
            disabled={
              saving ||
              !sessionId ||
              seconds > 0 ||
              finished
            }
            className="mt-7 w-full rounded-2xl px-6 py-4 font-black text-white transition disabled:cursor-not-allowed disabled:opacity-30"
            style={{
              background:
                `linear-gradient(135deg,${theme.accent},${theme.second})`,
            }}
          >
            {saving
              ? "جاري الحفظ..."
              : finished
              ? "تم الإنجاز ✓"
              : seconds > 0
              ? "🔒 أنجز المهمة بعد انتهاء الوقت"
              : "✅ أنجزت المهمة +10 XP"}
          </button>
        </div>
      </div>
      )}
    </PageShell>
  );
}

/* =========================================================
   GAMING
========================================================= */

type GamingQuestion = {
  q: string;
  answers: string[];
};

function GamingView({
  theme,
  ar,
  go,
  reloadUser,
}: {
  theme: Theme;
  ar: boolean;
  go: (view: View) => void;
  reloadUser: () => Promise<User | null>;
}) {
  const [stage, setStage] = useState<"intro" | "playing" | "result">("intro");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<GamingQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; xpAdded: number } | null>(null);

  async function startChallenge() {
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/gaming/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "start" }),
      });
      const data = await response.json();
      if (!response.ok || !data?.sessionId || !Array.isArray(data?.questions)) {
        alert(data?.error || (ar ? "تعذر بدء التحدي." : "Could not start the challenge."));
        return;
      }
      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setAnswers(Array(data.questions.length).fill(-1));
      setResult(null);
      setStage("playing");
    } catch {
      alert(ar ? "تعذر الاتصال بالسيرفر. تأكد من إضافة API التحدي." : "Server connection failed. Check the challenge API.");
    } finally {
      setLoading(false);
    }
  }

  async function finishChallenge() {
    if (!sessionId || loading || answers.some((answer) => answer < 0)) {
      alert(ar ? "جاوب على كل الأسئلة أولًا." : "Answer every question first.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/gaming/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "submit", sessionId, answers }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data?.error || (ar ? "تعذر تصحيح التحدي." : "Could not grade the challenge."));
        return;
      }
      setResult(data);
      setStage("result");
      await reloadUser();
    } catch {
      alert(ar ? "تعذر الاتصال بالسيرفر." : "Server connection failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title={ar ? "الألعاب" : "Gaming"}
      subtitle={ar ? "تحديات بأسئلة متغيرة ومكافآت محفوظة بأمان." : "Randomized challenges with server-verified rewards."}
      theme={theme}
      ar={ar}
      go={go}
    >
      {stage === "intro" && (
        <div className="mx-auto max-w-2xl rounded-[32px] border border-white/10 bg-white/[0.03] p-8 text-center">
          <div className="text-7xl">🎮</div>
          <h2 className="mt-5 text-3xl font-black">{ar ? "تحدي Gaming جديد" : "New Gaming challenge"}</h2>
          <p className="mt-3 leading-7 text-slate-400">
            {ar ? "حل 10 أسئلة. السيرفر هيصحح الإجابات ويمنح XP حسب عدد الإجابات الصحيحة. كل محاولة لها ترتيب مختلف." : "Answer 10 questions. The server grades your answers and awards XP for correct answers. Each attempt is randomized."}
          </p>
          <button onClick={startChallenge} disabled={loading} className="mt-7 rounded-2xl px-7 py-4 font-black text-white disabled:opacity-50" style={{ background: `linear-gradient(135deg,${theme.accent},${theme.second})` }}>
            {loading ? (ar ? "جاري تجهيز التحدي..." : "Preparing...") : (ar ? "ابدأ التحدي 🚀" : "Start challenge 🚀")}
          </button>
        </div>
      )}

      {stage === "playing" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 font-bold">
            {ar ? `تمت الإجابة على ${answers.filter((x) => x >= 0).length} من ${questions.length}` : `${answers.filter((x) => x >= 0).length} of ${questions.length} answered`}
          </div>
          {questions.map((question, index) => (
            <div key={`${sessionId}-${index}`} className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
              <div className="text-sm font-bold" style={{ color: theme.accent }}>{ar ? `السؤال ${index + 1}` : `Question ${index + 1}`}</div>
              <h3 className="mt-3 text-xl font-black">{question.q}</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {question.answers.map((answer, choice) => (
                  <button key={`${index}-${choice}`} onClick={() => setAnswers((current) => current.map((value, i) => i === index ? choice : value))} className="rounded-2xl border p-4 text-start font-bold transition" style={{ borderColor: answers[index] === choice ? theme.accent : "rgba(255,255,255,.1)", background: answers[index] === choice ? `${theme.accent}16` : "rgba(255,255,255,.02)" }}>
                    {choice + 1}. {answer}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button onClick={finishChallenge} disabled={loading || answers.some((x) => x < 0)} className="w-full rounded-2xl px-7 py-4 font-black text-white disabled:opacity-50" style={{ background: `linear-gradient(135deg,${theme.accent},${theme.second})` }}>
            {loading ? (ar ? "جاري التصحيح..." : "Grading...") : (ar ? "إنهاء التحدي" : "Finish challenge")}
          </button>
        </div>
      )}

      {stage === "result" && result && (
        <div className="mx-auto max-w-xl rounded-[32px] border border-white/10 bg-white/[0.03] p-8 text-center">
          <div className="text-7xl">🏆</div>
          <h2 className="mt-5 text-3xl font-black">{ar ? "انتهى التحدي!" : "Challenge complete!"}</h2>
          <div className="mt-5 text-4xl font-black" style={{ color: theme.accent }}>{result.score}/{result.total}</div>
          <div className="mt-3 text-2xl font-black">+{result.xpAdded} XP</div>
          <p className="mt-2 text-slate-400">{ar ? "المكافأة تم حسابها وحفظها من السيرفر." : "The reward was calculated and saved by the server."}</p>
          <button onClick={() => { setStage("intro"); setSessionId(null); setQuestions([]); setAnswers([]); setResult(null); }} className="mt-7 rounded-2xl px-7 py-4 font-black text-white" style={{ background: `linear-gradient(135deg,${theme.accent},${theme.second})` }}>
            {ar ? "تحدي جديد" : "New challenge"}
          </button>
        </div>
      )}
    </PageShell>
  );
}

/* =========================================================
   CALCULATOR
========================================================= */

function CalculatorView({
  theme,
  ar,
  go,
}: {
  theme: Theme;
  ar: boolean;
  go: (view: View) => void;
}) {
  const [display, setDisplay] =
    useState("0");

  function press(value: string) {
    if (value === "C") {
      setDisplay("0");
      return;
    }

    if (value === "=") {
      try {
        const result = Function(
          `"use strict"; return (${display})`
        )();

        setDisplay(
          String(result)
        );
      } catch {
        setDisplay("Error");
      }

      return;
    }

    if (
      display === "0" ||
      display === "Error"
    ) {
      setDisplay(value);
      return;
    }

    setDisplay(
      (current) =>
        current + value
    );
  }

  const buttons = [
    "7",
    "8",
    "9",
    "/",
    "4",
    "5",
    "6",
    "*",
    "1",
    "2",
    "3",
    "-",
    "0",
    ".",
    "C",
    "+",
    "=",
  ];

  return (
    <PageShell
      title={
        ar
          ? "الحسابات"
          : "Calculations"
      }
      subtitle={
        ar
          ? "آلة حاسبة تعمل."
          : "A working calculator."
      }
      theme={theme}
      ar={ar}
      go={go}
    >
      <div className="mx-auto max-w-md rounded-[32px] border border-white/10 bg-[#080f1c] p-5">
        <div className="rounded-2xl bg-black/30 p-6 text-right">
          <div className="break-all text-4xl font-black">
            {display}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-3">
          {buttons.map(
            (button) => (
              <button
                key={button}
                onClick={() =>
                  press(button)
                }
                className={`rounded-2xl p-5 font-black transition hover:scale-105 ${
                  button === "="
                    ? "col-span-2"
                    : ""
                }`}
                style={{
                  background:
                    button === "="
                      ? `linear-gradient(135deg,${theme.accent},${theme.second})`
                      : button === "C"
                      ? "rgba(239,68,68,.15)"
                      : "rgba(255,255,255,.05)",
                }}
              >
                {button}
              </button>
            )
          )}
        </div>
      </div>
    </PageShell>
  );
}

/* =========================================================
   AI
========================================================= */

function AIView({
  theme,
  ar,
  go,
}: {
  theme: Theme;
  ar: boolean;
  go: (view: View) => void;
}) {
  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState<
      {
        role: "user" | "ai";
        text: string;
      }[]
    >([]);

  const [loading, setLoading] =
    useState(false);

  async function send() {
    if (
      !message.trim() ||
      loading
    ) {
      return;
    }

    const text =
      message.trim();

    setMessages((old) => [
      ...old,
      {
        role: "user",
        text,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/ai",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            prompt: ar
              ? `أنت مِفتاح، مساعد تعليمي ذكي. أجب بالعربية بطريقة واضحة ومفيدة.\n\nسؤال المستخدم:\n${text}`
              : `You are Miftah, a helpful intelligent assistant. Answer clearly.\n\nUser question:\n${text}`,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "AI request failed"
        );
      }

      setMessages((old) => [
        ...old,
        {
          role: "ai",
          text:
            data?.answer ||
            (ar
              ? "لم يصل رد."
              : "No response received."),
        },
      ]);
    } catch (error) {
      setMessages((old) => [
        ...old,
        {
          role: "ai",
          text:
            error instanceof Error
              ? error.message
              : ar
              ? "حدث خطأ في AI."
              : "AI error.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell
      title={ar ? "مِفتاح AI" : "Miftah AI"}
      subtitle={
        ar
          ? "الذكاء الاصطناعي الحقيقي."
          : "Real AI."
      }
      theme={theme}
      ar={ar}
      go={go}
    >
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[32px] border border-white/10 bg-[#080f1c]">
        <div className="flex items-center gap-3 border-b border-white/10 p-5">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl text-white"
            style={{
              background:
                `linear-gradient(135deg,${theme.accent},${theme.second})`,
            }}
          >
            {icon.ai}
          </div>

          <div>
            <div className="font-black">
              مِفتاح AI
            </div>

            <div className="text-xs text-green-400">
              ●{" "}
              {ar
                ? "متصل"
                : "Online"}
            </div>
          </div>
        </div>

        <div className="h-[420px] space-y-3 overflow-y-auto p-5">
          {messages.length ===
            0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="text-7xl">
                {icon.ai}
              </div>

              <h2 className="mt-5 text-3xl font-black">
                أهلًا! أنا مِفتاح
              </h2>

              <p className="mt-3 text-slate-500">
                {ar
                  ? "اكتب سؤالك وأنا هحاول أساعدك."
                  : "Ask me anything."}
              </p>
            </div>
          )}

          {messages.map(
            (item, index) => (
              <div
                key={index}
                className={`flex ${
                  item.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className="max-w-[85%] rounded-2xl px-5 py-3 leading-7"
                  style={{
                    background:
                      item.role === "user"
                        ? theme.accent
                        : "rgba(255,255,255,.05)",
                  }}
                >
                  {item.text}
                </div>
              </div>
            )
          )}

          {loading && (
            <div className="text-sm text-slate-500">
              مِفتاح بيفكر...
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="flex gap-3">
            <input
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  send();
                }
              }}
              className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 outline-none"
              placeholder={
                ar
                  ? "اكتب سؤالك..."
                  : "Type your question..."
              }
            />

            <button
              onClick={send}
              disabled={loading}
              className="rounded-2xl px-6 font-black text-white disabled:opacity-50"
              style={{
                background:
                  `linear-gradient(135deg,${theme.accent},${theme.second})`,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/* =========================================================
   REVIEW
========================================================= */

type ExamSubject = "math" | "science" | "arabic" | "english" | "social" | "computer";
type ExamDifficulty = "easy" | "medium" | "hard";
type ExamQuestion = { id: string; q: string; answers: string[] };
type ExamResult = { score: number; total: number; passed: boolean; xpAwarded: number; xp: number };

const examSubjects: { id: ExamSubject; ar: string; en: string; emoji: string; descriptionAr: string; descriptionEn: string }[] = [
  { id: "math", ar: "الرياضيات", en: "Mathematics", emoji: "➗", descriptionAr: "حساب ومسائل وتفكير منطقي", descriptionEn: "Arithmetic, problems and logic" },
  { id: "science", ar: "العلوم", en: "Science", emoji: "🧪", descriptionAr: "الجسم والطبيعة والطاقة", descriptionEn: "Nature, the body and energy" },
  { id: "arabic", ar: "اللغة العربية", en: "Arabic", emoji: "📖", descriptionAr: "النحو واللغة والمفردات", descriptionEn: "Grammar and language" },
  { id: "english", ar: "اللغة الإنجليزية", en: "English", emoji: "🔤", descriptionAr: "Grammar and vocabulary", descriptionEn: "Grammar and vocabulary" },
  { id: "social", ar: "الدراسات الاجتماعية", en: "Social Studies", emoji: "🌍", descriptionAr: "جغرافيا وتاريخ ومجتمع", descriptionEn: "Geography, history and society" },
  { id: "computer", ar: "الحاسب والتكنولوجيا", en: "Computer & Technology", emoji: "💻", descriptionAr: "الكمبيوتر والإنترنت والأمان", descriptionEn: "Computers, internet and safety" },
];

function ReviewView({
  theme,
  ar,
  go,
  reloadUser,
}: {
  theme: Theme;
  ar: boolean;
  go: (view: View) => void;
  reloadUser: () => Promise<User | null>;
}) {
  const [stage, setStage] = useState<"subjects" | "difficulty" | "exam" | "result">("subjects");
  const [subject, setSubject] = useState<ExamSubject | null>(null);
  const [difficulty, setDifficulty] = useState<ExamDifficulty | null>(null);
  const [examId, setExamId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loadingExam, setLoadingExam] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);

  const difficultyConfig: Record<ExamDifficulty, { ar: string; en: string; count: number; color: string }> = {
    easy: { ar: "سهل", en: "Easy", count: 15, color: "#22c55e" },
    medium: { ar: "متوسط", en: "Medium", count: 20, color: "#f59e0b" },
    hard: { ar: "صعب", en: "Hard", count: 25, color: "#ef4444" },
  };

  async function beginExam(nextDifficulty: ExamDifficulty) {
    if (!subject || loadingExam) return;
    setDifficulty(nextDifficulty);
    setLoadingExam(true);
    try {
      const response = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "start", subject, difficulty: nextDifficulty }),
      });
      const data = await response.json();
      if (!response.ok || !data?.examId || !Array.isArray(data?.questions)) {
        alert(data?.error || (ar ? "تعذر إنشاء الامتحان." : "Could not create the exam."));
        return;
      }
      setExamId(data.examId);
      setQuestions(data.questions);
      setAnswers([]);
      setQuestionIndex(0);
      setSelectedAnswer(null);
      setResult(null);
      setStage("exam");
    } catch {
      alert(ar ? "تعذر الاتصال بالسيرفر." : "Could not connect to the server.");
    } finally {
      setLoadingExam(false);
    }
  }

  async function nextQuestion() {
    if (selectedAnswer === null || submitting || !examId) return;
    const submitted = [...answers, selectedAnswer];
    if (questionIndex < questions.length - 1) {
      setAnswers(submitted);
      setQuestionIndex((value) => value + 1);
      setSelectedAnswer(null);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action: "finish", examId, answers: submitted }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data?.error || (ar ? "تعذر تصحيح الامتحان." : "Could not grade the exam."));
        return;
      }
      setResult(data as ExamResult);
      setStage("result");
      await reloadUser();
    } catch {
      alert(ar ? "تعذر الاتصال بالسيرفر أثناء التصحيح." : "Could not connect to grade the exam.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetExam() {
    setStage("subjects");
    setSubject(null);
    setDifficulty(null);
    setExamId(null);
    setQuestions([]);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setResult(null);
  }

  const selectedSubject = examSubjects.find((item) => item.id === subject);
  const activeQuestion = questions[questionIndex];

  return (
    <PageShell
      title={ar ? "الاختبارات" : "Exams"}
      subtitle={ar ? "اختار مادة وصعوبة، وكل محاولة هتكون بترتيب وأسئلة مختلفين." : "Choose a subject and difficulty. Each attempt is randomized."}
      theme={theme}
      ar={ar}
      go={go}
    >
      {stage === "subjects" && (
        <>
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-xl font-black">🧠 {ar ? "ابدأ امتحانك" : "Start your exam"}</div>
            <p className="mt-2 text-sm leading-7 text-slate-400">{ar ? "اختار المادة الأول. بعد كده هتختار الصعوبة وعدد الأسئلة. التصحيح بيتم على السيرفر، ولازم تكون إجابتك غلط في سؤال واحد بحد أقصى عشان تكسب XP." : "Pick a subject first, then choose difficulty and question count. The server grades your answers; you can earn XP only if you miss at most one question."}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {examSubjects.map((item) => (
              <button key={item.id} onClick={() => { setSubject(item.id); setStage("difficulty"); }} className="rounded-3xl border border-white/10 bg-[#091221] p-6 text-start transition hover:-translate-y-1 hover:border-white/20">
                <div className="text-4xl">{item.emoji}</div>
                <h3 className="mt-4 text-2xl font-black">{ar ? item.ar : item.en}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{ar ? item.descriptionAr : item.descriptionEn}</p>
                <div className="mt-5 font-black" style={{ color: theme.accent }}>{ar ? "اختار المادة ←" : "Choose subject →"}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {stage === "difficulty" && selectedSubject && (
        <div className="mx-auto max-w-3xl rounded-[32px] border border-white/10 bg-[#091221] p-7 sm:p-9">
          <button onClick={() => setStage("subjects")} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-300">{ar ? "← رجوع للمواد" : "← Back to subjects"}</button>
          <div className="mt-6 flex items-center gap-4">
            <div className="text-5xl">{selectedSubject.emoji}</div>
            <div><h2 className="text-3xl font-black">{ar ? selectedSubject.ar : selectedSubject.en}</h2><p className="mt-1 text-slate-400">{ar ? "اختار مستوى الامتحان" : "Choose exam difficulty"}</p></div>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {(Object.keys(difficultyConfig) as ExamDifficulty[]).map((item) => {
              const cfg = difficultyConfig[item];
              return <button key={item} disabled={loadingExam} onClick={() => beginExam(item)} className="rounded-3xl border p-6 text-start transition hover:-translate-y-1 disabled:opacity-50" style={{ borderColor: `${cfg.color}70`, background: `${cfg.color}0e` }}>
                <div className="text-2xl font-black" style={{ color: cfg.color }}>{ar ? cfg.ar : cfg.en}</div>
                <div className="mt-3 text-3xl font-black">{cfg.count}</div>
                <div className="mt-1 text-sm text-slate-400">{ar ? "سؤال" : "questions"}</div>
                <div className="mt-5 text-sm font-bold">{loadingExam ? (ar ? "جاري تجهيز الامتحان..." : "Preparing exam...") : (ar ? "ابدأ ←" : "Start →")}</div>
              </button>;
            })}
          </div>
          <p className="mt-5 text-xs leading-6 text-slate-500">{ar ? "الأسئلة والاختيارات بتتغيّر عشوائيًا. ما تخرجش من الامتحان قبل ما تسلّم إجاباتك." : "Questions and answer options are randomized. Submit your answers before leaving the exam."}</p>
        </div>
      )}

      {stage === "exam" && activeQuestion && difficulty && (
        <div className="mx-auto max-w-3xl rounded-[32px] border border-white/10 bg-[#091221] p-7 sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><div className="text-sm text-slate-400">{selectedSubject ? (ar ? selectedSubject.ar : selectedSubject.en) : ""} • {ar ? difficultyConfig[difficulty].ar : difficultyConfig[difficulty].en}</div><div className="mt-1 font-black">{ar ? `السؤال ${questionIndex + 1} من ${questions.length}` : `Question ${questionIndex + 1} of ${questions.length}`}</div></div>
            <div className="rounded-full px-4 py-2 text-sm font-black" style={{ color: theme.accent, background: `${theme.accent}16` }}>{Math.round(((questionIndex + 1) / questions.length) * 100)}%</div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full transition-all" style={{ width: `${((questionIndex + 1) / questions.length) * 100}%`, background: `linear-gradient(90deg,${theme.accent},${theme.second})` }} /></div>
          <h2 className="mt-8 text-2xl font-black leading-relaxed sm:text-3xl">{activeQuestion.q}</h2>
          <div className="mt-7 grid gap-3">
            {activeQuestion.answers.map((answer, index) => {
              const chosen = selectedAnswer === index;
              return <button key={`${activeQuestion.id}-${index}`} onClick={() => setSelectedAnswer(index)} className="rounded-2xl border p-4 text-start font-bold transition" style={{ borderColor: chosen ? theme.accent : "rgba(255,255,255,.1)", background: chosen ? `${theme.accent}18` : "rgba(255,255,255,.03)" }}><span className="me-3 inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm" style={{ background: chosen ? theme.accent : "rgba(255,255,255,.08)", color: chosen ? "white" : "#cbd5e1" }}>{String.fromCharCode(65 + index)}</span>{answer}</button>;
            })}
          </div>
          <button onClick={nextQuestion} disabled={selectedAnswer === null || submitting} className="mt-7 w-full rounded-2xl px-6 py-4 font-black text-white transition disabled:opacity-40" style={{ background: `linear-gradient(135deg,${theme.accent},${theme.second})` }}>{submitting ? (ar ? "جاري التصحيح..." : "Grading...") : questionIndex === questions.length - 1 ? (ar ? "تسليم الامتحان وتصحيحه ✅" : "Submit and grade ✅") : (ar ? "السؤال التالي ←" : "Next question →")}</button>
        </div>
      )}

      {stage === "result" && result && (
        <div className="mx-auto max-w-2xl rounded-[32px] border border-white/10 bg-[#091221] p-8 text-center sm:p-12">
          <div className="text-7xl">{result.passed ? "🏆" : "📚"}</div>
          <h2 className="mt-5 text-3xl font-black">{result.passed ? (ar ? "مبروك، نجحت!" : "Congratulations, you passed!") : (ar ? "محتاج مراجعة بسيطة" : "A little more review needed")}</h2>
          <div className="mt-5 text-5xl font-black" style={{ color: theme.accent }}>{result.score} / {result.total}</div>
          <p className="mt-3 text-slate-400">{ar ? `درجتك ${Math.round((result.score / result.total) * 100)}%` : `Score: ${Math.round((result.score / result.total) * 100)}%`}</p>
          {result.passed ? <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/10 p-5"><div className="text-xl font-black text-green-300">✅ {ar ? "كسبت XP لأنك أخطأت في سؤال واحد بحد أقصى" : "You earned XP because you missed at most one question"}</div><div className="mt-2 text-3xl font-black" style={{ color: theme.accent }}>+{result.xpAwarded} XP</div></div> : <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-amber-200">{ar ? "أخطأت في سؤالين أو أكثر، لذلك لا توجد مكافأة. راجع المادة وجرب امتحانًا جديدًا." : "You missed two or more questions, so no XP was awarded. Review and try a new exam."}</div>}
          <div className="mt-7 flex flex-wrap justify-center gap-3"><button onClick={resetExam} className="rounded-2xl px-7 py-4 font-black text-white" style={{ background: `linear-gradient(135deg,${theme.accent},${theme.second})` }}>{ar ? "امتحان جديد" : "New exam"}</button><button onClick={() => go("home")} className="rounded-2xl border border-white/10 px-7 py-4 font-bold">{ar ? "العودة للرئيسية" : "Back home"}</button></div>
        </div>
      )}
    </PageShell>
  );
}

/* =========================================================
   PLAN
========================================================= */

function PlanView({
  theme,
  ar,
  go,
  notifications,
}: {
  theme: Theme;
  ar: boolean;
  go: (view: View) => void;
  notifications: boolean;
}) {
  const [wake, setWake] =
    useState("07:00");

  const [sleep, setSleep] =
    useState("22:00");

  const [schedule, setSchedule] =
    useState<
      {
        time: string;
        title: string;
      }[]
    >([]);

  const generate = () => {
    const items = [
      {
        time: "08:00",
        title: "📚 مذاكرة",
      },
      {
        time: "08:30",
        title: "☕ راحة",
      },
      {
        time: "10:00",
        title: "📖 مراجعة",
      },
      {
        time: "17:00",
        title: "🎮 ألعاب",
      },
      {
        time: "19:00",
        title: "🤖 AI / تعلم",
      },
      {
        time: sleep,
        title: "🌙 نوم",
      },
    ];

    setSchedule(items);

    localStorage.setItem(
      "miftah_schedule",
      JSON.stringify(items)
    );
  };

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          "miftah_schedule"
        );

      if (saved) {
        setSchedule(
          JSON.parse(saved)
        );
      }
    } catch {}
  }, []);

  function askNotification() {
    if (
      "Notification" in window &&
      Notification.permission !==
        "granted"
    ) {
      Notification.requestPermission();
    }
  }

  useEffect(() => {
    if (
      !notifications ||
      schedule.length === 0
    ) {
      return;
    }

    const timer =
      setInterval(() => {
        const now =
          new Date();

        const current =
          `${String(
            now.getHours()
          ).padStart(
            2,
            "0"
          )}:${String(
            now.getMinutes()
          ).padStart(
            2,
            "0"
          )}`;

        const item =
          schedule.find(
            (entry) =>
              entry.time ===
              current
          );

        if (
          item &&
          "Notification" in
            window &&
          Notification.permission ===
            "granted"
        ) {
          new Notification(
            `مِفتاح — ${item.title}`
          );
        }
      }, 60000);

    return () =>
      clearInterval(timer);
  }, [
    schedule,
    notifications,
  ]);

  return (
    <PageShell
      title={
        ar
          ? "جدول المذاكرة"
          : "Study plan"
      }
      subtitle={
        ar
          ? "مفتاح يرتب لك اليوم."
          : "Miftah organizes your day."
      }
      theme={theme}
      ar={ar}
      go={go}
    >
      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-7">
          <h2 className="text-2xl font-black">
            {icon.rocket} إنشاء جدول
          </h2>

          <label className="mt-6 block font-bold">
            وقت الصحيان
          </label>

          <input
            type="time"
            value={wake}
            onChange={(e) =>
              setWake(
                e.target.value
              )
            }
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 p-4"
          />

          <label className="mt-5 block font-bold">
            وقت النوم
          </label>

          <input
            type="time"
            value={sleep}
            onChange={(e) =>
              setSleep(
                e.target.value
              )
            }
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 p-4"
          />

          <button
            onClick={generate}
            className="mt-7 w-full rounded-2xl py-4 font-black text-white"
            style={{
              background:
                `linear-gradient(135deg,${theme.accent},${theme.second})`,
            }}
          >
            إنشاء الجدول
          </button>

          <button
            onClick={
              askNotification
            }
            className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.04] py-4 font-bold"
          >
            🔔 تفعيل إشعارات المتصفح
          </button>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-7">
          <h2 className="text-2xl font-black">
            📅 جدول اليوم
          </h2>

          <div className="mt-6 space-y-3">
            {schedule.length ===
            0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-slate-500">
                اضغط إنشاء الجدول.
              </div>
            ) : (
              schedule.map(
                (item) => (
                  <div
                    key={`${item.time}-${item.title}`}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4"
                  >
                    <div
                      className="rounded-xl px-3 py-2 font-black"
                      style={{
                        color:
                          theme.accent,
                        background:
                          `${theme.accent}12`,
                      }}
                    >
                      {item.time}
                    </div>

                    <div className="font-bold">
                      {item.title}
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsView({
  theme,
  ar,
  tab,
  setTab,
  user,
  themeId,
  setThemeId,
  notifications,
  setNotificationsEnabled,
  setLanguage,
  durationMinutes,
  setDurationMinutes,
  logout,
  go,
}: {
  theme: Theme;
  ar: boolean;
  tab: SettingsTab;
  setTab: (value: SettingsTab) => void;
  user: User;
  themeId: string;
  setThemeId: (value: string) => void;
  notifications: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  setLanguage: (value: "ar" | "en") => void;
  durationMinutes: number;
  setDurationMinutes: (value: number) => void;
  logout: () => Promise<void>;
  go: (view: View) => void;
}) {
  const [name, setName] = useState(user.name);
  const [nickname, setNickname] = useState(String(user.profile?.nickname || ""));
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [dailyGoal, setDailyGoal] = useState("30");
  const [focusReminders, setFocusReminders] = useState(true);
  const [animations, setAnimations] = useState(true);

  useEffect(() => {
    try {
      const savedGoal = localStorage.getItem("miftah-daily-goal");
      const savedReminders = localStorage.getItem("miftah-focus-reminders");
      const savedAnimations = localStorage.getItem("miftah-animations");
      if (savedGoal && ["15", "30", "45", "60", "90"].includes(savedGoal)) setDailyGoal(savedGoal);
      if (savedReminders !== null) setFocusReminders(savedReminders === "true");
      if (savedAnimations !== null) setAnimations(savedAnimations === "true");
    } catch {
      // Keep safe defaults if browser storage is unavailable.
    }
  }, []);

  async function saveProfile() {
    if (saving) return;
    setSaving(true);
    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, nickname }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data?.error || (ar ? "حدث خطأ أثناء حفظ الحساب." : "Could not save account."));
        return;
      }
      alert(ar ? "تم حفظ الحساب ✅" : "Account saved ✅");
      window.location.reload();
    } catch {
      alert(ar ? "تعذر الاتصال بالسيرفر." : "Could not connect to the server.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (passwordSaving) return;
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert(ar ? "املأ كل حقول كلمة المرور." : "Fill in every password field.");
      return;
    }
    if (newPassword.length < 8) {
      alert(ar ? "كلمة المرور الجديدة لازم تكون 8 أحرف على الأقل." : "The new password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert(ar ? "تأكيد كلمة المرور مش مطابق." : "The confirmation password does not match.");
      return;
    }
    if (currentPassword === newPassword) {
      alert(ar ? "اختار كلمة مرور جديدة مختلفة." : "Choose a different new password.");
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data?.error || (ar ? "تعذر تغيير كلمة المرور." : "Could not change password."));
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      alert(ar ? "تم تغيير كلمة المرور بنجاح ✅" : "Password changed successfully ✅");
    } catch {
      alert(ar ? "تعذر الاتصال بالسيرفر." : "Could not connect to the server.");
    } finally {
      setPasswordSaving(false);
    }
  }

  function savePreference(key: "dailyGoal" | "focusReminders" | "animations", value: string | boolean) {
    try {
      const storageKey = key === "dailyGoal" ? "miftah-daily-goal" : key === "focusReminders" ? "miftah-focus-reminders" : "miftah-animations";
      localStorage.setItem(storageKey, String(value));
    } catch {
      alert(ar ? "تعذر حفظ الإعداد على هذا المتصفح." : "Could not save this preference in the browser.");
    }
  }

  const settingTabs: [SettingsTab, string, string, string][] = [
    ["account", icon.user, "الحساب", "Account"],
    ["password", "🔐", "كلمة المرور والأمان", "Password & Security"],
    ["themes", icon.theme, "الثيمات", "Themes"],
    ["language", icon.language, "اللغة", "Language"],
    ["notifications", icon.notifications, "الإشعارات", "Notifications"],
    ["preferences", "✨", "تفضيلات مِفتاح", "Miftah Preferences"],
  ];

  return (
    <PageShell
      title={ar ? "الإعدادات" : "Settings"}
      subtitle={ar ? "تحكم في حسابك وأمانك ومظهر مِفتاح." : "Manage your account, security and Miftah experience."}
      theme={theme}
      ar={ar}
      go={go}
    >
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit rounded-[28px] border border-white/10 bg-white/[0.03] p-3">
          {settingTabs.map(([id, ico, titleAr, titleEn]) => (
            <button key={id} onClick={() => setTab(id)} className="mb-1 flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-start font-bold transition" style={{ color: tab === id ? theme.accent : "#cbd5e1", background: tab === id ? `${theme.accent}12` : "transparent" }}>
              <span>{ico}</span><span>{ar ? titleAr : titleEn}</span>
            </button>
          ))}
        </aside>

        <div className="rounded-[32px] border border-white/10 bg-[#091221] p-6 sm:p-7">
          {tab === "account" && (
            <>
              <h2 className="text-3xl font-black">{ar ? "الحساب" : "Account"}</h2>
              <p className="mt-2 text-slate-500">{ar ? "عدّل بياناتك الأساسية واحفظ التغييرات." : "Edit your profile information."}</p>
              <label className="mt-8 block font-bold">{ar ? "الاسم الظاهر" : "Display name"}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 p-4 outline-none focus:border-white/30" maxLength={60} />
              <label className="mt-5 block font-bold">Nickname</label>
              <input value={nickname} onChange={(e) => setNickname(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 p-4 outline-none focus:border-white/30" placeholder={ar ? "اكتب لقبك" : "Enter a nickname"} maxLength={40} />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="text-xs text-slate-500">Username</div><div className="mt-1 font-bold">@{user.username}</div></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="text-xs text-slate-500">Email</div><div className="mt-1 break-all font-bold">{user.email}</div></div>
              </div>
              <button onClick={saveProfile} disabled={saving} className="mt-6 rounded-2xl px-7 py-4 font-black text-white disabled:opacity-50" style={{ background: `linear-gradient(135deg,${theme.accent},${theme.second})` }}>{saving ? (ar ? "جاري الحفظ..." : "Saving...") : (ar ? "حفظ التغييرات" : "Save changes")}</button>
              <button onClick={logout} className="mt-6 block rounded-2xl border border-red-500/20 bg-red-500/5 px-7 py-4 font-black text-red-400">🚪 {ar ? "تسجيل الخروج" : "Log out"}</button>
            </>
          )}

          {tab === "password" && (
            <>
              <div className="flex items-center gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl">🔐</div><div><h2 className="text-3xl font-black">{ar ? "تغيير كلمة المرور" : "Change password"}</h2><p className="mt-1 text-sm text-slate-400">{ar ? "تأكد من كلمة المرور الحالية قبل حفظ الجديدة." : "Verify your current password before saving a new one."}</p></div></div>
              <div className="mt-7 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-7 text-amber-200">🛡️ {ar ? "استخدم كلمة مرور مختلفة عن كلمات مرور حساباتك الأخرى، ولا تشاركها مع أي شخص." : "Use a unique password and never share it with anyone."}</div>
              <label className="mt-7 block font-bold">{ar ? "كلمة المرور الحالية" : "Current password"}</label>
              <input type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 p-4 outline-none focus:border-white/30" />
              <label className="mt-5 block font-bold">{ar ? "كلمة المرور الجديدة" : "New password"}</label>
              <input type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 p-4 outline-none focus:border-white/30" minLength={8} />
              <label className="mt-5 block font-bold">{ar ? "تأكيد كلمة المرور الجديدة" : "Confirm new password"}</label>
              <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 p-4 outline-none focus:border-white/30" minLength={8} />
              <button onClick={changePassword} disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword} className="mt-7 w-full rounded-2xl px-7 py-4 font-black text-white disabled:cursor-not-allowed disabled:opacity-40" style={{ background: `linear-gradient(135deg,${theme.accent},${theme.second})` }}>{passwordSaving ? (ar ? "جاري تغيير كلمة المرور..." : "Changing password...") : (ar ? "🔒 حفظ كلمة المرور الجديدة" : "🔒 Save new password")}</button>
            </>
          )}

          {tab === "themes" && (
            <>
              <h2 className="text-3xl font-black">{ar ? "الثيمات" : "Themes"}</h2>
              <p className="mt-2 text-slate-500">{ar ? "اختار مظهر مِفتاح المفضل عندك." : "Choose your preferred Miftah look."}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {themes.map((item) => {
                  const selected = themeId === item.id;
                  return <button key={item.id} onClick={() => { if (item.premium) { alert(ar ? "هذا الثيم Premium 🔒" : "This theme is Premium 🔒"); return; } setThemeId(item.id); }} className="rounded-3xl border p-4 text-start transition hover:-translate-y-1" style={{ borderColor: selected ? item.accent : "rgba(255,255,255,.1)", boxShadow: selected ? `0 0 25px ${item.accent}18` : "none" }}>
                    <div className={item.id === "rainbow" ? "rainbow-theme h-24 rounded-2xl" : "h-24 rounded-2xl"} style={item.id === "rainbow" ? {} : { background: `linear-gradient(135deg,${item.accent},${item.second})` }} />
                    <div className="mt-4 flex items-center justify-between gap-2"><span className="font-black">{item.name}</span>{item.premium ? <span className="text-xs font-black text-yellow-300">PREMIUM 🔒</span> : selected ? <span className="font-black" style={{ color: item.accent }}>✓</span> : null}</div>
                  </button>;
                })}
              </div>
            </>
          )}

          {tab === "language" && (
            <>
              <h2 className="text-3xl font-black">{ar ? "لغة مِفتاح" : "Miftah language"}</h2>
              <p className="mt-2 text-slate-500">{ar ? "غيّر اللغة من هنا؛ الاختيار يُحفظ من نظام اللغة الحالي." : "Change the interface language here."}</p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <button onClick={() => setLanguage("ar")} className="rounded-3xl border p-6 text-start transition" style={{ borderColor: ar ? theme.accent : "rgba(255,255,255,.1)", background: ar ? `${theme.accent}12` : "rgba(255,255,255,.02)" }}>
                  <div className="text-3xl">🇪🇬</div><div className="mt-3 text-xl font-black">العربية</div><div className="mt-1 text-sm text-slate-500">{ar ? "اللغة الحالية" : "Arabic"}</div>
                </button>
                <button onClick={() => setLanguage("en")} className="rounded-3xl border p-6 text-start transition" style={{ borderColor: !ar ? theme.accent : "rgba(255,255,255,.1)", background: !ar ? `${theme.accent}12` : "rgba(255,255,255,.02)" }}>
                  <div className="text-3xl">🇬🇧</div><div className="mt-3 text-xl font-black">English</div><div className="mt-1 text-sm text-slate-500">{!ar ? "Current language" : "اللغة الحالية"}</div>
                </button>
              </div>
            </>
          )}

          {tab === "notifications" && (
            <div>
              <h2 className="text-3xl font-black">{ar ? "الإشعارات" : "Notifications"}</h2>
              <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6"><div className="text-xl font-black">🔔 {ar ? "تنبيهات جدول المذاكرة" : "Study plan reminders"}</div><p className="mt-2 leading-7 text-slate-400">{ar ? "قسم الإشعارات جاهز لربط تنبيهات المتصفح وجدولك لاحقًا." : "The notifications area is ready to connect to browser reminders and your schedule."}</p><div className="mt-4 font-bold" style={{ color: notifications ? theme.accent : "#64748b" }}>{notifications ? (ar ? "مفعلة في إعدادات الواجهة" : "Enabled in the interface") : (ar ? "موقفة" : "Off")}</div></div>
            </div>
          )}

          {tab === "preferences" && (
            <>
              <h2 className="text-3xl font-black">{ar ? "تفضيلات مِفتاح" : "Miftah preferences"}</h2>
              <p className="mt-2 text-slate-500">{ar ? "خيارات صغيرة تخلي تجربتك مناسبة لطريقتك." : "Small options to personalize your experience."}</p>
              <div className="mt-7 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <label className="block text-lg font-black">⏱️ {ar ? "مدة جلسة المذاكرة" : "Study session duration"}</label>
                <p className="mt-2 text-sm text-slate-400">{ar ? "المدة هنا هي نفسها التي يستخدمها عداد المذاكرة." : "This duration is used by the study timer."}</p>
                <select value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} className="mt-4 w-full rounded-2xl border border-white/10 bg-[#030712] p-4 font-bold outline-none">
                  {[5, 10, 15, 20, 25, 30, 45, 60].map((value) => <option key={value} value={value}>{value} {ar ? "دقيقة" : "minutes"}</option>)}
                </select>
              </div>
              <div className="mt-7 rounded-3xl border border-white/10 bg-white/[0.03] p-5"><label className="block text-lg font-black">🎯 {ar ? "هدف المذاكرة اليومي" : "Daily study goal"}</label><p className="mt-2 text-sm text-slate-400">{ar ? "حدد إجمالي الدقائق اللي عايز تذاكرها كل يوم." : "Set your target study minutes per day."}</p><select value={dailyGoal} onChange={(e) => { setDailyGoal(e.target.value); savePreference("dailyGoal", e.target.value); }} className="mt-4 w-full rounded-2xl border border-white/10 bg-[#030712] p-4 font-bold outline-none"><option value="15">15 {ar ? "دقيقة" : "minutes"}</option><option value="30">30 {ar ? "دقيقة" : "minutes"}</option><option value="45">45 {ar ? "دقيقة" : "minutes"}</option><option value="60">60 {ar ? "دقيقة" : "minutes"}</option><option value="90">90 {ar ? "دقيقة" : "minutes"}</option></select></div>
              <div className="mt-4 flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5"><div><div className="font-black">✨ {ar ? "الحركات والأنيميشن" : "Animations"}</div><p className="mt-1 text-sm text-slate-400">{ar ? "احفظ تفضيلك لتقليل الحركة لاحقًا." : "Save your preference for reduced motion."}</p></div><button role="switch" aria-checked={animations} onClick={() => { const value = !animations; setAnimations(value); savePreference("animations", value); }} className="rounded-full px-4 py-2 text-sm font-black" style={{ background: animations ? theme.accent : "#334155", color: "white" }}>{animations ? (ar ? "مفعلة" : "On") : (ar ? "موقفة" : "Off")}</button></div>
              <div className="mt-4 flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5"><div><div className="font-black">⏰ {ar ? "تذكير بالتركيز" : "Focus reminders"}</div><p className="mt-1 text-sm text-slate-400">{ar ? "احفظ اختيارك لتذكيرات جلسات المذاكرة." : "Save your focus-reminder preference."}</p></div><button role="switch" aria-checked={focusReminders} onClick={() => { const value = !focusReminders; setNotificationsEnabled(value); setFocusReminders(value); savePreference("focusReminders", value); }} className="rounded-full px-4 py-2 text-sm font-black" style={{ background: focusReminders ? theme.accent : "#334155", color: "white" }}>{focusReminders ? (ar ? "مفعلة" : "On") : (ar ? "موقفة" : "Off")}</button></div>
              <p className="mt-5 text-xs leading-6 text-slate-500">{ar ? "يتم حفظ التفضيلات دي على نفس المتصفح. تفعيل التذكيرات الفعلية وربط الهدف بسجل تقدمك هيكون خطوة منفصلة." : "These preferences are saved in this browser. Functional notifications and progress tracking will be connected separately."}</p>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}

/* =========================================================
   PAGE SHELL
========================================================= */

function PageShell({
  title,
  subtitle,
  theme,
  ar,
  go,
  children,
}: {
  title: string;
  subtitle: string;
  theme: Theme;
  ar: boolean;
  go: (view: View) => void;
  children: React.ReactNode;
}) {
  return (
    <section className="pt-10">
      <button
        onClick={() =>
          go("home")
        }
        className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 font-bold transition hover:bg-white/[0.08]"
      >
        {ar ? "← الرئيسية" : "← Home"}
      </button>

      <div className="mb-8 mt-10">
        <div
          className="text-xs font-black tracking-[.3em]"
          style={{
            color: theme.accent,
          }}
        >
          MIFTAH
        </div>

        <h1 className="mt-2 text-5xl font-black">
          {title}
        </h1>

        <p className="mt-3 text-lg text-slate-500">
          {subtitle}
        </p>
      </div>

      {children}
    </section>
  );
}