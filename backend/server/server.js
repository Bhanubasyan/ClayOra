const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

/* ================================
   CORS CONFIGURATION
================================ */

const allowedOrigins = [
  "http://localhost:3000",   // Local frontend
 "https://full-stack-ecommerce-marketplace-1.onrender.com"
];

app.use(
  cors({
    origin: true,   // allow all origins dynamically
    credentials: true,
  })
);

/* ================================
   MIDDLEWARE
================================ */

app.use(express.json());
app.use(cookieParser());

// Serve uploaded images
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* ================================
   ROUTES
================================ */

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

/* ================================
   HEALTH CHECK
================================ */

app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

/* ================================
   ERROR HANDLER
================================ */

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

/* ================================
   SERVER START
================================ */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});