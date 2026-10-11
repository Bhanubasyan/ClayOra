const Cart = require("../models/Cart");
const Product = require("../models/Product");

// @desc Add to cart
// @route POST /api/cart
// @access Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, variantId } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isApproved || product.availability !== "available") {
      return res.status(404).json({ message: "Product not found" });
    }
    const requestedQuantity = Number(quantity);
    const variant = variantId ? product.variants.id(variantId) : null;
    if (variantId && !variant) return res.status(400).json({ message: "Selected variant is unavailable" });
    const availableStock = variant ? variant.stock : product.stock;
    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1 || requestedQuantity > availableStock) {
      return res.status(400).json({ message: "Please choose a valid in-stock quantity" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ product: productId, quantity: requestedQuantity, variantId: variant?._id, variantName: variant?.name || "" }],
      });
    } else {
      await cart.populate("items.product");
      const otherSeller = cart.items.find((item) => item.product && String(item.product.seller) !== String(product.seller));
      if (otherSeller) {
        return res.status(400).json({ message: "Local delivery currently supports one seller per order. Please checkout or clear your current seller's items first." });
      }
      const itemIndex = cart.items.findIndex(
        (item) => String(item.product?._id || item.product) === String(productId)
      );

      if (itemIndex > -1) {
        const sameVariant = String(cart.items[itemIndex].variantId || "") === String(variant?._id || "");
        const nextQuantity = sameVariant ? cart.items[itemIndex].quantity + requestedQuantity : requestedQuantity;
        if (nextQuantity > availableStock) return res.status(400).json({ message: `Only ${availableStock} available` });
        cart.items[itemIndex].quantity = nextQuantity;
        cart.items[itemIndex].variantId = variant?._id;
        cart.items[itemIndex].variantName = variant?.name || "";
      } else {
        cart.items.push({ product: productId, quantity: requestedQuantity, variantId: variant?._id, variantName: variant?.name || "" });
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
    const quantity = Number(req.body.quantity);
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

    const product = await Product.findById(productId);
    const variant = item.variantId ? product?.variants.id(item.variantId) : null;
    const availableStock = variant ? variant.stock : product?.stock;
    if (!Number.isInteger(quantity) || quantity < 1 || !product || quantity > availableStock) return res.status(400).json({ message: "Invalid or unavailable quantity" });
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
