const mongoose = require("mongoose");
const { type } = require("os");

const reservationSettingSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
    unique: true,
  },
  images: [
    {
      type: String, // Array of image URLs (strings)
    },
  ],
  services: [
    {
      name: String,
      description: String,
      price: String,
      images: [
        {
          type: String,
        },
      ],
      autoConfirmation: {
        type: Boolean,
        default: false,
      },
      needTimeSlots: {
        type: Boolean,
        default: false,
      },
        outlet: String,
     
      timeSlots: [
        {
          outlet: String,
          time: String,
          numberOfSlots: Number,
        },
      ],
    },
  ],
  autoConfirmation: {
    type: Boolean,
    default: false,
  },
  needTimeSlots: {
    type: Boolean,
    default: false,
  },
  timeSlots: [
    {
      outlet: String,
      time: String,
      numberOfSlots: Number,
    },
  ],
  // timeSlots: [
  //   {
  //     type: String,
  //   },
  // ],
});

module.exports = mongoose.model("ReservationSetting", reservationSettingSchema);
