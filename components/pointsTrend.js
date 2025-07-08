import { useCallback } from "react";
import PropTypes from "prop-types";
import styles from "./loyaltySamparka.module.css";
import { useRouter } from "next/router";

const points = ({ className = "" }) => {
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
             The Rise of the Point Economy: Why Loyalty Is the New Currency in Nepal
            </b>
            <div className={styles.elevateCustomerLoyalty}>
           Walk into any cafe, hop into a ride, or pay for groceries with your digital wallet in Kathmandu, 
           and chances are you’re earning points. FonePoints. Pathao Points. Bank Reward Points. Loyalty 
           programs are no longer perks; they’re becoming standard practice.<br/>
           But what’s the real reason behind this trend? Why are businesses from fintech giants to 
           local shops suddenly investing in reward systems?<br/>
           Let’s break down what’s happening beneath the surface, and why platforms like Samparka 
           are transforming loyalty from a gimmick into a strategic asset.<br/>
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
        <img
          className={styles.image33Icon}
          alt=""
          src="/pointsNepal.png"
        />
        <div className={styles.reviews} />
      </div>

      <div className={styles.frameChild} />

      {/* Article Content */}
      <div className={styles.frameParent1}>
        <div className={styles.frameParent2}>
         

          {/* A Gathering Place for All Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>The Logic: Why Businesses Are Betting on Reward Points</b>
            <div className={styles.digitalLoyaltySolution}>
                For a business owner, the core question is:
                <br/>"Why would I give points to customers instead of just taking payment and moving on?"
                <ol>
                <li>Retention is greater than Acquisition<br/>
                It’s far cheaper to keep an existing customer than to attract a new one. Reward systems nudge people to return—not out of obligation, but out of progress.
                Every point feels like a step toward something.
                </li>
                <li>
                Habits is equal to Revenue<br/>
                Points create habit loops. <br/>                                                                                                         
                Spend → earn → feel good → repeat.<br/>
                It builds predictable, repeatable behavior; something every business craves.<br/>
                </li>
                <li>
                Smart Rewards aren't Discounts<br/>
                Discounts reduce revenue immediately.<br/>
                Points delay the reward and offer value without hurting today’s income. It’s a smarter way to offer “something extra.”<br/>
                </li>
                <li>
                Data Becomes Action<br/>
                With reward systems, businesses track:<br/>
                <ul>
                <li>How often customers return</li>
            	<li>When they drop off</li>
            	<li>Who their most valuable customers are</li></ul>
                This isn't just helpful, it’s the difference between guessing and growing.
                </li>
                <li>
                Customer Belonging<br/>
                People want to feel seen. When a business tracks loyalty, customers feel recognized and
                remembered. That emotion builds brand connection without spending more on ads.

                </li>
                </ol>
            </div>
            
     

      <div className={styles.frameChild} />
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>

          {/* The Piccolo Experience Section */}
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>Kathmandu’s Loyalty Landscape </b>
            <div className={styles.digitalLoyaltySolution}>
                Nepal has caught the loyalty bug. Fonepay lets users rack up FonePoints with QR
                transactions. Pathao Points incentivize frequent rides and orders.<br/>
                These platforms gamify everyday spending and consumers are responding.
                In a digital first, competitive market, rewards influence decisions.<br/>
                But what about the thousands of cafes, barbershops, bakeries, and boutiques
                that aren’t on these platforms? How do they create loyalty without building their own app?<br/>
            </div>
            
            <div className={styles.frameChild} />
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>

          <div className={styles.whyUpgradeParent}>
          
            <b className={styles.introduction}>This Is Where Samparka Changes the Game</b>
            
            <div className={styles.digitalLoyaltySolution}>
              Samparka equips local businesses with the power of loyalty without the tech burden.
              No app development. No complicated systems. Just one tap.<br/>
              <b>How it works:</b>
              A customer pays.
              They tap their phone on an NFC enabled Samparka token.<br/>
            Instantly, they receive loyalty points. No app required.<br/>
            For the business, it’s plug and play:<br/>
            A dashboard shows real-time loyalty insights.<br/>
            They customize rewards to suit their customers.<br/>
            New features like fun mini-games enhances the post-payment 
            experience. Samparka blends tech, psychology, and simplicity into one experience.


            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>
          
            <img
              className={styles.frameChild}
              alt=""
              src="/pointsNepalBanner.png"
            />
          <div className={styles.whyUpgradeParent}>
            <b className={styles.introduction}>Businesses With vs. Without Samparka</b>
            <div className={styles.digitalLoyaltySolution}>
              <div style={{ display: 'flex', gap: '16px' }}>
  <div style={{ flex: 1 }}>
    <h3>🚫 Without Samparka</h3>
    <ul>
      <li>Manual or missing loyalty</li>
      <li>No way to reward top customers</li>
      <li>No follow-up after sale</li>
      <li>Easy to be forgotten</li>
    </ul>
  </div>
  <div style={{ flex: 1 }}>
    <h3>✨ With Samparka</h3>
    <ul>
      <li>Tap-based loyalty experience</li>
      <li>Customer insights & rewards</li>
      <li>Fun memory-creating moments</li>
      <li>Built-in reasons to return</li>
    </ul>
  </div>
</div>
<div className={styles.image33Parent}>
        <img
          className={styles.image33Icon}
          alt=""
          src="/pointsTrend.png"
        />
        <div className={styles.reviews} />
      </div>


              {" "}
            </div>
            <div
              className={styles.anchorFrame7699}
              data-scroll-to="frameContainer2"
            />
          </div>

          

            
          <div className={styles.image33Parent}>
            <img
              className={styles.frameChild}
              alt=""
              src="/pointsNepalBanner.png"
            />
            <div className={styles.reviews} />
          </div>

          {/* Conclusion Section */}
          <div className={styles.whatIsDigitalLoyaltySolutiParent}>
            <b className={styles.introduction}> The Future of Loyalty in Nepal</b>
            <div className={styles.digitalLoyaltySolution}>
            
            As Nepal’s digital economy grows, so will the expectations around how businesses treat their customers.
            Reward points aren’t going away, they’re evolving.<br/>
            Samparka isn’t just helping local businesses join the trend.<br/>
            It’s helping them lead it by making loyalty smarter, deeper, and human again. <br/>

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

points.propTypes = {
  className: PropTypes.string,
};

export default points;
