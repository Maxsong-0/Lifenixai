import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Upload,
  Image as ImageIcon,
  FileText,
  Sparkles,
  Clock,
  MapPin,
  Users,
  CalendarDays,
  ListTodo,
  CircleCheck,
  CircleAlert,
  Copy,
  Plus,
  ChevronRight,
  Zap,
  MessageSquare,
  ScanText,
  File,
  Trash2,
  ArrowRight,
  BrainCircuit,
  Loader2,
  Tag,
  Flag,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { zhCN, enUS as enUSDateFns } from "date-fns/locale";
import { useLanguage } from "./LanguageContext";

/* ═══════════════ Types ═══════════════ */
type ParseMode = "chat" | "document";
type ParseStatus = "idle" | "uploading" | "parsing" | "done" | "error";

interface ExtractedTime {
  text: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  confidence: number;
}

interface ExtractedPerson {
  name: string;
  role?: string;
}

interface ExtractedLocation {
  name: string;
  type?: "online" | "offline";
}

interface ActionItem {
  id: string;
  text: string;
  priority: "high" | "medium" | "low";
  deadline?: string;
  assignee?: string;
  added: boolean;
}

interface ParsedSchedule {
  id: string;
  title: string;
  times: ExtractedTime[];
  people: ExtractedPerson[];
  locations: ExtractedLocation[];
  summary: string;
  added: boolean;
}

interface DocumentSummary {
  title: string;
  wordCount: number;
  readingTime: string;
  summary: string;
  keyPoints: string[];
  actionItems: ActionItem[];
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string; // base64 data URL for images
}

/* ═══════════════ Mock Parse Results ═══════════════ */
const today = new Date();

const mockChatParseResults: ParsedSchedule[] = [
  {
    id: "cs1",
    title: "项目评审会议",
    times: [
      { text: "明天下午3点", date: addDays(today, 1), startTime: "15:00", endTime: "16:00", confidence: 0.95 },
    ],
    people: [
      { name: "张总", role: "主持人" },
      { name: "李明", role: "汇报人" },
      { name: "王华", role: "参与者" },
    ],
    locations: [{ name: "B栋3楼大会议室", type: "offline" }],
    summary: "张总在群里通知明天下午3点在B栋3楼大会议室召开项目评审会议，李明负责汇报进度。",
    added: false,
  },
  {
    id: "cs2",
    title: "团队聚餐",
    times: [
      { text: "周五晚上7点", date: addDays(today, 3), startTime: "19:00", endTime: "21:00", confidence: 0.88 },
    ],
    people: [
      { name: "全组同事" },
    ],
    locations: [{ name: "海底捞（中关村店）", type: "offline" }],
    summary: "群里发起周五团队聚餐接龙，地点在海底捞中关村店，目前已有8人报名。",
    added: false,
  },
  {
    id: "cs3",
    title: "提交周报",
    times: [
      { text: "本周四下班前", date: addDays(today, 2), startTime: "18:00", confidence: 0.82 },
    ],
    people: [],
    locations: [],
    summary: "经理提醒本周四下班前提交周报，需要包含本周工作进度和下周计划。",
    added: false,
  },
];

