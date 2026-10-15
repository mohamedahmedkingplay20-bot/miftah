"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeName =
  | "blue"
  | "cyan"
  | "purple"
  | "violet"
  | "pink"
  | "rose"
  | "red"
  | "orange"
  | "gold"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "indigo"
  | "ice"
  | "crimson"
  | "black"
  | "white"
  | "rainbow";

export type ThemeConfig = {
  name: string;
  accent: string;
  second: string;
  glow: string;
  premium?: boolean;
};

export const themes: Record<ThemeName, ThemeConfig> = {
  blue: {
    name: "Blue",
    accent: "#2563eb",
    second: "#06b6d4",
    glow: "rgba(37,99,235,.30)",
  },

  cyan: {
    name: "Cyan",
    accent: "#06b6d4",
    second: "#22d3ee",
    glow: "rgba(6,182,212,.30)",
  },

  purple: {
    name: "Purple",
    accent: "#7c3aed",
    second: "#a855f7",
    glow: "rgba(124,58,237,.30)",
  },

  violet: {
    name: "Violet",
    accent: "#8b5cf6",
    second: "#c084fc",
    glow: "rgba(139,92,246,.30)",
  },

  pink: {
    name: "Pink",
    accent: "#ec4899",
    second: "#f472b6",
    glow: "rgba(236,72,153,.30)",
    premium: true,
  },

  rose: {
    name: "Rose",
    accent: "#f43f5e",
    second: "#fb7185",
    glow: "rgba(244,63,94,.30)",
  },

  red: {
    name: "Red",
    accent: "#ef4444",
    second: "#f97316",
    glow: "rgba(239,68,68,.30)",
  },

  orange: {
    name: "Orange",
    accent: "#f97316",
    second: "#fb923c",
    glow: "rgba(249,115,22,.30)",
  },

  gold: {
    name: "Gold",
    accent: "#eab308",
    second: "#facc15",
    glow: "rgba(234,179,8,.30)",
    premium: true,
  },

  yellow: {
    name: "Yellow",
    accent: "#facc15",
    second: "#fde047",
    glow: "rgba(250,204,21,.30)",
  },

  lime: {
    name: "Lime",
    accent: "#84cc16",
    second: "#a3e635",
    glow: "rgba(132,204,22,.30)",
  },

  green: {
    name: "Green",
    accent: "#22c55e",
    second: "#4ade80",
    glow: "rgba(34,197,94,.30)",
  },

  emerald: {
    name: "Emerald",
    accent: "#10b981",
    second: "#34d399",
    glow: "rgba(16,185,129,.30)",
  },

  teal: {
    name: "Teal",
    accent: "#14b8a6",
    second: "#2dd4bf",
    glow: "rgba(20,184,166,.30)",
  },

  indigo: {
    name: "Indigo",
    accent: "#4f46e5",
    second: "#6366f1",
    glow: "rgba(79,70,229,.30)",
  },

  ice: {
    name: "Ice",
    accent: "#38bdf8",
    second: "#7dd3fc",
    glow: "rgba(56,189,248,.30)",
    premium: true,
  },

  crimson: {
    name: "Crimson",
    accent: "#dc2626",
    second: "#991b1b",
    glow: "rgba(220,38,38,.30)",
    premium: true,
  },

  black: {
    name: "Black",
    accent: "#64748b",
    second: "#334155",
    glow: "rgba(100,116,139,.20)",
  },

  white: {
    name: "White",
    accent: "#e2e8f0",
    second: "#94a3b8",
    glow: "rgba(226,232,240,.20)",
  },

  rainbow: {
    name: "Rainbow",
    accent: "#2563eb",
    second: "#06b6d4",
    glow: "rgba(37,99,235,.30)",
    premium: true,
  },
};

const rainbowColors: Array<[string, string, string]> = [
  ["#2563eb", "#06b6d4", "rgba(37,99,235,.30)"],
  ["#7c3aed", "#a855f7", "rgba(124,58,237,.30)"],
  ["#ec4899", "#f43f5e", "rgba(236,72,153,.30)"],
  ["#ef4444", "#f97316", "rgba(239,68,68,.30)"],
  ["#eab308", "#facc15", "rgba(234,179,8,.30)"],
  ["#22c55e", "#10b981", "rgba(34,197,94,.30)"],
  ["#14b8a6", "#22d3ee", "rgba(20,184,166,.30)"],
];

type ThemeContextType = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themes: Record<ThemeName, ThemeConfig>;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

function applyTheme(
  element: HTMLElement,
  accent: string,
  second: string,
  glow: string
) {
  /*
    ألوان Tailwind الأساسية التي يستخدمها الموقع.
    نغيّرها هنا بدل ملاحقة كل class في globals.css.
  */

  element.style.setProperty("--miftah-accent", accent);
  element.style.setProperty("--miftah-second", second);
  element.style.setProperty("--miftah-glow", glow);

  /* Blue */
  element.style.setProperty("--color-blue-400", second);
  element.style.setProperty("--color-blue-500", accent);
  element.style.setProperty("--color-blue-600", accent);
  element.style.setProperty("--color-blue-700", accent);

  /* Cyan */
  element.style.setProperty("--color-cyan-400", second);
  element.style.setProperty("--color-cyan-500", second);
  element.style.setProperty("--color-cyan-600", accent);

  /* Purple */
  element.style.setProperty("--color-purple-400", second);
  element.style.setProperty("--color-purple-500", second);
  element.style.setProperty("--color-purple-600", accent);
  element.style.setProperty("--color-purple-700", accent);

  /*
    Glow
  */
  element.style.setProperty(
    "--miftah-shadow",
    `0 0 45px ${glow}`
  );
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] =
    useState<ThemeName>("blue");

  useEffect(() => {
    const saved = localStorage.getItem(
      "miftah-theme"
    );

    if (
      saved &&
      Object.prototype.hasOwnProperty.call(
        themes,
        saved
      )
    ) {
      setThemeState(saved as ThemeName);
    }
  }, []);

  function setTheme(nextTheme: ThemeName) {
    setThemeState(nextTheme);

    localStorage.setItem(
      "miftah-theme",
      nextTheme
    );
  }

  useEffect(() => {
    const page = document.querySelector(
      ".miftah-theme-page"
    ) as HTMLElement | null;

    if (!page) return;

    page.dataset.miftahTheme = theme;

    if (theme !== "rainbow") {
      const config = themes[theme];

      applyTheme(
        page,
        config.accent,
        config.second,
        config.glow
      );

      return;
    }

    let index = 0;

function changeRainbow() {
  const element = document.querySelector(
    ".miftah-theme-page"
  ) as HTMLElement | null;

  if (!element) return;

  const [accent, second, glow] =
    rainbowColors[index];

  applyTheme(
    element,
    accent,
    second,
    glow
  );

  index =
    (index + 1) %
    rainbowColors.length;
}
    changeRainbow();

    const timer = window.setInterval(
      changeRainbow,
      1600
    );

    return () => {
      window.clearInterval(timer);
    };
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      themes,
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}