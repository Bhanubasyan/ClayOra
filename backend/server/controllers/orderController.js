const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// @desc Create Order from Cart
// @route POST /api/orders
// @access Private
exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (let item of cart.items) {
      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.product.name}`,
        });
      }

      totalAmount += item.quantity * item.product.price;

      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      });

      // Reduce stock
      item.product.stock -= item.quantity;
      await item.product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      totalAmount,
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json(order);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// @desc Get My Orders
// @route GET /api/orders/my
// @access Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("orderItems.product");
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// @desc Get All Orders
// @route GET /api/orders
// @access Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product");

    res.status(200).json(orders);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// @desc Update Order Status
// @route PUT /api/orders/:id
// @access Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status || order.status;

    await order.save();

    res.status(200).json(order);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get seller orders
// @route   GET /api/orders/seller
// @access  Seller
exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      "orderItems.seller": req.user._id
    }).populate("user", "name email");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
