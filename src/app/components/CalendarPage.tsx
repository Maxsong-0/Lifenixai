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
import { TimelineViewV2 } from "./TimelineViewV2";
import { ScheduleListView } from "./ScheduleListView";
import { KanbanBoardView } from "./KanbanBoardView";

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
              <ScheduleListView
                events={[...events, ...weekDays.flatMap((d) => mergedExternalForDay(d))]}
                weekDays={weekDays}
                onSelectEvent={setSelectedEvent}
                onToggleStatus={toggleEventStatus}
                onToggleSubtask={toggleSubtask}
              />
            )}

            {/* ═══ KANBAN VIEW ═══ */}
            {view === "kanban" && (
              <KanbanBoardView
                events={events}
                onSelectEvent={setSelectedEvent}
                onToggleStatus={toggleEventStatus}
                onAddEvent={() => openAddEvent()}
              />
            )}

            {/* ═══ TIMELINE / GANTT VIEW ═══ */}
            {view === "timeline" && (
              <TimelineViewV2
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
