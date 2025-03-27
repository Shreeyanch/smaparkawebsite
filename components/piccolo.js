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
              Piccolo: Where Coffee Meets Community
            </b>
            <div className={styles.elevateCustomerLoyalty}>
              In today’s fast-paced world, Piccolo is more than just a coffee shop—it is a vital community hub where ideas are exchanged and connections are made. Here, the art of coffee is seamlessly intertwined with the mission of fostering meaningful human interactions.
            </div>
          </div>
          <div className={styles.articleAuthorWrapper}>
            <div className={styles.articleAuthor}>
              <img className={styles.avatarIcon} alt="" src="/avatar@2x.png" />
              <div className={styles.authorText}>
                <div className={styles.piccoloAuthor}>Shreeyanch Shrestha</div>
                <div className={styles.postedOnJun}>Posted on Mar 26, 2025</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Image */}
      <div className={styles.image33Parent}>
        <img className={styles.image33Icon} alt="" src="/piccolo_banner.png" />
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
              As society evolves and the pace of daily life accelerates, the need for genuine human connection becomes ever more crucial. Piccolo has emerged as a sanctuary in which community, culture, and creativity come together, offering more than a mere cup of coffee. Here, every detail—from the ambience to the carefully crafted menu—serves as a reminder of the importance of nurturing personal and professional relationships.
              <div className={styles.anchorFrame7699} data-scroll-to="frameContainer5" />
            </div>
          </div>

          {/* The Heart of Piccolo's Mission Section */}
          <div className={styles.whatIsDigitalLoyaltySolutiParent} data-scroll-to="frameContainer4">
            <b className={styles.whatIsDigital}>The Heart of Piccolo's Mission</b>
            <div className={styles.digitalLoyaltySolution}>
              At its core, Piccolo is dedicated to creating an environment where quality and community converge. This is achieved through a commitment to:
              <ul>
                <li>Using the finest, ethically sourced beans</li>
                <li>Designing spaces that encourage thoughtful dialogue</li>
              </ul>
              This dual commitment to excellence and community underpins every aspect of Piccolo’s operations, highlighting its role as a modern cultural hub.
            </div>
          </div>

          {/* Piccolo Loyalty App Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>Piccolo Loyalty App: Strengthening Community Ties</b>
            <div className={styles.digitalLoyaltySolution}>
              One of the most impactful ways Piccolo enhances its community is through the **Piccolo Loyalty App**. By integrating loyalty rewards with the power of technology, the app provides customers with a seamless experience that goes beyond simply earning points for coffee purchases. The app fosters deeper community engagement by offering:
              <ul>
                <li>Exclusive rewards for loyal customers</li>
                <li>Notifications about upcoming events and promotions</li>
                <li>Access to special deals and discounts, promoting a sense of belonging within the Piccolo community</li>
              </ul>
              The Piccolo Loyalty App ensures that every visit to Piccolo feels personal, rewarding, and connected to the larger vision of nurturing relationships.
            </div>
          </div>

          {/* Why Piccolo is Different Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.whyUpgrade}>Why Piccolo is Different</b>
            <div className={styles.digitalLoyaltySolution}>
              Unlike conventional cafes, Piccolo challenges the status quo by integrating creativity with culinary expertise. Here, innovation is not just a buzzword—it is a practice evident in:
              <ul>
                <li>Unique brewing techniques that elevate traditional recipes</li>
                <li>A carefully curated environment designed to foster intellectual exchange</li>
              </ul>
              These elements reinforce Piccolo's distinct position in a market often dominated by transient experiences.
            </div>
            <div className={styles.anchorFrame7699} data-scroll-to="frameContainer3" />
          </div>

          {/* A Gathering Place for All Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>A Gathering Place for All</b>
            <div className={styles.digitalLoyaltySolution}>
              More than a venue for coffee, Piccolo stands as a platform for cultural exchange and social integration. It offers a space where people from diverse backgrounds can gather, share experiences, and engage in meaningful conversations that enrich the local community.
            </div>
            <div className={styles.anchorFrame7699} data-scroll-to="frameContainer2" />
          </div>

          {/* The Piccolo Experience Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>
              The Piccolo Experience: Coffee and Creativity
            </b>
            <div className={styles.digitalLoyaltySolution}>
              A visit to Piccolo is more than a routine outing—it is an immersive experience that challenges conventional perceptions of community spaces. Every cup of coffee is a carefully crafted work of art, and every conversation within its walls contributes to a larger dialogue about the future of communal spaces in our society.
            </div>
            <div className={styles.anchorFrame7699} data-scroll-to="frameContainer1" />
          </div>

          {/* Conclusion Section */}
          <div className={styles.whatIsDigitalLoyaltySolutiParent}>
            <b className={styles.introduction}>Conclusion</b>
            <div className={styles.digitalLoyaltySolution}>
              In closing, Piccolo is not simply a place to enjoy coffee—it is an institution that champions the importance of community, innovation, and cultural enrichment. As modern life grows more complex and often isolating, establishments like Piccolo remind us that real connection and thoughtful conversation remain indispensable to our well-being.
            </div>
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
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3531.511395620496!2d85.34241247625896!3d27.73236842438597!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb197ae757f4e9%3A0xa9cd4c2fc5ff2865!2sPiccolo%20Cafe%20by%20Caffeophilia%2C%20Dhumbarahi!5e0!3m2!1sen!2snp!4v1743044703514!5m2!1sen!2snp"
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
