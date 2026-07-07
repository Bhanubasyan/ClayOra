import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../../services/api";
import "./TrackOrder.css";

const trackingSteps = ["Pending", "Processing", "Shipped", "Delivered"];

function TrackOrder() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("orderId") || "");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchOrder = useCallback(async (id) => {
    if (!id.trim()) {
      setError("Please enter an order id.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await API.get(`/orders/track/${id.trim()}`);
      setOrder(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/auth");
        return;
      }

      setOrder(null);
      setError(err.response?.data?.message || "Unable to track this order.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const idFromUrl = searchParams.get("orderId");
    if (idFromUrl) {
      fetchOrder(idFromUrl);
    }
  }, [fetchOrder, searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchOrder(orderId);
  };

  const currentIndex = trackingSteps.indexOf(order?.status);

  return (
    <div className="track-page">
      <section className="track-hero">
        <p>Order Status</p>
        <h1>Track Your Order</h1>
      </section>

      <form className="track-search" onSubmit={handleSubmit}>
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Enter order id"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Tracking..." : "Track"}
        </button>
      </form>

      {error && <p className="track-error">{error}</p>}

      {order && (
        <section className="track-card">
          <div className="track-summary">
            <div>
              <span>Order ID</span>
              <strong>{order._id}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{order.status}</strong>
            </div>
            <div>
              <span>Total</span>
              <strong>Rs. {order.totalAmount}</strong>
            </div>
            <div>
              <span>Payment</span>
              <strong>
                {order.paymentMethod || "COD"} - {order.paymentStatus || "Pending"}
              </strong>
            </div>
          </div>

          <div className="track-timeline">
            {trackingSteps.map((step, index) => {
              const active =
                order.status === "Cancelled" ? index === 0 : index <= currentIndex;

              return (
                <div className={`track-step ${active ? "active" : ""}`} key={step}>
                  <span>{index + 1}</span>
                  <strong>{step}</strong>
                </div>
              );
            })}
          </div>

          {order.status === "Cancelled" && (
            <p className="track-cancelled">This order has been cancelled.</p>
          )}

          <div className="track-history">
            <h3>Status Updates</h3>
            {(order.statusHistory || []).map((item) => (
              <div key={`${item.status}-${item.updatedAt}`}>
                <strong>{item.status}</strong>
                <span>{new Date(item.updatedAt).toLocaleString()}</span>
                {item.note && <p>{item.note}</p>}
              </div>
            ))}
          </div>

          <div className="track-items">
            <h3>Order Items</h3>
            {order.orderItems.map((item) => (
              <div className="track-item" key={item._id}>
                <img src={item.product?.image} alt={item.product?.name} />
                <div>
                  <strong>{item.product?.name}</strong>
                  <p>
                    {item.quantity} x Rs. {item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default TrackOrder;
