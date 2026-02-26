import { useState, useMemo, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

import { motion, AnimatePresence } from "motion/react";
import {
  X,
  RefreshCw,
  Check,
  AlertTriangle,
  Clock,
  CalendarDays,
  ChevronRight,
  Link2,
  Unlink,
  Sparkles,
  Shield,
  Zap,
  Eye,
  EyeOff,
  Bell,
  ArrowUpDown,
} from "lucide-react";
import { format, isSameDay, addDays } from "date-fns";
import { zhCN } from "date-fns/locale";

/* ═══════════════ Types ═══════════════ */
export type CalendarSourceType = "google" | "apple" | "outlook" | "caldav" | "lifenix";

export interface CalendarSource {
  id: string;
  type: CalendarSourceType;
  name: string;
  email?: string;
  color: string;
  dotColor: string;
  icon: string; // emoji or letter
  connected: boolean;
  lastSync?: Date;
  eventCount?: number;
  visible: boolean;
}

export interface ExternalEvent {
  id: string;
  title: string;
  date: Date;
  startHour: number;
  duration: number;
  sourceId: string;
  sourceType: CalendarSourceType;
  color: string;
  location?: string;
  description?: string;
  isAllDay?: boolean;
  attendees?: string[];
  url?: string;
}

export interface ConflictInfo {
  eventA: ExternalEvent;
  eventB: ExternalEvent;
  overlapMinutes: number;
  severity: "warning" | "critical";
}

/* ═══════════════ Mock Data ═══════════════ */
const today = new Date();

const defaultSources: CalendarSource[] = [
  {
    id: "lifenix",
    type: "lifenix",
    name: "Lifenix AI",
    color: "bg-primary",
    dotColor: "bg-violet-500",
    icon: "✦",
    connected: true,
    lastSync: new Date(),
    eventCount: 12,
    visible: true,
  },
  {
    id: "google-main",
    type: "google",
    name: "Google Calendar",
    email: "user@gmail.com",
    color: "bg-blue-500",
    dotColor: "bg-blue-500",
    icon: "G",
    connected: false,
    visible: true,
  },
  {
    id: "apple-icloud",
    type: "apple",
    name: "iCloud 日历",
    email: "user@icloud.com",
    color: "bg-gray-700",
    dotColor: "bg-gray-600",
    icon: "",
    connected: false,
    visible: true,
  },
  {
    id: "outlook-work",
    type: "outlook",
    name: "Outlook (工作)",
    email: "user@company.com",
    color: "bg-sky-600",
    dotColor: "bg-sky-500",
    icon: "O",
    connected: false,
    visible: true,
  },
  {
    id: "caldav-custom",
    type: "caldav",
    name: "CalDAV 自定义",
    color: "bg-orange-500",
    dotColor: "bg-orange-500",
    icon: "C",
    connected: false,
    visible: true,
  },
];

const generateExternalEvents = (sources: CalendarSource[]): ExternalEvent[] => {
  const events: ExternalEvent[] = [];
  
  // Google Calendar mock events
  const googleSrc = sources.find((s) => s.id === "google-main");
  if (googleSrc?.connected) {
    events.push(
      {
        id: "g1", title: "产品周会", date: today, startHour: 10, duration: 1,
        sourceId: "google-main", sourceType: "google", color: "bg-blue-500",
        location: "Google Meet", attendees: ["张三", "李四", "王五"],
      },
      {
        id: "g2", title: "午餐 @ 王品", date: today, startHour: 12, duration: 1,
        sourceId: "google-main", sourceType: "google", color: "bg-blue-400",
        location: "王品牛排 · 大安店",
      },
      {
        id: "g3", title: "1:1 with Manager", date: today, startHour: 15, duration: 0.5,
        sourceId: "google-main", sourceType: "google", color: "bg-blue-600",
        location: "线上", attendees: ["经理"],
      },
      {
        id: "g4", title: "客户Demo", date: addDays(today, 1), startHour: 10, duration: 1.5,
        sourceId: "google-main", sourceType: "google", color: "bg-blue-500",
        location: "会议室 B", attendees: ["客户A", "客户B", "张三"],
      },
      {
        id: "g5", title: "Sprint Planning", date: addDays(today, 2), startHour: 9, duration: 2,
        sourceId: "google-main", sourceType: "google", color: "bg-blue-400",
        attendees: ["开发团队"],
      },
    );
  }

  // Apple Calendar mock events
  const appleSrc = sources.find((s) => s.id === "apple-icloud");
  if (appleSrc?.connected) {
    events.push(
      {
        id: "a1", title: "牙医预约", date: today, startHour: 14, duration: 1,
        sourceId: "apple-icloud", sourceType: "apple", color: "bg-gray-600",
        location: "美佳牙科诊所",
      },
      {
        id: "a2", title: "接孩子放学", date: today, startHour: 16.5, duration: 0.5,
        sourceId: "apple-icloud", sourceType: "apple", color: "bg-gray-500",
        location: "XX 小学",
      },
      {
        id: "a3", title: "家庭聚餐", date: addDays(today, 2), startHour: 18, duration: 2,
        sourceId: "apple-icloud", sourceType: "apple", color: "bg-gray-600",
        location: "家中",
      },
    );
  }

  // Outlook mock events
  const outlookSrc = sources.find((s) => s.id === "outlook-work");
  if (outlookSrc?.connected) {
    events.push(
      {
        id: "o1", title: "OKR 对齐会", date: today, startHour: 9.5, duration: 1,
        sourceId: "outlook-work", sourceType: "outlook", color: "bg-sky-500",
        location: "Teams", attendees: ["全部门"],
      },
      {
        id: "o2", title: "培训：安全合规", date: today, startHour: 14, duration: 1.5,
        sourceId: "outlook-work", sourceType: "outlook", color: "bg-sky-600",
        location: "培训教室 3F",
      },
      {
        id: "o3", title: "HR 面谈", date: addDays(today, 1), startHour: 14, duration: 0.5,
        sourceId: "outlook-work", sourceType: "outlook", color: "bg-sky-500",
      },
      {
        id: "o4", title: "部门团建方案讨论", date: addDays(today, 3), startHour: 15, duration: 1,
        sourceId: "outlook-work", sourceType: "outlook", color: "bg-sky-400",
        attendees: ["部门同事"],
      },
    );
  }

  return events;
};

/* ═══════════════ Conflict Detection ═══════════════ */
function detectConflicts(events: ExternalEvent[]): ConflictInfo[] {
  const conflicts: ConflictInfo[] = [];
  const sorted = [...events].sort((a, b) => {
    const dateDiff = a.date.getTime() - b.date.getTime();
    return dateDiff !== 0 ? dateDiff : a.startHour - b.startHour;
  });

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i];
      const b = sorted[j];
      if (!isSameDay(a.date, b.date)) continue;
      if (a.isAllDay || b.isAllDay) continue;

      const aEnd = a.startHour + a.duration;
      const bEnd = b.startHour + b.duration;
      
      if (a.startHour < bEnd && b.startHour < aEnd) {
        const overlapStart = Math.max(a.startHour, b.startHour);
        const overlapEnd = Math.min(aEnd, bEnd);
        const overlapMinutes = Math.round((overlapEnd - overlapStart) * 60);
        
        if (overlapMinutes > 0) {
          const fromDifferentSources = a.sourceId !== b.sourceId;
          conflicts.push({
            eventA: a,
            eventB: b,
            overlapMinutes,
            severity: overlapMinutes >= 30 || fromDifferentSources ? "critical" : "warning",
          });
        }
      }
    }
  }

  return conflicts;
}

