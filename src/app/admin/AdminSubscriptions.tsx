import { useState } from "react";
import { motion } from "motion/react";
import { useLanguage } from "../components/LanguageContext";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  CreditCard,
  TrendingUp,
  Crown,
  Users,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
  Download,
  Eye,
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
} from "recharts";

const revenueMonthly: { month: string; monthly: number; yearly: number }[] = [];

const conversionFunnel: { stage: string; count: number }[] = [];

const recentTransactions: { id: string; user: string; type: string; amount: string; date: string; status: string }[] = [];

export function AdminSubscriptions() {
  const { t, locale, dateLocale } = useLanguage();
  const isEn = locale === "en-US";
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");

  const statCards = [
    { label: t("admin.sub.totalRevenue"), value: "--", change: "--", icon: DollarSign, bg: "bg-green-50", color: "text-green-600" },
    { label: t("admin.sub.proUsers"), value: "--", change: "--", icon: Crown, bg: "bg-purple-50", color: "text-purple-600" },
    { label: t("admin.sub.conversionRate"), value: "--", change: "--", icon: TrendingUp, bg: "bg-blue-50", color: "text-blue-600" },
    { label: t("admin.sub.churnRate"), value: "--", change: "--", icon: RefreshCw, bg: "bg-amber-50", color: "text-amber-600" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-[1.25rem]" style={{ fontWeight: 700 }}>{t("admin.sub.title")}</h2>
          <p className="text-[0.8125rem] text-muted-foreground">{t("admin.sub.subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" className="text-[0.75rem]">
          <Download className="h-3.5 w-3.5 mr-1.5" />
          {t("admin.sub.exportReport")}
        </Button>
      </div>

      {/* Stat Cards */}
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
                <ArrowUpRight className="h-2 w-2 mr-0.5" />
                {card.change}
              </Badge>
            </div>
            <div className="text-[1.25rem]" style={{ fontWeight: 700 }}>{card.value}</div>
            <div className="text-[0.6875rem] text-muted-foreground">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-border/50 bg-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[0.9375rem]" style={{ fontWeight: 600 }}>{t("admin.sub.revenueChart")}</h3>
            <p className="text-[0.75rem] text-muted-foreground">{t("admin.chart.last6Months")}</p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueMonthly}>
              <CartesianGrid key="rv-grid" strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis key="rv-x" dataKey="month" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.2)" />
              <YAxis key="rv-y" tick={{ fontSize: 11 }} stroke="rgba(0,0,0,0.2)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                key="rv-tip"
                contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }}
                formatter={(value: number) => [`${isEn ? "$" : "¥"}${(value / 1000).toFixed(1)}K`, ""]}
              />
              <Bar key="rv-monthly" dataKey="monthly" name={isEn ? "Monthly" : "月付"} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar key="rv-yearly" dataKey="yearly" name={isEn ? "Yearly" : "年付"} fill="#6d28d9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-border/50 bg-card overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-border/30">
          <h3 className="text-[0.9375rem]" style={{ fontWeight: 600 }}>{t("admin.sub.recentTx")}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30 bg-muted/20">
                <th className="px-5 py-2.5 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>ID</th>
                <th className="px-5 py-2.5 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>{t("admin.sub.col.user")}</th>
                <th className="px-5 py-2.5 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>{t("admin.sub.col.type")}</th>
                <th className="px-5 py-2.5 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>{t("admin.sub.col.amount")}</th>
                <th className="hidden md:table-cell px-5 py-2.5 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>{t("admin.sub.col.date")}</th>
                <th className="px-5 py-2.5 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>{t("admin.sub.col.status")}</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                  <td className="px-5 py-3 text-[0.75rem] text-muted-foreground" style={{ fontFamily: "monospace" }}>{tx.id}</td>
                  <td className="px-5 py-3 text-[0.8125rem]" style={{ fontWeight: 500 }}>{tx.user}</td>
                  <td className="px-5 py-3">
                    <Badge className="bg-purple-100 text-purple-700 border-0 text-[0.625rem]">{tx.type}</Badge>
                  </td>
                  <td className="px-5 py-3 text-[0.8125rem]" style={{ fontWeight: 600 }}>{tx.amount}</td>
                  <td className="hidden md:table-cell px-5 py-3 text-[0.75rem] text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString(dateLocale)}
                  </td>
                  <td className="px-5 py-3">
                    <Badge className={`border-0 text-[0.625rem] ${tx.status === "success" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {tx.status === "success" ? t("admin.sub.success") : t("admin.sub.refunded")}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}