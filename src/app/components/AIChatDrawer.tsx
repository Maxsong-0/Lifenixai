import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, X, PanelRightClose } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  time: string;
}

const initialChat: ChatMessage[] = [
  {
    id: "1",
    role: "ai",
    content:
      "你好！我是你的 Lifenix AI 助手。今天你有 6 个任务和 6 个日程安排。我可以帮你优化时间安排、管理任务优先级，或者回答任何问题。有什么需要帮忙的吗？",
    time: "09:00",
  },
];

const aiResponses: Record<string, string> = {
  default:
    "我理解了你的需求。让我帮你分析一下，给出最佳建议...\n\n基于你当前的任务和日程，我建议你：\n1. 优先完成高优先级任务\n2. 在会议间隙处理邮件\n3. 下午安排健身时间放松",
  任务: "根据你的任务列表，我建议按以下优先级处理：\n\n1. 首先完成「季度项目报告」- 这是最紧急的\n2. 14:00 参加团队周会\n3. 会后准备明天的演讲稿\n4. 晚间安排阅读和健身",
  日程: "你今天的日程安排得很满。我注意到 12:00-14:00 有一段空闲，建议利用这段时间吃午饭并处理一些简单任务。17:00 之后可以安排健身活动。",
  建议: "这里有几个提升效率的建议：\n\n1. 使用番茄工作法，每25分钟休息5分钟\n2. 把类似任务集中处理（批量回复邮件）\n3. 重要任务放在上午精力最充沛的时候\n4. 设置「免打扰」时段专注工作",
  你好: "你好！很高兴为你服务。今天是忙碌的一天，但别担心，我会帮你高效地完成所有任务。需要我帮你调整日程安排吗？",
};

interface AIChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function AIChatDrawer({ open, onClose }: AIChatDrawerProps) {
  const [chat, setChat] = useState<ChatMessage[]>(initialChat);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput.trim(),
      time: new Date().toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setChat((prev) => [...prev, userMsg]);

    const input = chatInput.trim();
    setChatInput("");
    setIsTyping(true);

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
        time: new Date().toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChat((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

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
              AI 助手
            </h3>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[0.6875rem] text-muted-foreground">在线</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
          title="收起面板"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
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
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-[0.8125rem] leading-relaxed whitespace-pre-line ${
                    msg.role === "ai"
                      ? "bg-muted/50 text-foreground"
                      : "bg-primary text-white"
                  }`}
                >
                  {msg.content}
                </div>
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
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick prompts */}
      <div className="shrink-0 border-t border-border/30 px-4 py-2">
        <div className="flex flex-wrap gap-1.5">
          {["优化日程", "任务优先级", "效率建议"].map((q) => (
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

      {/* Input */}
      <div className="shrink-0 border-t border-border/50 px-4 py-3">
        <div className="flex gap-2">
          <Input
            placeholder="向 AI 提问..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="rounded-xl text-[0.8125rem]"
          />
          <Button
            onClick={sendMessage}
            size="icon"
            className="shrink-0 rounded-xl bg-primary text-white hover:bg-primary/90 h-9 w-9"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </>
  );

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
            className="hidden md:flex shrink-0 flex-col border-l border-border/50 bg-white overflow-hidden"
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
              className="fixed inset-x-0 bottom-0 z-50 flex h-[85vh] flex-col rounded-t-2xl bg-white shadow-2xl md:hidden"
            >
              {chatContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
