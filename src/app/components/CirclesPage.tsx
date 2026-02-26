import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Plus,
  Search,
  Send,
  Sparkles,
  Brain,
  MessageSquare,
  Settings,
  Crown,
  UserPlus,
  Trash2,
  Edit3,
  Hash,
  BookOpen,
  Lightbulb,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  Copy,
  Star,
  Wifi,
  Home,
  Briefcase,
  FolderOpen,
  Globe,
  Lock,
  MoreHorizontal,
  AtSign,
  ArrowRight,
  CalendarDays,
  Zap,
  Shield,
  Eye,
  EyeOff,
  Calendar,
  ClipboardList,
} from "lucide-react";
import { CircleSchedule } from "./CircleSchedule";
import { CircleTasks } from "./CircleTasks";

/* ═══════════════ Types ═══════════════ */
interface Member {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  online: boolean;
  avatar: string;
}

interface SharedMemory {
  id: string;
  content: string;
  category: string;
  addedBy: string;
  createdAt: string;
  pinned: boolean;
}

interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  isAI: boolean;
  content: string;
  time: string;
  type: "text" | "ai-insight" | "ai-action";
  actionItems?: ActionItem[];
}

interface ActionItem {
  id: string;
  text: string;
  accepted: boolean;
}

interface Circle {
  id: string;
  name: string;
  emoji: string;
  type: "family" | "team" | "project";
  members: Member[];
  memories: SharedMemory[];
  messages: GroupMessage[];
  createdAt: string;
  aiEnabled: boolean;
}

type CircleView = "chat" | "tasks" | "schedule" | "memory" | "members";

/* ═══════════════ Mock Data ═══════════════ */
const memoryCategories = [
  { key: "general", label: "通用", icon: Lightbulb, color: "text-amber-600 bg-amber-50" },
  { key: "password", label: "密码/账号", icon: Lock, color: "text-red-600 bg-red-50" },
  { key: "preference", label: "偏好/忌口", icon: Star, color: "text-purple-600 bg-purple-50" },
  { key: "location", label: "位置/地点", icon: Home, color: "text-blue-600 bg-blue-50" },
  { key: "contact", label: "联系方式", icon: AtSign, color: "text-emerald-600 bg-emerald-50" },
];

const defaultCircles: Circle[] = [
  {
    id: "c1",
    name: "温馨小家",
    emoji: "🏠",
    type: "family",
    createdAt: "2026-01-15T08:00:00Z",
    aiEnabled: true,
    members: [
      { id: "m1", name: "我", email: "me@example.com", role: "owner", online: true, avatar: "我" },
      { id: "m2", name: "小美", email: "xiaomei@example.com", role: "admin", online: true, avatar: "美" },
      { id: "m3", name: "妈妈", email: "mama@example.com", role: "member", online: false, avatar: "妈" },
    ],
    memories: [
      { id: "mem1", content: "家里 Wi-Fi 密码是 Home2026Secure", category: "password", addedBy: "我", createdAt: "2026-01-16T10:00:00Z", pinned: true },
      { id: "mem2", content: "妈妈对海鲜过敏，点外卖注意避开虾蟹类", category: "preference", addedBy: "小美", createdAt: "2026-01-18T14:00:00Z", pinned: true },
      { id: "mem3", content: "电表箱在入户门背后的鞋柜上方", category: "location", addedBy: "我", createdAt: "2026-01-20T09:00:00Z", pinned: false },
      { id: "mem4", content: "物业电话：010-8888-6666，王管家", category: "contact", addedBy: "妈妈", createdAt: "2026-02-01T11:00:00Z", pinned: false },
      { id: "mem5", content: "小美周三、周五晚上有瑜伽课 19:00-20:30", category: "general", addedBy: "小美", createdAt: "2026-02-05T16:00:00Z", pinned: false },
    ],
    messages: [
      { id: "msg1", senderId: "m1", senderName: "我", isAI: false, content: "周末想一起出去玩，大家有什么想法？", time: "10:00", type: "text" },
      { id: "msg2", senderId: "m2", senderName: "小美", isAI: false, content: "我想去爬山或者逛公园！", time: "10:02", type: "text" },
      { id: "msg3", senderId: "m3", senderName: "妈妈", isAI: false, content: "我都行，别太累就好", time: "10:05", type: "text" },
      {
        id: "msg4", senderId: "ai", senderName: "Lifenix AI", isAI: true, time: "10:05", type: "ai-insight",
        content: "根据大家的偏好和本周天气（周六晴，22°C），我推荐以下方案：",
        actionItems: [
          { id: "a1", text: "方案A：奥森公园半日游（轻松休闲，适合妈妈）+ 附近餐厅午餐（已排除海鲜类）", accepted: false },
          { id: "a2", text: "方案B：香山登山（小美想爬山）+ 山脚农家乐（已确认无海鲜）", accepted: false },
          { id: "a3", text: "📅 确认后一键生成共享日历事件", accepted: false },
        ],
      },
    ],
  },
  {
    id: "c2",
    name: "产品三组",
    emoji: "💼",
    type: "team",
    createdAt: "2026-02-01T09:00:00Z",
    aiEnabled: true,
    members: [
      { id: "m1", name: "我", email: "me@example.com", role: "owner", online: true, avatar: "我" },
      { id: "m4", name: "张总", email: "zhang@company.com", role: "admin", online: true, avatar: "张" },
      { id: "m5", name: "李工", email: "li@company.com", role: "member", online: false, avatar: "李" },
      { id: "m6", name: "王设计", email: "wang@company.com", role: "member", online: true, avatar: "王" },
    ],
    memories: [
      { id: "tmem1", content: "张总不吃海鲜，团建订餐注意", category: "preference", addedBy: "李工", createdAt: "2026-02-02T10:00:00Z", pinned: true },
      { id: "tmem2", content: "项目 Jira 看板地址: jira.company.com/board/P3", category: "general", addedBy: "我", createdAt: "2026-02-03T14:00:00Z", pinned: true },
      { id: "tmem3", content: "每周三下午 14:00 固定周会，腾讯会议号 888-666-999", category: "general", addedBy: "张总", createdAt: "2026-02-05T09:00:00Z", pinned: false },
      { id: "tmem4", content: "设计稿统一用 Figma，项目空间已邀请全员", category: "general", addedBy: "王设计", createdAt: "2026-02-06T11:00:00Z", pinned: false },
    ],
    messages: [
      { id: "tmsg1", senderId: "m4", senderName: "张总", isAI: false, content: "Q1 的用户增长目标需要更新一下，大家准备下数据", time: "09:30", type: "text" },
      { id: "tmsg2", senderId: "m5", senderName: "李工", isAI: false, content: "好的，我整理下后端接口的性能数据", time: "09:32", type: "text" },
      { id: "tmsg3", senderId: "m6", senderName: "王设计", isAI: false, content: "新版首页设计稿已经上传到 Figma 了", time: "09:35", type: "text" },
      {
        id: "tmsg4", senderId: "ai", senderName: "Lifenix AI", isAI: true, time: "09:36", type: "ai-action",
        content: "我已从对话中提取了以下待办事项：",
        actionItems: [
          { id: "ta1", text: "张总：更新 Q1 用户增长目标文档", accepted: false },
          { id: "ta2", text: "李工：整理后端接口性能数据报告", accepted: false },
          { id: "ta3", text: "全员：Review 王设计的新版首页设计稿", accepted: false },
        ],
      },
    ],
  },
];

