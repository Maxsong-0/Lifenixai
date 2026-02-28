import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { motion, AnimatePresence } from "motion/react";
import { format, addDays } from "date-fns";
import { zhCN, enUS as enUSDateFns } from "date-fns/locale";
import { useLanguage } from "./LanguageContext";
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Repeat,
  Video,
  Loader2,
  ChevronDown,
  Check,
  ArrowRight,
  Brain,
} from "lucide-react";

/* ═══════════════ Types ═══════════════ */
type Priority = "urgent" | "high" | "medium" | "low";

export interface NewEventData {
  title: string;
  date: Date;
  startHour: number;
  duration: number;
  color: string;
  priority: Priority;
  category: string;
  location: string;
  isRecurring: boolean;
  hasMeeting: boolean;
  tags: string[];
}

export interface AddEventPreset {
  date?: Date;
  startHour?: number;
}

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: NewEventData) => void;
  preset?: AddEventPreset | null;
}

/* ═══════════════ Config ═══════════════ */
const priorityTplKeys: { key: Priority; labelZh: string; labelEn: string; descZh: string; descEn: string; dot: string; border: string }[] = [
  { key: "urgent", labelZh: "紧急", labelEn: "Urgent", descZh: "立即处理", descEn: "Handle now", dot: "bg-red-500", border: "border-red-300 bg-red-50 text-red-700" },
  { key: "high", labelZh: "高", labelEn: "High", descZh: "优先完成", descEn: "Do first", dot: "bg-orange-500", border: "border-orange-300 bg-orange-50 text-orange-700" },
  { key: "medium", labelZh: "中", labelEn: "Medium", descZh: "正常排期", descEn: "Normal schedule", dot: "bg-blue-500", border: "border-blue-300 bg-blue-50 text-blue-700" },
  { key: "low", labelZh: "低", labelEn: "Low", descZh: "有空再做", descEn: "When free", dot: "bg-gray-400", border: "border-gray-300 bg-gray-50 text-gray-600" },
];

const categoryTplKeys = [
  { zhKey: "工作", enKey: "Work", emoji: "💼" },
  { zhKey: "会议", enKey: "Meeting", emoji: "📅" },
  { zhKey: "开发", enKey: "Dev", emoji: "💻" },
  { zhKey: "设计", enKey: "Design", emoji: "🎨" },
  { zhKey: "健康", enKey: "Health", emoji: "🏃" },
  { zhKey: "学习", enKey: "Learning", emoji: "📚" },
  { zhKey: "生活", enKey: "Life", emoji: "🏠" },
  { zhKey: "社交", enKey: "Social", emoji: "👥" },
  { zhKey: "其他", enKey: "Other", emoji: "📌" },
];

const colorTagTplKeys = [
  { key: "bg-blue-500", labelZh: "蓝色", labelEn: "Blue", ring: "ring-blue-300", text: "text-blue-500" },
  { key: "bg-purple-500", labelZh: "紫色", labelEn: "Purple", ring: "ring-purple-300", text: "text-purple-500" },
  { key: "bg-cyan-500", labelZh: "青色", labelEn: "Cyan", ring: "ring-cyan-300", text: "text-cyan-500" },
  { key: "bg-emerald-500", labelZh: "绿色", labelEn: "Green", ring: "ring-emerald-300", text: "text-emerald-500" },
  { key: "bg-amber-500", labelZh: "琥珀", labelEn: "Amber", ring: "ring-amber-300", text: "text-amber-500" },
  { key: "bg-rose-500", labelZh: "玫红", labelEn: "Rose", ring: "ring-rose-300", text: "text-rose-500" },
  { key: "bg-indigo-500", labelZh: "靛蓝", labelEn: "Indigo", ring: "ring-indigo-300", text: "text-indigo-500" },
  { key: "bg-pink-500", labelZh: "粉色", labelEn: "Pink", ring: "ring-pink-300", text: "text-pink-500" },
  { key: "bg-teal-500", labelZh: "蓝绿", labelEn: "Teal", ring: "ring-teal-300", text: "text-teal-500" },
  { key: "bg-orange-500", labelZh: "橙色", labelEn: "Orange", ring: "ring-orange-300", text: "text-orange-500" },
];

