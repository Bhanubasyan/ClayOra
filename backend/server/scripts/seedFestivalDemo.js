const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const connectDB = require("../config/db");
const DeliveryZone = require("../models/DeliveryZone");
const FestivalCampaign = require("../models/FestivalCampaign");

const categories = [
  ["Sabudana", "sabudana", "vrat"], ["Kuttu ka Atta", "kuttu-atta", "vrat"], ["Singhare ka Atta", "singhare-atta", "vrat"], ["Samak ke Chawal", "samak-rice", "vrat"], ["Sendha Namak", "sendha-namak", "vrat"], ["Makhana", "makhana", "vrat"], ["Peanuts", "peanuts", "vrat"], ["Dry Fruits", "dry-fruits", "vrat"], ["Coconut", "coconut", "vrat"], ["Honey", "honey", "vrat"], ["Ghee", "ghee", "vrat"], ["Fruits", "fruits", "vrat"], ["Milk and Curd", "dairy", "vrat"], ["Vrat Namkeen", "vrat-namkeen", "vrat"], ["Fasting Snacks", "fasting-snacks", "vrat"],
  ["Diya", "diya", "puja"], ["Cotton Batti", "cotton-batti", "puja"], ["Puja Oil and Ghee", "puja-oil", "puja"], ["Agarbatti", "agarbatti", "puja"], ["Dhoop", "dhoop", "puja"], ["Kapoor", "kapoor", "puja"], ["Kalash", "kalash", "puja"], ["Chunri", "chunri", "puja"], ["Roli and Kumkum", "roli-kumkum", "puja"], ["Akshat", "akshat", "puja"], ["Puja Thali", "puja-thali", "puja"], ["Flowers and Garlands", "flowers-garlands", "puja"], ["Hawan Samagri", "hawan-samagri", "puja"],
  ["Basic Vrat Essentials Kit", "basic-vrat-kit", "combo"], ["Complete Navratri Puja Kit", "complete-puja-kit", "combo"], ["Sabudana and Makhana Combo", "sabudana-makhana-combo", "combo"], ["Daily Puja Essentials Pack", "daily-puja-pack", "combo"], ["Family Fasting Essentials Pack", "family-fasting-pack", "combo"],
].map(([name, slug, group]) => ({ name, slug, group }));

async function run() {
  if (process.env.DEMO_SEED !== "true") throw new Error("Refusing to seed unless DEMO_SEED=true. This script is development-only.");
  const latitude = Number(process.env.DEMO_ZONE_LATITUDE);
  const longitude = Number(process.env.DEMO_ZONE_LONGITUDE);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error("Set DEMO_ZONE_LATITUDE and DEMO_ZONE_LONGITUDE to an admin-approved pilot center.");
  await connectDB();
  const zone = await DeliveryZone.findOneAndUpdate({ name: "Clayora Noida Zone 1" }, { name: "Clayora Noida Zone 1", city: "Noida", center: { type: "Point", coordinates: [longitude, latitude] }, radiusKm: 3, active: false, deliveryFee: 0, minimumOrderAmount: 0, estimatedDeliveryTime: "Same day", codEnabled: false }, { upsert: true, new: true, runValidators: true });
  await FestivalCampaign.findOneAndUpdate({ slug: "navratri" }, { name: "Sharad Navratri 2026", slug: "navratri", description: "Vrat essentials and puja samagri delivered locally.", heroTitle: "Navratri Special — Vrat Essentials & Puja Samagri Delivered Locally", startDate: new Date("2026-10-10T18:30:00.000Z"), endDate: new Date("2026-10-20T18:29:59.999Z"), timezone: "Asia/Kolkata", active: false, locationBased: true, targetZones: [zone._id], categories }, { upsert: true, new: true, runValidators: true });
  console.log("Demo-only inactive zone and campaign created. No users, products, prices, or orders were added.");
  process.exit(0);
}

run().catch((error) => { console.error(error.message); process.exit(1); });
