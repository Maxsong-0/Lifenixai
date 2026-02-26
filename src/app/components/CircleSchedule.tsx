import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "motion/react";
import {
  CalendarDays,
  Clock,
  Plus,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Camera,
  Upload,
  Zap,
  Users,
  ArrowRight,
  AlertTriangle,
  Mail,
  Plane,
  GraduationCap,
  CreditCard,
  MapPin,
  AtSign,
  Image as ImageIcon,
  FileText,
  Loader2,
  CalendarPlus,
  Eye,
  EyeOff,
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

interface SharedEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startHour: number; // 0-23
  endHour: number;
  memberId: string;
  memberName: string;
  shared: boolean;
  type: "personal" | "shared" | "captured";
  capturedFrom?: string;
  assignee?: string;
}

interface TimeSlot {
  startHour: number;
  endHour: number;
  date: string;
  score: number; // 0-1, higher = better
}

interface CapturedEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  source: "photo" | "email" | "text";
  sourceLabel: string;
  assignee: string;
  confidence: number;
  added: boolean;
}

/* ═══════════════ Member Colors ═══════════════ */
const memberColors: Record<string, { bg: string; text: string; ring: string; light: string; dot: string }> = {
  m1: { bg: "bg-violet-500", text: "text-violet-700", ring: "ring-violet-300", light: "bg-violet-100", dot: "bg-violet-500" },
  m2: { bg: "bg-rose-500", text: "text-rose-700", ring: "ring-rose-300", light: "bg-rose-100", dot: "bg-rose-500" },
  m3: { bg: "bg-sky-500", text: "text-sky-700", ring: "ring-sky-300", light: "bg-sky-100", dot: "bg-sky-500" },
  m4: { bg: "bg-amber-500", text: "text-amber-700", ring: "ring-amber-300", light: "bg-amber-100", dot: "bg-amber-500" },
  m5: { bg: "bg-emerald-500", text: "text-emerald-700", ring: "ring-emerald-300", light: "bg-emerald-100", dot: "bg-emerald-500" },
  m6: { bg: "bg-pink-500", text: "text-pink-700", ring: "ring-pink-300", light: "bg-pink-100", dot: "bg-pink-500" },
};

function getMemberColor(memberId: string) {
  return memberColors[memberId] || { bg: "bg-gray-500", text: "text-gray-700", ring: "ring-gray-300", light: "bg-gray-100", dot: "bg-gray-500" };
}

