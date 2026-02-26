import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { useAuth } from "./AuthContext";
import { useAppContext } from "./AppLayout";
import {
  CalendarDays,
  ListTodo,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Clock,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Trash2,
  TrendingUp,
} from "lucide-react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  category: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  time: string;
}

interface CalendarEvent {
  id: string;
  time: string;
  title: string;
  color: string;
  duration: string;
}

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

const initialChat: ChatMessage[] = [
  {
    id: "1",
    role: "ai",
    content: "你好！我是你的 Lifenix AI 助手。今天你有 6 个任务和 6 个日程安排。我可以帮你优化时间安排、管理任务优先级，或者回答任何问题。有什么需要帮忙的吗？",
    time: "09:00",
  },
];

const aiResponses: Record<string, string> = {
  default: "我理解了你的需求。让我帮你分析一下，给出最佳建议...\n\n基于你当前的任务和日程，我建议你：\n1. 优先完成高优先级任务\n2. 在会议间隙处理邮件\n3. 下午安排健身时间放松",
  任务: "根据你的任务列表，我建议按以下优先级处理：\n\n1. 首先完成「季度项目报告」- 这是最紧急的\n2. 14:00 参加团队周会\n3. 会后准备明天的演讲稿\n4. 晚间安排阅读和健身",
  日程: "你今天的日程安排得很满。我注意到 12:00-14:00 有一段空闲，建议利用这段时间吃午饭并处理一些简单任务。17:00 之后可以安排健身活动。",
  建议: "这里有几个提升效率的建议：\n\n1. 使用番茄工作法，每25分钟休息5分钟\n2. 把类似任务集中处理（批量回复邮件）\n3. 重要任务放在上午精力最充沛的时候\n4. 设置「免打扰」时段专注工作",
  你好: "你好！很高兴为你服务。今天是忙碌的一天，但别担心，我会帮你高效地完成所有任务。需要我帮你调整日程安排吗？",
};

const priorityColors = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

const priorityLabels = {
  high: "高",
  medium: "中",
  low: "低",
};

