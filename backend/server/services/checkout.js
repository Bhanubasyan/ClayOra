const Cart = require("../models/Cart");
const User = require("../models/User");
const Product = require("../models/Product");
const FestivalCampaign = require("../models/FestivalCampaign");
const { findServiceableZone, sellerCanServeZone } = require("./serviceability");

const quoteCart = async (userId, location, paymentMethod) => {
  const cart = await Cart.findOne({ user: userId }).populate({ path: "items.product", populate: { path: "seller", select: "name businessName approvedDeliveryZones" } });
  if (!cart?.items?.length) {
    const error = new Error("Cart is empty"); error.statusCode = 400; throw error;
  }
  const festivalSlugs = [...new Set(cart.items.flatMap((item) => item.product?.festivalTags || []))];
  const locationCampaigns = festivalSlugs.length ? await FestivalCampaign.find({ slug: { $in: festivalSlugs }, active: true, locationBased: true, startDate: { $lte: new Date() }, endDate: { $gte: new Date() } }).lean() : [];
  const requiresLocation = locationCampaigns.length > 0;
  let coordinates = null;
  let match = null;
  if (requiresLocation) {
    const serviceability = await findServiceableZone(location, location.zoneId);
    coordinates = serviceability.coordinates;
    match = serviceability.match;
    if (!match) {
      const error = new Error("This sale is not available at the selected location."); error.statusCode = 400; throw error;
    }
    const saleSupportsZone = locationCampaigns.every((campaign) => campaign.targetZones.some((zoneId) => String(zoneId) === String(match.zone._id)));
    if (!saleSupportsZone) {
      const error = new Error("This sale is not assigned to your delivery area."); error.statusCode = 400; throw error;
    }
  }
  const sellerIds = new Set(cart.items.map((item) => String(item.product?.seller?._id || item.product?.seller)));
  if (sellerIds.size !== 1) {
    const error = new Error("Local delivery currently supports one seller per order. Please keep items from one store in your cart."); error.statusCode = 400; throw error;
  }
  for (const item of cart.items) {
    const product = item.product;
    const variant = item.variantId ? product?.variants.id(item.variantId) : null;
    const availableStock = variant ? variant.stock : product?.stock;
    if (!product || !product.isApproved || product.availability !== "available" || (item.variantId && !variant) || item.quantity < 1 || item.quantity > availableStock) {
      const error = new Error(`One or more products are unavailable or out of stock.`); error.statusCode = 409; throw error;
    }
    if (requiresLocation && (!product.applicableDeliveryZones.some((id) => String(id) === String(match.zone._id)) || !sellerCanServeZone(product.seller, match.zone._id))) {
      const error = new Error(`"${product.name}" cannot be delivered to this location.`); error.statusCode = 400; throw error;
    }
  }
  if (requiresLocation && paymentMethod === "COD" && !match.zone.codEnabled) {
    const error = new Error("Cash on Delivery is not enabled for this delivery zone."); error.statusCode = 400; throw error;
  }
  const subtotal = cart.items.reduce((sum, item) => { const variant = item.variantId ? item.product.variants.id(item.variantId) : null; return sum + (variant?.price ?? item.product.discountPrice ?? item.product.price) * item.quantity; }, 0);
  if (requiresLocation && subtotal < match.zone.minimumOrderAmount) {
    const error = new Error(`Minimum order amount is Rs. ${match.zone.minimumOrderAmount}.`); error.statusCode = 400; throw error;
  }
  const deliveryFee = requiresLocation ? match.zone.deliveryFee : 0;
  return { cart, zone: requiresLocation ? match.zone : null, coordinates, requiresLocation, subtotal, deliveryFee, discountAmount: 0, totalAmount: subtotal + deliveryFee };
};

const reserveStock = async (items) => {
  const reserved = [];
  for (const item of items) {
    const productId = item.product._id || item.product;
    const variantId = item.variantId;
    const filter = { _id: productId, stock: { $gte: item.quantity }, availability: "available" };
    if (variantId) Object.assign(filter, { "variants._id": variantId, "variants.stock": { $gte: item.quantity } });
    const increments = { stock: -item.quantity };
    if (variantId) increments["variants.$.stock"] = -item.quantity;
    const product = await Product.findOneAndUpdate(
      filter,
      { $inc: increments },
      { new: true }
    );
    if (!product) {
      await Promise.all(reserved.map((entry) => entry.variantId ? Product.updateOne({ _id: entry.productId, "variants._id": entry.variantId }, { $inc: { stock: entry.quantity, "variants.$.stock": entry.quantity } }) : Product.findByIdAndUpdate(entry.productId, { $inc: { stock: entry.quantity } })));
      const error = new Error("A product just went out of stock. Please review your cart."); error.statusCode = 409; throw error;
    }
    reserved.push({ productId: product._id, variantId, quantity: item.quantity });
  }
  return reserved;
};

module.exports = { quoteCart, reserveStock };
