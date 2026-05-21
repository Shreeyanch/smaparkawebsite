const mongoose = require("mongoose");

const printPointsSchema = new mongoose.Schema(
  {
    points: {
      type: Number,
      required: true,
      default: 1,
    },
    billID: {
      type: String,
    },
    outlet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outlet",
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PrintPoints", printPointsSchema);
