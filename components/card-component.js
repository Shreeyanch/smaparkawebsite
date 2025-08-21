import { useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./card-component.module.css";
import { useRouter } from "next/router";


const CardComponent = ({ className = "" }) => {
  const router = useRouter();

  const onCheckOutSmaparkasClick = useCallback(() => {
    router.push("/smart-business-card");
  }, [router]);

  const onGroupButtonClick = useCallback(() => {
    window.open("https://wa.me/9779766387030");
  }, []);

  const onGroupButtonClick1 = useCallback(() => {
    window.open(
      "https://www.facebook.com/SamparkaTechServices"
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
                <div className={styles.minRead}>2 min read</div>
              </div>
            </div>
            <b className={styles.upgradeYourNetworking}>
              Upgrade Your Networking with Smart NFC Business Cards in Nepal
            </b>
            <div className={styles.elevateYourProfessional}>
              Elevate Your Professional Connections with Smart NFC Business
              Cards in Nepal
            </div>
          </div>
          <div className={styles.articleAuthorWrapper}>
            <div className={styles.articleAuthor}>
              <img className={styles.avatarIcon} alt="" src="/avatar@2x.png" />
              <div className={styles.authorText}>
                <div className={styles.shreeyanchShrestha}>
                  Shreeyanch Shrestha
                </div>
                <div className={styles.postedOnMay}>Posted on May 17, 2024</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.image33Parent}>
        <img className={styles.image33Icon} alt="" src="/image-33@2x.png" />
        <div className={styles.reviews} />
      </div>
      <div className={styles.frameChild} />
      <div className={styles.frameParent1}>
        <div className={styles.frameParent2}>
          <div className={styles.introductionParent}>
            <b className={styles.introduction}>Introduction</b>
            <div className={styles.inTodaysDigital}>
              In today's digital age, first impressions are crucial, especially
              in Nepal's competitive business landscape. Traditional paper
              business cards are quickly becoming outdated as smart NFC (Near
              Field Communication) business cards revolutionize how
              professionals connect and share information. Let's explore why
              upgrading to a smart NFC business card can significantly enhance
              your networking capabilities in Nepal.
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer5"
            />
          </div>
          <div
            className={styles.whyChooseSmartNfcBusinessParent}
            data-scroll-to="frameContainer4"
          >
            <b className={styles.whyChooseSmart}>
              Why Choose Smart NFC Business Cards?
            </b>
            <div className={styles.smartNfcBusiness}>
              Smart NFC business cards offer a modern solution to traditional
              paper cards by integrating digital technology into networking.
              Instead of fumbling with stacks of paper, a single NFC-enabled
              card stores and transmits contact information, portfolios, and
              other key details with a simple tap.
            </div>
          </div>
          <div className={styles.paperCardVsOneNfcCardParent}>
            <b className={styles.paperCardVs}>Paper Card vs. One NFC Card</b>
            <div className={styles.smartNfcBusiness}>
              <ol className={styles.convenienceAndEfficiencyOn}>
                <li className={styles.interactiveAndEngagingNfc}>
                  <span
                    className={styles.convenienceAndEfficiency}
                  >{`Convenience and Efficiency: `}</span>
                  <span>
                    One smart NFC card replaces multiple paper cards, reducing
                    clutter and making it easier to manage and share contact
                    information.
                  </span>
                </li>
                <li className={styles.interactiveAndEngagingNfc}>
                  <span
                    className={styles.convenienceAndEfficiency}
                  >{`Interactive and Engaging: `}</span>
                  <span className={styles.nfcTechnologyAllows}>
                    NFC technology allows recipients to instantly access your
                    digital portfolio, LinkedIn profile, or website, enhancing
                    engagement and leaving a lasting impression.
                  </span>
                </li>
                <li>
                  <span
                    className={styles.convenienceAndEfficiency}
                  >{`Environmentally Friendly: `}</span>
                  <span className={styles.nfcTechnologyAllows}>
                    Reduce paper waste and contribute to sustainability efforts
                    by opting for a digital alternative to traditional paper
                    cards.
                  </span>
                </li>
              </ol>
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer3"
            />
          </div>
          <div className={styles.paperCardVsOneNfcCardParent}>
            <b className={styles.introduction}>
              Benefits of Smart NFC Business Cards in Nepal
            </b>
            <div className={styles.smartNfcBusiness}>
              <ol className={styles.convenienceAndEfficiencyOn}>
                <li className={styles.interactiveAndEngagingNfc}>
                  <span className={styles.convenienceAndEfficiency}>
                    Instant Information Sharing:
                  </span>
                  <span>
                    {" "}
                    Share contact details, social media profiles, and portfolio
                    links seamlessly.
                  </span>
                </li>
                <li className={styles.interactiveAndEngagingNfc}>
                  <span
                    className={styles.convenienceAndEfficiency}
                  >{`Enhanced Professional Image: `}</span>
                  <span className={styles.nfcTechnologyAllows}>
                    Impress contacts with innovative technology that reflects
                    your modern approach to business.
                  </span>
                </li>
                <li>
                  <span
                    className={styles.convenienceAndEfficiency}
                  >{`Data Security: `}</span>
                  <span className={styles.nfcTechnologyAllows}>
                    NFC technology is secure and ensures that your information
                    is transmitted safely.
                  </span>
                </li>
              </ol>
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>
          <div className={styles.paperCardVsOneNfcCardParent}>
            <b className={styles.introduction}>
              Comparison with Traditional Paper Cards
            </b>
            <div className={styles.smartNfcBusiness}>
              <ol className={styles.convenienceAndEfficiencyOn}>
                <li className={styles.interactiveAndEngagingNfc}>
                  <span className={styles.convenienceAndEfficiency}>
                    Versatility:
                  </span>
                  <span>
                    {" "}
                    NFC cards can be updated remotely, ensuring that your
                    information is always current.
                  </span>
                </li>
                <li>
                  <span
                    className={styles.convenienceAndEfficiency}
                  >{`Memorability: `}</span>
                  <span className={styles.nfcTechnologyAllows}>
                    Stand out in networking events and meetings with a memorable
                    and interactive exchange of information.
                  </span>
                </li>
              </ol>
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer1"
            />
          </div>
          <div className={styles.whyChooseSmartNfcBusinessParent}>
            <b className={styles.introduction}>Conclusion</b>
            <div className={styles.smartNfcBusiness}>
              Upgrading to a smart NFC business card offers a streamlined,
              environmentally-friendly way to network effectively in Nepal's
              digital world. Make a lasting impression with innovative
              technology that enhances engagement and professionalism. Ready to
              elevate your networking game in Nepal? Contact us today to
              discover how a smart NFC business card can transform your
              professional interactions.
            </div>
          </div>
          <div className={styles.checkOutSmaparkasSmartNfcWrapper}>
            <div
              className={styles.checkOutSmaparkasContainer}
              onClick={onCheckOutSmaparkasClick}
            >
              {`Check out `}
              <span className={styles.smaparkasSmartNfc}>
                Smaparka’s Smart NFC Business Card
              </span>
            </div>
          </div>
          <div className={styles.rectangleParent}>
            <img
              className={styles.frameItem}
              alt=""
              src="/rectangle-491@2x.png"
            />
            <div className={styles.paperCardVs}>
              Keywords: Smart NFC business card Nepal, NFC business card Nepal,
              digital business card Nepal, NFC technology business card Nepal,
              electronic business card Nepal, smart contactless card Nepal,
              digital networking card Nepal, NFC enabled business card Nepal,
              smart card for business Nepal, digital networking solution Nepal,
              NFC card benefits Nepal, NFC technology advantages Nepal,
              contactless business card Nepal, digital networking tool Nepal
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
            <img className={styles.vectorIcon} alt="" src="/Facebookvector.png" />
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

CardComponent.propTypes = {
  className: PropTypes.string,
};

export default CardComponent;
