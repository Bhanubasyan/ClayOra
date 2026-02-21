import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";

import Cart from "./pages/Cart";
import Navbar from "./components/Navbar";
import ProductDetails from "./pages/ProductDetails";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Profile from "./pages/Profile";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerProducts from "./pages/seller/SellerProducts";
import AddProduct from "./pages/seller/AddProduct";
import SellerOrders from "./pages/seller/SellerOrders";
import EditProduct from "./pages/seller/EditProduct";
import AdminRoute from "./components/AdminRoute";
import SellerRoute from "./components/SellerRoute";
function App() {
  return (
    <Router>
      <Navbar />   {/* 👈 Add Navbar here */}
      
      <Routes>
  
  <Route path="/" element={<Home />} />
 <Route path="/auth" element={<Auth />} />
<Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  }
/>

  <Route path="/cart" element={<Cart />} />
  <Route path="/product/:id" element={<ProductDetails />} />
  <Route path="/checkout" element={<Checkout />} />
<Route path="/success" element={<OrderSuccess />} />
<Route path="/profile" element={<Profile />} />
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


</Routes>

    </Router>
  );
}

export default App;