/* ═══════════════ Component ═══════════════ */
export function CirclesPage() {
  const { user } = useAuth();

  // Circle state
  const [circles, setCircles] = useState<Circle[]>(() => {
    try {
      const saved = localStorage.getItem("lifenix_circles");
      return saved ? JSON.parse(saved) : defaultCircles;
    } catch {
      return defaultCircles;
    }
  });
  const [selectedCircleId, setSelectedCircleId] = useState<string>(circles[0]?.id || "");
  const [circleView, setCircleView] = useState<CircleView>("chat");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Memory state
  const [newMemory, setNewMemory] = useState("");
  const [newMemoryCategory, setNewMemoryCategory] = useState("general");
  const [memorySearch, setMemorySearch] = useState("");
  const [showMemoryForm, setShowMemoryForm] = useState(false);
  const [memoryFilter, setMemoryFilter] = useState<string | null>(null);

  // Create circle state
  const [createName, setCreateName] = useState("");
  const [createEmoji, setCreateEmoji] = useState("🏠");
  const [createType, setCreateType] = useState<"family" | "team" | "project">("family");

  // Invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSent, setInviteSent] = useState(false);

  // Persist circles
  useEffect(() => {
    localStorage.setItem("lifenix_circles", JSON.stringify(circles));
  }, [circles]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [circles, selectedCircleId]);

  const selectedCircle = circles.find((c) => c.id === selectedCircleId);

  // ── Handlers ──
  const sendMessage = useCallback(() => {
    if (!chatInput.trim() || !selectedCircle) return;
    const newMsg: GroupMessage = {
      id: `msg-${Date.now()}`,
      senderId: "m1",
      senderName: user?.name || "我",
      isAI: false,
      content: chatInput.trim(),
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    };
    setCircles((prev) =>
      prev.map((c) => (c.id === selectedCircle.id ? { ...c, messages: [...c.messages, newMsg] } : c))
    );
    setChatInput("");

    // Simulate AI response
    if (selectedCircle.aiEnabled) {
      setAiTyping(true);
      setTimeout(() => {
        const aiResponses = [
          {
            content: `根据共享知识库的信息，我来帮大家整理一下：\n\n${selectedCircle.memories.slice(0, 2).map((m) => `• ${m.content}`).join("\n")}`,
            type: "ai-insight" as const,
            actionItems: undefined,
          },
          {
            content: "我从对话中发现了一些可以落实的行动点：",
            type: "ai-action" as const,
            actionItems: [
              { id: `act-${Date.now()}-1`, text: "创建共享日程：本周末团队活动", accepted: false },
              { id: `act-${Date.now()}-2`, text: "提醒全员查看最新更新", accepted: false },
            ],
          },
          {
            content: `好的，我注意到了。我已将这条信息记录到团队上下文中，后续有人问到相关问题时，我会自动引用这条信息来回答。`,
            type: "ai-insight" as const,
            actionItems: undefined,
          },
        ];
        const resp = aiResponses[Math.floor(Math.random() * aiResponses.length)];
        const aiMsg: GroupMessage = {
          id: `ai-${Date.now()}`,
          senderId: "ai",
          senderName: "Lifenix AI",
          isAI: true,
          content: resp.content,
          time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          type: resp.type,
          actionItems: resp.actionItems,
        };
        setCircles((prev) =>
          prev.map((c) => (c.id === selectedCircle.id ? { ...c, messages: [...c.messages, aiMsg] } : c))
        );
        setAiTyping(false);
      }, 1500);
    }
  }, [chatInput, selectedCircle, user]);

  const addMemory = () => {
    if (!newMemory.trim() || !selectedCircle) return;
    const mem: SharedMemory = {
      id: `mem-${Date.now()}`,
      content: newMemory.trim(),
      category: newMemoryCategory,
      addedBy: user?.name || "我",
      createdAt: new Date().toISOString(),
      pinned: false,
    };
    setCircles((prev) =>
      prev.map((c) => (c.id === selectedCircle.id ? { ...c, memories: [...c.memories, mem] } : c))
    );
    setNewMemory("");
    setShowMemoryForm(false);
  };

  const toggleMemoryPin = (memId: string) => {
    if (!selectedCircle) return;
    setCircles((prev) =>
      prev.map((c) =>
        c.id === selectedCircle.id
          ? { ...c, memories: c.memories.map((m) => (m.id === memId ? { ...m, pinned: !m.pinned } : m)) }
          : c
      )
    );
  };

  const deleteMemory = (memId: string) => {
    if (!selectedCircle) return;
    setCircles((prev) =>
      prev.map((c) =>
        c.id === selectedCircle.id ? { ...c, memories: c.memories.filter((m) => m.id !== memId) } : c
      )
    );
  };

  const acceptAction = (msgId: string, actionId: string) => {
    if (!selectedCircle) return;
    setCircles((prev) =>
      prev.map((c) =>
        c.id === selectedCircle.id
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === msgId
                  ? {
                      ...m,
                      actionItems: m.actionItems?.map((a) => (a.id === actionId ? { ...a, accepted: true } : a)),
                    }
                  : m
              ),
            }
          : c
      )
    );
  };

  const createCircle = () => {
    if (!createName.trim()) return;
    const newCircle: Circle = {
      id: `c-${Date.now()}`,
      name: createName.trim(),
      emoji: createEmoji,
      type: createType,
      createdAt: new Date().toISOString(),
      aiEnabled: true,
      members: [
        { id: "m1", name: user?.name || "我", email: user?.email || "", role: "owner", online: true, avatar: user?.name?.charAt(0) || "我" },
      ],
      memories: [],
      messages: [
        {
          id: `welcome-${Date.now()}`,
          senderId: "ai",
          senderName: "Lifenix AI",
          isAI: true,
          content: `欢迎来到「${createName.trim()}」！🎉\n\n我是你们的 AI 助手，我会：\n• 记住大家录入的共享信息\n• 在聊天中自动引用相关知识\n• 帮助提取行动项和生成日程\n\n快邀请成员加入，开始协作吧！`,
          time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
          type: "ai-insight",
        },
      ],
    };
    setCircles((prev) => [...prev, newCircle]);
    setSelectedCircleId(newCircle.id);
    setShowCreateModal(false);
    setCreateName("");
    setCreateEmoji("🏠");
    setCreateType("family");
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    setInviteSent(true);
    setTimeout(() => {
      if (selectedCircle) {
        const newMember: Member = {
          id: `m-${Date.now()}`,
          name: inviteEmail.split("@")[0],
          email: inviteEmail.trim(),
          role: "member",
          online: false,
          avatar: inviteEmail.charAt(0).toUpperCase(),
        };
        setCircles((prev) =>
          prev.map((c) =>
            c.id === selectedCircle.id ? { ...c, members: [...c.members, newMember] } : c
          )
        );
      }
      setInviteEmail("");
      setTimeout(() => setInviteSent(false), 1500);
    }, 800);
  };

  const filteredMemories = selectedCircle?.memories.filter((m) => {
    const matchesSearch = !memorySearch || m.content.toLowerCase().includes(memorySearch.toLowerCase());
    const matchesFilter = !memoryFilter || m.category === memoryFilter;
    return matchesSearch && matchesFilter;
  }) || [];
  const pinnedMemories = filteredMemories.filter((m) => m.pinned);
  const unpinnedMemories = filteredMemories.filter((m) => !m.pinned);

  const typeConfig = {
    family: { label: "家庭", icon: Home, color: "text-rose-600 bg-rose-50" },
    team: { label: "团队", icon: Briefcase, color: "text-blue-600 bg-blue-50" },
    project: { label: "项目", icon: FolderOpen, color: "text-emerald-600 bg-emerald-50" },
  };

  const emojiOptions = ["🏠", "💼", "🚀", "💡", "🎯", "📚", "🎮", "🏋️", "✈️", "🎵", "🍕", "❤️"];

  const viewTabs = [
    { key: "chat" as CircleView, label: "群聊", icon: MessageSquare },
    { key: "tasks" as CircleView, label: "任务", icon: ClipboardList },
    { key: "schedule" as CircleView, label: "日程", icon: Calendar },
    { key: "memory" as CircleView, label: "知识库", icon: Brain },
    { key: "members" as CircleView, label: "成员", icon: Users },
  ];

  return (
    <div className="flex h-full bg-background">
      {/* ═══ Left: Circle List (desktop) ═══ */}
      <div className="hidden md:flex w-[280px] shrink-0 flex-col border-r border-border/50 bg-white/80">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <h2 className="text-[0.9375rem]" style={{ fontWeight: 600 }}>协作空间</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Circle list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {circles.map((circle) => {
            const isActive = selectedCircleId === circle.id;
            const onlineCount = circle.members.filter((m) => m.online).length;
            const tc = typeConfig[circle.type];
            return (
              <motion.button
                key={circle.id}
                onClick={() => { setSelectedCircleId(circle.id); setCircleView("chat"); }}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                  isActive ? "bg-primary/10 shadow-sm" : "hover:bg-muted/60"
                }`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-[1.375rem] shrink-0">{circle.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-[0.875rem] ${isActive ? "text-primary" : ""}`} style={{ fontWeight: isActive ? 600 : 500 }}>
                    {circle.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`inline-flex items-center gap-1 text-[0.6875rem] ${tc.color} rounded-md px-1.5 py-0.5`}>
                      <tc.icon className="h-2.5 w-2.5" />{tc.label}
                    </span>
                    <span className="text-[0.6875rem] text-muted-foreground">
                      {onlineCount}/{circle.members.length} 在线
                    </span>
                  </div>
                </div>
                {circle.messages.length > 0 && (
                  <div className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/15 text-primary text-[0.625rem]" style={{ fontWeight: 600 }}>
                    {circle.messages.length}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Pro hint */}
        <div className="border-t border-border/50 p-3">
          <div className="rounded-xl bg-gradient-to-br from-primary/5 to-purple-50 p-3">
            <div className="flex items-center gap-1.5 text-[0.75rem] text-primary" style={{ fontWeight: 600 }}>
              <Crown className="h-3.5 w-3.5" />
              Pro 支持无限空间
            </div>
            <p className="mt-1 text-[0.6875rem] text-muted-foreground leading-relaxed">
              免费版最多 2 个空间 · 3 人/空间
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Mobile Circle Selector ═══ */}
      <div className="md:hidden absolute top-0 left-0 right-0 z-20">
        <AnimatePresence>
          {showMobileList && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 z-30"
                onClick={() => setShowMobileList(false)}
              />
              <motion.div
                initial={{ y: "-100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed top-0 left-0 right-0 z-40 max-h-[70vh] overflow-y-auto rounded-b-2xl bg-white shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                  <h2 className="text-[0.9375rem]" style={{ fontWeight: 600 }}>选择空间</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setShowCreateModal(true); setShowMobileList(false); }}
                      className="rounded-lg p-1.5 text-primary hover:bg-primary/10"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                    <button onClick={() => setShowMobileList(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="p-2 space-y-1">
                  {circles.map((circle) => {
                    const isActive = selectedCircleId === circle.id;
                    const tc = typeConfig[circle.type];
                    return (
                      <button
                        key={circle.id}
                        onClick={() => { setSelectedCircleId(circle.id); setShowMobileList(false); }}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 ${isActive ? "bg-primary/10" : "hover:bg-muted/60"}`}
                      >
                        <span className="text-[1.375rem]">{circle.emoji}</span>
                        <div className="text-left">
                          <div className={`text-[0.875rem] ${isActive ? "text-primary" : ""}`} style={{ fontWeight: isActive ? 600 : 500 }}>{circle.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[0.6875rem] ${tc.color} rounded-md px-1.5 py-0.5`}>{tc.label}</span>
                            <span className="text-[0.6875rem] text-muted-foreground">{circle.members.length} 人</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ═══ Right: Main Content ═══ */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {selectedCircle ? (
          <>
            {/* Circle Header */}
            <div className="shrink-0 border-b border-border/50 bg-white/80 backdrop-blur-sm px-3 py-2.5 sm:px-5 sm:py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Mobile circle switcher */}
                  <button
                    onClick={() => setShowMobileList(true)}
                    className="md:hidden rounded-lg p-1 hover:bg-muted/60"
                  >
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  </button>
                  <span className="text-[1.5rem] shrink-0">{selectedCircle.emoji}</span>
                  <div className="min-w-0">
                    <h2 className="truncate text-[0.9375rem] sm:text-[1.0625rem]" style={{ fontWeight: 600 }}>
                      {selectedCircle.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[0.6875rem] text-muted-foreground">
                        {selectedCircle.members.length} 位成员 · {selectedCircle.memories.length} 条知识 · 日程协作
                      </span>
                      {selectedCircle.aiEnabled && (
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-[0.5625rem] px-1.5 py-0 h-4">
                          <Sparkles className="h-2.5 w-2.5 mr-0.5" />AI
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[0.75rem] text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">邀请</span>
                  </button>
                </div>
              </div>

              {/* View Tabs */}
              <div className="mt-2 flex gap-0.5 rounded-xl bg-muted/40 p-0.5 sm:p-1 max-w-md">
                {viewTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setCircleView(tab.key)}
                    className={`flex flex-1 items-center justify-center gap-1 sm:gap-1.5 rounded-lg px-2 py-1.5 text-[0.75rem] sm:text-[0.8125rem] transition-all ${
                      circleView === tab.key
                        ? "bg-white text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    style={{ fontWeight: circleView === tab.key ? 600 : 400 }}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* View Content */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {/* ── Chat View ── */}
                {circleView === "chat" && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex h-full flex-col"
                  >
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 space-y-4">
                      {selectedCircle.messages.map((msg, i) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.03 }}
                          className={`flex gap-2.5 sm:gap-3 ${msg.senderId === "m1" ? "flex-row-reverse" : ""}`}
                        >
                          {/* Avatar */}
                          <div
                            className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-[0.75rem] ${
                              msg.isAI
                                ? "bg-gradient-to-br from-primary to-purple-400 text-white"
                                : msg.senderId === "m1"
                                ? "bg-primary text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                            style={{ fontWeight: 600 }}
                          >
                            {msg.isAI ? <Sparkles className="h-4 w-4" /> : msg.senderName.charAt(0)}
                          </div>

                          {/* Message body */}
                          <div className={`max-w-[75%] sm:max-w-[65%] min-w-0 ${msg.senderId === "m1" ? "items-end" : ""}`}>
                            {/* Sender name */}
                            <div className={`flex items-center gap-1.5 mb-1 ${msg.senderId === "m1" ? "flex-row-reverse" : ""}`}>
                              <span className="text-[0.75rem]" style={{ fontWeight: 600 }}>
                                {msg.isAI ? "Lifenix AI" : msg.senderName}
                              </span>
                              <span className="text-[0.625rem] text-muted-foreground">{msg.time}</span>
                            </div>

                            {/* Bubble */}
                            <div
                              className={`rounded-2xl px-3.5 py-2.5 text-[0.8125rem] sm:text-[0.875rem] leading-relaxed ${
                                msg.isAI
                                  ? "bg-gradient-to-br from-primary/5 to-purple-50 border border-primary/10"
                                  : msg.senderId === "m1"
                                  ? "bg-primary text-white"
                                  : "bg-white border border-border/50"
                              }`}
                            >
                              {msg.type === "ai-insight" && (
                                <div className="flex items-center gap-1.5 mb-2">
                                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                                  <span className="text-[0.6875rem] text-amber-600" style={{ fontWeight: 600 }}>AI 洞察</span>
                                </div>
                              )}
                              {msg.type === "ai-action" && (
                                <div className="flex items-center gap-1.5 mb-2">
                                  <Zap className="h-3.5 w-3.5 text-primary" />
                                  <span className="text-[0.6875rem] text-primary" style={{ fontWeight: 600 }}>行动提取</span>
                                </div>
                              )}
                              <div className="whitespace-pre-wrap">{msg.content}</div>

                              {/* Action items */}
                              {msg.actionItems && msg.actionItems.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {msg.actionItems.map((action) => (
                                    <div
                                      key={action.id}
                                      className={`flex items-start gap-2 rounded-xl px-3 py-2 transition-all ${
                                        action.accepted
                                          ? "bg-emerald-50 border border-emerald-200/50"
                                          : "bg-white/80 border border-border/50 hover:border-primary/30"
                                      }`}
                                    >
                                      <div className="flex-1 text-[0.8125rem] leading-relaxed">{action.text}</div>
                                      <button
                                        onClick={() => acceptAction(msg.id, action.id)}
                                        disabled={action.accepted}
                                        className={`shrink-0 flex items-center gap-1 rounded-lg px-2 py-1 text-[0.6875rem] transition-all ${
                                          action.accepted
                                            ? "bg-emerald-100 text-emerald-700 cursor-default"
                                            : "bg-primary/10 text-primary hover:bg-primary/20"
                                        }`}
                                        style={{ fontWeight: 500 }}
                                      >
                                        {action.accepted ? (
                                          <><Check className="h-3 w-3" />已确认</>
                                        ) : (
                                          <><ArrowRight className="h-3 w-3" />确认</>
                                        )}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {/* AI typing indicator */}
                      {aiTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-400 text-white">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-purple-50 border border-primary/10 px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }} className="h-1.5 w-1.5 rounded-full bg-primary" />
                              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-primary" />
                              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-primary" />
                              <span className="ml-1.5 text-[0.75rem] text-muted-foreground">AI 正在分析对话...</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat input */}
                    <div className="shrink-0 border-t border-border/50 bg-white/80 backdrop-blur-sm px-3 py-2.5 sm:px-5 sm:py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border/50 bg-white px-3 py-2 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                          <input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                            placeholder={`在「${selectedCircle.name}」中发消息...`}
                            className="flex-1 bg-transparent text-[0.875rem] outline-none placeholder:text-muted-foreground/50"
                          />
                          {selectedCircle.aiEnabled && (
                            <div className="flex items-center gap-1 text-[0.625rem] text-primary/60 shrink-0">
                              <Sparkles className="h-3 w-3" />
                              <span className="hidden sm:inline">AI 旁听中</span>
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={sendMessage}
                          disabled={!chatInput.trim()}
                          size="icon"
                          className="shrink-0 rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-40"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── Tasks View ── */}
                {circleView === "tasks" && (
                  <motion.div
                    key="tasks"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <CircleTasks
                      members={selectedCircle.members}
                      circleName={selectedCircle.name}
                      circleType={selectedCircle.type}
                    />
                  </motion.div>
                )}

                {/* ── Schedule View ── */}
                {circleView === "schedule" && (
                  <motion.div
                    key="schedule"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    <CircleSchedule
                      members={selectedCircle.members}
                      circleName={selectedCircle.name}
                    />
                  </motion.div>
                )}

                {/* ── Memory / Knowledge Base View ── */}
                {circleView === "memory" && (
                  <motion.div
                    key="memory"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full overflow-y-auto px-3 py-4 sm:px-5"
                  >
                    {/* Search and filter bar */}
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-1 items-center gap-2 rounded-xl border border-border/50 bg-white px-3 py-2 focus-within:border-primary/40 transition-colors max-w-md">
                        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                        <input
                          value={memorySearch}
                          onChange={(e) => setMemorySearch(e.target.value)}
                          placeholder="搜索共享知识..."
                          className="flex-1 bg-transparent text-[0.8125rem] outline-none"
                        />
                      </div>
                      <Button
                        onClick={() => setShowMemoryForm(true)}
                        size="sm"
                        className="rounded-xl bg-primary text-white hover:bg-primary/90 text-[0.8125rem] gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        录入知识
                      </Button>
                    </div>

                    {/* Category filter */}
                    <div className="mb-4 flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                      <button
                        onClick={() => setMemoryFilter(null)}
                        className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[0.75rem] transition-all ${
                          !memoryFilter ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/60"
                        }`}
                        style={{ fontWeight: !memoryFilter ? 600 : 400 }}
                      >
                        全部
                      </button>
                      {memoryCategories.map((cat) => (
                        <button
                          key={cat.key}
                          onClick={() => setMemoryFilter(memoryFilter === cat.key ? null : cat.key)}
                          className={`shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[0.75rem] transition-all ${
                            memoryFilter === cat.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/60"
                          }`}
                          style={{ fontWeight: memoryFilter === cat.key ? 600 : 400 }}
                        >
                          <cat.icon className="h-3 w-3" />
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Add memory form */}
                    <AnimatePresence>
                      {showMemoryForm && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mb-4"
                        >
                          <div className="rounded-xl border border-primary/20 bg-white p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-[0.875rem]" style={{ fontWeight: 600 }}>录入新知识</h4>
                              <button onClick={() => setShowMemoryForm(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted/60">
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <textarea
                              value={newMemory}
                              onChange={(e) => setNewMemory(e.target.value)}
                              placeholder="输入要共享给全员和 AI 的信息，例如：Wi-Fi 密码、偏好禁忌、常用联系方式..."
                              className="w-full rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-[0.8125rem] outline-none focus:border-primary/40 resize-none"
                              rows={3}
                            />
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex gap-1.5">
                                {memoryCategories.map((cat) => (
                                  <button
                                    key={cat.key}
                                    onClick={() => setNewMemoryCategory(cat.key)}
                                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[0.6875rem] transition-all ${
                                      newMemoryCategory === cat.key
                                        ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                                        : "text-muted-foreground hover:bg-muted/60"
                                    }`}
                                  >
                                    <cat.icon className="h-3 w-3" />
                                    <span className="hidden sm:inline">{cat.label}</span>
                                  </button>
                                ))}
                              </div>
                              <Button
                                onClick={addMemory}
                                disabled={!newMemory.trim()}
                                size="sm"
                                className="rounded-lg bg-primary text-white hover:bg-primary/90 text-[0.75rem] disabled:opacity-40"
                              >
                                保存
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* AI context banner */}
                    <div className="mb-4 rounded-xl bg-gradient-to-r from-primary/5 to-purple-50 border border-primary/10 px-4 py-3 flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-[0.8125rem]" style={{ fontWeight: 600 }}>公共大脑 · AI 全局记忆</div>
                        <p className="text-[0.75rem] text-muted-foreground mt-0.5 leading-relaxed">
                          以下知识已注入 AI 上下文。任何成员在群聊中提问时，AI 都会自动参考这些信息作答。
                        </p>
                      </div>
                    </div>

                    {/* Pinned memories */}
                    {pinnedMemories.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-1.5 mb-2 px-1">
                          <Star className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-[0.75rem] text-muted-foreground" style={{ fontWeight: 600 }}>置顶 · {pinnedMemories.length}</span>
                        </div>
                        <div className="space-y-2">
                          {pinnedMemories.map((mem, i) => (
                            <MemoryCard
                              key={mem.id}
                              memory={mem}
                              index={i}
                              onTogglePin={() => toggleMemoryPin(mem.id)}
                              onDelete={() => deleteMemory(mem.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All memories */}
                    <div className="space-y-2">
                      {unpinnedMemories.map((mem, i) => (
                        <MemoryCard
                          key={mem.id}
                          memory={mem}
                          index={i + pinnedMemories.length}
                          onTogglePin={() => toggleMemoryPin(mem.id)}
                          onDelete={() => deleteMemory(mem.id)}
                        />
                      ))}
                    </div>

                    {filteredMemories.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Brain className="h-12 w-12 text-muted-foreground/30 mb-3" />
                        <p className="text-[0.875rem] text-muted-foreground" style={{ fontWeight: 500 }}>
                          {memorySearch ? "没有找到匹配的知识" : "知识库还是空的"}
                        </p>
                        <p className="text-[0.75rem] text-muted-foreground/60 mt-1">
                          {memorySearch ? "换个关键词试试" : "录入共享信息，让 AI 记住团队的公共知识"}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── Members View ── */}
                {circleView === "members" && (
                  <motion.div
                    key="members"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full overflow-y-auto px-3 py-4 sm:px-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[0.9375rem]" style={{ fontWeight: 600 }}>
                        成员 ({selectedCircle.members.length})
                      </h3>
                      <Button
                        onClick={() => setShowInviteModal(true)}
                        size="sm"
                        variant="outline"
                        className="rounded-xl text-[0.8125rem] gap-1.5"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        邀请成员
                      </Button>
                    </div>

                    {/* AI member card */}
                    {selectedCircle.aiEnabled && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-3 flex items-center gap-3 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 to-purple-50 px-4 py-3"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-400 text-white">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[0.875rem]" style={{ fontWeight: 600 }}>Lifenix AI</span>
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-[0.5625rem] h-4">助手</Badge>
                          </div>
                          <p className="text-[0.75rem] text-muted-foreground mt-0.5">
                            旁听对话 · 引用知识库 · 提取行动项
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[0.6875rem] text-emerald-600">
                          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          在线
                        </div>
                      </motion.div>
                    )}

                    {/* Member list */}
                    <div className="space-y-2">
                      {selectedCircle.members.map((member, i) => {
                        const roleConfig = {
                          owner: { label: "创建者", color: "bg-amber-100 text-amber-700" },
                          admin: { label: "管理员", color: "bg-blue-100 text-blue-700" },
                          member: { label: "成员", color: "bg-muted text-muted-foreground" },
                        };
                        const rc = roleConfig[member.role];
                        return (
                          <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 + i * 0.04 }}
                            className="flex items-center gap-3 rounded-xl border border-border/30 bg-white px-4 py-3 hover:border-primary/20 hover:shadow-sm transition-all"
                          >
                            <div className="relative">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[0.875rem] ${
                                  member.id === "m1" ? "bg-primary text-white" : "bg-muted/80 text-foreground"
                                }`}
                                style={{ fontWeight: 600 }}
                              >
                                {member.avatar}
                              </div>
                              {member.online && (
                                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-[0.875rem]" style={{ fontWeight: 500 }}>
                                  {member.name}
                                  {member.id === "m1" && <span className="text-muted-foreground">（你）</span>}
                                </span>
                                <Badge className={`${rc.color} text-[0.5625rem] h-4 hover:${rc.color}`}>
                                  {rc.label}
                                </Badge>
                              </div>
                              <div className="text-[0.75rem] text-muted-foreground truncate">{member.email}</div>
                            </div>
                            <div className={`text-[0.6875rem] ${member.online ? "text-emerald-600" : "text-muted-foreground/50"}`}>
                              {member.online ? "在线" : "离线"}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Space settings */}
                    <div className="mt-6 rounded-xl border border-border/50 bg-white p-4">
                      <h4 className="text-[0.875rem] mb-3" style={{ fontWeight: 600 }}>空间设置</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg border border-border/30 px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <div>
                              <div className="text-[0.8125rem]" style={{ fontWeight: 500 }}>AI 旁听</div>
                              <div className="text-[0.6875rem] text-muted-foreground">AI 自动分析群聊并提取行动项</div>
                            </div>
                          </div>
                          <Switch
                            checked={selectedCircle.aiEnabled}
                            onCheckedChange={(val) => {
                              setCircles((prev) =>
                                prev.map((c) => (c.id === selectedCircle.id ? { ...c, aiEnabled: val } : c))
                              );
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border/30 px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="text-[0.8125rem]" style={{ fontWeight: 500 }}>知识库可见性</div>
                              <div className="text-[0.6875rem] text-muted-foreground">所有成员可查看和编辑共享知识</div>
                            </div>
                          </div>
                          <Switch checked={true} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          /* No circle selected / empty state */
          <div className="flex flex-1 items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-[1.125rem] mb-2" style={{ fontWeight: 600 }}>创建你的第一个空间</h3>
              <p className="text-[0.875rem] text-muted-foreground leading-relaxed mb-4">
                将家人、朋友或团队成员拉入同一个 AI 空间，共享知识、协作沟通。
              </p>
              <Button onClick={() => setShowCreateModal(true)} className="rounded-xl bg-primary text-white hover:bg-primary/90 gap-1.5">
                <Plus className="h-4 w-4" />
                创建空间
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Create Circle Modal ═══ */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 top-[20%] z-50 mx-auto max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:inset-x-auto sm:w-full"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[1.125rem]" style={{ fontWeight: 600 }}>创建新空间</h3>
                <button onClick={() => setShowCreateModal(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Emoji selector */}
              <div className="mb-4">
                <label className="text-[0.8125rem] text-muted-foreground mb-2 block" style={{ fontWeight: 500 }}>图标</label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((em) => (
                    <button
                      key={em}
                      onClick={() => setCreateEmoji(em)}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-[1.25rem] transition-all ${
                        createEmoji === em ? "bg-primary/10 ring-2 ring-primary/30 scale-110" : "bg-muted/40 hover:bg-muted/80"
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="text-[0.8125rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>空间名称</label>
                <Input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="例如：温馨小家、产品团队..."
                  className="rounded-xl"
                />
              </div>

              {/* Type */}
              <div className="mb-6">
                <label className="text-[0.8125rem] text-muted-foreground mb-2 block" style={{ fontWeight: 500 }}>空间类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["family", "team", "project"] as const).map((t) => {
                    const tc = typeConfig[t];
                    return (
                      <button
                        key={t}
                        onClick={() => setCreateType(t)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all ${
                          createType === t ? "border-primary bg-primary/5" : "border-border/30 hover:border-border"
                        }`}
                      >
                        <tc.icon className={`h-5 w-5 ${createType === t ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-[0.8125rem]" style={{ fontWeight: createType === t ? 600 : 400 }}>{tc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1 rounded-xl">
                  取消
                </Button>
                <Button onClick={createCircle} disabled={!createName.trim()} className="flex-1 rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-40">
                  创建空间
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ Invite Modal ═══ */}
      <AnimatePresence>
        {showInviteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowInviteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-4 top-[25%] z-50 mx-auto max-w-sm rounded-2xl bg-white p-6 shadow-2xl sm:inset-x-auto sm:w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[1.0625rem]" style={{ fontWeight: 600 }}>邀请成员</h3>
                <button onClick={() => setShowInviteModal(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-[0.8125rem] text-muted-foreground mb-4">
                输入邮箱地址邀请成员加入「{selectedCircle?.name}」
              </p>

              <div className="flex gap-2">
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                  placeholder="name@example.com"
                  className="rounded-xl"
                />
                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || inviteSent}
                  className="shrink-0 rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-40"
                >
                  {inviteSent ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>

              {inviteSent && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-[0.75rem] text-emerald-600"
                  style={{ fontWeight: 500 }}
                >
                  邀请已发送！成员将收到加入通知。
                </motion.p>
              )}

              {/* Current members */}
              <div className="mt-5 border-t border-border/30 pt-4">
                <div className="text-[0.75rem] text-muted-foreground mb-2" style={{ fontWeight: 500 }}>
                  当前成员 ({selectedCircle?.members.length})
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCircle?.members.map((m) => (
                    <div key={m.id} className="flex items-center gap-1.5 rounded-full bg-muted/40 pl-1 pr-2.5 py-1">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[0.5625rem] text-primary" style={{ fontWeight: 600 }}>
                        {m.avatar}
                      </div>
                      <span className="text-[0.6875rem]">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════ Memory Card Sub-Component ═══════════════ */
function MemoryCard({
  memory,
  index,
  onTogglePin,
  onDelete,
}: {
  memory: SharedMemory;
  index: number;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const cat = memoryCategories.find((c) => c.key === memory.category) || memoryCategories[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group relative flex items-start gap-3 rounded-xl border border-border/30 bg-white px-4 py-3 hover:border-primary/20 hover:shadow-sm transition-all"
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cat.color}`}>
        <cat.icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[0.8125rem] leading-relaxed">{memory.content}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[0.6875rem] text-muted-foreground">
            {memory.addedBy} · {new Date(memory.createdAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
          </span>
          {memory.pinned && (
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
          )}
        </div>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={onTogglePin}
          className={`rounded-lg p-1.5 transition-colors ${
            memory.pinned
              ? "text-amber-500 hover:bg-amber-50"
              : "text-muted-foreground hover:bg-muted/60"
          }`}
          title={memory.pinned ? "取消置顶" : "置顶"}
        >
          <Star className={`h-3.5 w-3.5 ${memory.pinned ? "fill-amber-500" : ""}`} />
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors"
          title="删除"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
