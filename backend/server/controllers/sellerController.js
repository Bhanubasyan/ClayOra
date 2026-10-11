const User = require("../models/User");
const DeliveryZone = require("../models/DeliveryZone");
const { normalizeCoordinates } = require("../services/serviceability");

exports.updateStoreLocation = async (req, res, next) => {
  try {
    const { latitude, longitude } = normalizeCoordinates(req.body);
    const seller = await User.findByIdAndUpdate(req.user._id, {
      storeLocation: { type: "Point", coordinates: [longitude, latitude] },
    }, { new: true, runValidators: true }).select("-password");
    res.json(seller);
  } catch (error) { next(error); }
};

exports.requestDeliveryZone = async (req, res, next) => {
  try {
    const zone = await DeliveryZone.findOne({ _id: req.params.zoneId, active: true });
    if (!zone) return res.status(404).json({ message: "Active delivery zone not found" });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { requestedDeliveryZones: zone._id } });
    res.json({ message: "Delivery-zone request submitted for admin approval" });
  } catch (error) { next(error); }
};

exports.reviewDeliveryZone = async (req, res, next) => {
  try {
    const seller = await User.findOne({ _id: req.params.sellerId, role: "seller" });
    if (!seller) return res.status(404).json({ message: "Seller not found" });
    if (req.body.approved) seller.approvedDeliveryZones.addToSet(req.params.zoneId);
    else seller.approvedDeliveryZones.pull(req.params.zoneId);
    seller.requestedDeliveryZones.pull(req.params.zoneId);
    await seller.save();
    res.json({ message: req.body.approved ? "Seller approved for zone" : "Zone request rejected" });
  } catch (error) { next(error); }
};

exports.listZoneRequests = async (req, res, next) => {
  try {
    res.json(await User.find({ role: "seller", "requestedDeliveryZones.0": { $exists: true } })
      .select("name email businessName storeLocation requestedDeliveryZones approvedDeliveryZones")
      .populate("requestedDeliveryZones approvedDeliveryZones", "name city"));
  } catch (error) { next(error); }
};
