import { useState } from "react";
import { motion } from "motion/react";
import { useLanguage } from "../components/LanguageContext";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  CircleDot,
  Users,
  MessageSquare,
  Search,
  Eye,
  Ban,
  Trash2,
  TrendingUp,
  Brain,
  Shield,
  Home,
  Briefcase,
  FolderOpen,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const typeDistribution: { name: string; value: number; color: string }[] = [];

const mockCircles: { id: string; name: string; type: string; icon: string; members: number; messages: number; knowledge: number; status: string; owner: string; created: string }[] = [];

const typeIcons: Record<string, any> = { family: Home, team: Briefcase, project: FolderOpen };
const typeColors: Record<string, string> = {
  family: "bg-green-100 text-green-600",
  team: "bg-purple-100 text-purple-600",
  project: "bg-blue-100 text-blue-600",
};
const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  banned: "bg-red-100 text-red-700",
};

export function AdminCircles() {
  const { t, locale, dateLocale } = useLanguage();
  const isEn = locale === "en-US";
  const [search, setSearch] = useState("");

  const filtered = mockCircles.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.owner.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    { label: t("admin.circles.totalCircles"), value: "--", icon: CircleDot, bg: "bg-purple-50", color: "text-purple-600" },
    { label: t("admin.circles.totalMembers"), value: "--", icon: Users, bg: "bg-blue-50", color: "text-blue-600" },
    { label: t("admin.circles.totalMessages"), value: "--", icon: MessageSquare, bg: "bg-emerald-50", color: "text-emerald-600" },
    { label: t("admin.circles.knowledgeItems"), value: "--", icon: Brain, bg: "bg-amber-50", color: "text-amber-600" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h2 className="text-[1.25rem]" style={{ fontWeight: 700 }}>{t("admin.circles.title")}</h2>
        <p className="text-[0.8125rem] text-muted-foreground">{t("admin.circles.subtitle")}</p>
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

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Circle List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("admin.circles.searchPlaceholder")} className="pl-9 text-[0.8125rem]" />
          </div>

          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/20">
                    <th className="px-4 py-2.5 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>{t("admin.circles.col.name")}</th>
                    <th className="px-4 py-2.5 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>{t("admin.circles.col.type")}</th>
                    <th className="hidden md:table-cell px-4 py-2.5 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>{t("admin.circles.col.members")}</th>
                    <th className="hidden md:table-cell px-4 py-2.5 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>{t("admin.circles.col.messages")}</th>
                    <th className="px-4 py-2.5 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>{t("admin.users.col.status")}</th>
                    <th className="px-4 py-2.5 text-right text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>{t("admin.users.col.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((circle) => {
                    const TypeIcon = typeIcons[circle.type];
                    return (
                      <tr key={circle.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[1.125rem]">{circle.icon}</span>
                            <div>
                              <div className="text-[0.8125rem]" style={{ fontWeight: 500 }}>{circle.name}</div>
                              <div className="text-[0.625rem] text-muted-foreground">{circle.owner}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`border-0 text-[0.625rem] ${typeColors[circle.type]}`}>
                            {t(`admin.circles.type.${circle.type}`)}
                          </Badge>
                        </td>
                        <td className="hidden md:table-cell px-4 py-3 text-[0.8125rem] text-muted-foreground">{circle.members}</td>
                        <td className="hidden md:table-cell px-4 py-3 text-[0.8125rem] text-muted-foreground">{circle.messages.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <Badge className={`border-0 text-[0.625rem] ${statusColors[circle.status]}`}>
                            {t(`admin.status.${circle.status}`)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                              <Ban className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Type Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border/50 bg-card p-5"
        >
          <h3 className="text-[0.9375rem] mb-1" style={{ fontWeight: 600 }}>{t("admin.circles.typeDist")}</h3>
          <p className="text-[0.75rem] text-muted-foreground mb-4">{t("admin.circles.typeDistDesc")}</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {typeDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid rgba(0,0,0,0.08)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {typeDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[0.75rem]">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span style={{ fontWeight: 500 }}>{(item.value / 1000).toFixed(1)}K</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}