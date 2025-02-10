import { useCallback } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import styles from "./frame-component.module.css";

const FrameComponent = ({
  className = "",
  smallBiz,
  forSmallBusinesses,
  nPR1599mo,
}) => {
  const router = useRouter();

  const onGroupContainerClick = useCallback(() => {
    router.push("/get-in-touch");
  }, [router]);

  return (
    <div className={[styles.smallbizParent, className].join(" ")}>
      <div className={styles.smallbiz}>{smallBiz}</div>
      <div className={styles.forSmallBusinesses}>{forSmallBusinesses}</div>
      <div className={styles.npr1599mo}>{nPR1599mo}</div>
      {/* <div className={styles.yearlyBilling}>Yearly Billing</div> */}
      <div className={styles.group} onClick={onGroupContainerClick}>
        <div className={styles.rectangle} />
        <div className={styles.getStarted}>Get Started</div>
      </div>
    </div>
  );
};

FrameComponent.propTypes = {
  className: PropTypes.string,
  smallBiz: PropTypes.string,
  forSmallBusinesses: PropTypes.string,
  nPR1599mo: PropTypes.string,
};

export default FrameComponent;
