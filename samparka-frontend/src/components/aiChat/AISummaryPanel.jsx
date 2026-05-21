import { Users, AlertTriangle, Star, TrendingUp, UserX } from "lucide-react";

const CARDS = [
  { key: "activeCustomers", label: "Active (30d)", icon: Users, color: "text-green-500" },
  { key: "atRiskCount", label: "At-Risk", icon: AlertTriangle, color: "text-orange-500" },
  { key: "vipCustomers", label: "VIP (5+ visits)", icon: Star, color: "text-yellow-500" },
  { key: "repeatRate", label: "Repeat Rate", icon: TrendingUp, color: "text-blue-500", suffix: "%" },
  { key: "churnedCount", label: "Churned (90d)", icon: UserX, color: "text-red-500" },
];

export default function AISummaryPanel({ retentionData, summaryData, isDarkMode }) {
  const merged = {
    activeCustomers: summaryData?.activeCustomers ?? 0,
    atRiskCount: summaryData?.atRiskCount ?? 0,
    vipCustomers: summaryData?.vipCustomers ?? 0,
    repeatRate: summaryData?.repeatRate != null ? Number(summaryData.repeatRate).toFixed(1) : "—",
    churnedCount: retentionData?.churnedCount ?? 0,
  };

  return (
    <div
      className={`w-56 flex-shrink-0 flex flex-col gap-3 overflow-y-auto pr-1 ${
        isDarkMode ? "text-gray-100" : "text-gray-800"
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
          isDarkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        Store Snapshot
      </p>
      {CARDS.map(({ key, label, icon: Icon, color, suffix }) => (
        <div
          key={key}
          className={`rounded-xl p-3 flex items-center gap-3 ${
            isDarkMode ? "bg-gray-800" : "bg-white shadow-sm border border-gray-100"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isDarkMode ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div>
            <p className="text-lg font-bold leading-none">
              {merged[key] ?? "—"}
              {suffix && typeof merged[key] === "string" && merged[key] !== "—" ? suffix : ""}
            </p>
            <p
              className={`text-xs mt-0.5 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
