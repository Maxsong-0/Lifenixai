import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Send,
  Settings,
  X,
  Sparkles,
  Brain,
  Zap,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  ChevronDown,
  Plus,
  MessageSquare,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Type,
  Shield,
  Download,
  Mic,
  Image as ImageIcon,
  Paperclip,
  User,
  Hash,
  Sliders,
  CircleCheck,
  Star,
  Bookmark,
  Search,
  Pencil,
  Pin,
} from "lucide-react";
import { useLanguage } from "./LanguageContext";

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */
interface TCMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  model?: string;
  tokens?: number;
  liked?: boolean;
  bookmarked?: boolean;
  isStreaming?: boolean;
}

interface TCConversation {
  id: string;
  title: string;
  messages: TCMessage[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
  pinned?: boolean;
}

type TCModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  maxTokens: number;
  color: string;
};

type TCTheme = "system" | "light" | "dark";

interface TCSettings {
  theme: TCTheme;
  fontSize: "small" | "medium" | "large";
  sendWithEnter: boolean;
  showTokenCount: boolean;
  streamResponse: boolean;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  defaultModel: string;
  enableMarkdown: boolean;
  enableCodeHighlight: boolean;
  enableVoiceInput: boolean;
  autoTitle: boolean;
  saveHistory: boolean;
  apiProvider: "local" | "openai" | "openrouter" | "custom";
  apiKey: string;
  apiEndpoint: string;
  selectedModel: string;
}

/* ═══════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════ */
const MODELS: TCModel[] = [
  { id: "tc-4o", name: "ThinkClaw 4o", provider: "ThinkClaw", description: "最强旗舰多模态模型", maxTokens: 128000, color: "from-violet-500 to-purple-600" },
  { id: "tc-4o-mini", name: "ThinkClaw 4o-mini", provider: "ThinkClaw", description: "轻量快速，适合日常对话", maxTokens: 64000, color: "from-blue-500 to-cyan-500" },
  { id: "tc-reason", name: "ThinkClaw Reason", provider: "ThinkClaw", description: "深度推理，逐步思考", maxTokens: 128000, color: "from-amber-500 to-orange-500" },
  { id: "tc-code", name: "ThinkClaw Code", provider: "ThinkClaw", description: "专精代码生成与调试", maxTokens: 64000, color: "from-emerald-500 to-green-600" },
  { id: "tc-creative", name: "ThinkClaw Creative", provider: "ThinkClaw", description: "创意写作与头脑风暴", maxTokens: 64000, color: "from-pink-500 to-rose-500" },
];

const DEFAULT_SETTINGS: TCSettings = {
  theme: "system",
  fontSize: "medium",
  sendWithEnter: true,
  showTokenCount: true,
  streamResponse: true,
  systemPrompt: "你是 ThinkClaw，一个强大的 AI 助手。你善于深度思考、精确推理和创造性解决问题。",
  temperature: 0.7,
  maxTokens: 4096,
  defaultModel: "tc-4o",
  enableMarkdown: true,
  enableCodeHighlight: true,
  enableVoiceInput: false,
  autoTitle: true,
  saveHistory: true,
  apiProvider: "local",
  apiKey: "",
  apiEndpoint: "",
  selectedModel: "tc-4o",
};

const STORAGE_KEY_SETTINGS = "thinkclaw_settings";
const STORAGE_KEY_CONVERSATIONS = "thinkclaw_conversations";

/* ═══════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════ */
function loadSettings(): TCSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s: TCSettings) {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(s));
}

function loadConversations(): TCConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return arr.map((c: any) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      messages: c.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
    }));
  } catch {
    return [];
  }
}

function saveConversations(cs: TCConversation[]) {
  localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(cs));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(d: Date) {
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000 && now.getDate() === d.getDate()) return "今天";
  if (diff < 172800000) return "昨天";
  return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

