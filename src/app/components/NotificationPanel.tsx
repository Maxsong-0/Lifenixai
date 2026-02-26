import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  ListTodo,
  CalendarDays,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Clock,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";

interface Notification {
  id: string;
  type: "task" | "calendar" | "ai" | "system" | "achievement";
  title: string;
  desc: string;
  time: string;
  read: boolean;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "ai",
    title: "AI 日程优化建议",
    desc: "检测到你下午有 2 小时空闲，建议安排深度工作任务。",
    time: "5 分钟前",
    read: false,
    icon: Sparkles,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
  {
    id: "2",
    type: "calendar",
    title: "会议即将开始",
    desc: "「产品评审会议」将在 15 分钟后开始。",
    time: "10 分钟前",
    read: false,
    icon: CalendarDays,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  {
    id: "3",
    type: "task",
    title: "任务到期提醒",
    desc: "「完成季度项目报告」今天到期，请及时完成。",
    time: "30 分钟前",
    read: false,
    icon: AlertCircle,
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
  },
  {
    id: "4",
    type: "achievement",
    title: "效率提升 12%",
    desc: "恭喜！你本周的任务完成效率比上周提升了 12%。",
    time: "1 小时前",
    read: true,
    icon: TrendingUp,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    id: "5",
    type: "task",
    title: "任务已完成",
    desc: "你已完成「回复客户邮件」任务，继续保持！",
    time: "2 小时前",
    read: true,
    icon: Check,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    id: "6",
    type: "system",
    title: "系统更新",
    desc: "Lifenix AI v2.1 已发布，新增语音提醒和团队协作功能。",
    time: "昨天",
    read: true,
    icon: Bell,
    iconColor: "text-gray-500",
    iconBg: "bg-gray-50",
  },
  {
    id: "7",
    type: "ai",
    title: "周报已生成",
    desc: "AI 已为你生成本周效率报告，点击查看详情。",
    time: "昨天",
    read: true,
    icon: Sparkles,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
  },
];

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayed = filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
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
            className="fixed inset-0 z-[90]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-full z-[91] mt-2 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border/50 bg-white shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <h3 className="text-[0.9375rem]" style={{ fontWeight: 600 }}>通知</h3>
                {unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[0.6875rem] text-white" style={{ fontWeight: 600 }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                    title="全部已读"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 border-b border-border/30 px-4 py-2">
              {(["all", "unread"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-[0.8125rem] transition-colors ${
                    filter === f
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/60"
                  }`}
                  style={{ fontWeight: filter === f ? 600 : 400 }}
                >
                  {f === "all" ? "全部" : `未读 (${unreadCount})`}
                </button>
              ))}
            </div>

            {/* Notification list */}
            <div className="max-h-[400px] overflow-y-auto">
              {displayed.length > 0 ? (
                <AnimatePresence initial={false}>
                  {displayed.map((n, i) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10, height: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      layout
                      className={`group relative flex gap-3 border-b border-border/20 px-5 py-3.5 transition-colors hover:bg-muted/30 ${
                        !n.read ? "bg-primary/[0.02]" : ""
                      }`}
                    >
                      {!n.read && (
                        <div className="absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
                      )}
                      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${n.iconBg}`}>
                        <n.icon className={`h-4 w-4 ${n.iconColor}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[0.8125rem]" style={{ fontWeight: n.read ? 400 : 600 }}>
                          {n.title}
                        </div>
                        <p className="mt-0.5 text-[0.75rem] text-muted-foreground leading-relaxed line-clamp-2">
                          {n.desc}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-[0.6875rem] text-muted-foreground/60">
                          <Clock className="h-3 w-3" />
                          {n.time}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-start gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.read && (
                          <button
                            onClick={() => markRead(n.id)}
                            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title="标为已读"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(n.id)}
                          className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="删除"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="py-12 text-center">
                  <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/20" />
                  <p className="text-[0.875rem] text-muted-foreground">
                    {filter === "unread" ? "没有未读通知" : "暂无通知"}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
