import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Progress } from "./ui/progress";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Video,
  Mic,
  MicOff,
  Play,
  Square,
  Users,
  Clock,
  ListTodo,
  CircleCheck,
  Sparkles,
  Crown,
  Link2,
  FileText,
  Copy,
  Download,
  ArrowRight,
  Plus,
  ExternalLink,
  Monitor,
  Phone,
  Loader2,
  Brain,
  MessageSquare,
  Zap,
  Settings,
  Timer,
} from "lucide-react";
import { format, addMinutes } from "date-fns";
import { zhCN } from "date-fns/locale";

/* ═══════════════ Types ═══════════════ */
interface MeetingPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  connected: boolean;
}

type RecordingStatus = "idle" | "recording" | "processing" | "done";

interface ExtractedTask {
  id: string;
  text: string;
  assignee: string;
  deadline?: string;
  added: boolean;
}

interface MeetingSummary {
  title: string;
  duration: string;
  participants: string[];
  keyDecisions: string[];
  actionItems: ExtractedTask[];
  transcript: string;
}

interface PastMeeting {
  id: string;
  title: string;
  date: Date;
  duration: string;
  platform: string;
  participants: number;
  hasRecording: boolean;
  hasSummary: boolean;
  tasksExtracted: number;
}

/* ═══════════════ Mock Data ═══════════════ */
const platforms: MeetingPlatform[] = [
  { id: "zoom", name: "Zoom", icon: "Z", color: "bg-blue-500", connected: false },
  { id: "teams", name: "Microsoft Teams", icon: "T", color: "bg-indigo-600", connected: false },
  { id: "meet", name: "Google Meet", icon: "M", color: "bg-emerald-600", connected: false },
  { id: "feishu", name: "飞书会议", icon: "飞", color: "bg-blue-600", connected: false },
];

const mockSummary: MeetingSummary = {
  title: "Q1 产品路线图评审",
  duration: "58 分钟",
  participants: ["张总", "李明", "王华", "赵丽", "刘洋"],
  keyDecisions: [
    "Q1 核心方向确定为移动端优化和 AI 深度集成",
    "企业版 SSO 功能推迟至 Q2，优先保证核心体验",
    "移动端改版设计稿需在 2 周内完成评审",
    "AI 功能引入多模态能力，支持图片和文档理解",
  ],
  actionItems: [
    { id: "mt1", text: "完成移动端性能基准测试并输出报告", assignee: "李明", deadline: "1月15日", added: false },
    { id: "mt2", text: "准备 GPT-4o API 接入方案评审 PPT", assignee: "王华", deadline: "1月20日", added: false },
    { id: "mt3", text: "协调设计团队启动移动端改版设计", assignee: "赵丽", deadline: "1月12日", added: false },
    { id: "mt4", text: "整理竞品移动端功能对比报告", assignee: "刘洋", deadline: "1月18日", added: false },
    { id: "mt5", text: "与安全团队确认 SOC2 认证时间线", assignee: "张总", deadline: "1月25日", added: false },
  ],
  transcript: `[00:00] 张总：大家好，今天主要讨论 Q1 的产品路线图。先请李明汇报一下移动端的现状。

[02:15] 李明：目前移动端日活 12 万，但留存率偏低。主要问题是加载速度和交互体验。我建议 Q1 重点优化性能，目标是日活提升 40%。

[05:30] 王华：AI 方面，GPT-4o 的多模态能力很适合我们。用户可以直接拍照识别待办事项，这个功能需求量很大。

[08:45] 赵丽：设计团队准备好了改版方案，主要改善导航结构和视觉层次。预计 2 周内完成评审。

[15:20] 张总：企业版 SSO 的优先级我们再讨论一下。考虑到资源限制...

[22:00] 张总：那决定了——SSO 推到 Q2，Q1 集中力量做移动端和 AI。

[35:10] 刘洋：我来整理一份竞品分析，看看移动端有哪些 best practices 可以参考。

[48:00] 张总：好，总结一下今天的决议和分工...`,
};

const pastMeetings: PastMeeting[] = [
  { id: "pm1", title: "Q1 产品路线图评审", date: new Date(), duration: "58 分钟", platform: "Zoom", participants: 5, hasRecording: true, hasSummary: true, tasksExtracted: 5 },
  { id: "pm2", title: "前端架构讨论", date: new Date(Date.now() - 86400000), duration: "42 分钟", platform: "Teams", participants: 3, hasRecording: true, hasSummary: true, tasksExtracted: 3 },
  { id: "pm3", title: "客户需求 Sync", date: new Date(Date.now() - 172800000), duration: "35 分钟", platform: "Google Meet", participants: 4, hasRecording: false, hasSummary: false, tasksExtracted: 0 },
  { id: "pm4", title: "Sprint 回顾", date: new Date(Date.now() - 345600000), duration: "1 小时 10 分钟", platform: "飞书", participants: 8, hasRecording: true, hasSummary: true, tasksExtracted: 7 },
];

