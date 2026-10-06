const Product = require("../models/Product");
const Order = require("../models/Order");

// @desc    Create Product
// @route   POST /api/products
// @access  Admin/Seller
exports.createProduct = async (req, res) => {
  try {
    if (!["admin", "seller"].includes(req.user.role)) {
      return res.status(403).json({ message: "Admin or seller access only" });
    }

  const {
  name,
  description,
  price,
  category,
  stock,
  image,
  tags,
} = req.body;

    const productImage = req.file?.path || image;

    if (!name || !description || !price || !category || !stock || !productImage) {
      return res.status(400).json({ message: "All fields including image are required" });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      tags: tags ? JSON.parse(tags) : [],
      stock: Number(stock),
      image: productImage,
      seller: req.user._id,
      isApproved: false,
    });

    res.status(201).json(product);

  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get All Products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const {
      keyword,
      category,
      tag,
      minPrice,
      maxPrice,
      minRating,
      availability,
      sort = "newest",
      page = 1,
      limit = 10,
    } = req.query;

    const query = { isApproved: true };

    // 🔎 Search by name
    if (keyword) {
      query.name = {
        $regex: keyword,
        $options: "i",
      };
    }

    // 🏷 Category filter
    if (category) {
      query.category = category;
    }
    
 // Filter by tag
if (tag) {
  query.tags = tag;
}

    // 💰 Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Interview feature: supports rating and stock filters from the customer catalogue.
    if (minRating) query.rating = { $gte: Number(minRating) };
    if (availability === "in-stock") query.stock = { $gt: 0 };

    // Interview feature: allowlisted sorting prevents arbitrary client-provided database sorting.
    const sortOptions = {
      newest: { createdAt: -1 },
      price_low: { price: 1 },
      price_high: { price: -1 },
      rating: { rating: -1, numReviews: -1 },
    };

    
 console.log(query);


 const products = await Product.find(query)
   .sort(sortOptions[sort] || sortOptions.newest)
   .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

   const total = await Product.countDocuments(query);

    res.status(200).json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Interview feature: accepts reviews only from customers who bought and received the product.
exports.createProductReview = async (req, res) => {
  try {
    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || "").trim();
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) {
      return res.status(400).json({ message: "Please provide a rating from 1 to 5 and a review." });
    }

    const deliveredOrder = await Order.exists({
      user: req.user._id,
      status: "Delivered",
      "orderItems.product": product._id,
    });
    if (!deliveredOrder) {
      return res.status(403).json({ message: "Only customers with a delivered purchase can review this product." });
    }

    const existingReview = product.reviews.find((item) => item.user.equals(req.user._id));
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.name = req.user.name;
    } else {
      product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
    }
    product.numReviews = product.reviews.length;
    product.rating = product.numReviews
      ? Number((product.reviews.reduce((sum, item) => sum + item.rating, 0) / product.numReviews).toFixed(1))
      : 0;
    await product.save();
    res.status(201).json({ message: "Review saved", rating: product.rating, numReviews: product.numReviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🚀 Seed 100 Products (TEMPORARY)
exports.seedProducts = async (req, res) => {
  try {
    const products = [];

    for (let i = 1; i <= 100; i++) {
      products.push({
        name: `Handmade Product ${i}`,
        description: `Beautiful handcrafted item number ${i}`,
        price: Math.floor(Math.random() * 2000) + 200,
        category: i % 2 === 0 ? "Pottery" : "Wood",
        stock: Math.floor(Math.random() * 50) + 1,
        image: "https://www.google.com/imgres?q=pottery%20image&imgurl=https%3A%2F%2Fimg.freepik.com%2Ffree-photo%2Fhands-working-pottery-wheel_181624-57055.jpg%3Fsemt%3Dais_user_personalization%26w%3D740%26q%3D80&imgrefurl=https%3A%2F%2Fwww.freepik.com%2Ffree-photos-vectors%2Fpottery&docid=o0qDqNTZNkXDfM&tbnid=UKhlYw7EqDOSPM&vet=12ahUKEwjmiIrvp-ySAxWnR2wGHVxlADQQnPAOegQIFhAB..i&w=740&h=493&hcb=2&ved=2ahUKEwjmiIrvp-ySAxWnR2wGHVxlADQQnPAOegQIFhAB",
        seller: req.user._id,
        isApproved: false,
      });
    }

    await Product.insertMany(products);

    res.status(201).json({
      message: "100 products created successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Single Product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// @desc    Update Product
// @route   PUT /api/products/:id
// @access  Admin
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Ownership and admin check
    if (
      product.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update fields
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.category = req.body.category || product.category;
    product.stock = req.body.stock || product.stock;
    product.image = req.body.image || product.image;

    const updatedProduct = await product.save();

    res.json(updatedProduct);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Delete Product
// @route   DELETE /api/products/:id
// @access  Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (
      product.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await product.deleteOne();

    res.status(200).json({ message: "Product removed" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get seller's own products
// @route   GET /api/products/my-products
// @access  Seller
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.approveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isApproved = true;
    await product.save();

    res.status(200).json({ message: "Product approved successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unapproveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isApproved = false;
    await product.save();

    res.status(200).json({ message: "Product moved to pending approval" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products for admin, including pending approval
// @route   GET /api/products/admin/all
// @access  Admin/Seller
exports.getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("seller", "name email role");

    res.status(200).json({
      total: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
