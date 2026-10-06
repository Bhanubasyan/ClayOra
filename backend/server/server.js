const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const connectDB = require("./config/db");

// Email reliability fix: always load the server-local .env file, even when Node starts from the repository root.
// Previous dotenv.config() only searched the current terminal folder, which could omit Brevo settings.
dotenv.config({ path: path.join(__dirname, ".env") });
connectDB();

const app = express();

/* ================================
   CORS CONFIGURATION
================================ */

app.use(
  cors({
    origin: true,
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
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/seller", require("./routes/sellerRoutes"));
// Interview feature: Razorpay endpoints are mounted separately from order APIs for clear payment boundaries.
app.use("/api/payments", require("./routes/paymentRoutes"));
// Wishlist feature: mounts the authenticated saved-products API used by the customer pages.
app.use("/api/wishlist", require("./routes/wishlistRoutes"));

/* ================================
   HEALTH CHECK
================================ */

app.get("/", (req, res) => {
  res.send("API is running...");
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
  console.log(`Server running on port ${PORT}`);
});
