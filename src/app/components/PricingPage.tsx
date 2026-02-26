import { useState } from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Check,
  X,
  Sparkles,
  Zap,
  Crown,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { motion } from "motion/react";

const plans = [
  {
    name: "免费版",
    price: "¥0",
    period: "永久免费",
    desc: "适合个人用户，体验核心功能",
    icon: Zap,
    color: "text-foreground",
    bgColor: "bg-white",
    borderColor: "border-border/50",
    buttonVariant: "outline" as const,
    features: [
      { text: "基础任务管理（最多50个）", included: true },
      { text: "每日日程安排", included: true },
      { text: "AI 对话（每天20次）", included: true },
      { text: "基础提醒功能", included: true },
      { text: "单设备同步", included: true },
      { text: "无限任务", included: false },
      { text: "高级AI分析", included: false },
      { text: "团队协作", included: false },
      { text: "API 接入", included: false },
      { text: "优先客服支持", included: false },
    ],
  },
  {
    name: "Pro 月付",
    price: "¥29",
    period: "/月",
    desc: "适合高效能人士，解锁全部功能",
    icon: Sparkles,
    color: "text-primary",
    bgColor: "bg-gradient-to-b from-primary/5 to-white",
    borderColor: "border-primary/30",
    buttonVariant: "default" as const,
    popular: true,
    features: [
      { text: "无限任务管理", included: true },
      { text: "智能日程优化", included: true },
      { text: "无限AI 对话", included: true },
      { text: "智能提醒 + 语音提醒", included: true },
      { text: "全设备同步", included: true },
      { text: "高级AI分析与洞察", included: true },
      { text: "自定义AI助手性格", included: true },
      { text: "团队协作（3人）", included: true },
      { text: "API 接入", included: false },
      { text: "专属客户经理", included: false },
    ],
  },
  {
    name: "Pro 年付",
    price: "¥199",
    period: "/年",
    desc: "最优惠方案，节省43%",
    icon: Crown,
    color: "text-amber-600",
    bgColor: "bg-white",
    borderColor: "border-border/50",
    buttonVariant: "outline" as const,
    saving: "节省 ¥149",
    features: [
      { text: "Pro 月付所有功能", included: true },
      { text: "无限团队协作", included: true },
      { text: "API 接入（Java SDK）", included: true },
      { text: "高级数据导出", included: true },
      { text: "专属客户经理", included: true },
      { text: "优先新功能体验", included: true },
      { text: "自定义集成", included: true },
      { text: "企业级安全", included: true },
      { text: "SLA 服务保障", included: true },
      { text: "永久免费升级", included: true },
    ],
  },
];

const faqs = [
  {
    q: "免费版有什么限制？",
    a: "免费版可以使用核心的任务管理和日程功能，AI对话每天20次，任务最多50个，仅支持单设备同步。对于大多数个人用户来说已经足够。",
  },
  {
    q: "Pro版支持退款吗？",
    a: "支持！订阅后7天内可以无理由全额退款。我们对产品充满信心，相信你一定会喜欢。",
  },
  {
    q: "可以随时取消订阅吗？",
    a: "当然可以。你可以随时取消Pro订阅，取消后将在当期结束时恢复为免费版，之前的数据不会丢失。",
  },
  {
    q: "数据安全有保障吗？",
    a: "我们采用端到端加密和企业级安全措施保护你的数据。后端使用Java Spring Boot构建，符合行业安全标准。",
  },
  {
    q: "支持哪些平台？",
    a: "目前支持Web网站访问（Vite + React前端），移动端App正在开发中，预计很快推出iOS和Android版本。",
  },
];

export function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl text-center"
        >
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10">
            简单透明的定价
          </Badge>
          <h1 className="mb-4 text-[2.25rem] tracking-tight sm:text-[3rem]" style={{ fontWeight: 700 }}>
            选择适合你的方案
          </h1>
          <p className="text-[1.0625rem] text-muted-foreground leading-relaxed">
            基础功能永久免费。需要更强大的AI能力？升级到 Pro，解锁全部功能。
          </p>
        </motion.div>
      </section>

      {/* Plans */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ delay: i * 0.1 }}
              className={`relative overflow-hidden rounded-2xl border ${plan.borderColor} ${plan.bgColor} p-7 transition-shadow hover:shadow-lg`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 rounded-bl-xl bg-primary px-4 py-1.5 text-[0.75rem] text-white" style={{ fontWeight: 600 }}>
                  最受欢迎
                </div>
              )}
              {plan.saving && (
                <div className="absolute top-0 right-0 rounded-bl-xl bg-amber-500 px-4 py-1.5 text-[0.75rem] text-white" style={{ fontWeight: 600 }}>
                  {plan.saving}
                </div>
              )}

              <plan.icon className={`mb-3 h-8 w-8 ${plan.color}`} />
              <h3 className="text-[1.25rem]" style={{ fontWeight: 600 }}>{plan.name}</h3>
              <p className="mb-4 text-[0.875rem] text-muted-foreground">{plan.desc}</p>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-[2.5rem]" style={{ fontWeight: 700 }}>{plan.price}</span>
                <span className="text-[0.9375rem] text-muted-foreground">{plan.period}</span>
              </div>

              <Link to="/register">
                <Button
                  variant={plan.buttonVariant}
                  className={`mb-6 w-full rounded-xl h-11 ${
                    plan.popular ? "bg-primary text-white hover:bg-primary/90" : ""
                  }`}
                >
                  {plan.price === "¥0" ? "免费开始" : "立即订阅"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <div className="space-y-2.5">
                {plan.features.map((f) => (
                  <div key={f.text} className="flex items-start gap-2.5">
                    {f.included ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                    )}
                    <span className={`text-[0.875rem] ${f.included ? "" : "text-muted-foreground/50"}`}>
                      {f.text}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border/50 bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-3 text-[2rem]" style={{ fontWeight: 700 }}>常见问题</h2>
            <p className="text-[1rem] text-muted-foreground">有其他疑问？随时联系我们的客服团队。</p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="overflow-hidden rounded-xl border border-border/50"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="text-[0.9375rem] pr-4" style={{ fontWeight: 500 }}>{faq.q}</span>
                  <HelpCircle className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180 text-primary" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="border-t border-border/30 px-5 py-4">
                    <p className="text-[0.9375rem] text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}