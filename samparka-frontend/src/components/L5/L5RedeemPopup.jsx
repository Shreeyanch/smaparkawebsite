import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import l5Api from "../../api/l5Api";
import { Gift, Percent, Award, Lock, Check, MapPin, X, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";

const L5RedeemPopup = ({
  className = "",
  onClose,
  onSuccess,
  storeId,
  token,
  l5Config,
  l5PointsData,
  l5Redemptions: initialRedemptions = [],
  cardColor = "#000",
  fallbackPoints = 0, // Regular points as fallback
}) => {
  const [currentRewardIndex, setCurrentRewardIndex] = useState(0);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [l5Redemptions, setL5Redemptions] = useState(initialRedemptions);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const [isRedeemed, setIsRedeemed] = useState(false);
  const [showOutletPicker, setShowOutletPicker] = useState(false);
  const [outletSearch, setOutletSearch] = useState("");
  const scrollContainerRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOutletPicker(false);
      }
    };
    if (showOutletPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOutletPicker]);

  // Log data on mount
  useEffect(() => {
    console.log('L5RedeemPopup - l5Config:', l5Config);
    console.log('L5RedeemPopup - rewards array:', l5Config?.rewards);
    if (l5Config?.rewards?.length > 0) {
      console.log('L5RedeemPopup - First reward:', l5Config.rewards[0]);
      console.log('L5RedeemPopup - First reward description:', l5Config.rewards[0].description);
    }
  }, [l5Config]);

  // Get rewards from l5Config - sort by threshold
  const rewards = (l5Config?.rewards || []).sort((a, b) => a.threshold - b.threshold);
  const outletBreakdown = l5PointsData?.outlets || [];
  const totalPoints = l5PointsData?.totalPoints || fallbackPoints || 0;

  // Filter outlets based on search
  const filteredOutlets = outletBreakdown.filter(outlet => 
    outlet.outletName.toLowerCase().includes(outletSearch.toLowerCase())
  );

  // Auto-select first outlet if only one
  useEffect(() => {
    if (outletBreakdown.length === 1 && !selectedOutlet) {
      setSelectedOutlet(outletBreakdown[0]);
    }
  }, [outletBreakdown, selectedOutlet]);

  const currentReward = rewards[currentRewardIndex];

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, clientHeight } = scrollContainerRef.current;
      const newIndex = Math.round(scrollTop / clientHeight);
      if (newIndex !== currentRewardIndex && newIndex >= 0 && newIndex < rewards.length) {
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

  // Check if a reward can be redeemed
  const canRedeem = (outlet, threshold) => {
    if (!outlet || !threshold) return false;
    const currentPoints = outlet.currentPoints || 0;
    const alreadyRedeemed = l5Redemptions.some(
      (r) => r.outlet?._id === outlet.outletId && r.pointsThreshold === threshold
    );
    return currentPoints >= threshold && !alreadyRedeemed;
  };

  // Check if already redeemed
  const isAlreadyRedeemed = (outlet, threshold) => {
    if (!outlet) return false;
    return l5Redemptions.some(
      (r) => r.outlet?._id === outlet.outletId && r.pointsThreshold === threshold
    );
  };

  // Handle redeem
  const handleRedeem = async (threshold) => {
    if (!selectedOutlet || isRedeeming) return;

    setIsRedeeming(true);
    try {
      const response = await l5Api.redeemDiscount(
        storeId,
        selectedOutlet.outletId,
        threshold,
        token
      );
      if (response?.success) {
        setIsRedeemed(true);
        // Refresh redemptions in popup UI
        const redemptionsResponse = await l5Api.getActiveRedemptions(storeId, token);
        if (redemptionsResponse?.success) {
          setL5Redemptions(redemptionsResponse.data?.activeRedemptions || []);
        }
        // Notify parent to refresh L5 data without a page reload
        onSuccess?.();
        toast.success(response.message || "Reward redeemed successfully!", {
          duration: 1000,
          onAutoClose: () => {
            onClose();
          },
        });
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        toast.error(response?.message || "Failed to redeem");
      }
    } catch (error) {
      console.error("Error redeeming:", error);
      toast.error(error.response?.data?.message || "Failed to redeem");
    } finally {
      setIsRedeeming(false);
    }
  };

  // Get reward icon
  const getRewardIcon = (rewardType, threshold) => {
    // Show checkmark if redeemed
    if (selectedOutlet && isAlreadyRedeemed(selectedOutlet, threshold)) {
      return <Check className="w-3 h-3" />;
    }
    // Show lock if not available
    if (!selectedOutlet || !canRedeem(selectedOutlet, threshold)) {
      return (
        <Lock className="w-2.5 h-2.5" />
      );
    }
    // Show checkmark for available
    return (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  // Check if current reward can be redeemed with selected outlet
  const currentCanRedeem = selectedOutlet && currentReward && canRedeem(selectedOutlet, currentReward.threshold);
  const currentIsRedeemed = selectedOutlet && currentReward && isAlreadyRedeemed(selectedOutlet, currentReward.threshold);

  return (
    <>
    {/* test */}
      {isRedeeming && <LoadingSpinner />}
      <div 
        className={`w-full max-w-sm mx-auto bg-white rounded-3xl shadow-xl relative ${className}`}
        style={{ overflow: 'hidden', minWidth: '320px' }}
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
          <div className="text-lg font-bold text-red-900 mb-1">Rewards Available</div>
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="font-semibold text-gray-800">{totalPoints}</span>
            <span className="text-gray-500">points available</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-6" style={{ overflow: 'hidden' }}>
          {/* Outlet Selector Dropdown */}
          {outletBreakdown.length >= 1 && (
            <div className="mb-4 relative" ref={dropdownRef} style={{ minHeight: selectedOutlet ? 'auto' : 'auto' }}>
              {/* Trigger Button - Only clickable if more than 1 outlet */}
              <button
                onClick={() => {
                  if (outletBreakdown.length > 1) {
                    setShowOutletPicker(!showOutletPicker);
                    setOutletSearch("");
                  }
                }}
                className={`w-full group relative overflow-hidden rounded-2xl p-3 transition-colors duration-300 ${outletBreakdown.length > 1 ? 'active:scale-[0.98] cursor-pointer' : 'cursor-default'}`}
                style={{
                  background: selectedOutlet 
                    ? `linear-gradient(135deg, ${cardColor}12 0%, ${cardColor}06 100%)`
                    : 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
                  border: showOutletPicker 
                    ? `2px solid ${cardColor}` 
                    : selectedOutlet 
                      ? `1.5px solid ${cardColor}40` 
                      : '1.5px solid #e0e0e0',
                  boxShadow: showOutletPicker ? `0 0 0 4px ${cardColor}15` : 'none'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
                      style={{
                        background: selectedOutlet 
                          ? `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}dd 100%)`
                          : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                        boxShadow: selectedOutlet ? `0 4px 12px ${cardColor}35` : '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                        {selectedOutlet ? 'Outlet' : 'Select Outlet'}
                      </p>
                      <p className="text-sm font-bold text-gray-800">
                        {selectedOutlet ? selectedOutlet.outletName : 'Choose location'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedOutlet && (
                      <div 
                        className="px-2.5 py-1 rounded-lg"
                        style={{ 
                          background: `linear-gradient(135deg, ${cardColor}18 0%, ${cardColor}10 100%)`,
                          border: `1px solid ${cardColor}25`
                        }}
                      >
                        <span 
                          className="text-xs font-bold"
                          style={{ color: cardColor }}
                        >
                          {selectedOutlet.currentPoints || 0} pts
                        </span>
                      </div>
                    )}
                    {/* Only show dropdown arrow if more than 1 outlet */}
                    {outletBreakdown.length > 1 && (
                      <div 
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${showOutletPicker ? 'rotate-180' : ''}`}
                        style={{ background: 'rgba(0,0,0,0.05)' }}
                      >
                        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </button>

              {/* Dropdown Panel - Only show if more than 1 outlet */}
              {showOutletPicker && outletBreakdown.length > 1 && (
                <div 
                  className="absolute top-full left-0 right-0 mt-2 z-50 outlet-dropdown-enter"
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Search Bar */}
                  <div className="p-3 border-b border-gray-100">
                    <div 
                      className="relative flex items-center rounded-xl overflow-hidden transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #f1f3f4 100%)',
                        border: '1.5px solid #e8e8e8'
                      }}
                    >
                      {/* Search Icon */}
                      <div className="pl-3 pr-2">
                        <svg 
                          className="w-4 h-4 text-gray-400" 
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
                      <input
                        type="text"
                        value={outletSearch}
                        onChange={(e) => setOutletSearch(e.target.value)}
                        placeholder="Search outlets..."
                        autoFocus
                        className="flex-1 py-2.5 pr-3 text-sm bg-transparent outline-none placeholder:text-gray-400 text-gray-700"
                        style={{ fontWeight: 500 }}
                      />
                      {outletSearch && (
                        <button
                          onClick={() => setOutletSearch("")}
                          className="pr-3 transition-all duration-200 hover:scale-110"
                        >
                          <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Outlets List */}
                  <div className="max-h-[220px] overflow-y-auto custom-scrollbar-dropdown">
                    {filteredOutlets.length > 0 ? (
                      <div className="p-2">
                        {filteredOutlets.map((outlet, index) => {
                          const isSelected = selectedOutlet?.outletId === outlet.outletId;
                          const hasReward = outlet.currentPoints >= (l5Config?.rewards?.[0]?.threshold || Infinity);
                          
                          return (
                            <button
                              key={outlet.outletId}
                              onClick={() => {
                                setSelectedOutlet(outlet);
                                setShowOutletPicker(false);
                                setOutletSearch("");
                              }}
                              className="w-full text-left rounded-xl p-3 mb-1 last:mb-0 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] group relative"
                              style={{
                                background: isSelected 
                                  ? `linear-gradient(135deg, ${cardColor}15 0%, ${cardColor}08 100%)`
                                  : 'transparent',
                                border: isSelected ? `1.5px solid ${cardColor}30` : '1.5px solid transparent'
                              }}
                            >
                              <div className="flex items-center gap-3">
                                {/* Outlet Mini Icon */}
                                <div 
                                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                                  style={{
                                    background: isSelected 
                                      ? `linear-gradient(135deg, ${cardColor} 0%, ${cardColor}cc 100%)`
                                      : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                                    boxShadow: isSelected ? `0 4px 12px ${cardColor}30` : 'none'
                                  }}
                                >
                                  <MapPin className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                                </div>

                                {/* Outlet Details */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold text-gray-800 truncate">
                                      {outlet.outletName}
                                    </h4>
                                    {hasReward && (
                                      <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 font-semibold">
                                        ✨ Reward
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {outlet.currentPoints || 0} points earned
                                  </p>
                                </div>

                                {/* Selection Check */}
                                <div 
                                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isSelected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
                                  style={{ background: cardColor }}
                                >
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">No outlets found</p>
                        <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                      </div>
                    )}
                  </div>

                  {/* Quick Stats Footer */}
                  <div 
                    className="px-4 py-2.5 flex items-center justify-between border-t"
                    style={{ borderColor: '#f3f4f6', background: '#fafafa' }}
                  >
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                      {filteredOutlets.length} of {outletBreakdown.length} outlets
                    </span>
                    <button
                      onClick={() => setShowOutletPicker(false)}
                      className="text-xs font-semibold transition-colors hover:opacity-70"
                      style={{ color: cardColor }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No outlets message - show info but don't hide rewards */}
          {outletBreakdown.length === 0 && (
            <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-xl mb-4">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium">Visit an outlet to start earning points</p>
              <p className="text-[10px] text-gray-400 mt-1">Rewards will unlock as you earn!</p>
            </div>
          )}

          {/* No rewards configured message */}
          {rewards.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
              <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No rewards configured</p>
              <p className="text-sm mt-2">Check back later for exciting rewards!</p>
            </div>
          )}

          {/* Rewards Display */}
          {rewards.length > 0 && (
            <div className="mb-6 flex gap-2" style={{ height: '288px' }}>
              {/* Progress Bar with Labels */}
              <div className="flex-shrink-0" style={{ width: '48px' }}>
                <div className="relative h-full flex">
                  {/* Threshold Labels */}
                  <div className="flex flex-col justify-between h-full py-4 pr-1" style={{ width: '28px' }}>
                    {rewards.map((reward, index) => {
                      const isActive = index === currentRewardIndex;
                      return (
                        <span 
                          key={index} 
                          className={`text-[10px] font-medium text-right transition-opacity duration-200 ${
                            isActive ? 'text-gray-700 opacity-100' : 'text-gray-400 opacity-70'
                          }`}
                        >
                          {reward.threshold}
                        </span>
                      );
                    })}
                  </div>
                  
                  {/* Dots and Line */}
                  <div className="relative flex-1">
                    {/* Background line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-4 bottom-4 w-0.5 bg-gray-200 rounded-full"></div>

                    {/* Progress indicators */}
                    <div className="flex flex-col justify-between h-full py-4 relative z-10">
                      {rewards.map((reward, index) => {
                        const isAvailable = selectedOutlet && canRedeem(selectedOutlet, reward.threshold);
                        const rewardIsRedeemed = selectedOutlet && isAlreadyRedeemed(selectedOutlet, reward.threshold);

                        return (
                          <div key={index} className="flex items-center justify-center">
                            <button
                              onClick={() => scrollToReward(index)}
                              disabled={!selectedOutlet || (!isAvailable && !rewardIsRedeemed)}
                              className={`w-5 h-5 rounded-full transition-colors duration-200 flex items-center justify-center ${
                                index === currentRewardIndex
                                  ? "bg-gray-500 text-white shadow-md ring-2 ring-gray-300"
                                  : isAvailable
                                  ? "bg-green-500 text-white hover:bg-green-600"
                                  : rewardIsRedeemed
                                  ? "bg-green-400 text-white"
                                  : "bg-gray-200 text-gray-400"
                              }`}
                            >
                              {getRewardIcon(reward.rewardType, reward.threshold)}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden snap-y snap-mandatory scrollbar-hide relative"
                onScroll={handleScroll}
                style={{ scrollbarWidth: "none", msOverflowStyle: "none", height: '288px' }}
              >
                {rewards.map((reward, index) => {
                  const isAvailable = selectedOutlet && canRedeem(selectedOutlet, reward.threshold);
                  const rewardIsRedeemed = selectedOutlet && isAlreadyRedeemed(selectedOutlet, reward.threshold);
                  const pointsNeeded = selectedOutlet ? reward.threshold - (selectedOutlet?.currentPoints || 0) : reward.threshold;

                  return (
                    <div key={index} className="snap-center flex-shrink-0 relative" style={{ height: '288px' }}>
                      <div
                        className="h-full flex flex-col justify-center px-1"
                        style={{
                          opacity: index === currentRewardIndex ? 1 : 0.5,
                          transition: 'opacity 0.2s ease-out'
                        }}
                      >
                        {/* Image */}
                        <div className="relative mb-4">
                          {reward.image ? (
                            <img
                              src={reward.image}
                              alt={reward.rewardName}
                              className="w-full h-40 object-cover rounded-xl"
                            />
                          ) : (
                            <div className={`w-full h-40 rounded-xl flex items-center justify-center ${
                              reward.rewardType === "discount"
                                ? "bg-emerald-100"
                                : "bg-amber-100"
                            }`}>
                              {reward.rewardType === "discount" ? (
                                <Percent className="w-16 h-16 text-emerald-600" />
                              ) : (
                                <Award className="w-16 h-16 text-amber-600" />
                              )}
                            </div>
                          )}

                          {/* Points Badge */}
                          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                            {reward.threshold}pt
                          </div>

                          {/* Lock Overlay */}
                          {!selectedOutlet || (!isAvailable && !rewardIsRedeemed) ? (
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
                          ) : null}
                        </div>

                        {/* Content */}
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {reward.rewardName || (reward.rewardType === "discount" ? `${reward.discountPercentage}% Discount` : "Reward")}
                            </h3>

                            {/* Status Badge */}
                            {rewardIsRedeemed ? (
                              <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-full font-medium">
                                Redeemed
                              </span>
                            ) : isAvailable ? (
                              <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-full font-medium">
                                Available
                              </span>
                            ) : !selectedOutlet ? (
                              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full font-medium">
                                Select Outlet
                              </span>
                            ) : (
                              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full font-medium">
                                Locked
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          {(reward.description || (reward.rewardType === "discount" && reward.discountPercentage)) && (
                            <div className="relative">
                              <p className={`text-xs text-gray-600 leading-relaxed transition-all duration-200`}>
                                {reward.description || `Get ${reward.discountPercentage}% off your purchase at ${selectedOutlet?.outletName || "selected outlet"}`}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {rewards.length > 0 && (
            <div className="space-y-3">
              <button
                onClick={() => handleRedeem(currentReward?.threshold)}
                disabled={!currentCanRedeem || isRedeeming || currentIsRedeemed}
                style={{ backgroundColor: currentCanRedeem && !currentIsRedeemed ? cardColor : undefined }}
                className={`w-full py-3 rounded-xl font-medium transition-all ${
                  currentIsRedeemed
                    ? "bg-gray-500 text-white"
                    : currentCanRedeem
                    ? "text-white hover:bg-gray-800 active:scale-[0.98]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isRedeeming
                  ? "Redeeming..."
                  : currentIsRedeemed || isRedeemed
                  ? "✓ Redeemed!"
                  : currentCanRedeem
                  ? `Redeem for ${currentReward?.threshold} points`
                  : !selectedOutlet
                  ? "Select an outlet first"
                  : `Need ${((currentReward?.threshold || 0) - (selectedOutlet?.currentPoints || 0))} more points`}
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
      </div>

      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          @keyframes dropdownSlide {
            from {
              opacity: 0;
              transform: translateY(-8px) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .outlet-dropdown-enter {
            animation: dropdownSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .custom-scrollbar-dropdown::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar-dropdown::-webkit-scrollbar-track {
            background: #f5f5f5;
            border-radius: 2px;
          }
          .custom-scrollbar-dropdown::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 2px;
          }
          .custom-scrollbar-dropdown::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }
          .reward-card-container {
            will-change: transform, opacity, filter;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
            transform-style: preserve-3d;
            -webkit-transform-style: preserve-3d;
          }
        `}
      </style>
    </>
  );
};

export default L5RedeemPopup;
