import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon, Monitor, Globe, Check, Pipette, RotateCcw, Sparkles, Eye, ChevronDown, Languages } from "lucide-react";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { useTheme, brandPresets, hexToHsl, hslToHex, type ThemeMode } from "./ThemeContext";
import { useLanguage, localeOptions, type Locale } from "./LanguageContext";

/* ═══════════════ Mini theme preview ═══════════════ */
function ThemePreview({ mode }: { mode: "light" | "dark" }) {
  const isDark = mode === "dark";
  const bg = isDark ? "#0f0f1a" : "#fafafe";
  const card = isDark ? "#1a1a2e" : "#ffffff";
  const sidebar = isDark ? "#13132a" : "#f5f5f8";
  const text = isDark ? "#e8e6f0" : "#0f0f1a";
  const muted = isDark ? "#3a3a55" : "#e0dfe5";
  const primary = isDark ? "#8b5cf6" : "#6c3ce0";

  return (
    <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border" style={{ background: bg, borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
      <div className="flex h-full">
        <div className="w-[22%] h-full flex flex-col gap-1 p-1.5" style={{ background: sidebar }}>
          <div className="h-2 w-full rounded-sm" style={{ background: primary }} />
          <div className="h-1.5 w-[70%] rounded-sm mt-1" style={{ background: muted }} />
          <div className="h-1.5 w-[60%] rounded-sm" style={{ background: muted }} />
          <div className="h-1.5 w-[65%] rounded-sm" style={{ background: muted }} />
        </div>
        <div className="flex-1 p-2 flex flex-col gap-1.5">
          <div className="h-2 w-[40%] rounded-sm" style={{ background: text, opacity: 0.7 }} />
          <div className="flex gap-1.5 flex-1">
            <div className="flex-1 rounded-md p-1.5 flex flex-col gap-1" style={{ background: card }}>
              <div className="h-1.5 w-[80%] rounded-sm" style={{ background: text, opacity: 0.4 }} />
              <div className="h-1.5 w-[60%] rounded-sm" style={{ background: muted }} />
              <div className="h-1.5 w-[70%] rounded-sm" style={{ background: primary, opacity: 0.3 }} />
            </div>
            <div className="flex-1 rounded-md p-1.5 flex flex-col gap-1" style={{ background: card }}>
              <div className="h-1.5 w-[70%] rounded-sm" style={{ background: text, opacity: 0.4 }} />
              <div className="h-1.5 w-[55%] rounded-sm" style={{ background: muted }} />
              <div className="flex-1 rounded-sm mt-0.5" style={{ background: primary, opacity: 0.15 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ HSL Color Picker ═══════════════ */
function ColorPicker({
  hex,
  onChange,
  onClose,
}: {
  hex: string;
  onChange: (hex: string) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const { h, s, l } = hexToHsl(hex);
  const [hue, setHue] = useState(h);
  const [sat, setSat] = useState(s);
  const [lit, setLit] = useState(l);
  const [hexInput, setHexInput] = useState(hex);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);

  const currentHex = hslToHex(hue, sat, lit);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const satVal = (x / w) * 100;
        const litVal = 100 - (y / h) * 100;
        ctx.fillStyle = `hsl(${hue}, ${satVal}%, ${litVal}%)`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [hue]);

  const handleCanvasInteraction = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const newSat = Math.round(x * 100);
    const newLit = Math.round((1 - y) * 100);
    setSat(newSat);
    setLit(newLit);
    const newHex = hslToHex(hue, newSat, newLit);
    setHexInput(newHex);
    onChange(newHex);
  }, [hue, onChange]);

  const handleHueChange = (newHue: number) => {
    setHue(newHue);
    const newHex = hslToHex(newHue, sat, lit);
    setHexInput(newHex);
    onChange(newHex);
  };

  const handleHexSubmit = () => {
    const clean = hexInput.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(clean)) {
      const { h: nh, s: ns, l: nl } = hexToHsl(clean);
      setHue(nh); setSat(ns); setLit(nl);
      onChange(clean);
    }
  };

  const quickColors = [
    "#6c3ce0", "#8b5cf6", "#6366f1", "#3b82f6", "#06b6d4",
    "#10b981", "#22c55e", "#84cc16", "#eab308", "#f59e0b",
    "#f97316", "#ef4444", "#f43f5e", "#ec4899", "#d946ef",
    "#a855f7", "#7c3aed", "#4f46e5", "#0ea5e9", "#14b8a6",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-border/50 bg-card p-4 shadow-xl"
    >
      <div className="relative mb-3">
        <canvas
          ref={canvasRef}
          width={240}
          height={160}
          className="w-full h-40 rounded-xl cursor-crosshair"
          onMouseDown={(e) => { isDragging.current = true; handleCanvasInteraction(e); }}
          onMouseMove={(e) => { if (isDragging.current) handleCanvasInteraction(e); }}
          onMouseUp={() => { isDragging.current = false; }}
          onMouseLeave={() => { isDragging.current = false; }}
        />
        <div
          className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${sat}%`,
            top: `${100 - lit}%`,
            background: currentHex,
          }}
        />
      </div>

      <div className="mb-3">
        <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)" }}>
          <input
            type="range" min={0} max={360} value={hue}
            onChange={(e) => handleHueChange(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${(hue / 360) * 100}%`, background: `hsl(${hue}, 100%, 50%)` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-10 gap-1.5 mb-3">
        {quickColors.map((c) => (
          <button
            key={c}
            onClick={() => {
              const { h: nh, s: ns, l: nl } = hexToHsl(c);
              setHue(nh); setSat(ns); setLit(nl);
              setHexInput(c);
              onChange(c);
            }}
            className="w-full aspect-square rounded-md transition-transform hover:scale-110 ring-1 ring-black/5"
            style={{ background: c }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg border border-border/50 shrink-0" style={{ background: currentHex }} />
        <div className="flex-1 flex items-center gap-1.5">
          <Input
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            onBlur={handleHexSubmit}
            onKeyDown={(e) => e.key === "Enter" && handleHexSubmit()}
            className="rounded-lg text-[0.8125rem] h-9 font-mono"
            placeholder="#000000"
          />
          <button
            onClick={onClose}
            className="h-9 px-3 rounded-lg bg-primary text-white text-[0.8125rem] hover:bg-primary/90 transition-colors shrink-0"
            style={{ fontWeight: 500 }}
          >
            {t("common.confirm")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════ Language Selector Dropdown ═══════════════ */
function LanguageSelector() {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const currentLocale = localeOptions.find((o) => o.code === locale) || localeOptions[0];

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 transition-all ${
          open
            ? "border-primary/50 bg-primary/5 shadow-sm shadow-primary/10"
            : "border-border/30 hover:border-border/60 hover:bg-muted/20"
        }`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50">
          <Languages className={`h-5 w-5 ${open ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[1.25rem]">{currentLocale.flag}</span>
            <span className="text-[0.875rem]" style={{ fontWeight: 500 }}>{currentLocale.label}</span>
          </div>
          <div className="text-[0.6875rem] text-muted-foreground mt-0.5">
            {currentLocale.english}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border/50 bg-card shadow-lg"
          >
            {localeOptions.map((option) => {
              const isActive = locale === option.code;
              return (
                <button
                  key={option.code}
                  onClick={() => {
                    setLocale(option.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 transition-colors ${
                    isActive
                      ? "bg-primary/8 text-foreground"
                      : "hover:bg-muted/40 text-foreground"
                  }`}
                >
                  <span className="text-[1.375rem]">{option.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="text-[0.875rem]" style={{ fontWeight: isActive ? 600 : 400 }}>
                      {option.label}
                    </div>
                    <div className="text-[0.6875rem] text-muted-foreground">{option.english}</div>
                  </div>
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-primary"
                    >
                      <Check className="h-3 w-3 text-white" />
                    </motion.div>
                  )}
                </button>
              );
            })}
            {/* Hint */}
            <div className="border-t border-border/30 px-4 py-2.5 bg-muted/20">
              <p className="text-[0.6875rem] text-muted-foreground flex items-center gap-1.5">
                <Globe className="h-3 w-3 shrink-0" />
                {t("settings.appearance.langChangeHint")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════ Main Appearance Settings ═══════════════ */
export function AppearanceSettings() {
  const {
    mode, setMode,
    brandColor, brandHex, setBrandColor, setCustomBrandHex,
  } = useTheme();
  const { t } = useLanguage();

  const [showPicker, setShowPicker] = useState(false);
  const [animEnabled, setAnimEnabled] = useState(() => {
    try { return localStorage.getItem("lifenix-anim") !== "false"; }
    catch { return true; }
  });
  const [compactMode, setCompactMode] = useState(() => {
    try { return localStorage.getItem("lifenix-compact") === "true"; }
    catch { return false; }
  });

  const themeModes: { key: ThemeMode; label: string; icon: typeof Sun; desc: string }[] = [
    { key: "light", label: t("settings.appearance.light"), icon: Sun, desc: t("settings.appearance.lightDesc") },
    { key: "dark", label: t("settings.appearance.dark"), icon: Moon, desc: t("settings.appearance.darkDesc") },
    { key: "system", label: t("settings.appearance.system"), icon: Monitor, desc: t("settings.appearance.systemDesc") },
  ];

  /* Brand preset labels from i18n */
  const brandLabel = (key: string) => t(`brand.${key}`, key);

  return (
    <motion.div
      key="appearance"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <h2 className="text-[1.25rem] mb-1" style={{ fontWeight: 600 }}>{t("settings.appearance.title")}</h2>
      <p className="text-[0.875rem] text-muted-foreground mb-8">{t("settings.appearance.subtitle")}</p>

      <div className="space-y-8 max-w-2xl">
        {/* ────── Theme Mode ────── */}
        <div>
          <h3 className="text-[0.9375rem] mb-1" style={{ fontWeight: 600 }}>{t("settings.appearance.themeMode")}</h3>
          <p className="text-[0.75rem] text-muted-foreground mb-4">{t("settings.appearance.themeModeDesc")}</p>
          <div className="grid grid-cols-3 gap-3">
            {themeModes.map((tm) => {
              const isActive = mode === tm.key;
              return (
                <button
                  key={tm.key}
                  onClick={() => setMode(tm.key)}
                  className={`group relative flex flex-col items-center rounded-2xl border-2 p-3 transition-all ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                      : "border-border/30 hover:border-border/60 hover:bg-muted/30"
                  }`}
                >
                  <div className="w-full mb-3">
                    {tm.key === "system" ? (
                      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden flex">
                        <div className="w-1/2 overflow-hidden"><ThemePreview mode="light" /></div>
                        <div className="w-1/2 overflow-hidden"><ThemePreview mode="dark" /></div>
                      </div>
                    ) : (
                      <ThemePreview mode={tm.key as "light" | "dark"} />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <tm.icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-[0.8125rem]" style={{ fontWeight: isActive ? 600 : 400 }}>
                      {tm.label}
                    </span>
                  </div>
                  <span className="text-[0.6875rem] text-muted-foreground mt-0.5">{tm.desc}</span>
                  {isActive && (
                    <motion.div
                      layoutId="theme-check"
                      className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary"
                    >
                      <Check className="h-3 w-3 text-white" />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ────── Brand Color ────── */}
        <div className="border-t border-border/30 pt-8">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-[0.9375rem]" style={{ fontWeight: 600 }}>{t("settings.appearance.brandColor")}</h3>
            {brandColor !== "purple" && (
              <button
                onClick={() => { setBrandColor("purple"); setShowPicker(false); }}
                className="flex items-center gap-1 text-[0.75rem] text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                {t("settings.appearance.resetDefault")}
              </button>
            )}
          </div>
          <p className="text-[0.75rem] text-muted-foreground mb-4">{t("settings.appearance.brandColorDesc")}</p>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 mb-4">
            {brandPresets.map((preset) => {
              const isActive = brandColor === preset.key;
              return (
                <button
                  key={preset.key}
                  onClick={() => { setBrandColor(preset.key); setShowPicker(false); }}
                  className="group flex flex-col items-center gap-1.5"
                >
                  <div
                    className={`relative h-10 w-10 rounded-xl transition-all ${
                      isActive
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 shadow-lg"
                        : "hover:scale-105 hover:shadow-md ring-1 ring-black/5"
                    }`}
                    style={{ background: preset.hex }}
                  >
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Check className="h-4 w-4 text-white drop-shadow-sm" />
                      </motion.div>
                    )}
                  </div>
                  <span className={`text-[0.625rem] ${isActive ? "text-primary" : "text-muted-foreground"}`} style={{ fontWeight: isActive ? 600 : 400 }}>
                    {brandLabel(preset.key)}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setShowPicker(!showPicker)}
              className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 transition-all w-full ${
                brandColor === "custom"
                  ? "border-primary/50 bg-primary/5"
                  : "border-border/30 hover:border-border/60"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
                <Pipette className={`h-4 w-4 ${brandColor === "custom" ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-[0.8125rem]" style={{ fontWeight: 500 }}>{t("settings.appearance.customColor")}</div>
                <div className="text-[0.6875rem] text-muted-foreground">{t("settings.appearance.customColorDesc")}</div>
              </div>
              {brandColor === "custom" && (
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md ring-1 ring-black/10" style={{ background: brandHex }} />
                  <span className="text-[0.75rem] text-muted-foreground font-mono">{brandHex}</span>
                </div>
              )}
            </button>

            <AnimatePresence>
              {showPicker && (
                <ColorPicker
                  hex={brandColor === "custom" ? brandHex : brandPresets.find(p => p.key === brandColor)?.hex || "#6c3ce0"}
                  onChange={setCustomBrandHex}
                  onClose={() => setShowPicker(false)}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 rounded-xl border border-border/30 p-4 bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-[0.8125rem]" style={{ fontWeight: 500 }}>{t("settings.appearance.livePreview")}</span>
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="rounded-lg bg-primary px-4 py-2 text-white text-[0.8125rem]" style={{ fontWeight: 500 }}>
                {t("settings.appearance.primaryBtn")}
              </div>
              <div className="rounded-lg bg-primary/10 text-primary px-4 py-2 text-[0.8125rem]" style={{ fontWeight: 500 }}>
                {t("settings.appearance.secondaryBtn")}
              </div>
              <div className="rounded-lg border border-primary/30 px-4 py-2 text-primary text-[0.8125rem]" style={{ fontWeight: 500 }}>
                {t("settings.appearance.outlineBtn")}
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-[0.8125rem] text-secondary-foreground" style={{ fontWeight: 500 }}>{t("settings.appearance.tag")}</span>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: "65%" }} />
            </div>
          </div>
        </div>

        {/* ────── Language ────── */}
        <div className="border-t border-border/30 pt-8">
          <h3 className="text-[0.9375rem] mb-1" style={{ fontWeight: 600 }}>{t("settings.appearance.language")}</h3>
          <p className="text-[0.75rem] text-muted-foreground mb-4">{t("settings.appearance.languageDesc")}</p>
          <LanguageSelector />
        </div>

        {/* ────── Other Settings ────── */}
        <div className="border-t border-border/30 pt-8">
          <h3 className="text-[0.9375rem] mb-1" style={{ fontWeight: 600 }}>{t("settings.appearance.displayPrefs")}</h3>
          <p className="text-[0.75rem] text-muted-foreground mb-4">{t("settings.appearance.displayPrefsDesc")}</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-[0.8125rem]" style={{ fontWeight: 500 }}>{t("settings.appearance.animation")}</div>
                  <div className="text-[0.6875rem] text-muted-foreground">{t("settings.appearance.animationDesc")}</div>
                </div>
              </div>
              <Switch
                checked={animEnabled}
                onCheckedChange={(v) => {
                  setAnimEnabled(v);
                  localStorage.setItem("lifenix-anim", String(v));
                }}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-[0.8125rem]" style={{ fontWeight: 500 }}>{t("settings.appearance.compact")}</div>
                  <div className="text-[0.6875rem] text-muted-foreground">{t("settings.appearance.compactDesc")}</div>
                </div>
              </div>
              <Switch
                checked={compactMode}
                onCheckedChange={(v) => {
                  setCompactMode(v);
                  localStorage.setItem("lifenix-compact", String(v));
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
