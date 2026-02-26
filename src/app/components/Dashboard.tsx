import { CalendarPage } from "./CalendarPage";
import { FragmentParser } from "./FragmentParser";
import { CirclesPage } from "./CirclesPage";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { useAuth } from "./AuthContext";
import { useAppContext } from "./AppLayout";
import { motion, AnimatePresence } from "motion/react";
import {
  CalendarDays,
  ListTodo,
  Plus,
  Sparkles,
  Clock,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Trash2,
  TrendingUp,
  User,
  Bell,
  Palette,
  Shield,
  Globe,
  Moon,
  Sun,
  Monitor,
  Mail,
  Smartphone,
  Volume2,
  Lock,
  Download,
  HelpCircle,
  BookOpen,
  Video,
  MessageCircle,
  FileText,
  ExternalLink,
  Zap,
  ChevronRight as ChevronR,
  Keyboard,
  ScanText,
} from "lucide-react";

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
const initialTasks: Task[] = [
  { id: "1", text: "完成季度项目报告", completed: false, priority: "high", category: "工作" },
  { id: "2", text: "团队周会 14:00", completed: false, priority: "high", category: "会议" },
  { id: "3", text: "回复客户邮件", completed: true, priority: "medium", category: "工作" },
  { id: "4", text: "健身 - 跑步30分钟", completed: false, priority: "low", category: "健康" },
  { id: "5", text: "阅读《深度工作》第3章", completed: false, priority: "low", category: "学习" },
  { id: "6", text: "准备明天的演讲稿", completed: false, priority: "medium", category: "工作" },
];

const initialEvents: CalendarEvent[] = [
  { id: "1", time: "09:00", title: "晨间复盘 & 计划", color: "bg-purple-500", duration: "30min" },
  { id: "2", time: "10:00", title: "产品评审会议", color: "bg-blue-500", duration: "1h" },
  { id: "3", time: "11:30", title: "代码审查", color: "bg-cyan-500", duration: "45min" },
  { id: "4", time: "14:00", title: "团队周会", color: "bg-amber-500", duration: "1h" },
  { id: "5", time: "16:00", title: "客户沟通电话", color: "bg-emerald-500", duration: "30min" },
  { id: "6", time: "17:00", title: "项目文档整理", color: "bg-rose-500", duration: "1h" },
];

const priorityColors = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};
const priorityLabels = { high: "高", medium: "中", low: "低" };

const panelVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

/* ─────────── Help Data ─────────── */
const guides = [
  { title: "快速上手指南", desc: "5 分钟了解 Lifenix AI 的核心功能和基本操作。", icon: Zap, iconColor: "text-primary bg-primary/10", tag: "新手必读" },
  { title: "任务管理进阶", desc: "学习如何使用优先级、分类和批量操作高效管理任务。", icon: ListTodo, iconColor: "text-blue-600 bg-blue-50", tag: "功能指南" },
  { title: "AI 助手使用技巧", desc: "掌握高效的提问方式，让 AI 更好地为你服务。", icon: Sparkles, iconColor: "text-purple-600 bg-purple-50", tag: "功能指南" },
  { title: "日程与日历", desc: "了解日程管理、事件提醒和日历视图的使用方法。", icon: CalendarDays, iconColor: "text-emerald-600 bg-emerald-50", tag: "功能指南" },
  { title: "数据统计与洞察", desc: "学习如何阅读效率报告，利用 AI 洞察优化工作流程。", icon: BarChart3, iconColor: "text-amber-600 bg-amber-50", tag: "高级功能" },
  { title: "键盘快捷键", desc: "使用快捷键加速操作，提升使用效率。", icon: Keyboard, iconColor: "text-gray-600 bg-gray-100", tag: "效率提升" },
];

