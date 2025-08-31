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
          {/* A Gathering Place for All Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>The Story Behind the Brew</b>
            <div className={styles.digitalLoyaltySolution}>
              Cinnamon Garden was born from the vision of Trisha and Adhish,
              whose trip to Vietnam sparked a flavor revelation. They were
              captivated by the depth and novelty of Vietnamese salted coffee—an
              unexpected delight that inspired a Nepali reinvention. Back home
              in Kathmandu, they experimented, replacing sea salt with locally
              sourced Himalayan pink salt to create a drink that harmonizes
              tradition and innovation. This Himalayan Pink Salt Coffee is now
              the café's unmistakable signature—bold, layered, and deeply
              reflective of its roots.
              <br />
              {/* Banner Image */}
              <div className={styles.image33Parent}>x
                <img
                  className={styles.image33Icon}
                  alt=""
                  src="/cinnamon2.jpg"
                />
                <div className={styles.reviews} />
              </div>
              <br />
              Step inside Cinnamon Garden and the atmosphere mirrors the
              philosophy behind its drinks—warm, refined, and full of subtle
              surprises. Sunlight spills across wooden textures and leafy
              accents, creating a space that feels both modern and rooted in
              nature. The interiors are thoughtfully designed for lingering,
              with earthy tones, soft lighting, and quiet corners that invite
              conversation or calm reflection. It’s the kind of place where
              every detail—from the seating to the playlist—contributes to an
              ambience that’s as memorable as the coffee itself.
            </div>

            <div className={styles.frameChild} />
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>

          {/* The Piccolo Experience Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>
              A Café That Feels Like an Artful Pause{" "}
            </b>
            <div className={styles.digitalLoyaltySolution}>
              From the moment you step inside, Cinnamon Garden feels different.
              Its leafy corners and modern, cozy interiors are softly lit and
              thoughtfully arranged to encourage lingering—whether you're onto
              solo reflection or quiet conversation. Natural textures, greenery,
              and gentle design touches blend seamlessly to create an inviting
              ambiance that’s calming yet inspiring.
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer1"
            />
          </div>

          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>
              Beyond Coffee: A Hub for Creativity{" "}
            </b>
            <div className={styles.digitalLoyaltySolution}>
              Far from being a conventional café, Cinnamon Garden’s spirit
              thrives in unexpected experiences. Here, the menu evolves with the
              seasons, each dish and drink carrying a story—like the Salted
              Brew, which invites a courteous pause and thoughtful taste. The
              space also comes alive with workshops—DIY eco-soap making, mindful
              journaling sessions, and wellness events—turning the café into a
              controlled yet dynamic creative hub.
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>

          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>
              What Makes Cinnamon Garden Unmistakably It
            </b>
            <div className={styles.digitalLoyaltySolution}>
              <li>
                <ol>
                  The Himalayan Pink Salt Coffee: A textural journey of
                  espresso, milk, and delicate pink-salted foam—smooth,
                  surprising, and distinctly Nepali .
                </ol>
              </li>
              <li>
                <ol>
                  Warm minimalism: Stylish but not showy, the café’s layout
                  offers corners that coax you to sit a little longer.
                </ol>
              </li>
              <li>
                <ol>
                  Community spirit: It's not just a stop for caffeine—it’s a
                  space that cultivates curiosity, calm, and connection.
                </ol>
              </li>
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
              Cinnamon Garden invites you to slow down and savor. From its
              tasteful design to its unexpected Himalayan-nuanced flavors and
              creative events, the café stands as a rare creative pause in a
              city that never stops. It’s less about following café trends and
              more about fostering moments—each cup, each interaction, gently
              curated to linger.{" "}
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
