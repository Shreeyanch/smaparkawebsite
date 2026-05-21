import { useState, useEffect, useRef, useCallback } from "react";
import NumberFlow from "@number-flow/react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../api/config";
import { toast } from "sonner";
import { RefreshCw, Info, ChevronDown, ChevronUp } from "lucide-react";
import StoreSelector from "../components/common/StoreSelector";
import LoadingSpinner from "../components/LoadingSpinner";

// ── Milestone definitions ──────────────────────────────────────────────────────
const MILESTONES = [
  {
    label: "10 members",
    sub: "joined",
    check: (d) => (d.totalCustomers || 0) >= 10,
  },
  {
    label: "First reward",
    sub: "redeemed",
    check: (d) => (d.totalRedemptions || 0) >= 1,
  },
  {
    label: "50 members",
    sub: "joined",
    check: (d) => (d.totalCustomers || 0) >= 50,
  },
  {
    label: "First campaign",
    sub: "sent",
    check: (d) => (d.totalCampaigns || 0) >= 1,
  },
  {
    label: "100 members",
    sub: "joined",
    check: (d) => (d.totalCustomers || 0) >= 100,
  },
  {
    label: "50% retention",
    sub: "rate achieved",
    check: (d) => (d.retentionRate || 0) >= 50,
  },
  {
    label: "500 members",
    sub: "joined",
    check: (d) => (d.totalCustomers || 0) >= 500,
  },
  {
    label: "NPR 1 lakh",
    sub: "revenue tracked",
    check: (d) => (d.loyaltyTrackedRevenueNPR || 0) >= 100000,
  },
  {
    label: "1,000 members",
    sub: "joined",
    check: (d) => (d.totalCustomers || 0) >= 1000,
  },
  {
    label: "NPR 5 lakh",
    sub: "revenue tracked",
    check: (d) => (d.loyaltyTrackedRevenueNPR || 0) >= 500000,
  },
];

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const SEGMENTS = {
  first_visit: "First Visit",
  second_visit: "2nd Visit",
  third_visit: "3rd Visit",
  fourth_visit: "4th Visit",
  "5+_visits": "5+ Visits",
};

