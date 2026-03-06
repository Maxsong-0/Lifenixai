import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../components/LanguageContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Calendar,
  Shield,
  Crown,
  Ban,
  Eye,
  Pencil,
  Trash2,
  X,
  CircleCheck,
  CircleAlert,
  UserPlus,
} from "lucide-react";

interface MockUser {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro";
  status: "active" | "inactive" | "banned";
  createdAt: string;
  lastLogin: string;
  tasks: number;
  focusHours: number;
  circles: number;
}

const mockUsers: MockUser[] = [];

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  banned: "bg-red-100 text-red-700",
};

export function AdminUsers() {
  const { t, locale, dateLocale } = useLanguage();
  const isEn = locale === "en-US";
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState<"all" | "free" | "pro">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "banned">("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const pageSize = 8;

  const filtered = useMemo(() => {
    return mockUsers.filter((u) => {
      if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase()) && !u.email.toLowerCase().includes(searchQuery.toLowerCase()))
        return false;
      if (filterPlan !== "all" && u.plan !== filterPlan) return false;
      if (filterStatus !== "all" && u.status !== filterStatus) return false;
      return true;
    });
  }, [searchQuery, filterPlan, filterStatus]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className="space-y-4 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-[1.25rem]" style={{ fontWeight: 700 }}>
            {t("admin.users.title")}
          </h2>
          <p className="text-[0.8125rem] text-muted-foreground">
            {t("admin.users.subtitle").replace("{n}", String(mockUsers.length))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-[0.75rem]">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            {t("admin.users.export")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder={t("admin.users.searchPlaceholder")}
            className="pl-9 text-[0.8125rem]"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border/50 p-0.5">
            {(["all", "free", "pro"] as const).map((p) => (
              <button
                key={p}
                onClick={() => { setFilterPlan(p); setPage(1); }}
                className={`rounded-md px-3 py-1.5 text-[0.75rem] transition-all ${
                  filterPlan === p ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                style={{ fontWeight: filterPlan === p ? 600 : 400 }}
              >
                {p === "all" ? t("admin.filter.all") : p === "free" ? t("admin.filter.free") : "Pro"}
              </button>
            ))}
          </div>
          <div className="flex items-center rounded-lg border border-border/50 p-0.5">
            {(["all", "active", "inactive", "banned"] as const).map((s) => (
              <button
                key={s}
                onClick={() => { setFilterStatus(s); setPage(1); }}
                className={`rounded-md px-2.5 py-1.5 text-[0.75rem] transition-all ${
                  filterStatus === s ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                style={{ fontWeight: filterStatus === s ? 600 : 400 }}
              >
                {t(`admin.filter.${s}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-border/50 bg-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-4 py-3 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>
                  {t("admin.users.col.user")}
                </th>
                <th className="px-4 py-3 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>
                  {t("admin.users.col.plan")}
                </th>
                <th className="px-4 py-3 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>
                  {t("admin.users.col.status")}
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>
                  {t("admin.users.col.tasks")}
                </th>
                <th className="hidden lg:table-cell px-4 py-3 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>
                  {t("admin.users.col.focusHours")}
                </th>
                <th className="hidden lg:table-cell px-4 py-3 text-left text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>
                  {t("admin.users.col.joined")}
                </th>
                <th className="px-4 py-3 text-right text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 600 }}>
                  {t("admin.users.col.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.map((user) => (
                <tr key={user.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[0.75rem]" style={{ fontWeight: 600 }}>
                        {user.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[0.8125rem] truncate" style={{ fontWeight: 500 }}>{user.name}</div>
                        <div className="text-[0.6875rem] text-muted-foreground truncate">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`border-0 text-[0.625rem] ${user.plan === "pro" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                      {user.plan === "pro" && <Crown className="h-2.5 w-2.5 mr-0.5" />}
                      {user.plan === "pro" ? "Pro" : "Free"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`border-0 text-[0.625rem] ${statusColors[user.status]}`}>
                      {t(`admin.status.${user.status}`)}
                    </Badge>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-[0.8125rem] text-muted-foreground">{user.tasks}</td>
                  <td className="hidden lg:table-cell px-4 py-3 text-[0.8125rem] text-muted-foreground">{user.focusHours}h</td>
                  <td className="hidden lg:table-cell px-4 py-3 text-[0.75rem] text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString(dateLocale)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors">
                        <Ban className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/30">
          <span className="text-[0.75rem] text-muted-foreground">
            {t("admin.users.showing")
              .replace("{from}", String((page - 1) * pageSize + 1))
              .replace("{to}", String(Math.min(page * pageSize, filtered.length)))
              .replace("{total}", String(filtered.length))}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md hover:bg-muted/60 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-7 w-7 rounded-md text-[0.75rem] transition-all ${
                  page === p ? "bg-primary text-white" : "hover:bg-muted/60 text-muted-foreground"
                }`}
                style={{ fontWeight: page === p ? 600 : 400 }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-md hover:bg-muted/60 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setSelectedUser(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-lg rounded-2xl bg-card border border-border/50 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[1rem]" style={{ fontWeight: 600 }}>{t("admin.users.detail")}</h3>
                <button onClick={() => setSelectedUser(null)} className="p-1.5 rounded-md hover:bg-muted/60">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-[1.25rem]" style={{ fontWeight: 700 }}>
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <div className="text-[1.0625rem]" style={{ fontWeight: 600 }}>{selectedUser.name}</div>
                  <div className="text-[0.8125rem] text-muted-foreground">{selectedUser.email}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: t("admin.users.col.plan"), value: selectedUser.plan === "pro" ? "Pro" : "Free" },
                  { label: t("admin.users.col.status"), value: t(`admin.status.${selectedUser.status}`) },
                  { label: t("admin.users.col.tasks"), value: String(selectedUser.tasks) },
                  { label: t("admin.users.col.focusHours"), value: `${selectedUser.focusHours}h` },
                  { label: t("admin.users.col.joined"), value: new Date(selectedUser.createdAt).toLocaleDateString(dateLocale) },
                  { label: t("admin.users.lastLogin"), value: new Date(selectedUser.lastLogin).toLocaleDateString(dateLocale) },
                ].map((item, i) => (
                  <div key={i} className="rounded-lg bg-muted/30 p-3">
                    <div className="text-[0.625rem] text-muted-foreground mb-0.5">{item.label}</div>
                    <div className="text-[0.875rem]" style={{ fontWeight: 500 }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 text-[0.75rem]">
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  {t("common.edit")}
                </Button>
                <Button variant="outline" size="sm" className="text-[0.75rem] text-red-600 hover:bg-red-50">
                  <Ban className="h-3.5 w-3.5 mr-1.5" />
                  {t("admin.users.ban")}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}