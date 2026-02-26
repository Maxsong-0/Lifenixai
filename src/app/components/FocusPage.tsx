import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  X,
  Sparkles,
  Zap,
  BookOpen,
  Briefcase,
  Timer,
  Volume2,
  VolumeX,
  TreePine,
  Coffee,
  Trophy,
  Target,
  ChevronRight,
  Flame,
  Wind,
  CloudRain,
  Waves,
  Music,
  Headphones,
  Mountain,
  Expand,
  Shrink,
  Star,
  Check,
  Lightbulb,
  MessageCircle,
  Send,
  Loader2,
  Plus,
  Minus,
  SkipForward,
  Sprout,
  Flower2,
} from "lucide-react";

/* ═══════════════════════════════════════════
   Types & Constants
   ═══════════════════════════════════════════ */
type FocusType = "study" | "work";
type FocusPhase = "select" | "setup" | "active" | "break" | "review";
type TimerMode = "pomodoro" | "flow";
type AmbientTheme = "dark" | "forest" | "ocean" | "night";

interface MicroTask {
  id: string;
  text: string;
  done: boolean;
}

interface SoundOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  active: boolean;
  volume: number;
}

interface FocusSession {
  id: string;
  type: FocusType;
  task: string;
  duration: number; // seconds actually focused
  microTasksTotal: number;
  microTasksDone: number;
  distractions: number;
  date: Date;
  rating: number;
}

interface UnblockMessage {
  id: string;
  role: "user" | "ai";
  content: string;
}

const STORAGE_KEY = "lifenix_focus_sessions";
const TREE_STORAGE_KEY = "lifenix_focus_tree";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadSessions(): FocusSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((s: any) => ({ ...s, date: new Date(s.date) }));
  } catch {
    return [];
  }
}

