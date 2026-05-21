import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../api/config";
import { toast } from "sonner";
import LoadingSpinner from "../components/LoadingSpinner";
import { useGeoPricing } from "../landingPage/src/pricing/useGeoPricing";
import {
  Check,
  Star,
  CreditCard,
  Calendar,
  AlertCircle,
  Loader2,
  Receipt,
  Gift,
  Building2,
  X,
} from "lucide-react";

const PLANS = {
  starter: {
    name: "Starter Plan",
    description: "7-day free trial to explore all features.",
    isFree: true,
    duration: "7 days",
    features: [
      "Digital loyalty system (earn/redeem)",
      "QR code-based point earning",
      "Personal branding (logo/colors)",
      "Cloud admin & sub-admin access",
      "Secure customer database",
      "Basic customer dashboard",
      "Automated triggers (birthday, etc.)",
      "Basic notifications (Email/SMS)",
    ],
  },
  growth: {
    name: "Growth Plan",
    description: "For businesses focused on engagement and repeat visits.",
    isPopular: true,
    features: [
      "All Starter features",
      "Advanced tracking & segmentation",
      "Advanced analytics and reports",
      "WhatsApp / App notifications",
      "Reservation management",
      "Customer Leaderboard",
      "Product catalogue & ordering",
      "NFC-based loyalty (tap-to-earn)",
    ],
  },
  plus: {
    name: "Plus Plan",
    description: "For brands operating multiple outlets or locations.",
    isCustom: true,
    isMultiOutlet: true,
    features: [
      "All Growth features",
      "Multi-outlet management",
      "Outlet-wise data segregation",
      "Outlet performance tracking",
      "Centralized admin dashboard",
      "Comparative outlet reporting",
      "Role-based access control",
    ],
  },
};

