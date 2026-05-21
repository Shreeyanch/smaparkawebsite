const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const s3 = require("../config/s3Config");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const Campaign = require("../models/campaignModel");
const CustomerAnalytics = require("../models/analytics_model/customerAnalyticsModel");
const Customer = require("../models/customerModel");
const Store = require("../models/storeModel");
const MailSMS = require("../models/mailSMSModel");
const smsController = require("../controllers/smsController");
const notificationController = require("../controllers/notificationController");
const mailController = require("../controllers/mailController");

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

const SEGMENT_LABELS = {
  first_visit: "First-Time Visitors",
  second_visit: "Second-Time Visitors",
  third_visit: "Third-Time Visitors",
  fourth_visit: "Fourth-Time Visitors",
  "5+_visits": "Loyal Champions",
  at_risk: "At-Risk Customers",
  churned: "Churned Customers",
};

/**
 * Get customers by special segment (at_risk or churned)
 * These are calculated dynamically based on lastVisit date
 */
async function getCustomersBySpecialSegment(
  storeId,
  segmentType,
  { page = 1, limit = 10, search }
) {
  const storeObjectId = new mongoose.Types.ObjectId(storeId);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  let dateFilter = {};

  if (segmentType === "at_risk") {
    // At-risk: repeat customers (2+ visits) with last visit between 30-90 days ago
    dateFilter = {
      visitCount: { $gte: 2 },
      lastVisit: { $lt: thirtyDaysAgo, $gte: ninetyDaysAgo },
    };
  } else if (segmentType === "churned") {
    // Churned: repeat customers (2+ visits) with last visit over 90 days ago
    dateFilter = {
      visitCount: { $gte: 2 },
      lastVisit: { $lt: ninetyDaysAgo },
    };
  } else {
    return { customers: [], total: 0 };
  }

  const skip = (page - 1) * limit;

  const pipeline = [
    { $match: { store: storeObjectId, ...dateFilter } },
    {
      $lookup: {
        from: "customers",
        localField: "customer",
        foreignField: "_id",
        as: "customerInfo",
      },
    },
    { $unwind: "$customerInfo" },
  ];

  // Add search filter if provided
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { "customerInfo.name": { $regex: search, $options: "i" } },
          { "customerInfo.email": { $regex: search, $options: "i" } },
          { "customerInfo.phone": { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  // Count total before pagination
  const countPipeline = [...pipeline, { $count: "total" }];
  const countResult = await CustomerAnalytics.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Add pagination and projection
  pipeline.push(
    { $sort: { lastVisit: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        customer: 1,
        visitCount: 1,
        segment: 1,
        firstVisit: 1,
        lastVisit: 1,
        totalPointsEarned: 1,
        avgDaysBetweenVisits: 1,
        customerName: "$customerInfo.name",
        customerEmail: "$customerInfo.email",
        customerPhone: "$customerInfo.phone",
        customerCountryCode: "$customerInfo.countryCode",
        customerTier: "$customerInfo.tier",
        customerPoints: "$customerInfo.points",
      },
    }
  );

  const customers = await CustomerAnalytics.aggregate(pipeline);

  return {
    customers,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Get count of customers in a special segment
 */
async function getSpecialSegmentCount(storeId, segmentType) {
  const storeObjectId = new mongoose.Types.ObjectId(storeId);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  let filter = { store: storeObjectId, visitCount: { $gte: 2 } };

  if (segmentType === "at_risk") {
    filter.lastVisit = { $lt: thirtyDaysAgo, $gte: ninetyDaysAgo };
  } else if (segmentType === "churned") {
    filter.lastVisit = { $lt: ninetyDaysAgo };
  } else {
    return 0;
  }

  return CustomerAnalytics.countDocuments(filter);
}

/**
 * Resolve recipients from segments and/or individual customer IDs
 * Returns a deduplicated list of customer objects with contact info
 */
async function resolveRecipients(storeId, { segments = [], customerIds = [] }) {
  const storeObjectId = new mongoose.Types.ObjectId(storeId);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const recipientMap = new Map(); // Use map for deduplication by customer ID

  // Handle segment-based selection
  if (segments.length > 0) {
    const regularSegments = segments.filter(
      (s) => !["at_risk", "churned"].includes(s)
    );
    const includesNoVisits = regularSegments.includes("no_visits");
    const analyticsSegments = regularSegments.filter((s) => s !== "no_visits");
    const hasAtRisk = segments.includes("at_risk");
    const hasChurned = segments.includes("churned");

    // Query for regular segments
    if (analyticsSegments.length > 0) {
      const segmentCustomers = await CustomerAnalytics.aggregate([
        {
          $match: {
            store: storeObjectId,
            segment: { $in: analyticsSegments },
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "customer",
            foreignField: "_id",
            as: "customerInfo",
          },
        },
        { $unwind: "$customerInfo" },
        {
          $project: {
            customer: 1,
            customerName: "$customerInfo.name",
            customerPhone: "$customerInfo.phone",
            customerEmail: "$customerInfo.email",
            customerCountryCode: "$customerInfo.countryCode",
          },
        },
      ]);

      segmentCustomers.forEach((c) => {
        recipientMap.set(c.customer.toString(), {
          customer: c.customer,
          customerName: c.customerName,
          customerPhone: c.customerCountryCode
            ? `${c.customerCountryCode}${c.customerPhone}`
            : c.customerPhone?.toString(),
          customerEmail: c.customerEmail,
        });
      });
    }

    // Query no-visit customers from Customer model with no analytics entry
    if (includesNoVisits) {
      const noVisitCustomers = await Customer.aggregate([
        { $match: { store: storeObjectId } },
        {
          $lookup: {
            from: "customeranalytics",
            let: { customerId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$customer", "$$customerId"] },
                      { $eq: ["$store", storeObjectId] },
                    ],
                  },
                },
              },
            ],
            as: "analytics",
          },
        },
        {
          $match: {
            $expr: { $eq: [{ $size: "$analytics" }, 0] },
          },
        },
        {
          $project: {
            customer: "$_id",
            customerName: "$name",
            customerPhone: "$phone",
            customerEmail: "$email",
            customerCountryCode: "$countryCode",
          },
        },
      ]);

      noVisitCustomers.forEach((c) => {
        recipientMap.set(c.customer.toString(), {
          customer: c.customer,
          customerName: c.customerName,
          customerPhone: c.customerCountryCode
            ? `${c.customerCountryCode}${c.customerPhone}`
            : c.customerPhone?.toString(),
          customerEmail: c.customerEmail,
        });
      });
    }

    // Query for at-risk customers
    if (hasAtRisk) {
      const atRiskCustomers = await CustomerAnalytics.aggregate([
        {
          $match: {
            store: storeObjectId,
            visitCount: { $gte: 2 },
            lastVisit: { $lt: thirtyDaysAgo, $gte: ninetyDaysAgo },
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "customer",
            foreignField: "_id",
            as: "customerInfo",
          },
        },
        { $unwind: "$customerInfo" },
        {
          $project: {
            customer: 1,
            customerName: "$customerInfo.name",
            customerPhone: "$customerInfo.phone",
            customerEmail: "$customerInfo.email",
            customerCountryCode: "$customerInfo.countryCode",
          },
        },
      ]);

      atRiskCustomers.forEach((c) => {
        recipientMap.set(c.customer.toString(), {
          customer: c.customer,
          customerName: c.customerName,
          customerPhone: c.customerCountryCode
            ? `${c.customerCountryCode}${c.customerPhone}`
            : c.customerPhone?.toString(),
          customerEmail: c.customerEmail,
        });
      });
    }

    // Query for churned customers
    if (hasChurned) {
      const churnedCustomers = await CustomerAnalytics.aggregate([
        {
          $match: {
            store: storeObjectId,
            visitCount: { $gte: 2 },
            lastVisit: { $lt: ninetyDaysAgo },
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "customer",
            foreignField: "_id",
            as: "customerInfo",
          },
        },
        { $unwind: "$customerInfo" },
        {
          $project: {
            customer: 1,
            customerName: "$customerInfo.name",
            customerPhone: "$customerInfo.phone",
            customerEmail: "$customerInfo.email",
            customerCountryCode: "$customerInfo.countryCode",
          },
        },
      ]);

      churnedCustomers.forEach((c) => {
        recipientMap.set(c.customer.toString(), {
          customer: c.customer,
          customerName: c.customerName,
          customerPhone: c.customerCountryCode
            ? `${c.customerCountryCode}${c.customerPhone}`
            : c.customerPhone?.toString(),
          customerEmail: c.customerEmail,
        });
      });
    }
  }

  // Handle individual customer selection
  if (customerIds.length > 0) {
    const customerObjectIds = customerIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const individualCustomers = await Customer.find({
      _id: { $in: customerObjectIds },
      store: storeObjectId,
    }).select("name email phone countryCode");

    individualCustomers.forEach((c) => {
      recipientMap.set(c._id.toString(), {
        customer: c._id,
        customerName: c.name,
        customerPhone: c.countryCode
          ? `${c.countryCode}${c.phone}`
          : c.phone?.toString(),
        customerEmail: c.email,
      });
    });
  }

  return Array.from(recipientMap.values());
}

