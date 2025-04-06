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

const threadsntrends = ({ className = "" }) => {
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
            ThreadsNTrends: Where Sneaker Culture Finds Its Sole
            </b>
            <div className={styles.elevateCustomerLoyalty}>
            Sneaker culture isn’t just about fashion—it’s a lifestyle, a movement, a form of self-expression. In Nepal, however, getting access to authentic sneakers has long been a challenge. That’s where ThreadsNTrends steps in.

Born out of a passion for genuine, high-quality sneakers and a desire to make them accessible to everyone, ThreadsNTrends bridges the gap between exclusivity and affordability. Our mission? To bring the global sneaker movement closer to home—right here in Nepal.            </div>
          </div>
          <div className={styles.articleAuthorWrapper}>
            <div className={styles.articleAuthor}>
              <img className={styles.avatarIcon} alt="" src="/saman.jpg" />
              <div className={styles.authorText}>
                <div className={styles.piccoloAuthor}>Saman Lama</div>
                <div className={styles.postedOnJun}>Posted on Apr 6, 2025</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Image */}
      <div className={styles.image33Parent}>
        <img className={styles.image33Icon} alt="" src="/threadsntrendsbanner.png" />
        <div className={styles.reviews} />
      </div>
      
      <div className={styles.frameChild} />

      {/* Article Content */}
      <div className={styles.frameParent1}>
        <div className={styles.frameParent2}>
          {/* Introduction Section */}
          <div className={styles.introductionParent}>
            <b className={styles.introduction}>From Australia to Nepal: The Journey

            </b>
            <div className={styles.inNepalsCompetitive}>
                ThreadsNTrends started in Australia, curating exclusive sneakers for a growing community of enthusiasts. As demand rose in Nepal, we noticed a major gap—plenty of interest, but limited access to verified sneakers.

So, we brought our passion back home.

In January 2025, we opened our first store in Nepal, committed to serving a new generation of sneaker lovers with authenticity, affordability, and style. Since day one, we've focused on educating customers, building trust, and growing a community that shares our love for the culture.


            </div>
          </div>

          {/* The Heart of Piccolo's Mission Section */}
          <div className={styles.whatIsDigitalLoyaltySolutiParent} data-scroll-to="frameContainer4">
            <b className={styles.whatIsDigital}>Our Mission: Built on Sole
            </b>
            <div className={styles.digitalLoyaltySolution}>
            <ul>
                <li>🔒 Authenticity First
                Every sneaker we sell is 100% verified and sourced directly from trusted brands. No fakes. No compromises.</li>
                <li>💸 Affordable for All
                From the latest hype drops to daily essentials, we believe everyone deserves access to premium sneakers—without the premium markup.</li>
                <li>👟 Culture & Community
                We're not just selling shoes—we're building a movement. A place for sneakerheads to connect, share stories, and celebrate the culture together.</li>
              </ul>
              </div>
          </div>

          {/* Piccolo Loyalty App Section */}



          {/* A Gathering Place for All Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>Challenging the Stigma: What Makes Us Different

            </b>
            <div className={styles.digitalLoyaltySolution}>

            <ul>
                <li>✅ Authentic Always Every pair is legit—verified, sourced, and trusted. </li>
                <li>🎯 Diverse Selection From iconic retros to today’s heat, we've got something for every taste and style. </li>
                <li>💰 Best Prices, No Cap Premium quality, fair pricing. No middlemen. No hype tax.</li>
                <li>🤝 Passionate Community We’re more than a store—we’re a hub for sneakerheads across Nepal.</li>

              </ul>
            
            </div>
            <div className={styles.anchorFrame7699} data-scroll-to="frameContainer2" />
          </div>

          {/* The Piccolo Experience Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>
            The Future: Nepal's Sneaker Scene Starts Here

            </b>
            <div className={styles.digitalLoyaltySolution}>
ThreadsNTrends is just getting started.

We’re planning exclusive sneaker drops, hosting culture-forward events, and collaborating with both local and global brands to put Nepal on the sneaker map. Our vision is bold: make Nepal a recognized hotspot for sneaker culture in South Asia.            </div>
            <div className={styles.anchorFrame7699} data-scroll-to="frameContainer1" />
          </div>

          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>ThreadsNTrends Loyalty App</b>
            <div className={styles.digitalLoyaltySolution}>
  <p>
  Introducing <a href="https://threadsandtrendsnepal.samparka.co/" target="_blank" rel="noopener noreferrer " style={{ color: 'inherit' }}
      onMouseOver={(e) => e.target.style.color = '#d63384'}
      onMouseOut={(e) => e.target.style.color = 'inherit'}>
    ThreadsNTrends Loyalty App</a> your all-in-one sneaker hub.

    <ul>
        <li>📲 Shop Seamlessly: Browse our entire collection, from hype drops to timeless classics, and buy directly with a few taps.</li>
        <li>🎁 Earn Loyalty Points: Get points with every purchase and redeem them for discounts, early access to drops, or exclusive merch.</li>
        <li>🧑‍🤝‍🧑 Join the Community: Connect with fellow sneakerheads, share your favorite fits, and join local events.</li>
        <li>🔥 Stay in the Loop: Get instant notifications about new arrivals, restocks, and sneaker events.

</li>

        </ul>
  </p>
</div>




          </div>

          <div className={styles.image33Parent}>
        <img className={styles.image33Icon} alt="" src="/tandtloyaltybanner.png" />
        <div className={styles.reviews} />
      </div>

          {/* Conclusion Section */}
          <div className={styles.whatIsDigitalLoyaltySolutiParent}>
            <b className={styles.introduction}>Conclusion
            </b>
            <div className={styles.digitalLoyaltySolution}>
            Sneakers are more than just shoes—they're statements of identity, creativity, and culture. At ThreadsNTrends, we’re here to deliver the real deal: authentic sneakers, accessible pricing, and a community that lives and breathes sneaker culture.

Whether you're a collector, a streetwear junkie, or just someone who appreciates a clean pair of kicks—we’ve got you.

Step into the culture. Join the movement.
Stay tuned for the latest drops, events, and trends—only at ThreadsNTrends.           </div>
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
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3533.34795146438!2d85.31270237625762!3d27.675638726887822!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1936285e704b%3A0xdb45f0c80b12ec8f!2sThreads%20N%20Trends!5e0!3m2!1sen!2snp!4v1743929396685!5m2!1sen!2snp"
    allowFullScreen=""
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
  ></iframe>
</div>

    </div>

            
  );
};

threadsntrends.propTypes = {
  className: PropTypes.string,
};

export default threadsntrends;

