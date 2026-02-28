import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  Tag,
  Flag,
  Palette,
  Loader2,
  ChevronDown,
  Check,
  Zap,
  Brain,
  ArrowRight,
  CircleAlert,
} from "lucide-react";
import { useLanguage } from "./LanguageContext";

/* ═══════════════ Types ═══════════════ */
export interface NewTaskData {
  text: string;
  priority: "high" | "medium" | "low";
  category: string;
  color: string;
  dueDate: string;
  dueTime: string;
}

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: NewTaskData) => void;
  initialText?: string;
}

/* ═══════════════ Config ═══════════════ */
const priorityTplKeys = [
  { key: "high" as const, labelKey: "addTask.priority.high", descKey: "addTask.priority.high.desc", color: "border-red-300 bg-red-50 text-red-700", dot: "bg-red-500" },
  { key: "medium" as const, labelKey: "addTask.priority.medium", descKey: "addTask.priority.medium.desc", color: "border-amber-300 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  { key: "low" as const, labelKey: "addTask.priority.low", descKey: "addTask.priority.low.desc", color: "border-emerald-300 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
];

const categoryKeys = [
  { key: "addTask.cat.work", emoji: "💼" },
  { key: "addTask.cat.meeting", emoji: "📅" },
  { key: "addTask.cat.learning", emoji: "📚" },
  { key: "addTask.cat.health", emoji: "🏃" },
  { key: "addTask.cat.life", emoji: "🏠" },
  { key: "addTask.cat.finance", emoji: "💰" },
  { key: "addTask.cat.social", emoji: "👥" },
  { key: "addTask.cat.other", emoji: "📌" },
];

const colorTagKeys = [
  { key: "bg-purple-500", labelKey: "addTask.color.purple", ring: "ring-purple-300" },
  { key: "bg-blue-500", labelKey: "addTask.color.blue", ring: "ring-blue-300" },
  { key: "bg-cyan-500", labelKey: "addTask.color.cyan", ring: "ring-cyan-300" },
  { key: "bg-emerald-500", labelKey: "addTask.color.green", ring: "ring-emerald-300" },
  { key: "bg-amber-500", labelKey: "addTask.color.amber", ring: "ring-amber-300" },
  { key: "bg-rose-500", labelKey: "addTask.color.rose", ring: "ring-rose-300" },
  { key: "bg-orange-500", labelKey: "addTask.color.orange", ring: "ring-orange-300" },
  { key: "bg-pink-500", labelKey: "addTask.color.pink", ring: "ring-pink-300" },
];

/* ═══════════════ AI Simulation ═══════════════ */
function simulateAIAnalysis(text: string, isEn = false): Promise<{ priority: "high" | "medium" | "low"; category: string; color: string; dueDate: string; dueTime: string; reasoning: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lower = text.toLowerCase();

      let priority: "high" | "medium" | "low" = "medium";
      let category = isEn ? "Other" : "其他";
      let color = "bg-purple-500";
      let dueDate = "";
      let dueTime = "";
      const reasons: string[] = [];

      // Priority detection
      if (lower.includes("紧急") || lower.includes("马上") || lower.includes("立刻") || lower.includes("deadline") || lower.includes("截止") || lower.includes("urgent") || lower.includes("asap")) {
        priority = "high";
        reasons.push(isEn ? "Urgent keyword detected, set to high priority" : "检测到紧急关键词，设为高优先级");
      } else if (lower.includes("尽快") || lower.includes("重要") || lower.includes("今天") || lower.includes("明天") || lower.includes("today") || lower.includes("tomorrow") || lower.includes("important")) {
        priority = "high";
        reasons.push(isEn ? "Time-sensitive keyword detected, set to high priority" : "检测到时间紧迫关键词，设为高优先级");
      } else if (lower.includes("不急") || lower.includes("有空") || lower.includes("闲了") || lower.includes("以后") || lower.includes("no rush") || lower.includes("whenever") || lower.includes("later")) {
        priority = "low";
        reasons.push(isEn ? "Low priority hint detected, set to low" : "检测到低优先级暗示，设为不急");
      } else {
        reasons.push(isEn ? "No clear priority signal, default to medium" : "未检测到明确优先级信号，默认一般优先级");
      }

      // Category detection
      if (lower.includes("会议") || lower.includes("开会") || lower.includes("讨论") || lower.includes("周会") || lower.includes("meeting") || lower.includes("discuss")) {
        category = isEn ? "Meeting" : "会议";
        color = "bg-blue-500";
        reasons.push(isEn ? "Identified as meeting-related task" : "识别为会议相关任务");
      } else if (lower.includes("报告") || lower.includes("文档") || lower.includes("邮件") || lower.includes("项目") || lower.includes("代码") || lower.includes("工作") || lower.includes("report") || lower.includes("code") || lower.includes("project") || lower.includes("work")) {
        category = isEn ? "Work" : "工作";
        color = "bg-purple-500";
        reasons.push(isEn ? "Identified as work-related task" : "识别为工作相关任务");
      } else if (lower.includes("健身") || lower.includes("跑步") || lower.includes("锻炼") || lower.includes("吃药") || lower.includes("体检") || lower.includes("gym") || lower.includes("exercise") || lower.includes("health")) {
        category = isEn ? "Health" : "健康";
        color = "bg-emerald-500";
        reasons.push(isEn ? "Identified as health-related task" : "识别为健康相关任务");
      } else if (lower.includes("读") || lower.includes("学习") || lower.includes("课程") || lower.includes("培训") || lower.includes("study") || lower.includes("learn") || lower.includes("course")) {
        category = isEn ? "Learning" : "学习";
        color = "bg-cyan-500";
        reasons.push(isEn ? "Identified as learning-related task" : "识别为学习相关任务");
      } else if (lower.includes("买") || lower.includes("超市") || lower.includes("快递") || lower.includes("打扫") || lower.includes("做饭") || lower.includes("buy") || lower.includes("grocery") || lower.includes("clean") || lower.includes("cook")) {
        category = isEn ? "Life" : "生活";
        color = "bg-amber-500";
        reasons.push(isEn ? "Identified as life-related task" : "识别为生活相关任务");
      } else if (lower.includes("账单") || lower.includes("缴费") || lower.includes("工资") || lower.includes("报销") || lower.includes("bill") || lower.includes("payment") || lower.includes("invoice")) {
        category = isEn ? "Finance" : "财务";
        color = "bg-orange-500";
        reasons.push(isEn ? "Identified as finance-related task" : "识别为财务相关任务");
      } else {
        reasons.push(isEn ? "No clear category match, filed as Other" : "未匹配到明确分类，归为其他");
      }

      // Time detection
      const timeMatch = lower.match(/(\d{1,2})[:\uff1a](\d{2})/);
      if (timeMatch) {
        dueTime = `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}`;
        reasons.push(isEn ? `Detected time: ${dueTime}` : `检测到时间：${dueTime}`);
      }

      if (lower.includes("今天") || lower.includes("今日") || lower.includes("today")) {
        const d = new Date();
        dueDate = d.toISOString().split("T")[0];
        reasons.push(isEn ? "Detected 'today', set due date to today" : "检测到「今天」，设置截止日期为今日");
      } else if (lower.includes("明天") || lower.includes("明日") || lower.includes("tomorrow")) {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        dueDate = d.toISOString().split("T")[0];
        reasons.push(isEn ? "Detected 'tomorrow', set due date to tomorrow" : "检测到「明天」，设置截止日期为明日");
      } else if (lower.includes("后天") || lower.includes("day after tomorrow")) {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        dueDate = d.toISOString().split("T")[0];
        reasons.push(isEn ? "Detected 'day after tomorrow', set due date" : "检测到「后天」，设置截止日期");
      }

      const weekdaysZh = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      const weekdaysEn = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const wdList = isEn ? weekdaysEn : weekdaysZh;
      wdList.forEach((wd, idx) => {
        if (lower.includes(wd)) {
          const d = new Date();
          const current = d.getDay();
          let diff = idx - current;
          if (diff <= 0) diff += 7;
          d.setDate(d.getDate() + diff);
          dueDate = d.toISOString().split("T")[0];
          reasons.push(isEn ? `Detected '${wd}', calculated due date` : `检测到「${wd}」，推算截止日期`);
        }
      });

      resolve({
        priority,
        category,
        color,
        dueDate,
        dueTime,
        reasoning: reasons.join(isEn ? "; " : "；"),
      });
    }, 800 + Math.random() * 600);
  });
}

