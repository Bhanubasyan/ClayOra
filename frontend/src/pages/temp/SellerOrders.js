import { useEffect, useState } from "react";
import API from "../../services/api";

function SellerOrders() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/seller");
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching seller orders:", error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/orders/seller/${id}/status`, { status });
      fetchOrders();
    } catch (error) {
      alert("Failed to update order status");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      <h2>Seller Orders</h2>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Total:</strong> Rs. {order.totalAmount}</p>
            <p><strong>Status:</strong> {order.status}</p>

            {order.status === "Pending" && (
              <button onClick={() => updateStatus(order._id, "Shipped")}>
                Mark as Shipped
              </button>
            )}

            {order.status === "Shipped" && (
              <button onClick={() => updateStatus(order._id, "Delivered")}>
                Mark as Delivered
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default SellerOrders;
