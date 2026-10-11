const test = require("node:test");
const assert = require("node:assert/strict");
const { distanceKm, normalizeCoordinates } = require("./serviceability");

test("distance is zero for identical coordinates", () => {
  assert.equal(distanceKm({ latitude: 28.61, longitude: 77.37 }, { latitude: 28.61, longitude: 77.37 }), 0);
});

test("3 km boundary calculation is stable", () => {
  const center = { latitude: 28.61, longitude: 77.37 };
  const nearBoundary = { latitude: 28.63698, longitude: 77.37 };
  const measured = distanceKm(center, nearBoundary);
  assert.ok(measured > 2.99 && measured < 3.02);
});

test("normalization rejects invalid coordinates", () => {
  assert.throws(() => normalizeCoordinates({ latitude: 95, longitude: 77 }), /Valid latitude/);
  assert.deepEqual(normalizeCoordinates({ lat: "28.61", lng: "77.37" }), { latitude: 28.61, longitude: 77.37 });
});
