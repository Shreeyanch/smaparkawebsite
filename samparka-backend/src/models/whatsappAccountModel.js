// models/WhatsappAccount.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const WhatsappAccountSchema = new Schema({
  storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
  phoneNumberId: { type: String, required: true },
  // phoneNumber: { type: String, required: true },
  accessToken: { type: String, required: true },
  tokenExpiresAt: Date,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WhatsappAccount", WhatsappAccountSchema);