const durationTplKeys = [
  { value: 0.25, labelZh: "15分钟", labelEn: "15 min" },
  { value: 0.5, labelZh: "30分钟", labelEn: "30 min" },
  { value: 0.75, labelZh: "45分钟", labelEn: "45 min" },
  { value: 1, labelZh: "1小时", labelEn: "1 hour" },
  { value: 1.5, labelZh: "1.5小时", labelEn: "1.5 hours" },
  { value: 2, labelZh: "2小时", labelEn: "2 hours" },
  { value: 3, labelZh: "3小时", labelEn: "3 hours" },
  { value: 4, labelZh: "4小时", labelEn: "4 hours" },
];

const hourOptions = Array.from({ length: 30 }, (_, i) => {
  const h = 7 + i * 0.5;
  return { value: h, label: `${Math.floor(h).toString().padStart(2, "0")}:${h % 1 === 0 ? "00" : "30"}` };
});

/* ═══════════════ AI Simulation ═══════════════ */
function simulateAIAnalysis(text: string): Promise<{
  priority: Priority; category: string; color: string;
  duration: number; startHour: number | null; dateDelta: number | null;
  location: string; hasMeeting: boolean; isRecurring: boolean;
  tags: string[]; reasoning: string;
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lower = text.toLowerCase();
      let priority: Priority = "medium";
      let category = "其他";
      let color = "bg-blue-500";
      let duration = 1;
      let startHour: number | null = null;
      let dateDelta: number | null = null;
      let location = "";
      let hasMeeting = false;
      let isRecurring = false;
      const tags: string[] = [];
      const reasons: string[] = [];

      // Priority
      if (lower.includes("紧急") || lower.includes("马上") || lower.includes("立刻")) {
        priority = "urgent"; reasons.push("检测到紧急关键词");
      } else if (lower.includes("重要") || lower.includes("关键")) {
        priority = "high"; reasons.push("检测到高优先级关键词");
      } else if (lower.includes("不急") || lower.includes("有空")) {
        priority = "low"; reasons.push("检测到低优先级暗示");
      }

      // Category & color
      if (lower.includes("会议") || lower.includes("开会") || lower.includes("讨论") || lower.includes("站会") || lower.includes("评审")) {
        category = "会议"; color = "bg-purple-500"; hasMeeting = true; tags.push("会议");
        reasons.push("识别为会议");
      } else if (lower.includes("代码") || lower.includes("开发") || lower.includes("编程") || lower.includes("debug") || lower.includes("api")) {
        category = "开发"; color = "bg-cyan-500"; tags.push("开发");
        reasons.push("识别为开发任务");
      } else if (lower.includes("设计") || lower.includes("原型") || lower.includes("ui") || lower.includes("figma")) {
        category = "设计"; color = "bg-pink-500"; tags.push("设计");
        reasons.push("识别为设计任务");
      } else if (lower.includes("健身") || lower.includes("跑步") || lower.includes("运动") || lower.includes("锻炼")) {
        category = "健康"; color = "bg-emerald-500"; tags.push("运动");
        reasons.push("识别为健康活动");
      } else if (lower.includes("学习") || lower.includes("阅读") || lower.includes("读") || lower.includes("课")) {
        category = "学习"; color = "bg-rose-500"; tags.push("学习");
        reasons.push("识别为学习活动");
      } else if (lower.includes("文档") || lower.includes("报告") || lower.includes("周报") || lower.includes("邮件")) {
        category = "工作"; color = "bg-blue-500"; tags.push("工作");
        reasons.push("识别为工作任务");
      }

      // Time detection
      const timeMatch = lower.match(/(\d{1,2})[:\uff1a](\d{2})/);
      if (timeMatch) {
        startHour = parseInt(timeMatch[1]) + parseInt(timeMatch[2]) / 60;
        reasons.push(`检测到时间 ${timeMatch[1]}:${timeMatch[2]}`);
      } else {
        if (lower.includes("上午") || lower.includes("早上")) {
          startHour = 9; reasons.push("检测到「上午」");
        } else if (lower.includes("下午")) {
          startHour = 14; reasons.push("检测到「下午」");
          const hourMatch = lower.match(/下午\s*(\d{1,2})/);
          if (hourMatch) startHour = parseInt(hourMatch[1]) + (parseInt(hourMatch[1]) < 12 ? 12 : 0);
        } else if (lower.includes("晚上") || lower.includes("晚")) {
          startHour = 19; reasons.push("检测到「晚上」");
        }
        // Chinese number hours
        const zhNums: Record<string, number> = { "一": 1, "二": 2, "两": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10, "十一": 11, "十二": 12 };
        const zhHourMatch = lower.match(/(一|二|两|三|四|五|六|七|八|九|十|十一|十二)点(半)?/);
        if (zhHourMatch) {
          let h = zhNums[zhHourMatch[1]] || 0;
          if (lower.includes("下午") && h < 12) h += 12;
          if (zhHourMatch[2]) h += 0.5;
          startHour = h;
          reasons.push(`解析中文时间：${h}:${zhHourMatch[2] ? "30" : "00"}`);
        }
      }

      // Duration
      const durMatch = lower.match(/(\d+\.?\d*)\s*(小时|h|hr)/);
      if (durMatch) {
        duration = parseFloat(durMatch[1]); reasons.push(`检测到时长 ${duration}h`);
      } else if (lower.includes("半小时") || lower.includes("30分钟")) {
        duration = 0.5; reasons.push("检测到 30 分钟");
      } else if (lower.includes("一小时") || lower.includes("1小时")) {
        duration = 1;
      } else if (hasMeeting) {
        duration = 1; reasons.push("会议默认 1 小时");
      }

      // Date
      if (lower.includes("今天") || lower.includes("今日")) {
        dateDelta = 0; reasons.push("日期：今天");
      } else if (lower.includes("明天") || lower.includes("明日")) {
        dateDelta = 1; reasons.push("日期：明天");
      } else if (lower.includes("后天")) {
        dateDelta = 2; reasons.push("日期：后天");
      } else if (lower.includes("大后天")) {
        dateDelta = 3;
      }
      const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      weekdays.forEach((wd, idx) => {
        if (lower.includes(wd)) {
          const d = new Date();
          const current = d.getDay();
          let diff = idx - current;
          if (diff <= 0) diff += 7;
          dateDelta = diff;
          reasons.push(`检测到「${wd}」`);
        }
      });

      // Location
      if (lower.includes("会议室")) {
        const roomMatch = lower.match(/会议室\s*[a-zA-Z0-9]*/);
        location = roomMatch ? roomMatch[0] : "会议室";
        reasons.push(`检测到地点：${location}`);
      } else if (lower.includes("线上") || lower.includes("zoom") || lower.includes("teams") || lower.includes("腾讯会议")) {
        location = "线上";
        hasMeeting = true;
        reasons.push("检测到线上会议");
      }

      // Recurring
      if (lower.includes("每周") || lower.includes("每天") || lower.includes("每日") || lower.includes("循环")) {
        isRecurring = true; reasons.push("检测到循环日程");
      }

      if (reasons.length === 0) reasons.push("未检测到明确信号，使用默认值");

      resolve({ priority, category, color, duration, startHour, dateDelta, location, hasMeeting, isRecurring, tags, reasoning: reasons.join("；") });
    }, 600 + Math.random() * 500);
  });
}

