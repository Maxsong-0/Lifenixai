import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { format, isSameDay, isToday } from "date-fns";
import { zhCN, enUS as enUSDateFns } from "date-fns/locale";
import { useLanguage } from "./LanguageContext";
import {
  Target,
  Link2,
  Check,
  AlertTriangle,
  Circle,
  Video,
  Repeat,
  Sparkles,
  MapPin,
  Clock,
  Zap,
  Eye,
  EyeOff,
  CalendarDays,
} from "lucide-react";

/* ═══════════════ Types (must match CalendarPage) ═══════════════ */
type Priority = "urgent" | "high" | "medium" | "low";
type Status = "todo" | "in_progress" | "done" | "blocked";

interface ScheduleEvent {
  id: string;
  title: string;
  date: Date;
  startHour: number;
  duration: number;
  color: string;
  priority: Priority;
  status: Status;
  category: string;
  tags: string[];
  location?: string;
  isRecurring?: boolean;
  hasMeeting?: boolean;
  subtasks?: { id: string; text: string; done: boolean }[];
  aiSuggested?: boolean;
  energyLevel?: "high" | "medium" | "low";
}

type TimelineZoom = "day" | "3day" | "week";

interface AddEventPreset {
  date: Date;
  startHour: number;
}

export interface TimelineViewV2Props {
  events: ScheduleEvent[];
  weekDays: Date[];
  onSelectEvent: (event: ScheduleEvent) => void;
  onToggleStatus: (id: string) => void;
  onDoubleClickSlot?: (preset: AddEventPreset) => void;
}

/* ═══════════════ Helpers ═══════════════ */
const mockDependencies: [string, string][] = [
  ["1", "3"],
  ["3", "4"],
  ["8", "10"],
];

