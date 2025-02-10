import { useCallback } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import styles from "./Reservation.module.css";

const Reservation = ({ className = "" }) => {
  const router = useRouter();

  const onFrameContainerClick = useCallback(() => {
    router.push("/get-in-touch");
  }, [router]);

  return (
    <div className={[styles.reservationSection].join(" ")}>
      <div className={[styles.reservationContainer, className].join(" ")}>
        <img className={styles.reservationImage} alt="" src="/image-21@2x.png" />
        <div className={styles.reservationTextContainer}>
          <div className={styles.reservationTitle}>Seamless Reservations</div>
          <div className={styles.reservationDescription}>
            Effortlessly book your table, haircut, or any other service in advance with Samparka. Whether you're planning a special evening out, scheduling a rejuvenating spa day, or securing your spot for a busy weekend, Samparka ensures a seamless, hassle-free booking experience. Say goodbye to long waits and last-minute disappointments—reserve your spot today and enjoy the convenience of pre-booking for a truly stress-free experience.
          </div>
          <div className={styles.wrapper}>
            <div className={styles.reservationFeatures}>
              <img className={styles.featureIcon} alt="" src="/group.svg" />
              <div className={styles.feature}>Customizable Booking Options</div>
            </div>
            <div className={styles.reservationFeatures}>
              <img className={styles.featureIcon} alt="" src="/designideassvgrepocom-1.svg" />
              <div className={styles.feature}>Customizable Design</div>
            </div>
          </div>
          <div className={styles.orderButton} onClick={onFrameContainerClick}>
            <div className={styles.orderNow}>Order Now</div>
          </div>
        </div>
      </div>
    </div>
  );
};

Reservation.propTypes = {
  className: PropTypes.string,
};

export default Reservation;