const Billing = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { isDarkMode } = useTheme();
  const { userInfo: user, token } = authState;
  const { pricing, country } = useGeoPricing();
  const [selectedPlan, setSelectedPlan] = useState("growth");
  const [billingCycle, setBillingCycle] = useState("quarterly");
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [stores, setStores] = useState([]);
  const [selected, setSelected] = useState(
    localStorage.getItem("selectedValue") || ""
  );
  const [showStoreModal, setShowStoreModal] = useState(false);

  // Fetch stores
  useEffect(() => {
    const fetchStores = async () => {
      if (!token) {
        setIsInitialLoading(false);
        return;
      }
      try {
        const response =
          user?.role === "admin"
            ? await api.get("/store", { headers: { token } })
            : await api.get("/store/myStores", { headers: { token } });

        if (response.data.success) {
          setStores(response.data.stores);
          // If no store is selected, select the first one
          if (response.data.stores.length > 0 && !selected) {
            const firstStoreId = response.data.stores[0]._id;
            setSelected(firstStoreId);
            localStorage.setItem("selectedValue", firstStoreId);
          }
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchStores();
  }, [token]);

  // Reset to growth plan if starter is no longer available (when stores exist)
  useEffect(() => {
    if (stores.length > 0 && selectedPlan === "starter") {
      setSelectedPlan("growth");
    }
  }, [stores, selectedPlan]);

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!token || !selected) return;
      try {
        const response = await api.get("/api/payment/subscription-status", {
          headers: { token },
          params: { storeId: selected },
        });
        if (response.data.success) {
          setSubscriptionStatus(response.data.data);
          setPaymentHistory(response.data.data.payments || []);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };
    fetchSubscriptionStatus();
  }, [token, selected]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleActivateTrial = async () => {
    if (!selected || stores.length === 0) {
      setShowStoreModal(true);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/api/payment/activate-trial",
        { storeId: selected },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Free trial activated! Enjoy 7 days of full access.");
        // Refresh subscription status
        const statusResponse = await api.get(
          "/api/payment/subscription-status",
          {
            headers: { token },
            params: { storeId: selected },
          }
        );
        if (statusResponse.data.success) {
          setSubscriptionStatus(statusResponse.data.data);
          setPaymentHistory(statusResponse.data.data.payments || []);
        }
      } else {
        toast.error(response.data.message || "Failed to activate trial");
      }
    } catch (error) {
      console.error("Trial activation error:", error);
      toast.error(error.response?.data?.message || "Failed to activate trial");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selected) {
      toast.error("Please select a store first");
      return;
    }

    // If starter plan selected, activate free trial instead
    if (selectedPlan === "starter") {
      return handleActivateTrial();
    }

    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway");
        setLoading(false);
        return;
      }

      // Create order — send region so backend prices in the correct currency
      const orderResponse = await api.post(
        "/api/payment/create-order",
        {
          plan: selectedPlan,
          billingCycle: billingCycle,
          storeId: selected,
          region: country,
        },
        {
          headers: { token },
        }
      );

      if (!orderResponse.data.success) {
        toast.error(orderResponse.data.message || "Failed to create order");
        setLoading(false);
        return;
      }

      const { orderId, amount, keyId, currency } = orderResponse.data.data;

      // Open Razorpay checkout
      const options = {
        key: keyId,
        amount: amount,
        currency: currency || pricing.currency,
        name: "Samparka",
        description: `${PLANS[selectedPlan].name} - ${billingCycle}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await api.post(
              "/api/payment/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: { token },
              }
            );

            if (verifyResponse.data.success) {
              toast.success("Payment successful! Your subscription is now active.");
              // Refresh subscription status
              const statusResponse = await api.get(
                "/api/payment/subscription-status",
                {
                  headers: { token },
                  params: { storeId: selected },
                }
              );
              if (statusResponse.data.success) {
                setSubscriptionStatus(statusResponse.data.data);
                setPaymentHistory(statusResponse.data.data.payments || []);
              }
            } else {
              toast.error("Payment verification failed");
            }
          } catch (error) {
            console.error("Verification error:", error);
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#16a34a",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to initiate payment");
      setLoading(false);
    }
  };

  const getPrice = (plan) => {
    if (PLANS[plan].isFree) return 0;
    if (PLANS[plan].isCustom) return "Custom";
    // pricingConfig uses "yearly"; Billing uses "annual" — map them
    const cycleKey = billingCycle === "annual" ? "yearly" : billingCycle;
    return pricing.plans[cycleKey];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    
    <div className={`min-h-screen p-4 md:p-8 md:ml-64 transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}>
      {isInitialLoading ? (
        <div className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}>
          <LoadingSpinner />
        </div>
      ) : (
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1
            className={`text-xl sm:text-2xl font-semibold transition-colors ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Billing and Subscription
          </h1>
            <span
            className={`text-sm transition-colors ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
              Manage your subscription and view payment history
            </span>
          </div>

          {/* Store Selection */}
          <select
            onChange={(e) => {
              setSelected(e.target.value);
              localStorage.setItem("selectedValue", e.target.value);
            }}
            value={selected}
            className={`mt-4 sm:mt-0 px-4 py-2 pr-8 rounded-lg border appearance-none bg-no-repeat bg-[position:right_12px_center] focus:outline-none focus:ring-1 focus:ring-green-500 transition-colors duration-200 ${
              isDarkMode 
                ? "bg-gray-800 text-gray-200 border-gray-600" 
                : "bg-white text-gray-700 border-gray-200"
            }`}
            style={{
              backgroundImage:
                "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K')",
              backgroundSize: "12px",
            }}
          >
            <option value="" disabled>
              Select Store
            </option>
            {stores.map((store) => (
              <option value={store._id} key={store._id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        

        {/* Current Subscription Status */}
        {subscriptionStatus && (
          <div
            className={`mb-8 p-6 rounded-xl transition-colors duration-200 ${
              subscriptionStatus.isActive
                ? isDarkMode ? "bg-green-900/20 border border-green-700" : "bg-green-50 border border-green-200"
                : isDarkMode ? "bg-yellow-900/20 border border-yellow-700" : "bg-yellow-50 border border-yellow-200"
            }`}
          >
            <div className="flex items-start gap-4">
              {subscriptionStatus.isActive ? (
                <div className="p-2 bg-green-100 rounded-full">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              ) : (
                <div className="p-2 bg-yellow-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              )}
              <div>
                <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                  {subscriptionStatus.isActive
                    ? "Subscription Active"
                    : "Subscription Expired"}
                </h3>
                {subscriptionStatus.isActive ? (
                  <p className={`mt-1 transition-colors duration-200 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                    Your subscription is valid until{" "}
                    <span className="font-medium">
                      {formatDate(subscriptionStatus.subscriptionEndDate)}
                    </span>
                    <span className="text-green-600 font-medium ml-2">
                      ({subscriptionStatus.daysRemaining} days remaining)
                    </span>
                  </p>
                ) : (
                  <p className={`mt-1 transition-colors duration-200 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}>
                    Please renew your subscription to continue using all
                    features.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-8">
          <div className={`p-1 rounded-xl flex items-center gap-1 transition-colors duration-200 ${
              isDarkMode ? "bg-gray-800" : "bg-gray-200"
            }`}>
            {["monthly", "quarterly", "annual"].map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                  billingCycle === cycle
                    ? isDarkMode ? "bg-gray-700 text-white shadow-sm" : "bg-white text-gray-900 shadow-sm"
                    : isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {cycle}
                {cycle === "annual" && (
                  <span className="ml-1 text-green-600 text-xs">(Save 15%)</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className={`grid ${stores.length > 0 ? "md:grid-cols-2" : "md:grid-cols-3"} gap-6 mb-12`}>
          {Object.entries(PLANS)
            .filter(([key]) => stores.length === 0 || key !== "starter")
            .map(([key, plan]) => (
            <div
              key={key}
              onClick={() => !plan.isCustom && setSelectedPlan(key)}
              className={`relative p-6 rounded-2xl border-2 transition-all ${
                isDarkMode ? "bg-gray-900" : "bg-white"
              } ${
                plan.isCustom
                  ? isDarkMode ? "border-gray-600 cursor-default" : "border-gray-200 cursor-default"
                  : selectedPlan === key
                  ? isDarkMode ? "border-gray-300 shadow-lg cursor-pointer" : "border-gray-800 shadow-lg cursor-pointer"
                  : isDarkMode ? "border-gray-600 hover:border-gray-500 cursor-pointer" : "border-gray-200 hover:border-gray-300 cursor-pointer"
              }`}
            >
              {plan.isFree && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${isDarkMode ? "bg-gray-900 border-gray-500 border-2 text-white" : "bg-white border-gray-300 border-2"} px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                  <Gift className="w-3 h-3" /> 7-DAY FREE TRIAL
                </div>
              )}
              {plan.isPopular && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${isDarkMode ? "bg-gray-900 border-gray-500 border-2 text-white" : "bg-white border-gray-300 border-2"} px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                  <Star className="w-3 h-3 fill-current" /> <h1>MOST POPULAR</h1>
                </div>
              )}
              {plan.isMultiOutlet && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${isDarkMode ? "bg-gray-900 border-gray-500 border-2 text-white" : "bg-white border-gray-300 border-2"} px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                  <Building2 className="w-3 h-3" /> MULTI-OUTLET
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mt-1 transition-colors duration-200 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}>
                    {plan.description}
                  </p>
                </div>
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 ${
                    selectedPlan === key
                      ? isDarkMode ? "bg-gray-300 border-gray-300" : "bg-black border-black"
                      : "border-none"
                  }`}
                >
                  {selectedPlan === key && (
                    <Check className={`w-4 h-4 ${isDarkMode ? "text-black" : "text-white"}`} />
                  )}
                </div>
              </div>

              <div className="mb-6">
                {plan.isFree ? (
                  <>
                    <span className="text-4xl font-semibold text-green-600">FREE</span>
                    <span className="text-gray-500 ml-2">/ {plan.duration}</span>
                  </>
                ) : plan.isCustom ? (
                  <>
                    <span className="text-3xl font-semibold text-blue-600">Custom Quote</span>
                  </>
                ) : (
                  <>
                    <span className={`text-4xl font-semibold transition-colors duration-200 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}>
                      {pricing.symbol} {getPrice(key).toLocaleString()}
                    </span>
                    <span className={`ml-2 transition-colors duration-200 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}>/{billingCycle}</span>
                  </>
                )}
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className={`w-5 h-5 shrink-0 mt-0.5 ${isDarkMode ? "text-gray-300" : "text-gray-500"}`} />
                    <span className={`text-sm transition-colors duration-200 ${
                        isDarkMode ? "text-gray-300" : "text-gray-600"
                      }`}>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.isCustom && (
                <a
                  href="https://wa.me/9779843742684"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Contact Sales
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Payment Button - Hide for Plus plan */}
        {selectedPlan !== "plus" && (
          <div className={`p-6 rounded-xl shadow-sm mb-12 transition-colors duration-200 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className={`text-lg font-semibold transition-colors duration-200 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}>
                  {selectedPlan === "starter"
                    ? "Start Your Free Trial"
                    : subscriptionStatus?.isActive
                    ? "Extend Your Subscription"
                    : "Subscribe Now"}
                </h3>
                <p className={`transition-colors duration-200 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}>
                  {PLANS[selectedPlan].name}
                  {selectedPlan !== "starter" && ` - ${billingCycle} billing`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`text-sm transition-colors duration-200 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}>
                    {selectedPlan === "starter" ? "Trial Period" : "Total Amount"}
                  </p>
                  <p className={`text-2xl font-bold transition-colors duration-200 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}>
                    {selectedPlan === "starter"
                      ? "7 Days FREE"
                      : `${pricing.symbol} ${getPrice(selectedPlan).toLocaleString()}`}
                  </p>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={loading || (selectedPlan !== "starter" && !selected) || (selectedPlan === "starter" && subscriptionStatus?.hasUsedFreeTrial)}
                  className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : selectedPlan === "starter" ? (
                    <>
                      <Gift className="w-5 h-5" />
                      {subscriptionStatus?.hasUsedFreeTrial ? "Trial Used" : "Start Free Trial"}
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <div className={`rounded-xl shadow-sm overflow-hidden transition-colors duration-200 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}>
            <div className={`p-6 border-b transition-colors duration-200 ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}>
              <h3 className={`text-lg font-semibold flex items-center gap-2 transition-colors duration-200 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                <Receipt className="w-5 h-5" />
                Payment History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`transition-colors duration-200 ${
                    isDarkMode ? "bg-gray-800" : "bg-gray-50"
                  }`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase transition-colors duration-200 ${
                        isDarkMode ? "text-gray-300" : "text-gray-500"
                      }`}>
                      Date
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase transition-colors duration-200 ${
                        isDarkMode ? "text-gray-300" : "text-gray-500"
                      }`}>
                      Plan
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase transition-colors duration-200 ${
                        isDarkMode ? "text-gray-300" : "text-gray-500"
                      }`}>
                      Cycle
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase transition-colors duration-200 ${
                        isDarkMode ? "text-gray-300" : "text-gray-500"
                      }`}>
                      Amount
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase transition-colors duration-200 ${
                        isDarkMode ? "text-gray-300" : "text-gray-500"
                      }`}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors duration-200 ${
                    isDarkMode ? "divide-gray-700" : "divide-gray-200"
                  }`}>
                  {paymentHistory.map((payment) => (
                    <tr key={payment._id}>
                      <td className={`px-6 py-4 text-sm transition-colors duration-200 ${
                          isDarkMode ? "text-gray-200" : "text-gray-900"
                        }`}>
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className={`px-6 py-4 text-sm capitalize transition-colors duration-200 ${
                          isDarkMode ? "text-gray-200" : "text-gray-900"
                        }`}>
                        {payment.plan}
                      </td>
                      <td className={`px-6 py-4 text-sm capitalize transition-colors duration-200 ${
                          isDarkMode ? "text-gray-200" : "text-gray-900"
                        }`}>
                        {payment.billingCycle}
                      </td>
                      <td className={`px-6 py-4 text-sm transition-colors duration-200 ${
                          isDarkMode ? "text-gray-200" : "text-gray-900"
                        }`}>
                        {payment.currency || "NPR"} {payment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            payment.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : payment.status === "refunded"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Create Store Modal */}
      {showStoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200 transition-colors ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}>
            <button
              onClick={() => setShowStoreModal(false)}
              className={`absolute top-4 right-4 transition-colors ${
                isDarkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-200 ${
                  isDarkMode ? "bg-green-900/30" : "bg-green-100"
                }`}>
                <Building2 className="w-8 h-8 text-green-600" />
              </div>

              <h3 className={`text-2xl font-bold mb-2 transition-colors duration-200 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                Create Your Store First
              </h3>

              <p className={`mb-6 transition-colors duration-200 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}>
                To activate your <span className="font-semibold text-green-600">7-day free trial</span>, you need to create a store first. 
                Once your store is set up, your free trial will be automatically activated!
              </p>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={() => setShowStoreModal(false)}
                  className={`flex-1 px-6 py-3 border-2 font-semibold rounded-xl transition-colors ${
                    isDarkMode 
                      ? "border-gray-600 text-gray-300 hover:bg-gray-800" 
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowStoreModal(false);
                    navigate("/store");
                  }}
                  className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Building2 className="w-5 h-5" />
                  Create Store
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