// ── Inline info tip (click to reveal formula) ────────────────────────────────
// align="left" opens tooltip to the right of the icon (default)
// align="right" opens tooltip to the left, for right-edge placements
function InfoTip({ text, isDarkMode, align = "left" }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-block align-middle ml-1.5"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span
        className={`inline-flex items-center justify-center w-4 h-4 rounded-full border text-[9px] font-bold cursor-default select-none transition-colors ${
          isDarkMode
            ? "border-emerald-800 text-emerald-700 hover:border-emerald-600 hover:text-emerald-500"
            : "border-emerald-600/40 text-emerald-700 hover:border-emerald-600 hover:text-emerald-800"
        }`}
        role="img"
        aria-label="How is this calculated?"
      >
        i
      </span>
      {open && (
        <div
          className={`absolute z-30 w-52 text-xs leading-relaxed rounded-xl px-3.5 py-2.5 shadow-lg pointer-events-none ${
            align === "right" ? "right-6 top-0" : "left-6 top-0"
          } ${
            isDarkMode
              ? "bg-gray-900 text-gray-300 border border-gray-700"
              : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          {text}
        </div>
      )}
    </span>
  );
}

// ── FadeIn ────────────────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = "" }) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setV(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className={className}
      style={{
        opacity: v ? 1 : 0,
        transform: v ? "none" : "translateY(14px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      {children}
    </div>
  );
}

// ── Animated thin bar ─────────────────────────────────────────────────────────
function Bar({ pct, accent = false, isDarkMode }) {
  const [w, setW] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setTimeout(() => setW(pct), 80); },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [pct]);
  return (
    <div
      ref={ref}
      className={`h-0.5 w-full rounded-full overflow-hidden ${
        isDarkMode ? "bg-white/10" : "bg-black/10"
      }`}
    >
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${
          accent ? "bg-emerald-500" : isDarkMode ? "bg-white/60" : "bg-black/50"
        }`}
        style={{ width: `${w}%` }}
      />
    </div>
  );
}

// ── Member growth sparkline ───────────────────────────────────────────────────
function GrowthSparkline({ data, isDarkMode }) {
  const CHART_H = 88; // fixed pixel height for the bar area
  const [mounted, setMounted] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setMounted(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const max = Math.max(...data.map((m) => m.count), 1);
  const maxIdx = data.reduce((mi, m, i) => (m.count > data[mi].count ? i : mi), 0);
  const total = data.reduce((s, m) => s + m.count, 0);

  return (
    <div ref={ref}>
      {/* Summary row */}
      <div className="flex items-baseline justify-between mb-6">
        <div className={`text-3xl font-black tabular-nums tracking-tight ${
          isDarkMode ? "text-white/85" : "text-black/85"
        }`}>
          {total.toLocaleString()}
          <span className={`text-xs font-normal ml-2 ${isDarkMode ? "text-white/30" : "text-black/35"}`}>
            new members
          </span>
        </div>
        <span className={`text-xs ${isDarkMode ? "text-white/25" : "text-black/30"}`}>
          peak{" "}
          <span className={`font-semibold ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>
            {data[maxIdx]?.count}
          </span>{" "}
          in {MONTH_NAMES[(data[maxIdx]?.month - 1) % 12]}
        </span>
      </div>

      {/* Bar area — fixed pixel height so bar heights are reliable */}
      <div
        className="flex items-end gap-1"
        style={{ height: `${CHART_H}px` }}
      >
        {data.map((m, i) => {
          const isMax = i === maxIdx;
          const isHovered = hoveredIdx === i;
          const barH = Math.max(3, Math.round((m.count / max) * CHART_H));
          return (
            <div
              key={i}
              className="relative flex-1 flex items-end h-full cursor-default"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Hover count bubble */}
              {isHovered && (
                <div
                  className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold whitespace-nowrap pointer-events-none z-10 ${
                    isDarkMode
                      ? "bg-white/10 text-white/70"
                      : "bg-black/8 text-black/60"
                  }`}
                >
                  {m.count}
                </div>
              )}
              {/* Bar */}
              <div
                className={`w-full rounded-t-[3px] transition-all ease-out ${
                  isMax
                    ? "bg-emerald-500"
                    : isHovered
                    ? isDarkMode ? "bg-emerald-500/40" : "bg-emerald-500/50"
                    : isDarkMode ? "bg-white/12" : "bg-black/10"
                }`}
                style={{
                  height: mounted ? `${barH}px` : "3px",
                  transitionDuration: "650ms",
                  transitionDelay: mounted ? "0ms" : `${i * 40}ms`,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Baseline */}
      <div className={`h-px w-full mt-0 ${isDarkMode ? "bg-white/8" : "bg-black/8"}`} />

      {/* Month labels */}
      <div className="flex gap-1 mt-2">
        {data.map((m, i) => (
          <div key={i} className="flex-1 flex justify-center">
            <span className={`text-[9px] transition-colors ${
              hoveredIdx === i
                ? isDarkMode ? "text-white/45" : "text-black/55"
                : isDarkMode ? "text-white/20" : "text-black/25"
            }`}>
              {MONTH_NAMES[(m.month - 1) % 12]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Milestone track ───────────────────────────────────────────────────────────
function MilestoneTrack({ milestones, isDarkMode }) {
  return (
    <div
      className="overflow-x-auto py-6 px-6"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <div className="flex items-start min-w-max">
        {milestones.map((m, i) => (
          <div key={i} className="flex items-start">
            {/* Node */}
            <div className="flex flex-col items-center w-24 shrink-0">
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                  m.done
                    ? "bg-emerald-500 border-emerald-500"
                    : isDarkMode
                    ? "border-white/20 bg-transparent"
                    : "border-black/20 bg-transparent"
                }`}
              />
              <p
                className={`text-2xs1 font-semibold text-center mt-2.5 leading-tight ${
                  m.done
                    ? isDarkMode ? "text-white/80" : "text-black/80"
                    : isDarkMode ? "text-white/25" : "text-black/25"
                }`}
              >
                {m.label}
              </p>
              <p
                className={`text-3xs1 text-center mt-0.5 ${
                  m.done
                    ? isDarkMode ? "text-white/40" : "text-black/40"
                    : isDarkMode ? "text-white/15" : "text-black/15"
                }`}
              >
                {m.sub}
              </p>
            </div>

            {/* Connector */}
            {i < milestones.length - 1 && (
              <div
                className={`mt-[6px] w-6 shrink-0 border-t-2 border-dashed ${
                  m.done && milestones[i + 1].done
                    ? "border-emerald-500/50"
                    : isDarkMode
                    ? "border-white/10"
                    : "border-black/10"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Calculation drawer ────────────────────────────────────────────────────────
function CalcDrawer({ isDarkMode, items }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (contentRef.current) setHeight(contentRef.current.scrollHeight);
  }, [open]);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 text-xs min-h-11 px-0 transition-colors ${
          isDarkMode ? "text-white/20 hover:text-white/40" : "text-black/25 hover:text-black/50"
        }`}
        aria-expanded={open}
      >
        <Info className="w-3.5 h-3.5 shrink-0" />
        How are these calculated?
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      <div
        style={{
          maxHeight: open ? `${height}px` : 0,
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <div ref={contentRef}>
          <div
            className={`mt-2 rounded-xl border p-5 ${
              isDarkMode ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between gap-4">
                  <span className={`text-xs leading-relaxed ${isDarkMode ? "text-white/40" : "text-black/40"}`}>
                    {item.label}
                  </span>
                  <span className={`text-xs font-mono shrink-0 ${isDarkMode ? "text-white/60" : "text-black/60"}`}>
                    {item.formula}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Card wrapper ──────────────────────────────────────────────────────────────
function Card({ children, isDarkMode, className = "" }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden ${
        isDarkMode ? "bg-[#1c1c1c]" : "bg-[#f4f4f0]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ── Section label inside card ─────────────────────────────────────────────────
function CardLabel({ children, isDarkMode }) {
  return (
    <p className={`text-3xs1 font-semibold uppercase tracking-[0.18em] mb-5 ${
      isDarkMode ? "text-white/25" : "text-black/30"
    }`}>
      {children}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Impact() {
  const { authState } = useAuth();
  const { isDarkMode } = useTheme();
  const { token } = authState;

  const [storeId, setStoreId] = useState(
    localStorage.getItem("selectedValue") || ""
  );
  const [storeFormat, setStoreFormat] = useState(() => {
    try {
      const saved = localStorage.getItem("selectedStoreData");
      return saved ? JSON.parse(saved)?.loyaltyCard?.format || "" : "";
    } catch { return ""; }
  });
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);
  const [flatDiscountPct, setFlatDiscountPct] = useState(10);

  const fetchImpact = useCallback(
    async (id) => {
      if (!id) return;
      setIsLoading(true);
      setData(null);
      try {
        const res = await api.get(`/store/impact/${id}`, {
          headers: { token },
        });
        if (res.data.success) {
          setData(res.data.data);
          setLastFetched(new Date());
        } else {
          toast.error("Failed to load impact data");
        }
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong loading impact data");
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (storeId) fetchImpact(storeId);
  }, [storeId, fetchImpact]);

  const d = data || {};
  const milestones = MILESTONES.map((m) => ({ ...m, done: m.check(d) }));

  const totalMsgSent =
    (d.totalCampaignsSent || 0) +
    (d.totalNotificationsSent || 0) +
    (d.whatsappMessageCount || 0);

  const bestChannel = [...(d.campaignChannelBreakdown || [])]
    .filter((c) => c.attempted > 0)
    .sort((a, b) => b.deliveryRate - a.deliveryRate)[0];

  const dormantPct =
    d.totalCustomers > 0
      ? Math.round(((d.dormantCustomers || 0) / d.totalCustomers) * 100)
      : 0;

  const hasMonetaryMetrics =
    (d.pointsIssuedValueNPR || 0) > 0 ||
    (d.totalRewardValueDeliveredNPR || 0) > 0 ||
    (d.l5TotalDiscountValueNPR || 0) > 0 ||
    (d.avgCustomerWalletValueNPR || 0) > 0;

  const hasSamparkaReturns = (d.totalSamparkaValueNPR || 0) > 0;

  // ── Repeat Revenue Tracker computed values ──
  // Show for any store that has members — even if no repeat visits yet
  const hasRepeatRevenue = (d.totalCustomers || 0) > 0;

  // ── Smart Rewards Control computed values ──
  const flatDiscountCostNPR = Math.round((d.loyaltyTrackedRevenueNPR || 0) * (flatDiscountPct / 100));
  const actualRewardCost = d.actualRewardCostNPR || 0;
  const rewardSavingsVsFlat = flatDiscountCostNPR - actualRewardCost;
  const hasRewardControl =
    (d.pointsIssuedValueNPR || 0) > 0 ||
    (d.actualRewardCostNPR || 0) > 0 ||
    (d.outstandingLiabilityNPR || 0) > 0 ||
    (d.l5TotalDiscountValueNPR || 0) > 0;

  // ── ROI Calculator computed values ──
  // Samparka monthly cost: from store price field, fallback to Rs 2,000
  const samparkaMonthlyCost = d.storePrice ?? 2000;
  const roiMultiple = (d.repeatCustomerRevenueNPR || 0) > 0 && samparkaMonthlyCost > 0
    ? Math.round((d.repeatCustomerRevenueNPR || 0) / samparkaMonthlyCost)
    : 0;
  // Show ROI section for any store that has recorded any transactions, regardless of format
  const hasROIData =
    (d.totalTransactions || 0) > 0 || (d.l5TotalBillAmount || 0) > 0;

  return (
    <div
      className={`px-2 sm:px-0 md:px-4 lg:px-0 sm:ml-0 lg:ml-64 min-h-screen transition-colors ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* ── Header Section ──────────────────────────────────────────────────── */}
      <div
        className={`border-b shadow-sm transition-colors ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-white border-gray-100"
        }`}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1
                className={`text-2xl font-semibold mb-1 transition-colors ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Your Impact
              </h1>
              <p
                className={`text-sm transition-colors ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Samparka · Business Report
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {storeId && data && (
                <button
                  onClick={() => fetchImpact(storeId)}
                  disabled={isLoading}
                  className={`p-2 rounded-lg border transition-all ${
                    isDarkMode
                      ? "border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600"
                      : "border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300"
                  } disabled:opacity-40`}
                  aria-label="Refresh"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </button>
              )}
              <div className="flex-shrink-0 min-w-[200px]">
                <StoreSelector
                  selectedStoreId={storeId}
                  onStoreIdChange={(id) => {
                    setStoreId(id);
                    localStorage.setItem("selectedValue", id);
                  }}
                  onStoreChange={(store) => {
                    setStoreFormat(store?.loyaltyCard?.format || "");
                  }}
                  variant="default"
                  persistToLocalStorage
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Page Content ────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Empty ─────────────────────────────────────────────────────────── */}
        {!storeId && (
          <div className="py-32 text-center">
            <p className={`text-sm ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
              Select a store to see your impact
            </p>
          </div>
        )}

        {/* ── Loading ───────────────────────────────────────────────────────── */}
        {storeId && isLoading && (
          <div className="flex justify-center py-32">
            <LoadingSpinner />
          </div>
        )}

        {/* ── Content ───────────────────────────────────────────────────────── */}
        {storeId && !isLoading && data && (
          <div className="space-y-2">

              {/* ══ HERO: Two-tone card ══════════════════════════════════════ */}
              <FadeIn delay={80}>
                <div className="rounded-2xl overflow-hidden">
                  {/* GREEN top */}
                  <div className={`px-7 pt-8 pb-7 ${
                    isDarkMode ? "bg-[#0b2012]" : "bg-[#c9f5d5]"
                  }`}>
                    <p className={`text-sm font-medium mb-5 ${
                      isDarkMode ? "text-emerald-600" : "text-emerald-800"
                    }`}>
                      {(d.retentionRate || 0) > 0
                        ? <>
                            Customers who came back
                            <InfoTip
                              isDarkMode={isDarkMode}
                              text="Members who visited 2+ times ÷ all enrolled members × 100"
                            />
                          </>
                        : <>
                            Members in your program
                            <InfoTip
                              isDarkMode={isDarkMode}
                              text="Total customers enrolled in your loyalty program"
                            />
                          </>}
                    </p>

                    {(d.retentionRate || 0) > 0 ? (
                      <div className={`flex items-baseline gap-1.5 leading-none ${
                        isDarkMode ? "text-emerald-400" : "text-emerald-700"
                      }`}>
                        <span className="text-[5.5rem] font-black tabular-nums tracking-tight leading-none">
                          <NumberFlow value={d.retentionRate || 0} />
                        </span>
                        <span className="text-[2.5rem] font-bold leading-none">%</span>
                      </div>
                    ) : (
                      <div className={`leading-none ${
                        isDarkMode ? "text-emerald-400" : "text-emerald-700"
                      }`}>
                        <span className="text-[5.5rem] font-black tabular-nums tracking-tight leading-none">
                          <NumberFlow
                            value={d.totalCustomers || 0}
                          />
                        </span>
                      </div>
                    )}

                    <p className={`text-sm mt-3 ${
                      isDarkMode ? "text-emerald-700" : "text-emerald-800/60"
                    }`}>
                      {(d.retentionRate || 0) > 0
                        ? `${(d.multiVisitCustomers || 0).toLocaleString()} of ${(d.totalCustomers || 0).toLocaleString()} members returned for another visit`
                        : "enrolled in your loyalty program"}
                    </p>
                  </div>

                  {/* DARK bottom */}
                  <div className={`px-7 py-6 flex items-center justify-between gap-6 ${
                    isDarkMode ? "bg-[#1a1a1a]" : "bg-[#ebebeb]"
                  }`}>
                    <div>
                      <p className={`text-sm mb-1.5 ${isDarkMode ? "text-white/40" : "text-black/40"}`}>
                        You saved in operations
                        <InfoTip
                          isDarkMode={isDarkMode}
                          text="Digital cards × रु5   + messages × रु1.5 — vs. traditional paper-based loyalty"
                        />
                      </p>
                      <div className={`flex items-baseline gap-1.5 ${
                        isDarkMode ? "text-white" : "text-gray-950"
                      }`}>
                        <span className="text-lg font-bold">रु</span>
                         <span className="text-[2.25rem] font-black tabular-nums tracking-tight leading-none">
                           <NumberFlow
                             value={d.totalCostSaved || 0}
                           />
                        </span>
                      </div>
                      {(d.totalHoursSaved || 0) > 0 && (
                        <p className={`text-xs mt-1 ${isDarkMode ? "text-white/25" : "text-black/30"}`}>
                          + {(d.totalHoursSaved || 0).toLocaleString()} staff hours saved
                        </p>
                      )}
                    </div>

                    {(d.loyaltyTrackedRevenueNPR || 0) > 0 && (
                      <div className="text-right shrink-0">
                        <p className={`text-xs mb-1.5 ${isDarkMode ? "text-white/30" : "text-black/30"}`}>
                          Revenue tracked
                          <InfoTip
                            isDarkMode={isDarkMode}
                            align="right"
                            text="Points issued ÷ your conversion rate — spend needed to earn those points"
                          />
                        </p>
                        <div className={`flex items-baseline gap-1 justify-end ${
                          isDarkMode ? "text-emerald-400" : "text-emerald-700"
                        }`}>
                          <span className="text-base font-bold">रु</span>
                           <span className="text-2xl font-black tabular-nums tracking-tight leading-none">
                             <NumberFlow
                               value={d.loyaltyTrackedRevenueNPR || 0}
                             />
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 ${isDarkMode ? "text-white/20" : "text-black/25"}`}>
                          through loyalty
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </FadeIn>

              {/* ══ SAMPARKA RETURNS ═══════════════════════════════════════ */}
              {hasSamparkaReturns && (
                <FadeIn delay={120}>
                  <div className={`rounded-2xl overflow-hidden border ${
                    isDarkMode ? "border-emerald-500/20" : "border-emerald-600/20"
                  } ${isDarkMode ? "bg-gray-800/60" : "bg-white"}`}>

                    {/* Header */}
                    <div className="px-7 pt-6 pb-3">
                      <p className={`text-xs font-semibold tracking-widest uppercase ${
                        isDarkMode ? "text-emerald-400/70" : "text-emerald-700/70"
                      }`}>
                        What Samparka earned you
                      </p>
                    </div>

                    {/* Rows */}
                    <div className="px-7 pb-5 space-y-4">

                      {(d.samparkaRevenueNPR || 0) > 0 && (
                        <div className="flex items-start justify-between gap-6">
                          <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                            Revenue tracked through loyalty
                            <InfoTip
                              isDarkMode={isDarkMode}
                              text={
                                storeFormat === "L5"
                                  ? "Total bill amount processed via your L5 program"
                                  : "Revenue attributed to loyalty members via point conversion"
                              }
                            />
                          </span>
                          <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${isDarkMode ? "text-white/80" : "text-black/80"}`}>
                            रु {(d.samparkaRevenueNPR || 0).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {(d.totalCostSaved || 0) > 0 && (
                        <div className="flex items-start justify-between gap-6">
                          <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                            Operations cost avoided
                            <InfoTip
                              isDarkMode={isDarkMode}
                              text="Estimated savings from going digital — physical cards, manual SMS/messaging"
                            />
                          </span>
                          <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${isDarkMode ? "text-white/80" : "text-black/80"}`}>
                            रु {(d.totalCostSaved || 0).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {(d.staffTimeSavedNPR || 0) > 0 && (
                        <div className="flex items-start justify-between gap-6">
                          <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                            Staff time value recovered
                            <InfoTip
                              isDarkMode={isDarkMode}
                              text="Hours saved from manual ledger work × रु 350/hr staff cost estimate"
                            />
                          </span>
                          <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${isDarkMode ? "text-white/80" : "text-black/80"}`}>
                            रु {(d.staffTimeSavedNPR || 0).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {(d.dormancyRecoveryValueNPR || 0) > 0 && (
                        <div className="flex items-start justify-between gap-6">
                          <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                            Dormant customers re-engaged (est.)
                            <InfoTip
                              isDarkMode={isDarkMode}
                              text="Customers reached via at-risk campaigns × average member spend"
                            />
                          </span>
                          <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${isDarkMode ? "text-white/80" : "text-black/80"}`}>
                            रु {(d.dormancyRecoveryValueNPR || 0).toLocaleString()}
                          </span>
                        </div>
                      )}

                    </div>

                    {/* Total line */}
                    <div className={`px-7 py-4 border-t flex items-center justify-between ${
                      isDarkMode ? "border-white/8 bg-emerald-500/5" : "border-black/8 bg-emerald-50/60"
                    }`}>
                      <span className={`text-xs ${isDarkMode ? "text-white/40" : "text-black/40"}`}>
                        Estimated total value
                        <InfoTip
                          isDarkMode={isDarkMode}
                          text="Revenue tracked + cost avoided + time saved + recovery value. Estimate only."
                        />
                      </span>
                      <span className={`text-base font-bold font-mono tabular-nums ${
                        isDarkMode ? "text-emerald-400" : "text-emerald-700"
                      }`}>
                        रु {(d.totalSamparkaValueNPR || 0).toLocaleString()}
                      </span>
                    </div>

                  </div>
                </FadeIn>
              )}

              {/* ══ MILESTONE JOURNEY ══════════════════════════════════════ */}
              <FadeIn delay={160}>
                <Card isDarkMode={isDarkMode}>
                  <MilestoneTrack milestones={milestones} isDarkMode={isDarkMode} />
                </Card>
              </FadeIn>

              {/* ══ KEY NUMBERS ════════════════════════════════════════════ */}
              {/* <FadeIn delay={240}>
                <Card isDarkMode={isDarkMode} className="px-7 py-6">
                  <CardLabel isDarkMode={isDarkMode}>The numbers</CardLabel>
                  <div className="space-y-5">
                    {[
                      ...((d.storeAvgReturnDays || 0) > 0 ? [{
                        label: "Days between visits on average",
                        value: `${d.storeAvgReturnDays} days`,
                        sub: (d.dormantCustomers || 0) > 0
                          ? `${(d.dormantCustomers || 0).toLocaleString()} members haven't visited in 90+ days`
                          : null,
                        warn: dormantPct > 20,
                      }] : []),
                      ...(totalMsgSent > 0 ? [{
                        label: "Messages sent to customers",
                        value: totalMsgSent.toLocaleString(),
                        sub: `across ${(d.totalCampaigns || 0)} campaigns · ${d.deliveryRate || 0}% delivered`,
                        warn: false,
                      }] : []),
                      ...((d.totalRedemptions || 0) > 0 ? [{
                        label: "Rewards redeemed",
                        value: (d.totalRedemptions || 0).toLocaleString(),
                        sub: (d.redemptionSavingsNPR || 0) > 0
                          ? `रु ${(d.redemptionSavingsNPR || 0).toLocaleString()} in customer savings`
                          : null,
                        warn: false,
                      }] : []),
                      ...((d.totalPointsIssued || 0) > 0 ? [{
                        label: "Loyalty points issued",
                        value: `${(d.totalPointsIssued || 0).toLocaleString()} pts`,
                        sub: (d.totalOutstandingPoints || 0) > 0
                          ? `${(d.totalOutstandingPoints || 0).toLocaleString()} pts still unclaimed by customers`
                          : null,
                        warn: false,
                      }] : []),
                      // ...((d.customersWithDOB || 0) > 0 ? [{
                      //   label: "Members with birthday automation",
                      //   value: (d.customersWithDOB || 0).toLocaleString(),
                      //   sub: "get a personal touch on their birthday",
                      //   warn: false,
                      // }] : []),
                      ...((d.dormancyRecoveryRate || 0) > 0 ? [{
                        label: "Dormant customers re-engaged",
                        value: `${d.dormancyRecoveryRate}%`,
                        sub: "reached via targeted campaigns",
                        warn: false,
                      }] : []),
                    ].map((row, i) => (
                        <div key={i} className="flex items-start justify-between gap-6">
                          <div className="flex-1">
                            <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                              {row.label}
                            </span>
                            {row.sub && (
                              <p className={`text-xs mt-0.5 ${
                                row.warn
                                  ? "text-amber-500"
                                  : isDarkMode ? "text-white/25" : "text-black/30"
                              }`}>
                                {row.sub}
                              </p>
                            )}
                          </div>
                          <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${
                            isDarkMode ? "text-white/80" : "text-black/80"
                          }`}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                  </div>
                </Card>
              </FadeIn> */}

              {/* ══ LOYALTY ECONOMICS ══════════════════════════════════════ */}
              {/* {hasMonetaryMetrics && (
                <FadeIn delay={300}>
                  <Card isDarkMode={isDarkMode} className="px-7 py-6">
                    <CardLabel isDarkMode={isDarkMode}>Loyalty economics</CardLabel>
                    <div className="space-y-5">

                      {(d.pointsIssuedValueNPR || 0) > 0 && (
                        <div className="flex items-start justify-between gap-6">
                          <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                            Points issued as loyalty value
                            <InfoTip isDarkMode={isDarkMode} text="Total points issued × point value (NPR)" />
                          </span>
                          <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${isDarkMode ? "text-white/80" : "text-black/80"}`}>
                            रु {(d.pointsIssuedValueNPR || 0).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {(d.totalRewardValueDeliveredNPR || 0) > 0 && (
                        <div className="flex items-start justify-between gap-6">
                          <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                            Reward value delivered to customers
                            <InfoTip isDarkMode={isDarkMode} text="Sum of redeemed reward costs (in points) × point value (NPR)" />
                          </span>
                          <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${isDarkMode ? "text-white/80" : "text-black/80"}`}>
                            रु {(d.totalRewardValueDeliveredNPR || 0).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {(d.l5TotalDiscountValueNPR || 0) > 0 && (
                        <div className="flex items-start justify-between gap-6">
                          <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                            Discount value given via L5 program
                            <InfoTip isDarkMode={isDarkMode} text="Bill amount × discount % for all used L5 redemptions" />
                          </span>
                          <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${isDarkMode ? "text-white/80" : "text-black/80"}`}>
                            रु {(d.l5TotalDiscountValueNPR || 0).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {(d.avgCustomerWalletValueNPR || 0) > 0 && (
                        <div className="flex items-start justify-between gap-6">
                          <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                            Avg value in each customer's wallet
                            <InfoTip isDarkMode={isDarkMode} text="Outstanding points ÷ total members × point value" />
                          </span>
                          <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${isDarkMode ? "text-white/80" : "text-black/80"}`}>
                            रु {(d.avgCustomerWalletValueNPR || 0).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {(d.rewardCatalogTotalValueNPR || 0) > 0 && (
                        <div className="flex items-start justify-between gap-6">
                          <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                            Total potential reward giveaway value
                            <InfoTip isDarkMode={isDarkMode} text="Sum of all reward point costs × point value — max payout if all rewards claimed" />
                          </span>
                          <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${isDarkMode ? "text-white/80" : "text-black/80"}`}>
                            रु {(d.rewardCatalogTotalValueNPR || 0).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {(d.loyaltyProgramROI || 0) > 0 && (
                        <div className={`pt-4 border-t flex items-center justify-between ${isDarkMode ? "border-white/8" : "border-black/8"}`}>
                          <span className={`text-xs ${isDarkMode ? "text-white/30" : "text-black/35"}`}>
                            Loyalty ROI
                            <InfoTip isDarkMode={isDarkMode} text="Revenue tracked ÷ (outstanding liability + redemption savings)" />
                          </span>
                          <span className={`text-sm font-bold font-mono ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>
                            रु 1 → रु {d.loyaltyProgramROI}
                          </span>
                        </div>
                      )}

                    </div>
                  </Card>
                </FadeIn>
              )} */}

              {/* ══ ROI CALCULATOR ══════════════════════════════════════════ */}
              {hasROIData && (
                <FadeIn delay={310}>
                  <div className={`rounded-2xl overflow-hidden border ${
                    isDarkMode ? "border-amber-500/20" : "border-amber-500/25"
                  } ${isDarkMode ? "bg-gray-800/60" : "bg-white"}`}>

                    {/* Header */}
                    <div className="px-7 pt-6 pb-3">
                      <p className={`text-xs font-semibold tracking-widest uppercase ${
                        isDarkMode ? "text-amber-400/70" : "text-amber-700/70"
                      }`}>
                        Return on investment
                      </p>
                    </div>

                    {/* Rows */}
                    <div className="px-7 pb-5 space-y-4">

                      {(d.loyaltyTrackedRevenueNPR || 0) > 0 && (
                        <div className="flex items-start justify-between gap-6">
                          <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                            Total revenue tracked
                            <InfoTip isDarkMode={isDarkMode} text="Total revenue attributed to loyalty members via point conversion" />
                          </span>
                          <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${isDarkMode ? "text-white/80" : "text-black/80"}`}>
                            रु {(d.loyaltyTrackedRevenueNPR || 0).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {(d.repeatCustomerRevenueNPR || 0) > 0 && (
                        <div className="flex items-start justify-between gap-6">
                          <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                            Revenue from repeat customers
                            <InfoTip isDarkMode={isDarkMode} text="Revenue from members who visited 2+ times, calculated from their earned points ÷ conversion rate" />
                          </span>
                          <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${isDarkMode ? "text-white/80" : "text-black/80"}`}>
                            रु {(d.repeatCustomerRevenueNPR || 0).toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-6">
                        <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                          Samparka monthly cost
                          <InfoTip isDarkMode={isDarkMode} text="Your Samparka subscription cost per month" />
                        </span>
                        <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${isDarkMode ? "text-white/80" : "text-black/80"}`}>
                          रु {samparkaMonthlyCost.toLocaleString()}
                        </span>
                      </div>

                    </div>

                    {/* ROI highlight */}
                    {roiMultiple > 0 && (
                      <div className={`px-7 py-4 border-t ${
                        isDarkMode ? "border-white/8 bg-amber-500/5" : "border-black/8 bg-amber-50/60"
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${isDarkMode ? "text-white/40" : "text-black/40"}`}>
                            ROI multiple
                            <InfoTip isDarkMode={isDarkMode} text="Repeat customer revenue ÷ Samparka monthly cost" />
                          </span>
                          <span className={`text-lg font-black font-mono tabular-nums ${
                            isDarkMode ? "text-amber-400" : "text-amber-600"
                          }`}>
                            {roiMultiple}X
                          </span>
                        </div>
                        <p className={`text-xs mt-2 ${
                          isDarkMode ? "text-amber-400/50" : "text-amber-700/50"
                        }`}>
                          Your loyalty system returned {roiMultiple}X your investment.
                        </p>
                      </div>
                    )}

                  </div>
                </FadeIn>
              )}

              {/* ══ REPEAT REVENUE TRACKER ═════════════════════════════════ */}
              {hasRepeatRevenue && (
                <FadeIn delay={330}>
                  <Card isDarkMode={isDarkMode} className="px-7 py-6">
                    <CardLabel isDarkMode={isDarkMode}>Repeat revenue</CardLabel>
                    <div className="space-y-5">

                      <div className="flex items-start justify-between gap-6">
                        <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                          Total customers
                        </span>
                        <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${isDarkMode ? "text-white/80" : "text-black/80"}`}>
                          {(d.totalCustomers || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                            Repeat customers
                            <InfoTip isDarkMode={isDarkMode} text="Members who visited your business 2 or more times" />
                          </span>
                          {(d.retentionRate || 0) > 0 && (
                            <p className={`text-xs mt-0.5 ${isDarkMode ? "text-white/25" : "text-black/30"}`}>
                              {d.retentionRate}% of all customers
                            </p>
                          )}
                        </div>
                        <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${isDarkMode ? "text-white/80" : "text-black/80"}`}>
                          {(d.multiVisitCustomers || 0).toLocaleString()}
                        </span>
                      </div>

                      {(d.repeatCustomerRevenueNPR || 0) > 0 && (
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1">
                            <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                              Revenue from repeat customers
                              <InfoTip isDarkMode={isDarkMode} text="Total spend by customers with 2+ visits, calculated from points earned ÷ conversion rate" />
                            </span>
                            {(d.repeatRevenuePercentage || 0) > 0 && (
                              <p className={`text-xs mt-0.5 ${isDarkMode ? "text-white/25" : "text-black/30"}`}>
                                {d.repeatRevenuePercentage}% of total revenue
                              </p>
                            )}
                          </div>
                          <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${
                            isDarkMode ? "text-emerald-400" : "text-emerald-700"
                          }`}>
                            रु {(d.repeatCustomerRevenueNPR || 0).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {(d.avgSpendPerRepeatCustomer || 0) > 0 && (
                        <div className="flex items-start justify-between gap-6">
                          <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                            Avg spend per repeat customer
                            <InfoTip isDarkMode={isDarkMode} text="Repeat customer revenue ÷ number of repeat customers" />
                          </span>
                          <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${isDarkMode ? "text-white/80" : "text-black/80"}`}>
                            रु {(d.avgSpendPerRepeatCustomer || 0).toLocaleString()}
                          </span>
                        </div>
                      )}

                    </div>

                    {/* Insight */}
                    {(d.repeatCustomerRevenueNPR || 0) > 0 && (
                      <div className={`mt-5 pt-4 border-t ${isDarkMode ? "border-white/8" : "border-black/8"}`}>
                        <p className={`text-xs leading-relaxed ${
                          isDarkMode ? "text-emerald-400/60" : "text-emerald-700/60"
                        }`}>
                          Repeat customers generated रु {(d.repeatCustomerRevenueNPR || 0).toLocaleString()} in revenue.
                          Acquiring a new customer costs 5-7x more than retaining one — Samparka
                          reduces acquisition cost by increasing retention.
                        </p>
                      </div>
                    )}
                  </Card>
                </FadeIn>
              )}

              {/* ══ SMART REWARDS CONTROL ══════════════════════════════════ */}
              {hasRewardControl && (
                <FadeIn delay={350}>
                  <Card isDarkMode={isDarkMode} className="px-7 py-6">
                    <CardLabel isDarkMode={isDarkMode}>Reward cost control</CardLabel>
                    <div className="space-y-5">

                      {(d.pointsIssuedValueNPR || 0) > 0 && (
                        <div className="flex items-start justify-between gap-6">
                          <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                            Total rewards issued (value)
                            <InfoTip isDarkMode={isDarkMode} text="Total loyalty points issued converted to NPR value" />
                          </span>
                          <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${isDarkMode ? "text-white/80" : "text-black/80"}`}>
                            रु {(d.pointsIssuedValueNPR || 0).toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                            Actual rewards redeemed
                            <InfoTip isDarkMode={isDarkMode} text="Points redeemed × point value (+ any L5 discount value) — the real cost of your loyalty program" />
                          </span>
                          {(d.effectiveDiscountRate || 0) > 0 && (
                            <p className={`text-xs mt-0.5 ${isDarkMode ? "text-white/25" : "text-black/30"}`}>
                              effective rate: {d.effectiveDiscountRate}% of revenue
                            </p>
                          )}
                        </div>
                        <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${isDarkMode ? "text-white/80" : "text-black/80"}`}>
                          रु {actualRewardCost.toLocaleString()}
                        </span>
                      </div>

                      {(d.outstandingLiabilityNPR || 0) > 0 && (
                        <div className="flex items-start justify-between gap-6">
                          <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                            Unredeemed reward liability
                            <InfoTip isDarkMode={isDarkMode} text="Outstanding points in customer wallets × point value — potential future cost" />
                          </span>
                          <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${isDarkMode ? "text-white/80" : "text-black/80"}`}>
                            रु {(d.outstandingLiabilityNPR || 0).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* Flat discount comparison with interactive slider */}
                      <div className={`pt-4 border-t ${isDarkMode ? "border-white/8" : "border-black/8"}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs ${isDarkMode ? "text-white/40" : "text-black/40"}`}>
                            Compare: flat discount scenario
                          </span>
                          <div className="flex items-center gap-2">
                            {[5, 10, 15, 20].map((pct) => (
                              <button
                                key={pct}
                                onClick={() => setFlatDiscountPct(pct)}
                                className={`px-2 py-0.5 rounded text-xs font-mono transition-all ${
                                  flatDiscountPct === pct
                                    ? isDarkMode
                                      ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                                      : "bg-emerald-100 text-emerald-700 font-semibold"
                                    : isDarkMode
                                      ? "text-white/30 hover:text-white/50"
                                      : "text-black/30 hover:text-black/50"
                                }`}
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-start justify-between gap-6 mb-2">
                          <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                            Flat {flatDiscountPct}% on all sales would cost
                            <InfoTip isDarkMode={isDarkMode} text={`Revenue × ${flatDiscountPct}% = hypothetical cost if you gave a flat discount to every customer`} />
                          </span>
                          <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${
                            isDarkMode ? "text-red-400/70" : "text-red-600/70"
                          }`}>
                            रु {flatDiscountCostNPR.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-start justify-between gap-6">
                          <span className={`text-sm ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                            With Samparka, actual cost was
                          </span>
                          <span className={`text-sm font-semibold font-mono tabular-nums shrink-0 ${
                            isDarkMode ? "text-emerald-400" : "text-emerald-600"
                          }`}>
                            रु {actualRewardCost.toLocaleString()}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Savings highlight */}
                    {rewardSavingsVsFlat > 0 && (
                      <div className={`mt-5 pt-4 border-t ${isDarkMode ? "border-white/8" : "border-black/8"}`}>
                        <p className={`text-xs leading-relaxed ${
                          isDarkMode ? "text-emerald-400/60" : "text-emerald-700/60"
                        }`}>
                          You saved रु {rewardSavingsVsFlat.toLocaleString()} compared to a flat {flatDiscountPct}% discount
                          strategy. Samparka&apos;s controlled reward system ensures only engaged customers redeem,
                          keeping your costs predictable.
                        </p>
                      </div>
                    )}
                  </Card>
                </FadeIn>
              )}

              {/* ══ VISIT FREQUENCY ════════════════════════════════════════ */}
              {/* {(d.visitSegmentBreakdown || []).length > 0 && (
                <FadeIn delay={320}>
                  <Card isDarkMode={isDarkMode} className="px-7 py-6">
                    <CardLabel isDarkMode={isDarkMode}>How often customers visit</CardLabel>
                    <div className="space-y-5">
                      {d.visitSegmentBreakdown.map((seg, i) => {
                        const pct =
                          d.totalTrackedCustomers > 0
                            ? Math.round((seg.count / d.totalTrackedCustomers) * 100)
                            : 0;
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-sm ${isDarkMode ? "text-white/60" : "text-black/60"}`}>
                                {SEGMENTS[seg.segment] || seg.segment}
                                {seg.avgReturnDays > 0 && (
                                  <span className={`ml-2 text-xs ${isDarkMode ? "text-white/25" : "text-black/30"}`}>
                                    · every {seg.avgReturnDays}d
                                  </span>
                                )}
                              </span>
                              <span className={`text-sm font-mono tabular-nums ${
                                isDarkMode ? "text-white/50" : "text-black/50"
                              }`}>
                                {(seg.count || 0).toLocaleString()}{" "}
                                <span className="text-xs">({pct}%)</span>
                              </span>
                            </div>
                            <Bar
                              pct={pct}
                              accent={seg.segment === "5+_visits"}
                              isDarkMode={isDarkMode}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </FadeIn>
              )} */}

              {/* ══ MEMBER GROWTH ══════════════════════════════════════════ */}
              {/* {(d.memberGrowthByMonth || []).length > 0 && (
                <FadeIn delay={400}>
                  <Card isDarkMode={isDarkMode} className="px-7 py-6">
                    <div className="flex items-baseline justify-between mb-5">
                      <CardLabel isDarkMode={isDarkMode}>New members joining</CardLabel>
                      <span className={`text-xs -mt-5 ${isDarkMode ? "text-white/25" : "text-black/30"}`}>
                        last {d.memberGrowthByMonth.length} months
                      </span>
                    </div>
                    <GrowthSparkline data={d.memberGrowthByMonth} isDarkMode={isDarkMode} />
                  </Card>
                </FadeIn>
              )} */}

              {/* ══ CHANNEL PERFORMANCE ════════════════════════════════════ */}
              {/* {(d.campaignChannelBreakdown || []).length > 0 && (
                <FadeIn delay={480}>
                  <Card isDarkMode={isDarkMode} className="px-7 py-6">
                    <div className="flex items-baseline justify-between mb-5">
                      <CardLabel isDarkMode={isDarkMode}>Which channel works best</CardLabel>
                      {bestChannel && (
                        <span className={`text-xs -mt-5 ${isDarkMode ? "text-white/25" : "text-black/30"}`}>
                          Best: <span className={`font-medium ${isDarkMode ? "text-white/50" : "text-black/50"}`}>
                            {bestChannel.channel}
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="space-y-5">
                      {d.campaignChannelBreakdown.map((ch, i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm capitalize ${isDarkMode ? "text-white/60" : "text-black/60"}`}>
                              {ch.channel}
                            </span>
                            <span className={`text-sm font-mono font-semibold ${
                              isDarkMode ? "text-white/70" : "text-black/70"
                            }`}>
                              {ch.deliveryRate}%{" "}
                              <span className={`text-xs font-normal ${
                                isDarkMode ? "text-white/25" : "text-black/25"
                              }`}>
                                delivered · {(ch.sent || 0).toLocaleString()} sent
                              </span>
                            </span>
                          </div>
                          <Bar
                            pct={ch.deliveryRate}
                            accent={ch.deliveryRate >= 85}
                            isDarkMode={isDarkMode}
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                </FadeIn>
              )} */}

              {/* ══ TIER DISTRIBUTION — only for L3 / L4 / L34HA stores ══ */}
              {["L3", "L4", "L34HA"].includes(storeFormat) && (d.tierDistribution || []).length > 0 && (
                <FadeIn delay={560}>
                  <Card isDarkMode={isDarkMode} className="px-7 py-6">
                    <div className="flex items-baseline justify-between mb-5">
                      <CardLabel isDarkMode={isDarkMode}>Member tiers</CardLabel>
                      <span className={`text-xs -mt-5 ${isDarkMode ? "text-white/25" : "text-black/30"}`}>
                        {(d.totalCustomers || 0).toLocaleString()} total
                      </span>
                    </div>
                    <div className="space-y-5">
                      {d.tierDistribution.map((tier, i) => {
                        const pct =
                          d.totalCustomers > 0
                            ? Math.round((tier.count / d.totalCustomers) * 100)
                            : 0;
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-sm ${isDarkMode ? "text-white/60" : "text-black/60"}`}>
                                {tier._id || "Default"}
                              </span>
                              <span className={`text-sm font-mono ${
                                isDarkMode ? "text-white/50" : "text-black/50"
                              }`}>
                                {(tier.count || 0).toLocaleString()}{" "}
                                <span className="text-xs">({pct}%)</span>
                              </span>
                            </div>
                            <Bar pct={pct} isDarkMode={isDarkMode} />
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </FadeIn>
              )}

              {/* ══ GAMIFICATION (conditional) ═════════════════════════════ */}
              {/* {((d.totalWheelSegments || 0) > 0 || (d.totalOffers || 0) > 0) && (
                <FadeIn delay={600}>
                  <Card isDarkMode={isDarkMode} className="px-7 py-6">
                    <CardLabel isDarkMode={isDarkMode}>Gamification & Offers</CardLabel>
                    <div className="flex gap-10">
                      {(d.totalOffers || 0) > 0 && (
                        <div>
                          <div className={`text-3xl font-black tabular-nums ${
                            isDarkMode ? "text-white/80" : "text-black/80"
                          }`}>
                            <NumberFlow value={d.totalOffers || 0} />
                          </div>
                          <p className={`text-xs mt-0.5 ${isDarkMode ? "text-white/30" : "text-black/30"}`}>
                            offers published · {d.activeOffers || 0} live
                          </p>
                        </div>
                      )}
                      {(d.totalWheelSegments || 0) > 0 && (
                        <div>
                          <div className={`text-3xl font-black tabular-nums ${
                            isDarkMode ? "text-white/80" : "text-black/80"
                          }`}>
                            <NumberFlow value={d.totalWheelSegments || 0} />
                          </div>
                          <p className={`text-xs mt-0.5 ${isDarkMode ? "text-white/30" : "text-black/30"}`}>
                            spin wheel segments · {d.activeWheelSegments || 0} active
                          </p>
                        </div>
                      )}
                      {d.leaderboardStats && (d.leaderboardStats.qualifiedCount || 0) > 0 && (
                        <div>
                          <div className={`text-3xl font-black tabular-nums ${
                            isDarkMode ? "text-white/80" : "text-black/80"
                          }`}>
                            <NumberFlow value={d.leaderboardStats.qualifiedCount || 0} />
                          </div>
                          <p className={`text-xs mt-0.5 ${isDarkMode ? "text-white/30" : "text-black/30"}`}>
                            leaderboard qualifiers · {d.leaderboardStats.monthlyWinners || 0} winners
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </FadeIn>
              )} */}

              {/* ══ E-COMMERCE (conditional) ═══════════════════════════════ */}
              {/* {(d.ecommerceOrders?.totalOrders || 0) > 0 && (
                <FadeIn delay={640}>
                  <Card isDarkMode={isDarkMode} className="px-7 py-6">
                    <CardLabel isDarkMode={isDarkMode}>Online orders</CardLabel>
                    <div className="flex gap-10">
                      <div>
                        <div className={`flex items-baseline gap-1 ${
                          isDarkMode ? "text-emerald-400" : "text-emerald-700"
                        }`}>
                          <span className="text-base font-bold">रु</span>
                          <span className="text-3xl font-black tabular-nums tracking-tight">
                            <NumberFlow
                              value={d.ecommerceOrders?.totalRevenue || 0}
                              format={{ notation: "compact", maximumFractionDigits: 1 }}
                            />
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 ${isDarkMode ? "text-white/30" : "text-black/30"}`}>
                          total revenue
                        </p>
                      </div>
                      <div>
                        <div className={`text-3xl font-black tabular-nums ${
                          isDarkMode ? "text-white/80" : "text-black/80"
                        }`}>
                          <NumberFlow value={d.ecommerceOrders?.totalOrders || 0} />
                        </div>
                        <p className={`text-xs mt-0.5 ${isDarkMode ? "text-white/30" : "text-black/30"}`}>
                          orders · {d.ecommerceOrders?.fulfillmentRate || 0}% fulfilled
                        </p>
                      </div>
                    </div>
                  </Card>
                </FadeIn>
              )} */}

              {/* ══ FOOTER ═════════════════════════════════════════════════ */}
              <FadeIn delay={400}>
                <div className="pt-4 pb-10">
                  <CalcDrawer
                    isDarkMode={isDarkMode}
                    items={[
                      {
                        label: "Loyalty-tracked revenue",
                        formula: "Points issued ÷ conversion rate",
                      },
                      {
                        label: "Redemption savings",
                        formula: "Points redeemed × point value (NPR)",
                      },
                      {
                        label: "Hours saved",
                        formula: "Txns×3 + Messages×2 + Reservations×5 + Members×5 + Birthdays×3 min",
                      },
                      {
                        label: "Cost saved",
                        formula: "Members×रु20 (card) + Messages×रु1.5",
                      },
                      {
                        label: "Retention rate",
                        formula: "Multi-visit ÷ Total tracked × 100",
                      },
                      {
                        label: "Outstanding liability",
                        formula: "Outstanding points × store point value",
                      },
                      {
                        label: "Points issued value",
                        formula: "Points issued × point value (NPR)",
                      },
                      {
                        label: "Reward value delivered",
                        formula: "Redeemed reward pts × point value (NPR)",
                      },
                      {
                        label: "L5 discount value",
                        formula: "Bill amount × discount % (used L5 redemptions)",
                      },
                      {
                        label: "Loyalty ROI",
                        formula: "Revenue tracked ÷ (liability + redemption savings)",
                      },
                      {
                        label: "Staff time value",
                        formula: "Hours saved × रु 350/hr staff cost",
                      },
                      {
                        label: "Dormancy recovery",
                        formula: "At-risk customers reached × avg member spend",
                      },
                      {
                        label: "Samparka revenue",
                        formula: "L5: bill amount total. Others: points ÷ conversion rate",
                      },
                      {
                        label: "Total Samparka value",
                        formula: "Revenue tracked + costs avoided + time value + recovery",
                      },
                      {
                        label: "Delivery rate",
                        formula: "Sent ÷ Attempted × 100 per channel",
                      },
                      {
                        label: "Repeat customer revenue",
                        formula: "Points earned by 2+ visit customers ÷ conversion rate",
                      },
                      {
                        label: "Repeat revenue %",
                        formula: "Repeat customer revenue ÷ total revenue × 100",
                      },
                      {
                        label: "Effective discount rate",
                        formula: "(Redemption savings + L5 discounts) ÷ revenue × 100",
                      },
                      {
                        label: "Flat discount comparison",
                        formula: "Revenue × selected flat % − actual reward cost = savings",
                      },
                      {
                        label: "ROI multiple",
                        formula: "Repeat customer revenue ÷ Samparka monthly cost (रु 1,470)",
                      },
                    ]}
                  />
                  {lastFetched && (
                    <p className={`text-xs mt-4 ${isDarkMode ? "text-white/12" : "text-black/20"}`}>
                      Updated{" "}
                      {lastFetched.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      · Estimates based on industry benchmarks
                    </p>
                  )}
                </div>
              </FadeIn>

          </div>
        )}
      </div>
    </div>
  );
}
