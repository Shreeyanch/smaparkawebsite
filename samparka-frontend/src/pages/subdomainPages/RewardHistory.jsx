import { useState, useCallback, useEffect } from "react";
import api from "../../api/config";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useStoreAuth } from "../../context/StoreAuthContext";
import PoweredBySamparkaFooter from "../../components/PoweredBySamparkaFooter";

const Rewards = ({ showPoweredBy = false }) => {
  const [isQrTogglePopupOpen, setQrTogglePopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const { authState, updateAuth, logout } = useStoreAuth();
  const { userInfo: user, token } = authState;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) {
      navigate("/register");
    }
  }, [user, token, navigate]);

  const getMyRewards = async () => {
    setLoading(true);
    try {
      const response = await api.get("/customer/myRewards", {
        headers: { token },
      });
      if (response.data.success) {
        setRewards(response.data.myRewards);

        // Store statuses in an array
        const statuses = response.data.myRewards.map((redemption) => {
          switch (redemption.status) {
            case "pending":
              return "Pending Approval";
            case "claimed":
              return "Reward Claimed";
            case "expired":
              return "Reward Expired";
            default:
              return "Unknown Status";
          }
        });

        setStatuses(statuses);
      }
    } catch (error) {
      toast.error(error.message, {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMyRewards();
    const scrollAnimElements = document.querySelectorAll(
      "[data-animate-on-scroll]"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            const targetElement = entry.target;
            targetElement.classList.add("animate");
            observer.unobserve(targetElement);
          }
        }
      },
      {
        threshold: 0.15,
      }
    );
    for (let i = 0; i < scrollAnimElements.length; i++) {
      observer.observe(scrollAnimElements[i]);
    }

    return () => {
      for (let i = 0; i < scrollAnimElements.length; i++) {
        observer.unobserve(scrollAnimElements[i]);
      }
    };
  }, []);

  const openQrTogglePopup = useCallback(() => {
    setQrTogglePopupOpen(true);
  }, []);

  const closeQrTogglePopup = useCallback(() => {
    setQrTogglePopupOpen(false);
  }, []);

  const onBackClick = useCallback(() => {
    navigate("/profile");
  }, []);

  const onIconSetClick = useCallback(() => {
    // navigate("/business-icons");
    window.location.href = "/business-icons";
  }, []);

  const onIconSetClick1 = useCallback(() => {
    // navigate("/rewards");
    window.location.href = "/rewards";
  }, []);

  const onIconSetClick2 = useCallback(() => {
    // navigate("/profile");
    window.location.href = "/profile";
  }, []);

  const filteredRewards = rewards.filter((reward) =>
    reward.reward.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-full max-w-[480px] bg-white min-h-screen flex flex-col relative">
          {/* Header Section */}
          <div className="flex-none px-5 pt-8 pb-4">
            <div className="flex items-center justify-between">
              {/* Back Button */}
              <button
                onClick={onBackClick}
                className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg
                  className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Page Title */}
              <h1 className="text-base sm:text-sm font-bold text-gray-900">
                My Rewards
              </h1>

              {/* Empty space for symmetry */}
              <div className="w-8 h-8 sm:w-7 sm:h-7"></div>
            </div>
          </div>

          {/* Main Content - Scrollable */}
          <div className="flex-1 flex flex-col px-5 pb-32 overflow-auto">
            {/* Search Bar */}
            <div className="mb-6 pt-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rewards..."
                  className="w-full px-4 py-3 pl-10 bg-gray-100 rounded-lg border-0 text-sm font-medium text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                />
                <svg
                  className="absolute left-3 top-3.5 w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Rewards List */}
            <div className="flex-1 space-y-4">
              {filteredRewards
                .sort((a, b) => new Date(b.redeemDate) - new Date(a.redeemDate))
                .map((reward) => (
                  <div
                    key={reward.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200"
                  >
                    {/* Header with title and status */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-sm text-gray-900 flex-1">
                        {reward.reward.name}
                      </h3>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs text-gray-600">
                          {reward.status.charAt(0).toUpperCase() +
                            reward.status.slice(1)}
                        </span>
                        <div
                          className={`w-3 h-3 rounded-full ${reward.status === "expired"
                              ? "bg-gray-500"
                              : reward.status === "claimed"
                                ? "bg-red-500"
                                : "bg-green-500"
                            }`}
                        ></div>
                      </div>
                    </div>

                    {/* Business and dates info */}
                    <div className="space-y-1">
                      {/* <p className="text-xs font-medium text-gray-700">
                      {reward.business}
                    </p> */}
                      <p className="text-xs text-gray-500">
                        Redeemed: {reward.redeemDate.slice(0, 10)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Expires:{" "}
                        {reward.expiryDate
                          ? reward.expiryDate.slice(0, 10)
                          : "--"}
                      </p>
                    </div>
                  </div>
                ))}

              {/* No Results */}
              {filteredRewards.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    No rewards found
                  </h3>
                  <p className="text-xs text-gray-500 text-center">
                    Try searching with different keywords or check back later
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* footer */}
          {showPoweredBy && <PoweredBySamparkaFooter />}

        </div>
      </div>

      {/* QR Toggle Popup */}
      {isQrTogglePopupOpen && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={closeQrTogglePopup}
        >
          <div
            className="bg-white rounded-2xl p-6 m-4 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">QR Scanner</h2>
              <p className="text-gray-600 mb-6">
                Scan QR code to earn points or redeem rewards
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeQrTogglePopup}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={closeQrTogglePopup}
                  className="flex-1 px-4 py-2 bg-[#275b46] text-white rounded-lg font-medium"
                >
                  Open Scanner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Rewards;
