import { useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./piccolo.module.css";
import { useRouter } from "next/router";

const caffeophilia = ({ className = "" }) => {
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
              Caffeophilia: For Dreamers with Coffee in Their Hearts
            </b>
            <div className={styles.elevateCustomerLoyalty}>
              Caffeophilia, a specialty coffee concept by Katmandu Coffee, is
              more than just a café—it’s a tribute to Nepali coffee, thoughtful
              design, and the quiet moments in between. Created for those who
              dream with a cup in hand, Caffeophilia offers a space where every
              sip, every conversation, and every breath feels intentional.
            </div>
          </div>
          <div className={styles.articleAuthorWrapper}>
            <div className={styles.articleAuthor}>
              <img className={styles.avatarIcon} alt="" src="/avatar@2x.png" />
              <div className={styles.authorText}>
                <div className={styles.piccoloAuthor}>Shreeyanch Shrestha</div>
                <div className={styles.postedOnJun}>Posted on Apr 16, 2025</div>
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
          src="/caffeophiliabanner.png"
        />
        <div className={styles.reviews} />
      </div>

      <div className={styles.frameChild} />

      {/* Article Content */}
      <div className={styles.frameParent1}>
        <div className={styles.frameParent2}>
          {/* Introduction Section */}

          {/* <div
            className={styles.whatIsDigitalLoyaltySolutiParent}
            data-scroll-to="frameContainer1"
          >
            <b className={styles.whatIsDigital}>
              Our Reach: 4 Branches and Growing
            </b>
            <div className={styles.digitalLoyaltySolution}>
              In a world where grooming is more than just a routine—The New
              Barbers emerged with a mission to revive the essence of the
              classic barbershop experience. Since 2019, we've been blending
              timeless craftsmanship with modern grooming techniques to give
              every gentleman more than just a haircut—we deliver confidence,
              precision, and personality.
              <ul>
                <li>Thamel</li>
                <li>Jhamsikhel</li>
                <li>Boudha</li>
                <li>Durbarmarg</li>
              </ul>
            </div>
          </div> */}

          {/* Piccolo Loyalty App Section */}

          {/* A Gathering Place for All Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>Our Vision</b>
            <div className={styles.digitalLoyaltySolution}>
              At its core, Caffeophilia exists to elevate Nepali specialty
              coffee—to take what’s locally grown and give it the global stage
              it deserves. But it’s also about creating a culture around coffee.
              A culture of slowness, curiosity, and connection. This is not a
              place to rush. It’s a place to arrive.
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>

          {/* The Piccolo Experience Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>The Space</b>
            <div className={styles.digitalLoyaltySolution}>
              Minimalist, warm, and soulfully Scandinavian—Caffeophilia’s design
              is a visual breath of fresh air. Inspired by Nordic simplicity,
              the space leans into soft lighting, clean textures, and open calm.
              It’s a café, but it’s also a workspace, a meeting point, a quiet
              hideout, and a soft landing in the middle of a busy day.
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer1"
            />
          </div>

          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>The People </b>
            <div className={styles.digitalLoyaltySolution}>
              From the baristas who treat every pour like an art form to the
              guests who find comfort in a corner seat, the heart of
              Caffeophilia is its people. It’s a community of thinkers, feelers,
              travelers, and storytellers—brought together by their shared love
              for deep flavors and deeper moments.
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>

          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>Looking Ahead</b>
            <div className={styles.digitalLoyaltySolution}>
              With a strong foundation and a growing team, our aim is to
              continue expanding while staying true to our roots. We envision
              more branches, more barbers, and more opportunities to elevate
              men’s grooming in Nepal and beyond.{" "}
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>

          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>
              Caffeophilia Loyalty App: Tap In, Feel Seen
            </b>
            <div className={styles.digitalLoyaltySolution}>
              <p>
                Introducing{" "}
                <a
                  href="https://caffeophilia.samparka.co/"
                  target="_blank"
                  rel="noopener noreferrer "
                  style={{ color: "inherit" }}
                  onMouseOver={(e) => (e.target.style.color = "#d63384")}
                  onMouseOut={(e) => (e.target.style.color = "inherit")}
                >
                  {" "}
                  Caffeophilia Loyalty App
                </a>{" "}
                loyalty is more than a program—it’s a way to say “we remember
                you.” Powered by Samparka, the Caffeophilia Loyalty App rewards
                every visit, every coffee, every quiet moment shared within
                these walls. No plastic cards. No QR scanning chaos. Just a
                simple tap with your phone, and you're instantly collecting
                points, unlocking curated rewards, and getting access to
                member-only experiences. It’s loyalty that feels frictionless,
                personal, and thoughtful—just like the café itself.
              </p>
            </div>
          </div>

          <div className={styles.image33Parent}>
            <img
              className={styles.image33Icon}
              alt=""
              src="/caffeophilialoyaltybanner.png"
            />
            <div className={styles.reviews} />
          </div>

          {/* Conclusion Section */}
          <div className={styles.whatIsDigitalLoyaltySolutiParent}>
            <b className={styles.introduction}>Experience Over Everything </b>
            <div className={styles.digitalLoyaltySolution}>
              Caffeophilia doesn’t just serve coffee—it crafts experiences. The
              aroma when you walk in, the playlist humming in the background,
              the way light hits your table just right. Every detail is
              intentional. Every visit is meant to feel like a personal ritual.{" "}
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer"
            />
          </div>

          <div className={styles.whatIsDigitalLoyaltySolutiParent}>
            <b className={styles.introduction}>A Place to Return To</b>
            <div className={styles.digitalLoyaltySolution}>
              Caffeophilia is for the dreamers. For the thinkers. For anyone who
              finds inspiration in a cup of well-brewed coffee and peace in a
              well-designed space. Whether you're chasing ideas, taking a break,
              or just being—you’re welcome here. Because some places aren’t just
              visited. They’re felt.{" "}
              <div
                className={styles.anchorFrame7699}
                data-scroll-to="frameContainer"
              />
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

      {/* Piccolo Location Iframe */}
      <div className={styles.locationContainer}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3534.041955092443!2d85.3016680762571!3d27.654173627833245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb17c0db5415ff%3A0x77690d4a1d49d69d!2sCaffeophilia!5e0!3m2!1sen!2snp!4v1744800132835!5m2!1sen!2snp"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
};

caffeophilia.propTypes = {
  className: PropTypes.string,
};

export default caffeophilia;
