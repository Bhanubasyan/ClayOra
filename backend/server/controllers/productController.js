const Product = require("../models/Product");

// @desc    Create Product
// @route   POST /api/products
// @access  Admin
exports.createProduct = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { name, description, price, category, stock } = req.body;

    // Required validation
    if (!name || !price || !category || !stock || !req.file) {
      return res.status(400).json({ message: "All fields including image are required" });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      image: req.file.path,   // image required now
      seller: req.user._id,
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
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

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

    // 💰 Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

 const products = await Product.find(query)
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
        seller: req.user._id,   // 🔥 VERY IMPORTANT
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

    // 🔥 Ownership + Admin Check
    if (
      product.seller.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🔥 Update Fields
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
