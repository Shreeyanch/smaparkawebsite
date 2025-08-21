import { useCallback, useEffect } from "react";
import Header from "../components/header";
import ReviewHero from "../components/review-hero";
import BenefitTwo from "../components/benefit-two";
import { useRouter } from "next/router";
import Review from "../components/review";
import ProductVisualsReview from "../components/product-visuals-review";
import RecommendationMobile from "../components/recommendation-mobile";
import Footer from "../components/footer";
import styles from "./smart-review-stand.module.css";

const SmartReviewStand = () => {
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
    <div className={styles.smartreviewstand}>
      <Header />
      <div className={styles.desktopCtaButtonreview}>
        <div className={styles.group}>
          <div className={styles.rectangle} />
          <div className={styles.getInTouch}>Get In Touch</div>
        </div>
        <div className={styles.group1}>
          <div className={styles.rectangle1} />
          <div className={styles.watchAVideo}>Watch a video</div>
        </div>
      </div>
      <ReviewHero />
      <div className={styles.benefitsreview} data-animate-on-scroll>
        <div className={styles.benefitsframe}>
          <div className={styles.benefitone}>
            <img className={styles.ratingIcon} alt="" src="/37-rating.svg" />
            <div className={styles.title}>Effortless Reviews</div>
            <div className={styles.description}>
              Streamlines the review process, making it quick and
              straightforward for customers to share their experiences.
            </div>
          </div>
          <BenefitTwo
            a19ada006bf9011562397Grou="/629a19ada006bf9011562397-group-448-1-1@2x.png"
            worksOnSmartphonesRunning="Works on smartphones running both Android or iOS."
          />
          <div className={styles.benefitone}>
            <img className={styles.vectorIcon} alt="" src="/vector28.svg" />
            <div className={styles.title}>Gain An Edge</div>
            <div className={styles.description1}>
              Impress potential customers, clients and partners with the latest
              in networking technology.
            </div>
          </div>
        </div>
      </div>
      <div className={styles.review1}>
        <img className={styles.image2Icon} alt="" src="/image-2@2x.png" />
        <div className={styles.filterReviewParent}>
          <div className={styles.filterReview}>1.Filter review</div>
          <div className={styles.optimizeReviews45}>
            Optimize reviews 4-5 stars lead to Google reviews, 1-3 stars
            redirect to a feedback form, saving from negative reviews.
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
      <Review />
      <ProductVisualsReview />
      <RecommendationMobile group7791="/group-779-1@2x.png" />
      <Footer lETTERLOGO1="/letter-logo-1@2x.png" propGap="24px" />
    </div>
  );
};

export default SmartReviewStand;