const mockDocumentResult: DocumentSummary = {
  title: "2026年Q1产品路线图规划",
  wordCount: 4580,
  readingTime: "约 12 分钟",
  summary:
    "本文档详细阐述了2026年第一季度的产品战略方向，包括三大核心模块的迭代升级计划、AI功能的深度集成方案，以及市场拓展策略。重点强调了移动端体验优化和企业级安全合规两个关键方向。",
  keyPoints: [
    "Q1 核心目标：移动端用户日活提升 40%，企业客户转化率提升 25%",
    "AI 模块升级：引入 GPT-4o 多模态能力，支持图片和文档理解",
    "新增企业版功能：SSO 单点登录、审计日志、数据驻留策略",
    "技术架构调整：微服务拆分，主服务响应时间优化至 200ms 以内",
    "市场策略：重点布局教育和医疗两个垂直行业",
  ],
  actionItems: [
    { id: "ai1", text: "完成移动端性能基准测试报告", priority: "high", deadline: "1月15日", assignee: "前端组", added: false },
    { id: "ai2", text: "GPT-4o API 接入方案设计评审", priority: "high", deadline: "1月20日", assignee: "AI组", added: false },
    { id: "ai3", text: "企业版 SSO 集成开发", priority: "medium", deadline: "2月28日", assignee: "后端组", added: false },
    { id: "ai4", text: "微服务架构迁移方案文档", priority: "medium", deadline: "1月25日", assignee: "架构组", added: false },
    { id: "ai5", text: "教育行业客户需求调研", priority: "low", deadline: "2月15日", assignee: "产品组", added: false },
    { id: "ai6", text: "安全合规认证申请材料准备", priority: "high", deadline: "1月30日", assignee: "安全组", added: false },
  ],
};

const mockChatText = `[群聊] 项目组
张总 14:23
@所有人 明天下午3点在B栋3楼大会议室开项目评审会，李明准备一下进度汇报PPT

李明 14:25
收到，张总。PPT我今晚整理好

王华 14:26
好的 我也准备一下测试报告

张总 14:28
另外周五晚上团队聚餐，海底捞中关村店，想去的在下面接龙
1. 张总
2. 李明
3. 王华
4. 赵丽
5. 刘洋
6. 陈磊
7. 周杰
8. 吴青

经理 16:45
提醒一下，本周四下班前记得交周报，要写上本周进度和下周计划`;

/* ═══════════════ Main Component ═══════════════ */
interface FragmentParserProps {
  open: boolean;
  onClose: () => void;
  onAddSchedule?: (schedule: ParsedSchedule) => void;
  onAddTask?: (task: ActionItem) => void;
}

