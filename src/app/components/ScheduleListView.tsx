import { useState, useMemo, useEffect } from "react";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";
import { format, isToday, isTomorrow, isSameDay, differenceInMinutes } from "date-fns";
import { zhCN, enUS as enUSDateFns } from "date-fns/locale";
import { useLanguage } from "./LanguageContext";
import {
  Clock,
  CircleCheck,
  Circle,
  Sparkles,
  MapPin,
  Video,
  Repeat,
  Flag,
  AlertTriangle,
  Zap,
  Link2,
  Sunrise,
  Sun,
  Moon,
  Coffee,
  ChevronRight,
  Timer,
  TrendingUp,
} from "lucide-react";

/* ═══════════════ Types ═══════════════ */
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

export interface ScheduleListViewProps {
  events: ScheduleEvent[];
  weekDays: Date[];
  onSelectEvent: (event: ScheduleEvent) => void;
  onToggleStatus: (id: string) => void;
  onToggleSubtask: (eventId: string, subtaskId: string) => void;
}

/* ═══════════════ Helpers ═══════════════ */
function fmtTime(h: number) {
  return `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
}

type TimeSection = "morning" | "afternoon" | "evening";

function getTimeSection(hour: number): TimeSection {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

const prioGradients: Record<Priority, string> = {
  urgent: "from-red-500/10 via-red-400/5 to-transparent",
  high: "from-orange-400/10 via-orange-300/5 to-transparent",
  medium: "from-blue-400/8 via-blue-300/4 to-transparent",
  low: "from-gray-300/8 via-gray-200/4 to-transparent",
};

const prioAccent: Record<Priority, string> = {
  urgent: "bg-red-500",
  high: "bg-orange-400",
  medium: "bg-blue-400",
  low: "bg-gray-300",
};

const prioBadgeStyle: Record<Priority, string> = {
  urgent: "bg-red-50 text-red-600 border-red-200",
  high: "bg-orange-50 text-orange-600 border-orange-200",
  medium: "bg-blue-50 text-blue-600 border-blue-200",
  low: "bg-gray-50 text-gray-500 border-gray-200",
};

/* ═══════════════ Sub-components ═══════════════ */

/* Progress Ring */
function ProgressRing({ progress, size = 40, stroke = 3 }: { progress: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (progress / 100) * circ;

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-muted/30"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progressGrad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <defs>
        <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* Section Header (Morning / Afternoon / Evening) */
function SectionHeader({ section, count, isEn }: { section: TimeSection; count: number; isEn: boolean }) {
  const config = {
    morning: {
      icon: Sunrise,
      label: isEn ? "Morning" : "上午",
      gradient: "from-amber-400/20 to-orange-300/10",
      iconColor: "text-amber-500",
      time: "6:00 – 12:00",
    },
    afternoon: {
      icon: Sun,
      label: isEn ? "Afternoon" : "下午",
      gradient: "from-blue-400/20 to-cyan-300/10",
      iconColor: "text-blue-500",
      time: "12:00 – 18:00",
    },
    evening: {
      icon: Moon,
      label: isEn ? "Evening" : "晚间",
      gradient: "from-indigo-400/20 to-purple-300/10",
      iconColor: "text-indigo-500",
      time: "18:00 – 24:00",
    },
  }[section];

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 py-2"
    >
      <div className={`flex items-center gap-2 rounded-full bg-gradient-to-r ${config.gradient} pl-2 pr-3 py-1`}>
        <Icon className={`h-3.5 w-3.5 ${config.iconColor}`} />
        <span className="text-[0.75rem] text-foreground/70" style={{ fontWeight: 600 }}>
          {config.label}
        </span>
      </div>
      <div className="flex-1 h-[1px] bg-gradient-to-r from-border/40 to-transparent" />
      <span className="text-[0.625rem] text-muted-foreground/50">{config.time}</span>
      <Badge className="bg-muted/40 text-muted-foreground/60 text-[0.5625rem] h-4 px-1.5 hover:bg-muted/40">
        {count}
      </Badge>
    </motion.div>
  );
}

/* Now Indicator */
function NowIndicator({ isEn }: { isEn: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0.5 }}
      animate={{ opacity: 1, scaleX: 1 }}
      className="flex items-center gap-2 py-2 px-1"
    >
      <div className="flex items-center gap-2">
        <motion.div
          className="h-2.5 w-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-400/50"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-[0.6875rem] text-purple-600" style={{ fontWeight: 600 }}>
          {isEn ? "Now" : "现在"}
        </span>
        <span className="text-[0.625rem] text-purple-400">
          {format(new Date(), "HH:mm")}
        </span>
      </div>
      <div className="flex-1 h-[1.5px] bg-gradient-to-r from-purple-400/60 via-purple-300/30 to-transparent" />
    </motion.div>
  );
}

/* Event Card */
function ListEventCard({
  event,
  index,
  isNow,
  relativeTime,
  onSelect,
  onToggle,
  onToggleSubtask,
  isEn,
}: {
  event: ScheduleEvent;
  index: number;
  isNow: boolean;
  relativeTime: string;
  onSelect: () => void;
  onToggle: () => void;
  onToggleSubtask: (subtaskId: string) => void;
  isEn: boolean;
}) {
  const isDone = event.status === "done";
  const isBlocked = event.status === "blocked";
  const subtaskProgress = event.subtasks?.length
    ? Math.round((event.subtasks.filter((s) => s.done).length / event.subtasks.length) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      onClick={onSelect}
      className={`group relative flex gap-3 rounded-2xl border backdrop-blur-sm p-3 sm:p-4 transition-all duration-200 cursor-pointer overflow-hidden ${
        isDone
          ? "border-border/15 bg-white/40 opacity-60"
          : isNow
          ? "border-purple-300/50 bg-white/90 shadow-md shadow-purple-500/8 ring-1 ring-purple-300/20"
          : isBlocked
          ? "border-red-200/50 bg-white/80"
          : "border-border/30 bg-white/80 hover:border-primary/25 hover:shadow-lg hover:shadow-purple-500/6"
      }`}
    >
      {/* Priority gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${prioGradients[event.priority]} pointer-events-none opacity-60`} />

      {/* Blocked stripes */}
      {isBlocked && (
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(239,68,68,0.5) 6px, rgba(239,68,68,0.5) 7px)",
          }}
        />
      )}

      {/* AI suggested shimmer */}
      {event.aiSuggested && !isDone && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgba(168,85,247,0.06) 50%, transparent 60%)",
          }}
          animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Left accent + time spine */}
      <div className="relative flex flex-col items-center shrink-0 z-10">
        {/* Priority accent bar */}
        <div className={`w-[3px] rounded-full ${prioAccent[event.priority]} absolute top-0 bottom-0 left-0`} />

        {/* Time chip */}
        <div className="ml-3 flex flex-col items-center">
          <div
            className={`rounded-lg px-2 py-1 text-center min-w-[48px] ${
              isNow
                ? "bg-purple-100 text-purple-700"
                : isDone
                ? "bg-gray-50 text-gray-400"
                : "bg-muted/60 text-foreground/70"
            }`}
          >
            <div className="text-[0.8125rem]" style={{ fontWeight: 700 }}>
              {fmtTime(event.startHour)}
            </div>
            <div className="text-[0.5625rem] text-muted-foreground/60 mt-px">
              {event.duration >= 1 ? `${event.duration}h` : `${Math.round(event.duration * 60)}m`}
            </div>
          </div>

          {/* Relative time badge */}
          {relativeTime && !isDone && (
            <div
              className={`mt-1.5 rounded-md px-1.5 py-0.5 text-[0.5625rem] ${
                isNow
                  ? "bg-purple-500 text-white"
                  : "bg-muted/50 text-muted-foreground/60"
              }`}
              style={{ fontWeight: 500 }}
            >
              {relativeTime}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1 relative z-10">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            {/* Status toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="mt-0.5 shrink-0"
            >
              {isDone ? (
                <CircleCheck className="h-[18px] w-[18px] text-emerald-500" />
              ) : isBlocked ? (
                <div className="h-[18px] w-[18px] rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                </div>
              ) : (
                <Circle className="h-[18px] w-[18px] text-muted-foreground/30 hover:text-primary transition-colors" />
              )}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-[0.875rem] ${isDone ? "line-through text-muted-foreground" : ""}`}
                  style={{ fontWeight: 600 }}
                >
                  {event.title}
                </span>
                {event.aiSuggested && (
                  <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                )}
                {event.id.startsWith("ext-") && (
                  <Badge className="bg-blue-50 text-blue-600 text-[0.5rem] px-1 py-0 border-blue-200">
                    <Link2 className="mr-0.5 h-2 w-2" />
                    {event.category}
                  </Badge>
                )}
              </div>

              {/* Category */}
              <div className="flex items-center gap-1.5 mt-0.5 text-[0.6875rem] text-muted-foreground/70">
                <span>{event.category}</span>
                <span className="text-muted-foreground/30">|</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {fmtTime(event.startHour)} – {fmtTime(event.startHour + event.duration)}
                </span>
              </div>
            </div>
          </div>

          {/* Priority badge */}
          <Badge
            variant="outline"
            className={`shrink-0 text-[0.5625rem] h-5 ${prioBadgeStyle[event.priority]}`}
          >
            {event.priority === "urgent" && <AlertTriangle className="mr-0.5 h-2.5 w-2.5" />}
            {event.priority !== "urgent" && <Flag className="mr-0.5 h-2.5 w-2.5" />}
            {event.priority === "urgent"
              ? isEn ? "Urgent" : "紧急"
              : event.priority === "high"
              ? isEn ? "High" : "高"
              : event.priority === "medium"
              ? isEn ? "Med" : "中"
              : isEn ? "Low" : "低"}
          </Badge>
        </div>

        {/* Meta row */}
        <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          {event.location && (
            <span className="inline-flex items-center gap-1 text-[0.6875rem] text-muted-foreground/60 bg-muted/30 rounded-md px-1.5 py-0.5">
              <MapPin className="h-2.5 w-2.5" /> {event.location}
            </span>
          )}
          {event.hasMeeting && (
            <span className="inline-flex items-center gap-1 text-[0.6875rem] text-indigo-500 bg-indigo-50 rounded-md px-1.5 py-0.5">
              <Video className="h-2.5 w-2.5" /> {isEn ? "Meeting" : "视频会议"}
            </span>
          )}
          {event.isRecurring && (
            <span className="inline-flex items-center gap-1 text-[0.6875rem] text-teal-600 bg-teal-50 rounded-md px-1.5 py-0.5">
              <Repeat className="h-2.5 w-2.5" /> {isEn ? "Recurring" : "重复"}
            </span>
          )}
          {event.energyLevel && (
            <span
              className={`inline-flex items-center gap-1 text-[0.6875rem] rounded-md px-1.5 py-0.5 ${
                event.energyLevel === "high"
                  ? "text-red-500 bg-red-50"
                  : event.energyLevel === "medium"
                  ? "text-amber-500 bg-amber-50"
                  : "text-green-500 bg-green-50"
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
          <div className="mt-2 flex flex-wrap gap-1">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted/40 px-1.5 py-0.5 text-[0.5625rem] text-muted-foreground/70"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Subtasks */}
        {event.subtasks && event.subtasks.length > 0 && (
          <div className="mt-2.5">
            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-purple-400 to-indigo-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${subtaskProgress}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
              </div>
              <span className="text-[0.5625rem] text-muted-foreground/50" style={{ fontWeight: 500 }}>
                {event.subtasks.filter((s) => s.done).length}/{event.subtasks.length}
              </span>
            </div>
            {/* Subtask items */}
            <div className="space-y-0.5">
              {event.subtasks.map((st) => (
                <button
                  key={st.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSubtask(st.id);
                  }}
                  className="flex w-full items-center gap-2 text-[0.6875rem] rounded-md px-1.5 py-1 -mx-1.5 transition-colors hover:bg-muted/30 text-left group/st"
                >
                  {st.done ? (
                    <CircleCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="h-3 w-3 text-muted-foreground/30 shrink-0 group-hover/st:text-primary/60 transition-colors" />
                  )}
                  <span className={st.done ? "line-through text-muted-foreground/50" : "text-foreground/70"}>
                    {st.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hover arrow indicator */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
      </div>
    </motion.div>
  );
}

/* ═══════════════ Main Component ═══════════════ */
export function ScheduleListView({
  events,
  weekDays,
  onSelectEvent,
  onToggleStatus,
  onToggleSubtask,
}: ScheduleListViewProps) {
  const { locale } = useLanguage();
  const isEn = locale === "en-US";
  const fnsLocale = isEn ? enUSDateFns : zhCN;

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const nowHour = now.getHours() + now.getMinutes() / 60;

  /* Compute relative time for an event */
  function getRelativeTime(event: ScheduleEvent): string {
    if (!isToday(event.date)) return "";
    const eventStart = new Date(event.date);
    eventStart.setHours(Math.floor(event.startHour), Math.round((event.startHour % 1) * 60), 0);
    const eventEnd = new Date(event.date);
    const endHour = event.startHour + event.duration;
    eventEnd.setHours(Math.floor(endHour), Math.round((endHour % 1) * 60), 0);

    const minsToStart = differenceInMinutes(eventStart, now);
    const minsToEnd = differenceInMinutes(eventEnd, now);

    if (minsToEnd < 0) return isEn ? "Done" : "已过";
    if (minsToStart <= 0 && minsToEnd > 0) return isEn ? "Now" : "进行中";
    if (minsToStart > 0 && minsToStart <= 15) return isEn ? "Soon" : "即将开始";
    if (minsToStart > 15 && minsToStart <= 60) return isEn ? `${minsToStart}m` : `${minsToStart}分钟`;
    if (minsToStart > 60) {
      const hrs = Math.floor(minsToStart / 60);
      return isEn ? `${hrs}h` : `${hrs}小时`;
    }
    return "";
  }

  function isEventNow(event: ScheduleEvent): boolean {
    if (!isToday(event.date)) return false;
    return nowHour >= event.startHour && nowHour < event.startHour + event.duration;
  }

  /* Group events by day */
  const dayGroups = useMemo(() => {
    return weekDays
      .map((day) => {
        const dayEvents = events
          .filter((e) => isSameDay(e.date, day))
          .sort((a, b) => a.startHour - b.startHour);

        if (dayEvents.length === 0) return null;

        const doneCount = dayEvents.filter((e) => e.status === "done").length;
        const progress = Math.round((doneCount / dayEvents.length) * 100);
        const totalHours = dayEvents.reduce((sum, e) => sum + e.duration, 0);
        const freeHours = Math.max(0, 16 - totalHours); // Assume ~16 productive hours

        // Group by time section
        const sections: { section: TimeSection; events: ScheduleEvent[] }[] = [];
        const sectionMap = new Map<TimeSection, ScheduleEvent[]>();
        dayEvents.forEach((e) => {
          const sec = getTimeSection(e.startHour);
          if (!sectionMap.has(sec)) sectionMap.set(sec, []);
          sectionMap.get(sec)!.push(e);
        });
        (["morning", "afternoon", "evening"] as TimeSection[]).forEach((sec) => {
          const evts = sectionMap.get(sec);
          if (evts && evts.length > 0) sections.push({ section: sec, events: evts });
        });

        // Energy distribution
        const energyDist = { high: 0, medium: 0, low: 0 };
        dayEvents.forEach((e) => {
          if (e.energyLevel) energyDist[e.energyLevel]++;
        });

        return { day, dayEvents, sections, doneCount, progress, totalHours, freeHours, energyDist };
      })
      .filter(Boolean) as NonNullable<ReturnType<typeof Array.prototype.map>[number]>[];
  }, [weekDays, events]);

  return (
    <motion.div
      key="list-view"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="p-3 sm:p-6 space-y-5 max-w-3xl mx-auto"
    >
      {dayGroups.map((group: any, groupIdx: number) => {
        const { day, dayEvents, sections, doneCount, progress, totalHours, freeHours, energyDist } = group;
        const isTodayDay = isToday(day);
        const isTmr = isTomorrow(day);

        return (
          <motion.div
            key={day.toISOString()}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIdx * 0.08 }}
          >
            {/* ═══ Day Header ═══ */}
            <div
              className={`relative rounded-2xl border p-3 sm:p-4 mb-3 overflow-hidden ${
                isTodayDay
                  ? "border-purple-200/50 bg-gradient-to-r from-purple-50/80 via-white/80 to-indigo-50/50"
                  : "border-border/30 bg-gradient-to-r from-muted/20 to-white/60"
              }`}
            >
              {/* Subtle background pattern */}
              {isTodayDay && (
                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 50%, rgba(168,85,247,0.3), transparent 50%), radial-gradient(circle at 80% 50%, rgba(99,102,241,0.3), transparent 50%)",
                  }}
                />
              )}

              <div className="relative flex items-center gap-3 sm:gap-4">
                {/* Progress Ring */}
                <div className="relative">
                  <ProgressRing progress={progress} size={44} stroke={3} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[0.625rem] text-foreground/70" style={{ fontWeight: 700 }}>
                      {progress}%
                    </span>
                  </div>
                </div>

                {/* Day info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[0.9375rem] ${isTodayDay ? "text-purple-700" : ""}`}
                      style={{ fontWeight: 700 }}
                    >
                      {isTodayDay
                        ? isEn ? "Today" : "今天"
                        : isTmr
                        ? isEn ? "Tomorrow" : "明天"
                        : format(day, isEn ? "EEEE" : "EEEE", { locale: fnsLocale })}
                    </span>
                    <span className="text-[0.75rem] text-muted-foreground/60">
                      {format(day, isEn ? "MMM d" : "M月d日", { locale: fnsLocale })}
                    </span>
                    {isTodayDay && (
                      <motion.span
                        className="h-1.5 w-1.5 rounded-full bg-purple-500"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 mt-1 text-[0.6875rem] text-muted-foreground/60 flex-wrap">
                    <span className="flex items-center gap-1">
                      <CircleCheck className="h-3 w-3 text-emerald-400" />
                      {doneCount}/{dayEvents.length} {isEn ? "done" : "完成"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Timer className="h-3 w-3 text-blue-400" />
                      {totalHours.toFixed(1)}h {isEn ? "scheduled" : "已排"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Coffee className="h-3 w-3 text-amber-400" />
                      {freeHours.toFixed(1)}h {isEn ? "free" : "空闲"}
                    </span>
                  </div>
                </div>

                {/* Energy sparkline */}
                <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                  {energyDist.high + energyDist.medium + energyDist.low > 0 && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-muted-foreground/40" />
                      <div className="flex items-end gap-[2px] h-5">
                        {[
                          { count: energyDist.high, color: "bg-red-400" },
                          { count: energyDist.medium, color: "bg-amber-400" },
                          { count: energyDist.low, color: "bg-green-400" },
                        ].map((bar, bi) => (
                          <motion.div
                            key={bi}
                            className={`w-2.5 rounded-sm ${bar.color}`}
                            initial={{ height: 0 }}
                            animate={{ height: Math.max(3, (bar.count / dayEvents.length) * 20) }}
                            transition={{ delay: 0.3 + bi * 0.1, duration: 0.4 }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ═══ Events by Section ═══ */}
            <div className="space-y-1">
              {sections.map(({ section, events: sectionEvents }: { section: TimeSection; events: ScheduleEvent[] }, secIdx: number) => {
                // Determine if we need a "now" indicator before this section's events
                const showNowBefore =
                  isTodayDay &&
                  secIdx === 0 &&
                  section === getTimeSection(nowHour) &&
                  sectionEvents.length > 0 &&
                  nowHour < sectionEvents[0].startHour;

                return (
                  <div key={section}>
                    <SectionHeader section={section} count={sectionEvents.length} isEn={isEn} />

                    <div className="space-y-2 pl-1">
                      {showNowBefore && <NowIndicator isEn={isEn} />}

                      {sectionEvents.map((event, i) => {
                        const eventIsNow = isEventNow(event);
                        const relTime = getRelativeTime(event);
                        // Check if "now" indicator goes between this and next event
                        const nextEvent = sectionEvents[i + 1];
                        const showNowAfter =
                          isTodayDay &&
                          !eventIsNow &&
                          nextEvent &&
                          event.startHour + event.duration <= nowHour &&
                          nextEvent.startHour > nowHour;

                        return (
                          <div key={event.id}>
                            <ListEventCard
                              event={event}
                              index={i}
                              isNow={eventIsNow}
                              relativeTime={relTime}
                              onSelect={() => onSelectEvent(event)}
                              onToggle={() => onToggleStatus(event.id)}
                              onToggleSubtask={(stId) => onToggleSubtask(event.id, stId)}
                              isEn={isEn}
                            />
                            {showNowAfter && <NowIndicator isEn={isEn} />}
                          </div>
                        );
                      })}

                      {/* Now after last event in section */}
                      {isTodayDay &&
                        section === getTimeSection(nowHour) &&
                        sectionEvents.length > 0 &&
                        sectionEvents[sectionEvents.length - 1].startHour +
                          sectionEvents[sectionEvents.length - 1].duration <=
                          nowHour && (
                          <NowIndicator isEn={isEn} />
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}

      {/* Empty state */}
      {dayGroups.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="relative mb-4">
            <motion.div
              className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sunrise className="h-7 w-7 text-purple-400" />
            </motion.div>
          </div>
          <p className="text-[0.875rem] text-muted-foreground" style={{ fontWeight: 500 }}>
            {isEn ? "No events this week" : "本周暂无日程"}
          </p>
          <p className="text-[0.75rem] text-muted-foreground/50 mt-1">
            {isEn ? "Start planning your week!" : "开始规划你的一周吧！"}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
