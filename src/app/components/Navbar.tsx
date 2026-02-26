import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { useAuth } from "./AuthContext";
import { Sparkles, Menu, X, LogOut, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/70 backdrop-blur-xl">
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
          <Link to="/">
            <Button variant={location.pathname === "/" ? "secondary" : "ghost"} size="sm">
              首页
            </Button>
          </Link>
          <a href="/#features">
            <Button variant="ghost" size="sm">
              功能
            </Button>
          </a>
          <a href="/#how-it-works">
            <Button variant="ghost" size="sm">
              使用流程
            </Button>
          </a>
          <Link to="/pricing">
            <Button variant={location.pathname === "/pricing" ? "secondary" : "ghost"} size="sm">
              定价
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
                  进入工作台
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
                退出
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  登录
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="rounded-full bg-primary px-5 text-white hover:bg-primary/90">
                  免费注册
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
      {mobileOpen && (
        <div className="border-t border-border bg-white/95 backdrop-blur-xl px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {user && (
              <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-primary/5 px-3 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[0.8125rem] text-white" style={{ fontWeight: 600 }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-[0.875rem]" style={{ fontWeight: 600 }}>{user.name}</div>
                  <div className="text-[0.75rem] text-muted-foreground">{user.email}</div>
                </div>
              </div>
            )}
            <Link to="/" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">首页</Button>
            </Link>
            <a href="/#features" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">功能</Button>
            </a>
            <a href="/#how-it-works" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">使用流程</Button>
            </a>
            <Link to="/pricing" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">定价</Button>
            </Link>
            <div className="mt-2 flex gap-2">
              {user ? (
                <>
                  <Link to="/dashboard" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-primary text-white">
                      <LayoutDashboard className="mr-1.5 h-4 w-4" />
                      进入工作台
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">登录</Button>
                  </Link>
                  <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-primary text-white">免费注册</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
