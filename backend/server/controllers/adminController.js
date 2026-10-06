const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// Interview feature: compact marketplace health metrics for quick admin decisions.
exports.getAdminInsights = async (req, res) => {
  try {
    const [totalUsers, sellers, products, pendingProducts, orders] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "seller" }),
      Product.countDocuments(),
      Product.countDocuments({ isApproved: false }),
      Order.find({ status: { $ne: "Cancelled" } }).select("totalAmount status"),
    ]);
    res.json({
      totalUsers,
      sellers,
      products,
      pendingProducts,
      totalOrders: orders.length,
      revenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
