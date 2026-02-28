import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import { Sparkles, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    setActiveHash(window.location.hash);
    const onHashChange = () => setActiveHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [location]);

  const isActive = (path: string, hash?: string) => {
    if (hash) {
      return location.pathname === "/" && activeHash === hash;
    }
    return location.pathname === path && !activeHash;
  };

  const scrollToHash = (hash: string) => {
    setActiveHash(hash);
    if (location.pathname === "/") {
      // Already on landing page, just scroll
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      // Navigate to landing page first, then scroll after render
      navigate("/");
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/70 backdrop-blur-xl">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo - left */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-[1.25rem] tracking-tight text-foreground" style={{ fontWeight: 700 }}>
            Lifenix<span className="text-primary"> AI</span>
          </span>
        </Link>

        {/* Desktop Nav - absolutely centered */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 md:flex">
          <Link to="/" onClick={() => setActiveHash("")}>
            <Button variant={isActive("/") ? "secondary" : "ghost"} size="sm">
              {t("nav.home")}
            </Button>
          </Link>
          <Button variant={isActive("/", "#features") ? "secondary" : "ghost"} size="sm" onClick={() => scrollToHash("#features")}>
            {t("nav.features")}
          </Button>
          <Button variant={isActive("/", "#how-it-works") ? "secondary" : "ghost"} size="sm" onClick={() => scrollToHash("#how-it-works")}>
            {t("nav.howItWorks")}
          </Button>
          <Link to="/pricing" onClick={() => setActiveHash("")}>
            <Button variant={isActive("/pricing") ? "secondary" : "ghost"} size="sm">
              {t("nav.pricing")}
            </Button>
          </Link>
        </div>

        {/* Right side - auth buttons */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button size="sm" className="rounded-full bg-primary px-5 text-white hover:bg-primary/90">
                  <LayoutDashboard className="mr-1.5 h-4 w-4" />
                  {t("nav.dashboard")}
                </Button>
              </Link>
              <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[0.6875rem] text-white" style={{ fontWeight: 600 }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-[0.8125rem] text-primary" style={{ fontWeight: 500 }}>
                  {user.name}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
                <LogOut className="mr-1.5 h-4 w-4" />
                {t("nav.logout")}
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  {t("nav.login")}
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="rounded-full bg-primary px-5 text-white hover:bg-primary/90">
                  {t("nav.register")}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border bg-card/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-2 px-4 py-4">
              {user && (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  className="mb-2 flex items-center gap-2.5 rounded-xl bg-primary/5 px-3 py-2.5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[0.8125rem] text-white" style={{ fontWeight: 600 }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[0.875rem]" style={{ fontWeight: 600 }}>{user.name}</div>
                    <div className="text-[0.75rem] text-muted-foreground">{user.email}</div>
                  </div>
                </motion.div>
              )}
              {[
                { to: "/", label: t("nav.home"), isLink: true },
                { to: "/#features", label: t("nav.features"), isLink: false, hash: "#features" },
                { to: "/#how-it-works", label: t("nav.howItWorks"), isLink: false, hash: "#how-it-works" },
                { to: "/pricing", label: t("nav.pricing"), isLink: true },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                >
                  {item.isLink ? (
                    <Link to={item.to} onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">{item.label}</Button>
                    </Link>
                  ) : (
                    <Button variant="ghost" className="w-full justify-start" onClick={() => { scrollToHash(item.hash!); setMobileOpen(false); }}>
                      {item.label}
                    </Button>
                  )}
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-2 flex gap-2"
              >
                {user ? (
                  <>
                    <Link to="/dashboard" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full bg-primary text-white">
                        <LayoutDashboard className="mr-1.5 h-4 w-4" />
                        {t("nav.dashboard")}
                      </Button>
                    </Link>
                    <Button variant="outline" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full">{t("nav.login")}</Button>
                    </Link>
                    <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full bg-primary text-white">{t("nav.register")}</Button>
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}