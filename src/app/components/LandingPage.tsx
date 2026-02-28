import { motion } from "motion/react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  Sparkles,
  CalendarDays,
  ListTodo,
  MessageSquare,
  Brain,
  Zap,
  Shield,
  ArrowRight,
  CircleCheck,
  Star,
  Users,
  Globe,
  GraduationCap,
  Briefcase,
  Home,
  Heart,
  ChevronDown,
  Clock,
  Target,
  RefreshCw,
  Smartphone,
  Lock,
  TrendingUp,
  BarChart3,
  Bell,
  Layers,
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "./LanguageContext";

const featureIcons = [CalendarDays, ListTodo, MessageSquare, Brain, BarChart3, Shield];
const featureColors = [
  "bg-purple-100 text-purple-600",
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
  "bg-cyan-100 text-cyan-600",
];

const hiwIcons = [Sparkles, Brain, Layers, TrendingUp];
const hiwColors = [
  "text-purple-600 bg-purple-100",
  "text-blue-600 bg-blue-100",
  "text-emerald-600 bg-emerald-100",
  "text-amber-600 bg-amber-100",
];
const hiwImages = [
  "https://images.unsplash.com/photo-1760604359590-0f0dc7dbbf3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0aXZlJTIwd29ya3NwYWNlJTIwbWluaW1hbCUyMGRlc2t8ZW58MXx8fHwxNzcyMTI3OTM2fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1769794370964-78412732f1cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwc3R1ZHlpbmclMjBvcmdhbml6ZWQlMjBkZXNrfGVufDF8fHx8MTc3MjEyODg0OXww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1762341119317-fb5417c18407?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMG9mZmljZSUyMGxhcHRvcHxlbnwxfHx8fDE3NzIxMjg4NTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1594735974070-b678995b9f09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBoYXBweSUyMGhvbWUlMjBsaWZlc3R5bGV8ZW58MXx8fHwxNzcyMTI3OTM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
];

const personaIcons = [Briefcase, GraduationCap, Home, Heart];
const personaColors = [
  "bg-blue-100 text-blue-600",
  "bg-purple-100 text-purple-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
];
const personaImages = [hiwImages[2], hiwImages[1], "https://images.unsplash.com/photo-1660578570016-d1ad0176e24f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBwbGFubmluZyUyMGNhbGVuZGFyJTIwaG9tZXxlbnwxfHx8fDE3NzIxMjg4NTB8MA&ixlib=rb-4.1.0&q=80&w=1080", "https://images.unsplash.com/photo-1758691030817-a6271a533c42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwcGVyc29uJTIwdXNpbmclMjB0YWJsZXQlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc3MjEyODg1MHww&ixlib=rb-4.1.0&q=80&w=1080"];

const highlightIcons = [Zap, RefreshCw, Smartphone, Lock, Bell, Target];
const highlightKeys = [
  "landing.highlight.instant",
  "landing.highlight.sync",
  "landing.highlight.multiDevice",
  "landing.highlight.encrypt",
  "landing.highlight.smartRemind",
  "landing.highlight.goalTrack",
];

