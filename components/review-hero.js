import { useState, useCallback } from "react";
import FilterReview from "./filter-review";
import PortalPopup from "./portal-popup";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import styles from "./review-hero.module.css";

const ReviewHero = ({ className = "" }) => {
  const [isVideoPopupOpen, setVideoPopupOpen] = useState(false);
  const router = useRouter();

  const openVideoPopup = useCallback(() => {
    setVideoPopupOpen(true);
  }, []);

  const closeVideoPopup = useCallback(() => {
    setVideoPopupOpen(false);
  }, []);

  const onGroupContainerClick = useCallback(() => {
    router.push("/get-in-touch");
  }, [router]);

  return (
    <>
      <div className={[styles.reviewhero, className].join(" ")}>
        <div className={styles.reviewheading}>
          <img
            className={styles.desktoptitleIcon}
            alt=""
            src="/DesktopTitleReview.png"
          />
          <img
            className={styles.mobiletitleIcon}
            alt=""
            src="/MobileTitleReview.png"
          />
          <div className={styles.elevatingStatusWith}>
            Elevating status with seamless sharing.
          </div>
          <div className={styles.mobileCtaButton}>
            <div className={styles.group} onClick={onGroupContainerClick}>
              <div
                className={styles.rectangle}
                onClick={onGroupContainerClick}
              />
              <div className={styles.getInTouch}>Get In Touch</div>
            </div>
            <button className={styles.group1} onClick={openVideoPopup}>
              <div className={styles.rectangle1} />
              <div className={styles.watchAVideo}>Watch a video</div>
            </button>
          </div>
        </div>
        <div className={styles.desktopHeroImagereview}>
          <img
            className={styles.samparka91}
            alt=""
            src="/hgooglereview.png"
          />
        </div>
        <div className={styles.companydesktopreview}>
          <div className={styles.logo}>
            <img className={styles.icon} alt="" src="/7@2x.png" />
            <img className={styles.icon1} alt="" src="/2@2x.png" />
            <img className={styles.icon2} alt="" src="/3@2x.png" />
            <img className={styles.icon3} alt="" src="/6@2x.png" />
            <img className={styles.icon4} alt="" src="/11@2x.png" />
            <img className={styles.icon5} alt="" src="/5@2x.png" />
          </div>
        </div>
        <div className={styles.companymobilereview}>
          <div className={styles.logo1}>
            <img className={styles.icon6} alt="" src="/12@2x.png" />
            <img className={styles.icon7} alt="" src="/2@2x.png" />
            <img className={styles.icon8} alt="" src="/31@2x.png" />
            <img className={styles.icon9} alt="" src="/6@2x.png" />
            <img className={styles.icon10} alt="" src="/5@2x.png" />
          </div>
        </div>
      </div>
      {isVideoPopupOpen && (
        <PortalPopup
          overlayColor="rgba(0, 0, 0, 0.8)"
          placement="Centered"
          onOutsideClick={closeVideoPopup}
        >
          <div className={styles.videoPopup}>
            <button className={styles.videoPopupClose} onClick={closeVideoPopup}>
              &times;
            </button>
            <div className={styles.videoWrapper}>
              <iframe
                title="YouTube Video"
                width="560"  // Adjust width as needed
                height="315" // Adjust height as needed
                src="https://www.youtube.com/embed/Tc4B-MK9NlE"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </PortalPopup>
      )}
    </>
  );
};

ReviewHero.propTypes = {
  className: PropTypes.string,
};

export default ReviewHero;
