import FrameComponent from "./frame-component";
import PropTypes from "prop-types";
import styles from "./with.module.css";

const With = ({ className = "" }) => {
  return (
    <div className={[styles.with, className].join(" ")}>
      <FrameComponent
        smallBiz="MegaChain"
        forSmallBusinesses="For Multi Outlet Businesses"
        nPR1599mo="Custom Quotation"
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
          Create Multiple Rewards 
        </div>
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
        <div className={styles.cloudBasedMobileRewards}>Nfc Pod Technology</div>
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
        <div className={styles.cloudBasedMobileRewards}>
          Add Online Store
        </div>
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
      <div className={styles.points}>
        <img className={styles.vectorIcon} alt="" src="/vector3.svg" />
        <div className={styles.cloudBasedMobileRewards}>Priority Support</div>
      </div>
      <div className={styles.points}>
        <img className={styles.vectorIcon} alt="" src="/vector3.svg" />
        <div className={styles.cloudBasedMobileRewards}>
          Multi-Store Management
        </div>
      </div>
      <div className={styles.points}>
        <img className={styles.vectorIcon} alt="" src="/vector3.svg" />
        <div className={styles.cloudBasedMobileRewards}>
          Customizable Campaigns
        </div>
      </div>
    </div>
  );
};

With.propTypes = {
  className: PropTypes.string,
};

export default With;
