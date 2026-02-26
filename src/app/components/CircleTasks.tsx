import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Sparkles,
  Clock,
  ChevronRight,
  X,
  Check,
  Zap,
  AlertTriangle,
  MapPin,
  AtSign,
  Loader2,
  ShoppingCart,
  ListChecks,
  ClipboardList,
  UserCheck,
  Bell,
  BellRing,
  MessageSquare,
  Target,
  Trash2,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Heart,
  Timer,
  Route,
  Brain,
  Send,
} from "lucide-react";

/* ═══════════════ Types ═══════════════ */
interface Member {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  online: boolean;
  avatar: string;
}

interface SharedTask {
  id: string;
  text: string;
  completed: boolean;
  assigneeId: string | null;
  assigneeName: string | null;
  priority: "high" | "medium" | "low";
  dueDate: string | null;
  dueTime: string | null;
  category: string;
  createdBy: string;
  createdAt: string;
  aiSuggested: boolean;
  aiReason?: string;
  acceptedByAssignee: boolean;
  reminders: TaskReminder[];
}

interface TaskReminder {
  id: string;
  time: string;
  message: string;
  type: "gentle" | "nudge" | "urgent";
  sent: boolean;
}

interface SharedList {
  id: string;
  name: string;
  emoji: string;
  type: "shopping" | "todo" | "custom";
  items: SharedListItem[];
}

interface SharedListItem {
  id: string;
  text: string;
  checked: boolean;
  checkedBy: string | null;
  addedBy: string;
  quantity?: string;
}

interface AISuggestion {
  id: string;
  taskId: string;
  taskText: string;
  suggestedMemberId: string;
  suggestedMemberName: string;
  reason: string;
  factors: string[];
  confidence: number;
  accepted: boolean | null; // null = pending
}

/* ═══════════════ Member Colors ═══════════════ */
const memberColors: Record<string, { bg: string; text: string; light: string }> = {
  m1: { bg: "bg-violet-500", text: "text-violet-700", light: "bg-violet-100" },
  m2: { bg: "bg-rose-500", text: "text-rose-700", light: "bg-rose-100" },
  m3: { bg: "bg-sky-500", text: "text-sky-700", light: "bg-sky-100" },
  m4: { bg: "bg-amber-500", text: "text-amber-700", light: "bg-amber-100" },
  m5: { bg: "bg-emerald-500", text: "text-emerald-700", light: "bg-emerald-100" },
  m6: { bg: "bg-pink-500", text: "text-pink-700", light: "bg-pink-100" },
};
function getMC(id: string) {
  return memberColors[id] || { bg: "bg-gray-500", text: "text-gray-700", light: "bg-gray-100" };
}

