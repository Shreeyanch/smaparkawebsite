import { useCallback } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import styles from "./products.module.css";

const Products = ({ className = "" }) => {
  const router = useRouter();

  const onViewMoreClick = useCallback(() => {
    router.push("/smaparka-loyalty-solution");
  }, [router]);

  const onViewMoreClick1 = useCallback(() => {
    router.push("/smart-business-card");
  }, [router]);

  const onViewMoreClick2 = useCallback(() => {
    router.push("/smart-review-stand");
  }, [router]);

  return (
    <div
      className={[styles.products, className].join(" ")}
      data-scroll-to="products"
    >
      <div className={styles.productframe}>
        <div className={styles.productdetails}>
          <div className={styles.producttitle}>
            <div className={styles.ourLineOf}>Our line of products</div>
          </div>
          <div className={styles.productsubtitle}>
            <div className={styles.heresWhatWere}>
              Here’s what we’re building to help businesses deliver amazing
              customer experiences.
            </div>
          </div>
        </div>
        <div className={styles.productscards}>
          <div className={styles.column1}>
            <div className={styles.productcard1}>
              <div className={styles.cardimageParent}>
                <img
                  className={styles.cardimageIcon}
                  alt=""
                  src="/Rectangle9.png"
                />
                <div className={styles.text}>
                  <div className={styles.titles}>
                    <div className={styles.digitalLoyaltySolution}>
                      Digital Loyalty Solution
                    </div>
                    <button
                      className={styles.viewMore1}
                      onClick={onViewMoreClick}
                    >
                      View More
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.productcard2}>
              <img
                className={styles.cardimageIcon1}
                alt=""
                src="/Rectangle10.png"
              />
              <div className={styles.text1}>
                <div className={styles.titles}>
                  <div className={styles.smartBusinessCard}>
                    Smart Business Card
                  </div>
                  <button
                    className={styles.viewMore1}
                    onClick={onViewMoreClick1}
                  >
                    View More
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.productcard2}>
              <img
                className={styles.cardimageIcon1}
                alt=""
                src="/cardimage@2x.png"
              />
              <div className={styles.text1}>
                <div className={styles.titles}>
                  <div className={styles.smartBusinessCard}>
                    Smart Review Stand
                  </div>
                  <button
                    className={styles.viewMore1}
                    onClick={onViewMoreClick2}
                  >
                    View More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Products.propTypes = {
  className: PropTypes.string,
};

export default Products;
