const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
    },
  ],
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discountRate: {
    type: Number,
    default: 0,
  },
  calculatedPrice: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    default: null, // Stock is null by default
    // validate: {
    //   validator: function (value) {
    //     return this.trackStock ? value >= 0 : value === null;
    //   },
    //   message: "Stock must be null when trackStock is false, otherwise 0 or greater.",
    // },
  },
  trackStock: {
    type: Boolean,
    default: false, // Default trackStock to false
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  specificity: {
    type: Map,
    of: Map,
    required: false,
  },
});

// Middleware: Adjust stock based on trackStock before saving
productSchema.pre("save", function (next) {
  if (!this.trackStock) {
    this.stock = null; // If trackStock is false, stock should be null
  } else if (this.stock === null || this.stock < 0) {
    this.stock = 0; // If trackStock is true and stock is invalid, set it to 0
  }
  next();
});

// Middleware: Adjust stock on updates
productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update.trackStock !== undefined) {
    if (!update.trackStock) {
      update.stock = null; // Set stock to null when trackStock is false
    } else if (update.stock === null || update.stock < 0) {
      update.stock = 0; // Ensure stock is at least 0 when trackStock is true
    }
  }

  this.setUpdate(update);
  next();
});

module.exports = mongoose.model("Product", productSchema);
