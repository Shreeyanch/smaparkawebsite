// import { useCallback } from "react";
// import PropTypes from "prop-types";
// import styles from "./tsubaki.module.css";
// import { useRouter } from "next/router";

// const LoyaltyComponent = ({ className = "" }) => {
//   const router = useRouter();

//   const onCheckOutTsubakiClick = useCallback(() => {
//     router.push("/tsubaki-salon-community");
//   }, [router]);

//   const onGroupButtonClick = useCallback(() => {
//     window.open("https://wa.me/9779766387030");
//   }, []);

//   const onGroupButtonClick1 = useCallback(() => {
//     window.open("https://www.facebook.com/tsubakisalon/");
//   }, []);

//   const onGroupButtonClick2 = useCallback(() => {
//     window.open("https://www.instagram.com/tsubakisalon/");
//   }, []);

//   return (
//     <div className={[styles.frameParent, className].join(" ")}>
//       {/* Article Header */}
//       <div className={styles.frameWrapper}>
//         <div className={styles.frameGroup}>
//           <div className={styles.frameContainer}>
//             <div className={styles.frameDiv}>
//               <div className={styles.minReadWrapper}>
//                 <div className={styles.minRead}>5 min read</div>
//               </div>
//             </div>
//             <b className={styles.enhanceCustomerLoyalty}>
//               Tsubaki: Transforming Beauty into Power
//             </b>
//             <div className={styles.elevateCustomerLoyalty}>
//               At Tsubaki Salon, beauty goes beyond appearance; it’s about transforming how you feel. Every treatment is designed to empower our clients, making them feel confident and radiant.
//             </div>
//           </div>
//           <div className={styles.articleAuthorWrapper}>
//             <div className={styles.articleAuthor}>
//               <img className={styles.avatarIcon} alt="" src="/avatar@2x.png" />
//               <div className={styles.authorText}>
//                 <div className={styles.tsubakiAuthor}>Shreeyanch Shrestha</div>
//                 <div className={styles.postedOnMar}>Posted on Mar 26, 2025</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Banner Image */}
//       <div className={styles.image33Parent}>
//         <img className={styles.image33Icon} alt="" src="/tsubaki_banner.png" />
//         <div className={styles.reviews} />
//       </div>
      
//       <div className={styles.frameChild} />

//       {/* Article Content */}
//       <div className={styles.frameParent1}>
//         <div className={styles.frameParent2}>
//           {/* Introduction Section */}
//           <div className={styles.introductionParent}>
//             <b className={styles.introduction}>Introduction</b>
//             <div className={styles.inNepalsCompetitive}>
//               In a world that often demands perfection, Tsubaki Salon stands as a beacon of personalized beauty services. More than just a salon, Tsubaki is a space where we bring out the true essence of beauty, making every client feel seen and valued.
//             </div>
//           </div>

//           {/* The Heart of Tsubaki's Mission Section */}
//           <div className={styles.whyUpgradeParent}>
//             <b className={styles.introduction}>The Heart of Tsubaki's Mission</b>
//             <div className={styles.digitalLoyaltySolution}>
//               At Tsubaki, we are committed to providing more than just a haircut or a facial. We offer a rejuvenating experience that uplifts both the body and the spirit. Our mission is simple:
//               <ul>
//                 <li>To deliver beauty treatments that enhance natural features</li>
//                 <li>To create a relaxing environment for personal transformation</li>
//               </ul>
//               Every service we provide is a step toward helping you embrace your inner strength and beauty.
//             </div>
//           </div>

//           {/* Tsubaki Loyalty App Section */}
//           <div className={styles.whyUpgradeParent}>
//             <b className={styles.introduction}>Tsubaki Loyalty Program: Strengthening Connections</b>
//             <div className={styles.digitalLoyaltySolution}>
//               One of the standout features of Tsubaki Salon is our **Loyalty Program**. Designed to reward our most devoted clients, the program offers:
//               <ul>
//                 <li>Exclusive discounts for frequent visitors</li>
//                 <li>Special promotions to keep your beauty routine fresh</li>
//                 <li>Early access to new services and treatments</li>
//               </ul>
//               This loyalty program is designed to make every visit more rewarding, offering a personalized experience every time you step into Tsubaki.
//             </div>
//           </div>

