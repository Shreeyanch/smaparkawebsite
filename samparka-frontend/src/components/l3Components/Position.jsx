import PropTypes from "prop-types";
import styles from "./Position.module.css";

const Position = ({
  className = "",
  tier = { name: "Bronze", minPoints: "0", maxPoints: "100", color: "#000000" },
  userTier,
}) => {
  return (
    <div
      className={[styles.position, className].join(" ")}
      style={{
        background: `linear-gradient(30deg, ${tier.color},rgba(204, 204, 204, 0.3))`,
        shadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
      }}
    >
      <div className={styles.silverEliteParent}>
        <div className={styles.silverElite}>{tier.name}</div>
        <div className={styles.stay10Nights}>
          {tier.minPoints} to {tier.maxPoints}
        </div>
      </div>
      {userTier !== tier.name && (
        <div className={styles.lockAltSvgrepoCom1Wrapper}>
          <div className={styles.lockAltSvgrepoCom1}>
            <img
              className={styles.svgrepoIconcarrier}
              alt=""
              src="/l3/svgrepo-iconcarrier.svg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

Position.propTypes = {
  className: PropTypes.string,
};

export default Position;
