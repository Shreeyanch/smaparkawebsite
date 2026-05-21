// controllers/whatsappController.js
const {
  uploadMedia,
  sendWhatsappMessage,
} = require("../services/sendWhatsapp");
const WhatsappMedia = require("../models/WhatsappMedia");
const WhatsappAccount = require("../models/whatsappAccountModel");
const Template = require("../models/whatsappTemplate");
const { messageQueue } = require("../queue");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/s3Config");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const WhatsappOutgoing = require("../models/WhatsappOutgoing");
const WhatsappChat = require("../models/WhatsappChat");
const axios = require("axios");

/**
 * Upload image → S3 → WhatsApp Media API
 */
exports.uploadImage = async (req, res) => {
  try {
    const { storeId } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const result = await uploadMedia(storeId, req.file);

    return res.json({
      success: true,
      mediaId: result.mediaId,
      fileName: result.imageName,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
};

/**
 * Send template message (header + body supported)
 */
exports.sendMessage = async (req, res) => {
  try {
    const {
      storeId,
      to,
      templateId,
      headerParams = [],
      bodyParams = [],
      mediaId,
    } = req.body;

    const account = await WhatsappAccount.findOne({ storeId });
    if (!account)
      return res.status(404).json({ error: "WhatsApp account not found" });

    if (!account.isActive)
      return res.status(400).json({ error: "WhatsApp account is not active" });

    const template = await Template.findById(templateId);
    if (!template) return res.status(404).json({ error: "Template not found" });

    const components = [];

    // Header component - EITHER image OR text, NOT BOTH
    if (template.hasImage && mediaId) {
      // Image header
      components.push({
        type: "header",
        parameters: [
          {
            type: "image",
            image: { id: mediaId },
          },
        ],
      });
    } else if (template.hasHeader && template.headerVariables?.length) {
      // Text header (only if no image)
      components.push({
        type: "header",
        parameters: template.headerVariables.map((variableName, index) => ({
          type: "text",
          parameter_name: variableName,
          text: headerParams[index] || variableName, // Map headerParams by index
        })),
      });
    }

    // Body component
    if (template.bodyVariables?.length) {
      components.push({
        type: "body",
        parameters: template.bodyVariables.map((variableName, index) => ({
          type: "text",
          parameter_name: variableName,
          text: bodyParams[index] || variableName, // Map bodyParams by index
        })),
      });
    }

    // Clean phone number - remove + and any spaces
    const cleanPhoneNumber = to.replace(/[\s+]/g, "");

    const response = await sendWhatsappMessage({
      storeId,
      to,
      // to: cleanPhoneNumber, // Send without + sign
      templateName: template.name,
      language: template.language || "en",
      components,
    });

    console.log("Whatsapp message response: ", response);

    const messageId = response.messages?.[0]?.id;

    if (messageId) {
      await WhatsappOutgoing.create({
        phone,
        templateId,
        messageId,
      });
    }

    return res.json({
      success: true,
      data: response,
    });
  } catch (err) {
    console.error("WhatsApp send error:", err.response?.data || err.message);
    return res.status(500).json({
      error: "Failed to send message",
      details: err.response?.data || err.message,
    });
  }
};

exports.bulkSendMessage = async (req, res) => {
  try {
    const {
      storeId,
      recipients = [], // Now an array of objects with phone + params
      templateId,
      mediaId,
    } = req.body;

    if (!storeId || !templateId || !recipients.length) {
      return res.status(400).json({
        error: "storeId, templateId, recipients are required",
      });
    }

    const account = await WhatsappAccount.findOne({ storeId });
    if (!account)
      return res.status(404).json({ error: "WhatsApp account not found" });

    if (!account.isActive)
      return res.status(400).json({ error: "WhatsApp account is not active" });

    const template = await Template.findById(templateId);
    if (!template) return res.status(404).json({ error: "Template not found" });

    const jobs = [];

    for (const recipient of recipients) {
      const { phone, headerParams = [], bodyParams = [] } = recipient;

      if (!phone) {
        console.warn("Skipping recipient without phone number");
        continue;
      }

      jobs.push({
        name: "send-wa-message",
        data: {
          storeId,
          to: phone,
          templateId,
          bodyParams, // Individual params per recipient
          headerParams, // Individual params per recipient
          mediaId,
        },
      });
    }

    // Add all jobs in bulk
    await messageQueue.addBulk(jobs);

    return res.json({
      success: true,
      queued: jobs.length,
      message: "Messages added to queue",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to queue messages" });
  }
};

/**
 * Create WhatsApp Account
 */
exports.createWhatsappAccount = async (req, res) => {
  try {
    const { storeId, phoneNumberId, phoneNumber, accessToken, tokenExpiresAt } =
      req.body;

    if (!storeId || !phoneNumberId || !phoneNumber || !accessToken) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newAccount = await WhatsappAccount.create({
      storeId,
      phoneNumberId,
      phoneNumber,
      accessToken,
      tokenExpiresAt,
      isActive: true,
    });

    return res.json({
      success: true,
      account: newAccount,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create WhatsApp account" });
  }
};

/**
 * Create Template
 */
exports.createTemplate = async (req, res) => {
  try {
    const {
      storeId,
      name,
      language,
      approved,
      hasHeader,
      hasImage,
      header,
      body,
      headerVariables,
      bodyVariables,
      footer,
      buttons,
    } = req.body;

    if (!storeId || !name) {
      return res.status(400).json({ error: "storeId and name are required" });
    }

    const newTemplate = await Template.create({
      storeId,
      name,
      language,
      approved,

      hasHeader,
      hasImage,
      header,
      body,
      headerVariables,
      bodyVariables,
      footer,
      buttons,
    });

    return res.json({
      success: true,
      template: newTemplate,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create template" });
  }
};

/**
 * List uploaded media
 */
exports.getMedia = async (req, res) => {
  try {
    const { storeId } = req.params;

    if (!storeId) {
      return res.status(400).json({ error: "Store ID is required" });
    }

    const media = await WhatsappMedia.find({ storeId }).sort({ createdAt: -1 });

    // Get image URL from S3 for each media
    const mediaWithUrls = await Promise.all(
      media.map(async (item) => {
        const getObjectParams = {
          Bucket: "samparka",
          Key: item.fileName,
        };
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour expiry

        // Convert to plain object and add imageUrl
        return {
          ...item.toObject(), // or item._doc
          imageUrl: url,
        };
      })
    );

    res.json(mediaWithUrls);
  } catch (error) {
    console.error("Error fetching media:", error);
    res.status(500).json({ error: "Failed to fetch media" });
  }
};

/**
 * List templates
 */
exports.getTemplates = async (req, res) => {
  const { storeId } = req.params;

  const templates = await Template.find({ storeId, approved: true }).sort({
    createdAt: -1,
  });

  res.json(templates);
};

/**
 * Get WhatsApp account details
 */
exports.getAccount = async (req, res) => {
  const { storeId } = req.params;

  const account = await WhatsappAccount.findOne({ storeId });

  res.json(account);
};

// Helper function to convert template to readable message
const convertTemplateToMessage = async (
  templateId,
  headerParams = [],
  bodyParams = []
) => {
  try {
    const template = await Template.findById(templateId);
    if (!template) return "Template message";

    let message = "";

    // Add header if exists
    if (template.hasHeader && template.header) {
      let header = template.header;
      headerParams.forEach((param, index) => {
        header = header.replace(`{{${index + 1}}}`, param);
      });
      message += header + "\n\n";
    }

    // Add body
    if (template.body) {
      let body = template.body;
      bodyParams.forEach((param, index) => {
        body = body.replace(`{{${index + 1}}}`, param);
      });
      message += body;
    }

    // Add footer if exists
    if (template.footer) {
      message += "\n\n" + template.footer;
    }

    return message;
  } catch (error) {
    console.error("Error converting template:", error);
    return "Template message";
  }
};

// Get chat list grouped by phone number (merging WhatsappChat and WhatsappOutgoing)
exports.getChatList = async (req, res) => {
  try {
    const { storeId } = req.query;

    // Get all incoming messages from WhatsappChat
    const incomingChats = await WhatsappChat.find({ direction: "in" })
      .sort({ timestamp: -1 })
      .lean();

    // Get all outgoing template messages from WhatsappOutgoing
    const outgoingMessages = await WhatsappOutgoing.find()
      .populate("templateId")
      .sort({ sentAt: -1 })
      .lean();

    // Merge both into a single array with unified structure
    const allMessages = [
      ...incomingChats.map((chat) => ({
        phone: chat.phone,
        message: chat.message,
        direction: "in",
        timestamp: chat.timestamp,
      })),
      ...outgoingMessages.map((msg) => ({
        phone: msg.phone,
        message: msg.templateId?.name || "Template message",
        direction: "out",
        timestamp: msg.sentAt,
        templateId: msg.templateId?._id,
      })),
    ];

    // Sort all messages by timestamp
    allMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Group by phone number and get last message
    const chatMap = {};
    allMessages.forEach((msg) => {
      if (!chatMap[msg.phone]) {
        chatMap[msg.phone] = {
          phone: msg.phone,
          lastMessage: msg.message,
          lastMessageTime: msg.timestamp,
          direction: msg.direction,
          unreadCount: msg.direction === "in" ? 1 : 0,
        };
      } else {
        // Only count unread incoming messages
        if (msg.direction === "in") {
          chatMap[msg.phone].unreadCount += 1;
        }
      }
    });

    // Convert to array and sort by last message time
    const chatList = Object.values(chatMap).sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    res.json(chatList);
  } catch (error) {
    console.error("Error fetching chat list:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat list",
      error: error.message,
    });
  }
};

// Get all messages for a specific phone number (merging both sources)
exports.getChatMessages = async (req, res) => {
  try {
    const { phone } = req.params;
    const { limit = 100 } = req.query;
    console.log("called");
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Get incoming messages from WhatsappChat
    const incomingMessages = await WhatsappChat.find({
      phone,
      direction: "in",
    }).lean();

    // Get outgoing template messages from WhatsappOutgoing
    const outgoingMessages = await WhatsappOutgoing.find({ phone })
      .populate("templateId")
      .lean();

    // Get outgoing quick messages from WhatsappChat
    const outgoingQuickMessages = await WhatsappChat.find({
      phone,
      direction: "out",
    }).lean();

    // Convert template messages to readable format
    const formattedOutgoing = await Promise.all(
      outgoingMessages.map(async (msg) => {
        const messageText = msg.templateId
          ? `📋 ${msg.templateId.name}` // Show template name with icon
          : "Template message";

        return {
          _id: msg._id,
          phone: msg.phone,
          direction: "out",
          message: messageText,
          timestamp: msg.sentAt,
          templateId: msg.templateId?._id,
          isTemplate: true,
        };
      })
    );

    // Merge all messages
    const allMessages = [
      ...incomingMessages.map((msg) => ({
        _id: msg._id,
        phone: msg.phone,
        direction: "in",
        message: msg.message,
        timestamp: msg.timestamp,
        isTemplate: false,
      })),
      ...formattedOutgoing,
      ...outgoingQuickMessages.map((msg) => ({
        _id: msg._id,
        phone: msg.phone,
        direction: "out",
        message: msg.message,
        timestamp: msg.timestamp,
        isTemplate: false,
      })),
    ];

    // Sort by timestamp (oldest first for chat display)
    allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    console.log("All Messages:", allMessages);
    // Apply limit
    const limitedMessages = allMessages.slice(-parseInt(limit));
    console.log("Limited Messages:", limitedMessages);
    res.json(limitedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message,
    });
  }
};

// Send a quick text message (without template)
exports.sendQuickMessage = async (req, res) => {
  try {
    const { storeId, phone, message } = req.body;

    // Validate input
    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Phone number and message are required",
      });
    }

    // Get WhatsApp account details for the store
    const whatsappAccount = await WhatsappAccount.findOne({
      storeId: storeId || "6798b5994dfc04de9e55a3c1",
    });

    if (!whatsappAccount) {
      return res.status(404).json({
        success: false,
        message: "WhatsApp account not found for this store",
      });
    }

    const { phoneNumberId, accessToken } = whatsappAccount;

    // Send message via WhatsApp Business API
    const whatsappResponse = await axios.post(
      `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const messageId = whatsappResponse.data.messages[0].id;

    // Save to chat history (as outgoing)
    const chatMessage = new WhatsappChat({
      phone,
      direction: "out",
      message,
      timestamp: new Date(),
    });
    await chatMessage.save();

    res.json({
      success: true,
      message: "Message sent successfully",
      // whatsappResponse: whatsappResponse,
      data: {
        messageId,
        phone,
        message,
        timestamp: chatMessage.timestamp,
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);

    // Handle WhatsApp API errors
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: "WhatsApp API error",
        error: error.response.data,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// ============================================
// Additional: Webhook handler for incoming messages
// ============================================

// Webhook verification (GET request)
exports.verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "your_verify_token";

  if (mode && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.status(403).send("Forbidden");
  }
};

// Webhook for incoming messages (POST request)
exports.handleIncomingMessage = async (req, res) => {
  try {
    const body = req.body;

    // Quick response to acknowledge receipt
    res.status(200).send("EVENT_RECEIVED");

    // Check if it's a WhatsApp message
    if (body.object === "whatsapp_business_account") {
      body.entry.forEach((entry) => {
        entry.changes.forEach(async (change) => {
          if (change.field === "messages") {
            const value = change.value;

            // Check if there are messages
            if (value.messages && value.messages.length > 0) {
              const message = value.messages[0];
              const phone = message.from;
              const messageText = message.text?.body || "";
              const messageId = message.id;

              // Save incoming message to database
              const chatMessage = new WhatsappChat({
                phone,
                direction: "in",
                message: messageText,
                timestamp: new Date(parseInt(message.timestamp) * 1000),
              });

              await chatMessage.save();
              console.log("Incoming message saved:", {
                phone,
                message: messageText,
              });
            }
          }
        });
      });
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
  }
};

// ============================================
// BONUS: Store template parameters when sending
// Update your existing send-message endpoint to also save to WhatsappChat
// ============================================

exports.saveTemplateToChat = async (outgoingMessageId) => {
  try {
    const outgoing = await WhatsappOutgoing.findById(
      outgoingMessageId
    ).populate("templateId");

    if (!outgoing || !outgoing.templateId) return;

    // Create a readable message from template
    const template = outgoing.templateId;
    let message = `📋 Template: ${template.name}`;

    // Save to WhatsappChat for unified chat history
    const chatMessage = new WhatsappChat({
      phone: outgoing.phone,
      direction: "out",
      message,
      templateId: template._id,
      timestamp: outgoing.sentAt,
    });

    await chatMessage.save();
  } catch (error) {
    console.error("Error saving template to chat:", error);
  }
};
