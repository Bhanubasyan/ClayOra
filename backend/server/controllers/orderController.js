const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendEmail } = require("../utils/email");

const escapeHtml = (value) => String(value || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const notifySellersOfOrder = async (order, buyer) => {
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
    const address = [
      buyer.addressLine1 || buyer.address,
      buyer.addressLine2,
      buyer.landmark && `Landmark: ${buyer.landmark}`,
      [buyer.city, buyer.state, buyer.postalCode].filter(Boolean).join(", "),
      buyer.country,
    ].filter(Boolean).map(escapeHtml).join("<br>");
    const alternatePhone = buyer.alternatePhone
      ? `<br>Alternate phone: ${escapeHtml(buyer.alternatePhone)}`
      : "";

    return sendEmail({
      to: seller.email,
      subject: `New order ${order._id}: items to prepare`,
      html: `<p>Hello ${escapeHtml(seller.name)},</p><p>${escapeHtml(buyer.name)} has placed an order containing these items from your store:</p><ul>${lines}</ul><h3>Buyer delivery details</h3><p><strong>Phone:</strong> ${escapeHtml(buyer.phone) || "Not provided"}${alternatePhone}</p><p><strong>Delivery address:</strong><br>${address || "Not provided"}</p><p>Please prepare and pack them for shipment.</p><p><strong>Order ID:</strong> ${order._id}</p>`,
    });
  }));
};

// @desc Create Order from Cart
// @route POST /api/orders
// @access Private
exports.createOrder = async (req, res) => {
  try {
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
        // Store only the seller ObjectId, even if this product was populated
        // with the full seller user document elsewhere in the application.
        seller: item.product.seller?._id || item.product.seller,
      });
    }

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      totalAmount,
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
    notifySellersOfOrder(order, req.user).catch((error) =>
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
