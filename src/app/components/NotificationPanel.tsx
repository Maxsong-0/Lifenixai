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
  CircleAlert,
  Clock,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "./LanguageContext";

interface Notification {
  id: string;
  type: "task" | "calendar" | "ai" | "system" | "achievement";
  titleKey: string;
  descKey: string;
  timeKey: string;
  read: boolean;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
}

function useNotificationData(): Notification[] {
  return [
    {
      id: "1", type: "ai",
      titleKey: "notif.ai.schedule.title", descKey: "notif.ai.schedule.desc", timeKey: "notif.ai.schedule.time",
      read: false, icon: Sparkles, iconColor: "text-primary", iconBg: "bg-primary/10",
    },
    {
      id: "2", type: "calendar",
      titleKey: "notif.calendar.meeting.title", descKey: "notif.calendar.meeting.desc", timeKey: "notif.calendar.meeting.time",
      read: false, icon: CalendarDays, iconColor: "text-blue-600", iconBg: "bg-blue-50",
    },
    {
      id: "3", type: "task",
      titleKey: "notif.task.due.title", descKey: "notif.task.due.desc", timeKey: "notif.task.due.time",
      read: false, icon: CircleAlert, iconColor: "text-red-500", iconBg: "bg-red-50",
    },
    {
      id: "4", type: "achievement",
      titleKey: "notif.achievement.title", descKey: "notif.achievement.desc", timeKey: "notif.achievement.time",
      read: true, icon: TrendingUp, iconColor: "text-emerald-600", iconBg: "bg-emerald-50",
    },
    {
      id: "5", type: "task",
      titleKey: "notif.task.done.title", descKey: "notif.task.done.desc", timeKey: "notif.task.done.time",
      read: true, icon: Check, iconColor: "text-emerald-600", iconBg: "bg-emerald-50",
    },
    {
      id: "6", type: "system",
      titleKey: "notif.system.update.title", descKey: "notif.system.update.desc", timeKey: "notif.system.update.time",
      read: true, icon: Bell, iconColor: "text-gray-500", iconBg: "bg-gray-50",
    },
    {
      id: "7", type: "ai",
      titleKey: "notif.ai.report.title", descKey: "notif.ai.report.desc", timeKey: "notif.ai.report.time",
      read: true, icon: Sparkles, iconColor: "text-primary", iconBg: "bg-primary/10",
    },
  ];
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState(useNotificationData);
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
            className="absolute right-0 top-full z-[91] mt-2 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border/50 bg-card shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <h3 className="text-[0.9375rem]" style={{ fontWeight: 600 }}>{t("notif.title")}</h3>
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
                    title={t("notif.markAllRead")}
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
                  {f === "all" ? t("notif.all") : `${t("notif.unread")} (${unreadCount})`}
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
                          {t(n.titleKey)}
                        </div>
                        <p className="mt-0.5 text-[0.75rem] text-muted-foreground leading-relaxed line-clamp-2">
                          {t(n.descKey)}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 text-[0.6875rem] text-muted-foreground/60">
                          <Clock className="h-3 w-3" />
                          {t(n.timeKey)}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-start gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.read && (
                          <button
                            onClick={() => markRead(n.id)}
                            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title={t("notif.markRead")}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(n.id)}
                          className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title={t("notif.delete")}
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
                    {filter === "unread" ? t("notif.noUnread") : t("notif.empty")}
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
