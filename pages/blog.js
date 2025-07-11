import { useCallback } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import styles from "./index.module.css";
import { useRouter } from "next/router";

const Blog = () => {
  const router = useRouter();
  const onHomeTextClick = useCallback(() => {
    const anchor = document.querySelector("[data-scroll-to='heroSection']");
    if (anchor) {
      anchor.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, []);
  const onFrameLinkClick = useCallback(() => {
    router.push("/enhance-customer-loyalty-with");
  }, [router]);

  const onFrameLinkClick1 = useCallback(() => {
    router.push("/boost-your-business-with-n-f-c-e ");
  }, [router]);

  const onFrameLinkClick2 = useCallback(() => {
    router.push("/upgrade-your-networking-with-s");
  }, [router]);

  const onFrameLinkClick3 = useCallback(() => {
    router.push("/piccolo-where-coffee-meets-community");
  }, [router]);

  const onFrameLinkClick4 = useCallback(() => {
    router.push("/tsubaki-transforming-beauty-into-empowerment");
  }, [router]);

  const onFrameLinkClick5 = useCallback(() => {
    router.push("/ThreadsNTrends-Where-Sneaker-Culture-Finds-Its-Sole");
  }, [router]);

  const onFrameLinkClick6 = useCallback(() => {
    router.push("/TheNewBarber-Crafting-Style-from-the-Ground-Up");
  }, [router]);

  const onFrameLinkClick7 = useCallback(() => {
    router.push("/caffeophilia-for-dreamers-with-coffee-in-their");
  }, [router]);

  const onFrameLinkClick8 = useCallback(() => {
    router.push("/loyalty-elevated");
  }, [router]);

  const onFrameLinkClick9 = useCallback(() => {
    router.push("/mira-bakery");
  }, [router]);
  const onFrameLinkClick10 = useCallback(() => {
    router.push("/points-economy");
  }, [router]);
  return (
    <div className={styles.home}>
      <Header onHomeTextClick={onHomeTextClick} />
      <div className={styles.blogCatHeadersParent}>
        <div className={styles.blogCatHeaders}>
          <div className={styles.discoverOurBlogs}>Discover our blog</div>
        </div>
        <div className={styles.frameParent}>
          <a className={styles.rectangleParent} onClick={onFrameLinkClick1}>
            <img className={styles.frameChild} alt="" src="/Rectangle478.png" />
            <div className={styles.frameGroup}>
              <div className={styles.frameContainer}>
                <div className={styles.frameDiv}>
                  <div className={styles.frameWrapper}>
                    <div className={styles.minReadWrapper}>
                      <div className={styles.minRead}>3 min read</div>
                    </div>
                  </div>
                  <b className={styles.boostYourBusiness}>
                    Boost Your Business with NFC-Enabled Google Review Cards in
                    Nepal
                  </b>
                </div>
                <div className={styles.asABusinessOwnerInNepalWrapper}>
                  <div className={styles.asABusiness}>
                    As a business owner in Nepal, leveraging Google reviews
                    effectively can ...
                  </div>
                </div>
              </div>
              <div className={styles.frameItem} />
              <div className={styles.articleAuthor}>
                <img className={styles.avatarIcon} alt="" src="/Yeshi.png" />
                <div className={styles.authorText}>
                  <div className={styles.yeshiDolkar}>Yeshi Dolkar</div>
                  <div className={styles.postedOnJun}>
                    Posted on Jun 8, 2024
                  </div>
                </div>
              </div>
            </div>
          </a>
          <a className={styles.rectangleParent} onClick={onFrameLinkClick}>
            <img
              className={styles.frameChild}
              alt=""
              src="/Loyaltyscreenpic.png"
            />
            <div className={styles.frameGroup}>
              <div className={styles.frameContainer}>
                <div className={styles.frameDiv}>
                  <div className={styles.frameWrapper}>
                    <div className={styles.minReadContainer}>
                      <div className={styles.minRead}>2 min read</div>
                    </div>
                  </div>
                  <b className={styles.boostYourBusiness}>
                    Enhance Customer Loyalty with Digital Loyalty Solution
                    Software
                  </b>
                </div>
                <div className={styles.asABusinessOwnerInNepalWrapper}>
                  <div className={styles.transformFromTraditional}>
                    Transform from traditional punch cards to cloud-based
                    digital loyalty solutions ...
                  </div>
                </div>
              </div>
              <div className={styles.lineParent}>
                <div className={styles.lineDiv} />
                <div className={styles.articleAuthor1}>
                  <img
                    className={styles.avatarIcon1}
                    alt=""
                    src="/Dipendra.png"
                  />
                  <div className={styles.authorText}>
                    <div className={styles.yeshiDolkar}>Dipendera Shah</div>
                    <div className={styles.postedOnMay}>
                      Posted on Jun 17, 2024
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
          <a className={styles.rectangleParent} onClick={onFrameLinkClick2}>
            <img
              className={styles.frameChild}
              alt=""
              src="/rectangle-478@2x.png"
            />
            <div className={styles.frameGroup}>
              <div className={styles.frameContainer}>
                <div className={styles.frameDiv}>
                  <div className={styles.frameWrapper}>
                    <div className={styles.minReadContainer}>
                      <div className={styles.minRead}>2 min read</div>
                    </div>
                  </div>
                  <b className={styles.boostYourBusiness}>
                    Upgrade Your Networking with Smart NFC Business Cards in
                    Nepal
                  </b>
                </div>
                <div className={styles.asABusinessOwnerInNepalWrapper}>
                  <div className={styles.asABusiness}>
                    Smart NFC business cards offer a modern solution to
                    traditional paper cards ...
                  </div>
                </div>
              </div>
              <div className={styles.lineParent}>
                <div className={styles.frameChild2} />
                <div className={styles.articleAuthor1}>
                  <img
                    className={styles.avatarIcon1}
                    alt=""
                    src="/avatar@2x.png"
                  />
                  <div className={styles.authorText}>
                    <div className={styles.shreeyanchShrestha}>
                      Shreeyanch Shrestha
                    </div>
                    <div className={styles.postedOnMay}>
                      Posted on May 17, 2024
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
          <a className={styles.rectangleParent} onClick={onFrameLinkClick3}>
            <img
              className={styles.frameChild}
              alt=""
              src="/piccolo_banner.png"
            />

            <div className={styles.frameGroup}>
              <div className={styles.frameContainer}>
                <div className={styles.frameDiv}>
                  <div className={styles.frameWrapper}>
                    <div className={styles.minReadContainer}>
                      <div className={styles.minRead}>5 min read</div>
                    </div>
                  </div>
                  <b className={styles.boostYourBusiness}>
                    Piccolo: Where Coffee Meets Community
                  </b>
                </div>
                <div className={styles.asABusinessOwnerInNepalWrapper}>
                  <div className={styles.asABusiness}>
                    Piccolo is more than just a coffee shop—it is a vital
                    community hub where ideas are exchanged ...
                  </div>
                </div>
              </div>
              <div className={styles.lineParent}>
                <div className={styles.frameChild2} />
                <div className={styles.articleAuthor1}>
                  <img
                    className={styles.avatarIcon1}
                    alt=""
                    src="/avatar@2x.png"
                  />
                  <div className={styles.authorText}>
                    <div className={styles.shreeyanchShrestha}>
                      Shreeyanch Shrestha
                    </div>
                    <div className={styles.postedOnMay}>
                      Posted on Mar 26, 2025
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
          <a className={styles.rectangleParent} onClick={onFrameLinkClick4}>
            <img
              className={styles.frameChild}
              alt=""
              src="/TsubakiBanner.png"
            />
            <div className={styles.frameGroup}>
              <div className={styles.frameContainer}>
                <div className={styles.frameDiv}>
                  <div className={styles.frameWrapper}>
                    <div className={styles.minReadContainer}>
                      <div className={styles.minRead}>5 min read</div>
                    </div>
                  </div>
                  <b className={styles.boostYourBusiness}>
                    Tsubaki: Empowering Beauty, Elevating Confidence
                  </b>
                </div>
                <div className={styles.asABusinessOwnerInNepalWrapper}>
                  <div className={styles.asABusiness}>
                    At Tsubaki Salon, beauty goes beyond appearance; it’s about
                    transforming how you feel ...
                  </div>
                </div>
              </div>
              <div className={styles.lineParent}>
                <div className={styles.frameChild2} />
                <div className={styles.articleAuthor1}>
                  <img
                    className={styles.avatarIcon1}
                    alt=""
                    src="/sampada.jpg"
                  />
                  <div className={styles.authorText}>
                    <div className={styles.shreeyanchShrestha}>
                      Sampada Basnet
                    </div>
                    <div className={styles.postedOnMay}>
                      Posted on Mar 29, 2025
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
          <a className={styles.rectangleParent} onClick={onFrameLinkClick5}>
            <img
              className={styles.frameChild}
              alt=""
              src="/threadsntrendsbanner.png"
            />
            <div className={styles.frameGroup}>
              <div className={styles.frameContainer}>
                <div className={styles.frameDiv}>
                  <div className={styles.frameWrapper}>
                    <div className={styles.minReadContainer}>
                      <div className={styles.minRead}>5 min read</div>
                    </div>
                  </div>
                  <b className={styles.boostYourBusiness}>
                    ThreadsNTrends: Where Sneaker Culture Finds Its Sole
                  </b>
                </div>
                <div className={styles.asABusinessOwnerInNepalWrapper}>
                  <div className={styles.asABusiness}>
                    Sneaker culture is more than just fashion—it's a lifestyle.
                    Yet, in Nepal, finding authentic sneakers was a challenge...
                  </div>
                </div>
              </div>
              <div className={styles.lineParent}>
                <div className={styles.frameChild2} />
                <div className={styles.articleAuthor1}>
                  <img
                    className={styles.avatarIcon1}
                    alt=""
                    src="/samanlama.jpg"
                  />
                  <div className={styles.authorText}>
                    <div className={styles.shreeyanchShrestha}>Saman Lama</div>
                    <div className={styles.postedOnMay}>
                      Posted on Apr 6, 2025
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
          <a className={styles.rectangleParent} onClick={onFrameLinkClick6}>
            <img
              className={styles.frameChild}
              alt=""
              src="/thenewbarbersbanner.png"
            />
            <div className={styles.frameGroup}>
              <div className={styles.frameContainer}>
                <div className={styles.frameDiv}>
                  <div className={styles.frameWrapper}>
                    <div className={styles.minReadContainer}>
                      <div className={styles.minRead}>7 min read</div>
                    </div>
                  </div>
                  <b className={styles.boostYourBusiness}>
                    The New Barber: Crafting Style from the Ground Up
                  </b>
                </div>
                <div className={styles.asABusinessOwnerInNepalWrapper}>
                  <div className={styles.asABusiness}>
                    Grooming is more than appearance—it's identity, expression,
                    and confidence. At The New Barbers, we’re not just creating
                    haircuts; we’re creating moments...{" "}
                  </div>
                </div>
              </div>
              <div className={styles.lineParent}>
                <div className={styles.frameChild2} />
                <div className={styles.articleAuthor1}>
                  <img
                    className={styles.avatarIcon1}
                    alt=""
                    src="/samanlama.jpg"
                  />
                  <div className={styles.authorText}>
                    <div className={styles.shreeyanchShrestha}>Saman Lama</div>
                    <div className={styles.postedOnMay}>
                      Posted on Apr 11, 2025
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
          <a className={styles.rectangleParent} onClick={onFrameLinkClick7}>
            <img
              className={styles.frameChild}
              alt=""
              src="/caffeophiliabanner.png"
            />
            <div className={styles.frameGroup}>
              <div className={styles.frameContainer}>
                <div className={styles.frameDiv}>
                  <div className={styles.frameWrapper}>
                    <div className={styles.minReadContainer}>
                      <div className={styles.minRead}>5 min read</div>
                    </div>
                  </div>
                  <b className={styles.boostYourBusiness}>
                    Caffeophilia: For Dreamers with Coffee in Their Hearts
                  </b>
                </div>
                <div className={styles.asABusinessOwnerInNepalWrapper}>
                  <div className={styles.asABusiness}>
                    Caffeophilia, a specialty coffee shop concept by Katmandu
                    Coffee, is more than just a café—it’s a celebration of
                    Nepali coffee culture reimagined for the modern world. ...{" "}
                  </div>
                </div>
              </div>
              <div className={styles.lineParent}>
                <div className={styles.frameChild2} />
                <div className={styles.articleAuthor1}>
                  <img
                    className={styles.avatarIcon1}
                    alt=""
                    src="/avatar@2x.png"
                  />
                  <div className={styles.authorText}>
                    <div className={styles.shreeyanchShrestha}>
                      Shreeyanch Shrestha
                    </div>
                    <div className={styles.postedOnMay}>
                      Posted on Apr 16, 2025
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
          {/* changes made by sweta */}
          {/* Blog for Mira*/}
          <a className={styles.rectangleParent} onClick={onFrameLinkClick9}>
            <img className={styles.frameChild} alt="" src="/miraBanner.png" />
            <div className={styles.frameGroup}>
              <div className={styles.frameContainer}>
                <div className={styles.frameDiv}>
                  <div className={styles.frameWrapper}>
                    <div className={styles.minReadContainer}>
                      <div className={styles.minRead}>5 min read</div>
                    </div>
                  </div>
                  <b className={styles.boostYourBusiness}>
                    Mira Boulangerie: A Quiet Pause in the Heart of the City
                  </b>
                </div>
                <div className={styles.asABusinessOwnerInNepalWrapper}>
                  <div className={styles.asABusiness}>
                    In the calm corners of Sanepa and the lively streets of
                    Durbarmarg, Mira Boulangerie & Patisserie is one of those
                    rare places that feels like a soft exhale. For anyone
                    who’s...{" "}
                  </div>
                </div>
              </div>
              <div className={styles.lineParent}>
                <div className={styles.frameChild2} />
                <div className={styles.articleAuthor1}>
                  <img className={styles.avatarIcon1} alt="" src="/sweta.jpg" />
                  <div className={styles.authorText}>
                    <div className={styles.shreeyanchShrestha}>Sweta Thapa</div>
                    <div className={styles.postedOnMay}>
                      Posted on July 4,2025
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
          {/*loyaltySamaparka */}
          <a className={styles.rectangleParent} onClick={onFrameLinkClick8}>
            <img className={styles.frameChild} alt="" src="/redefine2.png" />
            <div className={styles.frameGroup}>
              <div className={styles.frameContainer}>
                <div className={styles.frameDiv}>
                  <div className={styles.frameWrapper}>
                    <div className={styles.minReadContainer}>
                      <div className={styles.minRead}>5 min read</div>
                    </div>
                  </div>
                  <b className={styles.boostYourBusiness}>
                    Redefining Customer Loyalty for Modern Businesses
                  </b>
                </div>
                <div className={styles.asABusinessOwnerInNepalWrapper}>
                  <div className={styles.asABusiness}>
                    Let’s be honest. These days, getting someone’s attention is
                    tough. Keeping it? Even tougher. We’re scrolling past ads
                    like microbuses ignoring red lights, and dodging ...{" "}
                  </div>
                </div>
              </div>
              <div className={styles.lineParent}>
                <div className={styles.frameChild2} />
                <div className={styles.articleAuthor1}>
                  <img className={styles.avatarIcon1} alt="" src="/sweta.jpg" />
                  <div className={styles.authorText}>
                    <div className={styles.shreeyanchShrestha}>Sweta Thapa</div>
                    <div className={styles.postedOnMay}>
                      Posted on Jul 2, 2025
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
          {/*points economy*/}
          <a className={styles.rectangleParent} onClick={onFrameLinkClick10}>
            <img className={styles.frameChild} alt="" src="/pointsBanner.jpg" />
            <div className={styles.frameGroup}>
              <div className={styles.frameContainer}>
                <div className={styles.frameDiv}>
                  <div className={styles.frameWrapper}>
                    <div className={styles.minReadContainer}>
                      <div className={styles.minRead}>5 min read</div>
                    </div>
                  </div>
                  <b className={styles.boostYourBusiness}>
                    The Rise of the Point Economy: Why Loyalty Is the New
                    Currency in Nepal
                  </b>
                </div>
                <div className={styles.asABusinessOwnerInNepalWrapper}>
                  <div className={styles.asABusiness}>
                    Walk into any cafe, hop into a ride, or pay for groceries
                    with your digital wallet in Kathmandu, and chances.....
                  </div>
                </div>
              </div>
              <div className={styles.lineParent}>
                <div className={styles.frameChild2} />
                <div className={styles.articleAuthor1}>
                  <img className={styles.avatarIcon1} alt="" src="/sweta.jpg" />
                  <div className={styles.authorText}>
                    <div className={styles.shreeyanchShrestha}>Sweta Thapa</div>
                    <div className={styles.postedOnMay}>
                      Posted on July 8, 2025
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
      <Footer lETTERLOGO1="/letter-logo-1@2x.png" />
    </div>
  );
};

export default Blog;
