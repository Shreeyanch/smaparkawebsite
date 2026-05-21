import { useState, useCallback, useEffect } from "react";
import RewardDescription from "./RewardDescription";
import PortalDrawer from "./PortalDrawer";
import PropTypes from "prop-types";
import styles from "./Reward.module.css";

const Reward = ({ className = "", onClose }) => {
  const [isRewardDescriptionOpen, setRewardDescriptionOpen] = useState(false);
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

  const openRewardDescription = useCallback(() => {
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
            <div
              className={styles.constantrewardParent}
              onClick={openRewardDescription}
            >
              <div className={styles.constantreward}>
                <img
                  className={styles.rewardSvgrepoCom1Icon}
                  alt=""
                  src="/l3/rewardsvgrepocom-1.svg"
                />
              </div>
              <div className={styles.bonusPoints}>10% Bonus Points</div>
            </div>
            <div className={styles.constantrewardGroup}>
              <div className={styles.constantreward}>
                <img className={styles.groupIcon} alt="" src="/l3/group.svg" />
              </div>
              <div className={styles.priorityLateCheckout}>
                Priority Late Checkout
              </div>
            </div>
            <div>WHERE IS MY ALU NAAN</div>
            <div className={styles.constantrewardGroup}>
              <div className={styles.constantreward}>
                <img
                  className={styles.rewardSvgrepoCom1Icon}
                  alt=""
                  src="/l3/rewardsvgrepocom-1.svg"
                />
              </div>
              <div className={styles.priorityLateCheckout}>
                Instant Redemption
              </div>
            </div>
          </div>
        </div>
      </div>
      {isRewardDescriptionOpen && (
        <PortalDrawer
          overlayColor="rgba(113, 113, 113, 0.3)"
          placement="Bottom"
          onOutsideClick={closeRewardDescription}
        >
          <RewardDescription onClose={closeRewardDescription} />
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
