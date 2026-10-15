"use client";

import { useTheme, type ThemeName } from "@/components/ThemeProvider";

const themeIcons: Record<ThemeName, string> = {
  blue: "🔵",
  cyan: "🩵",
  purple: "🟣",
  violet: "💜",
  pink: "🩷",
  rose: "🌹",
  red: "🔴",
  orange: "🟠",
  gold: "🟡",
  yellow: "💛",
  lime: "🟢",
  green: "💚",
  emerald: "💎",
  teal: "🌊",
  indigo: "🔷",
  ice: "❄️",
  crimson: "🩸",
  black: "⚫",
  white: "⚪",
  rainbow: "🌈",
};

const themeNames: Record<ThemeName, string> = {
  blue: "أزرق",
  cyan: "سماوي",
  purple: "بنفسجي",
  violet: "موف",
  pink: "وردي",
  rose: "وردي غامق",
  red: "أحمر",
  orange: "برتقالي",
  gold: "ذهبي",
  yellow: "أصفر",
  lime: "ليموني",
  green: "أخضر",
  emerald: "زمردي",
  teal: "تركواز",
  indigo: "نيلي",
  ice: "جليدي",
  crimson: "قرمزي",
  black: "أسود",
  white: "أبيض",
  rainbow: "رينبو",
};

const themeOrder: ThemeName[] = [
  "blue",
  "cyan",
  "purple",
  "violet",
  "pink",
  "rose",
  "red",
  "orange",
  "gold",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "indigo",
  "ice",
  "crimson",
  "black",
  "white",
  "rainbow",
];

export default function ThemePicker() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div
      dir="rtl"
      className="fixed bottom-5 left-5 z-[100] w-[320px] max-h-[75vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#07101d]/95 p-4 shadow-2xl backdrop-blur-xl"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white">
            🎨 ثيمات مِفتاح
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            اختار اللون اللي يعجبك
          </p>
        </div>

        <div className="rounded-full bg-white/5 px-3 py-1 text-xs font-black text-slate-400">
          {themeNames[theme]}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {themeOrder.map((item) => {
          const config = themes[item];
          const selected = theme === item;

          return (
            <button
              key={item}
              onClick={() => setTheme(item)}
              className={`relative overflow-hidden rounded-2xl border p-3 text-right transition hover:scale-[1.03] ${
                selected
                  ? "border-white/40 bg-white/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{
                  background: `linear-gradient(90deg, ${config.accent}, ${config.second})`,
                }}
              />

              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {themeIcons[item]}
                </span>

                <span className="font-black text-white">
                  {themeNames[item]}
                </span>
              </div>

              {config.premium && (
                <span className="mt-2 inline-block rounded-full bg-yellow-500/10 px-2 py-1 text-[10px] font-black text-yellow-400">
                  ⭐ PREMIUM
                </span>
              )}

              {selected && (
                <span className="absolute left-2 top-2 text-xs text-emerald-400">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-yellow-500/10 bg-yellow-500/5 p-3 text-center text-xs text-yellow-300">
        ⭐ ثيمات Premium متاحة حاليًا للمعاينة
      </div>
    </div>
  );
}