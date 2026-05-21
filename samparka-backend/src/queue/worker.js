// queue/worker.js
const { Worker } = require("bullmq");
const { connection } = require("./index");
const { sendWhatsappMessage } = require("../services/sendWhatsapp");
const WhatsappAccount = require("../models/whatsappAccountModel");
const Template = require("../models/whatsappTemplate");
const WhatsappOutgoing = require("../models/WhatsappOutgoing");

const waWorker = new Worker(
  "wa-message-queue",
  async (job) => {
    const { storeId, to, templateId, bodyParams, headerParams, mediaId } =
      job.data;

    const account = await WhatsappAccount.findOne({ storeId });
    if (!account || !account.isActive)
      throw new Error("Invalid or inactive WA account");

    const template = await Template.findById(templateId);
    if (!template) throw new Error("Template not found");

    const components = [];

    // Header (image or text)
    if (template.hasImage && mediaId) {
      components.push({
        type: "header",
        parameters: [{ type: "image", image: { id: mediaId } }],
      });
    } else if (template.hasHeader && template.headerVariables?.length) {
      components.push({
        type: "header",
        parameters: template.headerVariables.map((variableName, index) => ({
          type: "text",
          parameter_name: variableName,
          text: headerParams[index] || variableName,
        })),
      });
    }

    // Body
    if (template.bodyVariables?.length) {
      components.push({
        type: "body",
        parameters: template.bodyVariables.map((variableName, index) => ({
          type: "text",
          parameter_name: variableName,
          text: bodyParams[index] || variableName,
        })),
      });
    }

    // Send message via WhatsApp API
    const response = await sendWhatsappMessage({
      storeId,
      to,
      templateName: template.name,
      language: template.language,
      components,
    });

    // Extract WhatsApp message ID
    const messageId = response?.messages?.[0]?.id;

    if (messageId) {
      await WhatsappOutgoing.create({
        phone: to,
        templateId,
        messageId,
        sentAt: new Date(),
      });
    }

    return {
      to,
      status: "sent",
      responseId: messageId || null,
    };
  },
  {
    connection,
    concurrency: 5,
    limiter: {
      max: 20,
      duration: 1000,
    },
  }
);

waWorker.on("completed", (job) => {
  console.log("Job completed:", job.id, job.returnvalue);
});

waWorker.on("failed", (job, err) => {
  console.error("Job failed:", job.id, err.message);
});

module.exports = waWorker;