const faqItems = [
  { q: "如何升级到 Pro 版？", a: "在侧边栏点击「升级 Pro」或前往定价页面，选择月付 ¥29 或年付 ¥199 的方案进行订阅。" },
  { q: "数据存储在哪里？", a: "当前版本数据存储在浏览器的 localStorage 中。后续会接入 Java Spring Boot 后端，支持云端同步和多设备使用。" },
  { q: "AI 对话有次数限制吗？", a: "免费版每天 20 次对话，Pro 版无限次对话。对话历史会保存在本地。" },
  { q: "如何导出我的数据？", a: "前往「设置 > 数据管理」，点击导出按钮即可将任务和日程导出为 JSON 格式。" },
  { q: "支持团队协作吗？", a: "Pro 月付支持 3 人协作，年付支持无限团队协作。团队功能正在开发中，敬请期待。" },
];

/* ─────────── Dashboard Component ─────────── */
export function Dashboard() {
  const { user } = useAuth();
  const { activeTab } = useAppContext();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [events] = useState<CalendarEvent[]>(initialEvents);
  const [newTask, setNewTask] = useState("");
  const [currentDate] = useState(new Date());

  // Settings state
  const [settingsSection, setSettingsSection] = useState<"profile" | "notifications" | "appearance" | "security" | "data">("profile");
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail] = useState(user?.email || "");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifSound, setNotifSound] = useState(false);
  const [notifTask, setNotifTask] = useState(true);
  const [notifCalendar, setNotifCalendar] = useState(true);
  const [notifAI, setNotifAI] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [language, setLanguage] = useState("zh-CN");

  // Help state
  const [helpTab, setHelpTab] = useState<"guides" | "faq" | "contact">("guides");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Fragment Parser state
  const [showParser, setShowParser] = useState(false);

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now().toString(), text: newTask.trim(), completed: false, priority: "medium", category: "其他" },
    ]);
    setNewTask("");
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  const today = currentDate.getDate();

  const settingsSections = [
    { key: "profile" as const, label: "个人资料", icon: User },
    { key: "notifications" as const, label: "通知偏好", icon: Bell },
    { key: "appearance" as const, label: "外观主题", icon: Palette },
    { key: "security" as const, label: "安全隐私", icon: Shield },
    { key: "data" as const, label: "数据管理", icon: Download },
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
              { label: "待办任务", value: tasks.filter((t) => !t.completed).length, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "今日日程", value: events.length, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "已完成", value: completedCount, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "完成率", value: `${progress}%`, color: "text-amber-600", bg: "bg-amber-50" },
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
                className="rounded-2xl border border-border/50 bg-white p-4 sm:p-6"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-[1.25rem]" style={{ fontWeight: 600 }}>今日任务</h2>
                    <div className="mt-2 flex items-center gap-3">
                      <Progress value={progress} className="h-2 w-40" />
                      <span className="text-[0.8125rem] text-muted-foreground">{completedCount}/{tasks.length} 已完成</span>
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
                    <span className="hidden sm:inline">截图/文档解析</span>
                    <span className="sm:hidden">解析</span>
                  </Button>
                </div>

                {/* Add Task */}
                <div className="mb-5 flex gap-2">
                  <Input
                    placeholder="添加新任务..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    className="rounded-xl"
                  />
                  <Button onClick={addTask} size="icon" className="shrink-0 rounded-xl bg-primary text-white hover:bg-primary/90">
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
                          {priorityLabels[task.priority]}
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
                <div className="rounded-2xl border border-border/50 bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[1rem]" style={{ fontWeight: 600 }}>
                      {currentDate.toLocaleDateString("zh-CN", { year: "numeric", month: "long" })}
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
                <div className="rounded-2xl border border-border/50 bg-white p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[1rem]" style={{ fontWeight: 600 }}>今日日程</h3>
                    <Button size="sm" variant="ghost" className="h-7 rounded-lg text-[0.75rem] text-muted-foreground">
                      <Plus className="mr-0.5 h-3 w-3" /> 添加
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
                className="rounded-2xl border border-border/50 bg-white p-6"
              >
                <h3 className="mb-4 text-[1.125rem]" style={{ fontWeight: 600 }}>本周任务完成情况</h3>
                <div className="space-y-3">
                  {["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map((day, i) => {
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

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="rounded-2xl border border-border/50 bg-white p-6">
                <h3 className="mb-4 text-[1.125rem]" style={{ fontWeight: 600 }}>任务分类分布</h3>
                <div className="space-y-4">
                  {[
                    { label: "工作", count: 3, color: "bg-blue-500", total: 6 },
                    { label: "会议", count: 1, color: "bg-purple-500", total: 6 },
                    { label: "健康", count: 1, color: "bg-emerald-500", total: 6 },
                    { label: "学习", count: 1, color: "bg-amber-500", total: 6 },
                  ].map((cat, i) => (
                    <motion.div key={cat.label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[0.875rem]" style={{ fontWeight: 500 }}>{cat.label}</span>
                        <span className="text-[0.8125rem] text-muted-foreground">{cat.count} 个任务</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(cat.count / cat.total) * 100}%` }} transition={{ duration: 0.6, delay: 0.25 + i * 0.06, ease: "easeOut" }} className={`h-full rounded-full ${cat.color}`} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} className="rounded-2xl border border-border/50 bg-white p-6 md:col-span-2">
                <h3 className="mb-4 text-[1.125rem]" style={{ fontWeight: 600 }}>AI 洞察</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { title: "效率趋势", desc: "你本周的效率比上周提升了12%，继续保持！", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
                    { title: "时间分配", desc: "建议减少会议时间，增加深度工作的时段。", icon: Clock, color: "text-blue-600 bg-blue-50" },
                    { title: "健康提醒", desc: "本周运动时间偏少，建议每天至少30分钟锻炼。", icon: Sparkles, color: "text-amber-600 bg-amber-50" },
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
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.05 }} className="rounded-2xl border border-border/50 bg-white p-3">
                <div className="space-y-1">
                  {settingsSections.map((s, i) => (
                    <motion.button key={s.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + i * 0.04 }} onClick={() => setSettingsSection(s.key)} className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[0.875rem] transition-all ${settingsSection === s.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`} style={{ fontWeight: settingsSection === s.key ? 600 : 400 }}>
                      <s.icon className="h-4 w-4 shrink-0" />
                      {s.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="rounded-2xl border border-border/50 bg-white p-6">
                <AnimatePresence mode="wait">
                  {settingsSection === "profile" && (
                    <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                      <h2 className="text-[1.25rem] mb-1" style={{ fontWeight: 600 }}>个人资料</h2>
                      <p className="text-[0.875rem] text-muted-foreground mb-6">管理你的个人信息和账户设置。</p>
                      <div className="flex items-center gap-4 mb-8">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-[1.5rem] text-white" style={{ fontWeight: 700 }}>{user?.name?.charAt(0).toUpperCase() || "U"}</div>
                        <div>
                          <div className="text-[1rem]" style={{ fontWeight: 600 }}>{user?.name}</div>
                          <div className="text-[0.875rem] text-muted-foreground">{user?.email}</div>
                          <div className="mt-1 flex items-center gap-1.5">
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-[0.6875rem]">免费版</Badge>
                            <span className="text-[0.75rem] text-muted-foreground">· 注册于 {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("zh-CN") : "—"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-5 max-w-md">
                        <div>
                          <label className="text-[0.8125rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>昵称</label>
                          <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="rounded-xl" />
                        </div>
                        <div>
                          <label className="text-[0.8125rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>邮箱</label>
                          <Input value={profileEmail} disabled className="rounded-xl bg-muted/30" />
                          <p className="mt-1 text-[0.75rem] text-muted-foreground/60">邮箱暂不支持修改</p>
                        </div>
                        <Button className="rounded-xl bg-primary text-white hover:bg-primary/90">保存修改</Button>
                      </div>
                    </motion.div>
                  )}

                  {settingsSection === "notifications" && (
                    <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                      <h2 className="text-[1.25rem] mb-1" style={{ fontWeight: 600 }}>通知偏好</h2>
                      <p className="text-[0.875rem] text-muted-foreground mb-6">自定义你想接收的通知类型和方式。</p>
                      <div className="space-y-6 max-w-lg">
                        <div>
                          <h3 className="text-[0.9375rem] mb-3" style={{ fontWeight: 600 }}>通知方式</h3>
                          <div className="space-y-4">
                            {[
                              { label: "邮件通知", desc: "通过邮箱接收重要通知", icon: Mail, value: notifEmail, onChange: setNotifEmail },
                              { label: "推送通知", desc: "浏览器推送实时通知", icon: Smartphone, value: notifPush, onChange: setNotifPush },
                              { label: "声音提醒", desc: "收到通知时播放提示音", icon: Volume2, value: notifSound, onChange: setNotifSound },
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
                          <h3 className="text-[0.9375rem] mb-3" style={{ fontWeight: 600 }}>通知类别</h3>
                          <div className="space-y-4">
                            {[
                              { label: "任务提醒", desc: "任务到期和状态变更通知", value: notifTask, onChange: setNotifTask },
                              { label: "日程提醒", desc: "会议和日程开始前通知", value: notifCalendar, onChange: setNotifCalendar },
                              { label: "AI 洞察", desc: "AI 助手的分析和建议通知", value: notifAI, onChange: setNotifAI },
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

                  {settingsSection === "appearance" && (
                    <motion.div key="appearance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                      <h2 className="text-[1.25rem] mb-1" style={{ fontWeight: 600 }}>外观主题</h2>
                      <p className="text-[0.875rem] text-muted-foreground mb-6">选择你喜欢的主题风格和显示设置。</p>
                      <div className="space-y-6 max-w-lg">
                        <div>
                          <h3 className="text-[0.9375rem] mb-3" style={{ fontWeight: 600 }}>主题模式</h3>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { key: "light" as const, label: "浅色", icon: Sun },
                              { key: "dark" as const, label: "深色", icon: Moon },
                              { key: "system" as const, label: "跟随系统", icon: Monitor },
                            ].map((t) => (
                              <button key={t.key} onClick={() => setTheme(t.key)} className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${theme === t.key ? "border-primary bg-primary/5" : "border-border/30 hover:border-border"}`}>
                                <t.icon className={`h-6 w-6 ${theme === t.key ? "text-primary" : "text-muted-foreground"}`} />
                                <span className="text-[0.8125rem]" style={{ fontWeight: theme === t.key ? 600 : 400 }}>{t.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="border-t border-border/30 pt-6">
                          <h3 className="text-[0.9375rem] mb-3" style={{ fontWeight: 600 }}>语言设置</h3>
                          <div className="flex items-center gap-3 rounded-xl border border-border/30 p-4">
                            <Globe className="h-5 w-5 text-muted-foreground" />
                            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="flex-1 bg-transparent text-[0.875rem] outline-none">
                              <option value="zh-CN">简体中文</option>
                              <option value="en-US">English</option>
                              <option value="ja-JP">日本語</option>
                            </select>
                          </div>
                        </div>
                        <div className="border-t border-border/30 pt-6">
                          <h3 className="text-[0.9375rem] mb-3" style={{ fontWeight: 600 }}>品牌色</h3>
                          <div className="flex gap-3">
                            {[
                              { color: "bg-purple-600", label: "紫色" },
                              { color: "bg-blue-600", label: "蓝色" },
                              { color: "bg-emerald-600", label: "绿色" },
                              { color: "bg-rose-600", label: "玫红" },
                              { color: "bg-amber-600", label: "琥珀" },
                            ].map((c) => (
                              <button key={c.label} className={`h-9 w-9 rounded-full ${c.color} transition-all hover:scale-110 ${c.label === "紫色" ? "ring-2 ring-primary ring-offset-2" : ""}`} title={c.label} />
                            ))}
                          </div>
                          <p className="mt-2 text-[0.75rem] text-muted-foreground/60">更多主题色即将推出</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {settingsSection === "security" && (
                    <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                      <h2 className="text-[1.25rem] mb-1" style={{ fontWeight: 600 }}>安全隐私</h2>
                      <p className="text-[0.875rem] text-muted-foreground mb-6">管理密码和隐私设置，保护你的账户安全。</p>
                      <div className="space-y-5 max-w-lg">
                        <div className="rounded-xl border border-border/30 p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Lock className="h-5 w-5 text-primary" /></div>
                            <div>
                              <h3 className="text-[0.9375rem]" style={{ fontWeight: 600 }}>修改密码</h3>
                              <p className="text-[0.75rem] text-muted-foreground">定期更换密码以保障账户安全</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Input type="password" placeholder="当前密码" className="rounded-xl" />
                            <Input type="password" placeholder="新密码" className="rounded-xl" />
                            <Input type="password" placeholder="确认新密码" className="rounded-xl" />
                          </div>
                          <Button className="mt-4 rounded-xl bg-primary text-white hover:bg-primary/90">更新密码</Button>
                        </div>
                        <div className="rounded-xl border border-border/30 p-5">
                          <h3 className="text-[0.9375rem] mb-3" style={{ fontWeight: 600 }}>登录会话</h3>
                          <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
                            <div className="flex items-center gap-2.5">
                              <Monitor className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="text-[0.8125rem]" style={{ fontWeight: 500 }}>当前设备</div>
                                <div className="text-[0.6875rem] text-muted-foreground">Chrome · 最后活动: 刚刚</div>
                              </div>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[0.6875rem]">当前</Badge>
                          </div>
                        </div>
                        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
                          <h3 className="text-[0.9375rem] text-destructive mb-1" style={{ fontWeight: 600 }}>危险区域</h3>
                          <p className="text-[0.75rem] text-muted-foreground mb-3">删除账户后，所有数据将被永久清除且不可恢复。</p>
                          <Button variant="outline" size="sm" className="rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10">删除账户</Button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {settingsSection === "data" && (
                    <motion.div key="data" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
                      <h2 className="text-[1.25rem] mb-1" style={{ fontWeight: 600 }}>数据管理</h2>
                      <p className="text-[0.875rem] text-muted-foreground mb-6">导出数据或管理本地存储空间。</p>
                      <div className="space-y-5 max-w-lg">
                        <div className="rounded-xl border border-border/30 p-5">
                          <h3 className="text-[0.9375rem] mb-3" style={{ fontWeight: 600 }}>数据导出</h3>
                          <p className="text-[0.8125rem] text-muted-foreground mb-4">导出你的任务、日程和聊天记录为 JSON 格式。</p>
                          <div className="flex gap-2">
                            <Button variant="outline" className="rounded-xl"><Download className="mr-1.5 h-4 w-4" />导出全部数据</Button>
                            <Button variant="outline" className="rounded-xl"><FileText className="mr-1.5 h-4 w-4" />仅导出任务</Button>
                          </div>
                        </div>
                        <div className="rounded-xl border border-border/30 p-5">
                          <h3 className="text-[0.9375rem] mb-3" style={{ fontWeight: 600 }}>存储使用情况</h3>
                          <div className="space-y-3">
                            {[
                              { label: "任务数据", size: "2.1 KB", pct: 15 },
                              { label: "日程数据", size: "1.8 KB", pct: 12 },
                              { label: "聊天记录", size: "4.5 KB", pct: 30 },
                              { label: "用户设置", size: "0.3 KB", pct: 2 },
                            ].map((item) => (
                              <div key={item.label}>
                                <div className="flex justify-between text-[0.8125rem] mb-1"><span>{item.label}</span><span className="text-muted-foreground">{item.size}</span></div>
                                <div className="h-1.5 rounded-full bg-muted/60 overflow-hidden"><div className="h-full rounded-full bg-primary/50" style={{ width: `${item.pct}%` }} /></div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
                          <h3 className="text-[0.9375rem] text-amber-700 mb-1" style={{ fontWeight: 600 }}>清除本地数据</h3>
                          <p className="text-[0.75rem] text-muted-foreground mb-3">此操作会清除浏览器中的所有本地数据，建议先导出备份。</p>
                          <Button variant="outline" size="sm" className="rounded-lg border-amber-300 text-amber-700 hover:bg-amber-100">清除缓存数据</Button>
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
                <h2 className="text-[1.25rem] mb-1" style={{ fontWeight: 600 }}>帮助中心</h2>
                <p className="text-[0.875rem] text-muted-foreground">查阅指南、常见问题，或联系支持团队获取帮助。</p>
                <div className="mt-4 flex gap-1 rounded-xl bg-muted/40 p-1 max-w-sm">
                  {([
                    { key: "guides" as const, label: "使用指南", icon: BookOpen },
                    { key: "faq" as const, label: "常见问题", icon: HelpCircle },
                    { key: "contact" as const, label: "联系我们", icon: MessageCircle },
                  ]).map((t) => (
                    <button key={t.key} onClick={() => setHelpTab(t.key)} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[0.8125rem] transition-all ${helpTab === t.key ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`} style={{ fontWeight: helpTab === t.key ? 600 : 400 }}>
                      <t.icon className="h-3.5 w-3.5" />{t.label}
                    </button>
                  ))}
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {helpTab === "guides" && (
                  <motion.div key="guides" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {guides.map((g, i) => (
                      <motion.div key={g.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.06 }} whileHover={{ y: -3 }} className="group cursor-pointer rounded-2xl border border-border/50 bg-white p-5 transition-shadow hover:shadow-md">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${g.iconColor}`}><g.icon className="h-5 w-5" /></div>
                          <Badge variant="secondary" className="text-[0.6875rem]">{g.tag}</Badge>
                        </div>
                        <h3 className="text-[0.9375rem] mb-1" style={{ fontWeight: 600 }}>{g.title}</h3>
                        <p className="text-[0.8125rem] text-muted-foreground leading-relaxed">{g.desc}</p>
                        <div className="mt-3 flex items-center gap-1 text-[0.8125rem] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          <span style={{ fontWeight: 500 }}>阅读全文</span><ChevronR className="h-3.5 w-3.5" />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {helpTab === "faq" && (
                  <motion.div key="faq" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="max-w-2xl space-y-3">
                    {faqItems.map((faq, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="overflow-hidden rounded-xl border border-border/50 bg-white">
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
                      { title: "在线客服", desc: "工作日 9:00-18:00 在线响应，平均回复时间 < 5 分钟。", icon: MessageCircle, iconColor: "text-primary bg-primary/10", action: "发起对话" },
                      { title: "邮件支持", desc: "发送邮件至 support@lifenix.ai，24 小时内回复。", icon: Mail, iconColor: "text-blue-600 bg-blue-50", action: "发送邮件" },
                      { title: "社区论坛", desc: "加入社区与其他用户交流经验，分享使用技巧。", icon: Globe, iconColor: "text-emerald-600 bg-emerald-50", action: "访问论坛" },
                    ].map((c, i) => (
                      <motion.div key={c.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.08 }} className="rounded-2xl border border-border/50 bg-white p-5">
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
                          <h3 className="text-[0.9375rem] mb-1" style={{ fontWeight: 600 }}>预约演示</h3>
                          <p className="text-[0.8125rem] text-muted-foreground leading-relaxed mb-3">想了解 Pro 版的高级功能？预约一对一演示，我们的产品专家将为你详细介绍。</p>
                          <Button size="sm" className="rounded-lg bg-primary text-white hover:bg-primary/90">预约 Demo</Button>
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
              category: task.assignee || "AI 解析",
            },
          ]);
        }}
      />
    </div>
  );
}