import { useState, useMemo, useRef } from "react";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { zhCN, enUS as enUSDateFns } from "date-fns/locale";
import { useLanguage } from "./LanguageContext";
import {
  Clock,
  Sparkles,
  Video,
  MapPin,
  Repeat,
  Flag,
  AlertTriangle,
  Zap,
  CircleCheck,
  Circle,
  MoreHorizontal,
  Plus,
  GripVertical,
  TrendingUp,
  ArrowRight,
  Timer,
  Link2,
} from "lucide-react";

/* ═══════════════ Types ═══════════════ */
type Priority = "urgent" | "high" | "medium" | "low";
type Status = "todo" | "in_progress" | "done" | "blocked";

interface ScheduleEvent {
  id: string;
  title: string;
  date: Date;
  startHour: number;
  duration: number;
  color: string;
  priority: Priority;
  status: Status;
  category: string;
  tags: string[];
  location?: string;
  isRecurring?: boolean;
  hasMeeting?: boolean;
  subtasks?: { id: string; text: string; done: boolean }[];
  aiSuggested?: boolean;
  energyLevel?: "high" | "medium" | "low";
}

export interface KanbanBoardViewProps {
  events: ScheduleEvent[];
  onSelectEvent: (event: ScheduleEvent) => void;
  onToggleStatus: (id: string) => void;
  onAddEvent?: () => void;
}

