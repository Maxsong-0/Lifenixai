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
  CheckCircle2,
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

const features = [
  {
    icon: CalendarDays,
    title: "智能日程管理",
    desc: "AI 自动分析你的时间安排，智能推荐最佳日程，再也不会遗漏重要事项。",
    color: "bg-purple-100 text-purple-600",
    details: [
      "自然语言输入：说「明天下午3点开会」即可创建日程",
      "智能冲突检测：自动发现时间冲突并建议调整方案",
      "日/周/月多维度视图切换，全局掌握时间安排",
      "支持重复日程和跨时区同步",
    ],
  },
  {
    icon: ListTodo,
    title: "任务追踪与提醒",
    desc: "创建、分类和追踪任务，设置智能提醒，确保每件事都按时完成。",
    color: "bg-blue-100 text-blue-600",
    details: [
      "任务优先级智能排序：AI 根据截止日期和重要性自动排列",
      "子任务拆解：将大项目分解为可执行的小步骤",
      "多种提醒方式：推送通知、邮件、定时提醒",
      "任务进度可视化，完成率一目了然",
    ],
  },
  {
    icon: MessageSquare,
    title: "AI 智能对话",
    desc: "随时与AI助手对话，获取建议、解答问题，帮助你做出更好的决策。",
    color: "bg-emerald-100 text-emerald-600",
    details: [
      "上下文理解：AI 记住你的对话历史，提供连贯的交流体验",
      "多场景支持：工作规划、学习辅导、生活建议",
      "一键生成：日报、周报、邮件回复等文本内容",
      "知识问答：快速获取各领域的专业解答",
    ],
  },
  {
    icon: Brain,
    title: "个性化 AI 建议",
    desc: "基于你的习惯和偏好，AI 持续学习并提供越来越精准的个性化建议。",
    color: "bg-amber-100 text-amber-600",
    details: [
      "行为模式分析：了解你的高效时段和习惯偏好",
      "个性化效率报告：每周生成专属效率提升建议",
      "目标追踪：帮你制定和跟踪中长期目标",
      "智能推荐：根据你的兴趣推荐学习和成长资源",
    ],
  },
  {
    icon: BarChart3,
    title: "数据统计与洞察",
    desc: "可视化你的时间使用和任务完成情况，用数据驱动效率提升。",
    color: "bg-rose-100 text-rose-600",
    details: [
      "时间分配图表：清晰展示你把时间花在了哪里",
      "效率趋势分析：周/月维度追踪效率变化",
      "任务完成率统计：按分类查看各领域完成情况",
      "AI 洞察报告：自动生成改进建议",
    ],
  },
  {
    icon: Shield,
    title: "隐私与数据安全",
    desc: "端到端加密保护你的隐私数据，你的信息只属于你自己。",
    color: "bg-cyan-100 text-cyan-600",
    details: [
      "AES-256 加密存储，数据传输全程 TLS 保护",
      "本地数据优先：核心数据存储在你的设备上",
      "支持数据导出和账号删除，你完全掌控自己的数据",
      "通过 SOC 2 安全合规认证",
    ],
  },
];

