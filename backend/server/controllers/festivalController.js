const FestivalCampaign = require("../models/FestivalCampaign");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

const activeCampaignFilter = () => ({ active: true, startDate: { $lte: new Date() }, endDate: { $gte: new Date() } });
const indiaDate = (value, endOfDay = false) => {
  if (!value || value instanceof Date || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}+05:30`);
};
const campaignPayload = (body) => {
  const payload = { ...body };
  ["_id", "__v", "createdAt", "updatedAt"].forEach((field) => delete payload[field]);
  if (body.startDate !== undefined) payload.startDate = indiaDate(body.startDate);
  if (body.endDate !== undefined) payload.endDate = indiaDate(body.endDate, true);
  if (!body.timezone && body.startDate !== undefined) payload.timezone = "Asia/Kolkata";
  if (payload.locationBased && (!Array.isArray(payload.targetZones) || payload.targetZones.length === 0)) {
    const error = new Error("Select at least one delivery zone for a location-based sale");
    error.statusCode = 400;
    throw error;
  }
  if (payload.locationBased === false) payload.targetZones = [];
  return payload;
};

exports.getActiveCampaigns = async (req, res, next) => {
  try {
    const campaigns = await FestivalCampaign.find(activeCampaignFilter())
      .populate("targetZones", "name city radiusKm deliveryFee minimumOrderAmount estimatedDeliveryTime codEnabled")
      .populate("featuredSellers", "name businessName")
      .populate("featuredProducts");
    res.json(campaigns);
  } catch (error) { next(error); }
};

exports.getCampaignBySlug = async (req, res, next) => {
  try {
    const campaign = await FestivalCampaign.findOne({ slug: req.params.slug, ...activeCampaignFilter() })
      .populate("targetZones", "name city radiusKm deliveryFee minimumOrderAmount estimatedDeliveryTime codEnabled")
      .populate("featuredSellers", "name businessName")
      .populate({ path: "featuredProducts", match: { isApproved: true, availability: "available", stock: { $gt: 0 } }, populate: { path: "seller", select: "name businessName approvedDeliveryZones" } });
    if (!campaign) return res.status(404).json({ message: "This festival campaign is not active" });
    res.json(campaign);
  } catch (error) { next(error); }
};

exports.listCampaigns = async (req, res, next) => {
  try { res.json(await FestivalCampaign.find().populate("targetZones", "name city").sort({ startDate: -1 })); }
  catch (error) { next(error); }
};

exports.getSellerCampaigns = async (req, res, next) => {
  try {
    res.json(await FestivalCampaign.find({ endDate: { $gte: new Date() } }).select("name slug description startDate endDate active locationBased targetZones categories").populate("targetZones", "name city").sort({ startDate: 1 }));
  } catch (error) { next(error); }
};

exports.createCampaign = async (req, res, next) => {
  try { res.status(201).json(await FestivalCampaign.create(campaignPayload(req.body))); }
  catch (error) { next(error); }
};

exports.uploadCampaignBanner = (req, res) => {
  if (!req.file?.path) return res.status(400).json({ message: "Banner image is required" });
  res.status(201).json({ url: req.file.path });
};

exports.updateCampaign = async (req, res, next) => {
  try {
    const campaign = await FestivalCampaign.findByIdAndUpdate(req.params.id, campaignPayload(req.body), { new: true, runValidators: true });
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    res.json(campaign);
  } catch (error) { next(error); }
};

exports.getCampaignAnalytics = async (req, res, next) => {
  try {
    const campaign = await FestivalCampaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    const productIds = await Product.find({ festivalTags: campaign.slug }).distinct("_id");
    const orders = await Order.find({ "orderItems.product": { $in: productIds }, createdAt: { $gte: campaign.startDate, $lte: campaign.endDate }, status: { $ne: "Cancelled" } });
    const relevantItems = orders.flatMap((order) => order.orderItems.filter((item) => productIds.some((id) => id.equals(item.product))));
    res.json({ orders: orders.length, unitsSold: relevantItems.reduce((sum, item) => sum + item.quantity, 0), sales: relevantItems.reduce((sum, item) => sum + item.price * item.quantity, 0) });
  } catch (error) { next(error); }
};

exports.requestParticipation = async (req, res, next) => {
  try {
    const campaign = await FestivalCampaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    const seller = await User.findById(req.user._id);
    const existing = seller.festivalParticipation.find((item) => item.campaign.equals(campaign._id));
    if (existing) existing.status = "pending";
    else seller.festivalParticipation.push({ campaign: campaign._id, status: "pending" });
    await seller.save();
    res.json({ message: "Participation request submitted" });
  } catch (error) { next(error); }
};

exports.reviewParticipation = async (req, res, next) => {
  try {
    if (!["approved", "rejected"].includes(req.body.status)) return res.status(400).json({ message: "Invalid participation status" });
    const seller = await User.findById(req.params.sellerId);
    const participation = seller?.festivalParticipation.find((item) => item.campaign.equals(req.params.campaignId));
    if (!participation) return res.status(404).json({ message: "Participation request not found" });
    participation.status = req.body.status;
    await seller.save();
    res.json({ message: `Seller ${req.body.status}` });
  } catch (error) { next(error); }
};

exports.listParticipationRequests = async (req, res, next) => {
  try {
    res.json(await User.find({ role: "seller", "festivalParticipation.0": { $exists: true } }).select("name email businessName festivalParticipation").populate("festivalParticipation.campaign", "name slug"));
  } catch (error) { next(error); }
};
