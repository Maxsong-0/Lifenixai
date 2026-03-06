import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useLanguage } from "./LanguageContext";
import {
  Target,
  Play,
  Trophy,
  Flame,
  Clock,
  TrendingUp,
  Calendar,
  Star,
  Sprout,
  TreePine,
  Flower2,
  ChevronRight,
  BarChart3,
  Zap,
} from "lucide-react";

/* ── Types ── */
interface FocusSession {
  id: string;
  type: "study" | "work";
  task: string;
  duration: number;
  microTasksTotal: number;
  microTasksDone: number;
  distractions: number;
  date: Date;
  rating: number;
}

const STORAGE_KEY = "lifenix_focus_sessions";
const TREE_STORAGE_KEY = "lifenix_focus_tree";

function loadSessions(): FocusSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((s: any) => ({ ...s, date: new Date(s.date) }));
  } catch {
    return [];
  }
}

function loadTreeLevel(): number {
  try {
    return parseInt(localStorage.getItem(TREE_STORAGE_KEY) || "0") || 0;
  } catch {
    return 0;
  }
}

function formatDuration(seconds: number, isEn: boolean): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (isEn) {
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }
  if (h > 0) return `${h}h${m}m`;
  return `${m}m`;
}

function formatShortDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  if (m >= 60) return `${Math.floor(m / 60)}h${m % 60}m`;
  return `${m}m`;
}