/* ═══════════════ Priority Config ═══════════════ */
const priorityConfig = {
  high: { label: "紧急", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
  medium: { label: "一般", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  low: { label: "不急", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

/* ═══════════════ Mock Data Generators ═══════════════ */
function generateMockTasks(members: Member[]): SharedTask[] {
  const tasks: SharedTask[] = [
    {
      id: "t1", text: "周三下午去驿站拿快递", completed: false,
      assigneeId: null, assigneeName: null,
      priority: "medium", dueDate: "2026-02-28", dueTime: "17:00",
      category: "生活", createdBy: "小美", createdAt: "2026-02-26T08:00:00Z",
      aiSuggested: false, acceptedByAssignee: false, reminders: [],
    },
    {
      id: "t2", text: "预约周末餐厅（避免海鲜）", completed: false,
      assigneeId: "m1", assigneeName: "我",
      priority: "high", dueDate: "2026-02-27", dueTime: null,
      category: "生活", createdBy: "妈妈", createdAt: "2026-02-25T14:00:00Z",
      aiSuggested: false, acceptedByAssignee: true,
      reminders: [
        { id: "r1", time: "明天 10:00", message: "温馨提醒：明天就要周末了，餐厅预约好了吗？不着急，今天处理就行~ 😊", type: "gentle", sent: true },
      ],
    },
    {
      id: "t3", text: "交物业费 Q1 季度", completed: false,
      assigneeId: "m1", assigneeName: "我",
      priority: "high", dueDate: "2026-02-28", dueTime: null,
      category: "账单", createdBy: "妈妈", createdAt: "2026-02-20T10:00:00Z",
      aiSuggested: false, acceptedByAssignee: true,
      reminders: [
        { id: "r2", time: "2026-02-26 09:00", message: "早上好！物业费 2月28日到期，还有2天哦。随手在APP上点一下就行~", type: "gentle", sent: true },
        { id: "r3", time: "2026-02-27 09:00", message: "最后一天啦！物业费明天到期，抽空处理一下吧 💪", type: "nudge", sent: false },
      ],
    },
    {
      id: "t4", text: "给客厅换新窗帘", completed: false,
      assigneeId: "m2", assigneeName: "小美",
      priority: "low", dueDate: null, dueTime: null,
      category: "家居", createdBy: "我", createdAt: "2026-02-22T16:00:00Z",
      aiSuggested: false, acceptedByAssignee: true, reminders: [],
    },
    {
      id: "t5", text: "带妈妈去体检（年度）", completed: false,
      assigneeId: null, assigneeName: null,
      priority: "medium", dueDate: "2026-03-10", dueTime: null,
      category: "健康", createdBy: "我", createdAt: "2026-02-24T09:00:00Z",
      aiSuggested: false, acceptedByAssignee: false, reminders: [],
    },
    {
      id: "t6", text: "修理阳台漏水", completed: true,
      assigneeId: "m1", assigneeName: "我",
      priority: "high", dueDate: "2026-02-24", dueTime: null,
      category: "维修", createdBy: "妈妈", createdAt: "2026-02-18T11:00:00Z",
      aiSuggested: false, acceptedByAssignee: true, reminders: [],
    },
  ];
  return tasks;
}

function generateMockSuggestions(members: Member[]): AISuggestion[] {
  const suggestions: AISuggestion[] = [];
  if (members.length >= 2) {
    suggestions.push({
      id: "sug1", taskId: "t1", taskText: "周三下午去驿站拿快递",
      suggestedMemberId: members.length > 2 ? "m3" : members[1].id,
      suggestedMemberName: members.length > 2 ? "妈妈" : members[1].name,
      reason: "基于位置和时间分析，这是最优人选",
      factors: [
        "📍 妈妈周三下午 15:00 在附近菜市场买菜，驿站顺路",
        "📅 妈妈当天 14:00-17:00 完全空闲",
        "🏃 步行到驿站仅需 5 分钟",
      ],
      confidence: 0.92,
      accepted: null,
    });
    suggestions.push({
      id: "sug2", taskId: "t5", taskText: "带妈妈去体检（年度）",
      suggestedMemberId: "m2",
      suggestedMemberName: "小美",
      reason: "小美周末比较空闲且有驾照",
      factors: [
        "📅 小美 3月8日（周六）全天空闲",
        "🚗 小美有车，方便接送",
        "💡 建议预约上午 9:00 空腹体检",
      ],
      confidence: 0.85,
      accepted: null,
    });
  }
  return suggestions;
}

function generateMockLists(): SharedList[] {
  return [
    {
      id: "list1", name: "超市购物清单", emoji: "🛒", type: "shopping",
      items: [
        { id: "li1", text: "牛奶", checked: true, checkedBy: "小美", addedBy: "妈妈", quantity: "2盒" },
        { id: "li2", text: "鸡蛋", checked: false, checkedBy: null, addedBy: "妈妈", quantity: "1板" },
        { id: "li3", text: "面包", checked: false, checkedBy: null, addedBy: "我", quantity: "1袋" },
        { id: "li4", text: "洗洁精", checked: false, checkedBy: null, addedBy: "小美" },
        { id: "li5", text: "厨房纸巾", checked: true, checkedBy: "我", addedBy: "妈妈", quantity: "2卷" },
        { id: "li6", text: "苹果", checked: false, checkedBy: null, addedBy: "妈妈", quantity: "3斤" },
      ],
    },
    {
      id: "list2", name: "新房装修待办", emoji: "🏗️", type: "todo",
      items: [
        { id: "li7", text: "确认瓷砖颜色", checked: true, checkedBy: "小美", addedBy: "我" },
        { id: "li8", text: "找水电工报价", checked: false, checkedBy: null, addedBy: "我" },
        { id: "li9", text: "购买灯具", checked: false, checkedBy: null, addedBy: "小美" },
        { id: "li10", text: "测量窗帘尺寸", checked: false, checkedBy: null, addedBy: "我" },
      ],
    },
  ];
}

/* ═══════════════ Props ═══════════════ */
interface CircleTasksProps {
  members: Member[];
  circleName: string;
  circleType: "family" | "team" | "project";
}

/* ═══════════════ Component ═══════════════ */
export function CircleTasks({ members, circleName, circleType }: CircleTasksProps) {
  const [tasks, setTasks] = useState<SharedTask[]>(() => generateMockTasks(members));
  const [suggestions, setSuggestions] = useState<AISuggestion[]>(() => generateMockSuggestions(members));
  const [lists, setLists] = useState<SharedList[]>(generateMockLists);
  const [activeSection, setActiveSection] = useState<"tasks" | "lists">("tasks");
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddList, setShowAddList] = useState(false);
  const [taskFilter, setTaskFilter] = useState<"all" | "unassigned" | "mine" | "completed">("all");
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(suggestions[0]?.id || null);

  // New task form
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("生活");

  // New list form
  const [newListName, setNewListName] = useState("");
  const [newListEmoji, setNewListEmoji] = useState("📋");

  // New list item
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({});

  // AI analyzing state
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const unassigned = tasks.filter((t) => !t.assigneeId && !t.completed).length;

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === "all") return !t.completed;
    if (taskFilter === "unassigned") return !t.assigneeId && !t.completed;
    if (taskFilter === "mine") return t.assigneeId === "m1" && !t.completed;
    if (taskFilter === "completed") return t.completed;
    return true;
  });

  const pendingSuggestions = suggestions.filter((s) => s.accepted === null);

  // ── Handlers ──
  const addTask = () => {
    if (!newTaskText.trim()) return;
    const task: SharedTask = {
      id: `t-${Date.now()}`,
      text: newTaskText.trim(),
      completed: false,
      assigneeId: null,
      assigneeName: null,
      priority: newTaskPriority,
      dueDate: newTaskDue || null,
      dueTime: null,
      category: newTaskCategory,
      createdBy: "我",
      createdAt: new Date().toISOString(),
      aiSuggested: false,
      acceptedByAssignee: false,
      reminders: [],
    };
    setTasks((prev) => [task, ...prev]);
    setNewTaskText("");
    setNewTaskDue("");
    setShowAddTask(false);

    // Auto-suggest assignment after short delay
    setTimeout(() => {
      if (members.length > 1) {
        const randomMember = members[Math.floor(Math.random() * (members.length - 1)) + 1] || members[0];
        const newSuggestion: AISuggestion = {
          id: `sug-${Date.now()}`,
          taskId: task.id,
          taskText: task.text,
          suggestedMemberId: randomMember.id,
          suggestedMemberName: randomMember.name,
          reason: "基于成员当前空闲度和位置分析",
          factors: [
            `📅 ${randomMember.name}在截止日前有充足空闲时间`,
            `📍 距离相关地点最近`,
            `✅ 历史完成率高，适合此类任务`,
          ],
          confidence: 0.75 + Math.random() * 0.2,
          accepted: null,
        };
        setSuggestions((prev) => [newSuggestion, ...prev]);
        setExpandedSuggestion(newSuggestion.id);
      }
    }, 800);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSuggestions((prev) => prev.filter((s) => s.taskId !== id));
  };

  const acceptSuggestion = (sugId: string) => {
    const sug = suggestions.find((s) => s.id === sugId);
    if (!sug) return;
    setSuggestions((prev) => prev.map((s) => (s.id === sugId ? { ...s, accepted: true } : s)));
    setTasks((prev) =>
      prev.map((t) =>
        t.id === sug.taskId
          ? { ...t, assigneeId: sug.suggestedMemberId, assigneeName: sug.suggestedMemberName, aiSuggested: true, aiReason: sug.reason, acceptedByAssignee: false }
          : t
      )
    );
    // Simulate assignee accepting
    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) => (t.id === sug.taskId ? { ...t, acceptedByAssignee: true } : t))
      );
    }, 1500);
  };

  const rejectSuggestion = (sugId: string) => {
    setSuggestions((prev) => prev.map((s) => (s.id === sugId ? { ...s, accepted: false } : s)));
  };

  const manualAssign = (taskId: string, memberId: string, memberName: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, assigneeId: memberId, assigneeName: memberName, acceptedByAssignee: false }
          : t
      )
    );
    setTimeout(() => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, acceptedByAssignee: true } : t))
      );
    }, 1000);
  };

  const toggleListItem = (listId: string, itemId: string) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              items: l.items.map((i) =>
                i.id === itemId
                  ? { ...i, checked: !i.checked, checkedBy: !i.checked ? "我" : null }
                  : i
              ),
            }
          : l
      )
    );
  };

  const addListItem = (listId: string) => {
    const text = newItemTexts[listId]?.trim();
    if (!text) return;
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              items: [
                ...l.items,
                { id: `li-${Date.now()}`, text, checked: false, checkedBy: null, addedBy: "我" },
              ],
            }
          : l
      )
    );
    setNewItemTexts((prev) => ({ ...prev, [listId]: "" }));
  };

  const deleteListItem = (listId: string, itemId: string) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId ? { ...l, items: l.items.filter((i) => i.id !== itemId) } : l
      )
    );
  };

  const createList = () => {
    if (!newListName.trim()) return;
    const list: SharedList = {
      id: `list-${Date.now()}`,
      name: newListName.trim(),
      emoji: newListEmoji,
      type: "custom",
      items: [],
    };
    setLists((prev) => [...prev, list]);
    setNewListName("");
    setShowAddList(false);
  };

  const requestAIAnalysis = () => {
    setAiAnalyzing(true);
    setTimeout(() => {
      // Generate a new suggestion for an unassigned task
      const unassignedTasks = tasks.filter((t) => !t.assigneeId && !t.completed);
      if (unassignedTasks.length > 0 && members.length > 1) {
        const task = unassignedTasks[0];
        const candidates = members.filter((m) => m.id !== "m1");
        const chosen = candidates[Math.floor(Math.random() * candidates.length)];
        const newSug: AISuggestion = {
          id: `sug-${Date.now()}`,
          taskId: task.id,
          taskText: task.text,
          suggestedMemberId: chosen.id,
          suggestedMemberName: chosen.name,
          reason: "AI 综合分析后推荐最优人选",
          factors: [
            `📅 ${chosen.name}近期日程较空闲`,
            `📍 生活动线与任务地点重合度高`,
            `⭐ ${chosen.name}擅长此类任务，历史完成率 96%`,
          ],
          confidence: 0.8 + Math.random() * 0.18,
          accepted: null,
        };
        setSuggestions((prev) => [newSug, ...prev]);
        setExpandedSuggestion(newSug.id);
      }
      setAiAnalyzing(false);
    }, 1500);
  };

  const categories = circleType === "family"
    ? ["生活", "账单", "健康", "家居", "维修", "其他"]
    : ["开发", "设计", "运营", "会议", "文档", "其他"];

  const listEmojis = ["📋", "🛒", "🏗️", "📚", "🎯", "🎁", "🍽️", "✈️"];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Top Stats Bar ── */}
      <div className="shrink-0 px-3 py-3 sm:px-5 border-b border-border/30 bg-white/60">
        {/* Stats */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-[0.75rem] text-muted-foreground">{totalTasks - completedTasks} 待办</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[0.75rem] text-muted-foreground">{completedTasks} 完成</span>
            </div>
            {unassigned > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[0.75rem] text-amber-600" style={{ fontWeight: 500 }}>{unassigned} 待分配</span>
              </div>
            )}
          </div>
          <Progress value={totalTasks ? (completedTasks / totalTasks) * 100 : 0} className="h-1.5 w-20 sm:w-28" />
          <span className="text-[0.6875rem] text-muted-foreground">{totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}%</span>
        </div>

        {/* Section toggle + actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-0.5 rounded-xl bg-muted/40 p-0.5">
            {([
              { key: "tasks" as const, label: "任务池", icon: ClipboardList },
              { key: "lists" as const, label: "共享清单", icon: ShoppingCart },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[0.75rem] transition-all ${
                  activeSection === tab.key ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
                style={{ fontWeight: activeSection === tab.key ? 600 : 400 }}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {activeSection === "tasks" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={requestAIAnalysis}
                  disabled={aiAnalyzing}
                  className="rounded-xl text-[0.75rem] gap-1 border-primary/30 text-primary hover:bg-primary/5"
                >
                  {aiAnalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Brain className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">AI 分配</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowAddTask(true)}
                  className="rounded-xl text-[0.75rem] gap-1 bg-primary text-white hover:bg-primary/90"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">新任务</span>
                </Button>
              </>
            )}
            {activeSection === "lists" && (
              <Button
                size="sm"
                onClick={() => setShowAddList(true)}
                className="rounded-xl text-[0.75rem] gap-1 bg-primary text-white hover:bg-primary/90"
              >
                <Plus className="h-3.5 w-3.5" />
                新清单
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* ═══ TASKS SECTION ═══ */}
          {activeSection === "tasks" && (
            <motion.div
              key="tasks-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-3 py-4 sm:px-5 space-y-5"
            >
              {/* AI Suggestions Banner */}
              {pendingSuggestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="text-[0.8125rem]" style={{ fontWeight: 600 }}>AI 智能指派建议</span>
                    <Badge className="bg-primary/10 text-primary text-[0.5625rem] h-4">{pendingSuggestions.length} 条待确认</Badge>
                  </div>
                  <div className="space-y-2.5">
                    {pendingSuggestions.map((sug, i) => {
                      const mc = getMC(sug.suggestedMemberId);
                      const isExpanded = expandedSuggestion === sug.id;
                      return (
                        <motion.div
                          key={sug.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/[0.03] to-purple-50/50 overflow-hidden"
                        >
                          <button
                            onClick={() => setExpandedSuggestion(isExpanded ? null : sug.id)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left"
                          >
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${mc.bg} text-white text-[0.75rem]`} style={{ fontWeight: 700 }}>
                              {sug.suggestedMemberName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[0.8125rem]" style={{ fontWeight: 500 }}>
                                建议将「{sug.taskText}」分配给 <span className={mc.text} style={{ fontWeight: 600 }}>{sug.suggestedMemberName}</span>
                              </div>
                              <div className="text-[0.6875rem] text-muted-foreground mt-0.5">{sug.reason}</div>
                            </div>
                            <Badge className={`shrink-0 text-[0.5625rem] h-4 ${sug.confidence > 0.9 ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                              {Math.round(sug.confidence * 100)}%
                            </Badge>
                            <ChevronRight className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="border-t border-primary/10 px-4 py-3 space-y-2.5">
                                  {/* Factors */}
                                  <div className="space-y-1.5">
                                    {sug.factors.map((f, fi) => (
                                      <motion.div
                                        key={fi}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: fi * 0.08 }}
                                        className="text-[0.75rem] text-muted-foreground leading-relaxed"
                                      >
                                        {f}
                                      </motion.div>
                                    ))}
                                  </div>
                                  {/* Actions */}
                                  <div className="flex gap-2 pt-1">
                                    <Button
                                      size="sm"
                                      onClick={() => acceptSuggestion(sug.id)}
                                      className="flex-1 rounded-xl bg-primary text-white hover:bg-primary/90 text-[0.75rem] gap-1"
                                    >
                                      <UserCheck className="h-3.5 w-3.5" />
                                      确认分配给{sug.suggestedMemberName}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => rejectSuggestion(sug.id)}
                                      className="rounded-xl text-[0.75rem]"
                                    >
                                      换人
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI Reminders Preview */}
              {tasks.some((t) => t.reminders.length > 0 && !t.completed) && (
                <div className="rounded-xl border border-amber-200/60 bg-gradient-to-r from-amber-50/50 to-orange-50/30 p-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <BellRing className="h-4 w-4 text-amber-600" />
                    <span className="text-[0.8125rem] text-amber-800" style={{ fontWeight: 600 }}>AI 温和催办</span>
                    <Badge className="bg-amber-100 text-amber-700 text-[0.5625rem] h-4">自动发送</Badge>
                  </div>
                  <div className="space-y-2">
                    {tasks
                      .filter((t) => t.reminders.length > 0 && !t.completed)
                      .flatMap((t) =>
                        t.reminders.map((r) => ({ ...r, taskText: t.text, taskAssignee: t.assigneeName }))
                      )
                      .slice(0, 3)
                      .map((r, i) => (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`rounded-lg px-3 py-2 text-[0.75rem] leading-relaxed ${
                            r.sent ? "bg-white/60 border border-amber-100" : "bg-white border border-amber-200"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`text-[0.625rem] ${r.sent ? "text-muted-foreground" : "text-amber-600"}`} style={{ fontWeight: 500 }}>
                              {r.sent ? "✓ 已发送" : `⏳ ${r.time}`}
                            </span>
                            <span className="text-[0.625rem] text-muted-foreground">→ {r.taskAssignee}</span>
                            <span className="text-[0.625rem] text-muted-foreground/50 ml-auto">
                              「{r.taskText}」
                            </span>
                          </div>
                          <div className="text-muted-foreground italic">"{r.message}"</div>
                        </motion.div>
                      ))}
                  </div>
                  <p className="mt-2 text-[0.625rem] text-amber-600/60 flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    AI 会用温和的语气代替你催办，保持团队和气
                  </p>
                </div>
              )}

              {/* Task filter tabs */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {([
                  { key: "all" as const, label: "全部待办", count: tasks.filter((t) => !t.completed).length },
                  { key: "unassigned" as const, label: "待分配", count: unassigned },
                  { key: "mine" as const, label: "我的", count: tasks.filter((t) => t.assigneeId === "m1" && !t.completed).length },
                  { key: "completed" as const, label: "已完成", count: completedTasks },
                ]).map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setTaskFilter(f.key)}
                    className={`shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[0.75rem] transition-all ${
                      taskFilter === f.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/60"
                    }`}
                    style={{ fontWeight: taskFilter === f.key ? 600 : 400 }}
                  >
                    {f.label}
                    <span className={`text-[0.625rem] ${taskFilter === f.key ? "text-primary/70" : "text-muted-foreground/50"}`}>
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Task List */}
              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {filteredTasks.map((task, i) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={i}
                      members={members}
                      onToggle={() => toggleTask(task.id)}
                      onDelete={() => deleteTask(task.id)}
                      onAssign={(mId, mName) => manualAssign(task.id, mId, mName)}
                    />
                  ))}
                </AnimatePresence>

                {filteredTasks.length === 0 && (
                  <div className="flex flex-col items-center py-10 text-center">
                    <ClipboardList className="h-10 w-10 text-muted-foreground/20 mb-2" />
                    <p className="text-[0.8125rem] text-muted-foreground">
                      {taskFilter === "completed" ? "还没有完成的任务" : "暂无任务"}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══ SHARED LISTS SECTION ═══ */}
          {activeSection === "lists" && (
            <motion.div
              key="lists-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-3 py-4 sm:px-5 space-y-4"
            >
              {/* AI context notice */}
              <div className="rounded-xl bg-gradient-to-r from-primary/5 to-purple-50 border border-primary/10 px-4 py-2.5 flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <p className="text-[0.75rem] text-muted-foreground leading-relaxed">
                  清单实时同步给所有成员，任何人打勾后全员可见。AI 会根据清单内容自动建议采购路线和预算。
                </p>
              </div>

              {lists.map((list, li) => {
                const checkedCount = list.items.filter((i) => i.checked).length;
                return (
                  <motion.div
                    key={list.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: li * 0.06 }}
                    className="rounded-xl border border-border/50 bg-white overflow-hidden"
                  >
                    {/* List header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
                      <span className="text-[1.25rem]">{list.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[0.875rem] truncate" style={{ fontWeight: 600 }}>{list.name}</div>
                        <div className="text-[0.6875rem] text-muted-foreground">
                          {checkedCount}/{list.items.length} 完成
                        </div>
                      </div>
                      <Progress value={list.items.length ? (checkedCount / list.items.length) * 100 : 0} className="h-1.5 w-16" />
                    </div>

                    {/* List items */}
                    <div className="divide-y divide-border/20">
                      <AnimatePresence initial={false}>
                        {list.items.map((item, ii) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 12, height: 0 }}
                            transition={{ delay: ii * 0.02 }}
                            layout
                            className={`group flex items-center gap-3 px-4 py-2.5 ${item.checked ? "bg-muted/20" : "hover:bg-muted/10"}`}
                          >
                            <Checkbox
                              checked={item.checked}
                              onCheckedChange={() => toggleListItem(list.id, item.id)}
                            />
                            <div className="flex-1 min-w-0">
                              <span className={`text-[0.8125rem] ${item.checked ? "line-through text-muted-foreground" : ""}`}>
                                {item.text}
                              </span>
                              {item.quantity && (
                                <span className="ml-1.5 text-[0.6875rem] text-muted-foreground/60">× {item.quantity}</span>
                              )}
                            </div>
                            {item.checked && item.checkedBy && (
                              <span className="text-[0.5625rem] text-emerald-600 bg-emerald-50 rounded-full px-1.5 py-0.5 shrink-0" style={{ fontWeight: 500 }}>
                                {item.checkedBy} ✓
                              </span>
                            )}
                            {!item.checked && (
                              <span className="text-[0.5625rem] text-muted-foreground/40 shrink-0">{item.addedBy}</span>
                            )}
                            <button
                              onClick={() => deleteListItem(list.id, item.id)}
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity shrink-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Add item */}
                    <div className="flex items-center gap-2 px-4 py-2.5 border-t border-border/20 bg-muted/10">
                      <input
                        value={newItemTexts[list.id] || ""}
                        onChange={(e) => setNewItemTexts((prev) => ({ ...prev, [list.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && addListItem(list.id)}
                        placeholder="添加新项目..."
                        className="flex-1 bg-transparent text-[0.8125rem] outline-none placeholder:text-muted-foreground/40"
                      />
                      <button
                        onClick={() => addListItem(list.id)}
                        disabled={!newItemTexts[list.id]?.trim()}
                        className="rounded-lg p-1.5 text-primary hover:bg-primary/10 disabled:opacity-30 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              {lists.length === 0 && (
                <div className="flex flex-col items-center py-12 text-center">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground/20 mb-2" />
                  <p className="text-[0.8125rem] text-muted-foreground">还没有共享清单</p>
                  <p className="text-[0.6875rem] text-muted-foreground/60 mt-1">创建一个清单，和成员一起使用</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ Add Task Modal ═══ */}
      <AnimatePresence>
        {showAddTask && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowAddTask(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-3 top-[15%] z-50 mx-auto max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:inset-x-auto sm:w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[1.0625rem]" style={{ fontWeight: 600 }}>新建共享任务</h3>
                <button onClick={() => setShowAddTask(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <Input
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder="任务内容..."
                  className="rounded-xl"
                  autoFocus
                />

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[0.6875rem] text-muted-foreground mb-1 block" style={{ fontWeight: 500 }}>优先级</label>
                    <div className="flex gap-1.5">
                      {(["high", "medium", "low"] as const).map((p) => {
                        const pc = priorityConfig[p];
                        return (
                          <button
                            key={p}
                            onClick={() => setNewTaskPriority(p)}
                            className={`flex-1 rounded-lg px-2 py-1.5 text-[0.6875rem] transition-all ${
                              newTaskPriority === p ? `${pc.color} ring-1 ring-current/20` : "bg-muted/40 text-muted-foreground"
                            }`}
                            style={{ fontWeight: newTaskPriority === p ? 600 : 400 }}
                          >
                            {pc.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="text-[0.6875rem] text-muted-foreground mb-1 block" style={{ fontWeight: 500 }}>截止日期</label>
                    <input
                      type="date"
                      value={newTaskDue}
                      onChange={(e) => setNewTaskDue(e.target.value)}
                      className="rounded-lg border border-border/50 bg-muted/20 px-2 py-1.5 text-[0.75rem] outline-none focus:border-primary/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[0.6875rem] text-muted-foreground mb-1 block" style={{ fontWeight: 500 }}>分类</label>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNewTaskCategory(cat)}
                        className={`rounded-lg px-2.5 py-1 text-[0.6875rem] transition-all ${
                          newTaskCategory === cat ? "bg-primary/10 text-primary ring-1 ring-primary/20" : "bg-muted/40 text-muted-foreground"
                        }`}
                        style={{ fontWeight: newTaskCategory === cat ? 600 : 400 }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-primary/5 border border-primary/10 px-3 py-2">
                  <Sparkles className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-[0.6875rem] text-muted-foreground leading-relaxed">
                    创建后 AI 将自动分析并推荐最合适的负责人
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <Button variant="outline" onClick={() => setShowAddTask(false)} className="flex-1 rounded-xl">
                  取消
                </Button>
                <Button onClick={addTask} disabled={!newTaskText.trim()} className="flex-1 rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-40">
                  创建任务
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ Add List Modal ═══ */}
      <AnimatePresence>
        {showAddList && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowAddList(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-3 top-[25%] z-50 mx-auto max-w-sm rounded-2xl bg-white p-5 shadow-2xl sm:inset-x-auto sm:w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[1.0625rem]" style={{ fontWeight: 600 }}>新建共享清单</h3>
                <button onClick={() => setShowAddList(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-3">
                <label className="text-[0.75rem] text-muted-foreground mb-2 block" style={{ fontWeight: 500 }}>图标</label>
                <div className="flex gap-2">
                  {listEmojis.map((em) => (
                    <button
                      key={em}
                      onClick={() => setNewListEmoji(em)}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-[1.125rem] transition-all ${
                        newListEmoji === em ? "bg-primary/10 ring-2 ring-primary/30 scale-110" : "bg-muted/40 hover:bg-muted/80"
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-[0.75rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>清单名称</label>
                <Input
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createList()}
                  placeholder="例如：超市购物清单..."
                  className="rounded-xl"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAddList(false)} className="flex-1 rounded-xl">
                  取消
                </Button>
                <Button onClick={createList} disabled={!newListName.trim()} className="flex-1 rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-40">
                  创建清单
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════ Task Card Sub-Component ═══════════════ */
function TaskCard({
  task,
  index,
  members,
  onToggle,
  onDelete,
  onAssign,
}: {
  task: SharedTask;
  index: number;
  members: Member[];
  onToggle: () => void;
  onDelete: () => void;
  onAssign: (memberId: string, memberName: string) => void;
}) {
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const pc = priorityConfig[task.priority];
  const mc = task.assigneeId ? getMC(task.assigneeId) : null;

  const dueInfo = (() => {
    if (!task.dueDate) return null;
    const due = new Date(task.dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { label: `逾期 ${-diff} 天`, color: "text-red-600 bg-red-50", urgent: true };
    if (diff === 0) return { label: "今天到期", color: "text-amber-600 bg-amber-50", urgent: true };
    if (diff === 1) return { label: "明天到期", color: "text-amber-600 bg-amber-50", urgent: false };
    return { label: `${diff} 天后`, color: "text-muted-foreground bg-muted/50", urgent: false };
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      layout
      className={`group relative rounded-xl border bg-white px-4 py-3 transition-all hover:shadow-sm ${
        task.completed ? "border-border/20 opacity-60" : "border-border/40 hover:border-primary/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={onToggle}
          className="mt-0.5"
        />

        <div className="flex-1 min-w-0">
          {/* Task text */}
          <div className={`text-[0.8125rem] leading-relaxed ${task.completed ? "line-through text-muted-foreground" : ""}`}>
            {task.text}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
            <Badge className={`${pc.color} text-[0.5625rem] h-4`}>{pc.label}</Badge>
            <span className="text-[0.625rem] text-muted-foreground/60">{task.category}</span>

            {dueInfo && (
              <span className={`inline-flex items-center gap-0.5 text-[0.625rem] rounded-full px-1.5 py-0.5 ${dueInfo.color}`} style={{ fontWeight: dueInfo.urgent ? 600 : 400 }}>
                <Clock className="h-2.5 w-2.5" />
                {dueInfo.label}
              </span>
            )}

            {/* Assignee chip */}
            {task.assigneeId && mc ? (
              <span className={`inline-flex items-center gap-1 text-[0.625rem] rounded-full ${mc.light} ${mc.text} pl-0.5 pr-1.5 py-0.5`} style={{ fontWeight: 500 }}>
                <span className={`h-3.5 w-3.5 rounded-full ${mc.bg} text-white flex items-center justify-center text-[0.4375rem]`} style={{ fontWeight: 700 }}>
                  {task.assigneeName?.charAt(0)}
                </span>
                {task.assigneeName}
                {task.acceptedByAssignee && <Check className="h-2.5 w-2.5 ml-0.5" />}
                {!task.acceptedByAssignee && <Timer className="h-2.5 w-2.5 ml-0.5 animate-pulse" />}
              </span>
            ) : !task.completed ? (
              <div className="relative">
                <button
                  onClick={() => setShowAssignMenu(!showAssignMenu)}
                  className="inline-flex items-center gap-0.5 text-[0.625rem] text-primary/70 hover:text-primary bg-primary/5 hover:bg-primary/10 rounded-full px-1.5 py-0.5 transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  <AtSign className="h-2.5 w-2.5" />
                  分配
                </button>
                <AnimatePresence>
                  {showAssignMenu && (
                    <>
                      <motion.div
                        className="fixed inset-0 z-20"
                        onClick={() => setShowAssignMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        className="absolute top-full left-0 mt-1 z-30 min-w-[140px] rounded-xl border border-border/50 bg-white py-1 shadow-lg"
                      >
                        {members.map((m) => {
                          const mmc = getMC(m.id);
                          return (
                            <button
                              key={m.id}
                              onClick={() => { onAssign(m.id, m.name); setShowAssignMenu(false); }}
                              className="flex w-full items-center gap-2 px-3 py-1.5 text-[0.75rem] hover:bg-muted/60 transition-colors"
                            >
                              <span className={`h-5 w-5 rounded-full ${mmc.bg} text-white flex items-center justify-center text-[0.5rem]`} style={{ fontWeight: 700 }}>
                                {m.avatar.charAt(0)}
                              </span>
                              {m.name}
                            </button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : null}

            {task.aiSuggested && (
              <span className="inline-flex items-center gap-0.5 text-[0.5625rem] text-primary/60 bg-primary/5 rounded-full px-1.5 py-0.5">
                <Sparkles className="h-2.5 w-2.5" />AI 分配
              </span>
            )}

            {task.reminders.length > 0 && !task.completed && (
              <span className="inline-flex items-center gap-0.5 text-[0.5625rem] text-amber-600/70 bg-amber-50 rounded-full px-1.5 py-0.5">
                <BellRing className="h-2.5 w-2.5" />{task.reminders.length} 条提醒
              </span>
            )}
          </div>

          {/* AI reason hint */}
          {task.aiReason && !task.completed && (
            <div className="mt-1.5 flex items-center gap-1 text-[0.625rem] text-primary/50">
              <Route className="h-3 w-3" />
              {task.aiReason}
            </div>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={onDelete}
          className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
