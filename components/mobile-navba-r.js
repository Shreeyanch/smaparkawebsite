// import { useCallback } from "react";
// import { useRouter } from "next/router";
// import PropTypes from "prop-types";
// import styles from "./mobile-navba-r.module.css";

// const MobileNavbaR = ({ className = "", onClose }) => {
//   const router = useRouter();

//   const onHomeTextClick = useCallback(() => {
//     router.push("/");
//   }, [router]);

//   const onProductClick = useCallback(() => {
//     const anchor = document.querySelector("[data-scroll-to='products']");
//     if (anchor) {
//       anchor.scrollIntoView({ block: "start", behavior: "smooth" });
//     }
//   }, []);

//   const onContactUsTextClick = useCallback(() => {
//     router.push("/get-in-touch");
//   }, [router]);

//   return (
//     <div className={[styles.mobilenavbar, className].join(" ")}>
//       <div className={styles.iconPack}>
//         <img
//           className={styles.vectorIcon}
//           alt=""
//           src="/vector.svg"
//           onClick={onClose}
//         />
//       </div>
//       <div className={styles.mobilenavbarlogo}>
//         <div className={styles.logo}>
//           <img
//             className={styles.letterLogo1}
//             alt=""
//             src="/letter-logo-1@2x.png"
//           />
//         </div>
//       </div>
//       <div className={styles.menu}>
//         <div className={styles.homeParent}>
//           <div className={styles.home} onClick={onHomeTextClick}>
//             Home
//           </div>
//           <button className={styles.product} onClick={onProductClick}>
//             Product
//           </button>
//           <div className={styles.home} onClick={onContactUsTextClick}>
//             Contact us
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// MobileNavbaR.propTypes = {
//   className: PropTypes.string,
//   onClose: PropTypes.func,
// };

// export default MobileNavbaR;

import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import styles from "./mobile-navba-r.module.css";
import { IconButton } from "@mui/material";
import { ArrowDropDown, ArrowDropUp } from "@mui/icons-material";

const MobileNavbaR = ({ className = "", onClose }) => {
  const [isProductDropdownOpen, setProductDropdownOpen] = useState(false);
  const router = useRouter();

  const onHomeTextClick = useCallback(() => {
    router.push("/");
  }, [router]);

  const onBlogTextClick = useCallback(() => {
    router.push("/blog");
  }, [router]);

  const onProductClick = useCallback(() => {
    setProductDropdownOpen(!isProductDropdownOpen);
  }, [isProductDropdownOpen]);

  const handleProductNavigation = useCallback((path) => {
    router.push(path);
    setProductDropdownOpen(false);
  }, [router]);

  const onContactUsTextClick = useCallback(() => {
    router.push("/get-in-touch");
  }, [router]);

  return (
    <div className={[styles.mobilenavbar, className].join(" ")}>
      <div className={styles.iconPack}>
        <img
          className={styles.vectorIcon}
          alt=""
          src="/vector.svg"
          onClick={onClose}
        />
      </div>
      {/* <div className={styles.mobilenavbarlogo}>
        <div className={styles.logo}>
          <img
            className={styles.letterLogo1}
            alt=""
            src="/letter-logo-1@2x.png"
          />
        </div>
      </div> */}
      <div className={styles.menu}>
        <div className={styles.homeParent}>
          <div className={styles.home} onClick={onHomeTextClick}>
            Home
          </div>
          <div className={styles.home} onClick={onBlogTextClick}>
            Blog
          </div>
          <button className={styles.product} onClick={onProductClick}>
            Products
            <IconButton
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                padding: 0,
                marginLeft: '3px'
              }}
            >
              {isProductDropdownOpen ? <ArrowDropUp /> : <ArrowDropDown />}
            </IconButton>
          </button>
          {isProductDropdownOpen && (
            <div className={styles.productDropdown}>
              <div
                className={styles.productDropdownItem}
                onClick={() => handleProductNavigation('/smart-business-card')}
              >
                Smart Business Card
              </div>
              <div
                className={styles.productDropdownItem}
                onClick={() => handleProductNavigation('/smart-review-stand')}
              >
                Smart Review Stand
              </div>
              <div
                className={styles.productDropdownItem}
                onClick={() => handleProductNavigation('/smaparka-loyalty-solution')}
              >
                Digital Loyalty Solution
              </div>
            </div>
          )}
          <div className={styles.home} onClick={onContactUsTextClick}>
            Contact us
          </div>
        </div>
      </div>
    </div>
  );
};

MobileNavbaR.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
};

export default MobileNavbaR;
