import WithOut from "./with-out";
import PropTypes from "prop-types";
import styles from "./loyalty-why.module.css";

const LoyaltyWhy = ({ className = "" }) => {
  return (
    <div className={[styles.loyaltywhy, className].join(" ")}>
      <div className={styles.whyShouldYou}>
        Why should you use Samparka for your business?
      </div>
      <div className={styles.withoutParent}>
        <WithOut
          iconEmotionHappy="/-icon-emotion-happy.svg"
          withoutSamparka=" Without Samparka,"
          vector="/vector2.svg"
          stuckWithOutdatedPunchCar="Stuck with outdated punch cards that get lost and can't track  customer."
          vector1="/vector2.svg"
          noSecureWayToManageOrCont="No secure way to manage or control reward points."
          vector2="/vector2.svg"
          higherRiskOfRewardsAbuseW="Higher risk of rewards abuse without verification tools."
          vector3="/vector2.svg"
          noAccessToRealTimeAnalyti="No access to real-time analytics."
          vector4="/vector2.svg"
          noSmartQRCodesForEasyMemb="No smart QR/NFC for easy membership and point tracking."
        />
        <WithOut
          iconEmotionHappy="/-icon-emotion-happy1.svg"
          withoutSamparka=" With Samparka,"
          vector="/vector3.svg"
          stuckWithOutdatedPunchCar="Upgrade from old punch cards to a modern cloud-based rewards solution."
          vector1="/vector3.svg"
          noSecureWayToManageOrCont="Securely manage rewards with manual point control."
          vector2="/vector3.svg"
          higherRiskOfRewardsAbuseW="Prevent abuse with our 'safe-mode' for verifying  points and rewards."
          vector3="/vector3.svg"
          noAccessToRealTimeAnalyti="Get real-time analytics."
          vector4="/vector3.svg"
          noSmartQRCodesForEasyMemb="Use smart QR/NFC for instant membership creation and point tracking."
          propBackgroundColor="rgba(131, 176, 132, 0.21)"
          propWidth="28px"
          propHeight="20.3px"
          propWidth1="28px"
          propHeight1="20.3px"
          propWidth2="28px"
          propHeight2="20.3px"
          propWidth3="28px"
          propHeight3="20.3px"
          propWidth4="28px"
          propHeight4="20.3px"
        />
      </div>
    </div>
  );
};

LoyaltyWhy.propTypes = {
  className: PropTypes.string,
};

export default LoyaltyWhy;
