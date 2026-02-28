import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Send,
  X,
  PanelRightClose,
  Paperclip,
  Image as ImageIcon,
  FileText,
  File,
  Loader2,
  CircleCheck,
  Clock,
  MapPin,
  Users,
  ListTodo,
  CalendarDays,
  ScanText,
} from "lucide-react";
import { useLanguage } from "./LanguageContext";

/* ═══════════════ Types ═══════════════ */
interface ChatAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string; // base64 for images
}

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  time: string;
  attachments?: ChatAttachment[];
  /** AI-only: structured parse result rendered as rich card */
  parseResult?: ParseResult;
}

interface ParseResult {
  type: "chat-screenshot" | "document";
  items: ParseItem[];
  summary?: string;
}

interface ParseItem {
  id: string;
  kind: "schedule" | "task";
  text: string;
  meta?: string; // secondary info line
  added: boolean;
}

/* ═══════════════ Static Data ═══════════════ */
const aiResponses: Record<string, string> = {
  default:
    "我理解了你的需求。让我帮你分析一下，给出最佳建议...\n\n基于你当前的任务和日程，我建议你：\n1. 优先完成高优先级任务\n2. 在会议间隙处理邮件\n3. 下午安排健身时间放松",
  任务: "根据你的任务列表，我建议按以下优先级处理：\n\n1. 首先完成「季度项目报告」- 这是最紧急的\n2. 14:00 参加团队周会\n3. 会后准备明天的演讲稿\n4. 晚间安排阅读和健身",
  日程: "你今天的日程安排得很满。我注意到 12:00-14:00 有一段空闲，建议利用这段时间吃午饭并处理一些简单任务。17:00 之后可以安排健身活动。",
  建议: "这里有几个提升效率的建议：\n\n1. 使用番茄工作法，每25分钟休息5分钟\n2. 把类似任务集中处理（批量回复邮件）\n3. 重要任务放在上午精力最充沛的时候\n4. 设置「免打扰」时段专注工作",
  你好: "你好！很高兴为你服务。今天是忙碌的一天，但别担心，我会帮你高效地完成所有任务。需要我帮你调整日程安排吗？",
};

/** Mock parse results keyed by detected attachment type */
function mockImageParseResult(): ParseResult {
  return {
    type: "chat-screenshot",
    summary: "已识别聊天截图，提取到 3 条关键信息：",
    items: [
      { id: "p1", kind: "schedule", text: "项目评审会议 — 明天 15:00", meta: "B栋3楼大会议室 · 张总、李明、王华", added: false },
      { id: "p2", kind: "schedule", text: "团队聚餐 — 周五 19:00", meta: "海底捞（中关村店） · 8人已接龙", added: false },
      { id: "p3", kind: "task", text: "提交周报", meta: "截止：本周四下班前", added: false },
    ],
  };
}

