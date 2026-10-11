const mongoose = require("mongoose");

const deliveryZoneSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  center: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (value) => value.length === 2 && value[0] >= -180 && value[0] <= 180 && value[1] >= -90 && value[1] <= 90,
        message: "Center must contain valid [longitude, latitude] coordinates",
      },
    },
  },
  radiusKm: { type: Number, required: true, min: 0.1, max: 100 },
  active: { type: Boolean, default: true, index: true },
  deliveryFee: { type: Number, default: 0, min: 0 },
  minimumOrderAmount: { type: Number, default: 0, min: 0 },
  estimatedDeliveryTime: { type: String, default: "Same day", trim: true },
  codEnabled: { type: Boolean, default: false },
}, { timestamps: true });

deliveryZoneSchema.index({ center: "2dsphere" });

module.exports = mongoose.model("DeliveryZone", deliveryZoneSchema);
