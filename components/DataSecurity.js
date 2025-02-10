import { useEffect } from "react";
import styles from "./DataSecurity.module.css";
import Image from "next/image";

export default function DataSecurity({className= ""}) {

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

  return (
    <div className={[styles.container,className].join(" ")} data-animate-on-scroll>
      <div className={styles.header}>
        <div className={styles.lockImage}>
          <Image src="/lock-icon.png" alt="Lock icon" width={100} height={100} />
        </div>
        <div className={styles.textSection}>
          <h2 className={styles.title}>Your Data is Secured</h2>
          <p className={styles.subtitle}>
            Your data is securely stored with maximum security.
          </p>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}>
              <span className={styles.icon}>🔒</span>
            </div>
            <h3 className={styles.cardTitle}>TLS/SSL</h3>
          </div>
          <p className={styles.cardDescription}>
            TLS/SSL encrypts and secures your data, ensuring peace of mind and
            protection from unauthorized access.
          </p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}>
              <span className={styles.icon}>☁️</span>
            </div>
            <h3 className={styles.cardTitle}>AWS/Google Cloud</h3>
          </div>
          <p className={styles.cardDescription}>
            Experience secure data protection and top performance with the
            reliable cloud services of AWS and Google Cloud.
          </p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.iconWrapper}>
              <span className={styles.icon}>💳</span>
            </div>
            <h3 className={styles.cardTitle}>Your Credit Card is Safe</h3>
          </div>
          <p className={styles.cardDescription}>
            We do not store your credit card numbers on our servers. Instead, they
            are securely stored on Stripe's servers.
          </p>
        </div>
      </div>
    </div>
  );
}
