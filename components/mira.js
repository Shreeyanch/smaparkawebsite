import { useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./loyaltySamparka.module.css";
import { useRouter } from "next/router";

const mira = ({ className = "" }) => {
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
                <div className={styles.minRead}>3 min read</div>
              </div>
            </div>
            <b className={styles.enhanceCustomerLoyalty}>
              A Quiet Pause in the Heart of the City
            </b>
            <div className={styles.elevateCustomerLoyalty}>
            In the calm corners of Sanepa and the lively streets of Durbarmarg, Mira Boulangerie & Patisserie is one of those rare places that feels like a soft exhale. 
            For anyone who’s wandered around Kathmandu looking for a quiet moment, a warm croissant, or just somewhere that feels like a little escape, this is it.
            Sanepa gives you the slow, sunlit vibe. Durbarmarg brings that elegant city charm. The pastries are rich, the coffee comforts, and the mood? Effortlessly cozy.
            Mira isn’t just about what’s on the plate, it’s about how it makes you feel. And once you’ve been, it’s hard not to come back.
            </div>
          </div>
          <div className={styles.articleAuthorWrapper}>
            <div className={styles.articleAuthor}>
              <img className={styles.avatarIcon} alt="" src="/sweta.jpg" />
              <div className={styles.authorText}>
                <div className={styles.piccoloAuthor}>Sweta Thapa</div>
                <div className={styles.postedOnJun}>Posted on July 4, 2025</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Image */}
      <div className={styles.image33Parent}>
        
        <div className={styles.reviews} />
      </div>

      <div className={styles.frameChild} />

      {/* Article Content */}
      <div className={styles.frameParent1}>
        <div className={styles.frameParent2}>
         

          {/* A Gathering Place for All Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>How it all began</b>
            <div className={styles.digitalLoyaltySolution}>
                Mira Boulangerie and Patisserie, also known as Mira Bakery, was started in 2021 by Shubhan Joshi and Sukanya Kakshapati. 
                What began in a small home kitchen turned into a full bakery in Sanepa bringing a fresh slice of French pastry culture to the heart of Kathmandu. 
                Inspired by their culinary and pastry training in Bangkok in 2021, they brought a taste of French baking to Kathmandu with warmth and craft at the heart of everything they do.
            </div>
            
      {/* Banner Image */}
      <div className={styles.image33Parent}>
        <img
          className={styles.image33Icon}
          alt=""
          src="/miraOwners.jpg"
        />
        <div className={styles.reviews} />
      </div>

      <div className={styles.frameChild} />
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>

          {/* The Piccolo Experience Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>What Mira is all about </b>
            <div className={styles.digitalLoyaltySolution}>
                Mira Boulangerie & Patisserie is a space where intention meets craft. Every pastry, every cup of coffee, and every quiet corner is designed to offer a sense of comfort that lingers.
                It’s not a place that shouts to be noticed, it simply invites people in with quiet confidence. With roots in French patisserie and a heart grounded in Kathmandu, Mira blends elegance with ease.
                Today, Mira Bakery is celebrated not only for its buttery croissants, artisan breads, and elegant cakes, but also for introducing Kathmandu to a taste of authentic French patisserie made with passion,
                skill, and a personal touch. 
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer1"
            />
          </div>

          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>Where to find us </b>
            <div className={styles.digitalLoyaltySolution}>
              Tucked away in the peaceful neighborhood of Sanepa, Mira’s original outlet offers a slower pace and 
              soft morning light perfect for unhurried breakfasts, quiet work sessions, or simply pausing with a 
              croissant in hand. Over in Durbarmarg, the second location brings a touch of sophistication to the heart
              of the city. Surrounded by urban charm and gentle buzz, it’s a space where French elegance meets Kathmandu’s 
              energy. Each outlet carries its own rhythm, but both share the same essence, calm, thoughtful, and quietly special.

            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>

          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>What makes Mira special</b>
            <div className={styles.digitalLoyaltySolution}>
              In Kathmandu, where cafes often come and go, Mira has managed to create something that quietly stands above the rest.
              It’s not just the croissants that shatter perfectly with every bite or the tarts that look like they belong in a Parisian window.
              It’s the whole experience. The precision in every bake, the warmth in every detail, and the kind of consistency that’s rare to 
              find in a fast-moving city like ours. While most spots chase trends, Mira holds its ground with timeless quality. It’s the kind 
              of place you come back to. The one you recommend to a friend without hesitation. The one that quietly becomes your favorite.
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
              src="/miraSpecial.png"
            />
            <div className={styles.reviews} />
          </div>

          {/* Conclusion Section */}
          <div className={styles.whatIsDigitalLoyaltySolutiParent}>
            <b className={styles.introduction}>The Final Slice of Mira’s Story</b>
            <div className={styles.digitalLoyaltySolution}>
             What makes Mira Boulangerie & Patisserie truly special goes beyond buttery croissants and beautiful 
             spaces. It’s the feeling of being thoughtfully cared for. From the precision in each bake to the genuine 
             intention behind every guest experience, Mira creates moments that feel personal and warm.<br/>
             Mira brings effortless warmth to every visit with a little help from Samparka Nepal, a game changer for
             how businesses connect with their customers. From digital loyalty cards that make rewards simple, to NFC 
             business cards that turn every hello into a lasting bond, and feedback tools that listen without the fuss, 
             Samparka makes the whole experience smooth and personal. Imagine Kathmandu’s cafes and restaurants stepping 
             up their game with these smart, behind the scenes tools creating spaces where technology fades away and 
             genuine connection takes center stage. That’s the kind of wow Samparka brings, making businesses smarter, 
             softer, and unforgettable.
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

mira.propTypes = {
  className: PropTypes.string,
};

export default mira;