/* ═══════════════ Helper ═══════════════ */
function formatHour(h: number): string {
  const hrs = Math.floor(h);
  const mins = Math.round((h % 1) * 60);
  return `${hrs.toString().padStart(2, "0")}:${mins === 0 ? "00" : mins.toString().padStart(2, "0")}`;
}

const sourceTypeDescription: Record<CalendarSourceType, string> = {
  google: "同步 Google Calendar 中的日程和提醒",
  apple: "同步 iCloud 日历与 Apple 设备事件",
  outlook: "同步 Microsoft Outlook 和 Teams 会议",
  caldav: "连接任意支持 CalDAV 协议的日历服务",
  lifenix: "Lifenix 内部日程引擎",
};

/* ═══════════════ Main Component ═══════════════ */
interface CalendarSyncProps {
  open: boolean;
  onClose: () => void;
  onEventsUpdate?: (events: ExternalEvent[]) => void;
  onConflictsUpdate?: (conflicts: ConflictInfo[]) => void;
}

export function CalendarSync({ open, onClose, onEventsUpdate, onConflictsUpdate }: CalendarSyncProps) {
  const [sources, setSources] = useState<CalendarSource[]>(defaultSources);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<"accounts" | "timeline" | "conflicts">("accounts");
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const externalEvents = useMemo(() => generateExternalEvents(sources), [sources]);
  const conflicts = useMemo(() => detectConflicts(externalEvents), [externalEvents]);

  const connectedCount = sources.filter((s) => s.connected).length;

  // Sync effect
  const handleConnect = (id: string) => {
    setConnectingId(id);
    // Simulate OAuth flow
    setTimeout(() => {
      setSources((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                connected: true,
                lastSync: new Date(),
                eventCount: Math.floor(Math.random() * 15) + 5,
              }
            : s
        )
      );
      setConnectingId(null);
    }, 1500);
  };

  const handleDisconnect = (id: string) => {
    setSources((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, connected: false, lastSync: undefined, eventCount: undefined }
          : s
      )
    );
  };

  const handleSync = (id: string) => {
    setSyncing(id);
    setTimeout(() => {
      setSources((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, lastSync: new Date() } : s
        )
      );
      setSyncing(null);
    }, 1200);
  };

  const handleSyncAll = () => {
    setSyncing("all");
    setTimeout(() => {
      setSources((prev) =>
        prev.map((s) =>
          s.connected ? { ...s, lastSync: new Date() } : s
        )
      );
      setSyncing(null);
    }, 2000);
  };

  const toggleVisibility = (id: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  };

  // Notify parent
  useEffect(() => {
    onEventsUpdate?.(externalEvents);
    onConflictsUpdate?.(conflicts);
  }, [externalEvents, conflicts]);

  // Group events by day for timeline
  const eventsByDay = useMemo(() => {
    const map = new Map<string, ExternalEvent[]>();
    const visibleSourceIds = new Set(sources.filter((s) => s.visible && s.connected).map((s) => s.id));
    
    externalEvents
      .filter((e) => visibleSourceIds.has(e.sourceId))
      .forEach((e) => {
        const key = format(e.date, "yyyy-MM-dd");
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(e);
      });
    
    // Sort events within each day
    map.forEach((evts) => evts.sort((a, b) => a.startHour - b.startHour));
    
    return map;
  }, [externalEvents, sources]);

  const getSourceById = (id: string) => sources.find((s) => s.id === id);

  const panels = [
    { key: "accounts" as const, label: "日历账号", count: connectedCount },
    { key: "timeline" as const, label: "聚合时间轴", count: externalEvents.length },
    { key: "conflicts" as const, label: "冲突检测", count: conflicts.length },
  ];

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-[3px]"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 24 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-x-3 top-[3%] bottom-[3%] sm:inset-x-auto sm:left-1/2 sm:top-[5%] sm:bottom-[5%] sm:w-[calc(100%-3rem)] sm:max-w-3xl sm:-translate-x-1/2 z-[81] flex flex-col rounded-2xl border border-border/50 bg-white shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Link2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-[1rem] sm:text-[1.125rem]" style={{ fontWeight: 600 }}>
                    跨平台日历聚合
                  </h2>
                  <p className="text-[0.6875rem] sm:text-[0.75rem] text-muted-foreground">
                    绑定外部日历 · 统一视图 · 智能冲突检测
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {connectedCount > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSyncAll}
                    disabled={syncing === "all"}
                    className="hidden sm:flex rounded-lg text-[0.75rem] gap-1.5"
                  >
                    <RefreshCw className={`h-3 w-3 ${syncing === "all" ? "animate-spin" : ""}`} />
                    全部同步
                  </Button>
                )}
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex shrink-0 border-b border-border/30 px-4 sm:px-6">
              {panels.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setActivePanel(p.key)}
                  className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-[0.75rem] sm:text-[0.8125rem] transition-colors ${
                    activePanel === p.key
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={{ fontWeight: activePanel === p.key ? 600 : 400 }}
                >
                  {p.label}
                  {p.count > 0 && (
                    <span
                      className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.5625rem] ${
                        p.key === "conflicts" && p.count > 0
                          ? "bg-red-100 text-red-600"
                          : activePanel === p.key
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      {p.count}
                    </span>
                  )}
                  {activePanel === p.key && (
                    <motion.div
                      layoutId="sync-tab-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* ═══ ACCOUNTS PANEL ═══ */}
                {activePanel === "accounts" && (
                  <motion.div
                    key="accounts"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 sm:p-6 space-y-3"
                  >
                    {/* Connection tip */}
                    <div className="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/15 p-3 sm:p-4">
                      <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[0.8125rem] text-primary" style={{ fontWeight: 600 }}>安全 OAuth 授权</div>
                        <p className="text-[0.75rem] text-muted-foreground mt-0.5 leading-relaxed">
                          Lifenix 使用 OAuth 2.0 协议进行授权，不会存储您的账号密码。日历数据仅在本地缓存，您可以随时取消授权。
                        </p>
                      </div>
                    </div>

                    {sources.map((source, idx) => (
                      <motion.div
                        key={source.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`rounded-xl border p-3 sm:p-4 transition-all ${
                          source.connected
                            ? "border-border/40 bg-white"
                            : "border-dashed border-border/60 bg-muted/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Icon */}
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${source.color} text-white text-[0.875rem] shrink-0`} style={{ fontWeight: 700 }}>
                            {source.icon}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[0.875rem] truncate" style={{ fontWeight: 600 }}>{source.name}</span>
                              {source.connected && (
                                <Badge className="bg-emerald-50 text-emerald-600 text-[0.5625rem] px-1.5">
                                  <Check className="mr-0.5 h-2.5 w-2.5" /> 已连接
                                </Badge>
                              )}
                            </div>
                            {source.email && (
                              <div className="text-[0.75rem] text-muted-foreground truncate">{source.email}</div>
                            )}
                            {!source.email && !source.connected && (
                              <div className="text-[0.75rem] text-muted-foreground">
                                {sourceTypeDescription[source.type]}
                              </div>
                            )}
                            {source.connected && source.lastSync && (
                              <div className="flex items-center gap-3 mt-1 text-[0.6875rem] text-muted-foreground/70">
                                <span>上次同步：{format(source.lastSync, "HH:mm")}</span>
                                {source.eventCount !== undefined && (
                                  <span>{source.eventCount} 个日程</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {source.connected && source.type !== "lifenix" && (
                              <>
                                <button
                                  onClick={() => toggleVisibility(source.id)}
                                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 transition-colors"
                                  title={source.visible ? "隐藏" : "显示"}
                                >
                                  {source.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                </button>
                                <button
                                  onClick={() => handleSync(source.id)}
                                  disabled={syncing === source.id}
                                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 transition-colors disabled:opacity-50"
                                  title="同步"
                                >
                                  <RefreshCw className={`h-3.5 w-3.5 ${syncing === source.id ? "animate-spin" : ""}`} />
                                </button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDisconnect(source.id)}
                                  className="rounded-lg text-[0.6875rem] text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 gap-1 h-7 px-2"
                                >
                                  <Unlink className="h-3 w-3" /> <span className="hidden sm:inline">断开</span>
                                </Button>
                              </>
                            )}
                            {!source.connected && source.type !== "lifenix" && (
                              <Button
                                size="sm"
                                onClick={() => handleConnect(source.id)}
                                disabled={connectingId === source.id}
                                className="rounded-lg bg-primary text-white hover:bg-primary/90 text-[0.75rem] gap-1.5 h-8"
                              >
                                {connectingId === source.id ? (
                                  <>
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                    授权中...
                                  </>
                                ) : (
                                  <>
                                    <Link2 className="h-3 w-3" />
                                    连接
                                  </>
                                )}
                              </Button>
                            )}
                            {source.type === "lifenix" && (
                              <Badge variant="secondary" className="text-[0.625rem]">内建</Badge>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* ═══ UNIFIED TIMELINE PANEL ═══ */}
                {activePanel === "timeline" && (
                  <motion.div
                    key="timeline"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 sm:p-6"
                  >
                    {externalEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <CalendarDays className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <div className="text-[0.9375rem] text-muted-foreground" style={{ fontWeight: 500 }}>
                          暂无外部日程
                        </div>
                        <p className="text-[0.8125rem] text-muted-foreground/60 mt-1">
                          请先连接至少一个外部日历账号
                        </p>
                        <Button
                          size="sm"
                          className="mt-4 rounded-xl bg-primary text-white hover:bg-primary/90"
                          onClick={() => setActivePanel("accounts")}
                        >
                          <Link2 className="mr-1.5 h-3.5 w-3.5" /> 连接日历
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Source filter chips */}
                        <div className="flex flex-wrap gap-2">
                          {sources
                            .filter((s) => s.connected)
                            .map((s) => (
                              <button
                                key={s.id}
                                onClick={() => toggleVisibility(s.id)}
                                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem] transition-all ${
                                  s.visible
                                    ? "border-border/50 bg-white shadow-sm"
                                    : "border-transparent bg-muted/30 text-muted-foreground/50 line-through"
                                }`}
                                style={{ fontWeight: 500 }}
                              >
                                <div className={`h-2 w-2 rounded-full ${s.dotColor} ${!s.visible ? "opacity-30" : ""}`} />
                                {s.name}
                              </button>
                            ))}
                        </div>

                        {/* Day groups */}
                        {Array.from(eventsByDay.entries()).map(([dateStr, dayEvents]) => {
                          const date = new Date(dateStr);
                          const dayConflicts = conflicts.filter(
                            (c) => isSameDay(c.eventA.date, date) || isSameDay(c.eventB.date, date)
                          );
                          return (
                            <div key={dateStr}>
                              <div className="flex items-center gap-2 mb-3">
                                <div
                                  className={`text-[0.8125rem] ${
                                    isSameDay(date, today) ? "text-primary" : "text-foreground"
                                  }`}
                                  style={{ fontWeight: 600 }}
                                >
                                  {isSameDay(date, today)
                                    ? "今天"
                                    : isSameDay(date, addDays(today, 1))
                                    ? "明天"
                                    : format(date, "M月d日 EEEE", { locale: zhCN })}
                                </div>
                                <div className="flex-1 h-px bg-border/40" />
                                <Badge variant="secondary" className="text-[0.625rem]">
                                  {dayEvents.length} 项
                                </Badge>
                                {dayConflicts.length > 0 && (
                                  <Badge className="bg-red-50 text-red-600 text-[0.625rem] gap-0.5">
                                    <AlertTriangle className="h-2.5 w-2.5" />
                                    {dayConflicts.length} 个冲突
                                  </Badge>
                                )}
                              </div>

                              <div className="space-y-1.5">
                                {dayEvents.map((event, i) => {
                                  const source = getSourceById(event.sourceId);
                                  const isConflict = conflicts.some(
                                    (c) => c.eventA.id === event.id || c.eventB.id === event.id
                                  );

                                  return (
                                    <motion.div
                                      key={event.id}
                                      initial={{ opacity: 0, x: -8 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: i * 0.03 }}
                                      className={`group flex items-center gap-3 rounded-xl border px-3 py-2.5 sm:px-4 sm:py-3 transition-all hover:shadow-sm ${
                                        isConflict
                                          ? "border-red-200 bg-red-50/50"
                                          : "border-border/30 bg-white hover:border-border/60"
                                      }`}
                                    >
                                      {/* Time */}
                                      <div className="w-16 sm:w-20 shrink-0 text-right">
                                        <div className="text-[0.8125rem]" style={{ fontWeight: 600 }}>
                                          {formatHour(event.startHour)}
                                        </div>
                                        <div className="text-[0.625rem] text-muted-foreground">
                                          {event.duration}h
                                        </div>
                                      </div>

                                      {/* Color bar */}
                                      <div className={`w-1 self-stretch rounded-full ${event.color}`} />

                                      {/* Content */}
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-[0.8125rem] truncate" style={{ fontWeight: 500 }}>
                                            {event.title}
                                          </span>
                                          {isConflict && (
                                            <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          {source && (
                                            <span className="flex items-center gap-1 text-[0.625rem] text-muted-foreground">
                                              <div className={`h-1.5 w-1.5 rounded-full ${source.dotColor}`} />
                                              {source.name}
                                            </span>
                                          )}
                                          {event.location && (
                                            <span className="text-[0.625rem] text-muted-foreground truncate">
                                              · {event.location}
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Attendees */}
                                      {event.attendees && event.attendees.length > 0 && (
                                        <div className="hidden sm:flex items-center -space-x-1 shrink-0">
                                          {event.attendees.slice(0, 3).map((name, j) => (
                                            <div
                                              key={j}
                                              className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[0.5rem] border border-white"
                                              style={{ fontWeight: 600 }}
                                              title={name}
                                            >
                                              {name.charAt(0)}
                                            </div>
                                          ))}
                                          {event.attendees.length > 3 && (
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/80 text-[0.5rem] border border-white" style={{ fontWeight: 600 }}>
                                              +{event.attendees.length - 3}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ═══ CONFLICTS PANEL ═══ */}
                {activePanel === "conflicts" && (
                  <motion.div
                    key="conflicts"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 sm:p-6"
                  >
                    {conflicts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 mb-4">
                          <Check className="h-7 w-7 text-emerald-500" />
                        </div>
                        <div className="text-[0.9375rem] text-foreground" style={{ fontWeight: 600 }}>
                          没有时间冲突
                        </div>
                        <p className="text-[0.8125rem] text-muted-foreground/60 mt-1.5 max-w-xs">
                          {externalEvents.length > 0
                            ? "太棒了！您所有日历的日程安排没有重叠冲突。"
                            : "连接更多日历账号后，系统会自动检测跨平台日程冲突。"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Summary */}
                        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200/50 p-3 sm:p-4">
                          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <div className="text-[0.8125rem] text-red-700" style={{ fontWeight: 600 }}>
                              检测到 {conflicts.length} 个时间冲突
                            </div>
                            <p className="text-[0.75rem] text-red-600/70 mt-0.5">
                              以下日程存在时间重叠，建议调整以避免冲突。
                            </p>
                          </div>
                        </div>

                        {/* AI suggestion */}
                        <div className="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/15 p-3 sm:p-4">
                          <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <div>
                            <div className="text-[0.8125rem] text-primary" style={{ fontWeight: 600 }}>
                              AI 智能建议
                            </div>
                            <p className="text-[0.75rem] text-muted-foreground mt-0.5 leading-relaxed">
                              检测到部分冲突来自不同平台的日程。建议：1）将「
                              {conflicts[0]?.eventA.title}」调整为线上参加；2）利用 AI 排期功能重新规划时间段。
                            </p>
                            <Button
                              size="sm"
                              className="mt-2 rounded-lg bg-primary text-white hover:bg-primary/90 text-[0.75rem] h-7 gap-1"
                            >
                              <Zap className="h-3 w-3" /> 一键优化排期
                            </Button>
                          </div>
                        </div>

                        {/* Conflict list */}
                        {conflicts.map((conflict, i) => {
                          const srcA = getSourceById(conflict.eventA.sourceId);
                          const srcB = getSourceById(conflict.eventB.sourceId);
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.06 }}
                              className="rounded-xl border border-red-200/60 bg-white overflow-hidden"
                            >
                              {/* Severity header */}
                              <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-[0.6875rem] ${
                                conflict.severity === "critical"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-amber-50 text-amber-600"
                              }`} style={{ fontWeight: 600 }}>
                                <AlertTriangle className="h-3 w-3" />
                                {conflict.severity === "critical" ? "严重冲突" : "轻微冲突"}
                                <span className="text-[0.625rem]" style={{ fontWeight: 400 }}>
                                  · 重叠 {conflict.overlapMinutes} 分钟
                                </span>
                                <span className="ml-auto text-[0.625rem]" style={{ fontWeight: 400 }}>
                                  {format(conflict.eventA.date, "M月d日", { locale: zhCN })}
                                </span>
                              </div>

                              <div className="p-3 sm:p-4 space-y-2.5">
                                {/* Event A */}
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-1 h-8 rounded-full ${conflict.eventA.color}`} />
                                  <div className="min-w-0 flex-1">
                                    <div className="text-[0.8125rem] truncate" style={{ fontWeight: 500 }}>
                                      {conflict.eventA.title}
                                    </div>
                                    <div className="flex items-center gap-2 text-[0.6875rem] text-muted-foreground">
                                      <Clock className="h-2.5 w-2.5" />
                                      {formatHour(conflict.eventA.startHour)} – {formatHour(conflict.eventA.startHour + conflict.eventA.duration)}
                                      {srcA && (
                                        <span className="flex items-center gap-1">
                                          <div className={`h-1.5 w-1.5 rounded-full ${srcA.dotColor}`} />
                                          {srcA.name}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Overlap indicator */}
                                <div className="flex items-center gap-2 px-3">
                                  <div className="flex-1 h-px bg-red-200" />
                                  <span className="text-[0.5625rem] text-red-400 shrink-0" style={{ fontWeight: 500 }}>
                                    重叠 {conflict.overlapMinutes} 分钟
                                  </span>
                                  <div className="flex-1 h-px bg-red-200" />
                                </div>

                                {/* Event B */}
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-1 h-8 rounded-full ${conflict.eventB.color}`} />
                                  <div className="min-w-0 flex-1">
                                    <div className="text-[0.8125rem] truncate" style={{ fontWeight: 500 }}>
                                      {conflict.eventB.title}
                                    </div>
                                    <div className="flex items-center gap-2 text-[0.6875rem] text-muted-foreground">
                                      <Clock className="h-2.5 w-2.5" />
                                      {formatHour(conflict.eventB.startHour)} – {formatHour(conflict.eventB.startHour + conflict.eventB.duration)}
                                      {srcB && (
                                        <span className="flex items-center gap-1">
                                          <div className={`h-1.5 w-1.5 rounded-full ${srcB.dotColor}`} />
                                          {srcB.name}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-1.5 border-t border-border/20">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 rounded-lg text-[0.6875rem] h-7 gap-1"
                                  >
                                    <ArrowUpDown className="h-2.5 w-2.5" /> 调整时间
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 rounded-lg text-[0.6875rem] h-7 gap-1"
                                  >
                                    <Bell className="h-2.5 w-2.5" /> 设置提醒
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-lg text-[0.6875rem] h-7 gap-1 text-muted-foreground"
                                  >
                                    忽略
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
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

/* ═══════════════ Inline Conflict Banner ══════════════ */
interface ConflictBannerProps {
  conflicts: ConflictInfo[];
  onViewDetails: () => void;
}

export function ConflictBanner({ conflicts, onViewDetails }: ConflictBannerProps) {
  if (conflicts.length === 0) return null;

  const criticalCount = conflicts.filter((c) => c.severity === "critical").length;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <button
        onClick={onViewDetails}
        className="w-full flex items-center gap-2 sm:gap-3 rounded-xl bg-red-50 border border-red-200/50 px-3 py-2 sm:px-4 sm:py-2.5 text-left hover:bg-red-100/60 transition-colors group"
      >
        <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
        <div className="min-w-0 flex-1">
          <span className="text-[0.8125rem] text-red-700" style={{ fontWeight: 600 }}>
            {conflicts.length} 个日程冲突
          </span>
          {criticalCount > 0 && (
            <span className="text-[0.75rem] text-red-500 ml-2">
              （{criticalCount} 个严重）
            </span>
          )}
        </div>
        <span className="text-[0.6875rem] text-red-400 group-hover:text-red-600 transition-colors shrink-0">
          查看详情 <ChevronRight className="inline h-3 w-3" />
        </span>
      </button>
    </motion.div>
  );
}