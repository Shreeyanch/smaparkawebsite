const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  contestantName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  votersPhoneNumber: [
    {
      type: Number,
    },
  ],
  vote: {
    type: Number,
  },
});

module.exports = mongoose.model("Vote", voteSchema);
