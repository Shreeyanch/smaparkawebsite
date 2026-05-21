import React, { useState, useCallback, useEffect, useRef } from "react";
import { Info, Printer, QrCode, ScanQrCode, X, BarChart2, Search, Receipt } from "lucide-react";
import QRCode from "react-qr-code";
import { useQueryClient } from "@tanstack/react-query";
import api from "../../api/config.js";
import ScanQr from "../../pages/subdomainPages/storeSide/ScanQr.jsx";
import { useTheme } from "../../context/ThemeContext";
import GuideModal from "../GuideModel.jsx";
import StaffScanReceiptTab from "./StaffScanReceiptTab.jsx";

const BASE_MILESTONES = [
  {
    label: "10 customers",
    sub: "joined",
    check: (d) => (d.totalCustomers || 0) >= 10,
  },
  {
    label: "50 visits",
    sub: "recorded",
    check: (d) => (d.totalVisits || 0) >= 50,
  },
  {
    label: "First reward",
    sub: "redeemed",
    check: (d) => (d.totalRedemptions || 0) >= 1,
  },
  {
    label: "30% repeat",
    sub: "rate achieved",
    check: (d) => (d.repeatRate || 0) >= 30,
  },
  {
    label: "100 customers",
    sub: "joined",
    check: (d) => (d.totalCustomers || 0) >= 100,
  },
];

const MILESTONES_BY_FORMAT = {
  L1: BASE_MILESTONES,
  L2: BASE_MILESTONES,
  L3: BASE_MILESTONES,
  L4: BASE_MILESTONES,
  L5: BASE_MILESTONES,
};

