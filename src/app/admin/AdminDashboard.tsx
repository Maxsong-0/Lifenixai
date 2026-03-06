import { motion } from "motion/react";
import { useLanguage } from "../components/LanguageContext";
import {
  Users,
  CreditCard,
  ListTodo,
  Brain,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Activity,
  CircleDot,
  Target,
  Zap,
  Clock,
  Eye,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const userGrowthData: { month: string; users: number }[] = [];

const revenueData: { month: string; revenue: number }[] = [];

const activeUsersDaily: { day: string; dau: number }[] = [];

const planDistribution: { name: string; value: number; color: string }[] = [];

const recentActivities: { type: string; actionKey: string; name: string; time: string }[] = [];

const typeIcons: Record<string, any> = {
  user: Users,
  sub: CreditCard,
  ai: Brain,
  circle: CircleDot,
  feedback: Zap,
};

const typeColors: Record<string, string> = {
  user: "bg-blue-100 text-blue-600",
  sub: "bg-purple-100 text-purple-600",
  ai: "bg-amber-100 text-amber-600",
  circle: "bg-emerald-100 text-emerald-600",
  feedback: "bg-rose-100 text-rose-600",
};

export function AdminDashboard() {
  const { t, locale } = useLanguage();
  const isEn = locale === "en-US";

  const statCards = [
    {
      labelKey: "admin.stat.totalUsers",
      value: "--",
      changeKey: "--",
      trending: "up" as const,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      labelKey: "admin.stat.monthlyRevenue",
      value: "--",
      changeKey: "--",
      trending: "up" as const,
      icon: CreditCard,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      labelKey: "admin.stat.activeUsers",
      value: "--",
      changeKey: "--",
      trending: "up" as const,
      icon: Activity,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      labelKey: "admin.stat.aiRequests",
      value: "--",
      changeKey: "--",
      trending: "up" as const,
      icon: Brain,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border/50 bg-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <Badge
                className={`border-0 text-[0.625rem] ${
                  card.trending === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {card.trending === "up" ? <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> : <TrendingDown className="h-2.5 w-2.5 mr-0.5" />}
                {card.changeKey}
              </Badge>
            </div>
            <div className="text-[1.5rem] text-foreground" style={{ fontWeight: 700 }}>
              {card.value}
            </div>
            <div className="text-[0.75rem] text-muted-foreground mt-0.5">{t(card.labelKey)}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* User Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-xl border border-border/50 bg-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[0.9375rem]" style={{ fontWeight: 600 }}>
                {t("admin.chart.userGrowth")}
              </h3>
              <p className="text-[0.75rem] text-muted-foreground">{t("admin.chart.last6Months")}</p>
            </div>
            <Badge className="bg-primary/10 text-primary border-0 text-[0.625rem]">
              <TrendingUp className="h-2.5 w-2.5 mr-1" />
              --
            </Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="adminUserGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid key="ug-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis key="ug-x" dataKey="month" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.2)" />
                <YAxis key="ug-y" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.2)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  key="ug-tip"
                  contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }}
                  formatter={(value: number) => [`${(value / 1000).toFixed(1)}K`, isEn ? "Users" : "用户"]}
                />
                <Area key="ug-area" type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} fill="url(#adminUserGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Plan Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="text-[0.9375rem] mb-1" style={{ fontWeight: 600 }}>
            {t("admin.chart.planDist")}
          </h3>
          <p className="text-[0.75rem] text-muted-foreground mb-4">{t("admin.chart.userBreakdown")}</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {planDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }}
                  formatter={(value: number) => [`${(value / 1000).toFixed(1)}K`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {planDistribution.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-[0.75rem]">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-muted-foreground">{p.name}</span>
                </div>
                <span style={{ fontWeight: 500 }}>{(p.value / 1000).toFixed(1)}K</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* DAU Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 rounded-xl border border-border/50 bg-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[0.9375rem]" style={{ fontWeight: 600 }}>
                {t("admin.chart.dau")}
              </h3>
              <p className="text-[0.75rem] text-muted-foreground">{t("admin.chart.thisWeek")}</p>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeUsersDaily}>
                <CartesianGrid key="dau-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis key="dau-x" dataKey="day" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.2)" />
                <YAxis key="dau-y" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.2)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  key="dau-tip"
                  contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }}
                  formatter={(value: number) => [`${(value / 1000).toFixed(1)}K`, "DAU"]}
                />
                <Bar key="dau-bar" dataKey="dau" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="text-[0.9375rem] mb-4" style={{ fontWeight: 600 }}>
            {t("admin.recent.title")}
          </h3>
          <div className="space-y-3">
            {recentActivities.map((act, i) => {
              const Icon = typeIcons[act.type];
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${typeColors[act.type]}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.75rem] text-foreground truncate">
                      <span style={{ fontWeight: 500 }}>{act.name}</span>{" "}
                      <span className="text-muted-foreground">{t(act.actionKey)}</span>
                    </p>
                    <p className="text-[0.625rem] text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {act.time} {isEn ? "ago" : "前"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}