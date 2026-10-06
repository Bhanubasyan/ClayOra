const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const { seller } = require("../middleware/authMiddleware");
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getSellerOrders,
  updateSellerOrderStatus,
  cancelOrder
  ,trackOrder
  ,getSellerAnalytics
} = require("../controllers/orderController");


router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/", protect, admin, getAllOrders);
router.put("/:id", protect, admin, updateOrderStatus);
router.get("/seller", protect, seller, getSellerOrders);
// Interview feature: seller-only business metrics for the dashboard.
router.get("/seller/analytics", protect, seller, getSellerAnalytics);
router.put("/seller/:id/status", protect, seller, updateSellerOrderStatus);

router.put("/cancel/:id", protect, cancelOrder);
// Interview feature: customer-owned order tracking with no public order-data exposure.
router.get("/track/:id", protect, trackOrder);

module.exports = router;
