import { useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./loyaltySamparka.module.css";
import { useRouter } from "next/router";

const cinnamon = ({ className = "" }) => {
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
                <div className={styles.minRead}>3 min read</div>
              </div>
            </div>
            <b className={styles.enhanceCustomerLoyalty}>
              Cinnamon Garden: Innovating Comfort on Hattisar Road
            </b>
            <div className={styles.elevateCustomerLoyalty}>
              Situated just steps from Naxal, within the charming Maya Manor
              Boutique Hotel, Cinnamon Garden offers a beautifully balanced
              blend of serenity and inventiveness—a creative retreat in the
              heart of Kathmandu.
            </div>
          </div>
          <div className={styles.articleAuthorWrapper}>
            <div className={styles.articleAuthor}>
              <img className={styles.avatarIcon} alt="" src="/sweta.jpg" />
              <div className={styles.authorText}>
                <div className={styles.piccoloAuthor}>Sweta Thapa</div>
                <div className={styles.postedOnJun}>Posted on Aug 13, 2025</div>
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
          {/* Story Behind the Brew */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>The Story Behind the Brew</b>
            <div className={styles.digitalLoyaltySolution}>
              Cinnamon Garden was born from the vision of Trisha and Adhish,
              whose trip to Vietnam sparked a flavor revelation. They were
              captivated by the depth and novelty of Vietnamese salted coffee—an
              unexpected delight that inspired a Nepali reinvention. Back home
              in Kathmandu, they experimented, replacing sea salt with locally
              sourced Himalayan pink salt to create a drink that harmonizes
              tradition and innovation. Today, the Himalayan Pink Salt Coffee is
              the café’s unmistakable signature—bold, layered, and deeply
              reflective of its roots.
            </div>

            {/* Image Below the Story */}
            <div className={styles.image33Parent}>
              <img
                className={styles.image33Icon}
                alt="Cinnamon Garden"
                src="/cinnamon.png"
              />
              <div className={styles.reviews} />
            </div>

            <div className={styles.frameChild} />
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>

          {/* Cafe That Feels Like an Artful Pause */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>
              A Café That Feels Like an Artful Pause
            </b>
            <div className={styles.digitalLoyaltySolution}>
              Step inside Cinnamon Garden and the atmosphere mirrors the
              philosophy behind its drinks—warm, refined, and full of subtle
              surprises. Sunlight spills across wooden textures and leafy
              accents, creating a space that feels both modern and rooted in
              nature. Earthy tones, soft lighting, and intimate corners make it
              the perfect backdrop for both quiet conversations and moments of
              self-reflection.
              <br />
              But Cinnamon Garden is more than just a cafe—it’s a safe space.
              With intention and care, the cafe has built a reputation for being
              an inclusive haven where women and the LGBTQ+ community feel
              welcome, respected, and celebrated. Here, community matters as
              much as coffee.
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer1"
            />
          </div>

          {/* Beyond Coffee Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>
              Beyond Coffee: A Hub for Creativity & Cuisine
            </b>
            <div className={styles.digitalLoyaltySolution}>
              Far from being conventional, Cinnamon Garden thrives on offering
              experiences that extend beyond the expected. The café’s menu is a
              living story, shifting with the seasons and infused with cultural
              curiosity.
              <br />
              Here, you’ll find not just Himalayan-nuanced creations but also
              Middle Eastern specialties and flavors rarely found elsewhere in
              Kathmandu. From mezze-inspired plates to unexpected global
              pairings, Cinnamon Garden curates a menu that feels adventurous
              yet familiar—a culinary journey without leaving the city.
              <br />
              And then, there are the community food pop-ups. Cinnamon Garden has
              already hosted immersive culinary nights that celebrated diverse
              traditions—like a soulful South Indian feast served on banana
              leaves and an aromatic Pakistani dinner that brought flavors of
              Lahore and Karachi to Kathmandu. These pop-ups transform the café
              into a gathering place where food becomes storytelling, and
              strangers become community.
              <br />
              The café also doubles as a creative hub. With wellness workshops,
              mindful journaling sessions, and eco-conscious DIY activities,
              Cinnamon Garden nurtures both body and mind. Each event reflects
              the café’s ethos of cultivating curiosity and connection.
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>

          {/* What Makes Cinnamon Garden Unmistakably It */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>
              What Makes Cinnamon Garden Unmistakably It
            </b>
            <div className={styles.digitalLoyaltySolution}>
              <li>The Himalayan Pink Salt Coffee: A textural journey of espresso, milk, and delicate pink-salted foam—smooth, surprising, and distinctly Nepali.</li>
              <li>Inclusive Community: A cafe that takes pride in being a safe, supportive space for women and the LGBTQ+ community.</li>
              <li>Worldly Flavors: From Middle Eastern delights to pop-up food events, Cinnamon Garden brings to Kathmandu tastes you won’t find anywhere else.</li>
              <li>Warm Minimalism: Stylish but not showy, the interiors are designed to make you feel at home while inviting you to linger.</li>
              <li>Creative Spirit: With workshops, poetry nights, and food pop-ups, the cafe goes beyond food and drink, offering experiences that enrich.</li>
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>

          {/* Conclusion Section */}
          <div className={styles.whatIsDigitalLoyaltySolutiParent}>
            <b className={styles.introduction}>
              Final Note: A Sanctuary for Curiosity
            </b>
            <div className={styles.digitalLoyaltySolution}>
              Cinnamon Garden is not just a cafe—it’s an invitation to pause,
              savor, and belong. With its thoughtful design, globally inspired
              flavors, and unwavering commitment to inclusivity, it stands as
              one of Kathmandu’s rare spaces where coffee, culture, and
              community meet. Each sip, each plate, and each interaction is a
              gentle reminder: this is a place designed not just to serve, but
              to embrace.
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

cinnamon.propTypes = {
  className: PropTypes.string,
};

export default cinnamon;
