const User = require("../models/User");
const Product = require("../models/Product");

// Wishlist feature: returns only the signed-in user's saved products.
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json((user?.wishlist || []).filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: "Unable to load wishlist" });
  }
};

// Wishlist feature: adds an approved product once, avoiding duplicate favourites.
exports.addToWishlist = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.body.productId, isApproved: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    const user = await User.findById(req.user._id);
    if (!user.wishlist.some((productId) => productId.equals(product._id))) {
      user.wishlist.push(product._id);
      await user.save();
    }
    await user.populate("wishlist");
    res.status(201).json(user.wishlist.filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Wishlist feature: removes a saved product only from the signed-in user's account.
exports.removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter((productId) => productId.toString() !== req.params.productId);
    await user.save();
    await user.populate("wishlist");
    res.json(user.wishlist.filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: "Unable to update wishlist" });
  }
};
