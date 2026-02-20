import { useEffect, useState } from "react";
import API from "../services/api";
import potteryImg from "../assets/pottery1.jpg";
import { useNavigate } from "react-router-dom";


import "./cart.css";

function Cart() {
  const [cart, setCart] = useState(null);
const navigate = useNavigate();
  const fetchCart = async () => {
    try {
      const res = await API.get("/cart");
      setCart(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;
    await API.put(`/cart/${productId}`, { quantity });
    fetchCart();
  };

  const removeItem = async (productId) => {
    await API.delete(`/cart/${productId}`);
    fetchCart();
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty-card">
          <h2>Your Cart is Empty</h2>
        </div>
      </div>
    );
  }

  const total = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <div className="cart-container">
      <h2 className="cart-title">Your Cart</h2>

      {cart.items.map((item) => (
  <div className="cart-card" key={item.product._id}>
    <div className="cart-left">
      <img src={potteryImg} alt={item.product.name} />
    </div>

    <div className="cart-middle">
      <h4>{item.product.name}</h4>
      <p>₹ {item.product.price}</p>

      {/* 🔥 STOCK INFO */}
      {item.product.stock > 0 ? (
        <p className="stock-info">
          Available: {item.product.stock}
        </p>
      ) : (
        <p className="out-stock">Out of Stock</p>
      )}

      <div className="qty-controls">
        <button
          onClick={() =>
            updateQuantity(item.product._id, item.quantity - 1)
          }
        >
          -
        </button>

        <span>{item.quantity}</span>

        <button
          onClick={() =>
            updateQuantity(item.product._id, item.quantity + 1)
          }
          disabled={item.quantity >= item.product.stock}
        >
          +
        </button>
      </div>
    </div>

    <div className="cart-right">
      <button
        className="remove-btn"
        onClick={() => removeItem(item.product._id)}
      >
        Remove
      </button>
    </div>
  </div>
))}

      <div className="cart-summary">
        <h3>Total: ₹ {total}</h3>
        <button
  className="checkout-btn"
  onClick={() => navigate("/checkout")}
>
  Checkout
</button>
      </div>
    </div>
  );
}

export default Cart;
