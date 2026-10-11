const DeliveryZone = require("../models/DeliveryZone");

const EARTH_RADIUS_KM = 6371;

const normalizeCoordinates = (input = {}) => {
  const latitude = Number(input.latitude ?? input.lat ?? input.coordinates?.[1]);
  const longitude = Number(input.longitude ?? input.lng ?? input.lon ?? input.coordinates?.[0]);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    const error = new Error("Valid latitude and longitude are required");
    error.statusCode = 400;
    throw error;
  }
  return { latitude, longitude };
};

const distanceKm = (a, b) => {
  const toRad = (degrees) => degrees * Math.PI / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

const findServiceableZone = async (location, requestedZoneId) => {
  const coords = normalizeCoordinates(location);
  const filter = { active: true };
  if (requestedZoneId) filter._id = requestedZoneId;
  const zones = await DeliveryZone.find(filter).lean();
  const matches = zones.map((zone) => {
    const distance = distanceKm(coords, {
      longitude: zone.center.coordinates[0],
      latitude: zone.center.coordinates[1],
    });
    return { zone, distanceKm: Number(distance.toFixed(3)) };
  }).filter((entry) => entry.distanceKm <= entry.zone.radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
  return { coordinates: coords, match: matches[0] || null };
};

const sellerCanServeZone = (seller, zoneId) => seller?.approvedDeliveryZones?.some(
  (id) => String(id?._id || id) === String(zoneId)
);

module.exports = { normalizeCoordinates, distanceKm, findServiceableZone, sellerCanServeZone };
/*bhanu */