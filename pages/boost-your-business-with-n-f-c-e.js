import { useCallback } from "react";
import Header from "../components/header";
import { useRouter } from "next/router";
import ReviewComponent from "../components/review-component";
import Footer from "../components/footer";
import styles from "./enhance-customer-loyalty-with.module.css";

const EnhanceCustomerLoyaltyWith = () => {
  const router = useRouter();

  const onFrameButtonClick = useCallback(() => {
    router.push("/blog");
  }, [router]);

  const onIntroductionClick = useCallback(() => {
    const anchor = document.querySelector("[data-scroll-to='frameContainer5']");
    if (anchor) {
      anchor.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, []);

  const onWhatAreNFCClick = useCallback(() => {
    const anchor = document.querySelector("[data-scroll-to='frameContainer4']");
    if (anchor) {
      anchor.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, []);

  const onHowItWorksClick = useCallback(() => {
    const anchor = document.querySelector("[data-scroll-to='frameContainer3']");
    if (anchor) {
      anchor.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, []);

  const onBenefitsForYourClick = useCallback(() => {
    const anchor = document.querySelector("[data-scroll-to='frameContainer2']");
    if (anchor) {
      anchor.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, []);

  const onHowToMakeClick = useCallback(() => {
    const anchor = document.querySelector("[data-scroll-to='frameContainer1']");
    if (anchor) {
      anchor.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, []);

  const onConclusionClick = useCallback(() => {
    const anchor = document.querySelector("[data-scroll-to='frameContainer']");
    if (anchor) {
      anchor.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, []);

  const onFrameLinkClick = useCallback(() => {
    router.push("/boost-your-business-with-n-f-c-e");
  }, [router]);

  const onFrameLinkClick1 = useCallback(() => {
    router.push("/enhance-customer-loyalty-with");
  }, [router]);

  const onFrameLinkClick2 = useCallback(() => {
    router.push("/upgrade-your-networking-with-s");
  }, [router]);

  return (
    <div className={styles.enhanceCustomerLoyaltyWith}>
      <Header />
      <div className={styles.blogArticleBodyReviewcard}>
        <button className={styles.iconBackParent} onClick={onFrameButtonClick}>
          <img className={styles.iconBack} alt="" src="/icon--back.svg" />
          <a className={styles.home}>Blog</a>
        </button>
        <div className={styles.frameParent}>
          <div className={styles.tableOfContentsParent}>
            <div className={styles.tableOfContents}>Table of Contents</div>
            <div className={styles.introductionParent}>
              <a className={styles.introduction} onClick={onIntroductionClick}>
                Introduction
              </a>
              <a
                className={styles.whatAreNfc}
                onClick={onWhatAreNFCClick}
              >{`What are NFC Review Stand? `}</a>
              <a className={styles.howItWorks} onClick={onHowItWorksClick}>
                How it works?
              </a>
              <a
                className={styles.benefitsForYour}
                onClick={onBenefitsForYourClick}
              >
                {" "}
                Benefits for Your Business
              </a>
              <a className={styles.howToMake} onClick={onHowToMakeClick}>
                How to make google reviews work better
              </a>
              <a className={styles.conclusion} onClick={onConclusionClick}>
                Conclusion
              </a>
            </div>
          </div>
          <ReviewComponent />
        </div>
      </div>
      <div className={styles.frame7680Reviewcard}>
        <div className={styles.blogCatHeaders}>
          <div className={styles.discoverMoreTopics}>Discover more topics</div>
        </div>
        <div className={styles.frameGroup}>
          <a className={styles.rectangleParent} onClick={onFrameLinkClick}>
            <img
              className={styles.frameChild}
              alt=""
              src="/Rectangle478.png"
            />
            <div className={styles.frameContainer}>
              <div className={styles.frameDiv}>
                <div className={styles.frameParent1}>
                  <div className={styles.frameWrapper}>
                    <div className={styles.minReadWrapper}>
                      <div className={styles.minRead}>3 min read</div>
                    </div>
                  </div>
                  <b className={styles.boostYourBusiness}>
                    Boost Your Business with NFC-Enabled Google Review Cards in
                    Nepal
                  </b>
                </div>
                <div className={styles.asABusinessOwnerInNepalWrapper}>
                  <div className={styles.asABusiness}>
                    As a business owner in Nepal, leveraging Google reviews
                    effectively can ...
                  </div>
                </div>
              </div>
              <div className={styles.frameItem} />
              <div className={styles.articleAuthor}>
                <img
                  className={styles.avatarIcon}
                  alt=""
                  src="/Yeshi.png"
                />
                <div className={styles.authorText}>
                  <div className={styles.yeshiDolkar}>Yeshi Dolkar</div>
                  <div className={styles.postedOnJun}>
                    Posted on Jun 8, 2024
                  </div>
                </div>
              </div>
            </div>
          </a>
          <a className={styles.rectangleGroup} onClick={onFrameLinkClick1}>
            <img
              className={styles.frameChild}
              alt=""
              src="/Loyaltyscreenpic.png"
            />
            <div className={styles.frameParent2}>
              <div className={styles.frameDiv}>
                <div className={styles.frameParent1}>
                  <div className={styles.frameWrapper}>
                    <div className={styles.minReadContainer}>
                      <div className={styles.minRead}>2 min read</div>
                    </div>
                  </div>
                  <b className={styles.boostYourBusiness}>
                    Enhance Customer Loyalty with Digital Loyalty Solution
                    Software
                  </b>
                </div>
                <div className={styles.asABusinessOwnerInNepalWrapper}>
                  <div className={styles.transformFromTraditional}>
                    Transform from traditional punch cards to cloud-based
                    digital loyalty solutions ...
                  </div>
                </div>
              </div>
              <div className={styles.lineParent}>
                <div className={styles.lineDiv} />
                <div className={styles.articleAuthor1}>
                  <img
                    className={styles.avatarIcon1}
                    alt=""
                    src="/Dipendra.png"
                  />
                  <div className={styles.authorText}>
                    <div className={styles.yeshiDolkar}>Dipendera Shah</div>
                    <div className={styles.postedOnMay}>
                      Posted on Jun 17, 2024
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
          <a className={styles.rectangleGroup} onClick={onFrameLinkClick2}>
            <img
              className={styles.frameChild}
              alt=""
              src="/rectangle-478@2x.png"
            />
            <div className={styles.frameParent2}>
              <div className={styles.frameDiv}>
                <div className={styles.frameParent1}>
                  <div className={styles.frameWrapper}>
                    <div className={styles.minReadContainer}>
                      <div className={styles.minRead}>2 min read</div>
                    </div>
                  </div>
                  <b className={styles.boostYourBusiness}>
                    Upgrade Your Networking with Smart NFC Business Cards in
                    Nepal
                  </b>
                </div>
                <div className={styles.asABusinessOwnerInNepalWrapper}>
                  <div className={styles.asABusiness}>
                    Smart NFC business cards offer a modern solution to
                    traditional paper cards ...
                  </div>
                </div>
              </div>
              <div className={styles.lineParent}>
                <div className={styles.frameChild1} />
                <div className={styles.articleAuthor1}>
                  <img
                    className={styles.avatarIcon1}
                    alt=""
                    src="/avatar@2x.png"
                  />
                  <div className={styles.authorText}>
                    <div className={styles.shreeyanchShrestha}>
                      Shreeyanch Shrestha
                    </div>
                    <div className={styles.postedOnMay}>
                      Posted on May 17, 2024
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
      <Footer lETTERLOGO1="/letter-logo-1@2x.png" />
    </div>
  );
};

export default EnhanceCustomerLoyaltyWith;
