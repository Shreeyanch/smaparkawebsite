import { useState, useCallback } from "react";
import { Menu, MenuItem, Button } from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";
import MobileNavbaR from "./mobile-navba-r";
import PortalPopup from "./portal-popup";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import styles from "./header.module.css";
import { IconButton } from "@mui/material";


const Header = ({ className = "", onClose, onHomeTextClick }) => {
  const [isMobileNavbaRPopupOpen, setMobileNavbaRPopupOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const router = useRouter();

  const openMobileNavbaRPopup = useCallback(() => {
    setMobileNavbaRPopupOpen(true);
  }, []);

  const closeMobileNavbaRPopup = useCallback(() => {
    setMobileNavbaRPopupOpen(false);
  }, []);

  const onHomeClick = useCallback(() => {
    router.push("/");
  }, [router]);

  const onBlogClick = useCallback(() => {
    router.push("/blog");
  }, [router]);


  const onProductClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleProductNavigation = useCallback((path) => {
    router.push(path);
    handleMenuClose();
  }, [router, handleMenuClose]);

  const onAboutusClick = useCallback(() => {
    router.push("/get-in-touch");
  }, [router]);

  const onHomeTextClick1 = useCallback(() => {
    const anchor = document.querySelector("[data-scroll-to='heroSection']");
    if (anchor) {
      anchor.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, []);

  const onAboutUsTextClick = useCallback(() => {
    const anchor = document.querySelector("[data-scroll-to='footer']");
    if (anchor) {
      anchor.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, []);

  return (
    <>
      <div className={[styles.navbar, className].join(" ")}>
        <div className={styles.nav}>
          <img
          onClick={onHomeClick}
            className={styles.letterLogo1}
            alt=""
            src="/letter-logo-1@2x.png"
          />
          <div className={styles.menuright}>
            <div className={styles.menulinks}>
              <button
                className={styles.home}
                data-scroll-to="home"
                onClick={onHomeClick}
              >
                HOME
              </button>
              <Button
                className={styles.home}
                data-scroll-to="product"
                onClick={onProductClick}
              >
                PRODUCTS

                
              </Button>
              {/* <IconButton
      
      sx={{
        // backgroundColor: 'rgba(255, 255, 255, 0.8)',
        color:'rgba(255, 255, 255, 0.8)',
        height: '1px',
        width: '5px'
        
      }}
    >
      <ArrowDropDown />
    </IconButton> */}
             <button className={styles.home} onClick={onBlogClick}>
                BLOG
              </button>
              
              <button className={styles.home} onClick={onAboutusClick}>
                CONTACT US
              </button>
              <div className={styles.navbar20}>
                <div className={styles.iconPack}>
                  <img className={styles.vectorIcon} alt="" src="/vector.svg" />
                </div>
                <div className={styles.logoWrapper}>
                  <div className={styles.logo}>
                    <img
                      className={styles.letterLogo11}
                      alt=""
                      src="/letter-logo-1@2x.png"
                    />
                  </div>
                </div>
                <div className={styles.menu}>
                  <div className={styles.homeParent}>
                    <div className={styles.aboutUs} onClick={onHomeTextClick}>
                      Home
                    </div>
                    <button className={styles.product1}>Product</button>
                    <div
                      className={styles.aboutUs}
                      onClick={onAboutUsTextClick}
                    >
                      Tutorials
                    </div>
                    <div
                      className={styles.aboutUs}
                      onClick={onAboutUsTextClick}
                    >
                      Contact us
                    </div>
                    <div className={styles.signIn}>Sign in</div>
                  </div>
                </div>
              </div>
            </div>
            <button
              className={styles.hamburgerIcon}
              onClick={openMobileNavbaRPopup}
            >
              <img className={styles.group2Icon} alt="" src="/group2.svg" />
            </button>
          </div>
        </div>
      </div>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: 'rgba(120, 120, 120, 0.2)', // Green background color
          }
        }}
      >
        <MenuItem 
          onClick={() => handleProductNavigation('/smart-business-card')}
          sx={{ fontSize: '13px', fontWeight: '300', color: '#d7d7d7' }}
        >
          Smart Business Card
        </MenuItem>
        <MenuItem 
          onClick={() => handleProductNavigation('/smart-review-stand')}
          sx={{ fontSize: '13px', fontWeight: '300', color: '#d7d7d7'  }}
        >
          Smart Review Stand
        </MenuItem>
        <MenuItem 
          onClick={() => handleProductNavigation('/smaparka-loyalty-solution')}
          sx={{ fontSize: '13px', fontWeight: '300', color: '#d7d7d7'  }}
        >
          Digital Loyalty Solution
        </MenuItem>
      </Menu>
      {isMobileNavbaRPopupOpen && (
        <PortalPopup
          overlayColor="rgba(113, 113, 113, 0.3)"
          placement="Centered"
          onOutsideClick={closeMobileNavbaRPopup}
        >
          <MobileNavbaR onClose={closeMobileNavbaRPopup} />
        </PortalPopup>
      )}
    </>
  );
};

Header.propTypes = {
  className: PropTypes.string,
  onClose: PropTypes.func,
  onHomeTextClick: PropTypes.func,
};

export default Header;
