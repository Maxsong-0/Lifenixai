import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate, useOutletContext } from "react-router";
import { useAuth } from "./AuthContext";
import { Button } from "./ui/button";
import {
  Sparkles,
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
  Bell,
  Search,
  Crown,
  X,
  Users,
  Zap,
  Target,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DynamicBackground } from "./DynamicBackground";
import { SearchModal } from "./SearchModal";
import { NotificationPanel } from "./NotificationPanel";
import { AIChatDrawer } from "./AIChatDrawer";
import { Badge } from "./ui/badge";
import { useLanguage } from "./LanguageContext";

export type DashboardTab = "tasks" | "calendar" | "circles" | "stats" | "focus" | "settings" | "help";

const navItems = [
  { key: "tasks" as DashboardTab, labelKey: "sidebar.tasks", icon: ListTodo },
  { key: "calendar" as DashboardTab, labelKey: "sidebar.calendar", icon: CalendarDays },
  { key: "focus" as DashboardTab, labelKey: "sidebar.focus", icon: Target },
  { key: "circles" as DashboardTab, labelKey: "sidebar.circles", icon: Users },
  { key: "stats" as DashboardTab, labelKey: "sidebar.stats", icon: BarChart3 },
];

const bottomItemsDef = [
  { key: "help" as DashboardTab, labelKey: "sidebar.help", icon: HelpCircle },
  { key: "settings" as DashboardTab, labelKey: "sidebar.settings", icon: Settings },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, locale, dateLocale } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Close mobile sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    if (h < 6) return t("greeting.lateNight");
    if (h < 12) return t("greeting.morning");
    if (h < 14) return t("greeting.noon");
    if (h < 18) return t("greeting.afternoon");
    return t("greeting.evening");
  };

  const isEn = locale === "en-US";

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border/50 px-4 md:h-16">
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
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
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
                title={collapsed ? t(item.labelKey) : undefined}
              >
                <item.icon className={`h-[1.125rem] w-[1.125rem] shrink-0 ${isActive ? "text-primary" : ""}`} />
                {!collapsed && <span className="whitespace-nowrap">{t(item.labelKey)}</span>}
                {!collapsed && isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* AI Assistant button in sidebar */}
        <div className="mt-4 border-t border-border/30 pt-4">
          {!collapsed && (
            <div className="mb-1.5 px-3 text-[0.6875rem] text-muted-foreground/60 uppercase tracking-wider" style={{ fontWeight: 600 }}>
              {isEn ? "Tools" : "工具"}
            </div>
          )}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all text-[0.875rem] ${
              chatOpen
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
            style={{ fontWeight: chatOpen ? 600 : 400 }}
            title={collapsed ? "AI 助手" : undefined}
          >
            <MessageSquare className={`h-[1.125rem] w-[1.125rem] shrink-0 ${chatOpen ? "text-primary" : ""}`} />
            {!collapsed && <span className="whitespace-nowrap">{isEn ? "AI Assistant" : "AI 助手"}</span>}
            {!collapsed && (
              <div className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full text-[0.625rem] transition-colors ${
                chatOpen ? "bg-primary text-white" : "bg-muted text-muted-foreground"
              }`} style={{ fontWeight: 600 }}>
                {chatOpen ? (isEn ? "On" : "开") : (isEn ? "Off" : "关")}
              </div>
            )}
          </button>

          <button
            onClick={() => navigate("/thinkclaw")}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all text-[0.875rem] text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            style={{ fontWeight: 400 }}
            title={collapsed ? "ThinkClaw" : undefined}
          >
            <Zap className="h-[1.125rem] w-[1.125rem] shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">ThinkClaw</span>}
            {!collapsed && (
              <Badge className="ml-auto bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-primary border-0 text-[0.5625rem] px-1.5 py-0">
                New
              </Badge>
            )}
          </button>
        </div>

        {/* Upgrade card */}
        {!collapsed && (
          <div className="mt-6 rounded-xl bg-gradient-to-br from-primary/10 via-secondary to-accent p-4">
            <div className="mb-2 flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-[0.8125rem] text-primary" style={{ fontWeight: 600 }}>{t("sidebar.upgradePro")}</span>
            </div>
            <p className="mb-3 text-[0.75rem] text-muted-foreground leading-relaxed">
              {t("sidebar.upgradeDesc")}
            </p>
            <Link to="/pricing">
              <Button size="sm" className="w-full rounded-lg bg-primary text-[0.8125rem] text-white hover:bg-primary/90">
                {t("sidebar.viewPlans")}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Bottom items */}
      <div className="border-t border-border/50 px-3 py-3">
        <div className="space-y-1">
          {bottomItemsDef.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[0.8125rem] transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
                style={{ fontWeight: isActive ? 600 : 400 }}
                title={collapsed ? t(item.labelKey) : undefined}
              >
                <item.icon className={`h-[1.125rem] w-[1.125rem] shrink-0 ${isActive ? "text-primary" : ""}`} />
                {!collapsed && <span className="whitespace-nowrap">{t(item.labelKey)}</span>}
              </button>
            );
          })}
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
        className={`relative hidden md:flex flex-col border-r border-border/50 bg-card/90 backdrop-blur-sm transition-all duration-300 ${
          collapsed ? "w-[68px]" : "w-[260px]"
        }`}
        style={{ zIndex: 1 }}
      >
        {sidebarContent}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-[4.5rem] z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border/60 bg-card text-muted-foreground shadow-sm hover:text-foreground transition-colors"
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
              className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-card shadow-xl md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area + inline AI panel */}
      <div className="relative flex flex-1 flex-col overflow-hidden" style={{ zIndex: 1 }}>
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/50 bg-card/80 backdrop-blur-xl px-3 sm:h-16 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              className="rounded-lg p-2 hover:bg-muted/60 transition-colors md:hidden shrink-0"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-[0.875rem] sm:text-[1rem] tracking-tight truncate" style={{ fontWeight: 600 }}>
                {getGreeting()}{isEn ? ", " : "，"}{user?.name || (isEn ? "User" : "用户")}
              </h1>
              <p className="text-[0.6875rem] sm:text-[0.75rem] text-muted-foreground truncate">
                {new Date().toLocaleDateString(dateLocale, { month: "long", day: "numeric", weekday: "long" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
              title="搜索 (⌘K)"
            >
              <Search className="h-[1.125rem] w-[1.125rem]" />
            </button>
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
              >
                <Bell className="h-[1.125rem] w-[1.125rem]" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
              </button>
              <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            {/* AI toggle button */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`relative rounded-lg p-2 transition-colors ${
                chatOpen
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
              title="AI 助手"
            >
              <MessageSquare className="h-[1.125rem] w-[1.125rem]" />
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary">
                <Sparkles className="h-2 w-2 text-white" />
              </span>
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

        {/* Content row: main + AI panel side by side */}
        <div className="flex flex-1 overflow-hidden">
          {/* Page content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet context={{ activeTab, setActiveTab } satisfies AppOutletContext} />
          </main>

          {/* AI Chat — inline on desktop, overlay on mobile */}
          <AIChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(tab) => setActiveTab(tab as DashboardTab)}
      />
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