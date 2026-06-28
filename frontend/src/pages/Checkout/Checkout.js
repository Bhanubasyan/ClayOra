import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Checkout.css";

function Checkout() {
  const [cart, setCart] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/cart")
      .then((res) => setCart(res.data))
      .catch((err) => console.log(err));
  }, []);

  const placeOrder = async () => {
    try {
      await API.post("/orders");
      navigate("/success");
    } catch (error) {
      alert(error.response?.data?.message||"Order Failed");
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

        <button className="place-order-btn" onClick={placeOrder}>
          Place Order
        </button>
      </div>

    </div>

  </div>
);
}

export default Checkout;
