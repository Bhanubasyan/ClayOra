import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Checkout.css";

const emptyDeliveryAddress = {
  recipientName: "",
  phone: "",
  alternatePhone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

function Checkout() {
  const [cart, setCart] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placing, setPlacing] = useState(false);
  const [addressMode, setAddressMode] = useState("saved");
  const [deliveryAddress, setDeliveryAddress] = useState(emptyDeliveryAddress);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/cart")
      .then((res) => setCart(res.data))
      .catch((err) => console.log(err));

    API.get("/auth/profile")
      .then(({ data }) => setDeliveryAddress({
        recipientName: data.name || "",
        phone: data.phone || "",
        alternatePhone: data.alternatePhone || "",
        addressLine1: data.addressLine1 || data.address || "",
        addressLine2: data.addressLine2 || "",
        landmark: data.landmark || "",
        city: data.city || "",
        state: data.state || "",
        postalCode: data.postalCode || "",
        country: data.country || "India",
      }))
      .catch((err) => console.log(err));
  }, []);

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const placeCodOrder = async () => {
    await API.post("/orders", { paymentMethod: "COD", deliveryAddress });
    navigate("/success");
  };

  const placeRazorpayOrder = async () => {
    const loaded = await loadRazorpay();

    if (!loaded) {
      alert("Unable to load Razorpay checkout");
      return;
    }

    const res = await API.post("/payments/razorpay-order");
    const { key, razorpayOrder } = res.data;

    const user = JSON.parse(localStorage.getItem("user")) || {};

    const options = {
      key,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "ClayOra",
      description: "Handmade marketplace order",
      order_id: razorpayOrder.id,
      prefill: {
        name: user.name,
        email: user.email,
      },
      handler: async (response) => {
        await API.post("/payments/verify", response);
        navigate("/success");
      },
      theme: {
        color: "#C65D3B",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const placeOrder = async () => {
    try {
      setPlacing(true);
      if (paymentMethod === "Razorpay") {
        await placeRazorpayOrder();
      } else {
        await placeCodOrder();
      }
    } catch (error) {
      alert(error.response?.data?.message||"Order Failed");
    } finally {
      setPlacing(false);
  }
  };

  const handleAddressChange = (event) => {
    setDeliveryAddress((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return <h2>Your cart is empty</h2>;
  }

  const total = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

 return (
  <div className="checkout-container">

    <h2 className="checkout-title">Secure Checkout</h2>

    <div className="checkout-layout">

      {/* LEFT - ORDER ITEMS */}
      <div className="checkout-items">
        {cart.items.map((item) => (
          <div className="checkout-item" key={item.product._id}>
            <div className="checkout-item-left">
              <img
                src={item.product.image}
                alt={item.product.name}
              />
            </div>

            <div className="checkout-item-middle">
              <h4>{item.product.name}</h4>
              <p>
                {item.quantity} x Rs. {item.product.price}
              </p>
            </div>

            <div className="checkout-item-right">
              Rs. {item.product.price * item.quantity}
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT - SUMMARY */}
      <div className="checkout-summary">
        <h3>Order Summary</h3>

        <p className="summary-total">
          Total: Rs. {total}
        </p>

        <div className="delivery-address-section">
          <h3>Delivery Address</h3>
          <label>
            <input
              type="radio"
              name="addressMode"
              checked={addressMode === "saved"}
              onChange={() => setAddressMode("saved")}
            />
            Use saved profile address
          </label>
          <label>
            <input
              type="radio"
              name="addressMode"
              checked={addressMode === "new"}
              onChange={() => setAddressMode("new")}
            />
            Enter a different address
          </label>

          {addressMode === "saved" ? (
            <p className="saved-address">
              {deliveryAddress.recipientName}<br />
              {deliveryAddress.phone}<br />
              {deliveryAddress.addressLine1}, {deliveryAddress.addressLine2}<br />
              {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.postalCode}
            </p>
          ) : (
            <div className="delivery-address-form">
              <input name="recipientName" value={deliveryAddress.recipientName} onChange={handleAddressChange} placeholder="Recipient name" required />
              <input name="phone" value={deliveryAddress.phone} onChange={handleAddressChange} placeholder="Mobile number" required />
              <input name="alternatePhone" value={deliveryAddress.alternatePhone} onChange={handleAddressChange} placeholder="Alternate mobile (optional)" />
              <input name="addressLine1" value={deliveryAddress.addressLine1} onChange={handleAddressChange} placeholder="Address line 1" required />
              <input name="addressLine2" value={deliveryAddress.addressLine2} onChange={handleAddressChange} placeholder="Address line 2 (optional)" />
              <input name="landmark" value={deliveryAddress.landmark} onChange={handleAddressChange} placeholder="Landmark (optional)" />
              <input name="city" value={deliveryAddress.city} onChange={handleAddressChange} placeholder="City" required />
              <input name="state" value={deliveryAddress.state} onChange={handleAddressChange} placeholder="State" required />
              <input name="postalCode" value={deliveryAddress.postalCode} onChange={handleAddressChange} placeholder="PIN code" required />
              <input name="country" value={deliveryAddress.country} onChange={handleAddressChange} placeholder="Country" required />
            </div>
          )}
        </div>

        <div className="payment-options">
          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              checked={paymentMethod === "COD"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Cash on Delivery
          </label>

          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="Razorpay"
              checked={paymentMethod === "Razorpay"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Razorpay
          </label>
        </div>

        <button className="place-order-btn" onClick={placeOrder} disabled={placing}>
          {placing ? "Processing..." : "Place Order"}
        </button>
      </div>

    </div>

  </div>
);
}

export default Checkout;
