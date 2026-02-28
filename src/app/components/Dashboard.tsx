import { useState } from "react";
import { useAuth } from "./AuthContext";
import { useAppContext } from "./AppLayout";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "./LanguageContext";
import {
  Zap,
  ListTodo,
  Sparkles,
  CalendarDays,
  BarChart3,
  Keyboard,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  Smartphone,
  Mail,
  Volume2,
  User,
  Palette,
  Download,
  Shield,
  Lock,
  Monitor,
  FileText,
  ScanText,
  BookOpen,
  HelpCircle,
  MessageCircle,
  Globe,
  ExternalLink,
  Video,
  Bell,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Input } from "./ui/input";
import { FragmentParser } from "./FragmentParser";
import { AddTaskModal, type NewTaskData } from "./AddTaskModal";
import { AISettingsPanel } from "./AddTaskModal";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import { CalendarPage } from "./CalendarPage";
import { CirclesPage } from "./CirclesPage";
import { FocusPanel } from "./FocusPanel";
import { AppearanceSettings } from "./AppearanceSettings";

const ChevronR = ChevronRight;

/* ─────────── Interfaces ─────────── */
interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  category: string;
}

interface CalendarEvent {
  id: string;
  time: string;
  title: string;
  color: string;
  duration: string;
}

/* ─────────── Mock Data ─────────── */
const initialTaskKeys = [
  { id: "1", textKey: "mock.task.1", completed: false, priority: "high" as const, catKey: "mock.task.cat.work" },
  { id: "2", textKey: "mock.task.2", completed: false, priority: "high" as const, catKey: "mock.task.cat.meeting" },
  { id: "3", textKey: "mock.task.3", completed: true, priority: "medium" as const, catKey: "mock.task.cat.work" },
  { id: "4", textKey: "mock.task.4", completed: false, priority: "low" as const, catKey: "mock.task.cat.health" },
  { id: "5", textKey: "mock.task.5", completed: false, priority: "low" as const, catKey: "mock.task.cat.learning" },
  { id: "6", textKey: "mock.task.6", completed: false, priority: "medium" as const, catKey: "mock.task.cat.work" },
];

const initialEventKeys = [
  { id: "1", time: "09:00", titleKey: "mock.event.1", color: "bg-purple-500", duration: "30min" },
  { id: "2", time: "10:00", titleKey: "mock.event.2", color: "bg-blue-500", duration: "1h" },
  { id: "3", time: "11:30", titleKey: "mock.event.3", color: "bg-cyan-500", duration: "45min" },
  { id: "4", time: "14:00", titleKey: "mock.event.4", color: "bg-amber-500", duration: "1h" },
  { id: "5", time: "16:00", titleKey: "mock.event.5", color: "bg-emerald-500", duration: "30min" },
  { id: "6", time: "17:00", titleKey: "mock.event.6", color: "bg-rose-500", duration: "1h" },
];

const priorityColors = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

const panelVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

