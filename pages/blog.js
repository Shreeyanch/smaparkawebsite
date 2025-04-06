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

  return (
    <div className={styles.home}>
      <Header onHomeTextClick={onHomeTextClick} />
      <div className={styles.blogCatHeadersParent}>
        <div className={styles.blogCatHeaders}>
          <div className={styles.discoverOurBlogs}>Discover our blog</div>
        </div>
        <div className={styles.frameParent}>
          <a className={styles.rectangleParent} onClick={onFrameLinkClick1}>
            <img
              className={styles.frameChild}
              alt=""
              src="/Rectangle478.png"
            />
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
                <img
                  className={styles.avatarIcon}
                  alt=""
                  src="/Yeshi.png"
                />
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
                  Piccolo is more than just a coffee shop—it is a vital community hub where ideas are exchanged ...
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
                  At Tsubaki Salon, beauty goes beyond appearance; it’s about transforming how you feel ...
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
                  Sneaker culture is more than just fashion—it's a lifestyle. Yet, in Nepal, finding authentic sneakers was a challenge...
                  </div>
                </div>
              </div>
              <div className={styles.lineParent}>
                <div className={styles.frameChild2} />
                <div className={styles.articleAuthor1}>
                  <img
                    className={styles.avatarIcon1}
                    alt=""
                    src="/saman.jpg"
                  />
                  <div className={styles.authorText}>
                    <div className={styles.shreeyanchShrestha}>
                      Saman Lama
                    </div>
                    <div className={styles.postedOnMay}>
                      Posted on Apr 16, 2025
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