/* ═══════════════ Mock Events ═══════════════ */
function generateMockEvents(members: Member[], baseDate: Date): SharedEvent[] {
  const dateStr = (d: number) => {
    const dt = new Date(baseDate);
    dt.setDate(dt.getDate() + d);
    return dt.toISOString().slice(0, 10);
  };

  const events: SharedEvent[] = [];

  // Member personal events (private but visible in find-a-time)
  if (members.find((m) => m.id === "m1")) {
    events.push(
      { id: "e1", title: "产品评审", date: dateStr(0), startHour: 10, endHour: 11, memberId: "m1", memberName: "我", shared: false, type: "personal" },
      { id: "e2", title: "午休", date: dateStr(0), startHour: 12, endHour: 13, memberId: "m1", memberName: "我", shared: false, type: "personal" },
      { id: "e3", title: "代码审查", date: dateStr(1), startHour: 14, endHour: 15, memberId: "m1", memberName: "我", shared: false, type: "personal" },
      { id: "e4", title: "健身", date: dateStr(2), startHour: 18, endHour: 19, memberId: "m1", memberName: "我", shared: false, type: "personal" },
    );
  }
  if (members.find((m) => m.id === "m2")) {
    events.push(
      { id: "e5", title: "瑜伽课", date: dateStr(0), startHour: 19, endHour: 21, memberId: "m2", memberName: "小美", shared: false, type: "personal" },
      { id: "e6", title: "客户会议", date: dateStr(0), startHour: 9, endHour: 10, memberId: "m2", memberName: "小美", shared: false, type: "personal" },
      { id: "e7", title: "下午茶", date: dateStr(1), startHour: 15, endHour: 16, memberId: "m2", memberName: "小美", shared: false, type: "personal" },
    );
  }
  if (members.find((m) => m.id === "m3")) {
    events.push(
      { id: "e8", title: "晨练", date: dateStr(0), startHour: 7, endHour: 8, memberId: "m3", memberName: "妈妈", shared: false, type: "personal" },
      { id: "e9", title: "买菜", date: dateStr(0), startHour: 9, endHour: 10, memberId: "m3", memberName: "妈妈", shared: false, type: "personal" },
      { id: "e10", title: "社区活动", date: dateStr(1), startHour: 9, endHour: 11, memberId: "m3", memberName: "妈妈", shared: false, type: "personal" },
    );
  }
  if (members.find((m) => m.id === "m4")) {
    events.push(
      { id: "e11", title: "管理层会议", date: dateStr(0), startHour: 9, endHour: 11, memberId: "m4", memberName: "张总", shared: false, type: "personal" },
      { id: "e12", title: "午餐会", date: dateStr(0), startHour: 12, endHour: 13, memberId: "m4", memberName: "张总", shared: false, type: "personal" },
      { id: "e13", title: "投资人电话", date: dateStr(1), startHour: 16, endHour: 17, memberId: "m4", memberName: "张总", shared: false, type: "personal" },
    );
  }
  if (members.find((m) => m.id === "m5")) {
    events.push(
      { id: "e14", title: "代码开发", date: dateStr(0), startHour: 9, endHour: 12, memberId: "m5", memberName: "李工", shared: false, type: "personal" },
      { id: "e15", title: "技术讨论", date: dateStr(1), startHour: 10, endHour: 11, memberId: "m5", memberName: "李工", shared: false, type: "personal" },
    );
  }
  if (members.find((m) => m.id === "m6")) {
    events.push(
      { id: "e16", title: "设计评审", date: dateStr(0), startHour: 14, endHour: 16, memberId: "m6", memberName: "王设计", shared: false, type: "personal" },
      { id: "e17", title: "灵感搜集", date: dateStr(1), startHour: 9, endHour: 10, memberId: "m6", memberName: "王设计", shared: false, type: "personal" },
    );
  }

  // Shared events
  events.push(
    { id: "es1", title: "家庭聚餐", date: dateStr(2), startHour: 18, endHour: 20, memberId: "shared", memberName: "全员", shared: true, type: "shared" },
  );

  return events;
}

/* ═══════════════ Mock Captured Events ═══════════════ */
const defaultCapturedEvents: CapturedEvent[] = [
  {
    id: "cap1",
    title: "小明家长会",
    date: "2026-02-27",
    time: "15:00 - 16:30",
    source: "photo",
    sourceLabel: "学校通知单照片",
    assignee: "妈妈",
    confidence: 0.95,
    added: false,
  },
  {
    id: "cap2",
    title: "飞往三亚 · 海航 HU7801",
    date: "2026-03-15",
    time: "08:30 - 11:45",
    source: "email",
    sourceLabel: "去哪儿网订单确认邮件",
    assignee: "全员",
    confidence: 0.98,
    added: false,
  },
  {
    id: "cap3",
    title: "信用卡还款日",
    date: "2026-03-05",
    time: "全天",
    source: "email",
    sourceLabel: "招行账单提醒",
    assignee: "我",
    confidence: 0.88,
    added: false,
  },
];

/* ═══════════════ Props ═══════════════ */
interface CircleScheduleProps {
  members: Member[];
  circleName: string;
}

