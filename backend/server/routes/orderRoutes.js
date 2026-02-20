const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {seller } = require("../middleware/authMiddleware");
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
 getSellerOrders
} = require("../controllers/orderController");


router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/", protect, admin, getAllOrders);
router.put("/:id", protect, admin, updateOrderStatus);
router.get("/seller", protect, seller, getSellerOrders);



module.exports = router;
