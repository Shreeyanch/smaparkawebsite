const express = require("express");
const router = express.Router();
const WhatsappChat = require("../models/WhatsappChat");

// STEP 1: Verify token
router.get("/whatsapp", (req, res) => {
  const VERIFY_TOKEN =
    process.env.WHATSAPP_VERIFY_TOKEN || "samparka_whatsapp_12345";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// STEP 2: Handle inbound messages
// router.post("/whatsapp", async (req, res) => {
//   try {
//     const data = req.body;

//     const message = data.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
//     if (!message) return res.sendStatus(200);

//     const phone = message.from;
//     const type = message.type;
//     const text = message.text?.body || null;

//     console.log("Inbound message received");
//     console.log("From:", phone);
//     console.log("Type:", type);
//     console.log("Text:", text);

//     // Save to MongoDB
//     await WhatsappChat.create({
//       phone,
//       direction: "in",
//       message: text || `[${type}] message received`,
//       timestamp: new Date(),
//     });

//     res.sendStatus(200);
//   } catch (err) {
//     console.error("Webhook Error:", err);
//     res.sendStatus(500);
//   }
// });

router.post("/whatsapp", async (req, res) => {
  const msg = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg) return res.sendStatus(200);

  const phone = msg.from;
  const text = msg.text?.body;

  // context: reply-to metadata
  const replyToId = msg.context?.id || msg.context?.message_id;

  let templateId = null;

  if (replyToId) {
    const linked = await WhatsappOutgoing.findOne({ messageId: replyToId });
    if (linked) {
      templateId = linked.templateId;
    }
  }

  await WhatsappChat.create({
    phone,
    direction: "in",
    message: text,
    templateId: templateId || null, // store which template they replied to
    timestamp: new Date(),
  });

  res.sendStatus(200);
});

module.exports = router;
