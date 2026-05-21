// models/Template.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const TemplateSchema = new Schema({
  storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },

  name: { type: String, required: true }, // template name from WhatsApp
  language: { type: String, default: "en" },
  approved: { type: Boolean, default: true },

  // Header / Media
  hasHeader: { type: Boolean, default: false },
  hasImage: { type: Boolean, default: false },
  header: { type: String },
  headerVariables: { type: Array, default: [] },

  // Body
  body: { type: String },
  bodyVariables: { type: Array, default: [] },

  // Footer
  footer: { type: String },

  // Buttons (Call or Visit Website)
  buttons: { type: Array, default: [] },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Template", TemplateSchema);
