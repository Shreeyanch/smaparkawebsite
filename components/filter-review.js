import PropTypes from "prop-types";
import styles from "./filter-review.module.css";

const FilterReview = ({ className = "", onClose }) => {
  return (
    <div className={[styles.filterReview, className].join(" ")}>
      <div className={styles.vectorParent}>
        <img className={styles.groupChild} alt="" src="/rectangle-14.svg" />
        <iframe
          className={styles.image9}
          src="https://www.youtube.com/embed/FG78By_yEJc?rel=0"
          frameBorder="0"
          allowFullScreen
        />
      </div>
    </div>
  );
};

FilterReview.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
};

export default FilterReview;
