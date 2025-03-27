import { useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./loyalty-component.module.css";
import { useRouter } from "next/router";

const LoyaltyComponent = ({ className = "" }) => {
 
  const router = useRouter();

  const onCheckOutSmaparkasClick = useCallback(() => {
    router.push("/smaparka-loyalty-solution");
  }, [router]);

  const onGroupButtonClick = useCallback(() => {
    window.open("https://wa.me/9779766387030");
  }, []);

  const onGroupButtonClick1 = useCallback(() => {
    window.open(
      "https://www.facebook.com/SamparkaTechServices"
    );
  }, []);

  const onGroupButtonClick2 = useCallback(() => {
    window.open("https://www.instagram.com/samparka.nep/");
  }, []);

  return (
    <div className={[styles.frameParent, className].join(" ")}>
      <div className={styles.frameWrapper}>
        <div className={styles.frameGroup}>
          <div className={styles.frameContainer}>
            <div className={styles.frameDiv}>
              <div className={styles.minReadWrapper}>
                <div className={styles.minRead}>2 min read</div>
              </div>
            </div>
            <b className={styles.enhanceCustomerLoyalty}>
              Enhance Customer Loyalty with Digital Loyalty Solution Software
            </b>
            <div className={styles.elevateCustomerLoyalty}>
              Elevate Customer Loyalty with Samparka's Advanced Digital Loyalty
              Program
            </div>
          </div>
          <div className={styles.articleAuthorWrapper}>
            <div className={styles.articleAuthor}>
              <img className={styles.avatarIcon} alt="" src="/Dipendra.png" />
              <div className={styles.authorText}>
                <div className={styles.dipenderaShah}>Dipendera Shah</div>
                <div className={styles.postedOnJun}>Posted on Jun 17, 2024</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.image33Parent}>
        <img className={styles.image33Icon} alt="" src="/loyaltyheropic.png" />
        <div className={styles.reviews} />
      </div>
      <div className={styles.frameChild} />
      <div className={styles.frameParent1}>
        <div className={styles.frameParent2}>
          <div className={styles.introductionParent}>
            <b className={styles.introduction}>Introduction</b>
            <div className={styles.inNepalsCompetitive}>
              In Nepal's competitive business landscape, cultivating customer
              loyalty is crucial for sustained success. Today, traditional punch
              cards are making way for advanced, cloud-based digital loyalty
              solutions like Samparka's digital loyalty program. Here's why
              upgrading to such a platform can benefit your business:
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer5"
            />
          </div>
          <div
            className={styles.whatIsDigitalLoyaltySolutiParent}
            data-scroll-to="frameContainer4"
          >
            <b className={styles.whatIsDigital}>
              What is Digital Loyalty Solution Software?
            </b>
            <div className={styles.digitalLoyaltySolution}>
              Digital loyalty solution software, like Samparka's platform,
              revolutionizes customer loyalty programs by digitizing rewards and
              engagement strategies. It replaces old-fashioned punch cards with
              a seamless digital experience for customers.
            </div>
          </div>
          <div className={styles.whyUpgradeParent}>
            <b className={styles.whyUpgrade}>Why Upgrade?</b>
            <div className={styles.digitalLoyaltySolution}>
              <ol className={styles.enhancedCustomerEngagement}>
                <li className={styles.operationalEfficiencyAutoma}>
                  <span className={styles.operationalEfficiency}>
                    Enhanced Customer Engagement:
                  </span>
                  <span>
                    {" "}
                    Personalized rewards and incentives tailored to customer
                    preferences drive repeat visits and purchases.
                  </span>
                </li>
                <li className={styles.operationalEfficiencyAutoma}>
                  <span
                    className={styles.operationalEfficiency}
                  >{`Operational Efficiency: `}</span>
                  <span className={styles.automatedPointTracking}>
                    Automated point tracking, reward issuance, and redemption
                    streamline program management.
                  </span>
                </li>
                <li>
                  <span
                    className={styles.operationalEfficiency}
                  >{`Real-Time Insights: `}</span>
                  <span className={styles.automatedPointTracking}>
                    Access to analytics provides actionable insights into
                    customer behavior and program performance.
                  </span>
                </li>
              </ol>
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer3"
            />
          </div>
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>
              How It Benefits Your Business:
            </b>
            <div className={styles.digitalLoyaltySolution}>
              <ol className={styles.enhancedCustomerEngagement}>
                <li className={styles.operationalEfficiencyAutoma}>
                  <span className={styles.operationalEfficiency}>
                    Boosted Customer Retention:
                  </span>
                  <span>
                    {" "}
                    Strengthen customer relationships through targeted rewards
                    and user-friendly experiences.
                  </span>
                </li>
                <li className={styles.operationalEfficiencyAutoma}>
                  <span
                    className={styles.operationalEfficiency}
                  >{`Increased Sales: `}</span>
                  <span className={styles.automatedPointTracking}>
                    Encourage larger transactions and frequent visits as
                    customers strive to earn rewards.
                  </span>
                </li>
                <li>
                  <span
                    className={styles.operationalEfficiency}
                  >{`Improved Efficiency: `}</span>
                  <span className={styles.automatedPointTracking}>
                    Free up staff time with automated processes, allowing for
                    better focus on customer service.
                  </span>
                </li>
              </ol>
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>
              Features of Samparka's Digital Loyalty Program:
            </b>
            <div className={styles.digitalLoyaltySolution}>
              <ol className={styles.seamlessRewardTrackingCusto}>
                <li className={styles.operationalEfficiencyAutoma}>
                  Seamless Reward Tracking
                </li>
                <li className={styles.operationalEfficiencyAutoma}>
                  Customizable Rewards and Incentives
                </li>
                <li className={styles.operationalEfficiencyAutoma}>
                  Real-Time Analytics Dashboard
                </li>
                <li className={styles.operationalEfficiencyAutoma}>
                  User-Friendly Interface
                </li>
                <li>Secure Data Management</li>
              </ol>
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer1"
            />
          </div>
          <div className={styles.whatIsDigitalLoyaltySolutiParent}>
            <b className={styles.introduction}>Conclusion</b>
            <div className={styles.digitalLoyaltySolution}>
              Transitioning to Samparka's digital loyalty program not only
              enhances customer satisfaction and retention but also provides
              actionable data insights for strategic decision-making. Ready to
              elevate your loyalty program? Contact us today to explore how
              Samparka's digital solution can propel your business forward in
              Nepal.
            </div>
          </div>
          <div className={styles.checkOutSmaparkasLoyaltyRWrapper}>
            <div
              className={styles.checkOutSmaparkasContainer}
              onClick={onCheckOutSmaparkasClick}
            >
              {`Check out `}
              <span className={styles.smaparkasLoyaltyReward}>
                Smaparka’s Loyalty Reward Solution
              </span>
            </div>
          </div>
          <div className={styles.rectangleParent}>
            <img
              className={styles.frameItem}
              alt=""
              src="/LoyaltySebHeroPic.png"
            />
            <div className={styles.whyUpgrade}>
              Keywords: loyalty management software Nepal, customer loyalty app
              Nepal, loyalty points system Nepal, loyalty rewards platform
              Nepal, digital membership software Nepal, cloud-based loyalty
              program Nepal, customer retention platform Nepal, loyalty card
              system Nepal, loyalty marketing software Nepal, membership rewards
              software Nepal, customer engagement software Nepal, loyalty
              program analytics Nepal, mobile loyalty app Nepal, loyalty scheme
              management Nepal, loyalty rewards management Nepal
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer"
            />
          </div>
        </div>
        <div className={styles.groupParent}>
          <button className={styles.ellipseParent} onClick={onGroupButtonClick}>
            <div className={styles.groupChild} />
            <img
              className={styles.whatsappSvgrepoCom1Icon}
              alt=""
              src="/whatsappsvgrepocom-1.svg"
            />
          </button>
          <button
            className={styles.ellipseParent}
            onClick={onGroupButtonClick1}
          >
            <div className={styles.groupChild} />
            <img className={styles.vectorIcon} alt="" src="/FacebookVector.png" />
          </button>
          <button
            className={styles.ellipseParent}
            onClick={onGroupButtonClick2}
          >
            <div className={styles.groupChild} />
            <img className={styles.groupIcon} alt="" src="/group-7560.svg" />
          </button>
        </div>
      </div>
    </div>
  );
};

LoyaltyComponent.propTypes = {
  className: PropTypes.string,
};

export default LoyaltyComponent;
