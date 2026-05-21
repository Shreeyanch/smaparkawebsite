// import mongoose from "mongoose";
const mongoose = require("mongoose");

const pointsSchema = new mongoose.Schema(
  {
    points: {
      type: Number,
      required: true,
      default: 1,
    },
    billID: {
      type: String,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

// export default mongoose.model("Points", pointsSchema);
module.exports = mongoose.model("Points", pointsSchema);
