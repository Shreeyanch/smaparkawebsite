import { useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./loyaltySamparka.module.css";
import { useRouter } from "next/router";

const loyaltySamparka = ({ className = "" }) => {
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
              Redefining Customer Loyalty for Modern Businesses
            </b>
            <div className={styles.elevateCustomerLoyalty}>
            Let’s be honest. These days, getting someone’s attention is tough. Keeping it? Even tougher.
            We’re scrolling past ads like microbuses ignoring red lights, and dodging promotions like they're potholes on a rainy Kathmandu evening. So how do smart businesses stand out?
            Easy. They stop shouting and start connecting.
            That’s where Samparka comes in the low-key loyalty expert helping brands turn casual customers into long-term fans. Not with gimmicks, but with genuine, feel-good loyalty that actually works.

            </div>
          </div>
          <div className={styles.articleAuthorWrapper}>
            <div className={styles.articleAuthor}>
              <img className={styles.avatarIcon} alt="" src="/sweta.jpg" />
              <div className={styles.authorText}>
                <div className={styles.piccoloAuthor}>Sweta Thapa</div>
                <div className={styles.postedOnJun}>Posted on Jun 25, 2025</div>
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
          src="/elevated.png"
        />
        <div className={styles.reviews} />
      </div>

      <div className={styles.frameChild} />

      {/* Article Content */}
      <div className={styles.frameParent1}>
        <div className={styles.frameParent2}>
         

          {/* A Gathering Place for All Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>Loyalty is the New Cool</b>
            <div className={styles.digitalLoyaltySolution}>
                There was a time when loyalty cards were just paper things you forgot in your wallet. A stamp here, a stamp there. Maybe a free coffee if you were lucky and organized.
                Not anymore.<br/>
                Now? Loyalty is status. Having a sleek digital loyalty card that knows you, rewards you, and surprises you, that’s elite behavior. Whether it’s a coffee shop remembering your order or a clothing store giving you a birthday discount, people are loving brands that remember their name.
                Loyalty today feels personal. It feels like belonging. And with Samparka, it’s easier than ever to offer that.

            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>

          {/* The Piccolo Experience Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>What Samparka Actually Does </b>
            <div className={styles.digitalLoyaltySolution}>
                Samparka helps businesses upgrade from “meh” marketing to memorable connections.<br/>
                Here’s the magic it brings to the table:<br/>
                <ul>
                <li>Gorgeous digital loyalty cards that your customers will actually be proud to flash</li>
                <li>Rewards that make people want to come back, again and again</li>
                <li>Real-time customer insights, because knowing your people is power</li>
                <li>Personal touches that feel warm, not weird</li>
                </ul>
                Basically, Samparka gives your business the tools to grow loyal communities, not just sales. All of this without needing any clunky apps or those ancient stamp cards you always lose.

            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer1"
            />
          </div>

          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>Samparka by the Numbers: Real Impact, Real Connections </b>
            <div className={styles.digitalLoyaltySolution}>
              Since launching, Samparka has partnered with over 120 businesses across Nepal—from cozy cafés in Sanepa to popular restaurants in Jhamsikhel, from salons to local shops and bakeries. Here’s a snapshot of what’s happening on the ground:
              <ul>
              <li> Over 35,000 active loyalty card users tapping, scanning, and earning rewards every month </li>
              <li> Businesses report an average 27% increase in repeat customer visits within the first three months</li>
              <li> 95% customer satisfaction rate with Samparka’s easy-to-use digital loyalty cards and feedback tools</li>
            </ul>
              These numbers aren’t just stats, they are stories of customers feeling seen, appreciated, and coming back again and again. Samparka is more than a tool, it’s a thriving ecosystem that’s making loyalty rewarding for both businesses and their customers.
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>

          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>Ditching Giveaways and Gimmicks for Real Connection</b>
            <div className={styles.digitalLoyaltySolution}>
              Giveaways might grab a quick glance, but they don’t build lasting relationships, kind of like that one time momo stand you tried but never went back to. Samparka believes loyalty isn’t about throwing freebies around like flyers at New Road, it’s about creating genuine, meaningful bonds.
              <br/>
              By focusing on personalized rewards, smart data, and smooth digital experiences, Samparka helps businesses move beyond surface level promotions. Instead of chasing one time attention, they cultivate customers who truly feel part of the brand’s story, the kind of loyalty that sticks like the best chai on a cold day.
              {" "}
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>

          

            
          <div className={styles.image33Parent}>
            <img
              className={styles.image33Icon}
              alt=""
              src="/phoneSamparka.png"
            />
            <div className={styles.reviews} />
          </div>

          {/* Conclusion Section */}
          <div className={styles.whatIsDigitalLoyaltySolutiParent}>
            <b className={styles.introduction}>Wrapping It Up: Loyalty, But Elevated</b>
            <div className={styles.digitalLoyaltySolution}>
             In Kathmandu’s bustling market of ads and promotions, it’s easy to get lost in the noise. But Samparka is changing the game, turning loyalty from an afterthought into a powerful way to connect, grow, and thrive. By ditching gimmicks and embracing real relationships, businesses don’t just earn repeat customers, they earn friends, fans, and advocates.
            <br/>So if you’re ready to move past the giveaways and pothole sized distractions, it’s time to step into a new era of loyalty. One that feels personal, effortless, and truly rewarding. That’s the Samparka promises; loyalty, elevated.
            {" "}
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer"
            />
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

loyaltySamparka.propTypes = {
  className: PropTypes.string,
};

export default loyaltySamparka;