/* ═══════════════ Helpers ═══════════════ */
function fmtTime(h: number) {
  return `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
}

/* ═══════════════ Column config ═══════════════ */
interface ColumnConfig {
  status: Status;
  gradient: string;
  headerBg: string;
  dotColor: string;
  glowColor: string;
  iconBg: string;
  accentColor: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    status: "todo",
    gradient: "from-slate-400/20 to-slate-500/5",
    headerBg: "bg-slate-50/80",
    dotColor: "bg-slate-400",
    glowColor: "shadow-slate-200/60",
    iconBg: "bg-slate-100",
    accentColor: "text-slate-600",
  },
  {
    status: "in_progress",
    gradient: "from-blue-400/20 to-blue-500/5",
    headerBg: "bg-blue-50/80",
    dotColor: "bg-blue-500",
    glowColor: "shadow-blue-200/60",
    iconBg: "bg-blue-100",
    accentColor: "text-blue-600",
  },
  {
    status: "done",
    gradient: "from-emerald-400/20 to-emerald-500/5",
    headerBg: "bg-emerald-50/80",
    dotColor: "bg-emerald-500",
    glowColor: "shadow-emerald-200/60",
    iconBg: "bg-emerald-100",
    accentColor: "text-emerald-600",
  },
  {
    status: "blocked",
    gradient: "from-red-400/20 to-red-500/5",
    headerBg: "bg-red-50/80",
    dotColor: "bg-red-500",
    glowColor: "shadow-red-200/60",
    iconBg: "bg-red-100",
    accentColor: "text-red-600",
  },
];

const PRIORITY_BORDER: Record<Priority, string> = {
  urgent: "border-l-red-500",
  high: "border-l-orange-400",
  medium: "border-l-blue-400",
  low: "border-l-slate-300",
};

const PRIORITY_BADGE: Record<Priority, string> = {
  urgent: "bg-red-50 text-red-600 border-red-200",
  high: "bg-orange-50 text-orange-600 border-orange-200",
  medium: "bg-blue-50 text-blue-600 border-blue-200",
  low: "bg-slate-50 text-slate-500 border-slate-200",
};

const ENERGY_CONFIG: Record<string, { icon: typeof Zap; color: string; bg: string }> = {
  high: { icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
  medium: { icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
  low: { icon: Timer, color: "text-slate-400", bg: "bg-slate-50" },
};

/* ═══════════════ Component ═══════════════ */
export function KanbanBoardView({
  events,
  onSelectEvent,
  onToggleStatus,
  onAddEvent,
}: KanbanBoardViewProps) {
  const { t, locale, dateLocale } = useLanguage();
  const isEn = locale === "en-US";
  const fnsLocale = isEn ? enUSDateFns : zhCN;

  const statusLabels = useMemo(
    () => ({
      todo: t("cal.status.todo"),
      in_progress: t("cal.status.inProgress"),
      done: t("cal.status.done"),
      blocked: t("cal.status.blocked"),
    }),
    [t]
  );

  const priorityLabels = useMemo(
    () => ({
      urgent: t("cal.priority.urgent"),
      high: t("cal.priority.high"),
      medium: t("cal.priority.medium"),
      low: t("cal.priority.low"),
    }),
    [t]
  );

  /* ─── Column stats ─── */
  const columnData = useMemo(() => {
    return COLUMNS.map((col) => {
      const items = events.filter((e) => e.status === col.status);
      const totalDuration = items.reduce((acc, e) => acc + e.duration, 0);
      const urgentCount = items.filter(
        (e) => e.priority === "urgent" || e.priority === "high"
      ).length;
      return { ...col, items, totalDuration, urgentCount };
    });
  }, [events]);

  /* ─── Drag state (visual only, no real DnD lib to keep it light) ─── */
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);

  return (
    <motion.div
      key="kanban-view"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="flex gap-3 sm:gap-5 overflow-x-auto p-3 sm:p-6 pb-6 min-h-0 h-full"
    >
      {columnData.map((col, colIdx) => (
        <motion.div
          key={col.status}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: colIdx * 0.1, duration: 0.35 }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverCol(col.status);
          }}
          onDragLeave={() => setDragOverCol(null)}
          onDrop={() => setDragOverCol(null)}
          className={`
            w-[260px] sm:w-[300px] shrink-0 flex flex-col
            rounded-2xl border border-border/30
            bg-gradient-to-b ${col.gradient}
            backdrop-blur-sm
            transition-all duration-300
            ${dragOverCol === col.status ? `ring-2 ring-offset-2 ${col.accentColor.replace("text-", "ring-")}` : ""}
          `}
        >
          {/* ══ Column Header ══ */}
          <div
            className={`
              ${col.headerBg} backdrop-blur-md
              rounded-t-2xl border-b border-border/20
              px-3.5 py-3
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {/* Animated status dot */}
                <span className="relative flex h-2.5 w-2.5">
                  <span
                    className={`absolute inline-flex h-full w-full rounded-full ${col.dotColor} opacity-40 ${
                      col.status === "in_progress" ? "animate-ping" : ""
                    }`}
                  />
                  <span
                    className={`relative inline-flex h-2.5 w-2.5 rounded-full ${col.dotColor}`}
                  />
                </span>
                <span
                  className={`text-[0.8125rem] ${col.accentColor}`}
                  style={{ fontWeight: 600 }}
                >
                  {statusLabels[col.status]}
                </span>
                <span
                  className={`
                    inline-flex h-5 min-w-5 items-center justify-center
                    rounded-full ${col.iconBg} text-[0.6875rem] ${col.accentColor}
                  `}
                  style={{ fontWeight: 600 }}
                >
                  {col.items.length}
                </span>
              </div>
              <button
                onClick={onAddEvent}
                className={`
                  rounded-lg p-1 ${col.accentColor} opacity-50
                  hover:opacity-100 hover:${col.iconBg}
                  transition-all
                `}
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Mini stats bar */}
            <div className="flex items-center gap-3 text-[0.625rem] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {col.totalDuration.toFixed(1)}h
              </span>
              {col.urgentCount > 0 && (
                <span className="flex items-center gap-1 text-red-500">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {col.urgentCount} {isEn ? "urgent" : "紧急"}
                </span>
              )}
              {col.status === "done" && col.items.length > 0 && (
                <span className="flex items-center gap-1 text-emerald-500">
                  <CircleCheck className="h-2.5 w-2.5" />
                  {isEn ? "completed" : "已完成"}
                </span>
              )}
            </div>

            {/* Column progress bar */}
            {col.items.length > 0 && (
              <div className="mt-2 h-1 w-full rounded-full bg-black/5 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${col.dotColor}`}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, (col.items.length / Math.max(events.length, 1)) * 100)}%`,
                  }}
                  transition={{ delay: colIdx * 0.1 + 0.3, duration: 0.5 }}
                />
              </div>
            )}
          </div>

          {/* ══ Cards ══ */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 scrollbar-thin">
            <AnimatePresence>
              {col.items.map((event, i) => (
                <KanbanCard
                  key={event.id}
                  event={event}
                  index={i}
                  colIdx={colIdx}
                  fnsLocale={fnsLocale}
                  isEn={isEn}
                  priorityLabel={priorityLabels[event.priority]}
                  onSelect={() => onSelectEvent(event)}
                  onToggle={() => onToggleStatus(event.id)}
                />
              ))}
            </AnimatePresence>

            {/* Empty state */}
            {col.items.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center justify-center py-10 text-muted-foreground/40"
              >
                <Circle className="h-8 w-8 mb-2 stroke-1" />
                <span className="text-[0.75rem]">
                  {isEn ? "No items" : "暂无事项"}
                </span>
              </motion.div>
            )}
          </div>

          {/* ══ Column Footer ══ */}
          <div className="border-t border-border/20 px-3 py-2">
            <button
              onClick={onAddEvent}
              className={`
                flex items-center gap-1.5 w-full rounded-lg px-2 py-1.5
                text-[0.75rem] text-muted-foreground/60
                hover:bg-white/60 hover:text-muted-foreground
                transition-all
              `}
            >
              <Plus className="h-3 w-3" />
              {isEn ? "Add item" : "添加事项"}
            </button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

/* ═══════════════ Card Sub-component ═══════════════ */
interface KanbanCardProps {
  event: ScheduleEvent;
  index: number;
  colIdx: number;
  fnsLocale: typeof zhCN;
  isEn: boolean;
  priorityLabel: string;
  onSelect: () => void;
  onToggle: () => void;
}

