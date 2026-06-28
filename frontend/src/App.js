import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import Landing from "./pages/Landing/Landing";
import Home from "./pages/Home/Home";
import Auth from "./pages/Auth/Auth";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import ProductDetails from "./pages/Product/ProductDetails";
import OrderSuccess from "./pages/Success/OrderSuccess";
import Profile from "./pages/Profile/Profile";

// Admin
import AdminDashboard from "./pages/Admin/AdminDashboard";

// Seller
import SellerDashboard from "./pages/Seller/SellerDashboard";
import SellerProducts from "./pages/Seller/SellerProducts";
import AddProduct from "./pages/Seller/AddProduct";
import SellerOrders from "./pages/Seller/SellerOrders";
import EditProduct from "./pages/Seller/EditProduct";

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
          <Route path="/login" element={<Auth />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<OrderSuccess />} />
          <Route path="/profile" element={<Profile />} />

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
            <Route path="edit-product/:id" element={<EditProduct />} />
          </Route>

        </Route>

      </Routes>
    </Router>
  );
}

export default App;