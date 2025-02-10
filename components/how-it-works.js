import { useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./how-it-works.module.css";

const HowItWorks = ({ className = "" }) => {
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
  return (
    <div className={[styles.trust, className].join(" ")} data-animate-on-scroll>
      
      <div className={styles.trusttitle1}>
        <div className={styles.createRealLoyaltyAndBoost}>
          Create real loyalty and boost revenue by rewarding your customers!
        </div>
      </div>
      <div className={styles.trusttitle2}>
        <div className={styles.withSamparkaLoyaltyContainer}>
          <span className={styles.with}>With </span>
          <span className={styles.samparka}>SAMPARKA</span>
          <span className={styles.with}>{` `}</span>
          <span className={styles.loyalty}>Loyalty</span>
          <span className={styles.increaseYourProfits}>
            , increase your profits by focusing on your most valuable customers.
            Our easy-to-use solution will delight both your customers and staff,
            fostering loyalty and driving growth
          </span>
        </div>
      </div>
      <div className={styles.trusttitle}>
        <b className={styles.realBusinessesReal}>
          Real Businesses. Real Results.
        </b>
      </div>
      <div className={styles.desktopHeroImage}>
        <div className={styles.samparka202Wrapper}>
          <img
            className={styles.samparka202}
            alt=""
            src="/howitworks.png"
          />
        </div>
      </div>
    </div>
  );
};

HowItWorks.propTypes = {
  className: PropTypes.string,
};

export default HowItWorks;