function KanbanCard({
  event,
  index,
  colIdx,
  fnsLocale,
  isEn,
  priorityLabel,
  onSelect,
  onToggle,
}: KanbanCardProps) {
  const subtaskProgress = event.subtasks
    ? Math.round(
        (event.subtasks.filter((s) => s.done).length / event.subtasks.length) * 100
      )
    : 0;

  const energyCfg = event.energyLevel ? ENERGY_CONFIG[event.energyLevel] : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -10 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      whileHover={{
        y: -3,
        transition: { duration: 0.2 },
      }}
      draggable
      onClick={onSelect}
      className={`
        group cursor-pointer
        rounded-xl border border-border/30 border-l-[3px] ${PRIORITY_BORDER[event.priority]}
        bg-white/90 backdrop-blur-sm
        p-3.5 transition-shadow duration-200
        hover:shadow-lg hover:shadow-black/[0.06]
        ${event.aiSuggested ? "ring-1 ring-primary/20" : ""}
      `}
    >
      {/* Top row: priority + energy + actions */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Badge
            variant="outline"
            className={`text-[0.5625rem] px-1.5 py-0 h-4.5 shrink-0 ${PRIORITY_BADGE[event.priority]}`}
          >
            {priorityLabel}
          </Badge>
          {energyCfg && (
            <span
              className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[0.5625rem] ${energyCfg.bg} ${energyCfg.color}`}
            >
              <energyCfg.icon className="h-2.5 w-2.5" />
              {event.energyLevel === "high"
                ? isEn ? "High" : "高"
                : event.energyLevel === "medium"
                ? isEn ? "Med" : "中"
                : isEn ? "Low" : "低"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="rounded p-0.5 text-muted-foreground/40 hover:text-emerald-500 transition-colors"
          >
            {event.status === "done" ? (
              <CircleCheck className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Circle className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="rounded p-0.5 text-muted-foreground/30 hover:text-muted-foreground transition-colors"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h4
        className={`text-[0.8125rem] mb-2 transition-colors ${
          event.status === "done" ? "line-through text-muted-foreground/60" : "text-foreground"
        }`}
        style={{ fontWeight: 500 }}
      >
        {event.title}
        {event.aiSuggested && (
          <motion.span
            className="inline-block ml-1.5"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="inline h-3 w-3 text-primary" />
          </motion.span>
        )}
      </h4>

      {/* Time chip + meta */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <span className="inline-flex items-center gap-1 rounded-md bg-muted/40 px-1.5 py-0.5 text-[0.625rem] text-muted-foreground">
          <Clock className="h-2.5 w-2.5" />
          {format(event.date, isEn ? "MMM d" : "M/d", { locale: fnsLocale })}
          {" · "}
          {fmtTime(event.startHour)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-muted/40 px-1.5 py-0.5 text-[0.625rem] text-muted-foreground">
          <Timer className="h-2.5 w-2.5" />
          {event.duration}h
        </span>
        {event.hasMeeting && (
          <span className="inline-flex items-center gap-0.5 rounded-md bg-blue-50 px-1.5 py-0.5 text-[0.625rem] text-blue-600">
            <Video className="h-2.5 w-2.5" />
          </span>
        )}
        {event.isRecurring && (
          <span className="inline-flex items-center rounded-md bg-purple-50 px-1 py-0.5 text-purple-500">
            <Repeat className="h-2.5 w-2.5" />
          </span>
        )}
        {event.location && (
          <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[0.625rem] text-emerald-600 max-w-[100px] truncate">
            <MapPin className="h-2.5 w-2.5 shrink-0" />
            {event.location}
          </span>
        )}
      </div>

      {/* Tags */}
      {event.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {event.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted/30 px-1.5 py-0.5 text-[0.5625rem] text-muted-foreground/70"
            >
              #{tag}
            </span>
          ))}
          {event.tags.length > 3 && (
            <span className="text-[0.5625rem] text-muted-foreground/40">
              +{event.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Subtask progress */}
      {event.subtasks && event.subtasks.length > 0 && (
        <div className="mt-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[0.5625rem] text-muted-foreground/60">
              {isEn ? "Subtasks" : "子任务"}
            </span>
            <span className="text-[0.5625rem] text-muted-foreground/80" style={{ fontWeight: 500 }}>
              {event.subtasks.filter((s) => s.done).length}/{event.subtasks.length}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                subtaskProgress === 100
                  ? "bg-emerald-400"
                  : subtaskProgress > 50
                  ? "bg-primary/60"
                  : "bg-primary/30"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${subtaskProgress}%` }}
              transition={{ delay: 0.2 + index * 0.04, duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Bottom color accent bar */}
      <div
        className={`mt-3 h-0.5 w-full rounded-full ${event.color} opacity-30`}
      />
    </motion.div>
  );
}
