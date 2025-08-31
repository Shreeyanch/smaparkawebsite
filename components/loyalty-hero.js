import { useState, useCallback } from "react";
import PortalPopup from "./portal-popup";

import { useRouter } from "next/router";
import PropTypes from "prop-types";
import styles from "./loyalty-hero.module.css";

const LoyaltyHero = ({ className = "" }) => {
  const [isVideoPopupOpen, setVideoPopupOpen] = useState(false);
  const openVideoPopup = useCallback(() => {
    setVideoPopupOpen(true);
  }, []);

  const closeVideoPopup = useCallback(() => {
    setVideoPopupOpen(false);
  }, []);


  const router = useRouter();

  const onGroupContainerClick = useCallback(() => {
    router.push("/get-in-touch");
  }, [router]);

  return (
    <>
    <div className={[styles.loyaltyhero, className].join(" ")}>
      <div className={styles.loyaltyheroheader}>
        <img
          className={styles.desktoptitleIcon}
          alt=""
          src="/DesktopTitleLoyalty.png"
        />
        <img
          className={styles.mobileTitleIcon}
          alt=""
          src="/DesktopTitleLoyalty.png"
        />
        <div className={styles.nepalsTopDigitalContainer}>
          <b>Nepal's</b>
          <span> top digital loyalty reward solution.</span>
        </div>
        <div className={styles.desktopCtaButton}>
          <div className={styles.group} onClick={onGroupContainerClick}>
            <div className={styles.rectangle} />
            <div className={styles.getInTouch}>Get In Touch</div>
          </div>
          <div className={styles.group1} onClick={openVideoPopup}>
            <div className={styles.rectangle1} />
            <div className={styles.watchAVideo}>Watch a video</div>
          </div>
        </div>
        <div className={styles.mobileCtaButtonLoyalty} >
          <div className={styles.group2} onClick={onGroupContainerClick} >
            <div className={styles.rectangle2} />
            <div className={styles.startForFree}>Get In Touch</div>
          </div>
          <div className={styles.group3} onClick={openVideoPopup}>
            <div className={styles.rectangle3} />
            <div className={styles.watchAVideo1}>Watch a video</div>
          </div>
        </div>
        <div className={styles.mobileHeroImageLoyalty}>
          <img
            className={styles.mobileHeroImageLoyaltyChild}
            alt=""
            src="/group-1000003524@2x.png"
          />
        </div>
        {/* <div className={styles.companymobile}>
          <div className={styles.logo}>
            <img className={styles.icon} alt="" src="/1@2x.png" />
            <img className={styles.icon1} alt="" src="/2@2x.png" />
            <img className={styles.icon2} alt="" src="/31@2x.png" />
            <img className={styles.icon3} alt="" src="/6@2x.png" />
            <img className={styles.icon4} alt="" src="/5@2x.png" />
          </div>
        </div> */}
      </div>
      <div className={styles.desktopHeroImage}>
        <img
          className={styles.desktopHeroImageChild}
          alt=""
          src="/group-1000003524@2x.png"
        />
      </div>
      {/* <div className={styles.companydesktoployalty}>
        <div className={styles.logo1}>
          <img className={styles.icon5} alt="" src="/7@2x.png" />
          <img className={styles.icon6} alt="" src="/2@2x.png" />
          <img className={styles.icon7} alt="" src="/3@2x.png" />
          <img className={styles.icon8} alt="" src="/6@2x.png" />
          <img className={styles.icon9} alt="" src="/11@2x.png" />
          <img className={styles.icon10} alt="" src="/5@2x.png" />
        </div>
      </div> */}
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
              src="https://www.youtube.com/embed/9-LAMxLL9P8?si=ufYMCr-Puj0SvACn"
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

LoyaltyHero.propTypes = {
  className: PropTypes.string,
};

export default LoyaltyHero;
