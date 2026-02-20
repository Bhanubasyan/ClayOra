import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userRes = await API.get("/auth/profile");
        setUser(userRes.data);
        setPhone(userRes.data.phone || "");
        setAddress(userRes.data.address || "");

        const orderRes = await API.get("/orders/my");
        setOrders(orderRes.data);
      } catch (error) {
        navigate("/auth");
      }
    };

    fetchProfile();
  }, [navigate]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const saveChanges = async () => {
    try {
      const res = await API.put("/auth/profile", {
        phone,
        address,
      });

      setUser(res.data);
      setIsEditing(false);
    } catch (error) {
      alert("Failed to update profile");
    }
  };

  // ✅ CANCEL ORDER FUNCTION
  const cancelOrder = async (orderId) => {
    try {
      await API.put(`/orders/cancel/${orderId}`);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? { ...order, isCancelled: true }
            : order
        )
      );

      alert("Order cancelled successfully!");
    } catch (error) {
      alert("Failed to cancel order");
    }
  };

  if (!user) return <h2 style={{ color: "white" }}>Loading...</h2>;

  return (
    <div className="profile-container">

      <div className="profile-card">
        <img
          src="https://i.pravatar.cc/150?img=3"
          alt="User"
          className="profile-image"
        />

        <h2>{user.name}</h2>

        <div className="profile-info">
          <p><strong>Email:</strong> {user.email}</p>

          {isEditing ? (
            <>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contact number"
              />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
              />
              <button onClick={saveChanges}>Save</button>
            </>
          ) : (
            <>
              <p><strong>Contact:</strong> {phone || "Not added"}</p>
              <p><strong>Address:</strong> {address || "Not added"}</p>
              <button onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            </>
          )}
        </div>

        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="orders-section">
        <h3>My Orders</h3>

        {orders.length === 0 ? (
          <p className="no-orders">No orders yet.</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-card">

              <div>
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Total:</strong> ₹ {order.totalAmount}</p>
              </div>

              <div className="order-actions">

                <div className={`order-status`}>
                  {order.status}
                </div>

                {/* Cancel Button */}
                {order.status !== "Delivered" &&
                  order.status !== "Cancelled" && (
                    <button
                      className="cancel-btn"
                      onClick={() => cancelOrder(order._id)}
                    >
                      Cancel Order
                    </button>
                  )}

              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default Profile;