/* ═══════════════ Component ═══════════════ */
interface MeetingAssistantProps {
  open: boolean;
  onClose: () => void;
}

export function MeetingAssistant({ open, onClose }: MeetingAssistantProps) {
  const [tab, setTab] = useState<"platforms" | "live" | "history">("platforms");
  const [platfs, setPlatfs] = useState(platforms);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>("idle");
  const [recordingTime, setRecordingTime] = useState(0);
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [autoRecord, setAutoRecord] = useState(true);
  const [autoExtractTasks, setAutoExtractTasks] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  const connectedCount = platfs.filter((p) => p.connected).length;

  const handleConnect = (id: string) => {
    setConnectingId(id);
    setTimeout(() => {
      setPlatfs((prev) =>
        prev.map((p) => (p.id === id ? { ...p, connected: true } : p))
      );
      setConnectingId(null);
    }, 1500);
  };

  const handleDisconnect = (id: string) => {
    setPlatfs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, connected: false } : p))
    );
  };

  const startRecording = () => {
    setRecordingStatus("recording");
    setRecordingTime(0);
    setSummary(null);
    const timer = setInterval(() => {
      setRecordingTime((t) => t + 1);
    }, 1000);
    // Store timer for cleanup
    (window as any).__meetingTimer = timer;
  };

  const stopRecording = () => {
    if ((window as any).__meetingTimer) {
      clearInterval((window as any).__meetingTimer);
    }
    setRecordingStatus("processing");
    setTimeout(() => {
      setRecordingStatus("done");
      setSummary(mockSummary);
    }, 3000);
  };

  const toggleTaskAdded = (id: string) => {
    if (!summary) return;
    setSummary({
      ...summary,
      actionItems: summary.actionItems.map((t) =>
        t.id === id ? { ...t, added: !t.added } : t
      ),
    });
  };

  const addAllTasks = () => {
    if (!summary) return;
    setSummary({
      ...summary,
      actionItems: summary.actionItems.map((t) => ({ ...t, added: true })),
    });
  };

  const formatRecTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const viewPastMeetingSummary = (id: string) => {
    setSelectedMeeting(id);
    setSummary(mockSummary);
    setRecordingStatus("done");
    setTab("live");
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
            className="fixed inset-x-3 top-[2%] bottom-[2%] sm:inset-x-auto sm:left-1/2 sm:top-[4%] sm:bottom-[4%] sm:w-[calc(100%-3rem)] sm:max-w-3xl sm:-translate-x-1/2 z-[81] flex flex-col rounded-2xl border border-border/50 bg-white shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10">
                  <Video className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[1rem] sm:text-[1.125rem]" style={{ fontWeight: 600 }}>
                      会议辅助
                    </h2>
                    <Badge className="bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 text-[0.5625rem] gap-0.5 border border-amber-200/50">
                      <Crown className="h-2.5 w-2.5" /> Pro
                    </Badge>
                  </div>
                  <p className="text-[0.6875rem] sm:text-[0.75rem] text-muted-foreground">
                    一键入会 · AI 会议摘要 · 自动提取任务
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

            {/* Tab bar */}
            <div className="flex shrink-0 border-b border-border/30 px-4 sm:px-6">
              {[
                { key: "platforms" as const, label: "平台集成" },
                { key: "live" as const, label: "实时记录" },
                { key: "history" as const, label: "历史会议" },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => setTab(p.key)}
                  className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-[0.75rem] sm:text-[0.8125rem] transition-colors ${
                    tab === p.key ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={{ fontWeight: tab === p.key ? 600 : 400 }}
                >
                  {p.label}
                  {p.key === "live" && recordingStatus === "recording" && (
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                  {tab === p.key && (
                    <motion.div
                      layoutId="meeting-tab-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* ═══ PLATFORMS ═══ */}
                {tab === "platforms" && (
                  <motion.div
                    key="platforms"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 sm:p-6 space-y-4"
                  >
                    {/* Pro banner */}
                    <div className="flex items-start gap-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/40 p-3 sm:p-4">
                      <Crown className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[0.8125rem] text-amber-700" style={{ fontWeight: 600 }}>
                          Pro 专属功能
                        </div>
                        <p className="text-[0.75rem] text-muted-foreground mt-0.5 leading-relaxed">
                          会议辅助是 Pro 版特权功能。连接会议平台后，AI 将自动记录会议、生成摘要，并提取分配给你的待办任务。
                        </p>
                      </div>
                    </div>

                    {/* Platform cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {platfs.map((p, idx) => (
                        <motion.div
                          key={p.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`rounded-xl border p-4 transition-all ${
                            p.connected ? "border-border/40 bg-white" : "border-dashed border-border/60 bg-muted/20"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl ${p.color} text-white text-[0.875rem] shrink-0`}
                              style={{ fontWeight: 700 }}
                            >
                              {p.icon}
                            </div>
                            <div className="flex-1">
                              <div className="text-[0.875rem]" style={{ fontWeight: 600 }}>{p.name}</div>
                              <div className="text-[0.6875rem] text-muted-foreground">
                                {p.connected ? "已集成 · 可一键入会" : "点击连接以启用"}
                              </div>
                            </div>
                          </div>
                          {p.connected ? (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-emerald-50 text-emerald-600 text-[0.5625rem]">
                                <CircleCheck className="mr-0.5 h-2.5 w-2.5" /> 已连接
                              </Badge>
                              <div className="flex-1" />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDisconnect(p.id)}
                                className="rounded-lg text-[0.6875rem] text-red-500 border-red-200 hover:bg-red-50 h-7 px-2"
                              >
                                断开
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleConnect(p.id)}
                              disabled={connectingId === p.id}
                              className="w-full rounded-lg bg-primary text-white hover:bg-primary/90 text-[0.75rem] gap-1.5 h-8"
                            >
                              {connectingId === p.id ? (
                                <><Loader2 className="h-3 w-3 animate-spin" /> 连接中...</>
                              ) : (
                                <><Link2 className="h-3 w-3" /> 连接 {p.name}</>
                              )}
                            </Button>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Settings */}
                    <div className="rounded-xl border border-border/30 bg-muted/10 p-4 space-y-3">
                      <div className="text-[0.8125rem]" style={{ fontWeight: 600 }}>
                        <Settings className="inline h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        自动化设置
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-white border border-border/20 p-3">
                        <div>
                          <div className="text-[0.8125rem]" style={{ fontWeight: 500 }}>自动录制会议</div>
                          <div className="text-[0.6875rem] text-muted-foreground">入会后自动开始 AI 语音记录</div>
                        </div>
                        <Switch checked={autoRecord} onCheckedChange={setAutoRecord} />
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-white border border-border/20 p-3">
                        <div>
                          <div className="text-[0.8125rem]" style={{ fontWeight: 500 }}>自动提取任务</div>
                          <div className="text-[0.6875rem] text-muted-foreground">会后自动将分配给你的任务加入待办</div>
                        </div>
                        <Switch checked={autoExtractTasks} onCheckedChange={setAutoExtractTasks} />
                      </div>
                    </div>

                    {/* Feature cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { icon: Mic, label: "语音识别", desc: "实时语音转文字", color: "text-blue-600 bg-blue-50" },
                        { icon: Brain, label: "AI 摘要", desc: "自动生成会议纪要", color: "text-purple-600 bg-purple-50" },
                        { icon: ListTodo, label: "任务提取", desc: "识别待办自动加入", color: "text-amber-600 bg-amber-50" },
                      ].map((f) => (
                        <div key={f.label} className="rounded-xl border border-border/30 p-3 text-center">
                          <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${f.color.split(" ")[1]}`}>
                            <f.icon className={`h-4 w-4 ${f.color.split(" ")[0]}`} />
                          </div>
                          <div className="text-[0.8125rem]" style={{ fontWeight: 600 }}>{f.label}</div>
                          <div className="text-[0.6875rem] text-muted-foreground mt-0.5">{f.desc}</div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ═══ LIVE RECORDING ═══ */}
                {tab === "live" && (
                  <motion.div
                    key="live"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 sm:p-6"
                  >
                    {/* Recording controls */}
                    {recordingStatus === "idle" && (
                      <div className="flex flex-col items-center py-12 sm:py-16 text-center">
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 mb-6"
                        >
                          <Mic className="h-9 w-9 text-primary" />
                        </motion.div>
                        <div className="text-[1.125rem] mb-1" style={{ fontWeight: 600 }}>
                          准备记录会议
                        </div>
                        <p className="text-[0.875rem] text-muted-foreground max-w-sm mb-6">
                          开始录制后，AI 将实时转录语音并在会后自动生成摘要和待办事项。
                        </p>
                        <Button
                          onClick={startRecording}
                          className="rounded-xl bg-red-500 text-white hover:bg-red-600 gap-2 px-8 h-11"
                        >
                          <div className="h-3 w-3 rounded-full bg-white animate-pulse" />
                          开始录制
                        </Button>
                        <p className="text-[0.6875rem] text-muted-foreground/50 mt-3">
                          也可以加入 Zoom/Teams 会议后自动开始录制
                        </p>
                      </div>
                    )}

                    {recordingStatus === "recording" && (
                      <div className="flex flex-col items-center py-10 text-center">
                        {/* Recording indicator */}
                        <div className="relative mb-6">
                          <motion.div
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute inset-0 rounded-3xl bg-red-500/20"
                          />
                          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500">
                            <Mic className="h-9 w-9 text-white" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-[1.125rem] text-red-600" style={{ fontWeight: 600 }}>
                            录制中
                          </span>
                        </div>
                        <div className="text-[2rem] text-foreground mb-2 font-mono" style={{ fontWeight: 700 }}>
                          {formatRecTime(recordingTime)}
                        </div>

                        {/* Live waveform simulation */}
                        <div className="flex items-end gap-0.5 h-8 mb-6">
                          {Array.from({ length: 20 }).map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{ height: [4, Math.random() * 28 + 4, 4] }}
                              transition={{ duration: 0.6 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.05 }}
                              className="w-1 rounded-full bg-red-400/60"
                            />
                          ))}
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            onClick={stopRecording}
                            variant="outline"
                            className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 gap-2"
                          >
                            <Square className="h-3.5 w-3.5" /> 结束录制
                          </Button>
                        </div>

                        <p className="text-[0.6875rem] text-muted-foreground/60 mt-4">
                          AI 正在实时转录语音 · 结束后将自动生成摘要
                        </p>
                      </div>
                    )}

                    {recordingStatus === "processing" && (
                      <div className="flex flex-col items-center py-16 text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6"
                        >
                          <Brain className="h-7 w-7 text-primary" />
                        </motion.div>
                        <div className="text-[1rem] mb-2" style={{ fontWeight: 600 }}>
                          AI 正在分析会议内容
                        </div>
                        <div className="w-64 space-y-3">
                          {["语音转文字", "主题提取", "任务识别", "生成摘要"].map((step, i) => (
                            <motion.div
                              key={step}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.6 }}
                              className="flex items-center gap-2"
                            >
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.6 + 0.3 }}
                              >
                                <CircleCheck className="h-4 w-4 text-emerald-500" />
                              </motion.div>
                              <span className="text-[0.8125rem] text-muted-foreground">{step}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ═══ SUMMARY RESULT ═══ */}
                    {recordingStatus === "done" && summary && (
                      <div className="space-y-4">
                        {/* Summary header */}
                        <div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200/50 p-3 sm:p-4">
                          <CircleCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-[0.875rem] text-emerald-700" style={{ fontWeight: 600 }}>
                              会议摘要已生成
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-[0.6875rem] text-emerald-600/70">
                              <span>时长 {summary.duration}</span>
                              <span>{summary.participants.length} 位参会者</span>
                              <span>{summary.actionItems.length} 项待办</span>
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <button className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-100 transition-colors" title="复制">
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-100 transition-colors" title="导出">
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Meeting info */}
                        <div className="rounded-xl border border-border/40 bg-white p-4">
                          <h3 className="text-[1rem] mb-3" style={{ fontWeight: 600 }}>{summary.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-[0.75rem] text-muted-foreground mb-4">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {summary.duration}</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {summary.participants.join("、")}</span>
                          </div>

                          {/* Key decisions */}
                          <div className="mb-4">
                            <div className="flex items-center gap-1.5 text-[0.8125rem] text-primary mb-2" style={{ fontWeight: 600 }}>
                              <Sparkles className="h-3.5 w-3.5" /> 关键决议
                            </div>
                            <div className="space-y-1.5">
                              {summary.keyDecisions.map((d, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.06 }}
                                  className="flex items-start gap-2"
                                >
                                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-[0.5625rem] mt-0.5" style={{ fontWeight: 700 }}>
                                    {i + 1}
                                  </div>
                                  <span className="text-[0.8125rem] text-muted-foreground leading-relaxed">{d}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>

                          {/* Transcript toggle */}
                          <button
                            onClick={() => setShowTranscript(!showTranscript)}
                            className="flex items-center gap-1.5 text-[0.75rem] text-muted-foreground hover:text-foreground transition-colors"
                            style={{ fontWeight: 500 }}
                          >
                            <MessageSquare className="h-3 w-3" />
                            {showTranscript ? "收起会议记录" : "查看完整会议记录"}
                          </button>
                          <AnimatePresence>
                            {showTranscript && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <pre className="mt-3 rounded-xl bg-muted/30 p-4 text-[0.75rem] text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                                  {summary.transcript}
                                </pre>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Action items */}
                        <div className="rounded-xl border border-border/40 bg-white overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-3 border-b border-border/20 bg-muted/20">
                            <div className="flex items-center gap-2">
                              <ListTodo className="h-4 w-4 text-amber-600" />
                              <span className="text-[0.875rem]" style={{ fontWeight: 600 }}>
                                提取的待办任务
                              </span>
                              <Badge variant="secondary" className="text-[0.5625rem]">
                                {summary.actionItems.length} 项
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              onClick={addAllTasks}
                              disabled={summary.actionItems.every((t) => t.added)}
                              className="rounded-lg bg-primary text-white hover:bg-primary/90 text-[0.6875rem] h-7 gap-1"
                            >
                              <Plus className="h-3 w-3" /> 全部加入
                            </Button>
                          </div>
                          <div className="divide-y divide-border/20">
                            {summary.actionItems.map((task, i) => (
                              <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                                  task.added ? "bg-emerald-50/30" : "hover:bg-muted/20"
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div
                                    className={`text-[0.8125rem] ${task.added ? "line-through text-muted-foreground" : ""}`}
                                    style={{ fontWeight: 500 }}
                                  >
                                    {task.text}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5 text-[0.625rem] text-muted-foreground">
                                    <span className="flex items-center gap-0.5">
                                      <Users className="h-2.5 w-2.5" /> {task.assignee}
                                    </span>
                                    {task.deadline && (
                                      <span className="flex items-center gap-0.5">
                                        <Clock className="h-2.5 w-2.5" /> {task.deadline}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {task.added ? (
                                  <Badge className="bg-emerald-100 text-emerald-600 text-[0.5625rem] gap-0.5 shrink-0">
                                    <CircleCheck className="h-2.5 w-2.5" /> 已加入
                                  </Badge>
                                ) : (
                                  <button
                                    onClick={() => toggleTaskAdded(task.id)}
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

                        {/* New recording button */}
                        <button
                          onClick={() => {
                            setRecordingStatus("idle");
                            setSummary(null);
                            setRecordingTime(0);
                            setShowTranscript(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 py-3 text-[0.8125rem] text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                        >
                          <Mic className="h-3.5 w-3.5" /> 录制新会议
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ═══ HISTORY ═══ */}
                {tab === "history" && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 sm:p-6 space-y-3"
                  >
                    {pastMeetings.map((meeting, idx) => (
                      <motion.div
                        key={meeting.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="rounded-xl border border-border/40 bg-white p-3 sm:p-4 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                            <Video className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[0.875rem]" style={{ fontWeight: 600 }}>{meeting.title}</div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[0.6875rem] text-muted-foreground">
                              <span>{format(meeting.date, "M月d日 EEEE", { locale: zhCN })}</span>
                              <span>{meeting.duration}</span>
                              <span>{meeting.platform}</span>
                              <span>{meeting.participants} 人</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              {meeting.hasSummary && (
                                <Badge className="bg-primary/10 text-primary text-[0.5625rem] gap-0.5">
                                  <FileText className="h-2.5 w-2.5" /> 摘要
                                </Badge>
                              )}
                              {meeting.hasRecording && (
                                <Badge className="bg-blue-50 text-blue-600 text-[0.5625rem] gap-0.5">
                                  <Mic className="h-2.5 w-2.5" /> 录音
                                </Badge>
                              )}
                              {meeting.tasksExtracted > 0 && (
                                <Badge className="bg-amber-50 text-amber-600 text-[0.5625rem] gap-0.5">
                                  <ListTodo className="h-2.5 w-2.5" /> {meeting.tasksExtracted} 项任务
                                </Badge>
                              )}
                            </div>
                          </div>
                          {meeting.hasSummary && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewPastMeetingSummary(meeting.id)}
                              className="shrink-0 rounded-lg text-[0.6875rem] h-7 gap-1"
                            >
                              查看 <ArrowRight className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
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