function mockDocParseResult(fileName: string): ParseResult {
  return {
    type: "document",
    summary: `已解析「${fileName}」，提取摘要和待办事项：`,
    items: [
      { id: "d1", kind: "task", text: "完成移动端性能基准测试报告", meta: "高优先级 · 截止 1月15日 · 前端组", added: false },
      { id: "d2", kind: "task", text: "GPT-4o API 接入方案设计评审", meta: "高优先级 · 截止 1月20日 · AI组", added: false },
      { id: "d3", kind: "task", text: "企业版 SSO 集成开发", meta: "中优先级 · 截止 2月28日 · 后端组", added: false },
      { id: "d4", kind: "task", text: "教育行业客户需求调研", meta: "低优先级 · 截止 2月15日 · 产品组", added: false },
    ],
  };
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function nowTime() {
  return new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/* ═══════════════ Component ═══════════════ */
interface AIChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function AIChatDrawer({ open, onClose }: AIChatDrawerProps) {
  const { t } = useLanguage();
  const [chat, setChat] = useState<ChatMessage[]>(() => [{
    id: "1",
    role: "ai" as const,
    content: t("ai.welcome"),
    time: "09:00",
  }]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, isTyping]);

  /* ── helpers ── */
  const processFile = useCallback((file: File) => {
    const att: ChatAttachment = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      name: file.name,
      type: file.type,
      size: file.size,
    };

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        att.preview = reader.result as string;
        setPendingAttachments((prev) => [...prev, att]);
      };
      reader.readAsDataURL(file);
    } else {
      setPendingAttachments((prev) => [...prev, att]);
    }
  }, []);

  const removePending = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  /* ── send ── */
  const sendMessage = () => {
    const hasText = chatInput.trim().length > 0;
    const hasAttachments = pendingAttachments.length > 0;
    if (!hasText && !hasAttachments) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput.trim(),
      time: nowTime(),
      attachments: hasAttachments ? [...pendingAttachments] : undefined,
    };
    setChat((prev) => [...prev, userMsg]);

    const inputText = chatInput.trim();
    const attachments = [...pendingAttachments];
    setChatInput("");
    setPendingAttachments([]);
    setIsTyping(true);

    // Determine response type based on attachments
    const hasImage = attachments.some((a) => a.type.startsWith("image/"));
    const hasDoc = attachments.some(
      (a) =>
        !a.type.startsWith("image/") ||
        a.name.match(/\.(pdf|doc|docx|txt|md)$/i)
    );

    setTimeout(() => {
      if (attachments.length > 0) {
        // Attachment-based AI response with parse result
        const isImage = hasImage && !hasDoc;
        const parseResult = isImage
          ? mockImageParseResult()
          : mockDocParseResult(attachments[0].name);

        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: "",
          time: nowTime(),
          parseResult,
        };
        setChat((prev) => [...prev, aiMsg]);
      } else {
        // Text-only response
        let response = aiResponses.default;
        for (const [key, val] of Object.entries(aiResponses)) {
          if (inputText.includes(key)) {
            response = val;
            break;
          }
        }
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: response,
          time: nowTime(),
        };
        setChat((prev) => [...prev, aiMsg]);
      }
      setIsTyping(false);
    }, hasAttachments ? 1500 : 800);
  };

  const toggleParseItemAdded = (msgId: string, itemId: string) => {
    setChat((prev) =>
      prev.map((m) => {
        if (m.id !== msgId || !m.parseResult) return m;
        return {
          ...m,
          parseResult: {
            ...m.parseResult,
            items: m.parseResult.items.map((it) =>
              it.id === itemId ? { ...it, added: !it.added } : it
            ),
          },
        };
      })
    );
  };

  /* ── drag & drop on chat area ── */
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      files.slice(0, 5).forEach(processFile);
    },
    [processFile]
  );

  /* ── render helpers ── */
  const attachmentIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-3.5 w-3.5" />;
    if (type.includes("pdf")) return <FileText className="h-3.5 w-3.5" />;
    return <File className="h-3.5 w-3.5" />;
  };

  /* ═══════════════ Chat Content ═══════════════ */
  const chatContent = (
    <>
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-[0.875rem]" style={{ fontWeight: 600 }}>
              {t("ai.title")}
            </h3>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[0.6875rem] text-muted-foreground">{t("ai.online")}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
          title={t("ai.collapsePanel")}
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        {/* Drag overlay */}
        <AnimatePresence>
          {dragOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-2 z-10 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/50 bg-primary/5 backdrop-blur-sm"
            >
              <Paperclip className="h-8 w-8 text-primary mb-2" />
              <span className="text-[0.875rem] text-primary" style={{ fontWeight: 600 }}>
                {t("ai.dropAttachment")}
              </span>
              <span className="text-[0.6875rem] text-primary/60 mt-0.5">
                {t("ai.dropHint")}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {chat.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] ${msg.role === "user" ? "order-1" : ""}`}>
                {/* Attachment thumbnails (user messages) */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mb-1.5 flex flex-wrap gap-1.5 justify-end">
                    {msg.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="rounded-xl overflow-hidden border border-white/20"
                      >
                        {att.preview ? (
                          <img
                            src={att.preview}
                            alt={att.name}
                            className="h-28 w-auto max-w-44 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="flex items-center gap-2 rounded-xl bg-primary/80 px-3 py-2">
                            {attachmentIcon(att.type)}
                            <div className="min-w-0">
                              <div
                                className="text-[0.6875rem] text-white truncate max-w-28"
                                style={{ fontWeight: 500 }}
                              >
                                {att.name}
                              </div>
                              <div className="text-[0.5625rem] text-white/60">
                                {formatFileSize(att.size)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Text bubble */}
                {msg.content && (
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-[0.8125rem] leading-relaxed whitespace-pre-line ${
                      msg.role === "ai"
                        ? "bg-muted/50 text-foreground"
                        : "bg-primary text-white"
                    }`}
                  >
                    {msg.content}
                  </div>
                )}

                {/* Parse result card (AI) */}
                {msg.parseResult && (
                  <div className="rounded-2xl border border-border/40 bg-card overflow-hidden mt-1">
                    {/* Parse header */}
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-primary/5 to-transparent border-b border-border/20">
                      <ScanText className="h-3.5 w-3.5 text-primary" />
                      <span
                        className="text-[0.75rem] text-primary"
                        style={{ fontWeight: 600 }}
                      >
                        {msg.parseResult.type === "chat-screenshot"
                          ? t("ai.chatParse")
                          : t("ai.docParse")}
                      </span>
                    </div>

                    {msg.parseResult.summary && (
                      <div className="px-3 py-2 text-[0.75rem] text-muted-foreground border-b border-border/10">
                        {msg.parseResult.summary}
                      </div>
                    )}

                    {/* Items */}
                    <div className="divide-y divide-border/10">
                      {msg.parseResult.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-start gap-2.5 px-3 py-2.5 transition-colors ${
                            item.added ? "bg-emerald-50/40" : "hover:bg-muted/20"
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                              item.kind === "schedule"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {item.kind === "schedule" ? (
                              <CalendarDays className="h-3 w-3" />
                            ) : (
                              <ListTodo className="h-3 w-3" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-[0.75rem] ${
                                item.added
                                  ? "line-through text-muted-foreground"
                                  : "text-foreground"
                              }`}
                              style={{ fontWeight: 500 }}
                            >
                              {item.text}
                            </div>
                            {item.meta && (
                              <div className="text-[0.625rem] text-muted-foreground/70 mt-0.5">
                                {item.meta}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => toggleParseItemAdded(msg.id, item.id)}
                            className={`shrink-0 mt-0.5 rounded-md px-1.5 py-0.5 text-[0.5625rem] transition-colors ${
                              item.added
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-primary/10 text-primary hover:bg-primary/20"
                            }`}
                            style={{ fontWeight: 500 }}
                          >
                            {item.added ? (
                              <span className="flex items-center gap-0.5">
                                <CircleCheck className="h-2.5 w-2.5" /> {t("ai.added")}
                              </span>
                            ) : (
                              t("ai.addItem")
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`mt-0.5 text-[0.625rem] text-muted-foreground/60 ${
                    msg.role === "user" ? "text-right" : ""
                  }`}
                >
                  {msg.time}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="rounded-2xl bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary/60" />
                <span className="text-[0.6875rem] text-muted-foreground">
                  {pendingAttachments.length === 0 && chat[chat.length - 1]?.attachments
                    ? t("ai.parsingAttachment")
                    : t("ai.typing")}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Pending attachments preview */}
      <AnimatePresence>
        {pendingAttachments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 overflow-hidden border-t border-border/30"
          >
            <div className="flex gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar">
              {pendingAttachments.map((att) => (
                <motion.div
                  key={att.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative shrink-0 group"
                >
                  {att.preview ? (
                    <img
                      src={att.preview}
                      alt={att.name}
                      className="h-16 w-16 rounded-xl object-cover border border-border/30"
                    />
                  ) : (
                    <div className="flex h-16 w-28 items-center gap-2 rounded-xl border border-border/30 bg-muted/30 px-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {attachmentIcon(att.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className="text-[0.625rem] truncate"
                          style={{ fontWeight: 500 }}
                        >
                          {att.name}
                        </div>
                        <div className="text-[0.5rem] text-muted-foreground">
                          {formatFileSize(att.size)}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Remove button */}
                  <button
                    onClick={() => removePending(att.id)}
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground/80 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick prompts */}
      {pendingAttachments.length === 0 && (
        <div className="shrink-0 border-t border-border/30 px-4 py-2">
          <div className="flex flex-wrap gap-1.5">
            {[t("ai.prompt.optimize"), t("ai.prompt.priority"), t("ai.prompt.efficiency")].map((q) => (
              <button
                key={q}
                onClick={() => setChatInput(q)}
                className="rounded-full border border-border/40 px-2.5 py-1 text-[0.6875rem] text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t border-border/50 px-4 py-3">
        <div className="flex items-end gap-2">
          {/* Attachment button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
            title={t("ai.addAttachment")}
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,.txt,.doc,.docx,.md"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              files.slice(0, 5).forEach(processFile);
              e.target.value = "";
            }}
          />

          <Input
            placeholder={
              pendingAttachments.length > 0
                ? t("ai.inputPlaceholderAtt")
                : t("ai.inputPlaceholder")
            }
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            className="rounded-xl text-[0.8125rem]"
          />
          <Button
            onClick={sendMessage}
            size="icon"
            disabled={!chatInput.trim() && pendingAttachments.length === 0}
            className="shrink-0 rounded-xl bg-primary text-white hover:bg-primary/90 h-9 w-9 disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
        {/* Hint line */}
        <div className="mt-1.5 flex items-center gap-1 text-[0.5625rem] text-muted-foreground/50">
          <Paperclip className="h-2.5 w-2.5" />
          <span>{t("ai.attachmentHint")}</span>
        </div>
      </div>
    </>
  );

  /* ═══════════════ Layout ═══════════════ */
  return (
    <>
      {/* ── Desktop: inline flex panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 340 }}
            exit={{ width: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="hidden md:flex shrink-0 flex-col border-l border-border/50 bg-card overflow-hidden"
            style={{ zIndex: 1 }}
          >
            <div className="flex h-full w-[340px] flex-col">{chatContent}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile: bottom sheet overlay ── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] md:hidden"
              onClick={onClose}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 flex h-[85vh] flex-col rounded-t-2xl bg-card shadow-2xl md:hidden"
            >
              {chatContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}