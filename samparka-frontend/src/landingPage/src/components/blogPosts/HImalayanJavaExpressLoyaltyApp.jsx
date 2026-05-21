// src/components/blogPosts/HimalayanJavaExpressLoyaltyApp.jsx

export const HimalayanJavaExpressLoyaltyApp = {
  id: 15,
  slug: "himalayan-java-express-loyalty-program-customer-segmentation-samparka",
  title: "How Himalayan Java Express Knows Every Customer Who Walks In",
  excerpt:
    "In under a month, Himalayan Java Express built a loyalty base of thousands of customers, tracked tens of thousands of visits, and hit a repeat rate that outperforms most cafés globally. Here's exactly how they did it — and what they do differently for every type of customer.",
  author: "Shreeyanch Shrestha",
  authorImage: "https://s3-np1.datahub.com.np/samparka/shreeyanch.png",
  authorBio: "Founder at Samparka. Writes about customer retention for independent restaurants, cafés, and salons.",
  date: "Mar 25, 2026",
  publishedAt: "2026-03-25",
  readTime: "11 min read",
  category: "Case Study",
  featured: true,
    image: "https://s3-np1.datahub.com.np/samparka/blogassets/himalayanjavaloyaltycasestudy.png",

  content: `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

      .hj-root {
        font-family: 'DM Sans', sans-serif;
        color: #1a1a1a;
        line-height: 1.8;
        max-width: 800px;
        margin: 0 auto;
      }
      .hj-root * { box-sizing: border-box; }

      /* ── Hero ── */
      .hj-hero {
        position: relative;
        background: #0d0d0d;
        border-radius: 16px;
        overflow: hidden;
        margin-bottom: 3rem;
        padding: 4rem 3rem;
      }
      .hj-hero-bg {
        position: absolute; inset: 0;
        background: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 40%, #0a2318 100%);
        opacity: 1;
      }
      .hj-hero-accent {
        position: absolute;
        top: -60px; right: -60px;
        width: 300px; height: 300px;
        background: radial-gradient(circle, rgba(1,110,73,0.4) 0%, transparent 70%);
        border-radius: 50%;
      }
      .hj-hero-content { position: relative; z-index: 1; }
      .hj-hero-eyebrow {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: #4ade80;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .hj-hero-eyebrow::before {
        content: '';
        display: block;
        width: 24px; height: 2px;
        background: #4ade80;
      }
      .hj-hero h1 {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: clamp(2rem, 5vw, 3.2rem);
        font-weight: 700;
        color: #fff;
        margin: 0 0 1.2rem;
        line-height: 1.15;
        max-width: 580px;
      }
      .hj-hero-sub {
        color: rgba(255,255,255,0.6);
        font-size: 1.05rem;
        max-width: 520px;
        margin: 0 0 2.5rem;
        line-height: 1.7;
        font-weight: 300;
      }
      .hj-hero-numbers {
        display: flex;
        gap: 2.5rem;
        flex-wrap: wrap;
      }
      .hj-hero-num { display: flex; flex-direction: column; gap: 2px; }
      .hj-hero-num-val {
        font-size: 2.2rem;
        font-weight: 800;
        color: #4ade80;
        line-height: 1;
        font-variant-numeric: tabular-nums;
      }
      .hj-hero-num-label {
        font-size: 0.72rem;
        color: rgba(255,255,255,0.45);
        font-weight: 500;
        letter-spacing: 0.03em;
      }

      /* ── Prose ── */
      .hj-root p {
        color: #374151;
        margin-bottom: 1.4rem;
        font-size: 1.05rem;
        font-weight: 400;
      }
      .hj-root h2 {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: clamp(1.5rem, 4vw, 2.1rem);
        font-weight: 700;
        color: #0d0d0d;
        margin: 3.5rem 0 1.1rem;
        line-height: 1.2;
      }
      .hj-root h3 {
        font-size: 1rem;
        font-weight: 700;
        color: #016e49;
        margin: 2rem 0 0.6rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      /* ── Image block ── */
      .hj-img-block {
        width: 100%;
        border-radius: 12px;
        overflow: hidden;
        margin: 2rem 0;
        background: #0d0d0d;
      }
      .hj-img-block img {
        width: 100%;
        display: block;
        object-fit: cover;
        max-height: 480px;
      }
      .hj-img-caption {
        padding: 0.6rem 1.2rem;
        background: #e8f5ee;
        font-size: 0.78rem;
        color: #4b7a62;
        font-style: italic;
      }

      /* ── Pull quote ── */
      .hj-pullquote {
        border-left: 4px solid #016e49;
        padding: 0.5rem 0 0.5rem 1.8rem;
        margin: 2.5rem 0;
      }
      .hj-pullquote p {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 1.3rem;
        font-style: italic;
        color: #0d0d0d;
        font-weight: 400;
        line-height: 1.5;
        margin: 0;
      }

      /* ── Callout ── */
      .hj-callout {
        background: #f0faf5;
        border: 1px solid #b6d9c7;
        border-radius: 10px;
        padding: 1.2rem 1.5rem;
        margin: 1.8rem 0;
        font-size: 0.97rem;
        color: #1a3d2b;
      }
      .hj-callout strong { color: #016e49; }

      /* ── Source pill ── */
      .hj-src {
        display: inline-block;
        font-size: 0.67rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        background: #e6f4ee;
        color: #016e49;
        border-radius: 4px;
        padding: 1px 6px;
        margin-left: 3px;
        vertical-align: middle;
        text-decoration: none;
      }
      .hj-src:hover { background: #016e49; color: #fff; }

      /* ── Segment cards ── */
      .hj-segments {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin: 2rem 0;
      }
      .hj-seg {
        border-radius: 12px;
        padding: 1.3rem 1.2rem;
        border: 1.5px solid transparent;
        position: relative;
        overflow: hidden;
      }
      .hj-seg::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
      }
      .hj-seg.new    { background: #faf5ff; border-color: #e9d5ff; }
      .hj-seg.new::before { background: #8b5cf6; }
      .hj-seg.s2     { background: #eff6ff; border-color: #bfdbfe; }
      .hj-seg.s2::before { background: #3b82f6; }
      .hj-seg.s3     { background: #f0fdf4; border-color: #bbf7d0; }
      .hj-seg.s3::before { background: #22c55e; }
      .hj-seg.s4     { background: #fefce8; border-color: #fde68a; }
      .hj-seg.s4::before { background: #eab308; }
      .hj-seg.vip    { background: #fff7ed; border-color: #fed7aa; }
      .hj-seg.vip::before { background: #f97316; }
      .hj-seg-label {
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 4px;
        opacity: 0.6;
      }
      .hj-seg.new .hj-seg-label   { color: #7c3aed; }
      .hj-seg.s2 .hj-seg-label    { color: #1d4ed8; }
      .hj-seg.s3 .hj-seg-label    { color: #15803d; }
      .hj-seg.s4 .hj-seg-label    { color: #a16207; }
      .hj-seg.vip .hj-seg-label   { color: #c2410c; }
      .hj-seg-count {
        font-size: 1.8rem;
        font-weight: 800;
        line-height: 1;
        margin-bottom: 2px;
        color: #1a1a1a;
      }
      .hj-seg-pct {
        font-size: 0.8rem;
        font-weight: 600;
        color: #6b7280;
        margin-bottom: 8px;
      }
      .hj-seg-desc {
        font-size: 0.8rem;
        color: #4b5563;
        line-height: 1.5;
        margin: 0;
      }
      .hj-seg-action {
        margin-top: 10px;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 20px;
        display: inline-block;
      }
      .hj-seg.new .hj-seg-action  { background: #ede9fe; color: #6d28d9; }
      .hj-seg.s2 .hj-seg-action   { background: #dbeafe; color: #1e40af; }
      .hj-seg.s3 .hj-seg-action   { background: #dcfce7; color: #166534; }
      .hj-seg.s4 .hj-seg-action   { background: #fef9c3; color: #854d0e; }
      .hj-seg.vip .hj-seg-action  { background: #ffedd5; color: #9a3412; }

      /* ── Stat row ── */
      .hj-stat-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin: 2rem 0;
      }
      .hj-stat-box {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 1.3rem 1rem;
        text-align: center;
      }
      .hj-stat-box .val {
        font-size: 2rem;
        font-weight: 800;
        color: #016e49;
        line-height: 1;
        display: block;
      }
      .hj-stat-box .lbl {
        font-size: 0.76rem;
        color: #6b7280;
        margin-top: 5px;
        display: block;
        line-height: 1.4;
      }
      .hj-stat-box .benchmark {
        font-size: 0.68rem;
        color: #9ca3af;
        margin-top: 4px;
        display: block;
      }

      /* ── Comparison row ── */
      .hj-compare {
        display: flex;
        gap: 1rem;
        margin: 2rem 0;
        flex-wrap: wrap;
      }
      .hj-compare-item {
        flex: 1;
        min-width: 180px;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 1.2rem;
      }
      .hj-compare-item.highlight {
        background: #f0faf5;
        border-color: #016e49;
      }
      .hj-compare-label {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #9ca3af;
        margin-bottom: 6px;
      }
      .hj-compare-item.highlight .hj-compare-label { color: #016e49; }
      .hj-compare-val {
        font-size: 1.9rem;
        font-weight: 800;
        color: #1a1a1a;
        line-height: 1;
      }
      .hj-compare-item.highlight .hj-compare-val { color: #016e49; }
      .hj-compare-desc {
        font-size: 0.78rem;
        color: #6b7280;
        margin-top: 5px;
        line-height: 1.4;
      }

      /* ── Visit trend bar ── */
      .hj-trend-wrap { margin: 2rem 0; }
      .hj-trend-bar-group { display: flex; flex-direction: column; gap: 10px; }
      .hj-trend-bar-row { display: flex; align-items: center; gap: 10px; }
      .hj-trend-bar-label {
        font-size: 0.78rem;
        font-weight: 600;
        color: #4b5563;
        min-width: 90px;
        text-align: right;
      }
      .hj-trend-bar-track {
        flex: 1;
        height: 20px;
        background: #f3f4f6;
        border-radius: 4px;
        overflow: hidden;
      }
      .hj-trend-bar-fill {
        height: 100%;
        border-radius: 4px;
        background: #016e49;
        transition: width 1s ease;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 6px;
      }
      .hj-trend-bar-fill.dip { background: #ef4444; }
      .hj-trend-bar-val {
        font-size: 0.7rem;
        font-weight: 700;
        color: #fff;
      }
      .hj-trend-bar-note {
        font-size: 0.72rem;
        color: #9ca3af;
        min-width: 80px;
      }

      /* ── Spark AI block ── */
      .hj-spark {
        background: #0f1c14;
        border-radius: 14px;
        padding: 1.8rem;
        margin: 2rem 0;
        position: relative;
        overflow: hidden;
      }
      .hj-spark::before {
        content: '';
        position: absolute;
        top: -40px; right: -40px;
        width: 200px; height: 200px;
        background: radial-gradient(circle, rgba(74,222,128,0.15) 0%, transparent 70%);
        border-radius: 50%;
      }
      .hj-spark-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 1rem;
      }
      .hj-spark-dot {
        width: 32px; height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4ade80, #016e49);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
      }
      .hj-spark-name {
        font-size: 0.8rem;
        font-weight: 700;
        color: #4ade80;
        letter-spacing: 0.05em;
      }
      .hj-spark-body {
        color: rgba(255,255,255,0.8);
        font-size: 0.92rem;
        line-height: 1.75;
        margin: 0;
        position: relative;
        z-index: 1;
      }
      .hj-spark-body strong { color: #4ade80; }

      /* ── Steps ── */
      .hj-steps { display: flex; flex-direction: column; gap: 1rem; margin: 1.5rem 0; }
      .hj-step {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 1rem 1.2rem;
      }
      .hj-step-num {
        min-width: 30px; height: 30px;
        border-radius: 50%;
        background: #016e49;
        color: #fff;
        font-weight: 800;
        font-size: 0.82rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .hj-step-body { flex: 1; }
      .hj-step-title { font-weight: 700; color: #1a1a1a; margin-bottom: 3px; font-size: 0.95rem; }
      .hj-step-desc { color: #4b5563; font-size: 0.88rem; margin: 0; line-height: 1.6; }

      /* ── CTA ── */
      .hj-cta {
        background: #0d0d0d;
        border-radius: 16px;
        padding: 3rem 2.5rem;
        text-align: center;
        margin: 4rem 0 1rem;
        position: relative;
        overflow: hidden;
      }
      .hj-cta::before {
        content: '';
        position: absolute;
        bottom: -60px; left: 50%;
        transform: translateX(-50%);
        width: 400px; height: 200px;
        background: radial-gradient(ellipse, rgba(1,110,73,0.5) 0%, transparent 70%);
        border-radius: 50%;
      }
      .hj-cta-content { position: relative; z-index: 1; }
      .hj-cta h3 {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: clamp(1.4rem, 3vw, 2rem);
        font-weight: 700;
        color: #fff;
        margin: 0 0 0.6rem;
      }
      .hj-cta p {
        color: rgba(255,255,255,0.55);
        margin-bottom: 1.8rem;
        font-size: 0.95rem;
      }
      .hj-cta a {
        display: inline-block;
        background: #016e49;
        color: #fff;
        font-weight: 700;
        font-size: 0.95rem;
        padding: 14px 36px;
        border-radius: 8px;
        text-decoration: none;
        letter-spacing: 0.02em;
      }
      .hj-cta a:hover { background: #4ade80; color: #0d0d0d; }

      /* ── Sources ── */
      .hj-sources {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 1.5rem;
        margin-top: 3rem;
      }
      .hj-sources h4 {
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #9ca3af;
        margin: 0 0 0.8rem;
      }
      .hj-sources ol {
        margin: 0;
        padding-left: 1.2rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .hj-sources li {
        font-size: 0.78rem;
        color: #6b7280;
        line-height: 1.5;
      }
      .hj-sources li a { color: #016e49; text-decoration: underline; }

      @media (max-width: 600px) {
        .hj-hero { padding: 2.5rem 1.5rem; }
        .hj-stat-row { grid-template-columns: 1fr 1fr; }
        .hj-hero-numbers { gap: 1.5rem; }
      }
    </style>

    <div class="hj-root">

      <!-- ══ HERO ══ -->
      <div class="hj-hero">
        <div class="hj-hero-bg"></div>
        <div class="hj-hero-accent"></div>
        <div class="hj-hero-content">
          <div class="hj-hero-eyebrow">Case Study · Himalayan Java Express</div>
          <h1>How Himalayan Java Express Knows Every Customer Who Walks In</h1>
          <p class="hj-hero-sub">
            In under a month — thousands of registered customers, tens of thousands of visits, and a repeat rate
            nearly double the café industry average. Here's how they built it, and what they do with the data.
          </p>
          <div class="hj-hero-numbers">
            <div class="hj-hero-num">
              <span class="hj-hero-num-val">3,000+</span>
              <span class="hj-hero-num-label">Registered customers</span>
            </div>
            <div class="hj-hero-num">
              <span class="hj-hero-num-val">10,000+</span>
              <span class="hj-hero-num-label">Total visits tracked</span>
            </div>
            <div class="hj-hero-num">
              <span class="hj-hero-num-val">50%+</span>
              <span class="hj-hero-num-label">Repeat customer rate</span>
            </div>
            <div class="hj-hero-num">
              <span class="hj-hero-num-val">3.5×+</span>
              <span class="hj-hero-num-label">Avg visits per customer</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ IMAGE 1 ══ -->
      <div class="hj-img-block">
        <img src="https://s3-np1.datahub.com.np/samparka/blogassets/Screenshot%202026-03-25%20at%2009.41.55.png" alt="Himalayan Java Express outlet" />
        <div class="hj-img-caption">📸 Himalayan Java Express outlet — the Samparka loyalty program QR code at the counter</div>
      </div>

      <!-- ══ INTRO ══ -->
      <p>
        Walk into any Himalayan Java Express outlet today and two things happen. You get your coffee — and the business gets smarter.
        Not in a surveillance way. In a quiet, invisible way that most cafés in Nepal aren't doing yet: every visit is recorded,
        every customer recognised, and every interaction feeds into a system that tells the team exactly who is loyal, who is slipping away,
        and who just walked in for the first time.
      </p>
      <p>
        That system is powered by Samparka. And what it built for Himalayan Java Express — one of Nepal's most recognisable
        coffee chains — happened fast. Within a single month of going live, thousands of customers were enrolled,
        tens of thousands of visits were tracked, and the repeat rate crossed well above the café industry average.
        This is what modern loyalty looks like when it's done properly.
      </p>

      <!-- ══ THE PROBLEM ══ -->
      <h2>The Problem With Stamp Cards</h2>
      <p>
        Before Samparka, loyalty at most cafés looked the same way it has for decades: a paper stamp card. Buy nine coffees, get the tenth free.
        Simple. Tangible. And almost completely useless as a business tool.
      </p>
      <p>
        A stamp card tells you nothing. You don't know if the customer who just paid is visiting for the first time or the fifteenth.
        You don't know how long it's been since they last came in. You can't reach them when they go quiet.
        You can't thank your most loyal regulars with anything personal. And when they lose the card — which they do — their entire loyalty history disappears too.
      </p>

      <div class="hj-pullquote">
        <p>"70% of first-time restaurant and café visitors never return — not because of bad coffee, but because nobody gave them a reason to."</p>
      </div>

      <p>
        <a href="https://www.restroworks.com/blog/customer-retention-statistics-restaurants/" class="hj-src" target="_blank">Industry data</a>
        shows that restaurants and cafés average around 30–40% repeat customer rates — already well below the global benchmark of 75% across all industries.
        <a href="https://www.demandsage.com/customer-retention-statistics/" class="hj-src" target="_blank">DemandSage</a>
        Himalayan Java Express, with a repeat rate well above 50%, isn't just doing better than average.
        It's doing better than most coffee chains that have been running structured loyalty programs for years.
      </p>

      <!-- ══ HOW SAMPARKA WORKS ══ -->
      <h2>How Samparka Powers the HJ Express Loyalty Program</h2>
      <p>
        The setup is deliberately frictionless — for both the customer and the staff. Customers don't download an app.
        They don't create a new account. They scan a QR code, send one WhatsApp message, and they're enrolled.
        From that point forward, every visit is logged, every point is tracked, and every milestone triggers
        an automatic message back to them.
      </p>

      <div class="hj-steps">
        <div class="hj-step">
          <div class="hj-step-num">1</div>
          <div class="hj-step-body">
            <div class="hj-step-title">Customer scans the QR code at the counter</div>
            <p class="hj-step-desc">
              A Samparka QR code sits at every HJ Express counter. The scan opens a pre-filled WhatsApp message
              to HJ Express's business number. Sending it takes under 10 seconds — and enrolls the customer automatically.
            </p>
          </div>
        </div>
        <div class="hj-step">
          <div class="hj-step-num">2</div>
          <div class="hj-step-body">
            <div class="hj-step-title">Their profile is created in the CRM instantly</div>
            <p class="hj-step-desc">
              Name, phone number, which outlet they enrolled at, what time — all logged automatically.
              No form-filling, no manual entry by staff. The customer is now a known customer.
            </p>
          </div>
        </div>
        <div class="hj-step">
          <div class="hj-step-num">3</div>
          <div class="hj-step-body">
            <div class="hj-step-title">Staff logs each visit with one tap</div>
            <p class="hj-step-desc">
              After each purchase, the barista taps one button in the Samparka dashboard.
              Points are calculated, the customer's record updates, and a WhatsApp message goes to the customer
              showing their new balance and how close they are to their next reward.
            </p>
          </div>
        </div>
        <div class="hj-step">
          <div class="hj-step-num">4</div>
          <div class="hj-step-body">
            <div class="hj-step-title">The system keeps working in the background</div>
            <p class="hj-step-desc">
              Samparka's automation layer runs constantly. Customers who haven't visited in 30 days get a win-back message.
              Customers close to a reward get a nudge. Birthdays trigger an offer. None of this requires any manual action from the team.
            </p>
          </div>
        </div>
      </div>

      <!-- ══ IMAGE 2: DASHBOARD ══ -->
      <div class="hj-img-block">
        <img src="https://s3-np1.datahub.com.np/samparka/blogassets/Screenshot%202026-03-25%20at%2009.05.53.png" alt="Samparka Visit Analytics Dashboard" />
        <div class="hj-img-caption">📸 Samparka Visit Analytics dashboard — customer distribution by visit count and Feb–Mar visit trend</div>
      </div>

      <!-- ══ SEGMENTATION ══ -->
      <h2>Knowing Your Customers by Name — and by Behaviour</h2>
      <p>
        The most powerful thing Samparka gives Himalayan Java Express isn't a loyalty card replacement.
        It's a real segmentation of who their customers actually are — based on real behaviour, not guesswork.
      </p>
      <p>
        Every customer in the system is automatically placed into a segment. Not by demographics or what they ordered,
        but by how they actually behave: how many times they've visited, and how recently.
        Here's what that breakdown looks like across HJ Express's customer base — all of it built in under a month:
      </p>

      <div class="hj-segments">
        <div class="hj-seg new">
          <div class="hj-seg-label">New Signups</div>
          <div class="hj-seg-count">~24%</div>
          <div class="hj-seg-pct">of total customers</div>
          <p class="hj-seg-desc">Enrolled but haven't visited yet, or came in right at signup. The top of the funnel.</p>
          <span class="hj-seg-action">→ Convert to 2nd visit</span>
        </div>
        <div class="hj-seg s2">
          <div class="hj-seg-label">2nd Visit</div>
          <div class="hj-seg-count">~12%</div>
          <div class="hj-seg-pct">of total customers</div>
          <p class="hj-seg-desc">Came back once. The critical second visit — research shows the probability of a third visit jumps past 50% after this point.</p>
          <span class="hj-seg-action">→ Lock in the habit</span>
        </div>
        <div class="hj-seg s3">
          <div class="hj-seg-label">3rd Visit</div>
          <div class="hj-seg-count">~6%</div>
          <div class="hj-seg-pct">of total customers</div>
          <p class="hj-seg-desc">Beginning to form a habit. Three visits is where casual customers start becoming regulars.</p>
          <span class="hj-seg-action">→ Reward consistency</span>
        </div>
        <div class="hj-seg s4">
          <div class="hj-seg-label">4th Visit</div>
          <div class="hj-seg-count">~5%</div>
          <div class="hj-seg-pct">of total customers</div>
          <p class="hj-seg-desc">Showing clear intent. Four visits in, they've already chosen HJ Express over every alternative four times.</p>
          <span class="hj-seg-action">→ Offer upgrade</span>
        </div>
        <div class="hj-seg vip">
          <div class="hj-seg-label">5+ Visits · VIP</div>
          <div class="hj-seg-count">~17%</div>
          <div class="hj-seg-pct">of total customers</div>
          <p class="hj-seg-desc">The regulars. The ones who recommend HJ to their friends. The backbone of the business.</p>
          <span class="hj-seg-action">→ Keep them special</span>
        </div>
      </div>

      <div class="hj-callout">
        <strong>The number that matters most:</strong> after the second purchase, the probability of a third jumps past 50%.
        <a href="https://loyaltylion.com/blog/35-loyalty-stats-and-benchmarks-for-2022-and-beyond" class="hj-src" target="_blank">LoyaltyLion / RJ Metrics</a>
        This means every single customer in the 2nd-visit segment at HJ Express is a coin flip
        — and a targeted message at exactly the right moment can flip that coin in HJ's favour.
        Samparka sends that message automatically.
      </div>

      <!-- ══ IMAGE 3 ══ -->
      <div class="hj-img-block">
        <img src="https://s3-np1.datahub.com.np/samparka/blogassets/Screenshot%202026-03-25%20at%2009.41.26.png" alt="WhatsApp loyalty message from Himalayan Java Express" />
        <div class="hj-img-caption">📸 The WhatsApp loyalty update message a customer receives after each HJ Express visit</div>
      </div>

      <!-- ══ THE FIRST-VISIT PROBLEM ══ -->
      <h2>The First-Visit Problem: Over a Third of Customers Who Came Once</h2>
      <p>
        Here's the uncomfortable number in the dashboard: roughly a third of the entire enrolled base
        has only visited once. This is normal. In fact, it's better than the industry norm,
        where <a href="https://www.restroworks.com/blog/customer-retention-statistics-restaurants/" class="hj-src" target="_blank">up to 70% of first-time café visitors never return.</a>
        But it represents an enormous untapped opportunity.
      </p>
      <p>
        What makes Samparka different from a stamp card is what happens to these customers.
        With a stamp card, they're invisible. With Samparka, they're a named segment with a phone number,
        a known enrolment date, and a record that shows exactly how many days it's been since they walked in.
      </p>
      <p>
        When 30 days pass with no second visit, Samparka automatically sends a win-back message to their WhatsApp.
        Not a generic promotion — a personalised reminder that their points are waiting, with a specific prompt
        to come back. The message arrives on a channel with a 98% open rate.
        <a href="https://chatarmin.com/en/blog/whats-app-business-api-integration" class="hj-src" target="_blank">Chatarmin 2026</a>
        A stamp card couldn't do this. An email could — and would reach roughly 1 in 5 people.
      </p>

      <!-- ══ REPEAT RATE ══ -->
      <h2>Above 50%: What That Repeat Rate Actually Means</h2>

      <div class="hj-compare">
        <div class="hj-compare-item">
          <div class="hj-compare-label">Industry average (cafés & restaurants)</div>
          <div class="hj-compare-val">30–40%</div>
          <div class="hj-compare-desc">The typical repeat customer rate for cafés and quick-service restaurants globally.</div>
        </div>
        <div class="hj-compare-item">
          <div class="hj-compare-label">Global customer retention average (all industries)</div>
          <div class="hj-compare-val">75.5%</div>
          <div class="hj-compare-desc">Restaurants and cafés sit well below this, making loyalty programs the primary lever.</div>
        </div>
        <div class="hj-compare-item highlight">
          <div class="hj-compare-label">Himalayan Java Express — in under one month</div>
          <div class="hj-compare-val">50%+</div>
          <div class="hj-compare-desc">Significantly above the café industry average — achieved in weeks, not years.</div>
        </div>
      </div>

      <p>
        A repeat rate above 50% — reached within a single month of launching with Samparka — means more than half
        of every enrolled customer has already come back at least once. That is not a coincidence. It is the direct
        result of a system that treats the gap between visits as an opportunity to communicate, not a silence to ignore.
      </p>
      <p>
        <a href="https://www.restroworks.com/blog/customer-retention-statistics-restaurants/" class="hj-src" target="_blank">Loyalty program members visit 20% more frequently and spend 20% more per visit</a>
        compared to non-members. Across thousands of customers at HJ Express, that compounding effect on revenue is significant.
        <a href="https://www.restroworks.com/blog/customer-retention-statistics-restaurants/" class="hj-src" target="_blank">Restroworks 2025</a>
      </p>

      <!-- ══ VISIT TRENDS ══ -->
      <h2>Reading the Visit Trends: What February and March Actually Show</h2>

      <p>
        The visit trends chart in the Samparka dashboard tells a story that no stamp card could ever surface.
        From mid-February to late March 2026, HJ Express was running at consistent daily visits — strong peaks
        on the best days. Two visible dips appear around late February and early March, where visits dropped sharply.
      </p>
      <p>
        These dips matter. They might reflect public holidays, bad weather, a specific outlet closure, or a drop in
        a particular area of Kathmandu. Without a tracking system, those dips are invisible — just a quiet day
        that nobody can explain or act on. With Samparka, they're a data point.
        The team can see exactly which outlet was affected, which customer segments went quiet,
        and deploy a targeted win-back message to customers in that area to pull them back in.
      </p>

      <div class="hj-trend-wrap">
        <p style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;margin-bottom:12px;">Visit volume — indicative weekly pattern (Feb–Mar 2026)</p>
        <div class="hj-trend-bar-group">
          <div class="hj-trend-bar-row">
            <span class="hj-trend-bar-label">Feb 12–18</span>
            <div class="hj-trend-bar-track"><div class="hj-trend-bar-fill" style="width:90%"><span class="hj-trend-bar-val">Strong</span></div></div>
            <span class="hj-trend-bar-note">Peak week</span>
          </div>
          <div class="hj-trend-bar-row">
            <span class="hj-trend-bar-label">Feb 19–25</span>
            <div class="hj-trend-bar-track"><div class="hj-trend-bar-fill" style="width:85%"><span class="hj-trend-bar-val">Steady</span></div></div>
            <span class="hj-trend-bar-note">Consistent</span>
          </div>
          <div class="hj-trend-bar-row">
            <span class="hj-trend-bar-label">Feb 26–Mar 1</span>
            <div class="hj-trend-bar-track"><div class="hj-trend-bar-fill dip" style="width:12%"><span class="hj-trend-bar-val">Dip</span></div></div>
            <span class="hj-trend-bar-note">⚠ Sharp drop</span>
          </div>
          <div class="hj-trend-bar-row">
            <span class="hj-trend-bar-label">Mar 2–8</span>
            <div class="hj-trend-bar-track"><div class="hj-trend-bar-fill" style="width:72%"><span class="hj-trend-bar-val">Recovery</span></div></div>
            <span class="hj-trend-bar-note">Bouncing back</span>
          </div>
          <div class="hj-trend-bar-row">
            <span class="hj-trend-bar-label">Mar 9–15</span>
            <div class="hj-trend-bar-track"><div class="hj-trend-bar-fill" style="width:78%"><span class="hj-trend-bar-val">Steady</span></div></div>
            <span class="hj-trend-bar-note">Normalised</span>
          </div>
          <div class="hj-trend-bar-row">
            <span class="hj-trend-bar-label">Mar 16–25</span>
            <div class="hj-trend-bar-track"><div class="hj-trend-bar-fill" style="width:70%"><span class="hj-trend-bar-val">Moderate</span></div></div>
            <span class="hj-trend-bar-note">Slight softening</span>
          </div>
        </div>
      </div>

      <!-- ══ SPARK AI ══ -->
      <h2>Spark AI: The Intelligence Layer</h2>
      <p>
        One of the most useful things in Samparka is what sits behind the dashboard numbers: Spark AI,
        Samparka's built-in AI assistant. Instead of reading charts and trying to figure out what they mean,
        the HJ Express team can simply ask.
      </p>

      <div class="hj-spark">
        <div class="hj-spark-header">
          <div class="hj-spark-dot">✦</div>
          <span class="hj-spark-name">Spark AI · Samparka</span>
        </div>
        <p class="hj-spark-body">
          <strong>Summarize my store performance</strong><br><br>
          Himalayan Java Express has a strong loyalty foundation with <strong>thousands of registered customers</strong> and a large base of <strong>active visitors</strong>.
          Your Repeat Customer Rate is excellent at <strong>above 50%</strong>, and you have a significant base of <strong>VIP customers</strong> who've visited 5+ times.<br><br>
          However, there are opportunities to improve. A notable share of <strong>one-time visitors</strong> haven't returned yet, and a group of customers are currently <strong>at-risk</strong>,
          being inactive for 30+ days — a segment Samparka is already tracking and ready to re-engage automatically.
        </p>
      </div>

      <!-- ══ IMAGE 5: SPARK AI ══ -->
      <div class="hj-img-block">
        <img src="https://s3-np1.datahub.com.np/samparka/blogassets/Screenshot%202026-03-25%20at%2009.06.22.png" alt="Spark AI conversation screenshot" />
        <div class="hj-img-caption">📸 Spark AI — store performance summary from the Samparka dashboard</div>
      </div>

      <p>
        Spark AI doesn't just summarise — it can answer specific operational questions. "Who are my at-risk customers?"
        "What promotions should I run this week?" "Which outlet has the lowest repeat rate?" The answers come back in plain
        language, based on real data, in seconds. For a café manager who doesn't have time to build pivot tables,
        this is what turns data into action.
      </p>

      <!-- ══ VIP SEGMENT ══ -->
      <h2>The VIPs: The People Who Keep HJ Express Running</h2>
      <p>
        Around 17% of the enrolled base has visited 5 or more times — but they represent disproportionately more
        than 17% of revenue. <a href="https://www.demandsage.com/customer-retention-statistics/" class="hj-src" target="_blank">The top 1% of loyal consumers spend five times more than the other 99%.</a>
        These are the customers who don't think twice about coming back. They know their order, they know the staff,
        and they've already chosen HJ Express over every competitor near them, multiple times.
      </p>
      <p>
        The risk with VIP customers is invisible to a stamp card system: they go quiet, and nobody notices.
        Samparka catches this. A VIP customer who hasn't visited in 30 days triggers the same at-risk flag as anyone else —
        but the message they receive is calibrated to their history. They're not treated like a new customer who wandered in once.
        They're treated like the regular they are.
      </p>

      <div class="hj-stat-row">
        <div class="hj-stat-box">
          <span class="val">~17%</span>
          <span class="lbl">of customers have visited 5+ times (VIP tier)</span>
          <span class="benchmark">Tracked automatically by Samparka</span>
        </div>
        <div class="hj-stat-box">
          <span class="val">At-risk</span>
          <span class="lbl">customers inactive 30+ days are flagged & re-engaged</span>
          <span class="benchmark">Automated win-back via WhatsApp</span>
        </div>
        <div class="hj-stat-box">
          <span class="val">3.5×+</span>
          <span class="lbl">Average visits per enrolled customer</span>
          <span class="benchmark">vs. industry avg ~2.1×</span>
        </div>
      </div>

      <!-- ══ WHAT IT MEANS FOR OTHER CAFE OWNERS ══ -->
      <h2>What Other Café Owners Can Learn From This</h2>
      <p>
        Himalayan Java Express isn't running an unusually complex loyalty program. They haven't hired a data team.
        They're not running complex segmented email campaigns. They set up Samparka, trained their staff to
        tap one button after each purchase, and let the system do the rest.
      </p>
      <p>
        The repeat rate above 50% — built in under a month — isn't magic. It's the result of a simple principle applied consistently:
        <em>every customer who walks in should receive a reason to walk in again.</em>
        Not a generic loyalty card with no name on it. A message on the channel they actually read,
        with their name on it, telling them exactly how close they are to something free.
      </p>

      <div class="hj-callout">
        <strong>The math is simple:</strong> loyalty program members spend, on average, up to 40% more than
        non-members. A 5% increase in customer retention correlates with a 25% increase in profit.
        <a href="https://loyaltylion.com/blog/35-loyalty-stats-and-benchmarks-for-2022-and-beyond" class="hj-src" target="_blank">LoyaltyLion</a>
        <a href="https://www.trueloyal.com/resources/loyalty-statistics/" class="hj-src" target="_blank">TrueLoyal</a>
        HJ Express isn't running a loyalty program because it's a nice thing to offer.
        They're running one because it directly drives the number that keeps the business alive: repeat revenue.
      </div>

     

      <!-- ══ CTA ══ -->
      <div class="hj-cta">
        <div class="hj-cta-content">
          <h3>Your café could have this data too.</h3>
          <p>
            Samparka sets up in 10 minutes. No technical skills needed, no app for customers to download.
            Just a QR code, WhatsApp, and a system that works while you focus on the coffee.
          </p>
          <a href="/pricing">Get started free →</a>
        </div>
      </div>

      <!-- ══ SOURCES ══ -->
      <div class="hj-sources">
        <h4>Sources & benchmarks used in this article</h4>
        <ol>
          <li>Restroworks — <em>Restaurant Customer Retention Statistics 2025</em>. <a href="https://www.restroworks.com/blog/customer-retention-statistics-restaurants/" target="_blank">restroworks.com</a> — industry repeat rate averages, loyalty program visit frequency data.</li>
          <li>LoyaltyLion / RJ Metrics — <em>68 Customer Loyalty Program Statistics for 2026</em>. <a href="https://loyaltylion.com/blog/35-loyalty-stats-and-benchmarks-for-2022-and-beyond" target="_blank">loyaltylion.com</a> — second purchase probability, loyalty member spending premium.</li>
          <li>TrueLoyal — <em>100+ Loyalty Program Statistics 2025</em>. <a href="https://www.trueloyal.com/resources/loyalty-statistics/" target="_blank">trueloyal.com</a> — retention/profit correlation, member revenue growth.</li>
          <li>DemandSage — <em>Customer Retention Statistics 2026</em>. <a href="https://www.demandsage.com/customer-retention-statistics/" target="_blank">demandsage.com</a> — global retention averages, top 1% spending data.</li>
          <li>Square — <em>Future of Commerce Report 2025</em>. <a href="https://squareup.com/us/en/the-bottom-line/reaching-customers/loyalty-program-tips" target="_blank">squareup.com</a> — café loyalty program adoption and effectiveness stats.</li>
          <li>Chatarmin — <em>WhatsApp Business API Integration 2026</em>. <a href="https://chatarmin.com/en/blog/whats-app-business-api-integration" target="_blank">chatarmin.com</a> — WhatsApp message open rate benchmarks.</li>
          <li>Loyoly — <em>2026 Loyalty Programmes Performance Benchmark</em>. <a href="https://www.loyoly.io/blog/loyalty-program-benchmarks" target="_blank">loyoly.io</a> — LTV growth, food sector loyalty benchmarks.</li>
        </ol>
      </div>

    </div>
  `,
};