const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      required: true,
    },
    receivers: [
      {
        customer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Customer",
        },
        read: {
          type: Boolean,
          default: false,
        },
        readAt: {
          type: Date,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
