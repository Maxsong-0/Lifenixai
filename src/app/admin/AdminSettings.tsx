import { useState } from "react";
import { motion } from "motion/react";
import { useLanguage } from "../components/LanguageContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import {
  Settings,
  Globe,
  Bell,
  Shield,
  Mail,
  Server,
  Key,
  Palette,
  Database,
  RefreshCw,
  Save,
  CircleCheck,
  Zap,
} from "lucide-react";

interface SettingSection {
  titleKey: string;
  descKey: string;
  icon: any;
  color: string;
  bg: string;
}

export function AdminSettings() {
  const { t, locale } = useLanguage();
  const isEn = locale === "en-US";

  const [settings, setSettings] = useState({
    siteName: "Lifenix AI",
    siteUrl: "https://lifenix.ai",
    adminEmail: "admin@lifenix.ai",
    defaultLocale: "zh-CN",
    enableRegistration: true,
    requireEmailVerification: true,
    maintenanceMode: false,
    enableAI: true,
    aiRateLimit: 100,
    maxFreeCircles: 2,
    maxFreeMembers: 3,
    proMonthlyPrice: 29,
    proYearlyPrice: 199,
    enableNotifications: true,
    enableEmailNotifications: true,
    enablePushNotifications: false,
    dataRetentionDays: 365,
    enableAnalytics: true,
    enableCDN: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections: SettingSection[] = [
    { titleKey: "admin.settings.general", descKey: "admin.settings.generalDesc", icon: Settings, color: "text-blue-600", bg: "bg-blue-50" },
    { titleKey: "admin.settings.auth", descKey: "admin.settings.authDesc", icon: Shield, color: "text-purple-600", bg: "bg-purple-50" },
    { titleKey: "admin.settings.ai", descKey: "admin.settings.aiSection", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
    { titleKey: "admin.settings.pricing", descKey: "admin.settings.pricingDesc", icon: Key, color: "text-emerald-600", bg: "bg-emerald-50" },
    { titleKey: "admin.settings.notifications", descKey: "admin.settings.notificationsDesc", icon: Bell, color: "text-rose-600", bg: "bg-rose-50" },
    { titleKey: "admin.settings.data", descKey: "admin.settings.dataDesc", icon: Database, color: "text-cyan-600", bg: "bg-cyan-50" },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[1.25rem]" style={{ fontWeight: 700 }}>{t("admin.settings.title")}</h2>
          <p className="text-[0.8125rem] text-muted-foreground">{t("admin.settings.subtitle")}</p>
        </div>
        <Button size="sm" className="bg-primary text-white text-[0.75rem]">
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {t("common.save")}
        </Button>
      </div>

      {/* General */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border/50 bg-card p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <Settings className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-[0.9375rem]" style={{ fontWeight: 600 }}>{t("admin.settings.general")}</h3>
            <p className="text-[0.6875rem] text-muted-foreground">{t("admin.settings.generalDesc")}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[0.75rem] text-muted-foreground mb-1.5 block">{t("admin.settings.siteName")}</label>
              <Input value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="text-[0.8125rem]" />
            </div>
            <div>
              <label className="text-[0.75rem] text-muted-foreground mb-1.5 block">{t("admin.settings.siteUrl")}</label>
              <Input value={settings.siteUrl} onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })} className="text-[0.8125rem]" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[0.75rem] text-muted-foreground mb-1.5 block">{t("admin.settings.adminEmail")}</label>
              <Input value={settings.adminEmail} onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })} className="text-[0.8125rem]" />
            </div>
            <div>
              <label className="text-[0.75rem] text-muted-foreground mb-1.5 block">{t("admin.settings.defaultLang")}</label>
              <div className="flex items-center rounded-lg border border-border/50 p-0.5">
                {(["zh-CN", "en-US"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setSettings({ ...settings, defaultLocale: l })}
                    className={`flex-1 rounded-md px-3 py-2 text-[0.75rem] transition-all ${
                      settings.defaultLocale === l ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    }`}
                    style={{ fontWeight: settings.defaultLocale === l ? 600 : 400 }}
                  >
                    {l === "zh-CN" ? "简体中文" : "English"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-border/30">
            <div>
              <div className="text-[0.8125rem]" style={{ fontWeight: 500 }}>{t("admin.settings.maintenance")}</div>
              <div className="text-[0.6875rem] text-muted-foreground">{t("admin.settings.maintenanceDesc")}</div>
            </div>
            <Switch checked={settings.maintenanceMode} onCheckedChange={() => toggle("maintenanceMode")} />
          </div>
        </div>
      </motion.div>

      {/* Auth */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border border-border/50 bg-card p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
            <Shield className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-[0.9375rem]" style={{ fontWeight: 600 }}>{t("admin.settings.auth")}</h3>
            <p className="text-[0.6875rem] text-muted-foreground">{t("admin.settings.authDesc")}</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { key: "enableRegistration" as const, label: t("admin.settings.enableReg"), desc: t("admin.settings.enableRegDesc") },
            { key: "requireEmailVerification" as const, label: t("admin.settings.emailVerify"), desc: t("admin.settings.emailVerifyDesc") },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
              <div>
                <div className="text-[0.8125rem]" style={{ fontWeight: 500 }}>{item.label}</div>
                <div className="text-[0.6875rem] text-muted-foreground">{item.desc}</div>
              </div>
              <Switch checked={settings[item.key] as boolean} onCheckedChange={() => toggle(item.key)} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* AI */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border/50 bg-card p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
            <Zap className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-[0.9375rem]" style={{ fontWeight: 600 }}>{t("admin.settings.ai")}</h3>
            <p className="text-[0.6875rem] text-muted-foreground">{t("admin.settings.aiSectionDesc")}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border/20">
            <div>
              <div className="text-[0.8125rem]" style={{ fontWeight: 500 }}>{t("admin.settings.enableAI")}</div>
              <div className="text-[0.6875rem] text-muted-foreground">{t("admin.settings.enableAIDesc")}</div>
            </div>
            <Switch checked={settings.enableAI} onCheckedChange={() => toggle("enableAI")} />
          </div>
          <div>
            <label className="text-[0.75rem] text-muted-foreground mb-1.5 block">{t("admin.settings.aiRateLimit")}</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={settings.aiRateLimit}
                onChange={(e) => setSettings({ ...settings, aiRateLimit: Number(e.target.value) })}
                className="text-[0.8125rem] w-28"
              />
              <span className="text-[0.75rem] text-muted-foreground">{t("admin.settings.reqPerMinute")}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pricing */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border border-border/50 bg-card p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
            <Key className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-[0.9375rem]" style={{ fontWeight: 600 }}>{t("admin.settings.pricing")}</h3>
            <p className="text-[0.6875rem] text-muted-foreground">{t("admin.settings.pricingDesc")}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[0.75rem] text-muted-foreground mb-1.5 block">{t("admin.settings.proMonthly")}</label>
            <div className="flex items-center gap-1">
              <span className="text-[0.8125rem] text-muted-foreground">¥</span>
              <Input type="number" value={settings.proMonthlyPrice} onChange={(e) => setSettings({ ...settings, proMonthlyPrice: Number(e.target.value) })} className="text-[0.8125rem]" />
            </div>
          </div>
          <div>
            <label className="text-[0.75rem] text-muted-foreground mb-1.5 block">{t("admin.settings.proYearly")}</label>
            <div className="flex items-center gap-1">
              <span className="text-[0.8125rem] text-muted-foreground">¥</span>
              <Input type="number" value={settings.proYearlyPrice} onChange={(e) => setSettings({ ...settings, proYearlyPrice: Number(e.target.value) })} className="text-[0.8125rem]" />
            </div>
          </div>
          <div>
            <label className="text-[0.75rem] text-muted-foreground mb-1.5 block">{t("admin.settings.maxFreeCircles")}</label>
            <Input type="number" value={settings.maxFreeCircles} onChange={(e) => setSettings({ ...settings, maxFreeCircles: Number(e.target.value) })} className="text-[0.8125rem]" />
          </div>
          <div>
            <label className="text-[0.75rem] text-muted-foreground mb-1.5 block">{t("admin.settings.maxFreeMembers")}</label>
            <Input type="number" value={settings.maxFreeMembers} onChange={(e) => setSettings({ ...settings, maxFreeMembers: Number(e.target.value) })} className="text-[0.8125rem]" />
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border/50 bg-card p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50">
            <Bell className="h-5 w-5 text-rose-600" />
          </div>
          <div>
            <h3 className="text-[0.9375rem]" style={{ fontWeight: 600 }}>{t("admin.settings.notifications")}</h3>
            <p className="text-[0.6875rem] text-muted-foreground">{t("admin.settings.notificationsDesc")}</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { key: "enableNotifications" as const, label: t("admin.settings.enableNotif"), desc: t("admin.settings.enableNotifDesc") },
            { key: "enableEmailNotifications" as const, label: t("admin.settings.emailNotif"), desc: t("admin.settings.emailNotifDesc") },
            { key: "enablePushNotifications" as const, label: t("admin.settings.pushNotif"), desc: t("admin.settings.pushNotifDesc") },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
              <div>
                <div className="text-[0.8125rem]" style={{ fontWeight: 500 }}>{item.label}</div>
                <div className="text-[0.6875rem] text-muted-foreground">{item.desc}</div>
              </div>
              <Switch checked={settings[item.key] as boolean} onCheckedChange={() => toggle(item.key)} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Data */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-xl border border-border/50 bg-card p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50">
            <Database className="h-5 w-5 text-cyan-600" />
          </div>
          <div>
            <h3 className="text-[0.9375rem]" style={{ fontWeight: 600 }}>{t("admin.settings.data")}</h3>
            <p className="text-[0.6875rem] text-muted-foreground">{t("admin.settings.dataDesc")}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[0.75rem] text-muted-foreground mb-1.5 block">{t("admin.settings.dataRetention")}</label>
            <div className="flex items-center gap-2">
              <Input type="number" value={settings.dataRetentionDays} onChange={(e) => setSettings({ ...settings, dataRetentionDays: Number(e.target.value) })} className="text-[0.8125rem] w-28" />
              <span className="text-[0.75rem] text-muted-foreground">{isEn ? "days" : "天"}</span>
            </div>
          </div>
          {[
            { key: "enableAnalytics" as const, label: t("admin.settings.enableAnalytics"), desc: t("admin.settings.enableAnalyticsDesc") },
            { key: "enableCDN" as const, label: t("admin.settings.enableCDN"), desc: t("admin.settings.enableCDNDesc") },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
              <div>
                <div className="text-[0.8125rem]" style={{ fontWeight: 500 }}>{item.label}</div>
                <div className="text-[0.6875rem] text-muted-foreground">{item.desc}</div>
              </div>
              <Switch checked={settings[item.key] as boolean} onCheckedChange={() => toggle(item.key)} />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
