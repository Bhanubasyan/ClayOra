const express = require("express");
const router = express.Router();

const { protect, seller, admin } = require("../middleware/authMiddleware");
const controller = require("../controllers/sellerController");

// 🔹 Example Seller Dashboard Controller (Temporary)
const sellerDashboard = (req, res) => {
  res.json({
    message: "Welcome Seller Dashboard",
    seller: req.user.name,
  });
};

// 🔐 Seller Dashboard Route (Protected)
router.get("/dashboard", protect, seller, sellerDashboard);
router.patch("/location", protect, seller, controller.updateStoreLocation);
router.post("/delivery-zones/:zoneId/request", protect, seller, controller.requestDeliveryZone);
router.get("/admin/zone-requests", protect, admin, controller.listZoneRequests);
router.patch("/admin/:sellerId/delivery-zones/:zoneId", protect, admin, controller.reviewDeliveryZone);

module.exports = router;