function fmtTime(h: number) {
  return `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
}

/* Priority color band at card top */
const prioBarColors: Record<Priority, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-400",
  medium: "bg-blue-400",
  low: "bg-gray-300",
};

/* Soft bg tints for cards */
const prioBgTints: Record<Priority, string> = {
  urgent: "bg-red-50/80",
  high: "bg-orange-50/80",
  medium: "bg-blue-50/60",
  low: "bg-gray-50/60",
};

/* ═══════════════ Sub-components ═══════════════ */

/* Breathing pulse for Now marker */
function NowPulse() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute h-5 w-5 rounded-full bg-purple-500/30"
        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute h-3.5 w-3.5 rounded-full bg-purple-500/20"
        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />
      <div className="relative h-3 w-3 rounded-full bg-purple-500 border-2 border-white shadow-lg shadow-purple-500/40 z-10" />
    </div>
  );
}

/* A single floating event card */
function EventCard({
  event,
  side,
  index,
  isHovered,
  isSelected,
  onHover,
  onLeave,
  onClick,
  onToggleStatus,
  t,
  isEn,
  compact,
}: {
  event: ScheduleEvent;
  side: "left" | "right";
  index: number;
  isHovered: boolean;
  isSelected: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
  onToggleStatus: () => void;
  t: (k: string) => string;
  isEn: boolean;
  compact: boolean;
}) {
  const progress = useMemo(() => {
    if (!event.subtasks || event.subtasks.length === 0) {
      return event.status === "done" ? 100 : event.status === "in_progress" ? 40 : 0;
    }
    return Math.round((event.subtasks.filter((s) => s.done).length / event.subtasks.length) * 100);
  }, [event]);

  const isDone = event.status === "done";
  const isBlocked = event.status === "blocked";

  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -30 : 30 }}
      animate={{
        opacity: 1,
        x: 0,
        scale: isSelected ? 1.05 : isHovered ? 1.03 : 1,
      }}
      exit={{ opacity: 0, x: side === "left" ? -20 : 20 }}
      transition={{
        opacity: { duration: 0.4, delay: index * 0.06 },
        x: { duration: 0.4, delay: index * 0.06 },
        scale: { type: "spring", stiffness: 400, damping: 25 },
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
      className={`relative cursor-pointer rounded-xl border transition-all duration-200 overflow-hidden ${
        isDone ? "opacity-55" : ""
      } ${
        isSelected
          ? "border-purple-400 shadow-lg shadow-purple-500/15 ring-2 ring-purple-400/30"
          : isHovered
          ? "border-purple-300/60 shadow-md shadow-purple-500/10"
          : "border-border/40 shadow-sm"
      } ${
        event.aiSuggested && !isDone ? "ring-1 ring-purple-300/40" : ""
      }`}
      style={{ maxWidth: compact ? 200 : 280, width: "100%" }}
    >
      {/* Priority color band */}
      <div className={`h-[3px] w-full ${prioBarColors[event.priority]}`} />

      {/* AI sparkle border overlay */}
      {event.aiSuggested && !isDone && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(168,85,247,0.08) 0%, transparent 50%, rgba(168,85,247,0.08) 100%)",
          }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      {/* Blocked stripes */}
      {isBlocked && (
        <div
          className="absolute inset-0 rounded-xl opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(239,68,68,0.15) 4px, rgba(239,68,68,0.15) 8px)",
          }}
        />
      )}

      <div className={`relative p-3 ${prioBgTints[event.priority]} bg-white`}>
        {/* Top row: status + title */}
        <div className="flex items-start gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus();
            }}
            className="mt-0.5 shrink-0"
          >
            {isDone ? (
              <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-white" />
              </div>
            ) : isBlocked ? (
              <div className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-2.5 w-2.5 text-red-500" />
              </div>
            ) : (
              <Circle
                className={`h-4 w-4 ${
                  event.status === "in_progress" ? "text-blue-400" : "text-muted-foreground/30"
                } hover:text-primary transition-colors`}
              />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[0.8125rem] truncate ${isDone ? "line-through text-muted-foreground" : ""}`}
                style={{ fontWeight: 600 }}
              >
                {event.title}
              </span>
              {event.aiSuggested && <Sparkles className="h-3 w-3 text-purple-400 shrink-0" />}
            </div>

            {/* Time */}
            <div className="flex items-center gap-1.5 mt-1 text-[0.6875rem] text-muted-foreground">
              <Clock className="h-3 w-3 shrink-0" />
              <span>
                {fmtTime(event.startHour)} – {fmtTime(event.startHour + event.duration)}
              </span>
              <span className="text-muted-foreground/40">({event.duration}h)</span>
            </div>
          </div>
        </div>

        {/* Expanded info (shown on hover/select or when not compact) */}
        <AnimatePresence>
          {(!compact || isHovered || isSelected) && (
            <motion.div
              initial={compact ? { height: 0, opacity: 0 } : false}
              animate={{ height: "auto", opacity: 1 }}
              exit={compact ? { height: 0, opacity: 0 } : undefined}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-1.5 mt-1.5 text-[0.6875rem] text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}

              {/* Badges row */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {event.hasMeeting && (
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-indigo-50 px-1.5 py-0.5 text-[0.5625rem] text-indigo-600">
                    <Video className="h-2.5 w-2.5" /> {isEn ? "Meeting" : "会议"}
                  </span>
                )}
                {event.isRecurring && (
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-teal-50 px-1.5 py-0.5 text-[0.5625rem] text-teal-600">
                    <Repeat className="h-2.5 w-2.5" /> {isEn ? "Recurring" : "重复"}
                  </span>
                )}
                {event.energyLevel && (
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[0.5625rem] ${
                      event.energyLevel === "high"
                        ? "bg-red-50 text-red-500"
                        : event.energyLevel === "medium"
                        ? "bg-amber-50 text-amber-500"
                        : "bg-green-50 text-green-500"
                    }`}
                  >
                    <Zap className="h-2.5 w-2.5" />
                    {event.energyLevel === "high"
                      ? isEn ? "High" : "高"
                      : event.energyLevel === "medium"
                      ? isEn ? "Med" : "中"
                      : isEn ? "Low" : "低"}
                  </span>
                )}
              </div>

              {/* Tags */}
              {event.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {event.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-muted/50 px-1.5 py-0.5 text-[0.5625rem] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Progress bar */}
              {progress > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-purple-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    />
                  </div>
                  <span className="text-[0.5625rem] text-muted-foreground">{progress}%</span>
                </div>
              )}

              {/* Subtasks preview */}
              {event.subtasks && event.subtasks.length > 0 && (isHovered || isSelected) && (
                <div className="mt-2 space-y-0.5">
                  {event.subtasks.slice(0, 3).map((st) => (
                    <div key={st.id} className="flex items-center gap-1.5 text-[0.625rem]">
                      {st.done ? (
                        <Check className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="h-2.5 w-2.5 text-muted-foreground/30 shrink-0" />
                      )}
                      <span className={st.done ? "line-through text-muted-foreground/60" : "text-muted-foreground"}>
                        {st.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ═══════════════ Main Component ═══════════════ */
export function TimelineViewV2({
  events,
  weekDays,
  onSelectEvent,
  onToggleStatus,
  onDoubleClickSlot,
}: TimelineViewV2Props) {
  const { t, locale } = useLanguage();
  const isEn = locale === "en-US";
  const fnsLocale = isEn ? enUSDateFns : zhCN;

  const [zoom, setZoom] = useState<TimelineZoom>("day");
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);
  const [showDeps, setShowDeps] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(900);

  /* Track container width for responsive dependency arrows */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Visible days based on zoom */
  const visibleDays = useMemo(() => {
    if (zoom === "day") {
      const todayD = weekDays.find((d) => isToday(d));
      return todayD ? [todayD] : [weekDays[0]];
    }
    if (zoom === "3day") {
      const idx = weekDays.findIndex((d) => isToday(d));
      const start = Math.max(0, idx >= 0 ? idx : 0);
      return weekDays.slice(start, start + 3);
    }
    return weekDays;
  }, [zoom, weekDays]);

  /* Active day tab for multi-day views */
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  useEffect(() => {
    const todayIdx = visibleDays.findIndex((d) => isToday(d));
    setActiveDayIdx(todayIdx >= 0 ? todayIdx : 0);
  }, [visibleDays]);

  const activeDay = visibleDays[activeDayIdx] || visibleDays[0];

  /* Events for active day, sorted by time */
  const dayEvents = useMemo(
    () =>
      events
        .filter((e) => isSameDay(e.date, activeDay))
        .sort((a, b) => a.startHour - b.startHour),
    [events, activeDay]
  );

  /* Hour range — show 6am to 23pm, but adapt to events */
  const hourRange = useMemo(() => {
    let minH = 6;
    let maxH = 23;
    dayEvents.forEach((e) => {
      if (e.startHour < minH) minH = Math.floor(e.startHour);
      if (e.startHour + e.duration > maxH) maxH = Math.ceil(e.startHour + e.duration);
    });
    return { min: Math.max(0, minH), max: Math.min(24, maxH + 1) };
  }, [dayEvents]);

  const hours = useMemo(
    () => Array.from({ length: hourRange.max - hourRange.min }, (_, i) => hourRange.min + i),
    [hourRange]
  );

  /* Current time (updates every minute) */
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const nowFrac = now.getHours() + now.getMinutes() / 60;
  const isActiveToday = isToday(activeDay);

  /* Layout constants */
  const HOUR_HEIGHT = 120; // px per hour
  const SPINE_WIDTH = 60; // center spine column
  const totalHeight = hours.length * HOUR_HEIGHT;

  /* Now position */
  const nowY =
    isActiveToday && nowFrac >= hourRange.min && nowFrac <= hourRange.max
      ? (nowFrac - hourRange.min) * HOUR_HEIGHT
      : null;

  /* Auto scroll to now */
  useEffect(() => {
    if (nowY !== null && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: Math.max(0, nowY - 180), behavior: "smooth" });
      }, 200);
    }
  }, [nowY, activeDayIdx, zoom]);

  /* Busy hours set for spine glow */
  const busyHours = useMemo(() => {
    const set = new Set<number>();
    dayEvents.forEach((e) => {
      for (let h = Math.floor(e.startHour); h < Math.ceil(e.startHour + e.duration); h++) {
        set.add(h);
      }
    });
    return set;
  }, [dayEvents]);

  /* Energy overlay data (for visualization) */
  const energyData = useMemo(() => {
    // Generate an energy curve based on events
    return hours.map((h) => {
      const evtsInHour = dayEvents.filter(
        (e) => e.startHour <= h + 1 && e.startHour + e.duration > h
      );
      if (evtsInHour.length === 0) return 0.1;
      const maxEnergy = evtsInHour.reduce((max, e) => {
        const level = e.energyLevel === "high" ? 1 : e.energyLevel === "medium" ? 0.6 : 0.3;
        return Math.max(max, level);
      }, 0.2);
      return maxEnergy;
    });
  }, [hours, dayEvents]);

  /* Mini heatmap for bottom bar */
  const hourDensity = useMemo(() => {
    return Array.from({ length: 24 }, (_, h) => {
      return dayEvents.filter((e) => e.startHour <= h + 1 && e.startHour + e.duration > h).length;
    });
  }, [dayEvents]);

  const maxDensity = Math.max(...hourDensity, 1);

  /* Stats */
  const totalEvts = dayEvents.length;
  const doneEvts = dayEvents.filter((e) => e.status === "done").length;

  /* Dependencies that are visible */
  const visibleDeps = useMemo(() => {
    if (!showDeps) return [];
    return mockDependencies.filter(([fromId, toId]) => {
      return dayEvents.some((e) => e.id === fromId) && dayEvents.some((e) => e.id === toId);
    });
  }, [showDeps, dayEvents]);

  /* Get Y position for an event */
  const getEventY = useCallback(
    (event: ScheduleEvent) => {
      return (event.startHour - hourRange.min) * HOUR_HEIGHT;
    },
    [hourRange]
  );

  /* Determine which side each event goes to (alternate) */
  const eventSides = useMemo(() => {
    const sides = new Map<string, "left" | "right">();
    dayEvents.forEach((e, i) => {
      sides.set(e.id, i % 2 === 0 ? "left" : "right");
    });
    return sides;
  }, [dayEvents]);

  return (
    <motion.div
      key="timeline-v2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col h-full"
    >
      {/* ═══ Toolbar ═══ */}
      <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-2.5 sm:px-6 border-b border-border/30 bg-card/60 backdrop-blur-sm flex-wrap">
        <div className="flex items-center gap-2">
          {/* Zoom */}
          <div className="flex gap-0.5 rounded-lg bg-muted/40 p-0.5">
            {([
              { key: "day" as TimelineZoom, label: t("cal.dayView") },
              { key: "3day" as TimelineZoom, label: t("cal.3dayView") },
              { key: "week" as TimelineZoom, label: t("cal.weekView") },
            ]).map((z) => (
              <button
                key={z.key}
                onClick={() => setZoom(z.key)}
                className={`rounded-md px-2.5 py-1 text-[0.6875rem] transition-all ${
                  zoom === z.key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={{ fontWeight: zoom === z.key ? 600 : 400 }}
              >
                {z.label}
              </button>
            ))}
          </div>

          {/* Jump to now */}
          <button
            onClick={() => {
              if (scrollRef.current && nowY !== null) {
                scrollRef.current.scrollTo({ top: Math.max(0, nowY - 180), behavior: "smooth" });
              }
            }}
            className="flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-2 py-1 text-[0.6875rem] text-primary hover:bg-primary/10 transition-colors"
            style={{ fontWeight: 500 }}
          >
            <Target className="h-3 w-3" />
            {t("cal.today")}
          </button>

          {/* Compact toggle */}
          <button
            onClick={() => setCompact(!compact)}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[0.6875rem] transition-colors ${
              compact ? "bg-primary/10 text-primary" : "bg-muted/40 text-muted-foreground"
            }`}
            style={{ fontWeight: 500 }}
          >
            {compact ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            {isEn ? (compact ? "Expand" : "Compact") : compact ? "展开" : "紧凑"}
          </button>

          {/* Dependencies */}
          <button
            onClick={() => setShowDeps(!showDeps)}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[0.6875rem] transition-colors ${
              showDeps ? "bg-primary/10 text-primary" : "bg-muted/40 text-muted-foreground"
            }`}
            style={{ fontWeight: 500 }}
          >
            <Link2 className="h-3 w-3" />
            {t("cal.deps")}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-3 text-[0.6875rem] text-muted-foreground">
            <span>{t("cal.nEvents").replace("{n}", String(totalEvts))}</span>
            <span>·</span>
            <span>{t("cal.nDone").replace("{n}", String(doneEvts))}</span>
          </div>
        </div>
      </div>

      {/* ═══ Day tabs (multi-day zoom) ═══ */}
      {visibleDays.length > 1 && (
        <div className="shrink-0 flex items-center gap-1 px-4 sm:px-6 py-2 border-b border-border/20 bg-card/40 overflow-x-auto no-scrollbar">
          {visibleDays.map((day, i) => {
            const isT = isToday(day);
            const isActive = i === activeDayIdx;
            const dayEvtCount = events.filter((e) => isSameDay(e.date, day)).length;
            return (
              <button
                key={day.toISOString()}
                onClick={() => setActiveDayIdx(i)}
                className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-[0.75rem] transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted/40"
                }`}
                style={{ fontWeight: isActive ? 600 : 400 }}
              >
                <CalendarDays className="h-3 w-3" />
                <span>{format(day, isEn ? "MMM d, EEE" : "M月d日 EEE", { locale: fnsLocale })}</span>
                {isT && (
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                )}
                <Badge className="bg-muted/50 text-muted-foreground text-[0.5rem] h-4 px-1.5 hover:bg-muted/50">
                  {dayEvtCount}
                </Badge>
              </button>
            );
          })}
        </div>
      )}

      {/* ═══ Main scrollable area ═══ */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {dayEvents.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              {/* Empty spine illustration */}
              <div className="w-[2px] h-32 mx-auto bg-gradient-to-b from-transparent via-purple-200 to-transparent rounded-full" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col gap-6 items-center">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="h-3 w-3 rounded-full border-2 border-dashed border-purple-200"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
            <p className="mt-6 text-[0.875rem] text-muted-foreground">{t("cal.dblClickAdd")}</p>
            <p className="text-[0.75rem] text-muted-foreground/50 mt-1">
              {isEn ? "Your day is open — what will you create?" : "今天尚无日程 — 开始规划你的一天吧"}
            </p>
          </div>
        ) : (
          <div
            className="relative mx-auto"
            style={{ height: totalHeight, maxWidth: 900 }}
            ref={containerRef}
            onDoubleClick={(e) => {
              if (!onDoubleClickSlot || !spineRef.current) return;
              if ((e.target as HTMLElement).closest("[data-event-card]")) return;
              const rect = spineRef.current.getBoundingClientRect();
              const scrollTop = scrollRef.current?.scrollTop || 0;
              const relY = e.clientY - rect.top + scrollTop;
              const hour = hourRange.min + relY / HOUR_HEIGHT;
              onDoubleClickSlot({ date: activeDay, startHour: Math.floor(hour * 2) / 2 });
            }}
          >
            {/* Energy overlay (left side of spine) */}
            <div
              className="absolute hidden md:block"
              style={{
                left: "50%",
                transform: "translateX(-50%)",
                width: SPINE_WIDTH + 30,
                top: 0,
                height: totalHeight,
              }}
            >
              {energyData.map((level, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-sm"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5 + i * 0.03, duration: 0.4 }}
                  style={{
                    top: i * HOUR_HEIGHT,
                    height: HOUR_HEIGHT,
                    left: "50%",
                    width: 4,
                    transform: "translateX(-50%)",
                    background: `rgba(168, 85, 247, ${level * 0.12})`,
                  }}
                />
              ))}
            </div>

            {/* ═══ Spine (center vertical line) ═══ */}
            <div
              ref={spineRef}
              className="absolute"
              style={{
                left: "50%",
                transform: "translateX(-50%)",
                width: SPINE_WIDTH,
                height: totalHeight,
              }}
            >
              {/* Background gradient line */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-[2px] rounded-full"
                style={{
                  top: 0,
                  height: "100%",
                  background:
                    "linear-gradient(to bottom, rgba(168,85,247,0.05), rgba(168,85,247,0.25) 20%, rgba(168,85,247,0.25) 80%, rgba(168,85,247,0.05))",
                }}
              />

              {/* Hour markers */}
              {hours.map((h, i) => {
                const isBusy = busyHours.has(h);
                const y = i * HOUR_HEIGHT;
                return (
                  <div key={h}>
                    {/* Hour node */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
                      style={{ top: y - 6, width: 12, height: 12 }}
                    >
                      <motion.div
                        className={`rounded-full border-2 transition-all ${
                          isBusy
                            ? "bg-purple-500 border-purple-400 shadow-sm shadow-purple-400/30"
                            : "bg-white border-purple-200"
                        }`}
                        style={{ width: isBusy ? 10 : 6, height: isBusy ? 10 : 6 }}
                        animate={
                          isBusy
                            ? { scale: [1, 1.15, 1] }
                            : {}
                        }
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>

                    {/* Hour label */}
                    <div
                      className="absolute text-[0.625rem] text-muted-foreground/60"
                      style={{
                        top: y - 7,
                        left: "50%",
                        transform: "translateX(calc(-50% - 32px))",
                      }}
                    >
                      {String(h).padStart(2, "0")}:00
                    </div>

                    {/* Busy line thickening */}
                    {isBusy && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 w-[3px] bg-purple-400/30 rounded-full"
                        style={{ top: y, height: HOUR_HEIGHT }}
                      />
                    )}
                  </div>
                );
              })}

              {/* ═══ Now indicator ═══ */}
              {nowY !== null && (
                <div
                  className="absolute z-30"
                  style={{ top: nowY - 6, left: "50%", transform: "translateX(-50%)" }}
                >
                  <NowPulse />
                  {/* Horizontal scan lines */}
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 h-[1.5px] bg-gradient-to-r from-purple-500/50 to-transparent"
                    style={{ left: 8, width: Math.min(containerWidth / 2, 400) }}
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 h-[1.5px] bg-gradient-to-l from-purple-500/50 to-transparent"
                    style={{ right: 8, width: Math.min(containerWidth / 2, 400) }}
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  {/* Time label */}
                  <div
                    className="absolute -top-0.5 text-[0.625rem] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full border border-purple-200"
                    style={{ fontWeight: 600, left: 16, whiteSpace: "nowrap" }}
                  >
                    {format(now, "HH:mm")}
                  </div>
                </div>
              )}
            </div>

            {/* ═══ Event cards (left & right of spine) ═══ */}
            {dayEvents.map((event, i) => {
              const side = eventSides.get(event.id) || "left";
              const y = getEventY(event);
              const isHovered = hoveredEvent === event.id;
              const isSelected = selectedEventId === event.id;

              return (
                <div
                  key={event.id}
                  data-event-card
                  className="absolute"
                  style={{
                    top: y,
                    ...(side === "left"
                      ? { right: "calc(50% + 40px)", paddingRight: 8 }
                      : { left: "calc(50% + 40px)", paddingLeft: 8 }),
                  }}
                >
                  {/* Connector line from card to spine */}
                  <div
                    className={`absolute top-3 h-[1.5px] transition-all duration-200 ${
                      isHovered || isSelected
                        ? "bg-purple-400"
                        : "bg-purple-200/50"
                    }`}
                    style={
                      side === "left"
                        ? { right: 0, width: 32 }
                        : { left: 0, width: 32 }
                    }
                  />
                  {/* Small dot at connector end near spine */}
                  <div
                    className={`absolute top-[9px] h-2 w-2 rounded-full transition-all duration-200 ${
                      isHovered || isSelected
                        ? "bg-purple-400 scale-125"
                        : "bg-purple-300/60"
                    }`}
                    style={
                      side === "left"
                        ? { right: -2 }
                        : { left: -2 }
                    }
                  />

                  <EventCard
                    event={event}
                    side={side}
                    index={i}
                    isHovered={isHovered}
                    isSelected={isSelected}
                    onHover={() => setHoveredEvent(event.id)}
                    onLeave={() => setHoveredEvent(null)}
                    onClick={() => {
                      setSelectedEventId(isSelected ? null : event.id);
                      onSelectEvent(event);
                    }}
                    onToggleStatus={() => onToggleStatus(event.id)}
                    t={t}
                    isEn={isEn}
                    compact={compact}
                  />
                </div>
              );
            })}

            {/* ═══ Dependency arrows (SVG overlay) ═══ */}
            {visibleDeps.length > 0 && (
              <svg
                className="absolute inset-0 pointer-events-none z-20"
                style={{ width: "100%", height: totalHeight, overflow: "visible" }}
              >
                <defs>
                  <marker
                    id="arrowhead-v2"
                    markerWidth="7"
                    markerHeight="6"
                    refX="6"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 7 3, 0 6" fill="currentColor" className="text-purple-400" />
                  </marker>
                  {/* Flowing dash animation */}
                  <style>
                    {`@keyframes dashFlow { to { stroke-dashoffset: -20; } }`}
                  </style>
                </defs>
                {visibleDeps.map(([fromId, toId]) => {
                  const fromEvt = dayEvents.find((e) => e.id === fromId);
                  const toEvt = dayEvents.find((e) => e.id === toId);
                  if (!fromEvt || !toEvt) return null;

                  const fromSide = eventSides.get(fromId) || "left";
                  const toSide = eventSides.get(toId) || "right";

                  const fromY = getEventY(fromEvt) + 20;
                  const toY = getEventY(toEvt) + 12;

                  // Route through spine center
                  const cx = containerWidth / 2; // approximate center (will be responsive)
                  const fromX = fromSide === "left" ? cx - 30 : cx + 30;
                  const toX = toSide === "left" ? cx - 30 : cx + 30;
                  const midY = (fromY + toY) / 2;

                  const isRelHovered =
                    hoveredEvent === fromId || hoveredEvent === toId;

                  return (
                    <path
                      key={`dep-${fromId}-${toId}`}
                      d={`M${fromX},${fromY} C${fromX},${midY} ${toX},${midY} ${toX},${toY}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={isRelHovered ? 2.5 : 1.5}
                      strokeDasharray="6 4"
                      className={`transition-all duration-200 ${
                        isRelHovered ? "text-purple-500" : "text-purple-300/40"
                      }`}
                      markerEnd="url(#arrowhead-v2)"
                      style={{
                        animation: "dashFlow 1.5s linear infinite",
                      }}
                    />
                  );
                })}
              </svg>
            )}
          </div>
        )}
      </div>

      {/* ═══ Bottom legend bar ═══ */}
      <div className="shrink-0 border-t border-border/30 bg-card/80 backdrop-blur-sm px-4 py-2 sm:px-6 flex items-center justify-between flex-wrap gap-2">
        {/* Mini heatmap */}
        <div className="flex items-center gap-1.5">
          <span className="text-[0.625rem] text-muted-foreground/50 mr-1">
            {isEn ? "Density" : "密度"}
          </span>
          <div className="flex items-end gap-[2px] h-4">
            {hourDensity.map((count, h) => (
              <motion.div
                key={h}
                className="rounded-[1px]"
                initial={{ height: 0 }}
                animate={{ height: count > 0 ? Math.max(3, (count / maxDensity) * 16) : 2 }}
                transition={{ delay: 0.02 * h, duration: 0.3 }}
                style={{
                  width: 3,
                  backgroundColor:
                    count === 0
                      ? "rgba(0,0,0,0.06)"
                      : `rgba(168, 85, 247, ${0.2 + (count / maxDensity) * 0.6})`,
                }}
              />
            ))}
          </div>
          <div className="flex gap-3 ml-2 text-[0.5625rem] text-muted-foreground/40">
            <span>0</span>
            <span>6</span>
            <span>12</span>
            <span>18</span>
            <span>24</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[0.625rem] text-muted-foreground/60">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-500 border-2 border-white shadow-sm" />
            <span>{isEn ? "Now" : "当前"}</span>
          </div>
          {showDeps && (
            <div className="flex items-center gap-1">
              <div className="w-4 h-[1.5px] border-t-[1.5px] border-dashed border-purple-400/50" />
              <span>{t("cal.deps")}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <div className="h-[3px] w-4 rounded-full bg-red-500 opacity-50" />
            <span>{isEn ? "Urgent" : "紧急"}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-[3px] w-4 rounded-full bg-orange-400 opacity-50" />
            <span>{isEn ? "High" : "高"}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-[3px] w-4 rounded-full bg-blue-400 opacity-50" />
            <span>{isEn ? "Med" : "中"}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}