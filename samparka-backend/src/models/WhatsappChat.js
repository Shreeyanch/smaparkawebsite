// models/WhatsappChat.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const WhatsappChatSchema = new Schema({
  phone: String,
  direction: String, // "in" or "out"
  message: String,
  templateId: String, // optional, to link to a template
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WhatsappChat", WhatsappChatSchema);
