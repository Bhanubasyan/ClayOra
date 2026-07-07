import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./Wishlist.css";

function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await API.get("/wishlist");
      setProducts(res.data);
    } catch (error) {
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const removeItem = async (productId) => {
    const res = await API.delete(`/wishlist/${productId}`);
    setProducts(res.data);
  };

  const addToCart = async (productId) => {
    await API.post("/cart", { productId, quantity: 1 });
    alert("Added to cart");
  };

  if (loading) {
    return <h2 className="wishlist-message">Loading wishlist...</h2>;
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-heading">
        <p>Saved Finds</p>
        <h1>My Wishlist</h1>
      </div>

      {products.length === 0 ? (
        <div className="wishlist-empty">
          <h2>No saved products yet.</h2>
          <Link to="/home">Explore products</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {products.map((product) => (
            <div className="wishlist-card" key={product._id}>
              <Link to={`/product/${product._id}`}>
                <img src={product.image} alt={product.name} />
                <h3>{product.name}</h3>
              </Link>
              <p>Rs. {product.price}</p>
              <div className="wishlist-actions">
                <button onClick={() => addToCart(product._id)}>Add to Cart</button>
                <button
                  className="ghost-btn"
                  onClick={() => removeItem(product._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;
