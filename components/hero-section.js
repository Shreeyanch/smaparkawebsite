import { useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import styles from "./hero-section.module.css";

const HeroSection = ({ className = "" }) => {
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

  const onButtonClick = useCallback(() => {
    router.push("/get-in-touch");
  }, [router]);

  return (
    <section
      className={[styles.herosection, className].join(" ")}
      id="HeroSection"
      data-scroll-to="heroSection"
      data-animate-on-scroll
    >
      <div className={styles.herotext}>
        <div className={styles.herocta}>
          <div className={styles.newcallout}>
            <div className={styles.newcalloutChild} />
            <div className={styles.contactlessElegantInnovati}>
              Contactless. Elegant. Innovative.
            </div>
            <img className={styles.vectorIcon} alt="" src="/vector1.svg" />
          </div>
          <div className={styles.title}>
            Bridging the gap between traditional and the new.
          </div>
          
          {/* Digital NFC Smart Business Cards, Google Review Management, and Loyalty Reward Software in Nepal | Bridging Traditional and Modern Technology */}
          <div className={styles.subtitle1}>
          Digital NFC Smart Business Cards | Google Review Management | Loyalty Reward Software in Nepal 
          </div>
          
          <div className={styles.subtitle}>
            Our products are crafted to elevate your professional image, enhance
            customer feedback, and strengthen client loyalty, all through
            cutting-edge technology and intuitive design.
          </div>

          
          <div className={styles.buttonrow}>
            <button className={styles.button} onClick={onButtonClick}>
              <div className={styles.getInTouch}>Get In Touch</div>
            </button>
          </div>
        </div>
      </div>
      <img className={styles.heroimageIcon} alt="Samparka Nepal Hero Page Image Of Smart Business Card, Review Card and Loyalty SOftware" src="/vector@2x.png" />
    </section>
  );
};

HeroSection.propTypes = {
  className: PropTypes.string,
};

export default HeroSection;
