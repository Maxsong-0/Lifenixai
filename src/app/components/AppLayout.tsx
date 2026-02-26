import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate, useOutletContext } from "react-router";
import { useAuth } from "./AuthContext";
import { Button } from "./ui/button";
import {
  Sparkles,
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Bell,
  Search,
  Crown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DynamicBackground } from "./DynamicBackground";

export type DashboardTab = "tasks" | "calendar" | "chat" | "stats";

const navItems = [
  { key: "tasks" as DashboardTab, label: "任务管理", icon: ListTodo },
  { key: "calendar" as DashboardTab, label: "日程日历", icon: CalendarDays },
  { key: "chat" as DashboardTab, label: "AI 助手", icon: MessageSquare },
  { key: "stats" as DashboardTab, label: "数据统计", icon: BarChart3 },
];

const bottomItems = [
  { key: "help", label: "帮助中心", icon: HelpCircle },
  { key: "settings", label: "设置", icon: Settings },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Derive activeTab from URL search params
  const params = new URLSearchParams(location.search);
  const activeTab: DashboardTab = (params.get("tab") as DashboardTab) || "tasks";

  const setActiveTab = (tab: DashboardTab) => {
    navigate(`/dashboard?tab=${tab}`, { replace: true });
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 6) return "夜深了";
    if (h < 12) return "早上好";
    if (h < 14) return "中午好";
    if (h < 18) return "下午好";
    return "晚上好";
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-border/50 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm shadow-primary/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[1.125rem] tracking-tight whitespace-nowrap"
              style={{ fontWeight: 700 }}
            >
              Lifenix<span className="text-primary"> AI</span>
            </motion.span>
          )}
        </Link>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all text-[0.875rem] ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
                style={{ fontWeight: isActive ? 600 : 400 }}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={`h-[1.125rem] w-[1.125rem] shrink-0 ${isActive ? "text-primary" : ""}`} />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                {!collapsed && isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Upgrade card */}
        {!collapsed && (
          <div className="mt-6 rounded-xl bg-gradient-to-br from-primary/10 via-purple-50 to-pink-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-[0.8125rem] text-primary" style={{ fontWeight: 600 }}>升级 Pro</span>
            </div>
            <p className="mb-3 text-[0.75rem] text-muted-foreground leading-relaxed">
              解锁无限AI对话、高级统计分析等专属功能
            </p>
            <Link to="/pricing">
              <Button size="sm" className="w-full rounded-lg bg-primary text-[0.8125rem] text-white hover:bg-primary/90">
                查看方案
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Bottom items */}
      <div className="border-t border-border/50 px-3 py-3">
        <div className="space-y-1">
          {bottomItems.map((item) => (
            <button
              key={item.key}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[0.8125rem] text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground"
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-[1.125rem] w-[1.125rem] shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </div>

        {/* User info */}
        <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-muted/40 px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[0.75rem] text-white" style={{ fontWeight: 600 }}>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[0.8125rem]" style={{ fontWeight: 600 }}>{user?.name}</div>
              <div className="truncate text-[0.6875rem] text-muted-foreground">{user?.email}</div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="退出登录"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <DynamicBackground variant="dashboard" />
      {/* Desktop Sidebar */}
      <aside
        className={`relative hidden md:flex flex-col border-r border-border/50 bg-white/90 backdrop-blur-sm transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-[260px]"
        }`}
        style={{ zIndex: 1 }}
      >
        {sidebarContent}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-[4.5rem] z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border/60 bg-white text-muted-foreground shadow-sm hover:text-foreground transition-colors"
          style={{ left: collapsed ? "55px" : "247px" }}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-white shadow-xl md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="relative flex flex-1 flex-col overflow-hidden" style={{ zIndex: 1 }}>
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/50 bg-white/80 backdrop-blur-xl px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 hover:bg-muted/60 transition-colors md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-[1rem] tracking-tight" style={{ fontWeight: 600 }}>
                {getGreeting()}，{user?.name || "用户"}
              </h1>
              <p className="text-[0.75rem] text-muted-foreground">
                {new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors">
              <Search className="h-[1.125rem] w-[1.125rem]" />
            </button>
            <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors">
              <Bell className="h-[1.125rem] w-[1.125rem]" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <div className="ml-1 hidden items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 sm:flex">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[0.6875rem] text-white" style={{ fontWeight: 600 }}>
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <span className="text-[0.8125rem] text-primary" style={{ fontWeight: 500 }}>
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ activeTab, setActiveTab } satisfies AppOutletContext} />
        </main>
      </div>
    </div>
  );
}

export interface AppOutletContext {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
}

export function useAppContext() {
  return useOutletContext<AppOutletContext>();
}