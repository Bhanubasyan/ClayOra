const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendEmail } = require("../utils/email");
const mongoose = require("mongoose");

const escapeHtml = (value) => String(value || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

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
  if (required.some((field) => !address[field])) {
    throw new Error("Please enter a complete delivery address and mobile number.");
  }
  return address;
};

const extractSellerObjectId = (seller) => {
  // Product.seller can be an ObjectId or a populated User document.
  // Convert either form to a fresh ObjectId before Order validation.
  const rawSellerId = seller && typeof seller === "object" && seller._id
    ? seller._id
    : seller;
  const sellerId = rawSellerId?.toString();

  if (!mongoose.isObjectIdOrHexString(sellerId)) {
    throw new Error("This product has an invalid seller ID. Please contact support.");
  }

  return new mongoose.Types.ObjectId(sellerId);
};

const notifySellersOfOrder = async (order) => {
  const itemsBySeller = new Map();
  order.orderItems.forEach((item) => {
    const sellerId = item.seller?.toString();
    if (!sellerId) return;
    const sellerItems = itemsBySeller.get(sellerId) || [];
    sellerItems.push(item);
    itemsBySeller.set(sellerId, sellerItems);
  });

  const sellers = await User.find({ _id: { $in: [...itemsBySeller.keys()] } }).select("name email");
  await Promise.allSettled(sellers.map((seller) => {
    const items = itemsBySeller.get(seller._id.toString());
    const lines = items.map((item) => `<li>${item.product.name} — Qty: ${item.quantity}</li>`).join("");
    const address = order.deliveryAddress;
    const formattedAddress = [
      address.addressLine1,
      address.addressLine2,
      address.landmark && `Landmark: ${address.landmark}`,
      [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
      address.country,
    ].filter(Boolean).map(escapeHtml).join("<br>");
    const alternatePhone = address.alternatePhone
      ? `<br><strong>Alternate phone:</strong> ${escapeHtml(address.alternatePhone)}`
      : "";

    return sendEmail({
      to: seller.email,
      subject: `New order ${order._id}: items to prepare`,
      html: `<p>Hello ${escapeHtml(seller.name)},</p><p>${escapeHtml(address.recipientName)} has placed an order containing these items from your store:</p><ul>${lines}</ul><h3>Delivery details</h3><p><strong>Phone:</strong> ${escapeHtml(address.phone)}${alternatePhone}</p><p><strong>Address:</strong><br>${formattedAddress}</p><p>Please prepare and pack them for shipment.</p><p><strong>Order ID:</strong> ${order._id}</p>`,
    });
  }));
};

// @desc Create Order from Cart
// @route POST /api/orders
// @access Private
exports.createOrder = async (req, res) => {
  try {
    const deliveryAddress = getDeliveryAddress(req.body.deliveryAddress, req.user);
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (let item of cart.items) {

      // Stock validation
      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          message: `Only ${item.product.stock} items available for "${item.product.name}".`
        });
      }

      totalAmount += item.quantity * item.product.price;

      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
        seller: extractSellerObjectId(item.product.seller),
      });
    }

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      totalAmount,
      deliveryAddress,
      // Interview feature: COD remains the safe existing default while payment metadata is now persisted.
      paymentMethod: req.body.paymentMethod === "Razorpay" ? "Razorpay" : "COD",
      paymentStatus: req.body.paymentMethod === "Razorpay" ? "Pending" : "Pending",
      statusHistory: [{ status: "Pending", note: "Order placed" }],
    });

    // Reduce stock after order success
// Reduce stock after order success
for (let item of cart.items) {
  await Product.findByIdAndUpdate(
    item.product._id,
    { $inc: { stock: -item.quantity } },
    { new: true }
  );
}

    // Clear cart
    cart.items = [];
    await cart.save();

    // A mail delivery problem should never undo a successfully placed order.
    await order.populate("orderItems.product");
    notifySellersOfOrder(order).catch((error) =>
      console.error("Seller order notification failed:", error.message)
    );

    res.status(201).json(order);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Get My Orders
// @route GET /api/orders/my
// @access Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("orderItems.product");
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// @desc Get All Orders
// @route GET /api/orders
// @access Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product");

    res.status(200).json(orders);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// @desc Update Order Status
// @route PUT /api/orders/:id
// @access Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status || order.status;
    // Interview feature: retain each admin status change for customer tracking.
    order.statusHistory.push({ status: order.status, note: req.body.note || "Status updated by admin" });

    await order.save();

    res.status(200).json(order);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update status for an order that contains this seller's items
// @route   PUT /api/orders/seller/:id/status
// @access  Seller
exports.updateSellerOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Processing", "Shipped", "Delivered"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid seller order status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const hasSellerItem = order.orderItems.some((item) =>
      item.seller?.equals(req.user._id)
    );

    if (!hasSellerItem) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Cancelled order cannot be updated" });
    }

    order.status = status;
    // Interview feature: seller updates become visible in the customer order timeline.
    order.statusHistory.push({ status, note: req.body.note || "Updated by seller" });
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get seller orders
// @route   GET /api/orders/seller
// @access  Seller
exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      "orderItems.seller": req.user._id
    })
      .populate("user", "name email")
      .populate("orderItems.product");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Cancel Order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Buyer)

// @desc    Cancel Order
// @route   PUT /api/orders/cancel/:id
// @access  Private (Buyer)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ownership check
    if (!order.user.equals(req.user._id)){
      return res.status(403).json({ message: "Not authorized" });
    }

    // Cannot cancel delivered order
    if (order.status === "Delivered") {
      return res.status(400).json({
        message: "Delivered order cannot be cancelled",
      });
    }

    // Already cancelled
    if (order.status === "Cancelled") {
      return res.status(400).json({
        message: "Order already cancelled",
      });
    }

    order.status = "Cancelled";
    // Interview feature: a cancellation is also represented in the immutable status history.
    order.statusHistory.push({ status: "Cancelled", note: "Cancelled by customer" });
    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Interview feature: lets a buyer track only their own order, including history and payment status.
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate("orderItems.product", "name image");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Unable to track this order" });
  }
};

// Interview feature: calculates only this seller's item revenue, units, orders, best sellers, and stock alerts.
exports.getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const orders = await Order.find({ "orderItems.seller": sellerId, status: { $ne: "Cancelled" } });
    const sellerItems = orders.flatMap((order) => order.orderItems
      .filter((item) => item.seller?.equals(sellerId))
      .map((item) => ({ ...item.toObject(), status: order.status })));
    const revenue = sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const productTotals = new Map();
    sellerItems.forEach((item) => {
      const key = item.product.toString();
      const current = productTotals.get(key) || { product: key, unitsSold: 0, revenue: 0 };
      current.unitsSold += item.quantity;
      current.revenue += item.price * item.quantity;
      productTotals.set(key, current);
    });
    const lowStockProducts = await Product.find({ seller: sellerId, stock: { $lte: 5 } })
      .select("name stock image").sort({ stock: 1 }).limit(5);
    res.json({
      revenue,
      activeOrders: orders.filter((order) => !["Delivered", "Cancelled"].includes(order.status)).length,
      deliveredOrders: orders.filter((order) => order.status === "Delivered").length,
      unitsSold: sellerItems.reduce((sum, item) => sum + item.quantity, 0),
      topProducts: [...productTotals.values()].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5),
      lowStockProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
