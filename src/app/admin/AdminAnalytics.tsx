import { useState } from "react";
import { motion } from "motion/react";
import { useLanguage } from "../components/LanguageContext";
import { Badge } from "../components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  MapPin,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const pageViews: { date: string; views: number; unique: number }[] = [];

const featureUsage: { feature: string; usage: number }[] = [];

const deviceData: { name: string; value: number; color: string }[] = [];

const regionData: { region: string; users: number; percentage: number }[] = [];

const retentionData: { day: string; rate: number }[] = [];

export function AdminAnalytics() {
  const { t, locale } = useLanguage();
  const isEn = locale === "en-US";

  const statCards = [
    { label: t("admin.analytics.pageViews"), value: "--", change: "--", icon: BarChart3, bg: "bg-blue-50", color: "text-blue-600" },
    { label: t("admin.analytics.avgSession"), value: "--", change: "--", icon: Clock, bg: "bg-purple-50", color: "text-purple-600" },
    { label: t("admin.analytics.bounceRate"), value: "--", change: "--", icon: TrendingUp, bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: t("admin.analytics.newUsers"), value: "--", change: "--", icon: Users, bg: "bg-amber-50", color: "text-amber-600" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h2 className="text-[1.25rem]" style={{ fontWeight: 700 }}>{t("admin.analytics.title")}</h2>
        <p className="text-[0.8125rem] text-muted-foreground">{t("admin.analytics.subtitle")}</p>
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
            <div className="flex items-center justify-between">
              <span className="text-[0.6875rem] text-muted-foreground">{card.label}</span>
              <Badge className={`border-0 text-[0.5625rem] ${card.change.startsWith("+") || card.change.startsWith("-2") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {card.change}
              </Badge>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Page Views */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-border/50 bg-card p-5"
      >
        <h3 className="text-[0.9375rem] mb-1" style={{ fontWeight: 600 }}>{t("admin.analytics.pageViewsChart")}</h3>
        <p className="text-[0.75rem] text-muted-foreground mb-4">{t("admin.analytics.thisWeek")}</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pageViews}>
              <defs>
                <linearGradient id="adminPvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="adminUvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid key="pv-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis key="pv-x" dataKey="date" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.2)" />
              <YAxis key="pv-y" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.2)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip key="pv-tip" contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }} />
              <Area key="pv-views" type="monotone" dataKey="views" name={isEn ? "Page Views" : "页面浏览"} stroke="#8b5cf6" strokeWidth={2} fill="url(#adminPvGrad)" />
              <Area key="pv-unique" type="monotone" dataKey="unique" name={isEn ? "Unique Visitors" : "独立访客"} stroke="#3b82f6" strokeWidth={2} fill="url(#adminUvGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Feature Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="text-[0.9375rem] mb-4" style={{ fontWeight: 600 }}>{t("admin.analytics.featureUsage")}</h3>
          <div className="space-y-3">
            {featureUsage.map((feat) => (
              <div key={feat.feature}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[0.75rem] text-muted-foreground">{feat.feature}</span>
                  <span className="text-[0.75rem]" style={{ fontWeight: 500 }}>{feat.usage}%</span>
                </div>
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${feat.usage}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Device */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="text-[0.9375rem] mb-4" style={{ fontWeight: 600 }}>{t("admin.analytics.devices")}</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                  {deviceData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {deviceData.map((d) => {
              const icons: Record<string, any> = { Desktop: Monitor, Mobile: Smartphone, Tablet: Tablet };
              const Icon = icons[d.name];
              return (
                <div key={d.name} className="flex items-center justify-between text-[0.75rem]">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                  <span style={{ fontWeight: 500 }}>{d.value}%</span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Retention */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="text-[0.9375rem] mb-4" style={{ fontWeight: 600 }}>{t("admin.analytics.retention")}</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={retentionData}>
                <CartesianGrid key="rt-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis key="rt-x" dataKey="day" tick={{ fontSize: 10 }} stroke="rgba(0,0,0,0.2)" />
                <YAxis key="rt-y" tick={{ fontSize: 10 }} stroke="rgba(0,0,0,0.2)" tickFormatter={(v) => `${v}%`} />
                <Tooltip key="rt-tip" contentStyle={{ borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v}%`, isEn ? "Retention" : "留存"]} />
                <Bar key="rt-bar" dataKey="rate" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Region */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-border/50 bg-card p-5"
      >
        <h3 className="text-[0.9375rem] mb-4" style={{ fontWeight: 600 }}>{t("admin.analytics.regions")}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {regionData.map((r) => (
            <div key={r.region} className="rounded-lg bg-muted/30 p-3 text-center">
              <div className="text-[0.625rem] text-muted-foreground mb-1">{r.region}</div>
              <div className="text-[1rem]" style={{ fontWeight: 700 }}>{r.percentage}%</div>
              <div className="text-[0.5625rem] text-muted-foreground">{(r.users / 1000).toFixed(1)}K {isEn ? "users" : "用户"}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}