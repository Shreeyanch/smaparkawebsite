import PropTypes from "prop-types";
import styles from "./product-video.module.css";

const ProductVideo = ({ className = "" }) => {
  return (
    <section className={[styles.productvideo, className].join(" ")}>
      <div className={styles.tutorialimages}>
        <div className={styles.tutorialimagegroup}>
          <div className={styles.tutorial3}>
            <div className={styles.vectorParent}>
              <img
                className={styles.groupChild}
                alt=""
                src="/rectangle-14.svg"
              />
              <iframe
                className={styles.image9}
                src={`https://www.youtube.com/embed/aa2Eoc5fOjk?rel=0&controls=0`}
                frameBorder="0"
                allowFullScreen
              />
            </div>
            <div className={styles.loyaltyProgram}>Loyalty Program</div>
          </div>
          <div className={styles.tutorial2}>
            <div className={styles.vectorParent}>
              <img
                className={styles.groupChild}
                alt=""
                src="/rectangle-14.svg"
              />
              <iframe
                className={styles.image11}
                src={`https://www.youtube.com/embed/6YEv8VbALkI?rel=0&controls=0`}
                frameBorder="0"
                allowFullScreen
              />
            </div>
            <div className={styles.loyaltyProgram}>
              Google/Tripadvisor Stand
            </div>
          </div>
          <div className={styles.tutorial1}>
            <div className={styles.vectorContainer}>
              <img
                className={styles.groupChild}
                alt=""
                src="/rectangle-12.svg"
              />
              <iframe
                className={styles.image10}
                src={`https://www.youtube.com/embed/FG78By_yEJc?rel=0&controls=0`}
                frameBorder="0"
                allowFullScreen
              />
            </div>
            <div className={styles.businessCard}>Business Card</div>
          </div>
        </div>
        <div className={styles.tutorialtablet}>
          <div className={styles.tutorial31}>
            <div className={styles.groupDiv}>
              <img
                className={styles.groupChild}
                alt=""
                src="/rectangle-13.svg"
              />
              <iframe
                className={styles.image111}
                src={`https://www.youtube.com/embed/aa2Eoc5fOjk?rel=0&controls=0`}
                frameBorder="0"
                allowFullScreen
              />
            </div>
            <div className={styles.loyaltyProgram1}>Loyalty Program</div>
          </div>
          <div className={styles.tutorial21}>
            <div className={styles.vectorParent1}>
              <img
                className={styles.groupChild}
                alt=""
                src="/rectangle-121.svg"
              />
              <iframe
                className={styles.image101}
                src={`https://www.youtube.com/embed/6YEv8VbALkI?rel=0&controls=0`}
                frameBorder="0"
                allowFullScreen
              />
            </div>
            <div className={styles.googleTripadvisor}>
              Google / Tripadvisor Stand
            </div>
          </div>
          <div className={styles.tutorial11}>
            <div className={styles.vectorParent2}>
              <img
                className={styles.groupChild}
                alt=""
                src="/rectangle-13.svg"
              />
              <iframe
                className={styles.image91}
                src={`https://www.youtube.com/embed/FG78By_yEJc?rel=0&controls=0`}
                frameBorder="0"
                allowFullScreen
              />
            </div>
            <div className={styles.businessCard1}>Business Card</div>
          </div>
        </div>
      </div>
    </section>
  );
};

ProductVideo.propTypes = {
  className: PropTypes.string,
};

export default ProductVideo;