/* ═══════════════ Component ═══════════════ */
export function CircleSchedule({ members, circleName }: CircleScheduleProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1); // Monday
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [events, setEvents] = useState<SharedEvent[]>(() => generateMockEvents(members, new Date()));
  const [showFindTime, setShowFindTime] = useState(false);
  const [showCapture, setShowCapture] = useState(false);
  const [capturedEvents, setCapturedEvents] = useState<CapturedEvent[]>(defaultCapturedEvents);
  const [visibleMembers, setVisibleMembers] = useState<Set<string>>(new Set(members.map((m) => m.id).concat(["shared"])));
  const [findTimeTitle, setFindTimeTitle] = useState("");
  const [findTimeDuration, setFindTimeDuration] = useState(1);
  const [findTimeResults, setFindTimeResults] = useState<TimeSlot[] | null>(null);
  const [findTimeSearching, setFindTimeSearching] = useState(false);
  const [captureMode, setCaptureMode] = useState<"photo" | "email" | null>(null);
  const [captureText, setCaptureText] = useState("");
  const [captureAnalyzing, setCaptureAnalyzing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [inviteSent, setInviteSent] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Week navigation
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekLabel = (() => {
    const start = weekDates[0];
    const end = weekDates[6];
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString("zh-CN", { year: "numeric", month: "long" })} · 第${Math.ceil(start.getDate() / 7)}周`;
    }
    return `${start.toLocaleDateString("zh-CN", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}`;
  })();

  const navigateWeek = (dir: number) => {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + dir * 7);
      return d;
    });
  };

  const hours = Array.from({ length: 13 }, (_, i) => i + 7); // 7:00 - 19:00

  // Toggle member visibility
  const toggleMember = (id: string) => {
    setVisibleMembers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Find-a-time logic
  const runFindTime = () => {
    if (!findTimeTitle.trim()) return;
    setFindTimeSearching(true);
    setFindTimeResults(null);
    setSelectedSlot(null);

    setTimeout(() => {
      // Generate mock golden time slots
      const results: TimeSlot[] = [];
      for (let d = 0; d < 5; d++) {
        const dateStr = (() => {
          const dt = new Date();
          dt.setDate(dt.getDate() + d);
          return dt.toISOString().slice(0, 10);
        })();
        const dayEvents = events.filter((e) => e.date === dateStr);

        for (let h = 8; h <= 19 - findTimeDuration; h++) {
          const slotEnd = h + findTimeDuration;
          // Check if all members are free
          const allFree = members.every((m) => {
            const memberEvents = dayEvents.filter((e) => e.memberId === m.id);
            return !memberEvents.some((e) => e.startHour < slotEnd && e.endHour > h);
          });
          if (allFree) {
            // Score: prefer mid-morning, mid-afternoon, earlier days
            let score = 1 - d * 0.12;
            if (h >= 10 && h <= 11) score += 0.15;
            if (h >= 14 && h <= 16) score += 0.1;
            if (h === 12) score -= 0.05; // Lunch time less ideal
            results.push({ startHour: h, endHour: slotEnd, date: dateStr, score: Math.min(1, Math.max(0.3, score)) });
          }
        }
      }
      // Sort by score, take top 5
      results.sort((a, b) => b.score - a.score);
      setFindTimeResults(results.slice(0, 6));
      setFindTimeSearching(false);
    }, 1200);
  };

  const confirmSlot = () => {
    if (!selectedSlot || !findTimeTitle.trim()) return;
    const newEvent: SharedEvent = {
      id: `shared-${Date.now()}`,
      title: findTimeTitle.trim(),
      date: selectedSlot.date,
      startHour: selectedSlot.startHour,
      endHour: selectedSlot.endHour,
      memberId: "shared",
      memberName: "全员",
      shared: true,
      type: "shared",
    };
    setEvents((prev) => [...prev, newEvent]);
    setInviteSent(true);
    setTimeout(() => {
      setShowFindTime(false);
      setFindTimeTitle("");
      setFindTimeResults(null);
      setSelectedSlot(null);
      setInviteSent(false);
    }, 1500);
  };

  // Capture handlers
  const handleCapturePhoto = () => {
    setCaptureMode("photo");
    setCaptureAnalyzing(true);
    // Simulate OCR + NLP
    setTimeout(() => {
      setCaptureAnalyzing(false);
    }, 2000);
  };

  const handleCaptureEmail = () => {
    setCaptureMode("email");
    setCaptureAnalyzing(true);
    setTimeout(() => {
      setCaptureAnalyzing(false);
    }, 1800);
  };

  const handleCaptureText = () => {
    if (!captureText.trim()) return;
    setCaptureAnalyzing(true);
    setTimeout(() => {
      const newCaptured: CapturedEvent = {
        id: `cap-${Date.now()}`,
        title: captureText.includes("会议") ? "团队会议" : captureText.includes("机票") ? "出行航班" : "新事件",
        date: "2026-03-01",
        time: "10:00 - 11:00",
        source: "text",
        sourceLabel: "手动粘贴文本",
        assignee: "我",
        confidence: 0.82,
        added: false,
      };
      setCapturedEvents((prev) => [newCaptured, ...prev]);
      setCaptureText("");
      setCaptureAnalyzing(false);
    }, 1500);
  };

  const addCapturedEvent = (capId: string) => {
    setCapturedEvents((prev) => prev.map((c) => (c.id === capId ? { ...c, added: true } : c)));
    const cap = capturedEvents.find((c) => c.id === capId);
    if (cap) {
      const newEvent: SharedEvent = {
        id: `captured-${Date.now()}`,
        title: cap.title,
        date: cap.date,
        startHour: parseInt(cap.time.split(":")[0]) || 10,
        endHour: (parseInt(cap.time.split(":")[0]) || 10) + 1,
        memberId: "shared",
        memberName: cap.assignee,
        shared: true,
        type: "captured",
        capturedFrom: cap.sourceLabel,
        assignee: cap.assignee,
      };
      setEvents((prev) => [...prev, newEvent]);
    }
  };

  const sourceIcons = { photo: Camera, email: Mail, text: FileText };

  return (
    <div className="flex h-full flex-col">
      {/* ── Toolbar ── */}
      <div className="shrink-0 flex flex-col gap-2 px-3 py-3 sm:px-5 border-b border-border/30 bg-white/60">
        {/* Row 1: Week nav + actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button onClick={() => navigateWeek(-1)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-[0.8125rem] sm:text-[0.875rem] min-w-0" style={{ fontWeight: 600 }}>{weekLabel}</span>
            <button onClick={() => navigateWeek(1)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() - d.getDay() + 1);
                d.setHours(0, 0, 0, 0);
                setCurrentWeekStart(d);
              }}
              className="rounded-lg px-2 py-1 text-[0.6875rem] text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
              style={{ fontWeight: 500 }}
            >
              今天
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCapture(true)}
              className="rounded-xl text-[0.75rem] gap-1 border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              <Camera className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">智能捕捉</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setShowFindTime(true)}
              className="rounded-xl text-[0.75rem] gap-1 bg-primary text-white hover:bg-primary/90"
            >
              <Zap className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">找空闲</span>
            </Button>
          </div>
        </div>

        {/* Row 2: Member color legend */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {members.map((m) => {
            const mc = getMemberColor(m.id);
            const isVisible = visibleMembers.has(m.id);
            return (
              <button
                key={m.id}
                onClick={() => toggleMember(m.id)}
                className={`shrink-0 flex items-center gap-1.5 rounded-full pl-1 pr-2.5 py-1 text-[0.6875rem] transition-all ${
                  isVisible ? `${mc.light} ${mc.text}` : "bg-muted/40 text-muted-foreground/50"
                }`}
                style={{ fontWeight: isVisible ? 600 : 400 }}
              >
                <div className={`h-4 w-4 rounded-full flex items-center justify-center text-white text-[0.5rem] ${isVisible ? mc.bg : "bg-muted"}`} style={{ fontWeight: 700 }}>
                  {m.avatar.charAt(0)}
                </div>
                {m.name}
                {!isVisible && <EyeOff className="h-2.5 w-2.5 ml-0.5" />}
              </button>
            );
          })}
          <button
            onClick={() => toggleMember("shared")}
            className={`shrink-0 flex items-center gap-1.5 rounded-full pl-1.5 pr-2.5 py-1 text-[0.6875rem] transition-all ${
              visibleMembers.has("shared") ? "bg-primary/10 text-primary" : "bg-muted/40 text-muted-foreground/50"
            }`}
            style={{ fontWeight: visibleMembers.has("shared") ? 600 : 400 }}
          >
            <CalendarDays className="h-3 w-3" />
            共享
          </button>
        </div>
      </div>

      {/* ── Weekly Calendar Grid ── */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[640px]">
          {/* Day headers */}
          <div className="sticky top-0 z-10 grid grid-cols-[56px_repeat(7,1fr)] border-b border-border/30 bg-white/90 backdrop-blur-sm">
            <div className="border-r border-border/20" />
            {weekDates.map((d, i) => {
              const isToday = d.getTime() === today.getTime();
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center py-2 border-r border-border/20 last:border-r-0 ${isToday ? "bg-primary/5" : ""}`}
                >
                  <span className="text-[0.625rem] text-muted-foreground" style={{ fontWeight: 500 }}>
                    {d.toLocaleDateString("zh-CN", { weekday: "short" })}
                  </span>
                  <span
                    className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-[0.8125rem] ${
                      isToday ? "bg-primary text-white" : ""
                    }`}
                    style={{ fontWeight: isToday ? 700 : 500 }}
                  >
                    {d.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-border/10 min-h-[52px]">
              {/* Time label */}
              <div className="flex items-start justify-end pr-2 pt-1 text-[0.625rem] text-muted-foreground border-r border-border/20">
                {`${hour.toString().padStart(2, "0")}:00`}
              </div>
              {/* Day cells */}
              {weekDates.map((d, di) => {
                const dateStr = d.toISOString().slice(0, 10);
                const cellEvents = events.filter(
                  (e) =>
                    e.date === dateStr &&
                    e.startHour <= hour &&
                    e.endHour > hour &&
                    (visibleMembers.has(e.memberId) || (e.shared && visibleMembers.has("shared")))
                );
                const isToday = d.getTime() === today.getTime();
                return (
                  <div
                    key={di}
                    className={`relative border-r border-border/10 last:border-r-0 px-0.5 py-0.5 ${isToday ? "bg-primary/[0.02]" : ""}`}
                  >
                    {cellEvents.map((ev) => {
                      if (ev.startHour !== hour) return null; // Only render at start hour
                      const mc = ev.shared ? { bg: "bg-primary", text: "text-primary", light: "bg-primary/10", dot: "bg-primary" } : getMemberColor(ev.memberId);
                      const heightSpan = ev.endHour - ev.startHour;
                      return (
                        <motion.div
                          key={ev.id}
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`absolute inset-x-0.5 z-[1] rounded-lg ${mc.light} border-l-[3px] ${ev.shared ? "border-l-primary" : `border-l-current ${mc.text}`} px-1.5 py-1 overflow-hidden cursor-default`}
                          style={{ top: 2, height: `calc(${heightSpan * 100}% - 4px)` }}
                          title={`${ev.title} (${ev.memberName})`}
                        >
                          <div className={`text-[0.625rem] truncate ${ev.shared ? "text-primary" : mc.text}`} style={{ fontWeight: 600 }}>
                            {ev.title}
                          </div>
                          <div className="text-[0.5625rem] text-muted-foreground truncate">
                            {ev.memberName}{ev.type === "captured" && " · 📷"}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Find-a-Time Modal ═══ */}
      <AnimatePresence>
        {showFindTime && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowFindTime(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-3 top-[8%] z-50 mx-auto max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:inset-x-auto sm:w-full max-h-[84vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-[1.0625rem]" style={{ fontWeight: 600 }}>智能找空闲</h3>
                    <p className="text-[0.6875rem] text-muted-foreground">AI 扫描全员日历，发现黄金时间块</p>
                  </div>
                </div>
                <button onClick={() => setShowFindTime(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Participants */}
              <div className="mb-4">
                <label className="text-[0.75rem] text-muted-foreground mb-2 block" style={{ fontWeight: 500 }}>参与成员</label>
                <div className="flex flex-wrap gap-1.5">
                  {members.map((m) => {
                    const mc = getMemberColor(m.id);
                    return (
                      <div key={m.id} className={`flex items-center gap-1.5 rounded-full ${mc.light} pl-1 pr-2.5 py-1`}>
                        <div className={`h-5 w-5 rounded-full ${mc.bg} flex items-center justify-center text-white text-[0.5625rem]`} style={{ fontWeight: 700 }}>
                          {m.avatar.charAt(0)}
                        </div>
                        <span className={`text-[0.6875rem] ${mc.text}`} style={{ fontWeight: 500 }}>{m.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Event details */}
              <div className="mb-3">
                <label className="text-[0.75rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>事件名称</label>
                <Input
                  value={findTimeTitle}
                  onChange={(e) => setFindTimeTitle(e.target.value)}
                  placeholder="例如：家庭聚餐、团队周会..."
                  className="rounded-xl"
                />
              </div>

              <div className="mb-4">
                <label className="text-[0.75rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>时长</label>
                <div className="flex gap-2">
                  {[0.5, 1, 1.5, 2, 3].map((dur) => (
                    <button
                      key={dur}
                      onClick={() => setFindTimeDuration(dur)}
                      className={`rounded-lg px-3 py-1.5 text-[0.75rem] transition-all ${
                        findTimeDuration === dur
                          ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                          : "bg-muted/40 text-muted-foreground hover:bg-muted/80"
                      }`}
                      style={{ fontWeight: findTimeDuration === dur ? 600 : 400 }}
                    >
                      {dur}h
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={runFindTime}
                disabled={!findTimeTitle.trim() || findTimeSearching}
                className="w-full rounded-xl bg-primary text-white hover:bg-primary/90 gap-2 mb-4 disabled:opacity-50"
              >
                {findTimeSearching ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />正在扫描 {members.length} 位成员的日历...</>
                ) : (
                  <><Sparkles className="h-4 w-4" />扫描所有人的空闲时间</>
                )}
              </Button>

              {/* Results */}
              <AnimatePresence>
                {findTimeResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {findTimeResults.length > 0 ? (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="text-[0.8125rem]" style={{ fontWeight: 600 }}>
                            找到 {findTimeResults.length} 个黄金时间块
                          </span>
                        </div>
                        <div className="space-y-2 mb-4">
                          {findTimeResults.map((slot, i) => {
                            const d = new Date(slot.date);
                            const isSelected = selectedSlot?.date === slot.date && selectedSlot?.startHour === slot.startHour;
                            const scoreLabel = slot.score > 0.85 ? "极佳" : slot.score > 0.65 ? "推荐" : "可选";
                            const scoreColor = slot.score > 0.85 ? "text-emerald-600 bg-emerald-50" : slot.score > 0.65 ? "text-blue-600 bg-blue-50" : "text-muted-foreground bg-muted/50";
                            return (
                              <motion.button
                                key={`${slot.date}-${slot.startHour}`}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06 }}
                                onClick={() => setSelectedSlot(slot)}
                                className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                                  isSelected ? "border-primary bg-primary/5" : "border-border/30 hover:border-primary/20"
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="text-[0.8125rem]" style={{ fontWeight: 600 }}>
                                    {d.toLocaleDateString("zh-CN", { month: "short", day: "numeric", weekday: "short" })}
                                  </div>
                                  <div className="text-[0.75rem] text-muted-foreground mt-0.5">
                                    {slot.startHour.toString().padStart(2, "0")}:00 - {slot.endHour.toString().padStart(2, "0")}:00
                                  </div>
                                </div>
                                <Badge className={`${scoreColor} text-[0.625rem]`}>{scoreLabel}</Badge>
                                {/* Score bar */}
                                <div className="w-12 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                                  <div className="h-full rounded-full bg-primary" style={{ width: `${slot.score * 100}%` }} />
                                </div>
                                {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                              </motion.button>
                            );
                          })}
                        </div>

                        {selectedSlot && (
                          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                            <Button
                              onClick={confirmSlot}
                              disabled={inviteSent}
                              className="w-full rounded-xl bg-primary text-white hover:bg-primary/90 gap-2"
                            >
                              {inviteSent ? (
                                <><Check className="h-4 w-4" />已创建日程并发送邀请！</>
                              ) : (
                                <><CalendarPlus className="h-4 w-4" />确认并邀请全员</>
                              )}
                            </Button>
                          </motion.div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                        <p className="text-[0.875rem]" style={{ fontWeight: 500 }}>未找到合适的时间</p>
                        <p className="text-[0.75rem] text-muted-foreground mt-1">
                          尝试缩短时长或增大搜索范围
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══ Smart Capture Modal ═══ */}
      <AnimatePresence>
        {showCapture && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => { setShowCapture(false); setCaptureMode(null); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-3 top-[8%] z-50 mx-auto max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:inset-x-auto sm:w-full max-h-[84vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                    <Camera className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-[1.0625rem]" style={{ fontWeight: 600 }}>智能事件捕捉</h3>
                    <p className="text-[0.6875rem] text-muted-foreground">拍照/转发即可自动生成共享日程</p>
                  </div>
                </div>
                <button onClick={() => { setShowCapture(false); setCaptureMode(null); }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Capture methods */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { key: "photo" as const, label: "拍照识别", desc: "通知单、传单", icon: Camera, color: "text-rose-600 bg-rose-50", action: handleCapturePhoto },
                  { key: "email" as const, label: "邮件解析", desc: "机票、会议邀请", icon: Mail, color: "text-blue-600 bg-blue-50", action: handleCaptureEmail },
                  { key: "text" as const, label: "文本粘贴", desc: "聊天记录、短信", icon: FileText, color: "text-emerald-600 bg-emerald-50", action: () => setCaptureMode("email") },
                ].map((method) => (
                  <button
                    key={method.key}
                    onClick={method.action}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all ${
                      captureMode === method.key ? "border-primary bg-primary/5" : "border-border/30 hover:border-border"
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${method.color}`}>
                      <method.icon className="h-5 w-5" />
                    </div>
                    <span className="text-[0.75rem]" style={{ fontWeight: 600 }}>{method.label}</span>
                    <span className="text-[0.5625rem] text-muted-foreground">{method.desc}</span>
                  </button>
                ))}
              </div>

              {/* Text input area */}
              <div className="mb-4">
                <textarea
                  value={captureText}
                  onChange={(e) => setCaptureText(e.target.value)}
                  placeholder="粘贴通知内容、邮件正文、聊天消息等文本，AI 将自动提取日程信息..."
                  className="w-full rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5 text-[0.8125rem] outline-none focus:border-primary/40 resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    onClick={handleCaptureText}
                    disabled={!captureText.trim() || captureAnalyzing}
                    className="rounded-lg bg-primary text-white hover:bg-primary/90 text-[0.75rem] gap-1 disabled:opacity-40"
                  >
                    {captureAnalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    AI 解析
                  </Button>
                </div>
              </div>

              {/* Analyzing state */}
              {captureAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 rounded-xl bg-primary/5 border border-primary/10 p-4 text-center"
                >
                  <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto mb-2" />
                  <p className="text-[0.8125rem] text-primary" style={{ fontWeight: 500 }}>
                    {captureMode === "photo" ? "OCR 识别中..." : "AI 正在解析内容..."}
                  </p>
                  <p className="text-[0.6875rem] text-muted-foreground mt-1">
                    提取日期、时间、地点和相关人员
                  </p>
                </motion.div>
              )}

              {/* Captured results */}
              {capturedEvents.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[0.8125rem]" style={{ fontWeight: 600 }}>已识别的日程 ({capturedEvents.length})</span>
                  </div>
                  <div className="space-y-2">
                    {capturedEvents.map((cap, i) => {
                      const SrcIcon = sourceIcons[cap.source];
                      return (
                        <motion.div
                          key={cap.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`rounded-xl border px-4 py-3 transition-all ${
                            cap.added ? "border-emerald-200 bg-emerald-50/50" : "border-border/50 bg-white hover:border-primary/20"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              cap.source === "photo" ? "bg-rose-50 text-rose-600" : cap.source === "email" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                            }`}>
                              <SrcIcon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[0.8125rem]" style={{ fontWeight: 600 }}>{cap.title}</div>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[0.6875rem] text-muted-foreground">
                                <span className="flex items-center gap-0.5"><CalendarDays className="h-3 w-3" />{cap.date}</span>
                                <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{cap.time}</span>
                                <span className="flex items-center gap-0.5"><AtSign className="h-3 w-3" />{cap.assignee}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[0.625rem] text-muted-foreground/60">来源：{cap.sourceLabel}</span>
                                <Badge className={`text-[0.5625rem] h-4 ${cap.confidence > 0.9 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                  {Math.round(cap.confidence * 100)}% 置信
                                </Badge>
                              </div>
                            </div>
                            <button
                              onClick={() => addCapturedEvent(cap.id)}
                              disabled={cap.added}
                              className={`shrink-0 flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[0.6875rem] transition-all ${
                                cap.added
                                  ? "bg-emerald-100 text-emerald-700 cursor-default"
                                  : "bg-primary/10 text-primary hover:bg-primary/20"
                              }`}
                              style={{ fontWeight: 500 }}
                            >
                              {cap.added ? <><Check className="h-3 w-3" />已加入</> : <><CalendarPlus className="h-3 w-3" />加入日历</>}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
