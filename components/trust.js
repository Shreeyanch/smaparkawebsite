import { useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./trust.module.css";

const Trust = ({ className = "" }) => {
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
      <div className={styles.trusttitle}>
        <div className={styles.trustedByMoreContainer}>
          <span>{`Trusted by more than `}</span>
          <span className={styles.span}>300</span>
          <span> businesses</span>
        </div>
      </div>
      <div className={styles.trustlogos}>
        <div className={styles.frameParent}>
          <div className={styles.parent}>
            <img className={styles.icon} alt="" src="/287@2x.png" />
            <img className={styles.icon1} alt="" src="/288@2x.png" />
            <img className={styles.icon} alt="" src="/289@2x.png" />
            <img className={styles.icon} alt="" src="/290@2x.png" />
          </div>
          <div className={styles.group}>
            <img className={styles.icon} alt="" src="/291@2x.png" />
            <img className={styles.icon} alt="" src="/292@2x.png" />
            <img className={styles.icon} alt="" src="/293@2x.png" />
          </div>
          <div className={styles.companydesktop}>
            <div className={styles.logo}>
              <img className={styles.icon7} alt="" src="/7@2x.png" />
              <img className={styles.icon8} alt="" src="/2@2x.png" />
              <img className={styles.icon9} alt="" src="/3@2x.png" />
              <img className={styles.icon10} alt="" src="/6@2x.png" />
              <img className={styles.icon11} alt="" src="/1@2x.png" />
              <img className={styles.icon12} alt="" src="/5@2x.png" />
            </div>
          </div>
          <div className={styles.companymobile}>
            <div className={styles.logo1}>
              <img className={styles.icon13} alt="" src="/1@2x.png" />
              <img className={styles.icon14} alt="" src="/2@2x.png" />
              <img className={styles.icon15} alt="" src="/3@2x.png" />
              <img className={styles.icon16} alt="" src="/6@2x.png" />
              <img className={styles.icon17} alt="" src="/5@2x.png" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Trust.propTypes = {
  className: PropTypes.string,
};

export default Trust;
