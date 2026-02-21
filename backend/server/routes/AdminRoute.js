const express = require("express");
const router = express.Router();

const { protect, admin } = require("../middleware/authMiddleware");

// 🔹 Example Admin Controller (Temporary)
const adminDashboard = (req, res) => {
  res.json({
    message: "Welcome Admin Dashboard",
    admin: req.user.name,
  });
};

// 🔐 Admin Dashboard Route (Protected)
router.get("/dashboard", protect, admin, adminDashboard);

module.exports = router;