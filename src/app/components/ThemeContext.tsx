import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

/* ═══════════════ Brand Color Presets ═══════════════ */
export interface BrandColorPreset {
  key: string;
  label: string;
  hue: number;        // HSL hue
  hex: string;        // display hex
  primary: string;    // light mode primary
  primaryDark: string; // dark mode primary
  ring: string;
  secondary: string;
  secondaryFg: string;
  accent: string;
  accentFg: string;
  // dark specifics
  darkSecondary: string;
  darkSecondaryFg: string;
  darkAccent: string;
  darkAccentFg: string;
  darkSidebar: string;
  darkMuted: string;
  darkBg: string;
  darkCard: string;
}

export const brandPresets: BrandColorPreset[] = [
  {
    key: "purple", label: "经典紫", hue: 264, hex: "#6c3ce0",
    primary: "#6c3ce0", primaryDark: "#8b5cf6", ring: "#6c3ce0",
    secondary: "#f0ebfa", secondaryFg: "#6c3ce0", accent: "#f0ebfa", accentFg: "#4a1fb8",
    darkSecondary: "#2a2545", darkSecondaryFg: "#a78bfa",
    darkAccent: "#2a2545", darkAccentFg: "#c4b5fd",
    darkSidebar: "#13132a", darkMuted: "#1e1e35", darkBg: "#0f0f1a", darkCard: "#1a1a2e",
  },
  {
    key: "blue", label: "海洋蓝", hue: 221, hex: "#3b82f6",
    primary: "#2563eb", primaryDark: "#60a5fa", ring: "#2563eb",
    secondary: "#eff6ff", secondaryFg: "#2563eb", accent: "#eff6ff", accentFg: "#1d4ed8",
    darkSecondary: "#1e2a45", darkSecondaryFg: "#93bbfd",
    darkAccent: "#1e2a45", darkAccentFg: "#bfdbfe",
    darkSidebar: "#0c1427", darkMuted: "#151e35", darkBg: "#0a1020", darkCard: "#121d33",
  },
  {
    key: "emerald", label: "翡翠绿", hue: 155, hex: "#10b981",
    primary: "#059669", primaryDark: "#34d399", ring: "#059669",
    secondary: "#ecfdf5", secondaryFg: "#059669", accent: "#ecfdf5", accentFg: "#047857",
    darkSecondary: "#1a2e28", darkSecondaryFg: "#6ee7b7",
    darkAccent: "#1a2e28", darkAccentFg: "#a7f3d0",
    darkSidebar: "#0a1f18", darkMuted: "#142520", darkBg: "#0a1610", darkCard: "#132420",
  },
  {
    key: "rose", label: "玫瑰红", hue: 350, hex: "#f43f5e",
    primary: "#e11d48", primaryDark: "#fb7185", ring: "#e11d48",
    secondary: "#fff1f2", secondaryFg: "#e11d48", accent: "#fff1f2", accentFg: "#be123c",
    darkSecondary: "#3a1a25", darkSecondaryFg: "#fda4af",
    darkAccent: "#3a1a25", darkAccentFg: "#fecdd3",
    darkSidebar: "#1f0a14", darkMuted: "#2a1520", darkBg: "#180a12", darkCard: "#251320",
  },
  {
    key: "amber", label: "琥珀橙", hue: 35, hex: "#f59e0b",
    primary: "#d97706", primaryDark: "#fbbf24", ring: "#d97706",
    secondary: "#fffbeb", secondaryFg: "#d97706", accent: "#fffbeb", accentFg: "#b45309",
    darkSecondary: "#302518", darkSecondaryFg: "#fcd34d",
    darkAccent: "#302518", darkAccentFg: "#fde68a",
    darkSidebar: "#1a150a", darkMuted: "#252015", darkBg: "#151008", darkCard: "#201a12",
  },
  {
    key: "cyan", label: "天青色", hue: 188, hex: "#06b6d4",
    primary: "#0891b2", primaryDark: "#22d3ee", ring: "#0891b2",
    secondary: "#ecfeff", secondaryFg: "#0891b2", accent: "#ecfeff", accentFg: "#0e7490",
    darkSecondary: "#162a30", darkSecondaryFg: "#67e8f9",
    darkAccent: "#162a30", darkAccentFg: "#a5f3fc",
    darkSidebar: "#0a1a20", darkMuted: "#122228", darkBg: "#081418", darkCard: "#101f28",
  },
  {
    key: "indigo", label: "靛青紫", hue: 239, hex: "#6366f1",
    primary: "#4f46e5", primaryDark: "#818cf8", ring: "#4f46e5",
    secondary: "#eef2ff", secondaryFg: "#4f46e5", accent: "#eef2ff", accentFg: "#4338ca",
    darkSecondary: "#1e1e45", darkSecondaryFg: "#a5b4fc",
    darkAccent: "#1e1e45", darkAccentFg: "#c7d2fe",
    darkSidebar: "#0e0e2a", darkMuted: "#1a1a38", darkBg: "#0c0c1f", darkCard: "#16163a",
  },
  {
    key: "pink", label: "少女粉", hue: 330, hex: "#ec4899",
    primary: "#db2777", primaryDark: "#f472b6", ring: "#db2777",
    secondary: "#fdf2f8", secondaryFg: "#db2777", accent: "#fdf2f8", accentFg: "#be185d",
    darkSecondary: "#351a30", darkSecondaryFg: "#f9a8d4",
    darkAccent: "#351a30", darkAccentFg: "#fbcfe8",
    darkSidebar: "#1f0a1a", darkMuted: "#281520", darkBg: "#1a0a15", darkCard: "#251020",
  },
];

