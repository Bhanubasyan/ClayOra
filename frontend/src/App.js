import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Landing from "./pages/Landing/Landing";
import Home from "./pages/Home/Home";
import Auth from "./pages/Auth/Auth";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import ResetPassword from "./pages/Auth/ResetPassword";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import ProductDetails from "./pages/Product/ProductDetails";
import OrderSuccess from "./pages/Success/OrderSuccess";
import Profile from "./pages/Profile/Profile";
import Wishlist from "./pages/Wishlist/Wishlist";
import TrackOrder from "./pages/TrackOrder/TrackOrder";

// Admin
import AdminDashboard from "./pages/Admin/AdminDashboard";

// Seller
import SellerDashboard from "./pages/Seller/SellerDashboard";
import SellerProducts from "./pages/Seller/SellerProducts";
import AddProduct from "./pages/Seller/AddProduct";
import SellerOrders from "./pages/Seller/SellerOrders";
import EditProduct from "./pages/Seller/EditProduct";
import SellerProfile from "./pages/Seller/SellerProfile";

// Components
import AdminRoute from "./components/admin/AdminRoute";
import SellerRoute from "./components/seller/SellerRoute";
import MainLayout from "./components/layout/MainLayout";

function App() {
  return (
    <Router>
      <Routes>

        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Main Layout (Navbar + Footer wrapped pages) */}
        <Route element={<MainLayout />}>

          {/* Public Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<OrderSuccess />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/track-order" element={<TrackOrder />} />

          {/* ================= ADMIN ================= */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* ================= SELLER ================= */}
          <Route
            path="/seller"
            element={
              <SellerRoute>
                <SellerDashboard />
              </SellerRoute>
            }
          >
            <Route path="products" element={<SellerProducts />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="orders" element={<SellerOrders />} />
            <Route path="profile" element={<SellerProfile />} />
            <Route path="edit-product/:id" element={<EditProduct />} />
          </Route>

        </Route>

      </Routes>
    </Router>
  );
}

export default App;