/* ─────────── Dashboard Component ─────────── */
export function Dashboard() {
  const { user } = useAuth();
  const { activeTab } = useAppContext();
  const { t, locale, dateLocale } = useLanguage();
  const isEn = locale === "en-US";

  const priorityLabelsFn = { high: t("priority.high"), medium: t("priority.medium"), low: t("priority.low") } as Record<string, string>;

  const statLabels = [t("stats.weeklyTasks"), t("dashboard.todaySchedule"), t("dashboard.completed"), t("dashboard.progress")];

  const guidesData = [
    { title: t("help.guide.quickStart"), desc: t("help.guide.quickStartDesc"), icon: Zap, iconColor: "text-primary bg-primary/10", tag: t("help.guide.quickStartTag") },
    { title: t("help.guide.taskAdvanced"), desc: t("help.guide.taskAdvancedDesc"), icon: ListTodo, iconColor: "text-blue-600 bg-blue-50", tag: t("help.guide.taskAdvancedTag") },
    { title: t("help.guide.aiTips"), desc: t("help.guide.aiTipsDesc"), icon: Sparkles, iconColor: "text-purple-600 bg-purple-50", tag: t("help.guide.aiTipsTag") },
    { title: t("help.guide.calendar"), desc: t("help.guide.calendarDesc"), icon: CalendarDays, iconColor: "text-emerald-600 bg-emerald-50", tag: t("help.guide.calendarTag") },
    { title: t("help.guide.stats"), desc: t("help.guide.statsDesc"), icon: BarChart3, iconColor: "text-amber-600 bg-amber-50", tag: t("help.guide.statsTag") },
    { title: t("help.guide.shortcuts"), desc: t("help.guide.shortcutsDesc"), icon: Keyboard, iconColor: "text-gray-600 bg-gray-100", tag: t("help.guide.shortcutsTag") },
  ];

  const faqData = [
    { q: t("help.faq.upgrade.q"), a: t("help.faq.upgrade.a") },
    { q: t("help.faq.dataStorage.q"), a: t("help.faq.dataStorage.a") },
    { q: t("help.faq.aiLimit.q"), a: t("help.faq.aiLimit.a") },
    { q: t("help.faq.exportData.q"), a: t("help.faq.exportData.a") },
    { q: t("help.faq.teamCollab.q"), a: t("help.faq.teamCollab.a") },
  ];

  const [tasks, setTasks] = useState<Task[]>(initialTaskKeys.map((tk) => ({ ...tk, text: t(tk.textKey), category: t(tk.catKey) })));
  const [events] = useState<CalendarEvent[]>(initialEventKeys.map((ek) => ({ ...ek, title: t(ek.titleKey) })));
  const [newTask, setNewTask] = useState("");
  const [currentDate] = useState(new Date());

  // Settings state
  const [settingsSection, setSettingsSection] = useState<"profile" | "notifications" | "appearance" | "security" | "data" | "ai">("profile");
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail] = useState(user?.email || "");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifSound, setNotifSound] = useState(false);
  const [notifTask, setNotifTask] = useState(true);
  const [notifCalendar, setNotifCalendar] = useState(true);
  const [notifAI, setNotifAI] = useState(true);

  // Help state
  const [helpTab, setHelpTab] = useState<"guides" | "faq" | "contact">("guides");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Fragment Parser state
  const [showParser, setShowParser] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now().toString(), text: newTask.trim(), completed: false, priority: "medium", category: t("dashboard.other") },
    ]);
    setNewTask("");
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const weekDays = [t("weekday.short.sun"), t("weekday.short.mon"), t("weekday.short.tue"), t("weekday.short.wed"), t("weekday.short.thu"), t("weekday.short.fri"), t("weekday.short.sat")];
  const today = currentDate.getDate();

  const settingsSections = [
    { key: "profile" as const, label: t("settings.profile"), icon: User },
    { key: "notifications" as const, label: t("settings.notifications"), icon: Bell },
    { key: "appearance" as const, label: t("settings.appearance"), icon: Palette },
    { key: "ai" as const, label: t("settings.ai"), icon: Sparkles },
    { key: "security" as const, label: t("settings.security"), icon: Shield },
    { key: "data" as const, label: t("settings.data"), icon: Download },
  ];

  return (
    <div className={`bg-background ${activeTab === "calendar" || activeTab === "circles" ? "h-full" : ""}`}>
      {/* Calendar gets full-height layout without padding */}
      {activeTab === "calendar" && <CalendarPage />}

      {/* Circles gets full-height layout without padding */}
      {activeTab === "circles" && <CirclesPage />}

      {activeTab !== "calendar" && activeTab !== "circles" && (
      <div className="px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Quick Stats — only for tasks & stats */}
        {["tasks", "stats"].includes(activeTab) && (
          <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-4">
            {[
              { label: statLabels[0], value: tasks.filter((t) => !t.completed).length, color: "text-blue-600", bg: "bg-blue-50" },
              { label: statLabels[1], value: events.length, color: "text-purple-600", bg: "bg-purple-50" },
              { label: statLabels[2], value: completedCount, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: statLabels[3], value: `${progress}%`, color: "text-amber-600", bg: "bg-amber-50" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
                className={`rounded-xl ${s.bg} p-3 sm:p-4`}
              >
                <div className={`text-[1.25rem] sm:text-[1.5rem] ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</div>
                <div className="text-[0.75rem] sm:text-[0.8125rem] text-muted-foreground mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* ═══════════════ TASKS + CALENDAR COMBINED ═══════════════ */}
          {activeTab === "tasks" && (
            <motion.div
              key="tasks"
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="grid gap-6 lg:grid-cols-[1fr_320px]"
            >
              {/* Left — Task list */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="rounded-2xl border border-border/50 bg-card p-4 sm:p-6"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-[1.25rem]" style={{ fontWeight: 600 }}>{t("dashboard.todayTasks")}</h2>
                    <div className="mt-2 flex items-center gap-3">
                      <Progress value={progress} className="h-2 w-40" />
                      <span className="text-[0.8125rem] text-muted-foreground">{completedCount}/{tasks.length} {t("dashboard.completed")}</span>
                    </div>
                  </div>
                  {/* Fragment Parser trigger */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowParser(true)}
                    className="rounded-xl text-[0.75rem] gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                  >
                    <ScanText className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t("dashboard.screenshotParse")}</span>
                    <span className="sm:hidden">{t("dashboard.parseMobile")}</span>
                  </Button>
                </div>

                {/* Add Task */}
                <div className="mb-5 flex gap-2">
                  <Input
                    placeholder={t("dashboard.addNewTask")}
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    className="rounded-xl"
                  />
                  <Button onClick={() => setShowAddTaskModal(true)} size="icon" className="shrink-0 rounded-xl bg-primary text-white hover:bg-primary/90">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Task List */}
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {tasks.map((task, i) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.03 }}
                        layout
                        className={`group flex items-center gap-3 rounded-xl border border-border/30 px-4 py-3 transition-all hover:border-primary/20 hover:shadow-sm ${
                          task.completed ? "opacity-60" : ""
                        }`}
                      >
                        <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} />
                        <span className={`flex-1 text-[0.9375rem] ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.text}
                        </span>
                        <Badge variant="secondary" className={`text-[0.6875rem] ${priorityColors[task.priority]}`}>
                          {priorityLabelsFn[task.priority]}
                        </Badge>
                        <Badge variant="outline" className="text-[0.6875rem] hidden sm:inline-flex">{task.category}</Badge>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Right — Calendar + Events */}
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="space-y-6"
              >
                {/* Mini Calendar */}
                <div className="rounded-2xl border border-border/50 bg-card p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[1rem]" style={{ fontWeight: 600 }}>
                      {currentDate.toLocaleDateString(dateLocale, { year: "numeric", month: "long" })}
                    </h3>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronLeft className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {weekDays.map((d) => (
                      <div key={d} className="text-[0.75rem] text-muted-foreground py-1">{d}</div>
                    ))}
                    {Array.from({ length: 35 }).map((_, i) => {
                      const day = i - new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() + 1;
                      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                      const isValid = day >= 1 && day <= daysInMonth;
                      const isToday = day === today;
                      return (
                        <div
                          key={i}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-[0.8125rem] transition-colors ${
                            isToday ? "bg-primary text-white" : isValid ? "hover:bg-muted cursor-pointer" : "text-muted-foreground/30"
                          }`}
                          style={isToday ? { fontWeight: 600 } : {}}
                        >
                          {isValid ? day : ""}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Today's events */}
                <div className="rounded-2xl border border-border/50 bg-card p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[1rem]" style={{ fontWeight: 600 }}>{t("dashboard.todaySchedule")}</h3>
                    <Button size="sm" variant="ghost" className="h-7 rounded-lg text-[0.75rem] text-muted-foreground">
                      <Plus className="mr-0.5 h-3 w-3" /> {t("dashboard.addEvent")}
                    </Button>
                  </div>
                  <div className="space-y-2.5">
                    {events.map((event, i) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 + i * 0.04 }}
                        className="flex items-center gap-3 rounded-xl border border-border/20 px-3 py-2.5 transition-all hover:border-primary/20 hover:shadow-sm"
                      >
                        <div className={`w-1 self-stretch rounded-full ${event.color}`} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[0.8125rem]" style={{ fontWeight: 500 }}>{event.title}</div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[0.6875rem] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {event.time} · {event.duration}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ═══════════════ FOCUS ═══════════════ */}
          {activeTab === "focus" && (
            <motion.div key="focus" variants={panelVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35, ease: "easeOut" }}>
              <FocusPanel />
            </motion.div>
          )}

          {/* ═══════════════ STATS ═══════════════ */}
          {activeTab === "stats" && (
            <motion.div
              key="stats"
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="grid gap-6 md:grid-cols-2"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="rounded-2xl border border-border/50 bg-card p-6"
              >
                <h3 className="mb-4 text-[1.125rem]" style={{ fontWeight: 600 }}>{t("dashboard.weeklyCompletion")}</h3>
                <div className="space-y-3">
                  {[t("weekday.mon"), t("weekday.tue"), t("weekday.wed"), t("weekday.thu"), t("weekday.fri"), t("weekday.sat"), t("weekday.sun")].map((day, i) => {
                    const vals = [85, 72, 90, progress, 0, 0, 0];
                    const isDayToday = i === currentDate.getDay() - 1;
                    return (
                      <motion.div key={day} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 + i * 0.04 }} className="flex items-center gap-3">
                        <span className={`w-8 text-[0.8125rem] ${isDayToday ? "text-primary" : "text-muted-foreground"}`} style={isDayToday ? { fontWeight: 600 } : {}}>{day}</span>
                        <div className="flex-1 h-3 rounded-full bg-muted/60 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${vals[i]}%` }} transition={{ duration: 0.6, delay: 0.2 + i * 0.05, ease: "easeOut" }} className={`h-full rounded-full ${isDayToday ? "bg-primary" : "bg-primary/40"}`} />
                        </div>
                        <span className="w-10 text-right text-[0.8125rem] text-muted-foreground">{vals[i]}%</span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="rounded-2xl border border-border/50 bg-card p-6">
                <h3 className="mb-4 text-[1.125rem]" style={{ fontWeight: 600 }}>{t("dashboard.categoryDist")}</h3>
                <div className="space-y-4">
                  {[
                    { label: t("mock.task.cat.work"), count: 3, color: "bg-blue-500", total: 6 },
                    { label: t("mock.task.cat.meeting"), count: 1, color: "bg-purple-500", total: 6 },
                    { label: t("mock.task.cat.health"), count: 1, color: "bg-emerald-500", total: 6 },
                    { label: t("mock.task.cat.learning"), count: 1, color: "bg-amber-500", total: 6 },
                  ].map((cat, i) => (
                    <motion.div key={cat.label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[0.875rem]" style={{ fontWeight: 500 }}>{cat.label}</span>
                        <span className="text-[0.8125rem] text-muted-foreground">{t("dashboard.nTasks").replace("{n}", String(cat.count))}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(cat.count / cat.total) * 100}%` }} transition={{ duration: 0.6, delay: 0.25 + i * 0.06, ease: "easeOut" }} className={`h-full rounded-full ${cat.color}`} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="rounded-2xl border border-border/50 bg-card p-6 md:col-span-2">
                <h3 className="mb-4 text-[1.125rem]" style={{ fontWeight: 600 }}>{t("dashboard.aiInsights")}</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { title: t("stats.efficiencyTrend"), desc: t("stats.efficiencyDesc"), icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
                    { title: t("stats.timeAllocation"), desc: t("stats.timeDesc"), icon: Clock, color: "text-blue-600 bg-blue-50" },
                    { title: t("stats.healthReminder"), desc: t("stats.healthDesc"), icon: Sparkles, color: "text-amber-600 bg-amber-50" },
                  ].map((insight, i) => (
                    <motion.div key={insight.title} initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.35, delay: 0.2 + i * 0.08 }} whileHover={{ scale: 1.02, y: -2 }} className={`rounded-xl p-5 ${insight.color.split(" ")[1]}`}>
                      <insight.icon className={`mb-2 h-6 w-6 ${insight.color.split(" ")[0]}`} />
                      <h4 className="text-[0.9375rem] mb-1" style={{ fontWeight: 600 }}>{insight.title}</h4>
                      <p className="text-[0.8125rem] text-muted-foreground">{insight.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ═══════════════ SETTINGS ═══════════════ */}
          {activeTab === "settings" && (
            <motion.div key="settings" variants={panelVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35, ease: "easeOut" }} className="grid gap-6 lg:grid-cols-[240px_1fr]">
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.05 }} className="rounded-2xl border border-border/50 bg-card p-3">
                <div className="space-y-1">
                  {settingsSections.map((s, i) => (
                    <motion.button key={s.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + i * 0.04 }} onClick={() => setSettingsSection(s.key)} className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.875rem] transition-all ${settingsSection === s.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`} style={{ fontWeight: settingsSection === s.key ? 600 : 400 }}>
                      <s.icon className="h-4 w-4 shrink-0" />
                      {s.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="rounded-2xl border border-border/50 bg-card p-6">
                <AnimatePresence mode="wait">
                  {settingsSection === "profile" && (
                    <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                      <h2 className="text-[1.25rem] mb-1" style={{ fontWeight: 600 }}>{t("settings.profile.title")}</h2>
                      <p className="text-[0.875rem] text-muted-foreground mb-6">{t("settings.profile.subtitle")}</p>
                      <div className="flex items-center gap-4 mb-8">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-[1.5rem] text-white" style={{ fontWeight: 700 }}>{user?.name?.charAt(0).toUpperCase() || "U"}</div>
                        <div>
                          <div className="text-[1rem]" style={{ fontWeight: 600 }}>{user?.name}</div>
                          <div className="text-[0.875rem] text-muted-foreground">{user?.email}</div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-[0.6875rem]">{t("common.free")}</Badge>
                            <span className="text-[0.75rem] text-muted-foreground">· {t("settings.profile.registeredAt")} {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(dateLocale) : "—"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-5 max-w-md">
                        <div>
                          <label className="text-[0.8125rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>{t("settings.profile.nickname")}</label>
                          <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="rounded-xl" />
                        </div>
                        <div>
                          <label className="text-[0.8125rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>{t("settings.profile.email")}</label>
                          <Input value={profileEmail} disabled className="rounded-xl bg-muted/30" />
                          <p className="mt-1 text-[0.75rem] text-muted-foreground/60">{t("settings.profile.emailNoChange")}</p>
                        </div>
                        <Button className="rounded-xl bg-primary text-white hover:bg-primary/90">{t("common.save")}</Button>
                      </div>
                    </motion.div>
                  )}

                  {settingsSection === "notifications" && (
                    <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                      <h2 className="text-[1.25rem] mb-1" style={{ fontWeight: 600 }}>{t("settings.notif.title")}</h2>
                      <p className="text-[0.875rem] text-muted-foreground mb-6">{t("settings.notif.subtitle")}</p>
                      <div className="space-y-6 max-w-lg">
                        <div>
                          <h3 className="text-[0.9375rem] mb-3" style={{ fontWeight: 600 }}>{t("settings.notif.channels")}</h3>
                          <div className="space-y-4">
                            {[
                              { label: t("settings.notif.emailNotif"), desc: t("settings.notif.emailNotifDesc"), icon: Mail, value: notifEmail, onChange: setNotifEmail },
                              { label: t("settings.notif.pushNotif"), desc: t("settings.notif.pushNotifDesc"), icon: Smartphone, value: notifPush, onChange: setNotifPush },
                              { label: t("settings.notif.soundNotif"), desc: t("settings.notif.soundNotifDesc"), icon: Volume2, value: notifSound, onChange: setNotifSound },
                            ].map((item) => (
                              <div key={item.label} className="flex items-center justify-between rounded-xl border border-border/30 p-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60"><item.icon className="h-4 w-4 text-muted-foreground" /></div>
                                  <div>
                                    <div className="text-[0.875rem]" style={{ fontWeight: 500 }}>{item.label}</div>
                                    <div className="text-[0.75rem] text-muted-foreground">{item.desc}</div>
                                  </div>
                                </div>
                                <Switch checked={item.value} onCheckedChange={item.onChange} />
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="border-t border-border/30 pt-6">
                          <h3 className="text-[0.9375rem] mb-3" style={{ fontWeight: 600 }}>{t("settings.notif.categories")}</h3>
                          <div className="space-y-4">
                            {[
                              { label: t("settings.notif.taskReminder"), desc: t("settings.notif.taskReminderDesc"), value: notifTask, onChange: setNotifTask },
                              { label: t("settings.notif.calendarReminder"), desc: t("settings.notif.calendarReminderDesc"), value: notifCalendar, onChange: setNotifCalendar },
                              { label: t("settings.notif.aiInsight"), desc: t("settings.notif.aiInsightDesc"), value: notifAI, onChange: setNotifAI },
                            ].map((item) => (
                              <div key={item.label} className="flex items-center justify-between rounded-xl border border-border/30 p-4">
                                <div>
                                  <div className="text-[0.875rem]" style={{ fontWeight: 500 }}>{item.label}</div>
                                  <div className="text-[0.75rem] text-muted-foreground">{item.desc}</div>
                                </div>
                                <Switch checked={item.value} onCheckedChange={item.onChange} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {settingsSection === "appearance" && <AppearanceSettings />}

                  {settingsSection === "ai" && <AISettingsPanel />}

                  {settingsSection === "security" && (
                    <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                      <h2 className="text-[1.25rem] mb-1" style={{ fontWeight: 600 }}>{t("settings.security.title")}</h2>
                      <p className="text-[0.875rem] text-muted-foreground mb-6">{t("settings.security.subtitle")}</p>
                      <div className="space-y-5 max-w-lg">
                        <div className="rounded-xl border border-border/30 p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Lock className="h-5 w-5 text-primary" /></div>
                            <div>
                              <h3 className="text-[0.9375rem]" style={{ fontWeight: 600 }}>{t("settings.security.changePassword")}</h3>
                              <p className="text-[0.75rem] text-muted-foreground">{t("settings.security.changePasswordDesc")}</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Input type="password" placeholder={t("settings.security.currentPwd")} className="rounded-xl" />
                            <Input type="password" placeholder={t("settings.security.newPwd")} className="rounded-xl" />
                            <Input type="password" placeholder={t("settings.security.confirmPwd")} className="rounded-xl" />
                          </div>
                          <Button className="mt-4 rounded-xl bg-primary text-white hover:bg-primary/90">{t("settings.security.updatePwd")}</Button>
                        </div>
                        <div className="rounded-xl border border-border/30 p-5">
                          <h3 className="text-[0.9375rem] mb-3" style={{ fontWeight: 600 }}>{t("settings.security.sessions")}</h3>
                          <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                            <div className="flex items-center gap-2.5">
                              <Monitor className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="text-[0.8125rem]" style={{ fontWeight: 500 }}>{t("settings.security.currentDevice")}</div>
                                <div className="text-[0.6875rem] text-muted-foreground">{t("settings.security.lastActive")}</div>
                              </div>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[0.6875rem]">{t("settings.security.current")}</Badge>
                          </div>
                        </div>
                        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
                          <h3 className="text-[0.9375rem] text-destructive mb-1" style={{ fontWeight: 600 }}>{t("settings.security.dangerZone")}</h3>
                          <p className="text-[0.75rem] text-muted-foreground mb-3">{t("settings.security.deleteAccountWarning")}</p>
                          <Button variant="outline" size="sm" className="rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10">{t("settings.security.deleteAccount")}</Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {settingsSection === "data" && (
                    <motion.div key="data" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                      <h2 className="text-[1.25rem] mb-1" style={{ fontWeight: 600 }}>{t("settings.data.title")}</h2>
                      <p className="text-[0.875rem] text-muted-foreground mb-6">{t("settings.data.subtitle")}</p>
                      <div className="space-y-5 max-w-lg">
                        <div className="rounded-xl border border-border/30 p-5">
                          <h3 className="text-[0.9375rem] mb-3" style={{ fontWeight: 600 }}>{t("settings.data.export")}</h3>
                          <p className="text-[0.8125rem] text-muted-foreground mb-4">{t("settings.data.exportDesc")}</p>
                          <div className="flex gap-2">
                            <Button variant="outline" className="rounded-xl"><Download className="mr-1.5 h-4 w-4" />{t("settings.data.exportAll")}</Button>
                            <Button variant="outline" className="rounded-xl"><FileText className="mr-1.5 h-4 w-4" />{t("settings.data.exportTasks")}</Button>
                          </div>
                        </div>
                        <div className="rounded-xl border border-border/30 p-5">
                          <h3 className="text-[0.9375rem] mb-3" style={{ fontWeight: 600 }}>{t("settings.data.storage")}</h3>
                          <div className="space-y-3">
                            {[
                              { label: t("settings.data.taskData"), size: "2.1 KB", pct: 15 },
                              { label: t("settings.data.calendarData"), size: "1.8 KB", pct: 12 },
                              { label: t("settings.data.chatHistory"), size: "4.5 KB", pct: 30 },
                              { label: t("settings.data.userSettings"), size: "0.3 KB", pct: 2 },
                            ].map((item) => (
                              <div key={item.label}>
                                <div className="flex justify-between text-[0.8125rem] mb-1"><span>{item.label}</span><span className="text-muted-foreground">{item.size}</span></div>
                                <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden"><div className="h-full rounded-full bg-primary/50" style={{ width: `${item.pct}%` }} /></div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
                          <h3 className="text-[0.9375rem] text-amber-700 mb-1" style={{ fontWeight: 600 }}>{t("settings.data.clearCache")}</h3>
                          <p className="text-[0.75rem] text-muted-foreground mb-3">{t("settings.data.clearCacheWarning")}</p>
                          <Button variant="outline" size="sm" className="rounded-lg border-amber-300 text-amber-700 hover:bg-amber-100">{t("settings.data.clearCacheBtn")}</Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}

          {/* ═══════════════ HELP ═══════════════ */}
          {activeTab === "help" && (
            <motion.div key="help" variants={panelVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.35, ease: "easeOut" }}>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6 rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-white to-purple-50/50 p-6">
                <h2 className="text-[1.25rem] mb-1" style={{ fontWeight: 600 }}>{t("help.title")}</h2>
                <p className="text-[0.875rem] text-muted-foreground">{t("help.subtitle")}</p>
                <div className="mt-4 flex gap-1 rounded-xl bg-muted/40 p-1 max-w-sm">
                  {([
                    { key: "guides" as const, label: t("help.guides"), icon: BookOpen },
                    { key: "faq" as const, label: t("help.faq"), icon: HelpCircle },
                    { key: "contact" as const, label: t("help.contact"), icon: MessageCircle },
                  ]).map((tab) => (
                    <button key={tab.key} onClick={() => setHelpTab(tab.key)} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[0.8125rem] transition-all ${helpTab === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`} style={{ fontWeight: helpTab === tab.key ? 600 : 400 }}>
                      <tab.icon className="h-3.5 w-3.5" />{tab.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {helpTab === "guides" && (
                  <motion.div key="guides" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {guidesData.map((g, i) => (
                      <motion.div key={g.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.06 }} whileHover={{ y: -3 }} className="group cursor-pointer rounded-2xl border border-border/50 bg-card p-5 transition-shadow hover:shadow-md">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${g.iconColor}`}><g.icon className="h-5 w-5" /></div>
                          <Badge variant="secondary" className="text-[0.6875rem]">{g.tag}</Badge>
                        </div>
                        <h3 className="text-[0.9375rem] mb-1" style={{ fontWeight: 600 }}>{g.title}</h3>
                        <p className="text-[0.8125rem] text-muted-foreground leading-relaxed">{g.desc}</p>
                        <div className="mt-3 flex items-center gap-1 text-[0.8125rem] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          <span style={{ fontWeight: 500 }}>{t("common.readMore")}</span><ChevronR className="h-3.5 w-3.5" />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {helpTab === "faq" && (
                  <motion.div key="faq" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="max-w-2xl space-y-3">
                    {faqData.map((faq, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="overflow-hidden rounded-xl border border-border/50 bg-card">
                        <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors">
                          <span className="text-[0.9375rem] pr-4" style={{ fontWeight: 500 }}>{faq.q}</span>
                          <ChevronR className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${openFaq === i ? "rotate-90 text-primary" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {openFaq === i && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                              <div className="border-t border-border/30 px-5 py-4"><p className="text-[0.875rem] text-muted-foreground leading-relaxed">{faq.a}</p></div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {helpTab === "contact" && (
                  <motion.div key="contact" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-3xl">
                    {[
                      { title: t("help.contact.liveChat"), desc: t("help.contact.liveChatDesc"), icon: MessageCircle, iconColor: "text-primary bg-primary/10", action: t("help.contact.liveChatBtn") },
                      { title: t("help.contact.emailSupport"), desc: t("help.contact.emailSupportDesc"), icon: Mail, iconColor: "text-blue-600 bg-blue-50", action: t("help.contact.emailSupportBtn") },
                      { title: t("help.contact.forum"), desc: t("help.contact.forumDesc"), icon: Globe, iconColor: "text-emerald-600 bg-emerald-50", action: t("help.contact.forumBtn") },
                    ].map((c, i) => (
                      <motion.div key={c.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.08 }} className="rounded-2xl border border-border/50 bg-card p-5">
                        <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${c.iconColor}`}><c.icon className="h-5 w-5" /></div>
                        <h3 className="text-[0.9375rem] mb-1" style={{ fontWeight: 600 }}>{c.title}</h3>
                        <p className="text-[0.8125rem] text-muted-foreground leading-relaxed mb-4">{c.desc}</p>
                        <Button variant="outline" size="sm" className="rounded-lg w-full">{c.action}<ExternalLink className="ml-1.5 h-3.5 w-3.5" /></Button>
                      </motion.div>
                    ))}
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 to-purple-50/50 p-5 sm:col-span-2 lg:col-span-3">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10"><Video className="h-5 w-5 text-primary" /></div>
                        <div>
                          <h3 className="text-[0.9375rem] mb-1" style={{ fontWeight: 600 }}>{t("help.contact.demo")}</h3>
                          <p className="text-[0.8125rem] text-muted-foreground leading-relaxed mb-3">{t("help.contact.demoDesc")}</p>
                          <Button size="sm" className="rounded-lg bg-primary text-white hover:bg-primary/90">{t("help.contact.demoBtn")}</Button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}

      {/* Fragment Parser Modal */}
      <FragmentParser
        open={showParser}
        onClose={() => setShowParser(false)}
        onAddTask={(task) => {
          setTasks((prev) => [
            ...prev,
            {
              id: `parsed-${task.id}`,
              text: task.text,
              completed: false,
              priority: task.priority,
              category: task.assignee || t("dashboard.aiParsed"),
            },
          ]);
        }}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        open={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onSubmit={(taskData: NewTaskData) => {
          setTasks((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              text: taskData.text,
              completed: false,
              priority: taskData.priority,
              category: taskData.category,
            },
          ]);
          setNewTask("");
        }}
        initialText={newTask}
      />
    </div>
  );
}