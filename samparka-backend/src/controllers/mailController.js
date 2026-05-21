// import nodemailer from "nodemailer";
const nodemailer = require("nodemailer");
const storeModel = require("../models/storeModel");

var transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Converts plain-text email body (with simple markdown subset) → email-safe HTML.
 *   **text**  → <strong>text</strong>
 *   \n\n      → paragraph break
 *   \n        → <br>
 * HTML special chars are escaped before formatting is applied.
 */
function formatEmailBody(text) {
  if (!text) return "";
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const formatted = escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n+/g, '</p><p style="margin:1em 0 0;">')
    .replace(/\n/g, "<br>");
  return `<p style="margin:0;">${formatted}</p>`;
}

class MailController {
  async notifyAdmin(userEmail) {
    try {
      const mailOptions = {
        from: "shreeyanch86@gmail.com",
        to: "shresthashishir91@gmail.com",
        subject: "New Message Scheduled",
        html: `
         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
            <h2 style="color: #333;">🚨 New Message Scheduled</h2>
            <p style="color: #555;">
            A new message has just been scheduled by a user with email id ${userEmail}. Please review the details in the admin panel.
            </p>
            <div style="text-align: center; margin-top: 20px;">
                <a href="http://samparka.co/work" 
                style="padding: 10px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px;">
                View Scheduled Messages
                </a>
            </div>
        </div>
        `,
      };
      await new Promise((resolve, reject) => {
        transport.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            return reject(error);
          } else {
            console.log("Email sent successfully");
            resolve(info);
          }
        });
      });

      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  }

  async mailCreatedUser(userEmail, password) {
    try {
      const mailOptions = {
        from: "samparkaservices@gmail.com",
        to: userEmail,
        subject: "Your account for SAMPARKA has been created.",
        html: `
         <div
      style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border: 1px solid #ddd;
      "
    >
      <img
        src="https://res.cloudinary.com/spyc/image/upload/v1737542135/SAMPARKA_ynzpeq.png"
        alt="SAMPARKA"
        style="
          display: block;
          max-width: 150px;
          margin: 0 auto 20px;
          border-radius: 8px;
        "
      />
      <h2 style="color: #333; text-align: center">
        Account Created Successfully
      </h2>
      <p style="color: #555; line-height: 1.6">Dear Sir/Mam,</p>
      <p style="color: #555; line-height: 1.6">
        Your account for <strong>SAMPARKA Dashboard</strong> has been
        successfully created. You can now log in and explore our services.
      </p>
      <div
        style="
          background: #f1f1f1;
          padding: 10px;
          border-radius: 5px;
          font-size: 16px;
        "
      >
        <p style="margin: 5px 0"><strong>Email:</strong> ${userEmail}</p>
        <p style="margin: 5px 0"><strong>Password:</strong> ${password}</p>
      </div>
      <span
        style="
          color: red;
          font-weight: bold;
          font-size: small;
          display: block;
          margin-top: 10px;
          text-align: center;
        "
        >Do not share this information with anyone.</span
      >
      <div style="text-align: center; margin-top: 20px">
        <a
          href="https://samparka.co/"
          style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            font-size: 16px;
            border-radius: 5px;
          "
          >Visit Dashboard</a
        >
      </div>
    </div>
        `,
      };
      await new Promise((resolve, reject) => {
        transport.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            return reject(error);
          } else {
            console.log("Email sent successfully");
            resolve(info);
          }
        });
      });

      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  }

  // Small delay helper for rate-limiting between sends
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Send a single email via the shared transport (promisified)
  _sendMail(mailOptions) {
    return new Promise((resolve, reject) => {
      transport.sendMail(mailOptions, (error, info) => {
        if (error) return reject(error);
        resolve(info);
      });
    });
  }

  async sendDailyStoreReport({ toEmails, storeName, storeType, stats }) {
    try {
      const {
        newCustomers = 0,
        totalVisits = 0,
        pointsEarned = 0,
        pointsRedeemed = 0,
        segments = {},
        topCustomers = [],
        retentionRate = 0,
        totalRegisteredCustomers = 0,
        activeCustomers = 0,
      } = stats;

      const formatNum = (n) => Number(n || 0).toLocaleString();

      const segmentRows = Object.entries(segments)
        .map(([key, val]) => {
          const label = key
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());
          return `<tr>
              <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;color:#333;font-size:13px;font-family:Georgia,serif;">${label}</td>
              <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;color:#111;font-size:13px;font-family:'Courier New',Courier,monospace;text-align:right;font-weight:700;letter-spacing:0.02em;">${formatNum(val.count)}</td>
            </tr>`;
        })
        .join("");

      const topCustomerRows = topCustomers
        .slice(0, 5)
        .map(
          (c, i) => `<tr>
              <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:12px;font-family:Georgia,serif;">${i + 1}.&ensp;${c.name || "Customer"}</td>
              <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#111;font-size:12px;font-family:'Courier New',Courier,monospace;text-align:right;font-weight:700;">${c.visits || c.visitCount || 0}</td>
            </tr>`
        )
        .join("");

      const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Systematic, data-forward email — no gradient banners, no colored boxes
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Daily Store Report</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
  <tr><td align="center">
  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #ddd;">

    <!-- Masthead -->
    <tr>
      <td style="padding:28px 36px 20px;border-bottom:3px solid #016e49;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin:0;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#016e49;font-family:Arial,Helvetica,sans-serif;font-weight:700;">Samparka</p>
              <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#111;letter-spacing:-0.01em;">Daily Store Report</p>
            </td>
            <td style="text-align:right;vertical-align:bottom;">
              <p style="margin:0;font-size:11px;color:#888;font-family:Arial,Helvetica,sans-serif;">${today}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Store name row -->
    <tr>
      <td style="padding:14px 36px;background:#fafafa;border-bottom:1px solid #e8e8e8;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin:0;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#999;font-family:Arial,Helvetica,sans-serif;">Store</p>
              <p style="margin:3px 0 0;font-size:15px;font-weight:700;color:#111;">${storeName}</p>
            </td>
            ${storeType ? `<td style="text-align:right;vertical-align:middle;">
              <span style="display:inline-block;padding:3px 10px;background:#f0f0f0;color:#666;font-size:11px;font-family:Arial,Helvetica,sans-serif;text-transform:capitalize;letter-spacing:0.05em;">${storeType}</span>
            </td>` : ""}
          </tr>
        </table>
      </td>
    </tr>

    <!-- Key metrics — 2-column ruled table -->
    <tr>
      <td style="padding:28px 36px 0;">
        <p style="margin:0 0 14px;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#999;font-family:Arial,Helvetica,sans-serif;border-bottom:1px solid #e8e8e8;padding-bottom:8px;">Performance</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:13px;">New Customers</td>
            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:20px;font-weight:700;color:#016e49;font-family:'Courier New',Courier,monospace;letter-spacing:-0.02em;">${formatNum(newCustomers)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:13px;">Total Visits</td>
            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:20px;font-weight:700;color:#111;font-family:'Courier New',Courier,monospace;letter-spacing:-0.02em;">${formatNum(totalVisits)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:13px;">Points Earned</td>
            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:20px;font-weight:700;color:#111;font-family:'Courier New',Courier,monospace;letter-spacing:-0.02em;">${formatNum(pointsEarned)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:13px;">Points Redeemed</td>
            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:20px;font-weight:700;color:#111;font-family:'Courier New',Courier,monospace;letter-spacing:-0.02em;">${formatNum(pointsRedeemed)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;color:#555;font-size:13px;">Active Customers <span style="color:#aaa;font-size:11px;">(last 30 days)</span></td>
            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:20px;font-weight:700;color:#111;font-family:'Courier New',Courier,monospace;letter-spacing:-0.02em;">${formatNum(activeCustomers)}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#555;font-size:13px;">Retention Rate</td>
            <td style="padding:10px 0;text-align:right;font-size:20px;font-weight:700;color:#111;font-family:'Courier New',Courier,monospace;letter-spacing:-0.02em;">${retentionRate}%</td>
          </tr>
        </table>
      </td>
    </tr>

    ${segmentRows ? `
    <!-- Segments -->
    <tr>
      <td style="padding:24px 36px 0;">
        <p style="margin:0 0 14px;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#999;font-family:Arial,Helvetica,sans-serif;border-bottom:1px solid #e8e8e8;padding-bottom:8px;">Customer Segments</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${segmentRows}
        </table>
      </td>
    </tr>` : ""}

    ${topCustomerRows ? `
    <!-- Top Customers -->
    <tr>
      <td style="padding:24px 36px 0;">
        <p style="margin:0 0 14px;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#999;font-family:Arial,Helvetica,sans-serif;border-bottom:1px solid #e8e8e8;padding-bottom:8px;">Top Customers Today <span style="font-size:9px;color:#bbb;">(by visits)</span></p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${topCustomerRows}
        </table>
      </td>
    </tr>` : ""}

    <!-- CTA -->
    <tr>
      <td style="padding:28px 36px;">
        <a href="https://samparka.co/?tab=activity"
           style="display:inline-block;padding:10px 22px;background:#016e49;color:#fff;text-decoration:none;font-size:13px;font-family:Arial,Helvetica,sans-serif;font-weight:600;letter-spacing:0.02em;">
          Open Dashboard &rarr;
        </a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:16px 36px;border-top:1px solid #e8e8e8;background:#fafafa;">
        <p style="margin:0;font-size:11px;color:#aaa;font-family:Arial,Helvetica,sans-serif;line-height:1.6;">
          Automated daily report &middot; Samparka Loyalty Platform<br>
          To stop receiving these reports, contact your account manager.
        </p>
      </td>
    </tr>

  </table>
  </td></tr>
</table>
</body>
</html>`;

      const subject = `Daily Store Report: ${storeName} — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

      const plainText = [
        `Daily Store Report — ${storeName}`,
        `Date: ${today}`,
        ``,
        `TODAY'S PERFORMANCE`,
        `New Customers: ${formatNum(newCustomers)}`,
        `Total Visits: ${formatNum(totalVisits)}`,
        `Points Earned: ${formatNum(pointsEarned)}`,
        `Points Redeemed: ${formatNum(pointsRedeemed)}`,
        `Active Customers (30d): ${formatNum(activeCustomers)}`,
        `Retention Rate: ${retentionRate}%`,
        ``,
        `View full analytics: https://samparka.co/?tab=activity`,
        ``,
        `---`,
        `This is your automated daily store report from Samparka.`,
        `Powered by Samparka — Loyalty Platform`,
      ].join("\n");

      // Send one email per recipient (never expose recipient list)
      for (const email of toEmails) {
        try {
          const mailOptions = {
            from: `"Samparka Reports" <${process.env.EMAIL_USER}>`,
            replyTo: `"Samparka Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            text: plainText,
            html,
            headers: {
              "List-Unsubscribe": `<mailto:${process.env.EMAIL_USER}?subject=Unsubscribe>`,
              "X-Mailer": "Samparka Platform",
            },
          };
          const info = await this._sendMail(mailOptions);
          console.log(`✅ Daily report sent for ${storeName} | to: ${email} | msgId: ${info.messageId}`);
        } catch (sendErr) {
          console.error(`❌ Failed to send daily report for ${storeName} to ${email}:`, sendErr.message);
        }
      }

      return true;
    } catch (error) {
      console.error("❌ sendDailyStoreReport failed:", error.message || error);
      return false;
    }
  }

  async sendExpiryNotification({
    toEmails,
    storeName,
    storeUrl,
    daysRemaining,
    subscriptionEndDate,
    storeMetrics,
    storeServices,
  }) {
    try {
      const endDate = new Date(subscriptionEndDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Build features list from store services
      const features = [];
      if (storeServices?.loyalty) features.push("Loyalty Program");
      if (storeServices?.reservation) features.push("Reservations");
      if (storeServices?.ecommerce?.enabled) features.push("E-commerce");
      if (storeServices?.games) features.push("Games");
      if (storeServices?.multipleOutlets) features.push("Multiple Outlets");
      if (storeServices?.leaderboard) features.push("Leaderboard");
      if (storeServices?.l5) features.push("L5 Premium Features");

      const featureRows = features
        .map(
          (feature) => `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #fef3c7;color:#92400e;font-size:14px;">• ${feature}</td>
          </tr>`
        )
        .join("");

      // WhatsApp support link with pre-filled message
      const supportWhatsApp = process.env.SUPPORT_WHATSAPP || "9779766387030";
      const whatsappMessage = encodeURIComponent(`${storeName} - My subscription is expiring`);
      const whatsappLink = `https://wa.me/${supportWhatsApp}?text=${whatsappMessage}`;

      // Professional, straightforward email design
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Subscription Expiry Notice</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:30px 15px;">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e0e0e0;border-radius:8px;">

    <!-- Header -->
    <tr>
      <td style="padding:30px 30px 20px;background:#dc2626;border-radius:8px 8px 0 0;">
        <h1 style="margin:0;font-size:24px;font-weight:600;color:#ffffff;">Subscription Expiry Notice</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#fee2e2;">Action required for ${storeName}</p>
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding:30px;">
        <p style="margin:0 0 20px;font-size:15px;color:#1f2937;line-height:1.6;">
          Dear ${storeName} Team,
        </p>
        <p style="margin:0 0 20px;font-size:15px;color:#1f2937;line-height:1.6;">
          This is a reminder that your Samparka subscription will expire soon. Please take action to avoid service interruption.
        </p>

        <!-- Expiry Info Box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 25px;background:#fef2f2;border-left:4px solid #dc2626;border-radius:4px;">
          <tr>
            <td style="padding:20px;">
              <p style="margin:0 0 8px;font-size:13px;color:#991b1b;font-weight:600;text-transform:uppercase;">Subscription Status</p>
              <p style="margin:0;font-size:32px;color:#dc2626;font-weight:700;">${daysRemaining} Day${daysRemaining !== 1 ? "s" : ""} Remaining</p>
              <p style="margin:8px 0 0;font-size:14px;color:#7f1d1d;">Expires on ${endDate}</p>
            </td>
          </tr>
        </table>

        ${featureRows ? `
        <!-- Features at Risk -->
        <div style="margin:0 0 25px;">
          <p style="margin:0 0 12px;font-size:14px;color:#1f2937;font-weight:600;">Services that will be affected:</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:4px;">
            ${featureRows}
          </table>
        </div>
        ` : ""}

        <p style="margin:0 0 25px;font-size:15px;color:#1f2937;line-height:1.6;">
          To continue using Samparka without interruption, please renew your subscription at your earliest convenience.
        </p>

        <!-- CTA Button -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:10px 0;">
              <a href="https://samparka.co/?action=renew" style="display:inline-block;padding:14px 30px;background:#dc2626;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;border-radius:6px;">
                Renew Subscription
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Support Section -->
    <tr>
      <td style="padding:25px 30px;background:#f9fafb;border-top:1px solid #e5e7eb;">
        <p style="margin:0 0 15px;font-size:14px;color:#1f2937;font-weight:600;">Need Assistance?</p>
        <p style="margin:0 0 12px;font-size:14px;color:#4b5563;line-height:1.5;">
          Our support team is ready to help you with the renewal process.
        </p>

        <!-- Contact Buttons -->
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-right:10px;">
              <a href="${whatsappLink}" style="display:inline-block;padding:10px 18px;background:#25d366;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;border-radius:6px;">
                💬 WhatsApp
              </a>
            </td>
            <td>
              <a href="mailto:${process.env.EMAIL_USER}" style="display:inline-block;padding:10px 18px;background:#6b7280;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;border-radius:6px;">
                📧 Email
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding:20px 30px;background:#ffffff;border-top:1px solid #e5e7eb;border-radius:0 0 8px 8px;">
        <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
          This is an automated notification from Samparka Loyalty Platform.<br>
          ${today}
        </p>
      </td>
    </tr>

  </table>
  </td></tr>
</table>
</body>
</html>`;

      const subject = `Subscription Expiry Notice - ${daysRemaining} Day${daysRemaining !== 1 ? "s" : ""} Remaining | ${storeName}`;

      const plainText = [
        `SUBSCRIPTION EXPIRY NOTICE`,
        ``,
        `Dear ${storeName} Team,`,
        ``,
        `This is a reminder that your Samparka subscription will expire soon.`,
        ``,
        `SUBSCRIPTION STATUS`,
        `Days Remaining: ${daysRemaining}`,
        `Expiry Date: ${endDate}`,
        ``,
        ...(features.length > 0 ? [
          `SERVICES THAT WILL BE AFFECTED:`,
          ...features.map((f) => `• ${f}`),
          ``,
        ] : []),
        `ACTION REQUIRED`,
        `Please renew your subscription to continue using Samparka without interruption.`,
        ``,
        `Renew here: https://samparka.co/?action=renew`,
        ``,
        `NEED ASSISTANCE?`,
        `WhatsApp: ${whatsappLink}`,
        `Email: ${process.env.EMAIL_USER}`,
        ``,
        `---`,
        `Samparka Loyalty Platform`,
        `${today}`,
      ].join("\n");

      // Send one email per recipient (never expose recipient list)
      // Rate limiting: 1.5s delay between sends
      for (const email of toEmails) {
        try {
          const mailOptions = {
            from: `"Samparka Support" <${process.env.EMAIL_USER}>`,
            replyTo: `"Samparka Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            text: plainText,
            html,
            headers: {
              "X-Priority": "1",
              "X-MSMail-Priority": "High",
              "Importance": "high",
              "X-Mailer": "Samparka",
            },
          };
          const info = await this._sendMail(mailOptions);
          console.log(
            `✅ Expiry notification sent for ${storeName} (${daysRemaining}d remaining) | to: ${email} | msgId: ${info.messageId}`
          );
        } catch (sendErr) {
          console.error(
            `❌ Failed to send expiry notification for ${storeName} to ${email}:`,
            sendErr.message
          );
        }

        // Rate limiting: 1.5s delay between sends
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      return true;
    } catch (error) {
      console.error("❌ sendExpiryNotification failed:", error.message || error);
      return false;
    }
  }

  async sendEventNotification({ toEmails, event }) {
    try {
      const typeLabels = {
        marketing_campaign: "Marketing Campaign",
        seasonal_promotion: "Seasonal Promotion",
        customer_followup: "Customer Follow-up",
        general_announcement: "General Announcement",
        billing_reminder: "Billing Reminder",
      };

      const typeColors = {
        marketing_campaign: "#1d4ed8",
        seasonal_promotion: "#b45309",
        customer_followup: "#7e22ce",
        general_announcement: "#016e49",
        billing_reminder: "#dc2626",
      };

      const typeLabel = typeLabels[event.type] || "Event";
      const typeColor = typeColors[event.type] || "#016e49";

      const scheduledDate = new Date(event.scheduledAt).toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#016e49,#014d33);padding:32px;text-align:center;">
            <img src="https://res.cloudinary.com/spyc/image/upload/v1737542135/SAMPARKA_ynzpeq.png" alt="Samparka" style="height:40px;margin-bottom:16px;display:block;margin-left:auto;margin-right:auto;" />
            <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">New Event Notification</h1>
            <p style="color:#a7f3d0;margin:8px 0 0;font-size:14px;">From Samparka Admin</p>
          </td>
        </tr>

        <!-- Event Type Badge -->
        <tr>
          <td style="padding:28px 32px 0;text-align:center;">
            <span style="display:inline-block;padding:6px 16px;background-color:${typeColor}1a;color:${typeColor};border:1px solid ${typeColor}40;border-radius:100px;font-size:13px;font-weight:600;">
              ${typeLabel}
            </span>
          </td>
        </tr>

        <!-- Event Title & Description -->
        <tr>
          <td style="padding:20px 32px 0;">
            <h2 style="margin:0 0 12px;color:#111827;font-size:20px;font-weight:700;">${event.title}</h2>
            <div style="color:#4b5563;font-size:15px;line-height:1.7;white-space:pre-wrap;">${event.description}</div>
          </td>
        </tr>

        <!-- Scheduled Date -->
        <tr>
          <td style="padding:20px 32px 0;">
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;">
              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Scheduled For</p>
              <p style="margin:0;font-size:15px;color:#111827;font-weight:600;">${scheduledDate}</p>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:28px 32px;text-align:center;">
            <a href="https://samparka.co"
               style="display:inline-block;padding:12px 32px;background-color:#016e49;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
              View Your Dashboard
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;">
              This notification was sent to you by the Samparka platform admin.
            </p>
            <p style="margin:0;color:#d1d5db;font-size:11px;">Powered by Samparka &mdash; Loyalty Platform</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

      const subject = `[${typeLabel}] ${event.title}`;

      const plainText = [
        `${typeLabel}: ${event.title}`,
        `Scheduled for: ${scheduledDate}`,
        ``,
        event.description,
        ``,
        `View your dashboard: https://samparka.co`,
        ``,
        `---`,
        `This notification was sent to you by the Samparka platform admin.`,
        `Powered by Samparka — Loyalty Platform`,
      ].join("\n");

      // Send one email per recipient (never expose recipient list)
      for (const email of toEmails) {
        try {
          const mailOptions = {
            from: `"Samparka Admin" <${process.env.EMAIL_USER}>`,
            replyTo: `"Samparka Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            text: plainText,
            html,
            headers: {
              "List-Unsubscribe": `<mailto:${process.env.EMAIL_USER}?subject=Unsubscribe>`,
              "X-Mailer": "Samparka Platform",
            },
          };
          const info = await this._sendMail(mailOptions);
          console.log(`✅ Event notification sent | title: ${event.title} | to: ${email} | msgId: ${info.messageId}`);
        } catch (sendErr) {
          console.error(`❌ Failed to send event notification to ${email}:`, sendErr.message);
        }
      }

      return true;
    } catch (error) {
      console.error("❌ sendEventNotification failed:", error.message || error);
      return false;
    }
  }

  async mailCustomers({
    user,
    pass,
    host,
    port,
    secure,
    email,
    subject,
    message,
    points,
    reward,
    storeName,
    storeURL,
    cardColor,
    textColor,
    customerName,
    customerEmail,
    customerPhone,
    transporter = null,
    imageBuffer = null,
    imageMimeType = "image/jpeg",
    ctaText = null,   // null = use legacy "View My Points" fallback (transactional emails)
    ctaUrl = null,    // "" = explicitly no CTA (campaign emails with no CTA chosen)
  }) {
    try {
      // Use shared pooled transporter if provided (bulk campaign sends),
      // otherwise create a one-off transport (transactional/cron sends).
      const transport = transporter || nodemailer.createTransport(
        host && port
          ? {
              host,
              port: Number(port),
              secure: secure === 'ssl',
              ...(secure === 'none' && { ignoreTLS: true }),
              auth: { user, pass },
            }
          : {
              service: "gmail",
              auth: { user, pass },
            }
      );

       const formattedMessage = message
         .replace(/\[points_earned\]/g, points ?? "")
         .replace(/\[reward_name\]/g, reward ?? "")
         .replace(/\[store_name\]/g, storeName || "")
         .replace(/\[store_link\]/g, `https://${storeURL}.samparka.co/loyality`)
         .replace(/\[customer_name\]/g, customerName || "")
         .replace(/\[customer_email\]/g, customerEmail || "")
         .replace(/\[customer_phone\]/g, customerPhone || "")
         .replace(/&nbsp;/g, " ");

      let resolvedCardColor = cardColor;
      let resolvedTextColor = textColor;

      if ((!resolvedCardColor || !resolvedTextColor) && storeURL) {
        try {
          const store = await storeModel
            .findOne({ url: storeURL })
            .select("loyaltyCard");
          if (store?.loyaltyCard) {
            if (!resolvedCardColor) {
              resolvedCardColor = store.loyaltyCard.cardColor;
            }
            if (!resolvedTextColor) {
              resolvedTextColor = store.loyaltyCard.textColor;
            }
          }
        } catch (lookupError) {
          console.error("❌ mailCustomers color lookup failed:", lookupError.message || lookupError);
        }
      }

      const brandColor = resolvedCardColor || "#016e49";
      const brandText = resolvedTextColor || "#ffffff";
      const loyaltyURL = `https://${storeURL}.samparka.co/loyality`;

      // Body: Quill outputs HTML — use directly. Plain-text (old campaigns) goes through formatEmailBody().
      const isHtml = formattedMessage && /<[a-z]/i.test(formattedMessage);
      const htmlBody = isHtml ? formattedMessage : formatEmailBody(formattedMessage);

      // CTA logic:
      //   ctaText === null  → caller didn't specify (transactional email) → show legacy "View My Points"
      //   ctaText === ""    → campaign email with no CTA chosen → omit button
      //   ctaText === "..." → campaign email with custom CTA → show custom button
       const ctaLabel = ctaText !== null ? ctaText : "View My Points";
       const resolvedCtaUrl = (ctaUrl || loyaltyURL).replace(/\[store_link\]/g, loyaltyURL);
       const showCta = ctaText === null || (ctaText.trim() && ctaUrl && ctaUrl.trim());

      const mailOptions = {
        from: `"${storeName}" <${user}>`,
        to: email,
        subject: subject,
        // Required by Gmail bulk sender policy (Feb 2024).
        // List-Unsubscribe lets recipients opt out with one click in Gmail UI.
        // Precedence: bulk suppresses out-of-office auto-replies.
        headers: {
          "List-Unsubscribe": `<${loyaltyURL}>, <mailto:${user}?subject=unsubscribe>`,
          "Precedence": "bulk",
          "X-Mailer": "Samparka",
        },
        attachments: imageBuffer
          ? [{ filename: "campaign-image", content: imageBuffer, cid: "campaign-image@samparka", contentType: imageMimeType }]
          : undefined,
        html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">

        <!-- Header -->
        <tr>
          <td style="background-color:${brandColor};padding:28px 32px;text-align:center;">
            <span style="color:${brandText};font-size:20px;font-weight:700;letter-spacing:0.5px;">${storeName}</span>
          </td>
        </tr>

        <!-- Campaign Image (CID inline — renders in all email clients) -->
        ${imageBuffer ? `
        <tr>
          <td style="padding:0;line-height:0;">
            <img src="cid:campaign-image@samparka"
                 alt="${storeName}"
                 style="width:100%;max-width:600px;display:block;border:0;" />
          </td>
        </tr>` : ""}

        <!-- Body -->
        <tr>
          <td style="padding:32px;color:#374151;font-size:15px;line-height:1.7;">
             ${htmlBody.replace(/&nbsp;/g, " ")}
          </td>
        </tr>

        <!-- CTA -->
        ${showCta ? `
        <tr>
          <td style="padding:0 32px 32px;text-align:center;">
            <a href="${resolvedCtaUrl}"
               style="display:inline-block;padding:12px 28px;background-color:${brandColor};color:${brandText};text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
              ${ctaLabel}
            </a>
          </td>
        </tr>` : ""}

        <!-- Footer -->
        <tr>
          <td style="background-color:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;">
              You received this email because you are a member of the ${storeName} loyalty program.
            </p>
            <p style="margin:0;color:#d1d5db;font-size:11px;">Powered by Samparka</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
        `,
      };

      await new Promise((resolve, reject) => {
        transport.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            return reject(error);
          } else {
            console.log("✅ mailCustomers sent | to:", mailOptions.to, "| subject:", mailOptions.subject, "| messageId:", info.messageId, "| response:", info.response);
            resolve(info);
          }
        });
      });

      return true;
    } catch (error) {
      console.error("❌ mailCustomers error:", error.message || error);
      return false;
    }
  }
}

module.exports = new MailController();

// html: `
//  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
//     <h2 style="color: #333;">Congratulation 🎉 </h2>
//     <p style="color: #555;">You have received ${points} points.</p>
//     <div style="text-align: center; margin-top: 20px;">
//         <a href="https://${storeURL}.samparka.co/loyality"
//         style="padding: 10px 20px; background-color: #007BFF; color: white; text-decoration: none; border-radius: 5px;">
//         View Points
//         </a>
//     </div>
// </div>
// `,
