import { useCallback, useEffect } from "react";
import Header from "../components/header";
import HeroBusinessCard from "../components/hero-business-card";
import BenefitTwo from "../components/benefit-two";
import { useRouter } from "next/router";
import Footer from "../components/footer";
import styles from "./smart-business-card.module.css";


const SmartBusinessCard = () => {
  const router = useRouter();
  useEffect(() => {
    const scrollAnimElements = document.querySelectorAll(
      "[data-animate-on-scroll]"
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            const targetElement = entry.target;
            targetElement.classList.add(styles.animate);
            observer.unobserve(targetElement);
          }
        }
      },
      {
        threshold: 0.15,
      }
    );

    for (let i = 0; i < scrollAnimElements.length; i++) {
      observer.observe(scrollAnimElements[i]);
    }

    return () => {
      for (let i = 0; i < scrollAnimElements.length; i++) {
        observer.unobserve(scrollAnimElements[i]);
      }
    };
  }, []);

  const onFrameContainerClick = useCallback(() => {
    router.push("/get-in-touch");
  }, [router]);

  return (
    <div className={styles.smartbusinesscard}>
      <Header />
      <HeroBusinessCard />
      <div className={styles.benefitsbusinesscard} data-animate-on-scroll>
        <div className={styles.benefitsframe}>
          <div className={styles.benefitone}>
            <img className={styles.vectorIcon} alt="" src="/vector29.svg" />
            <div className={styles.title}>Reduce Waste</div>
            <div className={styles.description}>
              Limit your carbon footprint by reducing your reliance on paper —
              and look good doing it.
            </div>
          </div>
          <BenefitTwo
            a19ada006bf9011562397Grou="/629a19ada006bf9011562397-group-448-1-1@2x.png"
            worksOnSmartphonesRunning="Works on all smartphones running both Android or iOS."
          />
          <div className={styles.benefitone}>
            <img className={styles.vectorIcon1} alt="" src="/vector28.svg" />
            <div className={styles.title1}>Gain An Edge</div>
            <div className={styles.description1}>
              Impress potential customers, clients and partners with the latest
              in networking technology.
            </div>
          </div>
        </div>
      </div>
      <div className={styles.business1}>
        <img className={styles.image2Icon} alt="" src="/image-22@2x.png" />
        <div className={styles.smartBusinessCardParent}>
          <div className={styles.smartBusinessCard}>1.Smart Business Card</div>
          <div className={styles.enableSeamlessExchange}>
            Enable seamless exchange of contact information and interactive
            content with a simple tap or scan, enhancing networking efficiency
            with samparka smart business card.
          </div>
          <div className={styles.contactlessSvgrepoCom1}>
            <div className={styles.layer2Parent}>
              <img className={styles.layer2Icon} alt="" src="/layer-2@2x.png" />
              <img className={styles.groupIcon} alt="" src="/group.svg" />
            </div>
            <div className={styles.nfcqrEnabled}>Nfc/Qr Enabled</div>
          </div>
          <div className={styles.contactlessSvgrepoCom1}>
            <img
              className={styles.designIdeasSvgrepoCom1Icon}
              alt=""
              src="/designideassvgrepocom-1.svg"
            />
            <div className={styles.nfcqrEnabled}>
              Customizable Design/Landing Page
            </div>
          </div>
          <div className={styles.frame} onClick={onFrameContainerClick}>
            <div className={styles.orderNow}>Order Now</div>
          </div>
        </div>
      </div>
      <div className={styles.productvisualsbusinesscard}>
        <div className={styles.productVisuals}>Product Visuals</div>
        <div className={styles.howtoorderframe}>
          <img className={styles.step1Icon} alt="" src="/step1@2xcopy2.png" />
          <img className={styles.step1Icon} alt="" src="/step11@2x.png" />
          <img className={styles.step1Icon} alt="" src="/step12@2x.png" />
          <img className={styles.step1Icon} alt="" src="/step13@2x.png" />
        </div>
      </div>
      <Footer lETTERLOGO1="/letter-logo-1@2x.png" propGap="24px" />
    </div>
  );
};

export default SmartBusinessCard;