/* ── Mini Growth Tree ── */
function MiniGrowthTree({ level, t }: { level: number; t: (key: string) => string }) {
  const stages = [
    { icon: Sprout, labelKey: "tree.seed", color: "text-green-600/40" },
    { icon: Sprout, labelKey: "tree.sprout", color: "text-green-500/60" },
    { icon: Sprout, labelKey: "tree.seedling", color: "text-green-500" },
    { icon: TreePine, labelKey: "tree.sapling", color: "text-green-500/60" },
    { icon: TreePine, labelKey: "tree.young", color: "text-green-500/80" },
    { icon: TreePine, labelKey: "tree.small", color: "text-green-500" },
    { icon: TreePine, labelKey: "tree.big", color: "text-emerald-500" },
    { icon: Flower2, labelKey: "tree.bloom", color: "text-pink-500" },
    { icon: Flower2, labelKey: "tree.lush", color: "text-pink-400" },
    { icon: Star, labelKey: "tree.fruit", color: "text-amber-500" },
    { icon: Trophy, labelKey: "tree.harvest", color: "text-yellow-500" },
  ];
  const stage = stages[Math.min(level, stages.length - 1)];
  const Icon = stage.icon;

  return (
    <div className="flex items-center gap-2">
      <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
        <Icon className={`h-8 w-8 ${stage.color}`} />
      </motion.div>
      <div>
        <div className="text-[0.75rem]" style={{ fontWeight: 600 }}>{t(stage.labelKey)}</div>
        <div className="flex gap-0.5 mt-0.5">
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={i} className={`h-1 w-1 rounded-full ${i <= level ? "bg-emerald-400" : "bg-muted"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Trend Chart (simple bar chart) ── */
function TrendChart({ sessions, t, dateLocale }: { sessions: FocusSession[]; t: (key: string) => string; dateLocale: string }) {
  // Get last 7 days data
  const chartData = useMemo(() => {
    const days: { label: string; minutes: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString(dateLocale, { weekday: "short" });
      const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
      const daySessions = sessions.filter((s) => {
        const sd = new Date(s.date);
        return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth() && sd.getDate() === d.getDate();
      });
      const totalMinutes = daySessions.reduce((sum, s) => sum + Math.floor(s.duration / 60), 0);
      days.push({ label: i === 0 ? t("focusPanel.today") : dayStr, minutes: totalMinutes, count: daySessions.length });
    }
    return days;
  }, [sessions, t, dateLocale]);

  const maxMinutes = Math.max(...chartData.map((d) => d.minutes), 30);

  return (
    <div className="flex items-end gap-1.5 sm:gap-2 h-32">
      {chartData.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="relative flex-1 w-full flex items-end justify-center">
            {d.minutes > 0 && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max((d.minutes / maxMinutes) * 100, 4)}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="w-full max-w-8 rounded-t-md bg-gradient-to-t from-primary/80 to-primary/40 relative group cursor-default"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-foreground text-background text-[0.5625rem] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                  {t("focusPanel.nMinutes").replace("{n}", String(d.minutes))}
                </div>
              </motion.div>
            )}
            {d.minutes === 0 && (
              <div className="w-full max-w-8 h-1 rounded-full bg-muted" />
            )}
          </div>
          <span className="text-[0.5625rem] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Main FocusPanel ── */
export function FocusPanel() {
  const navigate = useNavigate();
  const { t, locale, dateLocale } = useLanguage();
  const isEn = locale === "en-US";
  const [sessions] = useState<FocusSession[]>(loadSessions);
  const [treeLevel] = useState(loadTreeLevel);
  const [historyFilter, setHistoryFilter] = useState<"all" | "study" | "work">("all");

  const filteredSessions = useMemo(() => {
    if (historyFilter === "all") return sessions;
    return sessions.filter((s) => s.type === historyFilter);
  }, [sessions, historyFilter]);

  const totalFocusMinutes = useMemo(() => {
    return Math.floor(sessions.reduce((sum, s) => sum + s.duration, 0) / 60);
  }, [sessions]);

  const totalSessions = sessions.length;

  const avgRating = useMemo(() => {
    const rated = sessions.filter((s) => s.rating > 0);
    if (rated.length === 0) return 0;
    return (rated.reduce((sum, s) => sum + s.rating, 0) / rated.length).toFixed(1);
  }, [sessions]);

  const currentStreak = useMemo(() => {
    if (sessions.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const has = sessions.some((s) => {
        const sd = new Date(s.date);
        return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth() && sd.getDate() === d.getDate();
      });
      if (has) streak++;
      else if (i > 0) break; // Allow today to be missing
    }
    return streak;
  }, [sessions]);

  const gradeFor = (duration: number) => {
    if (duration >= 45 * 60) return { label: "S", color: "bg-gradient-to-br from-amber-400 to-yellow-500" };
    if (duration >= 25 * 60) return { label: "A", color: "bg-gradient-to-br from-violet-400 to-purple-500" };
    if (duration >= 15 * 60) return { label: "B", color: "bg-gradient-to-br from-blue-400 to-cyan-500" };
    return { label: "C", color: "bg-gradient-to-br from-gray-400 to-gray-500" };
  };

  return (
    <div className="space-y-6">
      {/* ═══════ Top: Start Focus CTA ═══════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 sm:p-8 text-white"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-[1.25rem] sm:text-[1.5rem]" style={{ fontWeight: 700 }}>{t("focusPanel.title")}</h2>
                <p className="text-[0.8125rem] text-white/60">{t("focusPanel.subtitle")}</p>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4">
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                <Flame className="h-3.5 w-3.5 text-orange-300" />
                <span className="text-[0.75rem]" style={{ fontWeight: 500 }}>{t("focusPanel.streak").replace("{n}", String(currentStreak))}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                <Clock className="h-3.5 w-3.5 text-cyan-300" />
                <span className="text-[0.75rem]" style={{ fontWeight: 500 }}>{t("focusPanel.totalMinutes").replace("{n}", String(totalFocusMinutes))}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                <MiniGrowthTree level={treeLevel} t={t} />
              </div>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={() => navigate("/focus")}
              className="h-14 px-8 rounded-2xl bg-white text-violet-700 hover:bg-white/90 shadow-lg shadow-black/10 text-[1rem]"
              style={{ fontWeight: 700 }}
            >
              <Play className="h-5 w-5 mr-2" />
              {t("focusPanel.startFocus")}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* ═══════ Stats Cards ═══════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t("focusPanel.totalSessions"), value: totalSessions, icon: Target, color: "text-primary", bg: "bg-primary/10" },
          { label: t("focusPanel.totalDuration"), value: totalFocusMinutes, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
          { label: t("focusPanel.streakDays"), value: currentStreak, icon: Flame, color: "text-orange-600", bg: "bg-orange-50" },
          { label: t("focusPanel.avgRating"), value: avgRating || "-", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
            className={`rounded-xl ${s.bg} p-3 sm:p-4`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <s.icon className={`h-4 w-4 ${s.color}`} />
              <span className="text-[0.6875rem] text-muted-foreground">{s.label}</span>
            </div>
            <div className={`text-[1.5rem] ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* ═══════ Bottom: Trend + History ═══════ */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-[0.875rem]" style={{ fontWeight: 600 }}>{t("focusPanel.trend")}</h3>
                <p className="text-[0.6875rem] text-muted-foreground">{t("focusPanel.last7Days")}</p>
              </div>
            </div>
            <Badge className="bg-primary/10 text-primary border-0 text-[0.625rem]">
              <BarChart3 className="h-2.5 w-2.5 mr-1" />
              {t("focusPanel.weeklyReport")}
            </Badge>
          </div>

          {sessions.length > 0 ? (
            <TrendChart sessions={sessions} t={t} dateLocale={dateLocale} />
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground/20 mb-2" />
              <p className="text-[0.75rem] text-muted-foreground/50">{t("focusPanel.noData")}</p>
              <p className="text-[0.6875rem] text-muted-foreground/30">{t("focusPanel.startFirst")}</p>
            </div>
          )}

          {/* Weekly summary */}
          {sessions.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border/40">
              {(() => {
                const weekSessions = sessions.filter((s) => {
                  const d = new Date(s.date);
                  const now = new Date();
                  return now.getTime() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
                });
                const weekMinutes = Math.floor(weekSessions.reduce((sum, s) => sum + s.duration, 0) / 60);
                const weekAvg = weekSessions.length > 0 ? Math.floor(weekMinutes / 7) : 0;
                return [
                  { label: t("focusPanel.weekDuration"), value: t("focusPanel.nMinutes").replace("{n}", String(weekMinutes)) },
                  { label: t("focusPanel.weekCount"), value: t("focusPanel.nTimes").replace("{n}", String(weekSessions.length)) },
                  { label: t("focusPanel.dailyAvg"), value: t("focusPanel.nMinutes").replace("{n}", String(weekAvg)) },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="text-[0.875rem] text-foreground" style={{ fontWeight: 600 }}>{item.value}</div>
                    <div className="text-[0.5625rem] text-muted-foreground">{item.label}</div>
                  </div>
                ));
              })()}
            </div>
          )}
        </motion.div>

        {/* History List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <Calendar className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-[0.875rem]" style={{ fontWeight: 600 }}>{t("focusPanel.history")}</h3>
                <p className="text-[0.6875rem] text-muted-foreground">{t("focusPanel.totalNSessions").replace("{n}", String(sessions.length))}</p>
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-0.5">
              {([
                { key: "all" as const, label: t("focusPanel.filterAll") },
                { key: "study" as const, label: t("focusPanel.filterStudy") },
                { key: "work" as const, label: t("focusPanel.filterWork") },
              ]).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setHistoryFilter(f.key)}
                  className={`rounded-md px-2.5 py-1 text-[0.625rem] transition-all ${
                    historyFilter === f.key
                      ? "bg-white shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={{ fontWeight: historyFilter === f.key ? 600 : 400 }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredSessions.length > 0 ? (
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {filteredSessions.slice(0, 20).map((session) => {
                const grade = gradeFor(session.duration);
                return (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 rounded-xl bg-muted/30 hover:bg-muted/50 p-3 transition-colors"
                  >
                    {/* Grade badge */}
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${grade.color} text-white text-[0.75rem] shadow-sm`} style={{ fontWeight: 700 }}>
                      {grade.label}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[0.8125rem] truncate" style={{ fontWeight: 500 }}>{session.task}</span>
                        <Badge className={`shrink-0 border-0 text-[0.5rem] px-1.5 py-0 ${
                          session.type === "study" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {session.type === "study" ? t("focusPanel.study") : t("focusPanel.work")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[0.6875rem] text-muted-foreground">
                        <span>{new Date(session.date).toLocaleDateString(dateLocale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        <span className="text-muted-foreground/30">·</span>
                        <span>{formatDuration(session.duration, isEn)}</span>
                        {session.rating > 0 && (
                          <>
                            <span className="text-muted-foreground/30">·</span>
                            <span className="flex items-center gap-0.5">
                              <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                              {session.rating}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="text-right shrink-0">
                      <div className="text-[0.8125rem] text-primary" style={{ fontWeight: 600 }}>
                        {formatShortDuration(session.duration)}
                      </div>
                      <div className="text-[0.5625rem] text-muted-foreground">
                        {session.microTasksDone}/{session.microTasksTotal} {isEn ? "tasks" : "tasks"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-3">
                <Target className="h-6 w-6 text-muted-foreground/20" />
              </div>
              <p className="text-[0.8125rem] text-muted-foreground/50" style={{ fontWeight: 500 }}>{t("focusPanel.noRecords")}</p>
              <p className="text-[0.6875rem] text-muted-foreground/30 mt-1">{t("focusPanel.noRecordsHint")}</p>
              <Button
                onClick={() => navigate("/focus")}
                className="mt-4 rounded-xl bg-primary text-white text-[0.8125rem]"
              >
                <Play className="h-3.5 w-3.5 mr-1.5" />
                {t("focusPanel.startNow")}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}