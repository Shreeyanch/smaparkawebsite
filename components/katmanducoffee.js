import { useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./loyaltySamparka.module.css";
import { useRouter } from "next/router";

const katmandu = ({ className = "" }) => {
  const router = useRouter();

  const onCheckOutSmaparkasClick = useCallback(() => {
    router.push("/piccolo-coffee-community");
  }, [router]);

  const onGroupButtonClick = useCallback(() => {
    window.open("https://wa.me/9779766387030");
  }, []);

  const onGroupButtonClick1 = useCallback(() => {
    window.open(
      "https://www.facebook.com/people/Samparka-Business-Card/61556638293745/"
    );
  }, []);

  const onGroupButtonClick2 = useCallback(() => {
    window.open("https://www.instagram.com/samparka.loyalty/");
  }, []);

  return (
    <div className={[styles.frameParent, className].join(" ")}>
      {/* Article Header */}
      <div className={styles.frameWrapper}>
        <div className={styles.frameGroup}>
          <div className={styles.frameContainer}>
            <div className={styles.frameDiv}>
              <div className={styles.minReadWrapper}>
                <div className={styles.minRead}>6 min read</div>
              </div>
            </div>
            <b className={styles.enhanceCustomerLoyalty}>
              Katmandu Coffee: Redefining Nepal’s Coffee Standard
            </b>
            <div className={styles.elevateCustomerLoyalty}>
              Coffee in Nepal has evolved. What was once a tea-first country now has 
              a booming café culture, with consumption rising from the streets of Kathmandu 
              to global shelves. Yet, among all the noise of “specialty” claims and shiny café
              openings, one brand has been quietly but firmly setting the benchmark: <br/>Katmandu Coffee.
            </div>
          </div>
          <div className={styles.articleAuthorWrapper}>
            <div className={styles.articleAuthor}>
              <img className={styles.avatarIcon} alt="" src="/sweta.jpg" />
              <div className={styles.authorText}>
                <div className={styles.piccoloAuthor}>Sweta Thapa</div>
                <div className={styles.postedOnJun}>Posted on Sep 1, 2025</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Image */}
      <div className={styles.image33Parent}>
        <img
          className={styles.image33Icon}
          alt=""
          src="/coffee.jpeg"
        />
        <div className={styles.reviews} />
      </div>

      <div className={styles.frameChild} />

      {/* Article Content */}
      <div className={styles.frameParent1}>
        <div className={styles.frameParent2}>
          {/* From Soil to Cup Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>From Soil to Cup: The Beginning</b>
            <div className={styles.digitalLoyaltySolution}>
              <p>
                Katmandu Coffee didn’t start with a trendy cafein the city. 
                It began where real coffee begins; on a farm. In 2008, they planted Bourbon 
                and Yellow Caturra Arabica in Bhirkune, Nuwakot, a highland area north of Kathmandu.
              </p>
              <p>
                Why there? Because coffee grown between 1,100 and 1,500 meters develops richer flavors, 
                stronger aromas, and meets the criteria of true specialty coffee. Anything below 800m? It’s
                simply “okayish.” Katmandu Coffee never settled for okayish.
              </p>
              <p>
                By 2018, they opened their experience center in Lazimpat, a showroom not just to drink coffee
                but to taste what years of farming, harvesting, and perfecting actually mean.
              </p>
            </div>
          </div>

          {/* Obstacles Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>The Obstacles They Faced — And Conquered</b>
            <div className={styles.digitalLoyaltySolution}>
              <p>Building a coffee culture in Nepal hasn’t been easy. Katmandu Coffee’s journey was shaped by 
                obstacles that would have stopped many:</p>
              <ul>
                <li>Misinformation about what real coffee is</li>
                <li>No trained manpower in farming, roasting, or brewing</li>
                <li>Minimal subsidies or loans for agriculture investment</li>
                <li>Skepticism about coffee’s future in Nepal</li>
              </ul>
              <p>Instead of complaining, they invested in knowledge, built expertise, trained manpower, and proved
                 coffee could be a serious industry here.</p>
            </div>
          </div>

          {/* Coffee Culture & Export Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>The Numbers Behind Nepal’s Coffee Boom</b>
            <div className={styles.digitalLoyaltySolution}>
              <p>Here’s the reality: Nepal produces 5,000–6,000 tons of coffee annually, but consumes 15,000–20,000 tons. 
                That means the demand is nearly triple the supply and growing fast. Café culture alone has doubled in just the last year.</p>
              <p>Katmandu Coffee has played a major role in bridging that gap, ensuring locally grown, carefully processed beans don’t 
                get sidelined by imports. Today, their products are available not only in cafés but also at Bhatbhateni, Big Mart,
                 Salesberry, and Yoyoso. They’ve even reached beyond Nepal, exporting to South Korea, China, and securing rights in Africa,
                  the Middle East, Asia-Pacific, and Australia.</p>
            </div>
          </div>

          {/* Specialty Coffee Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>Specialty Coffee vs. Common Coffee: Do You Know the Difference?</b>
            <div className={styles.digitalLoyaltySolution}>
              <p>Too many people drink coffee without knowing what’s in their cup. So let’s make it simple:</p>
              <ul>
                <li>
                  <strong>Specialty Coffee:</strong> Grown at proper altitude, carefully handpicked when cherries turn red, processed through
                   dry or washed methods, roasted with precision, evaluated under SEA guidelines, and traceable to its origin. These 
                   are beans that highlight unique flavors; fruity, nutty, floral, depending on terroir.
                </li>
                <li>
                  <strong>Common Coffee:</strong> Lower altitude, bulk-produced, inconsistent processing, vague origins, no clear standards.
                   It’s coffee that fills your cup but doesn’t make an impression.
                </li>
              </ul>
              <p>If you’re still choosing “common coffee” when specialty is grown right here in Nepal, why settle?</p>
            </div>
          </div>

          {/* Coffee Machines Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>Coffee Machines: Full Automatic vs. Semi-Automatic</b>
            <div className={styles.digitalLoyaltySolution}>
              <ul>
                <li>
                  <strong>Full Automatic Machines:</strong> Do the grinding, dosing, tamping, and brewing for you. Easier to use,
                   faster, but less control.
                </li>
                <li>
                  <strong>Semi-Automatic Machines:</strong> Require the barista’s skill for grinding, tamping, and timing. Demands 
                  expertise but delivers a more authentic, customizable espresso.
                </li>
              </ul>
              <p>Katmandu Coffee doesn’t just sell beans — they also supply machines (to names like Saeco and CIME) and train baristas. 
                Because good beans deserve proper brewing.</p>
            </div>
          </div>

          {/* Advice Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>Advice for Aspiring Café Owners</b>
            <div className={styles.digitalLoyaltySolution}>
              <ul>
                <li>Expensive is not always better.</li>
                <li>Know your product. Study coffee. Understand consumer purchase power.</li>
                <li>Do your homework. Learn your competitors before you compete.</li>
                <li>Invest your own knowledge, not just your money.</li>
                <li>Branding and customer experience matter as much as the brew.</li>
              </ul>
            </div>
          </div>

          {/* Future Plans Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>Looking Ahead: The Next Five Years</b>
            <div className={styles.digitalLoyaltySolution}>
              <ul>
                <li>Raising coffee quality to global benchmarks</li>
                <li>Achieving ISO standardization and recognition</li>
                <li>Expanding their cafechain nationwide</li>
                <li>Scaling up their iced espresso sachets for international markets</li>
              </ul>
            </div>
          </div>

          {/* Conclusion Section */}
          <div className={styles.whatIsDigitalLoyaltySolutiParent}>
            <b className={styles.introduction}>The Final Brew</b>
            <div className={styles.digitalLoyaltySolution}>
              Katmandu Coffee isn’t another name in the crowded café scene. It’s a brand that built its roots in Nuwakot soil, 
              fought misinformation and lack of support, and grew into Nepal’s most recognized specialty coffee producer.
              <br/>
              So the next time you pick up your cup, ask yourself: are you drinking coffee just to get by, or are you drinking
               Katmandu Coffee, the brand that sets the standard? The choice is as clear as the aroma of a fresh pour.
            </div>
          </div>
        </div>

        {/* Social Buttons */}
        <div className={styles.groupParent}>
          <button className={styles.ellipseParent} onClick={onGroupButtonClick}>
            <div className={styles.groupChild} />
            <img
              className={styles.whatsappSvgrepoCom1Icon}
              alt=""
              src="/whatsappsvgrepocom-1.svg"
            />
          </button>
          <button
            className={styles.ellipseParent}
            onClick={onGroupButtonClick1}
          >
            <div className={styles.groupChild} />
            <img
              className={styles.vectorIcon}
              alt=""
              src="/FacebookVector.png"
            />
          </button>
          <button
            className={styles.ellipseParent}
            onClick={onGroupButtonClick2}
          >
            <div className={styles.groupChild} />
            <img className={styles.groupIcon} alt="" src="/group-7560.svg" />
          </button>
        </div>
      </div>
    </div>
  );
};

katmandu.propTypes = {
  className: PropTypes.string,
};

export default katmandu;
