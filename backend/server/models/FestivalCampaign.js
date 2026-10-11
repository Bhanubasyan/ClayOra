const mongoose = require("mongoose");

const festivalCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  group: { type: String, enum: ["vrat", "puja", "combo", "other"], default: "other" },
}, { _id: false });

const festivalCampaignSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: "", trim: true },
  heroTitle: { type: String, default: "", trim: true },
  heroBanner: { type: String, default: "", trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  timezone: { type: String, default: "Asia/Kolkata", trim: true },
  active: { type: Boolean, default: false, index: true },
  locationBased: { type: Boolean, default: false },
  targetZones: [{ type: mongoose.Schema.Types.ObjectId, ref: "DeliveryZone" }],
  categories: [festivalCategorySchema],
  featuredSellers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  featuredProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  offerText: { type: String, default: "", trim: true },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
}, { timestamps: true });

festivalCampaignSchema.path("endDate").validate(function (value) {
  return !this.startDate || value >= this.startDate;
}, "Campaign end date must be after its start date");

module.exports = mongoose.model("FestivalCampaign", festivalCampaignSchema);
