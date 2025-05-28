import FrameComponent from "./frame-component";
import PropTypes from "prop-types";
import styles from "./with1.module.css";

const With1 = ({ className = "" }) => {
  return (
    <div className={[styles.with, className].join(" ")}>
      <FrameComponent
        smallBiz="SmallBiz"
        forSmallBusinesses="For Small Businesses"
        nPR1599mo="NPR 2299/m"
      />
      <div className={styles.points}>
        <img className={styles.vectorIcon} alt="" src="/vector3.svg" />
        <div className={styles.cloudBasedMobileRewards}>
          Cloud-Based Mobile Rewards
        </div>
      </div>
      <div className={styles.points}>
        <img className={styles.vectorIcon} alt="" src="/vector3.svg" />
        <div className={styles.cloudBasedMobileRewards}>
          Manage Upto 2500 Customers
        </div>
      </div>
      <div className={styles.points}>
        <img className={styles.vectorIcon} alt="" src="/vector3.svg" />
        <div className={styles.cloudBasedMobileRewards}>Create 10 Rewards </div>
      </div>
      <div className={styles.points}>
        <img className={styles.vectorIcon} alt="" src="/vector3.svg" />
        <div className={styles.cloudBasedMobileRewards}>
          Membership Creation
        </div>
      </div>
      <div className={styles.points}>
        <img className={styles.vectorIcon} alt="" src="/vector3.svg" />
        <div className={styles.cloudBasedMobileRewards}>QR Code Technology</div>
      </div>
      <div className={styles.points}>
        <img className={styles.vectorIcon} alt="" src="/vector3.svg" />
        <div className={styles.cloudBasedMobileRewards}>NFC Pod Technology</div>
      </div>
      <div className={styles.points}>
        <img className={styles.vectorIcon} alt="" src="/vector3.svg" />
        <div className={styles.cloudBasedMobileRewards}>
          DFY Rewards Templates
        </div>
      </div>
      <div className={styles.points}>
        <img className={styles.vectorIcon} alt="" src="/vector3.svg" />
        <div className={styles.cloudBasedMobileRewards}>
          Customer Tracking Dashboard
        </div>
      </div>
      <div className={styles.points}>
        <img className={styles.vectorIcon} alt="" src="/vector3.svg" />
        <div className={styles.cloudBasedMobileRewards}>Advanced Analytics</div>
      </div>
      <div className={styles.points}>
        <img className={styles.vectorIcon} alt="" src="/vector3.svg" />
        <div className={styles.cloudBasedMobileRewards}>Add Online Store</div>
      </div>
      <div className={styles.points}>
        <img className={styles.vectorIcon} alt="" src="/vector3.svg" />
        <div className={styles.cloudBasedMobileRewards}>
          Reservation / PreBooking Feature
        </div>
      </div>
      <div className={styles.points}>
        <img className={styles.vectorIcon} alt="" src="/vector3.svg" />
        <div className={styles.cloudBasedMobileRewards}>
          Abuse-free Safe Mode
        </div>
      </div>
    </div>
  );
};

With1.propTypes = {
  className: PropTypes.string,
};

export default With1;