export function Dashboard() {
  const { user } = useAuth();
  const { activeTab } = useAppContext();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [events] = useState<CalendarEvent[]>(initialEvents);
  const [chat, setChat] = useState<ChatMessage[]>(initialChat);
  const [newTask, setNewTask] = useState("");
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [currentDate] = useState(new Date());

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: newTask.trim(),
        completed: false,
        priority: "medium",
        category: "其他",
      },
    ]);
    setNewTask("");
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput.trim(),
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    };
    setChat((prev) => [...prev, userMsg]);

    const input = chatInput.trim();
    setChatInput("");

    setTimeout(() => {
      let response = aiResponses.default;
      for (const [key, val] of Object.entries(aiResponses)) {
        if (input.includes(key)) {
          response = val;
          break;
        }
      }
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: response,
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      };
      setChat((prev) => [...prev, aiMsg]);
    }, 800);
  };

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
  const today = currentDate.getDate();

  return (
    <div className="bg-background">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "待办任务", value: tasks.filter((t) => !t.completed).length, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "今日日程", value: events.length, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "已完成", value: completedCount, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "完成率", value: `${progress}%`, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((s, i) => (
            <div key={i} className={`rounded-xl ${s.bg} p-4`}>
              <div className={`text-[1.5rem] ${s.color}`} style={{ fontWeight: 700 }}>{s.value}</div>
              <div className="text-[0.8125rem] text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Task Panel */}
        {activeTab === "tasks" && (
          <div className="rounded-2xl border border-border/50 bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-[1.25rem]" style={{ fontWeight: 600 }}>今日任务</h2>
                <div className="mt-2 flex items-center gap-3">
                  <Progress value={progress} className="h-2 w-40" />
                  <span className="text-[0.8125rem] text-muted-foreground">{completedCount}/{tasks.length} 已完成</span>
                </div>
              </div>
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
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`group flex items-center gap-3 rounded-xl border border-border/30 px-4 py-3 transition-all hover:border-primary/20 hover:shadow-sm ${
                    task.completed ? "opacity-60" : ""
                  }`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <span
                    className={`flex-1 text-[0.9375rem] ${task.completed ? "line-through text-muted-foreground" : ""}`}
                  >
                    {task.text}
                  </span>
                  <Badge variant="secondary" className={`text-[0.6875rem] ${priorityColors[task.priority]}`}>
                    {priorityLabels[task.priority]}
                  </Badge>
                  <Badge variant="outline" className="text-[0.6875rem]">
                    {task.category}
                  </Badge>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar Panel */}
        {activeTab === "calendar" && (
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            {/* Mini Calendar */}
            <div className="rounded-2xl border border-border/50 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[1rem]" style={{ fontWeight: 600 }}>
                  {currentDate.toLocaleDateString("zh-CN", { year: "numeric", month: "long" })}
                </h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {weekDays.map((d) => (
                  <div key={d} className="text-[0.75rem] text-muted-foreground py-1">{d}</div>
                ))}
                {Array.from({ length: 35 }).map((_, i) => {
                  const day = i - (new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()) + 1;
                  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
                  const isValid = day >= 1 && day <= daysInMonth;
                  const isToday = day === today;
                  return (
                    <div
                      key={i}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-[0.8125rem] transition-colors ${
                        isToday
                          ? "bg-primary text-white"
                          : isValid
                            ? "hover:bg-muted cursor-pointer"
                            : "text-muted-foreground/30"
                      }`}
                      style={isToday ? { fontWeight: 600 } : {}}
                    >
                      {isValid ? day : ""}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Events */}
            <div className="rounded-2xl border border-border/50 bg-white p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-[1.25rem]" style={{ fontWeight: 600 }}>今日日程</h2>
                <Button size="sm" variant="outline" className="rounded-lg">
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  添加日程
                </Button>
              </div>
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 rounded-xl border border-border/30 p-4 transition-all hover:border-primary/20 hover:shadow-sm"
                  >
                    <div className={`h-full w-1.5 self-stretch rounded-full ${event.color}`} />
                    <div className="flex items-center gap-2 w-20">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[0.875rem] text-muted-foreground">{event.time}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-[0.9375rem]" style={{ fontWeight: 500 }}>{event.title}</div>
                    </div>
                    <Badge variant="secondary" className="text-[0.75rem]">{event.duration}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat Panel */}
        {activeTab === "chat" && (
          <div className="rounded-2xl border border-border/50 bg-white">
            <div className="border-b border-border/50 px-6 py-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-[1rem]" style={{ fontWeight: 600 }}>Lifenix AI 助手</h2>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[0.75rem] text-muted-foreground">在线</span>
                </div>
              </div>
            </div>

            <div className="h-[400px] overflow-y-auto px-6 py-4 space-y-4">
              {chat.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[75%] ${msg.role === "user" ? "order-1" : ""}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 text-[0.9375rem] leading-relaxed whitespace-pre-line ${
                        msg.role === "ai"
                          ? "bg-muted/60 text-foreground"
                          : "bg-primary text-white"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className={`mt-1 text-[0.6875rem] text-muted-foreground ${msg.role === "user" ? "text-right" : ""}`}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t border-border/50 px-6 py-4">
              <div className="flex gap-2">
                <Input
                  placeholder="输入消息... (试试: 任务、日程、建议、你好)"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  className="rounded-xl"
                />
                <Button
                  onClick={sendMessage}
                  size="icon"
                  className="shrink-0 rounded-xl bg-primary text-white hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {["优化我的日程", "今天的任务优先级", "效率提升建议"].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setChatInput(q);
                    }}
                    className="rounded-full border border-border/50 px-3 py-1 text-[0.75rem] text-muted-foreground hover:bg-muted transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats Panel */}
        {activeTab === "stats" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border/50 bg-white p-6">
              <h3 className="mb-4 text-[1.125rem]" style={{ fontWeight: 600 }}>本周任务完成情况</h3>
              <div className="space-y-3">
                {["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map((day, i) => {
                  const vals = [85, 72, 90, progress, 0, 0, 0];
                  const isToday = i === currentDate.getDay() - 1;
                  return (
                    <div key={day} className="flex items-center gap-3">
                      <span className={`w-8 text-[0.8125rem] ${isToday ? "text-primary" : "text-muted-foreground"}`} style={isToday ? { fontWeight: 600 } : {}}>
                        {day}
                      </span>
                      <div className="flex-1 h-3 rounded-full bg-muted/60 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isToday ? "bg-primary" : "bg-primary/40"}`}
                          style={{ width: `${vals[i]}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-[0.8125rem] text-muted-foreground">{vals[i]}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-white p-6">
              <h3 className="mb-4 text-[1.125rem]" style={{ fontWeight: 600 }}>任务分类分布</h3>
              <div className="space-y-4">
                {[
                  { label: "工作", count: 3, color: "bg-blue-500", total: 6 },
                  { label: "会议", count: 1, color: "bg-purple-500", total: 6 },
                  { label: "健康", count: 1, color: "bg-emerald-500", total: 6 },
                  { label: "学习", count: 1, color: "bg-amber-500", total: 6 },
                ].map((cat) => (
                  <div key={cat.label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[0.875rem]" style={{ fontWeight: 500 }}>{cat.label}</span>
                      <span className="text-[0.8125rem] text-muted-foreground">{cat.count} 个任务</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden">
                      <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${(cat.count / cat.total) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-white p-6 md:col-span-2">
              <h3 className="mb-4 text-[1.125rem]" style={{ fontWeight: 600 }}>AI 洞察</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  {
                    title: "效率趋势",
                    desc: "你本周的效率比上周提升了12%，继续保持！",
                    icon: TrendingUp,
                    color: "text-emerald-600 bg-emerald-50",
                  },
                  {
                    title: "时间分配",
                    desc: "建议减少会议时间，增加深度工作的时段。",
                    icon: Clock,
                    color: "text-blue-600 bg-blue-50",
                  },
                  {
                    title: "健康提醒",
                    desc: "本周运动时间偏少，建议每天至少30分钟锻炼。",
                    icon: Sparkles,
                    color: "text-amber-600 bg-amber-50",
                  },
                ].map((insight) => (
                  <div key={insight.title} className={`rounded-xl p-5 ${insight.color.split(" ")[1]}`}>
                    <insight.icon className={`mb-2 h-6 w-6 ${insight.color.split(" ")[0]}`} />
                    <h4 className="text-[0.9375rem] mb-1" style={{ fontWeight: 600 }}>{insight.title}</h4>
                    <p className="text-[0.8125rem] text-muted-foreground">{insight.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}