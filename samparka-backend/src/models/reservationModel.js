const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    // name: { type: String, required: true },
    // phone: { type: String, required: true },
    services: [{ type: String }],
    tableNumber: { type: String },
    numberofGuests: { type: String },
    outlet: { type: String },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    note: { type: String },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "noShow", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Reservation", reservationSchema);
