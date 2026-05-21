import { ChevronLeft, Gift, Flame } from "lucide-react";

const L6RewardsHero = ({
  activeTab,
  counts,
  customerPoints,
  customerTier,
  visitStreak,
  onBack,
  onTabChange,
}) => {
  const tabs = [
    { key: "all", label: "All" },
    { key: "tier", label: "Tier" },
    { key: "streak", label: "Streak" },
    { key: "point", label: "Points" },
    { key: "mission", label: "Missions" },
  ];

  return (
    <div className="sticky top-0 z-30 border-b border-amber-100/70 bg-white/90 backdrop-blur-md">
      <div className="max-w-[430px] mx-auto px-4 pt-3 pb-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="rounded-full p-1.5 transition hover:bg-amber-100/60">
            <ChevronLeft size={22} className="text-zinc-700" />
          </button>
          {/* <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <Sparkles size={12} />
            L6 Rewards
          </span> */}
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-orange-50 to-emerald-50 p-3.5 shadow-[0_10px_30px_-22px_rgba(217,119,6,0.7)]">
          <div className="flex items-center gap-2 text-zinc-900">
            <Gift size={17} className="text-amber-600" />
            <h1 className="text-[18px] font-semibold" style={{ fontFamily: "var(--font-garet, var(--font-poppins, Poppins, sans-serif))" }}>
              Rewards Hub
            </h1>
          </div>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">Your Points</p>
              <p className="text-[34px] leading-none font-semibold text-zinc-900" style={{ fontFamily: "var(--font-garet, var(--font-poppins, Poppins, sans-serif))" }}>
                {customerPoints}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="rounded-full bg-white/85 px-2.5 py-1 text-[12px] font-semibold text-zinc-700">{customerTier || "No tier"}</span>
              {visitStreak > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-[12px] font-semibold text-orange-700">
                  <Flame size={11} />
                  {visitStreak} day streak
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all"
                style={{
                  background: isActive ? "#111827" : "#f4f4f5",
                  color: isActive ? "#fff" : "#52525b",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default L6RewardsHero;