export function LandingPage() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  const stats = [
    { value: "100K+", labelKey: "landing.stat.users", icon: Users },
    { value: "50M+", labelKey: "landing.stat.tasks", icon: CircleCheck },
    { value: "30+", labelKey: "landing.stat.countries", icon: Globe },
    { value: "4.9", labelKey: "landing.stat.rating", icon: Star },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-16 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-[0.875rem]">{t("landing.hero.badge2")}</span>
            </div>
            <h1 className="mb-6 text-[2.5rem] leading-[1.15] tracking-tight sm:text-[3.5rem]" style={{ fontWeight: 800 }}>
              {t("landing.hero.title1a")}
              <br />
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {t("landing.hero.title2a")}
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-[1.125rem] text-muted-foreground leading-relaxed">
              {t("landing.hero.subtitleFull")}
            </p>

            {/* Highlight badges */}
            <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
              {highlightKeys.map((key, i) => {
                const Icon = highlightIcons[i];
                return (
                  <div key={key} className="flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1.5">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[0.8125rem] text-muted-foreground">{t(key)}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/register">
                <Button size="lg" className="h-13 rounded-full bg-primary px-8 text-white shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all">
                  {t("landing.hero.cta")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="h-13 rounded-full px-8">
                  {t("landing.hero.ctaPricing")}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Hero Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-16 max-w-5xl"
          >
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-2xl shadow-primary/10">
              <div className="flex items-center gap-2 border-b border-border/50 bg-muted/50 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-3 text-[0.75rem] text-muted-foreground">{t("landing.preview.toolbar")}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                <div className="border-r border-border/30 p-6">
                  <div className="mb-4 flex items-center gap-2 text-primary">
                    <ListTodo className="h-5 w-5" />
                    <span className="text-[0.875rem]" style={{ fontWeight: 600 }}>{t("landing.preview.todayTasks")}</span>
                  </div>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="mb-2 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                      <div className={`h-2 w-2 rounded-full ${i === 0 ? "bg-green-500" : i === 1 ? "bg-amber-500" : "bg-muted-foreground/30"}`} />
                      <span className="text-[0.8125rem] text-foreground/80">{t(`landing.preview.task.${i}`)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-r border-border/30 p-6">
                  <div className="mb-4 flex items-center gap-2 text-primary">
                    <CalendarDays className="h-5 w-5" />
                    <span className="text-[0.875rem]" style={{ fontWeight: 600 }}>{t("landing.preview.schedule")}</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { time: "09:00", key: "landing.preview.evt.0", color: "bg-purple-500" },
                      { time: "10:30", key: "landing.preview.evt.1", color: "bg-blue-500" },
                      { time: "14:00", key: "landing.preview.evt.2", color: "bg-amber-500" },
                      { time: "16:00", key: "landing.preview.evt.3", color: "bg-emerald-500" },
                    ].map((e, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
                        <span className="text-[0.75rem] text-muted-foreground w-10">{e.time}</span>
                        <div className={`h-6 w-1 rounded-full ${e.color}`} />
                        <span className="text-[0.8125rem]">{t(e.key)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-2 text-primary">
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-[0.875rem]" style={{ fontWeight: 600 }}>{t("landing.preview.aiTitle")}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-lg bg-primary/10 px-3 py-2">
                      <p className="text-[0.8125rem] text-primary">{t("landing.preview.ai.0")}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 px-3 py-2">
                      <p className="text-[0.8125rem] text-foreground/80">{t("landing.preview.ai.1")}</p>
                    </div>
                    <div className="rounded-lg bg-primary/10 px-3 py-2">
                      <p className="text-[0.8125rem] text-primary">{t("landing.preview.ai.2")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-white py-12 px-4">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <s.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
              <div className="text-[1.75rem] text-foreground" style={{ fontWeight: 700 }}>{s.value}</div>
              <div className="text-[0.875rem] text-muted-foreground">{t(s.labelKey)}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-24 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-6 max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-primary">
              <Zap className="h-4 w-4" />
              <span className="text-[0.875rem]">{t("landing.features.badge")}</span>
            </div>
            <h2 className="mb-4 text-[2rem] tracking-tight sm:text-[2.5rem]" style={{ fontWeight: 700 }}>
              {t("landing.features.heading")}
            </h2>
            <p className="text-[1.0625rem] text-muted-foreground leading-relaxed">
              {t("landing.features.headingDesc")}
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const Icon = featureIcons[i];
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="group rounded-2xl border border-border/50 bg-white p-7 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                  <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${featureColors[i]}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-[1.125rem]" style={{ fontWeight: 600 }}>{t(`landing.feat.${i}.title`)}</h3>
                  <p className="text-[0.9375rem] text-muted-foreground leading-relaxed mb-4">{t(`landing.feat.${i}.desc`)}</p>

                  <button onClick={() => setExpandedFeature(expandedFeature === i ? null : i)}
                    className="flex items-center gap-1 text-[0.8125rem] text-primary hover:underline transition-colors" style={{ fontWeight: 500 }}>
                    {expandedFeature === i ? t("landing.feature.collapse") : t("landing.feature.expand")}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expandedFeature === i ? "rotate-180" : ""}`} />
                  </button>

                  {expandedFeature === i && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-2">
                      {[0, 1, 2, 3].map((j) => (
                        <div key={j} className="flex items-start gap-2">
                          <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          <span className="text-[0.8125rem] text-muted-foreground leading-relaxed">{t(`landing.feat.${i}.d${j}`)}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gradient-to-b from-primary/5 to-transparent px-4 py-24 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-6 max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-primary">
              <Clock className="h-4 w-4" />
              <span className="text-[0.875rem]">{t("landing.hiw.badge")}</span>
            </div>
            <h2 className="mb-4 text-[2rem] tracking-tight sm:text-[2.5rem]" style={{ fontWeight: 700 }}>
              {t("landing.hiw.heading")}
            </h2>
            <p className="text-[1.0625rem] text-muted-foreground leading-relaxed">
              {t("landing.hiw.headingDesc")}
            </p>
          </motion.div>

          <div className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-12 lg:gap-y-16">
            {[0, 1, 2, 3].map((i) => {
              const Icon = hiwIcons[i];
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                  className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="shrink-0">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${hiwColors[i]}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-[0.8125rem] text-primary" style={{ fontWeight: 700 }}>STEP {String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <h3 className="mb-2 text-[1.25rem]" style={{ fontWeight: 600 }}>{t(`landing.hiw.${i}.title`)}</h3>
                    <p className="text-[0.9375rem] text-muted-foreground leading-relaxed">{t(`landing.hiw.${i}.desc`)}</p>
                    <div className="mt-4 overflow-hidden rounded-xl border border-border/40">
                      <ImageWithFallback src={hiwImages[i]} alt={t(`landing.hiw.${i}.title`)} className="h-48 w-full object-cover transition-transform hover:scale-105" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-6 max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-primary">
              <Users className="h-4 w-4" />
              <span className="text-[0.875rem]">{t("landing.personas.badge")}</span>
            </div>
            <h2 className="mb-4 text-[2rem] tracking-tight sm:text-[2.5rem]" style={{ fontWeight: 700 }}>
              {t("landing.personas.heading")}
            </h2>
            <p className="text-[1.0625rem] text-muted-foreground leading-relaxed">
              {t("landing.personas.headingDesc")}
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => {
              const Icon = personaIcons[i];
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="group overflow-hidden rounded-2xl border border-border/50 bg-white transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                  <div className="aspect-[4/3] overflow-hidden">
                    <ImageWithFallback src={personaImages[i]} alt={t(`landing.persona.${i}.title`)} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                  <div className="p-5">
                    <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${personaColors[i]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-1.5 text-[1.0625rem]" style={{ fontWeight: 600 }}>{t(`landing.persona.${i}.title`)}</h3>
                    <p className="text-[0.875rem] text-muted-foreground leading-relaxed">{t(`landing.persona.${i}.desc`)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-b from-transparent via-primary/3 to-transparent px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-[2rem] tracking-tight sm:text-[2.5rem]" style={{ fontWeight: 700 }}>
              {t("landing.testimonials.heading")}
            </h2>
            <p className="text-[1.0625rem] text-muted-foreground leading-relaxed">
              {t("landing.testimonials.headingSub")}
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border/50 bg-white p-6">
                <div className="mb-3 flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-5 text-[0.9375rem] text-foreground/80 leading-relaxed">"{t(`landing.test.${i}.content`)}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary" style={{ fontWeight: 600 }}>
                    {t(`landing.test.${i}.name`).charAt(0)}
                  </div>
                  <div>
                    <div className="text-[0.9375rem]" style={{ fontWeight: 600 }}>{t(`landing.test.${i}.name`)}</div>
                    <div className="text-[0.8125rem] text-muted-foreground">{t(`landing.test.${i}.role`)}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <h2 className="mb-4 text-[2rem] tracking-tight sm:text-[2.5rem]" style={{ fontWeight: 700 }}>
              {t("landing.faq.heading")}
            </h2>
            <p className="text-[1.0625rem] text-muted-foreground">
              {t("landing.faq.headingSub")}
            </p>
          </motion.div>

          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border/50 bg-white overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between px-6 py-4 text-left">
                  <span className="text-[0.9375rem] pr-4" style={{ fontWeight: 500 }}>{t(`landing.faq.${i}.q`)}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 pb-5">
                    <p className="text-[0.9375rem] text-muted-foreground leading-relaxed">{t(`landing.faq.${i}.a`)}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary/60 via-purple-300 to-pink-200 p-12 text-center">
          <h2 className="mb-4 text-[2rem] sm:text-[2.5rem]" style={{ fontWeight: 700, color: "white" }}>
            {t("landing.cta.heading")}
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-[1.0625rem] text-white/80 leading-relaxed">
            {t("landing.cta.desc")}
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/register">
              <Button size="lg" className="h-13 rounded-full bg-white px-8 text-primary shadow-lg hover:bg-white/90 transition-all">
                {t("landing.cta.startFree")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline" size="lg" className="h-13 rounded-full border-primary/30 px-8 text-primary hover:bg-primary/10">
                {t("landing.cta.viewPro")}
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-[1.125rem]" style={{ fontWeight: 700 }}>Lifenix AI</span>
              </div>
              <p className="text-[0.875rem] text-muted-foreground leading-relaxed">
                {t("landing.footer.descFull")}
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-[0.875rem]" style={{ fontWeight: 600 }}>{t("landing.footer.product")}</h4>
              <div className="space-y-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="text-[0.875rem] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">{t(`landing.footer.product.${i}`)}</div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-[0.875rem]" style={{ fontWeight: 600 }}>{t("landing.footer.company")}</h4>
              <div className="space-y-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="text-[0.875rem] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">{t(`landing.footer.company.${i}`)}</div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-[0.875rem]" style={{ fontWeight: 600 }}>{t("landing.footer.support")}</h4>
              <div className="space-y-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="text-[0.875rem] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">{t(`landing.footer.support.${i}`)}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-border/50 pt-6 text-center text-[0.8125rem] text-muted-foreground">
            {t("landing.footer.copyrightFull")}
          </div>
        </motion.div>
      </footer>
    </div>
  );
}