/* ═══════════════ Helpers ═══════════════ */

/** Convert hex to HSL */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/** Convert HSL to hex */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Generate brand color overrides from a custom hex */
function generateFromCustomHex(hex: string): BrandColorPreset {
  const { h, s, l } = hexToHsl(hex);
  const lightPrimary = hslToHex(h, Math.min(s + 10, 100), Math.min(l, 45));
  const darkPrimary = hslToHex(h, Math.min(s, 90), Math.max(l, 65));
  return {
    key: "custom", label: "自定义", hue: h, hex,
    primary: lightPrimary, primaryDark: darkPrimary, ring: lightPrimary,
    secondary: hslToHex(h, Math.max(s - 30, 15), 96),
    secondaryFg: lightPrimary,
    accent: hslToHex(h, Math.max(s - 30, 15), 96),
    accentFg: hslToHex(h, Math.min(s + 5, 100), Math.min(l - 5, 40)),
    darkSecondary: hslToHex(h, 25, 16),
    darkSecondaryFg: hslToHex(h, 60, 75),
    darkAccent: hslToHex(h, 25, 16),
    darkAccentFg: hslToHex(h, 50, 85),
    darkSidebar: hslToHex(h, 30, 8),
    darkMuted: hslToHex(h, 20, 14),
    darkBg: hslToHex(h, 25, 6),
    darkCard: hslToHex(h, 22, 12),
  };
}

/* ═══════════════ Apply brand color CSS variables ═══════════════ */
function applyBrandColor(preset: BrandColorPreset) {
  const root = document.documentElement;
  // Light mode
  root.style.setProperty("--primary", preset.primary);
  root.style.setProperty("--primary-foreground", "#ffffff");
  root.style.setProperty("--ring", preset.ring);
  root.style.setProperty("--secondary", preset.secondary);
  root.style.setProperty("--secondary-foreground", preset.secondaryFg);
  root.style.setProperty("--accent", preset.accent);
  root.style.setProperty("--accent-foreground", preset.accentFg);

  // Also update dark mode styles via the .dark class
  // We'll do this by injecting a <style> tag
  let styleEl = document.getElementById("lifenix-brand-dark") as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "lifenix-brand-dark";
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `
    .dark {
      --primary: ${preset.primaryDark} !important;
      --ring: ${preset.primaryDark} !important;
      --secondary: ${preset.darkSecondary} !important;
      --secondary-foreground: ${preset.darkSecondaryFg} !important;
      --accent: ${preset.darkAccent} !important;
      --accent-foreground: ${preset.darkAccentFg} !important;
      --sidebar: ${preset.darkSidebar} !important;
      --sidebar-primary: ${preset.primaryDark} !important;
      --sidebar-ring: ${preset.primaryDark} !important;
      --muted: ${preset.darkMuted} !important;
      --background: ${preset.darkBg} !important;
      --card: ${preset.darkCard} !important;
      --sidebar-accent: ${preset.darkMuted} !important;
    }
  `;
}

/* ═══════════════ Context ═══════════════ */
export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  resolvedDark: boolean;
  brandColor: string; // preset key or "custom"
  brandHex: string;
  setBrandColor: (key: string) => void;
  setCustomBrandHex: (hex: string) => void;
  brandPreset: BrandColorPreset;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeRaw] = useState<ThemeMode>(() => {
    try { return (localStorage.getItem("lifenix-theme") as ThemeMode) || "light"; }
    catch { return "light"; }
  });

  const [brandColor, setBrandColorRaw] = useState<string>(() => {
    try { return localStorage.getItem("lifenix-brand") || "purple"; }
    catch { return "purple"; }
  });

  const [customHex, setCustomHexRaw] = useState<string>(() => {
    try { return localStorage.getItem("lifenix-brand-hex") || "#6c3ce0"; }
    catch { return "#6c3ce0"; }
  });

  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Listen to system theme changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const resolvedDark = mode === "dark" || (mode === "system" && systemDark);

  // Apply dark class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedDark);
  }, [resolvedDark]);

  // Resolve brand preset
  const brandPreset: BrandColorPreset = brandColor === "custom"
    ? generateFromCustomHex(customHex)
    : brandPresets.find((p) => p.key === brandColor) || brandPresets[0];

  // Apply brand color
  useEffect(() => {
    applyBrandColor(brandPreset);
  }, [brandPreset]);

  const setMode = useCallback((m: ThemeMode) => {
    setModeRaw(m);
    localStorage.setItem("lifenix-theme", m);
  }, []);

  const setBrandColor = useCallback((key: string) => {
    setBrandColorRaw(key);
    localStorage.setItem("lifenix-brand", key);
  }, []);

  const setCustomBrandHex = useCallback((hex: string) => {
    setCustomHexRaw(hex);
    setBrandColorRaw("custom");
    localStorage.setItem("lifenix-brand-hex", hex);
    localStorage.setItem("lifenix-brand", "custom");
  }, []);

  return (
    <ThemeContext.Provider value={{
      mode, setMode, resolvedDark,
      brandColor, brandHex: brandColor === "custom" ? customHex : brandPreset.hex,
      setBrandColor, setCustomBrandHex, brandPreset,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}
