const mongoose = require("mongoose");

const availabilityRequestSchema = new mongoose.Schema({
  email: { type: String, trim: true, lowercase: true, required: true },
  address: { type: String, trim: true, default: "" },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
}, { timestamps: true });

availabilityRequestSchema.index({ location: "2dsphere" });
availabilityRequestSchema.index({ email: 1, "location.coordinates": 1 }, { unique: true });

module.exports = mongoose.model("AvailabilityRequest", availabilityRequestSchema);
