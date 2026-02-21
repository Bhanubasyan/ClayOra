const express = require("express");
const router = express.Router();

const { protect, seller } = require("../middleware/authMiddleware");

// 🔹 Example Seller Dashboard Controller (Temporary)
const sellerDashboard = (req, res) => {
  res.json({
    message: "Welcome Seller Dashboard",
    seller: req.user.name,
  });
};

// 🔐 Seller Dashboard Route (Protected)
router.get("/dashboard", protect, seller, sellerDashboard);

module.exports = router;