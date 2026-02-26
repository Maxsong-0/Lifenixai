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
import { zhCN } from "date-fns/locale";
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
  Focus,
  Eye,
  EyeOff,
  Tag,
  Flag,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Timer,
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
} from "lucide-react";
import { CalendarSync, ConflictBanner, type ExternalEvent, type ConflictInfo } from "./CalendarSync";
import { EmailAggregator } from "./EmailAggregator";
import { MeetingAssistant } from "./MeetingAssistant";

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

const mockEvents: ScheduleEvent[] = [
  {
    id: "1", title: "深度工作：产品文档", date: today, startHour: 9, duration: 2,
    color: "bg-blue-500", priority: "high", status: "in_progress", category: "工作",
    tags: ["产品", "文档"], energyLevel: "high",
    subtasks: [
      { id: "s1", text: "撰写需求概述", done: true },
      { id: "s2", text: "绘制流程图", done: false },
      { id: "s3", text: "评审反馈整合", done: false },
    ],
  },
  {
    id: "2", title: "团队站会", date: today, startHour: 11, duration: 0.5,
    color: "bg-purple-500", priority: "medium", status: "todo", category: "会议",
    tags: ["团队"], hasMeeting: true, location: "线上 · Zoom", isRecurring: true,
  },
  {
    id: "3", title: "代码审查 - PR #482", date: today, startHour: 14, duration: 1,
    color: "bg-cyan-500", priority: "high", status: "todo", category: "开发",
    tags: ["代码审查", "前端"],
  },
  {
    id: "4", title: "客户方案演示", date: today, startHour: 15.5, duration: 1,
    color: "bg-amber-500", priority: "urgent", status: "todo", category: "会议",
    tags: ["客户", "演示"], hasMeeting: true, location: "会议室 A",
  },
  {
    id: "5", title: "健身 · HIIT 训练", date: today, startHour: 17.5, duration: 1,
    color: "bg-emerald-500", priority: "low", status: "todo", category: "健康",
    tags: ["运动"], energyLevel: "medium",
  },
  {
    id: "6", title: "阅读《系统之美》", date: today, startHour: 20, duration: 1,
    color: "bg-rose-400", priority: "low", status: "todo", category: "学习",
    tags: ["阅读"], energyLevel: "low",
  },
  {
    id: "7", title: "Sprint 回顾会", date: addDays(today, 1), startHour: 10, duration: 1.5,
    color: "bg-indigo-500", priority: "medium", status: "todo", category: "会议",
    tags: ["敏捷", "团队"], hasMeeting: true, isRecurring: true,
  },
  {
    id: "8", title: "API 接口开发", date: addDays(today, 1), startHour: 13, duration: 3,
    color: "bg-blue-500", priority: "high", status: "todo", category: "开发",
    tags: ["后端", "API"], energyLevel: "high",
    subtasks: [
      { id: "s4", text: "设计接口结构", done: true },
      { id: "s5", text: "编写业务逻辑", done: false },
      { id: "s6", text: "单元测试", done: false },
    ],
  },
  {
    id: "9", title: "设计评审", date: addDays(today, 2), startHour: 11, duration: 1,
    color: "bg-pink-500", priority: "medium", status: "todo", category: "设计",
    tags: ["UI", "评审"],
  },
  {
    id: "10", title: "数据库优化", date: addDays(today, 2), startHour: 14, duration: 2,
    color: "bg-teal-500", priority: "high", status: "blocked", category: "开发",
    tags: ["数据库", "性能"],
  },
  {
    id: "11", title: "周报撰写", date: addDays(today, 4), startHour: 16, duration: 1,
    color: "bg-gray-500", priority: "medium", status: "todo", category: "工作",
    tags: ["周报"],
  },
  {
    id: "12", title: "AI 功能原型设计", date: addDays(today, 3), startHour: 9, duration: 3,
    color: "bg-violet-500", priority: "high", status: "todo", category: "设计",
    tags: ["AI", "原型"], energyLevel: "high", aiSuggested: true,
  },
];

