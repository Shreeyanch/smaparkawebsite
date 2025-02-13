// import { useCallback } from "react";
// import Header from "../components/header";
// import LoyaltyHero from "../components/loyalty-hero";
// import LoyaltyWhy from "../components/loyalty-why";
// import LoyaltyReasons from "../components/loyalty-reasons";
// import With1 from "../components/with1";
// import With from "../components/with";
// import Footer from "../components/footer";
// import LoyaltyHeroo from "../components/loyalty-heroo";
// import  Whyloyalty from "../components/whyloyalty";
// import HowItWorks from "../components/how-it-works";



// import styles from "./smaparka-loyalty-solution.module.css";

// const SmaparkaLoyaltySolution = () => {
//   const onHomeTextClick = useCallback(() => {
//     const anchor = document.querySelector("[data-scroll-to='heroSection']");
//     if (anchor) {
//       anchor.scrollIntoView({ block: "start", behavior: "smooth" });
//     }
//   }, []);

//   return (
//     <div className={styles.smaparkaloyaltysolution}>
//       <img className={styles.frameIcon} alt="" src="/frame.svg" />
//       <Header onHomeTextClick={onHomeTextClick} />
//       <LoyaltyHero />
//       <LoyaltyHeroo/>
//       <Whyloyalty/>
//       <LoyaltyWhy />
//       <HowItWorks/>
//       <div className={styles.business1}>
//         <img className={styles.image2Icon} alt="" src="/image-22@2x.png" />
//         <div className={styles.smartBusinessCardParent}>
//           <div className={styles.smartBusinessCard}>1.Smart Business Card</div>
//           <div className={styles.enableSeamlessExchange}>
//             Enable seamless exchange of contact information and interactive
//             content with a simple tap or scan, enhancing networking efficiency
//             with samparka smart business card.
//           </div>
//           <div className={styles.contactlessSvgrepoCom1}>
//             <div className={styles.layer2Parent}>
//               <img className={styles.layer2Icon} alt="" src="/layer-2@2x.png" />
//               <img className={styles.groupIcon} alt="" src="/group.svg" />
//             </div>
//             <div className={styles.nfcqrEnabled}>Nfc/Qr Enabled</div>
//           </div>
//           <div className={styles.contactlessSvgrepoCom1}>
//             <img
//               className={styles.designIdeasSvgrepoCom1Icon}
//               alt=""
//               src="/designideassvgrepocom-1.svg"
//             />
//             <div className={styles.nfcqrEnabled}>
//               Customizable Design/Landing Page
//             </div>
//           </div>
//           <div className={styles.frame} >
//             <div className={styles.orderNow}>Order Now</div>
//           </div>
//         </div>
//       </div>
//       <LoyaltyReasons />
//       <div className={styles.loyaltypricing}>
//         <div className={styles.discoverAHassleFree}>
//           Discover a hassle-free loyalty program that runs on its own.
//         </div>
//         <div className={styles.loyaltypricingframe}>
//           <With1 />
//           <With />
//         </div>
//       </div>
//       <div className={styles.loyaltypunchline}>
//         <div className={styles.discoverAHassleFree}>
//           We’re not just a loyalty platform, we are your growth partner.
//         </div>
//       </div>
//       <Footer lETTERLOGO1="/letter-logo-1@2x.png" propGap="100px" />
//     </div>
//   );
// };

// export default SmaparkaLoyaltySolution;


import { useCallback } from "react";
import Header from "../components/header";
import LoyaltyHero from "../components/loyalty-hero";
import LoyaltyWhy from "../components/loyalty-why";
import LoyaltyReasons from "../components/loyalty-reasons";
import With1 from "../components/with1";
import With from "../components/with";
import Footer from "../components/footer";
import LoyaltyHeroo from "../components/loyalty-heroo";
import Whyloyalty from "../components/whyloyalty";
import HowItWorks from "../components/how-it-works";
// import StoreDescription from "../components/StoreDescription";
// import Reservation from "../components/Reservation";
import BusinessSoftware from "../components/BusinessSoftware";

import styles from "./smaparka-loyalty-solution.module.css";
import DataSecurity from "../components/DataSecurity";

const SmaparkaLoyaltySolution = () => {
  const onHomeTextClick = useCallback(() => {
    const anchor = document.querySelector("[data-scroll-to='heroSection']");
    if (anchor) {
      anchor.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, []);

  return (
    <div className={styles.smaparkaloyaltysolution}>
      <img className={styles.frameIcon} alt="" src="/frame.svg" />
      <Header onHomeTextClick={onHomeTextClick} />
      <LoyaltyHero />
      <LoyaltyHeroo />
      {/* <Reservation/> */}
      <Whyloyalty />

      <BusinessSoftware/>
      
      <DataSecurity/>

      {/* <StoreDescription/> */}
      {/* <LoyaltyWhy /> */}
      {/* <HowItWorks /> */}
      {/* <DataSecurity/> */}
      


      {/* <LoyaltyReasons /> */}
      <div className={styles.loyaltypricing}>
        <div className={styles.discoverAHassleFree}>
          Discover a hassle-free loyalty program that runs on its own.
        </div>
        <div className={styles.loyaltypricingframe}>
          <With1 />
          <With />
        </div>
      </div>
      <div className={styles.loyaltypunchline}>
        <div className={styles.discoverAHassleFree}>
          We’re not just a loyalty platform, we are your growth partner.
        </div>
      </div>
      <Footer lETTERLOGO1="/letter-logo-1@2x.png" propGap="100px" />
    </div>
  );
};

export default SmaparkaLoyaltySolution;
