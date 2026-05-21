import { useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./RewardDescription.module.css";

const RewardDescription = ({
  className = "",
  onClose,
  reward,
  myRewards,
  redeemReward,
  format = "L3",
  customerPoints = 0,
}) => {
  useEffect(() => {
    const scrollAnimElements = document.querySelectorAll(
      "[data-animate-on-scroll]"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            const targetElement = entry.target;
            targetElement.classList.add(styles.animate);
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

  const redeemedCount = myRewards.filter(
    (r) => r.reward._id === reward._id
  ).length;
  const remainingRedemptions = Math.max(
    0,
    reward.redeemableTimes - redeemedCount
  );
  
  // For L4: Check if customer has enough points
  const hasEnoughPoints = format === "L4" 
    ? customerPoints >= (reward.pointCost || 0)
    : true;

  return (
    <div
      className={[styles.rewardDescription, className].join(" ")}
      data-animate-on-scroll
    >
      <div className={styles.line} />
      <div className={styles.aptapt} data-animate-on-scroll>
        <div className={styles.xWrapper} onClick={onClose}>
          {" "}
          {/* Close the drawer on click */}
          <img className={styles.xIcon} alt="Close" src="/l3/x.svg" />
        </div>
        <div className={styles.rewardSvgrepoCom1Parent}>
          <div className={styles.rewardSvgrepoCom1}>
            <div className="flex flex-col items-center justify-center gap-2 mb-2">
              <img
                className={styles.vectorIcon}
                alt={reward.name}
                src={reward.image || reward.template?.image}
              />
              {format === "L4" && reward.pointCost && (
                <div className="flex flex-col items-center justify-between gap-2 mb-2">
                  <div className="bg-amber-500 text-white text-sm font-semibold px-3 py-1.5 rounded-full z-10">
                    Cost: {reward.pointCost} Points
                  </div>
                  <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                    hasEnoughPoints ? "text-green-400" : "text-red-400"
                  }`}>
                    Your Balance: {customerPoints} pts
                  </div>
                </div>
              )}
              {reward.redeemable && format !== "L4" && (
                <div className="flex flex-col items-center justify-between gap-2 mb-2">
                  <div className="text-white text-xs font-semibold px-2 py-1 rounded-full z-10">
                    Reward Available: {remainingRedemptions}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={styles.bonusPoints}>{reward.name}</div>
          <div className={styles.earnBonusPointsOnEligibleWrapper}>
            <div className={styles.earnBonusPoints}>{reward.description}</div>
          </div>
        </div>
        
        {/* Redemption Button - For both L3/L34HA and L4 */}
        {((format === "L4" && reward.pointCost) || (reward.redeemable && format !== "L4")) && (
          <div className="flex flex-col items-center justify-between">
            {!hasEnoughPoints && format === "L4" && (
              <div className="text-red-400 text-sm mb-2">
                Insufficient points. Need {reward.pointCost - customerPoints} more points.
              </div>
            )}
            <button
              onClick={() => redeemReward(reward._id)}
              disabled={!hasEnoughPoints}
              className={`px-6 py-2 rounded-full text-sm font-medium ${
                hasEnoughPoints 
                  ? "bg-green-700 text-gray-200 hover:bg-green-600" 
                  : "bg-gray-500 text-gray-300 cursor-not-allowed"
              }`}
            >
              Redeem {format === "L4" ? `(${reward.pointCost} pts)` : ""}
            </button>
          </div>
        )}
        {/* Redemption List Here */}
        {reward.redeemable && (
          <div className="w-full mt-4">
            <h2 className="text-md font-semibold mb-2">Your Redemptions:</h2>
            {myRewards
              .filter((r) => r.reward._id === reward._id)
              .map((redemption, index) => (
                <div
                  key={redemption._id || index}
                  className="italic w-full p-2 my-1 rounded-lg text-sm text-gray-200 flex justify-between text-italic"
                >
                  <span>
                    {index + 1 + "."} {"  "} {redemption.reward.name}
                  </span>
                  <span>Status {redemption.status}</span>
                  <span>
                    {new Date(redemption.createdAt).toISOString().split("T")[0]}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

RewardDescription.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
};

export default RewardDescription;