function MilestoneTrack({ milestones, isDarkMode }) {
  return (
    <div
      className="overflow-x-auto py-6 px-6"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <div className="flex items-start min-w-max">
        {milestones.map((m, i) => (
          <div key={i} className="flex items-start">
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
                className={`text-[11px] font-semibold text-center mt-2.5 leading-tight ${
                  m.done
                    ? isDarkMode
                      ? "text-white/80"
                      : "text-black/80"
                    : isDarkMode
                    ? "text-white/25"
                    : "text-black/25"
                }`}
              >
                {m.label}
              </p>
              <p
                className={`text-[10px] text-center mt-0.5 ${
                  m.done
                    ? isDarkMode
                      ? "text-white/40"
                      : "text-black/40"
                    : isDarkMode
                    ? "text-white/15"
                    : "text-black/15"
                }`}
              >
                {m.sub}
              </p>
            </div>

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

const SetPoints = ({
  token,
  qrCodeUrl,
  setPoints,
  points,
  handlePointsChange,
  handleCreatePoints,
  setBillAmount,
  setBillID,
  billID,
  billAmount,
  outlet,
  isSubmitting = false,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [print, setPrint] = useState(false);
  const [scanQr, setScanQr] = useState(false);
  const [scanReceipt, setScanReceipt] = useState(false);
  const [note, setNote] = useState("");
  const { isDarkMode } = useTheme();

  const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  const [formData, setFormData] = useState({
    billID: "",
    points: "",
    amount: "",
  });
  const queryClient = useQueryClient();
  const { storeData } = queryClient.getQueryData(["store"]);
  const conversionRate = Number(storeData?.conversionRate);
  const isAmountMode = conversionRate > 0 && !isNaN(conversionRate);
  const isL4OrL5 = ["L4", "L5"].includes(storeData?.loyaltyCard?.format);

  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current || !storeData) return;
    initialized.current = true;
    if (storeData?.receiptScan?.enabled && !isL4OrL5) {
      setScanReceipt(true);
    }
  }, [storeData, isL4OrL5]);

  const [milestoneStats, setMilestoneStats] = useState({
    totalCustomers: 0,
    totalVisits: 0,
    repeatRate: 0,
    totalRedemptions: 0,
  });

  // Fetch milestone stats (summary + redemptions)
  useEffect(() => {
    if (!storeData?._id) return;
    const storeToken = localStorage.getItem("storeToken");
    let cancelled = false;

    const fetchStats = async () => {
      try {
        const [summaryRes, redeemedRes] = await Promise.all([
          api.get(`/api/visitAnalytics/summary/${storeData._id}`, {
            headers: { token: storeToken },
          }),
          api.get(`/store/getRedeemedRewards/${storeData.url}`),
        ]);
        if (cancelled) return;
        const summary = summaryRes.data || {};
        const redeemedCount = Array.isArray(redeemedRes.data?.redeemedRewards)
          ? redeemedRes.data.redeemedRewards.length
          : 0;
        setMilestoneStats({
          totalCustomers: summary.totalCustomers || 0,
          totalVisits: summary.totalVisits || 0,
          repeatRate: summary.repeatRate || 0,
          totalRedemptions: redeemedCount,
        });
      } catch {
        // Silently ignore — milestones just stay at zero state
      }
    };

    fetchStats();
    return () => { cancelled = true; };
  }, [storeData?._id, storeData?.url]);

  // Customer points modal state
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsResult, setPointsResult] = useState(null);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);
  const [pointsPhone, setPointsPhone] = useState("");
  const [pointsError, setPointsError] = useState("");

  const fetchCustomerPoints = useCallback(async (phone) => {
    if (!phone.trim()) return;
    setIsLoadingPoints(true);
    setPointsError("");
    setPointsResult(null);
    try {
      const response = await api.get(
        `/api/l5/customer-points/${storeData._id}`,
        { headers: { token }, params: { phone: phone.trim() } }
      );
      if (response.data.success) {
        setPointsResult(response.data.data);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setPointsError("No customer found with this phone number.");
      } else {
        setPointsError("Failed to fetch customer points. Please try again.");
      }
    } finally {
      setIsLoadingPoints(false);
    }
  }, [storeData, token]);

  const handleOpenPointsModal = () => {
    setShowPointsModal(true);
    setPointsPhone("");
    setPointsResult(null);
    setPointsError("");
  };

  const handlePointsPhoneKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchCustomerPoints(pointsPhone);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let points;
    if (isAmountMode) {
      if (storeData.isRounded) {
        points = Math.round(Number(formData.amount) / conversionRate);
      } else {
        points = Math.round((Number(formData.amount) / conversionRate) * 10) / 10;
      }
      if (!points || points <= 0) {
        alert("Calculated points is 0. Check the bill amount or conversion rate.");
        return;
      }
    } else {
      points = formData.points;
    }
    try {
      const body = { ...formData, points };
      if (storeData.services.multipleOutlets === true) {
        body.outlet = localStorage.getItem("outletId");
      }

      const response = await api.post(
        `/store/createPrintPoints/${storeData._id}`,
        body,
        { headers: { token } }
      );

      if (response.data.success) {
        const qrUrl = `https://${storeData.url}.samparka.co/loyality/scan/${response.data.points._id}`;
        const createdAt = new Date(response.data.points.createdAt);
        const expiresAt = new Date(createdAt.getTime() + 60 * 60 * 1000);
        const formattedTime = expiresAt.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
          <html>
            <head>
              <title>Print QR</title>
              <style>
          body {
            font-family: 'Inter', Arial, sans-serif;
            background: #f8fafc;
            margin: 0;
            padding: 0;
          }
          .print-wrapper {
            width: 240px;
            margin: 24px auto;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            padding: 20px 16px 16px 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            border: 1px solid #e5e7eb;
          }
          .logo {
            height: 28px;
            margin-bottom: 8px;
            border-radius: 6px;
            background: #f3f4f6;
            padding: 2px 8px;
            object-fit: contain;
          }
          .qr-img {
            margin-bottom: 12px;
            border-radius: 8px;
            background: #fff;
            border: 1px solid #e5e7eb;
            padding: 8px;
            width: 110px;
            height: 110px;
          }
          .info {
            font-size: 13px;
            color: #222;
            margin-bottom: 10px;
          }
          .info strong {
            font-size: 15px;
            color: #059669;
            font-weight: 600;
            letter-spacing: 0.01em;
          }
          .bill, .points, .expires {
            margin-top: 2px;
            font-size: 12px;
            color: #444;
          }
          .note {
            font-size: 11px;
            margin-top: 10px;
            color: #64748b;
            font-style: italic;
          }
          .powered {
            font-size: 10px;
            margin-top: 12px;
            color: #94a3b8;
            letter-spacing: 0.04em;
          }
              </style>
            </head>
            <body>
              <div class="print-wrapper">
          <img class="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
            qrUrl
          )}" alt="QR Code" />
          <img src="${storeData.logo}" class="logo" alt="logo" />
          <div class="info">
            <strong>${storeData.name} Loyalty</strong>
            ${
              storeData.needBillID
                ? `<div class="bill">Bill: ${response.data.points.billID}</div>`
                : ""
            }
            <div class="points">Points: ${response.data.points.points}</div>
            <div class="expires">Scan before ${formattedTime}</div>
          </div>
          <div class="note">
            If login fails or points not received, scan again.
          </div>
          <div class="powered">Powered by SAMPARKA</div>
              </div>
              <script>
          window.onload = function () {
            setTimeout(() => {
              window.print();
              window.onafterprint = () => window.close();
            }, 300);
          };
              </script>
            </body>
          </html>
        `);

        printWindow.document.close();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className={`px-2 sm:px-0 md:px-4 lg:px-0 sm:ml-0 lg:ml-64 min-h-screen transition-colors ${
        isDarkMode ? "bg-gray-900" : "bg-[#f8fafb]"
      }`}
    >
      {showModal && (
        <GuideModal isIOS={isIOS} onClose={() => setShowModal(false)} />
      )}

      {/* Customer Points Modal */}
      {showPointsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowPointsModal(false)}
          />
          <div
            className={`relative w-full max-w-md rounded-xl shadow-2xl flex flex-col overflow-hidden ${
              isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
            }`}
          >
            {/* Modal Header */}
            <div
              className={`flex items-center justify-between px-5 py-4 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h2 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                Check Customer Points
              </h2>
              <button
                onClick={() => setShowPointsModal(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Phone Input */}
            <div className="px-5 py-4 space-y-3">
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Enter the customer's phone number and press Enter
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? "text-gray-400" : "text-gray-400"}`}
                  />
                  <input
                    type="text"
                    placeholder="Phone number..."
                    value={pointsPhone}
                    onChange={(e) => {
                      setPointsPhone(e.target.value);
                      setPointsResult(null);
                      setPointsError("");
                    }}
                    onKeyDown={handlePointsPhoneKeyDown}
                    autoFocus
                    className={`w-full pl-9 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-green-500 ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                    }`}
                  />
                </div>
                <button
                  onClick={() => fetchCustomerPoints(pointsPhone)}
                  disabled={!pointsPhone.trim() || isLoadingPoints}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {isLoadingPoints ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Search"
                  )}
                </button>
              </div>

              {/* Error */}
              {pointsError && (
                <p className="text-sm text-red-500">{pointsError}</p>
              )}

              {/* Result */}
              {pointsResult && (
                <div className={`mt-2 rounded-lg border overflow-hidden ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                  {/* Customer info */}
                  <div className={`px-4 py-3 ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                    <p className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {pointsResult.customer.name}
                    </p>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {pointsResult.customer.phone}
                      {pointsResult.customer.email && ` · ${pointsResult.customer.email}`}
                    </p>
                  </div>

                  {/* Outlet points */}
                  {pointsResult.outlets.length > 0 ? (
                    <div className={`divide-y ${isDarkMode ? "divide-gray-700" : "divide-gray-100"}`}>
                      {pointsResult.outlets.map((o) => (
                        <div key={o.outletId} className="flex items-center justify-between px-4 py-3">
                          <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                            {o.location}
                          </span>
                          <span className="text-sm font-semibold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
                            {o.currentPoints} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`px-4 py-3 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      No points collected at any outlet yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Header Section */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between w-full mb-4 sm:mb-8 p-4 sm:p-6 border-b transition-colors ${
          isDarkMode
            ? "bg-gray-900 border-gray-700"
            : "bg-gray-50 border-gray-200" 
        }`}
      >
        {/* Left: Title and Description */}
        <div className="flex flex-col gap-2 mb-4 sm:mb-0">
          <h1
            className={`text-xl sm:text-2xl font-semibold transition-colors ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Points Management
          </h1>
          <span
            className={`text-sm transition-colors ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Generate QR codes, print points, and scan customer QR codes
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Check Customer Points Button - L5 only */}
          {/* {storeData?.loyaltyCard?.format === "L5" && (
            <button
              onClick={handleOpenPointsModal}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                isDarkMode
                  ? "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <BarChart2 size={16} />
              Check Customer Points
            </button>
          )} */}

          {/* Outlet Name Display */}
          <div
            className={`px-4 py-2 rounded-lg border shadow-sm transition-colors ${
              isDarkMode
                ? "bg-gray-900 border-gray-600 text-white"
                : "bg-white border-gray-200 text-gray-900"
            }`}
          >
            <span
              className={`text-sm transition-colors ${
                isDarkMode ? "text-gray-300" : "text-gray-500"
              }`}
            >
              Outlet:{" "}
            </span>
            <span className="font-medium">
              {outlet || storeData?.name || "Default Outlet"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Unified Layout for All Modes */}
        <div className="space-y-6">
          {/* Form/Content Section */}
          <div className="flex justify-center">
            <div
              className={`rounded-xl shadow-sm border w-full max-w-md p-4 md:p-6 transition-colors ${
                print ? "mb-40" : "mb-0"
              } ${
                isDarkMode
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-100"
              }`}
            >
              {/* Desktop Toggle */}
              <div
                className={`hidden lg:grid mb-6 rounded-lg p-1.5 transition-colors ${
                  storeData?.loyaltyCard?.format === "L5"
                    ? "grid-cols-1"
                    : storeData?.receiptScan?.enabled
                    ? "grid-cols-4 gap-1"
                    : "grid-cols-3 gap-1"
                } ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}
              >
                {!isL4OrL5 && storeData?.receiptScan?.enabled && (
                  <button
                    className={`py-2 px-2 rounded-lg text-xs font-medium transition-all min-w-0 ${
                      scanReceipt
                        ? isDarkMode
                          ? "bg-gray-700 shadow text-white"
                          : "bg-white shadow text-gray-800"
                        : isDarkMode
                        ? "text-gray-300 hover:text-white hover:bg-gray-700/50"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setScanReceipt(true);
                      setScanQr(false);
                      setPrint(false);
                    }}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Receipt size={16} className="shrink-0" />
                      <span className="truncate">Receipt</span>
                    </div>
                  </button>
                )}
                <button
                  className={`py-2 px-2 rounded-lg text-xs font-medium transition-all min-w-0 ${
                    !print && !scanQr && !scanReceipt
                      ? isDarkMode
                        ? "bg-gray-700 shadow text-white"
                        : "bg-white shadow text-gray-800"
                      : isDarkMode
                      ? "text-gray-300 hover:text-white hover:bg-gray-700/50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setPrint(false);
                    setScanQr(false);
                    setScanReceipt(false);
                  }}
                >
                  <div className="flex items-center justify-center gap-1">
                    <QrCode size={16} className="shrink-0" />
                    <span className="truncate">QR/NFC</span>
                  </div>
                </button>
                {!isL4OrL5 && (
                  <>
                    <button
                      className={`py-2 px-2 rounded-lg text-xs font-medium transition-all min-w-0 ${
                        print
                          ? isDarkMode
                            ? "bg-gray-700 shadow text-white"
                            : "bg-white shadow text-gray-800"
                          : isDarkMode
                          ? "text-gray-300 hover:text-white hover:bg-gray-700/50"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setPrint(true);
                        setScanQr(false);
                        setScanReceipt(false);
                      }}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <Printer size={16} className="shrink-0" />
                        <span className="truncate">Print QR</span>
                      </div>
                    </button>
                    <button
                      className={`py-2 px-2 rounded-lg text-xs font-medium transition-all min-w-0 ${
                        scanQr
                          ? isDarkMode
                            ? "bg-gray-700 shadow text-white"
                            : "bg-white shadow text-gray-800"
                          : isDarkMode
                          ? "text-gray-300 hover:text-white hover:bg-gray-700/50"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setScanQr(true);
                        setPrint(false);
                        setScanReceipt(false);
                      }}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <ScanQrCode size={16} className="shrink-0" />
                        <span className="truncate">Scan QR</span>
                      </div>
                    </button>
                  </>
                )}
              </div>

              {/* Note Section - Only for L4/L5 Format */}
              {isL4OrL5 && (
                <div className="mt-6">
                  <label
                    className={`block text-sm font-medium mb-2 transition-colors ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                   <span className="font-bold text-xl">Note: </span> Only for first-time customer login & setup. <br />
<span className="font-bold">Existing customers:</span>  go to Customers section to add/increase points.
                  </label>
                
                </div>
              )}

              {print && !isL4OrL5 ? (
                /* Print QR Form */

                <form onSubmit={handleSubmit} className="space-y-4 ">
                  {storeData.needBillID && (
                    <div>
                      <label
                        className={`block text-sm mb-1 transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Bill ID
                      </label>
                      <input
                        type="text"
                        name="billID"
                        value={formData.billID}
                        onChange={handleChange}
                        className={`w-full rounded-lg border px-3 py-2 focus:ring-1 focus:ring-green-500 outline-none transition-colors ${
                          isDarkMode
                            ? "bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        }`}
                        required
                      />
                    </div>
                  )}
                  {isAmountMode ? (
                    <div>
                      <label
                        className={`block text-sm mb-1 transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Bill Amount
                      </label>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        min={0}
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e" || e.key === "E") {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || Number(value) >= 0) {
                            handleChange(e);
                          }
                        }}
                        className={`w-full rounded-lg border px-3 py-2 focus:ring-1 focus:ring-green-500 outline-none transition-colors ${
                          isDarkMode
                            ? "bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        }`}
                        required
                      />
                      {formData.amount && (
                        <p className={`mt-1.5 text-sm font-medium ${isDarkMode ? "text-green-400" : "text-green-600"}`}>
                          Points to award:{" "}
                          <span className="font-bold">
                            {storeData.isRounded
                              ? Math.round(Number(formData.amount) / conversionRate)
                              : Math.round((Number(formData.amount) / conversionRate) * 10) / 10}
                          </span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label
                        className={`block text-sm mb-1 transition-colors ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Points
                      </label>
                      <input
                        type="number"
                        name="points"
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e" || e.key === "E") {
                            e.preventDefault();
                          }
                        }}
                        value={formData.points}
                        onChange={handleChange}
                        className={`w-full rounded-lg border px-3 py-2 focus:ring-1 focus:ring-green-500 outline-none transition-colors ${
                          isDarkMode
                            ? "bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        }`}
                        required
                      />
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
                  >
                    <Printer size={18} /> Print
                  </button>
                </form>
              ) : scanQr && !isL4OrL5 ? (
                /* Scan QR Component */
                <div className="h-full">
                  <ScanQr store={storeData} />
                </div>
              ) : scanReceipt && storeData?.loyaltyCard?.format !== "L5" && storeData?.receiptScan?.enabled ? (
                /* Scan Receipt — 3-step staff flow */
                <StaffScanReceiptTab store={storeData} />
              ) : (
                /* QR Generation Form - Hidden for L4/L5 format */
                !isL4OrL5 && (
                  <form
                    className="space-y-4"
                    onSubmit={
                      isAmountMode ? handleCreatePoints : handlePointsChange
                    }
                  >
                    {storeData.needBillID && (
                    <input
                      type="text"
                      placeholder="Enter Bill ID"
                      onChange={(e) => setBillID(e.target.value)}
                      value={billID}
                      required
                      className={`w-full rounded-lg border px-3 py-2 focus:ring-1 focus:ring-green-500 outline-none transition-colors ${
                        isDarkMode
                          ? "bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  )}
                  {isAmountMode ? (
                    <div>
                      <input
                        type="number"
                        placeholder="Enter Bill Amount"
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "e" || e.key === "E") {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e) => setBillAmount(e.target.value)}
                        value={billAmount}
                        required
                        className={`w-full rounded-lg border px-3 py-2 focus:ring-1 focus:ring-green-500 outline-none transition-colors ${
                          isDarkMode
                            ? "bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        }`}
                      />
                      {billAmount && (
                        <p className={`mt-1.5 text-sm font-medium ${isDarkMode ? "text-green-400" : "text-green-600"}`}>
                          Points to award:{" "}
                          <span className="font-bold">
                            {storeData.isRounded
                              ? Math.round(Number(billAmount) / conversionRate)
                              : Math.round((Number(billAmount) / conversionRate) * 10) / 10}
                          </span>
                        </p>
                      )}
                    </div>
                  ) : storeData._id === "67b4382824b2833ce14c89ba" ? (
                    <input
                      type="number"
                      placeholder="Enter Points"
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e" || e.key === "E") {
                          e.preventDefault();
                        }
                      }}
                      value={points}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "0" || value === "1") setPoints(value);
                        else e.target.value = "";
                      }}
                      required
                      className={`w-full rounded-lg border px-3 py-2 focus:ring-1 focus:ring-green-500 outline-none transition-colors ${
                        isDarkMode
                          ? "bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  ) : (
                    <input
                      type="number"
                      placeholder="Enter Points"
                      value={points}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e" || e.key === "E") {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => setPoints(e.target.value)}
                      required
                      className={`w-full rounded-lg border px-3 py-2 focus:ring-1 focus:ring-green-500 outline-none transition-colors ${
                        isDarkMode
                          ? "bg-gray-900 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg shadow font-medium transition"
                  >
                    {isSubmitting ? "Processing..." : "Enter"}
                  </button>
                </form>
                )
              )}
            </div>
          </div>

          {/* QR Code Section - Only show in QR/NFC mode */}
          {!print && !scanQr && !scanReceipt && (
            <div className="flex justify-center">
              <div
                className={`rounded-xl shadow-sm border w-full max-w-md overflow-hidden transition-colors ${
                  isDarkMode
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-100"
                }`}
              >
                <div className="bg-green-600 p-4 md:p-6 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <QrCode className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    SCAN TO REDEEM
                  </h2>
                  <p className="text-sm text-white/90">
                    Earn points & rewards instantly
                  </p>
                </div>

                <div
                  className={`p-4 md:p-6 text-center transition-colors ${
                    isDarkMode ? "bg-gray-900" : "bg-gray-50"
                  }`}
                >
                  {/* <p
                    className={`mb-4 text-sm transition-colors ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Current Points:{" "}
                    <span className="font-medium">{points}</span>
                  </p> */}
                  <div className="flex justify-center mb-4">
                    <QRCode
                      className={`p-2 md:p-3 rounded-lg w-[180px] h-[180px] md:w-[200px] md:h-[200px] transition-colors ${
                        isDarkMode ? "bg-white" : "bg-white"
                      }`}
                      value={qrCodeUrl}
                      size={180}
                    />
                  </div>
                  <p
                    className={`text-xs transition-colors ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Scan this QR to redeem your reward points
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Milestone Journey */}
          {!scanReceipt && (() => {
            const format = storeData?.loyaltyCard?.format || "L2";
            const defs = MILESTONES_BY_FORMAT[format] || MILESTONES_BY_FORMAT["L2"];
            const milestones = defs.map((m) => ({ ...m, done: m.check(milestoneStats) }));
            const doneCount = milestones.filter((m) => m.done).length;
            return (
              <div className="flex justify-center">
                <div
                  className={`rounded-xl shadow-sm border w-full max-w-md overflow-hidden transition-colors ${
                    isDarkMode
                      ? "bg-gray-900 border-gray-700"
                      : "bg-white border-gray-100"
                  }`}
                >
                  {/* Card header */}
                  <div
                    className={`flex items-center justify-between px-5 py-3.5 border-b transition-colors ${
                      isDarkMode ? "border-gray-700" : "border-gray-100"
                    }`}
                  >
                    <div>
                      <p
                        className={`text-sm font-semibold transition-colors ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Milestone Journey
                      </p>
                      <p
                        className={`text-xs mt-0.5 transition-colors ${
                          isDarkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        {doneCount} of {milestones.length} reached
                      </p>
                    </div>
                    <span
                      className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${
                        doneCount === milestones.length
                          ? "bg-emerald-100 text-emerald-700"
                          : isDarkMode
                          ? "bg-gray-800 text-gray-400"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {doneCount}/{milestones.length}
                    </span>
                  </div>

                  {/* Track */}
                  <div className={isDarkMode ? "bg-gray-900" : "bg-[#f4f4f0]"}>
                    <MilestoneTrack milestones={milestones} isDarkMode={isDarkMode} />
                  </div>
                </div>
              </div>
            );
          })()}
        
          
          
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
          <div className="flex justify-center">
            <div
              className={`rounded-full p-2 flex items-center justify-evenly gap-1 shadow-lg border min-w-[180px] transition-colors ${
                isDarkMode
                  ? "bg-gray-900 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              {/* Scan Receipt Button */}
              {!isL4OrL5 && storeData?.receiptScan?.enabled && (
                <button
                  className={`w-12 h-12 flex items-center justify-center transition-all duration-200 ${
                    scanReceipt
                      ? isDarkMode
                        ? "bg-white text-black rounded-full"
                        : "bg-black text-white rounded-full"
                      : isDarkMode
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-700 hover:text-gray-900"
                  }`}
                  onClick={() => {
                    setScanReceipt(true);
                    setScanQr(false);
                    setPrint(false);
                  }}
                >
                  <Receipt size={20} />
                </button>
              )}

              {/* QR/NFC Button */}
              <button
                className={`w-12 h-12 flex items-center justify-center transition-all duration-200 ${
                  !print && !scanQr && !scanReceipt
                    ? isDarkMode
                      ? "bg-white text-black rounded-full"
                      : "bg-black text-white rounded-full"
                    : isDarkMode
                    ? "text-gray-300 hover:text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
                onClick={() => {
                  setPrint(false);
                  setScanQr(false);
                  setScanReceipt(false);
                }}
              >
                <QrCode size={20} />
              </button>

              {/* Print Button */}
              {!isL4OrL5 && (
                <>
                  <button
                    className={`w-12 h-12 flex items-center justify-center transition-all duration-200 ${
                      print
                        ? isDarkMode
                          ? "bg-white text-black rounded-full"
                          : "bg-black text-white rounded-full"
                        : isDarkMode
                        ? "text-gray-300 hover:text-white"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                    onClick={() => {
                      setPrint(true);
                      setScanQr(false);
                      setScanReceipt(false);
                    }}
                  >
                    <Printer size={20} />
                  </button>

                  {/* Scan QR Button */}
                  <button
                    className={`w-12 h-12 flex items-center justify-center transition-all duration-200 ${
                      scanQr
                        ? isDarkMode
                          ? "bg-white text-black rounded-full"
                          : "bg-black text-white rounded-full"
                        : isDarkMode
                        ? "text-gray-300 hover:text-white"
                        : "text-gray-700 hover:text-gray-900"
                    }`}
                    onClick={() => {
                      setScanQr(true);
                      setPrint(false);
                      setScanReceipt(false);
                    }}
                  >
                    <ScanQrCode size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetPoints;
