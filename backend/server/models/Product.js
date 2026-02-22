const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ["Pottery", "Wood"],
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    image: {
      type: String,
      required: true,
    },
    seller: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",

},
isApproved: {
  type: Boolean,
  default: false
}


  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
