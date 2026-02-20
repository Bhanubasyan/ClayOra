const Cart = require("../models/Cart");
const Product = require("../models/Product");

// @desc Add to cart
// @route POST /api/cart
// @access Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
    }

    res.status(200).json(cart);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Get cart
// @route GET /api/cart
// @access Private
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    res.status(200).json(cart);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// @desc Update cart item quantity
// @route PUT /api/cart/:productId
// @access Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;

    await cart.save();

    res.status(200).json(cart);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// @desc Remove item from cart
// @route DELETE /api/cart/:productId
// @access Private
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    res.status(200).json(cart);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
