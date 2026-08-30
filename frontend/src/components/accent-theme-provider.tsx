"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type AccentColor = "blue" | "cyan" | "indigo" | "emerald" | "violet" | "amber" | "coral";

export interface AccentOption {
  id: AccentColor;
  name: string;
  hex: string;
  hoverHex: string;
  glowRgba: string;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  {
    id: "blue",
    name: "Electric Blue (Default)",
    hex: "#3B82F6",
    hoverHex: "#2563EB",
    glowRgba: "rgba(59, 130, 246, 0.25)",
  },
  {
    id: "cyan",
    name: "Cyan Sky",
    hex: "#0EA5E9",
    hoverHex: "#0284C7",
    glowRgba: "rgba(14, 165, 233, 0.25)",
  },
  {
    id: "indigo",
    name: "Cyber Indigo",
    hex: "#6366F1",
    hoverHex: "#4F46E5",
    glowRgba: "rgba(99, 102, 241, 0.25)",
  },
  {
    id: "emerald",
    name: "Emerald Green",
    hex: "#10B981",
    hoverHex: "#059669",
    glowRgba: "rgba(16, 185, 129, 0.25)",
  },
  {
    id: "violet",
    name: "Violet Purple",
    hex: "#8B5CF6",
    hoverHex: "#7C3AED",
    glowRgba: "rgba(139, 92, 246, 0.25)",
  },
  {
    id: "amber",
    name: "Sunset Amber",
    hex: "#F59E0B",
    hoverHex: "#D97706",
    glowRgba: "rgba(245, 158, 11, 0.25)",
  },
  {
    id: "coral",
    name: "Crimson Coral",
    hex: "#E63946",
    hoverHex: "#D90429",
    glowRgba: "rgba(230, 57, 70, 0.25)",
  },
];

interface AccentThemeContextType {
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  accentOption: AccentOption;
  accents: AccentOption[];
}

const AccentThemeContext = createContext<AccentThemeContextType>({
  accent: "blue",
  setAccent: () => {},
  accentOption: ACCENT_OPTIONS[0],
  accents: ACCENT_OPTIONS,
});

export function AccentThemeProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<AccentColor>("blue");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("bidlens_theme_accent") as AccentColor;
    if (saved && ACCENT_OPTIONS.some((o) => o.id === saved)) {
      setAccentState(saved);
      applyAccent(saved);
    } else {
      applyAccent("blue");
    }
  }, []);

  const applyAccent = (colorId: AccentColor) => {
    const opt = ACCENT_OPTIONS.find((o) => o.id === colorId) || ACCENT_OPTIONS[0];
    const root = document.documentElement;
    root.style.setProperty("--primary", opt.hex);
    root.style.setProperty("--primary-hover", opt.hoverHex);
    root.style.setProperty("--ring", opt.hex);
    root.style.setProperty("--neon", opt.hex);
    root.style.setProperty("--neon-muted", opt.glowRgba);
    root.style.setProperty("--sidebar-primary", opt.hex);
    root.style.setProperty("--sidebar-ring", opt.hex);
  };

  const setAccent = (newAccent: AccentColor) => {
    setAccentState(newAccent);
    localStorage.setItem("bidlens_theme_accent", newAccent);
    applyAccent(newAccent);
  };

  const currentOption = ACCENT_OPTIONS.find((o) => o.id === accent) || ACCENT_OPTIONS[0];

  return (
    <AccentThemeContext.Provider
      value={{
        accent,
        setAccent,
        accentOption: currentOption,
        accents: ACCENT_OPTIONS,
      }}
    >
      {children}
    </AccentThemeContext.Provider>
  );
}

export function useAccentTheme() {
  return useContext(AccentThemeContext);
}
