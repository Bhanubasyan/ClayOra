const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { createRazorpayOrder, verifyRazorpayPayment } = require("../controllers/paymentController");

// Interview feature: payment routes stay protected so no one can pay for or verify another user's cart.
router.post("/razorpay-order", protect, createRazorpayOrder);
router.post("/verify", protect, verifyRazorpayPayment);

module.exports = router;