const howItWorks = [
  {
    step: "01",
    title: "30秒极速注册",
    desc: "仅需邮箱即可创建账号，无需复杂的设置流程。注册即可立即使用所有免费功能，零门槛开始你的高效之旅。",
    icon: Sparkles,
    color: "text-purple-600 bg-purple-100",
    img: "https://images.unsplash.com/photo-1760604359590-0f0dc7dbbf3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0aXZlJTIwd29ya3NwYWNlJTIwbWluaW1hbCUyMGRlc2t8ZW58MXx8fHwxNzcyMTI3OTM2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    step: "02",
    title: "AI 了解你的需求",
    desc: "告诉 AI 你的日常习惯、工作节奏和生活偏好。它会根据你的场景智能配置工作台，并随着使用越来越懂你。",
    icon: Brain,
    color: "text-blue-600 bg-blue-100",
    img: "https://images.unsplash.com/photo-1769794370964-78412732f1cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwc3R1ZHlpbmclMjBvcmdhbml6ZWQlMjBkZXNrfGVufDF8fHx8MTc3MjEyODg0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    step: "03",
    title: "一站式高效管理",
    desc: "在统一的工作台中管理所有任务、日程和笔记。AI 助手随时待命，帮你优化安排、生成内容、做出决策。",
    icon: Layers,
    color: "text-emerald-600 bg-emerald-100",
    img: "https://images.unsplash.com/photo-1762341119317-fb5417c18407?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMG9mZmljZSUyMGxhcHRvcHxlbnwxfHx8fDE3NzIxMjg4NTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    step: "04",
    title: "持续进化，越用越好",
    desc: "AI 持续学习你的行为模式，每周生成个性化效率报告和改进建议。你的效率会随着使用时间的增长持续提升。",
    icon: TrendingUp,
    color: "text-amber-600 bg-amber-100",
    img: "https://images.unsplash.com/photo-1594735974070-b678995b9f09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBoYXBweSUyMGhvbWUlMjBsaWZlc3R5bGV8ZW58MXx8fHwxNzcyMTI3OTM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

const personas = [
  {
    icon: Briefcase,
    title: "上班族",
    desc: "项目管理、会议安排、邮件处理、日报周报自动生成，让工作更有条理。",
    color: "bg-blue-100 text-blue-600",
    img: "https://images.unsplash.com/photo-1762341119317-fb5417c18407?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMG9mZmljZSUyMGxhcHRvcHxlbnwxfHx8fDE3NzIxMjg4NTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    icon: GraduationCap,
    title: "学生",
    desc: "课程表管理、作业追踪、考试复习计划、学习资料整理，学业轻松搞定。",
    color: "bg-purple-100 text-purple-600",
    img: "https://images.unsplash.com/photo-1769794370964-78412732f1cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwc3R1ZHlpbmclMjBvcmdhbml6ZWQlMjBkZXNrfGVufDF8fHx8MTc3MjEyODg0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    icon: Home,
    title: "家庭用户",
    desc: "家庭日程协调、孩子课外班管理、购物清单、家务分配，家庭生活井然有序。",
    color: "bg-emerald-100 text-emerald-600",
    img: "https://images.unsplash.com/photo-1660578570016-d1ad0176e24f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBwbGFubmluZyUyMGNhbGVuZGFyJTIwaG9tZXxlbnwxfHx8fDE3NzIxMjg4NTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    icon: Heart,
    title: "老年用户",
    desc: "大字体友好界面、用药提醒、健康记录、语音输入，科技关怀每一天。",
    color: "bg-amber-100 text-amber-600",
    img: "https://images.unsplash.com/photo-1758691030817-a6271a533c42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwcGVyc29uJTIwdXNpbmclMjB0YWJsZXQlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc3MjEyODg1MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

const testimonials = [
  { name: "张伟", role: "产品经理", content: "Lifenix AI 彻底改变了我的工作方式。以前每天花30分钟整理任务和日程，现在AI自动帮我规划好，效率提升了不止一倍。", avatar: "Z", rating: 5 },
  { name: "李萌", role: "大学生", content: "课程、作业、社团活动安排得满满的，以前总是顾此失彼。现在一个App全搞定，考试复习计划AI帮我制定，成绩都提高了！", avatar: "L", rating: 5 },
  { name: "王芳", role: "全职妈妈", content: "管理两个孩子的课外班、家庭采购清单、自己的工作安排，以前用3个App。Lifenix AI 一个就够了，还会智能提醒，太省心了。", avatar: "W", rating: 5 },
  { name: "陈明", role: "自由职业者", content: "作为自由职业者，时间管理就是金钱。AI助手帮我合理分配工作和休息时间，月收入提升了20%，身体状态也更好了。", avatar: "C", rating: 5 },
];

const stats = [
  { value: "100K+", label: "活跃用户", icon: Users },
  { value: "50M+", label: "任务完成", icon: CheckCircle2 },
  { value: "30+", label: "覆盖国家", icon: Globe },
  { value: "4.9", label: "用户评分", icon: Star },
];

const highlights = [
  { icon: Zap, label: "即时响应" },
  { icon: RefreshCw, label: "自动同步" },
  { icon: Smartphone, label: "多端支持" },
  { icon: Lock, label: "数据加密" },
  { icon: Bell, label: "智能提醒" },
  { icon: Target, label: "目标追踪" },
];

const faqs = [
  { q: "Lifenix AI 是免费的吗？", a: "是的！基础功能完全免费，包括任务管理、日程安排和每日 20 次 AI 对话。如果你需要无限 AI 对话、高级数据分析和优先客服支持，可以升级到 Pro 计划，月付仅需 ¥29。" },
  { q: "我的数据安全吗？", a: "绝对安全。我们使用 AES-256 加密存储和 TLS 传输加密，通过 SOC 2 合规认证。你可以随时导出或删除你的所有数据，我们承诺永远不会出售用户数据。" },
  { q: "AI 助手能做什么？", a: "AI 助手可以帮你优化日程安排、分析任务优先级、生成工作报告、回答各类知识问题、提供效率改进建议，还能根据你的习惯做出个性化推荐。它会随着你的使用变得越来越智能。" },
  { q: "支持哪些设备和平台？", a: "目前支持 Web 浏览器（Chrome、Safari、Firefox、Edge）访问。iOS 和 Android 原生应用正在开发中，预计 2026 年 Q3 上线。你的数据会在所有设备间自动同步。" },
  { q: "如何取消订阅？", a: "你可以随时在设置页面一键取消订阅，无需联系客服。取消后，你的 Pro 功能会保留到当前付费周期结束，之后自动降级为免费版，你的所有数据都会被保留。" },
];

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

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
              <span className="text-[0.875rem]">AI 驱动的全能生活助理</span>
            </div>
            <h1 className="mb-6 text-[2.5rem] leading-[1.15] tracking-tight sm:text-[3.5rem]" style={{ fontWeight: 800 }}>
              让生活更简单
              <br />
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                让效率升级
              </span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-[1.125rem] text-muted-foreground leading-relaxed">
              Lifenix AI 是你的全能生活助理。管理日程、追踪任务、智能对话，
              一个平台解决所有需求。告别混乱，拥抱高效。
            </p>

            {/* Highlight badges */}
            <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
              {highlights.map((h) => (
                <div key={h.label} className="flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1.5">
                  <h.icon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[0.8125rem] text-muted-foreground">{h.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/register">
                <Button
                  size="lg"
                  className="h-13 rounded-full bg-primary px-8 text-white shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all"
                >
                  免费开始使用
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="h-13 rounded-full px-8">
                  查看定价方案
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
                <span className="ml-3 text-[0.75rem] text-muted-foreground">Lifenix AI — 工作台</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                <div className="border-r border-border/30 p-6">
                  <div className="mb-4 flex items-center gap-2 text-primary">
                    <ListTodo className="h-5 w-5" />
                    <span className="text-[0.875rem]" style={{ fontWeight: 600 }}>今日任务</span>
                  </div>
                  {["完成项目报告", "团队周会 14:00", "回复客户邮件", "健身 1小时"].map((t, i) => (
                    <div key={i} className="mb-2 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                      <div className={`h-2 w-2 rounded-full ${i === 0 ? "bg-green-500" : i === 1 ? "bg-amber-500" : "bg-muted-foreground/30"}`} />
                      <span className="text-[0.8125rem] text-foreground/80">{t}</span>
                    </div>
                  ))}
                </div>
                <div className="border-r border-border/30 p-6">
                  <div className="mb-4 flex items-center gap-2 text-primary">
                    <CalendarDays className="h-5 w-5" />
                    <span className="text-[0.875rem]" style={{ fontWeight: 600 }}>日程安排</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { time: "09:00", event: "晨间复盘", color: "bg-purple-500" },
                      { time: "10:30", event: "产品评审会", color: "bg-blue-500" },
                      { time: "14:00", event: "团队周会", color: "bg-amber-500" },
                      { time: "16:00", event: "客户沟通", color: "bg-emerald-500" },
                    ].map((e, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
                        <span className="text-[0.75rem] text-muted-foreground w-10">{e.time}</span>
                        <div className={`h-6 w-1 rounded-full ${e.color}`} />
                        <span className="text-[0.8125rem]">{e.event}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-2 text-primary">
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-[0.875rem]" style={{ fontWeight: 600 }}>AI 助手</span>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-lg bg-primary/10 px-3 py-2">
                      <p className="text-[0.8125rem] text-primary">你今天有4个任务待完成，建议优先处理项目报告。</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 px-3 py-2">
                      <p className="text-[0.8125rem] text-foreground/80">好的，帮我安排一下今天的时间。</p>
                    </div>
                    <div className="rounded-lg bg-primary/10 px-3 py-2">
                      <p className="text-[0.8125rem] text-primary">已为你优化日程，下午留出了1小时健身时间。</p>
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
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <s.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
              <div className="text-[1.75rem] text-foreground" style={{ fontWeight: 700 }}>{s.value}</div>
              <div className="text-[0.875rem] text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-24 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-6 max-w-2xl text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-primary">
              <Zap className="h-4 w-4" />
              <span className="text-[0.875rem]">核心功能</span>
            </div>
            <h2 className="mb-4 text-[2rem] tracking-tight sm:text-[2.5rem]" style={{ fontWeight: 700 }}>
              一个平台，解决所有需求
            </h2>
            <p className="text-[1.0625rem] text-muted-foreground leading-relaxed">
              不再需要在多个应用之间来回切换。Lifenix AI 将你需要的一切整合在一起，
              每个功能都经过精心设计，让你用起来得心应手。
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group rounded-2xl border border-border/50 bg-white p-7 transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-[1.125rem]" style={{ fontWeight: 600 }}>{f.title}</h3>
                <p className="text-[0.9375rem] text-muted-foreground leading-relaxed mb-4">{f.desc}</p>

                {/* Expandable details */}
                <button
                  onClick={() => setExpandedFeature(expandedFeature === i ? null : i)}
                  className="flex items-center gap-1 text-[0.8125rem] text-primary hover:underline transition-colors"
                  style={{ fontWeight: 500 }}
                >
                  {expandedFeature === i ? "收起详情" : "了解更多"}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expandedFeature === i ? "rotate-180" : ""}`} />
                </button>

                {expandedFeature === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 space-y-2"
                  >
                    {f.details.map((d, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="text-[0.8125rem] text-muted-foreground leading-relaxed">{d}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gradient-to-b from-primary/5 to-transparent px-4 py-24 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-6 max-w-2xl text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-primary">
              <Clock className="h-4 w-4" />
              <span className="text-[0.875rem]">快速上手</span>
            </div>
            <h2 className="mb-4 text-[2rem] tracking-tight sm:text-[2.5rem]" style={{ fontWeight: 700 }}>
              四步开始你的高效生活
            </h2>
            <p className="text-[1.0625rem] text-muted-foreground leading-relaxed">
              从注册到享受AI带来的效率提升，整个过程不到3分钟。
            </p>
          </motion.div>

          <div className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-12 lg:gap-y-16">
            {howItWorks.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="flex flex-col sm:flex-row gap-6 items-start"
              >
                {/* Step indicator */}
                <div className="shrink-0">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${item.color}`}>
                    <item.icon className="h-7 w-7" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[0.8125rem] text-primary" style={{ fontWeight: 700 }}>
                      STEP {item.step}
                    </span>
                  </div>
                  <h3 className="mb-2 text-[1.25rem]" style={{ fontWeight: 600 }}>{item.title}</h3>
                  <p className="text-[0.9375rem] text-muted-foreground leading-relaxed">{item.desc}</p>

                  {/* Image preview */}
                  <div className="mt-4 overflow-hidden rounded-xl border border-border/40">
                    <ImageWithFallback
                      src={item.img}
                      alt={item.title}
                      className="h-48 w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-6 max-w-2xl text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-primary">
              <Users className="h-4 w-4" />
              <span className="text-[0.875rem]">适用人群</span>
            </div>
            <h2 className="mb-4 text-[2rem] tracking-tight sm:text-[2.5rem]" style={{ fontWeight: 700 }}>
              为每一种生活方式而设计
            </h2>
            <p className="text-[1.0625rem] text-muted-foreground leading-relaxed">
              无论你是学生、上班族还是家庭用户，Lifenix AI 都能完美适配你的需求。
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {personas.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group overflow-hidden rounded-2xl border border-border/50 bg-white transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <ImageWithFallback
                    src={p.img}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${p.color}`}>
                    <p.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1.5 text-[1.0625rem]" style={{ fontWeight: 600 }}>{p.title}</h3>
                  <p className="text-[0.875rem] text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-b from-transparent via-primary/3 to-transparent px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-16 max-w-2xl text-center"
          >
            <h2 className="mb-4 text-[2rem] tracking-tight sm:text-[2.5rem]" style={{ fontWeight: 700 }}>
              超过 100,000 名用户的信赖之选
            </h2>
            <p className="text-[1.0625rem] text-muted-foreground leading-relaxed">
              听听他们怎么说。
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border/50 bg-white p-6"
              >
                <div className="mb-3 flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-5 text-[0.9375rem] text-foreground/80 leading-relaxed">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary" style={{ fontWeight: 600 }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-[0.9375rem]" style={{ fontWeight: 600 }}>{t.name}</div>
                    <div className="text-[0.8125rem] text-muted-foreground">{t.role}</div>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-[2rem] tracking-tight sm:text-[2.5rem]" style={{ fontWeight: 700 }}>
              常见问题
            </h2>
            <p className="text-[1.0625rem] text-muted-foreground">
              还有其他疑问？欢迎联系我们的客服团队。
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border/50 bg-white overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                >
                  <span className="text-[0.9375rem] pr-4" style={{ fontWeight: 500 }}>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-6 pb-5"
                  >
                    <p className="text-[0.9375rem] text-muted-foreground leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary/60 via-purple-300 to-pink-200 p-12 text-center text-white sm:p-16"
        >
          <h2 className="mb-4 text-[2rem] sm:text-[2.5rem]" style={{ fontWeight: 700, color: "white" }}>
            准备好让生活升级了吗？
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-[1.0625rem] text-white/80 leading-relaxed">
            加入超过 100,000 名用户，体验 AI 驱动的全新生活方式。免费开始，无需信用卡。
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/register">
              <Button
                size="lg"
                className="h-13 rounded-full bg-white px-8 text-primary shadow-lg hover:bg-white/90 transition-all"
              >
                立即免费开始
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button
                variant="outline"
                size="lg"
                className="h-13 rounded-full border-primary/30 px-8 text-primary hover:bg-primary/10"
              >
                查看 Pro 方案
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-[1.125rem]" style={{ fontWeight: 700 }}>
                  Lifenix AI
                </span>
              </div>
              <p className="text-[0.875rem] text-muted-foreground leading-relaxed">
                AI 驱动的全能生活助理平台，让生活更简单、更高效。
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-[0.875rem]" style={{ fontWeight: 600 }}>产品</h4>
              <div className="space-y-2">
                {["功能介绍", "定价方案", "更新日志", "API 文档"].map((item) => (
                  <div key={item} className="text-[0.875rem] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">{item}</div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-[0.875rem]" style={{ fontWeight: 600 }}>公司</h4>
              <div className="space-y-2">
                {["关于我们", "博客", "招聘", "联系方式"].map((item) => (
                  <div key={item} className="text-[0.875rem] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">{item}</div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-[0.875rem]" style={{ fontWeight: 600 }}>支持</h4>
              <div className="space-y-2">
                {["帮助中心", "社区论坛", "隐私政策", "服务条款"].map((item) => (
                  <div key={item} className="text-[0.875rem] text-muted-foreground cursor-pointer hover:text-foreground transition-colors">{item}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-border/50 pt-6 text-center text-[0.8125rem] text-muted-foreground">
            &copy; 2026 Lifenix AI. All rights reserved. | 技术栈: Vite + React 前端 / Java 后端
          </div>
        </div>
      </footer>
    </div>
  );
}