import { motion } from "motion/react";
import { useLanguage } from "../components/LanguageContext";
import { Badge } from "../components/ui/badge";
import {
  Brain,
  MessageSquare,
  Zap,
  TrendingUp,
  Clock,
  Users,
  DollarSign,
  Cpu,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

const aiUsageDaily: { day: string; requests: number; tokens: number }[] = [];

const modelUsage: { model: string; requests: number; color: string }[] = [];

const aiCostTrend: { month: string; cost: number }[] = [];

const topFeatures: { feature: string; percentage: number; color: string }[] = [];

export function AdminAI() {
  const { t, locale } = useLanguage();
  const isEn = locale === "en-US";

  const statCards = [
    { label: t("admin.ai.totalRequests"), value: "--", change: "--", icon: Brain, bg: "bg-purple-50", color: "text-purple-600" },
    { label: t("admin.ai.totalTokens"), value: "--", change: "--", icon: Cpu, bg: "bg-blue-50", color: "text-blue-600" },
    { label: t("admin.ai.avgLatency"), value: "--", change: "--", icon: Clock, bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: t("admin.ai.monthlyCost"), value: "--", change: "--", icon: DollarSign, bg: "bg-amber-50", color: "text-amber-600" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h2 className="text-[1.25rem]" style={{ fontWeight: 700 }}>{t("admin.ai.title")}</h2>
        <p className="text-[0.8125rem] text-muted-foreground">{t("admin.ai.subtitle")}</p>
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
            <div className="flex items-center justify-between mb-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <Badge className="bg-green-100 text-green-700 border-0 text-[0.5625rem]">
                {card.change}
              </Badge>
            </div>
            <div className="text-[1.25rem]" style={{ fontWeight: 700 }}>{card.value}</div>
            <div className="text-[0.6875rem] text-muted-foreground">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Daily Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="text-[0.9375rem] mb-1" style={{ fontWeight: 600 }}>{t("admin.ai.dailyRequests")}</h3>
          <p className="text-[0.75rem] text-muted-foreground mb-4">{t("admin.ai.thisWeek")}</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aiUsageDaily}>
                <defs>
                  <linearGradient id="adminAiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid key="ai-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis key="ai-x" dataKey="day" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.2)" />
                <YAxis key="ai-y" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.2)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip key="ai-tip" contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }} />
                <Area key="ai-area" type="monotone" dataKey="requests" stroke="#8b5cf6" strokeWidth={2} fill="url(#adminAiGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Cost Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="text-[0.9375rem] mb-1" style={{ fontWeight: 600 }}>{t("admin.ai.costTrend")}</h3>
          <p className="text-[0.75rem] text-muted-foreground mb-4">{t("admin.chart.last6Months")}</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aiCostTrend}>
                <CartesianGrid key="ac-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis key="ac-x" dataKey="month" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.2)" />
                <YAxis key="ac-y" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.2)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  key="ac-tip"
                  contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }}
                  formatter={(value: number) => [`${isEn ? "$" : "¥"}${(value).toLocaleString()}`, isEn ? "Cost" : "成本"]}
                />
                <Line key="ac-line" type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Model Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="text-[0.9375rem] mb-4" style={{ fontWeight: 600 }}>{t("admin.ai.modelUsage")}</h3>
          <div className="space-y-3">
            {modelUsage.map((model) => (
              <div key={model.model} className="flex items-center gap-3">
                <div className="w-24 text-[0.75rem] text-muted-foreground truncate">{model.model}</div>
                <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${model.requests}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: model.color }}
                  />
                </div>
                <span className="text-[0.75rem] w-10 text-right" style={{ fontWeight: 500 }}>{model.requests}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Feature Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="text-[0.9375rem] mb-4" style={{ fontWeight: 600 }}>{t("admin.ai.featureUsage")}</h3>
          <div className="space-y-3">
            {topFeatures.map((feat) => (
              <div key={feat.feature}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[0.75rem] text-muted-foreground">{feat.feature}</span>
                  <span className="text-[0.75rem]" style={{ fontWeight: 500 }}>{feat.percentage}%</span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${feat.percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${feat.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}