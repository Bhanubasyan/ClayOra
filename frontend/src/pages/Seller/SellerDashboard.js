import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import API from "../../services/api";
import "./seller.css";

function SellerDashboard() {
  const location = useLocation();
  const isIndex = location.pathname === "/seller";
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!isIndex) return;

    API.get("/orders/seller/analytics")
      .then((res) => setAnalytics(res.data))
      .catch(() => setAnalytics(null));
  }, [isIndex]);

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
          <div className="seller-welcome seller-analytics">
            <div>
              <h2>Welcome back</h2>
              <p>Manage products, track orders, and watch store performance.</p>
            </div>

            <div className="analytics-grid">
              <div>
                <span>Total Revenue</span>
                <strong>Rs. {analytics?.revenue || 0}</strong>
              </div>
              <div>
                <span>Active Orders</span>
                <strong>{analytics?.activeOrders || 0}</strong>
              </div>
              <div>
                <span>Delivered</span>
                <strong>{analytics?.deliveredOrders || 0}</strong>
              </div>
              <div>
                <span>Units Sold</span>
                <strong>{analytics?.unitsSold || 0}</strong>
              </div>
            </div>

            <div className="low-stock-panel">
              <h3>Low Stock</h3>
              {analytics?.lowStockProducts?.length ? (
                analytics.lowStockProducts.map((product) => (
                  <p key={product._id}>
                    {product.name} <span>{product.stock} left</span>
                  </p>
                ))
              ) : (
                <p>No low stock products from recent orders.</p>
              )}
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}

export default SellerDashboard;
