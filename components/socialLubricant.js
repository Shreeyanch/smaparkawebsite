import { useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./loyaltySamparka.module.css";
import { useRouter } from "next/router";

const SocialLubricant = ({ className = "" }) => {
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
                <div className={styles.minRead}>4 min read</div>
              </div>
            </div>
            <b className={styles.enhanceCustomerLoyalty}>
              The Social Lubricant at Nya:No Specialty Coffee
            </b>
            <div className={styles.elevateCustomerLoyalty}>
              Every city has its heartbeat, and in Kathmandu, that rhythm often
              echoes inside coffee shops. Among them, The Social Lubricant at
              Nya:No Specialty Coffee isn’t just another café, it is a living,
              breathing space where ideas mingle as easily as espresso shots
              swirl into velvety crema.
            </div>
          </div>
          <div className={styles.articleAuthorWrapper}>
            <div className={styles.articleAuthor}>
              <img className={styles.avatarIcon} alt="" src="/sweta.jpg" />
              <div className={styles.authorText}>
                <div className={styles.piccoloAuthor}>Sweta Thapa</div>
                <div className={styles.postedOnJun}>Posted on Sep 8, 2025</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Image */}
      <div className={styles.image33Parent}>
        <img
          className={styles.image33Icon}
          alt="Social Lubricant"
          src="/social-lubricant.png"
        />
        <div className={styles.reviews} />
      </div>

      <div className={styles.frameChild} />

      {/* Article Content */}
      <div className={styles.frameParent1}>
        <div className={styles.frameParent2}>
          {/* More Than Coffee */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>More Than Coffee</b>
            <div className={styles.digitalLoyaltySolution}>
              Coffee here is not just about a caffeine kick, it is about
              craftsmanship and care. Each cup is prepared with beans that are
              locally roasted and ethically sourced, allowing every note of
              flavor to shine through. The brightness of a pour-over feels
              refreshing, the bold punch of an espresso wakes the senses, while
              the smooth comfort of a flat white feels like a quiet embrace.
              Every sip is intentional, carrying both precision and warmth, and
              leaving you with a taste that lingers beyond the cup.
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>

          {/* Why Social Lubricant */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>Why “Social Lubricant”?</b>
            <div className={styles.digitalLoyaltySolution}>
              Coffee has always done more than keep us awake, it has a way of
              softening silences and sparking conversations. It turns strangers
              into friends, and gives old friends a reason to meet again. At
              The Social Lubricant, this quality is not a side effect, it is the
              very essence of the space. You walk in for the coffee, but what
              you take away is often the connection, whether it is a brief chat
              across the counter, a deep conversation at the table, or simply
              the comfort of being among people who value the same rituals of
              pause and presence.
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer1"
            />
          </div>

          {/* A Cultural Hub */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>A Cultural Hub</b>
            <div className={styles.digitalLoyaltySolution}>
              The Social Lubricant is not limited to brewing coffee, it also
              brews culture. Step inside and you will often find a poetry
              reading, a small acoustic performance, or an open mic unfolding
              in the corner. It has become a venue where ideas meet expression,
              and where community finds its rhythm. The atmosphere is warm and
              minimal, but alive with the energy of people sharing their work,
              their voices, and their creativity. It feels like a safe ground
              for dialogue, art, and imagination, all sustained by cups of
              coffee that keep conversations flowing.
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>

          {/* What You Will Find */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>What You Will Find</b>
            <div className={styles.digitalLoyaltySolution}>
              What you discover here goes far beyond the menu. Yes, the coffee
              is crafted with precision and care, but the experience is also in
              the way the space feels. The interiors are designed to be calming,
              with just the right balance between quiet corners for work and
              open areas that invite interaction. It is a café where you can sit
              alone with your thoughts and your laptop, yet still feel part of
              something happening around you. The energy is distinctly Kathmandu,
              yet there is also a touch of global café culture, making it a place
              where both locals and visitors feel at home.
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>

          {/* One Last Sip */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>One Last Sip</b>
            <div className={styles.digitalLoyaltySolution}>
              At The Social Lubricant, coffee is the medium, but connection is
              the message. Each cup is a small ritual that brings people
              together, slows down time, and allows you to be present. It is not
              just about drinking coffee, it is about experiencing a moment of
              community, whether in conversation, in silence, or in shared
              creativity. This is the kind of place where coffee becomes memory,
              and memory becomes story.
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

SocialLubricant.propTypes = {
  className: PropTypes.string,
};

export default SocialLubricant;