/* ═══════════════ Component ═══════════════ */
export function AddEventModal({ open, onClose, onSubmit, preset }: AddEventModalProps) {
  const { t, locale } = useLanguage();
  const isEn = locale === "en-US";
  const fnsLocale = isEn ? enUSDateFns : zhCN;
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [startHour, setStartHour] = useState(9);
  const [duration, setDuration] = useState(1);
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState("其他");
  const [color, setColor] = useState("bg-blue-500");
  const [location, setLocation] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [hasMeeting, setHasMeeting] = useState(false);

  // Dropdowns
  const [showColors, setShowColors] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showDuration, setShowDuration] = useState(false);
  const [showStartHour, setShowStartHour] = useState(false);

  // AI
  const [aiEnabled, setAiEnabled] = useState(() => {
    try { return localStorage.getItem("lifenix_ai_autofill") === "true"; } catch { return false; }
  });
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiReasoning, setAiReasoning] = useState("");
  const [aiApplied, setAiApplied] = useState(false);

  // Section collapse
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Reset
  useEffect(() => {
    if (open) {
      setTitle("");
      setDate(preset?.date ? format(preset.date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));
      setStartHour(preset?.startHour ?? 9);
      setDuration(1);
      setPriority("medium");
      setCategory("其他");
      setColor("bg-blue-500");
      setLocation("");
      setIsRecurring(false);
      setHasMeeting(false);
      setAiReasoning("");
      setAiApplied(false);
      setShowColors(false);
      setShowCategories(false);
      setShowDuration(false);
      setShowStartHour(false);
      setShowAdvanced(false);
    }
  }, [open, preset]);

  const closeAllDropdowns = () => {
    setShowColors(false);
    setShowCategories(false);
    setShowDuration(false);
    setShowStartHour(false);
  };

  const handleAIFill = async () => {
    if (!title.trim()) return;
    setAiAnalyzing(true);
    setAiReasoning("");
    setAiApplied(false);
    try {
      const r = await simulateAIAnalysis(title);
      setPriority(r.priority);
      setCategory(r.category);
      setColor(r.color);
      setDuration(r.duration);
      if (r.startHour !== null) setStartHour(r.startHour);
      if (r.dateDelta !== null) setDate(format(addDays(new Date(), r.dateDelta), "yyyy-MM-dd"));
      if (r.location) setLocation(r.location);
      setHasMeeting(r.hasMeeting);
      setIsRecurring(r.isRecurring);
      setAiReasoning(r.reasoning);
      setAiApplied(true);
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Auto AI
  useEffect(() => {
    if (!aiEnabled || !title.trim() || title.length < 2) return;
    const timer = setTimeout(() => { handleAIFill(); }, 1000);
    return () => clearTimeout(timer);
  }, [title, aiEnabled]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      date: new Date(date + "T00:00:00"),
      startHour,
      duration,
      color,
      priority,
      category,
      location,
      isRecurring,
      hasMeeting,
      tags: [category],
    });
    onClose();
  };

  const fmtH = (h: number) => `${Math.floor(h).toString().padStart(2, "0")}:${h % 1 === 0 ? "00" : "30"}`;
  const selectedColor = colorTagTplKeys.find((c) => c.key === color);
  const selectedCat = categoryTplKeys.find((c) => (isEn ? c.enKey : c.zhKey) === category);
  const selectedDuration = durationTplKeys.find((d) => d.value === duration);
  const presetLabel = preset?.date ? `${format(preset.date, isEn ? "MMM d" : "M月d日", { locale: fnsLocale })} ${fmtH(preset.startHour ?? 9)}` : null;

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={closeAllDropdowns}
            className="fixed inset-x-3 top-[5%] z-[81] mx-auto max-w-lg rounded-2xl bg-card shadow-2xl sm:inset-x-auto sm:w-full max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between border-b border-border/50 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-[1rem]" style={{ fontWeight: 600 }}>{isEn ? "New Event" : "新建日程"}</h3>
                  {presetLabel && (
                    <p className="text-[0.625rem] text-primary">{presetLabel} · {isEn ? "From calendar" : "从日历创建"}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg bg-muted/40 px-2 py-1">
                  <Sparkles className={`h-3.5 w-3.5 ${aiEnabled ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-[0.625rem] text-muted-foreground" style={{ fontWeight: 500 }}>AI</span>
                  <Switch checked={aiEnabled} onCheckedChange={(v) => { setAiEnabled(v); localStorage.setItem("lifenix_ai_autofill", String(v)); }} className="scale-75" />
                </div>
                <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60"><X className="h-5 w-5" /></button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" onClick={(e) => e.stopPropagation()}>
              {/* Title */}
              <div>
                <label className="text-[0.6875rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>{isEn ? "Event title (natural language supported)" : "日程标题（支持自然语言）"}</label>
                <div className="relative">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
                    placeholder={isEn ? "e.g.: Tomorrow 2:30pm Room A team meeting 1.5h" : "例：明天下午两点半 会议室A 团队周会 1.5小时"}
                    className="rounded-xl text-[0.9375rem] pr-10"
                    autoFocus
                  />
                  <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/30" />
                </div>
                {aiEnabled && title.trim().length > 0 && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {aiAnalyzing ? (
                      <span className="flex items-center gap-1 text-[0.5625rem] text-primary"><Loader2 className="h-3 w-3 animate-spin" />{isEn ? "AI analyzing..." : "AI 正在分析…"}</span>
                    ) : aiApplied ? (
                      <span className="flex items-center gap-1 text-[0.5625rem] text-emerald-600"><Check className="h-3 w-3" />{isEn ? "AI auto-filled" : "AI 已自动填充"}</span>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Date + Start time + Duration row */}
              <div className="grid grid-cols-3 gap-2.5">
                {/* Date */}
                <div>
                  <label className="text-[0.6875rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>
                    {isEn ? "Date" : "日期"} {aiApplied && <span className="text-[0.5rem] text-primary bg-primary/10 rounded-full px-1 py-0.5 ml-1">AI</span>}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl border border-border/40 bg-transparent py-2 pl-8 pr-2 text-[0.75rem] outline-none focus:border-primary/40 transition-colors"
                    />
                  </div>
                </div>
                {/* Start time */}
                <div className="relative">
                  <label className="text-[0.6875rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>
                    {isEn ? "Start" : "开始"} {aiApplied && <span className="text-[0.5rem] text-primary bg-primary/10 rounded-full px-1 py-0.5 ml-1">AI</span>}
                  </label>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowStartHour(!showStartHour); setShowDuration(false); setShowColors(false); setShowCategories(false); }}
                    className="flex w-full items-center gap-1.5 rounded-xl border border-border/40 px-2.5 py-2 text-[0.75rem] hover:border-border/60 transition-colors"
                  >
                    <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="flex-1 text-left">{fmtH(startHour)}</span>
                    <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${showStartHour ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {showStartHour && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl border border-border/50 bg-card shadow-lg max-h-48 overflow-y-auto"
                      >
                        {hourOptions.map((h) => (
                          <button
                            key={h.value}
                            onClick={() => { setStartHour(h.value); setShowStartHour(false); }}
                            className={`flex w-full items-center px-3 py-1.5 text-[0.75rem] hover:bg-muted/40 transition-colors ${startHour === h.value ? "bg-primary/5 text-primary" : ""}`}
                            style={{ fontWeight: startHour === h.value ? 600 : 400 }}
                          >
                            {h.label}
                            {startHour === h.value && <Check className="h-3 w-3 ml-auto" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Duration */}
                <div className="relative">
                  <label className="text-[0.6875rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>
                    {isEn ? "Duration" : "时长"} {aiApplied && <span className="text-[0.5rem] text-primary bg-primary/10 rounded-full px-1 py-0.5 ml-1">AI</span>}
                  </label>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDuration(!showDuration); setShowStartHour(false); setShowColors(false); setShowCategories(false); }}
                    className="flex w-full items-center gap-1.5 rounded-xl border border-border/40 px-2.5 py-2 text-[0.75rem] hover:border-border/60 transition-colors"
                  >
                    <span className="flex-1 text-left">{selectedDuration ? (isEn ? selectedDuration.labelEn : selectedDuration.labelZh) : `${duration}h`}</span>
                    <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${showDuration ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {showDuration && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl border border-border/50 bg-card py-1 shadow-lg"
                      >
                        {durationTplKeys.map((d) => (
                          <button
                            key={d.value}
                            onClick={() => { setDuration(d.value); setShowDuration(false); }}
                            className={`flex w-full items-center px-3 py-1.5 text-[0.75rem] hover:bg-muted/40 transition-colors ${duration === d.value ? "bg-primary/5 text-primary" : ""}`}
                            style={{ fontWeight: duration === d.value ? 600 : 400 }}
                          >
                            {isEn ? d.labelEn : d.labelZh}
                            {duration === d.value && <Check className="h-3 w-3 ml-auto" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Preview bar */}
              <div className="rounded-xl bg-muted/20 border border-border/20 px-3 py-2 flex items-center gap-3">
                <div className={`w-1 self-stretch rounded-full ${color}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-[0.75rem] truncate" style={{ fontWeight: 500 }}>{title || (isEn ? "Event title" : "日程标题")}</div>
                  <div className="text-[0.625rem] text-muted-foreground flex items-center gap-2 flex-wrap">
                    <span>{format(new Date(date + "T00:00:00"), isEn ? "MMM d EEE" : "M月d日 EEE", { locale: fnsLocale })}</span>
                    <span>{fmtH(startHour)} – {fmtH(startHour + duration)}</span>
                    <span>{selectedDuration ? (isEn ? selectedDuration.labelEn : selectedDuration.labelZh) : `${duration}h`}</span>
                    {location && <span>📍{location}</span>}
                  </div>
                </div>
                <Badge className={`${priorityTplKeys.find((p) => p.key === priority)?.border} text-[0.5rem] h-4 px-1.5 border`}>
                  {isEn ? priorityTplKeys.find((p) => p.key === priority)?.labelEn : priorityTplKeys.find((p) => p.key === priority)?.labelZh}
                </Badge>
              </div>

              {/* Priority */}
              <div>
                <label className="text-[0.6875rem] text-muted-foreground mb-2 block" style={{ fontWeight: 500 }}>
                  {isEn ? "Priority" : "优先级"} {aiApplied && <span className="text-[0.5rem] text-primary bg-primary/10 rounded-full px-1 py-0.5 ml-1">AI</span>}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {priorityTplKeys.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setPriority(p.key)}
                      className={`relative flex flex-col items-center gap-0.5 rounded-xl border-2 px-2 py-2 transition-all ${
                        priority === p.key ? p.border : "border-border/20 hover:border-border/40"
                      }`}
                    >
                      <div className={`h-2 w-2 rounded-full ${p.dot}`} />
                      <span className="text-[0.6875rem]" style={{ fontWeight: priority === p.key ? 600 : 400 }}>{isEn ? p.labelEn : p.labelZh}</span>
                      <span className="text-[0.5rem] text-muted-foreground">{isEn ? p.descEn : p.descZh}</span>
                      {priority === p.key && (
                        <motion.div layoutId="prio-check-ev" className="absolute top-1 right-1">
                          <Check className="h-2.5 w-2.5" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color + Category */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Color */}
                <div className="relative">
                  <label className="text-[0.6875rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>
                    {isEn ? "Color" : "颜色"} {aiApplied && <span className="text-[0.5rem] text-primary bg-primary/10 rounded-full px-1 py-0.5 ml-1">AI</span>}
                  </label>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowColors(!showColors); setShowCategories(false); setShowStartHour(false); setShowDuration(false); }}
                    className="flex w-full items-center gap-2 rounded-xl border border-border/40 px-3 py-2 hover:border-border/60 transition-colors"
                  >
                    <div className={`h-4 w-4 rounded-full ${color}`} />
                    <span className="text-[0.75rem] flex-1 text-left">{selectedColor ? (isEn ? selectedColor.labelEn : selectedColor.labelZh) : (isEn ? "Select" : "选择")}</span>
                    <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${showColors ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {showColors && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl border border-border/50 bg-card p-2 shadow-lg"
                      >
                        <div className="grid grid-cols-5 gap-1.5">
                          {colorTagTplKeys.map((c) => (
                            <button key={c.key} onClick={() => { setColor(c.key); setShowColors(false); }} className={`flex flex-col items-center gap-0.5 rounded-lg p-1.5 transition-all hover:bg-muted/40 ${color === c.key ? "bg-muted/60 ring-2 " + c.ring : ""}`}>
                              <div className={`h-5 w-5 rounded-full ${c.key}`} />
                              <span className="text-[0.5rem] text-muted-foreground">{isEn ? c.labelEn : c.labelZh}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* Category */}
                <div className="relative">
                  <label className="text-[0.6875rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>
                    {isEn ? "Category" : "分类"} {aiApplied && <span className="text-[0.5rem] text-primary bg-primary/10 rounded-full px-1 py-0.5 ml-1">AI</span>}
                  </label>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowCategories(!showCategories); setShowColors(false); setShowStartHour(false); setShowDuration(false); }}
                    className="flex w-full items-center gap-2 rounded-xl border border-border/40 px-3 py-2 hover:border-border/60 transition-colors"
                  >
                    <span className="text-[0.8125rem]">{selectedCat?.emoji}</span>
                    <span className="text-[0.75rem] flex-1 text-left">{selectedCat ? (isEn ? selectedCat.enKey : selectedCat.zhKey) : category}</span>
                    <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${showCategories ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {showCategories && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl border border-border/50 bg-card py-1 shadow-lg max-h-48 overflow-y-auto"
                      >
                        {categoryTplKeys.map((c) => (
                          <button key={c.zhKey} onClick={() => { setCategory(isEn ? c.enKey : c.zhKey); setShowCategories(false); }} className={`flex w-full items-center gap-2 px-3 py-1.5 text-[0.75rem] hover:bg-muted/40 transition-colors ${category === (isEn ? c.enKey : c.zhKey) ? "bg-primary/5 text-primary" : ""}`} style={{ fontWeight: category === (isEn ? c.enKey : c.zhKey) ? 600 : 400 }}>
                            <span>{c.emoji}</span>{isEn ? c.enKey : c.zhKey}
                            {category === (isEn ? c.enKey : c.zhKey) && <Check className="h-3 w-3 ml-auto" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Advanced toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1.5 text-[0.6875rem] text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvanced ? "" : "-rotate-90"}`} />
                <span style={{ fontWeight: 500 }}>{isEn ? "More options" : "更多选项"}</span>
                <div className="flex-1 h-px bg-border/30" />
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-3"
                  >
                    {/* Location */}
                    <div>
                      <label className="text-[0.6875rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>
                        {isEn ? "Location" : "地点"} {aiApplied && location && <span className="text-[0.5rem] text-primary bg-primary/10 rounded-full px-1 py-0.5 ml-1">AI</span>}
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder={isEn ? "Room, online link, or address" : "会议室、线上链接或地址"}
                          className="rounded-xl pl-9 text-[0.8125rem]"
                        />
                      </div>
                    </div>
                    {/* Toggles */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between rounded-xl border border-border/30 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-[0.6875rem]" style={{ fontWeight: 500 }}>{isEn ? "Recurring" : "循环日程"}</span>
                        </div>
                        <Switch checked={isRecurring} onCheckedChange={setIsRecurring} className="scale-75" />
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-border/30 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Video className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-[0.6875rem]" style={{ fontWeight: 500 }}>{isEn ? "Has meeting" : "含会议"}</span>
                        </div>
                        <Switch checked={hasMeeting} onCheckedChange={setHasMeeting} className="scale-75" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI reasoning */}
              <AnimatePresence>
                {aiReasoning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 to-purple-50/30 px-4 py-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Brain className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[0.625rem] text-primary" style={{ fontWeight: 600 }}>{isEn ? "AI Analysis" : "AI 分析"}</span>
                      </div>
                      <p className="text-[0.625rem] text-muted-foreground leading-relaxed">{aiReasoning}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Manual AI trigger */}
              {!aiEnabled && title.trim() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAIFill}
                  disabled={aiAnalyzing}
                  className="w-full rounded-xl border-primary/30 text-primary hover:bg-primary/5 gap-1.5 text-[0.75rem]"
                >
                  {aiAnalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {isEn ? "Let AI smart-fill" : "让 AI 帮我智能填充"}
                </Button>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-border/50 px-5 py-3 flex items-center justify-between gap-3">
              <p className="text-[0.5rem] text-muted-foreground max-w-[180px]">
                {aiEnabled ? (isEn ? "AI auto-fill enabled" : "AI 自动填充已开启") : (isEn ? "Manual or enable AI" : "可手动选择或开启 AI")}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} className="rounded-xl text-[0.75rem]">{isEn ? "Cancel" : "取消"}</Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!title.trim()}
                  className="rounded-xl bg-primary text-white hover:bg-primary/90 text-[0.75rem] gap-1 disabled:opacity-40"
                >
                  {isEn ? "Create Event" : "创建日程"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}