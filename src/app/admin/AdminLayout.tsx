import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../components/LanguageContext";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  CircleDot,
  Brain,
  Settings,
  MessageSquareText,
  BarChart3,
  Sparkles,
  Menu,
  X,
  ChevronLeft,
  LogOut,
  Bell,
  Search,
  Globe,
  Shield,
  ChevronRight,
} from "lucide-react";

export type AdminTab =
  | "dashboard"
  | "users"
  | "subscriptions"
  | "content"
  | "circles"
  | "ai"
  | "analytics"
  | "feedback"
  | "settings";

const navSections = [
  {
    titleKey: "admin.nav.overview",
    items: [
      { key: "dashboard" as AdminTab, labelKey: "admin.nav.dashboard", icon: LayoutDashboard },
      { key: "analytics" as AdminTab, labelKey: "admin.nav.analytics", icon: BarChart3 },
    ],
  },
  {
    titleKey: "admin.nav.manage",
    items: [
      { key: "users" as AdminTab, labelKey: "admin.nav.users", icon: Users },
      { key: "subscriptions" as AdminTab, labelKey: "admin.nav.subscriptions", icon: CreditCard },
      { key: "content" as AdminTab, labelKey: "admin.nav.content", icon: FileText },
      { key: "circles" as AdminTab, labelKey: "admin.nav.circles", icon: CircleDot },
      { key: "ai" as AdminTab, labelKey: "admin.nav.ai", icon: Brain },
    ],
  },
  {
    titleKey: "admin.nav.system",
    items: [
      { key: "feedback" as AdminTab, labelKey: "admin.nav.feedback", icon: MessageSquareText },
      { key: "settings" as AdminTab, labelKey: "admin.nav.settings", icon: Settings },
    ],
  },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, locale, setLocale } = useLanguage();
  const isEn = locale === "en-US";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeTab: AdminTab = (() => {
    const path = location.pathname.replace("/admin", "").replace("/", "");
    if (!path || path === "") return "dashboard";
    return path as AdminTab;
  })();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-border/50 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <Shield className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-[0.9375rem] tracking-tight" style={{ fontWeight: 700 }}>
              Lifenix<span className="text-primary"> Admin</span>
            </span>
            <span className="text-[0.625rem] text-muted-foreground">{t("admin.nav.controlPanel")}</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section) => (
          <div key={section.titleKey}>
            {!collapsed && (
              <div className="mb-2 px-2 text-[0.625rem] text-muted-foreground/60 uppercase tracking-wider" style={{ fontWeight: 600 }}>
                {t(section.titleKey)}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = activeTab === item.key;
                return (
                  <Link
                    key={item.key}
                    to={item.key === "dashboard" ? "/admin" : `/admin/${item.key}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <button
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[0.8125rem] transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      } ${collapsed ? "justify-center px-2" : ""}`}
                      style={{ fontWeight: isActive ? 600 : 400 }}
                    >
                      <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`} />
                      {!collapsed && <span>{t(item.labelKey)}</span>}
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border/50 p-3 space-y-2">
        <button
          onClick={() => setLocale(isEn ? "zh-CN" : "en-US")}
          className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[0.8125rem] text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all ${collapsed ? "justify-center px-2" : ""}`}
        >
          <Globe className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{isEn ? "中文" : "English"}</span>}
        </button>
        <Link to="/">
          <button
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[0.8125rem] text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all ${collapsed ? "justify-center px-2" : ""}`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{t("admin.nav.backToSite")}</span>}
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 relative ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-1/2 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-muted transition-colors -translate-y-1/2"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-60 border-r border-border/50 bg-card md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-border/50 bg-card/70 backdrop-blur-sm px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-1.5" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-[0.9375rem]" style={{ fontWeight: 600 }}>
              {t(`admin.page.${activeTab}`)}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-700 border-0 text-[0.625rem]" style={{ fontWeight: 500 }}>
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1" />
              {t("admin.status.online")}
            </Badge>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[0.75rem] text-white" style={{ fontWeight: 600 }}>
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}