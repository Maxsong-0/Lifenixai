import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  X,
  Check,
  ChevronRight,
  ChevronDown,
  Volume2,
  Accessibility,
  Baby,
  Heart,
  Sun,
  Moon,
  Bell,
  BellRing,
  Calendar,
  UserCheck,
  Settings,
  Smartphone,
  Monitor,
  Info,
  AlertTriangle,
  Users,
  Clock,
  CircleCheck,
  Pill,
  ShoppingBag,
  Home,
} from "lucide-react";

/* ═══════════════ Types ═══════════════ */
interface Member {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  online: boolean;
  avatar: string;
}

type CalendarVisibility = "full" | "busy-only" | "hidden";
type MemberMode = "normal" | "simple";

interface MemberPrivacy {
  memberId: string;
  calendarVisibility: CalendarVisibility;
  showLocation: boolean;
  aiCanReadCalendar: boolean;
  aiCanSuggestTasks: boolean;
  mode: MemberMode;
  simpleModeConfig: SimpleModeConfig;
}

interface SimpleModeConfig {
  fontSize: "large" | "xlarge";
  voiceAnnounce: boolean;
  showOnlyAssigned: boolean;
  enableEdit: boolean;
  highContrast: boolean;
}

/* ═══════════════ Member Colors ═══════════════ */
const memberColors: Record<string, { bg: string; text: string; light: string }> = {
  m1: { bg: "bg-violet-500", text: "text-violet-700", light: "bg-violet-100" },
  m2: { bg: "bg-rose-500", text: "text-rose-700", light: "bg-rose-100" },
  m3: { bg: "bg-sky-500", text: "text-sky-700", light: "bg-sky-100" },
  m4: { bg: "bg-amber-500", text: "text-amber-700", light: "bg-amber-100" },
  m5: { bg: "bg-emerald-500", text: "text-emerald-700", light: "bg-emerald-100" },
  m6: { bg: "bg-pink-500", text: "text-pink-700", light: "bg-pink-100" },
};
function getMC(id: string) {
  return memberColors[id] || { bg: "bg-gray-500", text: "text-gray-700", light: "bg-gray-100" };
}

/* ═══════════════ Default Privacy Settings ═══════════════ */
function defaultPrivacy(members: Member[]): MemberPrivacy[] {
  return members.map((m) => ({
    memberId: m.id,
    calendarVisibility: m.id === "m1" ? "full" : "busy-only",
    showLocation: m.id === "m1",
    aiCanReadCalendar: true,
    aiCanSuggestTasks: true,
    mode: m.id === "m3" ? "simple" : "normal", // 妈妈 defaults to simple
    simpleModeConfig: {
      fontSize: m.id === "m3" ? "xlarge" : "large",
      voiceAnnounce: m.id === "m3",
      showOnlyAssigned: true,
      enableEdit: false,
      highContrast: false,
    },
  }));
}

/* ═══════════════ Mock Simple Mode Tasks ═══════════════ */
interface SimpleTask {
  id: string;
  text: string;
  time?: string;
  icon: React.ReactNode;
  completed: boolean;
  type: "task" | "reminder" | "medication";
}

/* ═══════════════ Props ═══════════════ */
interface CirclePrivacyProps {
  members: Member[];
  circleType: "family" | "team" | "project";
  onClose: () => void;
}

