import PropTypes from "prop-types";
import styles from "./benefit-two.module.css";

const BenefitTwo = ({
  className = "",
  a19ada006bf9011562397Grou,
  worksOnSmartphonesRunning,
}) => {
  return (
    <div className={[styles.benefittwo, className].join(" ")}>
      <img
        className={styles.a19ada006bf9011562397Group44Icon}
        alt=""
        src={a19ada006bf9011562397Grou}
      />
      <div className={styles.title}>Device Support</div>
      <div className={styles.description}>
        <p className={styles.worksOnSmartphones}>{worksOnSmartphonesRunning}</p>
      </div>
    </div>
  );
};

BenefitTwo.propTypes = {
  className: PropTypes.string,
  a19ada006bf9011562397Grou: PropTypes.string,
  worksOnSmartphonesRunning: PropTypes.string,
};

export default BenefitTwo;
