import { useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./footer.module.css";

const Footer = ({ className = "", lETTERLOGO1, propGap }) => {
  
  const footerStyle = useMemo(() => {
    return {
      gap: propGap,
    };
  }, [propGap]);

  const onPhoneNumberClick = useCallback(() => {
    window.location.href = "tel:+9779843742684";
  }, []);

  const onWhatsappClick = useCallback(() => {
    window.open("https://wa.me/9779766387030");
  }, []);

  const onSamparkaservicesgmailcomTextClick = useCallback(() => {
    window.location.href = "mailto:samparkaservices@gmail.com";
  }, []);

  const onItemClick = useCallback(() => {
    window.open("https://www.instagram.com/samparka.nep/");
  }, []);

  const onItemClick1 = useCallback(() => {
    window.open(
      "https://www.facebook.com/people/Samparka-Business-Card/61556638293745/"
    );
  }, []);

  return (
    <footer
      className={[styles.footer, className].join(" ")}
      data-scroll-to="footer"
      style={footerStyle}
    >
      <div className={styles.footermain}>
        <img className={styles.letterLogo1} alt="" src={lETTERLOGO1} />
        <div className={styles.contactlessEligantInnovativeContainer}>
          <p className={styles.contactless}>Contactless</p>
          <p className={styles.contactless}>Elegant</p>
          <p className={styles.contactless}>Innovative</p>
        </div>
        <div className={styles.copyright}>© 2024 — Copyright</div>
      </div>
      <div className={styles.footerdescription}>
        <div className={styles.contactsParent}>
          <div className={styles.contacts}>
            <div className={styles.contactUs}>Contact us</div>
            <div className={styles.list}>
              <div
                className={styles.samparkaservicesgmailcom}
                onClick={onPhoneNumberClick}
              >
                Phone Number: +977 9843742684
              </div>
              <div
                className={styles.samparkaservicesgmailcom}
                onClick={onWhatsappClick}
              >
                Whatsapp : +977 9766387030
              </div>
              <div
                className={styles.samparkaservicesgmailcom}
                onClick={onSamparkaservicesgmailcomTextClick}
              >
                samparkaservices@gmail.com
              </div>
              <div className={styles.anamnagarNepal}>Anamnagar, Nepal</div>
            </div>
          </div>
          <div className={styles.socialMedia}>
            <button className={styles.item} onClick={onItemClick}>
              <div className={styles.instagram}>Instagram</div>
            </button>
            <button className={styles.item} onClick={onWhatsappClick}>
              <div className={styles.whatsapp}>Whatsapp</div>
            </button>
            <button className={styles.item} onClick={onItemClick1}>
              <div className={styles.whatsapp}>Facebook</div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  className: PropTypes.string,
  lETTERLOGO1: PropTypes.string,

  /** Style props */
  propGap: PropTypes.any,
};

export default Footer;
