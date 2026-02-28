import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CircleCheck,
} from "lucide-react";
import { motion } from "motion/react";

export function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) return setError(t("auth.login.error.email"));
    if (!password) return setError(t("auth.login.error.password"));

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || t("auth.login.error.failed"));
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px]"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-[1.5rem] tracking-tight" style={{ fontWeight: 700 }}>
              Lifenix<span className="text-primary"> AI</span>
            </span>
          </Link>
          <h1 className="text-[1.75rem] tracking-tight" style={{ fontWeight: 700 }}>
            {t("auth.login.title")}
          </h1>
          <p className="mt-2 text-[0.9375rem] text-muted-foreground">
            {t("auth.login.subtitle2")}
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border/50 bg-white p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-[0.8125rem] text-muted-foreground">{t("auth.login.email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  type="email"
                  placeholder={t("auth.login.emailPlaceholder")}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="h-11 rounded-xl pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-[0.8125rem] text-muted-foreground">{t("auth.login.password")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  type={showPwd ? "text" : "password"}
                  placeholder={t("auth.login.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="h-11 rounded-xl pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-destructive/10 px-3 py-2 text-[0.8125rem] text-destructive"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-primary text-white hover:bg-primary/90"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              {loading ? t("auth.login.submitting") : t("auth.login.submit")}
            </Button>
          </form>
        </div>

        {/* Switch to register */}
        <p className="mt-6 text-center text-[0.875rem] text-muted-foreground">
          {t("auth.login.noAccount")}{" "}
          <Link
            to="/register"
            className="text-primary hover:underline"
            style={{ fontWeight: 600 }}
          >
            {t("auth.login.registerLink")}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const passwordChecks = [
    { label: t("auth.register.pwdCheck.chars"), valid: password.length >= 6 },
    { label: t("auth.register.pwdCheck.number"), valid: /\d/.test(password) },
    { label: t("auth.register.pwdCheck.letter"), valid: /[a-zA-Z]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError(t("auth.register.error.name"));
    if (!email.trim()) return setError(t("auth.register.error.email"));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError(t("auth.register.error.emailInvalid"));
    if (password.length < 6) return setError(t("auth.register.error.password"));
    if (password !== confirmPwd) return setError(t("auth.register.error.confirmPassword"));
    if (!agreed) return setError(t("auth.register.error.agreement"));

    setLoading(true);
    const result = await register(email, password, name);
    setLoading(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error || t("auth.register.error.failed"));
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px]"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-[1.5rem] tracking-tight" style={{ fontWeight: 700 }}>
              Lifenix<span className="text-primary"> AI</span>
            </span>
          </Link>
          <h1 className="text-[1.75rem] tracking-tight" style={{ fontWeight: 700 }}>
            {t("auth.register.title")}
          </h1>
          <p className="mt-2 text-[0.9375rem] text-muted-foreground">
            {t("auth.register.subtitle2")}
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border/50 bg-white p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-[0.8125rem] text-muted-foreground">{t("auth.register.yourName")}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  type="text"
                  placeholder={t("auth.register.enterName")}
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  className="h-11 rounded-xl pl-10"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-[0.8125rem] text-muted-foreground">{t("auth.register.email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  type="email"
                  placeholder={t("auth.register.emailPlaceholder")}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="h-11 rounded-xl pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-[0.8125rem] text-muted-foreground">{t("auth.register.setPassword")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  type={showPwd ? "text" : "password"}
                  placeholder={t("auth.register.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="h-11 rounded-xl pl-10 pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  {passwordChecks.map((check) => (
                    <div key={check.label} className="flex items-center gap-1.5">
                      <CircleCheck
                        className={`h-3 w-3 ${check.valid ? "text-emerald-500" : "text-muted-foreground/30"}`}
                      />
                      <span
                        className={`text-[0.75rem] ${check.valid ? "text-emerald-600" : "text-muted-foreground/50"}`}
                      >
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-1.5 block text-[0.8125rem] text-muted-foreground">{t("auth.register.confirmPassword")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  type={showPwd ? "text" : "password"}
                  placeholder={t("auth.register.confirmPlaceholder")}
                  value={confirmPwd}
                  onChange={(e) => { setConfirmPwd(e.target.value); setError(""); }}
                  className="h-11 rounded-xl pl-10"
                  autoComplete="new-password"
                />
              </div>
              {confirmPwd.length > 0 && password !== confirmPwd && (
                <p className="mt-1 text-[0.75rem] text-destructive">{t("auth.register.pwdMismatch")}</p>
              )}
              {confirmPwd.length > 0 && password === confirmPwd && confirmPwd.length >= 6 && (
                <p className="mt-1 text-[0.75rem] text-emerald-600 flex items-center gap-1">
                  <CircleCheck className="h-3 w-3" /> {t("auth.register.pwdMatch")}
                </p>
              )}
            </div>

            {/* Agreement */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => { setAgreed(e.target.checked); setError(""); }}
                className="mt-0.5 h-4 w-4 appearance-none rounded-full border border-border bg-background checked:bg-primary checked:border-primary cursor-pointer relative after:content-[''] after:absolute after:inset-0 after:m-auto after:h-2 after:w-2 after:rounded-full checked:after:bg-background after:hidden checked:after:block"
              />
              <span className="text-[0.8125rem] text-muted-foreground leading-snug">
                {t("auth.register.agreement.pre")}{" "}
                <span className="text-primary cursor-pointer hover:underline">{t("auth.register.agreement.terms")}</span>
                {" "}{t("auth.register.agreement.and")}{" "}
                <span className="text-primary cursor-pointer hover:underline">{t("auth.register.agreement.privacy")}</span>
              </span>
            </label>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-destructive/10 px-3 py-2 text-[0.8125rem] text-destructive"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-primary text-white hover:bg-primary/90"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {loading ? t("auth.register.submitting") : t("auth.register.submit")}
            </Button>
          </form>
        </div>

        {/* Switch to login */}
        <p className="mt-6 text-center text-[0.875rem] text-muted-foreground">
          {t("auth.register.hasAccount")}{" "}
          <Link
            to="/login"
            className="text-primary hover:underline"
            style={{ fontWeight: 600 }}
          >
            {t("auth.register.loginLink")}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
