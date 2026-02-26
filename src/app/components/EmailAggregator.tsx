import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Mail,
  Plane,
  CreditCard,
  Users,
  CalendarDays,
  ListTodo,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Shield,
  Bell,
  Clock,
  MapPin,
  Plus,
  Inbox,
  ScanText,
  ArrowRight,
  Loader2,
  Link2,
  Unlink,
  FileText,
  DollarSign,
  Globe,
} from "lucide-react";
import { format, addDays } from "date-fns";
import { zhCN } from "date-fns/locale";

/* ═══════════════ Types ═══════════════ */
interface EmailAccount {
  id: string;
  provider: "gmail" | "outlook" | "icloud" | "custom";
  email: string;
  icon: string;
  color: string;
  connected: boolean;
  lastScan?: Date;
  autoScan: boolean;
  itemsFound?: number;
}

type ScannedItemType = "flight" | "meeting_invite" | "bill" | "hotel" | "delivery" | "event";

interface ScannedItem {
  id: string;
  type: ScannedItemType;
  title: string;
  source: string;
  date: Date;
  time?: string;
  location?: string;
  amount?: string;
  meta?: string;
  emailSubject: string;
  addedAsEvent: boolean;
  addedAsTask: boolean;
  confidence: number;
}

/* ═══════════════ Mock Data ═══════════════ */
const today = new Date();

const defaultAccounts: EmailAccount[] = [
  { id: "gmail", provider: "gmail", email: "user@gmail.com", icon: "G", color: "bg-red-500", connected: false, autoScan: true },
  { id: "outlook", provider: "outlook", email: "user@company.com", icon: "O", color: "bg-sky-600", connected: false, autoScan: true },
  { id: "icloud", provider: "icloud", email: "user@icloud.com", icon: "", color: "bg-gray-700", connected: false, autoScan: false },
];

const mockScannedItems: ScannedItem[] = [
  {
    id: "s1", type: "flight", title: "北京 → 上海 · CA1831",
    source: "中国国际航空", date: addDays(today, 5), time: "08:30 – 11:00",
    location: "北京首都国际机场 T3 → 上海虹桥机场 T2",
    emailSubject: "您的航班行程单 - CA1831", confidence: 0.97,
    addedAsEvent: false, addedAsTask: false,
  },
  {
    id: "s2", type: "flight", title: "上海 → 北京 · CA1832",
    source: "中国国际航空", date: addDays(today, 7), time: "19:30 – 22:00",
    location: "上海虹桥机场 T2 → 北京首都国际机场 T3",
    emailSubject: "您的航班行程单 - CA1832", confidence: 0.97,
    addedAsEvent: false, addedAsTask: false,
  },
  {
    id: "s3", type: "meeting_invite", title: "Q1 产品路线图评审",
    source: "张总 <ceo@company.com>", date: addDays(today, 2), time: "14:00 – 15:30",
    location: "Zoom · 会议 ID: 839 2048 1234", meta: "15 位受邀者",
    emailSubject: "邀请: Q1 产品路线图评审 @ 周三 14:00", confidence: 0.99,
    addedAsEvent: false, addedAsTask: false,
  },
  {
    id: "s4", type: "meeting_invite", title: "客户需求讨论",
    source: "王华 <wanghua@client.com>", date: addDays(today, 3), time: "10:00 – 11:00",
    location: "Teams 会议", meta: "5 位受邀者",
    emailSubject: "会议邀请：客户需求讨论", confidence: 0.95,
    addedAsEvent: false, addedAsTask: false,
  },
  {
    id: "s5", type: "bill", title: "信用卡账单 · 招商银行",
    source: "招商银行信用卡中心", date: addDays(today, 10), amount: "¥ 3,842.50",
    emailSubject: "您的2026年2月账单已出", confidence: 0.93,
    addedAsEvent: false, addedAsTask: false,
  },
  {
    id: "s6", type: "bill", title: "房租自动扣款提醒",
    source: "自如管家", date: addDays(today, 4), amount: "¥ 4,200.00",
    emailSubject: "房租扣款提醒 - 3月", confidence: 0.91,
    addedAsEvent: false, addedAsTask: false,
  },
  {
    id: "s7", type: "hotel", title: "上海浦东丽思卡尔顿",
    source: "携程旅行", date: addDays(today, 5), time: "14:00 入住",
    location: "上海市浦东新区世纪大道 8 号", meta: "2晚 · 豪华大床房",
    emailSubject: "酒店预订确认 - 上海浦东丽思卡尔顿", confidence: 0.96,
    addedAsEvent: false, addedAsTask: false,
  },
  {
    id: "s8", type: "delivery", title: "快递到达提醒 · SF1398204821",
    source: "顺丰速运", date: today, time: "预计今天 14:00-18:00",
    location: "丰巢快递柜 · 小区东门", emailSubject: "您的快递即将到达",
    confidence: 0.88, addedAsEvent: false, addedAsTask: false,
  },
];

