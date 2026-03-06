import { useState } from "react";
import { motion } from "motion/react";
import { useLanguage } from "../components/LanguageContext";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  ListTodo,
  CalendarDays,
  Target,
  FileText,
  Search,
  TrendingUp,
  CircleCheck,
  Clock,
  BarChart3,
  Eye,
  Flag,
  Trash2,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const taskStats: { day: string; created: number; completed: number }[] = [];

const focusTrend: { month: string; sessions: number; avgMin: number }[] = [];

const flaggedContent: { id: string; type: string; user: string; content: string; reason: string; date: string }[] = [];

export function AdminContent() {
  const { t, locale, dateLocale } = useLanguage();
  const isEn = locale === "en-US";
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "focus" | "flagged">("overview");

  const overviewCards = [
    { label: t("admin.content.totalTasks"), value: "--", change: "--", icon: ListTodo, bg: "bg-blue-50", color: "text-blue-600" },
    { label: t("admin.content.totalEvents"), value: "--", change: "--", icon: CalendarDays, bg: "bg-purple-50", color: "text-purple-600" },
    { label: t("admin.content.focusSessions"), value: "--", change: "--", icon: Target, bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: t("admin.content.flaggedItems"), value: "--", change: "--", icon: Flag, bg: "bg-red-50", color: "text-red-600" },
  ];

  const tabs = [
    { key: "overview" as const, label: t("admin.content.tab.overview") },
    { key: "tasks" as const, label: t("admin.content.tab.tasks") },
    { key: "focus" as const, label: t("admin.content.tab.focus") },
    { key: "flagged" as const, label: t("admin.content.tab.flagged") },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h2 className="text-[1.25rem]" style={{ fontWeight: 700 }}>{t("admin.content.title")}</h2>
        <p className="text-[0.8125rem] text-muted-foreground">{t("admin.content.subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-border/50 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-md px-4 py-2 text-[0.8125rem] transition-all ${
              activeTab === tab.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
            style={{ fontWeight: activeTab === tab.key ? 600 : 400 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      {activeTab === "overview" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewCards.map((card, i) => (
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
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[0.6875rem] text-muted-foreground">{card.label}</span>
                  <Badge className={`border-0 text-[0.5625rem] ${card.change.startsWith("+") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {card.change}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Task Creation/Completion Chart */}
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="text-[0.9375rem] mb-4" style={{ fontWeight: 600 }}>{t("admin.content.taskActivity")}</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskStats}>
                  <CartesianGrid key="ta-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis key="ta-x" dataKey="day" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.2)" />
                  <YAxis key="ta-y" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.2)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip key="ta-tip" contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }} />
                  <Bar key="ta-created" dataKey="created" name={isEn ? "Created" : "创建"} fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                  <Bar key="ta-completed" dataKey="completed" name={isEn ? "Completed" : "完成"} fill="#22c55e" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tasks Tab */}
      {activeTab === "tasks" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-border/50 bg-card p-4 text-center">
              <div className="text-[1.5rem] text-primary" style={{ fontWeight: 700 }}>--</div>
              <div className="text-[0.75rem] text-muted-foreground">{t("admin.content.completionRate")}</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-4 text-center">
              <div className="text-[1.5rem] text-amber-600" style={{ fontWeight: 700 }}>--</div>
              <div className="text-[0.75rem] text-muted-foreground">{t("admin.content.avgTasksPerUser")}</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-4 text-center">
              <div className="text-[1.5rem] text-blue-600" style={{ fontWeight: 700 }}>--</div>
              <div className="text-[0.75rem] text-muted-foreground">{t("admin.content.highPriority")}</div>
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="text-[0.9375rem] mb-4" style={{ fontWeight: 600 }}>{t("admin.content.taskTrend")}</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskStats}>
                  <CartesianGrid key="tt-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis key="tt-x" dataKey="day" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.2)" />
                  <YAxis key="tt-y" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.2)" />
                  <Tooltip key="tt-tip" contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }} />
                  <Bar key="tt-created" dataKey="created" name={isEn ? "Created" : "创建"} fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                  <Bar key="tt-completed" dataKey="completed" name={isEn ? "Completed" : "完成"} fill="#22c55e" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* Focus Tab */}
      {activeTab === "focus" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-border/50 bg-card p-4 text-center">
              <div className="text-[1.5rem] text-emerald-600" style={{ fontWeight: 700 }}>--</div>
              <div className="text-[0.75rem] text-muted-foreground">{t("admin.content.totalFocusSessions")}</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-4 text-center">
              <div className="text-[1.5rem] text-purple-600" style={{ fontWeight: 700 }}>--</div>
              <div className="text-[0.75rem] text-muted-foreground">{t("admin.content.avgFocusDuration")}</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-4 text-center">
              <div className="text-[1.5rem] text-amber-600" style={{ fontWeight: 700 }}>--</div>
              <div className="text-[0.75rem] text-muted-foreground">{t("admin.content.avgFocusRating")}</div>
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="text-[0.9375rem] mb-4" style={{ fontWeight: 600 }}>{t("admin.content.focusTrend")}</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={focusTrend}>
                  <CartesianGrid key="ft-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis key="ft-x" dataKey="month" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.2)" />
                  <YAxis key="ft-y" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.2)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip key="ft-tip" contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }} />
                  <Line key="ft-line" type="monotone" dataKey="sessions" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {/* Flagged Tab */}
      {activeTab === "flagged" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30 bg-muted/20">
                  <th className="px-5 py-3 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>ID</th>
                  <th className="px-5 py-3 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>{t("admin.content.col.type")}</th>
                  <th className="px-5 py-3 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>{t("admin.content.col.user")}</th>
                  <th className="px-5 py-3 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>{t("admin.content.col.content")}</th>
                  <th className="px-5 py-3 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>{t("admin.content.col.reason")}</th>
                  <th className="px-5 py-3 text-right text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>{t("admin.users.col.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {flaggedContent.map((item) => (
                  <tr key={item.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                    <td className="px-5 py-3 text-[0.75rem] text-muted-foreground" style={{ fontFamily: "monospace" }}>{item.id}</td>
                    <td className="px-5 py-3">
                      <Badge className="bg-gray-100 text-gray-600 border-0 text-[0.625rem]">{item.type}</Badge>
                    </td>
                    <td className="px-5 py-3 text-[0.8125rem]" style={{ fontWeight: 500 }}>{item.user}</td>
                    <td className="px-5 py-3 text-[0.8125rem] text-muted-foreground max-w-[200px] truncate">{item.content}</td>
                    <td className="px-5 py-3">
                      <Badge className="bg-red-100 text-red-700 border-0 text-[0.625rem]">{item.reason}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-green-50 text-muted-foreground hover:text-green-600 transition-colors">
                          <CircleCheck className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}