const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/AdminRoute");
const sellerRoutes = require("./routes/SellerRoute");
dotenv.config();
connectDB();

const app = express();

// --------------------
// Security Middlewares
// --------------------

app.use(helmet()); // Secure HTTP headers
app.use(express.json()); // Parse JSON body
app.use(cookieParser()); // Parse cookies

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://full-stack-ecommerce-marketplace-4k46kq0fi.vercel.app",
    ],
    
    credentials: true,
  })
);
app.use("/api/cart", cartRoutes);

app.use("/api/products", productRoutes);

app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/seller", sellerRoutes);
// Rate Limiter (Global)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
});
app.use(limiter);

// --------------------
// Routes
// --------------------

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API Running Securely...");
});

// --------------------
// Server Start
// --------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
