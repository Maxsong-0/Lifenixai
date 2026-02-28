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
import { useLanguage } from "./LanguageContext";

export function PricingPage() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    {
      nameKey: "pricing.plan.0.name",
      priceKey: "pricing.plan.0.price",
      periodKey: "pricing.plan.0.period",
      descKey: "pricing.plan.0.desc",
      icon: Zap,
      color: "text-foreground",
      bgColor: "bg-white",
      borderColor: "border-border/50",
      buttonVariant: "outline" as const,
      features: Array.from({ length: 10 }, (_, i) => ({
        textKey: `pricing.plan.0.f${i}`,
        included: i < 5,
      })),
    },
    {
      nameKey: "pricing.plan.1.name",
      priceKey: "pricing.plan.1.price",
      periodKey: "pricing.plan.1.period",
      descKey: "pricing.plan.1.desc",
      icon: Sparkles,
      color: "text-primary",
      bgColor: "bg-gradient-to-b from-primary/5 to-white",
      borderColor: "border-primary/30",
      buttonVariant: "default" as const,
      popular: true,
      features: Array.from({ length: 10 }, (_, i) => ({
        textKey: `pricing.plan.1.f${i}`,
        included: i < 8,
      })),
    },
    {
      nameKey: "pricing.plan.2.name",
      priceKey: "pricing.plan.2.price",
      periodKey: "pricing.plan.2.period",
      descKey: "pricing.plan.2.desc",
      icon: Crown,
      color: "text-amber-600",
      bgColor: "bg-white",
      borderColor: "border-border/50",
      buttonVariant: "outline" as const,
      saving: t("pricing.saving"),
      features: Array.from({ length: 10 }, (_, i) => ({
        textKey: `pricing.plan.2.f${i}`,
        included: true,
      })),
    },
  ];

  const faqs = Array.from({ length: 5 }, (_, i) => ({
    q: t(`pricing.faq.${i}.q`),
    a: t(`pricing.faq.${i}.a`),
  }));

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
            {t("pricing.badge")}
          </Badge>
          <h1 className="mb-4 text-[2.25rem] tracking-tight sm:text-[3rem]" style={{ fontWeight: 700 }}>
            {t("pricing.title")}
          </h1>
          <p className="text-[1.0625rem] text-muted-foreground leading-relaxed">
            {t("pricing.headerDesc")}
          </p>
        </motion.div>
      </section>

      {/* Plans */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={t(plan.nameKey)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ delay: i * 0.1 }}
              className={`relative overflow-hidden rounded-2xl border ${plan.borderColor} ${plan.bgColor} p-7 transition-shadow hover:shadow-lg`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 rounded-bl-xl bg-primary px-4 py-1.5 text-[0.75rem] text-white" style={{ fontWeight: 600 }}>
                  {t("pricing.popular")}
                </div>
              )}
              {plan.saving && (
                <div className="absolute top-0 right-0 rounded-bl-xl bg-amber-500 px-4 py-1.5 text-[0.75rem] text-white" style={{ fontWeight: 600 }}>
                  {plan.saving}
                </div>
              )}

              <plan.icon className={`mb-3 h-8 w-8 ${plan.color}`} />
              <h3 className="text-[1.25rem]" style={{ fontWeight: 600 }}>{t(plan.nameKey)}</h3>
              <p className="mb-4 text-[0.875rem] text-muted-foreground">{t(plan.descKey)}</p>

              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-[2.5rem]" style={{ fontWeight: 700 }}>{t(plan.priceKey)}</span>
                <span className="text-[0.9375rem] text-muted-foreground">{t(plan.periodKey)}</span>
              </div>

              <Link to="/register">
                <Button
                  variant={plan.buttonVariant}
                  className={`mb-6 w-full rounded-xl h-11 ${
                    plan.popular ? "bg-primary text-white hover:bg-primary/90" : ""
                  }`}
                >
                  {t(plan.priceKey) === "¥0" ? t("pricing.freeCta") : t("pricing.subscribeCta")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <div className="space-y-2.5">
                {plan.features.map((f) => (
                  <div key={f.textKey} className="flex items-start gap-2.5">
                    {f.included ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                    )}
                    <span className={`text-[0.875rem] ${f.included ? "" : "text-muted-foreground/50"}`}>
                      {t(f.textKey)}
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
            <h2 className="mb-3 text-[2rem]" style={{ fontWeight: 700 }}>{t("pricing.faq.title")}</h2>
            <p className="text-[1rem] text-muted-foreground">{t("pricing.faq.subtitle")}</p>
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
