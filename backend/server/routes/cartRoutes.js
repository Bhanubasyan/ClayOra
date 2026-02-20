const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");


const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart
} = require("../controllers/cartController");

router.post("/", protect, addToCart);
router.get("/", protect, getCart);
router.put("/:productId", protect, updateCartItem);
router.delete("/:productId", protect, removeFromCart);

module.exports = router;