/* Mock streaming AI response */
const MOCK_RESPONSES = [
  "这是一个很好的问题！让我仔细思考一下...\n\n首先，我们需要从几个不同的角度来分析这个问题：\n\n1. **技术层面**：当前的技术架构支持这样的实现，我们可以通过模块化设计来优化整体性能。\n\n2. **用户体验**：关键在于减少用户的认知负担，让操作流程更加直觉化。\n\n3. **可扩展性**：建议采用插件化架构，这样未来添加新功能时不会影响现有系统的稳定性。\n\n```typescript\n// 示例代码\ninterface Plugin {\n  name: string;\n  version: string;\n  init(): Promise<void>;\n  destroy(): void;\n}\n\nclass PluginManager {\n  private plugins: Map<string, Plugin> = new Map();\n  \n  async register(plugin: Plugin) {\n    await plugin.init();\n    this.plugins.set(plugin.name, plugin);\n  }\n}\n```\n\n总结来说，推荐分三个阶段来实施这个方案，先搭建基础框架，再逐步迭代优化。如果你有更具体的需求，我可以帮你进一步细化方案。",
  "好的，让我来帮你分析这个问题。\n\n## 核心分析\n\n从我的角度来看，这个问题的关键在于**平衡效率和灵活性**。\n\n### 方案对比\n\n| 方案 | 优点 | 缺点 | 推荐度 |\n|------|------|------|--------|\n| 方案A | 实现简单 | 扩展性差 | ★★★☆☆ |\n| 方案B | 性能优秀 | 复杂度高 | ★★★★☆ |\n| 方案C | 均衡全面 | 需要更多资源 | ★★★★★ |\n\n### 推荐路径\n\n我建议采用**方案C**，原因如下：\n\n- 长期维护成本最低\n- 用户满意度预期最高\n- 技术债务可控\n\n需要我进一步展开某个方案的具体实现细节吗？",
  "我来帮你整理一下思路！\n\n### 第一步：明确目标\n\n在开始任何项目之前，最重要的是清晰定义我们要解决的问题。建议使用 **SMART 原则**：\n\n- **S**pecific（具体的）\n- **M**easurable（可衡量的）\n- **A**chievable（可实现的）\n- **R**elevant（相关的）\n- **T**ime-bound（有时限的）\n\n### 第二步：拆解任务\n\n把大目标拆成小的可执行步骤：\n\n1. ~~收集需求~~ ✅\n2. 设计方案 → **进行中**\n3. 原型验证\n4. 开发实现\n5. 测试迭代\n\n### 第三步：设定里程碑\n\n> 💡 **小贴士**：每个里程碑都应该有一个明确的交付物，这样可以更容易衡量进度。\n\n需要我帮你创建一个详细的项目计划吗？我可以根据你的具体情况来定制。",
];

/* ═══════════════════════════════════════════
   ThinkClawPage
   ═══════════════════════════════════════════ */