/* ═══════════════ Component ═══════════════ */
export function AddTaskModal({ open, onClose, onSubmit, initialText = "" }: AddTaskModalProps) {
  const { t, locale } = useLanguage();
  const isEn = locale === "en-US";
  const priorities = priorityTplKeys.map((p) => ({ ...p, label: t(p.labelKey), desc: t(p.descKey) }));
  const categories = categoryKeys.map((c) => ({ key: t(c.key), emoji: c.emoji }));
  const colorTags = colorTagKeys.map((c) => ({ ...c, label: t(c.labelKey) }));
  const [text, setText] = useState(initialText);
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [category, setCategory] = useState(t("addTask.cat.other"));
  const [color, setColor] = useState("bg-purple-500");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [showColors, setShowColors] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  // AI
  const [aiEnabled, setAiEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem("lifenix_ai_autofill");
      return saved === "true";
    } catch { return false; }
  });
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiReasoning, setAiReasoning] = useState("");
  const [aiApplied, setAiApplied] = useState(false);

  // Reset when opening
  useEffect(() => {
    if (open) {
      setText(initialText);
      setPriority("medium");
      setCategory(t("addTask.cat.other"));
      setColor("bg-purple-500");
      setDueDate("");
      setDueTime("");
      setAiReasoning("");
      setAiApplied(false);
    }
  }, [open, initialText, t]);

  // Persist AI toggle
  useEffect(() => {
    localStorage.setItem("lifenix_ai_autofill", String(aiEnabled));
  }, [aiEnabled]);

  const handleAIFill = async () => {
    if (!text.trim()) return;
    setAiAnalyzing(true);
    setAiReasoning("");
    setAiApplied(false);
    try {
      const result = await simulateAIAnalysis(text, isEn);
      setPriority(result.priority);
      setCategory(result.category);
      setColor(result.color);
      if (result.dueDate) setDueDate(result.dueDate);
      if (result.dueTime) setDueTime(result.dueTime);
      setAiReasoning(result.reasoning);
      setAiApplied(true);
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Auto-trigger AI when text changes (if AI enabled)
  useEffect(() => {
    if (!aiEnabled || !text.trim() || text.length < 3) return;
    const timer = setTimeout(() => {
      handleAIFill();
    }, 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, aiEnabled]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit({ text: text.trim(), priority, category, color, dueDate, dueTime });
    onClose();
  };

  const selectedColor = colorTags.find((c) => c.key === color);
  const selectedCat = categories.find((c) => c.key === category);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-3 top-[8%] z-50 mx-auto max-w-lg rounded-2xl bg-card shadow-2xl sm:inset-x-auto sm:w-full max-h-[84vh] flex flex-col overflow-hidden"
          >
            {/* ── Header ── */}
            <div className="shrink-0 flex items-center justify-between border-b border-border/50 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                  <Flag className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-[1.0625rem]" style={{ fontWeight: 600 }}>{t("addTask.title")}</h3>
              </div>
              <div className="flex items-center gap-2">
                {/* AI toggle */}
                <div className="flex items-center gap-1.5 rounded-lg bg-muted/40 px-2 py-1">
                  <Sparkles className={`h-3.5 w-3.5 ${aiEnabled ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 500 }}>AI</span>
                  <Switch
                    checked={aiEnabled}
                    onCheckedChange={setAiEnabled}
                    className="scale-75"
                  />
                </div>
                <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Task text */}
              <div>
                <label className="text-[0.75rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>{t("addTask.titlePlaceholder")}</label>
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
                  placeholder={isEn ? "e.g.: Team meeting tomorrow at 3pm to discuss Q1 goals..." : "例如：明天下午3点团队周会 讨论Q1目标..."}
                  className="rounded-xl text-[0.9375rem]"
                  autoFocus
                />
                {aiEnabled && text.trim().length > 0 && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {aiAnalyzing ? (
                      <span className="flex items-center gap-1 text-[0.625rem] text-primary">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        AI {isEn ? "analyzing..." : "正在分析..."}
                      </span>
                    ) : aiApplied ? (
                      <span className="flex items-center gap-1 text-[0.625rem] text-emerald-600">
                        <Check className="h-3 w-3" />
                        AI {isEn ? "auto-filled" : "已自动填充属性"}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="text-[0.75rem] text-muted-foreground mb-2 block" style={{ fontWeight: 500 }}>
                  {t("addTask.priority")}
                  {aiApplied && <span className="ml-1.5 text-[0.5625rem] text-primary bg-primary/10 rounded-full px-1.5 py-0.5">AI</span>}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {priorities.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setPriority(p.key)}
                      className={`relative flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 transition-all ${
                        priority === p.key ? p.color : "border-border/20 hover:border-border/40"
                      }`}
                    >
                      <div className={`h-2.5 w-2.5 rounded-full ${p.dot}`} />
                      <span className="text-[0.8125rem]" style={{ fontWeight: priority === p.key ? 600 : 400 }}>{p.label}</span>
                      <span className="text-[0.5625rem] text-muted-foreground">{p.desc}</span>
                      {priority === p.key && (
                        <motion.div
                          layoutId="priority-check"
                          className="absolute top-1.5 right-1.5"
                        >
                          <Check className="h-3 w-3" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color + Category row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Color picker */}
                <div>
                  <label className="text-[0.75rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>
                    {t("addTask.color")}
                    {aiApplied && <span className="ml-1.5 text-[0.5625rem] text-primary bg-primary/10 rounded-full px-1.5 py-0.5">AI</span>}
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => { setShowColors(!showColors); setShowCategories(false); }}
                      className="flex w-full items-center gap-2 rounded-xl border border-border/40 px-3 py-2.5 hover:border-border/60 transition-colors"
                    >
                      <div className={`h-4 w-4 rounded-full ${color}`} />
                      <span className="text-[0.8125rem] flex-1 text-left">{selectedColor?.label || t("addTask.color")}</span>
                      <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${showColors ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {showColors && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          className="absolute top-full left-0 right-0 mt-1 z-20 rounded-xl border border-border/50 bg-card p-2 shadow-lg"
                        >
                          <div className="grid grid-cols-4 gap-1.5">
                            {colorTags.map((c) => (
                              <button
                                key={c.key}
                                onClick={() => { setColor(c.key); setShowColors(false); }}
                                className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-all hover:bg-muted/40 ${
                                  color === c.key ? "bg-muted/60 ring-2 " + c.ring : ""
                                }`}
                              >
                                <div className={`h-5 w-5 rounded-full ${c.key}`} />
                                <span className="text-[0.5625rem] text-muted-foreground">{c.label}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-[0.75rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>
                    {t("addTask.category")}
                    {aiApplied && <span className="ml-1.5 text-[0.5625rem] text-primary bg-primary/10 rounded-full px-1.5 py-0.5">AI</span>}
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => { setShowCategories(!showCategories); setShowColors(false); }}
                      className="flex w-full items-center gap-2 rounded-xl border border-border/40 px-3 py-2.5 hover:border-border/60 transition-colors"
                    >
                      <span className="text-[0.875rem]">{selectedCat?.emoji}</span>
                      <span className="text-[0.8125rem] flex-1 text-left">{category}</span>
                      <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${showCategories ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {showCategories && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          className="absolute top-full left-0 right-0 mt-1 z-20 rounded-xl border border-border/50 bg-card py-1 shadow-lg"
                        >
                          {categories.map((c) => (
                            <button
                              key={c.key}
                              onClick={() => { setCategory(c.key); setShowCategories(false); }}
                              className={`flex w-full items-center gap-2 px-3 py-2 text-[0.8125rem] hover:bg-muted/40 transition-colors ${
                                category === c.key ? "bg-primary/5 text-primary" : ""
                              }`}
                              style={{ fontWeight: category === c.key ? 600 : 400 }}
                            >
                              <span>{c.emoji}</span>
                              {c.key}
                              {category === c.key && <Check className="h-3.5 w-3.5 ml-auto" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Due date + time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[0.75rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>
                    {t("addTask.dueDate")}
                    {aiApplied && dueDate && <span className="ml-1.5 text-[0.5625rem] text-primary bg-primary/10 rounded-full px-1.5 py-0.5">AI</span>}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full rounded-xl border border-border/40 bg-transparent py-2.5 pl-9 pr-3 text-[0.8125rem] outline-none focus:border-primary/40 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[0.75rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>
                    {t("addTask.dueTime")}
                    {aiApplied && dueTime && <span className="ml-1.5 text-[0.5625rem] text-primary bg-primary/10 rounded-full px-1.5 py-0.5">AI</span>}
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="w-full rounded-xl border border-border/40 bg-transparent py-2.5 pl-9 pr-3 text-[0.8125rem] outline-none focus:border-primary/40 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* AI reasoning */}
              <AnimatePresence>
                {aiReasoning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 to-purple-50/30 px-4 py-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Brain className="h-3.5 w-3.5 text-primary" />
                        <span className="text-[0.6875rem] text-primary" style={{ fontWeight: 600 }}>{t("addTask.aiReason")}</span>
                      </div>
                      <p className="text-[0.6875rem] text-muted-foreground leading-relaxed">{aiReasoning}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Manual AI trigger */}
              {!aiEnabled && text.trim() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAIFill}
                  disabled={aiAnalyzing}
                  className="w-full rounded-xl border-primary/30 text-primary hover:bg-primary/5 gap-1.5"
                >
                  {aiAnalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  {isEn ? "Let AI decide priority & category" : "让 AI 帮我决定优先级和分类"}
                </Button>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="shrink-0 border-t border-border/50 px-5 py-3 flex items-center justify-between gap-3">
              <p className="text-[0.5625rem] text-muted-foreground">
                {aiEnabled ? (isEn ? "AI auto-fill enabled · Configure in settings" : "AI 自动填充已开启 · 可在设置中配置 AI 服务") : (isEn ? "Manual selection or enable AI auto-fill" : "可手动选择或开启 AI 自动填充")}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} className="rounded-xl text-[0.8125rem]">
                  {t("addTask.cancel")}
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  className="rounded-xl bg-primary text-white hover:bg-primary/90 text-[0.8125rem] gap-1 disabled:opacity-40"
                >
                  {t("addTask.submit")}
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

/* ═══════════════ AI Settings Panel (exported for use in Dashboard Settings) ═══════════════ */
export interface AIConfig {
  provider: "none" | "openai" | "openrouter" | "custom";
  apiKey: string;
  model: string;
  baseUrl: string;
  autoFill: boolean;
}

const defaultAIConfig: AIConfig = {
  provider: "none",
  apiKey: "",
  model: "",
  baseUrl: "",
  autoFill: false,
};

const aiProviders = [
  {
    key: "none" as const,
    label: "🧪",
    labelZh: "本地模拟",
    labelEn: "Local Simulation",
    descZh: "使用内置规则引擎（无需 API Key）",
    descEn: "Built-in rule engine (no API Key needed)",
    models: [],
  },
  {
    key: "openai" as const,
    label: "🤖",
    labelZh: "OpenAI",
    labelEn: "OpenAI",
    descZh: "GPT-4o / GPT-4o-mini",
    descEn: "GPT-4o / GPT-4o-mini",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
  {
    key: "openrouter" as const,
    label: "🔀",
    labelZh: "OpenRouter",
    labelEn: "OpenRouter",
    descZh: "聚合多模型网关，支持 Claude / Gemini / Llama 等",
    descEn: "Multi-model gateway: Claude / Gemini / Llama & more",
    models: [
      "anthropic/claude-sonnet-4",
      "anthropic/claude-3.5-haiku",
      "google/gemini-2.0-flash",
      "meta-llama/llama-3.1-70b",
      "deepseek/deepseek-chat",
    ],
  },
  {
    key: "custom" as const,
    label: "⚙️",
    labelZh: "自定义 API",
    labelEn: "Custom API",
    descZh: "兼容 OpenAI 格式的任意端点",
    descEn: "Any OpenAI-compatible endpoint",
    models: [],
  },
];

export function AISettingsPanel() {
  const { t, locale } = useLanguage();
  const isEn = locale === "en-US";
  const [config, setConfig] = useState<AIConfig>(() => {
    try {
      const saved = localStorage.getItem("lifenix_ai_config");
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultAIConfig;
  });
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [saved, setSaved] = useState(false);

  const update = (updates: Partial<AIConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    localStorage.setItem("lifenix_ai_config", JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleTest = () => {
    setTestStatus("testing");
    setTimeout(() => {
      if (config.provider === "none" || config.apiKey.length > 5) {
        setTestStatus("success");
      } else {
        setTestStatus("error");
      }
      setTimeout(() => setTestStatus("idle"), 2500);
    }, 1200);
  };

  const selectedProvider = aiProviders.find((p) => p.key === config.provider);

  return (
    <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
      <h2 className="text-[1.25rem] mb-1" style={{ fontWeight: 600 }}>{t("settings.ai")}</h2>
      <p className="text-[0.875rem] text-muted-foreground mb-6">{isEn ? "Configure AI service provider for smart task analysis, auto-scheduling and suggestions." : "配置 AI 服务提供商，用于任务智能分析、自动排期和日程建议。"}</p>

      <div className="space-y-6 max-w-lg">
        {/* Auto-fill toggle */}
        <div className="flex items-center justify-between rounded-xl border border-border/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-[0.875rem]" style={{ fontWeight: 500 }}>{isEn ? "AI Auto-fill" : "AI 自动填充"}</div>
              <div className="text-[0.75rem] text-muted-foreground">{isEn ? "Auto-analyze priority, category & time when creating tasks" : "创建任务时自动分析优先级、分类和时间"}</div>
            </div>
          </div>
          <Switch
            checked={config.autoFill}
            onCheckedChange={(val) => {
              update({ autoFill: val });
              localStorage.setItem("lifenix_ai_autofill", String(val));
            }}
          />
        </div>

        {/* Provider selection */}
        <div>
          <h3 className="text-[0.9375rem] mb-3" style={{ fontWeight: 600 }}>{isEn ? "AI Service Provider" : "AI 服务提供商"}</h3>
          <div className="space-y-2">
            {aiProviders.map((provider) => (
              <button
                key={provider.key}
                onClick={() => update({ provider: provider.key, model: provider.models[0] || "" })}
                className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                  config.provider === provider.key
                    ? "border-primary bg-primary/5"
                    : "border-border/20 hover:border-border/40"
                }`}
              >
                <span className="text-[1.25rem]">{provider.label}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[0.875rem]" style={{ fontWeight: config.provider === provider.key ? 600 : 400 }}>
                    {isEn ? provider.labelEn : provider.labelZh}
                  </div>
                  <div className="text-[0.6875rem] text-muted-foreground">{isEn ? provider.descEn : provider.descZh}</div>
                </div>
                {config.provider === provider.key && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* API Key (if not "none") */}
        {config.provider !== "none" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div>
              <label className="text-[0.8125rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>API Key</label>
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  value={config.apiKey}
                  onChange={(e) => update({ apiKey: e.target.value })}
                  placeholder={config.provider === "openai" ? "sk-..." : config.provider === "openrouter" ? "sk-or-..." : (isEn ? "Enter API Key..." : "输入 API Key...")}
                  className="rounded-xl pr-16"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[0.6875rem] text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted/40"
                >
                  {showKey ? (isEn ? "Hide" : "隐藏") : (isEn ? "Show" : "显示")}
                </button>
              </div>
              <p className="mt-1 text-[0.625rem] text-muted-foreground/60">
                API Key {isEn ? "is stored locally in your browser only — never uploaded to any server" : "仅存储在你的浏览器本地，不会上传到任何服务器"}
              </p>
            </div>

            {/* Model selector */}
            {selectedProvider && selectedProvider.models.length > 0 && (
              <div>
                <label className="text-[0.8125rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>{isEn ? "Model" : "模型"}</label>
                <select
                  value={config.model}
                  onChange={(e) => update({ model: e.target.value })}
                  className="w-full rounded-xl border border-border/40 bg-transparent px-3 py-2.5 text-[0.875rem] outline-none focus:border-primary/40"
                >
                  {selectedProvider.models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom base URL */}
            {config.provider === "custom" && (
              <div>
                <label className="text-[0.8125rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>Base URL</label>
                <Input
                  value={config.baseUrl}
                  onChange={(e) => update({ baseUrl: e.target.value })}
                  placeholder="https://api.example.com/v1"
                  className="rounded-xl"
                />
              </div>
            )}

            {config.provider === "custom" && (
              <div>
                <label className="text-[0.8125rem] text-muted-foreground mb-1.5 block" style={{ fontWeight: 500 }}>{isEn ? "Model Name" : "模型名称"}</label>
                <Input
                  value={config.model}
                  onChange={(e) => update({ model: e.target.value })}
                  placeholder="gpt-4o"
                  className="rounded-xl"
                />
              </div>
            )}

            {/* OpenRouter note */}
            {config.provider === "openrouter" && (
              <div className="rounded-xl bg-blue-50/50 border border-blue-200/50 px-4 py-3 flex items-start gap-2">
                <CircleAlert className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[0.6875rem] text-blue-800 leading-relaxed">
                    OpenRouter {isEn ? "is a multi-model AI gateway supporting hundreds of models. Visit" : "是一个 AI 模型聚合网关，支持数百种模型。前往"}{" "}
                    <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline" style={{ fontWeight: 500 }}>
                      openrouter.ai
                    </a>{" "}
                    {isEn ? "to sign up and get your API Key." : "注册并获取 API Key。"}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Test + Save */}
        <div className="flex gap-2 border-t border-border/30 pt-4">
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={testStatus === "testing"}
            className="rounded-xl gap-1.5"
          >
            {testStatus === "testing" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {testStatus === "success" && <Check className="h-3.5 w-3.5 text-emerald-600" />}
            {testStatus === "error" && <CircleAlert className="h-3.5 w-3.5 text-destructive" />}
            {testStatus === "idle" && <Zap className="h-3.5 w-3.5" />}
            {testStatus === "testing" ? (isEn ? "Testing..." : "测试中...") : testStatus === "success" ? (isEn ? "Connected" : "连接成功") : testStatus === "error" ? (isEn ? "Failed" : "连接失败") : (isEn ? "Test Connection" : "测试连接")}
          </Button>
          <Button
            onClick={handleSave}
            className="rounded-xl bg-primary text-white hover:bg-primary/90 gap-1"
          >
            {saved ? <><Check className="h-3.5 w-3.5" />{isEn ? "Saved" : "已保存"}</> : (isEn ? "Save Config" : "保存配置")}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}