import { useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./piccolo.module.css";
import { useRouter } from "next/router";

const TheNewBarber = ({ className = "" }) => {
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
                <div className={styles.minRead}>7 min read</div>
              </div>
            </div>
            <b className={styles.enhanceCustomerLoyalty}>
              TheNewBarber: Crafting Style from the Ground Up
            </b>
            <div className={styles.elevateCustomerLoyalty}>
              Grooming is more than appearance—it's identity, expression, and
              confidence. At The New Barbers, we’re not just creating haircuts;
              we’re creating moments, building careers, and shaping a modern
              grooming culture in Nepal. We stand for purpose-driven styling and
              community-driven growth.
            </div>
          </div>
          <div className={styles.articleAuthorWrapper}>
            <div className={styles.articleAuthor}>
              <img className={styles.avatarIcon} alt="" src="/samanlama.jpg" />
              <div className={styles.authorText}>
                <div className={styles.piccoloAuthor}>Saman Lama</div>
                <div className={styles.postedOnJun}>Posted on Apr 11, 2025</div>
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
          src="/thenewbarbersbanner.png"
        />
        <div className={styles.reviews} />
      </div>

      <div className={styles.frameChild} />

      {/* Article Content */}
      <div className={styles.frameParent1}>
        <div className={styles.frameParent2}>
          {/* Introduction Section */}
          <div className={styles.introductionParent}>
            <b className={styles.introduction}>
              Established: Humble beginnings, strong roots (Since 2019)
            </b>
            <div className={styles.inNepalsCompetitive}>
              We didn’t start with a legacy—we started with a mission. The New
              Barbers began in 2019 as a bold idea to redefine men’s grooming in
              Nepal, and over time, grew into a brand trusted by thousands. What
              began as a single chair in a small neighborhood shop is now a
              growing movement in men’s style and self-care. We've built our
              brand on consistency, quality, and the belief that grooming is not
              just a service—it’s a statement. From a single chair to multiple
              branches, our journey is a story of growth, learning, and
              unwavering commitment.
            </div>
          </div>

          {/* The Heart of Piccolo's Mission Section */}
          <div
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
          </div>

          {/* Piccolo Loyalty App Section */}

          {/* A Gathering Place for All Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>Our Vision</b>
            <div className={styles.digitalLoyaltySolution}>
              Our brand is built around a simple yet powerful vision: to revive
              the classic barbershop experience by blending traditional
              techniques with modern grooming. We believe in creating a space
              where every man feels respected, confident, and effortlessly
              stylish. Every trim, fade, and line-up is a moment of
              artistry—tailored to match personality and lifestyle.
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>

          {/* The Piccolo Experience Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>Our Unique Approach</b>
            <div className={styles.digitalLoyaltySolution}>
              Talent isn't found—it’s developed. One of our biggest challenges
              has been finding skilled barbers. Instead of chasing after talent,
              we decided to build it. We hire individuals with passion but no
              experience, and through our structured training, mentoring, and
              grooming programs, we shape them into master barbers. That’s how
              our name—The New Barbers—came to life.
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer1"
            />
          </div>

          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>The Experience</b>
            <div className={styles.digitalLoyaltySolution}>
              Step into any of our four branches, and you’ll feel the
              difference. From the warm greeting to the sharp finish, we offer
              more than just grooming—we offer an experience. Whether it’s your
              first visit or your fiftieth, we make every client feel valued and
              heard.
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
              Loyalty that Goes Beyond the Chair
            </b>
            <div className={styles.digitalLoyaltySolution}>
              <p>
                Introducing{" "}
                <a
                  href="https://thenewbarber.samparka.co/"
                  target="_blank"
                  rel="noopener noreferrer "
                  style={{ color: "inherit" }}
                  onMouseOver={(e) => (e.target.style.color = "#d63384")}
                  onMouseOut={(e) => (e.target.style.color = "inherit")}
                >
                  {" "}
                  TheNewBarber Loyalty App
                </a>{" "}
                to reward our loyal clients and strengthen community ties, we’ve
                introduced the New Barbers Loyalty App. It’s more than just a
                points system—it's our way of saying thanks for being part of
                our journey. With the app, clients enjoy:
                <ul>
                  <li>Exclusive rewards and grooming perks</li>
                  <li>Early access to promotions and events</li>
                  <li>Special discounts and referral benefits</li>
                </ul>
                The Loyalty App turns every visit into something more personal
                and rewarding—because great haircuts deserve great appreciation.
              </p>
            </div>
          </div>

          <div className={styles.image33Parent}>
            <img
              className={styles.image33Icon}
              alt=""
              src="/tnbloyaltybanner.png"
            />
            <div className={styles.reviews} />
          </div>

          {/* Conclusion Section */}
          <div className={styles.whatIsDigitalLoyaltySolutiParent}>
            <b className={styles.introduction}>Meet the Team</b>
            <div className={styles.digitalLoyaltySolution}>
              Our barbers are not just employees—they're passionate artists.
              They genuinely enjoy perfecting fades, mastering line-ups, and
              sculpting beard trims. Always eager to learn, they stay updated
              with the latest trends and techniques, ensuring our clients leave
              the chair with a fresh cut and a big smile. Every cut is done with
              care, attention, and pride.{" "}
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer"
            />
          </div>

          <div className={styles.whatIsDigitalLoyaltySolutiParent}>
            <b className={styles.introduction}>Conclusion</b>
            <div className={styles.digitalLoyaltySolution}>
              The New Barbers is not just about haircuts—it’s about building
              confidence, creating careers, and bringing back the barbershop
              culture in a fresh, modern way. Our Loyalty App adds an extra
              layer of connection—because you're not just a client, you're part
              of our community. Visit us today and experience the new standard
              in barbering.{" "}
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
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14133.030246459635!2d85.29552048715821!3d27.67843329999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1958b62f3619%3A0x2316a2e3724ca748!2sThe%20New%20Barber%20jhamsikhel!5e0!3m2!1sen!2snp!4v1744365990752!5m2!1sen!2snp"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
};

TheNewBarber.propTypes = {
  className: PropTypes.string,
};

export default TheNewBarber;
