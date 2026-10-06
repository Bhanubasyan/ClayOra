const express = require("express");
const router = express.Router();

const { protect, admin } = require("../middleware/authMiddleware");
const { getAdminInsights } = require("../controllers/adminController");

// 🔹 Example Admin Controller (Temporary)
const adminDashboard = (req, res) => {
  res.json({
    message: "Welcome Admin Dashboard",
    admin: req.user.name,
  });
};

// 🔐 Admin Dashboard Route (Protected)
router.get("/dashboard", protect, admin, adminDashboard);
// Interview feature: business overview metrics used by the admin dashboard.
router.get("/insights", protect, admin, getAdminInsights);

module.exports = router;
