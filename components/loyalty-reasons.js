import PropTypes from "prop-types";
import styles from "./loyalty-reasons.module.css";

const LoyaltyReasons = ({ className = "" }) => {
  return (
    <div className={[styles.loyaltyreasons, className].join(" ")}>
      <div
        className={styles.weHaveEverything}
      >{`We have Everything you need! `}</div>
      <div className={styles.mobileobjective1mobile}>
        <div className={styles.with}>
          <img
            className={styles.designingAWebsiteIcon}
            alt=""
            src="/designingawebsite.svg"
          />
        </div>
        <div className={styles.without}>
          <div className={styles.ecGiftCardParent}>
            <img
              className={styles.ecGiftCardIcon}
              alt=""
              src="/ecgiftcard.svg"
            />
            <div className={styles.userFriendlyDashboard}>
              User-Friendly Dashboard
            </div>
          </div>
          <div className={styles.points}>
            <div className={styles.manageRewardsPoints}>
              Manage rewards, points, and customer interactions with ease.
            </div>
            <div className={styles.everythingYouNeed}>
              Everything you need, right at your fingertips! 🖥️
            </div>
          </div>
        </div>
      </div>
      <div className={styles.desktopobjective1}>
        <div className={styles.without1}>
          <div className={styles.ecGiftCardGroup}>
            <img
              className={styles.ecGiftCardIcon}
              alt=""
              src="/ecgiftcard.svg"
            />
            <div className={styles.enhancedSecurity}>
              User-Friendly Dashboard
            </div>
          </div>
          <div className={styles.points1}>
            <div className={styles.generateSmartQr}>
              Manage rewards, points, and customer interactions with ease.
            </div>
            <div className={styles.scanEarnRepeatits}>
              Everything you need, right at your fingertips! 🖥️
            </div>
          </div>
        </div>
        <div className={styles.with}>
          <img
            className={styles.designingAWebsiteIcon1}
            alt=""
            src="/designingawebsite1.svg"
          />
        </div>
      </div>
      <div className={styles.desktopobjective2}>
        <div className={styles.with}>
          <img
            className={styles.withChild}
            alt=""
            src="/group-1000007175.svg"
          />
        </div>
        <div className={styles.without2}>
          <div className={styles.vectorParent}>
            <img className={styles.vectorIcon} alt="" src="/vector4.svg" />
            <div className={styles.seamlessQrIntegration}>
              Seamless QR Integration
            </div>
          </div>
          <div className={styles.points2}>
            <div className={styles.generateSmartQr}>
              Generate smart QR codes for quick and easy membership and point
              collection.
            </div>
            <div className={styles.scanEarnRepeatits}>
              Scan, earn, repeat—it's that simple! 📲
            </div>
          </div>
        </div>
      </div>
      <div className={styles.desktopobjective3}>
        <div className={styles.without3}>
          <div className={styles.ecGiftCardGroup}>
            <div className={styles.security2SvgrepoCom1}>
              <img className={styles.vectorIcon1} alt="" src="/vector5.svg" />
            </div>
            <div
              className={styles.enhancedSecurity}
            >{`Enhanced Security `}</div>
          </div>
          <div className={styles.points1}>
            <div className={styles.preventAbuseWith}>
              Prevent abuse with manual approval for rewards, ensuring fair
              distribution.
            </div>
            <div className={styles.scanEarnRepeatits}>
              Keep your loyalty program secure and trustworthy at all times. 🔒
            </div>
          </div>
        </div>
        <div className={styles.with3}>
          <div className={styles.enterPassword}>
            <img className={styles.vectorIcon2} alt="" src="/vector6.svg" />
            <img className={styles.vectorIcon3} alt="" src="/vector7.svg" />
            <img className={styles.vectorIcon4} alt="" src="/vector8.svg" />
            <img className={styles.vectorIcon5} alt="" src="/vector9.svg" />
            <img className={styles.vectorIcon6} alt="" src="/vector10.svg" />
            <img className={styles.vectorIcon7} alt="" src="/vector11.svg" />
            <img className={styles.vectorIcon8} alt="" src="/vector12.svg" />
            <img className={styles.vectorIcon9} alt="" src="/vector13.svg" />
            <img className={styles.vectorIcon10} alt="" src="/vector14.svg" />
            <img className={styles.vectorIcon11} alt="" src="/vector15.svg" />
            <img className={styles.vectorIcon12} alt="" src="/vector16.svg" />
            <img className={styles.vectorIcon13} alt="" src="/vector17.svg" />
            <img className={styles.vectorIcon14} alt="" src="/vector18.svg" />
            <img className={styles.vectorIcon15} alt="" src="/vector19.svg" />
            <img className={styles.vectorIcon16} alt="" src="/vector20.svg" />
            <img className={styles.vectorIcon17} alt="" src="/vector21.svg" />
            <img className={styles.vectorIcon18} alt="" src="/vector22.svg" />
            <img className={styles.vectorIcon19} alt="" src="/vector23.svg" />
            <img className={styles.vectorIcon20} alt="" src="/vector24.svg" />
            <img className={styles.vectorIcon21} alt="" src="/vector25.svg" />
            <img className={styles.vectorIcon22} alt="" src="/vector26.svg" />
            <img className={styles.vectorIcon23} alt="" src="/vector27.svg" />
          </div>
        </div>
      </div>
      <div className={styles.mobileObjective2mobile}>
        <div className={styles.with}>
          <img
            className={styles.enterPasswordIcon}
            alt=""
            src="/enterpassword.svg"
          />
        </div>
        <div className={styles.without4}>
          <div className={styles.vectorParent}>
            <div className={styles.security2SvgrepoCom1}>
              <img className={styles.vectorIcon1} alt="" src="/vector5.svg" />
            </div>
            <div
              className={styles.seamlessQrIntegration}
            >{`Enhanced Security `}</div>
          </div>
          <div className={styles.points2}>
            <div className={styles.generateSmartQr}>
              Prevent abuse with manual approval for rewards, ensuring fair
              distribution.
            </div>
            <div className={styles.knowYourCustomers}>
              Keep your loyalty program secure and trustworthy at all times. 🔒
            </div>
          </div>
        </div>
      </div>
      <div className={styles.desktopobjective4}>
        <div className={styles.with}>
          <img className={styles.startupIcon} alt="" src="/startup.svg" />
        </div>
        <div className={styles.without5}>
          <div className={styles.ecGiftCardGroup}>
            <img className={styles.icon} alt="" src="/10@2x.png" />
            <div className={styles.enhancedSecurity}>Advanced Analytics</div>
          </div>
          <div className={styles.points5}>
            <div className={styles.generateSmartQr}>
              Dive deep into customer data to improve your loyalty strategies.
            </div>
            <div className={styles.knowYourCustomers}>
              Know your customers like never before and watch your business
              grow! 📈
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

LoyaltyReasons.propTypes = {
  className: PropTypes.string,
};

export default LoyaltyReasons;
