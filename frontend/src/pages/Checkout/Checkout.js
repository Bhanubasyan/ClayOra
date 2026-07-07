import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Checkout.css";

function Checkout() {
  const [cart, setCart] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/cart")
      .then((res) => setCart(res.data))
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
    await API.post("/orders", { paymentMethod: "COD" });
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
