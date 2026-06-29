import { Link, Outlet, useLocation } from "react-router-dom";
import "./seller.css";

function SellerDashboard() {
  const location = useLocation();
  const isIndex = location.pathname === "/seller";

  return (
    <div className="seller-container">
      <div className="seller-sidebar">
        <h2 className="seller-title">Seller Panel</h2>
        <div className="seller-nav">
          <Link to="/seller/products">Products</Link>
          <Link to="/seller/add-product">Add Product</Link>
          <Link to="/seller/orders">Orders</Link>
        </div>
      </div>

      <div className="seller-content">
        {isIndex ? (
          <div className="seller-welcome">
            <h2>Welcome back</h2>
            <p>Manage your products, upload new items, and track customer orders.</p>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}

export default SellerDashboard;
