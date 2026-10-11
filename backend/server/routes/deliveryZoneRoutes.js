const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const controller = require("../controllers/deliveryZoneController");

router.get("/admin/all", protect, admin, controller.listAllDeliveryZones);
router.get("/", controller.listDeliveryZones);
router.post("/check", controller.checkDeliveryZone);
router.post("/notify", controller.requestAvailabilityNotice);
router.post("/", protect, admin, controller.createDeliveryZone);
router.patch("/:id", protect, admin, controller.updateDeliveryZone);

module.exports = router;
