import PropTypes from "prop-types";
import styles from "./testimonial-phone.module.css";

const TestimonialPhone = ({ className = "", onClose }) => {
  return (
    <div className={[styles.testimonialPhone, className].join(" ")}>
      <img
        className={styles.efeKurnazRncpixixooyUnsplasIcon}
        alt=""
        src="/efekurnazrncpixixooyunsplash-2@2x.png"
      />
    </div>
  );
};

TestimonialPhone.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
};

export default TestimonialPhone;
