import { useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./whyloyalty.module.css";

const Whyloyalty = ({ className = "" }) => {
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
    <div
      className={[styles.benefitsreview, className].join(" ")}
      data-animate-on-scroll
    >
      <div className={styles.whyLoyalty}>Why Samparka Works For Your Business</div>
      <div className={styles.benefitsframe}>
        <div className={styles.benefitone}>
          <img className={styles.image34Icon} alt="" src="/why1.png" />
          <div className={styles.description1}>
            Keeps your customers coming back
          </div>
        </div>
        <div className={styles.benefitone}>
          <img className={styles.image34Icon} alt="" src="/why2.png" />
          <div className={styles.description1}>
            More purchases more often equals more revenue
          </div>
        </div>
        <div className={styles.benefitone}>
          <img className={styles.image36Icon} alt="" src="/why3.png" />
          <div className={styles.description1}>
            Connect with your customers and build them into your brands
            advocates.
          </div>
        </div>
      </div>
    </div>
  );
};

Whyloyalty.propTypes = {
  className: PropTypes.string,
};

export default Whyloyalty;
