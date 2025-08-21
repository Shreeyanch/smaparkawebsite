import { useMemo } from "react";
import PropTypes from "prop-types";
import styles from "./with-out.module.css";

const WithOut = ({
  className = "",
  iconEmotionHappy,
  withoutSamparka,
  vector,
  stuckWithOutdatedPunchCar,
  vector1,
  noSecureWayToManageOrCont,
  vector2,
  higherRiskOfRewardsAbuseW,
  vector3,
  noAccessToRealTimeAnalyti,
  vector4,
  noSmartQRCodesForEasyMemb,
  propBackgroundColor,
  propWidth,
  propHeight,
  propWidth1,
  propHeight1,
  propWidth2,
  propHeight2,
  propWidth3,
  propHeight3,
  propWidth4,
  propHeight4,
}) => {
  const withOutStyle = useMemo(() => {
    return {
      backgroundColor: propBackgroundColor,
    };
  }, [propBackgroundColor]);

  const vectorIconStyle = useMemo(() => {
    return {
      width: propWidth,
      height: propHeight,
    };
  }, [propWidth, propHeight]);

  const vectorIcon1Style = useMemo(() => {
    return {
      width: propWidth1,
      height: propHeight1,
    };
  }, [propWidth1, propHeight1]);

  const vectorIcon2Style = useMemo(() => {
    return {
      width: propWidth2,
      height: propHeight2,
    };
  }, [propWidth2, propHeight2]);

  const vectorIcon3Style = useMemo(() => {
    return {
      width: propWidth3,
      height: propHeight3,
    };
  }, [propWidth3, propHeight3]);

  const vectorIcon4Style = useMemo(() => {
    return {
      width: propWidth4,
      height: propHeight4,
    };
  }, [propWidth4, propHeight4]);

  return (
    <div className={[styles.without, className].join(" ")} style={withOutStyle}>
      {/* <div className={styles.iconEmotionHappyParent}>
        <img
          className={styles.iconEmotionHappy}
          alt=""
          src={iconEmotionHappy}
        />
        <div className={styles.withoutSamparka}>{withoutSamparka}</div>
      </div> */}
      <div className={styles.points}>
        <img
          className={styles.vectorIcon}
          alt=""
          src={vector}
          style={vectorIconStyle}
        />
        <div className={styles.stuckWithOutdated}>
          {stuckWithOutdatedPunchCar}
        </div>
      </div>
      <div className={styles.points}>
        <img
          className={styles.vectorIcon}
          alt=""
          src={vector1}
          style={vectorIcon1Style}
        />
        <div className={styles.noSecureWay}>{noSecureWayToManageOrCont}</div>
      </div>
      <div className={styles.points}>
        <img
          className={styles.vectorIcon}
          alt=""
          src={vector2}
          style={vectorIcon2Style}
        />
        <div className={styles.noSecureWay}>{higherRiskOfRewardsAbuseW}</div>
      </div>
      <div className={styles.points}>
        <img
          className={styles.vectorIcon}
          alt=""
          src={vector3}
          style={vectorIcon3Style}
        />
        <div className={styles.noSecureWay}>{noAccessToRealTimeAnalyti}</div>
      </div>
      <div className={styles.points}>
        <img
          className={styles.vectorIcon}
          alt=""
          src={vector4}
          style={vectorIcon4Style}
        />
        <div className={styles.noSecureWay}>{noSmartQRCodesForEasyMemb}</div>
      </div>
    </div>
  );
};

WithOut.propTypes = {
  className: PropTypes.string,
  iconEmotionHappy: PropTypes.string,
  withoutSamparka: PropTypes.string,
  vector: PropTypes.string,
  stuckWithOutdatedPunchCar: PropTypes.string,
  vector1: PropTypes.string,
  noSecureWayToManageOrCont: PropTypes.string,
  vector2: PropTypes.string,
  higherRiskOfRewardsAbuseW: PropTypes.string,
  vector3: PropTypes.string,
  noAccessToRealTimeAnalyti: PropTypes.string,
  vector4: PropTypes.string,
  noSmartQRCodesForEasyMemb: PropTypes.string,

  /** Style props */
  propBackgroundColor: PropTypes.any,
  propWidth: PropTypes.any,
  propHeight: PropTypes.any,
  propWidth1: PropTypes.any,
  propHeight1: PropTypes.any,
  propWidth2: PropTypes.any,
  propHeight2: PropTypes.any,
  propWidth3: PropTypes.any,
  propHeight3: PropTypes.any,
  propWidth4: PropTypes.any,
  propHeight4: PropTypes.any,
};

export default WithOut;
