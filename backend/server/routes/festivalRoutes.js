const express = require("express");
const router = express.Router();
const { protect, admin, seller } = require("../middleware/authMiddleware");
const controller = require("../controllers/festivalController");
const upload = require("../middleware/upload");

router.get("/active", controller.getActiveCampaigns);
router.get("/seller/catalog", protect, seller, controller.getSellerCampaigns);
router.get("/admin/all", protect, admin, controller.listCampaigns);
router.get("/admin/participation", protect, admin, controller.listParticipationRequests);
router.post("/admin", protect, admin, controller.createCampaign);
router.post("/admin/banner", protect, admin, upload.single("image"), controller.uploadCampaignBanner);
router.patch("/admin/:id", protect, admin, controller.updateCampaign);
router.get("/admin/:id/analytics", protect, admin, controller.getCampaignAnalytics);
router.patch("/admin/:campaignId/sellers/:sellerId", protect, admin, controller.reviewParticipation);
router.post("/:id/participate", protect, seller, controller.requestParticipation);
router.get("/:slug", controller.getCampaignBySlug);

module.exports = router;
