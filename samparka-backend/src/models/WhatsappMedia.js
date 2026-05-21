// models/WhatsappMedia.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const WhatsappMediaSchema = new Schema({
  storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
  mediaId: { type: String, required: true },
  fileName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WhatsappMedia", WhatsappMediaSchema);