export function FragmentParser({ open, onClose, onAddSchedule, onAddTask }: FragmentParserProps) {
  const [mode, setMode] = useState<ParseMode>("chat");
  const [status, setStatus] = useState<ParseStatus>("idle");
  const [parseProgress, setParseProgress] = useState(0);
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [chatResults, setChatResults] = useState<ParsedSchedule[]>([]);
  const [docResult, setDocResult] = useState<DocumentSummary | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  const resetState = () => {
    setStatus("idle");
    setParseProgress(0);
    setFile(null);
    setPastedText("");
    setChatResults([]);
    setDocResult(null);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
  };

  const handleModeSwitch = (m: ParseMode) => {
    if (status !== "idle" && status !== "done") return;
    setMode(m);
    resetState();
  };

  const simulateParsing = useCallback((isChat: boolean) => {
    setStatus("uploading");
    setParseProgress(0);

    setTimeout(() => {
      setStatus("parsing");
      let prog = 0;
      progressTimerRef.current = setInterval(() => {
        prog += Math.random() * 15 + 5;
        if (prog >= 100) {
          prog = 100;
          if (progressTimerRef.current) clearInterval(progressTimerRef.current);
          setParseProgress(100);
          setTimeout(() => {
            setStatus("done");
            if (isChat) {
              setChatResults(mockChatParseResults.map((r) => ({ ...r, added: false })));
            } else {
              setDocResult({
                ...mockDocumentResult,
                actionItems: mockDocumentResult.actionItems.map((a) => ({ ...a, added: false })),
              });
            }
          }, 400);
        }
        setParseProgress(Math.min(prog, 100));
      }, 300);
    }, 800);
  }, []);

  const handleFileSelect = useCallback(
    (f: File) => {
      const isImage = f.type.startsWith("image/");
      const uploaded: UploadedFile = {
        id: Date.now().toString(),
        name: f.name,
        type: f.type,
        size: f.size,
      };

      if (isImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
          uploaded.preview = reader.result as string;
          setFile(uploaded);
          simulateParsing(mode === "chat");
        };
        reader.readAsDataURL(f);
      } else {
        setFile(uploaded);
        simulateParsing(mode === "document");
      }
    },
    [mode, simulateParsing]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFileSelect(f);
    },
    [handleFileSelect]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);

  const handlePasteAndParse = () => {
    if (!pastedText.trim()) return;
    simulateParsing(mode === "chat");
  };

  const handleUseSample = () => {
    if (mode === "chat") {
      setPastedText(mockChatText);
    } else {
      setPastedText(
        "2026年Q1产品路线图规划\n\n本文档详细阐述了2026年第一季度的产品战略方向...\n\n【核心目标】移动端用户日活提升40%...\n\n【Action Items】\n1. 完成移动端性能基准测试报告（前端组，1月15日）\n2. GPT-4o API 接入方案设计评审（AI组，1月20日）..."
      );
    }
  };

  const toggleScheduleAdded = (id: string) => {
    setChatResults((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const next = { ...r, added: !r.added };
          if (!r.added) onAddSchedule?.(next);
          return next;
        }
        return r;
      })
    );
  };

  const toggleActionItemAdded = (id: string) => {
    if (!docResult) return;
    const updated = {
      ...docResult,
      actionItems: docResult.actionItems.map((a) => {
        if (a.id === id) {
          const next = { ...a, added: !a.added };
          if (!a.added) onAddTask?.(next);
          return next;
        }
        return a;
      }),
    };
    setDocResult(updated);
  };

  const addAllSchedules = () => {
    setChatResults((prev) =>
      prev.map((r) => {
        if (!r.added) onAddSchedule?.({ ...r, added: true });
        return { ...r, added: true };
      })
    );
  };

  const addAllActionItems = () => {
    if (!docResult) return;
    const updated = {
      ...docResult,
      actionItems: docResult.actionItems.map((a) => {
        if (!a.added) onAddTask?.({ ...a, added: true });
        return { ...a, added: true };
      }),
    };
    setDocResult(updated);
  };

  const priorityColors: Record<string, string> = {
    high: "bg-red-50 text-red-600 border-red-200",
    medium: "bg-amber-50 text-amber-600 border-amber-200",
    low: "bg-green-50 text-green-600 border-green-200",
  };
  const priorityLabels: Record<string, string> = { high: "高", medium: "中", low: "低" };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-[3px]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 24 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-x-3 top-[2%] bottom-[2%] sm:inset-x-auto sm:left-1/2 sm:top-[4%] sm:bottom-[4%] sm:w-[calc(100%-3rem)] sm:max-w-3xl sm:-translate-x-1/2 z-[81] flex flex-col rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden"
          >
            {/* ───── Header ───── */}
            <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                  <ScanText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-[1rem] sm:text-[1.125rem]" style={{ fontWeight: 600 }}>
                    碎片信息解析
                  </h2>
                  <p className="text-[0.6875rem] sm:text-[0.75rem] text-muted-foreground">
                    截图识别 · 文档提取 · AI 智能结构化
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ───── Mode Tabs ───── */}
            <div className="flex shrink-0 border-b border-border/30 px-4 sm:px-6">
              {[
                { key: "chat" as ParseMode, label: "聊天截图", icon: MessageSquare, desc: "微信/群聊截图识别" },
                { key: "document" as ParseMode, label: "文档提取", icon: FileText, desc: "文章/PDF 摘要" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleModeSwitch(tab.key)}
                  className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-[0.75rem] sm:text-[0.8125rem] transition-colors ${
                    mode === tab.key ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={{ fontWeight: mode === tab.key ? 600 : 400 }}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                  {mode === tab.key && (
                    <motion.div
                      layoutId="parser-tab-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* ───── Content ───── */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <AnimatePresence mode="wait">
                {/* ═══ UPLOAD / INPUT AREA ═══ */}
                {(status === "idle" || status === "uploading" || status === "parsing") && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-4"
                  >
                    {/* Upload zone */}
                    {status === "idle" && (
                      <>
                        <div
                          onDrop={onDrop}
                          onDragOver={onDragOver}
                          onDragLeave={onDragLeave}
                          onClick={() => fileInputRef.current?.click()}
                          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-12 cursor-pointer transition-all ${
                            dragOver
                              ? "border-primary bg-primary/5 scale-[1.01]"
                              : "border-border/50 bg-muted/20 hover:border-primary/40 hover:bg-muted/30"
                          }`}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept={mode === "chat" ? "image/*" : "image/*,.pdf,.txt,.doc,.docx,.md"}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleFileSelect(f);
                            }}
                          />
                          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl mb-4 transition-colors ${
                            dragOver ? "bg-primary/10" : "bg-muted/50"
                          }`}>
                            {mode === "chat" ? (
                              <ImageIcon className={`h-6 w-6 ${dragOver ? "text-primary" : "text-muted-foreground/60"}`} />
                            ) : (
                              <FileText className={`h-6 w-6 ${dragOver ? "text-primary" : "text-muted-foreground/60"}`} />
                            )}
                          </div>
                          <div className="text-[0.875rem] text-foreground mb-1" style={{ fontWeight: 500 }}>
                            {dragOver ? "松手上传" : mode === "chat" ? "拖拽聊天截图到这里" : "拖拽文档到这里"}
                          </div>
                          <div className="text-[0.75rem] text-muted-foreground">
                            {mode === "chat"
                              ? "支持 PNG、JPG 格式 · 最大 10MB"
                              : "支持 PDF、TXT、DOC、MD 格式 · 最大 20MB"}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4 rounded-xl text-[0.75rem] gap-1.5"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                          >
                            <Upload className="h-3 w-3" /> 选择文件
                          </Button>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-border/40" />
                          <span className="text-[0.6875rem] text-muted-foreground/60">或者</span>
                          <div className="flex-1 h-px bg-border/40" />
                        </div>

                        {/* Text paste area */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[0.8125rem] text-foreground" style={{ fontWeight: 500 }}>
                              {mode === "chat" ? "粘贴聊天记录文本" : "粘贴文章内容"}
                            </label>
                            <button
                              onClick={handleUseSample}
                              className="text-[0.6875rem] text-primary hover:text-primary/80 transition-colors"
                              style={{ fontWeight: 500 }}
                            >
                              使用示例文本
                            </button>
                          </div>
                          <textarea
                            value={pastedText}
                            onChange={(e) => setPastedText(e.target.value)}
                            placeholder={
                              mode === "chat"
                                ? "将微信聊天记录、群接龙等文本粘贴到这里..."
                                : "将文章内容、会议纪要等文本粘贴到这里..."
                            }
                            className="w-full h-36 rounded-xl border border-border/50 bg-muted/10 p-3 text-[0.8125rem] placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 resize-none transition-all"
                          />
                          {pastedText.trim() && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <Button
                                onClick={handlePasteAndParse}
                                className="w-full rounded-xl bg-primary text-white hover:bg-primary/90 gap-2"
                              >
                                <Sparkles className="h-3.5 w-3.5" /> AI 解析
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Parsing progress */}
                    {(status === "uploading" || status === "parsing") && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center py-12 sm:py-16"
                      >
                        {/* File preview */}
                        {file && (
                          <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/20 px-4 py-2.5 mb-6">
                            {file.preview ? (
                              <img
                                src={file.preview}
                                alt="preview"
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                <File className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <div className="text-[0.8125rem] truncate max-w-48" style={{ fontWeight: 500 }}>
                                {file.name}
                              </div>
                              <div className="text-[0.625rem] text-muted-foreground">
                                {formatFileSize(file.size)}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Animation */}
                        <div className="relative mb-6">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
                          >
                            <BrainCircuit className="h-7 w-7 text-primary" />
                          </motion.div>
                          <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-2xl bg-primary/10"
                          />
                        </div>

                        <div className="text-[0.9375rem] text-foreground mb-1" style={{ fontWeight: 600 }}>
                          {status === "uploading" ? "正在上传..." : "AI 正在解析中"}
                        </div>
                        <p className="text-[0.75rem] text-muted-foreground mb-4">
                          {mode === "chat"
                            ? "识别时间、地点、人物信息"
                            : "提取摘要和可执行任务"}
                        </p>

                        <div className="w-64 sm:w-80">
                          <Progress value={parseProgress} className="h-2" />
                          <div className="flex justify-between mt-1.5 text-[0.625rem] text-muted-foreground">
                            <span>
                              {status === "uploading"
                                ? "上传文件"
                                : parseProgress < 40
                                ? "文字识别"
                                : parseProgress < 70
                                ? "语义分析"
                                : parseProgress < 95
                                ? "结构化提取"
                                : "生成结果"}
                            </span>
                            <span>{Math.round(parseProgress)}%</span>
                          </div>
                        </div>

                        {/* Step indicators */}
                        <div className="flex items-center gap-2 mt-6">
                          {["OCR", "NLP", "结构化", "完成"].map((step, i) => {
                            const active =
                              i === 0
                                ? parseProgress >= 0
                                : i === 1
                                ? parseProgress >= 30
                                : i === 2
                                ? parseProgress >= 60
                                : parseProgress >= 95;
                            return (
                              <div key={step} className="flex items-center gap-2">
                                <div
                                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[0.5rem] transition-colors ${
                                    active
                                      ? "bg-primary text-white"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                  style={{ fontWeight: 600 }}
                                >
                                  {active && parseProgress >= (i === 3 ? 100 : (i + 1) * 30) ? (
                                    <CircleCheck className="h-3 w-3" />
                                  ) : active ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    i + 1
                                  )}
                                </div>
                                <span
                                  className={`text-[0.5625rem] ${
                                    active ? "text-foreground" : "text-muted-foreground/50"
                                  }`}
                                  style={{ fontWeight: active ? 500 : 400 }}
                                >
                                  {step}
                                </span>
                                {i < 3 && <div className={`w-6 h-px ${active ? "bg-primary/40" : "bg-border/40"}`} />}
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* ═══ CHAT PARSE RESULTS ═══ */}
                {status === "done" && mode === "chat" && (
                  <motion.div
                    key="chat-results"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Summary header */}
                    <div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200/50 p-3 sm:p-4">
                      <CircleCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-[0.8125rem] text-emerald-700" style={{ fontWeight: 600 }}>
                          解析完成 · 提取 {chatResults.length} 条日程
                        </div>
                        <p className="text-[0.75rem] text-emerald-600/70 mt-0.5">
                          已从聊天记录中识别出以下时间、地点和人物信息。
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={addAllSchedules}
                        disabled={chatResults.every((r) => r.added)}
                        className="rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-[0.6875rem] h-7 gap-1 shrink-0"
                      >
                        <Plus className="h-3 w-3" /> 全部加入
                      </Button>
                    </div>

                    {/* Result cards */}
                    {chatResults.map((result, i) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`rounded-xl border overflow-hidden transition-all ${
                          result.added
                            ? "border-emerald-200/60 bg-emerald-50/30"
                            : "border-border/40 bg-white"
                        }`}
                      >
                        {/* Card header */}
                        <div className="flex items-center gap-3 px-3 sm:px-4 py-3 border-b border-border/20">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                            <CalendarDays className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[0.875rem]" style={{ fontWeight: 600 }}>{result.title}</div>
                            <div className="text-[0.6875rem] text-muted-foreground mt-0.5 line-clamp-1">
                              {result.summary}
                            </div>
                          </div>
                          {result.added ? (
                            <Badge className="bg-emerald-100 text-emerald-600 text-[0.5625rem] gap-0.5 shrink-0">
                              <CircleCheck className="h-2.5 w-2.5" /> 已加入
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => toggleScheduleAdded(result.id)}
                              className="rounded-lg bg-primary text-white hover:bg-primary/90 text-[0.6875rem] h-7 gap-1 shrink-0"
                            >
                              <Plus className="h-3 w-3" /> 加入日程
                            </Button>
                          )}
                        </div>

                        {/* Extracted info */}
                        <div className="px-3 sm:px-4 py-3 space-y-2.5">
                          {/* Time */}
                          {result.times.map((t, j) => (
                            <div key={j} className="flex items-center gap-2.5">
                              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-50">
                                <Clock className="h-3 w-3 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="text-[0.8125rem]" style={{ fontWeight: 500 }}>
                                  {format(t.date, "M月d日 EEEE", { locale: zhCN })}
                                  {t.startTime && ` · ${t.startTime}`}
                                  {t.endTime && ` – ${t.endTime}`}
                                </div>
                                <div className="text-[0.625rem] text-muted-foreground">
                                  原文：「{t.text}」 · 置信度 {Math.round(t.confidence * 100)}%
                                </div>
                              </div>
                              <div
                                className={`h-1.5 w-1.5 rounded-full ${
                                  t.confidence > 0.9 ? "bg-emerald-500" : t.confidence > 0.8 ? "bg-amber-500" : "bg-red-500"
                                }`}
                              />
                            </div>
                          ))}

                          {/* People */}
                          {result.people.length > 0 && (
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-50">
                                <Users className="h-3 w-3 text-purple-600" />
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {result.people.map((p, j) => (
                                  <span
                                    key={j}
                                    className="inline-flex items-center gap-0.5 rounded-md bg-muted/50 px-1.5 py-0.5 text-[0.6875rem]"
                                  >
                                    {p.name}
                                    {p.role && (
                                      <span className="text-muted-foreground/60">({p.role})</span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Location */}
                          {result.locations.length > 0 && (
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50">
                                <MapPin className="h-3 w-3 text-emerald-600" />
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {result.locations.map((l, j) => (
                                  <span key={j} className="text-[0.8125rem]" style={{ fontWeight: 500 }}>
                                    {l.name}
                                    {l.type && (
                                      <Badge
                                        variant="secondary"
                                        className="ml-1.5 text-[0.5rem] px-1"
                                      >
                                        {l.type === "online" ? "线上" : "线下"}
                                      </Badge>
                                    )}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {/* Parse another */}
                    <button
                      onClick={resetState}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 py-3 text-[0.8125rem] text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> 继续解析新内容
                    </button>
                  </motion.div>
                )}

                {/* ═══ DOCUMENT PARSE RESULTS ═══ */}
                {status === "done" && mode === "document" && docResult && (
                  <motion.div
                    key="doc-results"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Document summary */}
                    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
                      <div className="px-3 sm:px-4 py-3 border-b border-border/20 bg-muted/20">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-[0.875rem]" style={{ fontWeight: 600 }}>
                            {docResult.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[0.6875rem] text-muted-foreground">
                          <span>{docResult.wordCount.toLocaleString()} 字</span>
                          <span>·</span>
                          <span>{docResult.readingTime}</span>
                        </div>
                      </div>

                      {/* AI Summary */}
                      <div className="px-3 sm:px-4 py-3 space-y-3">
                        <div>
                          <div className="flex items-center gap-1.5 text-[0.75rem] text-primary mb-1.5" style={{ fontWeight: 600 }}>
                            <Sparkles className="h-3 w-3" /> AI 摘要
                          </div>
                          <p className="text-[0.8125rem] text-foreground leading-relaxed">
                            {docResult.summary}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 text-[0.75rem] text-foreground mb-2" style={{ fontWeight: 600 }}>
                            <Tag className="h-3 w-3 text-muted-foreground" /> 关键要点
                          </div>
                          <div className="space-y-1.5">
                            {docResult.keyPoints.map((point, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-start gap-2 text-[0.8125rem]"
                              >
                                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary text-[0.5625rem] shrink-0 mt-0.5" style={{ fontWeight: 700 }}>
                                  {i + 1}
                                </div>
                                <span className="text-muted-foreground leading-relaxed">{point}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Items */}
                    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
                      <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-border/20 bg-muted/20">
                        <div className="flex items-center gap-2">
                          <ListTodo className="h-4 w-4 text-amber-600" />
                          <span className="text-[0.875rem]" style={{ fontWeight: 600 }}>
                            提取的待办事项
                          </span>
                          <Badge variant="secondary" className="text-[0.5625rem]">
                            {docResult.actionItems.length} 项
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={addAllActionItems}
                          disabled={docResult.actionItems.every((a) => a.added)}
                          className="rounded-lg bg-primary text-white hover:bg-primary/90 text-[0.6875rem] h-7 gap-1"
                        >
                          <Plus className="h-3 w-3" /> 全部加入
                        </Button>
                      </div>

                      <div className="divide-y divide-border/20">
                        {docResult.actionItems.map((item, i) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`flex items-center gap-3 px-3 sm:px-4 py-3 transition-colors ${
                              item.added ? "bg-emerald-50/30" : "hover:bg-muted/20"
                            }`}
                          >
                            {/* Priority */}
                            <Badge
                              variant="outline"
                              className={`text-[0.5rem] px-1 py-0 h-4 shrink-0 ${priorityColors[item.priority]}`}
                            >
                              {priorityLabels[item.priority]}
                            </Badge>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                              <div className={`text-[0.8125rem] ${item.added ? "line-through text-muted-foreground" : ""}`} style={{ fontWeight: 500 }}>
                                {item.text}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[0.625rem] text-muted-foreground">
                                {item.deadline && (
                                  <span className="flex items-center gap-0.5">
                                    <Clock className="h-2.5 w-2.5" /> {item.deadline}
                                  </span>
                                )}
                                {item.assignee && (
                                  <span className="flex items-center gap-0.5">
                                    <Users className="h-2.5 w-2.5" /> {item.assignee}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Add button */}
                            {item.added ? (
                              <Badge className="bg-emerald-100 text-emerald-600 text-[0.5625rem] gap-0.5 shrink-0">
                                <CircleCheck className="h-2.5 w-2.5" /> 已加入
                              </Badge>
                            ) : (
                              <button
                                onClick={() => toggleActionItemAdded(item.id)}
                                className="flex items-center gap-1 rounded-lg bg-primary/10 text-primary px-2 py-1 text-[0.6875rem] hover:bg-primary/20 transition-colors shrink-0"
                                style={{ fontWeight: 500 }}
                              >
                                <Plus className="h-3 w-3" /> 加入
                              </button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Parse another */}
                    <button
                      onClick={resetState}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 py-3 text-[0.8125rem] text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" /> 继续解析新内容
                    </button>
                  </motion.div>
                )}

                {/* Error state */}
                {status === "error" && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center py-16 text-center"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 mb-4">
                      <CircleAlert className="h-7 w-7 text-red-500" />
                    </div>
                    <div className="text-[0.9375rem] text-foreground" style={{ fontWeight: 600 }}>
                      解析失败
                    </div>
                    <p className="text-[0.8125rem] text-muted-foreground mt-1.5 max-w-xs">
                      无法识别文件内容，请检查文件格式或尝试粘贴文本。
                    </p>
                    <Button
                      onClick={resetState}
                      className="mt-4 rounded-xl bg-primary text-white hover:bg-primary/90"
                    >
                      重新上传
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}