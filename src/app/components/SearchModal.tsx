import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  X,
  ListTodo,
  CalendarDays,
  MessageSquare,
  BarChart3,
  Settings,
  HelpCircle,
  Clock,
  ArrowRight,
  FileText,
  Sparkles,
} from "lucide-react";

interface SearchResult {
  id: string;
  type: "task" | "event" | "help" | "setting" | "action";
  title: string;
  desc: string;
  icon: React.ElementType;
  iconColor: string;
}

const allResults: SearchResult[] = [
  { id: "1", type: "task", title: "完成季度项目报告", desc: "任务 · 高优先级 · 工作", icon: ListTodo, iconColor: "text-blue-500 bg-blue-50" },
  { id: "2", type: "task", title: "团队周会 14:00", desc: "任务 · 高优先级 · 会议", icon: ListTodo, iconColor: "text-blue-500 bg-blue-50" },
  { id: "3", type: "task", title: "健身 - 跑步30分钟", desc: "任务 · 低优先级 · 健康", icon: ListTodo, iconColor: "text-blue-500 bg-blue-50" },
  { id: "4", type: "task", title: "阅读《深度工作》第3章", desc: "任务 · 低优先级 · 学习", icon: ListTodo, iconColor: "text-blue-500 bg-blue-50" },
  { id: "5", type: "event", title: "晨间复盘 & 计划", desc: "日程 · 09:00 · 30min", icon: CalendarDays, iconColor: "text-purple-500 bg-purple-50" },
  { id: "6", type: "event", title: "产品评审会议", desc: "日程 · 10:00 · 1h", icon: CalendarDays, iconColor: "text-purple-500 bg-purple-50" },
  { id: "7", type: "event", title: "客户沟通电话", desc: "日程 · 16:00 · 30min", icon: CalendarDays, iconColor: "text-purple-500 bg-purple-50" },
  { id: "8", type: "action", title: "打开 AI 助手", desc: "快速操作 · 向AI提问", icon: MessageSquare, iconColor: "text-emerald-500 bg-emerald-50" },
  { id: "9", type: "action", title: "查看数据统计", desc: "快速操作 · 效率分析", icon: BarChart3, iconColor: "text-amber-500 bg-amber-50" },
  { id: "10", type: "setting", title: "个人资料设置", desc: "设置 · 修改昵称、邮箱", icon: Settings, iconColor: "text-gray-500 bg-gray-50" },
  { id: "11", type: "setting", title: "通知偏好设置", desc: "设置 · 管理通知方式", icon: Settings, iconColor: "text-gray-500 bg-gray-50" },
  { id: "12", type: "help", title: "如何创建任务？", desc: "帮助 · 快速上手指南", icon: HelpCircle, iconColor: "text-indigo-500 bg-indigo-50" },
  { id: "13", type: "help", title: "AI助手使用技巧", desc: "帮助 · 功能指南", icon: HelpCircle, iconColor: "text-indigo-500 bg-indigo-50" },
  { id: "14", type: "action", title: "让 AI 优化日程", desc: "快速操作 · 智能排程", icon: Sparkles, iconColor: "text-primary bg-primary/10" },
];

const recentSearches = ["项目报告", "团队周会", "AI 助手"];

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export function SearchModal({ open, onClose, onNavigate }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!open) {
          // parent should handle open
        } else {
          onClose();
        }
      }
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const filtered = query.trim()
    ? allResults.filter(
        (r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.desc.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelect = (result: SearchResult) => {
    if (result.type === "task" || result.type === "action") {
      if (result.title.includes("统计")) onNavigate?.("stats");
      else onNavigate?.("tasks");
    } else if (result.type === "event") {
      onNavigate?.("tasks");
    } else if (result.type === "setting") {
      onNavigate?.("settings");
    } else if (result.type === "help") {
      onNavigate?.("help");
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 top-[15%] z-[101] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2"
          >
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-2xl">
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3">
                <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜索任务、日程、设置..."
                  className="flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-muted-foreground/60"
                />
                <kbd className="hidden rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[0.6875rem] text-muted-foreground sm:inline-block">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[360px] overflow-y-auto p-2">
                {query.trim() === "" ? (
                  <>
                    {/* Recent searches */}
                    <div className="px-2 py-1.5">
                      <div className="mb-2 text-[0.75rem] text-muted-foreground" style={{ fontWeight: 500 }}>
                        最近搜索
                      </div>
                      {recentSearches.map((s) => (
                        <button
                          key={s}
                          onClick={() => setQuery(s)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.875rem] text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                        >
                          <Clock className="h-3.5 w-3.5" />
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="my-1 border-t border-border/30" />
                    {/* Quick actions */}
                    <div className="px-2 py-1.5">
                      <div className="mb-2 text-[0.75rem] text-muted-foreground" style={{ fontWeight: 500 }}>
                        快速操作
                      </div>
                      {allResults
                        .filter((r) => r.type === "action")
                        .map((r) => (
                          <button
                            key={r.id}
                            onClick={() => handleSelect(r)}
                            className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 hover:bg-muted/60 transition-colors"
                          >
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${r.iconColor}`}>
                              <r.icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="text-[0.875rem]" style={{ fontWeight: 500 }}>{r.title}</div>
                              <div className="text-[0.75rem] text-muted-foreground">{r.desc}</div>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                    </div>
                  </>
                ) : filtered.length > 0 ? (
                  <div className="px-1">
                    {filtered.map((r, i) => (
                      <motion.button
                        key={r.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => handleSelect(r)}
                        className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 hover:bg-muted/60 transition-colors"
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${r.iconColor}`}>
                          <r.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-[0.875rem]" style={{ fontWeight: 500 }}>{r.title}</div>
                          <div className="text-[0.75rem] text-muted-foreground">{r.desc}</div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                    <p className="text-[0.875rem] text-muted-foreground">没有找到相关结果</p>
                    <p className="mt-1 text-[0.75rem] text-muted-foreground/60">试试其他关键词</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border/50 px-4 py-2.5 text-[0.6875rem] text-muted-foreground">
                <span>输入关键词搜索</span>
                <div className="hidden items-center gap-1.5 sm:flex">
                  <kbd className="rounded border border-border/60 bg-muted/50 px-1.5 py-0.5">↑↓</kbd>
                  <span>导航</span>
                  <kbd className="ml-1 rounded border border-border/60 bg-muted/50 px-1.5 py-0.5">↵</kbd>
                  <span>选择</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}