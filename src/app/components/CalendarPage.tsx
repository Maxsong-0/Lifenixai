import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { motion, AnimatePresence } from "motion/react";
import {
  addDays,
  startOfWeek,
  format,
  isSameDay,
  isToday,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameMonth,
} from "date-fns";
import { zhCN, enUS as enUSDateFns } from "date-fns/locale";
import { useLanguage } from "./LanguageContext";
import {
  CalendarDays,
  List,
  Columns3,
  GanttChart,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Zap,
  Eye,
  Tag,
  Flag,
  AlertTriangle,
  CircleCheck,
  Circle,
  ArrowRight,
  Users,
  Video,
  MapPin,
  Repeat,
  X,
  Brain,
  TrendingUp,
  Target,
  Coffee,
  Flame,
  Send,
  GripVertical,
  MoreHorizontal,
  Filter,
  SlidersHorizontal,
  Link2,
  Mail,
  Crown,
  ChevronDown,
  Wrench,
  Check,
} from "lucide-react";
import { CalendarSync, ConflictBanner, type ExternalEvent, type ConflictInfo } from "./CalendarSync";
import { EmailAggregator } from "./EmailAggregator";
import { MeetingAssistant } from "./MeetingAssistant";
import { AddEventModal, type NewEventData, type AddEventPreset } from "./AddEventModal";

/* ═══════════════ Types ═══════════════ */
type ViewType = "calendar" | "list" | "kanban" | "timeline";
type Priority = "urgent" | "high" | "medium" | "low";
type Status = "todo" | "in_progress" | "done" | "blocked";

