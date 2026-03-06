import { useState } from "react";
import { motion } from "motion/react";
import { useLanguage } from "../components/LanguageContext";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  MessageSquareText,
  Star,
  CircleCheck,
  Clock,
  CircleAlert,
  Eye,
  Reply,
  Trash2,
  Filter,
  TrendingUp,
} from "lucide-react";

interface FeedbackItem {
  id: string;
  user: string;
  email: string;
  type: "bug" | "feature" | "complaint" | "praise";
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved" | "closed";
  title: string;
  content: string;
  rating: number;
  date: string;
}

const mockFeedback: FeedbackItem[] = [];

const typeColors: Record<string, string> = {
  bug: "bg-red-100 text-red-700",
  feature: "bg-blue-100 text-blue-700",
  complaint: "bg-amber-100 text-amber-700",
  praise: "bg-green-100 text-green-700",
};
const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
};
const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-gray-100 text-gray-600",
};

export function AdminFeedback() {
  const { t, locale, dateLocale } = useLanguage();
  const isEn = locale === "en-US";
  const [typeFilter, setTypeFilter] = useState<"all" | "bug" | "feature" | "complaint" | "praise">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "in_progress" | "resolved" | "closed">("all");

  const filtered = mockFeedback.filter((f) => {
    if (typeFilter !== "all" && f.type !== typeFilter) return false;
    if (statusFilter !== "all" && f.status !== statusFilter) return false;
    return true;
  });

  const statCards = [
    { label: t("admin.feedback.total"), value: "--", icon: MessageSquareText, bg: "bg-blue-50", color: "text-blue-600" },
    { label: t("admin.feedback.openTickets"), value: "--", icon: CircleAlert, bg: "bg-amber-50", color: "text-amber-600" },
    { label: t("admin.feedback.resolved"), value: "--", icon: CircleCheck, bg: "bg-green-50", color: "text-green-600" },
    { label: t("admin.feedback.avgRating"), value: "--", icon: Star, bg: "bg-purple-50", color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h2 className="text-[1.25rem]" style={{ fontWeight: 700 }}>{t("admin.feedback.title")}</h2>
        <p className="text-[0.8125rem] text-muted-foreground">{t("admin.feedback.subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border/50 bg-card p-4"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.bg} mb-2`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <div className="text-[1.25rem]" style={{ fontWeight: 700 }}>{card.value}</div>
            <div className="text-[0.6875rem] text-muted-foreground">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center rounded-lg border border-border/50 p-0.5">
          {(["all", "bug", "feature", "complaint", "praise"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`rounded-md px-3 py-1.5 text-[0.75rem] transition-all ${
                typeFilter === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontWeight: typeFilter === f ? 600 : 400 }}
            >
              {t(`admin.feedback.type.${f}`)}
            </button>
          ))}
        </div>
        <div className="flex items-center rounded-lg border border-border/50 p-0.5">
          {(["all", "open", "in_progress", "resolved", "closed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-md px-2.5 py-1.5 text-[0.75rem] transition-all ${
                statusFilter === s ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              style={{ fontWeight: statusFilter === s ? 600 : 400 }}
            >
              {t(`admin.feedback.status.${s}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-3">
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-xl border border-border/50 bg-card p-5 hover:border-primary/20 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[0.6875rem] text-muted-foreground" style={{ fontFamily: "monospace" }}>{item.id}</span>
                  <Badge className={`border-0 text-[0.5625rem] ${typeColors[item.type]}`}>
                    {t(`admin.feedback.type.${item.type}`)}
                  </Badge>
                  <Badge className={`border-0 text-[0.5625rem] ${priorityColors[item.priority]}`}>
                    {t(`admin.feedback.priority.${item.priority}`)}
                  </Badge>
                  <Badge className={`border-0 text-[0.5625rem] ${statusColors[item.status]}`}>
                    {t(`admin.feedback.status.${item.status}`)}
                  </Badge>
                </div>
                <h4 className="text-[0.9375rem] mb-1" style={{ fontWeight: 500 }}>{item.title}</h4>
                <p className="text-[0.8125rem] text-muted-foreground mb-2">{item.content}</p>
                <div className="flex items-center gap-3 text-[0.6875rem] text-muted-foreground/60">
                  <span>{item.user} ({item.email})</span>
                  <span>·</span>
                  <span>{new Date(item.date).toLocaleDateString(dateLocale)}</span>
                  <span>·</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`h-2.5 w-2.5 ${j < item.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors">
                  <Reply className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-green-50 text-muted-foreground hover:text-green-600 transition-colors">
                  <CircleCheck className="h-4 w-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}