/**
 * Create a new campaign
 */
async function createCampaign(storeId, campaignData, userId) {
  const {
    name,
    segments = [],
    customerIds = [],
    channel,
    messageType,
    templateId,
    customMessage,
    scheduledFor,
    sendNow = false,
    campaignImageKey,
  } = campaignData;

  // Determine target type
  let targetType = "individual";
  if (segments.length > 0 && customerIds.length > 0) {
    targetType = "mixed";
  } else if (segments.length > 0) {
    targetType = "segment";
  }

  // Resolve recipients
  const recipients = await resolveRecipients(storeId, { segments, customerIds });

  if (recipients.length === 0) {
    throw new Error("No recipients found for the selected criteria");
  }

  // Determine initial status
  let status = "draft";
  if (sendNow) {
    status = "processing";
  } else if (scheduledFor) {
    const scheduleDate = new Date(scheduledFor);
    if (scheduleDate <= new Date()) {
      status = "processing"; // Schedule time is in the past, send immediately
    } else {
      status = "scheduled";
    }
  }

  const campaign = new Campaign({
    store: storeId,
    name,
    targetType,
    segments,
    recipients,
    recipientCount: recipients.length,
    channel,
    messageType,
    templateId,
    customMessage,
    campaignImageKey: campaignImageKey || undefined,
    status,
    scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
    createdBy: userId,
  });

  await campaign.save();

  // If sending now or scheduled time passed, start processing
  if (status === "processing") {
    // Don't await - let it process in background
    processCampaign(campaign._id).catch((err) => {
      console.error("Campaign processing error:", err);
    });
  }

  return campaign;
}

