import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./ProductDetails.css";
function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [review, setReview] = useState({ rating: 5, comment: "" });
  const [wishlistSaved, setWishlistSaved] = useState(false);

  const fetchProduct = useCallback(() => {
    API.get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  useEffect(() => {
    fetchProduct();
    API.get("/wishlist")
      .then((res) =>
        setWishlistSaved(res.data.some((item) => item._id === id))
      )
      .catch(() => setWishlistSaved(false));
  }, [id, fetchProduct]);

  const addToCart = async () => {
    try {
      await API.post("/cart", {
        productId: product._id,
        quantity,
      });

      alert("Added to Cart!");
      navigate("/cart");
    } catch (error) {
      alert("Please login first");
      navigate("/auth");
    }
  };

  const toggleWishlist = async () => {
    try {
      if (wishlistSaved) {
        await API.delete(`/wishlist/${product._id}`);
        setWishlistSaved(false);
      } else {
        await API.post("/wishlist", { productId: product._id });
        setWishlistSaved(true);
      }
    } catch (error) {
      alert("Please login first");
      navigate("/auth");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();

    try {
      await API.post(`/products/${product._id}/reviews`, review);
      setReview({ rating: 5, comment: "" });
      fetchProduct();
      alert("Review saved");
    } catch (error) {
      alert(error.response?.data?.message || "Unable to save review");
    }
  };

  if (!product) return <h2>Loading...</h2>;

 return (
  <div className="product-detail-container">
    <div className="product-detail-card">

      {/* IMAGE SECTION */}
      <div className="product-image">
        <img src={product.image} alt={product.name} />
      </div>

      {/* INFO SECTION */}
      <div className="product-info">
        <h2 className="product-title">{product.name}</h2>

        <p className="price">Rs. {product.price}</p>
        <p className="product-rating">
          ★ {Number(product.rating || 0).toFixed(1)} from {product.numReviews || 0} reviews
        </p>

        <p className="desc">{product.description}</p>

        {/* Quantity */}
        <div className="quantity-control">
          <button
            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
          >
            -
          </button>
          <span>{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
          >
            +
          </button>
        </div>

        {/* Add Button */}
        <button
          className="add-btn"
          onClick={addToCart}
          disabled={product.stock === 0}
        >
          Add to Cart
        </button>

        <button className="wishlist-detail-btn" onClick={toggleWishlist}>
          {wishlistSaved ? "Saved to Wishlist" : "Save to Wishlist"}
        </button>

        {/* Stock Status */}
        <p
          className={
            product.stock > 0 ? "stock in-stock" : "stock out-stock"
          }
        >
          {product.stock > 0 ? "In Stock" : "Out of Stock"}
        </p>

      </div>
    </div>

    <section className="reviews-section">
      <div className="reviews-list">
        <h3>Customer Reviews</h3>
        {product.reviews?.length ? (
          product.reviews.map((item) => (
            <div className="review-card" key={item._id}>
              <strong>{item.name}</strong>
              <span>★ {item.rating}</span>
              <p>{item.comment}</p>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>

      <form className="review-form" onSubmit={submitReview}>
        <h3>Write a Review</h3>
        <select
          value={review.rating}
          onChange={(e) => setReview({ ...review, rating: e.target.value })}
        >
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Very good</option>
          <option value="3">3 - Good</option>
          <option value="2">2 - Fair</option>
          <option value="1">1 - Poor</option>
        </select>
        <textarea
          value={review.comment}
          onChange={(e) => setReview({ ...review, comment: e.target.value })}
          placeholder="Share your experience after delivery"
          required
        />
        <button type="submit">Submit Review</button>
      </form>
    </section>
  </div>
);
}

export default ProductDetails;
