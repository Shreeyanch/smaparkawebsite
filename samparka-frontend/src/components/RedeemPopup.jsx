import { useState, useRef, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";
import api from "../api/config";
import { useStoreAuth } from "../context/StoreAuthContext";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RedeemPopup = ({
  className = "",
  onClose,
  onSuccess,
  store,
  userPoints = 0,
  cardColor = "black",
  customerTier = "",
}) => {
  const [currentRewardIndex, setCurrentRewardIndex] = useState(0);
  const [isRedeemed, setIsRedeemed] = useState(false);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const scrollContainerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [rewards, setRewards] = useState([]);
  const navigate = useNavigate();
  const { authState, updateAuth } = useStoreAuth();
  const { userInfo: user, token } = authState;

  const getRewards = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reward/getRewards/${store._id}`, {
        headers: { token },
      });
      if (response.data.success) {
        // Determine which reward type to show based on store format
        const isL4Format = store?.loyaltyCard?.format === "L4";
        const expectedRewardType = isL4Format ? "l4" : "standard";
        
        // Filter rewards:
        // 1. Show correct type based on store format (l4 for L4 stores, standard for others)
        // 2. Filter by tier - show rewards with matching tier OR no tier (available to all)
        setRewards(
          response.data.rewards
            .filter((reward) => {
              // Check reward type matches expected type
              if (reward.type !== expectedRewardType) return false;
              
              // Tier filtering: show if no tier specified OR matches customer tier
              if (!reward.tier || reward.tier === customerTier) return true;
              
              return false;
            })
            .sort((a, b) => {
              // For L4, sort by pointCost; for standard, sort by points
              const aValue = isL4Format ? (a.pointCost || 0) : (parseInt(a.points) || 0);
              const bValue = isL4Format ? (b.pointCost || 0) : (parseInt(b.points) || 0);
              return aValue - bValue;
            })
        );
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
    if (store?._id) {
      getRewards();
    }
  }, [store?._id, customerTier]);

  const currentReward = rewards[currentRewardIndex];
  const isL4Format = store?.loyaltyCard?.format === "L4";
  
  // Helper function to get the cost/points for a reward
  const getRewardCost = (reward) => {
    if (!reward) return 0;
    return isL4Format ? (reward.pointCost || 0) : (parseInt(reward.points) || 0);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, clientHeight } = scrollContainerRef.current;
      const newIndex = Math.round(scrollTop / clientHeight);
      if (
        newIndex !== currentRewardIndex &&
        newIndex >= 0 &&
        newIndex < rewards.length
      ) {
        setCurrentRewardIndex(newIndex);
        setExpandedDescription(false); // Reset description when changing rewards
      }
    }
  };

  const scrollToReward = (index) => {
    if (scrollContainerRef.current) {
      const { clientHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        top: index * clientHeight,
        behavior: "smooth",
      });
    }
  };

  const handleRedeemClick = () => {
    const cost = getRewardCost(currentReward);
    if (cost <= userPoints) {
      setIsRedeemed(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const redeemReward = async (rewardId) => {
    setLoading(true);
    try {
      const endpoint = isL4Format 
        ? `/customer/redeemL4Reward/${rewardId}?storeID=${store._id}`
        : `/customer/redeemReward/${rewardId}?storeID=${store._id}`;
      
      const response = await api.put(
        endpoint,
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        onSuccess?.();
        toast.success(response.data.message, {
          duration: 1000,
          onAutoClose: () => {
            onClose();
          },
        });
      } else {
        toast.error(response.data.message, {
          duration: 2000,
        });
      }
    } catch (error) {
      toast.error(error.message, {
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const canRedeem = getRewardCost(currentReward) <= userPoints;

  return (
    <>
      {loading && <LoadingSpinner />}
      <div
        className={`w-full max-w-sm mx-auto bg-white rounded-3xl shadow-xl overflow-hidden relative ${className}`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-gray-100/80 backdrop-blur-sm flex items-center justify-center hover:bg-gray-200/80 transition-colors"
        >
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center pt-6 pb-4 px-6">
          <div className="text-lg font-bold text-red-900 mb-1">Rewards</div>
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="font-semibold text-gray-800">{userPoints}</span>
            <span className="text-gray-500">points available</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-6">          {rewards.length === 0 ? (
            <div className="h-72 flex flex-col items-center justify-center text-center">
              <svg
                className="w-16 h-16 text-gray-300 mb-4"
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
              <p className="text-gray-500 text-sm">No rewards available yet</p>
              <p className="text-gray-400 text-xs mt-2">Keep earning points to unlock rewards!</p>
            </div>
          ) : (
            <>          {/* Rewards Display */}
          <div className="mb-6 flex gap-4 h-72">
            {/* Progress Bar */}
            <div className="flex flex-col items-center justify-start w-6">
              <div className="relative h-full">
                {/* Background line */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-4 bottom-4 w-0.5 bg-gray-200 rounded-full"></div>

                {/* Progress indicators */}
                <div className="flex flex-col justify-between h-full py-4 relative z-10">
                  {rewards.map((reward, index) => {
                    const rewardCost = getRewardCost(reward);
                    const isAffordable = rewardCost <= userPoints;
                    
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <button
                          onClick={() => scrollToReward(index)}
                          className={`w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center text-xs font-bold hover:scale-105 ${
                            index === currentRewardIndex
                              ? "bg-gray-400 text-white scale-110 shadow-md ring-2 ring-gray-200"
                              : isAffordable
                              ? "bg-gray-300 text-gray-700 hover:bg-gray-400 hover:text-white"
                              : "bg-gray-50 text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={!isAffordable}
                        >
                          {isAffordable ? (
                            index === currentRewardIndex ? (
                              <svg
                                className="w-2.5 h-2.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              rewardCost
                            )
                          ) : (
                            rewardCost
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-hide h-72 relative"
              onScroll={handleScroll}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {rewards.map((reward, index) => (
                <div
                  key={reward.id}
                  className="snap-center h-72 flex-shrink-0 relative"
                >
                  <div
                    className={`h-full flex flex-col justify-center transition-all duration-300 transform ${
                      index === currentRewardIndex
                        ? "scale-100 opacity-100 blur-none"
                        : "scale-95 opacity-60 blur-sm"
                    }`}
                  >
                    {/* Image */}
                    <div className="relative mb-4">
                      <img
                        src={reward?.image || reward?.template?.image}
                        alt={reward.title}
                        className="w-full h-40 object-cover rounded-xl"
                      />

                      {/* Points Badge */}
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                        {getRewardCost(reward)}pt
                      </div>

                      {/* Lock Overlay */}
                      {getRewardCost(reward) > userPoints && (
                        <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                          <div className="bg-white/90 rounded-full p-1.5">
                            <svg
                              className="w-4 h-4 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {reward.name}
                        </h3>

                        {/* Status Badge */}
                        {getRewardCost(reward) <= userPoints ? (
                          <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-full font-medium">
                            Available
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full font-medium">
                            Locked
                          </span>
                        )}
                      </div>

                      {/* Expandable Description */}
                      <div className="relative">
                        <p
                          className={`text-xs text-gray-600 leading-relaxed transition-all duration-200 ${
                            !expandedDescription && index === currentRewardIndex
                              ? "line-clamp-2"
                              : ""
                          }`}
                        >
                          {reward.description}
                        </p>

                        {/* Show expand button only for current reward if description is long */}
                        {index === currentRewardIndex &&
                          reward.description.length > 80 && (
                            <button
                              onClick={() =>
                                setExpandedDescription(!expandedDescription)
                              }
                              className="mt-1 flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              <span className="mr-1">
                                {expandedDescription ? "Less" : "More"}
                              </span>
                              <svg
                                className={`w-3 h-3 transition-transform ${
                                  expandedDescription ? "rotate-180" : ""
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {currentReward && (
            <div className="space-y-3">
              <button
                onClick={() => redeemReward(currentReward._id)}
                disabled={!canRedeem || isRedeemed}
                style={{ backgroundColor: canRedeem && cardColor }}
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  isRedeemed
                    ? "bg-gray-500 text-white"
                    : canRedeem
                    ? `bg-[${cardColor}] text-white hover:bg-gray-800 active:scale-[0.98]`
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
              {isRedeemed
                ? "✓ Redeemed!"
                : canRedeem
                ? `Redeem for ${getRewardCost(currentReward)} points`
                : `Need ${getRewardCost(currentReward) - userPoints} more points`}
            </button>

            <button
              onClick={() => navigate("/myRewards")}
              className="w-full text-xs py-3 rounded-xl text-gray-700 hover:text-gray-900 transition-colors"
            >
              <u className="flex justify-center">
                My Rewards
                <ArrowUpRight width={20} className="pb-2 text-xs" />
              </u>
            </button>
          </div>
          )}
          </>
          )}
        </div>
      </div>

      {/* Success Overlay */}
      {isRedeemed && (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center rounded-3xl z-30">
          <div className="bg-white rounded-2xl w-16 h-16 flex items-center justify-center shadow-lg animate-bounce">
            <svg
              className="w-8 h-8 text-gray-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

// Demo wrapper to show the popup
// const App = () => {
//   const [showPopup, setShowPopup] = useState(true);

//   const handleClose = () => {
//     setShowPopup(false);
//   };

//   const handleBackdropClick = (e) => {
//     if (e.target === e.currentTarget) {
//       handleClose();
//     }
//   };

//   return (
//     <>
//       {showPopup && (
//         <div
//           className="min-h-screen flex items-center justify-center p-4"
//           onClick={handleBackdropClick}
//         >
//           <RedeemPopup onClose={handleClose} />
//         </div>
//       )}
//     </>
//   );
// };

export default RedeemPopup;
