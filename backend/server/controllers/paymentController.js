const crypto = require("crypto");
const Razorpay = require("razorpay");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendEmail } = require("../utils/email");

const getDeliveryAddress = (deliveryAddress, buyer) => {
  const address = {
    recipientName: String(deliveryAddress?.recipientName || buyer.name || "").trim(),
    phone: String(deliveryAddress?.phone || "").trim(),
    alternatePhone: String(deliveryAddress?.alternatePhone || "").trim(),
    addressLine1: String(deliveryAddress?.addressLine1 || "").trim(),
    addressLine2: String(deliveryAddress?.addressLine2 || "").trim(),
    landmark: String(deliveryAddress?.landmark || "").trim(),
    city: String(deliveryAddress?.city || "").trim(),
    state: String(deliveryAddress?.state || "").trim(),
    postalCode: String(deliveryAddress?.postalCode || "").trim(),
    country: String(deliveryAddress?.country || "India").trim(),
  };
  const required = ["recipientName", "phone", "addressLine1", "city", "state", "postalCode", "country"];
  if (required.some((field) => !address[field])) throw new Error("Please enter a complete delivery address.");
  return address;
};

// Payment feature: sends the same seller fulfillment prompt after a Razorpay payment is verified.
const notifySellersOfPaidOrder = async (order) => {
  const itemsBySeller = new Map();
  order.orderItems.forEach((item) => {
    const sellerId = item.seller?.toString();
    if (!sellerId) return;
    itemsBySeller.set(sellerId, [...(itemsBySeller.get(sellerId) || []), item]);
  });
  const sellers = await User.find({ _id: { $in: [...itemsBySeller.keys()] } }).select("name email");
  await Promise.allSettled(sellers.map((seller) => {
    const items = itemsBySeller.get(seller._id.toString());
    const lines = items.map((item) => `<li>${item.product?.name || "Product"} — Qty: ${item.quantity}</li>`).join("");
    return sendEmail({
      to: seller.email,
      subject: `Paid order ${order._id}: items to prepare`,
      html: `<p>Hello ${seller.name},</p><p>A customer has completed payment for an order containing your items.</p><ul>${lines}</ul><p><strong>Order ID:</strong> ${order._id}</p><p>Please prepare the items for shipment.</p>`,
    });
  }));
};

// Interview feature: creates a Razorpay order from the server-calculated cart total, never a client-supplied amount.
exports.createRazorpayOrder = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ message: "Online payments are not configured. Please choose Cash on Delivery." });
    }
    const deliveryAddress = getDeliveryAddress(req.body.deliveryAddress, req.user);
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart?.items?.length) return res.status(400).json({ message: "Cart is empty" });
    if (cart.items.some((item) => !item.product || item.quantity > item.product.stock)) {
      return res.status(400).json({ message: "One or more products are unavailable. Please refresh your cart." });
    }
    const totalAmount = cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const razorpayOrder = await razorpay.orders.create({ amount: Math.round(totalAmount * 100), currency: "INR", receipt: `clayora_${Date.now()}` });
    const order = await Order.create({
      user: req.user._id,
      orderItems: cart.items.map((item) => ({ product: item.product._id, seller: item.product.seller, quantity: item.quantity, price: item.product.price })),
      totalAmount,
      deliveryAddress,
      paymentMethod: "Razorpay",
      paymentStatus: "Pending",
      razorpayOrderId: razorpayOrder.id,
      statusHistory: [{ status: "Pending", note: "Awaiting secure Razorpay payment" }],
    });
    res.status(201).json({ key: process.env.RAZORPAY_KEY_ID, razorpayOrder, localOrderId: order._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Interview feature: verifies Razorpay's HMAC signature before marking an order paid and reducing stock.
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    // Interview feature: check lengths first because timingSafeEqual throws when invalid input lengths differ.
    const signaturesMatch = razorpay_signature && razorpay_signature.length === expectedSignature.length
      && crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature));
    if (!signaturesMatch) {
      return res.status(400).json({ message: "Payment verification failed" });
    }
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Payment order not found" });
    if (order.paymentStatus === "Paid") return res.json({ message: "Payment already verified", orderId: order._id });
    for (const item of order.orderItems) {
      const product = await Product.findOneAndUpdate({ _id: item.product, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } });
      if (!product) return res.status(409).json({ message: "A product just went out of stock. Please contact support for your payment." });
    }
    order.paymentStatus = "Paid";
    order.razorpayPaymentId = razorpay_payment_id;
    order.statusHistory.push({ status: "Pending", note: "Razorpay payment verified" });
    await order.save();
    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });
    // Payment feature: email failures are logged but never undo a verified customer payment.
    await order.populate("orderItems.product", "name");
    notifySellersOfPaidOrder(order).catch((error) => console.error("Seller paid-order notification failed:", error.message));
    res.json({ message: "Payment verified", orderId: order._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