/**
 * Process a campaign - queue all messages for sending
 */
async function processCampaign(campaignId) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    throw new Error("Campaign not found");
  }

  if (!["scheduled", "processing", "draft"].includes(campaign.status)) {
    throw new Error(`Campaign cannot be processed in status: ${campaign.status}`);
  }

  // Update status to processing
  campaign.status = "processing";
  campaign.sentAt = new Date();
  await campaign.save();

  // Get store info for SMS token and other details
  const store = await Store.findById(campaign.store);
  if (!store) {
    campaign.status = "failed";
    campaign.lastError = "Store not found";
    await campaign.save();
    throw new Error("Store not found");
  }

  // Get message templates if using template
  let messageContent = campaign.customMessage;
  if (campaign.messageType === "template" && campaign.templateId) {
    const mailSMS = await MailSMS.findOne({ store: campaign.store });
    if (mailSMS && mailSMS[campaign.templateId]) {
      const template = mailSMS[campaign.templateId];
       messageContent = {
         title: template.title || template.subject,
         body: template.body || template.message,
         subject: template.subject,
         ctaText: template.ctaText,
         ctaUrl: template.ctaUrl,
       };
    }
  }

  // For email campaigns: fetch campaign image from S3 once — reuse buffer for all recipients.
  let campaignImageBuffer = null;
  let campaignImageMimeType = null;
  if (campaign.channel === "email" && campaign.campaignImageKey) {
    try {
      const { Body, ContentType } = await s3.send(
        new GetObjectCommand({ Bucket: "samparka", Key: campaign.campaignImageKey })
      );
      campaignImageBuffer = await streamToBuffer(Body);
      campaignImageMimeType = ContentType || "image/jpeg";
      console.log("✅ Campaign image fetched from S3:", campaign.campaignImageKey);
    } catch (err) {
      console.warn("⚠️ Could not fetch campaign image from S3 — sending without image:", err.message);
    }
  }

  // For email campaigns: create a single pooled SMTP connection reused for all sends.
  // This avoids opening a new TCP handshake per email, which triggers Gmail rate limits.
  let emailTransporter = null;
  if (campaign.channel === "email" && store.email && store.pass) {
    emailTransporter = nodemailer.createTransport(
      store.host && store.port
        ? {
            pool: true,
            maxConnections: 1,
            rateDelta: 1500,
            rateLimit: 1,
            host: store.host,
            port: Number(store.port),
            secure: store.secure === "ssl",
            ...(store.secure === "none" && { ignoreTLS: true }),
            auth: { user: store.email, pass: store.pass },
          }
        : {
            pool: true,
            maxConnections: 1,
            rateDelta: 1500,
            rateLimit: 1,
            service: "gmail",
            auth: { user: store.email, pass: store.pass },
          }
    );
  }

  // Process each recipient
  for (const recipient of campaign.recipients) {
    try {
      await sendSingleMessage(campaign, recipient, store, messageContent, emailTransporter, campaignImageBuffer, campaignImageMimeType);
    } catch (error) {
      console.error(
        `Failed to send to ${recipient.customerName}:`,
        error.message
      );
    }
    // Rate-limit email: 1.5 s gap between sends to avoid Gmail SMTP throttling.
    // SMS and push are handled by their own services and need no artificial delay.
    if (campaign.channel === "email") {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  // Release the pooled SMTP connection
  if (emailTransporter) {
    emailTransporter.close();
  }

  // Update campaign status
  campaign.status = "completed";
  campaign.completedAt = new Date();
  await campaign.save();

  return campaign;
}

/**
 * Send a single message to one recipient
 */
async function sendSingleMessage(campaign, recipient, store, messageContent, emailTransporter = null, campaignImageBuffer = null, campaignImageMimeType = null) {
  const { channel } = campaign;

  // Prepare variables for replacement
  const variables = {
    customerName: recipient.customerName || "Customer",
    customerEmail: recipient.customerEmail || "",
    customerPhone: recipient.customerPhone || "",
    storeName: store.name,
    storeURL: store.url,
    points: "",
    reward: "",
  };

  let result = { success: false };

  try {
    if (channel === "sms") {
      // Check if store has SMS token
      if (!store.smsToken) {
        throw new Error("Store does not have SMS configured");
      }

      result = await smsController.smsCustomer({
        token: store.smsToken,
        to: recipient.customerPhone,
        from: "TheAlert",
        message: messageContent?.body || "",
        points: variables.points,
        reward: variables.reward,
        storeName: variables.storeName,
        storeURL: variables.storeURL,
        customerName: variables.customerName,
        customerEmail: variables.customerEmail,
        customerPhone: variables.customerPhone,
      });
    } else if (channel === "push") {
      result = await notificationController.singleNotification({
        title: messageContent?.title || "Notification",
        body: messageContent?.body || "",
        userId: recipient.customer,
        points: variables.points,
        reward: variables.reward,
        storeName: variables.storeName,
        storeURL: variables.storeURL,
        customerName: variables.customerName,
        customerEmail: variables.customerEmail,
        customerPhone: variables.customerPhone,
        storeId: store._id,
      });
    } else if (channel === "email") {
      if (!store.email || !store.pass) {
        result = { success: false, message: "INVALID_CREDENTIALS: Store SMTP not configured" };
      } else if (!recipient.customerEmail) {
        result = { success: false, message: "Recipient has no email address" };
      } else {
        const sent = await mailController.mailCustomers({
          user: store.email,
          pass: store.pass,
          host: store.host,
          port: store.port,
          secure: store.secure,
          email: recipient.customerEmail,
          subject: messageContent?.subject || `Message from ${store.name}`,
          message: messageContent?.body || "",
          storeName: variables.storeName,
          storeURL: variables.storeURL,
          customerName: variables.customerName,
          customerEmail: variables.customerEmail,
          customerPhone: variables.customerPhone,
          cardColor: store.loyaltyCard?.cardColor,
          textColor: store.loyaltyCard?.textColor,
          transporter: emailTransporter,
          imageBuffer: campaignImageBuffer,
          imageMimeType: campaignImageMimeType,
          ctaText: messageContent?.ctaText ?? null,
          ctaUrl: messageContent?.ctaUrl ?? null,
        });
        result = sent
          ? { success: true, message: "Email sent" }
          : { success: false, message: "Email delivery failed" };
      }
    }
    // WhatsApp to be implemented later

    // Update campaign counters
    campaign.sendAttempted += 1;
    if (result.success) {
      campaign.sendSucceeded += 1;
    } else {
      campaign.sendFailed += 1;
      campaign.lastError = result.error || result.message || "Unknown error";
    }
    await campaign.save();

    return result;
  } catch (error) {
    campaign.sendAttempted += 1;
    campaign.sendFailed += 1;
    campaign.lastError = error.message;
    await campaign.save();
    throw error;
  }
}

/**
 * Get campaigns for a store with pagination
 */
async function getCampaigns(storeId, { page = 1, limit = 10, status }) {
  const storeObjectId = new mongoose.Types.ObjectId(storeId);
  const skip = (page - 1) * limit;

  const filter = { store: storeObjectId };
  if (status) {
    filter.status = status;
  }

  const [campaigns, total] = await Promise.all([
    Campaign.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-recipients") // Exclude large recipients array for list view
      .lean(),
    Campaign.countDocuments(filter),
  ]);

  return {
    campaigns,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

/**
 * Get a single campaign by ID
 */
async function getCampaignById(campaignId) {
  return Campaign.findById(campaignId).lean();
}

/**
 * Cancel a scheduled campaign
 */
async function cancelCampaign(campaignId) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    throw new Error("Campaign not found");
  }

  if (!["draft", "scheduled"].includes(campaign.status)) {
    throw new Error(`Cannot cancel campaign in status: ${campaign.status}`);
  }

  campaign.status = "cancelled";
  await campaign.save();

  return campaign;
}

/**
 * Get available templates for a channel
 */
async function getTemplatesForChannel(storeId, channel) {
  const mailSMS = await MailSMS.findOne({ store: storeId });
  if (!mailSMS) {
    return [];
  }

  const templates = [];

  if (channel === "sms") {
    const smsFields = [
      "smsAfterLogin",
      "smsAfterPointEarned",
      "smsAfterRewardRedeemed",
      "smsAfterRewardClaimed",
      "smsAfterCreateCustomer",
      "smsOnBirthday",
      "smsAfterReservationConfirm",
    ];

    smsFields.forEach((field) => {
      if (mailSMS[field] && mailSMS[field].message) {
        templates.push({
          id: field,
          name: field.replace(/^sms/, "").replace(/([A-Z])/g, " $1").trim(),
          message: mailSMS[field].message,
        });
      }
    });
  } else if (channel === "push") {
    const pushFields = [
      "notificationAfterPointEarned",
      "notificationAfterRewardRedeemed",
      "notificationAfterRewardClaimed",
      "notificationOnBirthday",
      "notificationAfterReservationConfirm",
    ];

    pushFields.forEach((field) => {
      if (mailSMS[field] && (mailSMS[field].title || mailSMS[field].body)) {
        templates.push({
          id: field,
          name: field.replace(/^notification/, "").replace(/([A-Z])/g, " $1").trim(),
          title: mailSMS[field].title,
          body: mailSMS[field].body,
        });
      }
    });
  } else if (channel === "email") {
    const emailFields = [
      "mailAfterLogin",
      "mailAfterCreateCustomer",
      "mailOnBirthday",
      "mailAfterPointEarned",
      "mailAfterRewardClaimed",
      "mailAfterRewardRedeemed",
      "mailAfterReservationConfirm",
    ];

    emailFields.forEach((field) => {
      if (mailSMS[field] && (mailSMS[field].message || mailSMS[field].subject)) {
        templates.push({
          id: field,
          name: field.replace(/^mail/, "").replace(/([A-Z])/g, " $1").trim(),
          subject: mailSMS[field].subject,
          message: mailSMS[field].message,
          body: mailSMS[field].message,
        });
      }
    });
  }

  return templates;
}

module.exports = {
  getCustomersBySpecialSegment,
  getSpecialSegmentCount,
  resolveRecipients,
  createCampaign,
  processCampaign,
  sendSingleMessage,
  getCampaigns,
  getCampaignById,
  cancelCampaign,
  getTemplatesForChannel,
  SEGMENT_LABELS,
};
