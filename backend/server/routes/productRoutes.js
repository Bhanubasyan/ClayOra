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
  approveProduct 
} = require("../controllers/productController");

// Seed (Admin only)
router.post("/seed", protect, admin, seedProducts);

// Seller routes
router.post("/", protect, seller, createProduct);
router.get("/my-products", protect, seller, getMyProducts);

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin management
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

//approve product (Admin only)
router.put("/:id/approve", protect, admin, approveProduct);

//upload img by seller 
router.post(
  "/",
  protect,
  upload.single("image"),   
  createProduct
);

module.exports = router;
