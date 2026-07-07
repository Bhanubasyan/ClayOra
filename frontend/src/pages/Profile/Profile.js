import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Profile.css";

const defaultProfile = {
  phone: "",
  alternatePhone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  businessName: "",
};

const requiredFields = [
  "phone",
  "addressLine1",
  "city",
  "state",
  "postalCode",
  "country",
];

const trackingSteps = ["Pending", "Processing", "Shipped", "Delivered"];

function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(defaultProfile);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const hydrateProfile = (profile) => ({
    phone: profile.phone || "",
    alternatePhone: profile.alternatePhone || "",
    addressLine1: profile.addressLine1 || profile.address || "",
    addressLine2: profile.addressLine2 || "",
    landmark: profile.landmark || "",
    city: profile.city || "",
    state: profile.state || "",
    postalCode: profile.postalCode || "",
    country: profile.country || "India",
    businessName: profile.businessName || "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userRes = await API.get("/auth/profile");
        setUser(userRes.data);
        setForm(hydrateProfile(userRes.data));

        const orderRes = await API.get("/orders/my");
        setOrders(orderRes.data);
      } catch (error) {
        navigate("/auth");
      }
    };

    fetchProfile();
  }, [navigate]);

  const completion = useMemo(() => {
    const completed = requiredFields.filter((field) =>
      String(form[field] || "").trim()
    ).length;

    return Math.round((completed / requiredFields.length) * 100);
  }, [form]);

  const fullAddress = [
    form.addressLine1,
    form.addressLine2,
    form.landmark,
    form.city,
    form.state,
    form.postalCode,
    form.country,
  ]
    .filter(Boolean)
    .join(", ");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const saveChanges = async (e) => {
    e.preventDefault();

    const missingField = requiredFields.find(
      (field) => !String(form[field] || "").trim()
    );

    if (missingField) {
      alert("Please fill all required profile fields.");
      return;
    }

    try {
      setSaving(true);
      const res = await API.put("/auth/profile", {
        ...form,
        address: fullAddress,
      });

      const storedUser = JSON.parse(localStorage.getItem("user")) || {};
      localStorage.setItem("user", JSON.stringify({ ...storedUser, ...res.data }));

      setUser(res.data);
      setForm(hydrateProfile(res.data));
      setIsEditing(false);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await API.put(`/orders/cancel/${orderId}`);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: "Cancelled" } : order
        )
      );

      alert("Order cancelled successfully!");
    } catch (error) {
      alert("Failed to cancel order");
    }
  };

  if (!user) {
    return <h2 className="profile-loading">Loading profile...</h2>;
  }

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div>
          <p className="profile-eyebrow">My Account</p>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
        </div>

        <div className="profile-score">
          <span>{completion}%</span>
          <p>Profile complete</p>
        </div>
      </section>

      <div className="profile-layout">
        <aside className="profile-summary">
          <div className="avatar">{user.name?.charAt(0)?.toUpperCase()}</div>
          <h2>{user.name}</h2>
          <p className="role-pill">{user.role}</p>

          <div className="completion-track">
            <span style={{ width: `${completion}%` }} />
          </div>

          <button
            className="primary-btn"
            onClick={() => setIsEditing((current) => !current)}
          >
            {isEditing ? "View Profile" : "Edit Profile"}
          </button>

          <button onClick={logout} className="logout-profile-btn">
            Logout
          </button>
        </aside>

        <main className="profile-main">
          <section className="profile-panel">
            <div className="panel-heading">
              <div>
                <p className="profile-eyebrow">Contact</p>
                <h3>Personal Information</h3>
              </div>
              {!isEditing && completion < 100 && (
                <button className="text-btn" onClick={() => setIsEditing(true)}>
                  Complete now
                </button>
              )}
            </div>

            {isEditing ? (
              <form className="profile-form" onSubmit={saveChanges}>
                {user.role === "seller" && (
                  <label>
                    Business name
                    <input
                      name="businessName"
                      value={form.businessName}
                      onChange={handleChange}
                      placeholder="Store or studio name"
                    />
                  </label>
                )}

                <label>
                  Mobile number *
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    required
                  />
                </label>

                <label>
                  Alternate mobile
                  <input
                    name="alternatePhone"
                    value={form.alternatePhone}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </label>

                <label className="full-row">
                  Address line 1 *
                  <input
                    name="addressLine1"
                    value={form.addressLine1}
                    onChange={handleChange}
                    placeholder="House number, building, street"
                    required
                  />
                </label>

                <label className="full-row">
                  Address line 2
                  <input
                    name="addressLine2"
                    value={form.addressLine2}
                    onChange={handleChange}
                    placeholder="Area, colony, apartment"
                  />
                </label>

                <label>
                  Landmark
                  <input
                    name="landmark"
                    value={form.landmark}
                    onChange={handleChange}
                    placeholder="Near..."
                  />
                </label>

                <label>
                  City *
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  State *
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  PIN code *
                  <input
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Country *
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    required
                  />
                </label>

                <div className="form-actions full-row">
                  <button type="submit" className="primary-btn" disabled={saving}>
                    {saving ? "Saving..." : "Save Profile"}
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => {
                      setForm(hydrateProfile(user));
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="info-grid">
                {user.role === "seller" && (
                  <div>
                    <span>Business</span>
                    <strong>{form.businessName || "Not added"}</strong>
                  </div>
                )}
                <div>
                  <span>Mobile</span>
                  <strong>{form.phone || "Not added"}</strong>
                </div>
                <div>
                  <span>Alternate Mobile</span>
                  <strong>{form.alternatePhone || "Not added"}</strong>
                </div>
                <div className="full-row">
                  <span>Shipping Address</span>
                  <strong>{fullAddress || "Not added"}</strong>
                </div>
              </div>
            )}
          </section>

          <section className="profile-panel">
            <div className="panel-heading">
              <div>
                <p className="profile-eyebrow">Orders</p>
                <h3>Order History</h3>
              </div>
              <span className="order-count">{orders.length} orders</span>
            </div>

            {orders.length === 0 ? (
              <p className="no-orders">No orders yet.</p>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order._id} className="order-card">
                    <div className="order-info">
                      <span>Order ID</span>
                      <strong>{order._id}</strong>
                      <p>Total: Rs. {order.totalAmount}</p>
                      <p>
                        Payment: {order.paymentMethod || "COD"} -{" "}
                        {order.paymentStatus || "Pending"}
                      </p>
                      <div className="tracking-line">
                        {trackingSteps.map((step) => {
                          const active =
                            order.status === "Cancelled"
                              ? step === "Pending"
                              : trackingSteps.indexOf(step) <=
                                trackingSteps.indexOf(order.status);

                          return (
                            <div
                              className={`tracking-step ${active ? "active" : ""}`}
                              key={step}
                            >
                              <span></span>
                              <small>{step}</small>
                            </div>
                          );
                        })}
                      </div>
                      {order.status === "Cancelled" && (
                        <p className="cancelled-note">Order cancelled</p>
                      )}
                    </div>

                    <div className="order-actions">
                      <div className="order-status">{order.status}</div>

                      <button
                        className="track-btn"
                        onClick={() => navigate(`/track-order?orderId=${order._id}`)}
                      >
                        Track Order
                      </button>

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
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default Profile;
