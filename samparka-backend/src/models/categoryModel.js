// import mongoose from "mongoose";
const mongoose = require("mongoose");


const categorySchema = new mongoose.Schema({
  name: {
    type: [String], // Changed to an array of strings
    required: true,
    default: [], // Default to an empty array
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
});

// export default mongoose.model("Category", categorySchema);
module.exports = mongoose.model("Category", categorySchema);
