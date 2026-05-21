// src/components/blogPosts/WhatsAppLoyaltyGuide.jsx

export const WhatsAppLoyaltyGuide = {
  id: 12,
  slug: "whatsapp-loyalty-program-businesses-guide-2026",
  title: "WhatsApp Loyalty Program for Businesses: The Complete Guide (2026)",
  excerpt:
    "WhatsApp has 3.3 billion active users and a 98% message open rate. Here's the full technical and strategic guide to running a loyalty program through it — API setup, business verification, CRM integration, and the logic that makes it work.",
  author: "Shreeyanch Shrestha",
  authorImage: "https://s3-np1.datahub.com.np/samparka/shreeyanch.png",
  authorBio: "Founder at Samparka. Writes about customer retention for independent restaurants, cafés, and salons.",
  date: "Mar 23, 2026",
  publishedAt: "2026-03-23",
  readTime: "14 min read",
  category: "Customer Loyalty",
  image: "https://s3-np1.datahub.com.np/samparka/blogassets/whatsapp%20loyalty%20samparka.jpg",
  featured: false,
  content: `
    <style>
      .wlg-root {
        font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
        color: #1a1a1a;
        line-height: 1.8;
        max-width: 780px;
        margin: 0 auto;
      }
      .wlg-root * { box-sizing: border-box; }

      /* ── Hero banner ── */
      .wlg-hero {
        width: 100%;
        border-radius: 14px;
        overflow: hidden;
        margin-bottom: 3rem;
        position: relative;
        background: linear-gradient(135deg, #013d29 0%, #016e49 60%, #02a06b 100%);
        padding: 3.5rem 2.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .wlg-hero-tag {
        display: inline-block;
        background: rgba(255,255,255,0.15);
        color: #a3f0cc;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        padding: 4px 12px;
        border-radius: 20px;
        width: fit-content;
      }
      .wlg-hero h1 {
        font-family: 'DM Serif Display', Georgia, serif;
        font-size: clamp(1.8rem, 4vw, 2.6rem);
        font-weight: 400;
        color: #fff;
        margin: 0;
        line-height: 1.25;
        max-width: 600px;
      }
      .wlg-hero-sub {
        color: rgba(255,255,255,0.75);
        font-size: 1rem;
        max-width: 520px;
        margin: 0;
      }
      .wlg-hero-stats {
        display: flex;
        gap: 2rem;
        margin-top: 1rem;
        flex-wrap: wrap;
      }
      .wlg-hero-stat {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .wlg-hero-stat-num {
        font-size: 2rem;
        font-weight: 800;
        color: #a3f0cc;
        line-height: 1;
      }
      .wlg-hero-stat-label {
        font-size: 0.75rem;
        color: rgba(255,255,255,0.6);
        font-weight: 500;
      }

      /* ── Prose ── */
      .wlg-root p {
        color: #374151;
        margin-bottom: 1.4rem;
        font-size: 1.05rem;
      }
      .wlg-root h2 {
        font-family: 'DM Serif Display', Georgia, serif;
        font-size: clamp(1.4rem, 3.5vw, 1.9rem);
        font-weight: 400;
        color: #013d29;
        margin: 3rem 0 1rem;
        padding-bottom: 0.4rem;
        border-bottom: 2px solid #e6f4ee;
      }
      .wlg-root h3 {
        font-size: 1.1rem;
        font-weight: 700;
        color: #016e49;
        margin: 2rem 0 0.6rem;
      }

      /* ── Callout / note ── */
      .wlg-callout {
        background: #f0faf5;
        border-left: 4px solid #016e49;
        border-radius: 0 10px 10px 0;
        padding: 1.1rem 1.4rem;
        margin: 1.6rem 0;
        font-size: 1rem;
        color: #1a3d2b;
      }
      .wlg-callout strong { color: #016e49; }

      /* ── Source pill ── */
      .wlg-src {
        display: inline-block;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        background: #e6f4ee;
        color: #016e49;
        border-radius: 4px;
        padding: 1px 6px;
        margin-left: 4px;
        vertical-align: middle;
        text-decoration: none;
        white-space: nowrap;
      }
      .wlg-src:hover { background: #016e49; color: #fff; }

      /* ── Stat grid ── */
      .wlg-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: 1rem;
        margin: 2rem 0;
      }
      .wlg-stat-card {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 1.2rem 1rem;
        text-align: center;
      }
      .wlg-stat-card .num {
        font-size: 2rem;
        font-weight: 800;
        color: #016e49;
        line-height: 1;
        display: block;
      }
      .wlg-stat-card .lbl {
        font-size: 0.78rem;
        color: #6b7280;
        margin-top: 6px;
        display: block;
        line-height: 1.4;
      }

      /* ── Step list ── */
      .wlg-steps { margin: 1.5rem 0; display: flex; flex-direction: column; gap: 1rem; }
      .wlg-step {
        display: flex;
        gap: 1rem;
        align-items: flex-start;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 1.1rem 1.2rem;
      }
      .wlg-step-num {
        min-width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #016e49;
        color: #fff;
        font-weight: 800;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 1px;
      }
      .wlg-step-body { flex: 1; }
      .wlg-step-title { font-weight: 700; color: #1a1a1a; margin-bottom: 4px; font-size: 0.95rem; }
      .wlg-step-desc { color: #4b5563; font-size: 0.9rem; margin: 0; line-height: 1.6; }

      /* ── Code block ── */
      .wlg-code-wrap {
        background: #0f1c14;
        border-radius: 12px;
        overflow: hidden;
        margin: 1.6rem 0;
        font-size: 0.82rem;
      }
      .wlg-code-header {
        background: #1c2e21;
        padding: 8px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .wlg-code-lang {
        color: #a3f0cc;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }
      .wlg-code-dots { display: flex; gap: 5px; }
      .wlg-code-dot {
        width: 10px; height: 10px; border-radius: 50%;
      }
      .wlg-code-wrap pre {
        margin: 0;
        padding: 1.2rem 1.4rem;
        overflow-x: auto;
        color: #d1fae5;
        line-height: 1.7;
        font-family: 'Fira Code', 'Cascadia Code', monospace;
      }
      .wlg-code-wrap .kw  { color: #86efac; }
      .wlg-code-wrap .fn  { color: #67e8f9; }
      .wlg-code-wrap .str { color: #fcd34d; }
      .wlg-code-wrap .cm  { color: #6b7280; font-style: italic; }
      .wlg-code-wrap .num { color: #f9a8d4; }

      /* ── Comparison table ── */
      .wlg-table-wrap { overflow-x: auto; margin: 1.5rem 0; }
      .wlg-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
        min-width: 460px;
      }
      .wlg-table thead tr { background: #013d29; }
      .wlg-table thead th {
        padding: 12px 16px;
        text-align: left;
        color: #fff;
        font-weight: 600;
        font-size: 0.82rem;
        letter-spacing: 0.03em;
      }
      .wlg-table thead th:first-child { border-radius: 8px 0 0 0; }
      .wlg-table thead th:last-child  { border-radius: 0 8px 0 0; }
      .wlg-table tbody tr:nth-child(even) { background: #f9fafb; }
      .wlg-table tbody td {
        padding: 10px 16px;
        border-bottom: 1px solid #e5e7eb;
        color: #374151;
        vertical-align: top;
      }
      .wlg-table tbody td:first-child { font-weight: 600; color: #1a1a1a; }
      .wlg-check { color: #016e49; font-weight: 700; }
      .wlg-cross { color: #ef4444; }
      .wlg-partial { color: #f59e0b; }

      /* ── Flow diagram ── */
      .wlg-flow {
        display: flex;
        align-items: center;
        gap: 0;
        overflow-x: auto;
        padding: 1.5rem 0;
        margin: 1rem 0 2rem;
      }
      .wlg-flow-node {
        flex-shrink: 0;
        background: #fff;
        border: 2px solid #016e49;
        border-radius: 10px;
        padding: 0.7rem 1rem;
        text-align: center;
        min-width: 120px;
        max-width: 140px;
      }
      .wlg-flow-node .icon { font-size: 1.5rem; display: block; margin-bottom: 4px; }
      .wlg-flow-node .label {
        font-size: 0.72rem;
        font-weight: 700;
        color: #013d29;
        line-height: 1.3;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .wlg-flow-arrow {
        flex-shrink: 0;
        color: #016e49;
        font-size: 1.2rem;
        padding: 0 4px;
        font-weight: 700;
      }
      .wlg-flow-node.highlight {
        background: #016e49;
        border-color: #016e49;
      }
      .wlg-flow-node.highlight .label { color: #fff; }

      /* ── Architecture diagram ── */
      .wlg-arch {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        padding: 1.5rem;
        margin: 1.5rem 0;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .wlg-arch-row {
        display: flex;
        gap: 0.75rem;
        align-items: stretch;
        flex-wrap: wrap;
      }
      .wlg-arch-box {
        flex: 1;
        min-width: 140px;
        background: #fff;
        border: 1.5px solid #d1fae5;
        border-radius: 10px;
        padding: 0.9rem 1rem;
      }
      .wlg-arch-box.green {
        background: #f0faf5;
        border-color: #016e49;
      }
      .wlg-arch-box.dark {
        background: #013d29;
        border-color: #013d29;
      }
      .wlg-arch-box-label {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #9ca3af;
        margin-bottom: 4px;
      }
      .wlg-arch-box.dark .wlg-arch-box-label { color: #a3f0cc; }
      .wlg-arch-box-title {
        font-size: 0.88rem;
        font-weight: 700;
        color: #1a1a1a;
      }
      .wlg-arch-box.dark .wlg-arch-box-title { color: #fff; }
      .wlg-arch-box-desc {
        font-size: 0.75rem;
        color: #6b7280;
        margin-top: 3px;
        line-height: 1.4;
      }
      .wlg-arch-box.dark .wlg-arch-box-desc { color: rgba(255,255,255,0.5); }
      .wlg-arch-divider {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0 0.5rem;
        color: #9ca3af;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .wlg-arch-divider::before,
      .wlg-arch-divider::after {
        content: '';
        flex: 1;
        height: 1px;
        background: #e5e7eb;
      }

      /* ── FAQ ── */
      .wlg-faq { display: flex; flex-direction: column; gap: 0.75rem; margin: 1.5rem 0; }
      .wlg-faq-item {
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        overflow: hidden;
      }
      .wlg-faq-q {
        padding: 1rem 1.2rem;
        font-weight: 600;
        color: #1a1a1a;
        font-size: 0.95rem;
        background: #fff;
        border-bottom: 1px solid #f3f4f6;
      }
      .wlg-faq-a {
        padding: 0.9rem 1.2rem;
        color: #4b5563;
        font-size: 0.9rem;
        line-height: 1.7;
        background: #fafafa;
        margin: 0;
      }

      /* ── CTA ── */
      .wlg-cta {
        background: linear-gradient(135deg, #013d29 0%, #016e49 100%);
        border-radius: 16px;
        padding: 2.5rem 2rem;
        text-align: center;
        margin: 3rem 0 1rem;
      }
      .wlg-cta h3 {
        font-family: 'DM Serif Display', Georgia, serif;
        font-size: 1.6rem;
        font-weight: 400;
        color: #fff;
        margin: 0 0 0.5rem;
      }
      .wlg-cta p {
        color: rgba(255,255,255,0.7);
        margin-bottom: 1.5rem;
        font-size: 0.95rem;
      }
      .wlg-cta a {
        display: inline-block;
        background: #a3f0cc;
        color: #013d29;
        font-weight: 800;
        font-size: 0.95rem;
        padding: 13px 32px;
        border-radius: 8px;
        text-decoration: none;
        letter-spacing: 0.01em;
        transition: background 0.2s;
      }
      .wlg-cta a:hover { background: #fff; }

      /* ── Sources section ── */
      .wlg-sources {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 1.5rem;
        margin-top: 3rem;
      }
      .wlg-sources h4 {
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #9ca3af;
        margin: 0 0 0.8rem;
      }
      .wlg-sources ol {
        margin: 0;
        padding-left: 1.2rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .wlg-sources li {
        font-size: 0.8rem;
        color: #6b7280;
        line-height: 1.5;
      }
      .wlg-sources li a {
        color: #016e49;
        text-decoration: underline;
        word-break: break-all;
      }

      @media (max-width: 600px) {
        .wlg-hero { padding: 2rem 1.25rem; }
        .wlg-flow { gap: 0; }
        .wlg-flow-node { min-width: 90px; padding: 0.5rem 0.6rem; }
      }
    </style>

    <div class="wlg-root">

      <!-- ══════════════ HERO ══════════════ -->
      <div class="wlg-hero">
        <span class="wlg-hero-tag">Complete Guide · 2026</span>
        <h1>WhatsApp Loyalty Programs for Small Businesses</h1>
        <p class="wlg-hero-sub">API setup · Business verification · CRM integration · Points logic — everything, in one place.</p>
        <div class="wlg-hero-stats">
          <div class="wlg-hero-stat">
            <span class="wlg-hero-stat-num">3.3B</span>
            <span class="wlg-hero-stat-label">Monthly active users</span>
          </div>
          <div class="wlg-hero-stat">
            <span class="wlg-hero-stat-num">98%</span>
            <span class="wlg-hero-stat-label">Message open rate</span>
          </div>
          <div class="wlg-hero-stat">
            <span class="wlg-hero-stat-num">40%</span>
            <span class="wlg-hero-stat-label">Click-through rate</span>
          </div>
        </div>
      </div>

      <!-- ══════════════ INTRO ══════════════ -->
      <p>
        Email open rates average around 20%. Push notifications from branded apps get swiped away within seconds.
        WhatsApp messages get opened 98% of the time.<a href="https://chatarmin.com/en/blog/whats-app-business-api-integration" class="wlg-src" target="_blank">Source</a>
        That single number explains why small businesses — cafés, salons, restaurants, retail shops — are moving their
        loyalty programs off stamp cards and branded apps, and onto a channel their customers already live in.
      </p>
      <p>
        This guide covers the full picture: the business case, the technical stack (API → business verification → CRM → loyalty logic),
        how Samparka implements it for small businesses in under 10 minutes, and the real data behind why it works.
        No filler.
      </p>

      <!-- ══════════════ WHY WHATSAPP ══════════════ -->
      <h2>Why WhatsApp Works as a Loyalty Channel</h2>

      <p>
        As of January 2026, WhatsApp has over 3.3 billion monthly active users and is projected to reach 3.5 billion by the end of
        the year.<a href="https://chatarmin.com/en/blog/whats-app-business-api-integration" class="wlg-src" target="_blank">Chatarmin 2026</a>
        Of those, 2.3 billion open the app every single day — an 83% daily active rate that no other messaging platform matches.
        Users spend an average of 38 minutes per day inside it.
      </p>
      <p>
        For businesses, the performance numbers are even more compelling. WhatsApp messages achieve an open rate of 98% and
        click-through rates of up to 60%.<a href="https://chatarmin.com/en/blog/whats-app-business-api-integration" class="wlg-src" target="_blank">Chatarmin 2026</a>
        Email — the dominant channel for most loyalty programs — averages around 20–21% open rates.
        Push notifications from branded apps range from 20–50%.
        The gap is not marginal. It is structural.
      </p>
      <p>
        WhatsApp is also the number one app in over 100 countries. When you send a loyalty update through it,
        you're not asking customers to check a separate platform — you're sending a message to the same place
        they talk to their family and friends.
      </p>

      <div class="wlg-stats-grid">
        <div class="wlg-stat-card">
          <span class="num">98%</span>
          <span class="lbl">WhatsApp open rate vs ~20% for email</span>
        </div>
        <div class="wlg-stat-card">
          <span class="num">60%</span>
          <span class="lbl">Average click-through rate on WhatsApp messages</span>
        </div>
        <div class="wlg-stat-card">
          <span class="num">3 min</span>
          <span class="lbl">Average time for a WhatsApp message to be read</span>
        </div>
        <div class="wlg-stat-card">
          <span class="num">75%</span>
          <span class="lbl">Consumers who want post-purchase support via messaging apps</span>
        </div>
      </div>

      <!-- ══════════════ THE LOYALTY PROBLEM ══════════════ -->
      <h2>The Problem With Traditional Loyalty Programs</h2>

      <p>
        The average consumer holds around 17–19 loyalty program memberships — but actively participates in fewer than
        half of them.<a href="https://www.mckinsey.com/capabilities/growth-marketing-and-sales/our-insights/the-value-of-getting-personalization-right-or-wrong-is-multiplying" class="wlg-src" target="_blank">McKinsey</a>
        App-based loyalty compounds this: a customer who downloads your branded app may use it once,
        forget about it for six weeks, and have zero idea what their points balance is when standing at your counter.
      </p>

      <div class="wlg-callout">
        <strong>The core friction problem:</strong> a loyalty program is only as effective as how often customers
        remember it exists. App-based programs create a separate mental namespace customers have to actively maintain.
        WhatsApp messages arrive in a place they're already checking dozens of times a day.
      </div>

      <p>Stamp cards have no friction at all — but also no data, no automation, and no ability to re-engage a customer who hasn't visited in three weeks. The best loyalty channel combines low friction with high intelligence. That's what WhatsApp API enables.</p>

      <!-- ══════════════ THE TECHNICAL STACK ══════════════ -->
      <h2>The Technical Stack: API → Verify → CRM → Logic</h2>
      <p>
        Here's exactly how a WhatsApp loyalty program is built. This is the architecture Samparka runs under the hood —
        broken into its four layers so you can understand what's happening at each step.
      </p>

      <!-- Flow diagram -->
      <div class="wlg-flow" role="img" aria-label="System flow: Customer scans QR → WhatsApp Business API → Business Verification → CRM / Customer DB → Loyalty Logic Engine → Automated WhatsApp Message back to Customer">
        <div class="wlg-flow-node">
          <span class="icon">📱</span>
          <span class="label">Customer scans QR</span>
        </div>
        <span class="wlg-flow-arrow">→</span>
        <div class="wlg-flow-node highlight">
          <span class="icon">🔌</span>
          <span class="label">WhatsApp Business API</span>
        </div>
        <span class="wlg-flow-arrow">→</span>
        <div class="wlg-flow-node">
          <span class="icon">✅</span>
          <span class="label">Business Verified</span>
        </div>
        <span class="wlg-flow-arrow">→</span>
        <div class="wlg-flow-node">
          <span class="icon">🗄️</span>
          <span class="label">CRM / Customer DB</span>
        </div>
        <span class="wlg-flow-arrow">→</span>
        <div class="wlg-flow-node highlight">
          <span class="icon">⚙️</span>
          <span class="label">Loyalty Logic Engine</span>
        </div>
        <span class="wlg-flow-arrow">→</span>
        <div class="wlg-flow-node">
          <span class="icon">💬</span>
          <span class="label">Message sent to customer</span>
        </div>
      </div>

      <!-- ── LAYER 1: API ── -->
      <h3>Layer 1 — WhatsApp Business API</h3>
      <p>
        The WhatsApp Business <em>App</em> (free, designed for micro-businesses) and the WhatsApp Business <em>API</em>
        are fundamentally different products.
        The API has no front-end interface — it's a server-to-server channel that connects your backend systems
        to WhatsApp's messaging infrastructure.<a href="https://www.flowcart.ai/blog/whatsapp-business-api-integration" class="wlg-src" target="_blank">Flowcart 2025</a>
        It supports automation, CRM integration, multi-agent access, unlimited users, and up to 500 messages per second.
      </p>
      <p>
        Since 2025, Meta runs exclusively on the <strong>Cloud API</strong> — on-premise is effectively deprecated for new use cases.
        The Cloud API runs on Meta's servers with no DevOps overhead on your side.<a href="https://chatarmin.com/en/blog/whats-app-business-api-integration" class="wlg-src" target="_blank">Chatarmin 2026</a>
        Pricing shifted from conversation-based to per-message in July 2025 — marketing templates are charged per delivered message,
        typically $0.01–$0.10 depending on country and message type.<a href="https://typebot.io/blog/whatsapp-api-use-cases" class="wlg-src" target="_blank">Typebot 2026</a>
      </p>

      <div class="wlg-code-wrap">
        <div class="wlg-code-header">
          <span class="wlg-code-lang">Node.js · Send a WhatsApp message via Cloud API</span>
          <div class="wlg-code-dots">
            <div class="wlg-code-dot" style="background:#ef4444"></div>
            <div class="wlg-code-dot" style="background:#f59e0b"></div>
            <div class="wlg-code-dot" style="background:#22c55e"></div>
          </div>
        </div>
        <pre><span class="cm">// POST https://graph.facebook.com/v19.0/{PHONE_NUMBER_ID}/messages</span>
<span class="kw">const</span> <span class="fn">sendLoyaltyMessage</span> = <span class="kw">async</span> (customerPhone, templateData) => {
  <span class="kw">const</span> res = <span class="kw">await</span> fetch(
    <span class="str">\`https://graph.facebook.com/v19.0/\${process.env.PHONE_NUMBER_ID}/messages\`</span>,
    {
      method: <span class="str">'POST'</span>,
      headers: {
        <span class="str">'Authorization'</span>: <span class="str">\`Bearer \${process.env.WHATSAPP_TOKEN}\`</span>,
        <span class="str">'Content-Type'</span>: <span class="str">'application/json'</span>,
      },
      body: JSON.stringify({
        messaging_product: <span class="str">'whatsapp'</span>,
        to: customerPhone,           <span class="cm">// e.g. "9779841000000"</span>
        type: <span class="str">'template'</span>,
        template: {
          name: <span class="str">'loyalty_points_update'</span>,   <span class="cm">// your Meta-approved template</span>
          language: { code: <span class="str">'en'</span> },
          components: [{
            type: <span class="str">'body'</span>,
            parameters: [
              { type: <span class="str">'text'</span>, text: templateData.customerName },
              { type: <span class="str">'text'</span>, text: templateData.points },
              { type: <span class="str">'text'</span>, text: templateData.pointsToNextReward },
              { type: <span class="str">'text'</span>, text: templateData.rewardDescription },
            ]
          }]
        }
      })
    }
  );
  <span class="kw">return</span> res.json();
};</pre>
      </div>

      <div class="wlg-callout">
        <strong>Template Pacing (important):</strong> Meta tests every new template on ~1,000 recipients first.
        Only when quality signals look good — low block rate, good engagement — does it roll out fully.
        A poorly written template can stall your entire campaign. Plan template approval time before any major send.<a href="https://chatarmin.com/en/blog/whats-app-business-api-integration" class="wlg-src" target="_blank">Chatarmin 2026</a>
      </div>

      <!-- ── LAYER 2: VERIFY ── -->
      <h3>Layer 2 — Business Verification</h3>
      <p>
        To use the WhatsApp Business API, you must work with an official Business Solution Provider (BSP) —
        a Meta-certified partner who handles API access, number registration, and template approvals.
        Samparka operates through a BSP so your business doesn't have to manage this relationship directly.<a href="https://www.linkmobility.com/blog/how-to-get-started-with-whatsapp-business-api-in-2025" class="wlg-src" target="_blank">LINK Mobility 2025</a>
      </p>

      <div class="wlg-steps">
        <div class="wlg-step">
          <div class="wlg-step-num">1</div>
          <div class="wlg-step-body">
            <div class="wlg-step-title">Create a Meta Business Account</div>
            <p class="wlg-step-desc">
              Register at business.facebook.com. This is the parent account that owns your WhatsApp Business Account (WABA).
              You'll need a legal business name, website or address, and a phone number not already connected to a WhatsApp account.
            </p>
          </div>
        </div>
        <div class="wlg-step">
          <div class="wlg-step-num">2</div>
          <div class="wlg-step-body">
            <div class="wlg-step-title">Verify your business with Meta</div>
            <p class="wlg-step-desc">
              Submit business documents through Meta's Business Verification flow (in Meta Business Manager → Security Centre).
              Approval typically takes 5–10 business days. Once verified, your account can eventually be upgraded to a
              verified green-tick account if you meet WhatsApp's messaging thresholds.<a href="https://www.linkmobility.com/blog/how-to-get-started-with-whatsapp-business-api-in-2025" class="wlg-src" target="_blank">LINK Mobility</a>
            </p>
          </div>
        </div>
        <div class="wlg-step">
          <div class="wlg-step-num">3</div>
          <div class="wlg-step-body">
            <div class="wlg-step-title">Register your phone number via BSP</div>
            <p class="wlg-step-desc">
              The number is activated for API use and hosted virtually — it is no longer SIM-based.
              You can scale with multiple numbers or regions. The BSP (in Samparka's case, our infrastructure partner)
              handles token generation, webhook configuration, and number porting.
            </p>
          </div>
        </div>
        <div class="wlg-step">
          <div class="wlg-step-num">4</div>
          <div class="wlg-step-body">
            <div class="wlg-step-title">Obtain customer opt-in consent</div>
            <p class="wlg-step-desc">
              This is non-negotiable. WhatsApp requires explicit opt-in before any proactive messages can be sent.
              In Samparka's flow, customers give consent when they scan the QR code and send their first message —
              that inbound message opens a 24-hour free-form conversation window.<a href="https://www.linkmobility.com/blog/how-to-get-started-with-whatsapp-business-api-in-2025" class="wlg-src" target="_blank">LINK Mobility</a>
            </p>
          </div>
        </div>
        <div class="wlg-step">
          <div class="wlg-step-num">5</div>
          <div class="wlg-step-body">
            <div class="wlg-step-title">Get message templates approved</div>
            <p class="wlg-step-desc">
              Templates for proactive outreach (points updates, reward alerts, re-engagement) must be submitted
              to Meta for approval before sending. Samparka's templates are pre-approved — you don't wait.
              All templates must comply with WhatsApp's policies and cannot be purely promotional without
              using the marketing template category.<a href="https://typebot.io/blog/whatsapp-api-use-cases" class="wlg-src" target="_blank">Typebot 2026</a>
            </p>
          </div>
        </div>
      </div>

      <!-- ── LAYER 3: CRM ── -->
      <h3>Layer 3 — CRM Integration</h3>
      <p>
        The CRM is where every customer's identity, visit history, and points balance lives.
        Without it, you have messaging capability but no customer intelligence.
        The WhatsApp API acts as the communication layer; the CRM is the data layer.
        They connect via webhooks and API calls.<a href="https://www.flowcart.ai/blog/whatsapp-business-api-integration" class="wlg-src" target="_blank">Flowcart 2025</a>
      </p>

      <div class="wlg-arch">
        <div class="wlg-arch-row">
          <div class="wlg-arch-box dark">
            <div class="wlg-arch-box-label">Customer touchpoint</div>
            <div class="wlg-arch-box-title">QR Code Scan</div>
            <div class="wlg-arch-box-desc">Customer opens WhatsApp. Message sent to business number.</div>
          </div>
          <div class="wlg-arch-box dark">
            <div class="wlg-arch-box-label">Meta infrastructure</div>
            <div class="wlg-arch-box-title">WhatsApp Cloud API</div>
            <div class="wlg-arch-box-desc">Inbound webhook fires. Payload includes phone number, message, timestamp.</div>
          </div>
        </div>
        <div class="wlg-arch-divider">Samparka Backend</div>
        <div class="wlg-arch-row">
          <div class="wlg-arch-box green">
            <div class="wlg-arch-box-label">Identity Layer</div>
            <div class="wlg-arch-box-title">Customer Lookup / Create</div>
            <div class="wlg-arch-box-desc">Phone number → existing customer record or new enrollment.</div>
          </div>
          <div class="wlg-arch-box green">
            <div class="wlg-arch-box-label">Data Layer</div>
            <div class="wlg-arch-box-title">CRM / Customer DB</div>
            <div class="wlg-arch-box-desc">Stores visits, points balance, reward history, opt-in status.</div>
          </div>
          <div class="wlg-arch-box green">
            <div class="wlg-arch-box-label">Logic Layer</div>
            <div class="wlg-arch-box-title">Points Engine</div>
            <div class="wlg-arch-box-desc">Applies business rules. Calculates new balance. Checks reward thresholds.</div>
          </div>
        </div>
        <div class="wlg-arch-divider">Response</div>
        <div class="wlg-arch-row">
          <div class="wlg-arch-box">
            <div class="wlg-arch-box-label">Outbound</div>
            <div class="wlg-arch-box-title">Template Message Sent</div>
            <div class="wlg-arch-box-desc">"Hi Priya! You earned 40 points. Balance: 240. 60 more for a free coffee."</div>
          </div>
          <div class="wlg-arch-box">
            <div class="wlg-arch-box-label">Async jobs</div>
            <div class="wlg-arch-box-title">Scheduled Automation</div>
            <div class="wlg-arch-box-desc">Win-back triggers, birthday messages, reward expiry reminders.</div>
          </div>
        </div>
      </div>

      <div class="wlg-code-wrap">
        <div class="wlg-code-header">
          <span class="wlg-code-lang">Node.js · Inbound webhook handler</span>
          <div class="wlg-code-dots">
            <div class="wlg-code-dot" style="background:#ef4444"></div>
            <div class="wlg-code-dot" style="background:#f59e0b"></div>
            <div class="wlg-code-dot" style="background:#22c55e"></div>
          </div>
        </div>
        <pre><span class="cm">// Webhook receives every inbound WhatsApp message</span>
app.post(<span class="str">'/webhook/whatsapp'</span>, <span class="kw">async</span> (req, res) => {
  res.sendStatus(<span class="num">200</span>); <span class="cm">// Always respond within 30s or Meta retries</span>

  <span class="kw">const</span> entry    = req.body.entry?.[<span class="num">0</span>];
  <span class="kw">const</span> change   = entry?.changes?.[<span class="num">0</span>];
  <span class="kw">const</span> message  = change?.value?.messages?.[<span class="num">0</span>];
  <span class="kw">if</span> (!message) <span class="kw">return</span>;

  <span class="kw">const</span> phone    = message.from;       <span class="cm">// e.g. "9779841000000"</span>
  <span class="kw">const</span> text     = message.text?.body?.toLowerCase().trim();

  <span class="cm">// 1. Look up or create customer in CRM</span>
  <span class="kw">let</span> customer = <span class="kw">await</span> db.customers.findOne({ phone });
  <span class="kw">if</span> (!customer) {
    customer = <span class="kw">await</span> db.customers.create({
      phone,
      enrolledAt: <span class="kw">new</span> Date(),
      points: <span class="num">0</span>,
      visits: <span class="num">0</span>,
      optIn: <span class="kw">true</span>,  <span class="cm">// inbound message = consent</span>
    });
  }

  <span class="cm">// 2. Route intent</span>
  <span class="kw">if</span> (text === <span class="str">'balance'</span> || text === <span class="str">'points'</span>) {
    <span class="kw">await</span> <span class="fn">sendBalanceMessage</span>(customer);
  } <span class="kw">else if</span> (text === <span class="str">'redeem'</span>) {
    <span class="kw">await</span> <span class="fn">handleRedemption</span>(customer);
  } <span class="kw">else</span> {
    <span class="kw">await</span> <span class="fn">sendWelcomeOrHelp</span>(customer);
  }
});</pre>
      </div>

      <!-- ── LAYER 4: LOGIC ── -->
      <h3>Layer 4 — The Loyalty Logic Engine</h3>
      <p>
        This is the brain of the system. It runs every time a customer interaction is logged — whether through
        a QR scan at the counter, a staff entry in the dashboard, or an automated trigger.
      </p>

      <div class="wlg-code-wrap">
        <div class="wlg-code-header">
          <span class="wlg-code-lang">Node.js · Points logic + reward detection</span>
          <div class="wlg-code-dots">
            <div class="wlg-code-dot" style="background:#ef4444"></div>
            <div class="wlg-code-dot" style="background:#f59e0b"></div>
            <div class="wlg-code-dot" style="background:#22c55e"></div>
          </div>
        </div>
        <pre><span class="cm">/**
 * Core loyalty logic — runs after each verified visit
 * businessRules come from the merchant's Samparka config
 */</span>
<span class="kw">const</span> <span class="fn">processVisit</span> = <span class="kw">async</span> (customerId, spendAmount, businessRules) => {
  <span class="kw">const</span> customer = <span class="kw">await</span> db.customers.findById(customerId);

  <span class="cm">// 1. Calculate points earned this visit</span>
  <span class="kw">const</span> pointsEarned = Math.floor(spendAmount * businessRules.pointsPerUnit);

  <span class="cm">// 2. Update balance and visit count</span>
  <span class="kw">const</span> newBalance = customer.points + pointsEarned;
  <span class="kw">const</span> newVisits  = customer.visits + <span class="num">1</span>;
  <span class="kw">await</span> db.customers.update(customerId, {
    points: newBalance,
    visits: newVisits,
    lastVisit: <span class="kw">new</span> Date(),
  });

  <span class="cm">// 3. Log the transaction</span>
  <span class="kw">await</span> db.transactions.create({
    customerId, spendAmount, pointsEarned,
    balanceAfter: newBalance, timestamp: <span class="kw">new</span> Date(),
  });

  <span class="cm">// 4. Check if customer has hit a reward threshold</span>
  <span class="kw">const</span> reward = businessRules.rewards.find(
    r => newBalance >= r.threshold && customer.points < r.threshold
  );

  <span class="cm">// 5. Send the right WhatsApp message</span>
  <span class="kw">if</span> (reward) {
    <span class="kw">await</span> <span class="fn">sendRewardUnlocked</span>(customer, reward, newBalance);
  } <span class="kw">else</span> {
    <span class="kw">const</span> nextReward = businessRules.rewards.find(r => r.threshold > newBalance);
    <span class="kw">await</span> <span class="fn">sendPointsUpdate</span>(customer, {
      pointsEarned,
      newBalance,
      pointsToNext: nextReward ? nextReward.threshold - newBalance : <span class="num">0</span>,
      nextRewardDesc: nextReward?.description ?? <span class="str">'a special reward'</span>,
    });
  }
};

<span class="cm">// Example business rules config (merchant sets this in Samparka dashboard)</span>
<span class="kw">const</span> exampleRules = {
  pointsPerUnit: <span class="num">1</span>,          <span class="cm">// 1 point per 1 NPR spent</span>
  rewards: [
    { threshold: <span class="num">200</span>, description: <span class="str">'Free coffee'</span> },
    { threshold: <span class="num">500</span>, description: <span class="str">'Free pastry + coffee'</span> },
    { threshold: <span class="num">1000</span>, description: <span class="str">'10% off your next bill'</span> },
  ]
};</pre>
      </div>

      <!-- ── AUTOMATION ── -->
      <h3>Automated Triggers</h3>
      <p>
        The points engine also fires scheduled jobs that run independently of customer-initiated actions.
        These are among the highest-ROI features of the system:
      </p>

      <div class="wlg-code-wrap">
        <div class="wlg-code-header">
          <span class="wlg-code-lang">Node.js · Scheduled automation jobs</span>
          <div class="wlg-code-dots">
            <div class="wlg-code-dot" style="background:#ef4444"></div>
            <div class="wlg-code-dot" style="background:#f59e0b"></div>
            <div class="wlg-code-dot" style="background:#22c55e"></div>
          </div>
        </div>
        <pre><span class="cm">// Runs daily at 09:00 local business time</span>
<span class="kw">const</span> <span class="fn">runDailyAutomation</span> = <span class="kw">async</span> (businessId) => {
  <span class="kw">const</span> now    = <span class="kw">new</span> Date();
  <span class="kw">const</span> today  = now.toISOString().split(<span class="str">'T'</span>)[<span class="num">0</span>];

  <span class="cm">// Win-back: customers inactive for 30 days</span>
  <span class="kw">const</span> lapsed = <span class="kw">await</span> db.customers.findWhere({
    businessId,
    optIn: <span class="kw">true</span>,
    lastVisit: { $lt: subDays(now, <span class="num">30</span>) },
    winbackSentAt: { $lt: subDays(now, <span class="num">30</span>) }, <span class="cm">// don't spam</span>
  });
  <span class="kw">for</span> (<span class="kw">const</span> c <span class="kw">of</span> lapsed) {
    <span class="kw">await</span> <span class="fn">sendWinback</span>(c);
    <span class="kw">await</span> db.customers.update(c.id, { winbackSentAt: now });
  }

  <span class="cm">// Birthday rewards</span>
  <span class="kw">const</span> birthdays = <span class="kw">await</span> db.customers.findWhere({
    businessId, optIn: <span class="kw">true</span>,
    birthdayMMDD: today.slice(<span class="num">5</span>), <span class="cm">// "MM-DD" match</span>
  });
  <span class="kw">for</span> (<span class="kw">const</span> c <span class="kw">of</span> birthdays) <span class="kw">await</span> <span class="fn">sendBirthdayOffer</span>(c);

  <span class="cm">// "Almost there" nudge: customers within 20pts of next reward</span>
  <span class="kw">const</span> closeToReward = <span class="kw">await</span> db.customers.findCloseToThreshold({
    businessId, optIn: <span class="kw">true</span>, withinPoints: <span class="num">20</span>,
  });
  <span class="kw">for</span> (<span class="kw">const</span> c <span class="kw">of</span> closeToReward) <span class="kw">await</span> <span class="fn">sendAlmostThereNudge</span>(c);
};</pre>
      </div>

      <!-- ══════════════ COMPARISON TABLE ══════════════ -->
      <h2>WhatsApp Loyalty vs. App vs. Stamp Card</h2>

      <div class="wlg-table-wrap">
        <table class="wlg-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>WhatsApp (Samparka)</th>
              <th>Branded App</th>
              <th>Stamp Card</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Customer download required</td>
              <td><span class="wlg-check">No</span></td>
              <td><span class="wlg-cross">Yes</span></td>
              <td><span class="wlg-check">No</span></td>
            </tr>
            <tr>
              <td>Enrollment time</td>
              <td>&lt; 30 seconds</td>
              <td>3–5 minutes</td>
              <td>5 seconds</td>
            </tr>
            <tr>
              <td>Business gets customer data</td>
              <td><span class="wlg-check">Yes</span></td>
              <td><span class="wlg-check">Yes</span></td>
              <td><span class="wlg-cross">No</span></td>
            </tr>
            <tr>
              <td>Automated re-engagement</td>
              <td><span class="wlg-check">Yes</span></td>
              <td><span class="wlg-partial">Push only (~7% open)</span></td>
              <td><span class="wlg-cross">No</span></td>
            </tr>
            <tr>
              <td>Message open rate</td>
              <td><span class="wlg-check">~98%</span></td>
              <td>20–50% (push)</td>
              <td>N/A</td>
            </tr>
            <tr>
              <td>Two-way conversation</td>
              <td><span class="wlg-check">Yes</span></td>
              <td><span class="wlg-cross">No</span></td>
              <td><span class="wlg-cross">No</span></td>
            </tr>
            <tr>
              <td>Works offline</td>
              <td><span class="wlg-cross">No</span></td>
              <td><span class="wlg-cross">No</span></td>
              <td><span class="wlg-check">Yes</span></td>
            </tr>
            <tr>
              <td>Full analytics</td>
              <td><span class="wlg-check">Yes</span></td>
              <td><span class="wlg-check">Yes</span></td>
              <td><span class="wlg-cross">No</span></td>
            </tr>
            <tr>
              <td>Setup cost for business</td>
              <td>Low (Samparka handles API)</td>
              <td>High (dev + maintenance)</td>
              <td>Near zero</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ══════════════ ROI ══════════════ -->
      <h2>The Business Case: What the Data Says</h2>

      <p>
        Loyalty programs have real, measurable economic outcomes — but only if customers actually engage with them.
        The channel problem is the reason most loyalty programs underperform their theoretical potential.
      </p>

      <div class="wlg-stats-grid">
        <div class="wlg-stat-card">
          <span class="num">12–18%</span>
          <span class="lbl">More annual revenue growth from loyalty program members vs non-members</span>
        </div>
        <div class="wlg-stat-card">
          <span class="num">4.8×</span>
          <span class="lbl">Average ROI reported by loyalty program owners</span>
        </div>
        <div class="wlg-stat-card">
          <span class="num">25%</span>
          <span class="lbl">Profit increase correlated with a 5% rise in customer retention</span>
        </div>
        <div class="wlg-stat-card">
          <span class="num">3.1×</span>
          <span class="lbl">More annual spend from members who actually redeem rewards</span>
        </div>
      </div>

      <p>
        Tata CLiQ ran personalized WhatsApp campaigns based on customer purchase history and recorded
        a 10× ROI and 57% click-through rate.<a href="https://typebot.io/blog/whatsapp-api-use-cases" class="wlg-src" target="_blank">Typebot 2026</a>
        Westside, a retail chain, used the API to send ClubWest loyalty members personalized birthday messages
        with exclusive offers throughout their birthday month — a direct revenue trigger tied to a moment customers
        already feel good about.<a href="https://typebot.io/blog/whatsapp-api-use-cases" class="wlg-src" target="_blank">Typebot 2026</a>
        Salud Digna delivered 5.1 million appointment confirmations and 2 million test results via WhatsApp,
        with an 89% automation rate.<a href="https://typebot.io/blog/whatsapp-api-use-cases" class="wlg-src" target="_blank">Typebot 2026</a>
      </p>

      <div class="wlg-callout">
        <strong>For most small businesses</strong> in WhatsApp-dominant markets (Nepal, India, Brazil, Indonesia, Europe, Middle East),
        ROI from WhatsApp loyalty is typically realized within the first 3–6 months of deployment.<a href="https://typebot.io/blog/whatsapp-api-use-cases" class="wlg-src" target="_blank">Typebot 2026</a>
      </div>

      <!-- ══════════════ HOW SAMPARKA DOES IT ══════════════ -->
      <h2>How Samparka Implements This for Small Businesses</h2>
      <p>
        Everything described in the technical stack above — API access, BSP relationship, business verification,
        CRM, message templates, loyalty logic, automated triggers — Samparka handles on your behalf.
        You configure your business rules in a dashboard. We handle the infrastructure.
      </p>

      <div class="wlg-steps">
        <div class="wlg-step">
          <div class="wlg-step-num">1</div>
          <div class="wlg-step-body">
            <div class="wlg-step-title">Sign up and configure your business (5 min)</div>
            <p class="wlg-step-desc">
              Add your business name, category, and loyalty rules: how many points per purchase,
              what the rewards are, when to trigger re-engagement. No technical knowledge required.
            </p>
          </div>
        </div>
        <div class="wlg-step">
          <div class="wlg-step-num">2</div>
          <div class="wlg-step-body">
            <div class="wlg-step-title">Generate and print your QR code (1 min)</div>
            <p class="wlg-step-desc">
              One QR code per location. It can go on your counter, your receipt, your menu, or your wall.
              Customers scan it with their phone camera — no app, no separate account.
            </p>
          </div>
        </div>
        <div class="wlg-step">
          <div class="wlg-step-num">3</div>
          <div class="wlg-step-body">
            <div class="wlg-step-title">Customer scans → enrolled in &lt;30 seconds</div>
            <p class="wlg-step-desc">
              The scan opens a pre-filled WhatsApp message to your business number.
              Sending it enrolls the customer, triggers the opt-in, and creates their record in your CRM —
              all automatically.
            </p>
          </div>
        </div>
        <div class="wlg-step">
          <div class="wlg-step-num">4</div>
          <div class="wlg-step-body">
            <div class="wlg-step-title">Staff logs the visit → points sent instantly</div>
            <p class="wlg-step-desc">
              After each purchase, staff tap one button in the Samparka dashboard. The points logic runs,
              the CRM updates, and the customer gets a WhatsApp message in seconds with their new balance
              and progress toward their next reward.
            </p>
          </div>
        </div>
        <div class="wlg-step">
          <div class="wlg-step-num">5</div>
          <div class="wlg-step-body">
            <div class="wlg-step-title">Automated messages run in the background</div>
            <p class="wlg-step-desc">
              Win-back messages fire after 30 days of inactivity. Birthday offers go out automatically.
              "Almost there" nudges remind customers when they're close to a reward. You don't manage any of this manually.
            </p>
          </div>
        </div>
      </div>

      <!-- ══════════════ MESSAGING BEST PRACTICES ══════════════ -->
      <h2>Writing Messages That Don't Get Blocked</h2>

      <p>
        The 98% open rate is a ceiling, not a guarantee. A program that sends irrelevant or
        overly frequent messages will erode the relationship that makes WhatsApp powerful.
        As of April 2025, Meta paused pure marketing templates to US numbers,
        signaling clearly that WhatsApp must not become a spam channel.<a href="https://typebot.io/blog/whatsapp-api-use-cases" class="wlg-src" target="_blank">Typebot 2026</a>
        WhatsApp also limits marketing messages to 2 per user per 24 hours across all businesses.
      </p>

      <p>The best WhatsApp loyalty messages share four traits:</p>
      <ol style="margin: 0.5rem 0 1.5rem 1.5rem; color: #374151; line-height: 1.9; font-size: 1.05rem;">
        <li><strong>Event-triggered, not scheduled.</strong> A visit, a milestone, a long absence — not a fixed calendar date regardless of relevance.</li>
        <li><strong>Specific.</strong> "You have 240 points — 60 away from a free coffee" beats "Thank you for being a loyal customer."</li>
        <li><strong>Short.</strong> WhatsApp is a messaging app, not an email inbox. Three sentences is usually enough.</li>
        <li><strong>Actionable.</strong> Tell the customer exactly what to do next if they want to redeem. One clear call to action.</li>
      </ol>

      <!-- ══════════════ FAQ ══════════════ -->
      <h2>Frequently Asked Questions</h2>

      <div class="wlg-faq">
        <div class="wlg-faq-item">
          <div class="wlg-faq-q">Do my customers need to download anything?</div>
          <p class="wlg-faq-a">No. They only need WhatsApp, which the vast majority of people already have. There's no app store visit, no new account to create, and no password to remember. Enrollment happens by scanning a QR code.</p>
        </div>
        <div class="wlg-faq-item">
          <div class="wlg-faq-q">Does Samparka handle the WhatsApp API setup?</div>
          <p class="wlg-faq-a">Yes. You don't need a Meta developer account, BSP relationship, or approved message templates. Samparka manages the entire API layer. You set up your business rules in a dashboard and are live in under 10 minutes.</p>
        </div>
        <div class="wlg-faq-item">
          <div class="wlg-faq-q">What about customer privacy and consent?</div>
          <p class="wlg-faq-a">WhatsApp uses end-to-end encryption for all messages. Opt-in consent is built into Samparka's enrollment flow — a customer sending the first message constitutes consent. Customers can opt out at any time by replying STOP.</p>
        </div>
        <div class="wlg-faq-item">
          <div class="wlg-faq-q">How does this compare to SMS loyalty programs?</div>
          <p class="wlg-faq-a">SMS has solid open rates (around 55% by Brevo's 2025 benchmark) but is one-way, supports no rich media, and has no conversational context. WhatsApp achieves 98% open rates, supports images, PDFs, and buttons, and allows two-way interaction — making redemption and follow-up conversations natural.</p>
        </div>
        <div class="wlg-faq-item">
          <div class="wlg-faq-q">What kinds of businesses is this best for?</div>
          <p class="wlg-faq-a">Any business where customers visit repeatedly and a personal relationship matters: cafés, restaurants, salons, barbershops, retail stores, hotels, and guesthouses. The higher your visit frequency, the faster the ROI from automated loyalty messaging.</p>
        </div>
        <div class="wlg-faq-item">
          <div class="wlg-faq-q">Can I customize the points rules and rewards?</div>
          <p class="wlg-faq-a">Yes. You set the points-per-spend ratio and define as many reward tiers as you want (e.g., 200 points = free coffee, 500 = free pastry, 1000 = 10% off). Samparka's logic engine applies your rules automatically on every visit.</p>
        </div>
      </div>

      <!-- ══════════════ CTA ══════════════ -->
      <div class="wlg-cta">
        <h3>Get your business live in 10 minutes.</h3>
        <p>No technical setup. No BSP contracts. No template approval delays. Samparka handles the full stack.</p>
        <a href="/pricing">See Pricing →</a>
      </div>

      <!-- ══════════════ SOURCES ══════════════ -->
      <div class="wlg-sources">
        <h4>Sources</h4>
        <ol>
          <li>Chatarmin — <em>WhatsApp Business API Integration 2026</em>. <a href="https://chatarmin.com/en/blog/whats-app-business-api-integration" target="_blank">chatarmin.com</a></li>
          <li>Typebot — <em>19 WhatsApp Business API Use Cases (2026 Guide)</em>. <a href="https://typebot.io/blog/whatsapp-api-use-cases" target="_blank">typebot.io</a></li>
          <li>LINK Mobility — <em>How to Get Started with WhatsApp Business API in 2025</em>. <a href="https://www.linkmobility.com/blog/how-to-get-started-with-whatsapp-business-api-in-2025" target="_blank">linkmobility.com</a></li>
          <li>Flowcart — <em>How to Integrate WhatsApp API with Your Systems</em>. <a href="https://www.flowcart.ai/blog/whatsapp-business-api-integration" target="_blank">flowcart.ai</a></li>
          <li>Respond.io — <em>WhatsApp API for Business: Cost, Features &amp; Setup</em>. <a href="https://respond.io/whatsapp-business-api" target="_blank">respond.io</a></li>
          <li>Meta — <em>WhatsApp Business Platform</em>. <a href="https://business.whatsapp.com/products/business-platform" target="_blank">business.whatsapp.com</a></li>
          <li>ChatArchitect — <em>Step-by-Step Guide to Integrating WhatsApp Business API with CRM</em>. <a href="https://www.chatarchitect.com/news/step-by-step-guide-to-integrating-whatsapp-business-api-with-crm-systems" target="_blank">chatarchitect.com</a></li>
        </ol>
      </div>

    </div><!-- end wlg-root -->
  `,
};