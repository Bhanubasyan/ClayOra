import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
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
      <h2>Checkout</h2>

      {cart.items.map((item) => (
        <div className="checkout-item" key={item.product._id}>
          <p>{item.product.name}</p>
          <p>{item.quantity} x ₹{item.product.price}</p>
        </div>
      ))}

      <h3>Total: ₹ {total}</h3>

      <button onClick={placeOrder}>
        Place Order
      </button>
    </div>
  );
}

export default Checkout;
