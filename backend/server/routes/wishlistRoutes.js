const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getWishlist, addToWishlist, removeFromWishlist } = require("../controllers/wishlistController");

// Wishlist feature: every wishlist route requires the existing JWT authentication middleware.
router.get("/", protect, getWishlist);
router.post("/", protect, addToWishlist);
router.delete("/:productId", protect, removeFromWishlist);

module.exports = router;
