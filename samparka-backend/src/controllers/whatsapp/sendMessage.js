const axios = require("axios");
const WhatsappAccount = require("../../models/whatsappAccountModel");
const Template = require("../../models/whatsappTemplate");
const Media = require("../../models/WhatsappMedia");
const { sendWhatsappMessage } = require("../../services/sendWhatsapp");

exports.sendTemplateMessage = async (req, res) => {
  try {
    const { storeId, to, templateId, mediaId, bodyParams } = req.body;

    const account = await WhatsappAccount.findOne({ storeId });
    if (!account)
      return res.status(404).json({ error: "WhatsApp account not found" });

    if (!account.isActive)
      return res.status(400).json({ error: "WhatsApp account is not active" });

    const template = await Template.findById(templateId);
    if (!template) return res.status(404).json({ error: "Template not found" });

    let components = [];

    // Header (optional)
    if (mediaId) {
      const media = await Media.findById(mediaId);

      components.push({
        type: "header",
        parameters: [
          {
            type: "image",
            image: { id: media.mediaId },
          },
        ],
      });
    }

    // Body parameters (optional text variables)
    if (bodyParams && bodyParams.length > 0) {
      components.push({
        type: "body",
        parameters: bodyParams.map((p) => ({ type: "text", text: p })),
      });
    }

    // Build request
    const url = `https://graph.facebook.com/v22.0/${account.phoneNumberId}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: template.name,
        language: { code: template.language },
        components,
      },
    };

    // const response = await axios.post(url, payload, {
    //   headers: {
    //     Authorization: `Bearer ${account.accessToken}`,
    //     "Content-Type": "application/json",
    //   },
    // });

    // return res.json({ success: true, response: response.data });

    const response = await sendWhatsappMessage({
      storeId,
      to,
      templateName: template.name,
      language: template.language,
      components,
    });

    return res.json({ success: true, response });
  } catch (error) {
    console.error(error.response?.data || error);
    return res.status(500).json({
      error: error.response?.data || "Failed to send message",
    });
  }
};
