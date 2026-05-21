import React, { useState } from "react";
import {
  Ticket,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  ChevronRight,
  Gift,
  Film,
  Coffee as CoffeeIcon,
} from "lucide-react";
import { toast } from "sonner";

/**
 * L5 Vouchers Component
 * Premium voucher wallet with elegant card design
 *
 * Design Direction: Digital wallet meets luxury gift cards
 * - Ticket-style voucher cards with perforated edge effect
 * - Status-based visual hierarchy
 * - Smooth reveal animations
 */
const L5Vouchers = ({
  vouchers = [],
  onUseVoucher,
  isLoading = false,
}) => {
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [activeTab, setActiveTab] = useState("unused");
  const [copiedCode, setCopiedCode] = useState(null);

  // Group vouchers by status
  const grouped = {
    unused: vouchers.filter(v => v.status === "unused"),
    used: vouchers.filter(v => v.status === "used"),
    expired: vouchers.filter(v => v.status === "expired"),
  };

  const totalUnusedValue = grouped.unused.reduce((sum, v) => sum + (v.voucherAmount || 0), 0);

  const getVoucherIcon = (type) => {
    switch (type) {
      case "movie_ticket": return Film;
      case "coffee": return CoffeeIcon;
      default: return Gift;
    }
  };

  const copyToClipboard = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success("Voucher code copied!");
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysRemaining = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const VoucherCard = ({ voucher, status }) => {
    const Icon = getVoucherIcon(voucher.voucherType);
    const daysRemaining = getDaysRemaining(voucher.expiryDate);
    const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

    return (
      <div
        className={`relative overflow-hidden rounded-2xl transition-all duration-300 ${
          status === "unused"
            ? "bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-amber-500/10 border border-amber-500/30 hover:border-amber-400/50"
            : status === "used"
            ? "bg-stone-800/30 border border-stone-700/30 opacity-70"
            : "bg-stone-800/20 border border-stone-800/30 opacity-50"
        }`}
      >
        {/* Perforated Edge Effect */}
        <div className="absolute left-0 top-0 bottom-0 w-4 flex flex-col justify-around py-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-stone-950" />
          ))}
        </div>

        {/* Glow Effect for Active */}
        {status === "unused" && (
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5" />
        )}

        <div className="relative p-5 pl-8">
          <div className="flex gap-4">
            {/* Icon */}
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
              status === "unused"
                ? "bg-amber-500/20"
                : "bg-stone-700/50"
            }`}>
              <Icon className={`w-8 h-8 ${
                status === "unused" ? "text-amber-400" : "text-stone-500"
              }`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className={`text-2xl font-bold ${
                    status === "unused" ? "text-white" : "text-stone-500"
                  }`} style={{ fontFamily: "'Playfair Display', serif" }}>
                    Rs. {voucher.voucherAmount?.toLocaleString()}
                  </p>
                  <p className="text-xs text-stone-500">
                    {voucher.voucherType === "movie_ticket" ? "Movie Ticket" : "Cash Voucher"}
                  </p>
                </div>

                {/* Status Badge */}
                <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  status === "unused"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : status === "used"
                    ? "bg-stone-700/50 text-stone-400"
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {status === "unused" ? "Active" : status === "used" ? "Used" : "Expired"}
                </div>
              </div>

              {/* Voucher Code */}
              <div className={`flex items-center gap-2 p-2 rounded-lg mb-3 ${
                status === "unused" ? "bg-stone-800/50" : "bg-stone-800/30"
              }`}>
                <code className={`text-sm font-mono flex-1 ${
                  status === "unused" ? "text-amber-300" : "text-stone-500"
                }`}>
                  {voucher.voucherCode}
                </code>
                {status === "unused" && (
                  <button
                    onClick={() => copyToClipboard(voucher.voucherCode)}
                    className="p-1 hover:bg-stone-700 rounded transition-colors"
                  >
                    {copiedCode === voucher.voucherCode ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-stone-400" />
                    )}
                  </button>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-xs">
                {status === "unused" && (
                  <>
                    <div className={`flex items-center gap-1 ${
                      isExpiringSoon ? "text-orange-400" : "text-stone-500"
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>{daysRemaining > 0 ? `${daysRemaining} days left` : "Expires today"}</span>
                    </div>
                    {voucher.leaderboardRank && (
                      <div className="flex items-center gap-1 text-amber-400/70">
                        <Ticket className="w-3 h-3" />
                        <span>Rank #{voucher.leaderboardRank} Prize</span>
                      </div>
                    )}
                  </>
                )}
                {status === "used" && voucher.usageDate && (
                  <div className="flex items-center gap-1 text-stone-500">
                    <Calendar className="w-3 h-3" />
                    <span>Used on {formatDate(voucher.usageDate)}</span>
                  </div>
                )}
                {status === "expired" && (
                  <div className="flex items-center gap-1 text-red-400/70">
                    <XCircle className="w-3 h-3" />
                    <span>Expired on {formatDate(voucher.expiryDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Expiring Soon Badge */}
        {status === "unused" && isExpiringSoon && (
          <div className="absolute top-0 right-0">
            <div className="bg-orange-500 text-stone-900 text-xs font-bold px-3 py-1 rounded-bl-xl">
              Expiring Soon!
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20" style={{
      background: `
        radial-gradient(ellipse at 50% 0%, rgba(217, 119, 6, 0.06) 0%, transparent 50%),
        linear-gradient(180deg, #0c0a09 0%, #1c1917 100%)
      `,
    }}>
      {/* Header with Total Value */}
      <div className="bg-gradient-to-b from-amber-500/10 to-transparent border-b border-stone-800/50">
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 flex items-center justify-center mb-4">
            <Ticket className="w-8 h-8 text-amber-400" />
          </div>
          <p className="text-xs text-stone-500 font-medium tracking-[0.2em] uppercase mb-2">
            Total Voucher Value
          </p>
          <p className="text-4xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Rs. {totalUnusedValue.toLocaleString()}
          </p>
          <p className="text-sm text-stone-500 mt-2">
            {grouped.unused.length} voucher{grouped.unused.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-stone-800/30 rounded-xl">
          {[
            { key: "unused", label: "Active", count: grouped.unused.length },
            { key: "used", label: "Used", count: grouped.used.length },
            { key: "expired", label: "Expired", count: grouped.expired.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-amber-500/20 text-amber-300"
                  : "text-stone-500 hover:text-stone-300"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                  activeTab === tab.key ? "bg-amber-500/30" : "bg-stone-700/50"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Vouchers List */}
        <div className="space-y-4">
          {grouped[activeTab].length > 0 ? (
            grouped[activeTab].map((voucher) => (
              <VoucherCard
                key={voucher._id || voucher.voucherCode}
                voucher={voucher}
                status={activeTab}
              />
            ))
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-800/50 flex items-center justify-center mb-4">
                <Ticket className="w-8 h-8 text-stone-600" />
              </div>
              <p className="text-white font-semibold mb-1">
                {activeTab === "unused"
                  ? "No Active Vouchers"
                  : activeTab === "used"
                  ? "No Used Vouchers"
                  : "No Expired Vouchers"}
              </p>
              <p className="text-sm text-stone-500">
                {activeTab === "unused"
                  ? "Win the monthly leaderboard to earn vouchers!"
                  : "Your voucher history will appear here"}
              </p>
            </div>
          )}
        </div>

        {/* How to Use */}
        {grouped.unused.length > 0 && (
          <div className="mt-8 p-4 bg-stone-800/30 rounded-2xl border border-stone-700/30">
            <p className="text-xs text-stone-500 font-medium tracking-[0.15em] uppercase mb-4">
              How to Use Vouchers
            </p>
            <div className="space-y-3">
              {[
                { step: 1, text: "Show voucher code to staff at checkout" },
                { step: 2, text: "One voucher per visit only" },
                { step: 3, text: "Valid at any Himalayan Java outlet" },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-amber-400">{item.step}</span>
                  </div>
                  <p className="text-sm text-stone-400">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default L5Vouchers;