const typeConfig: Record<ScannedItemType, { label: string; icon: typeof Plane; color: string; bg: string }> = {
  flight: { label: "航班", icon: Plane, color: "text-blue-600", bg: "bg-blue-50" },
  meeting_invite: { label: "会议邀请", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
  bill: { label: "账单", icon: CreditCard, color: "text-amber-600", bg: "bg-amber-50" },
  hotel: { label: "酒店", icon: Globe, color: "text-emerald-600", bg: "bg-emerald-50" },
  delivery: { label: "快递", icon: Inbox, color: "text-orange-600", bg: "bg-orange-50" },
  event: { label: "活动", icon: CalendarDays, color: "text-rose-600", bg: "bg-rose-50" },
};

const providerLabels: Record<string, string> = {
  gmail: "Gmail",
  outlook: "Outlook",
  icloud: "iCloud 邮件",
  custom: "自定义 IMAP",
};

/* ═══════════════ Component ═══════════════ */
interface EmailAggregatorProps {
  open: boolean;
  onClose: () => void;
}

export function EmailAggregator({ open, onClose }: EmailAggregatorProps) {
  const [accounts, setAccounts] = useState<EmailAccount[]>(defaultAccounts);
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [tab, setTab] = useState<"accounts" | "scanned">("accounts");
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [filterType, setFilterType] = useState<ScannedItemType | "all">("all");

  const connectedCount = accounts.filter((a) => a.connected).length;

  const handleConnect = (id: string) => {
    setConnectingId(id);
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, connected: true, lastScan: new Date(), itemsFound: 0 } : a
        )
      );
      setConnectingId(null);
    }, 1500);
  };

  const handleDisconnect = (id: string) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, connected: false, lastScan: undefined, itemsFound: undefined } : a
      )
    );
  };

  const handleScanAll = () => {
    if (connectedCount === 0) return;
    setScanning(true);
    setTimeout(() => {
      setItems(mockScannedItems);
      setAccounts((prev) =>
        prev.map((a) =>
          a.connected
            ? { ...a, lastScan: new Date(), itemsFound: Math.floor(Math.random() * 5) + 2 }
            : a
        )
      );
      setScanning(false);
      setTab("scanned");
    }, 2200);
  };

  const toggleAutoScan = (id: string) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, autoScan: !a.autoScan } : a))
    );
  };

  const addAsEvent = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, addedAsEvent: true } : i))
    );
  };

  const addAsTask = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, addedAsTask: true } : i))
    );
  };

  const addAllAsEvents = () => {
    setItems((prev) => prev.map((i) => ({ ...i, addedAsEvent: true })));
  };

  const filteredItems = filterType === "all" ? items : items.filter((i) => i.type === filterType);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-[3px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 24 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-x-3 top-[2%] bottom-[2%] sm:inset-x-auto sm:left-1/2 sm:top-[4%] sm:bottom-[4%] sm:w-[calc(100%-3rem)] sm:max-w-3xl sm:-translate-x-1/2 z-[81] flex flex-col rounded-2xl border border-border/50 bg-white shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/10">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-[1rem] sm:text-[1.125rem]" style={{ fontWeight: 600 }}>
                    邮件智能聚合
                  </h2>
                  <p className="text-[0.6875rem] sm:text-[0.75rem] text-muted-foreground">
                    自动扫描行程单 · 会议邀请 · 账单提醒
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {connectedCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleScanAll}
                    disabled={scanning}
                    className="hidden sm:flex rounded-lg text-[0.75rem] gap-1.5"
                  >
                    {scanning ? (
                      <><Loader2 className="h-3 w-3 animate-spin" /> 扫描中...</>
                    ) : (
                      <><ScanText className="h-3 w-3" /> 扫描邮箱</>
                    )}
                  </Button>
                )}
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex shrink-0 border-b border-border/30 px-4 sm:px-6">
              {[
                { key: "accounts" as const, label: "邮箱账号", count: connectedCount },
                { key: "scanned" as const, label: "扫描结果", count: items.length },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => setTab(p.key)}
                  className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-[0.75rem] sm:text-[0.8125rem] transition-colors ${
                    tab === p.key ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                  style={{ fontWeight: tab === p.key ? 600 : 400 }}
                >
                  {p.label}
                  {p.count > 0 && (
                    <span
                      className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.5625rem] ${
                        tab === p.key ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                      style={{ fontWeight: 600 }}
                    >
                      {p.count}
                    </span>
                  )}
                  {tab === p.key && (
                    <motion.div
                      layoutId="email-tab-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* ═══ ACCOUNTS ═══ */}
                {tab === "accounts" && (
                  <motion.div
                    key="accounts"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 sm:p-6 space-y-3"
                  >
                    {/* Info card */}
                    <div className="flex items-start gap-3 rounded-xl bg-blue-50/60 border border-blue-200/30 p-3 sm:p-4">
                      <Shield className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[0.8125rem] text-blue-700" style={{ fontWeight: 600 }}>
                          安全只读扫描
                        </div>
                        <p className="text-[0.75rem] text-muted-foreground mt-0.5 leading-relaxed">
                          Lifenix 仅读取邮件主题和结构化数据（行程单、日历附件等），不会访问邮件正文内容。数据仅在本地处理，不会上传到服务器。
                        </p>
                      </div>
                    </div>

                    {/* Accounts list */}
                    {accounts.map((account, idx) => (
                      <motion.div
                        key={account.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`rounded-xl border p-3 sm:p-4 transition-all ${
                          account.connected ? "border-border/40 bg-white" : "border-dashed border-border/60 bg-muted/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${account.color} text-white text-[0.875rem] shrink-0`}
                            style={{ fontWeight: 700 }}
                          >
                            {account.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[0.875rem] truncate" style={{ fontWeight: 600 }}>
                                {providerLabels[account.provider]}
                              </span>
                              {account.connected && (
                                <Badge className="bg-emerald-50 text-emerald-600 text-[0.5625rem] px-1.5">
                                  <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" /> 已绑定
                                </Badge>
                              )}
                            </div>
                            <div className="text-[0.75rem] text-muted-foreground truncate">
                              {account.email}
                            </div>
                            {account.connected && account.lastScan && (
                              <div className="flex items-center gap-3 mt-1 text-[0.6875rem] text-muted-foreground/70">
                                <span>上次扫描：{format(account.lastScan, "HH:mm")}</span>
                                {account.itemsFound !== undefined && (
                                  <span>发现 {account.itemsFound} 条信息</span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {account.connected && (
                              <>
                                <div className="hidden sm:flex items-center gap-1.5 mr-2">
                                  <span className="text-[0.6875rem] text-muted-foreground">自动扫描</span>
                                  <Switch
                                    checked={account.autoScan}
                                    onCheckedChange={() => toggleAutoScan(account.id)}
                                  />
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDisconnect(account.id)}
                                  className="rounded-lg text-[0.6875rem] text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 gap-1 h-7 px-2"
                                >
                                  <Unlink className="h-3 w-3" /><span className="hidden sm:inline">解绑</span>
                                </Button>
                              </>
                            )}
                            {!account.connected && (
                              <Button
                                size="sm"
                                onClick={() => handleConnect(account.id)}
                                disabled={connectingId === account.id}
                                className="rounded-lg bg-primary text-white hover:bg-primary/90 text-[0.75rem] gap-1.5 h-8"
                              >
                                {connectingId === account.id ? (
                                  <><RefreshCw className="h-3 w-3 animate-spin" /> 绑定中...</>
                                ) : (
                                  <><Link2 className="h-3 w-3" /> 绑定</>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Scan button (mobile) */}
                    {connectedCount > 0 && (
                      <Button
                        onClick={handleScanAll}
                        disabled={scanning}
                        className="w-full sm:hidden rounded-xl bg-primary text-white hover:bg-primary/90 gap-2"
                      >
                        {scanning ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> AI 扫描中...</>
                        ) : (
                          <><ScanText className="h-3.5 w-3.5" /> 立即扫描邮箱</>
                        )}
                      </Button>
                    )}

                    {/* How it works */}
                    <div className="rounded-xl border border-border/30 bg-muted/10 p-4">
                      <div className="text-[0.8125rem] mb-3" style={{ fontWeight: 600 }}>AI 自动识别以下内容</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { icon: Plane, label: "机票行程单", color: "text-blue-600 bg-blue-50" },
                          { icon: Users, label: "会议邀请函", color: "text-purple-600 bg-purple-50" },
                          { icon: CreditCard, label: "账单还款日", color: "text-amber-600 bg-amber-50" },
                          { icon: Globe, label: "酒店预订", color: "text-emerald-600 bg-emerald-50" },
                          { icon: Inbox, label: "快递物流", color: "text-orange-600 bg-orange-50" },
                          { icon: CalendarDays, label: "活动邀请", color: "text-rose-600 bg-rose-50" },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-2 rounded-lg p-2">
                            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${item.color.split(" ")[1]}`}>
                              <item.icon className={`h-3.5 w-3.5 ${item.color.split(" ")[0]}`} />
                            </div>
                            <span className="text-[0.75rem] text-muted-foreground">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ═══ SCANNED RESULTS ═══ */}
                {tab === "scanned" && (
                  <motion.div
                    key="scanned"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 sm:p-6"
                  >
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Inbox className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <div className="text-[0.9375rem] text-muted-foreground" style={{ fontWeight: 500 }}>
                          暂无扫描结果
                        </div>
                        <p className="text-[0.8125rem] text-muted-foreground/60 mt-1">
                          绑定邮箱后点击「扫描邮箱」，AI 将自动提取关键信息。
                        </p>
                        <Button
                          size="sm"
                          className="mt-4 rounded-xl bg-primary text-white hover:bg-primary/90"
                          onClick={() => setTab("accounts")}
                        >
                          <Mail className="mr-1.5 h-3.5 w-3.5" /> 绑定邮箱
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Summary + filters */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-[0.875rem]" style={{ fontWeight: 600 }}>
                              AI 发现 {items.length} 条信息
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={addAllAsEvents}
                              disabled={items.every((i) => i.addedAsEvent)}
                              className="rounded-lg text-[0.6875rem] h-7 gap-1"
                            >
                              <Plus className="h-3 w-3" /> 全部加入日程
                            </Button>
                          </div>
                        </div>

                        {/* Type filter chips */}
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => setFilterType("all")}
                            className={`rounded-full border px-2.5 py-1 text-[0.6875rem] transition-all ${
                              filterType === "all"
                                ? "border-primary/30 bg-primary/5 text-primary"
                                : "border-border/40 text-muted-foreground hover:text-foreground"
                            }`}
                            style={{ fontWeight: filterType === "all" ? 600 : 400 }}
                          >
                            全部 ({items.length})
                          </button>
                          {(Object.keys(typeConfig) as ScannedItemType[])
                            .filter((t) => items.some((i) => i.type === t))
                            .map((type) => {
                              const cfg = typeConfig[type];
                              const count = items.filter((i) => i.type === type).length;
                              return (
                                <button
                                  key={type}
                                  onClick={() => setFilterType(type)}
                                  className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.6875rem] transition-all ${
                                    filterType === type
                                      ? `border-current/20 ${cfg.bg} ${cfg.color}`
                                      : "border-border/40 text-muted-foreground hover:text-foreground"
                                  }`}
                                  style={{ fontWeight: filterType === type ? 600 : 400 }}
                                >
                                  <cfg.icon className="h-2.5 w-2.5" />
                                  {cfg.label} ({count})
                                </button>
                              );
                            })}
                        </div>

                        {/* Items list */}
                        <div className="space-y-2">
                          {filteredItems.map((item, idx) => {
                            const cfg = typeConfig[item.type];
                            return (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className={`rounded-xl border overflow-hidden transition-all ${
                                  item.addedAsEvent
                                    ? "border-emerald-200/60 bg-emerald-50/30"
                                    : "border-border/40 bg-white hover:shadow-sm"
                                }`}
                              >
                                <div className="flex items-start gap-3 px-3 sm:px-4 py-3">
                                  {/* Type icon */}
                                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.bg} mt-0.5`}>
                                    <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                                  </div>

                                  {/* Content */}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-[0.875rem]" style={{ fontWeight: 600 }}>
                                        {item.title}
                                      </span>
                                      <Badge variant="outline" className={`text-[0.5rem] px-1 py-0 h-4 ${cfg.color} border-current/20`}>
                                        {cfg.label}
                                      </Badge>
                                      {item.confidence >= 0.95 && (
                                        <Badge className="bg-emerald-50 text-emerald-600 text-[0.5rem] px-1 py-0 h-4">高置信</Badge>
                                      )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-[0.6875rem] text-muted-foreground">
                                      <span className="flex items-center gap-0.5">
                                        <CalendarDays className="h-2.5 w-2.5" />
                                        {format(item.date, "M月d日 EEEE", { locale: zhCN })}
                                      </span>
                                      {item.time && (
                                        <span className="flex items-center gap-0.5">
                                          <Clock className="h-2.5 w-2.5" /> {item.time}
                                        </span>
                                      )}
                                      {item.amount && (
                                        <span className="flex items-center gap-0.5">
                                          <DollarSign className="h-2.5 w-2.5" /> {item.amount}
                                        </span>
                                      )}
                                    </div>

                                    {item.location && (
                                      <div className="flex items-center gap-1 mt-0.5 text-[0.6875rem] text-muted-foreground/70">
                                        <MapPin className="h-2.5 w-2.5 shrink-0" />
                                        <span className="truncate">{item.location}</span>
                                      </div>
                                    )}

                                    <div className="flex items-center gap-1 mt-1 text-[0.625rem] text-muted-foreground/50">
                                      <Mail className="h-2.5 w-2.5" />
                                      <span className="truncate">来源：{item.emailSubject}</span>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex flex-col gap-1.5 shrink-0">
                                    {item.addedAsEvent ? (
                                      <Badge className="bg-emerald-100 text-emerald-600 text-[0.5625rem] gap-0.5">
                                        <CheckCircle2 className="h-2.5 w-2.5" /> 已加入
                                      </Badge>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => addAsEvent(item.id)}
                                          className="flex items-center gap-1 rounded-lg bg-primary/10 text-primary px-2 py-1 text-[0.6875rem] hover:bg-primary/20 transition-colors"
                                          style={{ fontWeight: 500 }}
                                        >
                                          <CalendarDays className="h-3 w-3" /> 日程
                                        </button>
                                        <button
                                          onClick={() => addAsTask(item.id)}
                                          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[0.6875rem] transition-colors ${
                                            item.addedAsTask
                                              ? "bg-emerald-50 text-emerald-600"
                                              : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
                                          }`}
                                          style={{ fontWeight: 500 }}
                                        >
                                          <ListTodo className="h-3 w-3" /> 待办
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