/* ═══════════════ Component ═══════════════ */
export function CirclePrivacy({ members, circleType, onClose }: CirclePrivacyProps) {
  const [privacySettings, setPrivacySettings] = useState<MemberPrivacy[]>(() => {
    try {
      const saved = localStorage.getItem("lifenix_circle_privacy");
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultPrivacy(members);
  });
  const [activeTab, setActiveTab] = useState<"privacy" | "simple">("privacy");
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [showSimplePreview, setShowSimplePreview] = useState(false);
  const [saved, setSaved] = useState(false);

  // Persist settings
  useEffect(() => {
    localStorage.setItem("lifenix_circle_privacy", JSON.stringify(privacySettings));
  }, [privacySettings]);

  const updatePrivacy = (memberId: string, updates: Partial<MemberPrivacy>) => {
    setPrivacySettings((prev) =>
      prev.map((p) => (p.memberId === memberId ? { ...p, ...updates } : p))
    );
  };

  const updateSimpleConfig = (memberId: string, updates: Partial<SimpleModeConfig>) => {
    setPrivacySettings((prev) =>
      prev.map((p) =>
        p.memberId === memberId
          ? { ...p, simpleModeConfig: { ...p.simpleModeConfig, ...updates } }
          : p
      )
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const visibilityOptions: { key: CalendarVisibility; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: "full", label: "完整可见", desc: "显示日程具体内容", icon: <Eye className="h-3.5 w-3.5" /> },
    { key: "busy-only", label: "仅忙/闲", desc: "只显示忙碌或空闲状态", icon: <Clock className="h-3.5 w-3.5" /> },
    { key: "hidden", label: "完全隐藏", desc: "不向此空间共享任何日历", icon: <EyeOff className="h-3.5 w-3.5" /> },
  ];

  const simpleModeMembers = privacySettings.filter((p) => p.mode === "simple");

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-x-3 top-[5%] z-50 mx-auto max-w-lg rounded-2xl bg-white shadow-2xl sm:inset-x-auto sm:w-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-[1.0625rem]" style={{ fontWeight: 600 }}>权限与隐私</h3>
              <p className="text-[0.6875rem] text-muted-foreground">管理日历可见性、AI 权限和极简模式</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab toggle */}
        <div className="shrink-0 px-5 pt-4 pb-2">
          <div className="flex gap-0.5 rounded-xl bg-muted/40 p-0.5">
            {([
              { key: "privacy" as const, label: "隐私控制", icon: Lock },
              { key: "simple" as const, label: "极简模式", icon: Accessibility },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[0.8125rem] transition-all ${
                  activeTab === tab.key ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
                style={{ fontWeight: activeTab === tab.key ? 600 : 400 }}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <AnimatePresence mode="wait">
            {/* ═══ PRIVACY TAB ═══ */}
            {activeTab === "privacy" && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* AI Privacy Notice */}
                <div className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 to-purple-50/50 px-4 py-3">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[0.8125rem]" style={{ fontWeight: 600 }}>AI 隐私承诺</p>
                      <p className="text-[0.6875rem] text-muted-foreground leading-relaxed mt-1">
                        AI 在智能排期时仅读取您设定的可见状态（忙碌/空闲），<span className="text-primary" style={{ fontWeight: 500 }}>绝不向其他成员透露具体日程内容</span>。个人日历数据加密存储，不会被用于其他用途。
                      </p>
                    </div>
                  </div>
                </div>

                {/* Per-member privacy settings */}
                <div className="space-y-2">
                  <p className="text-[0.75rem] text-muted-foreground" style={{ fontWeight: 500 }}>成员日历可见性</p>
                  {members.map((member, i) => {
                    const mc = getMC(member.id);
                    const privacy = privacySettings.find((p) => p.memberId === member.id);
                    if (!privacy) return null;
                    const isExpanded = expandedMember === member.id;
                    const visOpt = visibilityOptions.find((v) => v.key === privacy.calendarVisibility);

                    return (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="rounded-xl border border-border/40 bg-white overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedMember(isExpanded ? null : member.id)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/10 transition-colors"
                        >
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${mc.bg} text-white text-[0.75rem]`} style={{ fontWeight: 700 }}>
                            {member.avatar.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[0.8125rem]" style={{ fontWeight: 500 }}>
                                {member.name}
                                {member.id === "m1" && <span className="text-muted-foreground text-[0.75rem]">（你）</span>}
                              </span>
                              {privacy.mode === "simple" && (
                                <Badge className="bg-amber-50 text-amber-700 text-[0.5rem] h-3.5">极简</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[0.6875rem] text-muted-foreground mt-0.5">
                              {visOpt?.icon}
                              <span>{visOpt?.label}</span>
                            </div>
                          </div>
                          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-border/30 px-4 py-3 space-y-3">
                                {/* Calendar visibility selector */}
                                <div>
                                  <label className="text-[0.6875rem] text-muted-foreground block mb-2" style={{ fontWeight: 500 }}>
                                    日历对空间的可见性
                                  </label>
                                  <div className="space-y-1.5">
                                    {visibilityOptions.map((opt) => (
                                      <button
                                        key={opt.key}
                                        onClick={() => updatePrivacy(member.id, { calendarVisibility: opt.key })}
                                        className={`flex w-full items-center gap-3 rounded-lg border-2 px-3 py-2.5 text-left transition-all ${
                                          privacy.calendarVisibility === opt.key
                                            ? "border-primary bg-primary/5"
                                            : "border-border/20 hover:border-border/40"
                                        }`}
                                      >
                                        <div className={`shrink-0 ${privacy.calendarVisibility === opt.key ? "text-primary" : "text-muted-foreground"}`}>
                                          {opt.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-[0.75rem]" style={{ fontWeight: privacy.calendarVisibility === opt.key ? 600 : 400 }}>
                                            {opt.label}
                                          </div>
                                          <div className="text-[0.625rem] text-muted-foreground">{opt.desc}</div>
                                        </div>
                                        {privacy.calendarVisibility === opt.key && (
                                          <Check className="h-4 w-4 text-primary shrink-0" />
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Busy-only mode illustration */}
                                {privacy.calendarVisibility === "busy-only" && (
                                  <div className="rounded-lg bg-muted/30 p-3">
                                    <p className="text-[0.625rem] text-muted-foreground mb-2" style={{ fontWeight: 500 }}>其他成员看到的效果：</p>
                                    <div className="space-y-1">
                                      {[
                                        { time: "09:00-10:00", status: "busy", label: "忙碌" },
                                        { time: "10:00-12:00", status: "free", label: "空闲" },
                                        { time: "12:00-13:00", status: "busy", label: "忙碌" },
                                        { time: "13:00-17:00", status: "free", label: "空闲" },
                                      ].map((slot, si) => (
                                        <div key={si} className="flex items-center gap-2 text-[0.625rem]">
                                          <span className="w-24 text-muted-foreground/60">{slot.time}</span>
                                          <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 ${
                                            slot.status === "busy" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                                          }`} style={{ fontWeight: 500 }}>
                                            <div className={`h-1.5 w-1.5 rounded-full ${slot.status === "busy" ? "bg-red-500" : "bg-emerald-500"}`} />
                                            {slot.label}
                                          </div>
                                          {slot.status === "busy" && (
                                            <span className="text-muted-foreground/30 italic">具体内容已隐藏</span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* AI Permissions */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2.5">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                                      <div>
                                        <span className="text-[0.75rem]" style={{ fontWeight: 500 }}>AI 读取日历</span>
                                        <p className="text-[0.5625rem] text-muted-foreground">用于智能排期（仅读取状态）</p>
                                      </div>
                                    </div>
                                    <Switch
                                      checked={privacy.aiCanReadCalendar}
                                      onCheckedChange={(val) => updatePrivacy(member.id, { aiCanReadCalendar: val })}
                                    />
                                  </div>
                                  <div className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2.5">
                                    <div className="flex items-center gap-2">
                                      <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                                      <div>
                                        <span className="text-[0.75rem]" style={{ fontWeight: 500 }}>AI 任务建议</span>
                                        <p className="text-[0.5625rem] text-muted-foreground">允许 AI 向此成员推荐任务</p>
                                      </div>
                                    </div>
                                    <Switch
                                      checked={privacy.aiCanSuggestTasks}
                                      onCheckedChange={(val) => updatePrivacy(member.id, { aiCanSuggestTasks: val })}
                                    />
                                  </div>
                                  {circleType === "family" && (
                                    <div className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2.5">
                                      <div className="flex items-center gap-2">
                                        <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                                        <div>
                                          <span className="text-[0.75rem]" style={{ fontWeight: 500 }}>位置共享</span>
                                          <p className="text-[0.5625rem] text-muted-foreground">用于任务分配的距离分析</p>
                                        </div>
                                      </div>
                                      <Switch
                                        checked={privacy.showLocation}
                                        onCheckedChange={(val) => updatePrivacy(member.id, { showLocation: val })}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Global privacy note */}
                <div className="rounded-xl bg-amber-50/50 border border-amber-200/50 px-4 py-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[0.6875rem] text-amber-800 leading-relaxed">
                    「仅忙/闲」模式下，其他成员和 AI 只能看到时间段是否被占用，无法获知具体活动内容。这确保了在协作排期时的隐私安全。
                  </p>
                </div>
              </motion.div>
            )}

            {/* ═══ SIMPLE MODE TAB ═══ */}
            {activeTab === "simple" && (
              <motion.div
                key="simple"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Intro */}
                <div className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 to-purple-50/50 px-4 py-3">
                  <div className="flex items-start gap-2.5">
                    <Accessibility className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[0.8125rem]" style={{ fontWeight: 600 }}>长辈/儿童极简模式</p>
                      <p className="text-[0.6875rem] text-muted-foreground leading-relaxed mt-1">
                        为家庭中的老人或儿童提供超大字体看板视图，去除复杂编辑操作，仅保留查看和完成打卡功能。支持 AI 语音播报提醒。
                      </p>
                    </div>
                  </div>
                </div>

                {/* Member simple mode toggles */}
                <div className="space-y-2">
                  <p className="text-[0.75rem] text-muted-foreground" style={{ fontWeight: 500 }}>为成员开启极简模式</p>
                  {members.map((member, i) => {
                    const mc = getMC(member.id);
                    const privacy = privacySettings.find((p) => p.memberId === member.id);
                    if (!privacy) return null;
                    const isSimple = privacy.mode === "simple";

                    return (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="rounded-xl border border-border/40 bg-white overflow-hidden"
                      >
                        <div className="flex items-center gap-3 px-4 py-3">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${mc.bg} text-white text-[0.75rem]`} style={{ fontWeight: 700 }}>
                            {member.avatar.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[0.8125rem]" style={{ fontWeight: 500 }}>
                              {member.name}
                              {member.id === "m1" && <span className="text-muted-foreground text-[0.75rem]">（你）</span>}
                            </span>
                          </div>
                          <Switch
                            checked={isSimple}
                            onCheckedChange={(val) => updatePrivacy(member.id, { mode: val ? "simple" : "normal" })}
                          />
                        </div>

                        {/* Simple mode config (when enabled) */}
                        <AnimatePresence>
                          {isSimple && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-border/20 px-4 py-3 space-y-2.5 bg-amber-50/30">
                                {/* Font size */}
                                <div className="flex items-center justify-between">
                                  <span className="text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 500 }}>字体大小</span>
                                  <div className="flex gap-1.5">
                                    {([
                                      { key: "large" as const, label: "大号" },
                                      { key: "xlarge" as const, label: "超大" },
                                    ]).map((opt) => (
                                      <button
                                        key={opt.key}
                                        onClick={() => updateSimpleConfig(member.id, { fontSize: opt.key })}
                                        className={`rounded-lg px-2.5 py-1 text-[0.6875rem] transition-all ${
                                          privacy.simpleModeConfig.fontSize === opt.key
                                            ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                                            : "bg-muted/40 text-muted-foreground"
                                        }`}
                                        style={{ fontWeight: privacy.simpleModeConfig.fontSize === opt.key ? 600 : 400 }}
                                      >
                                        {opt.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Voice announce */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <Volume2 className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 500 }}>语音播报</span>
                                  </div>
                                  <Switch
                                    checked={privacy.simpleModeConfig.voiceAnnounce}
                                    onCheckedChange={(val) => updateSimpleConfig(member.id, { voiceAnnounce: val })}
                                  />
                                </div>

                                {/* Show only assigned */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <UserCheck className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 500 }}>只显示分配的任务</span>
                                  </div>
                                  <Switch
                                    checked={privacy.simpleModeConfig.showOnlyAssigned}
                                    onCheckedChange={(val) => updateSimpleConfig(member.id, { showOnlyAssigned: val })}
                                  />
                                </div>

                                {/* Enable edit */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <Lock className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 500 }}>允许编辑/删除</span>
                                  </div>
                                  <Switch
                                    checked={privacy.simpleModeConfig.enableEdit}
                                    onCheckedChange={(val) => updateSimpleConfig(member.id, { enableEdit: val })}
                                  />
                                </div>

                                {/* High contrast */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <Sun className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-[0.6875rem] text-muted-foreground" style={{ fontWeight: 500 }}>高对比度</span>
                                  </div>
                                  <Switch
                                    checked={privacy.simpleModeConfig.highContrast}
                                    onCheckedChange={(val) => updateSimpleConfig(member.id, { highContrast: val })}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Simple mode preview */}
                <div>
                  <button
                    onClick={() => setShowSimplePreview(!showSimplePreview)}
                    className="flex items-center gap-1.5 text-[0.8125rem] text-primary hover:text-primary/80 transition-colors mb-2"
                    style={{ fontWeight: 500 }}
                  >
                    <Monitor className="h-4 w-4" />
                    {showSimplePreview ? "收起预览" : "预览极简模式效果"}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showSimplePreview ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {showSimplePreview && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <SimpleModePreview />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border/50 px-5 py-3 flex items-center justify-between">
          <p className="text-[0.625rem] text-muted-foreground">
            设置自动保存到本地
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="rounded-xl text-[0.8125rem]">
              关闭
            </Button>
            <Button onClick={handleSave} className="rounded-xl bg-primary text-white hover:bg-primary/90 text-[0.8125rem] gap-1">
              {saved ? <><Check className="h-3.5 w-3.5" />已保存</> : "确认保存"}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ═══════════════ Simple Mode Preview Sub-Component ═══════════════ */
function SimpleModePreview() {
  const [tasks, setTasks] = useState<SimpleTask[]>([
    { id: "st1", text: "下午 3 点吃降压药", time: "15:00", icon: <Pill className="h-7 w-7" />, completed: false, type: "medication" },
    { id: "st2", text: "去驿站取快递", time: "16:30", icon: <ShoppingBag className="h-7 w-7" />, completed: false, type: "task" },
    { id: "st3", text: "晚上 7 点家庭聚餐", time: "19:00", icon: <Home className="h-7 w-7" />, completed: false, type: "reminder" },
  ]);
  const [voicePlaying, setVoicePlaying] = useState<string | null>(null);

  const handleComplete = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const playVoice = (id: string, text: string) => {
    setVoicePlaying(id);
    // Simulate voice playback
    setTimeout(() => setVoicePlaying(null), 2500);
  };

  return (
    <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-4 space-y-3">
      {/* Preview header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-200 text-amber-800 text-[0.625rem]">极简模式预览</Badge>
          <span className="text-[0.625rem] text-amber-600/60">模拟妈妈的视角</span>
        </div>
        <div className="flex items-center gap-1 text-[0.625rem] text-muted-foreground">
          <Clock className="h-3 w-3" />
          今天 · 2月26日
        </div>
      </div>

      {/* Greeting */}
      <div className="rounded-xl bg-white border border-amber-100 p-4">
        <p className="text-[1.125rem] text-foreground leading-relaxed" style={{ fontWeight: 600 }}>
          妈妈，下午好！ ☀️
        </p>
        <p className="text-[0.9375rem] text-muted-foreground mt-1">
          今天有 <span className="text-primary" style={{ fontWeight: 600 }}>3</span> 件事需要关注
        </p>
      </div>

      {/* Large task cards */}
      <div className="space-y-2.5">
        {tasks.map((task) => {
          const typeColors = {
            medication: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: "text-red-500" },
            task: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: "text-blue-500" },
            reminder: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", icon: "text-purple-500" },
          };
          const tc = typeColors[task.type];

          return (
            <motion.div
              key={task.id}
              layout
              className={`rounded-xl border-2 ${task.completed ? "border-emerald-200 bg-emerald-50/50" : `${tc.border} ${tc.bg}`} p-4 transition-all`}
            >
              <div className="flex items-center gap-4">
                <div className={`shrink-0 ${task.completed ? "text-emerald-500" : tc.icon}`}>
                  {task.completed ? <CircleCheck className="h-7 w-7" /> : task.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[1.0625rem] leading-snug ${task.completed ? "line-through text-muted-foreground" : tc.text}`} style={{ fontWeight: 600 }}>
                    {task.text}
                  </div>
                  {task.time && (
                    <div className="flex items-center gap-1 mt-1 text-[0.8125rem] text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {task.time}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleComplete(task.id)}
                  className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-[0.9375rem] transition-all ${
                    task.completed
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-white text-foreground border border-border/50 hover:bg-muted/30 active:scale-[0.98]"
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {task.completed ? (
                    <><Check className="h-5 w-5" />已完成</>
                  ) : (
                    <><CircleCheck className="h-5 w-5" />完成打卡</>
                  )}
                </button>
                <button
                  onClick={() => playVoice(task.id, task.text)}
                  className={`flex items-center justify-center rounded-xl px-4 py-3 transition-all ${
                    voicePlaying === task.id
                      ? "bg-primary/10 text-primary"
                      : "bg-white text-muted-foreground border border-border/50 hover:bg-muted/30"
                  }`}
                >
                  <Volume2 className={`h-5 w-5 ${voicePlaying === task.id ? "animate-pulse" : ""}`} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Voice announcement simulation */}
      <AnimatePresence>
        {voicePlaying && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-xl bg-primary/10 border border-primary/20 p-3 flex items-center gap-3"
          >
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((bar) => (
                <motion.div
                  key={bar}
                  className="w-1 rounded-full bg-primary"
                  animate={{
                    height: [8, 16 + Math.random() * 8, 8],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: bar * 0.08,
                  }}
                />
              ))}
            </div>
            <p className="text-[0.8125rem] text-primary" style={{ fontWeight: 500 }}>
              🔊 正在播报："{tasks.find((t) => t.id === voicePlaying)?.text}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[0.5625rem] text-amber-600/50 text-center">
        极简模式下只显示大字体任务卡片 · 无复杂编辑 · 支持语音播报
      </p>
    </div>
  );
}