const priorityConfig: Record<Priority, { label: string; color: string; icon: typeof Flag }> = {
  urgent: { label: "紧急", color: "text-red-600 bg-red-50 border-red-200", icon: AlertTriangle },
  high: { label: "高", color: "text-orange-600 bg-orange-50 border-orange-200", icon: Flag },
  medium: { label: "中", color: "text-blue-600 bg-blue-50 border-blue-200", icon: Flag },
  low: { label: "低", color: "text-gray-500 bg-gray-50 border-gray-200", icon: Flag },
};

const statusConfig: Record<Status, { label: string; color: string }> = {
  todo: { label: "待办", color: "bg-gray-100 text-gray-600" },
  in_progress: { label: "进行中", color: "bg-blue-100 text-blue-700" },
  done: { label: "已完成", color: "bg-emerald-100 text-emerald-700" },
  blocked: { label: "阻塞", color: "bg-red-100 text-red-700" },
};

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 – 20:00

/* ═══════════════ Component ═══════════════ */
export function CalendarPage() {
  const [view, setView] = useState<ViewType>("calendar");
  const [currentDate, setCurrentDate] = useState(today);
  const [events, setEvents] = useState<ScheduleEvent[]>(mockEvents);
  const [focusMode, setFocusMode] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<{ role: "ai" | "user"; text: string }[]>([
    { role: "ai", text: "你好！我可以帮你智能安排日程。试试输入「明天下午三点开会」或「帮我找一个两小时的空闲时段做深度工作」。" },
  ]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [showSync, setShowSync] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const [externalEvents, setExternalEvents] = useState<ExternalEvent[]>([]);
  const [calConflicts, setCalConflicts] = useState<ConflictInfo[]>([]);
  const aiEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

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
        category: e.sourceType === "google" ? "Google" : e.sourceType === "apple" ? "iCloud" : e.sourceType === "outlook" ? "Outlook" : "外部",
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
      if (userMsg.includes("会") || userMsg.includes("开会")) {
        response = "已为你创建日程：\n📅 明天 15:00 – 16:00\n📋 「团队会议」\n🏷️ 优先级：中 | 分类：会议\n\n已自动检查时间冲突，该时段空闲可用。是否需要发送会议邀请？";
      } else if (userMsg.includes("空闲") || userMsg.includes("深度工作")) {
        response = "分析了你本周的日程后，我推荐以下深度工作时段：\n\n🟢 明天 09:00-11:00（精力高峰期）\n🟡 后天 14:00-16:00（无会议冲突）\n🟢 周五 09:00-12:00（完整的上午时段）\n\n建议选择明天上午的时段，这是你历史效率最高的时间段。需要我自动排入吗？";
      } else if (userMsg.includes("优化") || userMsg.includes("建议")) {
        response = "根据你的效率模式分析：\n\n⚡ 建议将「产品文档」移到上午 9-11 点（你的高效时段）\n☕ 下午 2-3 点适合安排轻量级会议\n🧠 「代码审查」建议放在午后，避免与深度工作冲突\n📊 本周工作负荷略高，建议将「周报」推迟到周五下午\n\n要我自动应用这些调整吗？";
      } else {
        response = "收到！让我分析一下你的日程...\n\n基于你当前的任务分布和精力曲线，我建议：\n1. 高能耗任务安排在上午 9-12 点\n2. 会议集中在下午 2-4 点\n3. 保留每天至少 1 小时的缓冲时间\n\n需要我帮你具体调整哪些日程？";
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

  const views = [
    { key: "calendar" as ViewType, label: "日历", icon: CalendarDays },
    { key: "list" as ViewType, label: "列表", icon: List },
    { key: "kanban" as ViewType, label: "看板", icon: Columns3 },
    { key: "timeline" as ViewType, label: "时间线", icon: GanttChart },
  ];

  return (
    <div className="flex h-full flex-col bg-background">
      {/* ───── Top Bar ───── */}
      <div className="relative z-40 shrink-0 border-b border-border/50 bg-white/80 backdrop-blur-sm px-3 py-2.5 sm:px-6 sm:py-3">
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
                今天
              </button>
              <button
                onClick={() => navigateWeek(1)}
                className="rounded-lg p-1 sm:p-1.5 text-muted-foreground hover:bg-muted/60 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="text-[0.75rem] sm:text-[0.9375rem] ml-1 whitespace-nowrap" style={{ fontWeight: 600 }}>
                {format(weekStart, "M月d日", { locale: zhCN })} – {format(addDays(weekStart, 6), "M月d日", { locale: zhCN })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Focus Mode – stays visible as a standalone toggle */}
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`flex items-center gap-1.5 rounded-xl px-2 sm:px-3 py-1.5 text-[0.75rem] sm:text-[0.8125rem] transition-all ${
                focusMode
                  ? "bg-amber-100 text-amber-700 shadow-sm"
                  : "text-muted-foreground hover:bg-muted/60"
              }`}
              style={{ fontWeight: focusMode ? 600 : 400 }}
            >
              {focusMode ? <EyeOff className="h-3.5 w-3.5" /> : <Focus className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{focusMode ? "专注中" : "专注"}</span>
            </button>

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
                <span className="hidden sm:inline">工具</span>
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
                        <div style={{ fontWeight: 500 }}>AI 智能排期</div>
                        <div className="text-[0.6875rem] text-muted-foreground">自然语言创建与优化日程</div>
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
                        <div style={{ fontWeight: 500 }}>邮件智能聚合</div>
                        <div className="text-[0.6875rem] text-muted-foreground">扫描行程单、邀请函、账单</div>
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
                          会议辅助
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-px text-[0.5625rem] text-amber-700">
                            <Crown className="h-2 w-2" /> Pro
                          </span>
                        </div>
                        <div className="text-[0.6875rem] text-muted-foreground">录音摘要、自动提取任务</div>
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
                        <div style={{ fontWeight: 500 }}>跨平台日历聚合</div>
                        <div className="text-[0.6875rem] text-muted-foreground">双向同步 · 冲突检测</div>
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
              onClick={() => setShowAddEvent(true)}
              size="sm"
              className="rounded-xl bg-primary text-white hover:bg-primary/90 text-[0.75rem] sm:text-[0.8125rem]"
            >
              <Plus className="h-3.5 w-3.5 sm:mr-1" /> <span className="hidden sm:inline">新建日程</span>
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

        {/* Focus mode banner */}
        <AnimatePresence>
          {focusMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 px-4 py-2.5">
                <Flame className="h-4 w-4 text-amber-600" />
                <span className="text-[0.8125rem] text-amber-700" style={{ fontWeight: 500 }}>
                  专注模式已开启 — 通知已静默，日历状态已设为忙碌
                </span>
                <Timer className="ml-auto h-4 w-4 text-amber-600" />
                <span className="text-[0.8125rem] text-amber-600" style={{ fontWeight: 600 }}>25:00</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ───── Main Content ───── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main view area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            {/* ═══ CALENDAR VIEW ═══ */}
            {view === "calendar" && (
              <motion.div
                key="calendar-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="h-full"
              >
                <div className="overflow-x-auto min-w-0">
                <div className="min-w-[700px]">
                {/* Week header */}
                <div className="sticky top-0 z-10 grid grid-cols-[48px_repeat(7,1fr)] sm:grid-cols-[60px_repeat(7,1fr)] border-b border-border/50 bg-white">
                  <div className="border-r border-border/30" />
                  {weekDays.map((day) => {
                    const isT = isToday(day);
                    const dayEvents = getAllEventsForDay(day);
                    return (
                      <div
                        key={day.toISOString()}
                        className={`border-r border-border/30 px-2 py-2.5 text-center ${isT ? "bg-primary/5" : ""}`}
                      >
                        <div className="text-[0.6875rem] text-muted-foreground">
                          {format(day, "EEE", { locale: zhCN })}
                        </div>
                        <div
                          className={`mx-auto mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-[0.9375rem] ${
                            isT ? "bg-primary text-white" : ""
                          }`}
                          style={{ fontWeight: isT ? 700 : 500 }}
                        >
                          {format(day, "d")}
                        </div>
                        {dayEvents.length > 0 && (
                          <div className="mt-1 flex justify-center gap-0.5">
                            {dayEvents.slice(0, 3).map((e) => (
                              <div key={e.id} className={`h-1 w-1 rounded-full ${e.color}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Time grid */}
                <div className="grid grid-cols-[48px_repeat(7,1fr)] sm:grid-cols-[60px_repeat(7,1fr)]">
                  {HOURS.map((hour) => (
                    <div key={hour} className="contents">
                      <div className="border-r border-border/30 py-0 pr-2 text-right">
                        <span className="relative -top-2.5 text-[0.6875rem] text-muted-foreground/60">
                          {hour.toString().padStart(2, "0")}:00
                        </span>
                      </div>
                      {weekDays.map((day) => {
                        const dayEvents = getAllEventsForDay(day);
                        const hourEvents = dayEvents.filter(
                          (e) => e.startHour <= hour && e.startHour + e.duration > hour
                        );
                        const startingEvents = dayEvents.filter((e) => Math.floor(e.startHour) === hour);

                        return (
                          <div
                            key={`${day.toISOString()}-${hour}`}
                            className={`relative border-r border-b border-border/20 h-16 ${
                              isToday(day) ? "bg-primary/[0.02]" : ""
                            }`}
                          >
                            {startingEvents.map((event) => {
                              const topOffset = (event.startHour - hour) * 64;
                              const height = event.duration * 64 - 4;
                              return (
                                <motion.div
                                  key={event.id}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  whileHover={{ scale: 1.02, zIndex: 20 }}
                                  onClick={() => setSelectedEvent(event)}
                                  className={`absolute left-0.5 right-0.5 z-10 cursor-pointer overflow-hidden rounded-lg ${event.color} px-2 py-1 text-white shadow-sm transition-shadow hover:shadow-md`}
                                  style={{ top: topOffset, height: Math.max(height, 24) }}
                                >
                                  <div className="truncate text-[0.6875rem] flex items-center gap-1" style={{ fontWeight: 600 }}>
                                    {event.id.startsWith("ext-") && <Link2 className="h-2.5 w-2.5 shrink-0 opacity-70" />}
                                    <span className="truncate">{event.title}</span>
                                  </div>
                                  {height > 36 && (
                                    <div className="flex items-center gap-1 mt-0.5 text-[0.5625rem] text-white/80">
                                      <Clock className="h-2.5 w-2.5" />
                                      {Math.floor(event.startHour)}:{(event.startHour % 1) * 60 === 0 ? "00" : "30"}
                                      {event.hasMeeting && <Video className="h-2.5 w-2.5 ml-1" />}
                                      {event.aiSuggested && <Sparkles className="h-2.5 w-2.5 ml-1" />}
                                    </div>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                </div>{/* min-w-[700px] */}
                </div>{/* overflow-x-auto */}
              </motion.div>
            )}

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
                            ? "今天"
                            : format(day, "M月d日 EEEE", { locale: zhCN })}
                        </div>
                        <Badge variant="secondary" className="text-[0.6875rem]">
                          {dayEvents.length} 项
                        </Badge>
                        {isToday(day) && (
                          <span className="text-[0.75rem] text-muted-foreground">
                            · {format(day, "M月d日 EEEE", { locale: zhCN })}
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
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
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
                                      <Repeat className="h-3 w-3" /> 重复
                                    </span>
                                  )}
                                  {event.hasMeeting && (
                                    <span className="flex items-center gap-1">
                                      <Video className="h-3 w-3" /> 视频会议
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
                                  <div className="mt-2.5 space-y-1">
                                    {event.subtasks.map((st) => (
                                      <div
                                        key={st.id}
                                        className="flex items-center gap-2 text-[0.75rem]"
                                      >
                                        {st.done ? (
                                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                        ) : (
                                          <Circle className="h-3 w-3 text-muted-foreground/40" />
                                        )}
                                        <span className={st.done ? "line-through text-muted-foreground" : ""}>
                                          {st.text}
                                        </span>
                                      </div>
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
                                      ? "⚡ 高能耗"
                                      : event.energyLevel === "medium"
                                      ? "💪 中等"
                                      : "🌿 低能耗"}
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

            {/* ═══ TIMELINE VIEW ═══ */}
            {view === "timeline" && (
              <motion.div
                key="timeline-view"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="p-4 sm:p-6"
              >
                {/* Timeline header - days */}
                <div className="mb-6 overflow-x-auto">
                  <div className="min-w-[640px] sm:min-w-[800px]">
                    {/* Day headers */}
                    <div className="flex border-b border-border/40 pb-2 mb-4">
                      <div className="w-[140px] sm:w-[200px] shrink-0" />
                      {weekDays.map((day) => (
                        <div
                          key={day.toISOString()}
                          className={`flex-1 text-center text-[0.75rem] ${
                            isToday(day) ? "text-primary" : "text-muted-foreground"
                          }`}
                          style={{ fontWeight: isToday(day) ? 600 : 400 }}
                        >
                          {format(day, "EEE M/d", { locale: zhCN })}
                        </div>
                      ))}
                    </div>

                    {/* Gantt bars */}
                    <div className="space-y-2">
                      {events
                        .sort((a, b) => a.date.getTime() - b.date.getTime() || a.startHour - b.startHour)
                        .map((event, i) => {
                          const dayIndex = weekDays.findIndex((d) => isSameDay(d, event.date));
                          if (dayIndex < 0) return null;

                          const startPct = (dayIndex / 7) * 100 + (event.startHour - 7) / (14 * 7) * 100;
                          const widthPct = (event.duration / (14 * 7)) * 100;

                          return (
                            <motion.div
                              key={event.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className="flex items-center"
                            >
                              {/* Label */}
                              <div className="w-[140px] sm:w-[200px] shrink-0 pr-2 sm:pr-3">
                                <div className="flex items-center gap-2">
                                  <div className={`h-2.5 w-2.5 rounded-full ${event.color}`} />
                                  <span className="truncate text-[0.8125rem]" style={{ fontWeight: 500 }}>
                                    {event.title}
                                  </span>
                                </div>
                                <div className="ml-[18px] text-[0.6875rem] text-muted-foreground">
                                  {event.duration}h · {event.category}
                                </div>
                              </div>

                              {/* Bar area */}
                              <div className="relative flex-1 h-8">
                                {/* Grid lines */}
                                {weekDays.map((_, di) => (
                                  <div
                                    key={di}
                                    className="absolute top-0 bottom-0 border-l border-border/20"
                                    style={{ left: `${(di / 7) * 100}%` }}
                                  />
                                ))}
                                {/* Event bar */}
                                <motion.div
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  transition={{ duration: 0.5, delay: 0.1 + i * 0.04 }}
                                  onClick={() => setSelectedEvent(event)}
                                  className={`absolute top-1 h-6 rounded-md ${event.color} cursor-pointer shadow-sm opacity-80 hover:opacity-100 transition-opacity origin-left`}
                                  style={{
                                    left: `${(dayIndex / 7) * 100}%`,
                                    width: `${Math.max((event.duration / 14) * (100 / 7), 2)}%`,
                                  }}
                                >
                                  <div className="px-2 truncate text-[0.5625rem] text-white leading-[24px]" style={{ fontWeight: 500 }}>
                                    {event.duration >= 2 ? event.title : ""}
                                  </div>
                                </motion.div>
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border/30">
                  {["工作", "会议", "开发", "设计", "健康", "学习"].map((cat) => {
                    const event = events.find((e) => e.category === cat);
                    return event ? (
                      <div key={cat} className="flex items-center gap-1.5 text-[0.75rem] text-muted-foreground">
                        <div className={`h-2.5 w-2.5 rounded-full ${event.color}`} />
                        {cat}
                      </div>
                    ) : null;
                  })}
                </div>
              </motion.div>
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
                  <span className="text-[0.875rem]" style={{ fontWeight: 600 }}>AI 智能排期</span>
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
                  <span className="text-[0.8125rem]" style={{ fontWeight: 500 }}>今日进度</span>
                  <span className="text-[0.8125rem] text-primary" style={{ fontWeight: 600 }}>{todayProgress}%</span>
                </div>
                <Progress value={todayProgress} className="h-2" />
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "待办", value: todayEvents.filter((e) => e.status === "todo").length, icon: Target, color: "text-blue-600 bg-blue-50" },
                    { label: "进行中", value: todayEvents.filter((e) => e.status === "in_progress").length, icon: Flame, color: "text-amber-600 bg-amber-50" },
                    { label: "已完成", value: completedToday, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
                  ].map((s) => (
                    <div key={s.label} className={`rounded-lg p-2 text-center ${s.color.split(" ")[1]}`}>
                      <div className={`text-[1rem] ${s.color.split(" ")[0]}`} style={{ fontWeight: 700 }}>{s.value}</div>
                      <div className="text-[0.625rem] text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Energy curve */}
                <div>
                  <div className="text-[0.75rem] text-muted-foreground mb-1.5" style={{ fontWeight: 500 }}>精力曲线</div>
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
                  {["优化今日日程", "找空闲时段", "分析工作负荷"].map((q) => (
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
                    placeholder="输入自然语言..."
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
                      <Sparkles className="mr-0.5 h-2.5 w-2.5" /> AI 建议
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
                  {format(selectedEvent.date, "yyyy年M月d日 EEEE", { locale: zhCN })}
                </div>
                <div className="flex items-center gap-3 text-[0.875rem] text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {Math.floor(selectedEvent.startHour)}:{(selectedEvent.startHour % 1) * 60 === 0 ? "00" : "30"} – {Math.floor(selectedEvent.startHour + selectedEvent.duration)}:{((selectedEvent.startHour + selectedEvent.duration) % 1) * 60 === 0 ? "00" : "30"}
                  <span>({selectedEvent.duration}小时)</span>
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center gap-3 text-[0.875rem] text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {selectedEvent.location}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <Badge variant="outline" className={`text-[0.6875rem] ${priorityConfig[selectedEvent.priority].color}`}>
                    {priorityConfig[selectedEvent.priority].label}优先级
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
                    <div className="text-[0.8125rem] mb-2" style={{ fontWeight: 600 }}>子任务</div>
                    <div className="space-y-1.5">
                      {selectedEvent.subtasks.map((st) => (
                        <div key={st.id} className="flex items-center gap-2 text-[0.8125rem]">
                          {st.done ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground/40" />
                          )}
                          <span className={st.done ? "line-through text-muted-foreground" : ""}>{st.text}</span>
                        </div>
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
                    精力消耗：
                    <span style={{ fontWeight: 500 }}>
                      {selectedEvent.energyLevel === "high" ? "⚡ 高" : selectedEvent.energyLevel === "medium" ? "💪 中" : "🌿 低"}
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
                  {selectedEvent.status === "done" ? "标记未完成" : "标记完成"}
                </Button>
                <Button variant="outline" className="rounded-xl" onClick={() => setSelectedEvent(null)}>
                  关闭
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ───── Quick Add Event Modal ───── */}
      <AnimatePresence>
        {showAddEvent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-[2px]"
              onClick={() => setShowAddEvent(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-[8%] sm:top-[15%] z-[81] w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-border/50 bg-white p-4 sm:p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[1.125rem]" style={{ fontWeight: 600 }}>新建日程</h2>
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted/60 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[0.8125rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>
                    标题（支持自然语言）
                  </label>
                  <div className="relative">
                    <Input
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      placeholder="例：明天下午两点半团队会议"
                      className="rounded-xl pr-10"
                    />
                    <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
                  </div>
                  <p className="mt-1 text-[0.6875rem] text-muted-foreground/60">
                    AI 会自动识别时间、地点和参与者
                  </p>
                </div>

                {newEventTitle && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-primary/5 border border-primary/20 p-3"
                  >
                    <div className="flex items-center gap-1.5 text-[0.75rem] text-primary mb-1" style={{ fontWeight: 500 }}>
                      <Sparkles className="h-3 w-3" /> AI 解析结果
                    </div>
                    <div className="text-[0.8125rem] space-y-1">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>明天 · {format(addDays(today, 1), "M月d日 EEEE", { locale: zhCN })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>14:30 – 15:30（1小时）</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>分类：会议 · 优先级：中</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => {
                      if (newEventTitle.trim()) {
                        setEvents((prev) => [
                          ...prev,
                          {
                            id: Date.now().toString(),
                            title: newEventTitle.trim().replace(/明天|下午|两点半|团队/g, "").trim() || newEventTitle.trim(),
                            date: addDays(today, 1),
                            startHour: 14.5,
                            duration: 1,
                            color: "bg-indigo-500",
                            priority: "medium",
                            status: "todo",
                            category: "会议",
                            tags: ["会议"],
                            aiSuggested: true,
                          },
                        ]);
                        setNewEventTitle("");
                        setShowAddEvent(false);
                      }
                    }}
                    className="flex-1 rounded-xl bg-primary text-white hover:bg-primary/90"
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" /> AI 创建
                  </Button>
                  <Button variant="outline" className="rounded-xl" onClick={() => setShowAddEvent(false)}>
                    取消
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