export function ThinkClawPage() {
  const navigate = useNavigate();

  /* ── State ── */
  const [settings, setSettings] = useState<TCSettings>(loadSettings);
  const [conversations, setConversations] = useState<TCConversation[]>(loadConversations);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState(settings.defaultModel);
  const [showModelSelect, setShowModelSelect] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const modelSelectRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) ?? null;
  const currentModel = MODELS.find((m) => m.id === selectedModel) ?? MODELS[0];

  /* ── Persist ── */
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (settings.saveHistory) saveConversations(conversations);
  }, [conversations, settings.saveHistory]);

  /* ── Scroll to bottom ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  /* ── Click outside model select ── */
  useEffect(() => {
    if (!showModelSelect) return;
    const handler = (e: MouseEvent) => {
      if (modelSelectRef.current && !modelSelectRef.current.contains(e.target as Node)) {
        setShowModelSelect(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showModelSelect]);

  /* ── Focus input on conversation change ── */
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeConvId]);

  /* ── Handlers ── */
  const createConversation = useCallback(() => {
    const conv: TCConversation = {
      id: uid(),
      title: "新对话",
      messages: [],
      model: selectedModel,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveConvId(conv.id);
    setInputValue("");
  }, [selectedModel]);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveConvId((curr) => (curr === id ? null : curr));
  }, []);

  const togglePinConversation = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  }, []);

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const sendMessage = useCallback(() => {
    const text = inputValue.trim();
    if (!text || isStreaming) return;

    let convId = activeConvId;
    let convs = [...conversations];

    // Create new conversation if none active
    if (!convId) {
      const conv: TCConversation = {
        id: uid(),
        title: text.slice(0, 30) + (text.length > 30 ? "..." : ""),
        messages: [],
        model: selectedModel,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      convs = [conv, ...convs];
      convId = conv.id;
      setActiveConvId(convId);
    }

    const userMsg: TCMessage = {
      id: uid(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    // Update title if first message and autoTitle
    convs = convs.map((c) => {
      if (c.id === convId) {
        const isFirst = c.messages.length === 0;
        return {
          ...c,
          messages: [...c.messages, userMsg],
          updatedAt: new Date(),
          title: isFirst && settings.autoTitle ? text.slice(0, 30) + (text.length > 30 ? "..." : "") : c.title,
        };
      }
      return c;
    });

    setConversations(convs);
    setInputValue("");
    setIsStreaming(true);

    // Simulate AI streaming response
    const aiId = uid();
    const fullResponse = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    const tokenCount = Math.floor(fullResponse.length * 0.4);

    const aiMsg: TCMessage = {
      id: aiId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      model: currentModel.name,
      tokens: 0,
      isStreaming: true,
    };

    // Add placeholder AI message
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, aiMsg], updatedAt: new Date() }
            : c
        )
      );
    }, 400);

    // Stream characters
    let charIdx = 0;
    const streamInterval = setInterval(() => {
      charIdx += Math.floor(Math.random() * 4) + 2;
      if (charIdx >= fullResponse.length) {
        charIdx = fullResponse.length;
        clearInterval(streamInterval);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === aiId
                      ? { ...m, content: fullResponse, tokens: tokenCount, isStreaming: false }
                      : m
                  ),
                }
              : c
          )
        );
        setIsStreaming(false);
        return;
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === aiId ? { ...m, content: fullResponse.slice(0, charIdx) } : m
                ),
              }
            : c
        )
      );
    }, 25);
  }, [inputValue, isStreaming, activeConvId, conversations, selectedModel, currentModel, settings.autoTitle]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (settings.sendWithEnter && e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage, settings.sendWithEnter]
  );

  const clearConversation = useCallback(() => {
    if (!activeConvId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId ? { ...c, messages: [], updatedAt: new Date() } : c
      )
    );
  }, [activeConvId]);

  /* ── Filtered conversations ── */
  const filteredConvs = conversations
    .filter((c) => !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

  /* ═══════════════════════════════════════════
     Settings Overlay
     ═══════════════════════════════════════════ */
  const settingsOverlay = (
    <AnimatePresence>
      {showSettings && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-border/50 bg-white shadow-2xl flex flex-col">
              {/* Settings Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10">
                    <Settings className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-[1.125rem]" style={{ fontWeight: 700 }}>
                      ThinkClaw 设置
                    </h2>
                    <p className="text-[0.6875rem] text-muted-foreground">
                      自定义你的 AI 对话体验
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted/60 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Settings Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* ── Model & API ── */}
                <SettingsSection icon={Brain} title="模型与 API">
                  <SettingRow label="API 提供商" desc="选择模型服务来源">
                    <select
                      value={settings.apiProvider}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, apiProvider: e.target.value as TCSettings["apiProvider"] }))
                      }
                      className="rounded-lg border border-border/40 bg-white px-3 py-1.5 text-[0.8125rem] min-w-[140px]"
                    >
                      <option value="local">本地模拟</option>
                      <option value="openai">OpenAI</option>
                      <option value="openrouter">OpenRouter</option>
                      <option value="custom">自定义 API</option>
                    </select>
                  </SettingRow>

                  {settings.apiProvider !== "local" && (
                    <>
                      <SettingRow label="API Key" desc="用于鉴权的密钥">
                        <Input
                          type="password"
                          value={settings.apiKey}
                          onChange={(e) => setSettings((s) => ({ ...s, apiKey: e.target.value }))}
                          placeholder="sk-..."
                          className="max-w-[220px] h-8 text-[0.8125rem]"
                        />
                      </SettingRow>
                      {settings.apiProvider === "custom" && (
                        <SettingRow label="API 端点" desc="自定义 API 地址">
                          <Input
                            value={settings.apiEndpoint}
                            onChange={(e) => setSettings((s) => ({ ...s, apiEndpoint: e.target.value }))}
                            placeholder="https://api.example.com/v1"
                            className="max-w-[260px] h-8 text-[0.8125rem]"
                          />
                        </SettingRow>
                      )}
                    </>
                  )}

                  <SettingRow label="默认模型" desc="新对话默认使用的模型">
                    <select
                      value={settings.defaultModel}
                      onChange={(e) => setSettings((s) => ({ ...s, defaultModel: e.target.value }))}
                      className="rounded-lg border border-border/40 bg-white px-3 py-1.5 text-[0.8125rem] min-w-[180px]"
                    >
                      {MODELS.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </SettingRow>

                  <SettingRow label="Temperature" desc={`创造性控制 (${settings.temperature})`}>
                    <input
                      type="range"
                      min={0}
                      max={2}
                      step={0.1}
                      value={settings.temperature}
                      onChange={(e) => setSettings((s) => ({ ...s, temperature: parseFloat(e.target.value) }))}
                      className="w-32 accent-primary"
                    />
                  </SettingRow>

                  <SettingRow label="最大 Token 数" desc="单次回复的最大长度">
                    <select
                      value={settings.maxTokens}
                      onChange={(e) => setSettings((s) => ({ ...s, maxTokens: parseInt(e.target.value) }))}
                      className="rounded-lg border border-border/40 bg-white px-3 py-1.5 text-[0.8125rem] min-w-[120px]"
                    >
                      {[1024, 2048, 4096, 8192, 16384].map((v) => (
                        <option key={v} value={v}>{v.toLocaleString()}</option>
                      ))}
                    </select>
                  </SettingRow>

                  <SettingRow label="系统提示词" desc="自定义 AI 的角色和行为">
                    <div className="w-full mt-2">
                      <Textarea
                        value={settings.systemPrompt}
                        onChange={(e) => setSettings((s) => ({ ...s, systemPrompt: e.target.value }))}
                        rows={3}
                        className="text-[0.8125rem]"
                        placeholder="设定 AI 的角色、语气和行为..."
                      />
                    </div>
                  </SettingRow>
                </SettingsSection>

                {/* ── Chat Behavior ── */}
                <SettingsSection icon={MessageSquare} title="对话行为">
                  <SettingRow label="流式输出" desc="逐字显示 AI 回复">
                    <Switch
                      checked={settings.streamResponse}
                      onCheckedChange={(v) => setSettings((s) => ({ ...s, streamResponse: v }))}
                    />
                  </SettingRow>
                  <SettingRow label="Enter 发送" desc="按 Enter 直接发送，Shift+Enter 换行">
                    <Switch
                      checked={settings.sendWithEnter}
                      onCheckedChange={(v) => setSettings((s) => ({ ...s, sendWithEnter: v }))}
                    />
                  </SettingRow>
                  <SettingRow label="自动命名" desc="根据首条消息自动生成对话标题">
                    <Switch
                      checked={settings.autoTitle}
                      onCheckedChange={(v) => setSettings((s) => ({ ...s, autoTitle: v }))}
                    />
                  </SettingRow>
                  <SettingRow label="显示 Token 数" desc="在消息下方显示消耗的 token 数量">
                    <Switch
                      checked={settings.showTokenCount}
                      onCheckedChange={(v) => setSettings((s) => ({ ...s, showTokenCount: v }))}
                    />
                  </SettingRow>
                  <SettingRow label="保存历史" desc="将对话记录保存到本地">
                    <Switch
                      checked={settings.saveHistory}
                      onCheckedChange={(v) => setSettings((s) => ({ ...s, saveHistory: v }))}
                    />
                  </SettingRow>
                </SettingsSection>

                {/* ── Rendering ── */}
                <SettingsSection icon={Type} title="显示与渲染">
                  <SettingRow label="字体大小" desc="对话界面的文字大小">
                    <div className="flex gap-1">
                      {(["small", "medium", "large"] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => setSettings((s) => ({ ...s, fontSize: size }))}
                          className={`rounded-lg px-3 py-1 text-[0.75rem] transition-colors ${
                            settings.fontSize === size
                              ? "bg-primary text-white"
                              : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
                          }`}
                          style={{ fontWeight: settings.fontSize === size ? 600 : 400 }}
                        >
                          {{ small: "小", medium: "中", large: "大" }[size]}
                        </button>
                      ))}
                    </div>
                  </SettingRow>
                  <SettingRow label="Markdown 渲染" desc="解析并渲染 Markdown 格式">
                    <Switch
                      checked={settings.enableMarkdown}
                      onCheckedChange={(v) => setSettings((s) => ({ ...s, enableMarkdown: v }))}
                    />
                  </SettingRow>
                  <SettingRow label="代码高亮" desc="对代码块进行语法高亮">
                    <Switch
                      checked={settings.enableCodeHighlight}
                      onCheckedChange={(v) => setSettings((s) => ({ ...s, enableCodeHighlight: v }))}
                    />
                  </SettingRow>
                </SettingsSection>

                {/* ── Danger zone ── */}
                <SettingsSection icon={Shield} title="数据管理">
                  <div className="flex items-center justify-between rounded-xl border border-red-200/60 bg-red-50/30 p-4">
                    <div>
                      <div className="text-[0.8125rem] text-red-700" style={{ fontWeight: 600 }}>
                        清除所有对话
                      </div>
                      <div className="text-[0.6875rem] text-red-500/70 mt-0.5">
                        删除全部 {conversations.length} 个对话历史，此操作不可撤销
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("确定要清除所有对话历史吗？此操作不可撤销。")) {
                          setConversations([]);
                          setActiveConvId(null);
                        }
                      }}
                      className="rounded-lg border-red-200 text-red-600 hover:bg-red-50 text-[0.75rem] h-8 gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> 清除
                    </Button>
                  </div>
                  <SettingRow label="导出对话" desc="将对话历史导出为 JSON 文件">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(conversations, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `thinkclaw-export-${new Date().toISOString().slice(0, 10)}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="rounded-lg text-[0.75rem] h-8 gap-1"
                    >
                      <Download className="h-3 w-3" /> 导出
                    </Button>
                  </SettingRow>
                </SettingsSection>

                {/* ── About ── */}
                <div className="rounded-xl border border-border/30 bg-muted/10 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                      <Zap className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-[0.875rem]" style={{ fontWeight: 700 }}>ThinkClaw</span>
                    <Badge variant="secondary" className="text-[0.5625rem]">v1.0.0-beta</Badge>
                  </div>
                  <p className="text-[0.6875rem] text-muted-foreground">
                    由 Lifenix AI 团队打造 · 深度思考，精准行动
                  </p>
                </div>
              </div>

              {/* Settings Footer */}
              <div className="flex shrink-0 items-center justify-between border-t border-border/50 px-6 py-3 bg-muted/10">
                <button
                  onClick={() => {
                    setSettings(DEFAULT_SETTINGS);
                  }}
                  className="text-[0.75rem] text-muted-foreground hover:text-foreground transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  重置为默认
                </button>
                <Button
                  onClick={() => setShowSettings(false)}
                  className="rounded-lg bg-primary text-white hover:bg-primary/90 text-[0.8125rem] h-9 px-5"
                >
                  完成
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  /* ═══════════════════════════════════════════
     Font size class
     ═══════════════════════════════════════════ */
  const fontSizeClass = {
    small: "text-[0.8125rem]",
    medium: "text-[0.875rem]",
    large: "text-[0.9375rem]",
  }[settings.fontSize];

  /* ═══════════════════════════════════════════
     Main Render
     ═══════════════════════════════════════════ */
  return (
    <div className="fixed inset-0 z-0 flex flex-col bg-[#faf9ff]">
      {/* ── Top Bar ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/30 bg-white/80 backdrop-blur-xl px-3 sm:px-4 h-12 z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
            title="返回工作台"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 transition-colors hidden sm:flex"
          >
            {showSidebar ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>
          <div className="h-4 w-px bg-border/40 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Zap className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="text-[0.875rem] hidden sm:inline" style={{ fontWeight: 700 }}>
              ThinkClaw
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Model selector */}
          <div className="relative" ref={modelSelectRef}>
            <button
              onClick={() => setShowModelSelect(!showModelSelect)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.75rem] text-muted-foreground hover:bg-muted/40 transition-colors"
              style={{ fontWeight: 500 }}
            >
              <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${currentModel.color}`} />
              <span className="hidden sm:inline">{currentModel.name}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            <AnimatePresence>
              {showModelSelect && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-1.5 w-72 rounded-xl border border-border/40 bg-white shadow-xl overflow-hidden z-50"
                >
                  <div className="p-2 border-b border-border/20">
                    <div className="text-[0.6875rem] text-muted-foreground px-2 py-1" style={{ fontWeight: 600 }}>
                      选择模型
                    </div>
                  </div>
                  <div className="p-1.5 max-h-72 overflow-y-auto">
                    {MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedModel(m.id);
                          setShowModelSelect(false);
                        }}
                        className={`w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                          selectedModel === m.id ? "bg-primary/5" : "hover:bg-muted/40"
                        }`}
                      >
                        <div className={`mt-0.5 h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center`}>
                          <Zap className="h-3 w-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[0.8125rem]" style={{ fontWeight: 600 }}>{m.name}</span>
                            {selectedModel === m.id && <CircleCheck className="h-3.5 w-3.5 text-primary" />}
                          </div>
                          <p className="text-[0.6875rem] text-muted-foreground mt-0.5">{m.description}</p>
                          <div className="text-[0.5625rem] text-muted-foreground/60 mt-0.5">
                            最大 {(m.maxTokens / 1000).toFixed(0)}K tokens
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setShowSettings(true)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0">
        {/* ── Sidebar ── */}
        <AnimatePresence initial={false}>
          {showSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="hidden sm:flex shrink-0 flex-col border-r border-border/30 bg-white/60 overflow-hidden"
            >
              <div className="flex flex-col h-full" style={{ width: 280 }}>
                {/* New chat */}
                <div className="p-3">
                  <Button
                    onClick={createConversation}
                    className="w-full rounded-xl bg-primary text-white hover:bg-primary/90 text-[0.8125rem] h-9 gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" /> 新对话
                  </Button>
                </div>

                {/* Search */}
                <div className="px-3 pb-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜索对话..."
                      className="w-full rounded-lg border border-border/30 bg-muted/20 pl-8 pr-3 py-1.5 text-[0.75rem] outline-none focus:border-primary/30 transition-colors"
                    />
                  </div>
                </div>

                {/* Conversation list */}
                <div className="flex-1 overflow-y-auto px-2 pb-2">
                  {filteredConvs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <MessageSquare className="h-8 w-8 text-muted-foreground/20 mb-2" />
                      <p className="text-[0.75rem] text-muted-foreground/50">
                        {searchQuery ? "未找到匹配的对话" : "还没有对话"}
                      </p>
                    </div>
                  )}
                  {filteredConvs.map((conv) => (
                    <div
                      key={conv.id}
                      className={`group relative flex items-center gap-2 rounded-lg px-3 py-2.5 mb-0.5 cursor-pointer transition-colors ${
                        conv.id === activeConvId
                          ? "bg-primary/8 text-foreground"
                          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      }`}
                      onClick={() => {
                        setActiveConvId(conv.id);
                        setInputValue("");
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        {editingTitle === conv.id ? (
                          <input
                            autoFocus
                            value={editTitleValue}
                            onChange={(e) => setEditTitleValue(e.target.value)}
                            onBlur={() => {
                              setConversations((prev) =>
                                prev.map((c) =>
                                  c.id === conv.id ? { ...c, title: editTitleValue || "新对话" } : c
                                )
                              );
                              setEditingTitle(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-transparent text-[0.8125rem] outline-none border-b border-primary/30"
                            style={{ fontWeight: 500 }}
                          />
                        ) : (
                          <>
                            <div className="flex items-center gap-1">
                              {conv.pinned && <Pin className="h-2.5 w-2.5 text-primary/60 shrink-0" />}
                              <p className="text-[0.8125rem] truncate" style={{ fontWeight: 500 }}>
                                {conv.title}
                              </p>
                            </div>
                            <p className="text-[0.625rem] text-muted-foreground/60 mt-0.5">
                              {formatDate(conv.updatedAt)} · {conv.messages.length} 条消息
                            </p>
                          </>
                        )}
                      </div>
                      {editingTitle !== conv.id && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePinConversation(conv.id);
                            }}
                            className={`rounded p-1 transition-colors ${
                              conv.pinned ? "text-primary" : "text-muted-foreground/40 hover:text-muted-foreground"
                            }`}
                            title={conv.pinned ? "取消置顶" : "置顶"}
                          >
                            <Pin className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTitle(conv.id);
                              setEditTitleValue(conv.title);
                            }}
                            className="rounded p-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                            title="重命名"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv.id);
                            }}
                            className="rounded p-1 text-muted-foreground/40 hover:text-red-500 transition-colors"
                            title="删除"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main Chat Area ── */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {!activeConv || activeConv.messages.length === 0 ? (
              /* ── Empty state / Welcome ── */
              <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-lg"
                >
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-primary/20">
                    <Zap className="h-9 w-9 text-white" />
                  </div>
                  <h1 className="text-[1.5rem] sm:text-[1.75rem] mb-2" style={{ fontWeight: 800 }}>
                    ThinkClaw
                  </h1>
                  <p className="text-[0.875rem] text-muted-foreground mb-8 leading-relaxed">
                    深度思考，精准行动。问我任何问题，<br className="hidden sm:block" />
                    我将为你提供最佳解答。
                  </p>

                  {/* Quick starts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md mx-auto">
                    {[
                      { icon: Brain, text: "帮我分析这个技术方案的优劣", color: "text-violet-600 bg-violet-50" },
                      { icon: Sparkles, text: "写一份项目启动邮件", color: "text-amber-600 bg-amber-50" },
                      { icon: Hash, text: "解释 React 的并发渲染机制", color: "text-blue-600 bg-blue-50" },
                      { icon: Sliders, text: "制定一份 Q1 OKR 计划", color: "text-emerald-600 bg-emerald-50" },
                    ].map((q) => (
                      <button
                        key={q.text}
                        onClick={() => {
                          setInputValue(q.text);
                          inputRef.current?.focus();
                        }}
                        className="flex items-start gap-2.5 rounded-xl border border-border/30 bg-white p-3 text-left hover:border-primary/20 hover:shadow-sm transition-all"
                      >
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${q.color.split(" ")[1]}`}>
                          <q.icon className={`h-3.5 w-3.5 ${q.color.split(" ")[0]}`} />
                        </div>
                        <span className="text-[0.8125rem] text-muted-foreground leading-snug" style={{ fontWeight: 500 }}>
                          {q.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            ) : (
              /* ── Messages list ── */
              <div className="mx-auto max-w-3xl px-4 py-6 space-y-1">
                {activeConv.messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`group flex gap-3 py-4 ${msg.role === "user" ? "" : ""}`}
                  >
                    {/* Avatar */}
                    <div className="shrink-0 mt-0.5">
                      {msg.role === "user" ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                          <User className="h-3.5 w-3.5 text-primary" />
                        </div>
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                          <Zap className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[0.75rem]" style={{ fontWeight: 600 }}>
                          {msg.role === "user" ? "你" : "ThinkClaw"}
                        </span>
                        {msg.model && (
                          <Badge variant="secondary" className="text-[0.5625rem] py-0">
                            {msg.model}
                          </Badge>
                        )}
                        <span className="text-[0.625rem] text-muted-foreground/50">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>

                      {/* Message body */}
                      <div className={`${fontSizeClass} leading-relaxed text-foreground/90 whitespace-pre-wrap break-words`}>
                        {msg.content}
                        {msg.isStreaming && (
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                            className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
                          />
                        )}
                      </div>

                      {/* Footer actions */}
                      {msg.role === "assistant" && !msg.isStreaming && (
                        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="rounded-md p-1 text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/40 transition-colors"
                            title="复制"
                          >
                            {copiedId === msg.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setConversations((prev) =>
                                prev.map((c) =>
                                  c.id === activeConvId
                                    ? {
                                        ...c,
                                        messages: c.messages.map((m) =>
                                          m.id === msg.id ? { ...m, liked: !m.liked } : m
                                        ),
                                      }
                                    : c
                                )
                              );
                            }}
                            className={`rounded-md p-1 transition-colors ${
                              msg.liked
                                ? "text-amber-500"
                                : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/40"
                            }`}
                            title="点赞"
                          >
                            <Star className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setConversations((prev) =>
                                prev.map((c) =>
                                  c.id === activeConvId
                                    ? {
                                        ...c,
                                        messages: c.messages.map((m) =>
                                          m.id === msg.id ? { ...m, bookmarked: !m.bookmarked } : m
                                        ),
                                      }
                                    : c
                                )
                              );
                            }}
                            className={`rounded-md p-1 transition-colors ${
                              msg.bookmarked
                                ? "text-primary"
                                : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/40"
                            }`}
                            title="收藏"
                          >
                            <Bookmark className="h-3.5 w-3.5" />
                          </button>
                          {settings.showTokenCount && msg.tokens && (
                            <span className="text-[0.5625rem] text-muted-foreground/40 ml-1">
                              {msg.tokens} tokens
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* ── Input Area ── */}
          <div className="shrink-0 border-t border-border/20 bg-white/60 backdrop-blur-sm">
            <div className="mx-auto max-w-3xl px-4 py-3">
              {/* Active conversation context */}
              {activeConv && activeConv.messages.length > 0 && (
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-[0.6875rem] text-muted-foreground/50">
                    <MessageSquare className="h-3 w-3" />
                    <span>{activeConv.messages.length} 条消息</span>
                  </div>
                  <button
                    onClick={clearConversation}
                    className="text-[0.6875rem] text-muted-foreground/40 hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" /> 清空对话
                  </button>
                </div>
              )}

              {/* Input box */}
              <div className="relative rounded-2xl border border-border/40 bg-white shadow-sm focus-within:border-primary/30 focus-within:shadow-md focus-within:shadow-primary/5 transition-all">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入你的问题... (Shift+Enter 换行)"
                  rows={1}
                  className="w-full resize-none bg-transparent px-4 pt-3 pb-12 text-[0.875rem] outline-none placeholder:text-muted-foreground/40"
                  style={{
                    minHeight: "52px",
                    maxHeight: "200px",
                    fieldSizing: "content" as any,
                  }}
                  disabled={isStreaming}
                />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <div className="flex items-center gap-0.5">
                    <button
                      className="rounded-lg p-1.5 text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/40 transition-colors"
                      title="上传图片"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-lg p-1.5 text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/40 transition-colors"
                      title="上传文件"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-lg p-1.5 text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/40 transition-colors"
                      title="语音输入"
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={!inputValue.trim() || isStreaming}
                    size="sm"
                    className="rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-30 h-8 w-8 p-0"
                  >
                    {isStreaming ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              <p className="text-center text-[0.625rem] text-muted-foreground/30 mt-2">
                ThinkClaw 可能会犯错。请核实重要信息。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile sidebar toggle (bottom sheet style) ── */}
      <div className="sm:hidden fixed bottom-20 left-3 z-20">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-border/40 shadow-lg text-muted-foreground"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
      </div>

      {/* ── Mobile sidebar overlay ── */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="sm:hidden fixed inset-0 z-30 bg-black/30"
              onClick={() => setShowSidebar(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="sm:hidden fixed inset-y-0 left-0 z-40 w-[280px] flex flex-col border-r border-border/30 bg-white"
            >
              {/* Mobile sidebar header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-[0.875rem]" style={{ fontWeight: 700 }}>对话历史</span>
                </div>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted/40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* New chat */}
              <div className="p-3">
                <Button
                  onClick={() => {
                    createConversation();
                    setShowSidebar(false);
                  }}
                  className="w-full rounded-xl bg-primary text-white hover:bg-primary/90 text-[0.8125rem] h-9 gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> 新对话
                </Button>
              </div>

              {/* Mobile conversation list */}
              <div className="flex-1 overflow-y-auto px-2 pb-2">
                {filteredConvs.map((conv) => (
                  <div
                    key={conv.id}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 mb-0.5 cursor-pointer transition-colors ${
                      conv.id === activeConvId
                        ? "bg-primary/8 text-foreground"
                        : "text-muted-foreground hover:bg-muted/40"
                    }`}
                    onClick={() => {
                      setActiveConvId(conv.id);
                      setShowSidebar(false);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        {conv.pinned && <Pin className="h-2.5 w-2.5 text-primary/60 shrink-0" />}
                        <p className="text-[0.8125rem] truncate" style={{ fontWeight: 500 }}>
                          {conv.title}
                        </p>
                      </div>
                      <p className="text-[0.625rem] text-muted-foreground/60 mt-0.5">
                        {formatDate(conv.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="shrink-0 rounded p-1 text-muted-foreground/30 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settings overlay */}
      {settingsOverlay}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Helper Sub-components
   ═══════════════════════════════════════════ */
function SettingsSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/30 bg-white overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/20 bg-muted/10 px-4 py-3">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-[0.875rem]" style={{ fontWeight: 600 }}>{title}</span>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function SettingRow({
  label,
  desc,
  children,
}: {
  label: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-[0.8125rem]" style={{ fontWeight: 500 }}>{label}</div>
        <div className="text-[0.6875rem] text-muted-foreground">{desc}</div>
      </div>
      {children}
    </div>
  );
}
