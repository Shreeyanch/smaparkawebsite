import PropTypes from "prop-types";
import styles from "./business-card-popup.module.css";

const BusinessCardPopup = ({ className = "", onClose }) => {
  return (
    <div className={[styles.businesscardpopup1, className].join(" ")}>
      <iframe
        className={styles.businesscardpopup1Child}
        frameBorder="0"
        allowFullScreen
      />
    </div>
  );
};

BusinessCardPopup.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
};

export default BusinessCardPopup;
