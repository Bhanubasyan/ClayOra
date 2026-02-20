import { Link, Outlet } from "react-router-dom";
import "./seller.css";

function SellerDashboard() {
  return (
    <div className="seller-container">
      
      <div className="seller-sidebar">
        <h2>Seller Panel</h2>

        <Link to="products">My Products</Link>
        <Link to="add-product">Add Product</Link>
        <Link to="orders">Orders</Link>
      </div>

      <div className="seller-content">
        <Outlet />
      </div>

    </div>
  );
}

export default SellerDashboard;