function saveSessions(sessions: FocusSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function loadTreeLevel(): number {
  try {
    return parseInt(localStorage.getItem(TREE_STORAGE_KEY) || "0") || 0;
  } catch {
    return 0;
  }
}

function saveTreeLevel(level: number) {
  localStorage.setItem(TREE_STORAGE_KEY, String(level));
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const AMBIENT_THEMES: Record<AmbientTheme, { bg: string; glow: string; label: string }> = {
  dark: {
    bg: "from-gray-950 via-gray-900 to-black",
    glow: "rgba(108,60,224,0.08)",
    label: "深邃黑",
  },
  forest: {
    bg: "from-emerald-950 via-green-950 to-emerald-900",
    glow: "rgba(34,197,94,0.06)",
    label: "护眼绿",
  },
  ocean: {
    bg: "from-blue-950 via-indigo-950 to-slate-900",
    glow: "rgba(59,130,246,0.06)",
    label: "深海蓝",
  },
  night: {
    bg: "from-violet-950 via-purple-950 to-indigo-950",
    glow: "rgba(139,92,246,0.08)",
    label: "星空紫",
  },
};

const DEFAULT_SOUNDS: SoundOption[] = [
  { id: "rain", name: "雨声", icon: CloudRain, color: "text-blue-400", active: false, volume: 60 },
  { id: "wind", name: "风声", icon: Wind, color: "text-cyan-400", active: false, volume: 40 },
  { id: "wave", name: "海浪", icon: Waves, color: "text-teal-400", active: false, volume: 50 },
  { id: "fire", name: "篝火", icon: Flame, color: "text-amber-400", active: false, volume: 50 },
  { id: "forest", name: "森林", icon: TreePine, color: "text-emerald-400", active: false, volume: 50 },
  { id: "lofi", name: "Lofi", icon: Music, color: "text-pink-400", active: false, volume: 40 },
  { id: "binaural", name: "脑波音频", icon: Headphones, color: "text-violet-400", active: false, volume: 30 },
  { id: "mountain", name: "山间", icon: Mountain, color: "text-stone-400", active: false, volume: 50 },
];

const AI_ENCOURAGEMENTS = [
  "你今天的专注力太棒了！一口气完成了所有微型任务，效率直接拉满！",
  "又是生产力爆表的一天！你比上周同期提升了 18%，继续保持！",
  "你已经连续 3 天坚持深度专注了，这份毅力真的很酷！",
  "稳步推进中！每一次小进步都在为最终目标添砖加瓦。",
  "今天的你，比昨天更强了一点。这就是最好的成长节奏。",
];

const AI_UNBLOCK_RESPONSES = [
  "我注意到你可能遇到了一些阻碍。让我们换个角度想想——你目前卡在哪一步了？",
  "深呼吸。很多看似困难的问题，拆成更小的部分后就会变得清晰。你能告诉我具体是哪个环节让你犹豫了吗？",
  "遇到瓶颈很正常，这说明你在挑战自己的边界。试试把当前问题用一句话描述出来？",
  "让我帮你理一理思路。先回到最核心的那个问题——你最终想要达成什么？",
  "有时候最好的方法是暂时跳过当前的难点，先完成其他部分，回头再看往往会有新的灵感。",
];

const TASK_TEMPLATES: Record<FocusType, string[]> = {
  study: [
    "阅读教材第 X 章",
    "整理课堂笔记",
    "写论文/作业",
    "做练习题",
    "复习备考",
    "学习新技能",
    "看网课/教程",
  ],
  work: [
    "完成项目开发",
    "撰写文档/报告",
    "回复邮件/消息",
    "代码 Review",
    "产品设计",
    "准备会议材料",
    "处理日常事务",
  ],
};

/* ═══════════════════════════════════════════
   Tree Visualization Component
   ═══════════════════════════════════════════ */
function GrowthTree({ level }: { level: number }) {
  // level 0-10, each level the tree grows
  const stages = [
    { icon: Sprout, label: "种子", color: "text-green-600/40" },
    { icon: Sprout, label: "发芽", color: "text-green-500/60" },
    { icon: Sprout, label: "嫩芽", color: "text-green-500" },
    { icon: TreePine, label: "小苗", color: "text-green-500/60" },
    { icon: TreePine, label: "幼树", color: "text-green-500/80" },
    { icon: TreePine, label: "小树", color: "text-green-500" },
    { icon: TreePine, label: "大树", color: "text-emerald-500" },
    { icon: Flower2, label: "开花", color: "text-pink-500" },
    { icon: Flower2, label: "繁盛", color: "text-pink-400" },
    { icon: Star, label: "结果", color: "text-amber-500" },
    { icon: Trophy, label: "丰收", color: "text-yellow-500" },
  ];
  const stage = stages[Math.min(level, stages.length - 1)];
  const Icon = stage.icon;
  const size = 24 + Math.min(level, 10) * 4; // grows from 24 to 64

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon style={{ width: size, height: size }} className={stage.color} />
      </motion.div>
      <span className="text-[0.625rem] text-white/40">{stage.label}</span>
      <div className="flex gap-0.5 mt-0.5">
        {Array.from({ length: Math.min(level + 1, 11) }).map((_, i) => (
          <div
            key={i}
            className={`h-1 w-1 rounded-full ${i <= level ? "bg-emerald-400/60" : "bg-white/10"}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Breathing Animation Component
   ═══════════════════════════════════════════ */
function BreathingOrb({ theme }: { theme: AmbientTheme }) {
  const colors: Record<AmbientTheme, string> = {
    dark: "rgba(108,60,224,0.15)",
    forest: "rgba(34,197,94,0.12)",
    ocean: "rgba(59,130,246,0.12)",
    night: "rgba(139,92,246,0.15)",
  };

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.15, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute rounded-full"
        style={{
          width: "50vmin",
          height: "50vmin",
          background: `radial-gradient(circle, ${colors[theme]} 0%, transparent 70%)`,
        }}
      />
      <motion.div
        animate={{
          scale: [1.2, 0.9, 1.2],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute rounded-full"
        style={{
          width: "35vmin",
          height: "35vmin",
          background: `radial-gradient(circle, ${colors[theme]} 0%, transparent 60%)`,
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════
   FocusPage
   ═══════════════════════════════════════════ */
export function FocusPage() {
  const navigate = useNavigate();

  /* ── Core state ── */
  const [phase, setPhase] = useState<FocusPhase>("select");
  const [focusType, setFocusType] = useState<FocusType>("study");
  const [taskName, setTaskName] = useState("");
  const [timerMode, setTimerMode] = useState<TimerMode>("pomodoro");
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [ambientTheme, setAmbientTheme] = useState<AmbientTheme>("dark");
  const [sounds, setSounds] = useState<SoundOption[]>(DEFAULT_SOUNDS);
  const [masterVolume, setMasterVolume] = useState(true);

  /* ── Timer state ── */
  const [timeLeft, setTimeLeft] = useState(25 * 60); // countdown for pomodoro
  const [timeElapsed, setTimeElapsed] = useState(0); // for flow mode
  const [isPaused, setIsPaused] = useState(false);
  const [breakTimeLeft, setBreakTimeLeft] = useState(0);

  /* ── Micro tasks ── */
  const [microTasks, setMicroTasks] = useState<MicroTask[]>([]);
  const [newMicroTask, setNewMicroTask] = useState("");
  const [showMicroTasks, setShowMicroTasks] = useState(true);

  /* ── AI Unblock ── */
  const [showUnblock, setShowUnblock] = useState(false);
  const [unblockMessages, setUnblockMessages] = useState<UnblockMessage[]>([]);
  const [unblockInput, setUnblockInput] = useState("");
  const [unblockTyping, setUnblockTyping] = useState(false);

  /* ── Distractions ── */
  const [distractionCount, setDistractionCount] = useState(0);
  const [showNudge, setShowNudge] = useState(false);
  const [nudgeMessage, setNudgeMessage] = useState("");

  /* ── Review ── */
  const [reviewRating, setReviewRating] = useState(0);
  const [sessions, setSessions] = useState<FocusSession[]>(loadSessions);
  const [treeLevel, setTreeLevel] = useState(loadTreeLevel);

  /* ── Settings overlay ── */
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ── Persist sessions ── */
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveTreeLevel(treeLevel);
  }, [treeLevel]);

  /* ── Timer logic ── */
  useEffect(() => {
    if (phase !== "active" && phase !== "break") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      if (phase === "break") {
        setBreakTimeLeft((prev) => {
          if (prev <= 1) {
            // Break over, back to select or another round
            if (intervalRef.current) clearInterval(intervalRef.current);
            finishSession();
            return 0;
          }
          return prev - 1;
        });
        return;
      }

      if (timerMode === "pomodoro") {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Pomodoro done
            if (intervalRef.current) clearInterval(intervalRef.current);
            startBreak();
            return 0;
          }
          return prev - 1;
        });
        setTimeElapsed((prev) => prev + 1);
      } else {
        // Flow mode — just count up
        setTimeElapsed((prev) => prev + 1);
        setTimeLeft((prev) => prev + 1); // Use as elapsed in flow mode
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, isPaused, timerMode]);

  /* ── Idle detection (simulated) for flow mode ── */
  useEffect(() => {
    if (phase !== "active" || timerMode !== "flow" || isPaused) return;

    const resetIdle = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        // After 45+ minutes of "flow", suggest a break
        if (timeElapsed > 45 * 60) {
          setShowNudge(true);
          setNudgeMessage(`你已经高度专注了 ${Math.floor(timeElapsed / 60)} 分钟，要不要站起来喝杯水？`);
        }
      }, 120000); // 2min idle
    };

    const events = ["mousemove", "keydown", "click", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetIdle));
    resetIdle();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdle));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [phase, timerMode, isPaused, timeElapsed]);

  /* ── Fullscreen API ── */
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  /* ── Handlers ── */
  const startFocus = useCallback(() => {
    if (!taskName.trim()) return;
    setPhase("active");
    setIsPaused(false);
    setTimeElapsed(0);
    setDistractionCount(0);
    if (timerMode === "pomodoro") {
      setTimeLeft(pomodoroMinutes * 60);
    } else {
      setTimeLeft(0); // flow mode counts up
    }
    // Auto-generate micro tasks from AI
    if (microTasks.length === 0) {
      generateMicroTasks();
    }
  }, [taskName, timerMode, pomodoroMinutes, microTasks.length]);

  const generateMicroTasks = useCallback(() => {
    const templates: Record<string, string[]> = {
      default: [
        "花 2 分钟理清思路，写下核心目标",
        "完成第一个小模块（10 分钟冲刺）",
        "检查进度，调整方向",
        "攻克最难的部分",
        "收尾整理，确认完成质量",
      ],
    };
    const tasks = templates.default.map((text) => ({
      id: uid(),
      text,
      done: false,
    }));
    setMicroTasks(tasks);
  }, []);

  const addMicroTask = useCallback(() => {
    if (!newMicroTask.trim()) return;
    setMicroTasks((prev) => [...prev, { id: uid(), text: newMicroTask.trim(), done: false }]);
    setNewMicroTask("");
  }, [newMicroTask]);

  const toggleMicroTask = useCallback((id: string) => {
    setMicroTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const startBreak = useCallback(() => {
    setPhase("break");
    setBreakTimeLeft(5 * 60); // 5 min break
    setIsPaused(false);
  }, []);

  const finishSession = useCallback(() => {
    const session: FocusSession = {
      id: uid(),
      type: focusType,
      task: taskName,
      duration: timeElapsed,
      microTasksTotal: microTasks.length,
      microTasksDone: microTasks.filter((t) => t.done).length,
      distractions: distractionCount,
      date: new Date(),
      rating: 0,
    };
    setSessions((prev) => [session, ...prev]);
    // Grow tree
    if (timeElapsed > 15 * 60) {
      setTreeLevel((prev) => Math.min(prev + 1, 10));
    }
    setPhase("review");
  }, [focusType, taskName, timeElapsed, microTasks, distractionCount]);

  const stopFocus = useCallback(() => {
    if (timeElapsed < 60) {
      // Too short, just go back
      setPhase("select");
      return;
    }
    finishSession();
  }, [timeElapsed, finishSession]);

  const toggleSound = useCallback((id: string) => {
    setSounds((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  }, []);

  const setSoundVolume = useCallback((id: string, vol: number) => {
    setSounds((prev) => prev.map((s) => (s.id === id ? { ...s, volume: vol } : s)));
  }, []);

  /* ── AI Unblock ── */
  const sendUnblockMessage = useCallback(() => {
    if (!unblockInput.trim() || unblockTyping) return;
    const userMsg: UnblockMessage = { id: uid(), role: "user", content: unblockInput.trim() };
    setUnblockMessages((prev) => [...prev, userMsg]);
    setUnblockInput("");
    setUnblockTyping(true);

    setTimeout(() => {
      const response = AI_UNBLOCK_RESPONSES[Math.floor(Math.random() * AI_UNBLOCK_RESPONSES.length)];
      setUnblockMessages((prev) => [...prev, { id: uid(), role: "ai", content: response }]);
      setUnblockTyping(false);
    }, 1200);
  }, [unblockInput, unblockTyping]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [unblockMessages]);

  /* ── Simulated nudge ── */
  const simulateDistraction = useCallback(() => {
    setDistractionCount((prev) => prev + 1);
    setShowNudge(true);
    setNudgeMessage("遇到困难了吗？还是只是需要休息一下？");
  }, []);

  /* ── Computed ── */
  const pomodoroProgress = useMemo(() => {
    if (timerMode === "pomodoro") {
      const total = pomodoroMinutes * 60;
      return ((total - timeLeft) / total) * 100;
    }
    return 0;
  }, [timerMode, pomodoroMinutes, timeLeft]);

  const microTaskProgress = useMemo(() => {
    if (microTasks.length === 0) return 0;
    return (microTasks.filter((t) => t.done).length / microTasks.length) * 100;
  }, [microTasks]);

  const reviewEncouragement = useMemo(() => {
    return AI_ENCOURAGEMENTS[Math.floor(Math.random() * AI_ENCOURAGEMENTS.length)];
  }, [phase]);

  /* ═══════════════════════════════════════════
     RENDER: Mode Select
     ═══════════════════════════════════════════ */
  if (phase === "select") {
    return (
      <div className="fixed inset-0 z-0 flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
        {/* Top bar */}
        <div className="flex shrink-0 items-center justify-between px-4 sm:px-6 py-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-[0.8125rem]">返回工作台</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Target className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[0.9375rem]" style={{ fontWeight: 700 }}>专注空间</span>
          </div>
          <div className="w-24" />
        </div>

        {/* Center content */}
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <BreathingOrb theme="dark" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 text-center max-w-xl"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/20 to-purple-600/10 border border-white/5"
            >
              <Target className="h-9 w-9 text-violet-400" />
            </motion.div>

            <h1 className="text-[1.75rem] sm:text-[2.25rem] mb-3" style={{ fontWeight: 800 }}>
              准备好了吗？
            </h1>
            <p className="text-[0.9375rem] text-white/50 mb-10 leading-relaxed">
              选择你的专注模式，进入沉浸式深度工作状态
            </p>

            {/* Mode cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setFocusType("study");
                  setPhase("setup");
                }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm hover:border-blue-400/30 hover:bg-blue-500/5 transition-all"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-[1.125rem] mb-1" style={{ fontWeight: 700 }}>专注学习</h3>
                <p className="text-[0.8125rem] text-white/40 leading-relaxed">
                  阅读、笔记、论文、备考、网课...
                </p>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover:text-blue-400/60 transition-colors" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setFocusType("work");
                  setPhase("setup");
                }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-sm hover:border-amber-400/30 hover:bg-amber-500/5 transition-all"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15">
                  <Briefcase className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="text-[1.125rem] mb-1" style={{ fontWeight: 700 }}>专注工作</h3>
                <p className="text-[0.8125rem] text-white/40 leading-relaxed">
                  编码、设计、文档、会议准备...
                </p>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-hover:text-amber-400/60 transition-colors" />
              </motion.button>
            </div>

            {/* Growth tree */}
            <div className="flex flex-col items-center">
              <GrowthTree level={treeLevel} />
              <p className="text-[0.6875rem] text-white/30 mt-2">
                你的专注之树 · 累计 {sessions.length} 次深度专注
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     RENDER: Setup
     ═══════════════════════════════════════════ */
  if (phase === "setup") {
    return (
      <div className={`fixed inset-0 z-0 flex flex-col bg-gradient-to-br ${AMBIENT_THEMES[ambientTheme].bg} text-white`}>
        <BreathingOrb theme={ambientTheme} />

        {/* Top */}
        <div className="flex shrink-0 items-center justify-between px-4 sm:px-6 py-4 relative z-10">
          <button
            onClick={() => setPhase("select")}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-white/50 hover:text-white/80 hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-[0.8125rem]">返回</span>
          </button>
          <Badge className="bg-white/10 text-white/60 border-0">
            {focusType === "study" ? "学习模式" : "工作模式"}
          </Badge>
          <div className="w-20" />
        </div>

        {/* Setup form */}
        <div className="flex flex-1 items-center justify-center px-4 overflow-y-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg space-y-6 py-8"
          >
            {/* Task name */}
            <div>
              <label className="block text-[0.75rem] text-white/50 mb-2" style={{ fontWeight: 600 }}>
                今天要做什么？
              </label>
              <input
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder={TASK_TEMPLATES[focusType][Math.floor(Math.random() * TASK_TEMPLATES[focusType].length)]}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[1rem] text-white placeholder:text-white/20 outline-none focus:border-white/20 backdrop-blur-sm transition-colors"
                style={{ fontWeight: 500 }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && taskName.trim()) startFocus();
                }}
              />
              {/* Quick select */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {TASK_TEMPLATES[focusType].slice(0, 4).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTaskName(t)}
                    className="rounded-lg bg-white/5 px-2.5 py-1 text-[0.6875rem] text-white/40 hover:text-white/60 hover:bg-white/10 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Timer mode */}
            <div>
              <label className="block text-[0.75rem] text-white/50 mb-2" style={{ fontWeight: 600 }}>
                计时模式
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTimerMode("pomodoro")}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    timerMode === "pomodoro"
                      ? "border-violet-400/40 bg-violet-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Timer className="h-4 w-4 text-violet-400" />
                    <span className="text-[0.8125rem]" style={{ fontWeight: 600 }}>番茄钟</span>
                  </div>
                  <p className="text-[0.6875rem] text-white/40">倒计时 + 休息循环</p>
                </button>
                <button
                  onClick={() => setTimerMode("flow")}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    timerMode === "flow"
                      ? "border-cyan-400/40 bg-cyan-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-cyan-400" />
                    <span className="text-[0.8125rem]" style={{ fontWeight: 600 }}>心流模式</span>
                  </div>
                  <p className="text-[0.6875rem] text-white/40">正向计时，自主节奏</p>
                </button>
              </div>
            </div>

            {/* Pomodoro duration */}
            {timerMode === "pomodoro" && (
              <div>
                <label className="block text-[0.75rem] text-white/50 mb-2" style={{ fontWeight: 600 }}>
                  专注时长
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPomodoroMinutes((v) => Math.max(5, v - 5))}
                    className="rounded-lg bg-white/5 p-2 text-white/40 hover:text-white/60 hover:bg-white/10 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="flex-1 text-center">
                    <div className="text-[2rem]" style={{ fontWeight: 700 }}>{pomodoroMinutes}</div>
                    <div className="text-[0.6875rem] text-white/30">分钟</div>
                  </div>
                  <button
                    onClick={() => setPomodoroMinutes((v) => Math.min(120, v + 5))}
                    className="rounded-lg bg-white/5 p-2 text-white/40 hover:text-white/60 hover:bg-white/10 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex justify-center gap-2 mt-2">
                  {[15, 25, 45, 60, 90].map((m) => (
                    <button
                      key={m}
                      onClick={() => setPomodoroMinutes(m)}
                      className={`rounded-lg px-2.5 py-1 text-[0.6875rem] transition-colors ${
                        pomodoroMinutes === m
                          ? "bg-violet-500/20 text-violet-300"
                          : "bg-white/5 text-white/30 hover:text-white/50"
                      }`}
                    >
                      {m}分钟
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Theme */}
            <div>
              <label className="block text-[0.75rem] text-white/50 mb-2" style={{ fontWeight: 600 }}>
                氛围主题
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(Object.entries(AMBIENT_THEMES) as [AmbientTheme, typeof AMBIENT_THEMES[AmbientTheme]][]).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setAmbientTheme(key)}
                    className={`rounded-xl border p-2.5 text-center transition-all ${
                      ambientTheme === key
                        ? "border-white/30 bg-white/10"
                        : "border-white/5 bg-white/[0.02] hover:border-white/15"
                    }`}
                  >
                    <div className={`mx-auto mb-1.5 h-6 w-6 rounded-full bg-gradient-to-br ${val.bg}`} />
                    <span className="text-[0.625rem] text-white/50">{val.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Soundscapes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[0.75rem] text-white/50" style={{ fontWeight: 600 }}>
                  白噪音 & 氛围音
                </label>
                <button
                  onClick={() => setMasterVolume(!masterVolume)}
                  className="text-white/40 hover:text-white/60 transition-colors"
                >
                  {masterVolume ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {sounds.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSound(s.id)}
                    className={`rounded-xl border p-2.5 text-center transition-all ${
                      s.active
                        ? "border-white/20 bg-white/10"
                        : "border-white/5 bg-white/[0.02] hover:border-white/10"
                    }`}
                  >
                    <s.icon className={`mx-auto h-4 w-4 mb-1 ${s.active ? s.color : "text-white/30"}`} />
                    <span className={`text-[0.625rem] ${s.active ? "text-white/70" : "text-white/30"}`}>
                      {s.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Start button */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={startFocus}
                disabled={!taskName.trim()}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-[1rem] shadow-lg shadow-violet-500/20 disabled:opacity-30"
                style={{ fontWeight: 700 }}
              >
                <Play className="h-5 w-5 mr-2" />
                开始专注
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     RENDER: Active Focus / Break
     ═══════════════════════════════════════════ */
  if (phase === "active" || phase === "break") {
    const displayTime = phase === "break" ? breakTimeLeft : timerMode === "pomodoro" ? timeLeft : timeElapsed;
    const isBreak = phase === "break";

    return (
      <div className={`fixed inset-0 z-0 flex flex-col bg-gradient-to-br ${AMBIENT_THEMES[ambientTheme].bg} text-white overflow-hidden select-none`}>
        <BreathingOrb theme={ambientTheme} />

        {/* Minimal top bar — fades on inactivity in real app */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 opacity-60 hover:opacity-100 transition-opacity duration-500">
          <button
            onClick={stopFocus}
            className="rounded-lg px-3 py-1.5 text-white/40 hover:text-white/70 hover:bg-white/5 text-[0.75rem] transition-all"
            style={{ fontWeight: 500 }}
          >
            结束专注
          </button>

          <div className="flex items-center gap-2">
            {!isBreak && (
              <Badge className="bg-white/8 text-white/50 border-0 text-[0.625rem]">
                {timerMode === "pomodoro" ? "番茄钟" : "心流"}
              </Badge>
            )}
            {isBreak && (
              <Badge className="bg-emerald-500/15 text-emerald-300 border-0 text-[0.625rem]">
                <Coffee className="h-2.5 w-2.5 mr-1" />
                休息中
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleFullscreen}
              className="rounded-lg p-1.5 text-white/30 hover:text-white/60 transition-colors"
            >
              {isFullscreen ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMasterVolume(!masterVolume)}
              className="rounded-lg p-1.5 text-white/30 hover:text-white/60 transition-colors"
            >
              {masterVolume ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Center: Timer */}
        <div className="flex flex-1 items-center justify-center relative z-10">
          <div className="text-center">
            {/* Task name */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <p className="text-[0.875rem] text-white/30 mb-1" style={{ fontWeight: 500 }}>
                {isBreak ? "休息一下，充充电" : taskName}
              </p>
            </motion.div>

            {/* Big timer */}
            <motion.div
              key={isBreak ? "break" : "active"}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              {/* Circular progress for pomodoro */}
              {timerMode === "pomodoro" && !isBreak && (
                <svg className="absolute -inset-8 sm:-inset-12" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="rgba(255,255,255,0.04)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="rgba(139,92,246,0.3)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 90}`}
                    strokeDashoffset={`${2 * Math.PI * 90 * (1 - pomodoroProgress / 100)}`}
                    transform="rotate(-90 100 100)"
                    className="transition-all duration-1000"
                  />
                </svg>
              )}

              <div
                className="text-[4rem] sm:text-[5.5rem] tabular-nums tracking-tight"
                style={{ fontWeight: 200, letterSpacing: "-0.02em" }}
              >
                {formatDuration(displayTime)}
              </div>
            </motion.div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsPaused(!isPaused)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-colors"
              >
                {isPaused ? <Play className="h-5 w-5 ml-0.5" /> : <Pause className="h-5 w-5" />}
              </motion.button>

              {!isBreak && timerMode === "pomodoro" && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    startBreak();
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/5 text-white/30 hover:text-white/60 transition-colors"
                  title="跳过至休息"
                >
                  <SkipForward className="h-4 w-4" />
                </motion.button>
              )}

              {isBreak && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={finishSession}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/5 text-white/30 hover:text-white/60 transition-colors"
                  title="结束"
                >
                  <Check className="h-4 w-4" />
                </motion.button>
              )}
            </div>

            {/* Micro task progress */}
            {!isBreak && microTasks.length > 0 && (
              <div className="mt-8 max-w-xs mx-auto">
                <div className="flex items-center justify-between text-[0.625rem] text-white/30 mb-1.5">
                  <span>任务进度</span>
                  <span>{microTasks.filter((t) => t.done).length}/{microTasks.length}</span>
                </div>
                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400"
                    animate={{ width: `${microTaskProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom panels: micro tasks + unblock */}
        {!isBreak && (
          <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end justify-between px-4 pb-4 gap-4">
            {/* Left: Micro Tasks panel */}
            <AnimatePresence>
              {showMicroTasks && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="w-72 max-h-64 overflow-y-auto rounded-2xl border border-white/8 bg-black/40 backdrop-blur-xl p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[0.6875rem] text-white/50" style={{ fontWeight: 600 }}>
                      微型冲刺任务
                    </span>
                    <button onClick={() => setShowMicroTasks(false)} className="text-white/20 hover:text-white/40">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {microTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => toggleMicroTask(task.id)}
                        className={`flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-left transition-all ${
                          task.done ? "opacity-40" : "hover:bg-white/5"
                        }`}
                      >
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                            task.done
                              ? "border-emerald-400/50 bg-emerald-500/20"
                              : "border-white/20"
                          }`}
                        >
                          {task.done && <Check className="h-2.5 w-2.5 text-emerald-400" />}
                        </div>
                        <span
                          className={`text-[0.75rem] ${task.done ? "line-through text-white/30" : "text-white/70"}`}
                        >
                          {task.text}
                        </span>
                      </button>
                    ))}
                  </div>
                  {/* Add task */}
                  <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/5">
                    <input
                      value={newMicroTask}
                      onChange={(e) => setNewMicroTask(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addMicroTask()}
                      placeholder="添加微任务..."
                      className="flex-1 bg-transparent text-[0.6875rem] text-white/60 placeholder:text-white/20 outline-none"
                    />
                    <button
                      onClick={addMicroTask}
                      className="rounded p-1 text-white/20 hover:text-white/50 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showMicroTasks && (
              <button
                onClick={() => setShowMicroTasks(true)}
                className="rounded-full bg-black/30 backdrop-blur-sm border border-white/5 p-2.5 text-white/30 hover:text-white/60 transition-colors"
                title="任务列表"
              >
                <Target className="h-4 w-4" />
              </button>
            )}

            {/* Right: Unblock button */}
            <div className="flex flex-col items-end gap-2">
              <AnimatePresence>
                {showUnblock && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="w-80 max-h-72 flex flex-col rounded-2xl border border-white/8 bg-black/50 backdrop-blur-xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                      <div className="flex items-center gap-1.5">
                        <Lightbulb className="h-3 w-3 text-amber-400" />
                        <span className="text-[0.6875rem] text-white/60" style={{ fontWeight: 600 }}>
                          拉我一把
                        </span>
                      </div>
                      <button onClick={() => setShowUnblock(false)} className="text-white/20 hover:text-white/40">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[100px]">
                      {unblockMessages.length === 0 && (
                        <p className="text-[0.6875rem] text-white/30 text-center py-4">
                          遇到难题了？告诉我你卡在哪里
                        </p>
                      )}
                      {unblockMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-xl px-3 py-2 text-[0.75rem] leading-relaxed ${
                              msg.role === "user"
                                ? "bg-violet-500/20 text-white/80"
                                : "bg-white/5 text-white/60"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {unblockTyping && (
                        <div className="flex justify-start">
                          <div className="rounded-xl bg-white/5 px-3 py-2">
                            <Loader2 className="h-3 w-3 animate-spin text-white/30" />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 border-t border-white/5">
                      <input
                        value={unblockInput}
                        onChange={(e) => setUnblockInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendUnblockMessage()}
                        placeholder="描述你卡在哪里..."
                        className="flex-1 bg-transparent text-[0.75rem] text-white/70 placeholder:text-white/20 outline-none"
                      />
                      <button
                        onClick={sendUnblockMessage}
                        disabled={!unblockInput.trim()}
                        className="rounded-lg p-1.5 text-white/30 hover:text-white/60 disabled:opacity-30 transition-colors"
                      >
                        <Send className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!showUnblock && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowUnblock(true)}
                  className="rounded-full bg-black/30 backdrop-blur-sm border border-white/5 p-2.5 text-white/30 hover:text-amber-400/70 transition-colors"
                  title="拉我一把 (Unblock Me)"
                >
                  <Lightbulb className="h-4 w-4" />
                </motion.button>
              )}
            </div>
          </div>
        )}

        {/* Active sounds indicator */}
        {sounds.some((s) => s.active) && masterVolume && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-2 rounded-full bg-black/30 backdrop-blur-sm border border-white/5 px-3 py-1.5">
              <Volume2 className="h-3 w-3 text-white/30" />
              <div className="flex items-center gap-1.5">
                {sounds
                  .filter((s) => s.active)
                  .map((s) => (
                    <s.icon key={s.id} className={`h-3 w-3 ${s.color}`} />
                  ))}
              </div>
              {/* Animated equalizer bars */}
              <div className="flex items-end gap-px h-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: ["30%", "100%", "50%", "80%", "30%"] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                    className="w-[2px] rounded-full bg-white/20"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Gentle nudge modal */}
        <AnimatePresence>
          {showNudge && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/30"
                onClick={() => setShowNudge(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15">
                    <MessageCircle className="h-5 w-5 text-amber-400" />
                  </div>
                  <p className="text-[0.9375rem] text-white/80 mb-4 leading-relaxed" style={{ fontWeight: 500 }}>
                    {nudgeMessage}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowNudge(false)}
                      variant="outline"
                      className="flex-1 rounded-xl border-white/10 text-white/60 hover:bg-white/5 bg-transparent text-[0.8125rem]"
                    >
                      继续专注
                    </Button>
                    <Button
                      onClick={() => {
                        setShowNudge(false);
                        startBreak();
                      }}
                      className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[0.8125rem]"
                    >
                      <Coffee className="h-3.5 w-3.5 mr-1" /> 休息一会
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     RENDER: Review
     ═══════════════════════════════════════════ */
  if (phase === "review") {
    const lastSession = sessions[0];
    const grade =
      timeElapsed >= 45 * 60
        ? { label: "S", color: "from-amber-400 to-yellow-500", text: "完美专注" }
        : timeElapsed >= 25 * 60
        ? { label: "A", color: "from-violet-400 to-purple-500", text: "高效专注" }
        : timeElapsed >= 15 * 60
        ? { label: "B", color: "from-blue-400 to-cyan-500", text: "良好专注" }
        : { label: "C", color: "from-gray-400 to-gray-500", text: "短暂专注" };

    return (
      <div className="fixed inset-0 z-0 flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white overflow-y-auto">
        <BreathingOrb theme="dark" />

        <div className="flex flex-1 items-center justify-center px-4 py-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Grade header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, type: "spring" }}
                className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br ${grade.color} shadow-lg`}
              >
                <span className="text-[2.5rem] text-white" style={{ fontWeight: 800 }}>{grade.label}</span>
              </motion.div>
              <h2 className="text-[1.5rem] mb-1" style={{ fontWeight: 700 }}>{grade.text}</h2>
              <p className="text-[0.8125rem] text-white/40">
                {new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>

            {/* Stats card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden mb-4"
            >
              <div className="p-4 border-b border-white/5">
                <div className="text-[0.75rem] text-white/40 mb-1" style={{ fontWeight: 600 }}>
                  {taskName}
                </div>
                <Badge className="bg-white/8 text-white/50 border-0 text-[0.625rem]">
                  {focusType === "study" ? "学习" : "工作"}
                </Badge>
              </div>

              <div className="grid grid-cols-3 divide-x divide-white/5">
                <div className="p-4 text-center">
                  <div className="text-[1.5rem]" style={{ fontWeight: 700 }}>
                    {formatDuration(timeElapsed)}
                  </div>
                  <div className="text-[0.625rem] text-white/30">深度专注</div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-[1.5rem]" style={{ fontWeight: 700 }}>
                    {microTasks.filter((t) => t.done).length}/{microTasks.length}
                  </div>
                  <div className="text-[0.625rem] text-white/30">完成任务</div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-[1.5rem]" style={{ fontWeight: 700 }}>
                    {distractionCount}
                  </div>
                  <div className="text-[0.625rem] text-white/30">抵御走神</div>
                </div>
              </div>
            </motion.div>

            {/* AI encouragement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-purple-500/5 backdrop-blur-sm p-4 mb-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/20">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                </div>
                <div>
                  <div className="text-[0.6875rem] text-violet-300/60 mb-1" style={{ fontWeight: 600 }}>
                    AI 评语
                  </div>
                  <p className="text-[0.8125rem] text-white/70 leading-relaxed">
                    {reviewEncouragement}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Rating */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center mb-6"
            >
              <p className="text-[0.75rem] text-white/40 mb-2" style={{ fontWeight: 500 }}>
                你对这次专注的感受
              </p>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setReviewRating(star);
                      if (lastSession) {
                        setSessions((prev) =>
                          prev.map((s) => (s.id === lastSession.id ? { ...s, rating: star } : s))
                        );
                      }
                    }}
                    className="transition-colors"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        star <= reviewRating ? "text-amber-400 fill-amber-400" : "text-white/15"
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Tree growth */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col items-center mb-8"
            >
              <GrowthTree level={treeLevel} />
              {timeElapsed > 15 * 60 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-[0.6875rem] text-emerald-400/50 mt-2"
                >
                  你的专注之树长大了一点！
                </motion.p>
              )}
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-2"
            >
              <Button
                onClick={() => {
                  setPhase("setup");
                  setMicroTasks([]);
                  setUnblockMessages([]);
                  setReviewRating(0);
                }}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-[0.9375rem]"
                style={{ fontWeight: 600 }}
              >
                <RotateCcw className="h-4 w-4 mr-2" /> 再来一次
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                className="w-full h-12 rounded-2xl border-white/10 text-white/60 hover:bg-white/5 bg-transparent text-[0.9375rem]"
                style={{ fontWeight: 500 }}
              >
                返回工作台
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}
