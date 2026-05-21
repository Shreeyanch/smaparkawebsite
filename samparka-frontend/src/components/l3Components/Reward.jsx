import { useState, useCallback, useEffect } from "react";
import RewardDescription from "./RewardDescription";
import PortalDrawer from "./PortalDrawer";
import PropTypes from "prop-types";
import styles from "./Reward.module.css";

const Reward = ({
  className = "",
  onClose,
  tier,
  rewards,
  statuses,
  myRewards,
  redeemReward,
  format = "L3",
  customerPoints = 0,
}) => {
  const [isRewardDescriptionOpen, setRewardDescriptionOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
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

  const openRewardDescription = useCallback((reward) => {
    setSelectedReward(reward); // Store the selected reward
    setRewardDescriptionOpen(true);
  }, []);

  const closeRewardDescription = useCallback(() => {
    setRewardDescriptionOpen(false);
  }, []);

  return (
    <>
      <div
        className={[styles.reward, className].join(" ")}
        data-animate-on-scroll
      >
        <div className={styles.aptapt} data-animate-on-scroll>
          <div className={styles.frameParent}>
            {rewards
              ?.filter((reward) =>
                format === "L4"
                  ? // For L4: show tier-matching rewards AND untied (all-customer) rewards
                    !reward.tier || reward.tier === tier.name
                  : // For L3/L34HA: original behaviour — tier must match
                    reward.tier === tier.name
              )
              .map((filteredReward) => {
                // Count how many times this reward was already redeemed
                const redeemedCount = myRewards.filter(
                  (myReward) => myReward.reward._id === filteredReward._id
                ).length;

                const remainingRedemptions =
                  filteredReward.redeemableTimes - redeemedCount;

                return (
                  <div
                    key={filteredReward._id}
                    className={styles.constantrewardParent}
                    onClick={() => openRewardDescription(filteredReward)}
                  >
                    <div
                      className={styles.constantreward}
                      style={{ backgroundColor: "white", position: "relative" }}
                    >
                      {format === "L4" && filteredReward.pointCost && (
                        <div className="absolute top-1 left-1 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full z-10">
                          {filteredReward.pointCost} pts
                        </div>
                      )}
                      {filteredReward.redeemable && format !== "L4" && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full z-10">
                          {remainingRedemptions}
                        </div>
                      )}
                      <img
                        className={styles.rewardSvgrepoCom1Icon}
                        alt={filteredReward.name}
                        src={filteredReward.image || filteredReward.template?.image}
                      />
                    </div>

                    <div className={styles.bonusPoints}>
                      {filteredReward.name}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      {isRewardDescriptionOpen && selectedReward && (
        <PortalDrawer
          overlayColor="rgba(113, 113, 113, 0.3)"
          placement="Bottom"
          onOutsideClick={closeRewardDescription}
          style={{ position: "fixed", bottom: 0, left: 0, width: "100%" }}
        >
            format={format}
            customerPoints={customerPoints}
          <RewardDescription
            reward={selectedReward}
            myRewards={myRewards}
            redeemReward={redeemReward}
            onClose={closeRewardDescription}
          />
        </PortalDrawer>
      )}
    </>
  );
};

Reward.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
};

export default Reward;