//           {/* Why Tsubaki is Different Section */}
//           <div className={styles.whyUpgradeParent}>
//             <b className={styles.whyUpgrade}>Why Tsubaki is Different</b>
//             <div className={styles.digitalLoyaltySolution}>
//               Tsubaki isn't just another beauty salon; it's a place where creativity meets skill. We stand out by offering:
//               <ul>
//                 <li>Custom beauty treatments tailored to each individual</li>
//                 <li>Exceptional customer service that makes you feel like family</li>
//               </ul>
//               These elements ensure Tsubaki's unique place in Nepal's beauty industry.
//             </div>
//           </div>

//           {/* A Gathering Place for All Section */}
//           <div className={styles.whyUpgradeParent}>
//             <b className={styles.introduction}>A Gathering Place for All</b>
//             <div className={styles.digitalLoyaltySolution}>
//               More than just a beauty destination, Tsubaki is a place for connection. It’s where clients come not only for beauty treatments but to relax, rejuvenate, and connect with others who value self-care.
//             </div>
//           </div>

//           {/* The Tsubaki Experience Section */}
//           <div className={styles.whyUpgradeParent}>
//             <b className={styles.introduction}>
//               The Tsubaki Experience: Beauty and Empowerment
//             </b>
//             <div className={styles.digitalLoyaltySolution}>
//               A visit to Tsubaki is an immersive experience. Whether it's a soothing facial or a transformative hair treatment, we aim to make you feel empowered, confident, and beautiful in your own skin.
//             </div>
//           </div>

//           {/* Conclusion Section */}
//           <div className={styles.whatIsBeautySalonParent}>
//             <b className={styles.introduction}>Conclusion</b>
//             <div className={styles.digitalLoyaltySolution}>
//               In conclusion, Tsubaki is more than a beauty salon; it's a sanctuary where beauty is celebrated, where every individual is made to feel special, and where personal transformation is at the heart of what we do.
//             </div>
//           </div>

//           {/* Social Buttons */}
//         </div>

//         <div className={styles.groupParent}>
//           <button className={styles.ellipseParent} onClick={onGroupButtonClick}>
//             <div className={styles.groupChild} />
//             <img className={styles.whatsappSvgrepoCom1Icon} alt="" src="/whatsappsvgrepocom-1.svg" />
//           </button>
//           <button className={styles.ellipseParent} onClick={onGroupButtonClick1}>
//             <div className={styles.groupChild} />
//             <img className={styles.vectorIcon} alt="" src="/FacebookVector.png" />
//           </button>
//           <button className={styles.ellipseParent} onClick={onGroupButtonClick2}>
//             <div className={styles.groupChild} />
//             <img className={styles.groupIcon} alt="" src="/group-7560.svg" />
//           </button>
//         </div>
//       </div>

//       {/* Tsubaki Location Iframe */}
//       <div className={styles.locationContainer}>
//         <iframe
//           src="https://www.google.com/maps/embed?pb=YOUR_LOCATION_URL"
//           allowFullScreen=""
//           loading="lazy"
//           referrerPolicy="no-referrer-when-downgrade"
//         ></iframe>
//       </div>
//     </div>
//   );
// };

// LoyaltyComponent.propTypes = {
//   className: PropTypes.string,
// };

// export default LoyaltyComponent;


import { useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./piccolo.module.css";
import { useRouter } from "next/router";

const LoyaltyComponent = ({ className = "" }) => {
  const router = useRouter();

  const onCheckOutSmaparkasClick = useCallback(() => {
    router.push("/piccolo-coffee-community");
  }, [router]);

  const onGroupButtonClick = useCallback(() => {
    window.open("https://wa.me/9779766387030");
  }, []);

  const onGroupButtonClick1 = useCallback(() => {
    window.open("https://www.facebook.com/people/Samparka-Business-Card/61556638293745/");
  }, []);

  const onGroupButtonClick2 = useCallback(() => {
    window.open("https://www.instagram.com/samparka.nep/");
  }, []);

  return (
    <div className={[styles.frameParent, className].join(" ")}>
      {/* Article Header */}
      <div className={styles.frameWrapper}>
        <div className={styles.frameGroup}>
          <div className={styles.frameContainer}>
            <div className={styles.frameDiv}>
              <div className={styles.minReadWrapper}>
                <div className={styles.minRead}>5 min read</div>
              </div>
            </div>
            <b className={styles.enhanceCustomerLoyalty}>
            Tsubaki: Empowering Beauty, Elevating Confidence
            </b>
            <div className={styles.elevateCustomerLoyalty}>
            At Tsubaki Salon, beauty goes beyond appearance; it’s about transforming how you feel. Every treatment is designed to empower our clients, making them feel confident and radiant.
            </div>
          </div>
          <div className={styles.articleAuthorWrapper}>
            <div className={styles.articleAuthor}>
              <img className={styles.avatarIcon} alt="" src="/sampada.jpg" />
              <div className={styles.authorText}>
                <div className={styles.piccoloAuthor}>Sampada Basnet</div>
                <div className={styles.postedOnJun}>Posted on Mar 29, 2025</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Image */}
      <div className={styles.image33Parent}>
        <img className={styles.image33Icon} alt="" src="/TsubakiBanner.png" />
        <div className={styles.reviews} />
      </div>
      
      <div className={styles.frameChild} />

      {/* Article Content */}
      <div className={styles.frameParent1}>
        <div className={styles.frameParent2}>
          {/* Introduction Section */}
          <div className={styles.introductionParent}>
            <b className={styles.introduction}>Introduction</b>
            <div className={styles.inNepalsCompetitive}>
            Beauty transcends superficial appearances; it embodies confidence, self-care, and empowerment. In Nepal, salons have emerged as pivotal establishments that can drive significant social change by providing more than aesthetic services. They serve as platforms for skill development, financial growth, and the redefinition of societal norms, particularly regarding women's roles.            <div className={styles.anchorFrame7699} data-scroll-to="frameContainer5" />
            </div>
          </div>

          {/* The Heart of Piccolo's Mission Section */}
          <div className={styles.whatIsDigitalLoyaltySolutiParent} data-scroll-to="frameContainer4">
            <b className={styles.whatIsDigital}>The Heart of Tsubaki's Mission</b>
            <div className={styles.digitalLoyaltySolution}>
            At Tsubaki, we are committed to providing more than just a haircut or a facial. We offer a rejuvenating experience that uplifts both the body and the spirit. Our mission is simple:
            <ul>
                <li>To deliver beauty treatments that enhance natural features</li>
                <li>To create a relaxing environment for personal transformation</li>
              </ul>
              These elements ensure Tsubaki's unique place in Nepal's beauty industry.
              </div>
          </div>

          {/* Piccolo Loyalty App Section */}


          {/* Why Piccolo is Different Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.whyUpgrade}>Women Entrepreneurship
            </b>
            <div className={styles.digitalLoyaltySolution}>
            The emergence of women-owned beauty businesses in Nepal is transforming traditional gender roles. Women who previously faced limited career options are now stepping into roles as salon owners, beauticians, and trainers, reshaping societal expectations. This evolution is rooted not just in beauty but in the pursuit of financial independence and self-reliance.

To support these transformations, many salons offer free or affordable training for underprivileged women, helping them break the cycle of economic hardship. Training covers essential skills like haircutting and advanced skincare techniques, ensuring that these women can secure stable incomes. This surge in female entrepreneurship cultivates a supportive network where women empower each other. Experienced salon owners often mentor trainees, sharing wisdom and guidance that helps build confidence and professional acumen.
            </div>
            <div className={styles.anchorFrame7699} data-scroll-to="frameContainer3" />
          </div>

          {/* A Gathering Place for All Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>Challenging Beauty Standards
            </b>
            <div className={styles.digitalLoyaltySolution}>
            Historically, the beauty industry in Nepal has propagated unrealistic standards, promoting narrow ideas of beauty. However, a growing movement advocates for a more inclusive and diverse understanding of beauty. Some salons are shifting their focus from altering appearances to celebrating natural beauty, encouraging women to embrace their authentic selves. This shift fosters confidence and challenges outdated norms, promoting the idea that healthy skin lessens the need for heavy makeup.            </div>
            <div className={styles.anchorFrame7699} data-scroll-to="frameContainer2" />
          </div>

          {/* The Piccolo Experience Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>
            More Than Just Makeovers
            </b>
            <div className={styles.digitalLoyaltySolution}>
            A visit to Tsubaki is an immersive experience. Whether it's a soothing facial or a transformative hair treatment, we aim to make you feel empowered, confident, and beautiful in your own skin.
            </div>
            <div className={styles.anchorFrame7699} data-scroll-to="frameContainer1" />
          </div>

          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>Tsubaki Loyalty App: Strengthening Connections</b>
            <div className={styles.digitalLoyaltySolution}>
  <p>
    The <a href="https://tsubakibeautysaloon.samparka.co/" target="_blank" rel="noopener noreferrer " style={{ color: 'inherit' }}
      onMouseOver={(e) => e.target.style.color = '#d63384'}
      onMouseOut={(e) => e.target.style.color = 'inherit'}>
    Tsubaki Loyalty App</a> has transformed how Tsubaki stays connected with its valued customers, creating a seamless bridge between beauty and convenience. By offering an intuitive and rewarding experience, the app ensures that every visit is more than just a service—it’s a step toward empowerment. Customers can easily track their rewards, book appointments, and stay updated on exclusive offers, making their beauty journey effortless and personalized. More than just a loyalty program, Tsubaki's digital platform strengthens relationships, enhances customer engagement, and reinforces a sense of community, ensuring that beauty is not only experienced but also rewarded.
  </p>
</div>


          </div>

          {/* Conclusion Section */}
          <div className={styles.whatIsDigitalLoyaltySolutiParent}>
            <b className={styles.introduction}>Conclusion</b>
            <div className={styles.digitalLoyaltySolution}>
            Salons in Nepal are transforming into spaces for empowerment, skill-building, and self-love. By prioritizing financial independence, inclusivity, and holistic self-care, they help women dismantle barriers and redefine beauty on their own terms.

As Nepal's beauty industry continues to evolve, the future promises to bring significant change—are you ready to embrace it?            </div>
            <div className={styles.anchorFrame7699} data-scroll-to="frameContainer" />
          </div>

          {/* Call to Action */}
          {/* <div className={styles.checkOutSmaparkasLoyaltyRWrapper}>
            <div className={styles.checkOutSmaparkasContainer} onClick={onCheckOutSmaparkasClick}>
              {`Check out `}
              <span className={styles.smaparkasLoyaltyReward}>
                Piccolo: Where Coffee Meets Community
              </span>
            </div>
          </div> */}

          {/* Keywords / Footer of Article Content */}
          {/* <div className={styles.rectangleParent}>
            <img className={styles.frameItem} alt="" src="/piccoloLoyaltyImage.png" />
            <div className={styles.whyUpgrade}>
              Keywords: coffee shop Nepal, community coffee space, creative coffee culture, ethical coffee sourcing, coffee for creatives, community gathering place, artisan coffee shop, best coffee in Nepal, Piccolo coffee shop, coffee and community, unique coffee experience Nepal, coffee lovers community, local coffee shops, coffee culture in Nepal
            </div>
          </div> */}
        </div>

        {/* Social Buttons */}
        <div className={styles.groupParent}>
          <button className={styles.ellipseParent} onClick={onGroupButtonClick}>
            <div className={styles.groupChild} />
            <img className={styles.whatsappSvgrepoCom1Icon} alt="" src="/whatsappsvgrepocom-1.svg" />
          </button>
          <button className={styles.ellipseParent} onClick={onGroupButtonClick1}>
            <div className={styles.groupChild} />
            <img className={styles.vectorIcon} alt="" src="/FacebookVector.png" />
          </button>
          <button className={styles.ellipseParent} onClick={onGroupButtonClick2}>
            <div className={styles.groupChild} />
            <img className={styles.groupIcon} alt="" src="/group-7560.svg" />
          </button>
        </div>
      </div>

      {/* Piccolo Location Iframe */}
      <div className={styles.locationContainer}>
  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.217107235492!2d85.31472527625841!3d27.710582225347384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb190161557a45%3A0x67cfe9b78555b3c!2sTsubaki%20Beauty%20Saloon!5e0!3m2!1sen!2sin!4v1743236244663!5m2!1sen!2sin"
    allowFullScreen=""
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
  ></iframe>
</div>

    </div>

            
  );
};

LoyaltyComponent.propTypes = {
  className: PropTypes.string,
};

export default LoyaltyComponent;

