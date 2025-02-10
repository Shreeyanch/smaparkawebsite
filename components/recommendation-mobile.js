import { useState, useCallback } from "react";
import TestimonialPhone from "./testimonial-phone";
import PortalPopup from "./portal-popup";
import PropTypes from "prop-types";
import styles from "./recommendation-mobile.module.css";

const RecommendationMobile = ({ className = "", group7791 }) => {
  const [isTestimonialPhonePopupOpen, setTestimonialPhonePopupOpen] =
    useState(false);

  const openTestimonialPhonePopup = useCallback(() => {
    setTestimonialPhonePopupOpen(true);
  }, []);

  const closeTestimonialPhonePopup = useCallback(() => {
    setTestimonialPhonePopupOpen(false);
  }, []);

  return (
    <>
      <div className={[styles.recommendationMobile, className].join(" ")}>
        <div className={styles.recommendationframe1}>
          <div className={styles.group7791Parent}>
            <img className={styles.group7791} alt="" src={group7791} />
            <div className={styles.ofCustomersRecommendContainer}>
              <p className={styles.ofCustomers}>{`95% of customers `}</p>
              <p className={styles.ofCustomers}>recommend Samparka</p>
            </div>
          </div>
        </div>
        <div className={styles.recommendationframe2}>
          <div className={styles.rating}>
            <img className={styles.icon} alt="" src="/1.svg" />
            <img className={styles.icon} alt="" src="/1.svg" />
            <img className={styles.icon2} alt="" src="/3.svg" />
            <img className={styles.icon} alt="" src="/1.svg" />
            <img className={styles.icon} alt="" src="/1.svg" />
          </div>
          <button
            className={styles.atomsLinkIconRight}
            onClick={openTestimonialPhonePopup}
          >
            <div className={styles.label}>Read our reviews</div>
            <img className={styles.icon5} alt="" src="/icon.svg" />
          </button>
        </div>
      </div>
      {isTestimonialPhonePopupOpen && (
        <PortalPopup
          overlayColor="rgba(113, 113, 113, 0.6)"
          placement="Centered"
          onOutsideClick={closeTestimonialPhonePopup}
        >
          <TestimonialPhone onClose={closeTestimonialPhonePopup} />
        </PortalPopup>
      )}
    </>
  );
};

RecommendationMobile.propTypes = {
  className: PropTypes.string,
  group7791: PropTypes.string,
};

export default RecommendationMobile;
