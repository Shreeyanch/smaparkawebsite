import { useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./loyalty-heroo.module.css";
import WithOut from "./with-out";


const LoyaltyHeroo = ({ className = "" }) => {
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
    <section
      className={[styles.loyaltyheroo, className].join(" ")}
      id="HeroSection"
      data-animate-on-scroll
    >
      <div className={styles.herotext}>
        <div className={styles.herocta}>
          <div className={styles.newcallout}>
            <div className={styles.newcalloutChild} />
            <div className={styles.contactlessElegantInnovati}>
              Contactless. Elegant. Innovative.
            </div>
            <img className={styles.vectorIcon} alt="" src="/vector1.svg" />
          </div>
          <div className={styles.title}>
            <span className={styles.the}>Boost</span>
            <span className={styles.span}> </span>
            <b>Loyalty</b>
            <span className={styles.span}> </span>
            <br/>
            <span className={styles.the}>Build Relationships</span>
          </div>
          <WithOut
                    vector="/vector3.svg"
                    stuckWithOutdatedPunchCar="As simple as paper cards—eco-friendly."
                    vector1="/vector3.svg"
                    noSecureWayToManageOrCont="No app downloads—start in seconds."
                    vector2="/vector3.svg"
                    higherRiskOfRewardsAbuseW="No complicated setup or maintenance."
                    vector3="/vector3.svg"
                    noAccessToRealTimeAnalyti="Designed for businesses of all sizes."
                    vector4="/vector3.svg"
                    noSmartQRCodesForEasyMemb="Built in fraud protection."
                   
                  />
          



        </div>
      </div>
      <img className={styles.heroimageIcon} alt="" src="/loyaltypod.png" />
    </section>
  );
};

LoyaltyHeroo.propTypes = {
  className: PropTypes.string,
};

export default LoyaltyHeroo;
