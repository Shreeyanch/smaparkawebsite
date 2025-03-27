import { useCallback } from "react";
import Header from "../components/header";
import { useRouter } from "next/router";
import Piccolo from "../components/piccolo";
import Footer from "../components/footer";
import styles from "./boost-your-business-with-n-f-c-e.module.css";

const PiccoloWhereCoffeeMeetsCommunity = () => {
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

  const onWhatIsDigitalClick = useCallback(() => {
    const anchor = document.querySelector("[data-scroll-to='frameContainer4']");
    if (anchor) {
      anchor.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, []);

  const onWhyUpgradeClick = useCallback(() => {
    const anchor = document.querySelector("[data-scroll-to='frameContainer3']");
    if (anchor) {
      anchor.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, []);

  const onHowItBenefitsClick = useCallback(() => {
    const anchor = document.querySelector("[data-scroll-to='frameContainer2']");
    if (anchor) {
      anchor.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, []);

  const onFeaturesOfSamparkasClick = useCallback(() => {
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
    <div className={styles.boostYourBusinessWithNfcE}>
      <Header />
      <div className={styles.blogArticleBodyLoyalty}>
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
              <a className={styles.whatIsDigital} onClick={onWhatIsDigitalClick}>
                The Heart of Piccolo's Mission
              </a>
              <a className={styles.introduction} onClick={onWhyUpgradeClick}>
                Why Piccolo is Different
              </a>
              <a className={styles.howItBenefits} onClick={onHowItBenefitsClick}>
                A Gathering Place for All
              </a>
              <a className={styles.howItBenefits} onClick={onFeaturesOfSamparkasClick}>
                The Piccolo Experience: Coffee and Creativity
              </a>
              <a className={styles.conclusion} onClick={onConclusionClick}>
                Conclusion
              </a>
            </div>
          </div>
          <Piccolo />
        </div>
      </div>
      
      
      <Footer lETTERLOGO1="/letter-logo-1@2x.png" />
    </div>
  );
};

export default PiccoloWhereCoffeeMeetsCommunity;
