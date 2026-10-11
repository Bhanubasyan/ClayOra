const DeliveryZone = require("../models/DeliveryZone");
const AvailabilityRequest = require("../models/AvailabilityRequest");
const { findServiceableZone, normalizeCoordinates } = require("../services/serviceability");

const zonePayload = (body) => {
  const coordinates = normalizeCoordinates(body.center || body);
  return {
    name: String(body.name || "").trim(),
    city: String(body.city || "").trim(),
    center: { type: "Point", coordinates: [coordinates.longitude, coordinates.latitude] },
    radiusKm: Number(body.radiusKm),
    active: body.active !== false,
    deliveryFee: Number(body.deliveryFee || 0),
    minimumOrderAmount: Number(body.minimumOrderAmount || 0),
    estimatedDeliveryTime: String(body.estimatedDeliveryTime || "Same day").trim(),
    codEnabled: Boolean(body.codEnabled),
  };
};

exports.listDeliveryZones = async (req, res, next) => {
  try {
    const query = req.user?.role === "admin" ? {} : { active: true };
    res.json(await DeliveryZone.find(query).sort({ createdAt: -1 }));
  } catch (error) { next(error); }
};

exports.listAllDeliveryZones = async (req, res, next) => {
  try { res.json(await DeliveryZone.find().sort({ createdAt: -1 })); }
  catch (error) { next(error); }
};

exports.checkDeliveryZone = async (req, res, next) => {
  try {
    const result = await findServiceableZone(req.body);
    if (!result.match) return res.json({ serviceable: false, message: "Clayora is coming soon to your area" });
    res.json({ serviceable: true, zone: result.match.zone, distanceKm: result.match.distanceKm });
  } catch (error) { next(error); }
};

exports.createDeliveryZone = async (req, res, next) => {
  try { res.status(201).json(await DeliveryZone.create(zonePayload(req.body))); }
  catch (error) { next(error); }
};

exports.updateDeliveryZone = async (req, res, next) => {
  try {
    const zone = await DeliveryZone.findById(req.params.id);
    if (!zone) return res.status(404).json({ message: "Delivery zone not found" });
    const update = req.body.center || req.body.latitude !== undefined ? zonePayload({ ...zone.toObject(), ...req.body }) : req.body;
    Object.assign(zone, update);
    await zone.save();
    res.json(zone);
  } catch (error) { next(error); }
};

exports.requestAvailabilityNotice = async (req, res, next) => {
  try {
    const { latitude, longitude } = normalizeCoordinates(req.body);
    const request = await AvailabilityRequest.findOneAndUpdate(
      { email: String(req.body.email || "").toLowerCase().trim(), "location.coordinates": [longitude, latitude] },
      { email: req.body.email, address: req.body.address || "", location: { type: "Point", coordinates: [longitude, latitude] } },
      { upsert: true, new: true, runValidators: true }
    );
    res.status(201).json({ message: "We will let you know when Clayora reaches your area.", id: request._id });
  } catch (error) { next(error); }
};
