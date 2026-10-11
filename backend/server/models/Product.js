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
    category: { type: String, required: true, trim: true },
    tags: [
  {
    type: String,
    trim: true,
  },
],

    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    festivalTags: [{ type: String, lowercase: true, trim: true }],
    festivalCategory: { type: String, default: "", trim: true },
    vratFriendly: { type: Boolean, default: false },
    ingredients: [{ type: String, trim: true }],
    brand: { type: String, default: "", trim: true },
    quantity: { type: Number, min: 0 },
    unit: { type: String, default: "", trim: true },
    variants: [{
      name: { type: String, required: true, trim: true },
      price: { type: Number, required: true, min: 0 },
      stock: { type: Number, required: true, min: 0 },
      sku: { type: String, default: "", trim: true },
    }],
    availability: { type: String, enum: ["available", "unavailable"], default: "available" },
    applicableDeliveryZones: [{ type: mongoose.Schema.Types.ObjectId, ref: "DeliveryZone" }],
    discountPrice: { type: Number, min: 0 },
    expiryDate: Date,
    isFestivalCombo: { type: Boolean, default: false },
    image: {
      type: String,
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    // Interview feature: stores one verified buyer review per user for trustworthy product ratings.
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true, trim: true, maxlength: 600 },
      },
    ],
    // Interview feature: cached values make product listings fast without calculating reviews repeatedly.
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ festivalTags: 1, festivalCategory: 1, applicableDeliveryZones: 1, isApproved: 1 });

module.exports = mongoose.model("Product", productSchema);
