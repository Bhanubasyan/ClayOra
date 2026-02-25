const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const { protect, admin, seller } = require("../middleware/authMiddleware");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  seedProducts,
  getMyProducts,
  approveProduct,
} = require("../controllers/productController");


// =========================
// Admin Routes
// =========================

// Seed products (Admin only)
router.post("/seed", protect, admin, seedProducts);

// Approve product (Admin only)
router.put("/:id/approve", protect, admin, approveProduct);

// Update product 
router.put("/:id", protect, updateProduct);

// Delete product (Admin only)
router.delete("/:id", protect, deleteProduct);


// =========================
// Seller Routes
// =========================

// Create product (Seller only + Image upload)
router.post(
  "/",
  protect,
  seller,
  upload.single("image"),
  createProduct
);

// Get seller's own products
router.get("/my-products", protect, seller, getMyProducts);


// =========================
// Public Routes
// =========================

// Get all products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProductById);


module.exports = router;