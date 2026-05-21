const mongoose = require("mongoose");
const { type } = require("os");

const outletSchema = new mongoose.Schema(
  {
    location: { type: String, required: true },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    phone:{
      type: String,
    },
    mapLink:{
      type: String
    },
    lat: {
      type: Number
    },
    lng: {
      type: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Outlet", outletSchema);
