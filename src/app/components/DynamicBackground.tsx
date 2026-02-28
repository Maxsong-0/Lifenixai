import { useState, useEffect, useMemo } from "react";
import { useTheme, hexToHsl, hslToHex } from "./ThemeContext";

interface DynamicBackgroundProps {
  variant?: "landing" | "page" | "dashboard";
}

export function DynamicBackground({ variant = "page" }: DynamicBackgroundProps) {
  const [isDark, setIsDark] = useState(false);
  const { brandPreset } = useTheme();

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Derive gradient colors from the current brand color
  const gradients = useMemo(() => {
    const hex = isDark ? brandPreset.primaryDark : brandPreset.primary;
    const { h, s } = hexToHsl(hex);

    // Generate a complementary accent hue (shifted by ~40 degrees)
    const accentH = (h + 40) % 360;

    if (isDark) {
      const c1 = hslToHex(h, Math.min(s, 70), 60); // primary glow
      const c2 = hslToHex(accentH, Math.min(s, 60), 55); // accent glow

      const map: Record<string, string> = {
        landing:
          `radial-gradient(ellipse at 20% 0%, ${hexAlpha(c1, 0.15)} 0%, transparent 50%), ` +
          `radial-gradient(ellipse at 80% 20%, ${hexAlpha(c2, 0.08)} 0%, transparent 45%), ` +
          `radial-gradient(ellipse at 50% 80%, ${hexAlpha(c1, 0.06)} 0%, transparent 50%), ` +
          `linear-gradient(180deg, var(--background) 0%, ${brandPreset.darkBg} 100%)`,
        page:
          `radial-gradient(ellipse at 30% 0%, ${hexAlpha(c1, 0.1)} 0%, transparent 50%), ` +
          `radial-gradient(ellipse at 80% 60%, ${hexAlpha(c1, 0.06)} 0%, transparent 45%), ` +
          `linear-gradient(180deg, var(--background) 0%, ${brandPreset.darkBg} 100%)`,
        dashboard:
          `radial-gradient(ellipse at 15% 0%, ${hexAlpha(c1, 0.08)} 0%, transparent 50%), ` +
          `radial-gradient(ellipse at 85% 100%, ${hexAlpha(c1, 0.05)} 0%, transparent 50%), ` +
          `linear-gradient(180deg, var(--background) 0%, ${brandPreset.darkBg} 100%)`,
      };
      return map;
    } else {
      const c1 = hslToHex(h, Math.min(s + 10, 100), 50); // primary
      const c2 = hslToHex(accentH, Math.min(s, 80), 55); // accent
      const bgTint = hslToHex(h, 20, 98); // very light tint

      const map: Record<string, string> = {
        landing:
          `radial-gradient(ellipse at 20% 0%, ${hexAlpha(c1, 0.12)} 0%, transparent 50%), ` +
          `radial-gradient(ellipse at 80% 20%, ${hexAlpha(c2, 0.08)} 0%, transparent 45%), ` +
          `radial-gradient(ellipse at 50% 80%, ${hexAlpha(c1, 0.06)} 0%, transparent 50%), ` +
          `linear-gradient(180deg, #fafafe 0%, ${bgTint} 100%)`,
        page:
          `radial-gradient(ellipse at 30% 0%, ${hexAlpha(c1, 0.08)} 0%, transparent 50%), ` +
          `radial-gradient(ellipse at 80% 60%, ${hexAlpha(c1, 0.05)} 0%, transparent 45%), ` +
          `linear-gradient(180deg, #fafafe 0%, ${bgTint} 100%)`,
        dashboard:
          `radial-gradient(ellipse at 15% 0%, ${hexAlpha(c1, 0.06)} 0%, transparent 50%), ` +
          `radial-gradient(ellipse at 85% 100%, ${hexAlpha(c1, 0.04)} 0%, transparent 50%), ` +
          `linear-gradient(180deg, #fafafe 0%, ${bgTint} 100%)`,
      };
      return map;
    }
  }, [isDark, brandPreset]);

  return (
    <div
      className="pointer-events-none fixed inset-0 transition-all duration-500"
      style={{ zIndex: 0, background: gradients[variant] }}
    />
  );
}

/** Convert hex + alpha to rgba string */
function hexAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
