const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
         seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      recipientName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      alternatePhone: { type: String, trim: true, default: "" },
      addressLine1: { type: String, required: true, trim: true },
      addressLine2: { type: String, trim: true, default: "" },
      landmark: { type: String, trim: true, default: "" },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered","Cancelled"],
      default: "Pending",
    },
    // Interview feature: records the customer-selected payment method and its verified outcome.
    paymentMethod: { type: String, enum: ["COD", "Razorpay"], default: "COD" },
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    // Interview feature: preserves a readable audit trail for the customer order timeline.
    statusHistory: [
      {
        status: { type: String, required: true },
        note: { type: String, trim: true, default: "" },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
