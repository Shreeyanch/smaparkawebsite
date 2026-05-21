// models/WhatsappOutgoing.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const OutgoingSchema = new Schema({
  phone: String,
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Template",
    required: true,
  },
  messageId: String, // WhatsApp message ID (wamid..)
  sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WhatsappOutgoing", OutgoingSchema);
