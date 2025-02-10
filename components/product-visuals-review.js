import PropTypes from "prop-types";
import styles from "./product-visuals-review.module.css";

const ProductVisualsReview = ({ className = "" }) => {
  return (
    <div className={[styles.productvisualsreview, className].join(" ")}>
      <div className={styles.productVisuals}>Product Visuals</div>
      <div className={styles.howtoorderframe}>
        <img className={styles.step1Icon} alt="" src="/step14@2x.png" />
        <img className={styles.step1Icon} alt="" src="/step15@2x.png" />
        <img className={styles.step1Icon} alt="" src="/step16@2x.png" />
        <img className={styles.step1Icon} alt="" src="/step17@2x.png" />
        <img className={styles.step1Icon} alt="" src="/step18@2x.png" />
        <img className={styles.step1Icon} alt="" src="/step19@2x.png" />
        <img className={styles.step1Icon} alt="" src="/step110@2x.png" />
        <img className={styles.step1Icon} alt="" src="/step111@2x.png" />
        <img className={styles.step1Icon} alt="" src="/step112@2x.png" />
        <img className={styles.step1Icon} alt="" src="/step113@2x.png" />
        <img className={styles.step1Icon} alt="" src="/step114@2x.png" />
        {/* <img className={styles.step1Icon} alt="" /> */}
        <img className={styles.step1Icon} alt="" src="/step1@2x.png" />
        <img className={styles.step1Icon} alt="" src="/step115@2x.png" />
        <img className={styles.step1Icon} alt="" src="/step116@2x.png" />
        <img className={styles.step1Icon} alt="" src="/step117@2x.png" />
        <img className={styles.step1Icon} alt="" src="/step118@2x.png" />
        {/* <img className={styles.step1Icon} alt="" /> */}
        {/* <img className={styles.step1Icon} alt="" src="/step1@2x.png" /> */}
      </div>
    </div>
  );
};

ProductVisualsReview.propTypes = {
  className: PropTypes.string,
};

export default ProductVisualsReview;
