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
  unapproveProduct,
  getAdminProducts,
  createProductReview,
} = require("../controllers/productController");


// =========================
// Admin Routes
// =========================

// Seed products (Admin only)
router.post("/seed", protect, admin, seedProducts);

// Get all products, including pending approval (Admin only)
router.get("/admin/all", protect, admin, getAdminProducts);

// Approve product (Admin only)
router.put("/:id/approve", protect, admin, approveProduct);

// Move approved product back to pending (Admin only)
router.put("/:id/unapprove", protect, admin, unapproveProduct);

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
  upload.single("image"),
  createProduct
);

// Get seller's own products
router.get("/my-products", protect, seller, getMyProducts);

// Interview feature: the protected review endpoint enforces verified-buyer reviews in its controller.
router.post("/:id/reviews", protect, createProductReview);


// =========================
// Public Routes
// =========================

// Get all products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProductById);


module.exports = router;