interface ScheduleEvent {
  id: string;
  title: string;
  date: Date;
  startHour: number;
  duration: number; // hours
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

/* ═══════════════ Mock Data ═══════════════ */
const today = new Date();

// Mock event templates — translated inside component via t()
const _mockTpl = [
  { id: "1", tk: "cal.mock.1", d: 0, sh: 9, dur: 2, col: "bg-blue-500", pri: "high" as Priority, st: "in_progress" as Status, ck: "cal.mock.cat.work", tgs: ["cal.mock.tag.product","cal.mock.tag.doc"], el: "high" as const, subs: [{id:"s1",tk:"cal.mock.sub.1",done:true},{id:"s2",tk:"cal.mock.sub.2",done:false},{id:"s3",tk:"cal.mock.sub.3",done:false}] },
  { id: "2", tk: "cal.mock.2", d: 0, sh: 11, dur: 0.5, col: "bg-purple-500", pri: "medium" as Priority, st: "todo" as Status, ck: "cal.mock.cat.meeting", tgs: ["cal.mock.tag.team"], meet: true, lk: "cal.mock.loc.1", rec: true },
  { id: "3", tk: "cal.mock.3", d: 0, sh: 14, dur: 1, col: "bg-cyan-500", pri: "high" as Priority, st: "todo" as Status, ck: "cal.mock.cat.dev", tgs: ["cal.mock.tag.codeReview","cal.mock.tag.frontend"] },
  { id: "4", tk: "cal.mock.4", d: 0, sh: 15.5, dur: 1, col: "bg-amber-500", pri: "urgent" as Priority, st: "todo" as Status, ck: "cal.mock.cat.meeting", tgs: ["cal.mock.tag.client","cal.mock.tag.demo"], meet: true, lk: "cal.mock.loc.2" },
  { id: "5", tk: "cal.mock.5", d: 0, sh: 17.5, dur: 1, col: "bg-emerald-500", pri: "low" as Priority, st: "todo" as Status, ck: "cal.mock.cat.health", tgs: ["cal.mock.tag.exercise"], el: "medium" as const },
  { id: "6", tk: "cal.mock.6", d: 0, sh: 20, dur: 1, col: "bg-rose-400", pri: "low" as Priority, st: "todo" as Status, ck: "cal.mock.cat.learning", tgs: ["cal.mock.tag.reading"], el: "low" as const },
  { id: "7", tk: "cal.mock.7", d: 1, sh: 10, dur: 1.5, col: "bg-indigo-500", pri: "medium" as Priority, st: "todo" as Status, ck: "cal.mock.cat.meeting", tgs: ["cal.mock.tag.agile","cal.mock.tag.team"], meet: true, rec: true },
  { id: "8", tk: "cal.mock.8", d: 1, sh: 13, dur: 3, col: "bg-blue-500", pri: "high" as Priority, st: "todo" as Status, ck: "cal.mock.cat.dev", tgs: ["cal.mock.tag.backend","cal.mock.tag.ai"], el: "high" as const, subs: [{id:"s4",tk:"cal.mock.sub.4",done:true},{id:"s5",tk:"cal.mock.sub.5",done:false},{id:"s6",tk:"cal.mock.sub.6",done:false}] },
  { id: "9", tk: "cal.mock.9", d: 2, sh: 11, dur: 1, col: "bg-pink-500", pri: "medium" as Priority, st: "todo" as Status, ck: "cal.mock.cat.design", tgs: ["cal.mock.tag.ui","cal.mock.tag.review"] },
  { id: "10", tk: "cal.mock.10", d: 2, sh: 14, dur: 2, col: "bg-teal-500", pri: "high" as Priority, st: "blocked" as Status, ck: "cal.mock.cat.dev", tgs: ["cal.mock.tag.db","cal.mock.tag.perf"] },
  { id: "11", tk: "cal.mock.11", d: 4, sh: 16, dur: 1, col: "bg-gray-500", pri: "medium" as Priority, st: "todo" as Status, ck: "cal.mock.cat.work", tgs: ["cal.mock.tag.weeklyReport"] },
  { id: "12", tk: "cal.mock.12", d: 3, sh: 9, dur: 3, col: "bg-violet-500", pri: "high" as Priority, st: "todo" as Status, ck: "cal.mock.cat.design", tgs: ["cal.mock.tag.ai","cal.mock.tag.prototype"], el: "high" as const, aiSuggested: true },
  { id: "13", tk: "cal.mock.13", d: 1, sh: 6, dur: 1, col: "bg-emerald-400", pri: "low" as Priority, st: "todo" as Status, ck: "cal.mock.cat.health", tgs: ["cal.mock.tag.exercise","cal.mock.tag.morning"], el: "medium" as const },
  { id: "14", tk: "cal.mock.14", d: 0, sh: 22.5, dur: 0.5, col: "bg-indigo-400", pri: "low" as Priority, st: "todo" as Status, ck: "cal.mock.cat.personal", tgs: ["cal.mock.tag.reflect"], el: "low" as const },
];

function buildMockEvents(t: (k: string) => string): ScheduleEvent[] {
  return _mockTpl.map((m) => ({
    id: m.id, title: t(m.tk), date: m.d === 0 ? today : addDays(today, m.d), startHour: m.sh, duration: m.dur,
    color: m.col, priority: m.pri, status: m.st, category: t(m.ck), tags: m.tgs.map((k) => t(k)),
    ...(m.lk ? { location: t(m.lk) } : {}), ...(m.meet ? { hasMeeting: true } : {}), ...(m.rec ? { isRecurring: true } : {}),
    ...(m.el ? { energyLevel: m.el } : {}), ...(m.aiSuggested ? { aiSuggested: true } : {}),
    ...(m.subs ? { subtasks: m.subs.map((s) => ({ id: s.id, text: t(s.tk), done: s.done })) } : {}),
  }));
}

function buildPriorityConfig(t: (k: string) => string): Record<Priority, { label: string; color: string; icon: typeof Flag }> {
  return {
    urgent: { label: t("cal.priority.urgent"), color: "text-red-600 bg-red-50 border-red-200", icon: AlertTriangle },
    high: { label: t("cal.priority.high"), color: "text-orange-600 bg-orange-50 border-orange-200", icon: Flag },
    medium: { label: t("cal.priority.medium"), color: "text-blue-600 bg-blue-50 border-blue-200", icon: Flag },
    low: { label: t("cal.priority.low"), color: "text-gray-500 bg-gray-50 border-gray-200", icon: Flag },
  };
}

function buildStatusConfig(t: (k: string) => string): Record<Status, { label: string; color: string }> {
  return {
    todo: { label: t("cal.status.todo"), color: "bg-gray-100 text-gray-600" },
    in_progress: { label: t("cal.status.inProgress"), color: "bg-blue-100 text-blue-700" },
    done: { label: t("cal.status.done"), color: "bg-emerald-100 text-emerald-700" },
    blocked: { label: t("cal.status.blocked"), color: "bg-red-100 text-red-700" },
  };
}

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 0:00 – 23:00

/* ═══════════════ Timeline Sub-component ═══════════════ */
type TimelineZoom = "day" | "3day" | "week";

interface TimelineViewProps {
  events: ScheduleEvent[];
  weekDays: Date[];
  onSelectEvent: (event: ScheduleEvent) => void;
  onToggleStatus: (id: string) => void;
  onDoubleClickSlot?: (preset: AddEventPreset) => void;
}

const mockDependencies: [string, string][] = [
  ["1", "3"],
  ["3", "4"],
  ["8", "10"],
];

function TimelineView({ events, weekDays, onSelectEvent, onToggleStatus, onDoubleClickSlot }: TimelineViewProps) {
  const { t, locale } = useLanguage();
  const isEn = locale === "en-US";
  const fnsLocale = isEn ? enUSDateFns : zhCN;
  const priorityConfig = buildPriorityConfig(t);
  const statusConfig = buildStatusConfig(t);
  const [zoom, setZoom] = useState<TimelineZoom>("week");
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [showDeps, setShowDeps] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const barAreaRef = useRef<HTMLDivElement>(null);

  const visibleDays = useMemo(() => {
    if (zoom === "day") return weekDays.filter((d) => isToday(d)).length > 0 ? [weekDays.find((d) => isToday(d))!] : [weekDays[0]];
    if (zoom === "3day") {
      const todayIdx = weekDays.findIndex((d) => isToday(d));
      const start = Math.max(0, todayIdx >= 0 ? todayIdx : 0);
      return weekDays.slice(start, start + 3);
    }
    return weekDays;
  }, [zoom, weekDays]);

  const startHour = 0;
  const endHour = 24;
  const totalHours = endHour - startHour;
  const totalCols = visibleDays.length * totalHours;
  const hourWidthPx = zoom === "day" ? 100 : zoom === "3day" ? 60 : 36;
  const totalWidth = totalCols * hourWidthPx;
  const labelWidth = 180;

  const now = new Date();
  const nowDayIdx = visibleDays.findIndex((d) => isSameDay(d, now));
  const nowHourFraction = now.getHours() + now.getMinutes() / 60;
  const nowPx = nowDayIdx >= 0 && nowHourFraction >= startHour && nowHourFraction <= endHour
    ? (nowDayIdx * totalHours + (nowHourFraction - startHour)) * hourWidthPx
    : null;

  const categorized = useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>();
    const sorted = [...events]
      .filter((e) => visibleDays.some((d) => isSameDay(d, e.date)))
      .sort((a, b) => a.date.getTime() - b.date.getTime() || a.startHour - b.startHour);
    sorted.forEach((e) => {
      const list = map.get(e.category) || [];
      list.push(e);
      map.set(e.category, list);
    });
    return map;
  }, [events, visibleDays]);

  const categoryOrder = [t("cal.mock.cat.work"), t("cal.mock.cat.meeting"), t("cal.mock.cat.dev"), t("cal.mock.cat.design"), t("cal.mock.cat.health"), t("cal.mock.cat.learning")];
  const sortedCategories = [...categorized.keys()].sort(
    (a, b) => (categoryOrder.indexOf(a) === -1 ? 99 : categoryOrder.indexOf(a)) - (categoryOrder.indexOf(b) === -1 ? 99 : categoryOrder.indexOf(b))
  );

  const categoryColors: Record<string, string> = {
    [t("cal.mock.cat.work")]: "bg-blue-500", [t("cal.mock.cat.meeting")]: "bg-purple-500", [t("cal.mock.cat.dev")]: "bg-cyan-500",
    [t("cal.mock.cat.design")]: "bg-pink-500", [t("cal.mock.cat.health")]: "bg-emerald-500", [t("cal.mock.cat.learning")]: "bg-rose-400",
  };

  const toggleGroup = (cat: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const getBarStyle = (event: ScheduleEvent) => {
    const dayIdx = visibleDays.findIndex((d) => isSameDay(d, event.date));
    if (dayIdx < 0) return null;
    const leftCol = dayIdx * totalHours + (event.startHour - startHour);
    const widthCols = event.duration;
    return {
      left: leftCol * hourWidthPx,
      width: Math.max(widthCols * hourWidthPx - 2, hourWidthPx * 0.3),
    };
  };

  const getProgress = (event: ScheduleEvent) => {
    if (!event.subtasks || event.subtasks.length === 0) {
      return event.status === "done" ? 100 : event.status === "in_progress" ? 40 : 0;
    }
    const done = event.subtasks.filter((s) => s.done).length;
    return Math.round((done / event.subtasks.length) * 100);
  };

  useEffect(() => {
    if (nowPx !== null && scrollRef.current) {
      scrollRef.current.scrollLeft = Math.max(0, nowPx - 200);
    }
  }, [nowPx, zoom]);

  const flatEvents = useMemo(() => {
    const list: { event: ScheduleEvent; rowIdx: number }[] = [];
    let row = 0;
    sortedCategories.forEach((cat) => {
      row++;
      if (!collapsedGroups.has(cat)) {
        const evts = categorized.get(cat) || [];
        evts.forEach((e) => {
          list.push({ event: e, rowIdx: row });
          row++;
        });
      }
    });
    return list;
  }, [sortedCategories, categorized, collapsedGroups]);

  const rowHeight = 44;
  const headerRowHeight = 32;

  const fmtTime = (h: number) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;

  return (
    <motion.div
      key="timeline-view"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col h-full"
    >
      {/* Toolbar */}
      <div className="shrink-0 flex items-center justify-between gap-2 px-4 py-2.5 sm:px-6 border-b border-border/30 bg-card/60 backdrop-blur-sm flex-wrap">
        <div className="flex items-center gap-2">
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
                  zoom === z.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
                style={{ fontWeight: zoom === z.key ? 600 : 400 }}
              >
                {z.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (scrollRef.current && nowPx !== null) {
                scrollRef.current.scrollTo({ left: Math.max(0, nowPx - 200), behavior: "smooth" });
              }
            }}
            className="flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-2 py-1 text-[0.6875rem] text-primary hover:bg-primary/10 transition-colors"
            style={{ fontWeight: 500 }}
          >
            <Target className="h-3 w-3" />
            {t("cal.today")}
          </button>
        </div>
        <div className="flex items-center gap-2">
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
          <div className="hidden sm:flex items-center gap-3 text-[0.6875rem] text-muted-foreground">
            <span>{t("cal.nEvents").replace("{n}", String(events.filter((e) => visibleDays.some((d) => isSameDay(d, e.date))).length))}</span>
            <span>·</span>
            <span>{t("cal.nDone").replace("{n}", String(events.filter((e) => visibleDays.some((d) => isSameDay(d, e.date)) && e.status === "done").length))}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left labels */}
        <div className="shrink-0 border-r border-border/40 bg-card" style={{ width: labelWidth }}>
          <div className="h-[60px] border-b border-border/40 px-3 flex items-end pb-1.5">
            <span className="text-[0.625rem] text-muted-foreground/50">{t("cal.catTask")}</span>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "calc(100% - 60px)" }}>
            {sortedCategories.map((cat) => {
              const catEvents = categorized.get(cat) || [];
              const isCollapsed = collapsedGroups.has(cat);
              const catColor = categoryColors[cat] || "bg-gray-400";
              return (
                <div key={cat}>
                  <button
                    onClick={() => toggleGroup(cat)}
                    className="flex w-full items-center gap-2 px-3 hover:bg-muted/30 transition-colors"
                    style={{ height: headerRowHeight }}
                  >
                    <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                    <div className={`h-2 w-2 rounded-full ${catColor}`} />
                    <span className="text-[0.6875rem] text-muted-foreground truncate" style={{ fontWeight: 600 }}>{cat}</span>
                    <Badge className="ml-auto bg-muted/50 text-muted-foreground text-[0.5rem] h-3.5 px-1 hover:bg-muted/50">{catEvents.length}</Badge>
                  </button>
                  <AnimatePresence>
                    {!isCollapsed && catEvents.map((event) => {
                      const progress = getProgress(event);
                      const isHovered = hoveredEvent === event.id;
                      const prioColor = event.priority === "urgent" ? "bg-red-500" : event.priority === "high" ? "bg-orange-400" : event.priority === "medium" ? "bg-blue-400" : "bg-gray-300";
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: rowHeight }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex items-center gap-2 px-3 border-b border-border/10 cursor-pointer transition-colors ${isHovered ? "bg-primary/5" : "hover:bg-muted/20"}`}
                          style={{ height: rowHeight }}
                          onMouseEnter={() => setHoveredEvent(event.id)}
                          onMouseLeave={() => setHoveredEvent(null)}
                          onClick={() => onSelectEvent(event)}
                        >
                          <button onClick={(e) => { e.stopPropagation(); onToggleStatus(event.id); }} className="shrink-0">
                            {event.status === "done" ? (
                              <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                                <Check className="h-2.5 w-2.5 text-white" />
                              </div>
                            ) : event.status === "blocked" ? (
                              <div className="h-4 w-4 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertTriangle className="h-2.5 w-2.5 text-red-500" />
                              </div>
                            ) : (
                              <Circle className={`h-4 w-4 ${event.status === "in_progress" ? "text-blue-400" : "text-muted-foreground/30"}`} />
                            )}
                          </button>
                          <div className={`h-2 w-2 rounded-full shrink-0 ${prioColor}`} />
                          <div className="flex-1 min-w-0">
                            <span className={`truncate text-[0.6875rem] block ${event.status === "done" ? "line-through text-muted-foreground" : ""}`} style={{ fontWeight: 500 }}>{event.title}</span>
                          </div>
                          {progress > 0 && progress < 100 && (
                            <span className="text-[0.5625rem] text-muted-foreground shrink-0">{progress}%</span>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right scrollable timeline */}
        <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-auto">
          <div style={{ width: totalWidth, minHeight: "100%" }} className="relative">
            {/* Time header */}
            <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border/40" style={{ height: 60 }}>
              <div className="flex h-[28px] border-b border-border/20">
                {visibleDays.map((day) => {
                  const dayW = totalHours * hourWidthPx;
                  const td = isToday(day);
                  return (
                    <div key={day.toISOString()} className={`shrink-0 flex items-center justify-center text-[0.6875rem] border-r border-border/20 ${td ? "bg-primary/5 text-primary" : "text-muted-foreground"}`} style={{ width: dayW, fontWeight: td ? 600 : 400 }}>
                      {format(day, isEn ? "MMM d, EEE" : "M月d日 EEE", { locale: fnsLocale })}
                    </div>
                  );
                })}
              </div>
              <div className="flex h-[32px]">
                {visibleDays.flatMap((day) =>
                  Array.from({ length: totalHours }, (_, h) => {
                    const hour = startHour + h;
                    return (
                      <div key={`${day.toISOString()}-${hour}`} className="shrink-0 flex items-center justify-center text-[0.5625rem] text-muted-foreground/60 border-r border-border/10" style={{ width: hourWidthPx }}>
                        {hour}:00
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Grid + bars */}
            <div
              ref={barAreaRef}
              className="relative"
              onDoubleClick={(e) => {
                if (!onDoubleClickSlot) return;
                // Only trigger if clicking on empty area (not on a bar)
                if ((e.target as HTMLElement).closest("[data-event-bar]")) return;
                const rect = barAreaRef.current?.getBoundingClientRect();
                if (!rect) return;
                const relX = e.clientX - rect.left + (scrollRef.current?.scrollLeft || 0);
                const colIdx = Math.floor(relX / hourWidthPx);
                const dayIdx = Math.floor(colIdx / totalHours);
                const hourIdx = colIdx % totalHours;
                if (dayIdx >= 0 && dayIdx < visibleDays.length) {
                  onDoubleClickSlot({ date: visibleDays[dayIdx], startHour: startHour + hourIdx });
                }
              }}
            >
              {/* Vertical grid */}
              {visibleDays.flatMap((day, di) =>
                Array.from({ length: totalHours + 1 }, (_, h) => {
                  const x = (di * totalHours + h) * hourWidthPx;
                  return (
                    <div key={`g-${di}-${h}`} className={`absolute top-0 ${h === 0 ? "border-l border-border/40" : "border-l border-border/[0.08]"}`} style={{ left: x, height: "100%" }} />
                  );
                })
              )}

              {/* Now line */}
              {nowPx !== null && (
                <div className="absolute top-0 z-20" style={{ left: nowPx, height: "100%" }}>
                  <div className="relative h-full">
                    <div className="absolute -top-1 -left-[5px] w-[10px] h-[10px] rounded-full bg-red-500 border-2 border-white shadow-sm" />
                    <div className="w-[2px] h-full bg-red-500/70" />
                  </div>
                </div>
              )}

              {/* Categories + bars */}
              {sortedCategories.map((cat) => {
                const catEvents = categorized.get(cat) || [];
                const isCollapsed = collapsedGroups.has(cat);
                return (
                  <div key={cat}>
                    <div className="border-b border-border/10 bg-muted/[0.03]" style={{ height: headerRowHeight }} />
                    {!isCollapsed && catEvents.map((event, i) => {
                      const barStyle = getBarStyle(event);
                      if (!barStyle) return <div key={event.id} style={{ height: rowHeight }} className="border-b border-border/10" />;
                      const progress = getProgress(event);
                      const isHovered = hoveredEvent === event.id;
                      const isDone = event.status === "done";
                      const isBlocked = event.status === "blocked";
                      return (
                        <div
                          key={event.id}
                          className={`relative border-b border-border/10 transition-colors ${isHovered ? "bg-primary/[0.03]" : ""}`}
                          style={{ height: rowHeight }}
                          onMouseEnter={() => setHoveredEvent(event.id)}
                          onMouseLeave={() => setHoveredEvent(null)}
                        >
                          <motion.div
                            data-event-bar
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.45, delay: 0.05 + i * 0.03, ease: "easeOut" }}
                            onClick={() => onSelectEvent(event)}
                            className={`absolute top-[6px] rounded-md cursor-pointer group origin-left transition-all ${isDone ? "opacity-50" : isBlocked ? "opacity-70" : "opacity-90 hover:opacity-100"} ${isHovered ? "shadow-md ring-2 ring-primary/20 z-10" : "shadow-sm"}`}
                            style={{ left: barStyle.left, width: barStyle.width, height: rowHeight - 12 }}
                          >
                            <div className={`absolute inset-0 rounded-md ${event.color} ${isDone ? "opacity-40" : isBlocked ? "opacity-50" : ""}`} />
                            {progress > 0 && progress < 100 && (
                              <div className="absolute inset-y-0 left-0 rounded-l-md bg-white/20" style={{ width: `${progress}%` }} />
                            )}
                            {isBlocked && (
                              <div className="absolute inset-0 rounded-md opacity-30" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px)" }} />
                            )}
                            <div className="relative z-10 flex items-center h-full px-2 gap-1.5 min-w-0">
                              {event.hasMeeting && <Video className="h-2.5 w-2.5 text-white/80 shrink-0" />}
                              {event.isRecurring && <Repeat className="h-2.5 w-2.5 text-white/80 shrink-0" />}
                              {event.aiSuggested && <Sparkles className="h-2.5 w-2.5 text-white/80 shrink-0" />}
                              <span className="truncate text-[0.5625rem] text-white" style={{ fontWeight: 600 }}>{event.title}</span>
                              {barStyle.width > 100 && (
                                <span className="text-[0.5rem] text-white/60 shrink-0 ml-auto">
                                  {fmtTime(event.startHour)} – {fmtTime(event.startHour + event.duration)}
                                </span>
                              )}
                            </div>
                            {progress > 0 && (
                              <div className="absolute bottom-0.5 left-2 right-2 h-[2px] rounded-full bg-black/10 overflow-hidden">
                                <div className="h-full rounded-full bg-white/60" style={{ width: `${progress}%` }} />
                              </div>
                            )}
                          </motion.div>
                          {/* Tooltip */}
                          <AnimatePresence>
                            {isHovered && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 4 }}
                                className="absolute z-30 top-full mt-1 rounded-lg border border-border/50 bg-card px-3 py-2 shadow-lg pointer-events-none whitespace-nowrap"
                                style={{ left: Math.min(barStyle.left, totalWidth - 260) }}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <div className={`h-2 w-2 rounded-full ${event.color}`} />
                                  <span className="text-[0.75rem]" style={{ fontWeight: 600 }}>{event.title}</span>
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[0.625rem] text-muted-foreground">
                                  <span>⏰ {fmtTime(event.startHour)} – {fmtTime(event.startHour + event.duration)}</span>
                                  <span>📂 {event.category}</span>
                                  <span>⏱ {event.duration}h</span>
                                  {event.location && <span>📍 {event.location}</span>}
                                  {event.subtasks && <span>✅ {event.subtasks.filter((s) => s.done).length}/{event.subtasks.length} {t("cal.subtasks")}</span>}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <Badge className={`${statusConfig[event.status].color} text-[0.5rem] h-3.5 px-1 hover:${statusConfig[event.status].color}`}>{statusConfig[event.status].label}</Badge>
                                  <Badge className={`${priorityConfig[event.priority].color} text-[0.5rem] h-3.5 px-1 border`}>{priorityConfig[event.priority].label}</Badge>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Dependency arrows */}
              {showDeps && (
                <svg className="absolute inset-0 pointer-events-none" style={{ width: totalWidth, height: "100%", overflow: "visible" }}>
                  <defs>
                    <marker id="arrowhead" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
                      <polygon points="0 0, 6 2.5, 0 5" fill="currentColor" className="text-primary/40" />
                    </marker>
                  </defs>
                  {mockDependencies.map(([fromId, toId]) => {
                    const fromEntry = flatEvents.find((f) => f.event.id === fromId);
                    const toEntry = flatEvents.find((f) => f.event.id === toId);
                    if (!fromEntry || !toEntry) return null;
                    const fromBar = getBarStyle(fromEntry.event);
                    const toBar = getBarStyle(toEntry.event);
                    if (!fromBar || !toBar) return null;
                    const fromX = fromBar.left + fromBar.width;
                    const fromY = fromEntry.rowIdx * rowHeight + rowHeight / 2;
                    const toX = toBar.left;
                    const toY = toEntry.rowIdx * rowHeight + rowHeight / 2;
                    const midX = (fromX + toX) / 2;
                    return (
                      <path
                        key={`dep-${fromId}-${toId}`}
                        d={`M${fromX},${fromY} C${midX},${fromY} ${midX},${toY} ${toX},${toY}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        className="text-primary/30"
                        markerEnd="url(#arrowhead)"
                      />
                    );
                  })}
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom legend */}
      <div className="shrink-0 border-t border-border/30 bg-card/80 backdrop-blur-sm px-4 py-2 sm:px-6 flex items-center justify-between flex-wrap gap-2">
        <div className="flex flex-wrap gap-3">
          {sortedCategories.map((cat) => {
            const catColor = categoryColors[cat] || "bg-gray-400";
            const count = (categorized.get(cat) || []).length;
            return (
              <div key={cat} className="flex items-center gap-1.5 text-[0.6875rem] text-muted-foreground">
                <div className={`h-2.5 w-2.5 rounded-full ${catColor}`} />
                {cat} ({count})
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 text-[0.625rem] text-muted-foreground/60">
          <div className="flex items-center gap-1">
            <div className="w-4 h-[2px] bg-red-500/70 rounded" />
            <span>{isEn ? "Now" : "当前时刻"}</span>
          </div>
          {showDeps && (
            <div className="flex items-center gap-1">
              <div className="w-4 h-[1.5px] border-t-[1.5px] border-dashed border-primary/30" />
              <span>{t("cal.deps")}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <div className="h-2 w-4 rounded-sm bg-white/20 border border-muted-foreground/20" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)" }} />
            <span>{t("cal.status.blocked")}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════ Component ═══════════════ */
export function CalendarPage() {
  const { t, locale, dateLocale } = useLanguage();
  const isEn = locale === "en-US";
  const fnsLocale = isEn ? enUSDateFns : zhCN;
  const [view, setView] = useState<ViewType>("calendar");
  const [currentDate, setCurrentDate] = useState(today);
  const priorityConfig = buildPriorityConfig(t);
  const statusConfig = buildStatusConfig(t);
  const [events, setEvents] = useState<ScheduleEvent[]>(() => buildMockEvents(t));
  // focusMode removed — now at /focus
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<{ role: "ai" | "user"; text: string }[]>([
    { role: "ai", text: isEn ? "Hi! I can help you schedule smartly. Try typing \"meeting at 3pm tomorrow\" or \"find a 2-hour free slot for deep work\"." : "你好！我可以帮你智能安排日程。试试输入「明天下午三点开会」或「帮我找一个两小时的空闲时段做深度工作」。" },
  ]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [addEventPreset, setAddEventPreset] = useState<AddEventPreset | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [showSync, setShowSync] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const [externalEvents, setExternalEvents] = useState<ExternalEvent[]>([]);
  const [calConflicts, setCalConflicts] = useState<ConflictInfo[]>([]);
  const aiEndRef = useRef<HTMLDivElement>(null);
  const calendarScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  // Auto-scroll calendar to current hour area on mount / view change
  useEffect(() => {
    if (view === "calendar" && calendarScrollRef.current) {
      const now = new Date();
      const scrollToHour = Math.max(0, now.getHours() - 2);
      const rowHeight = 56; // h-14 = 56px
      setTimeout(() => {
        calendarScrollRef.current?.scrollTo({ top: scrollToHour * rowHeight, behavior: "smooth" });
      }, 100);
    }
  }, [view]);

  // Close tools menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setShowToolsMenu(false);
      }
    };
    if (showToolsMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showToolsMenu]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const todayEvents = events.filter((e) => isSameDay(e.date, today));
  const completedToday = todayEvents.filter((e) => e.status === "done").length;
  const todayProgress = todayEvents.length ? Math.round((completedToday / todayEvents.length) * 100) : 0;

  // Month days for calendar month view fallback
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const monthStartDay = getDay(monthStart); // 0=Sun

  const navigateWeek = (dir: 1 | -1) => {
    setCurrentDate((d) => (dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1)));
  };

  const getEventsForDay = (day: Date) => events.filter((e) => isSameDay(e.date, day));

  // Merge external events as ScheduleEvent-shaped objects for display in views
  const mergedExternalForDay = (day: Date): ScheduleEvent[] =>
    externalEvents
      .filter((e) => isSameDay(e.date, day))
      .map((e) => ({
        id: `ext-${e.id}`,
        title: e.title,
        date: e.date,
        startHour: e.startHour,
        duration: e.duration,
        color: e.color,
        priority: "medium" as Priority,
        status: "todo" as Status,
        category: e.sourceType === "google" ? "Google" : e.sourceType === "apple" ? "iCloud" : e.sourceType === "outlook" ? "Outlook" : (isEn ? "External" : "外部"),
        tags: [e.sourceType],
        location: e.location,
        hasMeeting: !!e.attendees?.length,
        isRecurring: false,
      }));

  const getAllEventsForDay = (day: Date) => [
    ...getEventsForDay(day),
    ...mergedExternalForDay(day),
  ];

  const handleAISend = () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput.trim();
    setAiMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setAiInput("");

    setTimeout(() => {
      let response = "";
      if (userMsg.includes("会") || userMsg.includes("开会") || userMsg.includes("meeting")) {
        response = isEn
          ? "Event created:\n📅 Tomorrow 15:00 – 16:00\n📋 \"Team Meeting\"\n🏷️ Priority: Med | Category: Meeting\n\nNo time conflicts detected. Need to send invites?"
          : "已为你创建日程：\n📅 明天 15:00 – 16:00\n📋 「团队会议」\n🏷️ 优先级：中 | 分类：会议\n\n已自动检查时间冲突，该时段空闲可用。是否需要发送会议邀请？";
      } else if (userMsg.includes("空闲") || userMsg.includes("深度工作") || userMsg.includes("free") || userMsg.includes("deep work")) {
        response = isEn
          ? "After analyzing your schedule, I recommend these deep work slots:\n\n🟢 Tomorrow 09:00-11:00 (peak energy)\n🟡 Day after 14:00-16:00 (no meeting conflicts)\n🟢 Friday 09:00-12:00 (full morning)\n\nI suggest tomorrow morning — it's historically your most productive slot. Shall I schedule it?"
          : "分析了你本周的日程后，我推荐以下深度工作时段：\n\n🟢 明天 09:00-11:00（精力高峰期）\n🟡 后天 14:00-16:00（无会议冲突）\n🟢 周五 09:00-12:00（完整的上午时段）\n\n建议选择明天上午的时段，这是你历史效率最高的时间段。需要我自动排入吗？";
      } else if (userMsg.includes("优化") || userMsg.includes("建议") || userMsg.includes("optimize") || userMsg.includes("suggest")) {
        response = isEn
          ? "Based on your efficiency patterns:\n\n⚡ Move \"Product Docs\" to 9-11 AM (your peak hours)\n☕ Schedule lightweight meetings at 2-3 PM\n🧠 \"Code Review\" works best in early afternoon\n📊 Workload is high this week — consider moving \"Weekly Report\" to Friday PM\n\nShall I apply these changes?"
          : "根据你的效率模式分析：\n\n⚡ 建议将「产品文档」移到上午 9-11 点（你的高效时段）\n☕ 下午 2-3 点适合安排轻量级会议\n🧠 「代码审查」建议放在午后，避免与深度工作冲突\n📊 本周工作负荷略高，建议将「周报」推迟到周五下午\n\n要我自动应用这些调整吗？";
      } else {
        response = isEn
          ? "Got it! Let me analyze your schedule...\n\nBased on your tasks and energy curve, I suggest:\n1. High-energy tasks in the morning 9-12\n2. Meetings concentrated at 2-4 PM\n3. Keep at least 1 hour buffer daily\n\nWhich events would you like me to adjust?"
          : "收到！让我分析一下你的日程...\n\n基于你当前的任务分布和精力曲线，我建议：\n1. 高能耗任务安排在上午 9-12 点\n2. 会议集中在下午 2-4 点\n3. 保留每天至少 1 小时的缓冲时间\n\n需要我帮你具体调整哪些日程？";
      }
      setAiMessages((prev) => [...prev, { role: "ai", text: response }]);
    }, 800);
  };

  const toggleEventStatus = (id: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: e.status === "done" ? "todo" : "done" }
          : e
      )
    );
  };

  const toggleSubtask = (eventId: string, subtaskId: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId || !e.subtasks) return e;
        return {
          ...e,
          subtasks: e.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, done: !st.done } : st
          ),
        };
      })
    );
    setSelectedEvent((prev) => {
      if (!prev || prev.id !== eventId || !prev.subtasks) return prev;
      return {
        ...prev,
        subtasks: prev.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, done: !st.done } : st
        ),
      };
    });
  };

  const openAddEvent = (preset?: AddEventPreset) => {
    setAddEventPreset(preset || null);
    setShowAddEvent(true);
  };

  const handleAddEventSubmit = (data: NewEventData) => {
    setEvents((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        title: data.title,
        date: data.date,
        startHour: data.startHour,
        duration: data.duration,
        color: data.color,
        priority: data.priority,
        status: "todo" as Status,
        category: data.category,
        tags: data.tags,
        location: data.location || undefined,
        isRecurring: data.isRecurring,
        hasMeeting: data.hasMeeting,
        aiSuggested: false,
      },
    ]);
  };

  const views = [
    { key: "calendar" as ViewType, label: t("cal.view.calendar"), icon: CalendarDays },
    { key: "list" as ViewType, label: t("cal.view.list"), icon: List },
    { key: "kanban" as ViewType, label: t("cal.view.kanban"), icon: Columns3 },
    { key: "timeline" as ViewType, label: t("cal.view.timeline"), icon: GanttChart },
  ];

  return (
    <div className="flex h-full flex-col bg-background">
      {/* ───── Top Bar ───── */}
      <div className="relative z-40 shrink-0 border-b border-border/50 bg-card/80 backdrop-blur-sm px-3 py-2.5 sm:px-6 sm:py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
            {/* View switcher */}
            <div className="flex gap-0.5 rounded-xl bg-muted/50 p-1 shrink-0">
              {views.map((v) => (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={`flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 text-[0.75rem] sm:text-[0.8125rem] transition-all ${
                    view === v.key
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={{ fontWeight: view === v.key ? 600 : 400 }}
                >
                  <v.icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{v.label}</span>
                </button>
              ))}
            </div>

            {/* Date nav */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={() => navigateWeek(-1)}
                className="rounded-lg p-1 sm:p-1.5 text-muted-foreground hover:bg-muted/60 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentDate(today)}
                className="rounded-lg px-2 sm:px-3 py-1 text-[0.75rem] sm:text-[0.8125rem] text-muted-foreground hover:bg-muted/60 transition-colors"
                style={{ fontWeight: 500 }}
              >
                {t("cal.today")}
              </button>
              <button
                onClick={() => navigateWeek(1)}
                className="rounded-lg p-1 sm:p-1.5 text-muted-foreground hover:bg-muted/60 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="text-[0.75rem] sm:text-[0.9375rem] ml-1 whitespace-nowrap" style={{ fontWeight: 600 }}>
                {format(weekStart, isEn ? "MMM d" : "M月d日", { locale: fnsLocale })} – {format(addDays(weekStart, 6), isEn ? "MMM d" : "M月d日", { locale: fnsLocale })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* ── Tools Dropdown ── */}
            <div className="relative z-50" ref={toolsMenuRef}>
              <button
                onClick={() => setShowToolsMenu((v) => !v)}
                className={`flex items-center gap-1.5 rounded-xl px-2 sm:px-3 py-1.5 text-[0.75rem] sm:text-[0.8125rem] transition-all ${
                  showToolsMenu || showAI || externalEvents.length > 0
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
                style={{ fontWeight: showToolsMenu ? 600 : 400 }}
              >
                <Wrench className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("cal.tools")}</span>
                {externalEvents.length > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[0.5625rem] px-1" style={{ fontWeight: 600 }}>
                    {externalEvents.length}
                  </span>
                )}
                <ChevronDown className={`h-3 w-3 transition-transform ${showToolsMenu ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showToolsMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full z-[999] mt-1.5 w-56 rounded-xl border border-border/50 bg-white p-1.5 shadow-lg"
                  >
                    {/* AI 排期 */}
                    <button
                      onClick={() => { setShowAI(!showAI); setShowToolsMenu(false); }}
                      className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[0.8125rem] text-left transition-colors ${
                        showAI ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${showAI ? "bg-primary/15" : "bg-muted/50"}`}>
                        <Brain className={`h-3.5 w-3.5 ${showAI ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div style={{ fontWeight: 500 }}>{isEn ? "AI Smart Scheduling" : "AI 智能排期"}</div>
                        <div className="text-[0.6875rem] text-muted-foreground">{isEn ? "Natural language scheduling" : "自然语言创建与优化日程"}</div>
                      </div>
                      {showAI && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                    </button>

                    {/* 邮件聚合 */}
                    <button
                      onClick={() => { setShowEmail(true); setShowToolsMenu(false); }}
                      className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[0.8125rem] text-left text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <Mail className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div style={{ fontWeight: 500 }}>{t("emailAgg.title")}</div>
                        <div className="text-[0.6875rem] text-muted-foreground">{isEn ? "Scan itineraries, invites, bills" : "扫描行程单、邀请函、账单"}</div>
                      </div>
                    </button>

                    {/* 会议辅助 */}
                    <button
                      onClick={() => { setShowMeeting(true); setShowToolsMenu(false); }}
                      className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[0.8125rem] text-left text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                        <Video className="h-3.5 w-3.5 text-indigo-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5" style={{ fontWeight: 500 }}>
                          {t("meetingAssist.title")}
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-px text-[0.5625rem] text-amber-700">
                            <Crown className="h-2 w-2" /> Pro
                          </span>
                        </div>
                        <div className="text-[0.6875rem] text-muted-foreground">{isEn ? "Recording summaries, extract tasks" : "录音摘要、自动提取任务"}</div>
                      </div>
                    </button>

                    <div className="mx-2 my-1 h-px bg-border/30" />

                    {/* 日历聚合 */}
                    <button
                      onClick={() => { setShowSync(true); setShowToolsMenu(false); }}
                      className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[0.8125rem] text-left text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${externalEvents.length > 0 ? "bg-emerald-50" : "bg-muted/50"}`}>
                        <Link2 className={`h-3.5 w-3.5 ${externalEvents.length > 0 ? "text-emerald-600" : "text-muted-foreground"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div style={{ fontWeight: 500 }}>{t("calSync.title")}</div>
                        <div className="text-[0.6875rem] text-muted-foreground">{isEn ? "Bi-directional sync · Conflict detection" : "双向同步 · 冲突检测"}</div>
                      </div>
                      {externalEvents.length > 0 && (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[0.5625rem] px-1 shrink-0" style={{ fontWeight: 600 }}>
                          {externalEvents.length}
                        </span>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Add */}
            <Button
              onClick={() => openAddEvent()}
              size="sm"
              className="rounded-xl bg-primary text-white hover:bg-primary/90 text-[0.75rem] sm:text-[0.8125rem]"
            >
              <Plus className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">{t("cal.addEvent")}</span>
            </Button>
          </div>
        </div>

        {/* Conflict banner */}
        {calConflicts.length > 0 && (
          <div className="mt-2">
            <ConflictBanner
              conflicts={calConflicts}
              onViewDetails={() => setShowSync(true)}
            />
          </div>
        )}

        {/* Focus mode removed — now a standalone page at /focus */}
      </div>

      {/* ───── Main Content ───── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main view area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            {/* ═══ CALENDAR VIEW ═══ */}
            {view === "calendar" && (() => {
              const nowDate = new Date();
              const nowHourFrac = nowDate.getHours() + nowDate.getMinutes() / 60;
              const ROW_H = 56; // h-14 = 56px per hour row
              const todayColIdx = weekDays.findIndex((d) => isToday(d));

              return (
              <motion.div
                key="calendar-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="h-full flex flex-col"
              >
                <div className="overflow-x-auto min-w-0 flex flex-col flex-1">
                <div className="min-w-[700px] flex flex-col flex-1">
                {/* Week header */}
                <div className="sticky top-0 z-20 grid grid-cols-[48px_repeat(7,1fr)] sm:grid-cols-[60px_repeat(7,1fr)] border-b border-border/40 bg-card/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <div className="border-r border-border/20 flex items-end justify-center pb-2">
                    <span className="text-[0.625rem] text-muted-foreground/50 uppercase tracking-wider">GMT+8</span>
                  </div>
                  {weekDays.map((day) => {
                    const isT = isToday(day);
                    const dayEvents = getAllEventsForDay(day);
                    return (
                      <div
                        key={day.toISOString()}
                        className={`border-r border-border/20 px-2 py-3 text-center transition-colors ${isT ? "bg-primary/[0.04]" : ""}`}
                      >
                        <div className={`text-[0.6875rem] uppercase tracking-wide ${isT ? "text-primary" : "text-muted-foreground/70"}`}>
                          {format(day, "EEE", { locale: fnsLocale })}
                        </div>
                        <div
                          className={`mx-auto mt-1 flex h-9 w-9 items-center justify-center rounded-full text-[0.9375rem] transition-all ${
                            isT ? "bg-primary text-white shadow-md shadow-primary/25" : "hover:bg-muted/50"
                          }`}
                          style={{ fontWeight: isT ? 700 : 500 }}
                        >
                          {format(day, "d")}
                        </div>
                        {dayEvents.length > 0 && (
                          <div className="mt-1.5 flex justify-center gap-1">
                            {dayEvents.slice(0, 4).map((e) => (
                              <div key={e.id} className={`h-1.5 w-1.5 rounded-full ${e.color} ring-1 ring-white`} />
                            ))}
                            {dayEvents.length > 4 && (
                              <span className="text-[0.5rem] text-muted-foreground/50">+{dayEvents.length - 4}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Time grid - scrollable */}
                <div className="flex-1 overflow-y-auto relative" ref={calendarScrollRef}>
                  <div className="grid grid-cols-[48px_repeat(7,1fr)] sm:grid-cols-[60px_repeat(7,1fr)] relative">
                  {HOURS.map((hour) => {
                    const isWorkHour = hour >= 8 && hour < 18;
                    const isNightHour = hour >= 22 || hour < 6;
                    return (
                    <div key={hour} className="contents">
                      <div className={`border-r border-border/20 py-0 pr-2 text-right h-14 relative ${isNightHour ? "bg-slate-50/50" : ""}`}>
                        <span className={`relative -top-2 text-[0.6875rem] ${isWorkHour ? "text-muted-foreground/80" : "text-muted-foreground/40"}`}>
                          {hour.toString().padStart(2, "0")}:00
                        </span>
                      </div>
                      {weekDays.map((day) => {
                        const dayEvents = getAllEventsForDay(day);
                        const startingEvents = dayEvents.filter((e) => Math.floor(e.startHour) === hour);

                        return (
                          <div
                            key={`${day.toISOString()}-${hour}`}
                            onDoubleClick={(e) => {
                              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                              const yRatio = (e.clientY - rect.top) / rect.height;
                              const startH = hour + (yRatio >= 0.5 ? 0.5 : 0);
                              openAddEvent({ date: day, startHour: startH });
                            }}
                            className={`relative border-r border-b h-14 cursor-cell transition-colors ${
                              isToday(day)
                                ? isWorkHour ? "bg-primary/[0.03]" : "bg-primary/[0.015]"
                                : isNightHour ? "bg-slate-50/30" : ""
                            } ${isWorkHour ? "border-border/20" : "border-border/10"} hover:bg-primary/[0.06]`}
                          >
                            {/* Half-hour dashed line */}
                            <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-border/[0.08]" />
                            {startingEvents.map((event) => {
                              const topOffset = (event.startHour - hour) * ROW_H;
                              const height = event.duration * ROW_H - 3;
                              const isShort = height <= 32;
                              return (
                                <motion.div
                                  key={event.id}
                                  initial={{ opacity: 0, scale: 0.96 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  whileHover={{ scale: 1.015, zIndex: 20 }}
                                  onClick={() => setSelectedEvent(event)}
                                  className={`absolute left-1 right-1 z-10 cursor-pointer overflow-hidden rounded-lg ${event.color} px-2.5 py-1.5 text-white shadow-sm hover:shadow-lg transition-shadow border border-white/10`}
                                  style={{ top: topOffset, height: Math.max(height, 24) }}
                                >
                                  <div className="truncate text-[0.6875rem] flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                                    {event.id.startsWith("ext-") && <Link2 className="h-2.5 w-2.5 shrink-0 opacity-70" />}
                                    {event.status === "done" && <CircleCheck className="h-3 w-3 shrink-0 opacity-80" />}
                                    <span className="truncate">{event.title}</span>
                                  </div>
                                  {!isShort && (
                                    <div className="flex items-center gap-1.5 mt-0.5 text-[0.5625rem] text-white/75">
                                      <Clock className="h-2.5 w-2.5" />
                                      {Math.floor(event.startHour)}:{(event.startHour % 1) * 60 === 0 ? "00" : "30"}
                                      –
                                      {Math.floor(event.startHour + event.duration)}:{((event.startHour + event.duration) % 1) * 60 === 0 ? "00" : "30"}
                                      {event.hasMeeting && <Video className="h-2.5 w-2.5 ml-0.5" />}
                                      {event.aiSuggested && <Sparkles className="h-2.5 w-2.5 ml-0.5" />}
                                    </div>
                                  )}
                                  {height > 56 && event.location && (
                                    <div className="flex items-center gap-1 mt-0.5 text-[0.5625rem] text-white/60">
                                      <MapPin className="h-2.5 w-2.5" />
                                      <span className="truncate">{event.location}</span>
                                    </div>
                                  )}
                                  {height > 72 && event.subtasks && event.subtasks.length > 0 && (
                                    <div className="mt-1 flex items-center gap-1.5 text-[0.5625rem] text-white/60">
                                      <div className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
                                        <div className="h-full rounded-full bg-white/60" style={{ width: `${(event.subtasks.filter(s => s.done).length / event.subtasks.length) * 100}%` }} />
                                      </div>
                                      <span>{event.subtasks.filter(s => s.done).length}/{event.subtasks.length}</span>
                                    </div>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                    );
                  })}

                  {/* Current time indicator line */}
                  {todayColIdx >= 0 && (
                    <div
                      className="absolute left-0 right-0 z-[15] pointer-events-none"
                      style={{ top: nowHourFrac * ROW_H }}
                    >
                      {/* Full-width subtle line */}
                      <div className="absolute left-0 right-0 h-[1.5px] bg-red-400/30" />
                      {/* Highlighted line on today's column */}
                      <div
                        className="absolute h-[2px] bg-red-500"
                        style={{
                          left: `calc((48px + (100% - 48px) / 7 * ${todayColIdx}))`,
                          width: `calc((100% - 48px) / 7)`,
                        }}
                      />
                      {/* Red dot indicator */}
                      <div
                        className="absolute w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-300 -translate-y-1/2"
                        style={{
                          left: `calc(48px + (100% - 48px) / 7 * ${todayColIdx} - 5px)`,
                        }}
                      />
                      {/* Time label */}
                      <div
                        className="absolute -translate-y-1/2 text-[0.5625rem] text-red-500 bg-card/90 px-1 py-0.5 rounded"
                        style={{ fontWeight: 600, left: 4 }}
                      >
                        {format(nowDate, "HH:mm")}
                      </div>
                    </div>
                  )}
                  </div>
                </div>
                </div>{/* min-w-[700px] */}
                </div>{/* overflow-x-auto */}
              </motion.div>
              );
            })()}

            {/* ═══ LIST VIEW ═══ */}
            {view === "list" && (
              <motion.div
                key="list-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="p-4 sm:p-6 space-y-6"
              >
                {/* Group by day */}
                {weekDays.map((day) => {
                  const dayEvents = getAllEventsForDay(day);
                  if (dayEvents.length === 0) return null;
                  return (
                    <motion.div
                      key={day.toISOString()}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <div
                          className={`text-[0.9375rem] ${isToday(day) ? "text-primary" : ""}`}
                          style={{ fontWeight: 600 }}
                        >
                          {isToday(day)
                            ? t("cal.today")
                            : format(day, isEn ? "MMM d, EEEE" : "M月d日 EEEE", { locale: fnsLocale })}
                        </div>
                        <Badge variant="secondary" className="text-[0.6875rem]">
                          {dayEvents.length} {isEn ? "events" : "项日程"}
                        </Badge>
                        {isToday(day) && (
                          <span className="text-[0.75rem] text-muted-foreground">
                            · {format(day, isEn ? "MMM d, EEEE" : "M月d日 EEEE", { locale: fnsLocale })}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {dayEvents
                          .sort((a, b) => a.startHour - b.startHour)
                          .map((event, i) => (
                            <motion.div
                              key={event.id}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              onClick={() => setSelectedEvent(event)}
                              className={`group flex items-start gap-2 sm:gap-4 rounded-xl border bg-white p-3 sm:p-4 transition-all cursor-pointer hover:shadow-md ${
                                event.status === "done"
                                  ? "border-border/20 opacity-60"
                                  : "border-border/40 hover:border-primary/30"
                              }`}
                            >
                              {/* Status toggle */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleEventStatus(event.id);
                                }}
                                className="mt-0.5 shrink-0"
                              >
                                {event.status === "done" ? (
                                  <CircleCheck className="h-5 w-5 text-emerald-500" />
                                ) : (
                                  <Circle className="h-5 w-5 text-muted-foreground/40 hover:text-primary transition-colors" />
                                )}
                              </button>

                              {/* Color bar */}
                              <div className={`mt-1 h-10 w-1 shrink-0 rounded-full ${event.color}`} />

                              {/* Content */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div
                                    className={`text-[0.9375rem] ${
                                      event.status === "done" ? "line-through text-muted-foreground" : ""
                                    }`}
                                    style={{ fontWeight: 500 }}
                                  >
                                    {event.title}
                                    {event.aiSuggested && (
                                      <Sparkles className="ml-1.5 inline h-3.5 w-3.5 text-primary" />
                                    )}
                                    {event.id.startsWith("ext-") && (
                                      <Badge className="ml-1.5 inline-flex bg-blue-50 text-blue-600 text-[0.5rem] px-1 py-0 align-middle">
                                        <Link2 className="mr-0.5 h-2 w-2" />{event.category}
                                      </Badge>
                                    )}
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={`shrink-0 text-[0.625rem] ${priorityConfig[event.priority].color}`}
                                  >
                                    {priorityConfig[event.priority].label}
                                  </Badge>
                                </div>

                                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem] text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {Math.floor(event.startHour)}:{(event.startHour % 1) * 60 === 0 ? "00" : "30"} – {Math.floor(event.startHour + event.duration)}:{((event.startHour + event.duration) % 1) * 60 === 0 ? "00" : "30"}
                                  </span>
                                  {event.location && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" /> {event.location}
                                    </span>
                                  )}
                                  {event.isRecurring && (
                                    <span className="flex items-center gap-1">
                                      <Repeat className="h-3 w-3" /> {t("cal.recurring")}
                                    </span>
                                  )}
                                  {event.hasMeeting && (
                                    <span className="flex items-center gap-1">
                                      <Video className="h-3 w-3" /> {isEn ? "Video Meeting" : "视频会议/线上"}
                                    </span>
                                  )}
                                </div>

                                {/* Tags */}
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {event.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="rounded-md bg-muted/50 px-1.5 py-0.5 text-[0.625rem] text-muted-foreground"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>

                                {/* Subtasks */}
                                {event.subtasks && event.subtasks.length > 0 && (
                                  <div className="mt-2.5 space-y-0.5">
                                    {event.subtasks.map((st) => (
                                      <button
                                        key={st.id}
                                        onClick={(e) => { e.stopPropagation(); toggleSubtask(event.id, st.id); }}
                                        className="flex w-full items-center gap-2 text-[0.75rem] rounded-md px-1.5 py-1 -mx-1.5 transition-colors hover:bg-muted/50 text-left group/st"
                                      >
                                        {st.done ? (
                                          <CircleCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                                        ) : (
                                          <Circle className="h-3 w-3 text-muted-foreground/40 shrink-0 group-hover/st:text-primary/60 transition-colors" />
                                        )}
                                        <span className={st.done ? "line-through text-muted-foreground" : ""}>
                                          {st.text}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Energy badge */}
                              {event.energyLevel && (
                                <div className="shrink-0 hidden sm:block">
                                  <div
                                    className={`rounded-lg px-2 py-1 text-[0.625rem] ${
                                      event.energyLevel === "high"
                                        ? "bg-red-50 text-red-600"
                                        : event.energyLevel === "medium"
                                        ? "bg-amber-50 text-amber-600"
                                        : "bg-green-50 text-green-600"
                                    }`}
                                    style={{ fontWeight: 500 }}
                                  >
                                    {event.energyLevel === "high"
                                      ? (isEn ? "⚡ High Energy" : "⚡ 高能耗")
                                      : event.energyLevel === "medium"
                                      ? (isEn ? "💪 Medium" : "💪 中等")
                                      : (isEn ? "🌿 Low Energy" : "🌿 低能耗")}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          ))}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* ═══ KANBAN VIEW ═══ */}
            {view === "kanban" && (
              <motion.div
                key="kanban-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex gap-3 sm:gap-4 overflow-x-auto p-3 sm:p-6 pb-6"
              >
                {(["todo", "in_progress", "done", "blocked"] as Status[]).map(
                  (status, colIdx) => {
                    const columnEvents = events.filter((e) => e.status === status);
                    return (
                      <motion.div
                        key={status}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: colIdx * 0.08 }}
                        className="w-[240px] sm:w-[280px] shrink-0 rounded-2xl bg-muted/30 p-3"
                      >
                        {/* Column header */}
                        <div className="mb-3 flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <Badge className={`${statusConfig[status].color} text-[0.6875rem]`}>
                              {statusConfig[status].label}
                            </Badge>
                            <span className="text-[0.75rem] text-muted-foreground">
                              {columnEvents.length}
                            </span>
                          </div>
                          <button className="rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Cards */}
                        <div className="space-y-2.5">
                          <AnimatePresence>
                            {columnEvents.map((event, i) => (
                              <motion.div
                                key={event.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.04 }}
                                whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                                onClick={() => setSelectedEvent(event)}
                                className="cursor-pointer rounded-xl border border-border/40 bg-white p-3.5 transition-all"
                              >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <Badge
                                    variant="outline"
                                    className={`text-[0.5625rem] ${priorityConfig[event.priority].color}`}
                                  >
                                    {priorityConfig[event.priority].label}
                                  </Badge>
                                  <button className="rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground">
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                <h4 className="text-[0.8125rem] mb-1.5" style={{ fontWeight: 500 }}>
                                  {event.title}
                                  {event.aiSuggested && (
                                    <Sparkles className="ml-1 inline h-3 w-3 text-primary" />
                                  )}
                                </h4>

                                <div className="flex items-center gap-2 text-[0.6875rem] text-muted-foreground mb-2">
                                  <Clock className="h-3 w-3" />
                                  {format(event.date, "M/d")} · {event.duration}h
                                  {event.hasMeeting && <Video className="h-3 w-3 text-blue-500" />}
                                </div>

                                <div className="flex flex-wrap gap-1 mb-2">
                                  {event.tags.slice(0, 2).map((tag) => (
                                    <span
                                      key={tag}
                                      className="rounded bg-muted/50 px-1.5 py-0.5 text-[0.5625rem] text-muted-foreground"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>

                                {/* Subtask progress */}
                                {event.subtasks && event.subtasks.length > 0 && (
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1 rounded-full bg-muted/60 overflow-hidden">
                                      <div
                                        className="h-full rounded-full bg-primary/50"
                                        style={{
                                          width: `${(event.subtasks.filter((s) => s.done).length / event.subtasks.length) * 100}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-[0.5625rem] text-muted-foreground">
                                      {event.subtasks.filter((s) => s.done).length}/{event.subtasks.length}
                                    </span>
                                  </div>
                                )}

                                {/* Color indicator */}
                                <div className={`mt-2.5 h-0.5 w-full rounded-full ${event.color} opacity-40`} />
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  }
                )}
              </motion.div>
            )}

            {/* ═══ TIMELINE / GANTT VIEW ═══ */}
            {view === "timeline" && (
              <TimelineView
                events={events}
                weekDays={weekDays}
                onSelectEvent={setSelectedEvent}
                onToggleStatus={toggleEventStatus}
                onDoubleClickSlot={openAddEvent}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ───── Right sidebar: AI panel or Productivity ───── */}
        <AnimatePresence>
          {showAI && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="hidden md:flex shrink-0 flex-col border-l border-border/50 bg-white overflow-hidden"
            >
              <div className="flex h-12 items-center justify-between border-b border-border/50 px-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-[0.875rem]" style={{ fontWeight: 600 }}>{isEn ? "AI Smart Scheduling" : "AI 智能排期"}</span>
                </div>
                <button
                  onClick={() => setShowAI(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted/60 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Productivity stats */}
              <div className="border-b border-border/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[0.8125rem]" style={{ fontWeight: 500 }}>{t("dashboard.progress")}</span>
                  <span className="text-[0.8125rem] text-primary" style={{ fontWeight: 600 }}>{todayProgress}%</span>
                </div>
                <Progress value={todayProgress} className="h-2" />
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: t("cal.status.todo"), value: todayEvents.filter((e) => e.status === "todo").length, icon: Target, color: "text-blue-600 bg-blue-50" },
                    { label: t("cal.status.inProgress"), value: todayEvents.filter((e) => e.status === "in_progress").length, icon: Flame, color: "text-amber-600 bg-amber-50" },
                    { label: t("cal.status.done"), value: completedToday, icon: CircleCheck, color: "text-emerald-600 bg-emerald-50" },
                  ].map((s) => (
                    <div key={s.label} className={`rounded-lg p-2 text-center ${s.color.split(" ")[1]}`}>
                      <div className={`text-[1rem] ${s.color.split(" ")[0]}`} style={{ fontWeight: 700 }}>{s.value}</div>
                      <div className="text-[0.625rem] text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Energy curve */}
                <div>
                  <div className="text-[0.75rem] text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>{isEn ? "Energy Curve" : "精力曲线"}</div>
                  <div className="flex items-end gap-1 h-10">
                    {[40, 70, 95, 100, 85, 60, 75, 90, 70, 45, 30, 20].map((v, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${v}%` }}
                        transition={{ delay: 0.3 + i * 0.04, duration: 0.4 }}
                        className={`flex-1 rounded-sm ${
                          i >= 2 && i <= 4
                            ? "bg-primary/60"
                            : i >= 7 && i <= 8
                            ? "bg-primary/40"
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[0.5625rem] text-muted-foreground/50 mt-1">
                    <span>7am</span><span>12pm</span><span>6pm</span>
                  </div>
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {aiMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-3 py-2 text-[0.75rem] leading-relaxed whitespace-pre-line ${
                        msg.role === "ai"
                          ? "bg-muted/40 text-foreground"
                          : "bg-primary text-white"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                <div ref={aiEndRef} />
              </div>

              {/* AI input */}
              <div className="shrink-0 border-t border-border/50 p-3">
                <div className="mb-2 flex flex-wrap gap-1">
                  {(isEn ? ["Optimize today", "Find free slots", "Analyze workload"] : ["优化今日日程", "找空闲时段", "分析工作负荷"]).map((q, qi) => (
                    <button
                      key={q}
                      onClick={() => setAiInput(q)}
                      className="rounded-full border border-border/40 px-2 py-0.5 text-[0.625rem] text-muted-foreground hover:bg-muted/50 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <Input
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAISend()}
                    placeholder={isEn ? "Type in natural language..." : "输入自然语言..."}
                    className="rounded-xl text-[0.75rem]"
                  />
                  <Button
                    onClick={handleAISend}
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-xl bg-primary text-white hover:bg-primary/90"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ───── Event Detail Modal ───── */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-[2px]"
              onClick={() => setSelectedEvent(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-[5%] sm:top-[10%] z-[81] w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-2xl border border-border/50 bg-white p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${selectedEvent.color}`} />
                  <h2 className="text-[1.125rem]" style={{ fontWeight: 600 }}>{selectedEvent.title}</h2>
                  {selectedEvent.aiSuggested && (
                    <Badge className="bg-primary/10 text-primary text-[0.625rem]">
                      <Sparkles className="mr-0.5 h-2.5 w-2.5" /> {t("cal.aiSuggested")}
                    </Badge>
                  )}
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted/60 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[0.875rem] text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  {format(selectedEvent.date, isEn ? "EEEE, MMM d, yyyy" : "yyyy年M月d日 EEEE", { locale: fnsLocale })}
                </div>
                <div className="flex items-center gap-3 text-[0.875rem] text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {Math.floor(selectedEvent.startHour)}:{(selectedEvent.startHour % 1) * 60 === 0 ? "00" : "30"} – {Math.floor(selectedEvent.startHour + selectedEvent.duration)}:{((selectedEvent.startHour + selectedEvent.duration) % 1) * 60 === 0 ? "00" : "30"}
                  <span>({selectedEvent.duration}{isEn ? "h" : "小时"})</span>
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center gap-3 text-[0.875rem] text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {selectedEvent.location}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="outline" className={`text-[0.6875rem] ${priorityConfig[selectedEvent.priority].color}`}>
                    {priorityConfig[selectedEvent.priority].label} {isEn ? "Priority" : "优先级"}
                  </Badge>
                  <Badge className={`text-[0.6875rem] ${statusConfig[selectedEvent.status].color}`}>
                    {statusConfig[selectedEvent.status].label}
                  </Badge>
                  <Badge variant="secondary" className="text-[0.6875rem]">{selectedEvent.category}</Badge>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedEvent.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-0.5 rounded-md bg-muted/50 px-2 py-0.5 text-[0.6875rem] text-muted-foreground">
                      <Tag className="h-2.5 w-2.5" /> {tag}
                    </span>
                  ))}
                </div>

                {selectedEvent.subtasks && selectedEvent.subtasks.length > 0 && (
                  <div className="pt-2 border-t border-border/30">
                    <div className="text-[0.8125rem] mb-2" style={{ fontWeight: 600 }}>{t("cal.subtasks")}</div>
                    <div className="space-y-1.5">
                      {selectedEvent.subtasks.map((st) => (
                        <button
                          key={st.id}
                          onClick={() => toggleSubtask(selectedEvent.id, st.id)}
                          className="flex w-full items-center gap-2 text-[0.8125rem] rounded-lg px-2 py-1.5 -mx-2 transition-colors hover:bg-muted/50 text-left group"
                        >
                          {st.done ? (
                            <CircleCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0 group-hover:text-primary/60 transition-colors" />
                          )}
                          <span className={st.done ? "line-through text-muted-foreground" : ""}>{st.text}</span>
                        </button>
                      ))}
                    </div>
                    <Progress
                      value={(selectedEvent.subtasks.filter((s) => s.done).length / selectedEvent.subtasks.length) * 100}
                      className="h-1.5 mt-2"
                    />
                  </div>
                )}

                {selectedEvent.energyLevel && (
                  <div className="flex items-center gap-2 pt-1 text-[0.8125rem] text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    {isEn ? "Energy:" : "精力消耗："}
                    <span style={{ fontWeight: 500 }}>
                      {selectedEvent.energyLevel === "high" ? (isEn ? "⚡ High" : "⚡ 高") : selectedEvent.energyLevel === "medium" ? (isEn ? "💪 Med" : "💪 中") : (isEn ? "🌿 Low" : "🌿 低")}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-2">
                <Button
                  onClick={() => {
                    toggleEventStatus(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                  className="flex-1 rounded-xl bg-primary text-white hover:bg-primary/90"
                >
                  {selectedEvent.status === "done" ? (isEn ? "Mark Incomplete" : "标记未完成") : (isEn ? "Mark Complete" : "标记完成")}
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={() => setSelectedEvent(null)}>
                  {t("common.close")}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ───── Add Event Modal ───── */}
      <AddEventModal
        open={showAddEvent}
        onClose={() => { setShowAddEvent(false); setAddEventPreset(null); }}
        onSubmit={handleAddEventSubmit}
        preset={addEventPreset}
      />

      {/* ───── Calendar Sync Modal ───── */}
      <CalendarSync
        open={showSync}
        onClose={() => setShowSync(false)}
        onEventsUpdate={setExternalEvents}
        onConflictsUpdate={setCalConflicts}
      />

      {/* ───── Email Aggregator Modal ───── */}
      <EmailAggregator
        open={showEmail}
        onClose={() => setShowEmail(false)}
      />

      {/* ───── Meeting Assistant Modal ───── */}
      <MeetingAssistant
        open={showMeeting}
        onClose={() => setShowMeeting(false)}
      />
    </div>
  );
}
