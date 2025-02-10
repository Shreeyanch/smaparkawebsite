import { useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./review-component.module.css";
import { useRouter } from "next/router";


const ReviewComponent = ({ className = "" }) => {
  const router = useRouter();

  const onCheckOutSmaparkasClick = useCallback(() => {
    router.push("/smart-review-stand");
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
      <div className={styles.frameWrapper}>
        <div className={styles.frameGroup}>
          <div className={styles.frameContainer}>
            <div className={styles.frameDiv}>
              <div className={styles.minReadWrapper}>
                <div className={styles.minRead}>3 min read</div>
              </div>
            </div>
            <b className={styles.boostYourBusiness}>
              Boost Your Business with NFC-Enabled Google Review Cards in Nepal
            </b>
            <div className={styles.enhanceYourOnline}>
              Enhance Your Online Presence with NFC Google Review Cards and
              Reputation Management
            </div>
          </div>
          <div className={styles.articleAuthorWrapper}>
            <div className={styles.articleAuthor}>
              <img className={styles.avatarIcon} alt="" src="/Yeshi.png" />
              <div className={styles.authorText}>
                <div className={styles.yeshiDolkar}>Yeshi Dolkar</div>
                <div className={styles.jun2024}>17 Jun 2024</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.image33Parent}>
        <img className={styles.image33Icon} alt="" src="/ReviewheroPic.png" />
        <div className={styles.reviews} />
      </div>
      <div className={styles.frameChild} />
      <div className={styles.frameParent1}>
        <div className={styles.frameParent2}>
          <div className={styles.introductionParent}>
            <b className={styles.introduction}>Introduction</b>
            <div className={styles.googleReviewsIn}>
              Google reviews in Nepal are important for shaping a business's
              reputation and attracting new customers. As a business owner in
              Nepal, leveraging Google reviews can significantly impact your
              online presence. Introducing the NFC-enabled Google Review card
              with a smart filtering system – a tool designed to streamline and
              enhance your review management process.
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer5"
            />
          </div>
          <div
            className={styles.whatAreNfcEnabledGoogleReParent}
            data-scroll-to="frameContainer4"
          >
            <b className={styles.introduction}>
              What are NFC-Enabled Google Review Stand?
            </b>
            <div className={styles.imagineAConvenient}>
              Imagine a convenient tool that simplifies the review process for
              your customers while automating feedback management for you. Our
              NFC-enabled Google Review card is precisely that. It integrates
              Near Field Communication (NFC) technology with a user-friendly
              interface, making leaving a review as easy as a tap.
            </div>
          </div>
          <div className={styles.howItWorksParent}>
            <b className={styles.howItWorks}>How It Works</b>
            <div className={styles.imagineAConvenient}>
              <ol className={styles.streamlinedReviewProcessCu}>
                <li className={styles.smartFilteringSystemTheCa}>
                  <span
                    className={styles.streamlinedReviewProcess}
                  >{`Streamlined Review Process: `}</span>
                  <span>
                    Customers tap the NFC-enabled card with their smartphone to
                    access your Google review page.
                  </span>
                </li>
                <li className={styles.smartFilteringSystemTheCa}>
                  <span
                    className={styles.streamlinedReviewProcess}
                  >{`Smart Filtering System: `}</span>
                  <span className={styles.theCardRedirects}>
                    The card redirects 4 and 5-star ratings directly to your
                    Google review page, encouraging positive public feedback.
                  </span>
                </li>
                <li>
                  <span
                    className={styles.streamlinedReviewProcess}
                  >{`Efficient Feedback Management: `}</span>
                  <span className={styles.theCardRedirects}>
                    Ratings of 3 stars or below are directed to a feedback form.
                    This feedback is captured in real-time and reflected in your
                    Google Sheets, allowing you to address concerns promptly.
                  </span>
                </li>
              </ol>
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer3"
            />
          </div>
          <div className={styles.howItWorksParent}>
            <b className={styles.introduction}>Benefits for Your Business</b>
            <div className={styles.imagineAConvenient}>
              <ol className={styles.streamlinedReviewProcessCu}>
                <li className={styles.smartFilteringSystemTheCa}>
                  <span
                    className={styles.streamlinedReviewProcess}
                  >{`Enhanced Online Reputation: `}</span>
                  <span>
                    Facilitating easier access to Google reviews encourages more
                    customers to leave positive feedback, boosting your
                    business's credibility on Google Business profile Nepal.
                  </span>
                </li>
                <li className={styles.smartFilteringSystemTheCa}>
                  <span
                    className={styles.streamlinedReviewProcess}
                  >{`Improved SEO: `}</span>
                  <span className={styles.theCardRedirects}>
                    Positive Google reviews enhance your search engine
                    visibility, helping your business become more prominent.
                  </span>
                </li>
                <li>
                  <span
                    className={styles.streamlinedReviewProcess}
                  >{`Streamlined Customer Feedback: `}</span>
                  <span className={styles.theCardRedirects}>
                    Addressing negative experiences privately through feedback
                    forms shows your commitment to customer service excellence.
                  </span>
                </li>
              </ol>
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>
          <div className={styles.howItWorksParent}>
            <b className={styles.introduction}>
              How to Make Google Reviews Work Better for Your Business in Nepal
            </b>
            <div className={styles.imagineAConvenient}>
              <ol className={styles.streamlinedReviewProcessCu}>
                <li className={styles.smartFilteringSystemTheCa}>
                  <span className={styles.streamlinedReviewProcess}>
                    Encourage Reviews:
                  </span>
                  <span>
                    {" "}
                    Actively encourage customers to leave reviews using the
                    NFC-enabled cards. Consider offering incentives for honest
                    feedback to boost engagement.
                  </span>
                </li>
                <li className={styles.smartFilteringSystemTheCa}>
                  <b
                    className={styles.theCardRedirects}
                  >{`Respond Promptly: `}</b>
                  <span className={styles.theCardRedirects}>
                    Monitor your Google review page regularly and respond to
                    reviews, whether positive or negative. Acknowledging
                    feedback shows your dedication to customer satisfaction.
                  </span>
                </li>
                <li>
                  <b
                    className={styles.theCardRedirects}
                  >{`Utilize Feedback: `}</b>
                  <span className={styles.theCardRedirects}>
                    Use insights from customer feedback to make informed
                    business decisions and continuously improve your products
                    and services.
                  </span>
                </li>
              </ol>
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer1"
            />
          </div>
          <div className={styles.whatAreNfcEnabledGoogleReParent}>
            <b className={styles.introduction}>Conclusion</b>
            <div className={styles.imagineAConvenient}>
              Incorporating NFC-enabled Google Review cards into your business
              strategy can revolutionize how you manage customer feedback and
              online reviews. By simplifying the review process and enhancing
              customer engagement, you not only boost your online reputation but
              also strengthen your SEO presence. Embrace this innovative tool
              today and watch your business thrive in the digital landscape.
            </div>
          </div>
          <div className={styles.checkOutSmaparkasGoogleReWrapper}>
            <div
              className={styles.checkOutSmaparkasContainer}
              onClick={onCheckOutSmaparkasClick}
            >
              {`Check out `}
              <span className={styles.smaparkasGoogleReview}>
                Smaparka’s Google Review Stand
              </span>
            </div>
          </div>
          <div className={styles.rectangleParent}>
            <img
              className={styles.frameItem}
              alt=""
              src="/ReviewScreenPic.png"
            />
            <div className={styles.howItWorks}>
              Keywords: Google review Nepal, Google Business profile Nepal, NFC
              Google review in Nepal, reputation management system Nepal,
              improve Google reviews Nepal, streamline feedback process Nepal,
              enhance online reputation Nepal.
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer"
            />
          </div>
        </div>
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
            <img className={styles.vectorIcon} alt="" src="/FacebookVector.png" />
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

ReviewComponent.propTypes = {
  className: PropTypes.string,
};

export default ReviewComponent;
